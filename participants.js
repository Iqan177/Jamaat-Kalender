const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');

// 🔄 Rückmeldung für Event speichern
router.post('/events/:eventId/participate', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, khuddamCount, ansarCount, atfalCount, lajnaCount, nasiratCount, kinderCount, totalCount } = req.body;

    console.log('📥 Empfange Rückmeldung für Event:', eventId);
    console.log('👤 User:', userId);
    console.log('📊 Daten:', req.body);

    // Prüfen ob bereits Rückmeldung existiert
    const existingParticipation = await Participant.findOne({ eventId, userId });
    if (existingParticipation) {
      return res.status(400).json({ error: 'Sie haben bereits eine Rückmeldung für dieses Event gegeben' });
    }

    const participant = new Participant({
      eventId,
      userId,
      khuddamCount: khuddamCount || 0,
      ansarCount: ansarCount || 0,
      atfalCount: atfalCount || 0,
      lajnaCount: lajnaCount || 0,
      nasiratCount: nasiratCount || 0,
      kinderCount: kinderCount || 0,
      totalCount: totalCount || 0
    });

    await participant.save();
    console.log('✅ Rückmeldung gespeichert:', participant);
    
    res.status(201).json({ 
      message: 'Rückmeldung erfolgreich gespeichert', 
      participant 
    });
  } catch (error) {
    console.error('❌ Error saving participation:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// 📊 Teilnehmer für Event abrufen
router.get('/events/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('📋 Lade Teilnehmer für Event:', eventId);
    
    const participants = await Participant.find({ eventId });
    console.log('✅ Gefundene Teilnehmer:', participants.length);
    
    res.json(participants);
  } catch (error) {
    console.error('❌ Error fetching participants:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;
