import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

export default function VoiceInputButton({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
        .replace(/\s+/g, " ")
        .trim();
      onTranscript(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        listening
          ? "bg-red-500/20 border-red-500 text-red-400"
          : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-400"
      }`}
      title={listening ? "Click to stop" : "Start voice input"}
      aria-label={listening ? "Listening... Click to stop" : "Start voice input"}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      <span className="text-sm">{listening ? "Listening..." : "Voice"}</span>
    </button>
  );
}
