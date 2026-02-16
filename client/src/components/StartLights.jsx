import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

const StartLights = ({ difficulty, onResult }) => {
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [gamePhase, setGamePhase] = useState('waiting-hold'); // waiting-hold, countdown, waiting, go, finished
  const [isHolding, setIsHolding] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [shake, setShake] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [showSmoke, setShowSmoke] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  
  const startTimeRef = useRef(null);
  const timeoutsRef = useRef([]);
  const hasReleasedRef = useRef(false);
  const { playLightSound, playGoSound, playFalseStartSound } = useAudio();

  const getDifficultySettings = () => {
    return {
      lightDelay: 350,
      randomDelay: { min: 2000, max: 5000 },
      flickerEnabled: true,
      flickerCount: 3,
      flickerDuration: 100,
      audioOffset: Math.random() * 160 - 80,
      shakeEnabled: true
    };
  };

  const settings = getDifficultySettings();

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const handleRelease = useCallback(() => {
    if (hasReleasedRef.current || !isHolding) return;
    hasReleasedRef.current = true;
    setIsHolding(false);

    if (gamePhase === 'go') {
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      
      // Anti-cheat: reject impossibly fast reactions
      if (reactionTime < 80) {
        setFlashMessage('INVALID LAUNCH');
        playFalseStartSound();
        onResult({ falseStart: true, reactionTime: 0 });
      } else {
        // Perfect launch animation
        if (reactionTime < 200) {
          setShowSmoke(true);
          setTimeout(() => setShowSmoke(false), 1000);
        }
        setFlashMessage(reactionTime < 200 ? 'PERFECT LAUNCH!' : 'GOOD LAUNCH');
        setCarPosition(-1000);
        setTimeout(() => {
          onResult({ falseStart: false, reactionTime });
        }, 1500);
      }
    } else if (gamePhase === 'countdown' || gamePhase === 'waiting') {
      // False start
      setFlashMessage('FALSE START');
      playFalseStartSound();
      cleanup();
      setTimeout(() => {
        onResult({ falseStart: true, reactionTime: 0 });
      }, 1000);
    }
    
    setGamePhase('finished');
  }, [gamePhase, isHolding, onResult, cleanup, playFalseStartSound]);

  const handlePress = useCallback(() => {
    if (gamePhase === 'waiting-hold' && !isHolding) {
      setIsHolding(true);
      setCanStart(true);
    }
  }, [gamePhase, isHolding]);

  const handleClick = useCallback(() => {
    // If holding and lights are green, release
    if (isHolding && gamePhase === 'go') {
      handleRelease();
    }
    // If not holding yet, start holding
    else if (gamePhase === 'waiting-hold') {
      handlePress();
    }
  }, [gamePhase, isHolding, handlePress, handleRelease]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handlePress();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleRelease();
      }
    };

    const handleMouseDown = () => handlePress();
    const handleMouseUp = () => handleRelease();
    const handleClickAnywhere = () => handleClick();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClickAnywhere);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClickAnywhere);
    };
  }, [handlePress, handleRelease, handleClick]);

  useEffect(() => {
    if (!canStart) return;

    hasReleasedRef.current = false;
    setGamePhase('countdown');

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
      
      // Random delay before lights turn green
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
      
      // Shake effect
      if (settings.shakeEnabled) {
        const shakeTime = Math.random() * (randomDelay - 300) + 150;
        const shakeTimeout = setTimeout(() => {
          setShake(true);
          setTimeout(() => setShake(false), 200);
        }, shakeTime);
        timeoutsRef.current.push(shakeTimeout);
      }
      
      // Lights turn GREEN!
      const goTimeout = setTimeout(() => {
        setLights([true, true, true, true, true]); // All green
        setGamePhase('go');
        setFlashMessage('LIGHTS OUT!');
        startTimeRef.current = performance.now();
        playGoSound();
      }, randomDelay);
      timeoutsRef.current.push(goTimeout);
    }, allLightsOnDelay);
    timeoutsRef.current.push(waitTimeout);

    return cleanup;
  }, [canStart]);

  return (
    <div 
      className="relative w-full h-screen flex flex-col overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 cursor-pointer"
      onClick={handleClick}
    >
      {/* Flash Message Overlay */}
      <AnimatePresence>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`text-6xl font-bold tracking-wider px-12 py-6 rounded-lg ${
              flashMessage.includes('FALSE') ? 'text-red-500 bg-red-900 bg-opacity-30' :
              flashMessage.includes('PERFECT') ? 'text-green-400 bg-green-900 bg-opacity-30' :
              'text-white bg-black bg-opacity-50'
            }`}>
              {flashMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gantry Lights - Top Center - FIXED POSITION */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-12 z-50">
        <motion.div
          animate={shake ? { x: [0, -3, 3, -3, 3, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-black bg-opacity-90 backdrop-blur-sm px-8 py-6 rounded-lg border-4 border-gray-600 shadow-2xl">
            <div className="flex justify-center gap-4">
              {lights.map((isOn, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  className="relative"
                >
                  <div
                    className={`w-20 h-20 rounded-full border-4 transition-all duration-100 ${
                      gamePhase === 'go' && isOn
                        ? 'bg-green-500 border-green-300 shadow-[0_0_50px_rgba(34,197,94,1)]'
                        : isOn
                        ? 'bg-red-600 border-red-400 shadow-[0_0_40px_rgba(220,38,38,1)]'
                        : 'bg-gray-900 border-gray-700 shadow-inner'
                    }`}
                  />
                  {isOn && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full blur-xl ${
                        gamePhase === 'go' ? 'bg-green-400' : 'bg-red-500'
                      }`}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Track Scene */}
      <div className="flex-1 relative mt-48" style={{ perspective: '1000px' }}>
        {/* Track Background with perspective */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500">
          {/* Asphalt texture overlay */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)'
          }}></div>

          {/* Track boundaries */}
          <div className="absolute inset-0 flex justify-center">
            <div className="relative w-[60%] h-full">
              {/* Left boundary */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-white shadow-lg"></div>
              {/* Right boundary */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-lg"></div>
              
              {/* Center dashed line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 flex flex-col gap-6">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-8 bg-yellow-300 opacity-80"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Starting Grid */}
          <div className="absolute bottom-[35%] left-[20%] right-[20%]">
            {/* Starting line */}
            <div className="relative h-3 bg-white mb-4 shadow-lg"></div>
            {/* Grid boxes */}
            <div className="relative flex justify-center gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1 h-20 bg-white opacity-70 shadow-md"></div>
              ))}
            </div>
          </div>
        </div>

        {/* F1 Car */}
        <motion.div
          animate={{
            y: carPosition,
            scale: carPosition < 0 ? 0.5 : 1
          }}
          transition={{ duration: 1.5, ease: 'easeIn' }}
          className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-30"
        >
          <motion.div
            animate={isHolding && gamePhase !== 'finished' ? {
              y: [0, -1, 0, 1, 0],
              rotate: [0, -0.3, 0, 0.3, 0]
            } : {}}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            {/* Simple F1 Car SVG */}
            <svg width="80" height="160" viewBox="0 0 80 160" className="drop-shadow-2xl">
              {/* Car body */}
              <rect x="20" y="40" width="40" height="80" fill="#dc2626" rx="4" />
              {/* Front wing */}
              <rect x="10" y="30" width="60" height="8" fill="#1f2937" rx="2" />
              {/* Rear wing */}
              <rect x="15" y="122" width="50" height="6" fill="#1f2937" rx="2" />
              {/* Cockpit */}
              <ellipse cx="40" cy="70" rx="12" ry="20" fill="#374151" />
              {/* Wheels */}
              <rect x="8" y="50" width="12" height="20" fill="#111827" rx="2" />
              <rect x="60" y="50" width="12" height="20" fill="#111827" rx="2" />
              <rect x="8" y="90" width="12" height="20" fill="#111827" rx="2" />
              <rect x="60" y="90" width="12" height="20" fill="#111827" rx="2" />
              {/* Number */}
              <text x="40" y="75" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">1</text>
            </svg>
          </motion.div>

          {/* Tire smoke effect */}
          {showSmoke && (
            <motion.div
              initial={{ opacity: 0.8, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 1 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 bg-gray-400 rounded-full blur-xl"
            />
          )}
        </motion.div>
      </div>

      {/* Instruction Overlay */}
      {gamePhase === 'waiting-hold' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-40 pointer-events-none"
        >
          <div className="bg-black bg-opacity-80 px-8 py-4 rounded-lg border-2 border-gray-600">
            <p className="text-2xl font-bold text-white tracking-wide mb-2">
              CLICK ANYWHERE TO START
            </p>
            <p className="text-sm text-gray-300">
              Then click again when lights turn green
            </p>
          </div>
        </motion.div>
      )}

      {isHolding && gamePhase !== 'finished' && gamePhase !== 'go' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-40 pointer-events-none"
        >
          <div className="bg-yellow-600 bg-opacity-90 px-6 py-3 rounded-lg border-2 border-yellow-400">
            <p className="text-lg font-bold text-white tracking-wide">
              WAIT FOR GREEN...
            </p>
          </div>
        </motion.div>
      )}

      {gamePhase === 'go' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-40 pointer-events-none"
        >
          <div className="bg-green-600 bg-opacity-90 px-8 py-4 rounded-lg border-2 border-green-400 animate-pulse">
            <p className="text-2xl font-bold text-white tracking-wide">
              CLICK NOW!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StartLights;
