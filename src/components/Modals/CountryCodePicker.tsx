import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface CountryCode {
  name: string;
  code: string;
  flag: string;
  iso: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'United States', code: '+1', flag: '🇺🇸', iso: 'US' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', iso: 'GB' },
  { name: 'India', code: '+91', flag: '🇮🇳', iso: 'IN' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', iso: 'CA' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', iso: 'AU' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', iso: 'DE' },
  { name: 'France', code: '+33', flag: '🇫🇷', iso: 'FR' },
  { name: 'Japan', code: '+81', flag: '🇯🇵', iso: 'JP' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', iso: 'BR' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽', iso: 'MX' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', iso: 'NG' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', iso: 'SG' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', iso: 'AE' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷', iso: 'KR' },
  { name: 'Italy', code: '+39', flag: '🇮🇹', iso: 'IT' },
  { name: 'Spain', code: '+34', flag: '🇪🇸', iso: 'ES' },
  { name: 'China', code: '+86', flag: '🇨🇳', iso: 'CN' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', iso: 'ZA' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩', iso: 'ID' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰', iso: 'PK' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', iso: 'BD' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', iso: 'SA' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱', iso: 'NL' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭', iso: 'CH' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪', iso: 'SE' }
];

export const CountryCodePicker: React.FC<{
  selected: CountryCode;
  onSelect: (country: CountryCode) => void;
}> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.includes(search) || 
    c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{selected.flag}</span>
        <span>{selected.code}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '46px',
          left: 0,
          width: '260px',
          maxHeight: '260px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Search Box */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-header)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search country or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '100%'
              }}
              autoFocus
            />
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filtered.length > 0 ? (
              filtered.map(c => (
                <button
                  key={`${c.iso}-${c.code}`}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: selected.iso === c.iso && selected.code === c.code ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.825rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-whatsapp)', fontWeight: 700 }}>{c.code}</span>
                    {selected.iso === c.iso && <Check size={14} style={{ color: 'var(--accent-whatsapp)' }} />}
                  </div>
                </button>
              ))
            ) : (
              <div style={{ padding: '12px', fontSize: '0.775rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No country code found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
