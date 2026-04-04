import type { CSSProperties } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export function SearchInput({ value, onChange, placeholder, loading }: SearchInputProps) {
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    paddingRight: loading ? '36px' : '12px',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    backgroundColor: '#1f2937',
    color: '#e5e7eb',
    fontSize: '14px',
    outline: 'none',
  };

  const spinnerStyle: CSSProperties = {
    position: 'absolute',
    right: '10px',
    width: '16px',
    height: '16px',
    border: '2px solid #4b5563',
    borderTopColor: '#818cf8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
      {loading && <div style={spinnerStyle} />}
    </div>
  );
}
