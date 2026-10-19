import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Plus,
  Check,
  Send,
  Calendar,
  Clock,
  CheckSquare,
  Bot,
  User,
  Zap,
  Split,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type Task, type CalendarEvent } from './data';
import { Mascot } from './mascot';

interface VoiceAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onAddTask: (title: string, due?: string) => void;
  events: CalendarEvent[];
  onStartFocus: () => void;
  isFocusRunning?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const GEMINI_API_KEY = (import.meta.env['VITE_GEMINI_API_KEY'] as string | undefined) || '';

export function VoiceAssistantDialog({
  open,
  onOpenChange,
  initialQuery = '',
  tasks,
  onToggleTask,
  onAddTask,
  events,
  onStartFocus,
  isFocusRunning = false,
}: VoiceAssistantDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hey Karthik! I'm your FocusFlow AI assistant. Ask me anything or let's plan your study day.",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'assistant' | 'plan'>('split');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastInitialHandledRef = useRef<string | null>(null);

  // Auto-scroll chat feed
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isSpeaking]);

  // Clean up voice/speech when dialog closes
  useEffect(() => {
    if (!open) {
      stopSpeaking();
      stopListening();
    }
  }, [open]);

  // Handle initial prompt when dialog opens with input text
  useEffect(() => {
    if (open && initialQuery && initialQuery.trim() && lastInitialHandledRef.current !== initialQuery) {
      lastInitialHandledRef.current = initialQuery;
      handleSendMessage(initialQuery.trim());
    }
  }, [open, initialQuery]);

  // Text-To-Speech implementation
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/[*_#`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          v =>
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Guy') ||
              v.name.includes('Ava') ||
              v.name.includes('Zira')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find(v => v.lang.startsWith('en-US')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Web Speech API speech-to-text dictation
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info('Voice input is not supported in this browser.');
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... speak now.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error('Could not activate microphone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Call Gemini API to get short ChatGPT-like answers
  async function callGemini(userText: string): Promise<string> {
    const tasksSummary = tasks
      .map(t => `- ${t.title} (${t.completed ? 'completed' : 'pending'}, due: ${t.due_label})`)
      .join('\n');
    const eventsSummary = events
      .map(e => `- ${e.title} at ${new Date(e.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      .join('\n');

    const promptContext = `You are the FocusFlow AI Voice Assistant, speaking directly with student Karthik.
You sound warm, energetic, and concise like ChatGPT Voice Mode.
Student's Current Day:
Tasks:
${tasksSummary || 'None currently listed'}
Upcoming Classes/Events:
${eventsSummary || 'None scheduled'}

RULES:
1. Always address Karthik directly.
2. Keep your answer strictly under 3 sentences (max 35 words) so it sounds crisp and fast when spoken aloud!
3. Be actionable, supportive, and focus on helping Karthik plan his day, start a focus block, or conquer specific tasks.
4. If Karthik asks to add a task, confirm you've noted it.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${promptContext}\n\nKarthik says: "${userText}"` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    };

    if (!GEMINI_API_KEY) {
      const lower = userText.toLowerCase();
      if (lower.includes('plan') || lower.includes('day') || lower.includes('schedule')) {
        return `Karthik, let's prioritize! Start with your ${tasks.find(t => !t.completed)?.title || 'highest priority task'}, followed by a 25-minute focus sprint.`;
      }
      if (lower.includes('task') || lower.includes('summarize')) {
        const pending = tasks.filter(t => !t.completed);
        return `You have ${pending.length} pending tasks today. First up is "${pending[0]?.title || 'your coursework'}". Ready to start?`;
      }
      return `Hey Karthik! I'm ready to help you plan your study sessions and crush your ${tasks.filter(t => !t.completed).length} pending tasks. Let's do this!`;
    }

    const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
      const res = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }

      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        const fbText = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (fbText) return fbText.trim();
      }

      throw new Error('No candidates from Gemini API');
    } catch (error) {
      return `Karthik, let's crush your goals today! You have ${tasks.filter(t => !t.completed).length} pending tasks. Ready to begin a focus session?`;
    }
  }

  // Handle refreshing/clearing chat
  const handleRefreshChat = () => {
    stopSpeaking();
    stopListening();
    setIsLoading(false);
    setInputText('');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Hey Karthik! I'm your FocusFlow AI assistant. Ask me anything or let's plan your study day.",
        timestamp: 'Just now',
      },
    ]);
    toast.success('Chat refreshed');
  };

  // Handle sending a message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: 'Now',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const lower = text.toLowerCase();
    if (lower.startsWith('add task') || lower.startsWith('add ') || lower.includes('remind me to')) {
      const taskTitle = text
        .replace(/^(add task|add|remind me to)\s*/i, '')
        .replace(/to my tasks?/i, '')
        .trim();
      if (taskTitle) {
        onAddTask(taskTitle, 'Today · Assigned by AI');
        toast.success(`Task added: "${taskTitle}"`);
      }
    }

    try {
      const aiReply = await callGemini(text);
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: aiReply,
        timestamp: 'Now',
      };
      setMessages(prev => [...prev, aiMsg]);
      speakText(aiReply);
    } catch (err) {
      const fallback = "Karthik, let's pick your top task and start with 25 minutes of deep focus!";
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: fallback,
          timestamp: 'Now',
        },
      ]);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), 'Today · 5:00 PM');
    setNewTaskTitle('');
    toast.success('Task added to your plan.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ff-liquid-glass-dialog w-[94vw] max-w-[780px] p-0 gap-0 overflow-hidden border border-white/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(79,111,246,0.18),0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-[24px] text-slate-800 dark:text-slate-100">
        {/* Top Header Bar - White Liquid Glass */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/80 bg-white/60 dark:bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-sm shadow-blue-500/30 text-white">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {isSpeaking && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  FocusFlow Voice Assistant
                </h2>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {isSpeaking ? 'Speaking' : isListening ? 'Listening' : isLoading ? 'Thinking' : 'Ready'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Interactive Spline Mascot & Day Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Switcher Pills */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/60 dark:bg-white/10 border border-white/80 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 font-medium ${
                  activeTab === 'split' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Split className="w-3 h-3" />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 font-medium ${
                  activeTab === 'assistant' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('plan')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 font-medium ${
                  activeTab === 'plan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>Plan</span>
              </button>
            </div>

            {/* Mute toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsMuted(!isMuted);
                toast.info(isMuted ? 'Voice output enabled' : 'Voice output muted');
              }}
              className="h-7 w-7 p-0 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60"
              title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
            </Button>

            {/* Stop speaking button */}
            {isSpeaking && (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopSpeaking}
                className="h-7 w-7 p-0 rounded-lg text-rose-500 hover:bg-rose-50"
                title="Stop speaking"
              >
                <Pause className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Grid Content - Height 430px */}
        <div className="grid grid-cols-1 md:grid-cols-12 h-[430px] overflow-hidden">
          {/* LEFT SIDE: Same Spline 3D Model used in tasks page */}
          <div className="md:col-span-5 relative flex flex-col items-center justify-between p-3.5 bg-gradient-to-b from-white/70 via-slate-50/50 to-blue-50/30 dark:from-slate-900/50 dark:to-slate-950/70 border-r border-white/80 overflow-hidden">
            {/* Ambient Animated Sound Wave Aura */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-44 h-44 rounded-full transition-all duration-700 blur-2xl ${
                  isSpeaking
                    ? 'bg-blue-400/30 scale-125 animate-pulse'
                    : isListening
                      ? 'bg-amber-400/30 scale-110'
                      : 'bg-indigo-300/20 scale-95'
                }`}
              />
              {isSpeaking && (
                <div className="absolute w-52 h-52 rounded-full border border-blue-400/30 animate-ping" />
              )}
            </div>

            {/* Same Spline 3D Mascot from Tasks Page */}
            <div className="relative z-10 w-full flex-1 min-h-[255px] flex items-center justify-center overflow-hidden">
              <Mascot className="dialog-mascot-host" />
            </div>


            {/* Mascot Status & Interactive Soundwave Footer */}
            <div className="relative z-10 w-full flex flex-col items-center gap-1.5 bg-white/80 dark:bg-white/10 p-2 rounded-xl border border-white/90 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isSpeaking
                        ? 'bg-blue-500 animate-ping'
                        : isListening
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                    {isSpeaking ? 'Speaking answer...' : isListening ? 'Listening...' : 'Spline 3D Companion'}
                  </span>
                </div>

                {/* Animated sound equalizer bars */}
                <div className="flex items-center gap-0.5 h-3">
                  {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((height, i) => (
                    <span
                      key={i}
                      className={`w-0.5 rounded-full transition-all duration-150 ${
                        isSpeaking
                          ? 'bg-blue-500'
                          : isListening
                            ? 'bg-amber-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      style={{
                        height: isSpeaking ? `${height * 12}px` : isListening ? `${(i % 2 === 0 ? 0.7 : 0.4) * 12}px` : '3px',
                        animation: isSpeaking ? `pulse 0.4s ease-in-out infinite alternate ${i * 0.08}s` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-[9px] text-slate-500 dark:text-slate-400 text-center leading-tight">
                Click & drag 3D mascot. Ask anything in chat.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Voice Assistant + Plan Your Day */}
          <div className="md:col-span-7 flex flex-col h-full bg-white/40 dark:bg-slate-900/40 overflow-hidden">
            <div className="flex-1 overflow-hidden grid grid-cols-1 divide-y divide-white/80 sm:divide-y-0 sm:grid-cols-12 h-full">
              {/* ChatGPT-like Voice Assistant Column */}
              <div
                className={`flex flex-col h-full overflow-hidden ${
                  activeTab === 'split' ? 'sm:col-span-7' : activeTab === 'assistant' ? 'sm:col-span-12' : 'hidden sm:hidden'
                }`}
              >
                {/* Voice Mode Header */}
                <div className="px-3.5 py-1.5 border-b border-white/80 bg-white/50 dark:bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[1px] flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                        <Zap className="w-2.5 h-2.5 text-blue-600" />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">ChatGPT Voice</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {messages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const lastAiMsg = [...messages].reverse().find(m => m.sender === 'assistant');
                          if (lastAiMsg) speakText(lastAiMsg.text);
                        }}
                        className="text-[9px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5 font-medium cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Replay last voice answer"
                      >
                        <Volume2 className="w-2.5 h-2.5" /> Replay
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRefreshChat}
                      className="text-[9px] text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 font-medium cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-white/80 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      title="Refresh and clear chat"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Refresh
                    </button>
                  </div>
                </div>


                {/* Message Scrollable Feed */}
                <div ref={chatScrollRef} className="flex-1 p-3 space-y-2.5 overflow-y-auto ff-custom-scrollbar">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                          <Bot className="w-3 h-3" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[10px] leading-relaxed shadow-xs ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium'
                            : 'bg-white/80 dark:bg-slate-800/80 border border-white/90 dark:border-white/10 text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.sender === 'assistant' && (
                          <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[8px] text-slate-400">
                            <span>{msg.timestamp}</span>
                            <button
                              type="button"
                              onClick={() => speakText(msg.text)}
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
                            >
                              <Volume2 className="w-2.5 h-2.5" /> Speak
                            </button>
                          </div>
                        )}
                      </div>

                      {msg.sender === 'user' && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 justify-start items-center">
                      <div className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 animate-pulse">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 border border-white/90 rounded-xl px-3 py-1.5 text-[10px] text-slate-500 flex items-center gap-1.5 shadow-xs">
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" />
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce delay-100" />
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce delay-200" />
                        </span>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompts Suggestions */}
                <div className="px-3 py-1 border-t border-white/80 bg-white/40 dark:bg-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    'Plan my study day',
                    'Summarize tasks',
                    'Focus on Networks',
                    '25-min sprint',
                  ].map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="whitespace-nowrap px-2 py-0.5 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white border border-white/90 text-[9px] text-slate-600 dark:text-slate-300 font-medium transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar with Mic and Send Button */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2 border-t border-white/80 bg-white/70 dark:bg-slate-900/70 flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-1.5 rounded-lg transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-blue-50 dark:bg-white/10 text-blue-600 hover:bg-blue-100'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={isListening ? 'Listening...' : 'Type or ask assistant...'}
                    className="flex-1 bg-white/80 dark:bg-white/10 border border-white/90 dark:border-white/15 focus:border-blue-500 rounded-lg px-2.5 py-1 text-[10px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
                  />

                  <Button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    size="sm"
                    className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white h-7 px-2.5 text-[10px] shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              </div>

              {/* BESIDE: "Plan Your Day" Panel */}
              <div
                className={`flex flex-col h-full overflow-hidden border-l border-white/80 bg-white/30 dark:bg-white/5 ${
                  activeTab === 'split' ? 'sm:col-span-5' : activeTab === 'plan' ? 'sm:col-span-12' : 'hidden sm:hidden'
                }`}
              >
                {/* Header */}
                <div className="px-3 py-1.5 border-b border-white/80 bg-white/50 dark:bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <h3 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Plan Your Day
                    </h3>
                  </div>
                  <span className="text-[9px] text-slate-500">
                    {tasks.filter(t => t.completed).length}/{tasks.length} Done
                  </span>
                </div>

                {/* Today's Tasks & Schedule */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2 ff-custom-scrollbar">
                  {/* Next class preview */}
                  {events.length > 0 && (
                    <div className="p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-500/20 shadow-xs">
                      <div className="flex items-center justify-between text-[9px] text-blue-600 dark:text-blue-300 mb-0.5">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-2.5 h-2.5 text-blue-600" /> Class
                        </span>
                        <span>9:00 – 12:00</span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-100">{events[0]?.title || 'Computer Networks'}</p>
                    </div>
                  )}


                  {/* Tasks List */}
                  <div>
                    <div className="flex items-center justify-between mb-1 px-0.5">
                      <h4 className="text-[9px] font-bold text-slate-600 dark:text-slate-300">Today's Tasks</h4>
                      <button
                        type="button"
                        onClick={() => handleSendMessage('Suggest priorities for my tasks today')}
                        className="text-[9px] text-blue-600 hover:underline font-medium"
                      >
                        Prioritize
                      </button>
                    </div>

                    <div className="space-y-1 max-h-[145px] overflow-y-auto pr-0.5">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => onToggleTask(task)}
                          className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-all ${
                            task.completed
                              ? 'bg-white/30 border-white/40 opacity-60'
                              : 'bg-white/70 dark:bg-white/10 border-white/80 hover:border-blue-400 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <div
                              className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border text-[8px] ${
                                task.completed
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 text-transparent'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <div className="truncate">
                              <p className={`text-[10px] truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                                {task.title}
                              </p>
                              <span className="text-[8px] text-slate-400">{task.due_label}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inline Quick Add Task */}
                  <form onSubmit={handleInlineAddTask} className="pt-1.5 border-t border-white/80">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="Add task title..."
                        className="flex-1 bg-white/80 dark:bg-white/10 border border-white/90 rounded-md px-2 py-1 text-[9px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <Button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        size="sm"
                        className="h-6 px-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[9px]"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Bottom Action: Start Focus Session */}
                <div className="p-2 border-t border-white/80 bg-white/60 dark:bg-slate-900/60">
                  <Button
                    onClick={() => {
                      onStartFocus();
                      toast.success('Focus session started! Stay in flow.');
                      onOpenChange(false);
                    }}
                    className="w-full h-7 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-medium flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isFocusRunning ? 'Resume Focus Session' : 'Start 45m Focus'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
