# Practice English: AI teacher server

This folder is the small server behind the conversation page. It runs on Cloudflare Workers.

Live: https://moia-english-teacher.togud61.workers.dev

## What it does
- `POST /chat` gives the teacher's next line. It uses **Claude Haiku 5.5** when `ANTHROPIC_API_KEY` is set. If there's no key, or Claude fails, it uses the free Workers AI model (Gemma 4, thinking off).
- `POST /speak` turns a line into speech with **ElevenLabs**: the "Olesia" voice, `eleven_flash_v2_5`, raw PCM 16 kHz mono.
- `POST /simli-token` gives the browser a 5-minute pass for the **Simli** realistic face ("Anna"). Sessions last at most 10 minutes and end after 2 idle minutes.
- `GET /config` tells the page which of these are switched on.
- Only the site's own addresses may call it (`ALLOWED_ORIGINS` in `src/index.js`), and each visitor is limited per minute (`[[ratelimits]]` in `wrangler.toml`).

## Secrets (never put them in code)
Set each one from this folder. The command asks you to paste the key:

    npx wrangler secret put ANTHROPIC_API_KEY
    npx wrangler secret put ELEVENLABS_API_KEY
    npx wrangler secret put SIMLI_API_KEY

The Claude key expires on Dec 24, 2026. When it does, the teacher falls back to the free model until you paste a new one.
The ElevenLabs key can only do Text to Speech and has a 25,000-credit cap.

## Settings (not secret) in wrangler.toml
- `ELEVENLABS_VOICE_ID`: the voice. Copy a voice's ID from ElevenLabs → My Voices.
- `SIMLI_FACE_ID`: the face. Preset IDs are at https://docs.simli.com/api-reference/preset-faces

## Deploy and test
    npx wrangler deploy     # put the server online
    node test.mjs           # 21 tests; every paid service is faked, so nothing is charged
