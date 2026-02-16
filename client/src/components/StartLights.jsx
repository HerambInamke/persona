import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

const StartLights = ({ difficulty, onResult }) => {
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [gamePhase, setGamePhase] = useState('countdown'); // countdown, waiting, go, finished
  const [canClick, setCanClick] = useState(false);
  const [shake, setShake] = useState(false);
  
  const startTimeRef = useRef(null);
  const timeoutsRef = useRef([]);
  const hasClickedRef = useRef(false);
  const { playLightSound, playGoSound, playFalseStartSound } = useAudio();

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'hard':
        return {
          lightDelay: 400,
          randomDelay: { min: 1500, max: 3500 },
          flickerEnabled: true,
          flickerCount: 2,
          flickerDuration: 80
        };
      case 'chaos':
        return {
          lightDelay: 350,
          randomDelay: { min: 2000, max: 5000 },
          flickerEnabled: true,
          flickerCount: 3,
          flickerDuration: 100,
          audioOffset: Math.random() * 160 - 80,
          shakeEnabled: true
        };
      default: // normal
        return {
          lightDelay: 500,
          randomDelay: { min: 2000, max: 4000 },
          flickerEnabled: true,
          flickerCount: 1,
          flickerDuration: 70
        };
    }
  };

  const settings = getDifficultySettings();

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const handleClick = useCallback(() => {
    if (hasClickedRef.current) return;
    hasClickedRef.current = true;

    if (gamePhase === 'go') {
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      
      // Anti-cheat: reject impossibly fast reactions
      if (reactionTime < 80) {
        playFalseStartSound();
        onResult({ falseStart: true, reactionTime: 0 });
      } else {
        onResult({ falseStart: false, reactionTime });
      }
    } else {
      // False start
      playFalseStartSound();
      onResult({ falseStart: true, reactionTime: 0 });
    }
    
    setGamePhase('finished');
    cleanup();
  }, [gamePhase, onResult, cleanup, playFalseStartSound]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && canClick) {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canClick, handleClick]);

  useEffect(() => {
    hasClickedRef.current = false;
    setCanClick(true);

    // Light up sequence
    lights.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setLights(prev => {
          const newLights = [...prev];
          newLights[index] = true;
          return newLights;
        });
        playLightSound();
      }, index * settings.lightDelay);
      timeoutsRef.current.push(timeout);
    });

    // After all lights are on
    const allLightsOnDelay = lights.length * settings.lightDelay;
    
    const waitTimeout = setTimeout(() => {
      setGamePhase('waiting');
      
      // Random delay before lights out
      const randomDelay = Math.random() * (settings.randomDelay.max - settings.randomDelay.min) + settings.randomDelay.min;
      
      // Add fake flickers during waiting phase
      if (settings.flickerEnabled) {
        const flickerCount = settings.flickerCount;
        for (let i = 0; i < flickerCount; i++) {
          const flickerTime = Math.random() * (randomDelay - 500) + 200;
          const flickerTimeout = setTimeout(() => {
            const randomLight = Math.floor(Math.random() * 5);
            setLights(prev => {
              const newLights = [...prev];
              newLights[randomLight] = false;
              return newLights;
            });
            
            setTimeout(() => {
              setLights(prev => {
                const newLights = [...prev];
                newLights[randomLight] = true;
                return newLights;
              });
            }, settings.flickerDuration);
          }, flickerTime);
          timeoutsRef.current.push(flickerTimeout);
        }
      }
      
      // Chaos mode shake
      if (settings.shakeEnabled) {
        const shakeTime = Math.random() * (randomDelay - 300) + 150;
        const shakeTimeout = setTimeout(() => {
          setShake(true);
          setTimeout(() => setShake(false), 200);
        }, shakeTime);
        timeoutsRef.current.push(shakeTimeout);
      }
      
      // Lights out!
      const goTimeout = setTimeout(() => {
        setLights([false, false, false, false, false]);
        setGamePhase('go');
        startTimeRef.current = performance.now();
        playGoSound();
      }, randomDelay);
      timeoutsRef.current.push(goTimeout);
    }, allLightsOnDelay);
    timeoutsRef.current.push(waitTimeout);

    return cleanup;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">
      <motion.div
        animate={shake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.2 }}
        className="flex-1 flex flex-col"
      >
        {/* Start Lights - Top Center */}
        <div className="flex justify-center items-start pt-8 pb-4">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm px-8 py-6 rounded-lg border-2 border-gray-700">
            <div className="flex justify-center gap-4 mb-4">
              {lights.map((isOn, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`w-16 h-16 rounded-full border-4 transition-all duration-150 ${
                      isOn
                        ? 'bg-red-600 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.8)]'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  />
                  {isOn && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-red-500 blur-xl"
                    />
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Status Text */}
            <div className="text-center h-8">
              {gamePhase === 'countdown' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-gray-400 font-semibold tracking-wide"
                >
                  GET READY...
                </motion.p>
              )}
              {gamePhase === 'waiting' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-yellow-500 font-semibold tracking-wide"
                >
                  WAIT FOR IT...
                </motion.p>
              )}
              {gamePhase === 'go' && (
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-3xl text-green-400 font-bold tracking-wider"
                >
                  GO GO GO!
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* F1 Track */}
        <div className="flex-1 relative overflow-hidden">
          {/* Track Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700">
            {/* Track Lines */}
            <div className="absolute inset-0 flex justify-center">
              {/* Left boundary */}
              <div className="absolute left-[20%] top-0 bottom-0 w-1 bg-white opacity-80"></div>
              {/* Right boundary */}
              <div className="absolute right-[20%] top-0 bottom-0 w-1 bg-white opacity-80"></div>
              
              {/* Center dashed line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 flex flex-col gap-8 -translate-x-1/2">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="h-12 bg-white opacity-50"></div>
                ))}
              </div>
            </div>

            {/* Starting Grid Lines */}
            <div className="absolute bottom-[30%] left-[20%] right-[20%] h-1 bg-white opacity-90"></div>
            <div className="absolute bottom-[30%] left-[20%] right-[20%]">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-16 w-1 bg-white opacity-60"
                  style={{ left: `${i * 10}%`, bottom: 0 }}
                ></div>
              ))}
            </div>
          </div>

          {/* F1 Car */}
          <motion.div
            initial={{ y: 0 }}
            animate={gamePhase === 'go' ? { y: -1000 } : { y: 0 }}
            transition={{ duration: 2, ease: "easeIn;

export default StartLights;
