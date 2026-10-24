import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Server, Users, ShieldAlert, Activity, CheckCircle2, UserX, UserCheck, Zap, Edit, Lock, RefreshCw, X, ArrowLeft 
} from 'lucide-react';
import { MOCK_USERS } from '../../services/MockData';
import { User, ReputationTier } from '../../types';

export const AdminConsolePage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { updateUserByAdmin, isAdmin } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'spam_logs' | 'infra'>('users');
  const [userList, setUserList] = useState<User[]>(Object.values(MOCK_USERS));
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const [spamLogs, setSpamLogs] = useState([
    {
      id: 'log_01',
      sender: '+44 7700 900077',
      text: 'URGENT: Claim $5,000 crypto bonus at http://paypa1-security-claim.com',
      riskScore: 0.94,
      reason: 'Spoofed homoglyph domain: paypa1 + Urgency keyword',
      status: 'flagged'
    },
    {
      id: 'log_02',
      sender: '+234 803 123 4567',
      text: 'Incoming WebRTC Video Call',
      riskScore: 0.84,
      reason: 'Deepfake synthetic voice clone risk flag (84% confidence)',
      status: 'flagged'
    }
  ]);

  const toggleUserSuspend = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isBlocked;
        setActionSuccess(`User ${u.displayName} ${nextState ? 'suspended' : 're-activated'}`);
        setTimeout(() => setActionSuccess(''), 2000);
        return { ...u, isBlocked: nextState };
      }
      return u;
    }));
  };

  const handleSaveUserEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserByAdmin(editingUser.id, editingUser);
    setUserList(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    setActionSuccess(`Admin updated user ${editingUser.displayName} details in real-time!`);
    setTimeout(() => setActionSuccess(''), 2500);
  };

  const resolveSpamLog = (logId: string) => {
    setSpamLogs(prev => prev.filter(l => l.id !== logId));
    setActionSuccess('Spam pattern confirmed & added to global blacklist!');
    setTimeout(() => setActionSuccess(''), 2000);
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      background: 'var(--bg-chat)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Admin Console Top Header */}
      <div style={{
        height: '90px',
        background: 'var(--bg-header)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onClose} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={22} style={{ color: 'var(--accent-amber)' }} /> HumanLink Admin Control Portal
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {isAdmin ? 'Authenticated as Admin. Full edit & suspension controls active.' : 'Admin Access Required'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-sidebar)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.825rem',
              fontWeight: 700,
              background: activeTab === 'users' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
              color: activeTab === 'users' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)'
            }}
          >
            Users ({userList.length})
          </button>

          <button
            onClick={() => setActiveTab('spam_logs')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.825rem',
              fontWeight: 700,
              background: activeTab === 'spam_logs' ? 'rgba(234, 134, 143, 0.2)' : 'transparent',
              color: activeTab === 'spam_logs' ? '#ea868f' : 'var(--text-secondary)'
            }}
          >
            Spam Queue ({spamLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('infra')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.825rem',
              fontWeight: 700,
              background: activeTab === 'infra' ? 'rgba(83, 189, 235, 0.2)' : 'transparent',
              color: activeTab === 'infra' ? '#53bdeb' : 'var(--text-secondary)'
            }}
          >
            Telemetry & SLAs
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '12px 28px', background: 'rgba(0, 168, 132, 0.2)', color: 'var(--accent-whatsapp)', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {actionSuccess}
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '960px', margin: '24px auto', width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* TAB 1: User Management Table */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Registered Network Users & Admin Edit Controls</h3>

            <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-sidebar)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>User / Phone</th>
                    <th style={{ padding: '12px 16px' }}>Trust Score</th>
                    <th style={{ padding: '12px 16px' }}>Reputation Tier</th>
                    <th style={{ padding: '12px 16px' }}>Security Status</th>
                    <th style={{ padding: '12px 16px' }}>Admin Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={u.avatar} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.displayName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phoneNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`glass-pill ${u.trustScore > 60 ? 'badge-trust-high' : 'badge-scam-high'}`}>
                          {u.trustScore}/100
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>Tier {u.reputationTier}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '0.75rem', color: u.isBlocked ? '#ea868f' : 'var(--accent-whatsapp)', fontWeight: 600 }}>
                          {u.isBlocked ? 'SUSPENDED' : '2SV Active'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setEditingUser(u)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'rgba(83, 189, 235, 0.2)',
                              color: '#53bdeb',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit size={14} /> Edit
                          </button>

                          <button
                            onClick={() => toggleUserSuspend(u.id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: u.isBlocked ? 'rgba(0, 168, 132, 0.2)' : 'rgba(234, 134, 143, 0.2)',
                              color: u.isBlocked ? 'var(--accent-whatsapp)' : '#ea868f',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {u.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                            {u.isBlocked ? 'Re-activate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Anti-Spam Queue */}
        {activeTab === 'spam_logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ea868f' }}>
              Real-Time Anti-Spam & Scam Audit Queue
            </h3>
            {spamLogs.map(log => (
              <div key={log.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)', border: '1px solid rgba(234, 134, 143, 0.3)' }}>
                <div style={{ fontWeight: 700 }}>Sender: {log.sender}</div>
                <div style={{ fontSize: '0.85rem', margin: '4px 0', background: 'var(--bg-header)', padding: '8px', borderRadius: '6px' }}>{log.text}</div>
                <button onClick={() => resolveSpamLog(log.id)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(234, 134, 143, 0.3)', color: '#ea868f', fontSize: '0.75rem', fontWeight: 700, marginTop: '6px' }}>
                  Confirm Block & Blacklist
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Telemetry */}
        {activeTab === 'infra' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WebSocket Gateways</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-whatsapp)' }}>24 Nodes</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PostgreSQL Latency</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#53bdeb' }}>2.1 ms</div>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN EDIT USER MODAL */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(12, 19, 23, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Admin Control: Edit {editingUser.displayName}
            </h3>

            <form onSubmit={handleSaveUserEdits} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Display Name</label>
                <input 
                  type="text" 
                  value={editingUser.displayName}
                  onChange={e => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-header)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={editingUser.phoneNumber}
                  onChange={e => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-header)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Trust Graph Score: <strong>{editingUser.trustScore}/100</strong>
                </label>
                <input 
                  type="range" min={0} max={100} value={editingUser.trustScore}
                  onChange={e => setEditingUser({ ...editingUser, trustScore: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Reputation Tier</label>
                <select
                  value={editingUser.reputationTier}
                  onChange={e => setEditingUser({ ...editingUser, reputationTier: parseInt(e.target.value) as ReputationTier })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-header)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                >
                  <option value={0}>Tier 0 (New / Low Trust)</option>
                  <option value={1}>Tier 1 (Standard User)</option>
                  <option value={2}>Tier 2 (High Trust)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--accent-whatsapp)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginTop: '10px'
                }}
              >
                Save Admin Edits Realtime
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
