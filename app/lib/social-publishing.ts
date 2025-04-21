import { SocialPlatform } from './social-auth';
import { getAccessToken } from './token-service';
import axios from 'axios';

interface PublishOptions {
  text: string;
  imageUrl?: string;
}

interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Download image and convert to appropriate format
 */
async function getImageData(imageUrl: string): Promise<{ blob: Blob, base64: string, buffer: Buffer }> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Convert to base64 for APIs that need it
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        blob,
        buffer,
        base64: reader.result as string
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Publish to Facebook
 */
async function publishToFacebook(options: PublishOptions): Promise<PublishResult> {
  const accessToken = await getAccessToken('facebook');
  if (!accessToken) {
    return { success: false, error: 'Not authenticated with Facebook' };
  }

  try {
    // Use the graph API for publishing
    if (options.imageUrl) {
      // First upload the image
      const { buffer } = await getImageData(options.imageUrl);
      
      const formData = new FormData();
      formData.append('source', new Blob([buffer]), 'image.jpg');
      formData.append('access_token', accessToken);
      
      const uploadResponse = await axios.post(
        'https://graph.facebook.com/v19.0/me/photos',
        formData
      );
      
      if (uploadResponse.data.id) {
        // If the image was uploaded successfully, add the caption
        const captionResponse = await axios.post(
          `https://graph.facebook.com/v19.0/${uploadResponse.data.id}`,
          {
            caption: options.text,
            access_token: accessToken
          }
        );
        
        return { 
          success: true, 
          postId: uploadResponse.data.id 
        };
      } else {
        return { 
          success: false, 
          error: 'Failed to upload image' 
        };
      }
    } else {
      // Text-only post
      const response = await axios.post(
        'https://graph.facebook.com/v19.0/me/feed',
        {
          message: options.text,
          access_token: accessToken
        }
      );
      
      if (response.data.id) {
        return { success: true, postId: response.data.id };
      } else {
        return { success: false, error: 'Failed to publish post' };
      }
    }
  } catch (error: any) {
    console.error('Error publishing to Facebook:', error);
    return { 
      success: false, 
      error: error.response?.data?.error?.message || String(error) 
    };
  }
}

/**
 * Publish to Twitter/X using v2 API
 */
async function publishToTwitter(options: PublishOptions): Promise<PublishResult> {
  const accessToken = await getAccessToken('twitter');
  if (!accessToken) {
    return { success: false, error: 'Not authenticated with Twitter' };
  }

  try {
    let mediaId: string | undefined;
    
    // If there's an image, upload it first
    if (options.imageUrl) {
      const { buffer } = await getImageData(options.imageUrl);
      
      // First, init the upload
      const initResponse = await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        {
          command: 'INIT',
          total_bytes: buffer.length,
          media_type: 'image/jpeg',
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const mediaIdStr = initResponse.data.media_id_string;
      
      // Then append the data
      const chunkSize = 1000000; // ~1MB chunks
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        
        await axios.post(
          'https://upload.twitter.com/1.1/media/upload.json',
          {
            command: 'APPEND',
            media_id: mediaIdStr,
            media: chunk.toString('base64'),
            segment_index: Math.floor(i / chunkSize)
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Finalize the upload
      await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        {
          command: 'FINALIZE',
          media_id: mediaIdStr,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      mediaId = mediaIdStr;
    }
    
    // Create the tweet payload
    const tweetData: any = { text: options.text };
    
    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }
    
    // Now create the tweet
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      tweetData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.data?.id) {
      return { success: true, postId: response.data.data.id };
    } else {
      return { success: false, error: 'Failed to publish tweet' };
    }
  } catch (error: any) {
    console.error('Error publishing to Twitter:', error);
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || String(error) 
    };
  }
}

/**
 * Publish to LinkedIn
 */
async function publishToLinkedIn(options: PublishOptions): Promise<PublishResult> {
  const accessToken = await getAccessToken('linkedin');
  if (!accessToken) {
    return { success: false, error: 'Not authenticated with LinkedIn' };
  }

  try {
    // First, get the user's profile to get URN
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const userUrn = `urn:li:person:${profileResponse.data.id}`;
    
    let assetUrn: string | undefined;
    
    // If there's an image, upload it first
    if (options.imageUrl) {
      const { buffer } = await getImageData(options.imageUrl);
      
      // Register the image upload
      const registerResponse = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: userUrn,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent"
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extract upload URL and asset URN
      const uploadUrl = registerResponse.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
      assetUrn = registerResponse.data.value.asset;
      
      // Upload the image
      await axios.put(
        uploadUrl,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'image/jpeg'
          }
        }
      );
    }
    
    // Create the post
    const postBody: any = {
      author: userUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: options.text
          },
          shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    // Add the image if uploaded
    if (assetUrn) {
      postBody.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        description: {
          text: 'Image'
        },
        media: assetUrn
      }];
    }
    
    // Publish the post
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.id) {
      return { success: true, postId: response.data.id };
    } else {
      return { success: false, error: 'Failed to publish post' };
    }
  } catch (error: any) {
    console.error('Error publishing to LinkedIn:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || String(error) 
    };
  }
}

/**
 * Publish to Instagram (using Facebook Graph API)
 */
async function publishToInstagram(options: PublishOptions): Promise<PublishResult> {
  const accessToken = await getAccessToken('instagram');
  if (!accessToken) {
    return { success: false, error: 'Not authenticated with Instagram' };
  }

  // Instagram requires an image
  if (!options.imageUrl) {
    return { success: false, error: 'An image is required for Instagram posts' };
  }

  try {
    // First, get the Instagram business account ID
    const accountResponse = await axios.get(
      'https://graph.facebook.com/v19.0/me/accounts',
      {
        params: { access_token: accessToken }
      }
    );
    
    if (!accountResponse.data.data || accountResponse.data.data.length === 0) {
      return { success: false, error: 'No Facebook pages found' };
    }
    
    const pageId = accountResponse.data.data[0].id;
    
    // Get Instagram business account connected to the Facebook page
    const igAccountResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}`,
      {
        params: { 
          fields: 'instagram_business_account',
          access_token: accessToken 
        }
      }
    );
    
    if (!igAccountResponse.data.instagram_business_account) {
      return { success: false, error: 'No Instagram business account found' };
    }
    
    const igAccountId = igAccountResponse.data.instagram_business_account.id;
    
    // Download the image
    const { buffer } = await getImageData(options.imageUrl);
    
    // Create a container for the image
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        image_url: options.imageUrl,
        caption: options.text,
        access_token: accessToken
      }
    );
    
    if (!containerResponse.data.id) {
      return { success: false, error: 'Failed to create media container' };
    }
    
    // Publish the container
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
      {
        creation_id: containerResponse.data.id,
        access_token: accessToken
      }
    );
    
    if (publishResponse.data.id) {
      return { success: true, postId: publishResponse.data.id };
    } else {
      return { success: false, error: 'Failed to publish post' };
    }
  } catch (error: any) {
    console.error('Error publishing to Instagram:', error);
    return { 
      success: false, 
      error: error.response?.data?.error?.message || String(error) 
    };
  }
}

/**
 * Publish content to a social media platform
 */
export async function publishContent(platform: SocialPlatform, options: PublishOptions): Promise<PublishResult> {
  switch (platform) {
    case 'facebook':
      return publishToFacebook(options);
    case 'twitter':
      return publishToTwitter(options);
    case 'linkedin':
      return publishToLinkedIn(options);
    case 'instagram':
      return publishToInstagram(options);
    default:
      return { success: false, error: 'Unsupported platform' };
  }
} 