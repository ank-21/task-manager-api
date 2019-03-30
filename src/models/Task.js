const mongoose = require('mongoose')

//so we can take advantage of all of the things that we can only
//customize when we have an explicitly created schema such as our schema options where we enable the timestamps.
const taskSchema = mongoose.Schema({
        description: {
            type:String,
            required: true,
            trim:true
        },
        completed: {
            type:Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'        //same name which is gien to user model name inside mongoose.model
        }
},{
    timestamps: true
})

const Task = mongoose.model('Task' , taskSchema)

module.exports = Task