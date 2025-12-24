const bcrypt = require("bcryptjs");
const UserEntity = require("../entities/user.entity");
const TokenService = require("./token.service");
const { ConflictError, UnauthorizedError } = require("../errors/http-errors");

class AuthService {
  constructor(userRepository, sessionRepository) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.tokenService = new TokenService();
  }

  async register(registerDto) {
    const existsByEmail = await this.userRepository.existsByEmail(
      registerDto.email
    );
    if (existsByEmail) {
      throw new ConflictError("Email already registered");
    }

    const existsByUsername = await this.userRepository.existsByUsername(
      registerDto.username
    );
    if (existsByUsername) {
      throw new ConflictError("Username already taken");
    }

    const passwordHash = await this.hashPassword(registerDto.password);

    const userEntity = new UserEntity({
      username: registerDto.username,
      email: registerDto.email,
      password_hash: passwordHash,
      first_name: registerDto.firstName,
      last_name: registerDto.lastName,
      is_active: true,
    });

    const createdUser = await this.userRepository.create(userEntity);

    const tokens = await this.tokenService.generateTokens(createdUser);
    await this.sessionRepository.create(
      createdUser.id,
      tokens.tokenHash,
      tokens.expiresAt
    );
    await this.userRepository.updateLastLogin(createdUser.id);

    return { user: createdUser.toDTO(), ...tokens };
  }

  async login(loginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedError("Invalid email or password");
    if (!user.isAccountActive())
      throw new UnauthorizedError("Account is deactivated");

    const isPasswordValid = await this.verifyPassword(
      loginDto.password,
      user.passwordHash
    );
    if (!isPasswordValid)
      throw new UnauthorizedError("Invalid email or password");

    const tokens = await this.tokenService.generateTokens(user);
    await this.sessionRepository.create(
      user.id,
      tokens.tokenHash,
      tokens.expiresAt
    );
    await this.userRepository.updateLastLogin(user.id);

    return { user: user.toDTO(), ...tokens };
  }

  async logout(tokenHash) {
    await this.sessionRepository.invalidate(tokenHash);
    return { message: "Logout successful" };
  }

  async verifyToken(token) {
    const decoded = await this.tokenService.verifyToken(token);
    const tokenHash = this.tokenService.hashToken(token);

    const session = await this.sessionRepository.isValid(tokenHash);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isAccountActive()) {
      throw new Error("Account is deactivated");
    }

    return user.toDTO();
  }

  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = AuthService;
