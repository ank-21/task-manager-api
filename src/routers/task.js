const express = require('express')
const Task = require('../models/Task')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/tasks', auth, async(req,res) => {
    const task = new Task({
        ...req.body,           //copy all the stuff from req.body but we also have to add owner property so we did like this.
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e) {
        res.status(400).send(e)
    }


    // work.save().then(() => {
    //     res.status(201).send(work)
    // }).catch((e)=>{
    //     res.status(400)
    //     res.send(e)
    // })
})

//GET/tasks?completed:true
//pagination - limit & skip
//query alwz give string whether we provide no. or boolean
//GET/tasks?limit=4&skip=4
//GET/tasks?sortBy=createdAt:desc
router.get('/tasks', auth ,  async(req,res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'  //coz query we are giving is a string and match.completed is a boolean
        //shorthand for ifelse even if second checking is false then also we get false boolean in match.completed
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')   //split the string given by client & store it in array of parts
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1
        //sort(createdAt) = desc or asc by ternary operator
    }

    try{
        //const tasks = await Task.find({owner: req.user._id, completed:false})
        //alternative
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),   //if there any limit provided by client then converting tht string value into no.
                skip: parseInt(req.query.skip),
                sort
                //createdAt : 1   //1 for asc and -1 for desc
                //completed: 1     //-1 for true first i.e desc
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e) {
        res.status(500).send(e)
    }

    // Task.find({}).then((tasks)=> {
    //     res.send(tasks)
    // }).catch((e)=> {
    //     res.status(500).send(e)
    // })
})
//for individual task

router.get('/tasks/:id', auth , async (req,res) => {
    const _id = req.params.id         //task id
    try{
        const task = await Task.findOne({_id, owner: req.user._id})    //another logged in cant access
        //const task = await Task.findById(_id)
        if(!task){
            return res.status(404).send({error: 'No such id of task'})
        }
        res.send(task)

    }catch(e){
        res.status(500).send(e)
    }
    // Task.findById(_id).then((task)=> {
    //     if(!task){
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e)=> {
    //     res.status(500).send()
    // })
})

//updates

router.patch('/tasks/:id', auth ,  async(req,res) => {
    const allowedUpdates = ['description','completed']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update)=> {
        return allowedUpdates.includes(update)
    }) 

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send({error:'no such id of task'})
        }

        updates.forEach((update)=> {
            task[update] = req.body[update]
        })
        await task.save()

        //const task = await Task.findByIdAndUpdate(_id,req.body, {new : true, runValidators : true})
        
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})
//delete

router.delete('/tasks/:id', auth, async(req,res)=> {
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if(!task){
            res.status(404).send({error:'no such task to delete' })
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router