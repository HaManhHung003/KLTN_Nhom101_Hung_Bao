import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class StartConversationDto {
  @ApiProperty({ description: 'ID người nhận' })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiPropertyOptional({ description: 'ID tin đăng liên quan' })
  @IsString()
  @IsOptional()
  propertyId?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'ID cuộc hội thoại' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ description: 'Nội dung tin nhắn' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class QueryMessagesDto extends PaginationDto {}
