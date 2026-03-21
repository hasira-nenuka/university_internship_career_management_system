import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tasks');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTasks(data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to fetch tasks. Make sure backend server is running on port 5000');
            setLoading(false);
        }
    };

    const handleTaskUpdate = async (id, updatedTask) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });
            const data = await response.json();
            setTasks(tasks.map(task => task._id === id ? data.data : task));
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    };

    const handleTaskDelete = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/tasks/${id}`, {
                method: 'DELETE',
            });
            setTasks(tasks.filter(task => task._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };

    if (loading) return <div className="loading">Loading tasks...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="task-list">
            <h2>Your Tasks ({tasks.length})</h2>
            {tasks.length === 0 ? (
                <p>No tasks yet. Add your first task!</p>
            ) : (
                tasks.map(task => (
                    <TaskItem
                        key={task._id}
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                    />
                ))
            )}
        </div>
    );
};

export default TaskList;