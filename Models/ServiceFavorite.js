var mongoose = require('mongoose');

const serviceFavoriteSchema = mongoose.Schema({
    userid:{
        type:String,
        require:true
    },
    
});

module.exports = mongoose.model("ServiceFavorites",serviceFavoriteSchema);