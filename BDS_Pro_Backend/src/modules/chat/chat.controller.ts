import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { QueryMessagesDto, SendMessageDto, StartConversationDto } from './dto/chat.dto';
import { CurrentUser } from '@/common/decorators';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Tạo hoặc lấy cuộc hội thoại 1-1' })
  startConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: StartConversationDto,
  ) {
    return this.service.getOrCreateConversation(userId, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Danh sách cuộc hội thoại của tôi' })
  findMyConversations(@CurrentUser('id') userId: string) {
    return this.service.findMyConversations(userId);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Gửi tin nhắn qua REST API' })
  sendMessage(@CurrentUser('id') senderId: string, @Body() dto: SendMessageDto) {
    return this.service.sendMessage(senderId, dto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Lấy danh sách tin nhắn trong cuộc hội thoại' })
  getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @Query() dto: QueryMessagesDto,
  ) {
    return this.service.getMessages(conversationId, userId, dto);
  }
}
