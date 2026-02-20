const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({ success: true }));
router.get('/:id', (req, res) => res.json({ id: req.params.id }));
router.put('/:id', (req, res) => res.json({ id: req.params.id }));
router.delete('/:id', (req, res) => res.json({ success: true }));

module.exports = router;
