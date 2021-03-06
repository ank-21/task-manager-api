const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./Task')


//we are creating a seprate schema and a seprate model and this is going to allow us to take advantage of middleware

const userSchema = new mongoose.Schema({
    //set all the fields as properties and whose value will be an object. and in there we can configurwe validation, type 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique:true,  //to have an unique email id
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }  
    },
    password:{
        type: String,
        trim: true,
        required: true,
        //minlength: 7,
        validate(value){
            if(value.length<6 || value.toLowerCase() == "password"){
                throw new Error('Invalid Password')
            }
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{                        //array of objects
        token: {
            type: String,
            required: true             //it is generated by system
        }
    }],
    avatar: {
        type: Buffer      //as we dont want to put user img as file system. we will store img binary data
    }
},{
    timestamps:true  //If set timestamps, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date
})


//virtual property is not actual data stored in the database.It's a relationship between two entities.In this case between our user and our task 

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
//foreign field is the name of the field.in this case on the task that's going to create this relationship and
//we set that up to be the owner of the local field is that is where that local data is stored.
//So we have the owner object I.D. on the task and that is associated with the I.D. of the user here.
//So the local field the users I.D. is a relationship between that and the task owner field which is also a user I.D..

//toJSON will work on all routers as we dont cahnge to any specicific route.

userSchema.methods.toJSON = function() {          
    const user = this
    const userObject = user.toObject()        //to get a raw object

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//we have to write function if we dont want to make arrow fun
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign( { _id: user._id.toString() } , process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token

}


userSchema.statics.findByCredentials = async(email,password) => {
    const user = await User.findOne({email})

    if(!user){
        //throw new Error('Unable to login!')
        return res.status(400).send({error:'Unable to login!'})
    }


    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        //throw new Error('Unable to login')
        return res.status(400).send({error:'Unable to login!'})        //where does this msg is going?
    }
    return user
}


//now we use a method on userschema to set the middleware up. we use pre method and it accepts 2 args. 1st arg is name of the event and 2nd is the function to run
//2nd arg i.e the function needs to be a normal function not an arrow fun as this doesnt bind by arrow function 

//hash the plain text password

userSchema.pre('save', async function(next){
    //this means we wanna do smthng before user are saved
    const user = this

    //we hashed the password only if it is being modified
    if(user.isModified('password')){  //work in both update as well as create case
        user.password = await bcrypt.hash(user.password,8)
    }

    next()  //if we dont call next it will hang forever. we call next when we are done right here
})

//for deleting task for user which is deleted

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User