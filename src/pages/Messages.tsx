
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Message, Student } from '@/types';
import { MOCK_USERS, MOCK_STUDENTS } from '@/constants';
import { Send, User as UserIcon, Search, Phone, Video, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessagesProps {
  user: User;
}

const Messages: React.FC<MessagesProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulation: Load messages from "Firebase"
  useEffect(() => {
    const savedMessages = localStorage.getItem('bmc_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial mock message
      const initial = [
        {
          id: 'm1',
          senderId: 't1',
          receiverId: 'p1',
          content: 'Hello Mr. Ramesh, I noticed Aswin has been doing great in Mathematics lately!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          threadId: 't1-p1',
          read: false
        }
      ];
      setMessages(initial);
      localStorage.setItem('bmc_messages', JSON.stringify(initial));
      window.dispatchEvent(new Event('messages_updated'));
    }
  }, []);

  useEffect(() => {
    if (selectedContactId && messages.length > 0) {
      let changed = false;
      const updatedMessages = messages.map(m => {
        if (m.receiverId === user.id && m.senderId === selectedContactId && !m.read) {
          changed = true;
          return { ...m, read: true };
        }
        return m;
      });
      
      if (changed) {
        setMessages(updatedMessages);
        localStorage.setItem('bmc_messages', JSON.stringify(updatedMessages));
        window.dispatchEvent(new Event('messages_updated'));
      }
    }
  }, [selectedContactId, messages, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedContactId]);

  const isTeacher = user.role === UserRole.TEACHER;

  // For teachers, contacts are parents. For parents, contact is the teacher.
  const contacts = isTeacher 
    ? MOCK_USERS.filter(u => u.role === UserRole.PARENT)
    : MOCK_USERS.filter(u => u.role === UserRole.TEACHER);

  // Set default contact if none selected
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  const activeContact = contacts.find(c => c.id === selectedContactId);
  
  const threadId = isTeacher 
    ? `${user.id}-${selectedContactId}`
    : `${selectedContactId}-${user.id}`;

  const currentThreadMessages = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === selectedContactId) ||
    (m.senderId === selectedContactId && m.receiverId === user.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedContactId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedContactId,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      threadId: threadId,
      read: false
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('bmc_messages', JSON.stringify(updated));
    window.dispatchEvent(new Event('messages_updated'));
    setInputText('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row h-[calc(100vh-180px)] bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden"
    >
      {/* Sidebar - Contacts */}
      <div className={`w-full md:w-80 border-r border-white/40 flex flex-col ${selectedContactId && 'hidden md:flex'}`}>
        <div className="p-4 border-b border-white/40 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 mb-4">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-bmc-red/20 transition-all"
              placeholder="Search contacts..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map(contact => {
            const hasUnread = messages.some(m => m.receiverId === user.id && m.senderId === contact.id && !m.read);
            return (
            <button
              key={contact.id}
              onClick={() => setSelectedContactId(contact.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative ${
                selectedContactId === contact.id ? 'bg-red-50 text-bmc-red' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                selectedContactId === contact.id ? 'bmc-red text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <UserIcon size={20} />
              </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="font-extrabold truncate text-sm">{contact.name}</p>
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-80 truncate">
                    {isTeacher ? 'Parent' : 'Teacher'}
                  </p>
                </div>
                {hasUnread && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
                )}
            </button>
          )})}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedContactId && 'hidden md:flex'}`}>
        <AnimatePresence mode="wait">
          {activeContact ? (
            <motion.div 
              key={activeContact.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/40 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedContactId(null)}
                    className="md:hidden p-2 text-slate-400 hover:text-slate-600"
                  >
                    <Search size={20} className="rotate-90" />
                  </button>
                  <div className="w-10 h-10 rounded-full bmc-red text-white flex items-center justify-center">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{activeContact.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.5)]" />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <button className="p-3 text-slate-500 hover:bg-white/50 rounded-xl transition-colors"><Phone size={20} /></button>
                    <div className="absolute bottom-full mb-3 right-0 hidden md:group-hover:block bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap z-[100] pointer-events-none animate-in fade-in duration-100">
                      Voice Call
                      <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-3 text-slate-500 hover:bg-white/50 rounded-xl transition-colors"><Video size={20} /></button>
                    <div className="absolute bottom-full mb-3 right-0 hidden md:group-hover:block bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap z-[100] pointer-events-none animate-in fade-in duration-100">
                      Video Call
                      <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-3 text-slate-500 hover:bg-white/50 rounded-xl transition-colors"><Info size={20} /></button>
                    <div className="absolute bottom-full mb-3 right-0 hidden md:group-hover:block bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap z-[100] pointer-events-none animate-in fade-in duration-100">
                      Contact Info
                      <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/10"
              >
                <AnimatePresence initial={false}>
                  {currentThreadMessages.map((m) => {
                    const isMine = m.senderId === user.id;
                    return (
                      <motion.div 
                        key={m.id} 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] space-y-1 ${isMine ? 'text-right' : 'text-left'}`}>
                          <div className={`p-4 rounded-2xl text-[16px] font-bold shadow-sm leading-relaxed ${
                            isMine 
                              ? 'bmc-red text-white rounded-tr-none' 
                              : 'bg-white/70 backdrop-blur-sm text-slate-900 rounded-tl-none border border-white/40'
                          }`}>
                            {m.content}
                          </div>
                          <p className="text-[11px] font-black text-slate-600 px-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {currentThreadMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                    <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center text-slate-300">
                      <Send size={40} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800">No messages yet</h5>
                      <p className="text-sm text-slate-500">Start the conversation with {activeContact.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/50 border-t border-white/40 backdrop-blur-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-3 bg-white/50 border border-white/40 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-bmc-red/30 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="p-4 bmc-red text-white rounded-2xl hover:bg-red-800 disabled:opacity-50 shadow-lg transition-all active:scale-95 flex items-center justify-center min-w-[56px] border-2 border-transparent hover:border-white/20"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4"
            >
               <div className="w-16 h-16 bg-blue-50 text-bmc-blue rounded-full flex items-center justify-center">
                  <UserIcon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Select a Conversation</h3>
                <p className="text-slate-500 max-w-sm">Choose a contact from the list to start messaging.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Messages;
