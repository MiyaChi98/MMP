import { BadRequestException, Injectable } from "@nestjs/common";
import { SubmitDto } from "../dto/submit.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Submit } from "src/schema/submit.schema";
import { Model } from "mongoose";
import { QuizService } from "src/quiz/quiz.service";
import { Role } from "src/constant/roleEnum";
import { Exam } from "src/schema/exam.schema";

@Injectable()
export class SubmitService {
  constructor(
    @InjectModel(Submit.name) private SubmitModel: Model<Submit>,
    @InjectModel(Exam.name) private ExamModel: Model<Exam>,
    private readonly quizService: QuizService,
  ) {}
  // Create course
  async create(submitDto: SubmitDto, userId: string) {
    const exam = await this.ExamModel.findById(submitDto.examId);
    if (!exam) throw new BadRequestException("There is no exam like that!");
    const examQuizzes = await this.quizService.findbyExam(submitDto.examId);
    const examQuizzesId = [];
    for (const quiz of examQuizzes) {
      examQuizzesId.push(quiz.quizId);
    }
    const submitQuizzesId = [];
    for (const submitQuiz of submitDto.submitAnswer.array) {
      submitQuizzesId.push(submitQuiz.quizId);
    }
    const isSubset = submitQuizzesId.every((val) =>
      examQuizzesId.includes(val),
    );
    if (!isSubset)
      throw new BadRequestException(
        `The quiz you submit doesn't contain in this exam`,
      );
    let mark = 0;
    const listAnswer = submitDto?.submitAnswer?.array;
    if (listAnswer?.length > 0)
      for (const submitQuiz of listAnswer) {
        const quizzfindOne = await this.quizService.findOne(submitQuiz.quizId);
        const answer = quizzfindOne?.question?.answer;
        if (answer == submitQuiz.answer) {
          mark++;
        }
      }
    const createdSubmit = await this.SubmitModel.create({
      examId: submitDto.examId,
      studentId: userId,
      submitAnswer: submitDto.submitAnswer,
      mark: (mark / examQuizzes.length) * exam.total_mark,
    });
    return createdSubmit;
  }
  async getOne(id: string, userId: string, userZone: Role) {
    const submit = await this.SubmitModel.findOne({ _id: id });
    if (userZone.includes("student")) {
      if (submit.studentId != userId) {
        throw new BadRequestException(`You can't see this test`);
      }
    }
    const allQuiz = [];
    for (const submitQuiz of submit.submitAnswer.array) {
      const quizDetail = await this.quizService.findOne(submitQuiz.quizId);
      allQuiz.push({
        ...quizDetail,
        studentAnswer: submitQuiz.answer,
      });
    }
    const result = {
      examId: submit.examId,
      studentId: submit.studentId,
      mark: submit.mark,
      studentAnswer: allQuiz,
    };
    return result;
  }
}
