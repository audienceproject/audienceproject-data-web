import FS from 'fs';
import Ava from 'ava';
import AudienceProjectData from './audienceproject-data-web.js'; // eslint-disable-line import/extensions

/* eslint-disable import/no-named-as-default-member */

Ava('export methods', (test) => {
  test.is(typeof AudienceProjectData, 'object');
  test.is(typeof AudienceProjectData.fetch, 'function');
});

Ava('export module and package', (test) => {
  const babelRC = JSON.parse(FS.readFileSync('./.babelrc'));
  test.is(AudienceProjectData.moduleName, babelRC.moduleId);

  const packageJSON = JSON.parse(FS.readFileSync('./package.json'));
  test.is(AudienceProjectData.packageName, packageJSON.name);
  test.is(AudienceProjectData.packageVersion, packageJSON.version);
});

Ava('export cache and states', (test) => {
  test.is(typeof AudienceProjectData.fetchCache, 'object');

  test.is(AudienceProjectData.fetchStateInitial, 'INITIAL');
  test.is(AudienceProjectData.fetchStateRunning, 'RUNNING');
  test.is(AudienceProjectData.fetchStateReady, 'READY');
  test.is(AudienceProjectData.fetchStateFailed, 'FAILED');
});

Ava('export status', (test) => {
  test.is(typeof AudienceProjectData.fetchStatus, 'object');
});
