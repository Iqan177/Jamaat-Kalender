const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Alle Events abrufen
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Neues Event erstellen
router.post('/', async (req, res) => {
  try {
    const { title, description, date, time, category, createdBy } = req.body;
    
    const event = new Event({
      title,
      description,
      date: new Date(date),
      time,
      category,
      createdBy
    });
    
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Event aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Event löschen
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event gelöscht' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;