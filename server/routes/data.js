const router = require('express').Router();
const pool = require('../db/pool');

// GET /api/data/champions
router.get('/champions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, title, region, role, lore_blurb, tags FROM champions ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get champions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/data/champions/:id
router.get('/champions/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM champions WHERE id = $1', [req.params.id.toLowerCase()]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Champion not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get champion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/data/items
router.get('/items', async (req, res) => {
  try {
    const { tier } = req.query;
    let query = 'SELECT * FROM items';
    const params = [];
    if (tier) {
      query += ' WHERE tier = $1';
      params.push(parseInt(tier));
    }
    query += ' ORDER BY tier, cost';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/data/regions
router.get('/regions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM regions ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Get regions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
