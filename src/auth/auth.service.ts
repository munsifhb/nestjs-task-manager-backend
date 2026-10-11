import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register-use-dto';
import { CreateUserDto } from 'src/user/dto/create-user-dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-uer-dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService : ConfigService
  ) {}

  async registerUser(user : RegisterUserDto){

    const existingUsername = await this.userService.findByUsername(user.username);

if (existingUsername) {
  throw new ConflictException('Username already exists');
}


const existingEmail = await this.userService.findByEmail(user.email);

if (existingEmail) {
  throw new ConflictException('Email already exists');
}


    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser: CreateUserDto = {
  ...user,
  password: hashedPassword,
  role: Role.USER,
};

  return this.userService.createUser(newUser);

  }

  async loginUser(user: LoginUserDto) {
  const existingUser = await this.userService.findByUsername(user.username);

  if (!existingUser) {
  throw new UnauthorizedException('Invalid username or password');
}

const isPasswordValid = await bcrypt.compare(
  user.password,
  existingUser.password,
);

if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid username or password');
}

const payload = {
  sub: existingUser.id,
  username: existingUser.username,
  role: existingUser.role,
};

const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');


const accessToken = this.jwtService.sign(payload ,{
  secret: accessSecret,
  expiresIn: '15m',
  });
const refreshToken = this.jwtService.sign(payload, {
  
  secret: refreshSecret,
  expiresIn: '7d',
})

const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

await this.userService.updateRefreshToken(
  existingUser.id,
  hashedRefreshToken,
);
return{
  accessToken: accessToken,
  refreshToken: refreshToken
} ;
}

async getMe(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    return user;
}

async refreshTokens(refreshToken: string) {

  let payload: {
  sub: number;
  username: string;
  role: Role;
};

 try {
  payload = await this.jwtService.verifyAsync(refreshToken, {
  secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
});}catch{
  throw new UnauthorizedException('Invalid refresh token');
}

const user = await this.userService.findById(payload.sub);

if (!user || !user.refreshToken) {
  throw new UnauthorizedException('Invalid refresh token');
}

const isRefreshTokenValid = await bcrypt.compare(
  refreshToken,
  user.refreshToken,
);

if (!isRefreshTokenValid) {
  throw new UnauthorizedException('Invalid refresh token');
}

const newAccessToken = this.jwtService.sign(
  {
    sub: user.id,
    username: user.username,
    role: user.role,
  },
  {
    secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    expiresIn: '15m',
  },
);

const newRefreshToken = this.jwtService.sign(
  {
    sub: user.id,
    username: user.username,
    role: user.role,
  },
  {
    secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    expiresIn: '7d',
  },
);

const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

await this.userService.updateRefreshToken(
  user.id,
  hashedNewRefreshToken,
);

return {
  accessToken: newAccessToken,
  refreshToken: newRefreshToken,
};

}

async logout(userId: number) {
  await this.userService.updateRefreshToken(userId, null);
}
}