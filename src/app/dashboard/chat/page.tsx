'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  MOCK_CHAT_ROOMS,
  MOCK_MESSAGES,
} from '@/lib/data/mockData';
import type { ChatMessage, UserRole } from '@/lib/types';
import {
  MessageSquare,
  Send,
  Users,
  Shield,
  Smile,
  CheckCheck,
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useStore();
  const currentRole = user?.role || 'student';

  const [activeRoomId, setActiveRoomId] = useState(MOCK_CHAT_ROOMS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');

  const activeRoom =
    MOCK_CHAT_ROOMS.find((r) => r.id === activeRoomId) || MOCK_CHAT_ROOMS[0];

  const roomMessages = messages.filter((m) => m.room_id === activeRoomId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: activeRoomId,
      sender_id: user?.id || 'curr-user',
      text: inputText.trim(),
      created_at: new Date().toISOString(),
      sender: {
        name: user?.name || 'You',
        role: currentRole,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const roleColors: Record<UserRole, string> = {
    management: '#FF5D5D',
    hod: '#A78BFA',
    teacher: '#2DD4BF',
    student: '#FFD93D',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black/60">
              Department & Class Channels
            </span>
            <Badge color="secondary" size="sm">
              Live Messaging
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Campus Collaboration Hub
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Real-time discussions between HODs, teachers, and students.
          </p>
        </div>
      </div>

      {/* Chat Layout: Left Rooms, Right Thread */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]">
        {/* Rooms Sidebar */}
        <div className="md:col-span-4 space-y-3">
          <Card className="p-4 bg-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-3 px-1">
              Active Channels
            </h3>
            <div className="space-y-2">
              {MOCK_CHAT_ROOMS.map((room) => {
                const isActive = room.id === activeRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left font-black text-xs uppercase tracking-tight transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FFD93D] border-black nb-shadow-sm text-black -translate-y-0.5'
                        : 'bg-[#FDF6EC] border-black/20 text-black/80 hover:border-black hover:bg-white'
                    }`}
                  >
                    <span className="truncate pr-2">{room.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black text-white font-extrabold uppercase">
                      {room.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Role Identity Legend */}
          <Card className="p-4 bg-[#FFFBEB]">
            <h4 className="text-[11px] font-black uppercase text-black/70 mb-2">
              Role Color Badges:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase">
              <span className="px-2 py-1 rounded-md border border-black bg-[#FF5D5D] text-white">
                👔 Management
              </span>
              <span className="px-2 py-1 rounded-md border border-black bg-[#A78BFA] text-black">
                🎓 HOD
              </span>
              <span className="px-2 py-1 rounded-md border border-black bg-[#2DD4BF] text-black">
                👩‍🏫 Teacher
              </span>
              <span className="px-2 py-1 rounded-md border border-black bg-[#FFD93D] text-black">
                🎒 Student
              </span>
            </div>
          </Card>
        </div>

        {/* Messages Container */}
        <div className="md:col-span-8 flex flex-col">
          <Card className="p-0 bg-white flex flex-col flex-1 overflow-hidden min-h-[520px]">
            {/* Room Header */}
            <div className="p-4 border-b-3 border-black bg-[#FFD93D] flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-black uppercase">
                  {activeRoom.name}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-black/70">
                  Channel Type: {activeRoom.type}
                </span>
              </div>
              <Badge color="outline" size="sm">
                Live Channel
              </Badge>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto max-h-[380px] bg-[#FDF6EC]/40">
              {roomMessages.length === 0 ? (
                <div className="text-center py-12 text-black/50 font-bold text-xs uppercase">
                  No messages yet. Send the first message below!
                </div>
              ) : (
                roomMessages.map((msg) => {
                  const isMine =
                    msg.sender_id === user?.id || msg.sender?.name === 'You';
                  const senderRole = (msg.sender?.role || 'student') as UserRole;
                  const roleBg = roleColors[senderRole] || '#FFD93D';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMine ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-black text-black">
                          {msg.sender?.name || 'Member'}
                        </span>
                        <span
                          style={{ backgroundColor: roleBg }}
                          className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase border border-black text-black"
                        >
                          {senderRole}
                        </span>
                        <span className="text-[9px] font-bold text-black/40">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-md p-3.5 rounded-2xl border-2 border-black nb-shadow-sm font-bold text-xs text-black leading-relaxed ${
                          isMine
                            ? 'bg-[#FFD93D] rounded-tr-none'
                            : 'bg-white rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t-3 border-black bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message in ${activeRoom.name}...`}
                className="nb-input py-2.5 text-xs flex-1"
              />
              <Button
                type="submit"
                variant="warning"
                size="md"
                disabled={!inputText.trim()}
                icon={<Send className="w-4 h-4 stroke-[2.5]" />}
              >
                Send
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
