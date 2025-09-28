const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: '09:00'
  },
  category: {
    type: String,
    required: true  // Jetzt required wegen Haupt_Unterkategorie Format
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index für bessere Performance bei Datumsabfragen
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);