const express = require('express');
const router = express.Router();
const gravatar= require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult} = require('express-validator');

//@route    GET api/auth
//@desc     Test route
// @access  Public
router.get('/',auth, async (req, res) =>{
    res.send('Auth route')
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error!')
    }
}
);




//@route    GET api/auth
//@desc     Authentication
// @access  Public
router.post('/',
[
    check('email', 'Please enter a valid Email')
    .isEmail(),
    check('password', 'Password is required')
    .exists()
],
 async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email, password}= req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            res.status(400).json({ errors: [{ msg:'Invalid Email'}] });
        }
        //console.log(req.body);

        //See if user Exists
const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch){
    res.status(400).json({ errors: [{ msg:'Invalid Password'}] });
}

 //Return jsonwebtoken
 const payload = {
     user:{
         id:user.id
     }
 }
 jwt.sign(
     payload,
     config.get('jwtSecret'),
     {expiresIn :360000},
     (err, token) =>{
         if(err) throw err;
         res.json({ token});
     }
     );
    
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
   
});


module.exports = router;