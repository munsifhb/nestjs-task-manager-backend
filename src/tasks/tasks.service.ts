import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPriority } from './dto/create-task.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task-dto';





@Injectable()
export class TasksService {

  constructor(
    private prisma: PrismaService,
  ) {}

  
  
    

    async getTasks(userId : number) {
  return await this.prisma.task.findMany({
    where:{
      userId,
    },
  });


}

    async createTask(task: CreateTaskDto, userId: number) {
      return await this.prisma.task.create({
        data: {
      title: task.title,
      description: task.description,
      priority: task.priority ?? TaskPriority.LOW,
      dueDate: new Date(task.dueDate),
         user: {
  connect: {
    id: userId,
  },
}
    },
 
      })
}

 async deleteTask(id: number, userId: number) {
  const task = await this.prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  await this.prisma.task.delete({
    where: {
      id,
    },
  });

  return {
    message: 'Task deleted successfully',
  };
}


async updateTask(
  id: number,
  updateTaskDto: UpdateTaskDto,
  userId: number,
) {
  const task = await this.prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  return await this.prisma.task.update({
    where: {
      id,
    },
    data: updateTaskDto,
  });
}



async searchTask(
  title : string, userId : number
){
  return await this.prisma.task.findMany({
  where: {
    title: {
      contains: title,
      mode: 'insensitive',
    },
    userId,
  },
});
  
}

async filterTask(
  userId : number, completed? : boolean,
){

  

  return await this.prisma.task.findMany({
    where : {
    
         ...(completed !== undefined && { completed }),
         userId,
      
    }
  })

  
}

  }
