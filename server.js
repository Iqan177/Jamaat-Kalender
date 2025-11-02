const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - DEPRECATED OPTIONS ENTFERNEN
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jamaat-kalender';

mongoose.connect(mongoURI)
.then(() => console.log('✅ Mit MongoDB verbunden'))
.catch(err => console.error('❌ MongoDB Verbindungsfehler:', err));

// Routes
app.use('/api', require('./routes/events'));           // ✅ Events Route
app.use('/api', require('./routes/participants'));     // ✅ Participants Route

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Jamaat Kalender API läuft',
        timestamp: new Date().toISOString()
    });
});

// Fehlerbehandlung
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route nicht gefunden' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
});

// 🔥 WICHTIG: Port auf 3001 setzen
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
});
