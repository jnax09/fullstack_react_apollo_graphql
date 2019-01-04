import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        min: [4, "Username must be minimum 4 characters"]
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "Email address is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        min: [7, "Minimum length is 7"],
        max: [42, "Maximum length is 42"]
    },
    role: {
        type: String
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }]
})

//Hashing a password before saving it to the database
userSchema.pre("save", async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

//Validate password
userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//Generate Token
userSchema.methods.generateToken = async function (secret, expiresIn) {
    const user = this
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    }
    return await jwt.sign(payload, secret, {
        expiresIn
    })
}

//Static Methods
userSchema.statics.findByLogin = async login => {
    let user = await User.findOne({
        username: login
    })
    if (!user) {
        user = await user.findOne({
            email: login
        })
    }
    return user
}

const User = mongoose.model('User', userSchema)

export default User