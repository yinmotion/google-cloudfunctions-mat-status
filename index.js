'use strict';

process.env.DEBUG = 'actions-on-google:*';

const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');
const Promise = require('bluebird');

const App = require('./app');

const Actions = {
  WELCOME_INTENT : 'input.welcome',
  REQUEST_PERMISSION_ACTION: 'request_permission',
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

  
  const flowApp = new DialogflowApp({request: req, response: res});

  let actionMap = new Map();

  actionMap.set(Actions.CHECK_MTA_STATUS, checkMTAStatus);
  actionMap.set(Actions.WELCOME_INTENT, welcomeIntent);
  actionMap.set(Actions.REQUEST_PERMISSION_ACTION, requestPermission);
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

    flowApp.ask('Welcome!');
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

      flowApp.ask('I got your address, looking for subway stations near you now');

      //console.log('!!! onGetAddress : useId = ' + userId + ' !!!');
      //console.log('!!! onGetAddress : user subway_line_name = ' + user_subway_line_name + '!!!');
      //*
      
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
        //this.response.speak(`The next ` + $event.request.intent.slots.direction.value + ' ' + $event.request.intent.slots.subwaylineName.value + ' will arrive in ' + arrivalObj.arrivalTime + ' at ' + arrivalObj.stationName + ' station');
        //this.emit(":responseReady");
      })
      .catch((error) => {
        console.log('App.getNextArrivalTime : error = ' + error);
      });
      //*/
    }else{
      flowApp.tell("I can't find any station near you");  
    }
  }
  
  /*
  function inputSubwayLine(flowApp) {
    
  }
*/
  function checkMTAStatus(flowApp){
    console.log('*** mtaStatus : checkMTAStatus ***');

    user_train_direction = JSON.stringify(flowApp.getArgument(Inputs.TRAIN_DIRECTION));
    user_subway_line_name = JSON.stringify(flowApp.getArgument(Inputs.SUBWAY_LINE_NAME));

    console.log('--------------------------------------------------------------------------------');
    console.log('!!! checkMTAStatus : ' + Inputs.TRAIN_DIRECTION + ' = ' + user_train_direction);
    console.log('!!! checkMTAStatus : ' + Inputs.SUBWAY_LINE_NAME + ' = ' + user_subway_line_name);
    console.log('--------------------------------------------------------------------------------');

    let checkUserStationsPromise = new Promise((resolve, reject) => {
      //Test user id
      //let userId = 'device-12345';
      App.checkUserStations(userId, resolve, reject);
    });

    checkUserStationsPromise
    .then((userStations)=>{
      console.log('!!! mtaStatus : checkUserStationsPromise : userStations = ' + userStations + ' !!!');

      user_stations = userStations;

      if(userStations){
        //console.log('mtaStatus : checkMTAStatus');
        flowApp.tell('Checking status now');
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
