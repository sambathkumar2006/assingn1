const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const COUNTRY_CODES = require('./countries');

const PORT = 8080;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const UPLOAD_ROUTE = '/api/uploads';
const SORTABLE_COLUMNS = ['company', 'contact', 'country'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
// The WHATWG pattern browsers use for <input type="email">, tightened to require a dot in the domain.
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Loaded once; submissions are appended here and saved back, so GET /api sees them straight away.
// Read with fs rather than require() so `npm run dev` (node --watch) doesn't restart on every submission.
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
// Hold the image in memory so nothing touches the disk unless the whole submission is valid.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES } });

// Let a frontend served from another origin (e.g. a Vite dev server) call the API.
app.use(cors());
// Uploaded logos are public at /api/uploads/{file}. Living under /api means a frontend dev-server proxy for /api
// reaches them too.
app.use(UPLOAD_ROUTE, express.static(UPLOAD_DIR));

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return n > 0 ? n : fallback;
}

// Form text fields arrive as strings; anything else (missing, or a repeated field's array) counts as empty.
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Go by the file's leading bytes; the client-supplied name and MIME type can't be trusted.
function imageExtension(buffer) {
  if (buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) return 'png';
  if (buffer.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)) return 'jpg';
  return null;
}

// Keeps the one-row-per-line layout. Writing a temp file and renaming it means a crash can't truncate data.json.
function saveData(rows) {
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, `[\n${rows.map((row) => `  ${JSON.stringify(row)}`).join(',\n')}\n]\n`);
  fs.renameSync(tmp, DATA_FILE);
}

// Rows store the logo's file name; responses turn it into an absolute URL. The host comes from the request, so the
// URL points wherever the frontend reached the API: directly, or through a dev-server proxy.
function withLogoUrl(req, row) {
  return row.logo ? { ...row, logo: `${req.protocol}://${req.get('host')}${UPLOAD_ROUTE}/${row.logo}` } : row;
}

// GET /api?limit=10&page=1&sortCol=company&sortKey=asc&filter=apex
//   limit    rows per page (default 100)
//   page     1-based page number (default 1)
//   sortCol  column to sort by: company | contact | country (default: data order)
//   sortKey  sort direction: asc | desc (default asc)
//   filter   case-insensitive substring match on company or contact
// Responds with { rows: [{ id, company, contact, country, email, logo? }], total }, where total counts every row
// matching the filter, not just this page. logo is only on rows with an uploaded image: a URL to load it from.
app.get('/api', (req, res) => {
  const limit = toPositiveInt(req.query.limit, 100);
  const page = toPositiveInt(req.query.page, 1);
  const sortCol = String(req.query.sortCol ?? '').toLowerCase();
  const direction = String(req.query.sortKey ?? '').toLowerCase() === 'desc' ? -1 : 1;
  const filter = String(req.query.filter ?? '').trim().toLowerCase();

  // An empty filter matches every row; filter() also returns a copy, so sorting never mutates `data`.
  const rows = data.filter(
    (row) => row.company.toLowerCase().includes(filter) || row.contact.toLowerCase().includes(filter)
  );

  if (SORTABLE_COLUMNS.includes(sortCol)) {
    rows.sort((a, b) => direction * a[sortCol].localeCompare(b[sortCol]));
  }

  const start = (page - 1) * limit;
  const pageRows = rows.slice(start, start + limit).map((row) => withLogoUrl(req, row));
  res.json({ rows: pageRows, total: rows.length });
});

// POST /api/submit as multipart/form-data
//   company, contact  required text
//   country           ISO 3166-1 alpha-3 code, e.g. USA (any case; stored uppercase)
//   email             valid email address
//   image             JPG or PNG file, max 5 MB; saved as uploads/{id}.png or .jpg and becomes the row's logo
// Responds 201 with the new row (shaped like GET /api's rows), or 400 with { errors: { <field>: message } } for
// every invalid field.
app.post('/api/submit', upload.single('image'), (req, res) => {
  const body = req.body ?? {};
  const company = text(body.company);
  const contact = text(body.contact);
  const country = text(body.country).toUpperCase();
  const email = text(body.email);
  const extension = req.file && imageExtension(req.file.buffer);

  const errors = {};
  if (!company) errors.company = 'Company is required';
  if (!contact) errors.contact = 'Contact is required';
  if (!COUNTRY_CODES.has(country)) {
    errors.country = country ? 'Country must be a 3-letter ISO country code, e.g. USA' : 'Country is required';
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = email ? 'Email must be a valid email address' : 'Email is required';
  }
  if (!extension) {
    errors.image = req.file ? 'Image must be a JPG or PNG file' : 'Image is required';
  }
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  const id = data.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const logo = `${id}.${extension}`;
  const row = { id, company, contact, country, email, logo };
  fs.writeFileSync(path.join(UPLOAD_DIR, logo), req.file.buffer);
  saveData([...data, row]);
  data.push(row);
  res.status(201).json(withLogoUrl(req, row));
});

// Multer rejects an oversized or unexpected file while parsing the form, before the handler above runs.
const UPLOAD_ERRORS = {
  LIMIT_FILE_SIZE: 'Image must be 5 MB or smaller',
  LIMIT_UNEXPECTED_FILE: 'Send a single image file in the "image" field',
};
app.use((err, req, res, next) => {
  if (!(err instanceof multer.MulterError)) return next(err);
  res.status(400).json({ errors: { image: UPLOAD_ERRORS[err.code] ?? err.message } });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Server listening on http://localhost:${PORT}`);
});
