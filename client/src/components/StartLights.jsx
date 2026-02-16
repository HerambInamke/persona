import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

const StartLights = ({ difficulty, onResult, carNumber }) => {
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [gamePhase, setGamePhase] = useState('waiting-hold'); // waiting-hold, countdown, waiting, go, finished
  const [isHolding, setIsHolding] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [shake, setShake] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [showSmoke, setShowSmoke] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [cameraShake, setCameraShake] = useState(false);
  
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
          setCameraShake(true);
          setTimeout(() => {
            setShowSmoke(false);
            setCameraShake(false);
          }, 1000);
        }
        setFlashMessage(reactionTime < 200 ? 'PERFECT LAUNCH' : 'LIGHTS OUT');
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
        setFlashMessage('LIGHTS OUT');
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
      className="relative w-full h-screen flex flex-col overflow-hidden cursor-pointer"
      onClick={handleClick}
      style={{
        background: 'radial-gradient(ellipse at top, #1f2937 0%, #111827 50%, #000000 100%)'
      }}
    >
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
      }}></div>

      {/* Flash Message Overlay */}
      <AnimatePresence>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div 
              className="text-7xl font-black tracking-[0.2em] px-16 py-8"
              style={{
                fontFamily: 'Arial Black, sans-serif',
                textTransform: 'uppercase',
                color: flashMessage.includes('FALSE') ? '#ef4444' :
                       flashMessage.includes('PERFECT') ? '#22c55e' : '#ffffff',
                textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px currentColor',
                letterSpacing: '0.15em'
              }}
            >
              {flashMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gantry Lights - Top Center with realistic styling */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-8 z-40">
        <motion.div
          animate={shake ? { x: [0, -3, 3, -3, 3, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          {/* Metallic housing */}
          <div 
            className="relative px-10 py-8 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 50%, #0f1419 100%)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '2px solid #374151'
            }}
          >
            <div className="flex justify-center gap-5">
              {lights.map((isOn, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  {/* LED Light with glass effect */}
                  <div
                    className="relative w-24 h-24 rounded-full transition-all duration-150"
                    style={{
                      background: gamePhase === 'go' && isOn
                        ? 'radial-gradient(circle at 30% 30%, #86efac 0%, #22c55e 40%, #15803d 100%)'
                        : isOn
                        ? 'radial-gradient(circle at 30% 30%, #fca5a5 0%, #dc2626 40%, #991b1b 100%)'
                        : 'radial-gradient(circle at 30% 30%, #374151 0%, #1f2937 60%, #111827 100%)',
                      boxShadow: gamePhase === 'go' && isOn
                        ? '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.5), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
                        : isOn
                        ? '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.5), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
                        : 'inset 0 4px 8px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.05)',
                      border: isOn ? '3px solid rgba(255,255,255,0.2)' : '3px solid rgba(0,0,0,0.4)'
                    }}
                  >
                    {/* Glass reflection highlight */}
                    {isOn && (
                      <div
                        className="absolute top-2 left-2 w-8 h-8 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 70%)',
                          filter: 'blur(2px)'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Extended bloom glow */}
                  {isOn && (
                    <motion.div
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: gamePhase === 'go' 
                          ? 'radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, transparent 70%)'
                          : 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
                        filter: 'blur(20px)',
                        transform: 'scale(1.8)'
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Track Scene with camera shake */}
      <motion.div 
        className="flex-1 relative mt-48"
        animate={cameraShake ? { x: [0, -4, 4, -4, 4, 0], y: [0, -2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.3 }}
        style={{ perspective: '1000px' }}
      >
        {/* Track Background with texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500">
          {/* Asphalt grain texture */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)
              `,
              filter: 'contrast(1.2)'
            }}
          ></div>

          {/* Noise overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
            }}
          ></div>

          {/* Light gradient from top */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(0,0,0,0.3) 100%)'
            }}
          ></div>

          {/* Track boundaries */}
          <div className="absolute inset-0 flex justify-center">
            <div className="relative w-[60%] h-full">
              {/* Left boundary */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-white shadow-lg"></div>
              {/* Right boundary */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-lg"></div>
              
              {/* Center dashed line - Yellow */}
              <div className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 flex flex-col gap-6">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-10 bg-yellow-400 opacity-90 shadow-md"></div>
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

        {/* F1 Car with enhancements */}
        <motion.div
          animate={{
            y: carPosition,
            scale: carPosition < 0 ? 0.5 : 1
          }}
          transition={{ duration: 1.5, ease: [0.6, 0.01, 0.05, 0.95] }}
          className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-30"
        >
          {/* Car shadow */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full opacity-40 blur-md"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)'
            }}
          ></div>

          {/* Heat haze behind car */}
          {isHolding && gamePhase !== 'finished' && (
            <motion.div
              animate={{ 
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute top-32 left-1/2 -translate-x-1/2 w-20 h-16 rounded-full blur-xl"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,100,0,0.3) 0%, transparent 70%)'
              }}
            />
          )}

          <motion.div
            animate={isHolding && gamePhase !== 'finished' ? {
              y: [0, -1.5, 0, 1.5, 0],
              x: [0, -0.5, 0, 0.5, 0],
              rotate: [0, -0.2, 0, 0.2, 0]
            } : {}}
            transition={{ duration: 0.12, repeat: Infinity }}
          >
            {/* F1 Car SVG with car number */}
            <svg width="90" height="180" viewBox="0 0 90 180" className="drop-shadow-2xl">
              {/* Car body */}
              <rect x="25" y="45" width="40" height="85" fill="#dc2626" rx="4" />
              {/* Front wing */}
              <rect x="12" y="33" width="66" height="10" fill="#1f2937" rx="3" />
              {/* Rear wing */}
              <rect x="18" y="132" width="54" height="8" fill="#1f2937" rx="3" />
              {/* Cockpit */}
              <ellipse cx="45" cy="78" rx="14" ry="24" fill="#374151" />
              {/* Wheels with slight blur for rotation */}
              <rect x="8" y="55" width="14" height="22" fill="#111827" rx="3" />
              <rect x="68" y="55" width="14" height="22" fill="#111827" rx="3" />
              <rect x="8" y="103" width="14" height="22" fill="#111827" rx="3" />
              <rect x="68" y="103" width="14" height="22" fill="#111827" rx="3" />
              {/* Car Number - Dynamic */}
              <text x="45" y="85" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {carNumber || '1'}
              </text>
            </svg>
          </motion.div>

          {/* Tire smoke effect */}
          {showSmoke && (
            <>
              <motion.div
                initial={{ opacity: 0.9, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 2.5, y: 20 }}
                transition={{ duration: 1.2 }}
                className="absolute -bottom-6 left-2 w-20 h-12 bg-gray-300 rounded-full blur-xl"
              />
              <motion.div
                initial={{ opacity: 0.9, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 2.5, y: 20 }}
                transition={{ duration: 1.2, delay: 0.1 }}
                className="absolute -bottom-6 right-2 w-20 h-12 bg-gray-300 rounded-full blur-xl"
              />
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Instruction Overlay - Minimal centered text */}
      {gamePhase === 'waiting-hold' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <div className="text-center">
            <p 
              className="text-3xl font-bold tracking-[0.3em] mb-2"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase'
              }}
            >
              Hold Space to Arm Clutch
            </p>
            <p 
              className="text-sm tracking-wider"
              style={{
                color: 'rgba(255,255,255,0.4)',
                textShadow: '0 1px 5px rgba(0,0,0,0.8)'
              }}
            >
              Release when lights turn green
            </p>
          </div>
        </motion.div>
      )}

      {isHolding && gamePhase !== 'finished' && gamePhase !== 'go' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <p 
            className="text-4xl font-bold tracking-[0.3em]"
            style={{
              color: 'rgba(255,200,0,0.9)',
              textShadow: '0 0 20px rgba(255,200,0,0.5), 0 2px 10px rgba(0,0,0,0.8)',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase'
            }}
          >
            Clutch Engaged
          </p>
        </motion.div>
      )}

      {gamePhase === 'go' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <motion.p 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="text-6xl font-black tracking-[0.3em]"
            style={{
              color: '#22c55e',
              textShadow: '0 0 30px rgba(34,197,94,0.8), 0 0 60px rgba(34,197,94,0.4), 0 4px 20px rgba(0,0,0,0.9)',
              fontFamily: 'Arial Black, sans-serif',
              textTransform: 'uppercase'
            }}
          >
            RELEASE NOW!
          </motion.p>
        </motion.div>
      )}
    </div>
  );
};

export default StartLights;
