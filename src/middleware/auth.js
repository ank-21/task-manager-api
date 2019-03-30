const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')   //as without replace token has jwt 
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})          //as token is not in decode

        if(!user){
            throw new Error()
        }

        req.token = token                                
        req.user = user                      //as we have fetched it so why again anywhere
        next()
    }catch(e){
        res.status(401).send({error: 'Please authenticate.'})
    }
}
module.exports = auth

//Now the middleware function itself starts by looking for the header that the user is supposed to provide

//and then validates that header and it finds the associated user from there.

//One of two things happen either we call next.

//Letting the root handler run or if they're not authenticated we go ahead and send back an error letting

//them know that they're not able to perform the operation that they're trying to perform.

//for req.token

//Now inside of here what we want to have access to is the particular token that they used when authenticating.

//Remember if I have five different sessions where I'm logged in such as for my personal computer or my

//phone and my work computer and I log out of one I don't want to log out of everything.

//So I want to target these specific token that was used when they authenticated right here.