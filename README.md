Graphql Get Fragment Types
=======================================

Get fragment types from GraphQL schema.
* * *

Script to query the server schema to obtain the necessary information about unions and interfaces and write it to a file. As per the guide https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher

## Features

*   Accepts a custom URL to the API endpoint
*   Accepts a custom JWT token as input
*   Accepts a custom path to output
*   Reads .env files

## Download & Installation

```shell
$ yarn add -D graphql-getfragmenttypes
# or
$ npm install --save-dev graphql-getfragmenttypes
```

## Usage

```shell
# output help
$ node ./index.js --help

# Set flags for endpoint URL and output path
$ node ./index.js -u http://your.endpoint.url -o ./graphql/fragmentTypes.json

# call with token and in unsafe mode. See below
$ node index.js --unsafe --token AxLTFkODgyZjI2M2VhYyIsImlhdCI6MTU1MDE2NTYyNCwiZXhwIjoxNTUwMTY5Mj

# Call from project with preset path to self signed certificate
$ NODE_EXTRA_CA_CERTS='/full/path/to/SelfSigned.pem' node node_modules/graphql-getfragmenttypes
```

## Example in a project
#### 1. Install getFragmentTypes.js through yarn/npm
___
```shell
$ yarn add --dev graphql-getfragmenttypes
```

#### 2. Add Endpoint and Token to the project .env file
____
```shell
APP_GRAPHQL_ENDPOINT = 'http://your.endpoint.url'
APP_GRAPHQL_TOKEN = 'yourlongtokenhash'
```

#### 3. Add script as a task in your package.json. (Optionally prepended with path to certificate and custom output path.)
___
```json
{
  "scripts": {
    ...
    "fragments": "NODE_EXTRA_CA_CERTS='/full/path/to/SelfSigned.pem' node node_modules/graphql-getfragmenttypes -o ./graphql/fragmentTypes.json"
  },
  ...
}
```

#### 4. Call as script
____

```shell
$ yarn fragments
```


## Options

| OptionFlags | Alias | Default | Description |
| --- | --- | --- | --- |
|`--url`|`-u`||URL to the API Endpoint. Can also be set in .env file as APP_GRAPHQL_ENDPOINT|
|`--output`|`-o`|./fragmentTypes.json|Full path to output file.|
|`--token`|`-t`|| API endpoint token. Added to headers as "Bearer: {token}". Can be set in .env file as APP_GRAPHQL_TOKEN|
|`--unsafe`|`-z`|false|Warning - unsafe! Ignores if the server certificate failed verification against supplied CAs. Can be useful with private certificates in local environments but please first try extending well known CA with NODE_EXTRA_CA_CERTS (se example abow)|
|`--version`|||Shows current version|
|`--help`|||Shows help text|




## Authors
*   [Svale Fossåskaret](https://github.com/svale)

## License
MIT