import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Smile } from 'lucide-react';
import { REACTION_EMOJIS } from '../constants/webrtc';

export function LiveChatDrawer({
  isOpen,
  onClose,
  socket,
  roomId,
  currentUser,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Socket listener for chat messages
  useEffect(() => {
    if (!socket) return;

    const onChatMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('chat:message', onChatMessage);
    return () => {
      socket.off('chat:message', onChatMessage);
    };
  }, [socket]);

  // Send message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !socket || !roomId) return;

    socket.emit('chat:send', {
      roomId,
      text: inputText.trim(),
    });

    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleAddEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 sm:w-88 h-full bg-dark-900 border-l border-white/10 flex flex-col shrink-0 shadow-2xl z-30 transition-all">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-850">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-4 h-4 text-brand-cyan" />
          <h3 className="font-semibold text-sm">In-Call Chat</h3>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-dark-950 text-slate-400 border border-white/10">
            {messages.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3.5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-8">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p className="text-xs">No messages yet.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Send a message to your friends!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.socketId === socket?.id;
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                  <span className="font-medium text-slate-300">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span>•</span>
                  <span>{timeStr}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] break-words leading-relaxed ${
                    isMe
                      ? 'bg-brand-cyan/20 text-slate-100 border border-brand-cyan/30 rounded-tr-sm'
                      : 'bg-dark-800 text-slate-200 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar Popup */}
      {showEmojiPicker && (
        <div className="p-2 border-t border-white/10 bg-dark-950 flex items-center justify-around">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 hover:bg-white/10 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-dark-850">
        <div className="flex items-center gap-1.5 bg-dark-950 rounded-xl px-2.5 py-1.5 border border-white/10 focus-within:border-brand-cyan/50 transition-colors">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-1 rounded text-slate-400 hover:text-brand-cyan transition-colors"
          >
            <Smile className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 rounded-lg bg-brand-cyan disabled:bg-dark-800 text-dark-950 disabled:text-slate-600 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
