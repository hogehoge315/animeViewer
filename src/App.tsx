import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage.tsx';
import { AddAnimePage } from './pages/AddAnimePage.tsx';
import { SeasonListPage } from './pages/SeasonListPage.tsx';
import { DetailPage } from './pages/DetailPage.tsx';
import { ImportExportPage } from './pages/ImportExportPage.tsx';
import { VoiceActorSearchPage } from './pages/VoiceActorSearchPage.tsx';
import type { CSSProperties } from 'react';

const navStyle: CSSProperties = {
  display: 'flex',
  gap: '4px',
  padding: '8px 16px',
  backgroundColor: '#0f0d23',
  borderBottom: '1px solid #1e1b3a',
  overflowX: 'auto',
  flexWrap: 'nowrap',
};

const linkBase: CSSProperties = {
  padding: '6px 14px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  color: '#9ca3af',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.15s, color 0.15s',
};

function NavBar() {
  const getStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
    ...linkBase,
    backgroundColor: isActive ? '#312e5c' : 'transparent',
    color: isActive ? '#c4b5fd' : '#9ca3af',
  });

  return (
    <nav style={navStyle}>
      <NavLink to="/" end style={getStyle}>ホーム</NavLink>
      <NavLink to="/add" style={getStyle}>追加</NavLink>
      <NavLink to="/seasons" style={getStyle}>シーズン</NavLink>
      <NavLink to="/voice-actors" style={getStyle}>声優検索</NavLink>
      <NavLink to="/settings" style={getStyle}>設定</NavLink>
    </nav>
  );
}

const appStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0f0d23',
  color: '#e5e7eb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif',
};

const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: #0f0d23; color: #e5e7eb; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  a { color: inherit; }
  ::selection { background-color: #6366f1; color: #fff; }
`;

export function App() {
  return (
    <HashRouter>
      <style>{globalCSS}</style>
      <div style={appStyle}>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddAnimePage />} />
          <Route path="/seasons" element={<SeasonListPage />} />
          <Route path="/anime/:id" element={<DetailPage />} />
          <Route path="/settings" element={<ImportExportPage />} />
          <Route path="/voice-actors" element={<VoiceActorSearchPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
