import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage.tsx';
import { AddAnimePage } from './pages/AddAnimePage.tsx';
import { DetailPage } from './pages/DetailPage.tsx';
import { ImportExportPage } from './pages/ImportExportPage.tsx';
import { DiscoverPage } from './pages/DiscoverPage.tsx';
import { StatsPage } from './pages/StatsPage.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import type { CSSProperties } from 'react';

const navStyle: CSSProperties = {
  display: 'flex',
  padding: '8px 16px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #fce7f3',
};

const linkBase: CSSProperties = {
  flex: 1,
  padding: '8px 4px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  color: '#6b7280',
  textAlign: 'center',
  transition: 'background-color 0.15s, color 0.15s',
};

function NavBar() {
  const getStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
    ...linkBase,
    backgroundColor: isActive ? '#fce7f3' : 'transparent',
    color: isActive ? '#db2777' : '#6b7280',
  });

  return (
    <nav style={navStyle}>
      <NavLink to="/" end style={getStyle}>ホーム</NavLink>
      <NavLink to="/add" style={getStyle}>追加</NavLink>
      <NavLink to="/discover" style={getStyle}>探す</NavLink>
      <NavLink to="/stats" style={getStyle}>統計</NavLink>
      <NavLink to="/settings" style={getStyle}>設定</NavLink>
    </nav>
  );
}

const appStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#fff5f7',
  color: '#1f2937',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif',
};

const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: #fff5f7; color: #1f2937; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  a { color: inherit; }
  ::selection { background-color: #ec4899; color: #fff; }
`;

export function App() {
  return (
    <HashRouter>
      <style>{globalCSS}</style>
      <div style={appStyle}>
        <NavBar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddAnimePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/anime/:id" element={<DetailPage />} />
            <Route path="/settings" element={<ImportExportPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </HashRouter>
  );
}
