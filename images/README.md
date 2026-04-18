# Photos go here

Drop any number of images named in sequence:

- `photo-1.jpg`
- `photo-2.jpg`
- `photo-3.jpg`
- ...and so on

The gallery auto-discovers up to 60 photos and renders them in order. Just add the next number (`photo-7.jpg`, `photo-8.jpg`, etc.) and it'll show up on the site — no HTML edits needed.

**Supported extensions:** `.jpg`, `.jpeg`, `.png`, `.webp` (the site tries each in that order).

**Sizing tips:** any aspect ratio works — the layout is a masonry grid that preserves each photo's natural shape. For best loading, aim for ~1600px on the long edge.

**Captions:** the first 12 slots have witty default captions in `script.js` (edit `GALLERY_CAPTIONS` to change them). Anything beyond that gets a generic fallback caption — add more entries to the array if you want something specific.
