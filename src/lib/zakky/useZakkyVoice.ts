import { useState, useEffect, useRef, useCallback } from "react";

// Web Speech API interface declarations for TypeScript compatibility
interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export interface UseZakkyVoiceOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onAutoSend?: (finalTranscript: string) => void;
}

export function useZakkyVoice(options: UseZakkyVoiceOptions = {}) {
  const { onTranscript, onAutoSend } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const hasRecognitionSupport =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
    );
  const hasSynthesisSupport = typeof window !== "undefined" && "speechSynthesis" in window;

  // Load and cache voices when available
  useEffect(() => {
    if (!hasSynthesisSupport) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        voicesRef.current = allVoices;
      }
    };

    loadVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [hasSynthesisSupport]);

  // Clean text for speech synthesis (pronounce currencies, strip markdown & URLs)
  const cleanTextForSpeech = useCallback((raw: string): string => {
    let text = raw;

    // Replace Naira symbol with "Naira"
    text = text.replace(/₦\s*([0-9,.]+)/g, "$1 Naira");
    text = text.replace(/₦/g, " Naira ");

    // Remove markdown links [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    // Remove markdown bold/italic/code asterisks and backticks
    text = text.replace(/[*_`#]/g, "");

    // Replace bullet dashes with short pauses
    text = text.replace(/^\s*[-•]\s*/gm, ". ");

    // Normalize multiple whitespace or line breaks
    text = text.replace(/\n+/g, ". ").replace(/\s+/g, " ").trim();

    return text;
  }, []);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors on stopping an already stopped recognition
      }
    }
    setIsListening(false);
  }, []);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!hasRecognitionSupport) {
      setVoiceError("Voice recognition is not supported in this browser.");
      return;
    }

    // Cancel any playing speech before listening
    if (hasSynthesisSupport && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }

    setVoiceError(null);

    const RecognitionClass =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!RecognitionClass) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new RecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let lastFinalTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText && onTranscript) {
          onTranscript(currentText, Boolean(finalTranscript));
        }

        if (finalTranscript) {
          lastFinalTranscript = finalTranscript;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === "no-speech") {
          // Silent timeout, reset gracefully
          setIsListening(false);
          return;
        }
        if (event.error === "not-allowed") {
          setVoiceError("Microphone permission was denied. Please allow microphone access.");
        } else {
          setVoiceError(`Voice input: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (lastFinalTranscript && onAutoSend) {
          onAutoSend(lastFinalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceError("Could not start voice recognition.");
      setIsListening(false);
    }
  }, [hasRecognitionSupport, hasSynthesisSupport, onTranscript, onAutoSend]);

  // Stop current speech playback
  const stopSpeaking = useCallback(() => {
    if (hasSynthesisSupport && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [hasSynthesisSupport]);

  // Speak text using Web Speech Synthesis
  const speak = useCallback(
    (textToSpeak: string, messageId?: string) => {
      if (!hasSynthesisSupport || !isVoiceOutputEnabled) return;

      const synth = window.speechSynthesis;
      synth.cancel();

      const cleaned = cleanTextForSpeech(textToSpeak);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);

      // Select optimal English voice
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

      const preferredVoice =
        englishVoices.find((v) => /natural|neural|google|samantha|daniel/i.test(v.name)) ||
        englishVoices.find((v) => v.lang === "en-US" || v.lang === "en-GB") ||
        englishVoices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId || null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      synth.speak(utterance);
    },
    [hasSynthesisSupport, isVoiceOutputEnabled, cleanTextForSpeech]
  );

  // Toggle voice output mute/unmute
  const toggleVoiceOutput = useCallback(() => {
    setIsVoiceOutputEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (hasSynthesisSupport && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [hasSynthesisSupport]);

  return {
    isListening,
    isSpeaking,
    speakingMessageId,
    hasRecognitionSupport,
    hasSynthesisSupport,
    isVoiceOutputEnabled,
    voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoiceOutput,
    setIsVoiceOutputEnabled,
  };
}
