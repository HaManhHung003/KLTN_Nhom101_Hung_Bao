import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';

interface AiChatbotModalProps {
  visible: boolean;
  onClose: () => void;
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendedProperty?: Property;
}

export function AiChatbotModal({
  visible,
  onClose,
  properties,
  onSelectProperty,
}: AiChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý ảo AI BDS Pro. Tôi có thể hỗ trợ bạn tìm nhà theo vị trí GPS, kiểm tra quy hoạch, thẩm định pháp lý và hướng dẫn đặt cọc an toàn.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    { label: '📍 Tìm căn dưới 3 tỷ gần đây', query: 'Tìm căn hộ dưới 3 tỷ gần vị trí của tôi' },
    { label: '📜 Thủ tục sang tên sổ hồng', query: 'Thủ tục pháp lý sang tên sổ hồng như thế nào?' },
    { label: '💰 Tính lãi suất vay mua nhà', query: 'Cách tính tiền vay ngân hàng và trả góp mua nhà?' },
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Response Logic
    setTimeout(() => {
      let replyText = '';
      let matchedProp: Property | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('dưới 3 tỷ') || lower.includes('gần') || lower.includes('giá rẻ')) {
        matchedProp = properties.find((p) => p.price <= 3000000000) || properties[4];
        replyText = `Dựa trên định vị GPS của bạn tại TP. Thủ Đức, tôi tìm thấy căn hộ ${matchedProp?.title} với giá ${
          matchedProp ? (matchedProp.price / 1000000000).toFixed(2) + ' tỷ' : '2.45 tỷ'
        }. Căn hộ này đã có sổ hồng pháp lý hoàn chỉnh!`;
      } else if (lower.includes('sổ hồng') || lower.includes('pháp lý')) {
        replyText =
          'Về pháp lý: Toàn bộ căn hộ có gắn huy hiệu "Sổ hồng" trên sàn BDS Pro đều đã được kiểm tra tính hợp pháp, không nằm trong diện tranh chấp hoặc quy hoạch. Bạn có thể đặt cọc ký quỹ Escrow để sàn giữ cọc an toàn trước khi công chứng.';
      } else if (lower.includes('vay') || lower.includes('lãi suất') || lower.includes('ngân hàng')) {
        replyText =
          'Hiện tại gói vay mua nhà ưu đãi lãi suất cố định 6.5%/năm trong 2 năm đầu. Với căn hộ 3 tỷ, bạn chỉ cần vốn tự có 900 triệu (30%), 70% còn lại vay ngân hàng trong 20 năm, gốc lãi trả hàng tháng khoảng 16-18 triệu.';
      } else {
        matchedProp = properties[0];
        replyText = `Tôi đã ghi nhận yêu cầu của bạn. Bạn có thể tham khảo căn nổi bật nhất hiện nay: ${matchedProp?.title}. Bạn có muốn xem lịch hẹn hoặc đặt cọc giữ chỗ không?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          recommendedProperty: matchedProp,
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Trợ lý Ảo AI BDS Pro</Text>
                <Text style={styles.headerSub}>Tư vấn BĐS & Pháp lý thông minh 24/7</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => (
              <View
                key={m.id}
                style={[styles.msgRow, m.sender === 'user' ? styles.userRow : styles.aiRow]}
              >
                {m.sender === 'ai' && (
                  <View style={styles.miniAiAvatar}>
                    <Ionicons name="sparkles" size={12} color="#ffffff" />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    m.sender === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={[styles.msgText, m.sender === 'user' && styles.userMsgText]}>
                    {m.text}
                  </Text>

                  {/* Recommended Property Card inside Chat */}
                  {m.recommendedProperty && (
                    <TouchableOpacity
                      style={styles.propRecCard}
                      onPress={() => {
                        onClose();
                        onSelectProperty(m.recommendedProperty!);
                      }}
                    >
                      <Ionicons name="home" size={16} color="#059669" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recTitle} numberOfLines={1}>
                          {m.recommendedProperty.title}
                        </Text>
                        <Text style={styles.recPrice}>
                          {(m.recommendedProperty.price / 1000000000).toFixed(2)} Tỷ · Xem chi tiết →
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={styles.typingText}>Trợ lý AI đang suy nghĩ...</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsRow}
          >
            {quickPrompts.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(p.query)}
              >
                <Text style={styles.promptText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Hỏi bất kỳ điều gì về BĐS, giá cả, pháp lý..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  miniAiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#f1f5f9',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#059669',
    borderTopRightRadius: 4,
  },
  msgText: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 19,
  },
  userMsgText: {
    color: '#ffffff',
  },
  propRecCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  recPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginTop: 1,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 34,
  },
  typingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  promptsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  promptText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
