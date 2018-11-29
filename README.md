# Sector Alarm Node.js Library

## Information
A node.js library to communicate with your Sector Alarm sites. Library supports checking the current status, the history and also acting upon the alarm and its connected devices. 

## Supported features ##
    * Multi-site support for sites connected to the same customer account
    * Checking current status of alarm, annex and connected door locks
    * History of arming/disarming the alarm
    * Temperature readings from connected sensors
    * Acting on your alarm. Support for arming, disarming and partial arming
    * Acting on your annex alarm. Support for Arming and disarming.
    * Lock and unlock your connected door locks

## Supported in the following countries

Country     | Site                       | Verified
----------- | -------------------------- | -----------
Sweden      | http://www.sectoralarm.se  | Yes
Norway      | http://www.sectoralarm.no  | Yes
Finland     | http://www.sectoralarm.fi  | No
Spain       | http://www.sectoralarm.es  | No
Ireland     | http://www.phonewatch.ie   | No

If you use this library in a country listed above as not verified, please drop me a note.
You can visit Sector Alarm Group http://www.sectoralarm.com 

## Installation
```bash
npm install sectoralarm
```

## Usage example

```js
const sectoralarm = require('sectoralarm');

const email = '<Your account email>',
      password = '<Your account password>',
      siteId = '<Your Panel/Site ID>',
      code = '<Code to use for arming/disarming>',
      lockId = '<The ID of one of your locks>';

sectoralarm.connect(email,password,siteId)
    .then(async (site) => {
        
        await site.status()
            .then(console.log);

        await site.history()
            .then(console.log);

        await site.temperatures()
            .then(console.log);

        await site.partialArm(code)
            .then(console.log);

        await site.disarm(code)
            .then(console.log);

        await site.arm(code)
            .then(console.log);

        await site.annexArm(code)
            .then(console.log);

        await site.annexDisarm(code)
            .then(console.log);

        await site.lock(lockId, code)
            .then(console.log);

        await site.unlock(lockId, code)
            .then(console.log);

    })
    .catch(error => {
        console.log(error.message);
        console.log(error.code);
    });

sectoralarm.connect(email,password,siteId)
    .then(site => {
        return site.status();
    })
    .then(console.log)
    .catch(error => {
        console.log(error.message);
        console.log(error.code);
    })
```
## Error messages

Error code               | Description
------------------------ | -------------
ERR_INVALID_CREDENTIALS  | Invalid email and/or password.
ERR_INVALID_SESSION      | Session has timed out, use login() on the site object
ERR_PARSING_ERROR        | Could not parse the response, this library will need updates
ERR_COMMUNICATION_ERROR  | Could not communicate properly with sector alarm, this library will need updates
ERR_INVALID_CODE         | Invalid code used for arming/disarming 

## Output

**Example output from calling status**

```js
{ "siteId": "38728342",
  "name": "Home",
  "armedStatus": "armed",
  "partialArmingAvailabile": true,
  "user": "Code" }
```

**NOTE:** armedStatus can either be armed, partialArmed or disarmed and user can either be the user name, be empty or state Code (if a code was used to arm/disarm).

**Example output from calling history**

```js
[ { "time": "2018-01-23 07:48:19", "action": "armed", "user": "Code" },
  { "time": "2018-01-22 16:45:52", "action": "disarmed", "user": "Code" },
  { "time": "2018-01-22 07:46:23", "action": "armed", "user": "Code" },
  { "time": "2018-01-20 15:14:18", "action": "disarmed", "user": "Code" },
  { "time": "2018-01-19 15:51:05", "action": "armed", "user": "" },
  { "time": "2018-01-19 15:50:46", "action": "disarmed", "user": "Code" },
  { "time": "2018-01-19 15:50:11", "action": "partialArmed", "user": "" },
  { "time": "2018-01-19 15:49:30", "action": "disarmed", "user": "Code" },
  { "time": "2018-01-13 11:45:57", "action": "armed", "user": "Code" },
  { "time": "2018-01-13 11:44:53", "action": "disarmed", "user": "Code" } ]
```

**Example output from calling arm, partialArm, disarm, annexArm or annexDisarm**

```js
{ "status": "success", "name": "Home", "armedStatus": "disarmed" }
```

**Example output from calling temperatures**
```js
{ "sensorId": "123", "name": "livingRoom", "temperature": "26" }
```

**Contributions**
Thank you for those of you who have contributed to this project, put time and effort into adding features through pull requests or in other ways helped out during development.

Fredrik (https://github.com/frli4797) - Temperature sensors and annex arming development
Frank (https://github.com/frankis78) - Door Lock testing

**Looking for help**
I am currently looking for someone with cameras and smartplugs connected to a sector alarm site that want to help out with testing and/or development.