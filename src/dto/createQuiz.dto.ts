import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { MultiChoise } from "src/constant/multichoise";

export class Content {
  @ApiProperty({
    example:
      "http://localhost:8000/image/standingcat8e7ed211-7133-483c-8f42-a5a406e155c4.jpg",
  })
  @IsString()
  @IsOptional()
  img?: string;
  @ApiProperty({
    example: "According to me , what smell is the most confort smell?",
  })
  @IsString()
  @IsNotEmpty()
  question: string;
  @ApiProperty({ example: "tuna" })
  @IsNotEmpty()
  A: string;
  @ApiProperty({ example: "clean laundry" })
  @IsNotEmpty()
  B: string;
  @ApiProperty({ example: "popcorn" })
  @IsNotEmpty()
  C: string;
  @ApiProperty({ example: "perfume" })
  @IsNotEmpty()
  D: string;
  @ApiProperty({ example: "B" })
  @IsNotEmpty()
  answer: MultiChoise;
}

export class CreateQuizDto {
  @ApiProperty({
    type: Content,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Content)
  content: Content;
  @ApiProperty({ example: "6555d99203662be4325a2838" })
  @IsString()
  @IsNotEmpty()
  teacherId: string;
  @ApiProperty({ example: "658c5327442021afa622b1e7" })
  @IsString()
  @IsNotEmpty()
  examId: string;
}

export class CreateQuizDtoArray {
  @ApiProperty({
    isArray: true,
    type: CreateQuizDto,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizDto)
  arrayOfObjectsDto: CreateQuizDto[];
}
