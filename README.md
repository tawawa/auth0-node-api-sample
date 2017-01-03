# What is it?

A sample Resource API with CRUD ops protected by JWT scopes (access_token) & postgres backend
The domain object (account) corresponds to a typical Auth0 Custom DB table and this API can
therefore act as a webservice fronting Postgres for Custom DB HTTP endpoint access (from Rules, Custom DB Scripts or other webtasks).

## Companion Repo

See [auth0-react-redux-api-client](https://github.com/tawawa/auth0-react-redux-api-client)

## Running locally

To run the sample extension locally:

Rename `.env.sample` as `.env` and add the required values for each key value pair.

```bash
$ npm install
$ npm start
```

Alternatively, just do `node server.js` - useful for running in debug mode etc


Then go to `http://localhost:3001/api/v1/accounts`

## To use as Custom DB

The endpoints include the REST endpoints to handle account management & custom signup requirements from within an application - see companion React-Redux project for insights on a UI layer to this API.

However, this project also includes endpoints for integration with the Auth0 Custom DB scripts. To run the API locally yet have it called from Auth0 Dashboard scripts, use ngrok to expose your locally running instance over the internet.

Install `ngrok` using `npm i ngrok -g`

To expose the running application over internet use:

`ngrok http 3001 -bind-tls=false`

Now use the generated endpoints in configuration.ENDPOINT etc of your custom db scripts.


## Deploying as Webtask 

Rename `.env.sample` as `.env` and add the required values for each key value pair.

```bash
$ ./deploy 
```

Then go to your webtask URL endpoint + `/api/v1/accounts`


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
