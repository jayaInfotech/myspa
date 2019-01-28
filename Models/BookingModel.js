var mongoose = require('mongoose');

var bookingSchema = new mongoose.Schema({
    customerId : {
        type:String,
        required:true
    },
    serviceId:{
        type:String,
        required:true
    },
    merchantId:{
        type:String,
        required:true
    },
    bookingdate:{
        type:String,
        required:true
    },
    bookingtime:{
        type:String,
        required:true
    },
    visitType:{
        type:String,
        required:true
    },
    bookingstatus:{
        type:String,
        default:"NOT CONFIRMED"
    },
    completed:{
        type:Boolean,
        required:true,
        default:false
    },
    comment:{
        type:String
    },
    address:{
        type:[String],
    }
    // createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking",bookingSchema);