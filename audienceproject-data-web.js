export const moduleName = 'AudienceProjectData';

export const packageName = '@audienceproject/data-web';
export const packageVersion = '1.3.0';

export const fetchCache = {};

export const fetchStateInitial = 'INITIAL';
export const fetchStateRunning = 'RUNNING';
export const fetchStateReady = 'READY';
export const fetchStateFailed = 'FAILED';

export const fetchStatus = {
  state: fetchStateInitial,
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

export const fetch = (customerId, customerOptions, callback) => {
  if (typeof customerId !== 'string' || !customerId) {
    throw new Error('Invalid customer ID');
  }

  const getUserOptions = () => {
    const key = '__audienceProjectDataFetchOptions=';

    const parts = window.location.search.split(/[?&]/); // eslint-disable-line compat/compat
    let data;

    parts.some((part) => {
      const matches = part.indexOf(key) === 0;

      if (matches) {
        const value = part.slice(key.length);

        try {
          data = JSON.parse(decodeURIComponent(value));
        } catch (error) {} // eslint-disable-line no-empty
      }

      return matches;
    });

    return data;
  };

  const options = {
    allowStorageAccess: true,
    allowPersonalisation: true,

    gdprApplies: null,
    consentString: '',

    integrateWithCmp: false,
    waitForCmpConsent: false,

    requestParams: {},

    timeout: 1 * 1000,
    addStatusKey: false,

    cacheType: '', // localStorage|memory
    cacheKey: 'url,allowPersonalisation,requestParams',
    cacheTime: 24 * 60 * 60,

    requestDomains: {
      regular: 'pdw-usr.userreport.com',
      nonPersonalised: 'dnt-userreport.com',
    },

    debug: false,

    ...customerOptions,
    ...getUserOptions(),
  };

  const debugInfo = (...args) => options.debug && console?.log(`[${moduleName}]`, ...args); // eslint-disable-line no-console, compat/compat

  debugInfo('Fetch called…');

  debugInfo('Version:', packageVersion);

  debugInfo('Customer ID:', customerId);
  debugInfo('Customer options:', customerOptions);

  debugInfo('Fetch options:', options);

  const jsonParse = (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      return undefined;
    }
  };

  const getHash = (data) => {
    let hash = 0;

    const { length } = data;
    for (let index = 0; index < length; index += 1) {
      hash = ((hash << 5) - hash) + data.charCodeAt(index); // eslint-disable-line no-bitwise
      hash &= hash; // eslint-disable-line no-bitwise
    }

    return hash;
  };

  const getCacheKey = () => getHash(options.cacheKey.split(/\s*,\s*/).sort().map((key) => {
    if (key === 'url') {
      return window.location.pathname.slice(1) + window.location.search;
    }
    if (key === 'allowPersonalisation') {
      return options.allowPersonalisation ? '' : 0;
    }
    if (key === 'requestParams') {
      const string = JSON.stringify(options.requestParams);
      return string === '{}' ? '' : string;
    }
    return '';
  }).join(''));

  const storage = localStorage;

  const storageSessionReferrer = 'apr_sref';
  const storagePredictionCache = 'apr_data_cache';
  const storageDsu = 'apr_dsu';

  const storageRead = (key) => {
    if (!options.allowStorageAccess) {
      return undefined;
    }

    let data;
    try {
      data = storage[key];
    } catch (error) {} // eslint-disable-line no-empty

    if (data && data.indexOf('{') === 0 && data.lastIndexOf('}') === data.length - 1) {
      return jsonParse(data);
    }

    return data;
  };

  const storageWrite = (key, value) => {
    if (!options.allowStorageAccess) {
      return;
    }

    const data = typeof value === 'object' ? JSON.stringify(value) : value;

    try {
      storage[key] = data;
    } catch (error) {} // eslint-disable-line no-empty
  };

  const storageCheckAccess = () => {
    if (!options.allowStorageAccess) {
      return false;
    }

    const key = `apr_check_access@${Math.random()}`;
    try {
      storage[key] = key;
      const hasAccess = storage[key] === key;
      delete storage[key];
      return hasAccess;
    } catch (error) {} // eslint-disable-line no-empty

    return false;
  };

  const useCmp = (resolve) => {
    if (!options.integrateWithCmp) {
      resolve();
      return;
    }

    debugInfo('Checking CMP…');

    if (typeof __tcfapi !== 'function') {
      debugInfo('No TCF 2.0 API found…');
      return;
    }

    debugInfo('Using TCF 2.0 API…');

    const vendorId = 394;

    const overrideOptions = (model) => {
      options.gdprApplies = Boolean(model.gdprApplies);
      options.consentString = model.tcString || '';

      if (options.gdprApplies) {
        const hasVendor = model.vendor?.consents?.[vendorId];

        options.allowStorageAccess = Boolean(hasVendor && model.purpose?.consents?.[1]);
        options.allowPersonalisation = Boolean(hasVendor && model.purpose?.consents?.[3]);
      }

      debugInfo('Options after CMP override:', options);
    };

    const callTcf = (event, handler) => {
      const versionId = 2;
      const vendorIds = [vendorId];
      __tcfapi( // eslint-disable-line no-undef
        event, versionId, (...args) => {
          debugInfo('TCF response:', ...args);

          handler(...args);
        }, vendorIds,
      );
    };

    const listenExplicitConsent = (updatedModel) => {
      if (updatedModel.eventStatus === 'tcloaded' || updatedModel.eventStatus === 'useractioncomplete') {
        callTcf('removeEventListener', listenExplicitConsent);

        overrideOptions(updatedModel);
        resolve();
      }
    };

    const listenResponse = (model) => {
      if (!options.waitForCmpConsent || !model.gdprApplies
          || model.eventStatus === 'tcloaded' || model.eventStatus === 'useractioncomplete') {
        overrideOptions(model);
        resolve();
        return;
      }

      debugInfo('Adding TCF consent listener…');
      callTcf('addEventListener', listenExplicitConsent);
    };

    callTcf('getTCData', listenResponse);
  };

  let timeoutStart;
  const useTimeout = (resolve) => {
    if (!options.timeout) {
      return undefined;
    }

    debugInfo('Timeout started…');
    timeoutStart = new Date().getTime();

    return setTimeout(resolve, options.timeout);
  };
  const unuseTimeout = (timeout) => {
    clearTimeout(timeout);

    const timeoutTime = new Date().getTime() - timeoutStart;
    debugInfo('Timeout ended:', timeoutTime, 'ms');
  };

  const checkSessionReferrer = () => {
    if (!options.allowPersonalisation) {
      return;
    }

    debugInfo('Checking session referrer…');

    const origin = `${window.location.protocol}//${window.location.host}/`; // eslint-disable-line compat/compat
    if (document.referrer && document.referrer.indexOf(origin) !== 0) {
      debugInfo('Session referrer updated:', document.referrer);
      storageWrite(storageSessionReferrer, document.referrer);
    }
  };

  const currentTimestamp = Math.round(new Date().getTime() / 1000);

  const getCacheType = () => (options.cacheType === 'localStorage' && !storageCheckAccess() ? 'memory' : options.cacheType);

  const readDataFromCache = (resolve, reject) => {
    const cacheType = getCacheType();
    if (!cacheType) {
      return reject();
    }

    debugInfo('Reading prediction from cache…');

    let value;
    const cacheKey = getCacheKey();

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

  const saveDataToCache = (value) => {
    const cacheType = getCacheType();
    if (!cacheType) {
      return;
    }

    debugInfo('Saving prediction to cache…');

    const cacheKey = getCacheKey();
    const data = {
      data: value,
      ttl: currentTimestamp,
      hash: cacheKey,
    };

    if (cacheType === 'localStorage') {
      storageWrite(storagePredictionCache, data);
    } else if (cacheType === 'memory') {
      fetchCache[cacheKey] = data;
    }
  };

  const saveDataStatusKey = (data, statusCode) => {
    if (!options.addStatusKey) {
      return;
    }

    debugInfo('Updating status fields…');

    data.keyValues = data.keyValues || {}; // eslint-disable-line no-param-reassign
    data.keyValues.ap_ds = String(statusCode); // eslint-disable-line no-param-reassign
  };

  const ajax = new XMLHttpRequest();
  const fetchJSON = (url, resolve, reject) => {
    debugInfo('API request:', url);

    ajax.onreadystatechange = () => {
      if (ajax.readyState === XMLHttpRequest.DONE) {
        if (ajax.status === 200) {
          const json = jsonParse(ajax.responseText);

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
  const abortJSON = () => {
    ajax.abort();
  };

  const readDataFromWeb = (resolve, reject) => {
    debugInfo('Reading prediction from API…');

    const params = ['med', window.location.href]; // eslint-disable-line compat/compat

    if (document.referrer) {
      params.push('ref', document.referrer);
    }

    const sessionReferrer = storageRead(storageSessionReferrer);
    if (sessionReferrer) {
      params.push('sref', sessionReferrer);
    }

    if (options.allowPersonalisation) {
      const dsu = storageRead(storageDsu);
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

    params.push('appid', `${packageName}:${packageVersion}`);

    const isArray = (array) => Object.prototype.toString.call(array) === '[object Array]';

    (function walk(data, prefix) {
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined) {
          return;
        }

        const subKey = prefix + key;

        if (isArray(value)) {
          value.forEach((subValue) => {
            params.push(subKey, subValue);
          });
        } else if (typeof value === 'object') {
          walk(value, `${subKey}_`);
        } else {
          params.push(subKey, value);
        }
      });
    }(options.requestParams, ''));

    const domain = options.allowPersonalisation
      ? options.requestDomains.regular
      : options.requestDomains.nonPersonalised;
    let url = `https://${domain}/api/v2/partner/${encodeURIComponent(customerId)}/uid`;

    params.forEach((param, index) => {
      const paramJoiner = index ? '&' : '?';
      const partPrefix = index % 2 ? '=' : paramJoiner;
      url += partPrefix + encodeURIComponent(param);
    });

    return fetchJSON(url, resolve, reject);
  };

  const resolvers = [];

  const getData = () => {
    fetchStatus.state = fetchStateRunning;
    delete fetchStatus.result;
    delete fetchStatus.options;

    let timeout;

    let dataUsed = false;
    const useData = (data, statusCode) => {
      if (dataUsed) {
        return;
      }
      dataUsed = true;

      saveDataStatusKey(data, statusCode.code);

      const result = {
        type: statusCode.value,
        ...data,
      };

      fetchStatus.state = parseInt(statusCode.code, 10) > 0 ? fetchStateReady : fetchStateFailed;
      fetchStatus.result = result;
      fetchStatus.options = options;

      unuseTimeout(timeout);
      abortJSON();

      debugInfo('Callback result:', result);
      resolvers.forEach((resolver) => {
        resolver(result);
      });
    };

    useCmp(() => {
      const resultTimeout = {
        value: 'TIMEOUT',
        code: -2,
      };
      const resultError = {
        value: 'BACKEND_ERROR',
        code: -1,
      };
      const resultWeb = options.allowPersonalisation ? {
        value: 'RETURNED',
        code: 1,
      } : {
        value: 'RETURNED_ANONYMOUS',
        code: '1a',
      };
      const resultCache = options.allowPersonalisation ? {
        value: 'RETURNED_FROM_CACHE',
        code: 2,
      } : {
        value: 'RETURNED_ANONYMOUS_FROM_CACHE',
        code: '2a',
      };

      timeout = useTimeout(() => {
        useData({}, resultTimeout);
      });

      checkSessionReferrer();

      return readDataFromCache((data) => {
        useData(data, resultCache);
      }, () => (
        readDataFromWeb((data) => {
          saveDataToCache(data);

          useData(data, resultWeb);
        }, () => {
          useData({}, resultError);
        })
      ));
    });
  };

  if (typeof callback === 'function') {
    resolvers.push(callback);
  }

  getData();

  return {
    promise: () => new Promise((resolve) => {
      debugInfo('Promise called…');

      resolvers.push(resolve);
    }),
  };
};

export const utils = {
  sendDataToGooglePublisherTag: (data) => {
    window.googletag = window.googletag || { cmd: [] };

    const setTargeting = () => {
      Object.keys(data.keyValues).forEach((key) => {
        window.googletag.pubads().setTargeting(key, data.keyValues[key]);
      });
    };

    if (window.googletag.cmd.unshift) { // put in front of queue when possible
      window.googletag.cmd.unshift(setTargeting);
    } else { // native array method is not available if queue was processed
      window.googletag.cmd.push(setTargeting);
    }
  },
};

export default {
  moduleName,

  packageName,
  packageVersion,

  fetchCache,

  fetchStateInitial,
  fetchStateRunning,
  fetchStateReady,
  fetchStateFailed,

  fetchStatus,

  fetch,
  utils,
};
