#!/usr/bin/env node

'use strict'

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

const fs = require('fs')
const https = require('https')
const fetch = require('node-fetch')
const meow = require('meow')
require('dotenv').config() // @todo: add option to set .env file path ??

/**
 * getFragmetypes
 *
 * @param {object} flags input flags parsed by meow
 */
const getFragmentTypes = flags => {
  // set agent options
  // @todo: add path to certificate as input paramter ?
  const httpsOptions = {
    // key: fs.readFileSync(
    //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.key'
    // ),
    // cert: fs.readFileSync(
    //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.pem'
    // ),
    rejectUnauthorized: !flags.unsafe,
  }
  const agent = new https.Agent(httpsOptions)

  // Add Authorization token (Bearer) to headers
  const headers = {
    'Content-Type': 'application/json',
  }
  if (flags.token) {
    headers.Authorization = `Bearer ${flags.token}`
  }

  /**
   *  fetch schema and get fragment types
   */
  fetch(flags.url, {
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
        `,
    }),
  })
    .then(result => {
      if (!result.ok) {
        throw Error(result.statusText)
      }
      return result.json()
    })
    .then(result => {
      if (result.errors) {
        throw Error(result.errors[0].message)
      }
      if (result.data) {
        // here we're filtering out any type information unrelated to unions or interfaces
        const filteredData = result.data.__schema.types.filter(
          type => type.possibleTypes !== null
        )
        result.data.__schema.types = filteredData
        fs.writeFile(flags.output, JSON.stringify(result.data), err => {
          if (err) {
            console.error('Error writing fragmentTypes file', err)
          } else {
            console.log('Fragment types successfully extracted!')
          }
        })
        return true
      }
    })
    .catch(error => {
      console.log(error)
    })
}

// Helpstring for meow
const help = `
  Usage
    $ node index.js [flags]

  Options
    --url, -u     URL to the API Endpoint.
                  Can also be set in .env file as APP_GRAPHQL_ENDPOINT
    --output, -o  Full path to outputfile. Defaults to './fragmentTypes.json'
    --token, -t   API endpoint token. Added to headers as "Bearer: {token}"
                  Can be set in .env file as APP_GRAPHQL_TOKEN
    --unsafe -z   Warning - unsafe! Disable test for Certificats.
                  Can be useful with private certificates in local environment but please
                  first try extending well known CA with NODE_EXTRA_CA_CERTS (se example below)
  Examples
    $ node index.js -u http://your.endpoint.url -o ./graphql/fragmentTypes.json
    $ node index --unsafe --token AxLTFkODgyZjI2M2VhYyIsImlhdCI6MTU1MDE2NTYyNCwiZXhwIjoxNTUwMTY5Mj
    $ NODE_EXTRA_CA_CERTS='/full/path/to/SelfSigned.pem' node node_modules/graphql-getfragmenttypes
`
// options for meow
const options = {
  booleanDefault: undefined,
  flags: {
    url: {
      type: 'string',
      alias: 'u',
      default: process.env.APP_GRAPHQL_ENDPOINT,
    },
    output: {
      type: 'string',
      alias: 'o',
      default: './fragmentTypes.json',
    },
    token: {
      type: 'string',
      alias: 't',
      default: process.env.APP_GRAPHQL_TOKEN || false,
    },
    unsafe: {
      type: 'boolean',
      alias: 'z',
      default: false,
    },
  },
}

const { flags } = meow(help, options)
getFragmentTypes(flags)

/**
 * Handle unhandled rejections  - just in case
 */
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})
