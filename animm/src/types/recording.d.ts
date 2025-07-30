import {
  RecordingConfig,
  RecordingResult,
  RecordingStatus,
} from '@/lib/media-recorder';

declare global {
  interface Window {
    // Main recording functions
    startRecording: (config: RecordingConfig) => Promise<RecordingResult>;
    isRecording: () => boolean;
    getRecordingResult: () => RecordingResult | null;
    getRecordingStatus: () => RecordingStatus | null;
    stopRecording: () => void;
    clearRecordingResult: () => void;

    // Rive animation control functions
    startRiveAnimation: () => void;
    stopRiveAnimation: () => void;

    // Legacy GIF functions for backward compatibility
    startGifRecording: (config: any) => Promise<RecordingResult>;
    isGifRecording: () => boolean;
    getGifRecordingResult: () => RecordingResult | null;
    clearGifRecordingResult: () => void;

    // Internal state variables
    __RECORDING_RESULT__: RecordingResult | null;
    __RECORDING_IN_PROGRESS__: boolean;
    __RECORDING_STATUS__: RecordingStatus | null;

    // Rive instance (if available)
    __RIVE_INSTANCE__: any;
  }
}

export {};
