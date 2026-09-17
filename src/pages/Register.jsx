import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import WelcomeScreen from "@/components/auth/WelcomeScreen";
import RegisterMethodSelect from "@/components/auth/RegisterMethodSelect";
import EmailRegisterForm from "@/components/auth/EmailRegisterForm";

export default function Register() {
  const t = useT();
  const navigate = useNavigate();
  const [step, setStep] = useState("welcome"); // welcome | method | email | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  // 新規登録後は生年月日オンボーディングを挟む。元のreturnToはクエリで引き継ぐ。
  const onboardingUrl = "/onboarding/birthdate" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "");

  // 新規登録直後はオンボーディングを強制(既存データの自動スキップを無効化)するフラグ
  const markFreshRegister = () => sessionStorage.setItem("beltva_fresh_register", "1");

  const handleGoogle = () => { markFreshRegister(); base44.auth.loginWithProvider("google", onboardingUrl); };
  const handleApple = () => { markFreshRegister(); base44.auth.loginWithProvider("apple", onboardingUrl); };

  const handleEmailSubmit = async ({ email: em, password: pw }) => {
    setError("");
    setLoading(true);
    try {
      await base44.auth.register({ email: em, password: pw });
      setEmail(em);
      setPassword(pw);
      setStep("otp");
    } catch (err) {
      setError(err.message || t("auth.registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      markFreshRegister();
      window.location.href = onboardingUrl;
    } catch (err) {
      setError(err.message || t("auth.verifyFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: t("auth.resendSent") });
    } catch (err) {
      setError(err.message || t("auth.verifyFailed"));
    }
  };

  // OTP認証画面
  if (step === "otp") {
    return (
      <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
        <header className="flex items-center px-4 pt-4">
          <button onClick={() => setStep("email")} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 flex flex-col px-6 pt-8">
          <h2 className="text-xl font-bold text-foreground mb-1">{t("auth.verifyEmail")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("auth.verifySubtitle").replace("{email}", email)}</p>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || otpCode.length < 6}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-40 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.verify")}
          </button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            <button onClick={handleResend} className="text-primary font-medium">{t("auth.resend")}</button>
          </p>
        </div>
      </div>
    );
  }

  if (step === "method") {
    return (
      <RegisterMethodSelect
        onBack={() => setStep("welcome")}
        onGoogle={handleGoogle}
        onApple={handleApple}
        onEmail={() => { setError(""); setStep("email"); }}
      />
    );
  }

  if (step === "email") {
    return (
      <EmailRegisterForm
        onBack={() => setStep("method")}
        onSubmit={handleEmailSubmit}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <WelcomeScreen
      onRegister={() => { setError(""); setStep("method"); }}
      onLogin={() => navigate("/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""))}
    />
  );
}