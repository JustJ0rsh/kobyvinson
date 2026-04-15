# kobyvinson

A static tribute site. Plain HTML/CSS/JS — no build step.

## Customize

- **Photos** — drop 6 images into `images/` named `photo-1.jpg` through `photo-6.jpg`. See `images/README.md`.
- **Copy** — edit text directly in `index.html` (hero tagline, captions, testimonials, timeline).
- **Colors** — tweak the CSS variables at the top of `styles.css` (`--bg`, `--gold`, etc).

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to Cloudflare Pages

Push to GitHub, then connect the repo in the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**. Framework preset *None*, build command blank, output directory `/`.

Every subsequent push to `main` auto-rebuilds and deploys.
