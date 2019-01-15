const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const morgan = require('morgan')
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("image"));
app.use(express.static("proimage"));
app.use(morgan('dev'));
const port = 3000;
const ServiceModel = require('./Models/ServiceModel');
const mongoose = require('mongoose');
const URL = "mongodb://localhost:27017/bestspa";

mongoose.connect(URL).then((res) => {

    console.log(`database response ${res}`);
    try {
            new ServiceModel({
                serviceName: "MakeUp",
                serviceImage: "makeup.jpg"
            }).save();

            new ServiceModel({
                serviceName: "Hair Care",
                serviceImage: 'haircare.jpg'
            }).save();
    
            new ServiceModel({
                serviceName: "Massage",
                serviceImage: 'massage.jpg'
            }).save();
    
            new ServiceModel({
                serviceName: "Nail Care",
                serviceImage: 'nailcare.jpg'
            }).save();
    
            new ServiceModel({
                serviceName: "Skin Care",
                serviceImage: 'skincare.jpg'
            }).save();
    
            new ServiceModel({
                serviceName: "Waxing",
                serviceImage: 'waxing.jpg'
            }).save();

    } catch(error) {
        console.log('error',error);
    };

});


app.listen(port, (error) => {
    if (!error) {
        console.log(`connection response ${port}`);
    }
})

app.get("/",(req,res) => {
    res.send("its working");
})

require('./routs')(app);

module.exports = app;
