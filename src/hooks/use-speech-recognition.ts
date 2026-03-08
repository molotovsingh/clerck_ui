import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionHook {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  resetTranscript: () => void;
}

// Minimal type surface for the Web Speech API used by this hook.
// The full SpeechRecognition type is not reliably available across TS DOM libs.
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResultEvent {
  results: {
    readonly length: number;
    [index: number]:
      | {
          isFinal: boolean;
          [index: number]: { transcript: string } | undefined;
        }
      | undefined;
  };
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : undefined;
  const SpeechRecognitionAPI: SpeechRecognitionConstructor | undefined =
    (w?.SpeechRecognition as SpeechRecognitionConstructor | undefined) ??
    (w?.webkitSpeechRecognition as SpeechRecognitionConstructor | undefined);
  const isSupported = !!SpeechRecognitionAPI;

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalizedText = "";

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal) {
          finalizedText += result[0]?.transcript ?? "";
        } else {
          interim += result?.[0]?.transcript ?? "";
        }
      }
      setTranscript(finalizedText + interim);
    };

    recognition.onerror = (event: { error: string }) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setError(null);
    setTranscript("");
  }, [SpeechRecognitionAPI]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    start,
    stop,
    resetTranscript,
  };
}
