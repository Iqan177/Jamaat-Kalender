const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jamaat-kalender';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB verbunden'))
.catch(err => console.error('❌ MongoDB Verbindungsfehler:', err));

// Routes
app.use('/api', require('./routes/events'));
// 🔥 NEUE ZEILE: Participate-Routes hinzufügen
app.use('/api', require('./routes/participants'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Jamaat Kalender API läuft',
        timestamp: new Date().toISOString()
    });
});

// Fehlerbehandlung für unbekannte Routes
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route nicht gefunden' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
});
