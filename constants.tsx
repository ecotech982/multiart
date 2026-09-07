
import React from 'react';
import { 
  Paintbrush, 
  Layers, 
  UserCheck, 
  LayoutGrid, 
  Scaling, 
  Eraser, 
  GraduationCap, 
  Tv, 
  Sliders, 
  Clock 
} from 'lucide-react';
import { Feature, AspectRatio } from './types';

export const FEATURES: Feature[] = [
  {
    id: 'generate',
    title: 'Kreasi Visual',
    description: 'Eksplorasi imajinasi menjadi karya seni visual resolusi tinggi dengan estetika sunset.',
    icon: <Paintbrush className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-orange-500 to-amber-500'
  },
  {
    id: 'logo',
    title: 'Desain Logo',
    description: 'Logo vektor modern, tipografi berkelas, dan identitas brand yang elegan.',
    icon: <Layers className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-orange-600 to-rose-600'
  },
  {
    id: 'thumbnail',
    title: 'YouTube Cover',
    description: 'Cover video dengan visual storytelling tajam untuk rasio klik (CTR) tinggi.',
    icon: <Tv className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-rose-500 to-orange-600'
  },
  {
    id: 'mascot',
    title: 'Karakter & Maskot',
    description: 'Ciptakan karakter orisinal dengan visual bersih dan ekspresi dinamis.',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-amber-500 to-orange-600'
  },
  {
    id: 'resize',
    title: 'Ekspansi Kanvas',
    description: 'Perluas latar foto secara alami (Outpainting) untuk berbagai format media.',
    icon: <Scaling className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-stone-800 to-orange-900'
  },
  {
    id: 'remove-object',
    title: 'Hapus Objek',
    description: 'Bersihkan latar belakang dari gangguan dengan teknik inpainting presisi.',
    icon: <Eraser className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-orange-500 to-red-500'
  },
  {
    id: 'watermark',
    title: 'Restorasi & Retouch',
    description: 'Hapus watermark teks/logo serta tingkatkan ketajaman visual gambar.',
    icon: <Sliders className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-stone-700 to-stone-900'
  },
  {
    id: 'graduation',
    title: 'Potret Wisuda',
    description: 'Sentuhan toga akademik dan pencahayaan studio mewah pada foto Anda.',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-stone-900 to-orange-950'
  },
  {
    id: 'age',
    title: 'Transformasi Usia',
    description: 'Simulasikan usia masa muda atau masa depan dengan struktur wajah realistis.',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-amber-600 to-orange-700'
  },
  {
    id: 'collage',
    title: 'Kolase Multi-Frame',
    description: 'Komposisi 4 foto dalam kanvas artistik dengan tata letak geometris rapi.',
    icon: <LayoutGrid className="w-6 h-6" />,
    color: 'bg-gradient-to-br from-orange-400 to-amber-600'
  }
];

export interface SocialPlatform {
  id: string;
  name: string;
  ratio: AspectRatio;
  description: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'ig_post', name: 'Instagram Post', ratio: AspectRatio.SQUARE, description: 'Persegi (1:1)' },
  { id: 'ig_story', name: 'TikTok / Reels / Story', ratio: AspectRatio.PORTRAIT, description: 'Vertikal Penuh (9:16)' },
  { id: 'yt_thumb', name: 'YouTube / Desktop', ratio: AspectRatio.LANDSCAPE, description: 'Layar Lebar (16:9)' },
  { id: 'fb_post', name: 'Facebook Post', ratio: AspectRatio.FOUR_THREE, description: 'Standar Feed (4:3)' },
  { id: 'portrait', name: 'Portrait Klasik', ratio: AspectRatio.THREE_FOUR, description: 'Potret Cetak (3:4)' }
];

export const PROMPT_PRESETS: Record<string, { title: string; prompt: string; brand?: string }[]> = {
  generate: [
    { title: 'Golden Sunset City', prompt: 'Pemandangan kota futuristik bernuansa hangat saat golden hour sunset, pantulan cahaya jingga di gedung kaca, detail arsitektur fotorealistik 8k' },
    { title: 'Lukisan Botani Sunset', prompt: 'Komposisi daun monstera dan bunga tropis dalam gaya lukisan cat air hangat, palet oranye sunset dan krem lembut, pencahayaan dramatis' },
    { title: 'Arsitektur Minimalis', prompt: 'Interior villa minimalis bergaya wabi-sabi dengan jendela besar menghadap matahari terbenam oranye, pencahayaan alami sinematik' }
  ],
  logo: [
    { title: 'Kopi & Senja', brand: 'Senja Kopi', prompt: 'Logo minimalis modern siluet cangkir kopi menyatu dengan matahari terbenam, garis bersih elegan, monokrom oranye hangat' },
    { title: 'Studio Arsitek', brand: 'Horizon Design', prompt: 'Monogram geometris inisial H bergaya arsitektural modern, presisi garis minimalis, kemewahan modern' },
    { title: 'Brand Fashion', brand: 'Aura Collective', prompt: 'Lambang mewah bergaya Parisian, tipografi sans-serif berbobot elegan dengan simbol bulat matahari emas minimalis' }
  ],
  thumbnail: [
    { title: 'Tips Finansial', brand: 'Rahasia Finansial Bebas Hutang di Usia 25', prompt: 'Studio pencahayaan sinematik hangat, grafik pertumbuhan holografis neon oranye, latar belakang bokeh kedalaman dramatis' },
    { title: 'Review Gadget', brand: 'Smartphone Flagship Paling Gahar Tahun Ini', prompt: 'Panggung showcase futuristik, spotlight jingga hangat menyorot ke tengah, latar belakang gelap bertekstur elegan' },
    { title: 'Vlog Perjalanan', brand: 'Eksplorasi Keindahan Tersembunyi di Labuan Bajo', prompt: 'Pemandangan kapal phinisi berlayar di laut tenang saat senja oranye keemasan, komposisi sinematik National Geographic' }
  ],
  mascot: [
    { title: 'Rubah Petualang', prompt: 'Karakter maskot rubah lucu mengenakan jaket outdoor oranye dan kacamata aviator, pose ceria ramah, isolasi latar belakang putih bersih' },
    { title: 'Robot Barista', prompt: 'Karakter maskot robot retro yang memegang cangkir kopi hangat, aksen warna oranye sunset dan putih porselen, 3D render Pixar style' },
    { title: 'Kucing Kreator', prompt: 'Maskot kucing kartun 3D mengenakan headphone, memegang stylus pen digital, ekspresi fokus tersenyum, pencahayaan studio lembut' }
  ]
};
