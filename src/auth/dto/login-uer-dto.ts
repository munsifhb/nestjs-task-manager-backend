import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class LoginUserDto {
  
  @IsString()
  @IsNotEmpty()
  username: string;

 

  
  @IsNotEmpty()
  @IsString()
  password: string;
}