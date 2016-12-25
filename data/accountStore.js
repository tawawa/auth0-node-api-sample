'use strict';

const Sequelize = require('sequelize'),
  Q = require("q");


var accountStore = function (config) {

  var deferred = Q.defer();

  const pgClient = new Sequelize(config.POSTGRES_DATABASE, config.POSTGRES_USERNAME, config.POSTGRES_PASSWORD, {
    host: config.POSTGRES_HOST,
    dialect: 'postgres'
  });

  const Account = pgClient.define('account', {
    id: {type: Sequelize.STRING, primaryKey: true},
    email: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    nickname: {type: Sequelize.STRING},
    employee_id: {type: Sequelize.STRING},
    company_code: {type: Sequelize.STRING},
    email_verified: {type: Sequelize.STRING},
  });

  Account.sync().then(() => {
    console.log('Postgres connection ready.');
    return deferred.resolve(Account);
  }, function (err) {
    return deferred.reject(new Error(err));
  });

  return deferred.promise;

};

module.exports = accountStore;

