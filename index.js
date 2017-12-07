'use strict';

exports.CheckMTAStatus = (request, response) => {
  response.status(200).send('Check MTA Status!');
};

exports.event = (event, callback) => {
  callback();
};
