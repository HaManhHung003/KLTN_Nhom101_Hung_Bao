import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { QueryMessagesDto, SendMessageDto, StartConversationDto } from './dto/chat.dto';
import { paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
  ) {}

  async getOrCreateConversation(userId: string, dto: StartConversationDto) {
    const [userAId, userBId] = [userId, dto.recipientId].sort();
    const propertyId = dto.propertyId || null;

    let conv = await this.convRepo.findOne({
      where: { userAId, userBId, propertyId: propertyId ? propertyId : IsNull() },
      relations: ['userA', 'userB', 'property'],
    });

    if (!conv) {
      conv = this.convRepo.create({
        userAId,
        userBId,
        propertyId,
      });
      await this.convRepo.save(conv);
      conv = await this.convRepo.findOne({
        where: { id: conv.id },
        relations: ['userA', 'userB', 'property'],
      });
    }

    return conv;
  }

  async findMyConversations(userId: string) {
    return this.convRepo.find({
      where: [{ userAId: userId }, { userBId: userId }],
      relations: ['userA', 'userB', 'property'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const conv = await this.convRepo.findOne({
      where: { id: dto.conversationId },
    });

    if (!conv) throw new NotFoundException('Không tìm thấy cuộc hội thoại');
    if (conv.userAId !== senderId && conv.userBId !== senderId) {
      throw new ForbiddenException('Bạn không phải thành viên cuộc hội thoại này');
    }

    const msg = this.msgRepo.create({
      conversationId: dto.conversationId,
      senderId,
      content: dto.content,
    });
    const savedMsg = await this.msgRepo.save(msg);

    conv.lastMessage = dto.content;
    conv.lastMessageAt = new Date();
    await this.convRepo.save(conv);

    return savedMsg;
  }

  async getMessages(conversationId: string, userId: string, dto: QueryMessagesDto) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Không tìm thấy cuộc hội thoại');
    if (conv.userAId !== userId && conv.userBId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem tin nhắn');
    }

    const qb = this.msgRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg.conversationId = :conversationId', { conversationId })
      .orderBy('msg.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, dto);
  }
}
