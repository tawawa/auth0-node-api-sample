'use strict';

var request = require('request');
var jwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
const Boom = require('boom');
var metadata = require('./../webtask.json');
var config = require('./../config');


var routes = (app, router) => {

  var init = false;
  var accounts;

  app.use(function (req, res, next) {
    config.setVars(req);
    if (!init) {
      require('./../data/accounts')(config).then(function (api) {
        accounts = api;
        init = true;
        next();
      }, function (err) {
        throw new Error(err);
      });
    } else {
      next();
    }
  });

  var jwtCheck = jwt({
    secret: rsaValidation(),
    algorithms: ['RS256'],
    issuer: config.AUTH0_ISSUER,
    audience: config.AUTH0_AUDIENCE
  });

  app.use('/api/v1', router);


  var hasRequiredScope = (req, requiredScope) => {
    if (!req.user) {
      return false;
    } else if (!req.user.scope) {
      return false;
    }
    var scopes = req.user.scope.split(' ');
    console.log(scopes);
    return scopes.indexOf(requiredScope) !== -1;
  };

  router.get('/accounts', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'read:accounts')) {
      return res.status(401).json({
        message: 'Unauthorized - incorrect scopes'
      });
    }

    accounts.getAccounts((err, accounts) => {
      if (err) {
        console.error(err);
        return res(Boom.badRequest(err));
      }
      console.log(`${accounts.length} accounts found`);
      res.json(accounts);
    });

  });

  router.get('/accounts/:id', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'read:account')) {
      return res.status(401).json({
        message: 'Unauthorized - incorrect scopes'
      });
    }

    accounts.getAccountById(req.params.id, (err, account) => {
      if (err) {
        console.error(err);
        return res(Boom.badRequest(err));
      }
      console.log('Account found');
      res.json(account);
    });
  });

  router.post('/accounts', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'create:account')) {
      return res.status(401).json({
        message: 'Unauthorized - incorrect scopes'
      });
    }

    var email = req.body.email;
    var password = req.body.password;
    var nickname = req.body.nickname;
    var email_verified = req.body.email_verified;
    var employee_id = req.body.employee_id;
    var company_code = req.body.company_code;

    accounts.createAccount(email, password, nickname, email_verified, employee_id, company_code, (err, account) => {
      if (err) {
        console.error(err);
        return res(Boom.badRequest(err));
      }
      console.log('Account created');
      res.json(account);
    });

  });

  router.put('/accounts/:id', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'update:account')) {
      return res.status(401).json({
        message: 'Unauthorized - incorrect scopes'
      });
    }

    accounts.getAccountById(req.params.id, (err, account) => {
      if (err) {
        console.error(err);
        return res(Boom.badRequest(err));
      }
      console.log('Account found');
      var accountId = account.id;
      // update values
      var data = {};
      data.email = req.body.email || account.email;
      data.password = req.body.password || account.password;
      data.nickname = req.body.nickname || account.nickname;
      data.email_verified = req.body.email_verified || account.email_verified;
      data.employee_id = req.body.employee_id || account.employee_id;
      data.company_code = req.body.company_code || account.company_code;

      accounts.updateAccountById(accountId, data, (err, account) => {
        if (err) {
          console.error(err);
          return res(Boom.badRequest(err));
        }
        console.log('Account updated');
        res.json(account);
      });
    });

  });

  router.delete('/accounts/:id', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'delete:account')) {
      return res.status(401).json({
        message: 'Unauthorized - incorrect scopes'
      });
    }

    accounts.deleteAccountById(req.params.id, (err) => {
      if (err) {
        console.error(err);
        return res(Boom.badRequest(err));
      }
      console.log('Account deleted');
      res.json({message: 'Deleted'});
    });
  });

  // This endpoint would be called by webtask-gallery to dicover your metadata
  app.get('/meta', function (req, res) {
    res.status(200).send(metadata);
  });

};

module.exports = routes;
