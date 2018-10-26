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
                annexAvailable: function (input) {
                    return input.Panel.AnnexAvalible;
                },
                annexStatus: function (input) {
                    return input.Panel.StatusAnnex;
                },
                user: function(input){
                    return input.user;
                }

            });
            
            try
            {
                var result = converter(JSON.parse(statusJson));
                var json = JSON.stringify(result);
                resolve(json);
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
                        else if (input.EventType == 'armedannex')
                            return 'armedAnnex';
                        else if (input.EventType == 'disarmedAnnex')
                            return 'disarmedAnnex';
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
                var json = JSON.stringify(result);
                resolve(json);
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
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e)
            {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }

    transformTemperaturesToOutput(temperaturesJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                temperatures: [jsonMapper.map({
                    id: function(input){
                        return input.Id;
                    },
                    label: function(input) {
                            return input.Label;
                    },
                    serialNo: function(input) {
                            return input.SerialNo;
                    },
                    temperature: function(input) {
                            return input.Temprature;
                    },
                    deviceId: function(input) {
                            return input.DeviceId;
                    }
                })]
            });

            try
            {
                var result = converter(JSON.parse(temperaturesJson));
                result = result.temperatures;
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e) {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }
};

module.exports = new Parser();