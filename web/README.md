# IdentityZA Web App & Google AdSense Setup Guide

This web application is a standalone, client-side port of `identityza` designed to validate South African National ID numbers and monetize website traffic via **Google AdSense**.

---

## 1. Quick Local Preview

You can run and test the web app immediately without any external installation:

### Using Python:
```bash
cd web
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

### Using Node.js:
```bash
npx serve web
```

---

## 2. Setting Up Google AdSense for Monetization

To display live ads and earn revenue with Google AdSense:

### Step 1: Register Your Domain & AdSense Account
1. Purchase a domain name (e.g. `identityza.co.za`, `identityza.com`, or similar).
2. Go to [Google AdSense](https://adsense.google.com/) and sign up.
3. Add your custom domain under **Sites -> Add Site**.

### Step 2: Configure `ads.txt`
Google requires an `ads.txt` file at the root of your domain:
1. Open [`web/ads.txt`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/ads.txt).
2. Replace `pub-0000000000000000` with your personal 16-digit AdSense Publisher ID.
3. Ensure this file is accessible at `https://yourdomain.com/ads.txt`.

### Step 3: Configure `adsense-config.js`
1. Open [`web/adsense-config.js`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/adsense-config.js).
2. Set `previewMode: false`.
3. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your real Publisher ID.
4. (Optional) Create ad units in AdSense under **Ads -> By ad unit** (Responsive Display unit recommended) and paste their slot numbers into `slots`.

### Step 4: Update `web/index.html`
In [`web/index.html`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/index.html), search for `ca-pub-XXXXXXXXXXXXXXXX` and replace it with your publisher ID.

---

## 3. Best Practices to Guarantee AdSense Approval

Google AdSense rejects many single-page utility sites for "Low-value content". This application has been specifically engineered to prevent rejection:

1. **Rich Context & Documentation**: Includes explanations of every ID segment (`YYMMDD`, `SSSS`, `C`, `A`, `Z`) and the Luhn algorithm.
2. **Policy Compliance**: Contains an explicit disclaimer noting no affiliation with the Department of Home Affairs (DHA) and a privacy guarantee.
3. **No Accidental Clicks**: Ad units are spaced with clear separation and labeled with "Advertisement" to prevent Google policy violations.
4. **Never Click Your Own Ads**: Clicking your own ads (even for testing) can permanently terminate your AdSense account.

---

## 4. Free Deployment Options

You can host this static web app for free on:
- **Cloudflare Pages / Vercel / Netlify**: Simply link your GitHub repo or drag-and-drop the `web` folder.
- **GitHub Pages**: Go to your repository **Settings -> Pages**, set source to `main` branch and `/web` or `/docs` directory.
