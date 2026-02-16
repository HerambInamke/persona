import { motion } from 'framer-motion';

const TournamentSummary = ({ player, results, stats, onNewTournament, onViewLeaderboard }) => {
  const validResults = results.filter(r => !r.falseStart);
  const falseStartCount = results.filter(r => r.falseStart).length;
  const tournamentInvalid = falseStartCount > 2;
  
  const tournamentAverage = validResults.length > 0
    ? Math.round(validResults.reduce((sum, r) => sum + r.reactionTime, 0) / validResults.length)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold mb-4">TOURNAMENT COMPLETE</h2>
        <div className="h-1 bg-red-600 w-32 mx-auto" />
      </div>

      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-900 rounded">
            <p className="text-sm text-gray-400 mb-2">BEST SINGLE</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.bestSingle ? `${stats.bestSingle}ms` : 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-900 rounded">
            <p className="text-sm text-gray-400 mb-2">TOURNAMENT AVG</p>
            <p className={`text-3xl font-bold ${tournamentInvalid ? 'text-red-500' : 'text-blue-400'}`}>
              {tournamentInvalid ? 'INVALID' : tournamentAverage ? `${tournamentAverage}ms` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">ROUND BREAKDOWN</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded ${
                  result.falseStart ? 'bg-red-900 bg-opacity-30' : 'bg-gray-900'
                }`}
              >
                <span className="font-semibold">Round {index + 1}</span>
                <span className={result.falseStart ? 'text-red-400' : 'text-green-400'}>
                  {result.falseStart ? 'FALSE START' : `${result.reactionTime}ms`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center p-4 bg-gray-900 rounded">
          <p className="text-sm text-gray-400">FALSE STARTS: <span className="text-red-400 font-bold">{falseStartCount}</span></p>
          {tournamentInvalid && (
            <p className="text-red-500 text-sm mt-2">Tournament invalid (more than 2 false starts)</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onNewTournament}
          className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded font-bold text-lg tracking-wider transition-colors"
        >
          NEW TOURNAMENT
        </button>
        <button
          onClick={onViewLeaderboard}
          className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded font-bold text-lg tracking-wider transition-colors"
        >
          LEADERBOARD
        </button>
      </div>
    </motion.div>
  );
};

export default TournamentSummary;
