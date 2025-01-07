import React, { useEffect, useState } from 'react';
import './TaskList.css';
import 'react-toastify/dist/ReactToastify.css';
import { publishURLToScreen, disconnectMQTTClient, publishLightColor, publishLightSequence} from '../mqtt/mqttService';

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

    axios.defaults.baseURL = 'https://fc9d-147-232-157-84.ngrok-free.app';

    useEffect(() => {
        // Fetch tasks
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
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            });

        // Fetch final task
        axios.get('/api/escape-room/final-task', {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        })
            .then(response => {
                const finalTask = response.data;
                if (finalTask) {
                    setFinalTask(finalTask);
                    console.log('Fetched final task:', finalTask);
                }
            })
            .catch(error => {
                if (error.response) {
                    console.error('Error response:', error.response.data);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            });

    }, []);

    useEffect(() => {
        // Example: Publish your React app URL to screen 1 (2x2 display)
        publishURLToScreen(1, "https://martinlapsansky.github.io/vdsl-host/");
        return () => {
            disconnectMQTTClient();
        };
    }, []);

    /**************lights**************/

    const parseLightSequence = (sequence) => {
        // Remove extra characters and split into individual colors
        return sequence
            .replace(/lightSequence|["\\]/g, "") // Remove "lightSequence", quotes, and backslashes
            .trim()
            .split(" ") // Split into individual colors
            .map((color) => mapColorToRGBW(color.trim())); // Map to RGBW format
    };

    useEffect(() => {
        const currentTask = tasks[currentTaskIndex];
        if (currentTask && currentTask.type === "LIGHT_PUZZLE") {
            const lightSequenceRaw = currentTask.lightSequence[0]; // Extract raw sequence string
            const sequence = parseLightSequence(lightSequenceRaw); // Parse and map to RGBW
            publishLightSequence(sequence, 1000); // Publish the sequence with 1 second duration
        }
    }, [currentTaskIndex, tasks]);

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


    const mapColorToRGBW = (color) => {
        const colorMap = {
            purple: "80008000",
            green: "00FF0000",
            blue: "0000FF00",
            red: "FF000000",
            orange: "FF450000"
        };
        return colorMap[color.toLowerCase()] || "FFFFFF00"; // Default to white if color not found
    };

    const handleConfirmClick = () => {
        const currentTask = tasks[currentTaskIndex];
        console.log('Current Task:', currentTask);
        console.log('Provided Answer:', answer);

        if (currentTask && answer === currentTask.solution.answer) {
            alert('Correct! Proceeding to the next task...');
            const rgbwColor = mapColorToRGBW(currentTask.successColor);
            publishLightColor(rgbwColor, 3000);

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