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
 * - error handling
 *
 * @license MIT
 * @author Svale Fossåskaret <svale@3by5.no>
 */

const fs = require('fs')
const https = require('https')
const fetch = require('node-fetch')
const args = require('minimist')(process.argv.slice(2))

// @todo: document
const dotEnvPath =
  args.e ||
  args.env ||
  './.env'

require('dotenv').config({ path: dotEnvPath })

// @todo: document
const httpEndpoint =
  args.u ||
  args.url ||
  process.env.VUE_APP_GRAPHQL_HTTP

// @todo: document
const token =
  args.t ||
  args.token ||
  process.env.API_TOKEN

// @todo: document
const rejectUnauthorized =
  args.z ||
  args.unsafe ||
  false

// @todo: add path to certificate as input paramter ?
const options = {
  // key: fs.readFileSync(
  //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.key'
  // ),
  // cert: fs.readFileSync(
  //   '/Users/svale/.config/valet/CA/LaravelValetCASelfSigned.pem'
  // ),
  rejectUnauthorized
}

const agent = new https.Agent(options)

fetch(httpEndpoint, {
  agent: agent,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
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
  .then(result => result.json())
  .then(result => {
    // console.log(result)
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null
    )
    result.data.__schema.types = filteredData
    fs.writeFile(
      './graphql/fragmentTypes.json', // @todo: setting for output path
      JSON.stringify(result.data),
      err => {
        if (err) {
          console.error('Error writing fragmentTypes file', err)
        } else {
          console.log('Fragment types successfully extracted!')
        }
      }
    )
  })
