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
  UseGuards,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "src/dto/createUser.dto";
import { UpdateUserDto } from "src/dto/updateUser.dto";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "src/constant/roleEnum";
import { HasRoles } from "src/decorators/has_role.decorator";
import { RolesGuard } from "src/guard/role.guard";
import { ATGuard } from "src/guard/accessToken.guards";
import { UserXXX } from "./constant/UserXXX";
import { IdValidationPipe } from "src/pipes/IDvalidation.pipe";
import { PaginationDto } from "src/dto/pagination.dto";
@ApiTags("User")
@HasRoles(Role.ADMIN)
@UseGuards(ATGuard, RolesGuard)
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get("/all")
  @ApiOperation({
    summary: "Use to get all user with pagination",
  })
  @ApiOkResponse(UserXXX.successFindAll)
  async getAllUser(@Query() pagination: PaginationDto) {
    const page = parseInt(pagination.page as any) || 1;
    const limit = parseInt(pagination.limit as any) || 5;
    const user = await this.userService.findAll(page, limit);
    return user;
  }
  //Find by id
  // @ApiOperation({
  //   summary: "Get user",
  //   description: "Get user by id",
  // })
  @Get(":id")
  @ApiOperation({
    summary: "Use to find user by id",
  })
  @ApiOkResponse(UserXXX.successFindbyId)
  async getUserbyId(@Param("id", new IdValidationPipe()) id: string) {
    const user = await this.userService.findOnebyID(id);
    if (!user) {
      throw new NotFoundException("Cant find user by the id: " + id);
    }
    return user;
  }

  @Get("/teacher/all")
  @ApiOperation({
    summary: "Use to find all teacher",
  })
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
  @ApiOperation({
    summary: "Use to create user",
  })
  @ApiCreatedResponse(UserXXX.successCreatedUser)
  @UsePipes(new ValidationPipe())
  async createStudent(@Body() userDetails: CreateUserDto) {
    return await this.userService.create(userDetails);
  }
  //Update one by ID
  @Patch(":id")
  @ApiOperation({
    summary: "Use to update user",
  })
  @ApiOkResponse(UserXXX.successUpdate)
  @UsePipes(new ValidationPipe())
  async updateStudentbyId(
    @Param("id", new IdValidationPipe()) id: string,
    @Body() userNewDetails: UpdateUserDto,
  ) {
    const updateUser = await this.userService.changeStudentDetails(
      id,
      userNewDetails,
    );
    return updateUser;
  }
  // Delete one by ID
  @Delete(":id")
  @ApiOperation({
    summary: "Use to delete user",
  })
  @ApiOkResponse(UserXXX.successDelete)
  async deleteStudent(@Param("id", new IdValidationPipe()) id: string) {
    const student = await this.userService.delete(id);
    return student;
  }
}
