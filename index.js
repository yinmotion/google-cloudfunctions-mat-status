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

var userId;

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
      console.log('address = ' + flowApp.getDeviceLocation().address);
      flowApp.ask('I got your address, looking for subway stations near you now')
    }else{
      flowApp.tell("I can't find any station near you");  
    }
  }
  /*
  function inputSubwayLine(flowApp) {
    
  }
*/
  function checkMTAStatus(flowApp){
    let checkUserStationsPromise = new Promise((resolve, reject) => {
      //Test user id
      //let userId = 'device-12345';
      App.checkUserStations(userId, resolve, reject);
    });

    checkUserStationsPromise
    .then((userStations)=>{
      console.log('!!! mtaStatus : checkUserStationsPromise : userStations = ' + userStations + ' !!!');
      if(userStations){
        console.log('mtaStatus : checkMTAStatus');
        //requestPermission(flowApp);
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
