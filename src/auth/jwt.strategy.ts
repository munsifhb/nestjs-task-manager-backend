import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(configService: ConfigService) {
      const accessSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  super({
    jwtFromRequest: (request) => request?.cookies?.accessToken,
    secretOrKey: accessSecret,
  });
}

validate(payload: any) {
  return payload;
}

}