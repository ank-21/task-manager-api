const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    usefindAndModify: false
})

//definition of model

// const User = mongoose.model('User', {
//     //set all the fields as properties and whose value will be an object. and in there we can configurwe validation, type 
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     email:{
//         type: String,
//         required: true,
//         trim: true,
//         validate(value) {
//             if(!validator.isEmail(value)){
//                 throw new Error('Email is invalid')
//             }
//         }  
//     },
//     password:{
//         type: String,
//         trim: true,
//         required: true,
//         //minlength: 7,
//         validate(value){
//             if(value.length<6 || value.toLowerCase() == "password"){
//                 throw new Error('Invalid Password')
//             }
//         }
//     },
//     age:{
//         type: Number,
//         default:0,
//         validate(value){
//             if(value<0){
//                 throw new Error('Age must be a positive number')
//             }
//         }
//     }
// })

//creating instances to our model to actually add documents to our database
//creating user
// const me = new User({
//     name: '    Mike',
//     email: 'mike@gmail.com  ',
//     password: 'aswe2134'
// })

// //to save to the database

// me.save().then((/*we get access to model instances i.e me so we can leave this empty*/) => {
//     console.log(me)
// }).catch((error) => {
//     console.log(error)
// })

//for tasks model

// const Tasks = mongoose.model('Tasks' , {
//     description: {
//         type:String,
//         required: true,
//         trim:true
//     },
//     completed: {
//         type:Boolean,
//         default: false
//     }
// })

// const work = new Tasks({
//     description: 'Eat lunch',
//     // completed: false
// })

// work.save().then(()=>{
//     console.log(work)
// }).catch((e)=>{
//     console.log(e)
// })
