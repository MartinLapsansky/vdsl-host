import * as Paho from "paho-mqtt";


document.addEventListener("DOMContentLoaded", () => {
    const clientId = `example-client-${Date.now()}`;
    const mqttClient = new Paho.Client("openlab.kpi.fei.tuke.sk", 8883, clientId);

    function logMessage(message) {
        console.log(message);
        const elem = document.createElement("div");
        elem.textContent = message;
        document.getElementById("messages")?.appendChild(elem);
    }

    function onConnect() {
        logMessage("Connected to MQTT Broker");
        mqttClient.subscribe("example/test-client/web/messages", (err) => {
            if (err) {
                logMessage("Subscription error: " + err.message);
            } else {
                logMessage("Subscribed to: example/test-client/web/messages");
            }
        });

        // Publish a test message
        sendMessage("Hello World!", "example/test-client/web/messages");
    }

    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            logMessage("Connection lost: " + responseObject.errorMessage);
        }
    }

    function onMessageArrived(message) {
        logMessage(`Message arrived on topic ${message.topic}: ${message.payloadString}`);
    }

    function sendMessage(text, topic) {
        const message = new Paho.Message(text);
        message.destinationName = topic;
        mqttClient.send(message);
        logMessage("Sent message: " + text);
    }

    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    const willMessage = new Paho.Message(`${clientId} disconnected`);
    willMessage.destinationName = "example/test-client/web";

    mqttClient.connect({
        onSuccess: onConnect,
        willMessage: willMessage,
        reconnect: true,
    });

    // Function to publish light color
    window.publishLightColor = (color, duration = 3000) => {
        const message = JSON.stringify({ all: color, duration });
        sendMessage(message, "openlab/lights");
    };

    // Function to publish a light sequence
    window.publishLightSequence = (sequence, duration = 1000) => {
        sequence.forEach((color, index) => {
            setTimeout(() => {
                const message = JSON.stringify({
                    light: { [index + 1]: color },
                    duration,
                });
                sendMessage(message, "openlab/lights");
            }, index * duration);
        });
    };

    // Function to publish a URL to a specific screen
    window.publishURLToScreen = (screen, url) => {
        const topic = `openlab/screen/${screen}/url`;
        sendMessage(url, topic);
    };

    // Function to disconnect the client
    window.disconnectMQTTClient = () => {
        mqttClient.disconnect();
        logMessage("MQTT Client disconnected.");
    };
});
