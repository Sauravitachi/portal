'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import {
  Home,
  User,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  CheckCircle2,
  Wallet,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  QrCode,
  Building,
  RotateCcw,
  Check,
  Download,
  Crown,
  Heart,
  Gift,
  Flower2,
  Coins,
  PartyPopper,
  ShieldCheck,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager, SoundProfileType } from './utils/audio';

type TabType = 'dashboard' | 'profile' | 'documents' | 'payments' | 'summary' | 'settings';

interface PaymentItem {
  id: number;
  description: string;
  hindiDescription: string;
  amount: number;
  status: 'Pending' | 'Completed';
  category: 'fee' | 'dd1' | 'dd2';
  ceremonyTag: string;
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 1,
    description: 'Portal Fees',
    hindiDescription: 'शगुन पोर्टल पंजीकरण शुल्क',
    amount: 25000,
    status: 'Pending',
    category: 'fee',
    ceremonyTag: 'Shagun Registration'
  },
  {
    id: 2,
    description: 'GST Fees',
    hindiDescription: 'मंडप एवं सरकारी कर क्लीयरेंस शुल्क',
    amount: 25000,
    status: 'Pending',
    category: 'dd1',
    ceremonyTag: 'Mandap Clearance'
  },
  {
    id: 3,
    description: 'Paypal Fees',
    hindiDescription: 'वैश्विक सेटलमेंट एवं ट्रांजेक्शन शुल्क',
    amount: 25000,
    status: 'Pending',
    category: 'dd2',
    ceremonyTag: 'Settlement Clearance'
  }
];

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'dd'>('upi');
  const [ddNumber, setDdNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShaadiTheme, setIsShaadiTheme] = useState(true);

  const isSoundMuted = useSyncExternalStore(
    soundManager.subscribe.bind(soundManager),
    () => soundManager.getMuted(),
    () => false
  );
  const soundProfile = useSyncExternalStore(
    soundManager.subscribe.bind(soundManager),
    () => soundManager.getSoundProfile(),
    () => 'shadi' as SoundProfileType
  );
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [soundRippleKey, setSoundRippleKey] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Initialize sound manager listener on client load
  useEffect(() => {
    soundManager.attachGlobalSoundListener();
  }, []);

  const playClick = (type: 'click' | 'switch' | 'soft' | 'pop' | 'success' | 'alert' | 'tab' | 'shadi' = 'click') => {
    soundManager.play(type);
    setSoundRippleKey(prev => prev + 1);
  };

  const handleToggleMenu = () => {
    playClick('click');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    }
  };

  const handleSelectTab = (tab: TabType) => {
    playClick('tab');
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundManager.toggleMute();
    if (!muted) {
      soundManager.play('switch');
    }
  };

  const handleChangeProfile = (profile: SoundProfileType) => {
    soundManager.setSoundProfile(profile);
    soundManager.play('pop');
  };

  // Calculate totals
  const totalPayable = payments.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const allCompleted = payments.every(p => p.status === 'Completed');

  const handleOpenPayment = (payment: PaymentItem) => {
    playClick('click');
    setSelectedPayment(payment);
    setDdNumber('');
  };

  const handleCompletePayment = () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    playClick('click');

    setTimeout(() => {
      setPayments(prev =>
        prev.map(p => (p.id === selectedPayment.id ? { ...p, status: 'Completed' } : p))
      );
      setIsProcessing(false);
      setSelectedPayment(null);
      playClick('success');

      // Trigger royal wedding rose petal & gold foil shower
      try {
        confetti({
          particleCount: 160,
          spread: 85,
          origin: { y: 0.58 },
          colors: ['#E11D48', '#D4AF37', '#FFD700', '#F59E0B', '#BE123C', '#FFFDF0', '#10B981']
        });
      } catch {
        // Fallback gracefully
      }
    }, 950);
  };

  const handleResetPayments = () => {
    playClick('switch');
    setPayments(INITIAL_PAYMENTS);
  };

  const navItems = [
    { id: 'dashboard', label: 'Vivah Dashboard', hindi: 'मुख्य पृष्ठ', icon: Home },
    { id: 'profile', label: 'Dulhan Profile', hindi: 'वर-वधू प्रोफाइल', icon: User },
    { id: 'documents', label: 'Shadi Documents', hindi: 'सत्यापित दस्तावेज़', icon: FileText },
    { id: 'payments', label: 'Shagun Clearance', hindi: 'शगुन एवं शुल्क', icon: CreditCard },
    { id: 'summary', label: 'Vivah Summary', hindi: 'लेखा जोखा', icon: BarChart3 },
    { id: 'settings', label: 'Auspicious Settings', hindi: 'सेटिंग्स', icon: Settings }
  ] as const;

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ${
      isShaadiTheme 
        ? 'bg-[#FCF8F2] text-[#2A141A] shadi-silk-texture' 
        : 'bg-[#F4F7FC] text-[#1F2937]'
    }`}>
      {/* Decorative Auspicious Toran Garland Top Ribbon */}
      {isShaadiTheme && (
        <div className="h-1.5 w-full bg-gradient-to-r from-[#881337] via-[#D4AF37] to-[#BE123C] shadow-xs" />
      )}

      {/* ================= TOP NAVBAR ================= */}
      <header className={`h-16 flex items-center justify-between sticky top-0 z-30 select-none transition-all duration-200 ${
        isShaadiTheme 
          ? 'bg-gradient-to-r from-[#580B1E] via-[#6F0E25] to-[#881337] border-b border-[#D4AF37]/50 shadow-md text-white' 
          : 'bg-white border-b border-[#E5E7EB] text-slate-800'
      }`}>
        {/* Left: Royal Brand Logo Block & Hamburger */}
        <div className="flex items-center h-full">
          <div className={`w-auto px-4 sm:w-64 sm:px-6 h-full flex items-center shrink-0 border-r ${
            isShaadiTheme 
              ? 'bg-[#4A0817]/80 border-[#D4AF37]/40' 
              : 'bg-[#0B2559] border-blue-900 text-white'
          }`}>
            <div className="flex items-center gap-2.5">
              {isShaadiTheme ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] flex items-center justify-center text-[#580B1E] shadow-sm shrink-0">
                    <Crown className="w-4 h-4 fill-[#580B1E]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-royal text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#FDE68A] to-[#D4AF37]">
                      SHUBH VIVAH
                    </span>
                    <span className="text-[10px] tracking-widest text-[#FDE68A]/80 font-medium uppercase -mt-0.5">
                      Royal Shadi Suite
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-white text-lg sm:text-xl font-extrabold tracking-wider">
                  PORTAL
                </span>
              )}
            </div>
          </div>

          {/* Hamburger toggle */}
          <button
            onClick={handleToggleMenu}
            className={`p-2 ml-2 sm:ml-4 rounded-lg transition-colors btn-tactile focus:outline-none ${
              isShaadiTheme 
                ? 'hover:bg-white/10 text-[#FDE68A]' 
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" strokeWidth={2.2} />
          </button>

          {/* Auspicious Shadi Greeting Tagline (Desktop) */}
          {isShaadiTheme && (
            <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-black/20 border border-[#D4AF37]/30 text-xs text-[#FDE68A]">
              <Flower2 className="w-3.5 h-3.5 text-[#FDE68A] animate-spin-slow" />
              <span className="font-medium">शुभ विवाह • मांगलिक शगुन एवं भुगतान पोर्टल</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 mr-3 sm:mr-6">
          {/* Quick Shaadi Theme Toggle Button */}
          {/* <button
            onClick={() => {
              playClick('switch');
              setIsShaadiTheme(!isShaadiTheme);
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all btn-tactile ${
              isShaadiTheme
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#4A0817] border-[#FDE68A] shadow-xs'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title="Toggle Shadi Theme"
          > */}
            {/* <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isShaadiTheme ? 'Shaadi Theme' : 'Enable Shaadi Theme'}
            </span>
            <span className="md:hidden">Shadi</span>
          </button> */}

          {/* Audio Click Sound Control Badge */}
          <div className="relative">
            <button
              onClick={() => {
                playClick('switch');
                setShowSoundSettings(!showSoundSettings);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-colors btn-tactile ${
                isShaadiTheme
                  ? 'border-[#D4AF37]/50 bg-black/20 hover:bg-black/30 text-[#FFF5D6]'
                  : 'border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700'
              }`}
              title="Click Sound Settings"
            >
              <Volume2 className={`w-3.5 h-3.5 shrink-0 ${!isSoundMuted ? (isShaadiTheme ? 'text-[#FDE68A]' : 'text-blue-600') : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSoundMuted ? 'Sound Off' : `${soundProfile === 'shadi' ? 'Royal Chime' : soundProfile}`}
              </span>
              <span
                key={soundRippleKey}
                className={`w-2 h-2 rounded-full inline-block ml-0.5 ${
                  isShaadiTheme ? 'bg-[#FDE68A] animate-ping' : 'bg-emerald-500 animate-ping'
                }`}
                title="Audio feedback active"
              />
            </button>

            {/* Sound dropdown menu */}
            {showSoundSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-amber-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B48222]" />
                    UI Audio Engine
                  </span>
                  <button
                    onClick={handleToggleSound}
                    className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1"
                  >
                    {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isSoundMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  Select tactile feedback style:
                </div>
                <div className="space-y-1">
                  {([
                    { id: 'shadi', label: '🪔 Royal Gold & Ghungroo Chimes', desc: 'Auspicious celebratory wedding bell' },
                    { id: 'crisp', label: '⚙️ Crisp Mechanical Click', desc: 'Sharp snappy UI feedback' },
                    { id: 'tactile', label: '📱 Soft Modern Tap', desc: 'Smooth warm haptic pulse' },
                    { id: 'bubble', label: '🫧 Bubble Pop', desc: 'Playful vibrant audio feedback' }
                  ] as const).map(style => (
                    <button
                      key={style.id}
                      onClick={() => handleChangeProfile(style.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        soundProfile === style.id
                          ? 'bg-gradient-to-r from-[#881337] to-[#BE123C] text-white font-medium shadow-xs'
                          : 'hover:bg-amber-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{style.label}</div>
                        <div className={`text-[10px] ${soundProfile === style.id ? 'text-amber-100' : 'text-slate-400'}`}>
                          {style.desc}
                        </div>
                      </div>
                      {soundProfile === style.id && <Check className="w-3.5 h-3.5 text-white ml-2 shrink-0" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => playClick('shadi')}
                  className="mt-3 w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors text-center"
                >
                  🔊 Test Royal Ghungroo Chime
                </button>
              </div>
            )}
          </div>

          {/* User Profile Capsule */}
          <div className="relative">
            <button
              onClick={() => {
                playClick('pop');
                setUserDropdownOpen(!userDropdownOpen);
              }}
              className={`flex items-center gap-1.5 sm:gap-2.5 py-1 px-1.5 sm:px-2 rounded-lg transition-colors btn-tactile focus:outline-none ${
                isShaadiTheme 
                  ? 'hover:bg-white/10 text-white' 
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              {/* User Avatar Circle */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                isShaadiTheme
                  ? 'bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] text-[#4A0817] border-[#FFF5D6]'
                  : 'bg-[#0B57D0] text-white border-blue-400'
              }`}>
                <User className={`w-4 h-4 sm:w-5 sm:h-5 ${isShaadiTheme ? 'text-[#580B1E] fill-[#580B1E]' : 'fill-white text-[#0B57D0]'}`} />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Mrs. Nurullah Tabish
                </span>
                {isShaadiTheme && (
                  <span className="text-[10px] text-[#FDE68A] font-semibold">
                    Dulhan • Royal Beneficiary
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isShaadiTheme ? 'text-[#FDE68A]' : 'text-slate-600'}`} />
            </button>

            {/* Profile Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-amber-200 py-1.5 z-50 text-slate-800">
                <div className="px-4 py-2 border-b border-amber-100 bg-amber-50/50">
                  <p className="text-[11px] text-amber-800 font-medium">Shubh Vivah Applicant</p>
                  <p className="text-sm font-bold text-slate-900 truncate">Mrs. Nurullah Tabish</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      KYC Verified ✓
                    </span>
                    <span className="inline-block text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Shadi Mubarak 🪔
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleSelectTab('profile');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50/70 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-amber-600" />
                  Beneficiary Profile
                </button>
                <button
                  onClick={() => {
                    handleSelectTab('settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50/70 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-amber-600" />
                  Account Settings
                </button>
                <div className="border-t border-amber-100 my-1"></div>
                <button
                  onClick={() => {
                    playClick('alert');
                    setShowLogoutModal(true);
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => {
              playClick('pop');
              setMobileMenuOpen(false);
            }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* ================= LEFT SIDEBAR ================= */}
        <aside
          className={`transition-all duration-200 flex flex-col justify-between py-4 select-none shrink-0 z-40
            fixed inset-y-0 left-0 lg:static h-full
            ${mobileMenuOpen ? 'w-64 translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            ${desktopSidebarOpen ? 'lg:w-64' : 'lg:w-20 lg:overflow-hidden'}
            ${
              isShaadiTheme 
                ? 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8] to-[#FFF9F2] border-r border-[#F0DC9E] shadow-sm' 
                : 'bg-white border-r border-[#E5E7EB]'
            }
          `}
        >
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between px-4 pb-3 mb-2 border-b border-amber-100 lg:hidden">
            <span className="text-sm font-bold text-[#881337] font-royal flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              Shubh Vivah Menu
            </span>
            <button
              onClick={() => {
                playClick('click');
                setMobileMenuOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-amber-100 text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 px-3">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-tactile ${
                    isActive
                      ? isShaadiTheme
                        ? 'bg-gradient-to-r from-[#680E23] to-[#881337] text-[#FFF7D6] shadow-md border-r-4 border-[#D4AF37]'
                        : 'bg-[#EBF3FE] text-[#0B57D0]'
                      : isShaadiTheme
                        ? 'text-stone-700 hover:bg-[#FBE59E]/30 hover:text-[#680E23]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive 
                        ? (isShaadiTheme ? 'text-[#FDE68A]' : 'text-[#0B57D0]') 
                        : (isShaadiTheme ? 'text-[#881337]' : 'text-slate-600')
                    }`}
                  />
                  <div className={`text-left leading-tight ${!desktopSidebarOpen ? 'lg:hidden' : 'inline'}`}>
                    <div>{item.label}</div>
                    {isShaadiTheme && (
                      <div className={`text-[10px] font-normal ${isActive ? 'text-[#FDE68A]/90' : 'text-stone-400'}`}>
                        {item.hindi}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Auspicious Badge in Sidebar */}
          {desktopSidebarOpen && isShaadiTheme && (
            <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200/80 text-center">
              <div className="flex justify-center mb-1">
                <Flame className="w-5 h-5 text-amber-600 diya-flame-anim" />
              </div>
              <p className="text-xs font-bold text-[#881337] font-royal">शादी मुबारक</p>
              <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                शुभ विवाह राशि सेटलमेंट एवं सत्यापन सुरक्षा
              </p>
            </div>
          )}

          {/* Bottom Logout Button */}
          <div className="px-3 pt-3 border-t border-amber-100">
            <button
              onClick={() => {
                playClick('alert');
                setShowLogoutModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-100/60 transition-colors btn-tactile"
            >
              <LogOut className="w-5 h-5 shrink-0 text-rose-600" />
              <span className={`${!desktopSidebarOpen ? 'lg:hidden' : 'inline'}`}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-7">
            {activeTab === 'dashboard' ? (
              <>
                {/* 1. Auspicious Shadi Welcome Header */}
                <div className={`p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                  isShaadiTheme
                    ? 'bg-gradient-to-r from-[#FFFDF9] via-[#FAF3E8] to-[#FFF9F2] border-[#F0DC9E] shadow-sm'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    {/* Royal Gold Avatar with Garland / Crown Accent */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 ${
                      isShaadiTheme
                        ? 'bg-gradient-to-tr from-[#680E23] via-[#881337] to-[#BE123C] text-[#FDE68A] border-[#D4AF37]'
                        : 'bg-[#0B57D0] text-white border-blue-400'
                    }`}>
                      {isShaadiTheme ? (
                        <Crown className="w-8 h-8 text-[#FDE68A]" />
                      ) : (
                        <User className="w-8 h-8 fill-white text-[#0B57D0]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isShaadiTheme ? 'text-[#881337]' : 'text-slate-500'}`}>
                          {isShaadiTheme ? 'शुभ विवाह • मांगलिक स्वागत' : 'Welcome,'}
                        </span>
                      </div>
                      <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${
                        isShaadiTheme ? 'font-serif-luxury text-[#4A0817]' : 'text-slate-900'
                      }`}>
                        Mrs. Nurullah Tabish
                      </h1>
                      <p className="text-xs text-stone-500 font-medium">
                        Applicant ID: <span className="font-mono text-stone-700">APP-2024-88419</span> • Official Shadi Matrimony Suite
                      </p>
                    </div>
                  </div>

                  {/* Auspicious Blessing Tag */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl">
                    <Flame className="w-4 h-4 text-amber-600 diya-flame-anim" />
                    <div>
                      <p className="text-[11px] font-bold text-[#881337]">सदा सौभाग्यवती भव</p>
                      <p className="text-[10px] text-stone-500">Verified Direct Bank Disbursement</p>
                    </div>
                  </div>
                </div>

                {/* 2. Card 1: Final Blessed Amount You Will Get (Shagun Lifafa Style) */}
                <div className={`rounded-2xl border p-5 sm:p-7 md:p-8 relative overflow-hidden transition-all ${
                  isShaadiTheme
                    ? 'shadi-card-luxury shadi-card-glow'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  {/* Decorative Corner Filigree Accent */}
                  {isShaadiTheme && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FDE68A]/30 to-transparent rounded-bl-full pointer-events-none" />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-[#BE123C]/10 to-transparent rounded-tr-full pointer-events-none" />
                    </>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center relative z-10">
                    {/* Left Column: Final Amount & Shagun Blessing */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100 to-rose-100 text-[#881337] border border-amber-200">
                        <Gift className="w-3.5 h-3.5 text-[#B48222]" />
                        <span>शुभ शगुन राशि • Blessed Disbursement Amount</span>
                      </div>

                      <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-2">
                        <span className={isShaadiTheme ? 'text-[#881337] font-serif-luxury' : 'text-[#0B57D0]'}>
                          ₹ 4,90,000
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                        Rupees Four Lakhs Ninety Thousand Only <span className="text-[#881337] font-semibold">(चार लाख नब्बे हज़ार रुपये)</span>
                      </p>

                      <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Government & Matrimony Settlement Guaranteed Payout</span>
                      </div>
                    </div>

                    {/* Right Column: Shagun Lifafa / Auspicious Envelope Highlight */}
                    <div className={`flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border ${
                      isShaadiTheme
                        ? 'bg-gradient-to-br from-[#FFF9EE] via-[#FFF3DD] to-[#FDE8BF] border-[#E5C365]/80 shadow-inner'
                        : 'bg-blue-50 border-blue-100'
                    }`}>
                      {/* Shagun Lifafa / Gold Coin Icon Circle */}
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md border ${
                        isShaadiTheme
                          ? 'bg-gradient-to-tr from-[#680E23] to-[#9F1239] text-[#FDE68A] border-[#D4AF37]'
                          : 'bg-[#EBF3FE] text-[#0B57D0] border-blue-200'
                      }`}>
                        {isShaadiTheme ? (
                          <Coins className="w-9 h-9 text-[#FDE68A]" />
                        ) : (
                          <Wallet className="w-9 h-9 text-[#0B57D0]" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-stone-800 font-semibold leading-snug">
                          {isShaadiTheme 
                            ? 'तीनों शगुन शुल्क जमा होने के पश्चात आपको मिलेंगे'
                            : 'After completing the payments below, you will receive'
                          }
                        </p>
                        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                          isShaadiTheme ? 'text-[#065F46] font-serif-luxury' : 'text-[#16A34A]'
                        }`}>
                          ₹ 4,90,000
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Direct NEFT/RTGS to State Bank of India •••• 4912
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Card 2: Main Payment Details & Auspicious Karyakram Roadmap */}
                <div className={`rounded-2xl border p-5 sm:p-7 md:p-8 transition-all ${
                  isShaadiTheme
                    ? 'shadi-card-luxury'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-100">
                    <div>
                      <h2 className={`text-lg sm:text-xl font-bold ${
                        isShaadiTheme ? 'text-[#4A0817] font-royal flex items-center gap-2' : 'text-slate-900'
                      }`}>
                        <Sparkles className="w-5 h-5 text-[#B48222]" />
                        Shubh Payment Clearance (शगुन एवं शुल्क विवरण)
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Complete required clearance fees to unlock Mrs. Nurullah Tabish&apos;s payout
                      </p>
                    </div>

                    {allCompleted && (
                      <button
                        onClick={handleResetPayments}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors btn-tactile"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Demo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Column: Ceremony Fees Table */}
                    <div className="lg:col-span-7">
                      <div className="overflow-x-auto -mx-1 sm:mx-0">
                        <table className="w-full text-left text-sm min-w-[340px]">
                          <thead>
                            <tr className={`border-b text-xs sm:text-sm ${
                              isShaadiTheme ? 'border-amber-200 text-[#881337] font-royal' : 'border-slate-200 text-slate-600 font-semibold'
                            }`}>
                              <th className="py-2.5 font-bold w-8 sm:w-10">#</th>
                              <th className="py-2.5 font-bold">Ceremony Fee</th>
                              <th className="py-2.5 font-bold text-right sm:text-center pr-2 sm:pr-4">
                                Amount (₹)
                              </th>
                              <th className="py-2.5 font-bold text-right sm:text-center">Verification Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100/70">
                            {payments.map(payment => (
                              <tr
                                key={payment.id}
                                onClick={() => handleOpenPayment(payment)}
                                className={`group cursor-pointer transition-colors ${
                                  isShaadiTheme 
                                    ? 'hover:bg-amber-50/80' 
                                    : 'hover:bg-blue-50/50'
                                }`}
                              >
                                <td className="py-3 text-stone-500 font-bold text-xs sm:text-sm">
                                  {payment.id}
                                </td>
                                <td className="py-3">
                                  <div className="font-bold text-stone-900 group-hover:text-[#881337] transition-colors text-xs sm:text-sm">
                                    {payment.description}
                                  </div>
                                  <div className="text-[11px] text-stone-500 font-normal">
                                    {payment.hindiDescription}
                                  </div>
                                </td>
                                <td className="py-3 text-stone-800 text-right sm:text-center pr-2 sm:pr-4 font-mono font-bold text-xs sm:text-sm">
                                  ₹ {payment.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 text-right sm:text-center">
                                  {payment.status === 'Pending' ? (
                                    <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] font-semibold text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs group-hover:ring-1 group-hover:ring-amber-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                      Pending Verification
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
                                      <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                      Verified ✓
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Total Payable Amount Row */}
                      <div className="border-t-2 border-amber-200 mt-3 pt-3 flex items-center justify-between text-xs sm:text-base font-extrabold text-stone-900 bg-amber-50/50 p-3 rounded-xl">
                        <span className="font-royal text-[#881337]">Total Pending Clearance</span>
                        <span className="font-mono text-lg text-[#881337]">
                          ₹ {totalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Shubh Karyakram Roadmap Box */}
                    <div className={`lg:col-span-5 rounded-2xl p-5 border ${
                      isShaadiTheme
                        ? 'bg-gradient-to-br from-[#FFF9EE] via-[#FFF5E6] to-[#FDF0D5] border-amber-200'
                        : 'bg-[#F0F6FF] border-blue-100'
                    }`}>
                      <h3 className={`font-bold text-sm sm:text-base mb-3 flex items-center gap-2 ${
                        isShaadiTheme ? 'text-[#881337] font-royal' : 'text-[#1D4ED8]'
                      }`}>
                        <PartyPopper className="w-4 h-4 text-[#B48222]" />
                        Shubh Karyakram (शुभ चरण)
                      </h3>

                      <div className="space-y-3.5 text-xs sm:text-sm text-stone-800">
                        {/* Step 1 */}
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs ${
                            payments[0].status === 'Completed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-[#881337] to-[#BE123C] text-white'
                          }`}>
                            {payments[0].status === 'Completed' ? '✓' : '1'}
                          </div>
                          <div>
                            <span className="font-semibold">Pay Portal Fees: ₹ 25,000</span>
                            <p className="text-[11px] text-stone-500">शगुन पोर्टल पंजीकरण शुल्क</p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs ${
                            payments[1].status === 'Completed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-[#881337] to-[#BE123C] text-white'
                          }`}>
                            {payments[1].status === 'Completed' ? '✓' : '2'}
                          </div>
                          <div>
                            <span className="font-semibold">Submit GST Fees: ₹ 25,000</span>
                            <p className="text-[11px] text-stone-500">सरकारी मंडप व वैधानिक क्लीयरेंस</p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs ${
                            payments[2].status === 'Completed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-[#881337] to-[#BE123C] text-white'
                          }`}>
                            {payments[2].status === 'Completed' ? '✓' : '3'}
                          </div>
                          <div>
                            <span className="font-semibold">Submit Paypal Fees: ₹ 25,000</span>
                            <p className="text-[11px] text-stone-500">वैश्विक ट्रांसफर एवं सेटलमेंट शुल्क</p>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex items-start gap-3 pt-2 border-t border-amber-200">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F59E0B] text-[#4A0817] flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                            4
                          </div>
                          <div>
                            <span className="font-bold text-[#065F46]">
                              Instant Payout Release: ₹ 4,90,000
                            </span>
                            <p className="text-[11px] text-stone-600">
                              पूर्ण राशि श्रीमती नुरुल्लाह ताबिश के बैंक खाते में जमा होगी
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Success Banner */}
                  <div className={`mt-6 rounded-xl p-4 flex items-start sm:items-center gap-3 border ${
                    isShaadiTheme
                      ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-emerald-300'
                      : 'bg-[#ECFDF5] border-emerald-200'
                  }`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-600 text-white shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs sm:text-sm text-stone-800 leading-snug">
                      <strong className="text-emerald-950 font-bold">मंगलमय आशीर्वाद (Divine Assurance):</strong> Once all the above clearance fees are verified, you will immediately receive{' '}
                      <strong className="text-[#881337] font-bold text-base">₹ 4,90,000</strong> without any additional delay.
                    </p>
                  </div>
                </div>
              </>
            ) : activeTab === 'profile' ? (
              /* Profile Tab View */
              <div className="shadi-card-luxury rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-4 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#680E23] to-[#881337] flex items-center justify-center text-[#FDE68A] shrink-0 border-2 border-[#D4AF37] shadow-md">
                      <Crown className="w-8 h-8 text-[#FDE68A]" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#4A0817] font-serif-luxury">
                        Mrs. Nurullah Tabish
                      </h2>
                      <p className="text-xs text-stone-500">Applicant ID: APP-2024-88419 • Verified Shadi Beneficiary</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                      KYC Verified ✓
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                      Shubh Vivah 🪔
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-amber-50/60 rounded-xl space-y-1 border border-amber-100">
                    <p className="text-xs text-stone-500 font-medium">Beneficiary Full Name</p>
                    <p className="font-bold text-stone-900 text-base">Mrs. Nurullah Tabish</p>
                  </div>
                  <div className="p-4 bg-amber-50/60 rounded-xl space-y-1 border border-amber-100">
                    <p className="text-xs text-stone-500 font-medium">Registered Contact Number</p>
                    <p className="font-bold text-stone-900 text-base font-mono">+91 85810 52678</p>
                  </div>
                  <div className="p-4 bg-amber-50/60 rounded-xl space-y-1 border border-amber-100">
                    <p className="text-xs text-stone-500 font-medium">Direct Settlement Bank Account</p>
                    <p className="font-bold text-stone-900 text-base">State Bank of India •••• 4912</p>
                  </div>
                  <div className="p-4 bg-amber-50/60 rounded-xl space-y-1 border border-amber-100">
                    <p className="text-xs text-stone-500 font-medium">Bank IFSC Code</p>
                    <p className="font-bold text-stone-900 text-base font-mono">SBIN0001842</p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'documents' ? (
              /* Documents Tab View */
              <div className="shadi-card-luxury rounded-2xl p-6 sm:p-8 space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#4A0817] font-royal border-b border-amber-200 pb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#B48222]" />
                  Verified Auspicious Documents (प्रमाणपत्र)
                </h2>
                <div className="space-y-3">
                  {[
                    { title: 'Identity Proof (Aadhaar Card)', date: 'Verified on 12 Jan 2024', tag: 'Identity Sealed' },
                    { title: 'PAN Card Verification', date: 'Verified on 14 Jan 2024', tag: 'Tax Compliance' },
                    { title: 'Bank Passbook & Cancelled Cheque', date: 'Verified on 15 Jan 2024', tag: 'Direct Deposit Ready' },
                    { title: 'Shubh Vivah Disbursement Agreement Form', date: 'Signed on 18 Jan 2024', tag: 'Legally Binding' }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/50 rounded-xl hover:bg-amber-100/60 transition-colors border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#680E23] to-[#881337] flex items-center justify-center text-[#FDE68A] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-stone-500">{doc.date}</span>
                            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.2 rounded-full font-semibold">
                              {doc.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => playClick('click')}
                        className="self-end sm:self-auto text-xs font-bold text-[#881337] hover:text-[#4A0817] flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs btn-tactile"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'payments' ? (
              /* Payments Tab View */
              <div className="shadi-card-luxury rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-3 gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#4A0817] font-royal flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#B48222]" />
                      Payment Clearance Breakdown
                    </h2>
                    <p className="text-xs text-stone-500">Pay required ceremony clearance fees to unlock disbursement</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-stone-500">Pending Payable Balance</span>
                    <p className="text-xl font-black text-[#881337] font-mono">₹ {totalPayable.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {payments.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-amber-200 rounded-xl hover:border-amber-400 bg-amber-50/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-stone-900">{p.description}</p>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                            {p.ceremonyTag}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{p.hindiDescription} • Code: PRT-FEE-{p.id}089</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-base font-bold font-mono text-stone-900">
                          ₹ {p.amount.toLocaleString('en-IN')}
                        </span>
                        {p.status === 'Pending' ? (
                          <button
                            onClick={() => handleOpenPayment(p)}
                            className="shadi-btn-gold text-xs px-4 py-2 rounded-xl transition-all btn-tactile"
                          >
                            Pay Clearance
                          </button>
                        ) : (
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-300">
                            Verified ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'summary' ? (
              /* Summary Tab View */
              <div className="shadi-card-luxury rounded-2xl p-6 sm:p-8 space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#4A0817] font-royal border-b border-amber-200 pb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#B48222]" />
                  Financial Settlement Summary (लेखा जोखा)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                    <p className="text-xs text-[#881337] font-bold">Approved Gross Payout</p>
                    <p className="text-2xl font-black text-[#680E23] mt-1 font-serif-luxury">₹ 11,77,252</p>
                    <p className="text-[10px] text-stone-500 mt-1">Total approved settlement quota</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border border-rose-200">
                    <p className="text-xs text-rose-800 font-bold">Pending Clearance Fees</p>
                    <p className="text-2xl font-black text-rose-700 mt-1 font-mono">₹ {totalPayable.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-stone-500 mt-1">Required for immediate unlock</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                    <p className="text-xs text-emerald-800 font-bold">Direct Payout Readiness</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1 font-royal">
                      {allCompleted ? '100% Ready' : 'Pending Fee'}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">Auto-disbursement on clearance</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Settings Tab View */
              <div className="shadi-card-luxury rounded-2xl p-6 sm:p-8 space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#4A0817] font-royal border-b border-amber-200 pb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#B48222]" />
                  Auspicious Portal & Sound Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div>
                      <p className="text-sm font-bold text-stone-900">Tactile Click Sound Effects</p>
                      <p className="text-xs text-stone-500">Play ghungroo chime and mechanical audio feedback on user actions</p>
                    </div>
                    <button
                      onClick={handleToggleSound}
                      className={`self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
                        !isSoundMuted ? 'bg-[#881337] text-white shadow-sm' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {!isSoundMuted ? 'Sound Active 🔊' : 'Muted 🔇'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div>
                      <p className="text-sm font-bold text-stone-900">Theme Mode</p>
                      <p className="text-xs text-stone-500">Switch between Royal Shaadi Festive Theme and Classic Portal</p>
                    </div>
                    <button
                      onClick={() => {
                        playClick('switch');
                        setIsShaadiTheme(!isShaadiTheme);
                      }}
                      className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#4A0817] shadow-sm btn-tactile"
                    >
                      {isShaadiTheme ? 'Royal Shaadi Active 🪔' : 'Classic Mode Active'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}
          <footer className="text-center py-6 text-xs text-stone-500 select-none">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flower2 className="w-3.5 h-3.5 text-[#B48222]" />
              <span className="font-semibold text-stone-700">शुभ विवाह • Royal Matrimonial Settlement Portal</span>
              <Flower2 className="w-3.5 h-3.5 text-[#B48222]" />
            </div>
            © 2024 Shubh Vivah Portal. All rights reserved. Direct Beneficiary Portal for Mrs. Nurullah Tabish.
          </footer>
        </main>
      </div>

      {/* ================= PAYMENT MODAL (SHAGUN STYLE) ================= */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border-2 border-[#D4AF37] relative animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                playClick('click');
                setSelectedPayment(null);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-amber-100 transition-colors btn-tactile"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#881337] bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B48222]" />
                Royal Shagun Clearance
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-2 font-serif-luxury">
                {selectedPayment.description}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">{selectedPayment.hindiDescription}</p>
              <div className="text-3xl sm:text-4xl font-black text-[#881337] font-mono mt-2">
                ₹ {selectedPayment.amount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  playClick('tab');
                  setPaymentMethod('upi');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all btn-tactile ${
                  paymentMethod === 'upi'
                    ? 'border-[#881337] bg-rose-50 text-[#881337] ring-1 ring-[#881337]'
                    : 'border-amber-200 text-stone-600 hover:bg-amber-50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick('tab');
                  setPaymentMethod('card');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all btn-tactile ${
                  paymentMethod === 'card'
                    ? 'border-[#881337] bg-rose-50 text-[#881337] ring-1 ring-[#881337]'
                    : 'border-amber-200 text-stone-600 hover:bg-amber-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Debit Card
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick('tab');
                  setPaymentMethod('dd');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all btn-tactile ${
                  paymentMethod === 'dd'
                    ? 'border-[#881337] bg-rose-50 text-[#881337] ring-1 ring-[#881337]'
                    : 'border-amber-200 text-stone-600 hover:bg-amber-50'
                }`}
              >
                <Building className="w-4 h-4" />
                Shagun DD
              </button>
            </div>

            {/* Payment Method Content */}
            {paymentMethod === 'upi' && (
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-4 text-center border border-amber-200 mb-5">
                <div className="w-32 h-32 bg-white rounded-xl border-2 border-amber-300 mx-auto flex items-center justify-center p-2 mb-2 shadow-sm">
                  <div className="w-full h-full border-2 border-dashed border-amber-400 rounded-lg flex flex-col items-center justify-center text-stone-600">
                    <QrCode className="w-12 h-12 text-[#881337]" />
                    <span className="text-[10px] mt-1 font-mono font-bold text-stone-800">shubh.vivah@icici</span>
                  </div>
                </div>
                <p className="text-xs text-stone-700 font-medium">Scan using any UPI app (GPay / PhonePe / Paytm)</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 mb-5 space-y-2.5 text-xs">
                <div>
                  <label className="text-stone-700 font-bold">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 •••• •••• 9921"
                    className="w-full mt-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-mono"
                    defaultValue="4111 8291 0029 4819"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-700 font-bold">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="08/28"
                      className="w-full mt-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-stone-700 font-bold">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      defaultValue="883"
                      className="w-full mt-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'dd' && (
              <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 mb-5 space-y-2 text-xs">
                <div>
                  <label className="text-stone-700 font-bold">Demand Draft (DD) Number</label>
                  <input
                    type="text"
                    value={ddNumber}
                    onChange={(e) => setDdNumber(e.target.value)}
                    placeholder="e.g. 5920194821"
                    className="w-full mt-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  DD payable at New Delhi in favor of &quot;Shubh Vivah Disbursement Authority&quot;.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="w-full py-3.5 bg-gradient-to-r from-[#680E23] via-[#881337] to-[#BE123C] hover:opacity-95 text-[#FDE68A] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg btn-tactile disabled:opacity-75 border border-[#D4AF37]"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#FDE68A] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Shagun Clearance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Complete ₹ {selectedPayment.amount.toLocaleString('en-IN')} & Verify</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick('click');
                  setSelectedPayment(null);
                }}
                className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif-luxury">Confirm Logout</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              Are you sure you want to end your Shubh Vivah portal session?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClick('click');
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-stone-200 text-stone-700 hover:bg-stone-50 btn-tactile"
              >
                Stay Logged In
              </button>
              <button
                onClick={() => {
                  playClick('switch');
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#881337] hover:bg-[#680E23] text-white btn-tactile"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
