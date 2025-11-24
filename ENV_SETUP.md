# Marmex India - Environment Configuration

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://marmexindiadb_db_user:HqyPcHdijhDWNZcE@marmex.2yif07q.mongodb.net/marmex?retryWrites=true&w=majority&appName=marmex

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=marmex-2025-nextauth-secret-key-change-in-production

# Cloudinary (Image Uploads)
CLOUDINARY_URL=cloudinary://675497825176269:9n5_xYyWtofkVpFEI_pyWmp7gfM@das4iqlfb
CLOUDINARY_CLOUD_NAME=das4iqlfb
CLOUDINARY_API_KEY=675497825176269
CLOUDINARY_API_SECRET=9n5_xYyWtofkVpFEI_pyWmp7gfM

# Email Configuration (Gmail SMTP)
# IMPORTANT: You need to set up an App Password for Gmail
# Instructions: https://support.google.com/accounts/answer/185833
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password

# Google OAuth (Optional - for social login)
# Get credentials from: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay Payment Gateway
# Get test keys from: https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Gmail SMTP Setup (Required for emails)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
   - Use this as `SMTP_PASSWORD` value

### 2. Google OAuth Setup (Optional, for "Sign in with Google")

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### 3. Razorpay Setup (For payments)

1. Sign up at https://razorpay.com
2. Get test mode API keys from dashboard
3. Add keys to `.env.local`
4. Switch to live keys only when ready for production

## Testing the Setup

After setting up environment variables:

```bash
# Restart the development server
npm run dev
```

Visit:
- http://localhost:3000/auth/register - Create account
- http://localhost:3000/auth/login - Sign in
- Check MongoDB Atlas to verify user creation

## Security Notes

- **Never commit `.env.local` to version control** (it's already in .gitignore)
- Change `NEXTAUTH_SECRET` to a random string in production
- Use strong passwords for production
- Enable MongoDB IP whitelist in Atlas
- Use production Razorpay keys only when ready to go live
