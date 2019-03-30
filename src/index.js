const express = require('express')
require('./db/mongoose')    //we simply want to load our file

const app = express()
const port = process.env.PORT

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

//to automatically parse the incoming json for us. we do that by setting up an call to app.use
app.use(express.json())   //it will parse the json automatically for us so tht we can acces it in our request handler
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=> {
    console.log('Server is up on port : '+port)
})


