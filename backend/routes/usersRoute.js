const express = require('express')
const asyncHandler = require('express-async-handler')
const authMiddleware = require('../middlewares/authMiddleware')
const User = require('../models/User');
const generateToken = require('../utils/generateToken')

const usersRoute = express.Router()


//Register
usersRoute.post(
    '/register', 
    asyncHandler( async (req, res) => {
        const {name, email, password} = req.body

        const userExists = await User.findOne({email: email})
        if (userExists) {
            throw new Error('User Exits')
        }
        const userCreated = await User.create({email, name, password})
        res.json({
            _id: userCreated._id,
            name: userCreated.name,
            password: userCreated.password,
            email: userCreated.email,
            token: generateToken(userCreated._id),
        })
    })
)

//Login
usersRoute.post(
    '/login', 
    asyncHandler( async (req, res) => {
        const {email, password} = req.body

        const user = await User.findOne({email})
        if(user && (await user.isPasswordMatch(password))) {
            //set status code
            res.status(200)

            res.json({
                _id: user._id,
                name: user.name,
                password: user.password,
                email: user.email,
                token: generateToken(user._id),
            })
        }else {
            res.status(401)
            throw new Error('Invalid credentials')
        }
    })

)

//Update user
usersRoute.put(
    '/update',
    authMiddleware,
    asyncHandler(async (req, res) => {
        //Find the login user by ID
        const user = await User.findById(req.user._id);
    
        if (user) {
          user.name = req.body.name || user.name;
          user.email = req.body.email || user.email;
          if (req.body.password) {
            user.password = req.body.password || user.password;
          }
    
          const updatedUser = await user.save();
    
          res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            token: generateToken(updatedUser._id),
          });
        }
    })
)

//Delete user
usersRoute.delete('/:id', (req, res) => {
    res.send('Delete route')
})


//Fetch users
usersRoute.get(
    '/',
    authMiddleware,
    asyncHandler (async (req, res) => {
        const users = await User.find({});
    
        if (users) {
          res.status(200).json(users);
        } else {
          res.status(500);
    
          throw new Error('No users found at the moment');
        }
    }) 
)

module.exports = usersRoute