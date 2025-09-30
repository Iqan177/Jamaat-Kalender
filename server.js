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
  isAdminOnly: { type: Boolean, default: false }, // NEU: Nur für Admin sichtbar
  createdBy: String,
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// NEU: Verbessertes Teilnehmer Schema mit Name und Kategorie
const participantSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: String, required: true },
  participantName: { type: String, required: true }, // NEU: Name der Person
  participantCategory: { type: String, required: true }, // NEU: Khuddam, Ansar, etc.
  participantCount: { type: Number, required: true }, // Anzahl Personen
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);
const Participant = mongoose.model('Participant', participantSchema);

app.use(cors());
app.use(express.json());

// 🔹 GET - Alle Events abrufen (filtert admin-only Events für normale Benutzer)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    
    // Für normale Anfragen: Admin-only Events filtern
    const filteredEvents = events.filter(event => !event.isAdminOnly);
    
    res.json(filteredEvents);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Events' });
  }
});

// 🔹 GET - Alle Events für Admin (inkl. admin-only)
app.get('/api/events/admin', async (req, res) => {
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

// 🔹 POST - Teilnahme bestätigen (NEU: Mit Name und Kategorie)
app.post('/api/events/:id/participate', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { participantName, participantCategory, participantCount, userId } = req.body;
    
    // Validierung
    if (!participantName || !participantCategory) {
      return res.status(400).json({ error: 'Name und Kategorie sind erforderlich' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });
    
    // Erstelle neuen Teilnehmer-Eintrag
    const participant = new Participant({
      eventId,
      userId,
      participantName,
      participantCategory,
      participantCount: parseInt(participantCount) || 1
    });
    await participant.save();
    
    res.json({ 
      message: 'Teilnahme erfolgreich bestätigt', 
      participation: participant 
    });
  } catch (error) {
    console.error('Teilnahme Fehler:', error);
    res.status(500).json({ error: 'Fehler bei der Teilnahme-Bestätigung' });
  }
});

// 🔹 GET - Detaillierte Teilnehmer-Statistik für Admin
app.get('/api/events/:id/participants', async (req, res) => {
  try {
    const eventId = req.params.id;
    const participants = await Participant.find({ eventId });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Teilnehmer' });
  }
});

// 🔹 GET - Komplette Statistik für alle Events
app.get('/api/statistics', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const statistics = [];

    for (const event of events) {
      const participants = await Participant.find({ eventId: event._id });
      
      // Zähle nach Kategorien
      const categoryCount = {};
      participants.forEach(part => {
        if (!categoryCount[part.participantCategory]) {
          categoryCount[part.participantCategory] = 0;
        }
        categoryCount[part.participantCategory] += part.participantCount;
      });

      statistics.push({
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          category: event.category,
          subCategory: event.subCategory
        },
        participants: participants,
        categoryCount: categoryCount,
        totalParticipants: participants.reduce((sum, part) => sum + part.participantCount, 0)
      });
    }

    res.json(statistics);
  } catch (error) {
    console.error('Statistik Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistik' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
