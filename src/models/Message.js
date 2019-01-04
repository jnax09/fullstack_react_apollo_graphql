import mongoose from 'mongoose'
const Schema = mongoose.Schema

const messageSchema = new Schema({
    text: {
        type: String,
        required: [true, "Type your Message"]
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Message = mongoose.model('Message', messageSchema)

export default Message