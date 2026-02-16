import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LeaderboardTable = ({ onBack, currentPlayer }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Load from localStorage for now (will be replaced with API call)
    const stored = localStorage.getItem('f1-leaderboard');
    if (stored) {
      const data = JSON.parse(stored);
      setLeaderboard(data);
    }
  }, []);

  const sortedData = [...leaderboard].sort((a, b) => {
    // 1. Sort by tournament average first (lowest is best)
    if (a.bestTournamentAverage && b.bestTournamentAverage) {
      if (a.bestTournamentAverage !== b.bestTournamentAverage) {
        return a.bestTournamentAverage - b.bestTournamentAverage;
      }
    }
    if (a.bestTournamentAverage && !b.bestTournamentAverage) return -1;
    if (!a.bestTournamentAverage && b.bestTournamentAverage) return 1;
    
    // 2. Then by best single reaction (lowest is best)
    if (a.bestSingleReaction && b.bestSingleReaction) {
      if (a.bestSingleReaction !== b.bestSingleReaction) {
        return a.bestSingleReaction - b.bestSingleReaction;
      }
    }
    if (a.bestSingleReaction && !b.bestSingleReaction) return -1;
    if (!a.bestSingleReaction && b.bestSingleReaction) return 1;
    
    // 3. Finally by lowest false starts
    const aFalseStarts = a.falseStarts || 0;
    const bFalseStarts = b.falseStarts || 0;
    return aFalseStarts - bFalseStarts;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold mb-4">LEADERBOARD</h2>
        <div className="h-1 bg-red-600 w-32 mx-auto" />
      </div>

      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
        {sortedData.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-xl">No entries yet</p>
            <p className="text-sm mt-2">Complete a tournament to appear on the leaderboard</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">RANK</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">PHONE</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">DRIVER</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">NUMBER</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">BEST SINGLE</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">TOURNAMENT AVG</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">FALSE STARTS</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((entry, index) => (
                  <tr
                    key={index}
                    className={`border-t border-gray-700 hover:bg-gray-700 transition-colors ${
                      entry.phone === currentPlayer?.phone && entry.number === currentPlayer?.number
                        ? 'bg-red-900 bg-opacity-20'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-lg">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{entry.phone}</td>
                    <td className="px-4 py-3 font-semibold">{entry.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-gray-700 px-2 py-1 rounded text-sm">
                        #{entry.number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-semibold">
                      {entry.bestSingleReaction ? `${entry.bestSingleReaction}ms` : '-'}
                    </td>
                    <td className="px-4 py-3 text-blue-400 font-semibold">
                      {entry.bestTournamentAverage ? `${entry.bestTournamentAverage}ms` : '-'}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      {entry.falseStarts || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded font-bold text-lg tracking-wider transition-colors"
        >
          BACK
        </button>
      </div>
    </motion.div>
  );
};

export default LeaderboardTable;
