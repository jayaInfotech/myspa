const UserModel = require('./Models/UserModel');
const ServiceModel = require('./Models/ServiceModel');
const SubServiceModel = require('./Models/SubServiceModel');
const Booking = require("./Models/BookingModel");
var path = require('path');
var size = 3;
var multer = require('multer');

function checkfiletype(file, cb) {
    console.log("myfile " + JSON.stringify(file));
    const filetypes = /jpg|jpeg|png/;
    console.log('extname ' + (path.extname(file.originalname).substring(1)));

    const extname = filetypes.test((path.extname(file.originalname).substring(1)).toLowerCase());

    if (extname) {
        return cb(null, true);

    } else {
        return cb("Error : file size must be image");
    }
}

module.exports = function (app) {

    app.post('/UserRegistration', (req, res) => {

        console.log("at User Registration");

        const user = new UserModel({
            ...req.body
        });

        user.save().then((item) => {
            res.status(200).json(item)
        }).catch((err) => {
            console.log(`error ${err}`)
            res.status(400).send(err);
        })

    });

    app.post('/UserLogin', (req, res) => {

        console.log("Calling UserLogin");

        UserModel.findOne({ email: req.query.email, password: req.query.password }, (err, docs) => {
            if (err == null && docs != null) {
                res.status(200).json(docs);
            } else {
                console.log(`error ${err}`)
                res.status(404).json(err);
            }
        })
    });

    app.get('/GetServices', (req, res) => {

        ServiceModel.find({}).then((items, error) => {

            if (error == null && items.length != 0) {
                res.status(200).json(items)
            } else {
                console.log(`error ${err}`)
                res.status(400).json({ res: 0 });
            }

        });
    });


    app.post('/GetServicePrivate', (req, res) => {

        // ServiceModel.find({},(error,category) => {

        //     category.forEach(element => {
        //         console.log(element.serviceName);
        //     });

        // });

        ServiceModel.find({"subServiceList.merchantId":req.query.userId}).then((services, error) => {

            if (error == null) {
                res.status(200).json(services)
            } else {
                console.log(`error ${error}`)
                res.status(400).json({ res: 0 });
            }

        });
    });

    app.post('/GetUser', (req, res) => {
        UserModel.findOne({ _id: req.query.userId },(err,user) => {
            if (user != null) {
                res.status(200).json(user);
            } else {
                console.log(`error ${err}`)
                res.status(400).json({ res: 0 });
            }
        });
    });

    app.post('/CreateService', (req, res) => {

        console.log('OnCreateSubService', req.body.serviceName);
        console.log('OnCreateSubService', req.query.body);

        const subService = new SubServiceModel({
            ...req.body
        });

        ServiceModel.findOne({serviceName:req.query.seviceCategoryId },(error,response) => {
            console.log('updateResponse',error);
            console.log('updateResponse',response);
            response.subServiceList.push(subService);
            response.save().then((service, err) => {
                console.log('added successfully');
                res.status(200).json(service) 
            });
        }).catch((err) => {
            console.log(`error ${err}`)
            res.status(400).send(err);
        })
    });


    app.post('/UpdateService', (req, res) => {

        console.log('OnUpdateService', req.query.seviceCategoryId);
        console.log('OnUpdateService', req.query.serviceId);

        const subService = new SubServiceModel({
            ...req.body
        });

        ServiceModel.update({serviceName:req.query.seviceCategoryId,subServiceList:{$elemMatch:{_id:req.query.serviceId}}},{$set:{"subServiceList.$":subService}},(error,subservice) => {
            console.log('updateservice error',error);
            if(!error)
            {
                res.status(200).json(subservice) 
            }else
            {
                res.status(400).send(error);
            }
            
        });
    });

    app.post("/GetAllUser",(req,res) => {
        UserModel.find({}).then((users,error) => {
            if(users.length > 0)
            {
                res.status(200).json(users);
            }else
            {
                res.status(400).json(error);
            }
        })
    })

    app.post('/DeleteService',(req,res) => {

        console.log('OnDeleteService', req.query.serviceCatId);
        console.log('OnDeleteService', req.query.serviceId);

        ServiceModel.update({_id:req.query.serviceCatId},{$pull:{subServiceList:{_id:req.query.serviceId}}},(error,response) => {
            console.log('delete service' ,error);
            if(!error)
            {
                console.log("success",response);
                res.status(200).send(response);
            }else
            {
                console.log(response);
                res.status(400).send(response);
                
            }
        })

    });

    app.post('/UpdateStaffUser', (req, res) => {

        UserModel.findOneAndUpdate({ _id: req.query.userId }, {$set:{ ...req.body }},{ new: true }, (err, response) => {
            console.log(response);
            if (response != null) {
                res.status(200).json(response);
            } else {
                console.log(`error ${err}`)
                res.status(400).json({ res: 0 });
            }
        });
    });


    app.post('/UploadImages', (req, res) => {

        console.log('calling UploadImages' + req.files);

        var mystorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './proimage/')
            },
            filename: function (req, file, cb) {
                console.log('exts ' + path.extname(file.originalname));
                cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
            }
        });

        var uploads = multer({
            storage: mystorage
            , fileFilter: function (req, file, cb) {
                checkfiletype(file, cb);
            },
            limits: { fileSize: size * 1028 * 1028 },
        }).array('upload');


        uploads(req, res, function (err) {
            if (err) {
                console.log("error occuring while uploading image" + err);
                if (err.code == "LIMIT_FILE_SIZE") {
                    res.status(413).json({
                        message: "file size must be less then " + size + " MB"
                    });
                } else {
                    res.status(400).json({
                        message: err
                    });
                }

            } else {

                UserModel.findOne({_id: req.query.userid }, (err, user) => {
                    console.log(user);
                    for (var i = 0; i < req.files.length; i++) {
                        
                        user.userImage.push(req.files[i].filename);
                    }

                    user.save().then((user, err) => {
                        res.status(200).json({
                            files: req.files
                        });
                    });
                });
            }
        });
    });

    app.post("/DeleteImage", (req, res) => {

        UserModel.findOne({ _id: req.query.userId }, (err, user) => {

            if (user.userImage.includes(req.query.imageName)) {
                user.userImage.pull(req.query.imageName);
                user.save().then((latestUser, err) => {
                    if (latestUser != null) {
                        res.status(200).json(latestUser);
                    } else {
                        console.log(`error ${err}`)
                        res.status(400).json({ res: 0 });
                    }
                });
            } else {
                console.log(`error ${err}`)
                res.status(400).json({ res: 0 });
            }

        });
    });

    app.post("/Booking",(req,res) => {

        booking = new Booking({
            ...req.body
        })

        booking.save().then((book,error) => {
            if(!error)
            {
                res.status(200).json(book);

            }else
            {
                res.status(400).json({ error });
            }
        }) 
    });

    app.post("/GetBooking",(req,res) => {

        Booking.find({customerId:req.query.userId}).then((bookings,error) => {
            if(!error)
            {
                res.status(200).json(bookings);

            }else
            {
                res.status(400).json({ error });
            }
        }) 
    });

    app.post("/GetMerchantBooking",(req,res) => {

        Booking.find({merchantId:req.query.merchantId}).then((bookings,error) => {
            if(!error)
            {
                res.status(200).json(bookings);

            }else
            {
                res.status(400).json({ error });
            }
        }) 
    });

    app.post("/CancelBooking",(req,res) => {

        Booking.remove({_id:req.query.bookingId},(error) => {
            if(!error)
            {
                res.status(200).json({"message":"Booking canceled successfully"});

            }else
            {
                res.status(400).json({ error });
            }
        });
    })

    app.post("/GetServiceById",(req,res) => {
        ServiceModel.find({"subServiceList._id":req.query.serviceId},(error,response) => {
            if(!error)
            {
                res.status(200).json(response);

            }else
            {
                res.status(400).json({ error });
            }
        });
    });

    app.post("/GetServiceAndUserById", (req,res) => {
        ServiceModel.findOne({"subServiceList._id":req.query.serviceId},(error,service) => {
            if(!error)
            {
                UserModel.findOne({ _id: req.query.userId },(err,user) => {
                    if (user != null) {
                        res.status(200).json({user,service});
                    } else {
                        console.log(`error ${err}`)
                        res.status(400).json({ res: 0 });
                    }
                });

            }else
            {
                res.status(400).json({ error });
            }
        });
    });

    
    app.post('/UpdateBooking', (req, res) => {

        Booking.findOneAndUpdate({ _id: req.body._id }, {$set:{ ...req.body }},{ new: true }, (err, response) => {
            console.log(response);
            if (response != null) {
                res.status(200).json(response);
            } else {
                console.log(`error ${err}`)
                res.status(400).json({ res: 0 });
            }
        });
    });

}