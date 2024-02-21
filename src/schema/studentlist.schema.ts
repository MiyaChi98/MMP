import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class StudentList {
  @Prop()
  courseId: string;
  @Prop()
  studentId: string;
}

export const StudentListSchema = SchemaFactory.createForClass(StudentList);
