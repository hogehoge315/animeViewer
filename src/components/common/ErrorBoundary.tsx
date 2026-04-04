import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '8px' }}>エラーが発生しました</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>ページの読み込みに失敗しました。</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.hash = '#/';
            }}
            style={{
              padding: '8px 20px',
              backgroundColor: '#ec4899',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ホームに戻る
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
