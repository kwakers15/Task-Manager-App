const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch(e => {
    //     res.status(400).send(e)
    // })
})

// Task GET all tasks 
// /tasks?completed=True
// /tasks?limit=10&skip=10
// /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}



    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
        // const tasks = await Task.find({ owner: req.user._id })
        // res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
    // Task.find({}).then(tasks => {
    //     res.send(tasks)
    // }).catch(e => {
    //     res.status(500).send()
    // })
})

// Task GET a single task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        if (e.name === 'CastError') {
            res.status(400).send('Invalid task ID')
        }
        res.status(500).send()
    }
})

// PATCH update task by ID
router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!' })
        return
    }

    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })


        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        if (!task) {
            res.status(404).send()
            return
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// DELETE a task by id
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
            return
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router