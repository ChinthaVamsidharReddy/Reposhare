import React, { useState, useRef } from 'react';
import { PlayIcon, StopIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

const VoiceMessage = ({ onSendVoice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onSendVoice?.(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedTime(0);

      timerRef.current = setInterval(() => {
        setRecordedTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600 dark:text-red-200">
              {formatTime(recordedTime)}
            </span>
          </div>
          <button
            onClick={stopRecording}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            title="Stop recording"
          >
            <StopIcon className="h-5 w-5" />
          </button>
        </>
      ) : (
        <button
          onClick={startRecording}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text"
          title="Record voice message"
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default VoiceMessage;
