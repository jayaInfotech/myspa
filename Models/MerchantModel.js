
var mongoose = require('mongoose');

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
var merchantSchema = mongoose.Schema({
    businessName:{
        type:String,
        require:true
    },
    websiteLink:{
        type:String,
    },
    facebookLink:{
        type:String
    },
    description:{
        type:String
    },
    canVisit:{
        type:Boolean,
        require:true,
    },
    canGo:{
        type:Boolean,
        require:true,
    },
    time:timeSchema
});

module.exports = mongoose.model("Merchants",merchantSchema);