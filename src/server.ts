import 'dotenv/config';
import app from './app';
import { prisma } from './config/database';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    // Verify DB connection on startup
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Kaizen Fusion API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Env:    ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
