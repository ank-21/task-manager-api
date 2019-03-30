const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendByeEmail} = require('../emails/account')   //using destructing to grab object
const router = new express.Router()


//we have to change app.post to router.post and so on
router.post('/users',async(req,res)=> {
    // to see in terminal we use console.log
    //console.log(req.body)   //after sending data from postman on console.log we get data in terminal
    //now we can use this req to create a new user data. to get that done we have to make sure that mongoose  connects to the database and we need to access to our user model from inside of this file 
    //res.send('testing!')
    //creating instances to our model

    const user = new User(req.body)//as we have to put object there and req.body is an object itself.

    try{                          //as if await doesnt run then other line also doesn't run.
        const token = await user.generateAuthToken()
        await user.save()  
        sendWelcomeEmail(user.email,user.name)             //no use of await here no need to have this completed before res.status
        res.status(201).send({user,token})
    }catch(e) {
        res.status(400).send(e)
    }

    //try catch will be used as then catch

    // user.save().then(()=>{
    //     res.send(user)
    // }).catch((e)=> {
    //     res.status(400) //status method
    //     res.send(e)
        //res.status(400).send(e)

        //for using async-await we have to use await inside of the function
        //express doesnot use the return value from this function anywhere
      

    //})
})


router.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        //res.send({user : user.getPublicProfile(),token })  //if we dont want to call a function another method i.e. json
        res.send({user,token })
    }catch(e) {
        res.status(400).send({error:'unable to login!'})
    }
})

router.post('/users/logout', auth , async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth , async(req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//And the second argument is going to be the middleware function to run which in our case is off.

//So now when someone makes a get request to forward slash users it's first going to run our middleware

//then it'll go ahead and run the root handler.

//Now remember it's only ever going to run the root handler if the middleware calls that next function.

//So this is how we're going to get access to control how things are working

// router.get('/users',auth,async (req,res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     }catch(e) {
//         res.status(500).send(e)
//     }
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((e) => {
    //     res.status(500)//internal server error
    //     res.send(e)
    // })
//})

//The first thing we did is we set up a middleware function to run for this specific route to the route that we want to lock down with authentication.

//We passed the middleware function in as the second argument.

//And the root handler in as the third.

//Now the middleware function itself starts by looking for the header that the user is supposed to provide

//and then validates that header and it finds the associated user from there.

//One of two things happen either we call next.

//Letting the root handler run or if they're not authenticated we go ahead and send back an error letting

//them know that they're not able to perform the operation that they're trying to perform.

router.get('/users/me',auth,async (req,res) => {
    res.send(req.user)
})

//second get handler for user to allow us to fetch an individual data by id
//we have to give a dynamic path to app.get as the id keep on changing which is implemented by express which gives us access to somethiong called as route parametersthese are paerts of the url that are used to capture dynamic values 
//so essentially we are saying sm1 going to make a get request to /users/smthng


// router.get('/users/:id', async (req,res)=> {
//     //to access the dynamic value provided by route , it is accessed by request by using req.params(It contain all of the route parameters we are providing in this case it is an object with a single proiperty id and the value for id is whtever put inside the url ) 
//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id)
        
//         if(!user){
//             console.log('kjhsgvc')
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e) {
//         console.log('skdjhf')
//         res.status(500).send()
//     }



//     // User.findById(_id).then((user) => {
//     //     //this path even runs if no id i.e no user found. so we have to set some if cond.
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }

//     //     res.send(user)
//     // }).catch((e)=> {
//     //     res.status(500).send()
//     // })
// })

//for updating
//three cases are possible:
//update went well,update went poorly,there is no user to update with tht id i.e no user with tht id

//IMP is when user try to update with some property that does not exist or something tht client cant change
router.patch('/users/me', auth , async (req,res) => {

    //array of strings for allowed updates
    const allowedUpdates = ['name','email','age','password']

    //as req.body is an object with all of those updates but we want to have same string array
    const  updates = Object.keys(req.body)
    //to convert object into array we use Object.keys(req.body)
    //now we have to check every item of updates array matched in allowedUpdates array
    //we use every which like most of the array methods takes a callback as its only arg and this callback fun get called for every item in this array and this callback function gets called for every item in the array
    //so if its trying to update five properties this function gets called five time with those five different property name, even if a single time we get false every will return false

    const isValidOperation = updates.every((update)=> {
        return allowedUpdates.includes(update)
        //it will return true if it is included otherwise false
        //can also write like ((update) => allowedUpdates.includes(update))
    }) 

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
    try{
        //const user = await User.findByIdAndUpdate(_id, /* the object we want to update but as we want to update it by client*/ req.body, { new : true, runValidators: true})
        //3rd arg is option as what we want
        //small change for middleware
        //the actual update process the find by id & update method bypasses mongoose, it performs a direct operation on the database, thtsy we even had to set a special option for running the validators

        //more traditional mongoose way so tht middleware runs properly


        updates.forEach((update)=> {
            //each update run each time
            req.user[update] = req.body[update]
            //bracket notation in user[update] to access the property dynamically
        })

        await req.user.save()

        // if(!user){
        //     return res.status(404).send({error:'no such id of user'})
        // }
        res.send(req.user)
        
    }catch(e){
        //two thing can happen i.e.  we have an error for server rel issue and validation rel issue 
        res.status(400).send(e)   // in case we update it to something which is not valid
    }
})

//for delete

router.delete('/users/me',auth, async(req,res)=> {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send({error:'no such id of user'})
        // }
        //no use of above line as already authenticated

        await req.user.remove()
        sendByeEmail(req.user.email,req.user.name)
        res.send(req.user)
        //we also want to delete tasksof this user when user is removed . instead of writing it here we cn do middleware
    }catch(e){
        res.status(500).send(e)
    }
})



const upload = multer({
    limits: {
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload a picture'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth, upload.single('avatar'), async(req,res)=> {            //we are doing it alone as it is not accepting any json so we use it inside update and anywhere but its accepting form-data
    //req.user.avatar = req.file.buffer   - we now use sharp instead of this

    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()  //we modifying this
    req.user.avatar = buffer
    await req.user.save()
    res.send()                     
},(error,req,res,next)/* this will let express know any uncut errors*/ => {
    res.status(400).send({error:error.message})
})


router.delete('/users/me/avatar',auth,async(req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


router.get('/users/:id/avatar',async(req,res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        //response header for telling whether sending a jpeg img or png img
        //set up a response header by using the set method on the response object
        //two arg in res.set-- 1st- a key value pair name of response header we re tryying to set and the value we are trying to set
        res.set('Content-Type','image/png')
        res.send(user.avatar)

    }catch(e){
        res.status(400).send()
    }
})

module.exports = router