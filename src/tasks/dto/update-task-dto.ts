import { CreateTaskDto } from "./create-task.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsBoolean } from "class-validator";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

