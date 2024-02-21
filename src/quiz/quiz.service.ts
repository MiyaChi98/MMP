import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateQuizDtoArray } from "src/dto/createQuiz.dto";
import { UpdateQuizContentDto } from "src/dto/updateQuiz.dto";
import fs = require("fs");
// import mammoth = require("mammoth");
import { InjectModel } from "@nestjs/mongoose";
import { Quiz } from "src/schema/quiz.schema";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private QuizModel: Model<Quiz>,
    private configService: ConfigService,
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createQuizDto: CreateQuizDtoArray) {
    return this.QuizModel.create(createQuizDto.arrayOfObjectsDto);
  }

  async createUsingUploadFile(
    teacherId: number,
    examId: string,
    file: Express.Multer.File,
  ) {
    const datas = await this.uploadFile(file);
    const quizzes = [];
    for (const i in datas)
      quizzes.push(
        await this.QuizModel.create({
          // quizId: `${teacherId}${examId}${i}`,
          teacherId: teacherId,
          examId: examId,
          content: datas[i],
        }),
      );
    return quizzes;
  }

  async uploadFile(file: Express.Multer.File) {
    const data = fs.readFileSync(file.path, "utf8");
    try {
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      throw new BadRequestException("The input should be JSON");
    }
  }

  uploadImage(fieldname: string) {
    return `${this.configService.get<string>("LINK")}${fieldname}`;
  }

  async findbyExam(id: string) {
    const allQuiz = await this.QuizModel.find({ examId: id })
      .select("quizId")
      .select("content")
      .sort("quizId");
    const result = [];
    allQuiz.forEach(function (obj) {
      result.push({
        quizId: obj._id.toString(),
        question: obj.content.question,
        A: obj.content.A,
        B: obj.content.B,
        C: obj.content.C,
        D: obj.content.D,
      });
    });
    return result;
  }

  async findOne(id: string) {
    const obj = await this.QuizModel.findOne({ _id: id })
      .select("quizId")
      .select("content");
    if (!obj) {
      throw new BadRequestException("There no quiz with that ID");
    }
    const result = {
      quizId: obj._id.toString(),
      question: obj.content,
    };
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateQuizContent(id: string, updateQuizDto: UpdateQuizContentDto) {
    await this.QuizModel.updateOne({ _id: id }, [
      { $addFields: { content: updateQuizDto } },
    ]);
    return this.QuizModel.findOne({ _id: id });
  }

  async remove(id: string) {
    await this.QuizModel.deleteOne({ _id: id });
    return "Delete quiz success";
  }
}
