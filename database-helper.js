"use strict";

const request = require("request");
const _ = require("lodash");
const Promise = require("bluebird");
const GeoCodingUtil = require('./geocoding-util');

const firebase = require('firebase-admin');
var serviceAccount = require('./keys/home-mta-status-firebase-adminsdk-key.json');
const dbTable = 'userstations';

var deviceId;

var userStations;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://home-mta-status.firebaseio.com'
});

var database = firebase.database();

const DBhelper = {
    getStationsById: function(appObj, resolve, reject) {
      console.log('*** DBhelper : getStationsById ***')

      deviceId = appObj.deviceId;

      let getUserStationsPromise = new Promise((resolve, reject) => {
        console.log('appObj.address = ' + appObj.address);
        console.log('appObj.deviceId = ' + deviceId);
        console.log('--------------------------------------------');
        GeoCodingUtil.getUserStations(appObj.address, resolve, reject);
      });
  
      getUserStationsPromise
        .then((stations) => {
          console.log('getUserStationsPromise : userStations = ' + stations);
          userStations = stations;
          DBhelper.putUserStation(deviceId, resolve, reject);
        })
        .catch((error) => {
          reject(error);
        })
    },

    checkUserRecord: function(deviceId, resolve, reject){
        console.log('DBhelper : checkUserRecord deviceId = ' + deviceId);

        database.ref('/' + dbTable + '/' + deviceId).once('value')
        .then(function(snapshot){
          console.log('DBhelper : checkUserRecord stations  = ' + JSON.stringify(snapshot.val()));
          resolve(snapshot.val());
        })
        .catch((error)=>{
          reject(error);
        })
    },

    putUserStation: function(deviceId, resolve, reject){
      
      database.ref('/' + dbTable + '/' + deviceId).set(userStations)
      .then((response) => {
        console.log('!!! DBhelper : putUserStation : deviceId = ' + deviceId);
        console.log('$$$ DBhelper : putUserStation : userStations = ' + userStations);
        resolve(userStations);
      })
      .catch((error) => {
        reject(error);
      });
    }
}

module.exports = DBhelper;