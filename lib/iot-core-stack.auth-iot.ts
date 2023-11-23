export async function handler(evt: any) {
  const tokens = Buffer.from(evt.protocolData.mqtt.password, "base64")
    .toString()
    .split(";");

  if (tokens[0] !== "password") {
    throw new Error("Forbidden");
  }

  const policy = {
    isAuthenticated: true, //A Boolean that determines whether client can connect.
    principalId: Date.now().toString(), //A string that identifies the connection in logs.
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: `arn:aws:iot:${process.env.REGION}:${process.env.ACCOUNT}:topic/*`,
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: `arn:aws:iot:${process.env.REGION}:${process.env.ACCOUNT}:topicfilter/*`,
          },
        ],
      },
    ],
  };
  return policy;
}
