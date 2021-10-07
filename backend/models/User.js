const mongoose = require('mongoose')
const bcrpyt = require('bcryptjs')
//Schema

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
})

UserSchema.pre('save', async function(next){

    const salt = await bcrpyt.genSalt(10)
    this.password = await bcrpyt.hash(this.password, salt)
    next()
})

//verified password
UserSchema.methods.isPasswordMatch = async function(enteredPassword){
    return await bcrpyt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', UserSchema)

module.exports = User
