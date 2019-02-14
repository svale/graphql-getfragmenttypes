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
 * add documentation
 * add tests
 *
 * @license MIT
 * @author Svale Fossåskaret <svale@3by5.no>
 */

const fs = require('fs')
const https = require('https')
const fetch = require('node-fetch')
const minimist = require('minimist')

// @todo: document
// ?? add option to set .env file path
require('dotenv').config()

var args = minimist(process.argv.slice(2), {
  string: [
    'env',
    'url',
    'output',
    'token'
  ],
  boolean: 'unsafe',
  alias: {
    e: 'env',
    u: 'url',
    z: 'unsafe',
    o: 'output',
    t: 'token'
  },
  default: {
    env: './.env',
    url: process.env.VUE_APP_GRAPHQL_HTTP,
    unsafe: false,
    output: './fragmentTypes.json',
    token: process.env.API_TOKEN || null
   },
})

// @todo: add path to certificate as input paramter ?
const options = {
  // key: fs.readFileSync(
  //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.key'
  // ),
  // cert: fs.readFileSync(
  //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.pem'
  // ),
  rejectUnauthorized: args.unsafe
}
const agent = new https.Agent(options)

/**
 * Add Authorization token (Bearer) to headers
 * @todo: document
 */
const headers = {
  'Content-Type': 'application/json',
}
if(args.token) {
  headers.Authorization = `Bearer ${args.token}`
}

/**
 *  fetch schema and get fragment types
 */
fetch(args.url, {
  agent,
  method: 'POST',
  headers,
  body: JSON.stringify({
    variables: {},
    query: `
        {
          __schema {
            types {
              kind
              name
              possibleTypes {
                name
              }
            }
          }
        }
      `
  })
})
.then(result => {
  if (!result.ok) {
    throw Error(result.statusText);
  }
  return result.json();
})
.then(result => {

  if(result.errors) {
    throw Error(result.errors[0].message);
  }

  if(result.data) {
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null
    )
    result.data.__schema.types = filteredData
    fs.writeFile(
      args.output,
      JSON.stringify(result.data),
      err => {
        if (err) {
          console.error('Error writing fragmentTypes file', err)
        } else {
          console.log('Fragment types successfully extracted!')
        }
      }
    )
    return true
  }
})
.catch(error => {
  console.log(error);
})

/**
 * Handle unhandled rejections
 * Just in case
 */
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})