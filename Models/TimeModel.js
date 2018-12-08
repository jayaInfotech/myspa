const mongoose = require('mongoose');

const timeSchema = mongoose.Schema({
    monfrom:Date,
    monto:Date,
    tuefrom:Date,
    tueto:Date,
    wedfrom:Date,
    wedto:Date,
    thufrom:Date,
    thuto:Date,
    frifrom:Date,
    frito:Date,
    satfrom:Date,
    satto:Date,
    sunfrom:Date,
    sunto:Date,
    
})

module.exports = mongoose.model('Times',timeSchema)