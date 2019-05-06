const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateLogin(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.username = !isEmpty(data.username) ? data.username : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.email) & Validator.isEmpty(data.username)) {
    errors.email = "Must provide either email or username...";
  }

  if (Validator.isEmail(data.password)) {
    errors.email = "Password field required...";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
