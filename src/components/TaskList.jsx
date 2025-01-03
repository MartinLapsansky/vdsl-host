import React, { useEffect, useState } from 'react';
import './TaskList.css';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import Confetti from 'react-confetti';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [finalTask, setFinalTask] = useState(null);
    const [successColors, setSuccessColors] = useState([]);
    const [showFinalTask, setShowFinalTask] = useState(false);
    const [finalAnswer, setFinalAnswer] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);

    axios.defaults.baseURL = 'https://30b9-78-99-33-3.ngrok-free.app';

    useEffect(() => {
        axios.get('/api/escape-room/tasks', {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        })
            .then(response => {
                const tasks = response.data;
                if (tasks.length > 0) {
                    setTasks(tasks);
                    console.log('Fetched tasks:', tasks);
                }
            })
            .catch(error => {
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    console.error('Error status:', error.response.status);
                    console.error('Error headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            });
    }, []);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                handleConfirmClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [answer, tasks, currentTaskIndex]);

    const handleInputChange = (value) => {
        setAnswer(value);
    };

    const handleFinalInputChange = (value) => {
        setFinalAnswer(value);
    };

    const handleHintClick = () => {
        setShowHint(true);
    };

    const handleConfirmClick = () => {
        const currentTask = tasks[currentTaskIndex];
        console.log('Current Task:', currentTask);
        console.log('Provided Answer:', answer);

        if (currentTask && answer === currentTask.solution.answer) {
            alert('Correct! Proceeding to the next task...');
            setSuccessColors(prevColors => {
                const newColors = [...prevColors, currentTask.successColor];
                if (currentTaskIndex + 1 >= tasks.length) {
                    setFinalTask(prevFinalTask => ({
                        ...prevFinalTask,
                        successColors: newColors
                    }));
                    setShowFinalTask(true);
                }
                return newColors;
            });
            setTimeout(() => {
                if (currentTaskIndex + 1 < tasks.length) {
                    setCurrentTaskIndex(prevIndex => prevIndex + 1);
                }
                setAnswer('');
                setShowHint(false);
            }, 500);
        } else {
            alert('Incorrect answer, please try again.');
            console.log('Incorrect answer provided.');
        }
    };

    const handleFinalConfirmClick = () => {
        const userColors = finalAnswer.split(',').map(color => color.trim());
        const isCorrect = finalTask.successColors.length === userColors.length &&
            finalTask.successColors.every((color, index) => color.toLowerCase() === userColors[index].toLowerCase());

        if (isCorrect) {
            setShowCelebration(true);
        } else {
            alert('Incorrect colors, please try again.');
        }
    };

    if (tasks.length === 0) {
        return <div>Loading...</div>;
    }

    const currentTask = currentTaskIndex < tasks.length ? tasks[currentTaskIndex] : finalTask;

    return (
        <div className="task-list">
            <div className="room-header">
                <h1>Welcome to Escape Room!</h1>
                <h2>Solve the following tasks...</h2>
            </div>
            {showCelebration ? (
                <div className="celebration">
                    <Confetti />
                    <h2>Great job. You finally escaped the room :)</h2>
                </div>
            ) : showFinalTask ? (
                <div key={finalTask.id} className="task">
                    <div className="task-container">
                        <h2>{finalTask.name}</h2>
                        <p>{finalTask.description}</p>
                        <p><strong>Success Colors:</strong> {finalTask.successColors.join(', ')}</p>
                        <input
                            type="text"
                            value={finalAnswer}
                            onChange={(e) => handleFinalInputChange(e.target.value)}
                            placeholder="Enter the colors separated by commas"
                        />
                        <button className="confirm" onClick={handleFinalConfirmClick}>Confirm</button>
                    </div>
                </div>
            ) : (
                <div key={currentTask.id} className="task">
                    <div className="task-container">
                        <h2>{currentTask.name}</h2>
                        <p>{currentTask.description}</p>
                        {showHint && <p><strong>Hint:</strong> {currentTask.hint}</p>}
                        <p><strong>Details:</strong> {currentTask.taskDetails}</p>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Enter your answer"
                        />
                        <div className="buttons">
                            <button className="confirm" onClick={handleConfirmClick}>Confirm</button>
                            <button className="hint" onClick={handleHintClick}>Hint</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default TaskList;