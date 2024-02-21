import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "src/constant/roleEnum";

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  phone: string;
  @Prop()
  zone: Role[];
  @Prop()
  gender: "female" | "male";
  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
