const url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL);
const mqtt_auth = (mqtt_url.auth || ':').split(':');

module.exports = {
  database: {
    url: process.env.MONGODB_URI
  },
  mqtt: {
    url: mqtt_url,
    // channel: process.env.MQTT_CHANNEL,
    options: {
      port: mqtt_url.port,
      host: mqtt_url.host,
      username: mqtt_auth[0],
      password: mqtt_auth[1],
      keepalive: 60,
      reconnectPeriod: 1000,
      protocolId: 'MQIsdp',
      protocolVersion: 3,
      clean: true,
      encoding: 'utf8'
    }
  }
};