const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// MongoDB Verbindung
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kalender';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Mit MongoDB Atlas verbunden'))
  .catch(err => console.log('❌ Datenbank Fehler:', err));

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  startTime: String,
  endTime: String,
  location: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);

app.use(cors());
app.use(express.json());

// 🔹 GET - Alle Events abrufen
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Events' });
  }
});

// 🔹 GET - Einzelnes Event abrufen
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden des Events' });
  }
});

// 🔹 POST - Neues Event erstellen
app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: 'Fehler beim Erstellen des Events' });
  }
});

// 🔹 PUT - Event bearbeiten
app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: 'Fehler beim Aktualisieren des Events' });
  }
});

// 🔹 DELETE - Event löschen
app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });
    res.json({ message: 'Event erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen des Events' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});