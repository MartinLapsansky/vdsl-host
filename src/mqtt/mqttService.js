import * as Paho from "paho-mqtt";


const clientId = `example-client-${Date.now()}`;
const client = new Paho.Client("openlab.kpi.fei.tuke.sk", 443, clientId);

// Configure client options


// Connect to the MQTT broker
// client.connect(options);

// Callback for successful connection
function onConnect() {
    console.log("MQTT Client connected.");

    // Subscribe to a topic
    client.subscribe("example/test-client/nodejs/messages", (err) => {
        if (err) {
            console.error("Subscription error:", err.errorMessage);
        } else {
            console.log("Subscribed to topic: example/test-client/nodejs/messages");
        }
    });

    // Publish a test message
    const message = new Paho.Message("Hello MQTT from Paho!");
    message.destinationName = "example/test-client/nodejs/messages";
    client.send(message);
    console.log("Message published successfully.");
}

// Callback for failed connection
function onConnectFailure(err) {
    console.error("MQTT Client connection failed:", err.errorMessage);
}

// Callback for receiving messages
client.onMessageArrived = (message) => {
    console.log(`Received message on topic ${message.destinationName}: ${message.payloadString}`);
};

// Function to publish a light color
export const publishLightColor = (color, duration = 3000) => {
    const message = new Paho.Message(JSON.stringify({ all: color, duration }));
    message.destinationName = "openlab/lights";
    client.send(message);
    console.log("Light color published:", message.payloadString);
};

// Function to publish a light sequence
export const publishLightSequence = (sequence, duration = 1000) => {
    sequence.forEach((color, index) => {
        setTimeout(() => {
            const message = new Paho.Message(JSON.stringify({
                light: { [index + 1]: color },
                duration,
            }));
            message.destinationName = "openlab/lights";
            client.send(message);
            console.log("Light sequence published:", message.payloadString);
        }, index * duration);
    });
};

export const connectMQTTClient = (callback) => {
    const options = {
        useSSL: true,
        onSuccess: callback,
        onFailure: onConnectFailure,
        reconnect: true,
        // keepAliveInterval: 10,
        cleanSession: true,
    };
    client.connect(options);
};

// Function to publish a URL to a specific screen
export const publishURLToScreen = (screen, url) => {
    const topic = `openlab/screen/${screen}/url`;
    const message = new Paho.Message(url);
    message.destinationName = topic;
    client.send(message);
    console.log(`Published URL to screen ${screen}: ${url}`);
};

// Function to disconnect the MQTT client
export const disconnectMQTTClient = () => {
    client.disconnect();
    console.log("MQTT Client disconnected.");
};


