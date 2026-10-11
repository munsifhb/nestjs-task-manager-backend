import {
    BadRequestException,
Body,
Controller,
Delete,
Get,
Param,
ParseIntPipe,
Patch,
Post,
Request,
UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('users')
export class UserController {
constructor(private userService: UserService) {}

// Get all users - Admin only
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get()
async getUser() {
return this.userService.getUsers();
}

// Create user
@Post()
async createUser(@Body() user: CreateUserDto) {
return this.userService.createUser(user);
}

// Delete user - Admin only
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
async deleteUser(
@Param('id', ParseIntPipe) id: number,
) {
return this.userService.deleteUser(id);
}

// Edit own profile - Authenticated user
@UseGuards(JwtAuthGuard)
@Patch(':id')
async editUser(
@Param('id', ParseIntPipe) id: number,
@Body() updateUserDto: UpdateUserDto,
@Request() req,
) {
return this.userService.editUser(
id,
updateUserDto,
req.user.sub,
);
}

// Update user role - Admin only
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Patch(':id/role')
async updateUserRole(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUserDto: UpdateUserDto,
) {
  if (!updateUserDto.role) {
    throw new BadRequestException('Role is required');
  }

  return this.userService.updateUserRole(
    id,
    updateUserDto.role,
  );
}
}
