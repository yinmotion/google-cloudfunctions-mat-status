'use strict';

const _ = require("lodash");
const Promise = require("bluebird");

const DBhelper = require("./database-helper");

var App = {
    checkUserStations : function(userId, resolve, reject){
        console.log('*** App : checkUserStations ***');
        let checkUserRecordPromise = new Promise((resolve, reject) => DBhelper.checkUserRecord(userId, resolve, reject));
        
        resolve(checkUserRecordPromise);
    }
};

module.exports = App;