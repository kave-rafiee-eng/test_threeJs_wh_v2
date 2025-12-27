// renderer.js (NodeIntegration=true)
import Paho from 'paho-mqtt'  

//import { safeJSONParse  } from './fun.js'

const client = new Paho.Client("127.0.0.1", 9001, "clientId-" + Math.random());

client.onConnectionLost = (responseObject) => {
  console.log("Connection lost:", responseObject.errorMessage);
};

let arrivedCallback = null;

export function setOnMessageArrived(cb) {
  arrivedCallback = cb;
}

client.onMessageArrived = (message) => {
  console.log(
    "Received message:",
    message.destinationName,
    message.payloadString
  );

  /*const result = safeJSONParse(message.payloadString);

  if (result !== null) {

    if (typeof arrivedCallback === 'function') {
      arrivedCallback({
        topic: message.destinationName,
        payload: result,
        raw: message
      });
    }
  }*/
};

/*
import { setOnMessageArrived } from './mqtt.js';
setOnMessageArrived(({ topic, payload }) => {
  console.log('Callback from outside:', topic, payload);
  table_orders();
});*/

export function publish(topic, message) {
  const msg = new Paho.Message(message)
  msg.destinationName = topic
  client.send(msg)
}

client.connect({
  onSuccess: () => {

    let SUB = "IPS_SERVER";
    console.log("Connected!");
    client.subscribe(SUB); 
    console.log(`subscribe To ${SUB} `);

    /*const message = new Paho.Message("Hello from Electron!");
    message.destinationName = "test/topic";
    client.send(message); */
  }
});