import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  DIPLOMAT = 'diplomat',
  MEDIATOR = 'mediator',
  OBSERVER = 'observer',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  country: string;

  @Prop({ enum: UserRole, default: UserRole.DIPLOMAT })
  role: UserRole;

  @Prop({ default: 'en' })
  preferred_language: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);