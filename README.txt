FCNEWS26 AUTOMATIC TRANSFER NEWS - DEPLOYMENT NOTES

This package adds a server-side Netlify Function at /api/transfers.
It fetches Google News RSS search results for football transfer news and shows headlines with source links.
No API key is required for this RSS-based starter.

IMPORTANT:
- Netlify Functions require a supported deploy that processes functions. For the most reliable setup, put these files in a GitHub repository and connect that repository to Netlify. A simple static drag-and-drop deploy may not publish functions.
- This is an RSS search feed, not a dedicated structured transfer API. Headlines may include rumours or unrelated stories; check the source before marking any deal official.
- Respect the original publishers' terms and link to their reports rather than copying full articles.
- The manual form still saves only in the current browser/device; shared admin publishing needs a separate CMS/backend.
