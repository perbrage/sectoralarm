'use strict'

var Promise = require('promise');
var jsonMapper = require('json-mapper');
var moment = require('moment');
var SectorAlarmError = require('./sectoralarmerror.js');

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
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
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
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }

    transformActionToOutput(actionJson) {
        return new Promise(function(resolve, reject) {

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
                var json = JSON.parse(actionJson);

                if (json.status != 'success') {
                    reject(new SectorAlarmError('ERR_INVALID_CODE', 'Invalid code, could not act upon alarm of the site'));
                    return;
                }

                var result = converter(json);
                resolve(result);
            }
            catch(e)
            {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }
};

module.exports = new Parser();