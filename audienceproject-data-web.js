export const version = '1.0.0';

const cacheMemory = {};

export const fetch = ( // eslint-disable-line import/prefer-default-export
  customerId,
  _options = {},
  callback,
) => {
  if (typeof customerId !== 'string') {
    throw new Error('Invalid customer ID');
  }

  const options = {
    timeout: 1000,

    cacheType: '', // localStorage|memory
    cacheKey: 'url,allowPersonalisation,requestParams',
    cacheTime: 24 * 60 * 60,

    allowStorageAccess: true,
    allowPersonalisation: true,

    gdprApplies: null,
    consentString: '',
    integrateWithCmp: false,
    waitForCmpConsent: false,

    writeToGlobals: false,
    addStatusField: false,

    requestDomains: {
      regular: '',
      nonPersonalised: '',
    },
    requestParams: {},

    debug: false,

    ..._options,
  };

  const debugInfo = (...args) => options.debug && console?.log('[AudienceProjectDataWeb]', ...args); // eslint-disable-line no-console, compat/compat

  debugInfo('Version:', version);
  debugInfo('Customer ID:', customerId);
  debugInfo('Options:', options);

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

  const cacheKey = getHash(options.cacheKey.split(',').sort().map((key) => {
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

  const useCmp = (resolve) => {
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

    const vendorId = 394;

    const overrideOptions = (model) => {
      options.gdprApplies = Boolean(model.gdprApplies);
      options.consentString = model.tcString || '';

      if (options.gdprApplies) {
        const hasVendor = model.vendors?.consents?.[vendorId];

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
      if (updatedModel.tcString) {
        callTcf('removeEventListener', listenExplicitConsent);

        overrideOptions(updatedModel);
        resolve();
      }
    };

    const listenResponse = (model) => {
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

  const useTimeout = (resolve) => {
    if (!options.timeout) {
      return undefined;
    }

    debugInfo('Starting reject timeout…');

    return setTimeout(resolve, options.timeout);
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

  const readDataFromCache = (resolve, reject) => {
    if (!options.cacheType) {
      return reject();
    }

    debugInfo('Reading prediction from cache…');

    let value;

    if (options.cacheType === 'localStorage') {
      debugInfo('Reading prediction from local storage key:', storagePredictionCache);
      value = storageRead(storagePredictionCache);
    } else if (options.cacheType === 'memory') {
      debugInfo('Reading prediction from memory key:', cacheKey);
      value = cacheMemory[cacheKey];
    }

    if (typeof value !== 'object') {
      return reject();
    }

    if (value.ttl < currentTimestamp || value.hash !== cacheKey) {
      debugInfo('Cached prediction expired…');
      return reject();
    }

    debugInfo('Cached prediction:', value.data);
    return resolve(value.data);
  };

  const saveDataToCache = (value) => {
    if (!options.cacheType) {
      return;
    }

    debugInfo('Saving prediction to cache…');

    const data = {
      data: value,
      ttl: options.cacheTime + currentTimestamp,
      hash: cacheKey,
    };

    if (options.cacheType === 'localStorage') {
      storageWrite(storagePredictionCache, data);
    } else if (options.cacheType === 'memory') {
      cacheMemory[cacheKey] = data;
    }
  };

  const saveDataToGlobals = (data) => {
    if (!options.writeToGlobals) {
      return;
    }

    debugInfo('Saving prediction to globals…');

    window.apDataKeyValues = data.keyValues || {};
    window.apDataCustomAttributes = data.customAttributes || {};
    window.apDataAudiences = data.segments || [];
  };

  const statusCodeTimeout = -2;
  const statusCodeWebError = -1;
  const statusCodeWebSuccess = 1;
  const statusCodeCache = 2;
  const addStatusField = (data, statusCode) => {
    if (!options.addStatusField) {
      return;
    }

    debugInfo('Updating status fields…');

    data.keyValues = data.keyValues || {}; // eslint-disable-line no-param-reassign

    const personalisationSuffix = statusCode > 0 && options.allowPersonalisation ? '' : 'a';
    data.keyValues.ap_ds = `${statusCode}${personalisationSuffix}`; // eslint-disable-line no-param-reassign
  };

  const fetchJSON = (url, resolve, reject) => {
    debugInfo('Fetching URL:', url);

    const ajax = new XMLHttpRequest();

    ajax.onreadystatechange = () => {
      if (ajax.readyState === XMLHttpRequest.DONE) {
        if (ajax.status === 200) {
          const json = jsonParse(ajax.responseText);

          debugInfo('Response succeed', json);
          resolve(json);
        } else {
          debugInfo('Response failed:', ajax);
          reject();
        }
      }
    };

    ajax.open('GET', url, true);
    ajax.withCredentials = options.allowPersonalisation;
    ajax.send();
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

    params.push('appid', `@apr/data-web:${version}`);

    Object.keys(options.requestParams).forEach((key) => {
      params.push(key, options.requestParams[key]);
    });

    const domain = options.allowPersonalisation
      ? (options.requestDomains.regular || 'pdw-usr.userreport.com')
      : (options.requestDomains.nonPersonalised || 'dnt-userreport.com');
    let url = `https://${domain}/api/v2/partner/${encodeURIComponent(customerId)}/uid`;

    params.forEach((param, index) => {
      const paramJoiner = index ? '&' : '?';
      const partPrefix = index % 2 ? '=' : paramJoiner;
      url += partPrefix + encodeURIComponent(param);
    });

    return fetchJSON(url, resolve, reject);
  };

  debugInfo('Running promise…');

  const getData = (resolve, reject) => {
    let timeout;
    let dataUsed = false;

    const useData = (data, statusCode) => {
      if (dataUsed) {
        return;
      }

      dataUsed = true;
      clearTimeout(timeout);

      addStatusField(data, statusCode);
      saveDataToGlobals(data);

      resolve(data);
    };

    useCmp(() => { // FIXME: try read from cache and preconnect to api if cache hit is missed
      timeout = useTimeout(() => {
        useData({}, statusCodeTimeout);
      });

      checkSessionReferrer();

      return readDataFromCache((data) => {
        useData(data, statusCodeCache);
      }, () => (
        readDataFromWeb((data) => {
          saveDataToCache(data);

          useData(data, statusCodeWebSuccess);
        }, () => {
          useData({}, statusCodeWebError);
        })
      ));
    }, reject);
  };

  if (typeof callback === 'function') {
    getData(callback);
  }

  return {
    promise: () => new Promise(getData),
  };
};

export default {
  version,
  fetch,
};
