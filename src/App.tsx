import './index.css';
import './i18n';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClubHome } from './pages/ClubHome';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { MatchDetail } from './pages/MatchDetail';
// Settings component kept for now if user navigates manually, though removed from nav.
import { Settings } from './pages/Settings';
import { useHistoryStore } from './store/useHistoryStore';
import { useMatchStore } from './store/useMatchStore';
import { useSettingsStore } from './store/useSettingsStore';

function App() {
  const loadHistory = useHistoryStore((s) => s.loadHistory);
  const loadFromStorage = useMatchStore((s) => s.loadFromStorage);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadHistory();
    loadFromStorage();
    loadSettings();
  }, [loadHistory, loadFromStorage, loadSettings]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Club promotion page */}
        <Route path="/" element={<ClubHome />} />

        {/* Scoreboard section */}
        <Route path="/score-board" element={<Home />} />

        {/* Placeholder routes for new links */}
        <Route path="/score-board/guide" element={<div className="page container animate-fadeIn flex flex-col items-center justify-center min-h-[50vh]"><h2 className="text-xl font-bold">How to Use</h2><p className="text-muted mt-4">Coming soon!</p></div>} />
        <Route path="/score-board/account" element={<div className="page container animate-fadeIn flex flex-col items-center justify-center min-h-[50vh]"><h2 className="text-xl font-bold">Account</h2><p className="text-muted mt-4">Cloud Sync & Profiles coming soon!</p></div>} />

        <Route path="/score-board/history" element={<History />} />
        <Route path="/score-board/history/:id" element={<MatchDetail />} />
        <Route path="/score-board/settings" element={<Settings />} />
      </Routes>
      <Navbar />
    </BrowserRouter>
  );
}

export default App;
