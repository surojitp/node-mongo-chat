var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userschema = new Schema({
    name: { type: String },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHERS'], default: 'MALE' },
    authToken: { type: String, default: '' },
    appType: { type: String, enum: ['IOS', 'ANDROID', 'BROWSER'], default: 'ANDROID' },
    deviceToken: { type: String, default: '' },
    socketId: { type: String, default: '' },
    online: { type: Number, enum: [0, 1], default: 0}

}, {
        timestamps: true
    });

module.exports = mongoose.model('User', userschema);