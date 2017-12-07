'use strict';

const DIR_DOWNTOWN = 'downtown';
const DIR_UPTOWN = 'uptown';
const DIR_QUEENS_BOUND = 'queens bound';
const DIR_BROOKLYN_BOUND = 'brooklyn bound';

const DIRECTION_NORTH = 'N';
const DIRECTION_SOUTH = 'S';

const TEST_ADDRESS = {
    "stateOrRegion": "NY",
    "city": "New York",
    "countryCode": "US",
    "postalCode": "10011",
    "addressLine1": "114 5th Avenue",
    "addressLine2": "",
    "addressLine3": "",
    "districtOrCounty": ""
  };

module.exports = {
    'DIR_DOWNTOWN' : DIR_DOWNTOWN,
    'DIR_UPTOWN' : DIR_UPTOWN,
    'DIR_QUEENS_BOUND' : DIR_QUEENS_BOUND,
    'DIR_BROOKLYN_BOUND' : DIR_BROOKLYN_BOUND,
    
    'DIRECTION_NORTH' : DIRECTION_NORTH,
    'DIRECTION_SOUTH' : DIRECTION_SOUTH,

    'TEST_ADDRESS' : TEST_ADDRESS
}