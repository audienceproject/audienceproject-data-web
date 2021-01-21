(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("AudienceProjectData", ["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.AudienceProjectData = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports["default"] = _exports.fetch = _exports.fetchStatus = _exports.fetchStateFailed = _exports.fetchStateReady = _exports.fetchStateRunning = _exports.fetchStateInitial = _exports.fetchCache = _exports.packageVersion = _exports.packageName = _exports.moduleName = void 0;

  function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  var moduleName = 'AudienceProjectData';
  _exports.moduleName = moduleName;
  var packageName = '@audienceproject/data-web';
  _exports.packageName = packageName;
  var packageVersion = '1.0.5';
  _exports.packageVersion = packageVersion;
  var fetchCache = {};
  _exports.fetchCache = fetchCache;
  var fetchStateInitial = 'INITIAL';
  _exports.fetchStateInitial = fetchStateInitial;
  var fetchStateRunning = 'RUNNING';
  _exports.fetchStateRunning = fetchStateRunning;
  var fetchStateReady = 'READY';
  _exports.fetchStateReady = fetchStateReady;
  var fetchStateFailed = 'FAILED';
  _exports.fetchStateFailed = fetchStateFailed;
  var fetchStatus = {
    state: fetchStateInitial
  };
  /**
   * Fetch AudienceProject Data
   * @function
   *
   * @argument {string}   customerId
   *                      Your AudienceProject customer ID.
   *
   * @argument {Object}   [options]
   *                      Optional options.
   *
   * @argument {boolean}  [options.allowStorageAccess=true]
   *                      If we can read or write to *localStorage*.
   * @argument {boolean}  [options.allowPersonalisation=true]
   *                      If we can use personalisation for user (read cookies and user identifiers).
   *
   * @argument {boolean}  [options.gdprApplies=null]
   *                      If GDPR applies to user.
   * @argument {string}   [options.consentString='']
   *                      Consent string to prediction requests.
   *
   * @argument {boolean}  [options.integrateWithCmp=false]
   *                      Should we integrate with CMP to override storage and personalisation access,
   *                      GDPR status and consent string.
   * @argument {boolean}  [options.waitForCmpConsent=false]
   *                      Should we wait for explicit CMP consent before firing timeout.
   *
   * @argument {Object}   [options.requestParams={}]
   *                      Extra request params or information about user.
   *
   * @argument {number}   [options.timeout=1000]
   *                      Timeout in milliseconds when result needs to be returned since invocation.
   *
   * @argument {boolean}  [options.addStatusKey=false]
   *                      Should status field be added into *keyValues* result.
   *
   * @argument {string}   [options.cacheType='']
   *                      Type of cache, can be *localStorage* or *memory*.
   * @argument {string}   [options.cacheKey='url,allowPersonalisation,requestParams']
   *                      Comma separated list of cache key params.
   * @argument {number}   [options.cacheTime=86400]
   *                      Number of seconds response should be cached in case of *options.cacheType*
   *                      is not empty.
   *
   * @argument {Object}   [options.requestDomains]
   *                      Request domains.
   * @argument {Object}   [options.requestDomains.regular='pdw-usr.userreport.com']
   *                      Request domain for regular requests.
   * @argument {Object}   [options.requestDomains.nonPersonalised='dnt-userreport.com']
   *                      Request domain for non-personalised requests.
   *
   * @argument {boolean}  [options.debug=false]
   *                      Enable debug logging.
   * @argument {function} [callback]
   *                      Optional callback handler
   *
   * @returns {Object}
   */

  _exports.fetchStatus = fetchStatus;

  var fetch = function fetch(customerId, customerOptions, callback) {
    if (typeof customerId !== 'string' || !customerId) {
      throw new Error('Invalid customer ID');
    }

    var getUserOptions = function getUserOptions() {
      var key = '__audienceProjectDataFetchOptions=';
      var parts = window.location.search.split(/[?&]/);
      var data;
      parts.some(function (part) {
        var matches = part.indexOf(key) === 0;

        if (matches) {
          var value = part.slice(key.length);

          try {
            data = JSON.parse(decodeURIComponent(value));
          } catch (error) {} // eslint-disable-line no-empty

        }

        return matches;
      });
      return data;
    };

    var options = _extends({
      allowStorageAccess: true,
      allowPersonalisation: true,
      gdprApplies: null,
      consentString: '',
      integrateWithCmp: false,
      waitForCmpConsent: false,
      requestParams: {},
      timeout: 1 * 1000,
      addStatusKey: false,
      cacheType: '',
      // localStorage|memory
      cacheKey: 'url,allowPersonalisation,requestParams',
      cacheTime: 24 * 60 * 60,
      requestDomains: {
        regular: 'pdw-usr.userreport.com',
        nonPersonalised: 'dnt-userreport.com'
      },
      debug: false
    }, customerOptions, getUserOptions());

    var debugInfo = function debugInfo() {
      var _console;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return options.debug && ((_console = console) == null ? void 0 : _console.log.apply(_console, ["[" + moduleName + "]"].concat(args)));
    }; // eslint-disable-line no-console, compat/compat


    debugInfo('Fetch called…');
    debugInfo('Version:', packageVersion);
    debugInfo('Customer ID:', customerId);
    debugInfo('Customer options:', customerOptions);
    debugInfo('Fetch options:', options);

    var jsonParse = function jsonParse(data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        return undefined;
      }
    };

    var getHash = function getHash(data) {
      var hash = 0;
      var length = data.length;

      for (var index = 0; index < length; index += 1) {
        hash = (hash << 5) - hash + data.charCodeAt(index); // eslint-disable-line no-bitwise

        hash &= hash; // eslint-disable-line no-bitwise
      }

      return hash;
    };

    var getCacheKey = function getCacheKey() {
      return getHash(options.cacheKey.split(/\s*,\s*/).sort().map(function (key) {
        if (key === 'url') {
          return window.location.pathname.slice(1) + window.location.search;
        }

        if (key === 'allowPersonalisation') {
          return options.allowPersonalisation ? '' : 0;
        }

        if (key === 'requestParams') {
          var string = JSON.stringify(options.requestParams);
          return string === '{}' ? '' : string;
        }

        return '';
      }).join(''));
    };

    var storage = localStorage;
    var storageSessionReferrer = 'apr_sref';
    var storagePredictionCache = 'apr_data_cache';
    var storageDsu = 'apr_dsu';

    var storageRead = function storageRead(key) {
      if (!options.allowStorageAccess) {
        return undefined;
      }

      var data;

      try {
        data = storage[key];
      } catch (error) {} // eslint-disable-line no-empty


      if (data && data.indexOf('{') === 0 && data.lastIndexOf('}') === data.length - 1) {
        return jsonParse(data);
      }

      return data;
    };

    var storageWrite = function storageWrite(key, value) {
      if (!options.allowStorageAccess) {
        return;
      }

      var data = typeof value === 'object' ? JSON.stringify(value) : value;

      try {
        storage[key] = data;
      } catch (error) {} // eslint-disable-line no-empty

    };

    var storageCheckAccess = function storageCheckAccess() {
      if (!options.allowStorageAccess) {
        return false;
      }

      var key = "apr_check_access@" + Math.random();

      try {
        storage[key] = key;
        var hasAccess = storage[key] === key;
        delete storage[key];
        return hasAccess;
      } catch (error) {} // eslint-disable-line no-empty


      return false;
    };

    var useCmp = function useCmp(resolve) {
      if (!options.integrateWithCmp) {
        resolve();
        return;
      }

      debugInfo('Checking CMP…');

      if (typeof __tcfapi !== 'function') {
        debugInfo('No TCF 2.0 API found…');
        resolve();
        return;
      }

      debugInfo('Using TCF 2.0 API…');
      var vendorId = 394;

      var overrideOptions = function overrideOptions(model) {
        options.gdprApplies = Boolean(model.gdprApplies);
        options.consentString = model.tcString || '';

        if (options.gdprApplies) {
          var _model$vendor, _model$vendor$consent, _model$purpose, _model$purpose$consen, _model$purpose2, _model$purpose2$conse;

          var hasVendor = (_model$vendor = model.vendor) == null ? void 0 : (_model$vendor$consent = _model$vendor.consents) == null ? void 0 : _model$vendor$consent[vendorId];
          options.allowStorageAccess = Boolean(hasVendor && ((_model$purpose = model.purpose) == null ? void 0 : (_model$purpose$consen = _model$purpose.consents) == null ? void 0 : _model$purpose$consen[1]));
          options.allowPersonalisation = Boolean(hasVendor && ((_model$purpose2 = model.purpose) == null ? void 0 : (_model$purpose2$conse = _model$purpose2.consents) == null ? void 0 : _model$purpose2$conse[3]));
        }

        debugInfo('Options after CMP override:', options);
      };

      var callTcf = function callTcf(event, handler) {
        var versionId = 2;
        var vendorIds = [vendorId];

        __tcfapi( // eslint-disable-line no-undef
        event, versionId, function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          debugInfo.apply(void 0, ['TCF response:'].concat(args));
          handler.apply(void 0, args);
        }, vendorIds);
      };

      var listenExplicitConsent = function listenExplicitConsent(updatedModel) {
        if (updatedModel.tcString) {
          callTcf('removeEventListener', listenExplicitConsent);
          overrideOptions(updatedModel);
          resolve();
        }
      };

      var listenResponse = function listenResponse(model) {
        if (!options.waitForCmpConsent || !model.gdprApplies || model.tcString) {
          overrideOptions(model);
          resolve();
          return;
        }

        debugInfo('Adding TCF consent listener…');
        callTcf('addEventListener', listenExplicitConsent);
      };

      callTcf('getTCData', listenResponse);
    };

    var timeoutStart;

    var useTimeout = function useTimeout(resolve) {
      if (!options.timeout) {
        return undefined;
      }

      debugInfo('Timeout started…');
      timeoutStart = new Date().getTime();
      return setTimeout(resolve, options.timeout);
    };

    var unuseTimeout = function unuseTimeout(timeout) {
      clearTimeout(timeout);
      var timeoutTime = new Date().getTime() - timeoutStart;
      debugInfo('Timeout ended:', timeoutTime, 'ms');
    };

    var checkSessionReferrer = function checkSessionReferrer() {
      if (!options.allowPersonalisation) {
        return;
      }

      debugInfo('Checking session referrer…');
      var origin = window.location.protocol + "//" + window.location.host + "/"; // eslint-disable-line compat/compat

      if (document.referrer && document.referrer.indexOf(origin) !== 0) {
        debugInfo('Session referrer updated:', document.referrer);
        storageWrite(storageSessionReferrer, document.referrer);
      }
    };

    var currentTimestamp = Math.round(new Date().getTime() / 1000);

    var getCacheType = function getCacheType() {
      return options.cacheType === 'localStorage' && !storageCheckAccess() ? 'memory' : options.cacheType;
    };

    var readDataFromCache = function readDataFromCache(resolve, reject) {
      var cacheType = getCacheType();

      if (!cacheType) {
        return reject();
      }

      debugInfo('Reading prediction from cache…');
      var value;
      var cacheKey = getCacheKey();

      if (cacheType === 'localStorage') {
        debugInfo('Reading prediction from local storage key:', cacheKey);
        value = storageRead(storagePredictionCache);
      } else if (cacheType === 'memory') {
        debugInfo('Reading prediction from memory key:', cacheKey);
        value = fetchCache[cacheKey];
      }

      if (typeof value !== 'object') {
        return reject();
      }

      if (value.ttl + options.cacheTime < currentTimestamp || value.hash !== cacheKey) {
        debugInfo('Cached prediction expired…');
        return reject();
      }

      debugInfo('Cached prediction:', value.data);
      return resolve(value.data);
    };

    var saveDataToCache = function saveDataToCache(value) {
      var cacheType = getCacheType();

      if (!cacheType) {
        return;
      }

      debugInfo('Saving prediction to cache…');
      var cacheKey = getCacheKey();
      var data = {
        data: value,
        ttl: currentTimestamp,
        hash: cacheKey
      };

      if (cacheType === 'localStorage') {
        storageWrite(storagePredictionCache, data);
      } else if (cacheType === 'memory') {
        fetchCache[cacheKey] = data;
      }
    };

    var saveDataStatusKey = function saveDataStatusKey(data, statusCode) {
      if (!options.addStatusKey) {
        return;
      }

      debugInfo('Updating status fields…');
      data.keyValues = data.keyValues || {}; // eslint-disable-line no-param-reassign

      data.keyValues.ap_ds = String(statusCode); // eslint-disable-line no-param-reassign
    };

    var ajax = new XMLHttpRequest();

    var fetchJSON = function fetchJSON(url, resolve, reject) {
      debugInfo('API request:', url);

      ajax.onreadystatechange = function () {
        if (ajax.readyState === XMLHttpRequest.DONE) {
          if (ajax.status === 200) {
            var json = jsonParse(ajax.responseText);
            debugInfo('API response:', json);
            resolve(json);
          } else {
            debugInfo('API failed with code:', ajax.status);
            reject();
          }
        }
      };

      ajax.open('GET', url, true);
      ajax.withCredentials = options.allowPersonalisation;
      ajax.send();
    };

    var abortJSON = function abortJSON() {
      ajax.abort();
    };

    var readDataFromWeb = function readDataFromWeb(resolve, reject) {
      debugInfo('Reading prediction from API…');
      var params = ['med', window.location.href]; // eslint-disable-line compat/compat

      if (document.referrer) {
        params.push('ref', document.referrer);
      }

      var sessionReferrer = storageRead(storageSessionReferrer);

      if (sessionReferrer) {
        params.push('sref', sessionReferrer);
      }

      if (options.allowPersonalisation) {
        var dsu = storageRead(storageDsu);

        if (dsu) {
          params.push('dsu', dsu);
        }
      }

      if (typeof options.gdprApplies === 'boolean') {
        params.push('gdpr', Number(options.gdprApplies));
      }

      if (options.consentString) {
        params.push('gdpr_consent', options.consentString);
      }

      params.push('appid', packageName + ":" + packageVersion);

      var isArray = function isArray(array) {
        return Object.prototype.toString.call(array) === '[object Array]';
      };

      (function walk(data, prefix) {
        Object.keys(data).forEach(function (key) {
          var value = data[key];

          if (value === undefined) {
            return;
          }

          var subKey = prefix + key;

          if (isArray(value)) {
            value.forEach(function (subValue) {
              params.push(subKey, subValue);
            });
          } else if (typeof value === 'object') {
            walk(value, subKey + "_");
          } else {
            params.push(subKey, value);
          }
        });
      })(options.requestParams, '');

      var domain = options.allowPersonalisation ? options.requestDomains.regular : options.requestDomains.nonPersonalised;
      var url = "https://" + domain + "/api/v2/partner/" + encodeURIComponent(customerId) + "/uid";
      params.forEach(function (param, index) {
        var paramJoiner = index ? '&' : '?';
        var partPrefix = index % 2 ? '=' : paramJoiner;
        url += partPrefix + encodeURIComponent(param);
      });
      return fetchJSON(url, resolve, reject);
    };

    var resolvers = [];

    var getData = function getData() {
      fetchStatus.state = fetchStateRunning;
      delete fetchStatus.result;
      delete fetchStatus.options;
      var timeout;
      var dataUsed = false;

      var useData = function useData(data, statusCode) {
        if (dataUsed) {
          return;
        }

        dataUsed = true;
        saveDataStatusKey(data, statusCode.code);

        var result = _extends({
          type: statusCode.value
        }, data);

        fetchStatus.state = statusCode.code > 0 ? fetchStateReady : fetchStateFailed;
        fetchStatus.result = result;
        fetchStatus.options = options;
        unuseTimeout(timeout);
        abortJSON();
        debugInfo('Callback result:', result);
        resolvers.forEach(function (resolver) {
          resolver(result);
        });
      };

      useCmp(function () {
        var resultTimeout = {
          value: 'TIMEOUT',
          code: -2
        };
        var resultError = {
          value: 'BACKEND_ERROR',
          code: -1
        };
        var resultWeb = options.allowPersonalisation ? {
          value: 'RETURNED',
          code: 1
        } : {
          value: 'RETURNED_ANONYMOUS',
          code: '1a'
        };
        var resultCache = options.allowPersonalisation ? {
          value: 'RETURNED_FROM_CACHE',
          code: 2
        } : {
          value: 'RETURNED_ANONYMOUS_FROM_CACHE',
          code: '2a'
        };
        timeout = useTimeout(function () {
          useData({}, resultTimeout);
        });
        checkSessionReferrer();
        return readDataFromCache(function (data) {
          useData(data, resultCache);
        }, function () {
          return readDataFromWeb(function (data) {
            saveDataToCache(data);
            useData(data, resultWeb);
          }, function () {
            useData({}, resultError);
          });
        });
      });
    };

    if (typeof callback === 'function') {
      resolvers.push(callback);
    }

    getData();
    return {
      promise: function promise() {
        return new Promise(function (resolve) {
          debugInfo('Promise called…');
          resolvers.push(resolve);
        });
      }
    };
  };

  _exports.fetch = fetch;
  var _default = {
    moduleName: moduleName,
    packageName: packageName,
    packageVersion: packageVersion,
    fetchCache: fetchCache,
    fetchStateInitial: fetchStateInitial,
    fetchStateRunning: fetchStateRunning,
    fetchStateReady: fetchStateReady,
    fetchStateFailed: fetchStateFailed,
    fetchStatus: fetchStatus,
    fetch: fetch
  };
  _exports["default"] = _default;
});
