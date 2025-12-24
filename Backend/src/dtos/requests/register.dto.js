class RegisterDto {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.confirmPassword = data.confirmPassword;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }

  validate() {
    const errors = [];

    if (!this.username) {
      errors.push("Username is required");
    }

    if (!this.email) {
      errors.push("Email is required");
    }

    if (!this.password) {
      errors.push("Password is required");
    }

    if (this.password !== this.confirmPassword) {
      errors.push("Passwords do not match");
    }

    return errors;
  }
}

module.exports = RegisterDto;
