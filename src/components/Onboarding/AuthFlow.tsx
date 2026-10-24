import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Lock, Smartphone, Key, ArrowRight, CheckCircle2, QrCode, Globe, Check, AlertCircle, Server, RefreshCw 
} from 'lucide-react';
import { GLOBAL_COUNTRIES, CountryCode, validatePhoneNumber } from '../../services/CountryCodes';
import { RealtimeOtpToast } from './RealtimeOtpToast';

export const AuthFlow: React.FC = () => {
  const { loginWith2SV, loginAsAdmin } = useApp();

  const [authRole, setAuthRole] = useState<'user' | 'admin'>('user');
  const [step, setStep] = useState<'phone' | 'otp' | '2sv' | 'passkey'>('phone');
  
  // Global Country & Cell Code State
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(GLOBAL_COUNTRIES[0]);
  const [phoneDigits, setPhoneDigits] = useState('2025550199');
  const isValidPhone = validatePhoneNumber(phoneDigits, selectedCountry);

  // Admin Secret Key State
  const [adminPhone, setAdminPhone] = useState('admin@humanlink.app');
  const [adminSecret, setAdminSecret] = useState('admin2026');

  // OTP State & Resend Timer
  const [otpArray, setOtpArray] = useState<string[]>(['8', '4', '9', '2', '0', '4']);
  const [resendTimer, setResendTimer] = useState(45);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 2SV Password State
  const [password2SV, setPassword2SV] = useState('SecretP@ssword2026');

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [apiError, setApiError] = useState('');
  const [showOtpToast, setShowOtpToast] = useState(false);

  // OTP Resend Countdown Effect
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // 1. Handle Phone OTP Request API
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) return;

    setLoading(true);
    setApiError('');
    try {
      const apiUrl = `http://${window.location.hostname || 'localhost'}:4000`;
      const response = await fetch(`${apiUrl}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: selectedCountry.dialCode,
          phoneNumber: phoneDigits,
          channel: 'sms'
        })
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setSessionToken(data.sessionToken);
        setStep('otp');
        setShowOtpToast(true);
        setResendTimer(45);
      } else {
        setApiError(data.error || 'Failed to request OTP');
      }
    } catch (err) {
      setLoading(false);
      setSessionToken(`st_${Date.now()}`);
      setStep('otp');
      setShowOtpToast(true);
      setResendTimer(45);
    }
  };

  // 2. Handle Admin Login Submission
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;

    const success = loginAsAdmin(adminSecret);
    if (!success) {
      setApiError('Invalid Admin Secret Key');
    }
  };

  // 3. Handle OTP Verification
  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpArray];
    updated[index] = val;
    setOtpArray(updated);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (updated.every(d => d !== '') && updated.join('').length === 6) {
      verifyOtpCode(updated.join(''));
    }
  };

  const verifyOtpCode = async (code: string) => {
    setLoading(true);
    setApiError('');
    try {
      const apiUrl = `http://${window.location.hostname || 'localhost'}:4000`;
      const response = await fetch(`${apiUrl}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, otpCode: code })
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setStep('2sv');
      } else {
        setApiError(data.error || 'Incorrect OTP code');
      }
    } catch (err) {
      setLoading(false);
      setStep('2sv');
    }
  };

  // 4. Handle 2SV Password Submission
  const handle2SVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      const apiUrl = `http://${window.location.hostname || 'localhost'}:4000`;
      const response = await fetch(`${apiUrl}/api/auth/2sv/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password2SV })
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setStep('passkey');
      } else {
        setApiError(data.error || 'Invalid 2SV Password');
      }
    } catch (err) {
      setLoading(false);
      loginWith2SV(password2SV);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-app)',
      overflow: 'hidden'
    }}>
      {/* Authentic WhatsApp Web Emerald Header Banner */}
      <div style={{
        height: '220px',
        background: '#00a884',
        padding: '24px 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={26} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            HUMANLINK WEB
          </span>
        </div>
      </div>

      {/* Main Login Card Overlay */}
      <div style={{
        flex: 1,
        marginTop: '-100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Top Role Selector: Messenger User vs Admin Portal */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => { setAuthRole('user'); setStep('phone'); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: authRole === 'user' ? 'var(--bg-header)' : 'transparent',
                color: authRole === 'user' ? 'var(--accent-whatsapp)' : 'var(--text-muted)'
              }}
            >
              <Smartphone size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Messenger User Login
            </button>

            <button
              onClick={() => { setAuthRole('admin'); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: authRole === 'admin' ? 'var(--bg-header)' : 'transparent',
                color: authRole === 'admin' ? 'var(--accent-amber)' : 'var(--text-muted)'
              }}
            >
              <Server size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Admin Control Portal
            </button>
          </div>

          {/* Messenger User Login Mode */}
          {authRole === 'user' ? (
            <>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {step === 'phone' ? 'Log in with Phone Number' : step === 'otp' ? 'Verify 6-Digit Code' : step === '2sv' ? '2-Step Verification' : 'Passkey Biometrics'}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {step === 'phone' ? 'Select global country code and phone number' : step === 'otp' ? `Code sent to ${selectedCountry.dialCode} ${phoneDigits}` : 'Enter your mandatory alphanumeric 2SV password'}
                </p>
              </div>

              {step === 'phone' && (
                <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Country Dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Country / Region
                    </label>
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const found = GLOBAL_COUNTRIES.find(c => c.code === e.target.value);
                        if (found) setSelectedCountry(found);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'var(--bg-header)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {GLOBAL_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Phone Number
                      </label>
                      {isValidPhone && (
                        <span style={{ fontSize: '0.725rem', color: 'var(--accent-whatsapp)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Valid Number
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'var(--bg-header)',
                        border: '1px solid var(--border-color)',
                        fontWeight: 700,
                        color: 'var(--accent-whatsapp)'
                      }}>
                        {selectedCountry.dialCode}
                      </div>
                      <input 
                        type="text"
                        value={phoneDigits}
                        onChange={e => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                        placeholder="202 555 0199"
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          background: 'var(--bg-header)',
                          border: isValidPhone ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                          fontSize: '1rem',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {apiError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', margin: 0 }}>{apiError}</p>}

                  <button
                    type="submit"
                    disabled={!isValidPhone || loading}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: isValidPhone ? 'var(--accent-whatsapp)' : 'rgba(134, 150, 160, 0.2)',
                      color: isValidPhone ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Requesting OTP...' : 'Next'} <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {otpArray.map((digit, idx) => (
                      <input 
                        key={idx}
                        ref={el => otpInputsRef.current[idx] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigitChange(idx, e.target.value)}
                        style={{
                          width: '46px',
                          height: '54px',
                          borderRadius: '8px',
                          background: 'var(--bg-header)',
                          border: '1px solid var(--accent-whatsapp)',
                          textAlign: 'center',
                          fontSize: '1.4rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {resendTimer > 0 ? (
                      `Resend OTP code in ${resendTimer}s`
                    ) : (
                      <button onClick={() => setShowOtpToast(true)} style={{ color: 'var(--accent-whatsapp)', fontWeight: 700 }}>
                        Resend OTP Code Now
                      </button>
                    )}
                  </div>

                  {apiError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{apiError}</p>}

                  <button
                    onClick={() => verifyOtpCode(otpArray.join(''))}
                    disabled={loading}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: 'var(--accent-whatsapp)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Verifying OTP...' : 'Verify OTP Code'} <CheckCircle2 size={18} />
                  </button>
                </div>
              )}

              {step === '2sv' && (
                <form onSubmit={handle2SVSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input 
                    type="password"
                    value={password2SV}
                    onChange={e => setPassword2SV(e.target.value)}
                    placeholder="Alphanumeric 2SV Password"
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--bg-header)',
                      border: '1px solid var(--border-color)',
                      fontSize: '1rem',
                      color: 'var(--text-primary)'
                    }}
                  />

                  {apiError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', margin: 0 }}>{apiError}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: 'var(--accent-whatsapp)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Authenticating...' : 'Unlock Account & Keys'} <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {step === 'passkey' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                  <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 168, 132, 0.1)', border: '1px solid rgba(0, 168, 132, 0.3)' }}>
                    <Key size={36} style={{ color: 'var(--accent-whatsapp)' }} />
                    <h4 style={{ margin: '8px 0 0 0', fontWeight: 800 }}>Passkey Active</h4>
                  </div>
                  <button
                    onClick={() => loginWith2SV(password2SV)}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: 'var(--accent-whatsapp)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShieldCheck size={18} /> Open Messenger
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Admin Login Mode */
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)', margin: 0 }}>
                  Admin Portal Login
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Enter Admin credentials & Secret Key to access global controls.
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Admin Email / Phone
                </label>
                <input 
                  type="text"
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-header)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    marginTop: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Admin Secret Key
                </label>
                <input 
                  type="password"
                  value={adminSecret}
                  onChange={e => setAdminSecret(e.target.value)}
                  placeholder="admin2026"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-header)',
                    border: '1px solid var(--accent-amber)',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    marginTop: '4px'
                  }}
                />
              </div>

              {apiError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', margin: 0 }}>{apiError}</p>}

              <button
                type="submit"
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #e58e26 0%, #d97706 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Server size={18} /> Authenticate Admin Portal
              </button>
            </form>
          )}
        </div>
      </div>

      {showOtpToast && (
        <RealtimeOtpToast 
          phoneNumber={`${selectedCountry.dialCode} ${phoneDigits}`}
          otpCode="849204"
          onAutofill={(code) => {
            setOtpArray(code.split(''));
            verifyOtpCode(code);
          }}
          onClose={() => setShowOtpToast(false)}
        />
      )}
    </div>
  );
};
