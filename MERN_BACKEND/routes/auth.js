const express = require('express');
const router = express.Router();
const User =require('../models/User');
const { body,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt =require('jsonwebtoken');
const JWT_SECRET = 'ShubhamIsGoodBoy'
var fetchuser =require('../middleware/fetchuser');


//ROUTE 1: Create a user using POST "/api/auth/createuser"  no login required
router.post('/createuser',[
    body('name','enter the correct name').isLength({ min: 3}),
    body('email','enter the correct Email').isEmail(),
    body('password','password length min 5').isLength({ min: 5}),
], async (req,res)=>{

    let success = false;

    //If there are error , return Bad request and the error
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({success , errors: errors.array()});
}

// Check whether the user with this email exits already

// let user = await User.findone({email: req.body.email});
try {
let user = await User.findOne({ email: req.body.email })
console.log(user)
if(user){
    return res.status(400).json({success,error: "sorry a user with this email already exit"})
}

const salt = await bcrypt.genSalt(10);
const secPass = await bcrypt.hash(req.body.password,salt);

//Create new user
 user = await User.create({
    name: req.body.name,
    password: secPass,
    email: req.body.email,
})


// .then(user=>res.json(user))
// .catch(err=> {console.log(err)
// res.json({error: 'please enter a unique email'})})


// res.send(req.body);

const data = {
user:{
    id: user.id
}
}

const authtoken = jwt.sign(data, JWT_SECRET);
console.log(jwtData);
// res.json(user)
success = true;
res.json({success , authtoken})
}catch(error){
    console.error(error.message);
    res.status(500).send("some error occured")
}
})

//ROUTE 2: Authenticate a user using POST "/api/auth/login"  no login required
router.post('/login',[
    // body('name','enter the correct name').isLength({ min: 3}),
    body('email','enter the correct Email').isEmail(),
    body('password','Password cannot be blanck').exists(),
    // body('password','password length min 5').isLength({ min: 5}),
], async (req,res)=>{

    let success = false


      //If there are error , return Bad request and the error
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
}

const {email,password} = req.body;
try{
let user = await User.findOne({email});
if(!user){
    success = false
    return res.status(400).json({error: "Please try to log in with correct credentials"});
}
const passwordCompare = await bcrypt.compare(password,user.password);

if(!passwordCompare){
    success = false
    return res.status(400).json({success,error: "Please try to login with correct credentials"});
}

const data ={
    user:{
        id: user.id
    }
}

const authtoken = jwt.sign(data, JWT_SECRET);
success = true;
res.json({success,authtoken})

}catch (error){
console.error(error.message);
res.status(500).send("Internal server error")
}


});

//ROUTE 3: gET LOGIN DETAILE USING POST "/api/auth/getuser"  login require

router.post('/getuser',fetchuser ,async (req,res)=>{

try{
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
}catch(error){
    console.error(error.message);
    res.status(500).send("Inter server error");
}})

module.exports = router