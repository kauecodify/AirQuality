require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Vercel deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airquality';
    
    // Add retry logic for better connection handling
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('Retrying MongoDB connection...');
      connectDB();
    }, 5000);
    
    return false;
  }
};

// Import routes
const leiturasRouter = require('./routes/leituras');
const climaRouter = require('./routes/clima');

// Use routes
app.use('/api/leituras', leiturasRouter);
app.use('/api/clima', climaRouter);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'AirQuality Monitor API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS settings for Vercel
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST']
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    maxDisconnectionBufferSize: 1000
  },
  pingTimeout: 20000,
  pingInterval: 25000
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current sensor data to new client
  socket.on('get-sensors', async () => {
    try {
      const Leitura = require('./models/Leitura');
      const sensors = await Leitura.find({
        'localizacao.coordinates': { $exists: true, $ne: null }
      }).sort({ dataHora: -1 }).limit(50);
      
      const sensorData = sensors.map(s => ({
        lat: s.localizacao.coordinates[1],
        lon: s.localizacao.coordinates[0],
        name: `Sensor ${s._id.slice(-4)}`,
        co2: s.co2,
        umidade: s.umidade,
        temperatura: s.temperatura,
        status: getCO2Status(s.co2)
      }));
      
      socket.emit('update-sensors', { sensors: sensorData });
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  });
  
  // Handle new reading from client
  socket.on('new-reading', (data) => {
    console.log('New reading received via socket:', data);
    // Broadcast to all clients except sender
    socket.broadcast.emit('new-sensor-data', { 
      sensor: {
        lat: data.localizacao.coordinates[1],
        lon: data.localizacao.coordinates[0],
        name: `Sensor ${Date.now().toString().slice(-4)}`,
        co2: data.co2,
        umidade: data.umidade,
        temperatura: data.temperatura,
        status: getCO2Status(data.co2)
      }
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to determine CO2 status
function getCO2Status(co2) {
  if (co2 >= 1000) return 'hazardous';
  if (co2 >= 500) return 'very-unhealthy';
  if (co2 >= 400) return 'unhealthy';
  if (co2 >= 300) return 'moderate';
  return 'good';
}

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the application at http://localhost:${PORT}`);
      console.log(`Socket.io enabled for real-time updates`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } else {
    console.log('Starting server without database connection...');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database connection pending)`);
      console.log(`Access the application at http://localhost:${PORT}`);
    });
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle SIGTERM for graceful shutdown (important for Vercel)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 5 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
});

// Start the server
startServer();

// Export app for testing
module.exports = app;
