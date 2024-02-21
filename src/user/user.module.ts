import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "src/schema/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { Course, CourseSchema } from "src/schema/course.schema";
import { StudentList, StudentListSchema } from "src/schema/studentlist.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Course.name,
        schema: CourseSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: StudentList.name,
        schema: StudentListSchema,
      },
    ]),
    JwtModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
