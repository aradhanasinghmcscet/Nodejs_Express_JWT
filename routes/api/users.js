const express = require('express');
const router =  express.Router();
const gravatar= require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult} = require('express-validator');

const User = require('../../models/User');
//@route    POST api/register
//@desc     Test route
// @access  Public
router.post(
'/',
[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid Email').isEmail(),
    check('password', 'Please enter a password with 6 or more character')
    .isLength({ min: 6 })
],
 async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password}= req.body;
    try{
        let user = await User.findOne({email});
        if(user){
           return res.status(400).json({ errors: [{ msg:' User already exists'}]});
        }
        //console.log(req.body);

        //See if user Exists

        //Get users Gravatar
    const avatar = gravatar.url(email, {
     s:'200',
     r:'pg',
     d:'mm'
     });

    user = new User({
    name,
    email,
    avatar,
    password
     });
 //Encrypt the password using bcrypt
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password, salt);
await user.save();

 //Return jsonwebtoken
 const payload = {
     user:{
         id:user.id
     },
 };
 jwt.sign(
     payload,
     config.get('jwtSecret'),
     {expiresIn :360000},
     (err, token) =>{
         if(err) throw err;
         res.json({ token});
     }
     );
    //res.send('User Registered');
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
   
});

module.exports = router;