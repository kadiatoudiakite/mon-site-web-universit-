import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon, 
  PaperClipIcon, 
  PhotoIcon, 
  ArrowDownIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Messagerie({ userId, userEmail, userData }) {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const API_BASE = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // ==================== FETCH DATA ====================
  const fetchData = async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    try {
      const [convRes, contactRes] = await Promise.all([
        fetch(`${API_BASE}/api/messagerie/conversations`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/messagerie/contacts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const convData = await convRes.json();
      const contactData = await contactRes.json();
      setConversations(Array.isArray(convData) ? convData : []);
      setContacts(Array.isArray(contactData) ? contactData : []);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchMessages = async (conversation_id) => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/${conversation_id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.length !== messages.length) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      markMessagesAsRead(selectedConv.id);
      const msgInterval = setInterval(() => fetchMessages(selectedConv.id), 3000);
      return () => clearInterval(msgInterval);
    }
  }, [selectedConv]);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      const height = messagesContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      messagesContainerRef.current.scrollTo({
        top: maxScrollTop > 0 ? maxScrollTop : 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Scroll automatique intelligent
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        scrollToBottom(true);
      }
    }
  }, [messages]);

  // Scroll immédiat lors du changement de conversation
  useEffect(() => {
    if (selectedConv) {
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [selectedConv]);

  const markMessagesAsRead = async (conversation_id) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/read`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversation_id })
      });
    } catch (e) { }
  };

  const startConversation = async (counterpartId) => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/conversation/get-or-create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ counterpartId })
      });
      const data = await res.json();
      await fetchData(false);
      
      const newConv = { id: data.id, counterpart_name: contacts.find(c => c.id === counterpartId)?.name };
      setSelectedConv(newConv);
      setActiveTab('chats');
    } catch (error) {
      console.error("Erreur démarrage conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;

    setSending(true);
    const tempMessage = {
      id: Date.now(),
      conversation_id: selectedConv.id,
      expediteur_type: 'UNIVERSITE',
      contenu: newMessage.trim(),
      fichier: null,
      est_lu: 0,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/messagerie/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: selectedConv.id,
          expediteur_type: 'UNIVERSITE',
          contenu: tempMessage.contenu
        })
      });

      if (res.ok) {
        fetchMessages(selectedConv.id);
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedConv) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', selectedConv.id);
    formData.append('expediteur_type', 'UNIVERSITE');

    try {
      const res = await fetch(`${API_BASE}/api/messagerie/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        fetchMessages(selectedConv.id);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
    }
    e.target.value = '';
  };

  const formatMessageDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Hier ${format(date, 'HH:mm')}`;
    return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const filteredConversations = conversations.filter(c =>
    c.counterpart_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasUnread = conversations.some(c => c.unread > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 font-sans max-h-full"
    >
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-7 h-7 text-indigo-600" />
            Messagerie
          </h1>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 scale-90 origin-right relative">
           <button 
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             Discussions
             {hasUnread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />}
           </button>
           <button 
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             Annuaire
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden h-[calc(100vh-180px)] flex">
        
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/40">
          <div className="p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-none shadow-sm rounded-xl focus:ring-1 focus:ring-indigo-500 transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-1">
            {loading && conversations.length === 0 ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              activeTab === 'chats' ? (
                filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3 mb-1 rounded-[1.2rem] cursor-pointer transition-all flex items-center gap-3 ${selectedConv?.id === conv.id ? 'bg-white shadow-lg shadow-gray-200/50' : 'hover:bg-white/50'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                        {(conv.counterpart_name || 'E').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h3 className="font-bold text-gray-900 truncate text-[11px]">{conv.counterpart_name}</h3>
                          <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap ml-1">
                            {formatMessageDate(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className={`text-[10px] truncate font-semibold ${conv.unread > 0 ? 'text-indigo-600' : 'text-gray-500'}`}>
                          {conv.lastMessage || "Nouvelle discussion"}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-md shadow-indigo-100">
                          {conv.unread}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 font-bold text-[10px]">Aucune discussion active.</p>
                  </div>
                )
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => startConversation(contact.id)}
                    className="p-3 mb-1 rounded-[1.2rem] cursor-pointer transition-all hover:bg-white flex items-center gap-3 border border-transparent"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-sm">
                      {(contact.name || 'E').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[11px]">{contact.name}</h3>
                      <p className="text-[8px] text-indigo-500 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        Partenaire
                      </p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConv ? (
            <>
              <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-100">
                    {(selectedConv.counterpart_name || 'E').charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-sm tracking-tight">{selectedConv.counterpart_name}</h2>
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-green-500 uppercase tracking-widest mt-0.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                      En ligne
                    </div>
                  </div>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50/20 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.expediteur_type === 'UNIVERSITE';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-5 py-3 rounded-[1.5rem] shadow-sm text-[12px] font-semibold leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'}`}>
                        {msg.contenu && <p>{msg.contenu}</p>}
                        {msg.fichier && (
                          <div className={msg.contenu ? 'mt-3' : ''}>
                            {msg.fichier.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img src={`${API_BASE}${msg.fichier}`} alt="attachment" className="rounded-xl max-w-full shadow-lg border-2 border-white/10" />
                            ) : (
                              <a href={`${API_BASE}${msg.fichier}`} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-xl border ${isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-indigo-600'}`}>
                                <PaperClipIcon className="w-4 h-4" />
                                <span className="font-bold text-[10px] truncate">{msg.fichier.split('/').pop()}</span>
                              </a>
                            )}
                          </div>
                        )}
                        <div className={`text-[8px] mt-2 font-black opacity-60 flex items-center gap-1 justify-end ${isMe ? 'text-indigo-100' : 'text-gray-400'}`}>
                          {formatMessageDate(msg.created_at)}
                          {isMe && <span>{msg.est_lu ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* messagesEndRef is no longer needed since we use scrollTo on the container */}
              </div>

              <div className="p-4 border-t border-gray-50">
                <div className="flex items-center gap-2 bg-gray-50 rounded-[1.2rem] p-1.5 border border-gray-100 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <div className="flex gap-1">
                    <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                      <PhotoIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                      <PaperClipIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Écrivez..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[12px] font-bold placeholder-gray-400"
                  />
                  <button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-3xl mb-4">💬</div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Messages</h3>
              <p className="text-gray-500 font-bold mt-2 text-xs max-w-[200px] leading-relaxed">
                Sélectionnez une discussion ou parcourez l'annuaire.
              </p>
            </div>
          )}
        </div>
      </div>

      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
    </motion.div>
  );
}