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
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from './utils/audio';

type TabType = 'dashboard' | 'profile' | 'documents' | 'payments' | 'summary' | 'settings';
type SoundProfileType = 'crisp' | 'tactile' | 'bubble';

interface PaymentItem {
  id: number;
  description: string;
  amount: number;
  status: 'Pending' | 'Completed';
  category: 'fee' | 'dd1' | 'dd2';
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  { id: 1, description: 'Portal Fees', amount: 17380, status: 'Pending', category: 'fee' },
  { id: 2, description: 'GST Fees ', amount: 25000, status: 'Pending', category: 'dd1' },
  { id: 3, description: 'Paypal Fees', amount: 25000, status: 'Pending', category: 'dd2' }
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
  const isSoundMuted = useSyncExternalStore(
    soundManager.subscribe.bind(soundManager),
    () => soundManager.getMuted(),
    () => false
  );
  const soundProfile = useSyncExternalStore(
    soundManager.subscribe.bind(soundManager),
    () => soundManager.getSoundProfile(),
    () => 'crisp' as SoundProfileType
  );
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [soundRippleKey, setSoundRippleKey] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Initialize sound manager listener on client load
  useEffect(() => {
    soundManager.attachGlobalSoundListener();
  }, []);

  const playClick = (type: 'click' | 'switch' | 'soft' | 'pop' | 'success' | 'alert' | 'tab' = 'click') => {
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

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback gracefully
      }
    }, 900);
  };

  const handleResetPayments = () => {
    playClick('switch');
    setPayments(INITIAL_PAYMENTS);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC] text-[#1F2937] font-sans antialiased">
      {/* ================= TOP NAVBAR ================= */}
      <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left: Navy Brand Logo Block & Hamburger */}
        <div className="flex items-center h-full">
          <div className="w-auto px-4 sm:w-60 sm:px-6 bg-[#0B2559] h-full flex items-center shrink-0">
            <span className="text-white text-lg sm:text-xl font-extrabold tracking-wider">
              PORTAL
            </span>
          </div>

          {/* Hamburger toggle */}
          <button
            onClick={handleToggleMenu}
            className="p-2 ml-2 sm:ml-4 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors btn-tactile focus:outline-none"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-slate-800" strokeWidth={2.2} />
          </button>
        </div>

        {/* Right: Sound Controller & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 mr-3 sm:mr-6">
          {/* Audio Click Sound Control Badge */}
          <div className="relative">
            <button
              onClick={() => {
                playClick('switch');
                setShowSoundSettings(!showSoundSettings);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 transition-colors btn-tactile"
              title="Click Sound Settings"
            >
              <Volume2 className={`w-3.5 h-3.5 shrink-0 ${!isSoundMuted ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSoundMuted ? 'Sound Off' : `Click Sound (${soundProfile})`}
              </span>
              <span
                key={soundRippleKey}
                className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block ml-0.5"
                title="Audio feedback active"
              />
            </button>

            {/* Sound dropdown menu */}
            {showSoundSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-150">
                  <span className="text-xs font-bold text-slate-800">UI Audio Engine</span>
                  <button
                    onClick={handleToggleSound}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isSoundMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  Select tactile click sound style:
                </div>
                <div className="space-y-1">
                  {([
                    { id: 'crisp', label: 'Crisp Mechanical Click', desc: 'Sharp snappy UI feedback' },
                    { id: 'tactile', label: 'Soft Modern Tap', desc: 'Smooth warm haptic pulse' },
                    { id: 'bubble', label: 'Bubble Pop', desc: 'Playful vibrant audio feedback' }
                  ] as const).map(style => (
                    <button
                      key={style.id}
                      onClick={() => handleChangeProfile(style.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${soundProfile === style.id
                          ? 'bg-blue-600 text-white font-medium'
                          : 'hover:bg-slate-100 text-slate-700'
                        }`}
                    >
                      <div>
                        <div>{style.label}</div>
                        <div className={`text-[10px] ${soundProfile === style.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {style.desc}
                        </div>
                      </div>
                      {soundProfile === style.id && <Check className="w-3.5 h-3.5 text-white ml-2 shrink-0" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => playClick('click')}
                  className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors text-center"
                >
                  🔊 Test Click Sound
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
              className="flex items-center gap-1.5 sm:gap-2.5 py-1 px-1.5 sm:px-2 rounded-lg hover:bg-slate-100 transition-colors btn-tactile focus:outline-none"
            >
              {/* User Avatar Circle */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0B57D0] flex items-center justify-center text-white shadow-xs shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-[#0B57D0]" />
              </div>
              <span className="hidden md:inline text-sm font-semibold text-slate-800">
                Mr. Rajan Soni
              </span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
            </button>

            {/* Profile Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm font-bold text-slate-900 truncate">Mr. Rajan Soni</p>
                  <span className="inline-block mt-1 text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    KYC Verified
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleSelectTab('profile');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    handleSelectTab('settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  Account Settings
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    playClick('alert');
                    setShowLogoutModal(true);
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* ================= LEFT SIDEBAR (Responsive Mobile Drawer + Desktop) ================= */}
        <aside
          className={`bg-white border-r border-[#E5E7EB] transition-all duration-200 flex flex-col justify-between py-4 select-none shrink-0 z-40
            fixed inset-y-0 left-0 lg:static h-full
            ${mobileMenuOpen ? 'w-64 translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            ${desktopSidebarOpen ? 'lg:w-60' : 'lg:w-16 lg:overflow-hidden'}
          `}
        >
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between px-4 pb-3 mb-2 border-b border-slate-100 lg:hidden">
            <span className="text-sm font-bold text-slate-800">Navigation</span>
            <button
              onClick={() => {
                playClick('click');
                setMobileMenuOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 px-3">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all btn-tactile ${isActive
                      ? 'bg-[#EBF3FE] text-[#0B57D0]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0B57D0]' : 'text-slate-600'
                      }`}
                  />
                  <span className={`${!desktopSidebarOpen ? 'lg:hidden' : 'inline'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Logout Button */}
          <div className="px-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                playClick('alert');
                setShowLogoutModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors btn-tactile"
            >
              <LogOut className="w-5 h-5 shrink-0 text-slate-600" />
              <span className={`${!desktopSidebarOpen ? 'lg:hidden' : 'inline'}`}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full space-y-5 sm:space-y-6">
            {activeTab === 'dashboard' ? (
              <>
                {/* 1. User Welcome Header Block */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* Blue Circle Avatar */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0B57D0] flex items-center justify-center text-white shadow-xs shrink-0">
                    <User className="w-7 h-7 sm:w-9 sm:h-9 fill-white text-[#0B57D0]" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs sm:text-sm font-normal">Welcome,</p>
                    <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight">
                      Mr. Rajan Soni
                    </h1>
                  </div>
                </div>

                {/* 2. Card 1: Final Amount You Will Get Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-7 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-center">
                    {/* Left Column: Final Amount */}
                    <div className="space-y-1">
                      <h2 className="text-xs sm:text-sm font-medium text-slate-700">
                        Final Amount You Will Get
                      </h2>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B57D0] tracking-tight">
                        ₹ 7,00,000
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed pt-1">
                        Rupees Seven Lakh Only
                      </p>
                    </div>

                    {/* Right Column: Wallet Highlight */}
                    <div className="flex items-center gap-3.5 sm:gap-4 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0 md:border-l md:border-slate-150 md:pl-8">
                      {/* Wallet Icon Circle Badge */}
                      <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                        <Wallet className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#0B57D0] stroke-[1.8]" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-slate-800 font-normal leading-snug">
                          After completing the payments below, you will receive
                        </p>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#16A34A] tracking-tight">
                          ₹ 7,00,000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Card 2: Main Payment Details & How It Works */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-7 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Payment Details
                    </h2>
                    {allCompleted && (
                      <button
                        onClick={handleResetPayments}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors btn-tactile"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Demo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Column: Payment Details Table */}
                    <div className="lg:col-span-7">
                      <div className="overflow-x-auto -mx-1 sm:mx-0">
                        <table className="w-full text-left text-sm min-w-[320px]">
                          <thead>
                            <tr className="text-slate-600 border-b border-slate-200 text-xs sm:text-sm">
                              <th className="py-2.5 font-semibold w-8 sm:w-10">#</th>
                              <th className="py-2.5 font-semibold">Description</th>
                              <th className="py-2.5 font-semibold text-right sm:text-center pr-2 sm:pr-4">
                                Amount (₹)
                              </th>
                              <th className="py-2.5 font-semibold text-right sm:text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {payments.map(payment => (
                              <tr
                                key={payment.id}
                                onClick={() => handleOpenPayment(payment)}
                                className="group hover:bg-blue-50/40 cursor-pointer transition-colors"
                              >
                                <td className="py-3 text-slate-500 font-medium text-xs sm:text-sm">{payment.id}</td>
                                <td className="py-3 font-medium text-slate-800 group-hover:text-blue-700 transition-colors text-xs sm:text-sm">
                                  {payment.description}
                                </td>
                                <td className="py-3 text-slate-700 text-right sm:text-center pr-2 sm:pr-4 font-mono font-medium text-xs sm:text-sm">
                                  {payment.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 text-right sm:text-center">
                                  {payment.status === 'Pending' ? (
                                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] font-medium text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 rounded shadow-2xs group-hover:ring-1 group-hover:ring-amber-400 transition-all">
                                      Pending
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-emerald-100 text-emerald-800 font-medium text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 rounded shadow-2xs">
                                      Completed ✓
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Total Payable Amount Row */}
                      <div className="border-t border-slate-200 mt-2 pt-3 flex items-center justify-between text-xs sm:text-base font-bold text-slate-900">
                        <span>Total Payable Amount</span>
                        <span className="font-mono">
                          ₹ {totalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: How It Works Box */}
                    <div className="lg:col-span-5 bg-[#F0F6FF] rounded-xl p-4 sm:p-6 border border-blue-50">
                      <h3 className="text-[#1D4ED8] font-bold text-xs sm:text-base mb-3 sm:mb-4">
                        How It Works
                      </h3>

                      <div className="space-y-3 sm:space-y-3.5 text-xs sm:text-sm text-slate-800">
                        {/* Step 1 */}
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            1
                          </div>
                          <span>Pay Portal Fees: ₹ 17,380</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            2
                          </div>
                          <span>Submit GST Fees : ₹ 25,000</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            3
                          </div>
                          <span>Submit Paypal Fees : ₹ 25,000</span>
                        </div>

                        {/* Step 4 */}
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            4
                          </div>
                          <span className="leading-snug">
                            After successful payment verification, you will receive ₹ 700000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Success Banner */}
                  <div className="mt-5 sm:mt-6 bg-[#ECFDF5] border border-emerald-200/80 rounded-xl p-3.5 sm:p-4 flex items-start sm:items-center gap-2.5 sm:gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] fill-[#10B981] text-white shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                      Once all the above payments are completed and verified, you will get{' '}
                      <strong className="text-slate-900 font-bold">₹ 700000</strong>
                    </p>
                  </div>
                </div>
              </>
            ) : activeTab === 'profile' ? (
              /* Profile Tab View */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0B57D0] flex items-center justify-center text-white shrink-0">
                      <User className="w-7 h-7 sm:w-9 sm:h-9 fill-white text-[#0B57D0]" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">Mr. Rajan Soni</h2>
                      <p className="text-xs text-slate-500">Applicant ID: APP-2024-88419</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                    KYC Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="font-semibold text-slate-900">Mr. Rajan Soni</p>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500">Mobile Number</p>
                    <p className="font-semibold text-slate-900">+91 98765 43210</p>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500">Beneficiary Bank Account</p>
                    <p className="font-semibold text-slate-900">State Bank of India •••• 4912</p>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500">IFSC Code</p>
                    <p className="font-semibold text-slate-900">SBIN0001842</p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'documents' ? (
              /* Documents Tab View */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Verified Documents
                </h2>
                <div className="space-y-3">
                  {[
                    { title: 'Identity Proof (Aadhaar Card)', date: 'Verified on 12 Jan 2024' },
                    { title: 'PAN Card Verification', date: 'Verified on 14 Jan 2024' },
                    { title: 'Bank Passbook & Cancelled Cheque', date: 'Verified on 15 Jan 2024' },
                    { title: 'Disbursement Agreement Form', date: 'Signed on 18 Jan 2024' }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                          <p className="text-xs text-slate-500">{doc.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => playClick('click')}
                        className="self-end sm:self-auto text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 btn-tactile"
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
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Payment Breakdown</h2>
                    <p className="text-xs text-slate-500">Pay required fees to unlock your payout</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-slate-500">Payable Balance</span>
                    <p className="text-lg sm:text-xl font-bold text-blue-600 font-mono">₹ {totalPayable.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {payments.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{p.description}</p>
                        <p className="text-xs text-slate-500">Ref Code: PRT-FEE-{p.id}089</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <span className="text-sm sm:text-base font-bold font-mono">₹ {p.amount.toLocaleString('en-IN')}</span>
                        {p.status === 'Pending' ? (
                          <button
                            onClick={() => handleOpenPayment(p)}
                            className="bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors btn-tactile"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg">
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
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Financial Settlement Summary
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Approved Payout Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">₹ 11,77,252</p>
                  </div>
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-700 font-medium">Pending Settlement Fees</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">₹ {totalPayable.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-medium">Direct Transfer Status</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{allCompleted ? 'Ready' : 'Pending Fee'}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Settings Tab View */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Portal & Audio Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Tactile Click Sound Effects</p>
                      <p className="text-xs text-slate-500">Play mechanical feedback sounds when interacting with buttons</p>
                    </div>
                    <button
                      onClick={handleToggleSound}
                      className={`self-start sm:self-auto px-4 py-2 rounded-lg text-xs font-bold transition-colors btn-tactile ${!isSoundMuted ? 'bg-[#0B57D0] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                    >
                      {!isSoundMuted ? 'Sound Enabled' : 'Muted'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}
          <footer className="text-center py-5 sm:py-6 text-xs text-slate-400 select-none">
            © 2024 Portal. All rights reserved.
          </footer>
        </main>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                playClick('click');
                setSelectedPayment(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors btn-tactile"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Portal Payment Verification
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {selectedPayment.description}
              </h3>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B57D0] font-mono mt-1">
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
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all btn-tactile ${paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all btn-tactile ${paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all btn-tactile ${paymentMethod === 'dd'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Building className="w-4 h-4" />
                DD / Cheque
              </button>
            </div>

            {/* Payment Method Content */}
            {paymentMethod === 'upi' && (
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200/80 mb-5">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-lg border border-slate-300 mx-auto flex items-center justify-center p-2 mb-2 shadow-xs">
                  <div className="w-full h-full border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-slate-600">
                    <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                    <span className="text-[10px] mt-1 font-mono">portal@icici</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">Scan using any UPI app (GPay / PhonePe / Paytm)</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5 space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-medium">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 •••• •••• 9921"
                    className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                    defaultValue="4111 8291 0029 4819"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 font-medium">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="08/28"
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      defaultValue="883"
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'dd' && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5 space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-medium">Demand Draft (DD) Number</label>
                  <input
                    type="text"
                    value={ddNumber}
                    onChange={(e) => setDdNumber(e.target.value)}
                    placeholder="e.g. 5920194821"
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  DD payable at New Delhi in favor of &quot;Portal Disbursement Authority&quot;.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="w-full py-3 bg-[#0B57D0] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm btn-tactile disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
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
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Confirm Logout</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to end your current session?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClick('click');
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 btn-tactile"
              >
                Stay Logged In
              </button>
              <button
                onClick={() => {
                  playClick('switch');
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white btn-tactile"
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
