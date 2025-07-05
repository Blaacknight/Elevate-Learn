const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const materialRoutes = require('./routes/material.routes');
const progressRoutes = require('./routes/progress.routes');
const sectionRoutes = require('./routes/section.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const codeRoutes = require('./routes/code.routes');
const certificateRoutes = require('./routes/certificate.routes');
// const enrollmentRoutes = require('./routes/enrollment.routes');
const chatRoutes = require('./routes/chat.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const createDefaultAdmin = require('./createDefaultAdmin'); // adjust path
const classroomRoutes = require('./routes/classroom.routes');

dotenv.config();
connectDB();
createDefaultAdmin();
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    io.emit('message', msg); // broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  exposedHeaders: ['Authorization', 'Content-Disposition'],
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes

app.use('/api', chatRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/classrooms', classroomRoutes);
// app.use('/api/enrollments', enrollmentRoutes);












// Health check
app.get('/', (req, res) => {
  res.send('LMS API is running with real-time chat...');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
