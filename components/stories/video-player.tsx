'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  title: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleError = () => {
    setError('Unable to load video. Please try again later.');
  };

  if (error) {
    return (
      <div className="bg-ninja-black rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-ninja-white">
          <div className="text-ninja-crimson mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-ninja text-xl mb-2">Video Unavailable</h3>
          <p className="text-ninja-white opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ninja-black rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          className="w-full h-full object-contain"
          poster=""
        >
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-ninja-white bg-opacity-20 hover:bg-opacity-40 text-ninja-white border-2 border-ninja-white rounded-full w-16 h-16 p-0"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-ninja-black p-4">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-ninja-gray bg-opacity-30 rounded-full mb-4 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-ninja-crimson rounded-full transition-all duration-200"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlay}
              size="sm"
              variant="ghost"
              className="text-ninja-white hover:text-ninja-gold"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button
              onClick={restartVideo}
              size="sm"
              variant="ghost"
              className="text-ninja-white hover:text-ninja-gold"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              onClick={toggleMute}
              size="sm"
              variant="ghost"
              className="text-ninja-white hover:text-ninja-gold"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <span className="text-ninja-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button
            onClick={handleFullscreen}
            size="sm"
            variant="ghost"
            className="text-ninja-white hover:text-ninja-gold"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}