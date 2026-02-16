import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StartLights from './StartLights';
import TournamentSummary from './TournamentSummary';
import LeaderboardTable from './LeaderboardTable';

const GameController = ({ player, onBackToMenu }) => {
  const [gameState, setGameState] = useState('ready'); // ready, playing, result, tournament-summary, leaderboard
  const [currentRound, setCurrentRound] = useState(1);
  const [tournamentResults, setTournamentResults] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [stats, setStats] = useState({
    bestSingle: null,
    falseStarts: 0,
    totalAttempts: 0
  });

  const totalRounds = 5;

  const handleGameResult = (result) => {
    const newResults = [...tournamentResults, result];
    setTournamentResults(newResults);
    setLastResult(result);
    setGameState('result');

    // Update stats
    const newStats = { ...stats };
    newStats.totalAttempts++;
    if (result.falseStart) {
      newStats.falseStarts++;
    } else {
      if (!newStats.bestSingle || result.reactionTime < newStats.bestSingle) {
        newStats.bestSingle = result.reactionTime;
      }
    }
    setStats(newStats);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setGameState('ready');
    } else {
      setGameState('tournament-summary');
    }
  };

  const handleStartRound = () => {
    setGameState('playing');
  };

  const handleViewLeaderboard = () => {
    setGameState('leaderboard');
  };

  const handleNewTournament = () => {
    setCurrentRound(1);
    setTournamentResults([]);
    setLastResult(null);
    setGameState('ready');
  };

  const saveTournamentToLeaderboard = () => {
    const validResults = tournamentResults.filter(r => !r.falseStart);
    const falseStartCount = tournamentResults.filter(r => r.falseStart).length;
    const tournamentInvalid = falseStartCount > 2;
    
    const tournamentAverage = validResults.length > 0
      ? Math.round(validResults.reduce((sum, r) => sum + r.reactionTime, 0) / validResults.length)
      : null;

    const entry = {
      phone: player.phone,
      name: player.name,
      number: player.number,
      difficulty: player.difficulty,
      bestSingleReaction: stats.bestSingle,
      bestTournamentAverage: tournamentInvalid ? null : tournamentAverage,
      falseStarts: stats.falseStarts,
      totalAttempts: stats.totalAttempts,
      createdAt: new Date().toISOString()
    };

    // Load existing leaderboard
    const stored = localStorage.getItem('f1-leaderboard');
    const leaderboard = stored ? JSON.parse(stored) : [];
    
    // Add new entry
    leaderboard.push(entry);
    
    // Save back
    localStorage.setItem('f1-leaderboard', JSON.stringify(leaderboard));
  };

  useEffect(() => {
    if (gameState === 'tournament-summary' && tournamentResults.length === totalRounds) {
      saveTournamentToLeaderboard();
    }
  }, [gameState]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Broadcast Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex justify-between items-start p-4">
          {/* Top Left - Title */}
          <div className="bg-black bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded border-l-4 border-red-600">
            <p className="text-xs text-gray-400 tracking-wider">F1 LAUNCH CONTROL</p>
            <p className="text-sm font-bold text-white">{player.name} #{player.number}</p>
          </div>

          {/* Top Right - Round Info */}
          {(gameState === 'playing' || gameState === 'result') && (
            <div className="bg-black bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded border-r-4 border-red-600">
              <p className="text-xs text-gray-400 tracking-wider">ROUND</p>
              <p className="text-lg font-bold text-white">{currentRound} / {totalRounds}</p>
            </div>
          )}
        </div>
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 bg-gray-900 bg-opacity-80 hover:bg-gray-800 rounded text-sm font-semibold border border-gray-700 pointer-events-auto"
        >
          EXIT
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {gameState === 'ready' && (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-5xl font-bold mb-4 tracking-wider">ROUND {currentRound}</h2>
              <div className="h-1 w-24 bg-red-600 mx-auto mb-8"></div>
              <p className="text-gray-400 mb-8 text-lg">Hold to launch, release on green</p>
              <button
                onClick={handleStartRound}
                className="px-12 py-4 bg-red-600 hover:bg-red-700 rounded font-bold text-xl tracking-wider transition-colors"
              >
                START LAUNCH
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="w-full h-full absolute inset-0">
            <StartLights
              difficulty={player.difficulty}
              onResult={handleGameResult}
            />
          </div>
        )}

        {gameState === 'result' && lastResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-lg border border-gray-700">
              {lastResult.falseStart ? (
                <>
                  <h2 className="text-6xl font-bold text-red-600 mb-4">FALSE START</h2>
                  <p className="text-xl text-gray-400 mb-8">You released too early!</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4 text-gray-300">LAUNCH TIME</h2>
                  <p className="text-8xl font-bold text-green-400 mb-4">
                    {lastResult.reactionTime}
                  </p>
                  <p className="text-2xl text-gray-400 mb-8">milliseconds</p>
                  {lastResult.reactionTime < 200 && (
                    <p className="text-yellow-400 font-semibold mb-4">⚡ PERFECT LAUNCH!</p>
                  )}
                </>
              )}
              <div className="mb-6 p-4 bg-gray-900 rounded">
                <p className="text-sm text-gray-400">Round {currentRound} of {totalRounds}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Best: {stats.bestSingle ? `${stats.bestSingle}ms` : 'N/A'} • 
                  False Starts: {stats.falseStarts}
                </p>
              </div>
              <button
                onClick={handleNextRound}
                className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 rounded font-bold text-xl tracking-wider transition-colors"
              >
                {currentRound < totalRounds ? 'NEXT ROUND' : 'VIEW RESULTS'}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'tournament-summary' && (
          <TournamentSummary
            player={player}
            results={tournamentResults}
            stats={stats}
            onNewTournament={handleNewTournament}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}

        {gameState === 'leaderboard' && (
          <LeaderboardTable
            onBack={handleNewTournament}
            currentPlayer={player}
          />
        )}
      </div>
    </div>
  );
};

export default GameController;
