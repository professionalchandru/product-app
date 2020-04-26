const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');

//Import Joi Validation
const { registerValidation, loginValidation } = require('../validation');

//Import Schema models
const userModel = require('../models/usermodel.js');

//Routes 
router.get('/', (req, res) => {
    res.send('you are in user');
});

//new user register view
router.get('/register', (req, res, next) => {
    res.render('register');
})

// New user register
router.post('/register', async(req, res) => {
    //Generate hash password
    const salt = await bcrypt.genSalt(12)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const user = new userModel({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    //Validation applied here
    const validate = registerValidation(user.toObject());
    // console.log(validate.error)

    //Check existing user
    const userExist = await userModel.findOne({ email: req.body.email });
    if (userExist) {
        // console.log(userExist)
        return res.status(400).render('register', { error: 'User is already exist' });
    }

    if (validate.error == null) {
        try {
            const newUser = await user.save();
            // res.status(200).send(newUser);
            res.status(200).render('register', { success: newUser.email + ' is added sucessfully' })
        } catch (err) {
            if (err) {
                console.log(err)
                res.status(400).send(err);
            }
        }
    } else {
        console.log(validate.error.message);
        // res.status(400).send(validate.error.message);
        res.status(400).render('register', { error: validate.error.message });
    }
});

//Existing user login
router.post('/login', async(req, res) => {

    //Joi validation for user inputs
    const validate = loginValidation(req.body);

    if (validate.error == null) {
        //Find existing user
        const user = await userModel.findOne({ email: req.body.email });
        // if (!user) res.status(400).send("User doesn't exist");
        if (!user) {
            return res.render('login', { error: "User doesn't exist" });
        }
        //Check password
        const password = await bcrypt.compare(req.body.password, user.password);
        if (!password) {
            return res.render('login', { error: "Password Invalid" });
        }

        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '5h' });
        // let re = res.header('auth-token', token)        
        res.cookie('token', token, { maxAge: 3600 * 1000 });
        res.redirect('/api/products/search');
        res.end()
    } else {
        console.log(validate.error.message)
            // res.status(400).send(validate.error.message)
        res.status(400).render('login', { error: validate.error.message });
    }

});



module.exports = router;