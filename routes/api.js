var express = require('express');
var router = express.Router();
const DatabaseAdapter = require('./database');

// Initialize database adapter
const db = new DatabaseAdapter();

// Search participants endpoint
router.get('/search-participants', async function(req, res, next) {
  try {
    const query = req.query.q;
    const username = req.headers['x-username'] || 'Guest';
    const userRole = req.userRole || (username === 'Archdiocese of Tuguegarao' ? 'archdiocese' : 'parish');
    const userParish = req.userParish || username;
    
    
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    const results = await db.searchParticipants(query, userRole, userParish);
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: 'Search failed', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Get participant details endpoint
router.get('/participant/:id', async function(req, res, next) {
  try {
    const participantId = req.params.id;
    const username = req.headers['x-username'] || 'Guest';
    const userRole = req.userRole || (username === 'Archdiocese of Tuguegarao' ? 'archdiocese' : 'parish');
    const userParish = req.userParish || username;
    
    
    
    const data = await db.getParticipantDetails(participantId, userRole, userParish);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get participant details', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Database connection test endpoint
router.get('/test-db', async function(req, res, next) {
  try {
    const result = await db.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Database test failed', 
      message: error.message 
    });
  }
});

// Simple connection test endpoint
router.get('/test-connection', async function(req, res, next) {
  try {
    const result = await db.testConnection();
    res.json({ 
      success: true, 
      message: 'Backend is connected',
      database: result.database,
      environment: process.env.NODE_ENV 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Backend connection failed',
      error: error.message 
    });
  }
});

// Search endpoint (simplified)
router.get('/search', async function(req, res, next) {
  try {
    const query = req.query.q;
    const username = req.headers['x-username'] || 'Guest';
    const userRole = req.userRole || (username === 'Archdiocese of Tuguegarao' ? 'archdiocese' : 'parish');
    const userParish = req.userParish || username;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    const results = await db.searchParticipants(query, userRole, userParish);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;