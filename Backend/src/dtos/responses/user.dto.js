class UserDto {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.getFullName ? user.getFullName() : null;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.lastLogin = user.lastLogin;
  }

  static fromEntity(user) {
    return new UserDto(user);
  }

  static fromArray(users) {
    return users.map((user) => new UserDto(user));
  }
}

module.exports = UserDto;
