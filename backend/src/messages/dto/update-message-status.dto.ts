import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MessageStatus } from '../schemas/message.schema';

export class UpdateMessageStatusDto {
  @ApiProperty({ enum: MessageStatus })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}