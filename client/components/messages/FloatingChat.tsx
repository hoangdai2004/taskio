"use client";

import styled from "styled-components";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "@/lib/axios";
import {
  MessageSquare,
  X,
  Users,
  User,
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Reply,
  FileIcon,
  LoaderCircle,
  Trash2,
  Search,
  MoreHorizontal,
  Maximize2
} from "lucide-react";
import UserProfileModal from "../modals/UserProfileModal";
import { useAuth } from "@/context/AuthContext";
import {
  getChannels,
  getChannelMessages,
  sendMessage,
  uploadFile,
  toggleReaction,
  createChannel,
  createDirectChannel,
  deleteMessage,
  deleteChannel,
  Channel,
  Message
} from "@/lib/services/messages.service";
import { getCompanyMembers, CompanyMember } from "@/lib/services/companies.service";
import { socket } from "@/lib/socket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface ChannelWithLastMsg extends Channel {
  lastMessage?: Message;
  unreadCount: number;
}

export default function FloatingChat({ isFullScreen = false }: { isFullScreen?: boolean }) {
  const [isOpen, setIsOpen] = useState(isFullScreen);
  const [activeTab, setActiveTab] = useState<"all" | "group" | "direct">("all");
  const [channels, setChannels] = useState<ChannelWithLastMsg[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [attachments, setAttachments] = useState<{ url: string; name: string; type: string; size: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<number | null>(null);
  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);
  const [showChannelMenuFor, setShowChannelMenuFor] = useState<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newChatSearchQuery, setNewChatSearchQuery] = useState("");
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'message' | 'channel', id: number } | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<CompanyMember | null>(null);

  const { activeCompanyId, user } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!activeCompanyId) return;

    const loadChannels = async () => {
      try {
        const data = await getChannels(activeCompanyId);
        setChannels(data);
      } catch (err) {
        console.error("Failed to load channels:", err);
      }
    };

    loadChannels();
  }, [activeCompanyId]);

  useEffect(() => {
    if (isOpen && selectedChannel && activeCompanyId) {
      axios.post(`/messages/channels/${selectedChannel.id}/read`).catch(console.error);
      setChannels(prev => prev.map(c => 
        c.id === selectedChannel.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [isOpen, selectedChannel?.id, activeCompanyId]);

  useEffect(() => {
    if (!user || !socket) return;

    const joinChannels = () => {
      channels.forEach(channel => {
        socket.emit("join_channel", channel.id);
      });
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", joinChannels);
    socket.on("connect_error", (err) => {
      console.error("[DEBUG] Socket connect_error:", err.message);
    });

    if (socket.connected) {
      joinChannels();
    }

    const handleOnlineUsers = (userIds: number[]) => setOnlineUsers(new Set(userIds));
    const handleUserStatus = ({ userId, online }: { userId: number, online: boolean }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("connect", joinChannels);
      socket.off("connect_error");
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_status", handleUserStatus);
    };
  }, [user, channels]);

  useEffect(() => {
    const handleOpenDM = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { userId } = customEvent.detail;
      setIsOpen(true);
      handleCreateDirectMessage(userId);
    };

    window.addEventListener("open-direct-message", handleOpenDM);
    return () => window.removeEventListener("open-direct-message", handleOpenDM);
  }, [channels, activeCompanyId]);

  useEffect(() => {
    if (!user || !socket) return;

    const handleNewMessage = (message: Message) => {
      console.log("[DEBUG] handleNewMessage received:", message);
      if (!message || !message.channelId) return;

      const channelId = message.channelId;
      console.log(`[DEBUG] Comparing selectedChannel?.id (${selectedChannel?.id}) with channelId (${channelId})`);

      setChannels(prev => prev.map(channel => {
        if (channel.id === channelId) {
          if (channel.lastMessage?.id === message.id) return channel;
          
          const isCurrentlyReading = isOpen && selectedChannel?.id === channelId;
          
          if (isCurrentlyReading && activeCompanyId) {
            axios.post(`/messages/channels/${channel.id}/read`).catch(console.error);
          }

          return {
            ...channel,
            lastMessage: message,
            unreadCount: isCurrentlyReading ? 0 : channel.unreadCount + 1
          };
        }
        return channel;
      }));

      if (selectedChannel?.id === channelId) {
        setMessages(prev => {
          if (prev.find(m => m && m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("message_received", handleNewMessage);
    socket.on("new_message", handleNewMessage);

    const handleReactionUpdate = (data: any) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          const newReactions = [...(m.reactions || [])];
          const existingIdx = newReactions.findIndex(r => r.userId === data.userId && r.emoji === data.emoji);
          if (data.action === "added" && existingIdx === -1) {
            newReactions.push({ id: Date.now(), emoji: data.emoji, userId: data.userId, user: { id: data.userId, fullName: data.fullName } });
          } else if (data.action === "removed" && existingIdx !== -1) {
            newReactions.splice(existingIdx, 1);
          }
          return { ...m, reactions: newReactions };
        }
        return m;
      }));
    };
    socket.on("reaction_update", handleReactionUpdate);

    socket.on("message_deleted", ({ messageId, channelId }) => {
      if (selectedChannel?.id === channelId) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    });

    socket.on("channel_deleted", ({ channelId }) => {
      setChannels(prev => prev.filter(c => c.id !== channelId));
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
    });

    return () => {
      socket.off("message_received", handleNewMessage);
      socket.off("new_message", handleNewMessage);
      socket.off("reaction_update", handleReactionUpdate);
      socket.off("message_deleted");
      socket.off("channel_deleted");
    };
  }, [user, isOpen, selectedChannel?.id]);

  useEffect(() => {
    if (!selectedChannel || !activeCompanyId) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await getChannelMessages(activeCompanyId, selectedChannel.id);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChannel, activeCompanyId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      if (activeTab === "all") return true;
      if (activeTab === "group") return channel.type === "project";
      if (activeTab === "direct") return channel.type === "direct";
      return true;
    }).sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || a.createdAt;
      const timeB = b.lastMessage?.createdAt || b.createdAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }, [channels, activeTab]);

  const totalUnread = channels.reduce((acc, curr) => acc + curr.unreadCount, 0);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !selectedChannel || !activeCompanyId) return;

    try {
      const content = newMessage;
      const parentId = replyingTo?.id;
      const currentAttachments = [...attachments];

      setNewMessage("");
      setReplyingTo(null);
      const result = await sendMessage(activeCompanyId, selectedChannel.id, content, parentId, currentAttachments);
      
      setMessages(prev => {
        if (prev.find(m => m && m.id === result.data.id)) return prev;
        return [...prev, result.data];
      });

      setChannels(prev => prev.map(ch => {
        if (ch.id === selectedChannel.id) {
          return {
            ...ch,
            lastMessage: result.data
          };
        }
        return ch;
      }));
    } catch (err: any) {
      console.error("Failed to send message:", err);
      alert("Gửi tin nhắn thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    setDeleteConfirm({ type: 'message', id: messageId });
  };

  const handleDeleteChannel = () => {
    if (!selectedChannel) return;
    if (selectedChannel.type === "project") {
      alert("Không thể xoá kênh dự án");
      return;
    }
    setDeleteConfirm({ type: 'channel', id: selectedChannel.id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    setDeleteConfirm(null);

    if (type === 'message') {
      try {
        await deleteMessage(id);
        setMessages(prev => prev.filter(m => m.id !== id));
      } catch (err: any) {
        console.error("Failed to delete message:", err);
        alert("Xoá tin nhắn thất bại: " + (err.response?.data?.message || err.message));
      }
    } else if (type === 'channel') {
      try {
        await deleteChannel(id);
        setChannels(prev => prev.filter(c => c.id !== id));
        setSelectedChannel(null);
      } catch (err: any) {
        console.error("Failed to delete channel:", err);
        alert("Xoá cuộc hội thoại thất bại: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(files.map(uploadFile));
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (err: any) {
      alert("Lỗi tải file: " + (err.response?.data?.message || err.message));
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReact = async (messageId: number, emoji: string) => {
    try {
      setShowEmojiPickerFor(null);
      await toggleReaction(messageId, emoji);
    } catch (err) {
      console.error("Failed to react", err);
    }
  };

  const handleChannelSelect = async (channel: Channel) => {
    setSelectedChannel(channel);
    setMessages([]);
    
    // Clear unread count locally immediately
    setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, unreadCount: 0 } : c));
    
    if (activeCompanyId) {
      axios.post(`/messages/channels/${channel.id}/read`).catch(console.error);
    }
  };

  const handleCreateDirectMessage = async (memberId: number) => {
    if (!activeCompanyId) return;
    
    // Check if a direct channel with this user already exists
    const existingChannel = channels.find(c => 
      c.type === "direct" && 
      c.members.some(m => m.id === memberId)
    );

    if (existingChannel) {
      handleChannelSelect(existingChannel);
      setIsCreatingNew(false);
      return;
    }

    try {
      const res = await createDirectChannel(activeCompanyId, memberId);
      const newChannel = { ...res.channel, unreadCount: 0 };
      setChannels(prev => [newChannel, ...prev]);
      handleChannelSelect(newChannel);
      setIsCreatingNew(false);
    } catch (err) {
      console.error("Failed to create direct message:", err);
    }
  };

  useEffect(() => {
    if (isOpen && activeCompanyId && companyMembers.length === 0) {
      setIsLoadingMembers(true);
      getCompanyMembers(activeCompanyId)
        .then(res => setCompanyMembers(res.members))
        .catch(console.error)
        .finally(() => setIsLoadingMembers(false));
    }
  }, [isOpen, activeCompanyId]);

  const handleUserClick = (userId: number, fallbackInfo?: any) => {
    let member = companyMembers.find(m => m.id === userId);
    if (!member && fallbackInfo) {
      member = {
        id: userId,
        email: fallbackInfo.email || "N/A",
        fullName: fallbackInfo.fullName || "User",
        avatarUrl: fallbackInfo.avatarUrl || "",
        role: "MEMBER",
        joinedAt: new Date().toISOString()
      };
    }
    if (member) setSelectedProfileUser(member);
  };

  return (
    <Wrapper $isFullScreen={isFullScreen}>
      <UserProfileModal 
        isOpen={!!selectedProfileUser} 
        onClose={() => setSelectedProfileUser(null)} 
        user={selectedProfileUser} 
      />
      {isOpen && (
        <ChatWindow ref={dropdownRef} $isFullScreen={isFullScreen}>
          {deleteConfirm && (
            <ModalOverlay>
              <ModalContent>
                <h4>{deleteConfirm.type === 'channel' ? 'Xoá cuộc hội thoại' : 'Xoá tin nhắn'}</h4>
                <p>{deleteConfirm.type === 'channel' 
                  ? 'Bạn có chắc chắn muốn xoá toàn bộ cuộc hội thoại này không? Hành động này không thể hoàn tác.' 
                  : 'Bạn có chắc chắn muốn xoá tin nhắn này không? Hành động này không thể hoàn tác.'}</p>
                <ModalActions>
                  <ConfirmButton onClick={() => setDeleteConfirm(null)}>Huỷ</ConfirmButton>
                  <ConfirmButton $danger onClick={confirmDelete}>Xoá</ConfirmButton>
                </ModalActions>
              </ModalContent>
            </ModalOverlay>
          )}

          {selectedChannel ? (
            <>
              <Header>
                <HeaderLeft>
                  <BackButton aria-label="Back" onClick={() => setSelectedChannel(null)}>
                    <ArrowLeft size={20} color="white" />
                  </BackButton>
                  <AvatarWrapper>
                    {selectedChannel.type === "project" ? (
                      <ProjectAvatarSmall>
                        <Users size={16} color="white" />
                      </ProjectAvatarSmall>
                    ) : (
                      <UserAvatarSmall 
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const otherMember = selectedChannel.members.find(m => m.id !== user?.id);
                          if (otherMember) handleUserClick(otherMember.id, otherMember);
                        }}
                      >
                        <Image
                          src={selectedChannel.members.find(m => m.id !== user?.id)?.avatarUrl || "/images/avatar-default.png"}
                          alt="avatar" width={32} height={32}
                        />
                        <StatusDot $online={onlineUsers.has(selectedChannel.members.find(m => m.id !== user?.id)?.id || 0)} style={{ width: 10, height: 10, right: 0, bottom: 0 }} />
                      </UserAvatarSmall>
                    )}
                  </AvatarWrapper>
                  <HeaderText>
                    <h3>{selectedChannel.type === "project" ? selectedChannel.name : selectedChannel.members.find(m => m.id !== user?.id)?.fullName}</h3>
                    <span>
                      {selectedChannel.type === "project" 
                        ? "Kênh dự án" 
                        : (onlineUsers.has(selectedChannel.members.find(m => m.id !== user?.id)?.id || 0) ? "Đang hoạt động" : "Ngoại tuyến")
                      }
                    </span>
                  </HeaderText>
                </HeaderLeft>
                <HeaderActions>
                  {!isFullScreen && (
                    <CloseButton onClick={() => router.push("/dashboard/messages")} aria-label="Phóng to">
                      <Maximize2 size={18} color="white" />
                    </CloseButton>
                  )}
                  {!isFullScreen && (
                    <CloseButton onClick={() => setIsOpen(false)}>
                      <X size={20} color="white" />
                    </CloseButton>
                  )}
                </HeaderActions>
              </Header>

              <MessagesArea>
                {isLoadingMessages ? (
                  <EmptyState>Đang tải tin nhắn...</EmptyState>
                ) : messages.length === 0 ? (
                  <EmptyState>Bắt đầu cuộc hội thoại</EmptyState>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender.id === user?.id;
                    const showSender = !isMe && (i === 0 || messages[i - 1].sender.id !== msg.sender.id);

                    return (
                      <MessageRow key={msg.id} $isMe={isMe}>
                        {!isMe && (
                          <MsgAvatar 
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUserClick(msg.sender.id, msg.sender)}
                          >
                            {showSender && (
                              <Image
                                src={msg.sender.avatarUrl || "/images/avatar-default.png"}
                                alt="avatar" width={28} height={28}
                              />
                            )}
                          </MsgAvatar>
                        )}
                        <MessageContentWrapper $isMe={isMe}>
                          {showSender && <SenderName>{msg.sender.fullName}</SenderName>}
                          
                          {msg.parentId && (
                            <ReplyContext>
                              <Reply size={12} /> Đã trả lời một tin nhắn
                            </ReplyContext>
                          )}

                          <Bubble $isMe={isMe}>
                            {msg.content}
                            
                            {msg.attachments && msg.attachments.length > 0 && (
                              <MessageAttachments>
                                {msg.attachments.map((att, idx) => (
                                  att.type?.startsWith('image/') ? (
                                    <ImageAttachment key={idx} src={att.url} alt="attachment" />
                                  ) : (
                                    <FileAttachment key={idx} href={att.url} target="_blank" rel="noreferrer">
                                      <FileIcon size={16} /> {att.name}
                                    </FileAttachment>
                                  )
                                ))}
                              </MessageAttachments>
                            )}
                            
                            <MessageTime $isMe={isMe}>{format(new Date(msg.createdAt), "HH:mm")}</MessageTime>
                          </Bubble>

                          {msg.reactions && msg.reactions.length > 0 && (
                            <ReactionsList $isMe={isMe}>
                              {Object.entries(msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([emoji, count]) => (
                                <ReactionPill key={emoji} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReact(msg.id, emoji); }} $active={msg.reactions?.some(r => r.userId === user?.id && r.emoji === emoji)}>
                                  {emoji} {count}
                                </ReactionPill>
                              ))}
                            </ReactionsList>
                          )}
                        </MessageContentWrapper>

                        <MessageActions $isMe={isMe}>
                          <ActionBtn aria-label="React" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenuFor(null); setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id); }}><Smile size={16} /></ActionBtn>
                          <ActionBtn aria-label="Reply" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenuFor(null); setReplyingTo(msg); }}><Reply size={16} /></ActionBtn>
                          {isMe && (
                            <div style={{ position: "relative" }}>
                              <ActionBtn aria-label="More" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEmojiPickerFor(null); setShowMenuFor(showMenuFor === msg.id ? null : msg.id); }}>
                                <MoreHorizontal size={16} />
                              </ActionBtn>
                              {showMenuFor === msg.id && (
                                <MessageMenu>
                                  <MenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteMessage(msg.id); setShowMenuFor(null); }}>
                                    <Trash2 size={14} color="#ef4444" /> Delete Message
                                  </MenuItem>
                                </MessageMenu>
                              )}
                            </div>
                          )}
                          {showEmojiPickerFor === msg.id && (
                            <EmojiPicker>
                              {["👍", "❤️", "😂", "😢", "🔥", "🙏"].map(emoji => (
                                <span key={emoji} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReact(msg.id, emoji); }}>{emoji}</span>
                              ))}
                            </EmojiPicker>
                          )}
                        </MessageActions>
                      </MessageRow>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </MessagesArea>

              <InputContainer>
                {replyingTo && (
                  <ReplyPreview>
                    <div>
                      <strong>Đang trả lời {replyingTo.sender.fullName}</strong>
                      <p>{replyingTo.content}</p>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)}><X size={14} /></button>
                  </ReplyPreview>
                )}

                {attachments.length > 0 && (
                  <AttachmentsPreview>
                    {attachments.map((att, i) => (
                      <AttachmentItem key={i}>
                        {att.type.startsWith('image/') ? (
                          <img src={att.url} alt="preview" />
                        ) : (
                          <div className="file-icon"><FileIcon size={20} /></div>
                        )}
                        <button type="button" onClick={() => removeAttachment(i)}><X size={12} /></button>
                      </AttachmentItem>
                    ))}
                  </AttachmentsPreview>
                )}

                <InputArea onSubmit={handleSendMessage}>
                  <ActionBtn aria-label="Attach file" type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <LoaderCircle size={20} className="spin" /> : <Paperclip size={20} />}
                  </ActionBtn>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.txt" style={{ display: "none" }} />
                  
                  <MessageInput
                    placeholder="Viết tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <SendButton type="submit" disabled={!newMessage.trim() && attachments.length === 0}>
                    <Send size={20} />
                  </SendButton>
                </InputArea>
              </InputContainer>
            </>
          ) : (
            <>
              <Header>
                <HeaderLeft>
                  {isCreatingNew ? (
                    <BackButton aria-label="Back" onClick={() => setIsCreatingNew(false)}>
                      <ArrowLeft size={20} color="white" />
                    </BackButton>
                  ) : (
                    <IconBox>
                      <MessageSquare size={20} color="white" />
                    </IconBox>
                  )}
                  <HeaderText>
                    <h3>{isCreatingNew ? "Tin nhắn mới" : "Tin nhắn"}</h3>
                    {!isCreatingNew && <span>{channels.length} cuộc hội thoại</span>}
                  </HeaderText>
                </HeaderLeft>
                <HeaderActions>
                  {!isCreatingNew && (
                    <IconButton aria-label="Search people" onClick={() => setIsCreatingNew(true)}>
                      <Search size={18} color="white" />
                    </IconButton>
                  )}
                  {!isFullScreen && (
                    <CloseButton onClick={() => router.push("/dashboard/messages")} aria-label="Phóng to">
                      <Maximize2 size={18} color="white" />
                    </CloseButton>
                  )}
                  {!isFullScreen && (
                    <CloseButton onClick={() => setIsOpen(false)}>
                      <X size={20} color="white" />
                    </CloseButton>
                  )}
                </HeaderActions>
              </Header>

              {isCreatingNew ? (
                <>
                  <MemberSearchBox>
                    <Search size={16} className="search-icon" />
                    <input
                      placeholder="Tìm kiếm thành viên..."
                      value={newChatSearchQuery}
                      onChange={(e) => setNewChatSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </MemberSearchBox>
                  <ChannelList>
                  {isLoadingMembers ? (
                    <EmptyState>Đang tải danh sách...</EmptyState>
                  ) : companyMembers.filter(m => m.id !== user?.id).length === 0 ? (
                    <EmptyState>Không có thành viên nào khác</EmptyState>
                  ) : (
                    companyMembers
                      .filter(m => m.id !== user?.id && (m.fullName.toLowerCase().includes(newChatSearchQuery.toLowerCase()) || m.email.toLowerCase().includes(newChatSearchQuery.toLowerCase())))
                      .map((member) => (
                        <ChannelItem key={member.id} onClick={() => handleCreateDirectMessage(member.id)}>
                          <AvatarWrapper>
                            <UserAvatar>
                              <Image
                                src={member.avatarUrl || "/images/avatar-default.png"}
                                alt="avatar" width={48} height={48}
                              />
                            </UserAvatar>
                          </AvatarWrapper>
                          <ChannelInfo>
                            <ChannelHeader>
                              <ChannelName>{member.fullName}</ChannelName>
                            </ChannelHeader>
                            <LastMessage>{member.email}</LastMessage>
                          </ChannelInfo>
                        </ChannelItem>
                      ))
                  )}
                </ChannelList>
              </>
              ) : (
                <>
                  <Tabs>
                    <Tab $active={activeTab === "all"} onClick={() => setActiveTab("all")}>
                      Tất cả {totalUnread > 0 && <Badge>{totalUnread}</Badge>}
                    </Tab>
                    <Tab $active={activeTab === "group"} onClick={() => setActiveTab("group")}>
                      Nhóm
                    </Tab>
                    <Tab $active={activeTab === "direct"} onClick={() => setActiveTab("direct")}>
                      Cá nhân
                    </Tab>
                  </Tabs>

                  <ChannelList>
                {filteredChannels.length === 0 ? (
                  <EmptyState>Không có cuộc hội thoại nào</EmptyState>
                ) : (
                  filteredChannels.map((channel) => {
                    const otherMember = channel.members.find(m => m.id !== user?.id) || channel.members[0];
                    const isProject = channel.type === "project";
                    const lastMsg = channel.lastMessage;
                    const displayTime = lastMsg
                      ? format(new Date(lastMsg.createdAt), "HH:mm")
                      : format(new Date(channel.createdAt), "HH:mm");

                    return (
                      <ChannelItem key={channel.id} onClick={() => handleChannelSelect(channel)}>
                        <AvatarWrapper>
                          {isProject ? (
                            <ProjectAvatar>
                              <Users size={20} color="white" />
                            </ProjectAvatar>
                          ) : (
                            <UserAvatar>
                              <Image
                                src={otherMember?.avatarUrl || "/images/avatar-default.png"}
                                alt="avatar" width={48} height={48}
                              />
                            </UserAvatar>
                          )}
                          {!isProject && otherMember && <StatusDot $online={onlineUsers.has(otherMember.id)} />}
                        </AvatarWrapper>

                        <ChannelInfo>
                          <ChannelHeader>
                            <ChannelName>{isProject ? channel.name : (otherMember?.fullName || "Người dùng")}</ChannelName>
                            <Time>{displayTime}</Time>
                          </ChannelHeader>
                          <LastMessage>
                            {lastMsg ? (
                              <>
                                <span className="sender">
                                  {lastMsg.sender.id === user?.id ? "Bạn: " : `${lastMsg.sender.fullName.split(" ").pop()}: `}
                                </span>
                                {lastMsg.content}
                              </>
                            ) : (
                              "Bắt đầu cuộc trò chuyện ngay..."
                            )}
                          </LastMessage>
                        </ChannelInfo>

                        {channel.unreadCount > 0 && <UnreadBadge>{channel.unreadCount}</UnreadBadge>}
                        
                        {!isProject && (
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <ActionBtn
                              aria-label="More"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowChannelMenuFor(showChannelMenuFor === channel.id ? null : channel.id);
                              }}
                              style={{ padding: '4px' }}
                            >
                              <MoreHorizontal size={18} />
                            </ActionBtn>
                            {showChannelMenuFor === channel.id && (
                              <ChannelMenu>
                                <MenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({ type: 'channel', id: channel.id });
                                  setShowChannelMenuFor(null);
                                }}>
                                  <Trash2 size={14} color="#ef4444" /> Xoá cuộc hội thoại
                                </MenuItem>
                              </ChannelMenu>
                            )}
                          </div>
                        )}
                      </ChannelItem>
                    );
                  })
                )}
              </ChannelList>
            </>
          )}
            </>
          )}
        </ChatWindow>
      )}

      {!isFullScreen && (
        <FloatingButton aria-label="Toggle chat" onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {!isOpen && totalUnread > 0 && <ButtonBadge>{totalUnread}</ButtonBadge>}
        </FloatingButton>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div<{ $isFullScreen?: boolean }>`
  position: ${props => props.$isFullScreen ? "relative" : "fixed"};
  bottom: ${props => props.$isFullScreen ? "auto" : "30px"};
  right: ${props => props.$isFullScreen ? "auto" : "30px"};
  width: ${props => props.$isFullScreen ? "100%" : "auto"};
  height: ${props => props.$isFullScreen ? "100%" : "auto"};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
`;

const FloatingButton = styled.button<{ $isOpen: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(30, 61, 157, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  &:hover {
    transform: scale(1.1) rotate(${props => props.$isOpen ? "90deg" : "0deg"});
  }
`;

const ButtonBadge = styled.div`
  position: absolute; top: -5px; right: -5px;
  background: #ef4444; color: white;
  font-size: 12px; font-weight: 700;
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid white;
`;

const ChatWindow = styled.div<{ $isFullScreen?: boolean }>`
  width: ${props => props.$isFullScreen ? "100%" : "400px"};
  max-height: ${props => props.$isFullScreen ? "none" : "calc(100vh - 120px)"};
  height: ${props => props.$isFullScreen ? "100%" : "600px"};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${props => props.$isFullScreen ? "0" : "24px"};
  box-shadow: ${props => props.$isFullScreen ? "none" : "0 20px 50px rgba(0, 0, 0, 0.15)"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${props => props.$isFullScreen ? "none" : "slideUp 0.3s ease-out"};

  @media (max-width: 500px) {
    width: ${props => props.$isFullScreen ? "100%" : "calc(100vw - 40px)"};
    right: ${props => props.$isFullScreen ? "0" : "20px"};
    height: ${props => props.$isFullScreen ? "100%" : "calc(100vh - 140px)"};
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div` display: flex; align-items: center; gap: 12px; `;

const BackButton = styled.button`
  background: transparent; border: none; cursor: pointer;
  padding: 4px; border-radius: 50%;
  &:hover { background: rgba(255,255,255,0.1); }
`;

const IconBox = styled.div`
  width: 40px; height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  span {
    font-size: 12px;
    color: rgba(255,255,255,0.8);
  }
`;

const MemberSearchBox = styled.div`
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: transparent; border: none; cursor: pointer;
  padding: 4px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const CloseButton = styled.button`
  background: transparent; border: none; cursor: pointer;
  padding: 4px; border-radius: 8px;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const Tabs = styled.div` display: flex; padding: 0 12px; border-bottom: 1px solid #f1f5f9; `;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1; padding: 14px 0;
  background: transparent; border: none;
  border-bottom: 2px solid ${props => props.$active ? "var(--color-primary)" : "transparent"};
  color: ${props => props.$active ? "var(--color-text-primary)" : "var(--color-text-muted)"};
  font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
`;

const Badge = styled.span` background: #ef4444; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; `;

const ChannelList = styled.div` flex: 1; overflow-y: auto; padding: 8px 0; `;

const ChannelItem = styled.div`
  display: flex; align-items: center; padding: 12px 20px; gap: 14px;
  cursor: pointer; transition: background 0.2s;
  &:hover { background: #f8fafc; }
`;

const AvatarWrapper = styled.div` position: relative; `;

const UserAvatar = styled.div` width: 48px; height: 48px; border-radius: 16px; overflow: hidden; background: #f1f5f9; `;
const UserAvatarSmall = styled.div` width: 32px; height: 32px; border-radius: 10px; overflow: hidden; background: #f1f5f9; `;

const ProjectAvatar = styled.div` width: 48px; height: 48px; border-radius: 16px; background: ${({ theme }) => theme.colors.primary}; display: flex; align-items: center; justify-content: center; `;
const ProjectAvatarSmall = styled.div` width: 32px; height: 32px; border-radius: 10px; background: ${({ theme }) => theme.colors.primary}; display: flex; align-items: center; justify-content: center; `;

const StatusDot = styled.div<{ $online: boolean }>`
  position: absolute; bottom: -2px; right: -2px;
  width: 12px; height: 12px;
  background: ${props => props.$online ? "#22c55e" : "#94a3b8"};
  border: 2px solid white; border-radius: 50%;
`;

const ChannelInfo = styled.div` flex: 1; min-width: 0; `;
const ChannelHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; `;
const ChannelName = styled.h4` margin: 0; font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const Time = styled.span` font-size: 11px; color: #94a3b8; `;
const LastMessage = styled.p` margin: 0; font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; .sender { font-weight: 500; color: #94a3b8; } `;
const UnreadBadge = styled.div` background: ${({ theme }) => theme.colors.primary}; color: white; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; `;

const MessagesArea = styled.div`
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
  background: ${({ theme }) => theme.colors.background};
`;

const MessageRow = styled.div<{ $isMe: boolean }>`
  display: flex; gap: 10px;
  flex-direction: ${props => props.$isMe ? "row-reverse" : "row"};
  align-items: flex-end;
`;

const MsgAvatar = styled.div` width: 28px; height: 28px; border-radius: 8px; overflow: hidden; `;

const MessageContentWrapper = styled.div<{ $isMe: boolean }>`
  display: flex; flex-direction: column;
  align-items: ${props => props.$isMe ? "flex-end" : "flex-start"};
  max-width: 75%;
`;

const SenderName = styled.span` font-size: 11px; color: #94a3b8; margin-bottom: 4px; margin-left: 4px; `;

const Bubble = styled.div<{ $isMe: boolean }>`
  padding: 10px 14px;
  border-radius: ${props => props.$isMe ? "18px 18px 2px 18px" : "18px 18px 18px 2px"};
  background: ${props => props.$isMe ? "var(--color-primary)" : "var(--color-surface)"};
  color: ${props => props.$isMe ? "white" : "var(--color-text-primary)"};
  font-size: 14px; line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
  border: 1px solid ${props => props.$isMe ? "transparent" : "var(--color-border-light)"};
`;

const MessageTime = styled.span<{ $isMe: boolean }>`
  font-size: 10px; opacity: 0.7; margin-top: 4px; display: block; text-align: right;
  color: ${props => props.$isMe ? "white" : "#94a3b8"};
`;

const InputArea = styled.form`
  padding: 16px; border-top: 1px solid ${({ theme }) => theme.colors.borderLight || '#f1f5f9'};
  display: flex; align-items: center; gap: 8px;
  background: ${({ theme }) => theme.colors.surface};
`;

const MessageInput = styled.input`
  flex: 1; background: ${({ theme }) => theme.colors.background}; border: 1px solid ${({ theme }) => theme.colors.borderLight || 'transparent'}; outline: none;
  padding: 10px 16px; border-radius: 20px; font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted || '#94a3b8'}; }
`;

const ActionBtn = styled.button` background: transparent; border: none; cursor: pointer; color: #94a3b8; &:hover { color: #6366f1; } `;

const SendButton = styled.button`
  background: ${({ theme }) => theme.colors.primary}; color: white; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s; flex-shrink: 0;
  &:disabled { background: #e2e8f0; cursor: not-allowed; }
  &:hover:not(:disabled) { transform: scale(1.1); background: #4f46e5; }
`;

const EmptyState = styled.div` padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; `;

const MessageActions = styled.div<{ $isMe: boolean }>`
  display: flex; gap: 8px; align-items: center; opacity: 0; transition: 0.2s;
  position: relative;
  ${MessageRow}:hover & { opacity: 1; }
  flex-direction: ${props => props.$isMe ? "row-reverse" : "row"};
`;

const EmojiPicker = styled.div`
  position: absolute; bottom: 100%; right: 0;
  background: ${({ theme }) => theme.colors.surface}; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  padding: 6px 10px; display: flex; gap: 8px; z-index: 10; margin-bottom: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight || '#e2e8f0'};
  span { cursor: pointer; transition: 0.2s; font-size: 16px; &:hover { transform: scale(1.3); } }
`;

const MessageMenu = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 4px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  min-width: 140px;
  margin-bottom: 8px;
`;

const ChannelMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 4px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 30;
  min-width: 160px;
  margin-top: 4px;
`;

const MenuItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: transparent;
  border: none;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }
`;

const ReactionsList = styled.div<{ $isMe: boolean }>`
  display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;
  justify-content: ${props => props.$isMe ? "flex-end" : "flex-start"};
`;

const ReactionPill = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? "#e0e7ff" : "rgba(255,255,255,0.8)"};
  border: 1px solid ${props => props.$active ? "#818cf8" : "#e2e8f0"};
  color: #1e293b; border-radius: 12px; padding: 2px 6px; font-size: 11px;
  display: flex; align-items: center; gap: 4px; cursor: pointer;
  &:hover { background: #f1f5f9; }
`;

const InputContainer = styled.div`
  display: flex; flex-direction: column; background: ${({ theme }) => theme.colors.surface}; border-top: 1px solid ${({ theme }) => theme.colors.borderLight || '#f1f5f9'};
`;

const ReplyPreview = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; background: ${({ theme }) => theme.colors.background}; border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight || '#f1f5f9'};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  div { flex: 1; overflow: hidden; }
  strong { font-size: 12px; color: ${({ theme }) => theme.colors.primary}; display: block; }
  p { font-size: 12px; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  button { background: transparent; border: none; cursor: pointer; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const AttachmentsPreview = styled.div`
  display: flex; gap: 10px; padding: 10px 16px; overflow-x: auto;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight || '#f1f5f9'};
`;

const AttachmentItem = styled.div`
  position: relative; width: 50px; height: 50px; border-radius: 8px; overflow: hidden;
  background: ${({ theme }) => theme.colors.background}; flex-shrink: 0; border: 1px solid ${({ theme }) => theme.colors.borderLight || '#e2e8f0'};
  img { width: 100%; height: 100%; object-fit: cover; }
  .file-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: ${({ theme }) => theme.colors.textMuted}; }
  button {
    position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white;
    border: none; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
`;

const ReplyContext = styled.div`
  font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-bottom: 4px;
`;

const MessageAttachments = styled.div`
  display: flex; flex-direction: column; gap: 8px; margin-top: 8px;
`;

const ImageAttachment = styled.img`
  max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover; cursor: pointer;
`;

const FileAttachment = styled.a`
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: rgba(255,255,255,0.2); border-radius: 8px; color: inherit; text-decoration: none;
  font-size: 12px; border: 1px solid rgba(0,0,0,0.1);
  &:hover { background: rgba(255,255,255,0.3); }
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 24px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: 20px;
  width: 85%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: modalPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @keyframes modalPop {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  h4 { margin: 0 0 10px 0; font-size: 16px; color: ${({ theme }) => theme.colors.textPrimary}; font-weight: 700; }
  p { margin: 0 0 24px 0; font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.5; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ConfirmButton = styled.button<{ $danger?: boolean }>`
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
  background: ${props => props.$danger ? 'var(--color-danger)' : 'var(--color-background)'};
  color: ${props => props.$danger ? 'white' : 'var(--color-text-primary)'};
  border: 1px solid ${props => props.$danger ? 'transparent' : 'var(--color-border)'};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
  &:active {
    transform: translateY(0);
  }
`;
