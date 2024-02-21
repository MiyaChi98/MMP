import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";
import { MultiChoise } from "src/constant/multichoise";
export class Answer {
  @ApiProperty({ example: "" })
  @IsNotEmpty()
  @IsString()
  quizId: string;
  @ApiProperty({ example: "A" })
  @IsNotEmpty()
  @IsString()
  answer: MultiChoise;
}
export class AnswerArray {
  @ApiProperty({
    isArray: true,
    type: Answer,
  })
  @IsArray()
  @ArrayNotEmpty()
  array: Answer[];
}

export class SubmitDto {
  @ApiProperty({ example: "658c5327442021afa622b1e7" })
  @IsString()
  @IsNotEmpty()
  examId: string;
  @ApiProperty()
  @IsNotEmpty()
  submitAnswer: AnswerArray;
}
