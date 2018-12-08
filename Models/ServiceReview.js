var mongoose = require('mongoose');

const serviceReviewsSchema = mongoose.Schema({
    userid:{
        type:String,
        require:true
    },
    reviews:{
        type:String,
        trim:true,
        require:true
    }
});

module.exports = mongoose.model("ServiceReviews",serviceReviewsSchema);