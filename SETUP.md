# 🚀 Setup Guide - Gym Workout Planner

## Quick Fix for Current Error

**Error:** `Publishable key not valid`  
**Cause:** Placeholder values in environment variables need to be replaced with real Clerk credentials.

## Step-by-Step Setup

### 1. 🔐 Set up Clerk Authentication

1. **Go to [Clerk Dashboard](https://dashboard.clerk.com)**
2. **Create a new application:**
   - Click "Add application"
   - Name it "Gym Workout Planner"
   - Choose your preferred authentication methods (Email, Google, etc.)

3. **Get your API keys:**
   - Go to **API Keys** in the left sidebar
   - Copy the **Publishable Key** (starts with `pk_test_`)
   - Copy the **Secret Key** (starts with `sk_test_`)

4. **Update your `.env` file:**
   ```bash
   # Replace these with your actual Clerk keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_key_here
   ```

5. **Set up JWT Template for Convex:**
   - In Clerk dashboard, go to **JWT Templates**
   - Click **New template**
   - Name it "convex"
   - Set the token lifetime to 1 hour
   - Add custom claim: `"sub": "{{user.id}}"`
   - Save the template

6. **Get Frontend API URL:**
   - Still in JWT Templates, copy the **Frontend API URL**
   - Update in `.env`:
   ```bash
   NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-domain.clerk.accounts.dev
   ```

### 2. 🗄️ Set up Convex Database

1. **Go to [Convex Dashboard](https://dashboard.convex.dev)**
2. **Create a new project:**
   - Click "Create a project"
   - Name it "gym-workout-planner"
   - Choose your team/organization

3. **Get Convex credentials:**
   - Copy the **Deployment URL**
   - Copy the **Public URL**
   - Update in `.env`:
   ```bash
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

4. **Set up Clerk Webhook in Convex:**
   - In Convex dashboard, go to **Settings > Environment Variables**
   - Add: `CLERK_WEBHOOK_SECRET`
   - Get the value from Clerk dashboard **Webhooks** section
   - Add webhook endpoint: `https://your-deployment.convex.site/clerk-users-webhook`

### 3. 🔧 Install and Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Convex development:**
   ```bash
   npx convex dev
   ```
   This will:
   - Deploy your Convex functions
   - Set up the database schema
   - Start the development server

3. **Start Next.js development:**
   ```bash
   npm run dev
   ```

### 4. ✅ Verify Setup

1. **Check Convex connection:**
   - Visit `http://localhost:3000`
   - Open browser dev tools > Console
   - Should see no Convex connection errors

2. **Test authentication:**
   - Try to sign up/sign in
   - Should redirect to dashboard after successful auth

3. **Check database sync:**
   - After signing in, check Convex dashboard
   - Should see user record in `users` table

## 🐛 Troubleshooting

### Common Issues:

**1. "Publishable key not valid"**
- ✅ Replace placeholder values with real Clerk keys
- ✅ Ensure keys start with `pk_test_` or `sk_test_`
- ✅ Restart development server after updating `.env`

**2. "Convex client not configured"**
- ✅ Run `npx convex dev` first
- ✅ Check `NEXT_PUBLIC_CONVEX_URL` is correct
- ✅ Ensure Convex deployment is active

**3. "JWT template not found"**
- ✅ Create "convex" JWT template in Clerk
- ✅ Add required claims and set lifetime
- ✅ Update `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`

**4. User not syncing to Convex**
- ✅ Set up Clerk webhook in Convex environment variables
- ✅ Add webhook endpoint in Clerk dashboard
- ✅ Check webhook logs in both dashboards

### Environment Variables Checklist:

```bash
# ✅ Must be actual values, not placeholders:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_actual_key
CLERK_SECRET_KEY=sk_test_actual_key  
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://actual-domain.clerk.accounts.dev
CONVEX_DEPLOYMENT=actual_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://actual-deployment.convex.cloud

# ✅ These can stay as-is:
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

## 🎯 Quick Start Commands

```bash
# 1. Update environment variables with real values
# 2. Install dependencies
npm install

# 3. Start Convex (in one terminal)
npx convex dev

# 4. Start Next.js (in another terminal)  
npm run dev

# 5. Visit http://localhost:3000
```

## 🔗 Helpful Links

- [Clerk Dashboard](https://dashboard.clerk.com)
- [Convex Dashboard](https://dashboard.convex.dev)  
- [Clerk + Convex Integration Guide](https://docs.convex.dev/auth/clerk)
- [Next.js + Clerk Setup](https://clerk.com/docs/quickstarts/nextjs)

## 💡 Pro Tips

1. **Use different environments:**
   - Development: `pk_test_` and `sk_test_` keys
   - Production: `pk_live_` and `sk_live_` keys

2. **Secure your keys:**
   - Never commit real keys to version control
   - Use different keys for different environments
   - Rotate keys periodically

3. **Test thoroughly:**
   - Test sign up, sign in, and sign out flows
   - Verify user data syncs to Convex
   - Check dashboard access and redirects

---

Once you complete these steps, your app should work without the "Publishable key not valid" error! 🎉