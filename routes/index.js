var express = require('express');
var router = express.Router();
let i = 20000;
const moment = require('moment');
const {
  connect
} = require('mqtt')
const {
  mqtt
} = require('../config/env');
const client = connect(
  mqtt.url,
  mqtt.options
);
const async = require('async');
const Sensor = require('../models/sensor');
const debug = require('debug')('fuel-mon:index.js');

client.once('connect', () => {
  debug('MQTT client connected.');

  client.subscribe(mqtt.channel, (err, granted) => {
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
        /*  if (topic.toString() == 'errors') {
      return debug(topic);
    }
    let jSage;
    try {
      jSage = JSON.parse(message);
    } catch (error) {
      return debug(error.message);
    }
    let device_serial_number = jSage._srn;
    let devBuf = Buffer.from(device_serial_number, 'base64');
    let deviceHash;
    waterfall(
      [
        cb => {
          try {
            deviceHash = hash(devBuf).toString('base64');
          } catch (error) {
            debug(error);
            return cb(error);
          }
          Devices.findOneAndUpdate({
              serial_no: deviceHash
            }, {
              $set: {
                'status.last_online': new Date()
              }
            },
            function (err, device) {
              if (err) return cb(err);
              cb(null, true);
            }
          );
        },
        (pstat, cb) => {
          Farm.findByIdAndUpdate(topic, {
            $push: {
              log: {
                $each: [{
                  humidity: jSage.humidity,
                  temperature: jSage.temperature,
                  moisture: jSage.moisture
                }]
              }
            }
          }).exec(err => {
            if (err) {
              return cb(err);
            }
            return cb(null, true);
          });
        }
      ],
      (err, result) => {
        if (err) return debug('error updating device');
        debug(`Successfully updated: ${topic}`);
      }
    );
  });

  client.on('error', function (err) {
    debug(err);
  });

  req.on('close', () => {
    clearTimeout(timer);
  }); */
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
          return res.status(204).send('OK')
        });
      });



      module.exports = router;
      client.on('error', err => {
        console.error(err);
        debug(err);
      });