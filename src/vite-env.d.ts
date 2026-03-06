/// <reference types="vite/client" />

interface HTMLInputElement {
  webkitdirectory: boolean;
}

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
