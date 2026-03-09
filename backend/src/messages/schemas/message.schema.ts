import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({ required: true })
  original_message: string;           // encrypted before saving

  @Prop({ default: null })
  translated_message: string;         // encrypted before saving

  @Prop({ default: 'en' })
  original_language: string;

  @Prop({ default: 'en' })
  translated_language: string;

  @Prop({ type: Types.ObjectId, ref: 'Negotiation', default: null })
  negotiation: Types.ObjectId;

  @Prop({ enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Prop({ default: 0 })
  tensionScore: number;               // 0-100, filled by AI later

  @Prop({ default: false })
  isDeleted: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);