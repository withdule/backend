import express from "express";
import Tasks from "./tasks";
import couchDB from "../utils/database"
import verifyToken from "../utils/verifyToken";
import {Task, Tasklist} from "./interfaces";

const router = express.Router()
const tasksFactory = new Tasks(couchDB.db.use('tasks'), couchDB.db.use('tasklist'))


router.post('/', verifyToken, (req, res) => {
    const task = {
        content: req.body['content'],
        tasklist: req.body['tasklist'],
        updatedAt: new Date()
    } as Task
    const insertedTask = tasksFactory.add(task, req.body.user._id)
    res.status(201).json({
        'message': 'Task created',
        'code': 201,
        'data': insertedTask
    })
})


router.get('/', verifyToken, async (req, res) => {
    const tasks = await tasksFactory.getFilledTasklist(req.body.user._id)
    if (tasks) {
        res.status(200).json({
            'message': 'Tasks retrieved successfully',
            'code': 200,
            'data': tasks
        })
    } else {
        res.status(204).json({
            'message': 'No tasks found',
            'code': 204
        })
    }
})

router.post('/lists', verifyToken, async (req, res) => {
    const tasklist = {
        name: req.body['name'],
        updatedAt: new Date(),
        tasks: []
    } as Tasklist
    const insertedTasklist = tasksFactory.addTasklist(tasklist, req.body.user._id)
    res.status(201).json({
        'message': 'Tasklist created successfully',
        'code': 201,
        'data': insertedTasklist
    })
})

router.get('/lists', verifyToken, async (req, res) => {
    const userTasklist = await tasksFactory.getUserTasklist(req.body.user._id)
    if (userTasklist) {
        res.status(200).json({
            'message': 'Tasklist retrieved successfully',
            'code': 200,
            'data': userTasklist
        })
    } else {
        res.status(204).json({
            'message': 'No tasklist not found',
            'code': 204
        })
    }
})

router.get('/:id', verifyToken, async (req, res) => {
    const task = await tasksFactory.get(req.params.id, req.body.user._id)
    if (task) {
        res.status(200).json({
            'message': 'Task retrieved successfully',
            'code': 200,
            'data': task
        })
    } else {
        res.status(404).json({
            'message': 'Task not found',
            'code': 404
        })
    }
})


router.patch('/:id', verifyToken, async (req, res) => {
    const task = {
        content: req.body['content'],
        tasklist: req.body['tasklist'],
        checked: req.body['checked'],
        updatedAt: new Date()
    } as Task
    const newTask = await tasksFactory.update(req.params.id, task, req.body.user._id)
    if (newTask) {
        res.status(200).json({
            'message': 'Task modified successfully',
            'code': 200,
            'data': newTask
        })
    } else {
        res.status(404).json({
            'message': 'Task not found or error occurred.',
            'code': 404
        })
    }
})


router.delete('/:id', verifyToken, async (req, res) => {
    const taskDeleted = await tasksFactory.delete(req.params.id, req.body.user._id)
    if (taskDeleted) {
        res.status(200).json({
            'message': 'Task deleted successfully',
            'code': 200,
        })
    } else {
        res.status(404).json({
            'message': 'Task not found or error occurred.',
            'code': 404
        })
    }
})


export default router
