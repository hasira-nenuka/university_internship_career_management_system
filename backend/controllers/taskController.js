const mongoose = require('mongoose');
const Task = require('../models/Task');

const inMemoryTasks = [];

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const createInMemoryTask = ({ title, description, completed = false }) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    title: title.trim(),
    description: description.trim(),
    completed: Boolean(completed),
    createdAt: new Date()
});

const validateTaskPayload = ({ title, description }) => {
    if (!title || !title.trim()) {
        return 'Title is required';
    }

    if (!description || !description.trim()) {
        return 'Description is required';
    }

    return null;
};

// Get all tasks
exports.getTasks = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(200).json({ success: true, data: inMemoryTasks });
        }

        const tasks = await Task.find();
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a task
exports.createTask = async (req, res) => {
    try {
        const validationError = validateTaskPayload(req.body);

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        if (!isDatabaseConnected()) {
            const task = createInMemoryTask(req.body);
            inMemoryTasks.unshift(task);
            return res.status(201).json({ success: true, data: task });
        }

        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get single task
exports.getTask = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            const task = inMemoryTasks.find((item) => item._id === req.params.id);

            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            return res.status(200).json({ success: true, data: task });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            const taskIndex = inMemoryTasks.findIndex((item) => item._id === req.params.id);

            if (taskIndex === -1) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            const currentTask = inMemoryTasks[taskIndex];
            const nextTask = {
                ...currentTask,
                ...req.body,
                title: typeof req.body.title === 'string' ? req.body.title.trim() : currentTask.title,
                description: typeof req.body.description === 'string' ? req.body.description.trim() : currentTask.description
            };

            const validationError = validateTaskPayload(nextTask);

            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            inMemoryTasks[taskIndex] = nextTask;
            return res.status(200).json({ success: true, data: nextTask });
        }

        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            const taskIndex = inMemoryTasks.findIndex((item) => item._id === req.params.id);

            if (taskIndex === -1) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            inMemoryTasks.splice(taskIndex, 1);
            return res.status(200).json({ success: true, message: 'Task deleted successfully' });
        }

        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
