import { useState, useCallback } from 'react';
import type { AnimeEntry } from '../domain/types.ts';
import { exportToJSON, parseImportData, mergeImport } from '../services/importExport.ts';
import * as repository from '../storage/repository.ts';

export function useImportExport(onImportComplete?: () => void) {
  const [importError, setImportError] = useState<string[]>([]);
  const [importPreview, setImportPreview] = useState<{
    entryCount: number;
    version: string;
  } | null>(null);
  const [pendingData, setPendingData] = useState<AnimeEntry[] | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');

  const handleExport = useCallback(() => {
    const entries = repository.getAll();
    const data = exportToJSON(entries);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const a = document.createElement('a');
    a.href = url;
    a.download = `anime-viewer-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setImportError([]);
    setImportPreview(null);
    setPendingData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseImportData(text);
      if (result.errors.length > 0) {
        setImportError(result.errors);
        return;
      }
      if (result.data) {
        setImportPreview({
          entryCount: result.data.entries.length,
          version: result.data.appVersion,
        });
        setPendingData(result.data.entries);
      }
    };
    reader.onerror = () => {
      setImportError(['ファイルの読み込みに失敗しました']);
    };
    reader.readAsText(file);
  }, []);

  const confirmImport = useCallback(() => {
    if (!pendingData) return;
    const existing = repository.getAll();
    const merged = mergeImport(existing, pendingData, importMode);
    repository.saveAll(merged);
    setImportPreview(null);
    setPendingData(null);
    setImportError([]);
    onImportComplete?.();
  }, [pendingData, importMode, onImportComplete]);

  const cancelImport = useCallback(() => {
    setImportPreview(null);
    setPendingData(null);
    setImportError([]);
  }, []);

  return {
    handleExport,
    handleFileSelect,
    confirmImport,
    cancelImport,
    importError,
    importPreview,
    importMode,
    setImportMode,
    hasPendingImport: pendingData !== null,
  };
}
