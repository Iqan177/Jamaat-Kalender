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
  subCategory: String,
  participants: { type: Number, default: 0 },  // Gesamt-Teilnehmerzahl
  createdBy: String,
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Teilnehmer Schema für individuelle Anmeldungen
const participantSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: String, required: true },
  participantCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);
const Participant = mongoose.model('Participant', participantSchema);

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
    
    // Lösche auch alle Teilnehmer-Einträge für dieses Event
    await Participant.deleteMany({ eventId: req.params.id });
    
    res.json({ message: 'Event erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen des Events' });
  }
});

// 🔹 POST - Teilnahme bestätigen
app.post('/api/events/:id/participate', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { participantCount, userId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });
    
    // Prüfe ob Benutzer bereits teilgenommen hat
    const existingParticipation = await Participant.findOne({ eventId, userId });
    if (existingParticipation) {
      return res.status(400).json({ error: 'Sie haben bereits für dieses Event teilgenommen' });
    }
    
    // Erstelle neuen Teilnehmer-Eintrag
    const participant = new Participant({
      eventId,
      userId,
      participantCount: parseInt(participantCount)
    });
    await participant.save();
    
    // Aktualisiere Gesamt-Teilnehmerzahl
    event.participants += parseInt(participantCount);
    await event.save();
    
    res.json({ 
      message: 'Teilnahme bestätigt', 
      totalParticipants: event.participants 
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler bei der Teilnahme-Bestätigung' });
  }
});

// 🔹 GET - Teilnehmer-Statistik für Admin
app.get('/api/events/:id/participants', async (req, res) => {
  try {
    const eventId = req.params.id;
    const participants = await Participant.find({ eventId });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Teilnehmer' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
