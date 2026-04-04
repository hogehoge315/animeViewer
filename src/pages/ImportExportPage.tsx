import { useRef } from 'react';
import { useImportExport } from '../hooks/useImportExport.ts';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const sectionStyle: CSSProperties = {
  marginBottom: '32px',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #fbcfe8',
};

const btnPrimary: CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#ec4899',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnOutline: CSSProperties = {
  padding: '10px 20px',
  backgroundColor: 'transparent',
  color: '#6b7280',
  border: '1px solid #f9a8d4',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
};

export function ImportExportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    handleExport,
    handleFileSelect,
    confirmImport,
    cancelImport,
    importError,
    importPreview,
    importMode,
    setImportMode,
    hasPendingImport,
  } = useImportExport();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '24px' }}>
        インポート / エクスポート
      </h1>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ec4899', marginTop: 0, marginBottom: '12px' }}>
          エクスポート
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
          全てのアニメデータをJSONファイルとしてダウンロードします。
        </p>
        <button type="button" onClick={handleExport} style={btnPrimary}>
          エクスポート
        </button>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ec4899', marginTop: 0, marginBottom: '12px' }}>
          インポート
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
          エクスポートしたJSONファイルからデータを読み込みます。
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={btnOutline}
        >
          ファイルを選択
        </button>

        {importError.length > 0 && (
          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
            <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              エラー
            </div>
            {importError.map((err, i) => (
              <div key={i} style={{ color: '#ef4444', fontSize: '13px' }}>{err}</div>
            ))}
          </div>
        )}

        {importPreview && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff0f3', borderRadius: '8px' }}>
            <div style={{ color: '#1f2937', fontSize: '14px', marginBottom: '8px' }}>
              <strong>{importPreview.entryCount}</strong> 件のエントリ（バージョン: {importPreview.version}）
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', cursor: 'pointer', marginBottom: '4px' }}>
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                />
                マージ（既存データと統合）
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'overwrite'}
                  onChange={() => setImportMode('overwrite')}
                />
                上書き（既存データを置換）
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={confirmImport} style={btnPrimary} disabled={!hasPendingImport}>
                インポート実行
              </button>
              <button type="button" onClick={cancelImport} style={btnOutline}>
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
