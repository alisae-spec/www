<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d7363caf-50b6-489a-af6c-d99fadf4ad3a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Environment variables

- Local development: set `GEMINI_API_KEY` in `.env.local` or `.env`.
- Deployment: add `GEMINI_API_KEY` as a server-side environment variable in your hosting provider's project settings, then redeploy. Do not commit or upload `.env` or `.env.local`; these files are excluded by `.gitignore`.
- `.env.example` is a safe template and does not contain a real API key.

