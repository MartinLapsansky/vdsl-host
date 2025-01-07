import mqtt from "mqtt";

const clientId = `example-client-${Date.now()}`;
const client = mqtt.connect("wss://openlab.kpi.fei.tuke.sk:8883", {
    protocol: "wss",
    port: 8883,
    clientId: clientId,
    reconnectPeriod: 5000,
    keepalive: 10,
    clean: true,

});

client.on("connect", () => {
    console.log("MQTT Client connected.");

    // Subscribe to a topic
    client.subscribe("example/test-client/nodejs/messages", (err) => {
        if (err) {
            console.error("Subscription error:", err.message);
        } else {
            console.log("Subscribed to topic: example/test-client/nodejs/messages");
        }
    });

    // Publish a test message
    client.publish("example/test-client/nodejs/messages", "Hello MQTT from Node.js!", (err) => {
        if (err) {
            console.error("Publish error:", err.message);
        } else {
            console.log("Message published successfully.");
        }
    });
});

client.on("message", (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

client.on("error", (err) => {
    console.error("MQTT Client error:", err.message);
});

client.on("close", () => {
    console.log("MQTT Client connection closed.");
});

export const publishLightColor = (color, duration = 3000) => {
    const message = JSON.stringify({ all: color, duration });
    client.publish("openlab/lights", message, (err) => {
        if (err) console.error("Failed to publish light color:", err.message);
        else console.log("Light color published:", message);
    });
};

export const publishLightSequence = (sequence, duration = 1000) => {
    sequence.forEach((color, index) => {
        setTimeout(() => {
            const message = JSON.stringify({
                light: { [index + 1]: color },
                duration,
            });
            client.publish("openlab/lights", message, (err) => {
                if (err) console.error("Failed to publish light sequence:", err.message);
                else console.log("Light sequence published:", message);
            });
        }, index * duration);
    });
};


export const publishURLToScreen = (screen, url) => {
    const topic = `openlab/screen/${screen}/url`;
    client.publish(topic, url, { qos: 1 }, (err) => {
        if (err) {
            console.error(`Failed to publish to ${topic}:`, err.message);
        } else {
            console.log(`Published URL to screen ${screen}: ${url}`);
        }
    });
};

export const disconnectMQTTClient = () => {
    client.end();
};


