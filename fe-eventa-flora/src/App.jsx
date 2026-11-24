import { useEffect, useState } from 'react';
import {
  completeRegionMission,
  createPlayer,
  getGameResult,
  getPlayer,
  getRegionContent,
  getRegions,
} from './services/api';
import MainMenu from './components/MainMenu';
import MapScreen from './components/MapScreen';
import StoryScene from './components/StoryScene';
import LearningScene from './components/LearningScene';
import QuestionScene from './components/QuestionScene';
import RewardScene from './components/RewardScene';
import ResultScene from './components/ResultScene';

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'map' | 'story' | 'learning' | 'question' | 'reward' | 'result'
  const [player, setPlayer] = useState(null);
  const [regions, setRegions] = useState([]);
  const [activeRegionData, setActiveRegionData] = useState(null);
  const [rewardData, setRewardData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    getRegions()
      .then(setRegions)
      .catch((err) => console.error('Gagal memuat wilayah:', err));
  }, []);

  const refreshPlayer = async (playerId) => {
    if (!playerId) return null;
    const updated = await getPlayer(playerId);
    setPlayer(updated);
    return updated;
  };

  const handleStartGame = async (playerName) => {
    const newPlayer = await createPlayer(playerName);
    setPlayer(newPlayer);
    const updatedRegions = await getRegions();
    setRegions(updatedRegions);
    setScreen('map');
  };

  const handleSelectRegion = async (region) => {
    const content = await getRegionContent(region.id, player?.id);
    setActiveRegionData(content);
    setScreen('story');
  };

  const handleMissionComplete = async () => {
    const regionId = activeRegionData?.region?.id;
    const reward = await completeRegionMission(player.id, regionId);
    setRewardData(reward);
    setPlayer(reward.player);
    setScreen('reward');
  };

  const handleOpenResult = async () => {
    const res = await getGameResult(player.id);
    setResultData(res);
    setScreen('result');
  };

  const handlePlayAgain = async () => {
    if (!player?.name) {
      setScreen('menu');
      return;
    }
    await handleStartGame(player.name);
  };

  const handleBackToMenu = async () => {
    if (player?.id) {
      await refreshPlayer(player.id);
    }
    setScreen('menu');
  };

  return (
    <div className="app-container">
      {screen === 'menu' && (
        <MainMenu
          player={player}
          onStartGame={handleStartGame}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((s) => !s)}
        />
      )}

      {screen === 'map' && (
        <MapScreen
          player={player}
          regions={regions}
          onSelectRegion={handleSelectRegion}
          onOpenResult={handleOpenResult}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {screen === 'story' && activeRegionData && (
        <StoryScene
          region={activeRegionData.region}
          stories={activeRegionData.stories}
          onNextToLearning={() => setScreen('learning')}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {screen === 'learning' && activeRegionData && (
        <LearningScene
          region={activeRegionData.region}
          onStartQuestions={() => setScreen('question')}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {screen === 'question' && activeRegionData && (
        <QuestionScene
          player={player}
          region={activeRegionData.region}
          questions={activeRegionData.questions}
          assignedDifficulty={activeRegionData.assignedDifficulty}
          onMissionComplete={handleMissionComplete}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {screen === 'reward' && (
        <RewardScene
          rewardData={rewardData}
          onContinueMap={() => setScreen('map')}
          onFinishAll={handleOpenResult}
        />
      )}

      {screen === 'result' && (
        <ResultScene
          result={resultData}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}