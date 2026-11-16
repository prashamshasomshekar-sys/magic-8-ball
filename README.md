# 🎱 Magic 8 Ball ✧ マジック 8 ボール

A 3D, anime-style magic 8 ball floating under a calm starry night sky. Ask it a question, give it a shake, and it reveals your fortune.

**▶ Play it live:** https://prashamshasomshekar-sys.github.io/magic-8-ball/

## Features

- **3D cel-shaded 8 ball** – black, cartoon-style shading with a thick outline and an anime shine highlight
- **Starry night sky** – twinkling stars, sparkles, a crescent moon, shooting stars and drifting fireflies
- **Manga-style shake** – speed lines and a "シャカ シャカ!!" sound effect while the ball shakes
- **Animated reveal** – the ball spins to its answer window and a glowing triangle floats up with a burst of sparkles
- **20 classic answers** – colour-coded by mood (blue = yes, gold = maybe, coral = no), each with a kaomoji
- Gently floats and tilts toward your mouse

## How to use

1. Type a question in the box (optional).
2. Click **Ask ✧**, press **Enter** or **Space**, or click the ball itself.
3. Wait for the ball to shake and reveal your answer.

## Run it locally

No build step or installs needed. Download or clone the repo and open `index.html` in your browser:

```bash
git clone https://github.com/prashamshasomshekar-sys/magic-8-ball.git
```

An internet connection is needed the first time, because Three.js and the font load from a CDN.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page layout: title, question box and button |
| `style.css` | Night sky background and UI styling |
| `script.js` | The 3D scene, ball, animations and answers |

## Customising

- **Answers:** edit the `ANSWERS` list in `script.js`
- **Ball colour:** change `BALL_COLOR` and the body material colour in `script.js`
- **Sky colours:** edit the `body` background gradient in `style.css`

## Built with

- [Three.js](https://threejs.org/) (r128) for the 3D graphics
- [Mochiy Pop One](https://fonts.google.com/specimen/Mochiy+Pop+One) from Google Fonts
- Plain HTML, CSS and JavaScript
- Hosted on GitHub Pages
