/**
 * Web Speech API wrapper for voice input with waveform visualization
 * Uses browser's native speech recognition - no external packages needed
 */

class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.transcript = '';
    this.interimTranscript = '';
    this.listeners = {
      onStart: null,
      onResult: null,
      onError: null,
      onEnd: null,
    };

    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.listeners.onStart) this.listeners.onStart();
    };

    this.recognition.onresult = (event) => {
      this.interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.transcript += transcript + ' ';
        } else {
          this.interimTranscript += transcript;
        }
      }

      if (this.listeners.onResult) {
        this.listeners.onResult({
          finalTranscript: this.transcript,
          interimTranscript: this.interimTranscript,
          isFinal: event.results[event.results.length - 1].isFinal,
        });
      }
    };

    this.recognition.onerror = (event) => {
      const errorMessage = this.getErrorMessage(event.error);
      if (this.listeners.onError) this.listeners.onError(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.listeners.onEnd) this.listeners.onEnd(this.transcript);
    };
  }

  start() {
    if (!this.isListening) {
      this.transcript = '';
      this.interimTranscript = '';
      this.recognition.start();
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }

  abort() {
    this.recognition.abort();
    this.isListening = false;
  }

  setLanguage(lang = 'en-US') {
    this.recognition.lang = lang;
  }

  on(event, callback) {
    if (this.listeners.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.listeners[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  getErrorMessage(error) {
    const errors = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'No microphone found. Ensure microphone permissions are granted.',
      'network': 'Network error. Check your connection.',
      'aborted': 'Speech recognition was aborted.',
      'service-not-allowed': 'Speech recognition service not allowed.',
      'bad-grammar': 'Speech recognition grammar error.',
      'not-allowed': 'Microphone permission denied. Please enable it in browser settings.',
    };
    return errors[error] || `Error: ${error}`;
  }
}

// Audio visualization helper
export class AudioVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;

    this.context = this.canvas.getContext('2d');
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      this.draw();
    } catch (error) {
      console.error('Microphone access error:', error);
      throw new Error('Unable to access microphone');
    }
  }

  draw() {
    if (!this.canvas || !this.analyser) return;

    this.animationId = requestAnimationFrame(() => this.draw());

    this.analyser.getByteFrequencyData(this.dataArray);

    // Clear canvas
    this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw waveform
    const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * this.canvas.height;

      // Color gradient from blue to purple based on frequency
      const hue = (i / this.bufferLength) * 60 + 200; // 200-260 (blue to purple)
      this.context.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.context.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Exported instance and utilities
let _speechService = null;

export const initializeSpeechRecognition = () => {
  if (!_speechService) {
    try {
      _speechService = new SpeechRecognitionService();
    } catch (error) {
      console.error('Speech recognition not available:', error);
      return null;
    }
  }
  return _speechService;
};

export const useSpeechRecognition = () => {
  return initializeSpeechRecognition();
};

export const startListening = (callbacks = {}) => {
  const service = initializeSpeechRecognition();
  if (!service) return null;

  if (callbacks.onStart) service.on('Start', callbacks.onStart);
  if (callbacks.onResult) service.on('Result', callbacks.onResult);
  if (callbacks.onError) service.on('Error', callbacks.onError);
  if (callbacks.onEnd) service.on('End', callbacks.onEnd);

  service.start();
  return service;
};

export const stopListening = () => {
  if (_speechService) {
    _speechService.stop();
  }
};

export const abortListening = () => {
  if (_speechService) {
    _speechService.abort();
  }
};

export const setRecognitionLanguage = (lang) => {
  if (_speechService) {
    _speechService.setLanguage(lang);
  }
};

/**
 * Check if browser supports Speech Recognition
 */
export const isSpeechRecognitionSupported = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Text-to-speech helper (uses Web Speech API)
 */
export const speak = (text, options = {}) => {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Configure utterance
  utterance.rate = options.rate || 1; // 0.1 to 10
  utterance.pitch = options.pitch || 1; // 0 to 2
  utterance.volume = options.volume || 1; // 0 to 1
  utterance.lang = options.lang || 'en-US';

  // Event handlers
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.cancel(); // Cancel any ongoing speech
  window.speechSynthesis.speak(utterance);
};

/**
 * Stop speech synthesis
 */
export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Get available voices for text-to-speech
 */
export const getAvailableVoices = () => {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
};

export default {
  initializeSpeechRecognition,
  useSpeechRecognition,
  startListening,
  stopListening,
  abortListening,
  setRecognitionLanguage,
  isSpeechRecognitionSupported,
  speak,
  stopSpeaking,
  getAvailableVoices,
  AudioVisualizer,
};
