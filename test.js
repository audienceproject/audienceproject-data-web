import FS from 'fs';
import Ava from 'ava';
import AudienceProjectData from './audienceproject-data-web.js'; // eslint-disable-line import/extensions

/* eslint-disable import/no-named-as-default-member */

Ava('export methods', (test) => {
  test.is(typeof AudienceProjectData, 'object');
  test.is(typeof AudienceProjectData.fetch, 'function');
});

Ava('export name and package', (test) => {
  const babelRC = JSON.parse(FS.readFileSync('./.babelrc'));
  const packageJSON = JSON.parse(FS.readFileSync('./package.json'));

  test.is(AudienceProjectData.moduleName, babelRC.moduleId);
  test.is(AudienceProjectData.packageName, packageJSON.name);
  test.is(AudienceProjectData.packageVersion, packageJSON.version);
});
