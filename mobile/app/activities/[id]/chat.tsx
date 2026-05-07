
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { COLORS } from '../../../constants/colors';
import Toast from 'react-native-toast-message';

export default function ActivityChatScreen() {
  const { id: activityId, title: activityTitle } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (activityId) {
      loadMessages();
      subscribeToMessages();
    }
  }, [activityId]);

  async function loadMessages() {
    try {
      // Using a fallback to 'messages' table with activityId as receiver_id
      // In a real app, we'd have a separate 'group_messages' table
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(name)')
        .eq('receiver_id', activityId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error('Chat load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`activity_chat:${activityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${activityId}`,
        },
        async (payload) => {
          // Fetch sender name
          const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('id', payload.new.sender_id)
            .single();
          
          const msgWithSender = { ...payload.new, sender: userData };
          setMessages((prev) => [...prev, msgWithSender]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleSend() {
    if (!newMsg.trim() || !user || sending) return;
    const text = newMsg;
    setNewMsg('');
    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: activityId, // Using activityId as receiver
        message: text,
      });

      if (error) throw error;
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Mesaj gönderilemedi' });
      setNewMsg(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {activityTitle || 'Etkinlik Grubu'}
              </Text>
              <Text style={styles.headerSubtitle}>Grup Sohbeti</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {loading ? (
            <ActivityIndicator style={{marginTop: 20}} color={COLORS.primaryLight} />
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} style={{opacity: 0.3}} />
              <Text style={styles.emptyText}>Henüz mesaj yok. İlk mesajı sen gönder!</Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <View key={msg.id} style={[styles.bubbleWrapper, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                  {!isOwn && (
                    <Text style={styles.senderName}>
                      {msg.sender?.name || 'Kullanıcı'}
                    </Text>
                  )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  header: {
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    maxWidth: '80%',
  },
  headerSubtitle: {
    color: COLORS.secondaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    color: COLORS.textTertiary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  bubbleWrapper: {
    maxWidth: '80%',
  },
  bubbleOwn: {
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    alignSelf: 'flex-start',
  },
  senderName: {
    color: COLORS.secondaryLight,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
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
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  }
});
