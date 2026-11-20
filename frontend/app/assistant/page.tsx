"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useEffect, useRef, useState } from "react";
import {
  Shield,
  ShieldCheck,
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  Send,
  Sparkles,
  Copy,
  Volume2,
  VolumeX,
  Menu,
  X,
  ChevronDown,
  Image as ImageIcon,
  Video,
  FileText,
  QrCode,
  Lock,
  Globe,
  AlertTriangle,
  ArrowUp,
  Check,
  Search,
  MoreHorizontal,
  Zap,
  Activity,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STORAGE_KEY = "deepshield_assistant_chats";

const suggestedPrompts = [
  {
    icon: ImageIcon,
    title: "Analyze image authenticity",
    description: "How can I identify an AI-generated image?",
    prompt:
      "How can I identify whether an image is AI-generated or a real photograph?",
  },
  {
    icon: Video,
    title: "Detect deepfake videos",
    description: "Explain the signs of video manipulation.",
    prompt:
      "Explain how deepfake videos are detected and what signs I should look for.",
  },
  {
    icon: QrCode,
    title: "QR code security",
    description: "Can QR codes be used for phishing attacks?",
    prompt:
      "Can QR codes be used for phishing attacks? How can I safely scan suspicious QR codes?",
  },
  {
    icon: FileText,
    title: "Document security",
    description: "Identify suspicious documents and files.",
    prompt:
      "What are the security risks associated with suspicious PDF and document files?",
  },
];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createChat(): Chat {
  return {
    id: generateId(),
    title: "New conversation",
    messages: [],
    updatedAt: Date.now(),
  };
}

function getChatTitle(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 35 ? `${cleaned.slice(0, 35)}...` : cleaned;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDemoResponse(message: string): string {
  const text = message.toLowerCase();

  if (
    text.includes("deepfake") ||
    text.includes("video") ||
    text.includes("face swap")
  ) {
    return `## Understanding Deepfake Detection

Deepfakes are media files in which a person's appearance, voice, or actions have been artificially manipulated or generated.

### Common indicators to investigate

• **Facial inconsistencies:** unnatural facial movement, unusual expressions, or inconsistencies between facial regions.

• **Lighting and shadows:** lighting on the face may not match the surrounding environment.

• **Temporal inconsistencies:** facial details may flicker, change, or behave inconsistently between frames.

• **Audio synchronization:** the spoken words may not perfectly align with the person's lip movements.

• **Visual artifacts:** unusual edges, blur, or distortions may appear around facial features.

### How AI detection works

Video authenticity systems can analyze individual frames, facial features, temporal consistency, visual artifacts, and other patterns associated with manipulated media.

**Important:** These indicators are not definitive proof. Compression, poor lighting, camera quality, and editing can also produce similar artifacts.`;
  }

  if (
    text.includes("qr") ||
    text.includes("quick response") ||
    text.includes("scan")
  ) {
    return `## QR Code Security

QR codes can be used to redirect users to websites, payment pages, download locations, or other content. Attackers sometimes replace legitimate QR codes with malicious ones.

### Common QR code risks

• **Phishing websites:** the QR code may lead to a fake login page.

• **Payment fraud:** a QR code may redirect payment to an unintended recipient.

• **Malicious downloads:** QR codes may initiate downloads of dangerous files.

• **Credential theft:** fake websites may request passwords, OTPs, or personal information.

### Stay safe

1. Preview the destination URL before opening it.
2. Check the domain carefully for spelling mistakes.
3. Avoid entering credentials on unfamiliar websites.
4. Never share OTPs after scanning a QR code.
5. Be cautious with QR codes placed over original posters or payment displays.

DeepShield QR analysis can help inspect decoded QR content and identify potentially suspicious destinations.`;
  }

  if (
    text.includes("phishing") ||
    text.includes("url") ||
    text.includes("website") ||
    text.includes("link")
  ) {
    return `## Identifying Phishing Websites

Phishing websites are designed to trick people into sharing credentials, financial information, or personal data.

### Warning signs

• A domain name containing misspellings or unusual characters.

• Unexpected urgency, threats, or claims that your account will be suspended.

• Requests for OTPs, passwords, card details, or sensitive information.

• Suspicious redirects or unexpected shortened URLs.

• Websites pretending to be banks, government services, or well-known companies.

### What you should do

- Verify the website domain independently.
- Avoid clicking unexpected links in messages.
- Never share OTPs or passwords.
- Use multifactor authentication whenever possible.
- If a link is suspicious, do not interact with it.

HTTPS alone does not prove that a website is trustworthy. Malicious websites can also use HTTPS encryption.`;
  }

  if (
    text.includes("image") ||
    text.includes("photo") ||
    text.includes("picture") ||
    text.includes("ai-generated")
  ) {
    return `## Image Authenticity Analysis

AI-generated images can sometimes contain visual inconsistencies, but modern generation models are increasingly capable of producing realistic images.

### What can be examined?

**Visual details**
- Unnatural object shapes
- Inconsistent reflections
- Distorted background objects
- Unusual textures

**Structural details**
- Inconsistent anatomy
- Irregular fingers or hands
- Objects merging unnaturally
- Repeated patterns

**Metadata**
- Image creation software information
- EXIF metadata
- Editing history, if available

### Important limitation

Visual inspection alone is not reliable enough to determine whether an image is AI-generated. Metadata can also be removed or altered.

A forensic detection model should combine multiple indicators and communicate uncertainty rather than treating its prediction as absolute proof.`;
  }

  if (
    text.includes("document") ||
    text.includes("pdf") ||
    text.includes("file")
  ) {
    return `## Document Security

Documents can contain misleading content, malicious links, embedded objects, or potentially dangerous features.

### Things to check

• Unexpected links and redirects.

• Suspicious macros or embedded scripts.

• Unexpected requests to enable editing or content.

• Mismatched file extensions.

• Unknown senders or unexpected attachments.

• Requests for sensitive information.

### Safe handling

1. Verify the sender.
2. Avoid enabling macros in unexpected files.
3. Do not click unknown links inside documents.
4. Scan suspicious files with trusted security tools.
5. Avoid uploading confidential documents to public scanning services.

DeepShield's document analysis can help examine extracted content and identify suspicious indicators.`;
  }

  if (
    text.includes("risk score") ||
    text.includes("risk") ||
    text.includes("score")
  ) {
    return `## Understanding a Risk Score

A risk score is a numerical indicator representing how many potentially suspicious characteristics were identified by a security analysis system.

A general interpretation could be:

**0–29 — Low Risk**
Few suspicious indicators were detected.

**30–59 — Moderate Risk**
Some indicators require further investigation.

**60–79 — High Risk**
Multiple potentially concerning indicators were detected.

**80–100 — Critical Risk**
The analyzed content contains a high concentration of suspicious indicators.

### Important

A risk score is not a probability of fraud unless the model has specifically been calibrated to represent that probability.

A score of 80/100 does not automatically mean an 80% chance that the content is malicious. Always review the underlying findings and evidence.`;
  }

  if (
    text.includes("malware") ||
    text.includes("virus") ||
    text.includes("attack") ||
    text.includes("hacked")
  ) {
    return `## Cybersecurity Threat Guidance

Malware is software designed to perform harmful or unauthorized activities on a computer or device.

### Common threats

• **Ransomware:** encrypts data and demands payment.

• **Spyware:** secretly collects information.

• **Trojans:** disguise themselves as legitimate software.

• **Credential stealers:** attempt to capture usernames and passwords.

• **Phishing:** tricks users into revealing sensitive information.

### If you suspect an infection

1. Disconnect the affected device from the network if active compromise is suspected.
2. Avoid logging into sensitive accounts from that device.
3. Use trusted security software to investigate.
4. Change important passwords from a clean device.
5. Contact your IT or security team if the device is managed.

Do not assume a device is safe simply because no warning appeared.`;
  }

  if (
    text.includes("deepshield") ||
    text.includes("project") ||
    text.includes("what can you do")
  ) {
    return `## Welcome to DeepShield AI

DeepShield is a multimodal AI security and authenticity analysis platform designed to help users evaluate potentially suspicious digital content.

### Our analysis modules

**Photo AI**
Analyze images for potentially AI-generated or manipulated visual content.

**Video AI**
Inspect videos for deepfake indicators, temporal inconsistencies, and potentially manipulated content.

**Document AI**
Analyze documents and extracted content for suspicious indicators.

**QR AI**
Decode QR content and evaluate potentially unsafe destinations or payloads.

### How I can help

I can explain cybersecurity concepts, help interpret risk scores, discuss suspicious indicators, explain analysis results, and provide practical security guidance.

Upload and analyze content using the dedicated DeepShield tools, then ask me questions about the findings.`;
  }

  return `## Security Intelligence Assistant

I can help you understand cybersecurity threats, digital authenticity, and the findings generated by DeepShield AI.

### I can help with

- Image authenticity and AI-generated image detection
- Deepfake videos and media manipulation
- QR code threats and suspicious destinations
- Document security and malicious attachments
- Phishing websites and suspicious URLs
- Malware and common cyber threats
- Understanding risk scores and analysis findings
- Digital safety and security best practices

**For a more accurate analysis:** Use the appropriate DeepShield analysis module first—Photo, Video, Document, or QR—and then ask me about the results.

What would you like to investigate?`;
}

export default function AssistantPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [input, setInput] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chats from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Chat[];

        if (parsed.length > 0) {
          setChats(parsed);
          setActiveChatId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Ignore invalid local storage
    }

    const initialChat = createChat();
    setChats([initialChat]);
    setActiveChatId(initialChat.id);
  }, []);

  // Persist chat history
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  // Current chat
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const messages = activeChat?.messages || [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  // Stop speech on page cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Create new chat
  const newChat = () => {
    const chat = createChat();

    setChats((previous) => [chat, ...previous]);
    setActiveChatId(chat.id);
    setInput("");
    setSidebarOpen(false);
    setSpeaking(false);
    window.speechSynthesis?.cancel();
  };

  // Switch chat
  const switchChat = (chatId: string) => {
    setActiveChatId(chatId);
    setSidebarOpen(false);
    setInput("");
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  // Delete chat
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId);

    if (updatedChats.length === 0) {
      const newConversation = createChat();
      setChats([newConversation]);
      setActiveChatId(newConversation.id);
      return;
    }

    setChats(updatedChats);

    if (activeChatId === chatId) {
      setActiveChatId(updatedChats[0].id);
    }
  };

  // Send message
  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();

    if (!messageText || isTyping) return;

    let chatId = activeChatId;

    // Create chat if needed
    if (!chatId || !activeChat) {
      const newConversation = createChat();

      chatId = newConversation.id;

      setChats((previous) => [newConversation, ...previous]);
      setActiveChatId(chatId);
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setInput("");

    setChats((previous) =>
      previous.map((chat) => {
        if (chat.id !== chatId) return chat;

        const updatedMessages = [...chat.messages, userMessage];

        return {
          ...chat,
          title:
            chat.messages.length === 0
              ? getChatTitle(messageText)
              : chat.title,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
      })
    );

    setIsTyping(true);

    // Simulate assistant processing
    await new Promise((resolve) =>
      setTimeout(resolve, 900 + Math.random() * 700)
    );

    const responseText = getDemoResponse(messageText);

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
    };

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, assistantMessage],
              updatedAt: Date.now(),
            }
          : chat
      )
    );

    setIsTyping(false);
  };

  // Suggested prompt
  const usePrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Copy message
  const copyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);

      setTimeout(() => {
        setCopiedMessageId("");
      }, 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  // Speak message
  const speakMessage = (message: Message) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
        return;
    }

    if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
    }

    window.speechSynthesis.cancel();

    const utterance: SpeechSynthesisUtterance =
        new SpeechSynthesisUtterance(message.content);

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
        setSpeaking(true);
    };

    utterance.onend = () => {
        setSpeaking(false);
    };

    utterance.onerror = () => {
        setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
};

  // Submit on Enter
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Auto resize textarea
  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);

    const textarea = event.target;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  // Clear all chats
  const clearAllChats = () => {
    if (!confirm("Delete all conversation history?")) return;

    const newConversation = createChat();

    setChats([newConversation]);
    setActiveChatId(newConversation.id);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="h-[calc(100vh-0px)] bg-[#080b12] text-white flex overflow-hidden">

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:relative z-50 top-0 left-0 h-full w-[280px] bg-[#0c111a] border-r border-white/5 flex flex-col transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-5 border-b border-white/5">

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <h1 className="font-bold text-sm tracking-wide">
                  DeepShield
                </h1>

                <p className="text-[10px] text-gray-500">
                  SECURITY INTELLIGENCE
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* NEW CHAT */}
          <button
            onClick={newChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New conversation</span>
          </button>
        </div>

        {/* CHAT HISTORY */}
        <div className="flex-1 overflow-y-auto p-4">

          <div className="flex items-center justify-between px-2 mb-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">
              Recent conversations
            </p>

            {chats.length > 1 && (
              <button
                onClick={clearAllChats}
                title="Clear all conversations"
                className="text-gray-600 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {chats
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 p-2.5 rounded-lg transition ${
                    activeChatId === chat.id
                      ? "bg-white/[0.06] border border-white/[0.06]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <MessageSquare
                    size={15}
                    className={`shrink-0 ${
                      activeChatId === chat.id
                        ? "text-emerald-400"
                        : "text-gray-600"
                    }`}
                  />

                  <button
                    onClick={() => switchChat(chat.id)}
                    className="flex-1 text-left text-xs truncate text-gray-300"
                  >
                    {chat.title}
                  </button>

                  <button
                    onClick={() => deleteChat(chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition"
                    title="Delete conversation"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="p-4 border-t border-white/5">

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-medium">
                Security Assistant
              </p>

              <p className="text-[10px] text-gray-500">
                Demo intelligence mode
              </p>
            </div>

            <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full" />
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 min-w-0 flex flex-col relative">

        {/* TOP BAR */}
        <header className="h-[70px] shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#080b12]/90 backdrop-blur">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              <Menu size={20} />
            </button>

            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            <div>
              <h2 className="font-semibold text-sm">
                DeepShield AI Assistant
              </h2>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />

                <span className="text-[10px] text-gray-500">
                  Demo mode · AI backend not connected
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={14} className="text-emerald-400" />
            Secure session
          </div>
        </header>

        {/* MESSAGE AREA */}
        <div className="flex-1 overflow-y-auto">

          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

            {/* EMPTY CHAT / WELCOME */}
            {messages.length === 0 && (
              <div className="min-h-[55vh] flex flex-col items-center justify-center text-center">

                {/* HERO ICON */}
                <div className="relative mb-6">

                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/[0.07] border border-emerald-500/15 flex items-center justify-center">
                    <Shield className="w-9 h-9 text-emerald-400" />
                  </div>

                  <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-[#101620] border border-white/10 flex items-center justify-center">
                    <Sparkles size={13} className="text-emerald-400" />
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Your Security Intelligence Assistant
                </h1>

                <p className="text-gray-400 text-sm max-w-xl mt-3 leading-relaxed">
                  Ask questions about cybersecurity, digital authenticity,
                  suspicious content, or your DeepShield analysis results.
                </p>

                {/* PROMPT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-9 w-full">

                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;

                    return (
                      <button
                        key={index}
                        onClick={() => sendMessage(prompt.prompt)}
                        className="text-left p-4 rounded-xl bg-[#101620] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Icon className="w-4 h-4 text-emerald-400" />
                          </div>

                          <p className="text-sm font-medium group-hover:text-emerald-400 transition">
                            {prompt.title}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                          {prompt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* QUICK TOPICS */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                  {[
                    "Phishing",
                    "AI-generated images",
                    "Deepfakes",
                    "Malware",
                    "QR security",
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => usePrompt(`Explain ${topic} and how to stay safe.`)}
                      className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-xs text-gray-400 transition"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CHAT MESSAGES */}
            {messages.length > 0 && (
              <div className="space-y-8">

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 md:gap-4 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {/* ASSISTANT ICON */}
                    {message.role === "assistant" && (
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}

                    {/* MESSAGE */}
                    <div
                      className={`max-w-[85%] md:max-w-[78%] ${
                        message.role === "user"
                          ? "bg-emerald-500/[0.08] border border-emerald-500/10 rounded-2xl rounded-tr-sm px-4 py-3"
                          : "min-w-0"
                      }`}
                    >

                      {message.role === "user" ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <div className="text-sm text-gray-300 leading-7 whitespace-pre-wrap break-words">
                            {message.content}
                          </div>

                          {/* ACTIONS */}
                          <div className="flex items-center gap-1 mt-4">

                            <button
                              onClick={() => copyMessage(message)}
                              title="Copy response"
                              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                            >
                              {copiedMessageId === message.id ? (
                                <Check size={15} className="text-emerald-400" />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>

                            <button
                              onClick={() => speakMessage(message)}
                              title="Listen to response"
                              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                            >
                              {speaking ? (
                                <VolumeX size={15} className="text-emerald-400" />
                              ) : (
                                <Volume2 size={15} />
                              )}
                            </button>

                            <span className="text-[10px] text-gray-600 ml-1">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </>
                      )}

                      {message.role === "user" && (
                        <div className="text-[10px] text-emerald-400/60 mt-2 text-right">
                          {formatTime(message.timestamp)}
                        </div>
                      )}
                    </div>

                    {/* USER ICON */}
                    {message.role === "user" && (
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-semibold text-gray-400">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {/* TYPING */}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="px-4 py-3 rounded-xl bg-[#101620] border border-white/5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="shrink-0 border-t border-white/5 bg-[#080b12] px-4 md:px-8 py-4">

          <div className="max-w-4xl mx-auto">

            <div className="relative bg-[#101620] border border-white/10 rounded-2xl focus-within:border-emerald-500/30 transition">

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask DeepShield anything about security..."
                rows={1}
                disabled={isTyping}
                className="w-full resize-none bg-transparent text-sm text-white placeholder-gray-500 px-4 pt-4 pb-14 outline-none max-h-[180px] min-h-[58px]"
              />

              {/* INPUT FOOTER */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/[0.05] text-emerald-400/70">
                    <Lock size={11} />
                    <span className="text-[10px]">
                      Security Assistant
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-gray-600 text-white flex items-center justify-center transition"
                >
                  {isTyping ? (
                    <Activity size={16} className="animate-pulse" />
                  ) : (
                    <ArrowUp size={18} />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-600 text-center mt-3">
              DeepShield AI Demo Assistant · AI responses may require verification
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}