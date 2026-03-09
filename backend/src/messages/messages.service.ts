import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { EncryptionService } from './encryption.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private encryptionService: EncryptionService,
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<any> {
    // Encrypt message before saving
    const encryptedMessage = this.encryptionService.encrypt(createMessageDto.message);

    const message = new this.messageModel({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(createMessageDto.receiver),
      original_message: encryptedMessage,
      negotiation: createMessageDto.negotiationId
        ? new Types.ObjectId(createMessageDto.negotiationId)
        : null,
    });

    const saved = await message.save();
    return this.decryptMessage(saved);
  }

  async findConversation(userId: string, otherUserId: string): Promise<any[]> {
    const messages = await this.messageModel
      .find({
        $or: [
          { sender: new Types.ObjectId(userId), receiver: new Types.ObjectId(otherUserId) },
          { sender: new Types.ObjectId(otherUserId), receiver: new Types.ObjectId(userId) },
        ],
        isDeleted: false,
      })
      .populate('sender', 'name country role')
      .populate('receiver', 'name country role')
      .sort({ createdAt: 1 })
      .exec();

    return messages.map(msg => this.decryptMessage(msg));
  }

  async findMyMessages(userId: string): Promise<any[]> {
    const messages = await this.messageModel
      .find({
        $or: [
          { sender: new Types.ObjectId(userId) },
          { receiver: new Types.ObjectId(userId) },
        ],
        isDeleted: false,
      })
      .populate('sender', 'name country role')
      .populate('receiver', 'name country role')
      .sort({ createdAt: -1 })
      .exec();

    return messages.map(msg => this.decryptMessage(msg));
  }

  async markAsRead(messageId: string, userId: string): Promise<any> {
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    // Only receiver can mark as read
    if (message.receiver.toString() !== userId) {
      throw new ForbiddenException('Only the receiver can mark a message as read');
    }

    message.status = 'read' as any;
    await message.save();
    return this.decryptMessage(message);
  }

  async softDelete(messageId: string, userId: string): Promise<{ message: string }> {
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.isDeleted = true;
    await message.save();
    return { message: 'Message deleted successfully' };
  }

  // Decrypt message for response — never store decrypted
  private decryptMessage(message: MessageDocument): any {
    const obj = message.toObject();
    try {
      obj.original_message = this.encryptionService.decrypt(obj.original_message);
      if (obj.translated_message) {
        obj.translated_message = this.encryptionService.decrypt(obj.translated_message);
      }
    } catch {
      obj.original_message = '[Decryption failed]';
    }
    return obj;
  }
}