'use strict';

var R = require('ramda'),
  Account = require('./../model/account'),
  Q = require("q");

var accounts = function (config) {

  var AccountStore;

  function createAccount(email, password, nickname, email_verified, employee_id, company_code, callback) {
    let account = new Account(email, password, nickname, email_verified, employee_id, company_code);
    AccountStore.create(account).then((account) => {
      if (!account) {
        return callback('Could not create account');
      }
      callback(null, account.dataValues);
    });
  }

  function getAccountByEmail(email, callback) {
    AccountStore.find({
      where: {email: email}
    }).then((account) => {
      if (!account) {
        return callback('Could not find account.');
      }
      callback(null, account.dataValues);
    });
  }

  function getAccountById(accountId, callback) {
    AccountStore.find({
      where: {id: accountId}
    }).then((account) => {
      if (!account) {
        return callback('Could not find account.');
      }
      callback(null, account.dataValues);
    });
  }

  function getAccounts(callback) {
    AccountStore.findAll({
      attributes: ['id', 'email', 'password', 'nickname', 'email_verified', 'employee_id', 'company_code']
    }).then((accounts) => {
      if (!accounts) {
        return callback('Could not find accounts.');
      }
      var extract = (dataItem) => {
        return dataItem.dataValues;
      };
      callback(null, R.map(extract, accounts));
    });
  }

  function updateAccountById(accountId, user, callback) {
    AccountStore.update(
      user,
      {where: {id: accountId}}
    ).then(function (rowUpdated) {
      if (!rowUpdated && rowUpdated[0] === 1) {
        return callback('Could not update account')
      }
      callback();
    }).catch(err => {
      console.error(err);
      return callback('Could not update account')
    });
  }

  function deleteAccountById(accountId, callback) {
    AccountStore.destroy({
      where: {id: accountId}
    }).then(function (rowDeleted) {
      if (!rowDeleted) {
        return callback('Could not delete account')
      }
      console.log('Deleted successfully');
      return callback();
    }, function (err) {
      console.error(err);
      return callback('Could not delete account')
    });
  }

  var api = {
    createAccount,
    getAccountByEmail,
    getAccountById,
    getAccounts,
    updateAccountById,
    deleteAccountById
  };

  var deferred = Q.defer();

  require('./accountStore')(config).then(function (Account) {
    AccountStore = Account;
    return deferred.resolve(api);
  }, function (err) {
    return deferred.reject(new Error(err));
  });

  return deferred.promise;

};

module.exports = accounts;
