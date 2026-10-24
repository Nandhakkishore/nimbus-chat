import React, { useState } from 'react';
import { useApp, ColorTheme } from '../../context/AppContext';
import { 
  Lock, Key, ShieldCheck, Download, Trash2, Moon, Sun, Bell, Database, CheckCircle2, ChevronRight, Palette, Check, Camera, Edit2, User 
} from 'lucide-react';

export const SettingsView: React.FC<{ onOpenProfile?: () => void }> = ({ onOpenProfile }) => {
  const { currentUser, theme, toggleTheme, colorTheme, setColorTheme } = useApp();
  const [exported, setExported] = useState(false);

  const themeOptions: { id: ColorTheme; label: string; color: string; desc: string }[] = [
    { id: 'emerald', label: 'WhatsApp Emerald', color: '#00a884', desc: 'Classic WhatsApp dark mode green accent' },
    { id: 'violet', label: 'Cyberpunk Violet', color: '#a55eea', desc: 'Futuristic purple neon aesthetic' },
    { id: 'sapphire', label: 'Sapphire Deep Blue', color: '#38ef7d', desc: 'Deep ocean dark blue theme' },
    { id: 'amber', label: 'Sunset Amber Gold', color: '#f59e0b', desc: 'Warm obsidian amber gold tint' },
    { id: 'rose', label: 'Ruby Crimson Rose', color: '#f43f5e', desc: 'Sleek dark crimson rose theme' },
    { id: 'light', label: 'Crisp Light Mode', color: '#008069', desc: 'Clean bright daylight theme' },
  ];

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      background: 'var(--bg-chat)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Settings & Customization</h2>

        {/* Profile Card */}
        <div style={{
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src={currentUser.avatar}
              alt={currentUser.displayName}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-whatsapp)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{currentUser.displayName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{currentUser.phoneNumber}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{currentUser.about}</p>
            </div>
          </div>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'var(--accent-whatsapp)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Edit2 size={16} /> Edit Profile & Photo
            </button>
          )}
        </div>

        {/* Appearance & Color Themes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={16} style={{ color: 'var(--accent-whatsapp)' }} />
            Appearance & App Color Themes
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            {themeOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => setColorTheme(opt.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: colorTheme === opt.id ? 'var(--bg-active)' : 'var(--bg-sidebar)',
                  border: `2px solid ${colorTheme === opt.id ? opt.color : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: opt.color, border: '2px solid rgba(255,255,255,0.2)' }} />
                  {colorTheme === opt.id && <Check size={16} style={{ color: opt.color }} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{opt.label}</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.3 }}>{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account & Security Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Account & Zero-Trust Security
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock size={20} style={{ color: 'var(--accent-amber)' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>2-Step Verification (2SV)</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Alphanumeric password active</p>
                </div>
              </div>
              <span className="glass-pill badge-trust-high" style={{ fontSize: '0.7rem' }}>Enabled</span>
            </div>

            <div style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Key size={20} style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>WebAuthn Passkey</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>TouchID / FaceID biometric login</p>
                </div>
              </div>
              <span className="glass-pill badge-trust-high" style={{ fontSize: '0.7rem' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Data Governance & Export Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Data Governance & Compliance (GDPR)
          </span>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleExport}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 168, 132, 0.15)',
                color: 'var(--accent-whatsapp)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {exported ? <CheckCircle2 size={18} /> : <Download size={18} />}
              {exported ? 'Encrypted Archive Exported!' : 'Export My Encrypted Data Archive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

