const express = require('express');
const router =  express.Router();
const { check, validationResult} = require('express-validator');

//@route    GET api/users
//@desc     Test route
// @access  Public
router.get('/', (req, res) => res.send('User register'));

module.exports = router;