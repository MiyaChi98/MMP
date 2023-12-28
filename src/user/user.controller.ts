import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ValidationPipe,
  UsePipes,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { CreateUserDto } from "src/dto/createUser.dto";
import { UpdateUserDto } from "src/dto/updateUser.dto";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "src/constant/roleEnum";
import { HasRoles } from "src/decorators/has_role.decorator";
import { RolesGuard } from "src/guard/role.guard";
import { ATGuard } from "src/guard/accessToken.guards";
import { UserXXX } from "./constant/UserXXX";
@ApiTags("User")
@HasRoles(Role.ADMIN)
@UseGuards(ATGuard, RolesGuard)
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get("/all")
  @ApiOkResponse(UserXXX.successFindAll)
  async getAllUser(@Req() req: Request) {
    const user = await this.userService.findAll();
    return user;
  }
  //Find by id
  // @ApiOperation({
  //   summary: "Get user",
  //   description: "Get user by id",
  // })
  @Get(":id")
  @ApiOkResponse(UserXXX.successFindbyId)
  async getUserbyId(@Param("id") id: string) {
    const user = await this.userService.findOnebyID(id);
    if (!user) {
      throw new NotFoundException("Cant find user by the id: " + id);
    }
    return user;
  }

  @Get("/teacher/all")
  @ApiOkResponse(UserXXX.successFindAll)
  async getAllTeacher() {
    const teacher = await this.userService.findAllTeacher();
    if (!teacher) {
      throw new NotFoundException("There are no teacher");
    }
    return teacher;
  }
  //Crete new one
  @Post()
  @ApiCreatedResponse(UserXXX.successCreatedUser)
  @UsePipes(new ValidationPipe())
  async createStudent(@Body() userDetails: CreateUserDto) {
    this.userService.create(userDetails);
  }
  //Update one by ID
  @Patch(":id")
  @ApiCreatedResponse(UserXXX.successUpdate)
  @UsePipes(new ValidationPipe())
  async updateStudentbyId(
    @Param("id") id: string,
    @Body() userNewDetails: UpdateUserDto,
  ) {
    const updateUser = await this.userService.changeStudentDetails(
      id,
      userNewDetails,
    );
    return updateUser;
  }
  //Delete one by ID
  @Delete(":id")
  @ApiOkResponse(UserXXX.successDelete)
  async delStudentbyId(@Param("id") id: string) {
    const student = await this.userService.delete(id);
    return student;
  }
}
