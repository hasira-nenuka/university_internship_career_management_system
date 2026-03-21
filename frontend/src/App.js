import React from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
    const handleTaskAdded = (newTask) => {
        console.log('New task added:', newTask);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>📝 Task Manager</h1>
                <p>Manage your tasks efficiently</p>
            </header>
            <main className="App-main">
                <TaskForm onTaskAdded={handleTaskAdded} />
                <TaskList />
            </main>
            <footer className="App-footer">
                <p>MERN Stack Application | Built with React, Node.js, Express & MongoDB</p>
            </footer>
        </div>
    );
}

export default App;