const express = require("express");
const router = express.Router();
const User =  require('../models/UserModel');

// Router Get '/'

router.get('/', (req, res)=>{
    User.getAll((error, users)=>{
        if(error){
            res.render('error', {message: 'Error retrieving users'});
            return;
        }
        res.render('home', {users: users});
    });
});

module.exports = router;