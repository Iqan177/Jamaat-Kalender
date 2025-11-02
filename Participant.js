const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  khuddamCount: { type: Number, default: 0 },
  ansarCount: { type: Number, default: 0 },
  atfalCount: { type: Number, default: 0 },
  lajnaCount: { type: Number, default: 0 },
  nasiratCount: { type: Number, default: 0 },
  kinderCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Participant', participantSchema);
