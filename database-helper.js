"use strict";

const firebase = require('firebase-admin');
const _ = require("lodash");
const Promise = require("bluebird");

var serviceAccount = require(process.env.firebase_credentials);

firebase.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.firebase_db_url
});

const DBhelper = {
    getUserStationById: function(userId, resolve, reject) {

    },

    checkUserRecord: function(userId, resolve, reject){

    }
}

module.exports = DBhelper;