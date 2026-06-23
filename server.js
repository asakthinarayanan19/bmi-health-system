require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDb, getDbType } = require('./db');

const authMiddleware = require('./middleware/authMiddleware');
const authController = require('./controllers/authController');
const assessController = require('./controllers/assessController');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Health Check API (used by frontend to verify backend availability & connection style)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    dbType: getDbType()
  });
});

// Authentication Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot', authController.forgotPassword);
app.get('/api/auth/profile', authMiddleware, authController.getProfile);
app.put('/api/auth/profile', authMiddleware, authController.updateProfile);

// Assessment Routes
app.post('/api/assessments', authMiddleware, assessController.createAssessment);
app.get('/api/assessments', authMiddleware, assessController.getAssessments);

// Admin & General Contact Routes
app.get('/api/admin', authMiddleware, adminController.getAdminData);
app.post('/api/contact', adminController.submitContact);

// Fallback for HTML routing (SPA-like or static fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start DB connection then server
async function startServer() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(`SERVER RUNNING: http://localhost:${PORT}`);
    console.log(`DATABASE MODE: ${getDbType()}`);
    console.log(`======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
