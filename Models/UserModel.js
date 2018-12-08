var mongoose = require('mongoose');
var merchantSchema = mongoose.Schema({
    businessname:{
        type:String,
        require:true
    },
    websitelink:{
        type:String,
    },
    facebooklink:{
        type:String
    },
    description:{
        type:String
    },
    timeid:String,
    rating:{
        type:[Number],
        default:0
    },
    canVisit:{
        type:Boolean
    },
    canGo:{
        type:Boolean
    },
});
var validator = require('validator');

var userSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
       },
    password: {
        type: String,
        required: true,
        trim:true
    },
    phone:{
        type:String,
        default:null
    },
    address:{
        type:String,
        trim:true,
        default:null
    },
    latLong:{
        type:[String],
        required:true
    },
    country:{
        type:String,
        default:null
    },
    userTypes:{
        type:String,
        require:true,
        trim:true
    },
    userImage:[String],
    birthdate:{
        type:Date,
        default:null
    },
    favoriteList:[String],
    merchant:merchantSchema,
    signupwith:{
        type:String,
        required:true,
    }
},{strict: false});

module.exports = mongoose.model('User', userSchema);