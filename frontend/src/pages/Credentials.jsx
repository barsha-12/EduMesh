import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

export default function Credentials() {
  const { studentId } = useParams();
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState([]);
  const [verifying, setVerifying] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, [studentId]);

  const loadCredentials = async () => {
    try {
      const res = await api.get(`/credential/student/${studentId}`);
      setCredentials(res.data.data || []);
    } catch (e) {
      console.error('Failed to load credentials:', e);
    }
    setLoading(false);
  };

  const handleVerify = async (credId) => {
    setVerifying(credId);
    try {
      const res = await api.get(`/credential/verify/${credId}`);
      alert(res.data.data.valid ? '✅ Credential verified on chain!' : '❌ Verification failed');
    } catch {
      alert('Verification service unavailable');
    }
    setVerifying(null);
  };

  const verifyUrl = (credId) => `${window.location.origin}/api/credential/verify/${credId}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-400 to-accent-400 animate-pulse-soft" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl shadow-lg">
            🏆
          </div>
          <h1 className="text-xl font-display font-bold">{t('credential.title')}</h1>
        </div>
      </header>

      <main className="page-container animate-fade-in">
        <h2 className="text-3xl font-display font-bold mb-8">{t('credential.title')} 🎖️</h2>

        {credentials.length === 0 ? (
          <div className="glass-card text-center py-16">
            <p className="text-5xl mb-4">🎓</p>
            <p className="text-xl font-semibold text-surface-600 mb-2">No credentials yet</p>
            <p className="text-surface-500">Complete courses to earn verifiable learning credentials</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((cred) => (
              <div key={cred.id} className="glass-card relative overflow-hidden group">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-400/20 to-transparent rounded-bl-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{cred.subject}</h3>
                      <p className="text-sm text-surface-500">{cred.level}</p>
                    </div>
                    <span className={`chip text-xs ${cred.txHash ? 'chip-success' : 'bg-yellow-100 text-yellow-700'}`}>
                      {cred.txHash ? t('credential.verified') : t('credential.pending')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-surface-500 mb-4">
                    <span>📅 {new Date(cred.issuedAt).toLocaleDateString()}</span>
                    {cred.txHash && <span>⛓️ {cred.txHash.slice(0, 10)}...</span>}
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center p-4 bg-white rounded-xl mb-4">
                    <QRCodeSVG value={verifyUrl(cred.id)} size={120} bgColor="white" fgColor="#082749" />
                  </div>

                  <button
                    onClick={() => handleVerify(cred.id)}
                    disabled={verifying === cred.id}
                    className="btn-primary w-full text-sm"
                  >
                    {verifying === cred.id ? t('common.loading') : t('credential.verifyOnChain')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
