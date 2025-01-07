import * as Paho from "paho-mqtt";

// Function to initialize the MQTT client
export function createMQTTClient() {
    const clientId = `example-client-${Date.now()}`;
    const mqttClient = new Paho.Client("openlab.kpi.fei.tuke.sk", 8883, clientId);

    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    // Will message to indicate client disconnected
    const willMessage = new Paho.Message(`${clientId} disconnected`);
    willMessage.destinationName = "example/test-client/web";

    mqttClient.connect({
        onSuccess: () => onConnect(mqttClient),
        willMessage: willMessage,
        reconnect: true,
    });

    return mqttClient;
}

// Function that runs on successful connection to the MQTT broker
function onConnect(mqttClient) {
    logMessage("Connected to MQTT Broker");
    mqttClient.subscribe("example/test-client/web/messages", (err) => {
        if (err) {
            logMessage("Subscription error: " + err.message);
        } else {
            logMessage("Subscribed to: example/test-client/web/messages");
        }
    });

    // Publish a test message
    sendMessage(mqttClient, "Hello World!", "example/test-client/web/messages");
}

// Function to log messages to the console and append them to a message container
function logMessage(message) {
    console.log(message);
    const elem = document.createElement("div");
    elem.textContent = message;
    document.getElementById("messages")?.appendChild(elem);
}

// Function to handle lost connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        logMessage("Connection lost: " + responseObject.errorMessage);
    }
}

// Function to handle incoming messages
function onMessageArrived(message) {
    logMessage(`Message arrived on topic ${message.topic}: ${message.payloadString}`);
}

// Function to send a message to a specific MQTT topic
export function sendMessage(mqttClient, text, topic) {
    const message = new Paho.Message(text);
    message.destinationName = topic;
    mqttClient.send(message);
    logMessage("Sent message: " + text);
}

// Function to publish a light sequence
export function publishLightSequence(mqttClient, sequence, duration = 1000) {
    sequence.forEach((color, index) => {
        setTimeout(() => {
            const message = JSON.stringify({
                light: { [index + 1]: color },
                duration,
            });
            sendMessage(mqttClient, message, "openlab/lights");
        }, index * duration);
    });
}

// Function to publish a URL to a specific screen
export function publishURLToScreen(mqttClient, screen, url) {
    const topic = `openlab/screen/${screen}/url`;
    sendMessage(mqttClient, url, topic);
}

// Function to disconnect the MQTT client
export function disconnectMQTTClient(mqttClient) {
    mqttClient.disconnect();
    logMessage("MQTT Client disconnected.");
}

export function publishLightColor(mqttClient, color, lightIndex) {
    const message = JSON.stringify({
        light: { [lightIndex]: color },
    });
    sendMessage(mqttClient, message, "openlab/lights");
}