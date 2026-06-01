# Amira's Birthday Site 🎂

A playful multi-page birthday experience for **Amira** (June 1).

## Add her TikTok birthday video

1. Save/download the TikTok video to your phone or PC (or use a TikTok downloader).
2. Rename it to **`birthday-wish.mp4`**
3. Put it in the **`videos/`** folder

It appears on the final page under “A little wish for you”.

## Add Afrobeat music

1. Save your song in **`audio/`** as either:
   - **`afrobeat.m4a`** (recommended — TikTok / phone downloads are often this format)
   - **`afrobeat.mp3`** (must be a real MP3, not an M4A renamed to .mp3)
2. On page 4, tap **Afrobeat** — a **player bar** appears. Tap **▶ Play beat now** or use the browser controls.

**If music won’t play:** Your file might be M4A saved as `.mp3`. Rename it to **`afrobeat.m4a`** (same file, correct extension), or convert with [CloudConvert](https://cloudconvert.com/mp3-converter).

**Slow loading on phone data?** Your full song is ~3.7MB — that takes time to download. For Amira on mobile, use a **shorter clip (60–90 seconds)** or compress at [CloudConvert](https://cloudconvert.com/m4a-converter) (lower bitrate). Aim for **under 1 MB** — loads almost instantly. The site shows **Loading song X%** and starts preloading from page 1.

Royalty-free option: [Pixabay Afrobeat](https://pixabay.com/music/search/afrobeat/) — download MP3.

## Add her photos & café background

Drop files into the `images/` folder:

| File | Used for |
|------|----------|
| `images/cafe-background.jpg` | **Page 3** — full café scene background (animations layered on top) |
| `images/amira-1.jpg` | **Page 3** — small polaroid of her on the scene + **Page 5** gallery photo 1 |
| `images/amira-2.jpg` | **Page 5** — gallery photo 2 only |

Supported formats: `.jpg`, `.jpeg`, `.png` (update `index.html` extensions if needed).

If `cafe-background.jpg` is missing, the old drawn café appears as fallback.

## Preview locally

Open `index.html` in a browser, or:

```bash
npx serve .
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo (or use [Vercel CLI](https://vercel.com/docs/cli)).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Other** (static site — no build step).
4. Deploy. Share the URL with Amira.

Or with CLI from this folder:

```bash
npx vercel
```

## Save to gallery (final page)

**Save birthday card to gallery** downloads a portrait PNG with her name, June 1, and cute messages. On iPhone: after download, open the image and tap **Share → Save to Photos**.

## Confetti on the finale

- **First ~10 seconds:** big celebration burst (hearts, stars, cherry confetti).
- **After that:** gentle confetti keeps falling so it doesn’t stop awkwardly.
- **“Calm the confetti”** button fades it down when she’s done.

## Sound effects

Sounds are synthesized in the browser (no files needed). They play on taps and key moments.

- **Top-right 🔊** — mute / unmute (saved for the session)
- Works best after first tap (mobile browsers require a user gesture)

## Easter eggs & extras

- Bottom-left hover: **AMIRA.exe**
- Bottom-right: tap the **dog** 🐶
- Top area: faint **🎂** — secret birthday chime + hearts
- **Triple-click** the warning banner → cherry red overload flash
- Type **amira** on keyboard → Princess Mode (then press **P** for PUBG sound)
- Hover **Princess** for random compliments
- Spam **NO** on page 1 for streak messages
- Tap gallery photos for heart sound
- Random fake system toasts during the experience
