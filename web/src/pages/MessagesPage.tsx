import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, ArrowLeft, Search, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getConversations, getMessages, sendMessage,
  subscribeToMessages, type Conversation,
} from '../services/socialApi';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

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

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md', online = false }: { name?: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-11 h-11 text-base', lg: 'w-14 h-14 text-xl' };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center font-bold text-white shadow-glow-cyan`}>
        {name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-dark-bg rounded-full" />}
    </div>
  );
}

// ─── Conversation Item ────────────────────────────────────────────────────────
function ConvItem({ conv, selected, onClick }: { conv: Conversation; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 ${
        selected ? 'bg-primary-500/15 border-r-2 border-primary-400' : 'hover:bg-dark-hover'
      }`}
    >
      <Avatar name={conv.partnerName || conv.partnerId} online={Math.random() > 0.5} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-semibold truncate ${selected ? 'text-primary-300' : 'text-slate-100'}`}>
            {conv.partnerName || `Kullanıcı ${conv.partnerId.slice(0, 6)}`}
          </p>
          <span className="text-[11px] text-slate-500 flex-shrink-0">{timeLabel(conv.lastMessageAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-slate-400 truncate">
            {conv.isOwn ? 'Sen: ' : ''}{conv.lastMessage}
          </p>
          {conv.unreadCount > 0 && (
            <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isOwn }: { msg: any; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm ${
        isOwn
          ? 'bg-gradient-to-br from-primary-500 to-secondary-600 text-white rounded-br-sm'
          : 'bg-dark-card text-slate-100 border border-dark-border rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{msg.message}</p>
        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-primary-100' : 'text-slate-500'}`}>
          {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [convSearch, setConvSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConvs(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch { /* silently fail */ } finally {
      setLoadingConvs(false);
    }
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Real-time messages
  useEffect(() => {
    if (!user) return;
    const channel = subscribeToMessages(user.id, (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
      // Refresh conversation list for unread counts
      loadConversations();
    });
    return () => { channel.unsubscribe(); };
  }, [user?.id, scrollToBottom, loadConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    setMessages([]);
    getMessages(selected.partnerId)
      .then((data) => {
        setMessages(data);
        scrollToBottom();
        // Mark as read: refresh conversations
        loadConversations();
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
    inputRef.current?.focus();
  }, [selected?.partnerId, scrollToBottom, loadConversations]);

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
    scrollToBottom();
    try {
      await sendMessage(selected.partnerId, text);
      loadConversations();
    } catch {
      toast.error('Mesaj gönderilemedi');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  const filteredConvs = conversations.filter((c) =>
    !convSearch || (c.partnerName || c.partnerId).toLowerCase().includes(convSearch.toLowerCase())
  );

  const totalUnread = conversations.reduce((a, c) => a + c.unreadCount, 0);

  return (
    <div className="h-[calc(100vh-64px)] bg-dark-bg flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-80 lg:w-96 border-r border-dark-border glass flex-shrink-0`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-400" />
              Mesajlar
              {totalUnread > 0 && (
                <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Sohbet ara..."
              className="w-full pl-9 pr-4 py-2 bg-dark-hover border border-dark-border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-dark-border/50">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 px-6 text-center">
              <MessageCircle className="w-12 h-12 opacity-30" />
              <p className="text-sm">
                {conversations.length === 0
                  ? 'Henüz mesajınız yok. Arkadaşlarınıza mesaj gönderin!'
                  : 'Sonuç bulunamadı'}
              </p>
            </div>
          ) : (
            filteredConvs.map((c) => (
              <ConvItem
                key={c.partnerId}
                conv={c}
                selected={selected?.partnerId === c.partnerId}
                onClick={() => { setSelected(c); setSidebarOpen(false); }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area ────────────────────────────────────────────────────── */}
      <div className={`${!sidebarOpen || !selected ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-20 h-20 bg-dark-card rounded-3xl flex items-center justify-center">
              <MessageCircle className="w-10 h-10 opacity-30" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-300">Sohbet seçin</p>
              <p className="text-sm text-slate-500 mt-1">Soldaki listeden bir konuşma seçin</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-dark-border glass flex-shrink-0">
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-dark-hover text-slate-400 hover:text-slate-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar name={selected.partnerName || selected.partnerId} online />
              <div>
                <p className="font-bold text-slate-100">
                  {selected.partnerName || `Kullanıcı ${selected.partnerId.slice(0, 8)}`}
                </p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                  Çevrimiçi
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Mesajlar yükleniyor...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                  <MessageCircle className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Henüz mesaj yok. Merhaba de!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isOwn={msg.sender_id === user?.id}
                    />
                  ))}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-dark-border glass flex-shrink-0">
              <div className="flex gap-3 items-end">
                <input
                  ref={inputRef}
                  id="message-input"
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Mesajınızı yazın... (Enter ile gönder)"
                  className="flex-1 px-4 py-3 bg-dark-hover border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm resize-none"
                />
                <button
                  id="send-message-btn"
                  onClick={handleSend}
                  disabled={!newMsg.trim() || sending}
                  className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-xl shadow-neon transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
