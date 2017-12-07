'use strict';

const WELCOME_OUTPUT = "Ask me about the real time Subway status";

const WELCOME_REPROMPT = "Which train and what direction do you want to check";

const NOTIFY_MISSING_PERMISSIONS = "Please enable Location permissions in the Amazon Alexa app.";

const NO_ADDRESS = "It looks like you don't have an address set. You can set your address in the Alexa app.";

const LOCATION_FAILURE = "There was an error with the Device Address API. Please try again.";

const HELP = "Let me know which train and what direction do you want to check";

const CANCEL = "Cancel";


module.exports = {
    "WELCOME_OUTPUT": WELCOME_OUTPUT,
    "WELCOME_REPROMPT": WELCOME_REPROMPT,
    "NOTIFY_MISSING_PERMISSIONS": NOTIFY_MISSING_PERMISSIONS,
    "NO_ADDRESS": NO_ADDRESS,
    "LOCATION_FAILURE": LOCATION_FAILURE,
    "HELP": HELP,
    "CANCEL": CANCEL
};