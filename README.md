# Sector Alarm Node.js Library

## Information

A node.js library to communicate with your Sector Alarm sites. Library supports checking the current status, the history and also acting upon the alarm and its connected devices.

## Supported features

* Multi-site support for sites connected to the same customer account
* Checking current status of alarm, annex and connected door locks
* History of arming/disarming the alarm
* Temperature readings from connected sensors
* Acting on your alarm. Support for arming, disarming and partial arming
* Acting on your annex alarm. Support for Arming and disarming.
* Lock and unlock your connected door locks

## Supported in the following countries

Country     | Site                         | Verified
----------- | ---------------------------- | -----------
Sweden      | <http://www.sectoralarm.se>  | Yes
Norway      | <http://www.sectoralarm.no>  | Yes
Finland     | <http://www.sectoralarm.fi>  | Yes
Spain       | <http://www.sectoralarm.es>  | No
Ireland     | <http://www.phonewatch.ie>   | Yes

If you use this library in a country listed above as not verified, please drop me a note.
You can visit Sector Alarm Group <http://www.sectoralarm.com>

## Installation

```bash
npm install sectoralarm
```

## Account and other configuration identifiers

Connecting and acting upon your alarm requires you to have an account with Sector Alarm. Your e-mail and account password, together with a SiteId is required to connect. SiteId is required to identify which site you want to connect to and fetch information from or act upon. This is a feature that allows for users with multiple homes to connect to different homes/sites.

### Account information

Account information is your e-mail and password used when creating an account with Sector Alarm.

### SiteId

To find out your siteId, browse to <https://mypagesapi.sectoralarm.net>. Login using your accounts e-mail and password. After you have been authenticated, you can have a look at the URL in your browser. At the end of the URL you will find your SiteId. Example .../#!/systems/01234567

### Code

The code is your alarm panel code. You can add/edit codes in Sector Alarms app for different users. The code used will identify who armed/disarmed your site. You can also apply a setting that codes are not required on your account for arming the site. In that case a code is not needed when arming.

### Device identifiers

To find out the identifiers of your devices, locks, smartplugs and such, use the different methods to aquire the information, for example .locks(), .temperatures(), .info() etc.

## BREAKING CHANGES IN v2.0.0+

In version v2.0.0, some minor changes to how to use the library has been changed, which would be considered breaking changes to previous versions. In v2.0.0+ status has been split into two methods, info and status. Some of the response messages has also changed slightly. Should you upgrade to v2.0.0 and beyond, please make sure your solution still works. See new changelog at the bottom for additions and changes. Thank you.

## Usage example

```js
const sectoralarm = require('sectoralarm');

const email = '<Your account email>',
      password = '<Your account password>',
      siteId = '<Your Panel/Site ID>',
      code = '<Code to use for arming/disarming>',
      lockId = '<The ID of one of your locks>',
      sensorId = '<The ID of one of your sensors>';

var settings = sectoralarm.createSettings();

settings.jsonOutput = false;
settings.numberOfRetries = 4;
settings.retryDelayInMs = 4500;

sectoralarm.connect(email,password,siteId, settings)
    .then(async (site) => {
        await site.info()
            .then(console.log);

        await site.status()
            .then(console.log);

        await site.history()
            .then(console.log);

        await site.temperatures()
            .then(console.log);

        await site.temperatures(sensorId)
            .then(console.log);

        await site.locks()
            .then(console.log);

        await site.locks(lockId)
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
ERR_INVALID_VERSION      | Sector alarm has changed the version on their API. Restart application or use 'login' on site object

## Output

### Example output from calling status

```js
{ "siteId": "38728342",
  "name": "Home",
  "armedStatus": "disarmed",
  "partialArmingAvailable": true,
  "annexArmingAvailable": false,
  "annexArmedStatus": "unknown",
  "lastInteractionBy": "Code",
  "lastInteractionTime": "2018-11-30 06:20:35",
  "locksAvailable":false,
  "locks":[]}
```

**NOTE:** armedStatus can either be armed, partialArmed or disarmed and user can either be the user name, be empty or state Code (if a code was used to arm/disarm).

### Example output from calling history

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

### Example output from calling arm, partialArm, disarm, annexArm or annexDisarm

```js
{ "status": "success", "name": "Home", "armedStatus": "disarmed" }
```

### Example output from calling temperatures

```js
{ "sensorId": "123", "name": "livingRoom", "temperature": "26" }
```

## Contributions

Thank you for those of you who have contributed to this project, put time and effort into adding features through pull requests or in other ways helped out during development.

* Fredrik (<https://github.com/frli4797>) - Temperature sensors and annex arming development
* Frank (<https://github.com/frankis78>) - Door Lock testing during development

## Looking for help

I am currently looking for someone with cameras and smartplugs connected to a sector alarm site that want to help out with testing and/or development. Check the issue page and reply there.

## Changelog

### v2.1.2 - 2022-02-10

* Retry functionality has been added to all operations that fetch data, or tries to act on the alarm or locks. This will reduce fake errors from Sector Alarms service.
* Readme has been updated with information how to find different account properties, such as SiteId and Device identifiers.
* Readme has been updated and changed to conform to the readme.md standards.

### v2.1.1 - 2022-01-24

* numberOfRetries and retryDelayInMs has been added to the settings class, so these values can be changed to optimal values. Defaults are set to 3 retries and 3000ms delay. Example to
  change these settings has been added to the usage example above.
* Updated devDependencies for security reasons.

### v2.1.0 - 2022-01-24

* Retry for getStatus. For some time now, Sector alarm have been sending out errenous 401 Unauthorized status when polling to quickly. I first thought they had issues at their end,
  but as the issue haven't been resolved, another way to tackle it is to implement retry. Many poll getStatus to see if the alarm status has changed, and then react to it if it has.
  With this retry, there will be less errors when polling to fast. Current delay is hardcoded to 2 seconds pause, and retry will happen 3 times before exiting. To disable retry, send a 0 into the forth parameter of getStatus.
* Security updates of underlying packages,

### v2.0.6 - 2020-01-09

* Security updates of underlying packages

### v2.0.5 - 2019-08-09

* Version is now auto-detected during 'login', and will use that version until application is restarted, or another 'login' request is made.
* 'status', 'info' and 'temperatures' will now throw a ERR_INVALID_VERSION to indicate that sector alarm has updated their API. Other functions does not use version as of now.

### v2.0.3 - 2019-06-17

* Fixed api version missmatch. Sector Alarm updated their API.
* Finland is now also a verified country for this library.

### v2.0.2 - 2019-04-12

* Updated third-party libraries to pass npm security audit

### v2.0.1 - 2019-04-11

* Breaking change in sector alarms api for info, status and temperatures has been resolved
* Resolved a bug that would throw a parser error for sites without any locks connected to it

### v2.0.0 - 2018-12-15

* New 'info' method to get general information about he site, and all the connected devices.
* New 'locks' method gets the status of all locks connected to the alarm.
* New 'locks' method optionally allows to filter for a specific lock.
* Optional settings can now be supplied when connecting to a site.
* Setting to control the output format (json or javascript Object). Default is Json.
* Added 'createSettings' method to easily create the correct setting object.
* Added Skeleton methods 'cameras' and 'smartPlugs' added for future development, currently not supported.
* Calling 'status' no longer includes general information, use 'info' instead.
* Calling 'status' no longer includes lock status information, use 'locks' instead.
* Breaking change in 'temperatures' method as the output has changed some names.
* Calling 'temperatures' now optionally allows to filter for a specific sensor.

### v1.5.0 - 2018-11-29

* Support for door locks. 'lock' and 'unlock' can be called with a code to act on the lock.
* Added notify support for change in annex alarm status.

### v1.4.0 - 2018-10-28

* Support for temperature sensors connected to the alarm.
* Minor bug fixing.

### v1.3.0 - 2018-10-06

* Support for arming/disarming the annex.
* Output is now proper json.

### v1.2.0 - 2018-04-29

* Custom error, which can include the original error.

### v1.1.2 - 2018-04-03

* Minor bug fixes.
* Resolved some errors in the test suite.
