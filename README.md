# Quanta — AI Quiz Generator

Premium Liquid Glass AI quiz generator for GitHub Pages.

### Stack
- Static frontend: GitHub Pages
- PDF extraction: PDF.js in the browser
- AI: Groq Chat Completions
- Secure proxy: Cloudflare Worker
- Current Worker model: `openai/gpt-oss-20b`

### Setup

1. Push the root files to your GitHub repository.
2. Enable **Settings → Pages → Source → GitHub Actions**.
3. Deploy the Worker:

```bash
cd worker
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler deploy
```

4. Copy the Worker URL.
5. In `app.js`, replace `YOUR_WORKER_URL` with that URL.
6. Push again.

Never put the Groq key in GitHub Pages JavaScript.

The UI intentionally uses the supplied references as visual inspiration: translucent glass, soft blur, subtle borders, depth, floating controls, restrained neon accents, and cinematic ambient lighting.
