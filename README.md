# Ultra website

A responsive, multi-page MEP company website built with vanilla JavaScript and Vite, with a small Express contact API and SQLite lead storage. The project keeps page content, shared behavior, backend logic, and visual styles in separate files so the site can grow without becoming difficult to maintain.

## Structure

```text
src/
  components/site-shell.js # Shared navigation, footer, and WhatsApp button
  data/site.js     # Hero slides, services, and project content
  data/projects.js # Project portfolio content
  data/team.js    # Team profile content
  data/service-disciplines.js # Dedicated services page cards
  data/approach.js # Process steps for the approach page
  main.js          # Page composition and interactive behavior
  pages/about.js   # Dedicated about page
  pages/projects.js # Dedicated projects page
  pages/services.js # Dedicated services page
  pages/approach.js # Dedicated approach page
  pages/admin.js    # Private lead management dashboard
  styles.css       # Design tokens, components, responsive styles
server/
  admin-routes.js   # Login, protected lead APIs, filters and status updates
  create-admin.js   # Interactive hashed admin account setup/password reset
  session-store.js  # SQLite-backed Express sessions
  database.js       # SQLite connection, schema and lead persistence
  email.js          # SMTP lead notifications
  index.js          # Express API and security/session middleware
  validation.js     # Public contact form validation
public/
  images/          # Drop in the named photos and logos listed below
index.html         # Document shell and metadata
projects.html      # Dedicated project portfolio page
about.html         # Dedicated company and team page
services.html      # Dedicated MEP services page
approach.html      # Dedicated process and approach page
admin.html         # Admin dashboard entry page
```

## Run locally

```sh
npm install
```

Copy `.env.example` to `.env` and set the SMTP variables and recipient inbox. Then run the frontend and API in two terminals:

```sh
npm run dev
```

```sh
npm run dev:server
```

The Vite development server proxies `/api` requests to the Express API on port 3000. Submissions are stored in `server/data/leads.sqlite`. If SMTP settings are not configured, the API still saves submissions and reports success; email delivery is logged as unavailable.

## Clean URLs

The site remains a Vite multi-page application. A small Vite middleware maps clean paths to the existing HTML entries in both development and `vite preview`, so direct navigation and refresh work without a client-side router:

| Clean path | Existing page | Behavior |
| --- | --- | --- |
| `/` | `index.html` | Home |
| `/about` | `about.html` | About |
| `/services` | `services.html` | Services |
| `/projects` | `projects.html` | Projects |
| `/approach` | `approach.html` | Approach |
| `/contact` | `index.html` | Opens the home page at the contact section |
| `/admin` | `admin.html` | Admin dashboard |

Old `.html` addresses redirect to their clean equivalent locally. Internal links use clean paths. The contact section remains part of the home page; `/contact` does not create a duplicate page.

No production-host configuration is included yet. Once a host is selected, configure it to internally rewrite the clean paths above to the listed HTML files while leaving the browser URL unchanged. Also add permanent redirects from `/index.html`, `/about.html`, `/services.html`, `/projects.html`, `/approach.html`, `/contact.html`, and `/admin.html` to their clean paths. Make sure `/api/*`, `/assets/*`, `/images/*`, and other existing files are served before any page fallback, so backend requests and assets are not rewritten to HTML. The exact syntax and config filename depend on the host.

## Admin dashboard

Set `ADMIN_SESSION_SECRET` in `.env` to a cryptographically random value of at least 32 bytes. The local `.env` created for this project has a generated value; keep it private. For another environment, generate a secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. If running behind one trusted reverse proxy in production, keep `TRUST_PROXY_HOPS=1`; adjust it only to match the actual proxy chain.

Create the first admin account from an interactive terminal:

```sh
npm run admin:create
```

The command prompts for an email and a password (input hidden), confirms the password, hashes it with bcrypt, and stores only the hash in the `admin_users` table. Use a unique password at least 12 bytes long. Running the command again for the same email updates that account's password.

With `npm run dev` and `npm run dev:server` running, open `http://localhost:5173/admin`. The dashboard uses an HTTP-only, SameSite strict session cookie and server-side SQLite session storage. Sessions expire after eight hours of inactivity. Admin APIs include login/session/logout, lead summary, paginated/searchable/filterable lead listing, lead details, status updates, and permanent lead deletion after a confirmation prompt. Existing leads receive the `New` status when the backend starts and migrates the database.

In production, serve the admin page over HTTPS, configure the same `/api` origin or a trusted reverse proxy, provide a stable random `ADMIN_SESSION_SECRET`, and use persistent protected storage and backups for the SQLite database. Keep login rate limits enabled; add monitoring and account recovery procedures before opening the dashboard to production users. The admin page itself is not secret; access control is enforced by the backend APIs.

Run `npm run build` to create the production frontend bundle in `dist/`.

## Contact form backend

The contact form appears in the “Let's build” section of every page and collects a full name, phone number, email address, and required service. Service choices are Project Execution, Project design, and Design and execution. The API validates these fields and saves them in SQLite before attempting to email a notification. Earlier leads keep their original service labels and remain available in the admin filters and service summary.

Configure these values in `.env`:

```text
PORT=3000
DATABASE_PATH=server/data/leads.sqlite
SMTP_HOST=your SMTP host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your SMTP username
SMTP_PASS=your SMTP password
SMTP_FROM=the verified sender address
CONTACT_RECIPIENT=the inbox that receives new leads
```

Use the SMTP credentials supplied by your email provider. Keep `.env` private; it is ignored by Git. `SMTP_FROM` must be accepted by your provider. Configure `CONTACT_RECIPIENT` with the inbox that should receive lead notifications.

To check the API locally, start both servers and submit the form from any page. A successful response appears below the form. To verify the database directly, use a SQLite viewer or run `sqlite3 server/data/leads.sqlite 'SELECT id, full_name, phone_number, email, service_required, created_at FROM leads;'`.

For production, deploy the Node API on a Node.js 22.13+ host, configure the environment variables in the host's secret settings, and attach persistent storage for the SQLite file. Route `/api/*` from the public website domain to this API so the same-origin form request continues to work. The static site and API can be hosted separately behind a reverse proxy, or served by a platform that supports both. Do not place the database on an ephemeral filesystem; back it up and restrict access to it. SMTP credentials belong only in the backend environment.

## Content and assets

The screenshot reference contains image areas for the hero carousel, featured projects, and client logos. Those areas are included as visible placeholders. Add files with these names to `public/images/` and they will appear automatically:

```text
hero-01.jpg, hero-02.jpg, hero-03.jpg   # Full-bleed rotating hero photos
approach.jpg                            # Wide image beside the approach section
intro.jpg                               # Background photo for the company intro card
projects-hero.jpg                       # Hero photo for the dedicated project page
about-hero.jpg                          # Image for the about page hero card
services-hero.jpg                       # Hero photo for the services page
service-plumbing.jpg                    # Plumbing service card photo
approach-hero.jpg                       # Hero photo for the approach page
approach-01.jpg ... approach-06.jpg     # Process card photos
team-01.jpg ... team-06.jpg             # Team portraits
service-mechanical.jpg                  # Mechanical services card
service-electrical.jpg                  # Electrical services card
service-design.jpg                      # Design and coordination card
service-commissioning.jpg               # Testing and commissioning card
project-01.jpg ... project-08.jpg       # Project card photos, shown in a moving loop
client-01.png ... client-05.png         # Client/partner logos
```

Edit `src/data/site.js` to add/remove image slots or change their filenames, and `src/data/projects.js` to update project cards. The labels remain visible until an image with a matching name is supplied. Brand colors are defined in `src/styles.css`: the guideline PDF's embedded blue swatch is used as the primary accent, with light gray sections to balance the darker hero and service areas.

Set `whatsappNumber` in `src/data/site.js` to the company's WhatsApp number in international format (digits only) before publishing.
Replace the Facebook and Instagram placeholder URLs in `socialLinks` in `src/data/site.js` with Ultra's official profile links.
