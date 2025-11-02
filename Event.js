const mongoose = require('mongoose');  // 🔥 DIESE ZEILE FEHLT!

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
    startTime: {
        type: String,
        default: '19:00'
    },
    endTime: {
        type: String, 
        default: '21:00'
    },
    location: {
        type: String,
        default: 'Freiburg Moschee'
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    isAdminOnly: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: String,
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index für bessere Performance bei Datumsabfragen
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
module.exports = mongoose.model('Event', eventSchema);

