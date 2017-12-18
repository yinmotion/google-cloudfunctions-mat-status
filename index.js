'use strict';

process.env.DEBUG = 'actions-on-google:*';

const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');
const Promise = require('bluebird');

const App = require('./app');

const Actions = {
  WELCOME_INTENT : 'input.welcome',
  CHECK_MTA_STATUS : 'check_mta_status',
  DEFAULT_FALLBACK: 'input.unknown',
  GET_ADDRESS: 'get_address',
  INPUT_SUBWAY_LINE: 'input_subway_line'
}

const Inputs = {
  TRAIN_DIRECTION : 'TrainDirection',
  SUBWAY_LINE_NAME : 'SubwayLineName'
}

var userId;

var user_address;

var user_train_direction;
var user_subway_line_name;

//user's stations list from DB
var user_stations;

exports.mtaStatus = (req, res) => {
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);

  console.log('env.vars = ' + process.env.mtaAPIURL);
  
  const flowApp = new DialogflowApp({request: req, response: res});

  let actionMap = new Map();

  actionMap.set(Actions.CHECK_MTA_STATUS, checkMTAStatus);
  actionMap.set(Actions.WELCOME_INTENT, welcomeIntent);
  actionMap.set(Actions.GET_ADDRESS, onGetAddress);
  //actionMap.set(Actions.INPUT_SUBWAY_LINE, inputSubwayLine);

  flowApp.handleRequest(actionMap);

  function welcomeIntent(flowApp) {
    let user = flowApp.getUser();
    console.log('user = ' + user);
    if(user){
      userId = user.userId;
      console.log('user id = ' + userId);
    }

    flowApp.ask('Hi, which train and what direction would you like to check?');
    //requestPermission(flowApp);
  };

  function requestPermission(flowApp) {
    console.log("*** mtaStatus : requestPermission ***");
    const permission = flowApp.SupportedPermissions.DEVICE_PRECISE_LOCATION;

    flowApp.askForPermission('To find subway stations near you', permission);
  };

  function onGetAddress(flowApp) {
    console.log("*** onGetAddress ***");

    if(flowApp.isPermissionGranted()){

      user_address = flowApp.getDeviceLocation().address;

      console.log('!!! onGetAddress : address = ' + user_address);

      //flowApp.ask('I got your address, looking for subway stations near you now');

      //console.log('!!! onGetAddress : useId = ' + userId + ' !!!');
      //console.log('!!! onGetAddress : user subway_line_name = ' + user_subway_line_name + '!!!');
      //*
      
      getArrivalTime();
      setTimeout(function(){
        flowApp.tell("I'm getting subway stations close to your location for the first time, please ask me again to check the train status in 2 mins.")
      }, 4900);
      //*/
    }else{
      flowApp.tell("I can't find any station near you");  
    }
  };

  function getArrivalTime(){
    let getNextArrivalTimePromise = new Promise((resolve, reject) => {
      let appObj = {};
      appObj.line = user_subway_line_name;
      appObj.direction = user_train_direction;
      appObj.deviceId = userId;
      appObj.address = user_address;
      appObj.userStations = user_stations;

      App.getNextArrivalTime(appObj, resolve, reject);
    });

    getNextArrivalTimePromise
    .then((arrivalObj) => {
      console.log('arrivalObj.arrivalTime = ' + arrivalObj.arrivalTime);
      flowApp.tell(`The next ` + user_train_direction+ ' ' + user_subway_line_name + ' will arrive in ' + arrivalObj.arrivalTime + ' at ' + arrivalObj.stationName + ' station');        
      //this.response.speak(`The next ` + $event.request.intent.slots.direction.value + ' ' + $event.request.intent.slots.subwaylineName.value + ' will arrive in ' + arrivalObj.arrivalTime + ' at ' + arrivalObj.stationName + ' station');
      //this.emit(":responseReady");
    })
    .catch((error) => {
      console.log('App.getNextArrivalTime : error = ' + error);
    })
  }
  
  /*
  function inputSubwayLine(flowApp) {
    
  }
*/
  function checkMTAStatus(flowApp){
    console.log('*** mtaStatus : checkMTAStatus ***');

    user_train_direction = JSON.stringify(flowApp.getArgument(Inputs.TRAIN_DIRECTION)).replace(/"/g, "");
    user_subway_line_name = JSON.stringify(flowApp.getArgument(Inputs.SUBWAY_LINE_NAME)).replace(/"/g, "");

    console.log('--------------------------------------------------------------------------------');
    console.log('!!! checkMTAStatus : ' + Inputs.TRAIN_DIRECTION + ' = ' + user_train_direction);
    console.log('!!! checkMTAStatus : ' + Inputs.SUBWAY_LINE_NAME + ' = ' + user_subway_line_name);
    console.log('--------------------------------------------------------------------------------');

    let checkUserStationsPromise = new Promise((resolve, reject) => {
      /**
       * Test user id
       * Firebase Realtime DB contains a stations object with test userId 'device-12345'
       * https://home-mta-status.firebaseio.com/userstations/device-12345
       */
      //let userId = 'device-12345';
      App.checkUserStations(userId, resolve, reject);
    });

    checkUserStationsPromise
    .then((userStations)=>{
      console.log('!!! mtaStatus : checkUserStationsPromise : userStations = ' + userStations + ' !!!');

      user_stations = userStations;

      if(userStations){
        //console.log('mtaStatus : checkMTAStatus');
        getArrivalTime();
        
      }else{
        requestPermission(flowApp);
      }
    })
    .catch((error) =>{
      console.log('!!! mtaStatus : checkUserStationsPromise : ' + error + ' !!!');
    })
  }
};

exports.event = (event, callback) => {
  callback();
};
