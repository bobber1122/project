import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
} from 'lucide-react';
import cinemaBackdrop from '../assets/images/romantic_cinema_backdrop_1790146405080.jpg';
import { saveVideoBlob, getVideoBlob } from '../utils/videoStorage';

interface VideoPageProps {
  onBackToLetter: () => void;
  onRestart: () => void;
  audioMuted?: boolean;
  toggleAudio?: () => void;
}

export const VideoPage: React.FC<VideoPageProps> = ({
  onBackToLetter,
  onRestart,
}) => {
  const [videoSrc, setVideoSrc] = useState<string>('/assets/video/sorry.mp4');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load any previously attached video from IndexedDB on mount
  useEffect(() => {
    let activeObjectUrl: string | null = null;
    getVideoBlob().then((saved) => {
      if (saved && saved.blob) {
        activeObjectUrl = URL.createObjectURL(saved.blob);
        setVideoSrc(activeObjectUrl);
      }
    });

    return () => {
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
    };
  }, []);

  // Autohide controls during playback
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2800);
    }
  }, [isPlaying]);

  const handleMouseMove = () => {
    resetControlsTimer();
  };

  // Video playback toggling
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => {
        setIsPlaying(true);
        setHasEnded(false);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setVideoError(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setShowControls(true);
  };

  // Seeking through progress bar
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    video.currentTime = ratio * duration;
    setCurrentTime(video.currentTime);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(ratio * duration);
    setHoverPosition(hoverX);
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
    setHoverPosition(null);
  };

  // Volume toggling
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Process file attaching (via drag-and-drop or fallback)
  const processAttachFile = async (file: File) => {
    if (!file) return;
    try {
      await saveVideoBlob(file, file.name);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoError(false);
      setHasEnded(false);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } catch (err) {
      console.error('Error attaching video file', err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAttachFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.includes('video') || file.name.endsWith('.mp4'))) {
      processAttachFile(file);
    }
  };

  const handleBack = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onBackToLetter();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between py-6 px-4 sm:px-6 md:px-8 bg-[#070409] text-[#fce7f3] selection:bg-pink-500/30 selection:text-pink-100 overflow-x-hidden">
      {/* Background cinematic atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 mix-blend-screen bg-cover bg-center filter blur-xl scale-105"
        style={{ backgroundImage: `url(${cinemaBackdrop})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-950/20 via-[#0a070e] to-[#040206]" />

      {/* Floating ambient hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-16 left-12 text-pink-400/20 text-sm animate-float-gentle">🖤</span>
        <span className="absolute bottom-20 right-14 text-pink-400/20 text-base animate-float-gentle" style={{ animationDelay: '2s' }}>💖</span>
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-4xl flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md text-xs text-pink-200/90 hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
          title="Return to the sorry letter"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium text-[12px] tracking-wide">Back to Letter</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="video/mp4,video/*,.mp4"
            className="hidden"
          />

          {/* Video Audio Mute / Unmute Toggle Only */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 cursor-pointer backdrop-blur-md ${
              isMuted
                ? 'bg-black/50 border-white/20 text-white/60 hover:bg-black/70 hover:text-white'
                : 'bg-pink-600/30 border-pink-400/50 text-pink-100 hover:bg-pink-600/40 shadow-[0_0_12px_rgba(244,114,182,0.3)]'
            }`}
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          >
            {isMuted ? (
              <>
                <VolumeX size={13} className="text-white/60" />
                <span className="text-[11px] text-white/70">Muted</span>
              </>
            ) : (
              <>
                <Volume2 size={13} className="text-pink-300" />
                <span className="text-[11px] text-pink-100">Sound On</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Cinematic Video Player */}
      <motion.main
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl my-auto flex flex-col items-center"
      >
        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl text-pink-100 font-medium tracking-wide drop-shadow-sm select-none"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Do you remember this gundoos 🖤💖!
          </h1>
        </div>

        {/* Video Player Container with Drag & Drop */}
        <div
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black/95 border transition-all duration-300 group ${
            isDragging
              ? 'border-pink-400 scale-[1.01] shadow-[0_0_40px_rgba(244,114,182,0.4)]'
              : 'border-pink-400/25 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),_0_0_40px_rgba(244,114,182,0.15)]'
          }`}
        >
          {/* Ambient Video Backlight Glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/15 to-purple-500/10 blur-xl opacity-60 pointer-events-none" />

          {/* HTML5 Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            preload="auto"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Error Notice fallback */}
          {videoError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/90 text-center z-20">
              <span className="text-3xl mb-2">💔</span>
              <p className="text-sm text-pink-200 font-medium mb-1">
                Unable to play video
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-500 rounded-full text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                Choose Video
              </button>
            </div>
          )}

          {/* Centered Large Play / Replay Overlay Button */}
          <AnimatePresence>
            {(!isPlaying || hasEnded) && !videoError && !isDragging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-20"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 p-0.5 shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#140b16]/95 flex items-center justify-center text-pink-200 hover:text-white">
                    {hasEnded ? (
                      <RotateCcw size={28} className="translate-x-0" />
                    ) : (
                      <Play size={28} className="translate-x-0.5" fill="currentColor" />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Cinematic Controls Overlay */}
          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 transition-opacity duration-300 z-30 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Interactive Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleScrub}
              onMouseMove={handleProgressHover}
              onMouseLeave={handleProgressLeave}
              className="relative w-full h-2.5 sm:h-3 flex items-center cursor-pointer group/bar mb-3"
            >
              {/* Background Track */}
              <div className="w-full h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden group-hover/bar:h-2 transition-all">
                {/* Played Progress */}
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-300 rounded-full relative"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Scrubber Knob */}
              <div
                className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md border border-pink-400 scale-0 group-hover/bar:scale-100 transition-transform pointer-events-none"
                style={{
                  left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  transform: 'translateX(-50%)',
                }}
              />

              {/* Hover Time Tooltip */}
              {hoverTime !== null && hoverPosition !== null && (
                <div
                  className="absolute -top-7 px-2 py-0.5 bg-black/85 text-[10px] text-pink-200 rounded border border-white/10 pointer-events-none font-mono"
                  style={{
                    left: `${hoverPosition}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between text-pink-100">
              {/* Left group: Play/Pause, Time */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={togglePlay}
                  className="text-pink-200 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </button>

                <div className="text-xs font-mono text-pink-200/80 select-none">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1 text-white/30">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right group: Volume, Fullscreen */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Volume Slider */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="text-pink-200 hover:text-white transition-colors focus:outline-none cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-20 h-1 bg-white/20 accent-pink-400 rounded-lg cursor-pointer transition-opacity"
                    aria-label="Volume level"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="text-pink-200 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Start Over Option */}
        <div className="w-full mt-5 flex items-center justify-center">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-pink-200/80 hover:text-white transition-all text-xs cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Start Over</span>
          </button>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="relative z-20 mt-4 text-center">
        <p className="text-[11px] text-pink-200/40 font-light tracking-widest uppercase">
          🖤 Always with love 💖
        </p>
      </footer>
    </div>
  );
};
