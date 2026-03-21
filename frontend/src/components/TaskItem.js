import React, { useState } from 'react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description);

    const handleToggleComplete = () => {
        onUpdate(task._id, { ...task, completed: !task.completed });
    };

    const handleUpdate = () => {
        onUpdate(task._id, { ...task, title: editedTitle, description: editedDescription });
        setIsEditing(false);
    };

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''}`}>
            {isEditing ? (
                <div className="task-edit">
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Task title"
                    />
                    <input
                        type="text"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Task description"
                    />
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div className="task-content">
                    <div className="task-info">
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <small>Status: {task.completed ? '✅ Completed' : '⏳ Pending'}</small>
                        {task.createdAt && (
                            <small> | Created: {new Date(task.createdAt).toLocaleDateString()}</small>
                        )}
                    </div>
                    <div className="task-actions">
                        <button onClick={handleToggleComplete}>
                            {task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                        <button onClick={() => onDelete(task._id)}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskItem;