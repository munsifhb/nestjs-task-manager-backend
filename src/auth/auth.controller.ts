import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-use-dto';
import { LoginUserDto } from './dto/login-uer-dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
};

@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService){}


 
    @Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Request() req) {
    const user = await this.authService.getMe(req.user.sub);

    return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    };
}

    @Post('register')
    async registerUser(@Body() user : RegisterUserDto){
        return this.authService.registerUser(user)
    }


    @Post('login')
  async loginUser(@Body() user: LoginUserDto, @Res({ passthrough: true }) response: Response,) {

    const { accessToken, refreshToken } =
  await this.authService.loginUser(user);


    response.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
});

response.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

    return {
        message: 'Login successful',
    };
  }

@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(
  @Request() req,
  @Res({ passthrough: true }) response: Response,
) {
  await this.authService.logout(req.user.sub);

  

response.clearCookie('accessToken', cookieOptions);
response.clearCookie('refreshToken', cookieOptions);

  return {
    message: 'Logged out successfully',
  };
}



@Post('refresh')
async refresh(
  @Request() req,
  @Res({ passthrough: true }) response: Response,
) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token not found');
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await this.authService.refreshTokens(refreshToken);

response.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
});

response.cookie('refreshToken', newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

  return { message: 'Tokens refreshed successfully' };
}
}
