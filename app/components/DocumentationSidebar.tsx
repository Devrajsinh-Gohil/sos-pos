import { ReactNode, useState } from "react";
import { X, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface PlatformDocProps {
  title: string;
  children: ReactNode;
}

function PlatformDocSection({ title, children }: PlatformDocProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md p-2 text-left font-medium hover:bg-muted"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="pl-4 pr-2 pt-2 text-sm text-muted-foreground overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

interface DocSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function DocumentationSidebar({ open, onClose }: DocSidebarProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-background border-l shadow-lg flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="text-lg font-bold">Integration Documentation</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 break-words">
          <p className="text-sm text-muted-foreground break-words">
            Follow these detailed instructions to set up your social media platform integrations. Each section provides step-by-step guidance suitable for beginners.
          </p>
          
          <Separator />
          
          <PlatformDocSection title="Facebook Integration">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 dark:bg-blue-950 dark:border-blue-900 mb-4">
              <h3 className="text-sm font-semibold mb-1">Prerequisites</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>A Facebook account with admin access to a Facebook Page</li>
                <li>Access to a web hosting environment for your redirect URL</li>
                <li>Basic understanding of web development concepts</li>
              </ul>
            </div>
            
            <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Step-by-Step Setup</h3>
            <ol className="list-decimal pl-4 space-y-3 mb-3">
              <li>
                <strong>Create a Developer Account</strong>
                <p className="text-xs mt-1">Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center">Facebook Developers <ExternalLink className="ml-1 h-3 w-3" /></a> and sign in with your Facebook account.</p>
              </li>
              
              <li>
                <strong>Create a New App</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Click "Create App" at the top right</li>
                  <li>Select "Business" as the app type</li>
                  <li>Complete "Business Verification" if prompted</li>
                  <li>Fill in your app name and contact email</li>
                  <li>Click "Create App" to proceed</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure App Settings</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Navigate to "Settings &gt; Basic" in the left-side menu</li>
                  <li>Find your App ID and App Secret (keep these secure)</li>
                  <li>Add a Privacy Policy URL (required for publishing)</li>
                  <li>Add App Domains to match your website domains</li>
                  <li>Click "Save Changes"</li>
                </ul>
              </li>
              
              <li>
                <strong>Add Facebook Login Product</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>From the left sidebar, click "Add Product"</li>
                  <li>Find "Facebook Login" and click "Set Up"</li>
                  <li>Select "Web" as the platform</li>
                  <li>Enter your website URL and save</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure OAuth Settings</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to "Facebook Login &gt; Settings"</li>
                  <li>Under "Valid OAuth Redirect URIs", add:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback/facebook
                    </code>
                  </li>
                  <li>Save Changes</li>
                </ul>
              </li>
              
              <li>
                <strong>Request App Permissions</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to "App Review &gt; Permissions and Features"</li>
                  <li>Request the following permissions:
                    <ul className="list-disc pl-4 mt-1">
                      <li>pages_manage_posts - To post content to Pages</li>
                      <li>pages_read_engagement - To read Page content</li>
                      <li>publish_to_groups - For group publishing functionality</li>
                    </ul>
                  </li>
                  <li>For each permission, explain how your app will use it</li>
                  <li>Submit for review (this may take several days)</li>
                </ul>
              </li>
              
              <li>
                <strong>Make App Public</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>After approval, go to "Settings &gt; Basic"</li>
                  <li>At the top of the page, change the app status from "In Development" to "Live"</li>
                  <li>Confirm the changes when prompted</li>
                </ul>
              </li>
              
              <li>
                <strong>Add to Environment Variables</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your application's .env.local file, add:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto break-all">
                      FACEBOOK_CLIENT_ID=your_app_id_here<br/>
                      FACEBOOK_CLIENT_SECRET=your_app_secret_here
                    </code>
                  </li>
                </ul>
              </li>
            </ol>
            
            <div className="bg-amber-50 p-2 rounded border border-amber-200 dark:bg-amber-950 dark:border-amber-900 mb-2">
              <h4 className="text-xs font-semibold mb-1">Important Notes</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>For Facebook Page integration, users must be admins of the Pages they want to manage</li>
                <li>Test extensively in Development mode before going Live</li>
                <li>Store your App Secret securely and never expose it in client-side code</li>
                <li>Facebook API has rate limits that vary by endpoint</li>
              </ul>
            </div>
          </PlatformDocSection>
          
          <PlatformDocSection title="Twitter Integration">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 dark:bg-blue-950 dark:border-blue-900 mb-4">
              <h3 className="text-sm font-semibold mb-1">Prerequisites</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>A Twitter/X account</li>
                <li>A verified phone number on your Twitter account</li>
                <li>A website or app with privacy policy</li>
              </ul>
            </div>
            
            <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Step-by-Step Setup</h3>
            <ol className="list-decimal pl-4 space-y-3 mb-3">
              <li>
                <strong>Apply for a Developer Account</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Visit <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center">Twitter Developer Portal <ExternalLink className="ml-1 h-3 w-3" /></a></li>
                  <li>Sign in with your Twitter account</li>
                  <li>Apply for a developer account by answering questions about your use case</li>
                  <li>Wait for approval (can take 1-2 business days)</li>
                </ul>
              </li>
              
              <li>
                <strong>Create a New Project</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Once approved, go to the Developer Portal Dashboard</li>
                  <li>Click "Add Project"</li>
                  <li>Enter a name and description for your project</li>
                  <li>Select the use case that matches your application</li>
                  <li>Complete the project setup</li>
                </ul>
              </li>
              
              <li>
                <strong>Create an App within the Project</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your project, click "Add App"</li>
                  <li>Enter a name for your app</li>
                  <li>Complete the required information</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure Authentication Settings</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your app settings, go to "User authentication settings"</li>
                  <li>Click "Set up" or "Edit" if already set up</li>
                  <li>Enable OAuth 2.0</li>
                  <li>Set App type to "Web App"</li>
                  <li>Enter your website URL</li>
                  <li>Add a callback URL:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback/twitter
                    </code>
                  </li>
                </ul>
              </li>
              
              <li>
                <strong>Configure OAuth Scopes</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In the same settings page, scroll to "Scopes"</li>
                  <li>Select the following scopes:
                    <ul className="list-disc pl-4 mt-1">
                      <li>tweet.read - To read tweets</li>
                      <li>tweet.write - To post tweets</li>
                      <li>users.read - To read user profile information</li>
                      <li>offline.access - For refresh tokens</li>
                    </ul>
                  </li>
                  <li>Save your settings</li>
                </ul>
              </li>
              
              <li>
                <strong>Get Your API Keys</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to your app's "Keys and tokens" tab</li>
                  <li>Find the "OAuth 2.0 Client ID and Client Secret" section</li>
                  <li>Copy your Client ID</li>
                  <li>Generate and copy your Client Secret (it will only be shown once)</li>
                </ul>
              </li>
              
              <li>
                <strong>Add to Environment Variables</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your application's .env.local file, add:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto break-all">
                      TWITTER_CLIENT_ID=your_client_id_here<br/>
                      TWITTER_CLIENT_SECRET=your_client_secret_here
                    </code>
                  </li>
                </ul>
              </li>
            </ol>
            
            <div className="bg-amber-50 p-2 rounded border border-amber-200 dark:bg-amber-950 dark:border-amber-900 mb-2">
              <h4 className="text-xs font-semibold mb-1">Important Notes</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Twitter's v2 API has rate limits of 1500 tweets/15 minutes for reading, and 200 tweets/15 minutes for posting</li>
                <li>For higher API access, you may need to apply for Elevated access</li>
                <li>Token expiration: Access tokens expire after 2 hours unless you use offline.access scope</li>
                <li>Keep your Client Secret secure and never expose it in client-side code</li>
              </ul>
            </div>
          </PlatformDocSection>
          
          <PlatformDocSection title="LinkedIn Integration">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 dark:bg-blue-950 dark:border-blue-900 mb-4">
              <h3 className="text-sm font-semibold mb-1">Prerequisites</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>A LinkedIn account</li>
                <li>A functional website with privacy policy URL</li>
                <li>Business email address for LinkedIn to contact you</li>
              </ul>
            </div>
            
            <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Step-by-Step Setup</h3>
            <ol className="list-decimal pl-4 space-y-3 mb-3">
              <li>
                <strong>Create a LinkedIn Developer Account</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center">LinkedIn Developers <ExternalLink className="ml-1 h-3 w-3" /></a></li>
                  <li>Sign in with your LinkedIn account</li>
                </ul>
              </li>
              
              <li>
                <strong>Create a New App</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Click "Create App" button</li>
                  <li>Fill in the required information:
                    <ul className="list-disc pl-4 mt-1">
                      <li>App name: Choose a name for your application</li>
                      <li>LinkedIn Page: Link to your company's LinkedIn page (optional for personal apps)</li>
                      <li>App logo: Upload a logo (min 100x100px)</li>
                      <li>Legal agreement: Accept the terms</li>
                    </ul>
                  </li>
                  <li>Click "Create App" to proceed</li>
                </ul>
              </li>
              
              <li>
                <strong>Verify App Ownership</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>You may need to verify your app by adding a verification code to your website</li>
                  <li>Follow the instructions provided by LinkedIn for verification</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure Auth Settings</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>From your app dashboard, go to the "Auth" tab</li>
                  <li>Note your Client ID and Client Secret</li>
                  <li>Under "OAuth 2.0 settings" &gt; "Redirect URLs", add:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback/linkedin
                    </code>
                  </li>
                </ul>
              </li>
              
              <li>
                <strong>Request API Permissions</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to the "Products" tab</li>
                  <li>Request access to "Sign In with LinkedIn" and "Share on LinkedIn"</li>
                  <li>Under the "Auth" tab &gt; "OAuth 2.0 scopes", select:
                    <ul className="list-disc pl-4 mt-1">
                      <li>r_liteprofile - To read basic profile data</li>
                      <li>w_member_social - To post on behalf of members</li>
                    </ul>
                  </li>
                </ul>
              </li>
              
              <li>
                <strong>App Review (for Production)</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to the "Review" tab</li>
                  <li>Submit your application for review with documentation on how you'll use the API</li>
                  <li>Wait for approval (typically 3-5 business days)</li>
                  <li>Note: You can still develop and test while waiting for approval</li>
                </ul>
              </li>
              
              <li>
                <strong>Add to Environment Variables</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your application's .env.local file, add:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto break-all">
                      LINKEDIN_CLIENT_ID=your_client_id_here<br/>
                      LINKEDIN_CLIENT_SECRET=your_client_secret_here
                    </code>
                  </li>
                </ul>
              </li>
            </ol>
            
            <div className="bg-amber-50 p-2 rounded border border-amber-200 dark:bg-amber-950 dark:border-amber-900 mb-2">
              <h4 className="text-xs font-semibold mb-1">Important Notes</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>LinkedIn has strict API usage policies and may reject apps that don't comply with their guidelines</li>
                <li>Rate limits are set at 100 calls per day per user</li>
                <li>Access tokens typically expire after 60 days</li>
                <li>Implement refresh token functionality for long-term access</li>
              </ul>
            </div>
          </PlatformDocSection>
          
          <PlatformDocSection title="Instagram Integration">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 dark:bg-blue-950 dark:border-blue-900 mb-4">
              <h3 className="text-sm font-semibold mb-1">Prerequisites</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>A Professional Instagram account (Business or Creator)</li>
                <li>A Facebook Page linked to your Instagram account</li>
                <li>Admin access to the Facebook Page</li>
                <li>A website with privacy policy</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-2 rounded border border-red-200 dark:bg-red-950 dark:border-red-900 mb-4">
              <h4 className="text-xs font-semibold mb-1">⚠️ Important Update</h4>
              <p className="text-xs">Instagram's legacy direct API is being deprecated. The official way to access Instagram data is now through the Facebook Graph API. You <strong>must</strong> have a Professional Instagram account linked to a Facebook Page to use the API.</p>
            </div>
            
            <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Method 1: Instagram API via Facebook (Recommended)</h3>
            <ol className="list-decimal pl-4 space-y-3 mb-4">
              <li>
                <strong>Create a Meta for Developers Account</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center">Meta for Developers <ExternalLink className="ml-1 h-3 w-3" /></a></li>
                  <li>Sign in with your Facebook account (must be admin of the Facebook Page)</li>
                </ul>
              </li>
              
              <li>
                <strong>Create a Meta App</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Click "Create App"</li>
                  <li>Select "Business" as the app type</li>
                  <li>Enter the required information:
                    <ul className="list-disc pl-4 mt-1">
                      <li>App Name: Choose a descriptive name</li>
                      <li>Contact Email: Your business email</li>
                      <li>Business Account: Connect to your business account</li>
                    </ul>
                  </li>
                  <li>Click "Create App"</li>
                </ul>
              </li>
              
              <li>
                <strong>Complete Business Verification</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>If prompted, complete the business verification process</li>
                  <li>This may require documents proving your business identity</li>
                </ul>
              </li>
              
              <li>
                <strong>Add the Instagram Product</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>From your app dashboard, find the "Add Products" section</li>
                  <li>Find "Instagram" and click "Set Up"</li>
                  <li>You'll see two options:
                    <ul className="list-disc pl-4 mt-1">
                      <li><strong>API Setup with Instagram login</strong>: If your app users will log in with Instagram credentials</li>
                      <li><strong>API Setup with Facebook login</strong>: If your app users will log in with Facebook credentials (recommended)</li>
                    </ul>
                  </li>
                  <li>For most cases, choose "API Setup with Facebook login"</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure Facebook Login</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to "Facebook Login" &gt; "Settings"</li>
                  <li>Add your OAuth redirect URL:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback/facebook
                    </code>
                  </li>
                  <li>Save changes</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure Instagram Graph API</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In App Dashboard, go to "Instagram" &gt; "Basic Display"</li>
                  <li>Click "Create New App"</li>
                  <li>Add your app's information</li>
                  <li>Under "Instagram App Review", submit the following permissions:
                    <ul className="list-disc pl-4 mt-1">
                      <li>instagram_basic - For basic profile and media data</li>
                      <li>instagram_content_publish - For posting to Instagram</li>
                      <li>instagram_manage_comments - To manage comments</li>
                      <li>instagram_manage_insights - For analytics data</li>
                    </ul>
                  </li>
                </ul>
              </li>
              
              <li>
                <strong>Link Instagram Business Account</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Ensure your Instagram account is converted to a Professional account (Business or Creator)</li>
                  <li>Go to Page Settings &gt; Instagram</li>
                  <li>Click "Connect Account" and follow the steps</li>
                </ul>
              </li>
              
              <li>
                <strong>Generate Access Tokens</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your Meta App Dashboard, go to "Instagram" &gt; "Roles"</li>
                  <li>Add your Instagram account as a tester</li>
                  <li>Use the "Token Generation" tool to create tokens for your Instagram Business account</li>
                </ul>
              </li>
              
              <li>
                <strong>Add to Environment Variables</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>In your application's .env.local file, add:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto break-all">
                      INSTAGRAM_CLIENT_ID=your_facebook_app_id<br/>
                      INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret
                    </code>
                  </li>
                  <li>Note: For Instagram API via Facebook, you use the same ID and secret as your Facebook app</li>
                </ul>
              </li>
            </ol>
            
            <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Method 2: Direct Instagram Access (Limited)</h3>
            <div className="bg-amber-50 p-2 rounded border border-amber-200 dark:bg-amber-950 dark:border-amber-900 mb-3">
              <p className="text-xs">Note: Instagram is transitioning away from direct API access. This method has significant limitations and may not be supported in the future. The Facebook Graph API method is strongly recommended.</p>
            </div>
            
            <ol className="list-decimal pl-4 space-y-2 mb-2">
              <li>
                <strong>Create a New Project</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Go to <a href="https://www.instagram.com/developer/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center">Instagram Developers <ExternalLink className="ml-1 h-3 w-3" /></a></li>
                  <li>Sign in with your Instagram account</li>
                  <li>Register a New Client</li>
                  <li>Provide application details including name, description, website URL, and privacy policy URL</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure OAuth Settings</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>Add OAuth redirect URI:
                    <code className="block bg-muted p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback/instagram
                    </code>
                  </li>
                  <li>Save your settings</li>
                </ul>
              </li>
              
              <li>
                <strong>Obtain API Credentials</strong>
                <ul className="list-disc pl-4 mt-1 text-xs space-y-1">
                  <li>After approval, you'll receive:
                    <ul className="list-disc pl-4 mt-1">
                      <li>Client ID</li>
                      <li>Client Secret</li>
                    </ul>
                  </li>
                  <li>Copy these to your .env.local file</li>
                </ul>
              </li>
            </ol>
            
            <div className="bg-amber-50 p-2 rounded border border-amber-200 dark:bg-amber-950 dark:border-amber-900 mb-3">
              <h4 className="text-xs font-semibold mb-1">Important Requirements</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>You <strong>must</strong> have a Professional Instagram account (Business or Creator)</li>
                <li>The Instagram account <strong>must</strong> be linked to a Facebook Page</li>
                <li>For content publishing API, your Instagram account must have more than 25 followers</li>
                <li>API access is subject to Meta's approval process</li>
                <li>Rate limits apply: 200 API calls per user per hour</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-2 rounded border border-blue-200 dark:bg-blue-950 dark:border-blue-900">
              <h4 className="text-xs font-semibold mb-1">Instagram API Capabilities</h4>
              <p className="text-xs mb-2">Through the Instagram Graph API, you can:</p>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Publish photos and videos to Instagram Business accounts</li>
                <li>Manage comments on media posts</li>
                <li>Access metrics and insights for business accounts</li>
                <li>Discover hashtagged media and mentions</li>
                <li>Retrieve basic metadata about other business accounts</li>
              </ul>
            </div>
          </PlatformDocSection>
          
          <Separator />
          
          <div className="pt-2">
            <h3 className="font-medium mb-2">Environment Setup</h3>
            <p className="text-sm mb-2">Add these variables to your .env.local file:</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
{`# Facebook
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Twitter
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Instagram (uses Facebook credentials if using Graph API)
INSTAGRAM_CLIENT_ID=your_facebook_app_id
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret

# Base URL for your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Change in production`}
            </pre>
          </div>
          
          <Separator />
          
          <div className="pt-2">
            <h3 className="font-medium mb-2">Troubleshooting Common Issues</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Authentication Failures</h4>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li>Verify your Client ID and Secret are correct and properly configured</li>
                  <li>Ensure redirect URIs match exactly (including http vs https)</li>
                  <li>Check if your app is in Live mode vs Development mode</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Permission Issues</h4>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li>Ensure you've requested and been approved for all needed permissions</li>
                  <li>Check if users have granted all the required permissions during login</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Rate Limiting</h4>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li>Implement backoff strategies for rate limit errors</li>
                  <li>Cache responses when possible to reduce API calls</li>
                  <li>Monitor your API usage through each platform's developer dashboard</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="font-medium mb-2">Security Best Practices</h3>
            <ul className="list-disc pl-4 text-sm space-y-2">
              <li>Never store API secrets in client-side code or public repositories</li>
              <li>Implement HTTPS for all API communications</li>
              <li>Use state parameters in OAuth flows to prevent CSRF attacks</li>
              <li>Implement proper token refresh and expiration handling</li>
              <li>Request only the permissions your app actually needs</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 