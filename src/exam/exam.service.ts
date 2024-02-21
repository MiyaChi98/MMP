import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CourseService } from "src/course/course.service";
import { CreateExamDTO } from "src/dto/createExam.dto";
import { Exam } from "src/schema/exam.schema";
import { UserService } from "src/user/user.service";
import { QuizService } from "src/quiz/quiz.service";
import { UpdateExamDTO } from "src/dto/updateExam.dto";
import { Submit } from "src/schema/submit.schema";
@Injectable()
export class ExamService {
  constructor(
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly quizService: QuizService,
    @InjectModel(Exam.name) private ExamModel: Model<Exam>,
    @InjectModel(Submit.name) private SubmitModel: Model<Submit>,
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async examIdentify(userID: string, courseId: string) {
    const teacher = await this.userService.findOnebyID(userID);
    const course = await this.courseService.findOnebyID(courseId);
    if (
      !teacher ||
      !course ||
      course.teacherId?.toString() != teacher._id?.toString()
    )
      throw new BadRequestException("Indentify failed");
    const info = {
      teacher: {
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        teacherPhone: teacher.phone,
      },
      course: {
        courseName: course.courseName,
        courseDescription: course.courseDescription,
      },
    };
    return info;
  }
  async create(createExamDto: CreateExamDTO) {
    await this.examIdentify(createExamDto.teacherId, createExamDto.courseId);
    const createdExam = await this.ExamModel.create(createExamDto);
    return createdExam;
  }

  async findAllExamInCourse(courseId: string) {
    // const info = await this.examIdentify(userID, courseId);
    const allExam = await this.ExamModel.find({ courseId: courseId });
    if (allExam.length == 0) {
      return "Course doesn't has any exam !";
    }
    const result = [];
    for (const exam of allExam) {
      result.push({
        tilte: exam.tilte,
        total_mark: exam.total_mark,
        total_time: exam.total_time,
        // ...info,
      });
    }
    return result;
  }
  // Find one Exam with all exam's quizzes
  async findOne(id: string) {
    const exam = await this.ExamModel.findOne({ _id: id });
    const info = await this.examIdentify(exam.teacherId, exam.courseId);
    const allQuiz = await this.quizService.findbyExam(id);
    const examInfo = {
      examId: exam._id,
      ...info,
      tilte: exam.tilte,
      time: exam.total_time,
      quiz: allQuiz,
    };
    return examInfo;
  }

  async update(id: string, updateExamDto: UpdateExamDTO) {
    const updateExam = await this.ExamModel.findOne({ _id: id });
    if (!updateExam)
      throw new BadRequestException("There is no exam like that!");
    await updateExam.updateOne({
      ...updateExamDto,
    });
    return await this.findOne(id);
  }
  async delete(id: string) {
    await this.ExamModel.findByIdAndDelete(id);
    await this.SubmitModel.deleteMany({ examId: id });
    return "Delete success";
  }
}
