import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env dosyasını server klasöründen oku
dotenv.config({ path: path.join(__dirname, '.env') });

import db from './config/database.js';
import authRoutes from './routes/auth.js';
import volunteerRoutes from './routes/volunteers.js';
import studentRoutes from './routes/students.js';
import treeRoutes from './routes/trees.js';
import smsRoutes from './routes/sms.js';
import whatsappRoutes from './routes/whatsapp.js';
import uploadRoutes from './routes/upload.js';
import linkContentRoutes from './routes/link-content.js';
import previewRoutes from './routes/preview.js';
import { initializeWhatsApp, whatsappEvents, getWhatsAppStatus } from './services/whatsappService.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/link-content', linkContentRoutes);
app.use('/preview', previewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test database connection
(async () => {
  try {
    await db.execute('SELECT 1');
    console.log('✅ MySQL Database connected successfully');
  } catch (err: any) {
    console.error('❌ Database connection error:', err.message);
    console.error('💡 ÇÖZÜM:');
    console.error('   1. MySQL servisinin çalıştığından emin olun');
    console.error('   2. MySQL kurulum sihirbazını tamamlayın');
    console.error('   3. server/.env dosyasında DB_PASSWORD değerini kontrol edin');
    console.error('   4. Veritabanının oluşturulduğundan emin olun');
  }
})();

// Socket.IO bağlantıları
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Mevcut durumu gönder
  const status = getWhatsAppStatus();
  socket.emit('whatsapp-status', status);
  
  // WhatsApp event'lerini dinle ve client'a gönder
  whatsappEvents.on('status', (status) => {
    const currentStatus = getWhatsAppStatus();
    socket.emit('whatsapp-status', currentStatus);
  });
  
  whatsappEvents.on('qr', (qr) => {
    socket.emit('whatsapp-qr', qr);
  });
  
  whatsappEvents.on('ready', () => {
    socket.emit('whatsapp-ready');
  });
  
  whatsappEvents.on('error', (error) => {
    socket.emit('whatsapp-error', error);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// WhatsApp'ı başlat
initializeWhatsApp().catch((error) => {
  console.error('WhatsApp başlatılamadı:', error);
});

// Server'ı başlat
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is ready for connections`);
});

