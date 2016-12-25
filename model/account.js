'use strict';

var uuid = require('node-uuid');

module.exports = function (email, password, nickname, email_verified, employee_id, company_code) {
  this.id = uuid.v1();
  this.email = email;
  this.password = password;
  this.nickname = nickname;
  this.email_verified = email_verified;
  this.employee_id = employee_id;
  this.company_code = company_code;
};
