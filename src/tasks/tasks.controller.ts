import { Controller, Get, Post, Patch, Body, Delete, Param, BadRequestException, Query, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task-dto';
import { ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
// type Task = {
//   title: string;
//   description: string;
//   priority: string;
//   dueDate : number;
// };

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('admin-test')
adminTest() {
  return {
    message: 'Welcome Admin',
  };
}

  @UseGuards(JwtAuthGuard)
  @Get()
async getTasks(@Request() req) {
  return this.tasksService.getTasks(req.user.sub);
}

@UseGuards(JwtAuthGuard)
  @Post()
async createTask(@Body() task: CreateTaskDto, @Request() req, ) {
  return await this.tasksService.createTask(task, req.user.sub);
}


@UseGuards(JwtAuthGuard)
@Delete(':id')
deleteTask(@Param('id')  id : string, @Request() req,) {
  return this.tasksService.deleteTask(Number(id), req.user.sub)
}


@UseGuards(JwtAuthGuard)
@Patch(':id')
updateTask(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateTaskDto: UpdateTaskDto, @Request() req
) {
  return this.tasksService.updateTask(id, updateTaskDto, req.user.sub);
}


@UseGuards(JwtAuthGuard)
@Get('search')
  searchTasks(@Query('title') title: string, @Request() req,) {

    if (!title || title.trim() === '') {
      throw new BadRequestException('Query parameter "title" is required.');
    }

    return this.tasksService.searchTask(title, req.user.sub);
  }


  @UseGuards(JwtAuthGuard)
  @Get('completed')
  filtereTask(@Request() req, @Query('completed', ParseBoolPipe) completed : boolean, )  {


    return this.tasksService.filterTask(req.user.sub, completed,)
  }
}