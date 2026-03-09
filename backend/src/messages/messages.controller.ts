import {
  Controller, Get, Post, Body, Param, Delete, Patch, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send an encrypted message' })
  send(@CurrentUser() user: any, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(user._id.toString(), createMessageDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all my messages (sent and received)' })
  getMyMessages(@CurrentUser() user: any) {
    return this.messagesService.findMyMessages(user._id.toString());
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  getConversation(@CurrentUser() user: any, @Param('userId') otherUserId: string) {
    return this.messagesService.findConversation(user._id.toString(), otherUserId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@CurrentUser() user: any, @Param('id') messageId: string) {
    return this.messagesService.markAsRead(messageId, user._id.toString());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your own message (soft delete)' })
  remove(@CurrentUser() user: any, @Param('id') messageId: string) {
    return this.messagesService.softDelete(messageId, user._id.toString());
  }
}