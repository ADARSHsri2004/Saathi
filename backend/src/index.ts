import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`🚀 Saathi Backend Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - POST   /api/users - Create new user`);
  console.log(`   - GET    /api/users/:userId/onboarding - Get onboarding status`);
  console.log(`   - PUT    /api/users/:userId/onboarding - Update onboarding`);
  console.log(`   - POST   /api/users/:userId/onboarding/complete - Complete onboarding`);
  console.log(`   - GET    /api/health - Health check`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
