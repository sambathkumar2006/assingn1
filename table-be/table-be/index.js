const express = require('express');
const cors = require('cors');
const data = require('./data.json');

const PORT = 8080;
const SORTABLE_COLUMNS = ['company', 'contact', 'country'];

const app = express();

// Let a frontend served from another origin (e.g. a Vite dev server) call the API.
app.use(cors());

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return n > 0 ? n : fallback;
}

// GET /api?limit=10&page=1&sortCol=company&sortKey=asc&filter=apex
//   limit    rows per page (default 100)
//   page     1-based page number (default 1)
//   sortCol  column to sort by: company | contact | country (default: data order)
//   sortKey  sort direction: asc | desc (default asc)
//   filter   case-insensitive substring match on company or contact
// Responds with { rows, total }, where total counts every row matching the filter, not just this page.
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
  res.json({ rows: rows.slice(start, start + limit), total: rows.length });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Server listening on http://localhost:${PORT}`);
});
