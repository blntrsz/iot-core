const { iot, mqtt } = require("aws-iot-device-sdk-v2");
const crypto = require("node:crypto");

const IOT_HOST = "your iot host";

const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
  .with_clean_session(true)
  .with_client_id(crypto.randomUUID())
  .with_endpoint(IOT_HOST)
  .with_custom_authorizer("", `authorizer`, "", "password")
  .with_keep_alive_seconds(1200)
  .build();
const client = new mqtt.MqttClient();
const connection = client.new_connection(config);

connection.on("connect", async () => {
  console.log("connect");
  await connection.subscribe("topic/#", mqtt.QoS.AtLeastOnce);
});

connection.on("message", (fullTopic, payload) => {
  console.log(fullTopic);
  const message = new TextDecoder("utf8").decode(new Uint8Array(payload));
  console.log(message);
});
connection.on("interrupt", console.error);
connection.on("error", console.error);
connection.on("resume", console.log);
connection.on("disconnect", console.error);

connection.connect().catch(console.error);
