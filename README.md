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

1. **Push this folder to GitHub** (under the `JustJ0rsh` account):
   ```bash
   cd /Users/joshua/Developer/kobyvinson
   git init
   git add .
   git commit -m "Initial tribute"
   git branch -M main
   # create an empty repo on github.com/JustJ0rsh first (e.g. "kobyvinson"), then:
   git remote add origin git@github.com:JustJ0rsh/kobyvinson.git
   git push -u origin main
   ```

2. **Connect it to Cloudflare Pages**:
   - Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
   - Authorize Cloudflare to access your GitHub (first-time only), then pick the `kobyvinson` repo.
   - **Build settings**: framework preset = *None*. Leave build command **blank**. Build output directory = `/` (the root).
   - Click Save and Deploy. First deploy takes ~30 seconds.

3. **Every future `git push`** to `main` auto-rebuilds and deploys. You'll get a `*.pages.dev` URL; you can attach a custom domain in the Pages project settings.
