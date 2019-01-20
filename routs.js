const UserModel = require('./Models/UserModel');
const ServiceModel = require('./Models/ServiceModel');
const SubServiceModel = require('./Models/SubServiceModel');
const Booking = require("./Models/BookingModel");
var path = require('path');
var size = 3;
var multer = require('multer');
var fcmServerKey = "AAAA3BAdYhI:APA91bH623Lc-3E1jzi2ITXEPbdqwOxWU6P7N2AJ-24oceHnXvjSC1h6Nw8KDK42jcUunoyVCo-JgUuHeq_fzlv1-lCo-5OM7REntULSk8Snq0KxpGa65IuKPI8XCz2TS34-svWPkYs7"
var FCM = require('fcm-node');
var serverKey = fcmServerKey; //put your server key here
var fcm = new FCM(serverKey);
var Constant = require('./Utils/Constant');
const nodemailer = require("nodemailer");
var ip = require('ip');
var schedule = require('node-schedule');
var moment  = require('moment');

module.exports = function (app) {

    app.get("/test", (req, res) => {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: req.query.token,
            collapse_key: 'channel1',
            data: {  //you can send only notification or only data(or include both)
                my_key: Constant.APP_NAME,
                my_another_key: 'my another value'
            }
        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!" + err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    })

    app.post('/UserRegistration', (req, res) => {

        console.log("at User Registration");

        const user = new UserModel({
            ...req.body
        });

        user.save().then((item) => {
            res.status(200).json(item)
        }).catch((err) => {
            if (err.name == 'MongoError') {
                console.log(`error ${err.message}`)
                res.status(404).send(err.message);
                return;
            }
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
                console.log(`error ${error}`)
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

        ServiceModel.find({ "subServiceList.merchantId": req.query.userId }).then((services, error) => {

            if (error == null) {
                res.status(200).json(services)
            } else {
                console.log(`error ${error}`)
                res.status(400).json({ res: 0 });
            }

        });
    });

    app.post('/GetUser', (req, res) => {
        UserModel.findOne({ _id: req.query.userId }, (err, user) => {
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

        ServiceModel.findOne({ serviceName: req.query.seviceCategoryId }, (error, response) => {
            console.log('updateResponse', error);
            console.log('updateResponse', response);
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

        ServiceModel.update({ serviceName: req.query.seviceCategoryId, subServiceList: { $elemMatch: { _id: req.query.serviceId } } }, { $set: { "subServiceList.$": subService } }, (error, subservice) => {
            console.log('updateservice error', error);
            if (!error) {
                res.status(200).json(subservice)
            } else {
                res.status(400).send(error);
            }

        });
    });

    app.post("/GetAllUser", (req, res) => {
        UserModel.find({}).then((users, error) => {
            if (users.length > 0) {
                res.status(200).json(users);
            } else {
                res.status(400).json(error);
            }
        })
    })

    app.post('/DeleteService', (req, res) => {

        console.log('OnDeleteService', req.query.serviceCatId);
        console.log('OnDeleteService', req.query.serviceId);

        ServiceModel.update({ _id: req.query.serviceCatId }, { $pull: { subServiceList: { _id: req.query.serviceId } } }, (error, response) => {
            console.log('delete service', error);
            if (!error) {
                console.log("success", response);
                res.status(200).send(response);
            } else {
                console.log(response);
                res.status(400).send(response);

            }
        })

    });

    app.post('/UpdateStaffUser', (req, res) => {

        UserModel.findOneAndUpdate({ _id: req.query.userId }, { $set: { ...req.body } }, { new: true }, (err, response) => {
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


        function checkfiletype(file, cb) {
            console.log("myfile " + JSON.stringify(file));
            const filetypes = /jpg|jpeg|png/;
            console.log('extname ' + (path.extname(file.originalname).substring(1)));
        
            const extname = filetypes.test((path.extname(file.originalname).substring(1)).toLowerCase());
        
            if (extname) {
                return cb(null, true);
        
            } else {
                return cb("Error : file must be image");
            }
        }

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
                    res.send({
                        message: "file size must be less then " + size + " MB"
                    });
                }else if(err.code == "undefined")
                {
                    res.send({
                        message: "file must be jpg | png"
                    });   
                } else {
                    res.send({
                        message: err
                    });
                }

            } else {

                UserModel.findOne({ _id: req.query.userid }, (err, user) => {
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

    app.post("/Booking", (req, res) => {

        var date = new Date();
        console.log("now",date.getUTCHours()+" "+date.getUTCMinutes());
        date = date+3600;
        booking = new Booking({
            ...req.body,
            expireAt:moment().add(30, 'minutes')
        })

        booking.save().then((book, error) => {

            if (error == null && book != null) {
                UserModel.findOne({ _id: book.merchantId }, (err, user) => {

                    if (err == null && user != null) {
                        console.log(user);
                        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)

                            to: user.fcmToken,
                            collapse_key: 'channel1',
                            data: {  //you can send only notification or only data(or include both)
                                title: Constant.APP_NAME,
                                message: Constant.BOOKING_RECEIVED,
                                username: user.userName,
                                datetime: booking.bookingdate + " " + booking.bookingtime,
                                status: booking.bookingstatus,
                                image: user.userImage[0],
                                iscompleted: booking.completed,
                                visittype: booking.visitType,
                                bookingid: booking._id
                            }
                        };

                        fcm.send(message, function (err, response) {
                            if (err) {
                                res.status(400).json({ err });
                                console.log("Something has gone wrong!" + err);
                            } else {
                                console.log("Successfully sent with response: ", book);
                                res.status(200).json(book);
                            }
                        });
                    } else {
                        res.status(400).json({ err });
                    }
                });
            } else {
                res.status(400).json({ error });
            }
        })
    });

    app.post("/GetBooking", (req, res) => {

        Booking.find({ customerId: req.query.userId }).then((bookings, error) => {
            if (!error) {
                res.status(200).json(bookings);

            } else {
                res.status(400).json({ error });
            }
        })
    });

    app.post("/GetMerchantBooking", (req, res) => {

        Booking.find({ merchantId: req.query.merchantId }).then((bookings, error) => {
            if (error == null && bookings != null) {
                res.status(200).json(bookings);

            } else {
                res.status(400).json({ error });
            }
        })
    });

    app.post("/CancelBooking", (req, res) => {

        Booking.remove({ _id: req.query.bookingId }, (error) => {
            if (!error) {
                res.status(200).json({ "message": "Booking canceled successfully" });

            } else {
                res.status(400).json({ error });
            }
        });
    })

    app.post("/GetServiceById", (req, res) => {
        ServiceModel.find({ "subServiceList._id": req.query.serviceId }, (error, response) => {
            if (!error) {
                res.status(200).json(response);

            } else {
                res.status(400).json({ error });
            }
        });
    });

    app.post("/GetServiceAndUserById", (req, res) => {
        ServiceModel.findOne({ "subServiceList._id": req.query.serviceId }, (error, service) => {
            if (!error) {
                UserModel.findOne({ _id: req.query.userId }, (err, user) => {
                    if (user != null) {
                        res.status(200).json({ user, service });
                    } else {
                        console.log(`error ${err}`)
                        res.status(400).json({ res: 0 });
                    }
                });

            } else {
                res.status(400).json({ error });
            }
        });
    });


    app.post('/UpdateBooking', (req, res) => {

        Booking.findOneAndUpdate({ _id: req.body._id }, { $set: { ...req.body } }, { new: true }, (err, response) => {
            console.log(response);
            var findId, myTitle, myType;
            if (req.body.bookingstatus == Constant.CANCELED) {
                findId = response.merchantId;
                myTitle = Constant.BOOKING_CANCELED;
                myType = Constant.BUSINESS;

            } else if (req.body.bookingstatus == Constant.CONFIRMED) {
                findId = response.customerId;
                myTitle = Constant.BOOKING_CONFIRMED;
                myType = Constant.CUSTOMER;

            } else if (req.body.bookingstatus == Constant.DECLAINED) {
                findId = response.customerId;
                myTitle = Constant.BOOKING_DECLAINED;
                myType = Constant.CUSTOMER;
            }

            if (err == null && response != null) {
                UserModel.findOne({ _id: findId }, (err, user) => {

                    if (err == null && user != null) {
                        console.log(user);
                        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)

                            to: user.fcmToken,
                            collapse_key: 'channel1',
                            data: {  //you can send only notification or only data(or include both)
                                title: Constant.APP_NAME,
                                message: myTitle,
                                username: user.userName,
                                datetime: response.bookingdate + " " + response.bookingtime,
                                status: response.bookingstatus,
                                image: user.userImage[0],
                                iscompleted: response.completed,
                                visittype: response.visitType,
                                bookingid: response._id
                            }
                        };

                        fcm.send(message, function (err, respon) {
                            if (err) {
                                res.status(200).json(response);
                                console.log("Something has gone wrong!" + err);
                            } else {
                                console.log("Successfully sent with response: ", response);
                                res.status(200).json(response);
                            }
                        });
                    } else {
                        res.status(400).json({ err });
                    }
                });
            } else {
                res.status(400).json({ error });
            }
        });
    });

    app.post("/GoogleSignIn", (req, res) => {

        UserModel.findOne({ email: req.query.email, signupwith: req.query.signupwith }, (err, user) => {

            if (err == null && user != null) {
                console.log(`response ${user}`)
                res.status(200).json(user);

            } else {
                console.log(`error ${err}`)
                console.log(`error ${user}`)
                res.status(400).json(err);
            }
        });
    });

    app.post("/UpdateToken", (req, res) => {

        UserModel.findOneAndUpdate({ _id: req.query.userId }, { fcmToken: req.query.token }, { new: true }, (err, user) => {
            if (err == null && user != null) {
                res.status(200).json(user);
            } else {
                res.status(400).json(err);
            }
        });

    });

    app.post("/UpdateComment", (req, res) => {

        Booking.updateOne({ _id: req.query.bookingId }, { comment: "yes" }, { new: true }, (err, booking) => {

            if (err == null && booking != null) {
                res.status(200).json(booking);
            } else {
                res.status(400).json(err);
            }

        });
    });

    app.post("/ForgotPassword", (req, res) => {

        console.log(ip.address());

        UserModel.findOne({ email: req.query.email }, (err, user) => {

            console.log(user);
            console.log(err);

            if ((!err) && (user))  {
                console.log(user.signupwith);

                if (user.signupwith == "Email") {

                    let account = nodemailer.createTestAccount();

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        // host: "smtp.gmail.com",
                        // port: 465,
                        secure: true, // true for 465, false for other ports
                        service: 'Gmail',
                        auth: {
                            user: Constant.EMAIL_ID, // generated ethereal user
                            pass: Constant.EMAIL_PASSWORD // generated ethereal password
                        }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: Constant.EMAIL_ID, // sender address
                        to: "mrpaladiyagautam@gmail.com" , // user.email
                        subject: "Password Reset", // Subject line
                        text: ` `, // plain text body
                        html: `<div>
                        <div>
                        <div>
                        <a href="http://${ip.address()}/logo.png" target="_blank" rel="noopener" >
                         <img src=${Constant.LOGO_URL} /> 
                        </a>
                        </div>
                        </div>
                        <div>
                        <div>
                        <p>Hi gautam patel</p>
                        <p>Your new password is <strong> ${user.password} </strong></p>
                        <p>The password field is CASE sensitive. Please change your password after login to app from the Settings screen.</p>
                        <p>We just launched and we aim to be the world's largest Spa and Salon booking app!</p>
                        <p>Please recommend EasySpa to your friends.</p>
                        </div>
                        </div>
                        </div>` // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                            res.status(200).json("Something went wrong please try again ..");
                        } else {
                            console.log('Message sent: ' + info.response);
                            res.status(300).json({message: info.response });
                        };
                    });

                    // res.status(200).json(" password sended to your email address successfully");

                } else if (user.signupwith == "Facebook") {
                    res.status(200).json(`You had sign up with Facebook try to login with email ${user.email} using`);

                } else if (user.signupwith == "Google") {
                    res.status(200).json(`You had sign up with Google try to login with email ${user.email} using facebook`);

                }

            } else {

                res.status(300).json("No email id matched try again with correct email");

            }
        });

    });

    app.post("/ChangePassword",(req,res) => {

        UserModel.findOneAndUpdate({_id:req.query.userId},{password:req.query.password},{new:true},(err,user) => {
           
            if((!err)&& user)
            {
                res.status(200).json(user);

            }else
            {
                res.status(400);
            }

        })

    });

}