# Social Media Content Generator

A full-stack Next.js application that leverages AI to generate optimized content and images for multiple social media platforms.

![Social Media Content Generator](public/banner.png)

## Features

- **Multi-Platform Content Generation**: Creates optimized content for Facebook, Twitter, LinkedIn, and Instagram
- **AI-Powered Image Creation**: Generates relevant images using DALL-E 3
- **Smart Hashtag Suggestions**: Provides trending hashtags for each platform
- **Platform-Specific Optimization**: Content tailored to each platform's best practices
- **One-Click Regeneration**: Easily regenerate content or images individually
- **Copy & Share**: Quickly copy content or share directly to platforms
- **Modern Responsive UI**: Beautiful interface built with Tailwind CSS
- **Secure Social Media Integration**: Connect and publish to social platforms with enterprise-grade security

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: OpenAI API (GPT-3.5 for text, DALL-E 3 for images)
- **State Management**: React Hooks
- **Icons**: Lucide React, React Icons
- **Authentication**: OAuth 2.0 with secure token management
- **Security**: AES-256-CBC encryption for sensitive data

## Installation

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Social media app credentials (for publishing features)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/social-front-app.git
   cd social-front-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Environment Setup

   Create a `.env.local` file in the root directory with the following:
   ```
   # AI Integration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Application URL for OAuth callbacks
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   
   # Security (generate a strong random key)
   ENCRYPTION_KEY=your_32_character_random_string_here
   
   # Social Media API Keys (required for publishing)
   FACEBOOK_CLIENT_ID=your_facebook_client_id
   FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
   
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   
   INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a topic in the input field
2. Click "Generate All Content" to create content for all platforms and an image
3. Use the "Regenerate" button on any card to recreate content for a specific platform
4. Edit the image prompt to customize the generated image
5. Connect your social media accounts using the secure OAuth integration
6. Publish content directly to your connected platforms
7. Copy content with one click or download generated images for manual posting

## Security Features

Our application implements enterprise-grade security for social media integration:

1. **Secure Authentication**
   - OAuth 2.0 integration with all supported platforms
   - Server-side token exchange with no client exposure
   - HttpOnly cookies with secure flags for token storage

2. **Data Protection**
   - AES-256-CBC encryption for all stored tokens and sensitive data
   - Automatic token refresh mechanism
   - Server-side validation of all authentication states

3. **API Security**
   - Token validation before all API requests
   - Proper error handling with meaningful HTTP status codes
   - Rate limiting protection

4. **Best Practices**
   - CSRF protection
   - No sensitive data in client-side code
   - Secure callback handling

## Project Structure

```
social-front-app/
├── app/                    # Next.js app directory
│   ├── api/                # API routes for content generation and auth
│   │   ├── auth/           # Authentication endpoints
│   │   ├── generate/       # Content generation endpoints
│   │   └── publish/        # Social media publishing endpoints
│   ├── components/         # Application-specific components
│   └── lib/                # Utility functions and helpers
│       ├── encryption.ts   # Token encryption utilities
│       ├── social-auth.ts  # OAuth authentication logic
│       └── token-service.ts # Secure token management
├── components/             # Shared UI components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── ...config files         # Configuration files
```

## API Endpoints

- `/api/generate` - Generate platform-specific content
- `/api/generateImage` - Create images using DALL-E
- `/api/generateImagePrompt` - Create detailed image prompts
- `/api/auth/login/[platform]` - Initiate OAuth login flow
- `/api/auth/callback/[platform]` - Handle OAuth callback
- `/api/auth/status/[platform]` - Check authentication status
- `/api/auth/logout/[platform]` - Securely logout
- `/api/publish/[platform]` - Publish content to social platforms
- `/api/downloadImage` - Download generated images

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API for content and image generation
- Vercel for Next.js and hosting platform
- Tailwind CSS and Radix UI for the component library
