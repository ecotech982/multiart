import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw, Eye, EyeOff, Trash2, ShieldCheck } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey, clearGeminiApiKey, testGeminiApiKey, getApiKeySource } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [keySource, setKeySource] = useState<'local_storage' | 'environment' | 'none'>('none');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKey = getGeminiApiKey();
      setApiKey(currentKey);
      setKeySource(getApiKeySource());
      setTestResult(null);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      clearGeminiApiKey();
      setKeySource('none');
      setIsSaved(true);
      setTestResult({ success: false, message: 'Kunci lokal dihapus. Sistem menggunakan mode tanpa kunci atau default env.' });
    } else {
      saveGeminiApiKey(apiKey);
      setKeySource('local_storage');
      setIsSaved(true);
      setTestResult({ success: true, message: 'Kunci API Gemini lokal berhasil disimpan di browser Anda.' });
    }

    if (onKeyUpdated) onKeyUpdated();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClear = () => {
    clearGeminiApiKey();
    setApiKey('');
    setKeySource(getApiKeySource());
    setTestResult({ success: true, message: 'Kunci lokal berhasil dihapus dari browser.' });
    if (onKeyUpdated) onKeyUpdated();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testGeminiApiKey(apiKey);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Terjadi kesalahan saat menguji kunci.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div id="gemini-api-key-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="gemini-api-key-container"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">API Key Google Gemini Lokal</h3>
              <p className="text-xs text-orange-100 font-medium">Konfigurasi kunci langsung di perangkat Anda</p>
            </div>
          </div>
          <button 
            id="close-api-key-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Kunci Aktif */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${keySource !== 'none' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Status Kunci</span>
                <span className="text-sm font-bold text-stone-900">
                  {keySource === 'local_storage' && 'Kunci Lokal Browser Aktif'}
                  {keySource === 'environment' && 'Kunci Environment (.env) Terdeteksi'}
                  {keySource === 'none' && 'Belum Ada Kunci Terpasang'}
                </span>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${keySource !== 'none' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
              {keySource !== 'none' ? 'Tersambung' : 'Siap Konfigurasi'}
            </span>
          </div>

          {/* Form Input Kunci */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Kunci API Google Gemini (AI Studio)
            </label>
            <div className="relative flex items-center">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3.5 pr-20 text-sm font-mono text-stone-900 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-stone-400 hover:text-stone-600 rounded-xl transition-colors"
                  title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 text-rose-400 hover:text-rose-600 rounded-xl transition-colors"
                    title="Hapus Kunci Lokal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Keamanan & Catatan Privasi */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold block">Privasi & Penyimpanan Lokal:</span>
              <p className="text-amber-800">
                Kunci Anda disimpan secara lokal di memori peramban Anda (Local Storage) dan digunakan langsung untuk berkomunikasi dengan Google Gemini API resmi (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">gemini-3.8-flash</code> & <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">gemini-3.1-flash-lite-image</code>). Kunci tidak dibagikan ke server lain.
              </p>
            </div>
          </div>

          {/* Hasil Tes Koneksi */}
          {testResult && (
            <div 
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <span className="font-bold block">{testResult.success ? 'Koneksi Berhasil' : 'Pemberitahuan'}</span>
                <p>{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Panduan dapatkan kunci */}
          <div className="text-xs text-stone-500 flex items-center justify-between pt-2">
            <span>Belum memiliki API Key Gemini?</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
            >
              Dapatkan di Google AI Studio
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-3 justify-end">
          <button
            id="test-gemini-connection-btn"
            type="button"
            onClick={handleTest}
            disabled={testing || !apiKey.trim()}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-300 hover:border-stone-400 bg-white font-bold text-stone-700 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-95"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin text-orange-500" /> : <RefreshCw className="w-4 h-4 text-stone-500" />}
            {testing ? 'Menguji Koneksi...' : 'Uji Koneksi'}
          </button>

          <button
            id="save-gemini-key-btn"
            type="button"
            onClick={handleSave}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-white ${
              isSaved 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSaved ? 'Tersimpan!' : 'Simpan Kunci Lokal'}
          </button>
        </div>
      </div>
    </div>
  );
};
