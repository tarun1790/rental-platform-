'use client';

import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Globe, 
  X, 
  Send, 
  Check, 
  Play
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, speakText } from '../../lib/speech-translation';
import { SupportedLanguageCode } from '../../types/intelligence';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<string>(
    'Hello! I am your HOME Intelligence Assistant. You can ask me about Chicago neighborhood cash flows, subsurface soil PSF bearing capacities, 20-year security ratings, or Gemini vision scans.'
  );

  if (!isOpen) return null;

  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('Listening for query...');
      // Simulate Speech Recognition
      setTimeout(() => {
        setIsListening(false);
        const sampleQuery = 'What is the Pass/Flow investment rating and soil capacity in Lincoln Park?';
        setTranscript(sampleQuery);
        const responseText =
          'Lincoln Park Prairie Estate features a 4.8 / 5.0 Pass/Flow rating, 3,500 PSF tested silty loam bearing capacity, 20-year verified zero residential burglary timeline, and 4.8-minute CPD police dispatch.';
        setAssistantResponse(responseText);
        speakText(responseText, currentLanguage);
      }, 2000);
    }
  };

  const handleSamplePrompt = (prompt: string, answer: string) => {
    setTranscript(prompt);
    setAssistantResponse(answer);
    speakText(answer, currentLanguage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-white border-2 border-red-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900">
        
        {/* Top Header (White & Red) */}
        <div className="p-5 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-600 flex items-center justify-center font-bold shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wider">
                  Cloud Speech & Translation Agent
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-white text-red-700 font-mono font-bold rounded-full">
                  Real-Time Voice AI
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium">
                Multilingual Conversational Underwriting Assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-red-600 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (White & Red) */}
        <div className="p-6 space-y-5 bg-white overflow-y-auto max-h-[70vh]">
          
          {/* Language Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Globe className="w-4 h-4 text-red-600 shrink-0" />
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                  currentLanguage === lang.code
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-white text-slate-700 border-red-200 hover:bg-red-50'
                }`}
              >
                <span>{lang.nativeName} ({lang.name})</span>
              </button>
            ))}
          </div>

          {/* Active Transcript Box */}
          <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
              {isListening ? '🎙️ Listening via Microphone...' : 'User Speech Input'}
            </span>
            <p className="text-xs text-slate-800 font-mono italic">
              {transcript || '"Click the microphone below to ask a question or select a sample prompt"'}
            </p>
          </div>

          {/* AI Response Card */}
          <div className="p-4 bg-white border-2 border-red-300 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Voice Agent Synthesis</span>
              </span>
              <button
                onClick={() => speakText(assistantResponse, currentLanguage)}
                className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Audio</span>
              </button>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {assistantResponse}
            </p>
          </div>

          {/* Sample Questions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase">
              Quick Underwriting Prompts:
            </span>
            <div className="space-y-1.5">
              {[
                {
                  q: 'Analyze Lincoln Park soil stability and water table flood depth',
                  a: 'Lincoln Park tested foundation bearing capacity is 3,500 PSF (Dense Silty Loam) with bedrock at 42 ft and a dry 14 ft water table.'
                },
                {
                  q: 'What are the annual Cook County property taxes in Gold Coast?',
                  a: 'Gold Coast Luxury Lakefront annual property taxes are $16,420/yr (effective 1.95% rate) with $1,368/mo monthly escrow liability.'
                },
                {
                  q: 'Scan urban forest canopy and distance to parks',
                  a: 'Properties feature up to 34% protected urban forest canopy and 0.3 km walkable distance to Lincoln Park Conservatory.'
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSamplePrompt(item.q, item.a)}
                  className="w-full text-left p-2.5 bg-red-50/40 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>"{item.q}"</span>
                  <Play className="w-3 h-3 text-red-600" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Push-to-Talk Action Bar */}
        <div className="p-4 bg-red-50 border-t border-red-200 flex items-center justify-center">
          <button
            onClick={handleToggleMic}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
              isListening
                ? 'bg-red-700 text-white animate-pulse ring-4 ring-red-400'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Stop Listening' : 'Push to Speak (Voice AI)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
