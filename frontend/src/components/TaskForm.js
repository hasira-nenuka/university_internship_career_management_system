import React, { useState } from 'react';

const TaskForm = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTask = {
            title,
            description,
            completed: false
        };

        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            });
            
            const data = await response.json();
            if (onTaskAdded) {
                onTaskAdded(data.data);
            }
            setTitle('');
            setDescription('');
            // Refresh the page to show new task
            window.location.reload();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Make sure backend is running!');
        }
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;