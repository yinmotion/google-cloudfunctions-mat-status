"use strict";

const _ = require("lodash");
const Promise = require("bluebird");

const firebase = require('firebase-admin');
var serviceAccount = require('./keys/home-mta-status-firebase-adminsdk-key.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://home-mta-status.firebaseio.com'
});

var database = firebase.database();

const DBhelper = {
    getUserStationById: function(userId, resolve, reject) {

    },

    checkUserRecord: function(userId, resolve, reject){
        console.log('DBhelper : checkUserRecord userId = ' + userId);

        database.ref('/userstations/' + userId).once('value')
        .then(function(snapshot){
          console.log('DBhelper : checkUserRecord stations  = ' + JSON.stringify(snapshot.val()));
          resolve(snapshot.val());
        })
        .catch((error)=>{
          reject(error);
        })
    }
}

module.exports = DBhelper;