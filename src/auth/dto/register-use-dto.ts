import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsStrongPassword,
} from "class-validator";

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber('NG')
  phone: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}