var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Device = new Schema({
    name: {
        type: String,
        required: true
    },
    sId: {
        type: String,
        unique: true,
        required: true
    },
    logs: [{
        value: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Device', Device)