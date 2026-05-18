# Railway Smart Finder — Next.js Realtime Prototype

Quick prototype that reuses your existing UI and adds a simple WebSocket server for realtime availability updates.

Setup

```bash
cd "c:\Users\vgarg\OneDrive\Desktop\railway-smart-next"
npm install
```

Run the app with one command:

```bash
npm run dev
```

This starts both the realtime WebSocket server and Next.js dev server together.

If you want to run the servers separately:

```bash
npm run realtime   # starts websocket server on port 4000
npm run next-dev   # starts Next.js dev server on port 3000
```

Before using the AI suggestion feature, set your Anthropic API key in `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
```

If the key is not configured, the app will still show a local fallback travel suggestion so the UI remains usable.

Then start the app and open http://localhost:3000
