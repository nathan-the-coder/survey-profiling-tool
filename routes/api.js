var express = require('express');
var router = express.Router();
const DatabaseAdapter = require('./database');

// Initialize database adapter
const db = new DatabaseAdapter();

// Authentication middleware to extract user info
const authMiddleware = (req, res, next) => {
  const username = req.headers['x-username'] || 'Guest';
  const userRole = req.headers['x-user-role'] || 'parish';
  
  req.userRole = userRole;
  req.userParish = username;
  req.username = username;
  
  next();
};

// Login endpoint (no auth required)
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    // Authenticate user
    const user = await db.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }
    
    // Use role from database
    const role = user.role || 'parish';
    const parishName = user.parish_name || user.parish || username;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: role,
        parish: parishName,
        parish_id: user.parish_id
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Login failed', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Apply auth middleware to all routes after login
router.use(authMiddleware);

// Get all participants with role-based filtering
router.get('/all-participants', async function(req, res, next) {
  try {
    const { userRole, userParish } = req;
    
    const results = await db.getAllParticipants(userRole, userParish);
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch participants', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Search participants endpoint
router.get('/search-participants', async function(req, res, next) {
  try {
    const query = req.query.q;
    const { userRole, userParish } = req;
    
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
    const { userRole, userParish } = req;
    
    const data = await db.getParticipantDetails(participantId, userRole, userParish);
    
    // Check access for parish users
    if (userRole === 'parish' && data.household?.parish_name !== userParish) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view participants from your parish.' 
      });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get participant details', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Update participant endpoint (Archdiocese and Admin only)
router.put('/participant/:id', async function(req, res, next) {
  try {
    const participantId = req.params.id;
    const { userRole } = req;
    
    // Only archdiocese and admin can edit
    if (userRole !== 'archdiocese' && userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Only Archdiocese and Admin users can edit participants.' 
      });
    }
    
    const updateData = req.body;
    const result = await db.updateParticipant(participantId, updateData);
    
    res.json({ 
      success: true, 
      message: 'Participant updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update participant', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Delete participant endpoint (Admin only)
router.delete('/participant/:id', async function(req, res, next) {
  try {
    const participantId = req.params.id;
    const { userRole } = req;
    
    // Only admin can delete
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Only Admin users can delete participants.' 
      });
    }
    
    await db.deleteParticipant(participantId);
    
    res.json({ 
      success: true, 
      message: 'Participant deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete participant', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// User management endpoints (Admin only)
router.get('/users', async function(req, res, next) {
  try {
    const { userRole } = req;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Only Admin users can view user list.' 
      });
    }
    
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch users', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Create new user (Admin only)
router.post('/users', async function(req, res, next) {
  try {
    const { userRole } = req;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Only Admin users can create new users.' 
      });
    }
    
    const userData = req.body;
    const result = await db.createUser(userData);
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create user', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Update user (Admin only)
router.put('/users/:id', async function(req, res, next) {
  try {
    const userId = req.params.id;
    const { userRole } = req;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Only Admin users can update users.' 
      });
    }
    
    const userData = req.body;
    const result = await db.updateUser(userId, userData);
    
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update user', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', async function(req, res, next) {
  try {
    const userId = req.params.id;
    const { userRole } = req;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Only Admin users can delete users.' 
      });
    }
    
    await db.deleteUser(userId);
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete user', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Get current user info
router.get('/me', async function(req, res, next) {
  try {
    const { username, userRole, userParish } = req;
    
    res.json({
      username,
      role: userRole,
      parish: userParish
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get user info', 
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
    const { userRole, userParish } = req;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    const results = await db.searchParticipants(query, userRole, userParish);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get all parishes
router.get('/parishes', async function(req, res, next) {
  try {
    const parishes = await db.getAllParishes();
    res.json(parishes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parishes' });
  }
});

// Submit survey data
router.post('/submit-survey', async function(req, res, next) {
  try {
    if (!req.body || !req.body.data) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const result = await db.createSurveyParticipant(req.body.data);
    
    res.status(200).json({ 
      success: true, 
      message: 'Survey data saved successfully', 
      id: result.id 
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit survey', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

module.exports = router;
