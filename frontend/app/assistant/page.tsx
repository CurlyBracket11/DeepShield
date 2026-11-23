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
    <div className="h-screen flex overflow-hidden bg-[#f5f5ef] text-[#26382f]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#182923] text-[#f5f5ef] transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 p-5">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce7d8]/10">
                <Shield className="h-5 w-5 text-[#c1d5bd]" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide">DeepShield</h1>
                <p className="mt-1 text-[9px] tracking-[2px] text-[#a9b9aa]">
                  SECURITY INTELLIGENCE
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-[#a9b9aa] hover:bg-white/10 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <button
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#dce7d8] px-4 py-3 text-sm font-semibold text-[#23382d] transition hover:bg-white"
          >
            <Plus size={17} />
            New conversation
          </button>
        </div>

        {/* HISTORY */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#9eafa0]">
              Recent conversations
            </p>
            {chats.length > 1 && (
              <button
                onClick={clearAllChats}
                title="Clear all conversations"
                className="rounded-lg p-1.5 text-[#a9b9aa] transition hover:bg-white/10 hover:text-red-300"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {[...chats]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 rounded-xl border px-3 py-3 transition ${
                    activeChatId === chat.id
                      ? "border-white/10 bg-white/10"
                      : "border-transparent hover:bg-white/[0.06]"
                  }`}
                >
                  <MessageSquare
                    size={15}
                    className={
                      activeChatId === chat.id
                        ? "shrink-0 text-[#dce7d8]"
                        : "shrink-0 text-[#9eafa0]"
                    }
                  />
                  <button
                    onClick={() => switchChat(chat.id)}
                    className="min-w-0 flex-1 truncate text-left text-xs text-[#e1e8df]"
                  >
                    {chat.title}
                  </button>
                  <button
                    onClick={() => deleteChat(chat.id)}
                    title="Delete conversation"
                    className="rounded p-1 text-[#9eafa0] opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>

          {chats.length === 0 && (
            <p className="px-2 text-xs text-[#9eafa0]">
              Your conversations will appear here.
            </p>
          )}
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce7d8]/10">
              <Bot size={17} className="text-[#dce7d8]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold">Security Assistant</p>
              <p className="mt-1 text-[10px] text-[#a9b9aa]">
                Demo intelligence mode
              </p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" />
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#dfe3d9] bg-[#fbfbf7] px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#53665a] transition hover:bg-[#e9eee6] lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6ede3]">
              <Sparkles size={18} className="text-[#496b52]" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-[#26382f]">
                DeepShield AI Assistant
              </h2>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] text-[#849187]">
                  Demo mode · Backend not connected
                </span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#dfe6dc] bg-white px-3 py-2 text-[11px] font-medium text-[#64766a] sm:flex">
            <ShieldCheck size={14} className="text-[#547b5b]" />
            Secure session
          </div>
        </header>

        {/* CHAT CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-10">
            {/* WELCOME */}
            {messages.length === 0 && (
              <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#d7e1d3] bg-[#e8eee4]">
                    <Shield className="h-9 w-9 text-[#496b52]" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#dce5d8] bg-white">
                    <Sparkles size={14} className="text-[#64836a]" />
                  </div>
                </div>

                <p className="mb-3 text-[10px] font-bold uppercase tracking-[2.5px] text-[#7b907d]">
                  Your digital safety companion
                </p>
                <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-[#26382f] md:text-3xl">
                  Your Security Intelligence Assistant
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#78857b]">
                  Ask questions about cybersecurity, digital authenticity,
                  suspicious content, or your DeepShield analysis results.
                </p>

                {/* PROMPT CARDS */}
                <div className="mt-9 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => sendMessage(prompt.prompt)}
                        className="group rounded-2xl border border-[#e0e5dc] bg-[#fbfbf7] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#aebfa9] hover:bg-white hover:shadow-sm"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9efe5] transition group-hover:bg-[#dce8d8]">
                            <Icon size={18} className="text-[#55745a]" />
                          </div>
                          <p className="text-sm font-semibold text-[#34483a]">
                            {prompt.title}
                          </p>
                        </div>
                        <p className="text-xs leading-6 text-[#849087]">
                          {prompt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* QUICK TOPICS */}
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                  {[
                    "Phishing",
                    "AI-generated images",
                    "Deepfakes",
                    "Malware",
                    "QR security",
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() =>
                        usePrompt(`Explain ${topic} and how to stay safe.`)
                      }
                      className="rounded-full border border-[#dfe5db] bg-white px-3.5 py-2 text-[11px] font-medium text-[#68796c] transition hover:border-[#aebfa9] hover:bg-[#edf2e9]"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
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
                    {message.role === "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce5d8] bg-[#e8eee4]">
                        <Shield size={17} className="text-[#496b52]" />
                      </div>
                    )}

                    <div
                      className={`min-w-0 ${
                        message.role === "user"
                          ? "max-w-[85%] rounded-2xl rounded-tr-sm border border-[#d7e4d3] bg-[#eaf0e6] px-4 py-3 md:max-w-[78%]"
                          : "max-w-[90%] flex-1 md:max-w-[85%]"
                      }`}
                    >
                      {message.role === "user" ? (
                        <>
                          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#34483a]">
                            {message.content}
                          </p>
                          <div className="mt-2 text-right text-[10px] text-[#829184]">
                            {formatTime(message.timestamp)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="prose prose-sm max-w-none break-words leading-7 text-[#46564b] prose-headings:mb-3 prose-headings:mt-5 prose-headings:font-bold prose-headings:text-[#2d4435] prose-p:my-3 prose-li:my-1 prose-strong:text-[#344b38] prose-a:text-[#547b5b]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <div className="mt-4 flex items-center gap-1 border-t border-[#e4e8df] pt-3">
                            <button
                              onClick={() => copyMessage(message)}
                              title="Copy response"
                              className="rounded-lg p-2 text-[#829087] transition hover:bg-[#e9eee6] hover:text-[#405c47]"
                            >
                              {copiedMessageId === message.id ? (
                                <Check size={15} className="text-[#547b5b]" />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                            <button
                              onClick={() => speakMessage(message)}
                              title="Listen to response"
                              className="rounded-lg p-2 text-[#829087] transition hover:bg-[#e9eee6] hover:text-[#405c47]"
                            >
                              {speaking ? (
                                <VolumeX size={15} className="text-[#547b5b]" />
                              ) : (
                                <Volume2 size={15} />
                              )}
                            </button>
                            <span className="ml-2 text-[10px] text-[#9aa59b]">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e0e4dc] bg-white text-xs font-bold text-[#718174]">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8eee4]">
                      <Bot size={17} className="text-[#547b5b]" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#e0e5dc] bg-white px-4 py-4">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#78917a]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#78917a] [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#78917a] [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* MESSAGE INPUT */}
        <div className="shrink-0 border-t border-[#dfe4da] bg-[#fbfbf7] px-4 py-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-[#dce3d8] bg-white shadow-sm transition focus-within:border-[#91a991]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask DeepShield anything about security..."
                rows={1}
                disabled={isTyping}
                className="max-h-[180px] min-h-[58px] w-full resize-none bg-transparent px-4 pb-3 pt-4 text-sm text-[#34483a] outline-none placeholder:text-[#a1aaa0] disabled:opacity-60"
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-2 rounded-lg bg-[#f0f3ed] px-2.5 py-1.5 text-[10px] font-medium text-[#728474]">
                  <Lock size={11} />
                  Security Assistant
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#294638] text-white transition hover:bg-[#365b45] disabled:cursor-not-allowed disabled:bg-[#e5e9e2] disabled:text-[#a3ada1]"
                  title="Send message"
                >
                  {isTyping ? (
                    <Activity size={16} className="animate-pulse" />
                  ) : (
                    <ArrowUp size={18} />
                  )}
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-[#9aa49a]">
              DeepShield AI Demo Assistant · AI responses may require verification
            </p>
          </div>
        </div>
      </main>
    </div>
  );

}