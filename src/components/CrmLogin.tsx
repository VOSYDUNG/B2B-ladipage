import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Sparkles, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AppLanguage } from '../types';
import { signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';

interface CrmLoginProps {
  lang: AppLanguage;
  onLoginSuccess: (user: FirebaseUser) => Promise<boolean>;
  onBackToLanding: () => void;
}

const LOGIN_DICT = {
  lo: {
    title: "ລະບົບເຂົ້າສູ່ເວັບໄຊຫຼັງບ້ານ NNC",
    subtitle: "ສະເພາະຜູ້ຕາງໜ້າທາງການຢາ ແລະ ທີມງານການຕະຫຼາດ NNC Pharma",
    emailLabel: "ອີເມວພາຍໃນ (Internal Email)",
    passwordLabel: "ລະຫັດຜ່ານ (Password)",
    btnSubmit: "ເຂົ້າສູ່ລະບົບ",
    btnBack: "ກັບຄືນໜ້າຫຼັກ",
    errorDomain: "ກະລຸນາໃຊ້ອີເມວພາຍໃນ NNC (ເຊັ່ນ: @nncpharma.com ຫຼື @nnc.la) ຫຼື ອີເມວຜູ້ທົດສອບຂອງທ່ານ.",
    errorPassword: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ. ກະລຸນາລອງໃໝ່.",
    testAccountsTitle: "ບັນຊີສຳລັບທົດສອບ (Demo Accounts):",
    adminRole: "ຜູ້ບໍລິຫານ (Admin)",
    managerRole: "ຜູ້ຈັດການການຕະຫຼາດ (Marketing Manager)",
    salesRole: "ຕົວແທນຝ່າຍຂາຍ (Sales Rep)",
    hint: "ຄລິກເພື່ອຕື່ມຂໍ້ມູນອັດຕະໂນມັດ",
  },
  vi: {
    title: "Cổng Đăng Nhập Nội Bộ NNC Pharma",
    subtitle: "Dành riêng cho Trình Dược Viên và Đội ngũ Marketing của NNC Pharma",
    emailLabel: "Email nội bộ",
    passwordLabel: "Mật khẩu bảo mật",
    btnSubmit: "Đăng nhập hệ thống",
    btnBack: "Quay lại trang chủ",
    errorDomain: "Vui lòng đăng nhập bằng Email nội bộ (@nncpharma.com, @nnc.la) hoặc Email thử nghiệm của bạn.",
    errorPassword: "Mật khẩu không hợp lệ. Vui lòng nhập lại.",
    testAccountsTitle: "Tài khoản chạy thử nghiệm phân quyền (Demo Accounts):",
    adminRole: "Quản trị viên tối cao (Admin)",
    managerRole: "Quản lý Marketing (Manager)",
    salesRole: "Trình dược viên (Sales Rep)",
    hint: "Nhấp để tự động điền mẫu",
  },
  en: {
    title: "NNC Pharma Internal Portal",
    subtitle: "Authorized Medical Representatives and Marketing Team members only",
    emailLabel: "Internal Business Email",
    passwordLabel: "Security Password",
    btnSubmit: "Sign In Securely",
    btnBack: "Return to Home Page",
    errorDomain: "Please use an authorized NNC email domain (@nncpharma.com, @nnc.la) or your registered test email.",
    errorPassword: "Invalid password. Please try again.",
    testAccountsTitle: "Authorized Role-based Accounts (Demo):",
    adminRole: "System Administrator (Admin)",
    managerRole: "Marketing Director (Manager)",
    salesRole: "Field Representative (Sales Rep)",
    hint: "Click to auto-fill credentials",
  }
};

export default function CrmLogin({ lang, onLoginSuccess, onBackToLanding }: CrmLoginProps) {
  const t = LOGIN_DICT[lang];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);

    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(async (userCredential) => {
        const isAuthorized = await onLoginSuccess(userCredential.user);
        setIsSubmitting(false);
        if (!isAuthorized) setErrorMessage(t.errorDomain);
      })
      .catch((error) => {
        setIsSubmitting(false);
        console.error("Firebase Auth Error:", error);
        setErrorMessage(t.errorPassword + " (or user not created in Firebase console)");
      });
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative colored badge */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-green via-brand-yellow to-emerald-600" />
      
      <div className="text-center space-y-3 mt-4 mb-6">
        <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 leading-tight">
          {t.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
          {t.subtitle}
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {/* Error messaging panel */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            {t.emailLabel}
          </label>
          <div className="relative">
            <input
              id="login-email-input"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@nncpharma.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green text-xs transition text-slate-800 placeholder-slate-400 outline-none font-medium"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            {t.passwordLabel}
          </label>
          <div className="relative">
            <input
              id="login-password-input"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green text-xs transition text-slate-800 placeholder-slate-400 outline-none font-medium"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
            ) : (
              <Shield className="w-3.5 h-3.5" />
            )}
            <span>{t.btnSubmit}</span>
          </button>
          
          <button
            type="button"
            onClick={onBackToLanding}
            className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.btnBack}</span>
          </button>
        </div>
      </form>

    </div>
  );
}
