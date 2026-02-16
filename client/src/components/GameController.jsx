import { useState, useEffect } from 'react';
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-80 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider">F1 REACTION CHAMPIONSHIP</h1>
            <p className="text-sm text-gray-400 mt-1">
              {player.name} #{player.number} • {player.phone} • CHAOS MODE
            </p>
          </div>
          <button
            onClick={onBackToMenu}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {gameState === 'ready' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">ROUND {currentRound} OF {totalRounds}</h2>
            <p className="text-gray-400 mb-8">Press SPACE or click when lights go out</p>
            <button
              onClick={handleStartRound}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded font-bold text-xl tracking-wider"
            >
              START ROUND
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <StartLights
            difficulty={player.difficulty}
            onResult={handleGameResult}
          />
        )}

        {gameState === 'result' && lastResult && (
          <div className="text-center">
            {lastResult.falseStart ? (
              <>
                <h2 className="text-6xl font-bold text-red-600 mb-4">FALSE START</h2>
                <p className="text-2xl text-gray-400 mb-8">You jumped the lights!</p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-4">REACTION TIME</h2>
                <p className="text-7xl font-bold text-green-400 mb-8">
                  {lastResult.reactionTime}ms
                </p>
              </>
            )}
            <div className="mb-8">
              <p className="text-gray-400">Round {currentRound} of {totalRounds}</p>
              <p className="text-sm text-gray-500 mt-2">
                Best: {stats.bestSingle ? `${stats.bestSingle}ms` : 'N/A'} • 
                False Starts: {stats.falseStarts}
              </p>
            </div>
            <button
              onClick={handleNextRound}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded font-bold text-xl tracking-wider"
            >
              {currentRound < totalRounds ? 'NEXT ROUND' : 'VIEW RESULTS'}
            </button>
          </div>
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
