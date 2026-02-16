import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

const StartLights = ({ difficulty, onResult, carNumber }) => {
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [gamePhase, setGamePhase] = useState('waiting-hold');
  const [isHolding, setIsHolding] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [showSmoke, setShowSmoke] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  
  const startTimeRef = useRef(null);
  const timeoutsRef = useRef([]);
  const hasReleasedRef = useRef(false);
  const { playLightSound, playGoSound, playFalseStartSound } = useAudio();

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
      
      if (reactionTime < 80) {
        setFlashMessage('INVALID LAUNCH');
        playFalseStartSound();
        onResult({ falseStart: true, reactionTime: 0 });
      } else {
        if (reactionTime < 200) {
          setShowSmoke(true);
          setTimeout(() => setShowSmoke(false), 800);
        }
        setFlashMessage(reactionTime < 200 ? 'PERFECT LAUNCH' : 'LIGHTS OUT');
        setCarPosition(-1000);
        setTimeout(() => {
          onResult({ falseStart: false, reactionTime });
        }, 1200);
      }
    } else if (gamePhase === 'countdown' || gamePhase === 'waiting') {
      setFlashMessage('FALSE START');
      playFalseStartSound();
      cleanup();
      setTimeout(() => {
        onResult({ falseStart: true, reactionTime: 0 });
      }, 800);
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
    if (isHolding && gamePhase === 'go') {
      handleRelease();
    } else if (gamePhase === 'waiting-hold') {
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleClick);
    };
  }, [handlePress, handleRelease, handleClick]);

  useEffect(() => {
    if (!canStart) return;

    hasReleasedRef.current = false;
    setGamePhase('countdown');

    // Turn on lights one by one
    lights.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setLights(prev => {
          const newLights = [...prev];
          newLights[index] = true;
          return newLights;
        });
        playLightSound();
      }, index * 350);
      timeoutsRef.current.push(timeout);
    });

    const allLightsOnDelay = lights.length * 350;

    const waitTimeout = setTimeout(() => {
      setGamePhase('waiting');

      const randomDelay = Math.random() * 3000 + 2000;

      const goTimeout = setTimeout(() => {
        // F1 authentic: All lights turn OFF for "GO"
        setLights([false, false, false, false, false]);
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
      className="relative w-full h-screen flex flex-col overflow-hidden cursor-pointer bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700"
      onClick={handleClick}
    >
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Flash Message */}
      <AnimatePresence>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div 
              className="text-7xl font-black tracking-[0.2em] px-16 py-8"
              style={{
                fontFamily: 'Arial Black, sans-serif',
                textTransform: 'uppercase',
                color: flashMessage.includes('FALSE') ? '#ef4444' :
                       flashMessage.includes('PERFECT') ? '#22c55e' : '#ffffff',
                textShadow: '0 0 20px rgba(0,0,0,0.8)'
              }}
            >
              {flashMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gantry Lights */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-8 z-40">
        <div 
          className="relative px-8 py-6 rounded-lg"
          style={{
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
            border: '2px solid #2a2a2a'
          }}
        >
          <div className="flex justify-center gap-6">
            {lights.map((isOn, index) => (
              <div key={index} className="relative">
                {/* Vertical housing */}
                <div
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    width: '70px',
                    height: '140px',
                    background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
                    border: '2px solid #1a1a1a'
                  }}
                >
                  {/* Decorative bars */}
                  <div className="absolute top-2 left-2 right-2 h-1 bg-gray-600 opacity-50" />
                  <div className="absolute top-5 left-2 right-2 h-1 bg-gray-600 opacity-50" />
                  
                  {/* Light */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="relative rounded-full transition-all duration-150"
                      style={{
                        width: '52px',
                        height: '52px',
                        background: isOn
                          ? 'radial-gradient(circle at 35% 35%, #fca5a5 0%, #dc2626 30%, #991b1b 100%)'
                          : 'radial-gradient(circle at 35% 35%, #2a2a2a 0%, #1a1a1a 60%, #0a0a0a 100%)',
                        boxShadow: isOn
                          ? '0 0 25px rgba(220, 38, 38, 0.9), 0 0 50px rgba(220, 38, 38, 0.6)'
                          : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                        border: isOn ? '2px solid rgba(255,255,255,0.15)' : '2px solid rgba(0,0,0,0.5)'
                      }}
                    >
                      {isOn && (
                        <div
                          className="absolute top-1 left-1 rounded-full"
                          style={{
                            width: '18px',
                            height: '18px',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
                            filter: 'blur(1px)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-5 left-2 right-2 h-1 bg-gray-600 opacity-50" />
                  <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-600 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="flex-1 relative mt-48">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500">
          {/* Texture */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)'
            }}
          />

          {/* Light gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(0,0,0,0.3) 100%)'
            }}
          />

          {/* Track boundaries */}
          <div className="absolute inset-0 flex justify-center">
            <div className="relative w-[60%] h-full">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-white shadow-lg" />
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-lg" />
              
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 flex flex-col gap-6">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-10 bg-yellow-400 opacity-90" />
                ))}
              </div>
            </div>
          </div>

          {/* Starting Grid */}
          <div className="absolute bottom-[35%] left-[20%] right-[20%]">
            <div className="relative h-3 bg-white mb-4 shadow-lg" />
            <div className="relative flex justify-center gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1 h-20 bg-white opacity-70" />
              ))}
            </div>
          </div>
        </div>

        {/* Car */}
        <motion.div
          animate={{
            y: carPosition
          }}
          transition={{ duration: 1, ease: 'easeIn' }}
          className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-30"
        >
          {/* Shadow */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full opacity-40 blur-md"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)'
            }}
          />

          {/* Car SVG */}
          <svg width="90" height="180" viewBox="0 0 90 180" className="drop-shadow-2xl">
            <rect x="25" y="45" width="40" height="85" fill="#dc2626" rx="4" />
            <rect x="12" y="33" width="66" height="10" fill="#1f2937" rx="3" />
            <rect x="18" y="132" width="54" height="8" fill="#1f2937" rx="3" />
            <ellipse cx="45" cy="78" rx="14" ry="24" fill="#374151" />
            <rect x="8" y="55" width="14" height="22" fill="#111827" rx="3" />
            <rect x="68" y="55" width="14" height="22" fill="#111827" rx="3" />
            <rect x="8" y="103" width="14" height="22" fill="#111827" rx="3" />
            <rect x="68" y="103" width="14" height="22" fill="#111827" rx="3" />
            <text x="45" y="85" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
              {carNumber || '1'}
            </text>
          </svg>

          {/* Smoke */}
          {showSmoke && (
            <>
              <motion.div
                initial={{ opacity: 0.8, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8 }}
                className="absolute -bottom-6 left-2 w-20 h-12 bg-gray-300 rounded-full blur-xl"
              />
              <motion.div
                initial={{ opacity: 0.8, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8 }}
                className="absolute -bottom-6 right-2 w-20 h-12 bg-gray-300 rounded-full blur-xl"
              />
            </>
          )}
        </motion.div>
      </div>

      {/* Instructions */}
      {gamePhase === 'waiting-hold' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
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
        </div>
      )}

      {isHolding && gamePhase !== 'finished' && gamePhase !== 'go' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <p 
            className="text-4xl font-bold tracking-[0.3em]"
            style={{
              color: 'rgba(255,200,0,0.9)',
              textShadow: '0 0 20px rgba(255,200,0,0.5)',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase'
            }}
          >
            Clutch Engaged
          </p>
        </div>
      )}
    </div>
  );
};

export default StartLights;
