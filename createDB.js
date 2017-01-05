var configuration = {
  ENDPOINT_LOCAL: 'http://localhost:3001'
};
var user = {
  email: 'richard.seldon@auth0.com',
  password: 'password',
  user_metadata: {
    nickname: 'arcseldon',
    email_verified: 'false',
    employee_id: '1234',
    company_code: '9999'
  }
}

function create(user, callback) {

  var request = require('request');

  // DEBUG ONLY
  console.log('@@@ create - start @@@');
  console.log('user: ' + JSON.stringify(user));

  var API_ENDPOINT = configuration.ENDPOINT_LOCAL + "/api/v1/create/account";

  user.user_metadata = user.user_metadata || {};

  request.post({
    url: API_ENDPOINT,
    headers: {
      host: '127.0.0.1'
    },
    json: {
      email: user.email,
      password: user.password,
      nickname: user.user_metadata.nickname,
      employee_id: user.user_metadata.employee_id,
      company_code: user.user_metadata.company_code,
      email_verified: 'false'
    }

  }, function (err, response, body) {
    console.log('CREATE: Response status code: ' + response.statusCode);
    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200 && response.statusCode != 201) {
      return callback(new Error('Forbidden'));
    }
    console.log('@@@ create - end @@@');
    callback(null, body);
  });
};

create(user, function (err, cb) {
  console.log(err);
  console.log(cb);
});
