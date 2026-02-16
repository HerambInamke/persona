import { useState } from 'react';
import StartForm from './components/StartForm';
import GameController from './components/GameController';
import './App.css';

function App() {
  const [player, setPlayer] = useState(null);
  const [gameMode, setGameMode] = useState('menu');

  const handlePlayerSubmit = (playerData) => {
    setPlayer(playerData);
    setGameMode('game');
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
    setPlayer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {gameMode === 'menu' && (
        <StartForm onSubmit={handlePlayerSubmit} />
      )}
      {gameMode === 'game' && player && (
        <GameController player={player} onBackToMenu={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
