export const socialAuthConfig = {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    scope: 'pages_manage_posts,pages_read_engagement,publish_to_groups',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/facebook`,
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    scope: 'tweet.read tweet.write users.read offline.access',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/twitter`,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    scope: 'r_liteprofile w_member_social',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/linkedin`,
  },
  instagram: {
    // Instagram uses Facebook Graph API
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    scope: 'instagram_basic,instagram_content_publish',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/instagram`,
  }
}; 