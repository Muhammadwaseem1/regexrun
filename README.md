# regexrun

A quiet little regex playground for late saturday-night debugging.

regexrun is the tool I keep wanting when I'm three regexes deep and not sure which one is eating my Sunday. Paste a pattern, paste some text, see what hits — capture groups, replace, split, the whole thing. Everything lives in your browser; nothing leaves your tab.

## What it does

— live highlighted matches as you type, with capture groups in a side panel
— flags as toggles (g, i, m, s, u, y) so you stop guessing the order
— replace mode with `$1`, `$2`, named groups, and a real-time preview
— split mode for the rare moment when that's what you actually wanted
— a small library of presets for the patterns I've re-typed too many times: emails, URLs, phone numbers, hex colors, UUIDs, ISO dates, slugs, markdown links, HTML tags
— copy your regex as a literal `/.../`, a `new RegExp(…)` call, or a Python `re.compile` raw string
— a share button that puts everything into the URL hash so you can paste it into a teammate's DM
— a collapsible cheat sheet for when your brain stops cooperating
— dark theme, monospace output, no tracking, no telemetry, no nonsense

## Getting started

```bash
git clone https://github.com/Muhammadwaseem1/regexrun
cd regexrun
npm install
npm run dev
```

Open http://localhost:3000 and type something into the pattern box.

## Built with

— Next.js 15 (App Router)
— React 19
— TypeScript
— Tailwind CSS
— the browser's own RegExp engine — that's the whole point

## Why I built this

I have like six regex testers bookmarked and none of them feel right. One has ads. One redraws the whole UI on every keystroke. One requires me to click "Run" like it's 2009. I wanted something I could leave open in a pinned tab — quiet, fast, dark, keyboard-friendly, with sensible defaults and the few presets I actually need.

This is that tab.

If it helps you, that's a win. If it doesn't, you can fork it in about ninety seconds — it's all client-side and boring on purpose.
