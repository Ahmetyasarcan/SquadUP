import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getConversations, getMessages, sendMessage, 
  subscribeToMessages, type Conversation 
} from '../../services/socialApi';
import { COLORS } from '../../constants/colors';
import Toast from 'react-native-toast-message';

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

import { useLocalSearchParams, useRouter } from 'expo-router';

export default function MessagesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-open chat if navigated with params
  useEffect(() => {
    if (params.userId && typeof params.userId === 'string') {
      setSelected({
        partnerId: params.userId,
        partnerName: (params.userName as string) || '',
        partnerEmail: (params.userEmail as string) || '',
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isOwn: false
      });
      // Clear params so it doesn't reopen if user goes back
      router.setParams({ userId: '', userName: '', userEmail: '' });
    }
  }, [params.userId]);

  // Load conversations
  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  async function loadConversations() {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch { /* fail silently */ } finally {
      setLoadingConvs(false);
    }
  }

  // Real-time messages
  useEffect(() => {
    if (!user) return;
    const channel = subscribeToMessages(user.id, (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      loadConversations();
    });
    return () => { channel.unsubscribe(); };
  }, [user]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    setMessages([]);
    getMessages(selected.partnerId)
      .then((data) => {
        setMessages(data);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
        loadConversations(); // Update read status in list
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [selected?.partnerId]);

  async function handleSend() {
    if (!newMsg.trim() || !selected || sending) return;
    const text = newMsg;
    setNewMsg('');
    setSending(true);
    
    // Optimistic update
    const optimistic = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id,
      receiver_id: selected.partnerId,
      message: text,
      read: false,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    
    try {
      await sendMessage(selected.partnerId, text);
      loadConversations();
    } catch {
      Toast.show({ type: 'error', text1: 'Mesaj gönderilemedi' });
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  const filteredConvs = conversations.filter((c) =>
    !search || (c.partnerName || c.partnerId).toLowerCase().includes(search.toLowerCase())
  );

  // ─── CHAT VIEW ──────────────────────────────────────────────────────────────
  if (selected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatHeaderAvatar}>
                <Text style={styles.chatHeaderAvatarText}>
                  {(selected.partnerName || 'K').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.chatHeaderName}>
                  {selected.partnerName || `Kullanıcı ${selected.partnerId.slice(0, 6)}`}
                </Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Çevrimiçi</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Messages List */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatContent}
            contentContainerStyle={styles.chatContentContainer}
          >
            {loadingMsgs ? (
              <ActivityIndicator style={{marginTop: 20}} color={COLORS.primaryLight} />
            ) : messages.length === 0 ? (
              <Text style={styles.emptyText}>Henüz mesaj yok. Merhaba de!</Text>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <View key={msg.id} style={[styles.bubbleWrapper, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                    <View style={[styles.bubble, isOwn ? styles.bubbleBgOwn : styles.bubbleBgOther]}>
                      <Text style={styles.bubbleText}>{msg.message}</Text>
                      <Text style={[styles.bubbleTime, isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther]}>
                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Mesaj yaz..."
              placeholderTextColor={COLORS.textTertiary}
              value={newMsg}
              onChangeText={setNewMsg}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, (!newMsg.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!newMsg.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── CONVERSATIONS LIST ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
            </View>
            <Text style={styles.title}>Mesajlar</Text>
          </View>
          <TouchableOpacity 
            style={styles.newChatBtn}
            onPress={() => router.push('/new-chat')}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.primaryLight} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sohbet ara..."
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loadingConvs ? (
          <ActivityIndicator style={{marginTop: 20}} color={COLORS.primaryLight} />
        ) : filteredConvs.length === 0 ? (
          <Text style={styles.emptyText}>Mesaj bulunamadı.</Text>
        ) : (
          filteredConvs.map((c) => (
            <TouchableOpacity 
              key={c.partnerId} 
              style={styles.convItem}
              onPress={() => setSelected(c)}
            >
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>
                  {(c.partnerName || 'K').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convHeaderRow}>
                  <Text style={styles.convName} numberOfLines={1}>
                    {c.partnerName || `Kullanıcı ${c.partnerId.slice(0, 6)}`}
                  </Text>
                  <Text style={styles.convTime}>{timeLabel(c.lastMessageAt)}</Text>
                </View>
                <View style={styles.convHeaderRow}>
                  <Text style={styles.convLastMsg} numberOfLines={1}>
                    {c.isOwn ? 'Sen: ' : ''}{c.lastMessage}
                  </Text>
                  {c.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{c.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newChatBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 30,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 16,
  },
  convAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  convAvatarText: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
    fontSize: 20,
  },
  convInfo: {
    flex: 1,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  convTime: {
    color: COLORS.textTertiary,
    fontSize: 12,
  },
  convLastMsg: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
  },
  unreadBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Chat View Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.darkCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  chatHeaderAvatarText: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatHeaderName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  onlineText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 16,
    gap: 12,
  },
  bubbleWrapper: {
    flexDirection: 'row',
  },
  bubbleOwn: {
    justifyContent: 'flex-end',
  },
  bubbleOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleBgOwn: {
    backgroundColor: COLORS.primaryLight,
    borderBottomRightRadius: 4,
  },
  bubbleBgOther: {
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  bubbleTimeOther: {
    color: COLORS.textTertiary,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.darkCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: COLORS.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  }
});
