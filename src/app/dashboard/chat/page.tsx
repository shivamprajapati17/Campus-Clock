'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useMasterData } from '@/store/useMasterData';
import { resolveDepartmentId } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MOCK_CHAT_ROOMS,
  MOCK_MESSAGES,
} from '@/lib/data/mockData';
import { useStoredState } from '@/lib/useStoredState';
import type { ChatMessage, UserRole } from '@/lib/types';
import { Send, ShieldCheck } from 'lucide-react';

const CHAT_STORAGE_KEY = 'campus_clock_chat_v1';

export default function ChatPage() {
  const { user } = useStore();
  const currentRole = user?.role || 'student';
  const departments = useMasterData((s) => s.departments);

  const userDeptId = resolveDepartmentId(
    departments,
    user?.department_id,
    user?.department_code
  );

  const [activeRoomId, setActiveRoomId] = useState(MOCK_CHAT_ROOMS[0].id);
  // Threads persist on this device, so a reload keeps the conversation.
  const [messages, setMessages] = useStoredState<ChatMessage[]>(
    CHAT_STORAGE_KEY,
    MOCK_MESSAGES
  );
  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);

  // People only see the rooms that belong to them: their class, their
  // department, the general channel and (staff only) the HOD council.
  const rooms = useMemo(() => {
    return MOCK_CHAT_ROOMS.filter((room) => {
      if (currentRole === 'management') return true;
      if (room.type === 'general') return true;
      if (room.type === 'hod') {
        return currentRole === 'hod';
      }
      if (currentRole === 'student') {
        return room.division_id !== null && room.division_id === user?.division_id;
      }
      if (room.department_id && userDeptId) {
        if (room.department_id === userDeptId) return true;
      }
      return room.division_id === user?.division_id;
    });
  }, [currentRole, userDeptId, user?.division_id]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];
  const roomMessages = messages.filter((m) => m.room_id === activeRoom?.id);

  const selectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setSendError('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setSendError('');

    let newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: activeRoom.id,
      sender_id: user?.id || 'curr-user',
      text,
      created_at: new Date().toISOString(),
      sender: {
        name: user?.name || 'You',
        role: currentRole,
      },
    };

    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(activeRoom.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sender_name: user?.name,
          sender_role: currentRole,
        }),
      });

      const payload = await res.json();
      if (res.ok && payload?.ok && payload.data) {
        newMsg = payload.data as ChatMessage;
      } else if (!res.ok) {
        setSendError('Saved on this device — the server rejected the message.');
      }
    } catch {
      setSendError('Saved on this device — you appear to be offline.');
    }

    setMessages([...messages, newMsg]);
    setInputText('');
    setSending(false);
  };

  if (!activeRoom) {
    return (
      <Card className="p-8 bg-white text-center">
        <h1 className="font-black uppercase text-black mb-2">No channels yet</h1>
        <p className="text-xs font-bold text-black/60">
          Your account is not linked to a class or department channel.
        </p>
      </Card>
    );
  }

  const roleColors: Record<UserRole, string> = {
    management: '#BF360C',
    hod: '#80CBC4',
    teacher: '#4DB6AC',
    student: '#FFD54F',
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
              Department & Class Channels
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Campus Collaboration Hub
          </h1>
          <p className="text-xs md:text-sm font-bold text-black/70">
            Department and class discussions for HODs, teachers and students.
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
              {rooms.map((room) => {
                const isActive = room.id === activeRoom?.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left font-black text-xs uppercase tracking-tight transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FFD54F] border-black nb-shadow-sm text-black -translate-y-0.5'
                        : 'bg-[#F1F8E9] border-black/20 text-black/80 hover:border-black hover:bg-white'
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
          <Card className="p-4 bg-[#F7FBF3]">
            <h4 className="text-[11px] font-black uppercase text-black/70 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role Colour Badges
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase">
              <span className="px-2 py-1 rounded-md border border-black bg-[#BF360C] text-white">
                👔 Management
              </span>
              <span className="px-2 py-1 rounded-md border border-black bg-[#80CBC4] text-black">
                🎓 HOD
              </span>
              <span className="px-2 py-1 rounded-md border border-black bg-[#4DB6AC] text-black">
                👩‍🏫 Teacher
              </span>
              <span className="px-2 py-1 rounded-md border border-black bg-[#FFD54F] text-black">
                🎒 Student
              </span>
            </div>
          </Card>
        </div>

        {/* Messages Container */}
        <div className="md:col-span-8 flex flex-col">
          <Card className="p-0 bg-white flex flex-col flex-1 overflow-hidden min-h-[520px]">
            {/* Room Header */}
            <div className="p-4 border-b-3 border-black bg-[#FFD54F] flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-black uppercase">
                  {activeRoom.name}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-black/70">
                  Channel Type: {activeRoom.type}
                </span>
              </div>
              <Badge color="outline" size="sm">
                {roomMessages.length} Messages
              </Badge>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto max-h-[380px] bg-[#F1F8E9]/40">
              {roomMessages.length === 0 ? (
                <div className="text-center py-12 text-black/50 font-bold text-xs uppercase">
                  No messages yet. Send the first message below!
                </div>
              ) : (
                roomMessages.map((msg) => {
                  const isMine =
                    msg.sender_id === user?.id || msg.sender?.name === 'You';
                  const senderRole = (msg.sender?.role || 'student') as UserRole;
                  const roleBg = roleColors[senderRole] || '#FFD54F';

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
                            ? 'bg-[#FFD54F] rounded-tr-none'
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

            {sendError && (
              <div
                role="status"
                className="px-4 py-2 bg-[#F7FBF3] border-t-2 border-black/10 text-[10px] font-black uppercase text-[#BF360C]"
              >
                {sendError}
              </div>
            )}

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
                disabled={!inputText.trim() || sending}
                loading={sending}
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

