import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCourseDto } from "../dto/createCourse.dto";
import { UpdateCourseDto } from "../dto/updateCourse.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Course } from "src/schema/course.schema";
import { UserService } from "src/user/user.service";
import { StudentList } from "src/schema/studentlist.schema";
import { Exam } from "src/schema/exam.schema";

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private CourseModel: Model<Course>,
    @InjectModel(Exam.name) private ExamModel: Model<Exam>,
    @InjectModel(StudentList.name)
    private Student_List_Model: Model<StudentList>,
    private readonly userService: UserService,
  ) {}
  // Create course
  async create(createCourseDto: CreateCourseDto) {
    const courseTeacher = await this.userService.findOnebyID(
      createCourseDto.teacherId,
    );
    if (!courseTeacher)
      throw new BadRequestException("There is no teacher like that!");
    const createdUser = await this.CourseModel.create(createCourseDto);
    return createdUser;
  }
  async findOnebyID(courseId: string) {
    return this.CourseModel.findOne({ _id: courseId });
  }
  // Find All Course with Teacher info
  async findAll(page: number, limit: number) {
    const allCourse = await this.CourseModel.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const numberOfCourse = await this.CourseModel.countDocuments();
    const numberOfPage = Array.from(
      { length: Math.ceil(numberOfCourse / limit) },
      (_, i) => i + 1,
    );
    return {
      page: page,
      numberOfPage: numberOfPage,
      numberOfCourse: numberOfCourse,
      allCourse,
    };
  }
  // Find one Course with Teacher info ,all the student and all the exam
  async findOne(id: string) {
    const course = await this.CourseModel.findOne({ _id: id });
    const allStudent_List = await this.Student_List_Model.find({
      courseId: course._id,
    });
    const allStudent = [];
    allStudent_List.map(async (x) => {
      const student = await this.userService.findStudent(x.studentId);
      allStudent.push(student);
    });
    const courseTeacher = await this.userService.findOnebyID(course.teacherId);
    if (!courseTeacher)
      throw new BadRequestException("There is no teacher like that!");
    const allExam = await this.ExamModel.find({ courseId: id });
    const result = {
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      teacher: courseTeacher,
      student: allStudent,
      exams: allExam,
    };
    return result;
  }
  // Find Course with name
  findName(name: string) {
    return this.CourseModel.findOne({ courseName: name });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const updateCourse = await this.CourseModel.findOne({ _id: id });
    if (!updateCourse)
      throw new BadRequestException("There is no course like that!");
    await updateCourse.updateOne({
      ...updateCourseDto,
    });
    return await this.findOne(id);
  }
  async delete(id: string) {
    await this.CourseModel.deleteOne({ _id: id });
    await this.ExamModel.deleteMany({ courseId: id });
    return "Delete course and all releted info: exam , student list success";
  }
}
