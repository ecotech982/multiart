
import React, { useState } from 'react';
import { Download, Share2, RefreshCw, Eye, Check, X, Maximize2 } from 'lucide-react';

interface ImageDisplayProps {
  url: string;
  loading: boolean;
  onRefresh: () => void;
  title?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ url, loading, onRefresh, title = 'Karya MultiArt' }) => {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `multiart-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      // If data URL, try to copy or share
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl shadow-orange-500/5 overflow-hidden flex flex-col sticky top-8 transition-all">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></span>
            <span className="font-display font-semibold text-xs text-stone-700 tracking-wider uppercase">
              Kanvas Pratinjau
            </span>
          </div>
          {url && !loading && (
            <button 
              onClick={() => setIsZoomed(true)}
              className="text-xs font-semibold text-stone-500 hover:text-orange-600 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Perbesar
            </button>
          )}
        </div>

        {/* Canvas Display View */}
        <div className="aspect-square w-full bg-stone-50 relative flex items-center justify-center p-4 group overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-stone-400 p-8 text-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-7 h-7 text-orange-600" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-xl animate-pulse"></div>
              </div>
              <div>
                <p className="font-display text-base font-bold text-stone-800">
                  Merender Karya Seni...
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-[240px]">
                  MultiArt Studio sedang memproses detail visual resolusi tinggi.
                </p>
              </div>
            </div>
          ) : url ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={url} 
                alt="MultiArt Generated Result" 
                className="w-full h-full object-contain rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-[1.01]" 
              />
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-2xl cursor-zoom-in"
                aria-label="Lihat Layar Penuh"
              >
                <span className="bg-white/95 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-500" />
                  Buka Tampilan Penuh
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center px-8 py-12 flex flex-col items-center">
              <div className="w-18 h-18 bg-white border border-stone-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-stone-400">
                <svg className="w-8 h-8 text-orange-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-display text-base font-bold text-stone-800">
                Kanvas Masih Kosong
              </p>
              <p className="text-xs mt-1.5 text-stone-500 max-w-[260px] leading-relaxed">
                Pilih gaya dan ketik ide Anda di sebelah kiri, lalu tekan tombol buat untuk memvisualisasikan karya.
              </p>
            </div>
          )}
        </div>
        
        {/* Action Controls Bar */}
        {url && !loading && (
          <div className="p-5 bg-white border-t border-stone-100 flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Simpan Karya (HD)
            </button>
            
            <button
              onClick={handleCopy}
              className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 rounded-xl transition-colors relative"
              title="Salin Data Gambar"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={onRefresh}
              className="p-3 bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200/80 hover:border-orange-200 rounded-xl transition-all"
              title="Render Variasi Baru"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isZoomed && url && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <div className="absolute top-0 right-0 -mt-12 flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-lg"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh HD
              </button>
              <button
                onClick={() => setIsZoomed(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={url} 
              alt="Preview Full" 
              className="max-h-[82vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/60 text-xs mt-3 text-center">
              Dihasilkan oleh MultiArt Creative Studio
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;

