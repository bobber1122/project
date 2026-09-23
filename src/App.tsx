/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { HeartPage } from './components/HeartPage';
import { SorryPage } from './components/SorryPage';
import { VideoPage } from './components/VideoPage';

type Step = 'heart' | 'sorry' | 'video';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('heart');
  const [audioMuted, setAudioMuted] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [bgmBlocked, setBgmBlocked] = useState(false);
  const [bgmSrc, setBgmSrc] = useState<string>(() => {
    return localStorage.getItem('sorry_bgm_src') || '/assets/audio/sorry_bgm.mp3';
  });

  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Play BGM instantly with zero delay - strictly blocked when on video page
  const playBgmInstant = () => {
    if (currentStep === 'video') return;
    const audio = bgmRef.current;
    if (!audio) return;
    audio.volume = 1.0;
    audio.loop = true;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsBgmPlaying(true);
          setBgmBlocked(false);
        })
        .catch((err) => {
          console.warn('Autoplay prevented BGM playback:', err);
          setIsBgmPlaying(false);
          setBgmBlocked(true);
        });
    }
  };

  const playBgm = () => {
    if (currentStep === 'video') return;
    const audio = bgmRef.current;
    if (!audio) return;
    audio.volume = 1.0;
    audio.loop = true;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsBgmPlaying(true);
          setBgmBlocked(false);
        })
        .catch((err) => {
          console.warn('Autoplay prevented BGM playback:', err);
          setIsBgmPlaying(false);
          setBgmBlocked(true);
        });
    }
  };

  const pauseBgm = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      setIsBgmPlaying(false);
    }
  };

  const toggleBgm = () => {
    if (currentStep === 'video') return;
    if (isBgmPlaying) {
      pauseBgm();
      setAudioMuted(true);
    } else {
      setAudioMuted(false);
      playBgm();
    }
  };

  const toggleAudio = () => {
    toggleBgm();
  };

  // Direct user gesture on heart click - prime browser audio graph permissions silently
  const handleHeartClick = () => {
    const audio = bgmRef.current;
    if (audio) {
      audio.volume = 0;
      audio.currentTime = 0;
      const prime = audio.play();
      if (prime !== undefined) {
        prime
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {});
      }
    }
  };

  // Fraction of a second Sorry page opens: start BGM instantly!
  const handleExplodeComplete = () => {
    setCurrentStep('sorry');
    if (!audioMuted) {
      playBgmInstant();
    }
  };

  const handleNextToVideo = () => {
    pauseBgm();
    setCurrentStep('video');
  };

  const handleBackToLetter = () => {
    setCurrentStep('sorry');
    setTimeout(() => {
      if (!audioMuted && bgmRef.current) {
        bgmRef.current.volume = 1.0;
        bgmRef.current.play().then(() => {
          setIsBgmPlaying(true);
          setBgmBlocked(false);
        }).catch(() => {});
      }
    }, 60);
  };

  const handleRestart = () => {
    pauseBgm();
    setCurrentStep('heart');
  };

  const handleUploadBgm = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setBgmSrc(objectUrl);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            localStorage.setItem('sorry_bgm_src', reader.result);
          } catch {
            // LocalStorage quota may be exceeded
          }
        }
      };
      reader.readAsDataURL(file);
    } catch {
      // Ignore storage error
    }

    if (bgmRef.current) {
      bgmRef.current.src = objectUrl;
      bgmRef.current.load();
      playBgmInstant();
    }
  };

  // Sync playback state when step changes
  useEffect(() => {
    if (currentStep === 'sorry') {
      if (!audioMuted && !isBgmPlaying) {
        playBgmInstant();
      }
    } else if (currentStep === 'video') {
      pauseBgm();
    }
  }, [currentStep, audioMuted]);

  // Snappy page motion variants for instant entrance of sorry page
  const heartVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.08 } },
  };

  const sorryVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.99,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 1.01,
      filter: 'blur(3px)',
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  };

  const videoVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 1.01,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="min-h-screen w-full bg-[#09060b] text-[#fce7f3] overflow-x-hidden font-sans">
      {/* Central Persistent Background Audio Element */}
      <audio
        ref={bgmRef}
        src={bgmSrc}
        preload="auto"
        loop
        onPlay={() => {
          setIsBgmPlaying(true);
          setBgmBlocked(false);
        }}
        onPause={() => setIsBgmPlaying(false)}
      />

      <AnimatePresence mode="wait">
        {currentStep === 'heart' && (
          <motion.div
            key="page-heart"
            variants={heartVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <HeartPage
              onExplodeComplete={handleExplodeComplete}
              onHeartClick={handleHeartClick}
              audioMuted={audioMuted}
              toggleAudio={toggleAudio}
            />
          </motion.div>
        )}

        {currentStep === 'sorry' && (
          <motion.div
            key="page-sorry"
            variants={sorryVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <SorryPage
              onNext={handleNextToVideo}
              onBackToHeart={handleRestart}
              audioMuted={audioMuted}
              toggleAudio={toggleAudio}
              isBgmPlaying={isBgmPlaying}
              bgmBlocked={bgmBlocked}
              playBgm={playBgm}
              onUploadBgm={handleUploadBgm}
            />
          </motion.div>
        )}

        {currentStep === 'video' && (
          <motion.div
            key="page-video"
            variants={videoVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <VideoPage
              onBackToLetter={handleBackToLetter}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
