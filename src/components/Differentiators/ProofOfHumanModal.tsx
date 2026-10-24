import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const ProofOfHumanModal: React.FC = () => {
  const { activeModal, closeModal, activeProofChallenge, solveProofOfHuman } = useApp();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (activeModal !== 'proof_of_human') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null) return;

    const success = solveProofOfHuman(activeProofChallenge.challengeId, selectedOption);
    if (success) {
      setResultMessage('Proof of Human Verified! Sender unlocked for standard messaging.');
      setTimeout(() => {
        setResultMessage(null);
        closeModal();
      }, 1500);
    } else {
      setResultMessage('Incorrect pattern answer. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={26} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Proof-of-Human Challenge</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Interactive bot-throttling test required for unknown senders.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            {activeProofChallenge.question}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeProofChallenge.options.map((opt, idx) => (
              <label 
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedOption === idx ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: selectedOption === idx ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <input 
                  type="radio" 
                  name="proof_option" 
                  checked={selectedOption === idx} 
                  onChange={() => setSelectedOption(idx)} 
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          {resultMessage && (
            <div style={{
              fontSize: '0.8rem',
              color: resultMessage.includes('Verified') ? 'var(--accent-primary)' : 'var(--accent-rose)',
              textAlign: 'center',
              fontWeight: 600
            }}>
              {resultMessage}
            </div>
          )}

          <button type="submit" style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} /> Submit Challenge Response
          </button>
        </form>
      </div>
    </div>
  );
};
