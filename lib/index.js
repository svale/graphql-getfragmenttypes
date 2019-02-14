#!/usr/bin/env node

'use strict';

/**
 * getFragmentTypes.js
 *
 * Simple node script to Query your server / schema to obtain the necessary
 * information about unions and interfaces and write it to a file.
 *
 * As per https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
 *
 * Work in progress
 * @todo:
 * add more documentation
 * add tests
 *
 * @license MIT
 * @author Svale Fossåskaret <svale@3by5.no>
 */

var fs = require('fs');
var https = require('https');
var fetch = require('node-fetch');
var meow = require('meow');
require('dotenv').config(); // @todo: add option to set .env file path ??


/**
 * getFragmetypes
 *
 * @param {object} flags input flags parsed by meow
 */
var getFragmentTypes = function getFragmentTypes(flags) {

  // set agent options
  // @todo: add path to certificate as input paramter ?
  var httpsOptions = {
    // key: fs.readFileSync(
    //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.key'
    // ),
    // cert: fs.readFileSync(
    //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.pem'
    // ),
    rejectUnauthorized: !flags.unsafe
  };
  var agent = new https.Agent(httpsOptions);

  // Add Authorization token (Bearer) to headers
  var headers = {
    'Content-Type': 'application/json'
  };
  if (flags.token) {
    headers.Authorization = 'Bearer ' + flags.token;
  }

  /**
   *  fetch schema and get fragment types
   */
  fetch(flags.url, {
    agent: agent,
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      variables: {},
      query: '\n          {\n            __schema {\n              types {\n                kind\n                name\n                possibleTypes {\n                  name\n                }\n              }\n            }\n          }\n        '
    })
  }).then(function (result) {
    if (!result.ok) {
      throw Error(result.statusText);
    }
    return result.json();
  }).then(function (result) {
    if (result.errors) {
      throw Error(result.errors[0].message);
    }
    if (result.data) {
      // here we're filtering out any type information unrelated to unions or interfaces
      var filteredData = result.data.__schema.types.filter(function (type) {
        return type.possibleTypes !== null;
      });
      result.data.__schema.types = filteredData;
      fs.writeFile(flags.output, JSON.stringify(result.data), function (err) {
        if (err) {
          console.error('Error writing fragmentTypes file', err);
        } else {
          console.log('Fragment types successfully extracted!');
        }
      });
      return true;
    }
  }).catch(function (error) {
    console.log(error);
  });
};

// Helpstring for meow
var help = '\n  Usage\n    $ node index.js [flags]\n\n  Options\n    --url, -u     URL to the API Endpoint.\n                  Can also be set in .env file as APP_GRAPHQL_ENDPOINT\n    --output, -o  Full path to outputfile. Defaults to \'./fragmentTypes.json\'\n    --token, -t   API endpoint token. Added to headers as "Bearer: {token}"\n                  Can be set in .env file as APP_GRAPHQL_TOKEN\n    --unsafe -z   Warning - unsafe! Disable test for Certificats.\n                  Can be useful with private certificates in local environment but please\n                  first try extending well known CA with NODE_EXTRA_CA_CERTS (se example below)\n  Examples\n    $ node index.js -u http://your.endpoint.url -o ./graphql/fragmentTypes.json\n    $ node index --unsafe --token AxLTFkODgyZjI2M2VhYyIsImlhdCI6MTU1MDE2NTYyNCwiZXhwIjoxNTUwMTY5Mj\n    $ NODE_EXTRA_CA_CERTS=\'/full/path/to/SelfSigned.pem\' node node_modules/graphql-getfragmenttypes\n';
// options for meow
var options = {
  booleanDefault: undefined,
  flags: {
    url: {
      type: 'string',
      alias: 'u',
      default: process.env.APP_GRAPHQL_ENDPOINT
    },
    output: {
      type: 'string',
      alias: 'o',
      default: './fragmentTypes.json'
    },
    token: {
      type: 'string',
      alias: 't',
      default: process.env.APP_GRAPHQL_TOKEN || false
    },
    unsafe: {
      type: 'boolean',
      alias: 'z',
      default: false
    }
  }
};

var _meow = meow(help, options),
    flags = _meow.flags;

getFragmentTypes(flags);

/**
* Handle unhandled rejections  - just in case
*/
process.on('unhandledRejection', function (reason, promise) {
  console.log('Unhandled Rejection at:', reason.stack || reason);
});