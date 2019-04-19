var express = require('express');
var router = express.Router();
let i = 20000;
var Device = require('../models/device')
const {
  connect
} = require('mqtt');
const {
  mqtt
} = require('../config/env');
const client = connect(
  mqtt.url,
  mqtt.options
);
// const async = require('async');
const debug = require('debug')('fuel-mon:index.js');

client.once('connect', () => {
  debug('MQTT client connected.');

  client.subscribe('#', (err, granted) => {
    if (err) return debug(err);
    debug(`Connected to ${granted[0].topic}`);
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/ping', function (req, res, next) {
  res.send('PONG');
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
  client.on('message', function (topic, message) {
    res.write(`data:${message}`)
  });
  req.on('close', () => {
    clearTimeout(timer);
  });
});
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});
router.get('/ping', function (req, res, next) {
  res.send('PONG');
});

router.get('/logs', function (req, res, nex) {
  Sensor.findOne({}, {
    logs: {
      $slice: -20
    }
  }).exec((err, result) => {
    if (err) return debug(err);
    res.render('table', {
      title: 'Raw Data',
      result: result
    });
  });
});
router.get('/update', (req, res, next) => {
  let query = req.query;
  query.time_stamp = new Date();

  client.publish(req.query.channel, JSON.stringify(query), err => {
    if (err) {
      debug(err);
      return res.status(500).send(err.message);
    }
    return res.status(204).send('OK');
  });
});

router.post('/new-device', (req, res, next) => {
  debug(req.body)
  var newDevice = new Device(req.body);
  newDevice.save((err, device) => {
    if (err) {
      debug(err);
      return res.send(err)
    }
    debug(device);
    return res.json(device)
  })
})

module.exports = router;
client.on('error', err => {
  console.error(err);
  debug(err);
});

client.on('message', function (topic, message) {
  debug('data arrived')
  Device.findOneAndUpdate({
    sId: topic
  }, {
    $push: {
      logs: {
        $position: 0,
        value: message
      }
    }
  }).exec((err, result) => {
    if (err) return debug(err);
    debug(`Successfully updated ${result.name}`)
  })
});