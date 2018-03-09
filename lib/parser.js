'use strict'

var Promise = require('promise');
var jsonMapper = require('json-mapper');
var moment = require('moment');

class Parser {

    transformStatusToOutput(statusJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                siteId: function(input){
                    return input.Panel.PanelId;
                },
                name: function(input) {
                    return input.Panel.PanelDisplayName;
                },
                armedStatus: function(input) {
                    if (input.Panel.ArmedStatus == 'partialarmed')
                        return 'partialArmed';
                    else
                        return input.Panel.ArmedStatus;
                },
                partialArmingAvailable: function (input) {
                    return input.Panel.PartialAvalible;
                },
                user: function(input){
                    return input.user;
                }

            });
            
            try
            {
                var result = converter(JSON.parse(statusJson));
                resolve(result);
            }
            catch(e)
            {
                var error = new Error("Could not parse the response, report as a bug on github");
                error.code = "ERR_PARSING_ERROR";
                reject(error);
            }
        });
    }

    transformHistoryToOutput(historyJson, top) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                events: ['LogDetails', jsonMapper.map({
                    time: function(input){
                        return moment(input.Time).format('YYYY-MM-DD HH:mm:ss');
                    },
                    action: function(input) {
                        if (input.EventType == 'partialarmed')
                            return 'partialArmed';
                        else
                            return input.EventType;
                    },
                    user: function(input) {
                        if (input.User == 'Kod')
                            return 'Code';
                        else
                            return input.User;
                    }
                })]
            });
            
            try
            {
                var result = converter(JSON.parse(historyJson));
                result = result.events.slice(0, top);
                resolve(result);
            }
            catch(e) {
                var error = new Error("Could not parse the response, report as a bug on github");
                error.code = "ERR_PARSING_ERROR";
                reject(error);
            }

        });
    }

    transformActionToOutput(actionJson) {
        return new Promise(function(resolve, reject) {

            var json = JSON.parse(actionJson);

            if (json.status != 'success') {
                var error = new Error("Invalid code, could not change status of site");
                error.code = "ERR_INVALID_CODE";
                reject(error);
                return;
            }

            var converter = jsonMapper.makeConverter({
                status: function(input){
                    return input.status;
                },
                name: function(input) {
                    return input.panelData.PanelDisplayName;
                },
                armedStatus: function(input) {
                    if (input.panelData.ArmedStatus == 'partialarmed')
                        return 'partialArmed';
                    else
                        return input.panelData.ArmedStatus;
                }
            });
            
            try
            {
                var result = converter(json);
                resolve(result);
            }
            catch(e)
            {
                var error = new Error("Could not parse the response, report as a bug on github");
                error.code = "ERR_PARSING_ERROR";
                reject(error);
            }
        });
    }
};

module.exports = new Parser();