const { iot, mqtt } = require("aws-iot-device-sdk-v2");

const IOT_HOST = "PLACE-YOUR-IOT-HOST-URL-HERE";

const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
  .with_clean_session(true)
  .with_client_id("id")
  .with_endpoint(IOT_HOST)
  .with_custom_authorizer("", `authorizer`, "", "password")
  .with_keep_alive_seconds(1200)
  .build();
const client = new mqtt.MqttClient();
const connection = client.new_connection(config);

connection.on("connect", () => {
  console.log("connect");
});

connection.connect().catch(console.error);
