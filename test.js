import FS from 'fs';
import Ava from 'ava';
import AudienceProjectDataWeb, { fetch } from './audienceproject-data-web.js'; // eslint-disable-line import/extensions

/* eslint-disable import/no-named-as-default-member */

Ava('export methods', (test) => {
  test.is(typeof AudienceProjectDataWeb, 'object');
  test.is(typeof AudienceProjectDataWeb.fetch, 'function');
  test.is(typeof fetch, 'function');
});

Ava('export version', (test) => {
  const packageJSON = JSON.parse(FS.readFileSync('./package.json'));

  test.is(AudienceProjectDataWeb.version, packageJSON.version);
});
