# VOCA website

The website of the **Vancouver Odia Cultural Association** (Surrey, BC), in English and ଓଡ଼ିଆ.
It's a plain static site (HTML, CSS and JavaScript, no build step), so it can be hosted free on **GitHub Pages** under your own domain.

| Page | File | Content comes from |
|---|---|---|
| Home | `index.html` | events, albums, sponsors data + Odisha content |
| Events | `events.html` | `data/events.json` |
| Gallery (VOCA albums + Discover Odisha) | `gallery.html` | `data/albums.json` + `assets/img/albums/` |
| Members + committee | `members.html` | `data/members.json` |
| Member profile | `member.html?id=…` | `data/members.json` |
| Membership registration | `register.html` | form → email |
| Volunteer & contribute | `volunteer.html` | form → email |
| Sponsors | `sponsors.html` | `data/sponsors.json`, form → email |
| Contact | `contact.html` | form → email |

---

## 1. Settings: `assets/js/config.js`

- `formEmail`: every form (registration, volunteer, sponsor, contact) is emailed here through [FormSubmit.co](https://formsubmit.co), which is free and needs no account. **The first time** someone submits a form, FormSubmit sends an activation email to this address. Click the link in it once and the forms are live.
- `etransferEmail`: the address shown for Interac e-Transfer donations.
- `social`: Facebook, Instagram, YouTube and WhatsApp links. Icons only appear for links you fill in.

## 2. Updating content (no coding)

**Events** (`data/events.json`): add an entry with `date` (YYYY-MM-DD). Set `"tbc": true` while the date isn't final. Events move to "Past events" automatically once their date has passed. To link an event to a photo album, give it `"album": "<album id>"`.

**Photos and the carousel**:
1. Put photos in `assets/img/albums/picnic/`, `diwali/` or `saraswati-puja/`. To start a new album, just create a new folder.
2. Run `python3 tools/build-albums.py`. It writes the file names into `data/albums.json`.
3. Edit the album's title (`en` / `or`) and `date` in `data/albums.json` if you need to.

Resize photos to about 1600px wide before adding them (on a Mac, Preview → Tools → Adjust Size), so pages stay fast. The home-page carousel automatically takes up to 4 photos from each album. Until you add photos, it shows Odisha festival photos.

**Members** (`data/members.json`): registrations arrive by email. To list a member who ticked "List me in the public member directory", add an entry with a unique `id`. Their profile page is then `member.html?id=<id>`. Put photos in `assets/img/members/` and reference them as `"photo": "assets/img/members/name.jpg"`. Fill in the committee names at the top. **Delete the two `"example": true` entries before launch.**

**Sponsors** (`data/sponsors.json`): add `{ "name": "…", "logo": "assets/img/sponsors/x.png", "url": "https://…" }` under `platinum`, `gold`, `silver` or `community`. A thank-you strip appears on the home page once at least one sponsor is listed.

**Text and translations**: all page text is in `assets/js/i18n.js`, with English in `en` and Odia in `or`, under the same keys. The Odisha festival-wheel and gallery text is in `assets/js/odisha.js`.

## 3. Preview on your computer

```bash
python3 -m http.server 8080
```
Then open http://localhost:8080. Opening the HTML file directly won't work, because the pages load their data with `fetch`.

## 4. Publish free on GitHub Pages

1. Create a free GitHub account and a **public** repository, for example `voca-website`.
2. Upload this folder: either drag the files into the repository on github.com ("Add file → Upload files"), or use git:
   ```bash
   git init && git add . && git commit -m "VOCA website"
   git branch -M main
   git remote add origin https://github.com/<your-user>/voca-website.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
   About a minute later the site is live at `https://<your-user>.github.io/voca-website/`.

## 5. Use your own domain

1. In **Settings → Pages → Custom domain**, enter your domain (e.g. `www.yourdomain.ca`) and save. GitHub adds a `CNAME` file to the repository.
2. At your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:
   - `www`: **CNAME** → `<your-user>.github.io`
   - `@` (root/apex): four **A** records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Wait for DNS to update (from a few minutes up to 24h). Then tick **Enforce HTTPS** in Settings → Pages.

Total cost: $0 for hosting and forms. You only pay for the domain you already own.

## Photo credits
The Odisha photographs are loaded from Wikimedia Commons (CC BY-SA, credited in the footer). Replace them with your own VOCA photos whenever you like.
