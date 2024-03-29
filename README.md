# AudienceProject Data Web

AudienceProject Data services for your websites.

## Installation

1. Install [NPM package](https://www.npmjs.com/package/@audienceproject/data-web):

    ```shell
    npm install --save @audienceproject/data-web
    ```

2. Load package into your application:

    * With script tag:

        ```html
        <script src="path/to/dist/audienceproject-data-web.js"></script>
        ```

    * With ES6 module:

        ```javascript
        import AudienceProjectData from '@audienceproject/data-web';
        ```

    * With CommonJS module:

        ```javascript
        var AudienceProjectData = require('@audienceproject/data-web');
        ```

    * With AMD module:

        ```javascript
        define(['path/to/audienceproject-data-web'], function (AudienceProjectData) {});
        ```

## API

### Fetch AudienceProject Data

With callback:

```javascript
AudienceProjectData.fetch(customerId, options, callback);
```

Promise based:

```javascript
AudienceProjectData.fetch(customerId).promise()
    .then(callbackSuccess)
    .catch(callbackError);
```

#### Arguments

* `customerId` *(string)*: Your AudienceProject customer ID.
* `options` *(Object)*: Optional options.
* `options.allowStorageAccess=true` *(boolean)*: If we can read or write to *localStorage*.
* `options.allowPersonalisation=true` *(boolean)*: If we can use personalisation for user (read cookies and user identifiers).
* `options.gdprApplies=null` *(boolean)*: If GDPR applies to user.
* `options.consentString=''` *(string)*: Consent string to prediction requests.
* `options.integrateWithCmp=false` *(boolean)*: Should we integrate with CMP to override storage and personalisation access, GDPR status and consent string.
* `options.waitForCmpConsent=false` *(boolean)*: Should we wait for explicit CMP consent before firing timeout.
* `options.requestParams={}` *(Object)*: Extra request params or information about user.
* `options.timeout=1000` *(number)*: Timeout in milliseconds when result needs to be returned since invocation.
* `options.addStatusKey=false` *(boolean)*: Should status field be added into *keyValues* result.
* `options.cacheType=''` *(string)*: Type of cache, can be *localStorage* or *memory*.
* `options.cacheKey='url,allowPersonalisation,requestParams'` *(string)*: Comma separated list of cache key params.
* `options.cacheTime=86400` *(number)*: Number of seconds response should be cached in case of *options.cacheType* is not empty.
* `options.requestDomains` *(Object)*: Request domains.
* `options.requestDomains.regular='pdw-usr.userreport.com'` *(Object)*: Request domain for regular requests.
* `options.requestDomains.nonPersonalised='dnt-userreport.com'` *(Object)*: Request domain for non-personalised requests.
* `options.debug=false` *(boolean)*: Enable debug logging.
* `callback` *(Function)*: Optional callback handler.

### Utils

#### Send data to Google Publisher Tag

```javascript
AudienceProjectData.fetch(customerId, options, AudienceProjectData.utils.sendDataToGooglePublisherTag);
```

## Compatibility

We are supporting all modern and legacy browsers starting with Internet Explorer 10, Firefox 27, Chrome 22. [Promise polyfill](https://github.com/stefanpenner/es6-promise) is required if you want to use promise-based callback with Internet Explorer and legacy versions of Firefox/Chrome, see [compatibility table](https://caniuse.com/promises).

## Content Security Policy

Following directive is required to support CSP:
```
connect-src https://pdw-usr.userreport.com https://dnt-userreport.com
```
