'use strict';

var request = require('request');
var jwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
const boom = require('../lib/boom');
var metadata = require('./../webtask.json');
var config = require('./../config');


var routes = (app, router) => {
  var init = false;
  var accounts;
  app.use(boom());
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

  var isAllowedIp = (req) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var ips = config.ALLOWED_IP_LIST ? config.ALLOWED_IP_LIST.split(',') : [];
    return ips.indexOf(ip) !== -1;
  }

  router.get('/accounts', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'read:accounts')) {
      return res.boom.forbidden('Incorrect scopes');
    }

    accounts.getAccounts((err, accounts) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      console.log(`${accounts.length} accounts found`);
      res.json(accounts);
    });

  });

  router.get('/accounts/:id', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'read:account')) {
      return res.boom.forbidden('Incorrect scopes');
    }

    accounts.getAccountById(req.params.id, (err, account) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      console.log('Account found');
      res.json(account);
    });
  });

  router.post('/accounts', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'create:account')) {
      return res.boom.forbidden('Incorrect scopes');
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
        return res.boom.badRequest(err);
      }
      console.log('Account created');
      res.json(account);
    });

  });

  router.put('/accounts/:id', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'update:account')) {
      return res.boom.forbidden('Incorrect scopes');
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
          return res.boom.badRequest(err);
        }
        console.log('Account updated');
        res.json(account);
      });
    });

  });

  router.delete('/accounts/:id', jwtCheck, function (req, res) {

    if (!hasRequiredScope(req, 'delete:account')) {
      return res.boom.forbidden('Incorrect scopes');
    }

    accounts.deleteAccountById(req.params.id, (err) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      console.log('Account deleted');
      res.json({message: 'Deleted'});
    });
  });


  // CUSTOM DB ENDPOINTS - here username is employeeId, company code is expected too, and so is password

  router.post('/loginByEmployeeId', function (req, res) {
    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    var employee_id = req.body.employee_id;
    var company_code = req.body.company_code;
    var password = req.body.password;

    if (!employee_id || !company_code || !password) {
      return res.boom.badRequest('employee_id, company_code and password all required');
    }

    // find the user by employeeId, companyCode and password
    accounts.loginByEmployeeId(employee_id, company_code, password, (err, account) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      console.log('Account found');
      res.json(account);
    });

  });

  router.post('/loginByEmail', function (req, res) {

    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
      return res.boom.badRequest('email and password are required');
    }

    // find the user by employeeId, companyCode and password
    accounts.loginByEmail(email, password, (err, account) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      console.log('Account found');
      res.json(account);
    });

  });

  /*
  * Routes to come from Auth0
  */
  router.post('/create/account', function (req, res) {
    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    var email = req.body.email;
    var password = req.body.password;
    var nickname = req.body.nickname;
    var email_verified = req.body.email_verified ? req.body.email_verified : 'false';
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
  // Verify email
  router.get('/verify/account', function (req, res) {
    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    var email = req.query.email;
    var email_verified = req.query.email_verified || 'true';
    if (!email) {
      return res.boom.badRequest('email is required')
    }
    accounts.getAccountByEmail(email, (err, account) => {
      if (err) {
        console.error(err);
        return resb.boom.badRequest(err);
      }
      var accountId = account.id;
      // update values
      var data = {};
      data.email_verified = email_verified || account.email_verified;
      accounts.updateAccountById(accountId, data, (error, updatedAccount) => {
        if (error) {
          return res.boom.badRequest(error);
        }
        account.email_verified = email_verified;
        console.log('Account verified');
        console.log(account);
        res.json({
          message: 'Account verified'
        });
      });
    });
  });
  //Get User
  router.get('/account', function (req, res) {
    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    var email = req.query.email;
    if (!email) {
      return res.boom.badRequest('email are required');
    }
    accounts.getAccountByEmail(email, (err, account) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      res.json(account);
    });
  });
  // Change Password
  router.post('/change_password/account', function (req, res) {
    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    var email = req.body.email;
    var new_password = req.body.new_password;
    if (!email || !new_password) {
      return res.boom.badRequest('email and new password are required');
    }
    accounts.getAccountByEmail(email, (err, account) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
      }
      if (!account) {
        return res.boom.notFound('User not found');
      }
      var accountId = account.id;
      // update values
      var data = {};
      data.password = new_password;
      accounts.updateAccountById(accountId, data, (error, updatedAccount) => {
        if (error) {
          return res.boom.badRequest(error);
        }
        console.log('Account Password changed');
        res.json({
          message: 'Account Password Changed'
        });
      });
    });
  });
  // Delete Account
  router.delete('/remove/account/:id', function (req, res) {
    if (!isAllowedIp(req)) {
      return res.boom.forbidden('Forbidden');
    }
    accounts.deleteAccountById(req.params.id, (err) => {
      if (err) {
        console.error(err);
        return res.boom.badRequest(err);
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
