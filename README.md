# AudienceProject Data Web

AudienceProject Data services for your websites.

## Installation

1. Install [NPM package](https://www.npmjs.com/package/@apr/data-web):

    ```shell
    npm install @apr/data-web
    ```

2. Load package into your application:

    * With script tag:

        ```html
        <script src="path/to/dist/audienceproject-data-web.js"></script>
        ```

    * With ES6 module:

        ```javascript
        import AudienceProjectDataWeb from '@apr/data-web';
        ```

    * With CommonJS module:

        ```javascript
        var AudienceProjectDataWeb = require('@apr/data-web');
        ```

    * With AMD module:

        ```javascript
        define(['path/to/audienceproject-data-web'], function (AudienceProjectDataWeb) {});
        ```

## API

### Fetch AudienceProject Data

With callback:

```javascript
AudienceProjectDataWeb.fetch(customerId, options, callback);
```

Promise based:

```javascript
AudienceProjectDataWeb.fetch(customerId, options).promise().then(/* callback */).catch(/* callback */);
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
* `options.writeToGlobals=false` *(boolean)*: Should output be written to global variables *apDataKeyValues*, *apDataCustomAttributes* and *apDataAudiences*.
* `options.addStatusField=false` *(boolean)*: Should status field be added into *keyValues* result.
* `options.cacheType=''` *(string)*: Type of cache, can be *localStorage* or *memory*.
* `options.cacheKey='url,allowPersonalisation,requestParams'` *(string)*: Comma separated list of cache key params.
* `options.cacheTime=86400` *(number)*: Number of seconds response should be cached in case of *options.cacheType* is not empty.
* `options.requestDomains={regular:'',nonPersonalised:''}` *(Object)*: Override request domains.
* `options.debug=false` *(boolean)*: Enable debug logging.
* `callback` *(Function)*: Optional callback handler.

## Compatibility

We are supporting all modern and legacy browsers starting with Internet Explorer 10, Firefox 3.6, Chrome 4. [Promise polyfill](https://github.com/stefanpenner/es6-promise) is required if you want to use promise-based callback with Internet Explorer and legacy versions of Firefox/Chrome, see [compatibility table](https://caniuse.com/promises).
