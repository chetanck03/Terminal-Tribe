import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test route to fetch a user with connection retry logic
app.get('/api/test-db', async (req, res) => {
  try {
    // First disconnect to ensure clean connection (helps with "prepared statement already exists" error)
    await prisma.$disconnect();
    
    // Then reconnect
    await prisma.$connect();
    
    // Execute query
    const userCount = await prisma.user.count();
    
    res.json({ 
      message: 'Database connection successful', 
      userCount 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Try to disconnect on error to clean up connections
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error during disconnect:', disconnectError);
    }
    
    res.status(500).json({ 
      error: 'Database connection error',
      message: error.message
    });
  }
});

// User registration endpoint with improved error handling
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: In production, hash this password
        role: 'USER'
      }
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Start the server and check database connection
const startServer = async () => {
  try {
    // First disconnect to ensure clean connection
    await prisma.$disconnect();
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established successfully');
    
    // Database connection URL (masked for security)
    const dbUrl = process.env.DATABASE_URL || 'No database URL found';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`📊 Database: ${maskedUrl}`);
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📝 API endpoints available:`);
      console.log(`   - Health check: http://localhost:${PORT}/api/health`);
      console.log(`   - Database test: http://localhost:${PORT}/api/test-db`);
      console.log(`   - Register user: http://localhost:${PORT}/api/auth/register [POST]`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

// Handle process termination properly
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
});

startServer(); 