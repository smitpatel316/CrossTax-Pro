const express = require('express');
const router = express.Router();

// Demo login - just returns success
router.post('/login', (req, res) => {
  res.json({ 
    success: true, 
    token: 'demo-token-123',
    user: { id: '1', email: 'demo@crosstax.com', firstName: 'Demo', lastName: 'User' }
  });
});

router.post('/register', (req, res) => {
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  res.json({ id: '1', email: 'demo@crosstax.com', firstName: 'Demo', lastName: 'User' });
});

module.exports = router;
