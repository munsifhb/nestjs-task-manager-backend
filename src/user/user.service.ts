import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import { Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user-dto';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {

    constructor(
        private prisma: PrismaService,
      ) {}

      async getUsers() {
        return  this.prisma.user.findMany()
      }

    
    //   create User 
    async createUser(createUserDto : CreateUserDto) {
        return await this.prisma.user.create({
            data : {
                ...createUserDto,
            }
        })
    }

    // update user role by admin

    async updateUserRole(id: number, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
      },
    });
  }



    // delete user

    async deleteUser(id : number) {
        try {
            await this.prisma.user.delete({
                where : {
                    id,
                }
            })

            return {
                message : "User deleted sucessfully."
            }
        }catch (error) {
            if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new NotFoundException(`User with id ${id} not found`);
          }
        
          throw error;
          }
    }

    // EditUser 
async editUser(
  id: number,
  updateUserDto: UpdateUserDto,
  userId: number,
) {
  const user = await this.prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (id !== userId) {
    throw new ForbiddenException(
      'You can only edit your own account',
    );
  }

  return this.prisma.user.update({
    where: { id },
    data: updateUserDto,
  });
}

// refresh token


async updateRefreshToken(userId: number, hashedRefreshToken: string | null) {
  return this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: hashedRefreshToken,
    },
  });
}

    async findByUsername(username: string) {
  return this.prisma.user.findUnique({
    where: {
      username: username,
    },
  });
}

async findByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async findById(id: number) {
    return this.prisma.user.findUnique({
        where: {
            id,
        },
    });
}


}
