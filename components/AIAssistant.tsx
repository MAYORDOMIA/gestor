
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { askGemini } from '../services/geminiService';
import { Message } from '../types';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente técnico de Arista Studio 2. ¿En qué puedo ayudarte hoy? Puedo calcular descuentos de perfiles, recomendar tipos de vidrios o ayudarte con normativas técnicas.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await askGemini(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response || 'Sin respuesta' }]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold">Asistente Técnico IA</h3>
            <p className="text-xs text-blue-300">Impulsado por Gemini 3 Flash</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Info size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-full h-fit ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="p-2 rounded-full bg-slate-200 text-slate-600 h-fit">
                <Bot size={18} />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Analizando datos técnicos...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Pregunta sobre perfiles, vidrios, descuentos..."
            className="flex-1 px-4 py-3 bg-slate-100 rounded-xl outline-none focus:ring-2 ring-blue-500/50 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          La IA puede cometer errores. Verifica siempre las medidas críticas con catálogos oficiales.
        </p>
      </form>
    </div>
  );
};

export default AIAssistant;
