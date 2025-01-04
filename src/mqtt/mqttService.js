import mqtt from "mqtt";

const client = mqtt.connect("wss://openlab.kpi.fei.tuke.sk", {
    protocol: "wss",
    port: 1883,
    clientId: `mqtt-client-${Date.now()}`,
    keepalive: 10,
    reconnectPeriod: 5000,
    clean: true,
});

client.on("connect", () => {
    console.log("MQTT connected.");
});

client.on("error", (err) => {
    console.error("MQTT error:", err.message);
});

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


