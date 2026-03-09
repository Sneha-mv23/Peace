import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { EncryptionService } from './encryption.service';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
  ],
  controllers: [MessagesController],
  providers: [MessagesService, EncryptionService],
  exports: [MessagesService, EncryptionService], // WebSocket gateway needs these
})
export class MessagesModule {}