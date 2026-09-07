import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FeatureCard from './components/FeatureCard';
import ImageDisplay from './components/ImageDisplay';
import MultiArtLogo from './components/MultiArtLogo';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AppView, ImageStyle, AspectRatio } from './types';
import { FEATURES, SOCIAL_PLATFORMS, PROMPT_PRESETS } from './constants';
import { generateImage, editImage, suggestThumbnailPrompt, getApiKeySource } from './services/geminiService';
import { 
  Upload, 
  Wand2, 
  Plus, 
  LayoutGrid, 
  Info, 
  Eraser, 
  Zap, 
  ShieldAlert, 
  Menu, 
  Instagram, 
  Tv, 
  Facebook, 
  Smartphone, 
  Image as ImageIcon, 
  RefreshCw,
  Lightbulb,
  History,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Sparkles,
  Key
} from 'lucide-react';

interface HistoryItem {
  id: string;
  url: string;
  view: string;
  title: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestingPrompt, setSuggestingPrompt] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'result' | 'original'>('result');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeySource, setApiKeySource] = useState<'local_storage' | 'environment' | 'none'>('none');

  useEffect(() => {
    setApiKeySource(getApiKeySource());
  }, []);

  // Form states
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.REALISTIC);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [brandName, setBrandName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [collageImages, setCollageImages] = useState<(string | null)[]>([null, null, null, null]);
  const [watermarkAction, setWatermarkAction] = useState<'remove_text' | 'remove_logo' | 'upscale'>('remove_text');
  const [selectedPlatform, setSelectedPlatform] = useState(SOCIAL_PLATFORMS[0].id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const collageInputRefs = [
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null)
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setPreviewMode('original');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCollageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...collageImages];
        newImages[index] = reader.result as string;
        setCollageImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestPrompt = async () => {
    if (!brandName.trim()) {
      setError("Masukkan judul video terlebih dahulu agar studio dapat menganalisis konsep visual.");
      return;
    }
    setSuggestingPrompt(true);
    setError(null);
    try {
      const suggested = await suggestThumbnailPrompt(brandName);
      setPrompt(suggested);
    } catch {
      setError("Gagal mendapatkan saran konsep visual. Silakan coba kembali.");
    } finally {
      setSuggestingPrompt(false);
    }
  };

  const saveToHistory = (imageUrl: string, title: string) => {
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      url: imageUrl,
      view: currentView,
      title: title || 'Karya MultiArt',
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 9)]);
  };

  const resetState = () => {
    setResultImage(null);
    setPrompt('');
    setInstruction('');
    setUploadedImage(null);
    setCollageImages([null, null, null, null]);
    setWatermarkAction('remove_text');
    setBrandName('');
    setError(null);
    setSuggestingPrompt(false);
    setPreviewMode('result');
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
    resetState();
    if (view === 'thumbnail') {
      setRatio(AspectRatio.LANDSCAPE);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalPrompt = prompt;
      let displayTitle = prompt;

      if (currentView === 'logo') {
        finalPrompt = `Professional modern vector logo for "${brandName}". Balanced geometry, sunset orange & warm tones, clean studio minimalism. Style: ${style}. ${prompt}`;
        displayTitle = `Logo: ${brandName}`;
      } else if (currentView === 'mascot') {
        finalPrompt = `Original character mascot, friendly expression, studio lighting. Style: ${style}. Clean white background. ${prompt}`;
        displayTitle = `Maskot: ${prompt.slice(0, 20)}`;
      } else if (currentView === 'thumbnail') {
        finalPrompt = `High-CTR YouTube thumbnail cover for video "${brandName}". Rich sunset lighting, high contrast visual focus: ${prompt}. Professional style: ${style}.`;
        displayTitle = `Cover: ${brandName}`;
      } else {
        finalPrompt = `${prompt}, warm sunset atmosphere, high fidelity, ${style} aesthetic.`;
      }

      const url = await generateImage(finalPrompt, ratio);
      setResultImage(url);
      setPreviewMode('result');
      saveToHistory(url, displayTitle);
    } catch (err: any) {
      setError(err.message || "Gagal memproses visual. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    setError(null);
    try {
      let editInstruction = instruction;
      let targetRatio: AspectRatio | undefined = undefined;
      
      if (currentView === 'resize') {
        const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
        targetRatio = platform?.ratio;
        editInstruction = `Professional outpainting canvas expansion. Realistic surroundings continuation for ${platform?.name} with aspect ratio ${platform?.ratio}. Seamless extension, maintain color balance and sharp subject fidelity.`;
      } else if (currentView === 'watermark') {
        switch(watermarkAction) {
          case 'remove_text':
            editInstruction = `Clean inpainting. Remove all text watermarks and letters seamlessly without blurring original textures.`;
            break;
          case 'remove_logo':
            editInstruction = `Detect and remove branding logos or stamp watermarks, restore underlying background texture cleanly.`;
            break;
          case 'upscale':
            editInstruction = `High-definition image enhancement, clarity restoration, edge sharpening and noise reduction.`;
            break;
        }
      } else if (currentView === 'remove-object') {
        editInstruction = `Carefully remove object: "${instruction}" from photo, fill area with seamless authentic background context.`;
      } else if (currentView === 'graduation') {
        editInstruction = `Professional university graduation portrait with regal academic graduation gown and mortarboard cap. Clean studio backdrop. ${instruction}`;
      } else if (currentView === 'age') {
        editInstruction = `Authentic age progression filter: ${instruction}. Keep facial bone structure and natural appearance.`;
      }

      const url = await editImage(uploadedImage, editInstruction, targetRatio);
      setResultImage(url);
      setPreviewMode('result');
      saveToHistory(url, `Edit: ${FEATURES.find(f => f.id === currentView)?.title}`);
    } catch {
      setError("Gagal memproses foto. Pastikan koneksi stabil dan ukuran file wajar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollage = async () => {
    setLoading(true);
    setError(null);
    try {
      const validImages = collageImages.filter(img => img !== null) as string[];
      if (validImages.length < 2) throw new Error("Silakan unggah minimal 2 foto untuk membuat kolase.");
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 2000;
      const spacing = 40;
      const halfSize = (size - spacing) / 2;
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      const positions = [
        { x: 0, y: 0 }, 
        { x: halfSize + spacing, y: 0 }, 
        { x: 0, y: halfSize + spacing }, 
        { x: halfSize + spacing, y: halfSize + spacing }
      ];

      const loadAndDraw = (src: string, pos: {x: number, y: number}) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const imgRatio = img.width / img.height;
            let drawW, drawH, offsetLeft, offsetTop;
            if (imgRatio > 1) {
              drawH = halfSize; drawW = halfSize * imgRatio;
              offsetLeft = (drawW - halfSize) / 2; offsetTop = 0;
            } else {
              drawW = halfSize; drawH = halfSize / imgRatio;
              offsetLeft = 0; offsetTop = (drawH - halfSize) / 2;
            }
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(pos.x, pos.y, halfSize, halfSize, 40);
            ctx.clip();
            ctx.drawImage(img, pos.x - offsetLeft, pos.y - offsetTop, drawW, drawH);
            ctx.restore();
            resolve();
          };
          img.src = src;
        });
      };

      for (let i = 0; i < validImages.length; i++) {
        await loadAndDraw(validImages[i], positions[i]);
      }
      
      const output = canvas.toDataURL('image/png');
      setResultImage(output);
      setPreviewMode('result');
      saveToHistory(output, 'Kolase 4-Frame');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEditorView = ['resize', 'graduation', 'age', 'remove-object', 'watermark'].includes(currentView);
  const isCollageView = currentView === 'collage';

  const getPlatformIcon = (id: string) => {
    switch(id) {
      case 'ig_post': return <Instagram className="w-5 h-5" />;
      case 'ig_story': return <Smartphone className="w-5 h-5" />;
      case 'yt_thumb': return <Tv className="w-5 h-5" />;
      case 'fb_post': return <Facebook className="w-5 h-5" />;
      default: return <ImageIcon className="w-5 h-5" />;
    }
  };

  const currentPresets = PROMPT_PRESETS[currentView] || [];

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex text-stone-900 selection:bg-orange-500/20 selection:text-orange-950 font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-950/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Mobile App Header */}
        <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-5 py-3.5 sticky top-0 z-30 flex items-center justify-between">
          <MultiArtLogo size="sm" />
          <div className="flex items-center gap-2">
            <button
              id="mobile-api-key-btn"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl border border-orange-200/70 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Kelola API Key Google Gemini Lokal"
            >
              <Key className="w-4 h-4" />
              <span className={`w-1.5 h-1.5 rounded-full ${apiKeySource !== 'none' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
              aria-label="Buka Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {/* Header Title Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/60">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${apiKeySource !== 'none' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  Google Gemini API {apiKeySource === 'local_storage' ? '• Kunci Lokal Aktif' : apiKeySource === 'environment' ? '• Kunci Env Aktif' : '• Siap Konfigurasi'}
                </span>

                <button
                  id="header-manage-api-key-badge-btn"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200 hover:border-orange-200 shadow-sm transition-all active:scale-95"
                >
                  <Key className="w-3 h-3 text-orange-500" />
                  <span>API Key Gemini Lokal</span>
                </button>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
                {currentView === 'home' ? 'Studio Desain & Visual' : FEATURES.find(f => f.id === currentView)?.title}
              </h1>
              <p className="text-stone-500 mt-2 text-sm lg:text-base max-w-2xl leading-relaxed">
                {currentView === 'home' 
                  ? 'Eksplorasi pembuatan grafis berkualitas tinggi dengan nuansa oranye sunset hangat, model Google Gemini resmi, dan alat pengeditan foto profesional.'
                  : FEATURES.find(f => f.id === currentView)?.description
                }
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="workspace-manage-key-btn"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="text-stone-700 hover:text-orange-600 font-semibold text-xs flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-orange-50 rounded-xl border border-stone-200/80 hover:border-orange-200 shadow-sm transition-all active:scale-95"
              >
                <Key className="w-3.5 h-3.5 text-orange-500" />
                <span>Pengaturan API Key</span>
              </button>

              {currentView !== 'home' && (
                <button 
                  onClick={() => handleNavigate('home')} 
                  className="text-stone-600 hover:text-orange-600 font-semibold text-xs flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-orange-50 rounded-xl border border-stone-200/80 hover:border-orange-200 shadow-sm transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>
              )}
            </div>
          </div>

          {/* HOME VIEW */}
          {currentView === 'home' ? (
            <div className="space-y-12">
              {/* Studio Banner Hero */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 md:p-12 text-white shadow-xl shadow-orange-500/15">
                <div className="relative z-10 max-w-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] bg-white/20 px-3 py-1 rounded-full text-white backdrop-blur-sm inline-block mb-4">
                    Palet Sunset Oranye & Putih
                  </span>
                  <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                    Karya Visual Tajam, Tanpa Sentuhan Cliche.
                  </h2>
                  <p className="text-orange-50 text-sm md:text-base leading-relaxed mb-6 font-normal">
                    Dirancang untuk desainer, kreator konten, dan brand yang menginginkan estetika hangat, bersih, dan tampak otentik buatan tangan desainer profesional.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleNavigate('generate')}
                      className="bg-white hover:bg-orange-50 text-orange-600 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center gap-2 hover:scale-[1.02]"
                    >
                      <Wand2 className="w-4 h-4 text-orange-600" />
                      Mulai Kreasi Gambar
                    </button>
                    <button
                      onClick={() => handleNavigate('logo')}
                      className="bg-orange-700/40 hover:bg-orange-700/60 border border-white/30 text-white font-bold px-5 py-3.5 rounded-xl transition-all text-sm backdrop-blur-sm"
                    >
                      Desain Logo Brand
                    </button>
                  </div>
                </div>

                {/* Decorative Geometric Sunset Circles */}
                <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                <div className="absolute right-24 top-8 w-40 h-40 rounded-full border border-white/20 pointer-events-none"></div>
                <div className="absolute right-40 top-16 w-16 h-16 rounded-full bg-amber-300/30 blur-sm pointer-events-none"></div>
              </div>

              {/* Grid of Tools */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-stone-900">
                      Pilihan Studio Kreatif
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Pilih modul kreasi atau pengeditan gambar sesuai kebutuhan proyek Anda
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                    {FEATURES.length} Alat Tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {FEATURES.map((feature) => (
                    <FeatureCard 
                      key={feature.id} 
                      feature={feature} 
                      onClick={() => handleNavigate(feature.id)} 
                    />
                  ))}
                </div>
              </div>

              {/* Session History Carousel (if any) */}
              {history.length > 0 && (
                <div className="pt-4 border-t border-stone-200/60">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-orange-600" />
                      <h3 className="font-display text-lg font-bold text-stone-900">
                        Galeri Sesi Ini
                      </h3>
                    </div>
                    <span className="text-xs text-stone-400">
                      {history.length} karya dihasilkan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {history.map((item) => (
                      <div 
                        key={item.id} 
                        className="group relative bg-white rounded-2xl p-2 border border-stone-200/80 hover:border-orange-300 shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => {
                          setResultImage(item.url);
                          setCurrentView(item.view as AppView);
                        }}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2">
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        </div>
                        <p className="text-xs font-semibold text-stone-800 truncate px-1">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TOOL STUDIO VIEW */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column: Studio Controls Form */}
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 lg:p-8">
                  
                  {/* Quick Preset Inspirations Chip Bar */}
                  {currentPresets.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 mb-2.5 uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5 text-orange-600" />
                        Inspirasi Konsep Cepat
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPrompt(preset.prompt);
                              if (preset.brand) setBrandName(preset.brand);
                            }}
                            className="text-xs bg-white hover:bg-orange-500 hover:text-white text-stone-700 font-medium px-3 py-1.5 rounded-lg border border-orange-200/80 hover:border-orange-500 shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <span>{preset.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collage View */}
                  {isCollageView ? (
                    <div className="space-y-6">
                      <div className="bg-orange-50/60 border border-orange-200/80 p-4 rounded-2xl flex gap-3 text-orange-900 text-sm">
                        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-normal">
                          Gabungkan hingga 4 foto langsung dalam tata letak geometris presisi. Format ini mempertahankan resolusi murni tanpa distorsi.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {collageImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => collageInputRefs[idx].current?.click()} 
                            className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all overflow-hidden relative group"
                          >
                            {img ? (
                              <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-stone-400 group-hover:text-orange-600 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                  <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold">Frame {idx + 1}</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              ref={collageInputRefs[idx]} 
                              onChange={(e) => handleCollageUpload(idx, e)} 
                              className="hidden" 
                              accept="image/*" 
                            />
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={handleCollage} 
                        disabled={loading || collageImages.filter(i => i).length < 2} 
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-stone-200 disabled:to-stone-300 disabled:text-stone-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-98 transition-all"
                      >
                        <LayoutGrid className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Menyusun Tata Letak...' : 'Gabungkan Jadi Kolase HD'}
                      </button>
                    </div>
                  ) : isEditorView ? (
                    /* Editor Views (Resize, Watermark, Remove Object, Graduation, Age) */
                    <div className="space-y-6">
                      <label className="block">
                        <span className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wider">
                          1. Unggah Foto Sumber
                        </span>
                        <div 
                          onClick={() => fileInputRef.current?.click()} 
                          className="border-2 border-dashed border-stone-200 hover:border-orange-400 hover:bg-orange-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all bg-stone-50/50"
                        >
                          {uploadedImage ? (
                            <div className="relative inline-block">
                              <img src={uploadedImage} alt="Uploaded" className="max-h-64 rounded-xl shadow-md mx-auto" />
                              <div className="absolute -top-3 -right-3 bg-orange-500 text-white p-2 rounded-full shadow-lg">
                                <Upload className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3 py-4">
                              <div className="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-stone-800 text-sm">Pilih atau Seret Foto ke Sini</p>
                                <p className="text-xs text-stone-400 mt-1">Mendukung format PNG, JPG, JPEG resolusi tinggi</p>
                              </div>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                      </label>

                      {/* Tool specific controls */}
                      {currentView === 'resize' ? (
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
                            2. Pilih Target Format Ekpansi (Outpainting)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SOCIAL_PLATFORMS.map((platform) => (
                              <button
                                key={platform.id}
                                type="button"
                                onClick={() => setSelectedPlatform(platform.id)}
                                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                                  selectedPlatform === platform.id 
                                    ? 'border-orange-500 bg-orange-50/80 shadow-sm ring-2 ring-orange-500/20' 
                                    : 'border-stone-200 hover:border-orange-200 bg-white'
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  selectedPlatform === platform.id ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600'
                                }`}>
                                  {getPlatformIcon(platform.id)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-bold truncate ${selectedPlatform === platform.id ? 'text-orange-950' : 'text-stone-800'}`}>
                                    {platform.name}
                                  </div>
                                  <div className="text-[10px] text-stone-400 font-medium">
                                    {platform.description}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="bg-orange-50/60 border border-orange-200/60 p-3.5 rounded-2xl flex gap-2.5 text-orange-900 text-xs">
                            <Zap className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                            <p>Sistem studio akan memperluas pemandangan sekitar secara natural tanpa merusak subjek utama Anda.</p>
                          </div>
                        </div>
                      ) : currentView === 'watermark' ? (
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
                            2. Mode Restorasi
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button 
                              type="button"
                              onClick={() => setWatermarkAction('remove_text')} 
                              className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all ${
                                watermarkAction === 'remove_text' 
                                  ? 'border-orange-500 bg-orange-50/80 text-orange-800 shadow-sm ring-2 ring-orange-500/20' 
                                  : 'border-stone-200 hover:border-orange-200 bg-white'
                              }`}
                            >
                              <Eraser className="w-6 h-6 text-orange-600" />
                              <div className="text-center">
                                <span className="text-xs font-bold block text-stone-800">Hapus Teks</span>
                                <span className="text-[10px] text-stone-400">Watermark Tulisan</span>
                              </div>
                            </button>

                            <button 
                              type="button"
                              onClick={() => setWatermarkAction('remove_logo')} 
                              className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all ${
                                watermarkAction === 'remove_logo' 
                                  ? 'border-orange-500 bg-orange-50/80 text-orange-800 shadow-sm ring-2 ring-orange-500/20' 
                                  : 'border-stone-200 hover:border-orange-200 bg-white'
                              }`}
                            >
                              <ShieldAlert className="w-6 h-6 text-orange-600" />
                              <div className="text-center">
                                <span className="text-xs font-bold block text-stone-800">Hapus Logo</span>
                                <span className="text-[10px] text-stone-400">Stempel & Ikon</span>
                              </div>
                            </button>

                            <button 
                              type="button"
                              onClick={() => setWatermarkAction('upscale')} 
                              className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all ${
                                watermarkAction === 'upscale' 
                                  ? 'border-orange-500 bg-orange-50/80 text-orange-800 shadow-sm ring-2 ring-orange-500/20' 
                                  : 'border-stone-200 hover:border-orange-200 bg-white'
                              }`}
                            >
                              <Zap className="w-6 h-6 text-orange-600" />
                              <div className="text-center">
                                <span className="text-xs font-bold block text-stone-800">Restorasi Tajam</span>
                                <span className="text-[10px] text-stone-400">Noise & Detail HD</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="block">
                          <span className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wider">
                            {currentView === 'remove-object' ? '2. Tentukan Objek yang Ingin Dihapus' : '2. Detail Instruksi Modifikasi'}
                          </span>
                          <textarea 
                            value={instruction} 
                            onChange={(e) => setInstruction(e.target.value)} 
                            placeholder={currentView === 'remove-object' ? "Contoh: Orang di latar belakang sebelah kiri, kabel listrik yang melintang, tong sampah di pojok..." : "Instruksi khusus untuk gaya atau preferensi hasil..."} 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-28 text-sm" 
                          />
                        </label>
                      )}

                      <button 
                        onClick={handleEdit} 
                        disabled={loading || !uploadedImage} 
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-stone-200 disabled:to-stone-300 disabled:text-stone-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-98 transition-all"
                      >
                        <Wand2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Sedang Memproses Foto...' : 'Mulai Proses Studio'}
                      </button>
                    </div>
                  ) : (
                    /* Creation Views (Generate, Logo, Thumbnail, Mascot) */
                    <div className="space-y-6">
                      {currentView === 'thumbnail' ? (
                        <>
                          <label className="block">
                            <span className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wider">
                              Judul / Topik Utama Video
                            </span>
                            <input 
                              type="text" 
                              value={brandName} 
                              onChange={(e) => setBrandName(e.target.value)} 
                              placeholder="Contoh: 7 Strategi Rahasia Investasi Saham Pemula" 
                              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm" 
                            />
                          </label>
                          <div className="block">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                Konsep Desain Background
                              </span>
                              <button 
                                type="button"
                                onClick={handleSuggestPrompt}
                                disabled={suggestingPrompt || !brandName.trim()}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200 hover:bg-orange-100 transition-all disabled:opacity-50"
                              >
                                {suggestingPrompt ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
                                {suggestingPrompt ? 'Merancang Konsep...' : 'Bantu Ide Desain'}
                              </button>
                            </div>
                            <textarea 
                              value={prompt} 
                              onChange={(e) => setPrompt(e.target.value)} 
                              placeholder={suggestingPrompt ? "Studio sedang merancang deskripsi visual yang selaras dengan judul Anda..." : "Contoh: Studio pencahayaan hangat golden hour, laptop futuristik dengan grafik neon jingga, bokeh sinematik..."} 
                              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-28 text-sm" 
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {currentView === 'logo' && (
                            <label className="block">
                              <span className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wider">
                                Nama Brand / Bisnis
                              </span>
                              <input 
                                type="text" 
                                value={brandName} 
                                onChange={(e) => setBrandName(e.target.value)} 
                                placeholder="Contoh: Senja Roastery, Solusi Digital, dsb." 
                                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm" 
                              />
                            </label>
                          )}
                          <label className="block">
                            <span className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wider">
                              Deskripsi Visual (Prompt)
                            </span>
                            <textarea 
                              value={prompt} 
                              onChange={(e) => setPrompt(e.target.value)} 
                              placeholder="Ketik deskripsi karya visual yang Anda inginkan..." 
                              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-28 text-sm" 
                            />
                          </label>
                        </>
                      )}

                      {/* Style & Ratio Pickers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
                            Gaya Visual
                          </span>
                          <select 
                            value={style} 
                            onChange={(e) => setStyle(e.target.value as ImageStyle)} 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium"
                          >
                            {Object.values(ImageStyle).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
                            Rasio Kanvas
                          </span>
                          <select 
                            value={ratio} 
                            onChange={(e) => setRatio(e.target.value as AspectRatio)} 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium"
                          >
                            <option value={AspectRatio.SQUARE}>Persegi 1:1 (Post / Avatar)</option>
                            <option value={AspectRatio.LANDSCAPE}>Layar Lebar 16:9 (Desktop / Video)</option>
                            <option value={AspectRatio.PORTRAIT}>Vertikal 9:16 (Story / Reels)</option>
                            <option value={AspectRatio.FOUR_THREE}>Klasik 4:3 (Feed Standar)</option>
                            <option value={AspectRatio.THREE_FOUR}>Potret 3:4 (Studio)</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        onClick={handleGenerate} 
                        disabled={loading || (!prompt.trim() && !brandName.trim())} 
                        className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-stone-200 disabled:to-stone-300 disabled:text-stone-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25 active:scale-98 transition-all"
                      >
                        <Wand2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Studio Sedang Merender...' : (currentView === 'thumbnail' ? 'Buat YouTube Cover' : 'Render Karya Visual')}
                      </button>
                    </div>
                  )}

                  {/* Error Notification */}
                  {error && (
                    <div className="mt-5 p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs font-medium text-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                        <div>
                          <p className="font-bold">Perhatian</p>
                          <p className="mt-0.5">{error}</p>
                        </div>
                      </div>
                      <button
                        id="error-configure-key-btn"
                        type="button"
                        onClick={() => setIsApiKeyModalOpen(true)}
                        className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-200 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <Key className="w-3.5 h-3.5 text-rose-500" />
                        <span>Atur Kunci Gemini Lokal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Display Canvas & Comparison */}
              <div className="xl:col-span-5 space-y-4">
                {/* Comparison Tab in Editor View */}
                {isEditorView && uploadedImage && resultImage && (
                  <div className="bg-white rounded-2xl p-1.5 border border-stone-200/80 flex items-center shadow-xs">
                    <button
                      onClick={() => setPreviewMode('result')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        previewMode === 'result' 
                          ? 'bg-orange-500 text-white shadow-sm' 
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Hasil Studio
                    </button>
                    <button
                      onClick={() => setPreviewMode('original')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        previewMode === 'original' 
                          ? 'bg-stone-800 text-white shadow-sm' 
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Foto Sumber Asli
                    </button>
                  </div>
                )}

                <ImageDisplay 
                  url={(previewMode === 'original' && uploadedImage ? uploadedImage : resultImage) || ''} 
                  loading={loading} 
                  onRefresh={isEditorView ? handleEdit : handleGenerate} 
                />

                {/* Session Mini History for current tool */}
                {history.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Riwayat Pembuatan Sesi Ini
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {history.length} tersimpan
                      </span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {history.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setResultImage(item.url);
                            setPreviewMode('result');
                          }}
                          className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            resultImage === item.url ? 'border-orange-500 ring-2 ring-orange-500/20 scale-105' : 'border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Google Gemini Local API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        onKeyUpdated={() => setApiKeySource(getApiKeySource())} 
      />
    </div>
  );
};

export default App;
