import { Module } from "@nestjs/common";
import { SubmitService } from "./submit.service";
import { SubmitController } from "./submit.controller";
import { JwtModule } from "@nestjs/jwt";
import { ExamModule } from "src/exam/exam.module";
import { QuizModule } from "src/quiz/quiz.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Submit, SubmitSchema } from "src/schema/submit.schema";
import { Exam, ExamSchema } from "src/schema/exam.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Submit.name,
        schema: SubmitSchema,
      },
      {
        name: Exam.name,
        schema: ExamSchema,
      },
    ]),
    JwtModule,
    ExamModule,
    QuizModule,
  ],
  controllers: [SubmitController],
  providers: [SubmitService],
})
export class SubmitModule {}
