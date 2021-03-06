var mongoose = require('mongoose');

var subServiceSchema = mongoose.Schema({

    serviceName:{
        type:String,
        require:true,
        unique:true
    },
    serviceDuration:{
        type:String,
        default:"No Fix Time"
    },
    
    servicePrice:{
        type:String,
        require:true
    },
    serviceDescription:{
        type:String,
    },
    
    serviceImage:{
        type:String,
    },

    merchantId:{
        type:String,
    },
    serviceReviewsIds:{
        type:[String]
    },
    serviceFavoriteIds:{
        type:[String]
    },
    serviceRatings:{
        type:[String]
    },
    serviceUses:{
        type:Number,
        default:0
    }

});

var serviceSchema = mongoose.Schema({

    serviceName:{
        type:String,
        trim:true,
        require:true,
        unique:true
    },
    serviceImage:{
        type:String,
        require:true
    },
    subServiceList:[subServiceSchema]
});

module.exports = mongoose.model('Service',serviceSchema);