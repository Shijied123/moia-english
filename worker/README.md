# Practice English: AI teacher server

This folder is the small server behind the conversation page. It runs on Cloudflare Workers and uses Workers AI to play a friendly English teacher. The site sends the topic and the chat so far to `POST /chat`, and the server answers with `{ "reply": "..." }`.

How to deploy (one time, from this `worker` folder):

1. Make a free Cloudflare account at https://dash.cloudflare.com/sign-up.
2. Run `npx wrangler login` and allow access in the browser.
3. Run `npx wrangler deploy`. At the end it prints a URL like `https://moia-english-teacher.<your-name>.workers.dev`.
4. Open `conversation.js` in the site, set `CHAT_URL` to that URL (no `/chat` and no trailing slash; the page adds `/chat`), and push the site.

Live now: https://moia-english-teacher.togud61.workers.dev (model: Gemma 4 with thinking off, about 2 of the 10,000 free daily Neurons per reply).

Cost: on the free Workers plan there is no card on file, so it cannot charge money. When the free daily AI allowance runs out, the teacher replies "The teacher is resting" until the next day.

Test it locally with `node test.mjs` (Node 18 or newer). The test uses a fake AI, so it needs no account.

Only the site's own addresses may call the server (see `ALLOWED_ORIGINS` in `src/index.js`). Add a new address there if the site moves.

Switching to Claude later: get an Anthropic API key, save it with `npx wrangler secret put ANTHROPIC_API_KEY`, and rewrite only the `callModel()` function in `src/index.js` to call the Claude Messages API (the system prompt goes in the `system` field). Everything else stays the same. Note that Claude is paid, so set a spending limit first.
