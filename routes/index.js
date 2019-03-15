var express = require('express');
var router = express.Router();
const { mqtt } = require('../config/env');
const client = connect(
  mqtt.url,
  mqtt.options
);
const Sensor = require('../models/sensor');
const debug = require('debug')('lpg:index.js');
client.once('connect', () => {
  debug('MQTT client connected.');
  client.subscribe(mqtt.channel, (err, granted) => {
    if (err) return debug(err);
    debug(`Connected to ${granted[0].topic}`);
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/stream', (req, res) => {
  req.socket.setTimeout(Number.MAX_SAFE_INTEGER);
  // req.socket.setTimeout((i *= 6));

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.write('\n');

  var timer = setInterval(() => {
    res.write(':' + '\n');
  }, 18000);

  // When the data arrives, send it in the form
  client.on('message', (topic, message) => {
    // if (topic == process.env.MQTT_CHANNEL)
    res.write('data:' + message + '\n\n');
  });

  req.on('close', () => {
    clearTimeout(timer);
  });
});


module.exports = router;
client.on('error', err => {
  console.error(err);
  debug(err);
});
