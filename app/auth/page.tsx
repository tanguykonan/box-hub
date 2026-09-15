"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { GithubIcon } from "../../components/ui/GithubIcon";
import { GoogleIcon } from "../../components/ui/GoogleIcon";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { OtpInput } from "../../components/auth/OtpInput";
import { useToast } from "../../components/ui/Toast";
import logoImg from "../../public/logo.jpg";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState<"form" | "otp">("form");
  
  // Champs formulaire
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  
  // États de vérification du username
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    message?: string;
  } | null>(null);

  // OTP
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // État de chargement
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const paramMode = searchParams.get("mode");
    if (paramMode === "register" || paramMode === "login") {
      setMode(paramMode);
      setStep("form");
    }
  }, [searchParams]);

  // Compte à rebours de renvoi du code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Vérification en temps réel de la disponibilité du username (debounce 400ms)
  useEffect(() => {
    if (mode !== "register" || !username || username.length < 2) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch("/api/auth/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        setUsernameStatus(data);
      } catch {
        setUsernameStatus({ available: false, message: "Impossible de vérifier." });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, mode]);

  // Étape 1 : Envoi du code OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email) {
      showToast("Veuillez saisir votre adresse e-mail.", "error");
      return;
    }

    if (mode === "register" && (!username || username.length < 2)) {
      showToast("Veuillez choisir un nom d'utilisateur valide.", "error");
      return;
    }

    if (mode === "register" && usernameStatus && !usernameStatus.available) {
      showToast(usernameStatus.message || "Ce nom d'utilisateur n'est pas disponible.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mode,
          username: mode === "register" ? username : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || "Impossible d'envoyer le code. Veuillez réessayer.", "error");
        if (data.suggestLogin) setMode("login");
        if (data.suggestRegister) setMode("register");
        return;
      }

      setStep("otp");
      setCountdown(30);
      showToast(`Code de vérification envoyé à ${email}`, "success");
    } catch {
      showToast("Connexion impossible pour le moment. Veuillez vérifier votre réseau.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2 : Vérification du code OTP et connexion
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (!code || code.length !== 4) {
      showToast("Veuillez saisir le code à 4 chiffres.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || "Code incorrect ou expiré.", "error");
        setIsLoading(false);
        return;
      }

      // Connexion via NextAuth Credentials avec le verifiedToken
      const signInRes = await signIn("credentials", {
        email,
        verifiedToken: data.verifiedToken,
        redirect: false,
      });

      if (signInRes?.error) {
        showToast("Impossible d'ouvrir votre session. Veuillez réessayer.", "error");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      showToast("Une erreur est survenue lors de la vérification. Veuillez réessayer.", "error");
      setIsLoading(false);
    }
  };

  // Connexions OAuth GitHub et Google
  const handleOAuthLogin = (provider: "github" | "google") => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      
      {/* Header */}
      <header className="w-full border-b border-black/8 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-black/30 dark:hover:border-white/30 hover:text-zinc-950 dark:hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Retour</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
              <Image
                src={logoImg}
                alt="Logo Box Hub"
                width={32}
                height={32}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              hub
            </span>
          </Link>

          <div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          
          <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-xl overflow-hidden">
            
            {/* Overlay de chargement (Gel de l'écran avec cercle rotatif) */}
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent shadow-xs" />
              </div>
            )}
            
            {step === "form" ? (
              <>
                {/* Sliding Switcher: Connexion / Inscription */}
                <div className="relative mb-6 flex rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 p-1">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-black shadow-xs border border-black/10 dark:border-white/15 transition-all duration-300 ease-out ${
                      mode === "login" ? "left-1" : "left-[calc(50%+2px)]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`relative z-10 w-1/2 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                      mode === "login"
                        ? "text-zinc-950 dark:text-white"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Se connecter
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className={`relative z-10 w-1/2 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                      mode === "register"
                        ? "text-zinc-950 dark:text-white"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    S'inscrire
                  </button>
                </div>

                {/* OAuth Buttons: GitHub et Google */}
                <div className="space-y-2.5 mb-5">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs transition-all duration-150 hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <GithubIcon className="h-4 w-4" />
                    <span>Continuer avec GitHub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs transition-all duration-150 hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    <span>Continuer avec Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="w-full border-t border-black/10 dark:border-white/10" />
                  <span className="absolute bg-white dark:bg-zinc-950 px-2.5 text-[11px] font-mono text-zinc-400">
                    ou par e-mail
                  </span>
                </div>

                {/* Formulaire Principal */}
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  {mode === "register" && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Nom d'utilisateur
                        </label>
                        {isCheckingUsername && (
                          <span className="text-[10px] text-zinc-400">Vérification...</span>
                        )}
                        {!isCheckingUsername && usernameStatus && (
                          <span
                            className={`text-[10px] font-bold ${
                              usernameStatus.available ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            {usernameStatus.available ? "✓ Disponible" : "✗ Indisponible"}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="alex"
                        required
                        className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Adresse e-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@domaine.com"
                      required
                      className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black py-2.5 text-xs font-semibold shadow-xs hover:scale-[1.01] active:scale-98 transition-all duration-150 cursor-pointer mt-2 disabled:opacity-50"
                  >
                    {mode === "login" ? "Se connecter" : "S'inscrire"}
                  </button>

                  <p className="text-[11px] text-zinc-500 text-center pt-2 leading-relaxed">
                    <span className="block">En continuant, vous acceptez nos</span>
                    <span className="block">
                      <Link href="/terms" className="underline hover:text-zinc-950 dark:hover:text-white transition-colors">
                        Conditions d'utilisation
                      </Link>{" "}
                      et notre{" "}
                      <Link href="/privacy" className="underline hover:text-zinc-950 dark:hover:text-white transition-colors">
                        Politique de Confidentialité
                      </Link>
                      .
                    </span>
                  </p>
                </form>
              </>
            ) : (
              /* Étape 2 : Saisie du Code à 4 chiffres */
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xs">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                    Code de vérification
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Entrez le code à 4 chiffres envoyé à :
                  </p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
                    {email}
                  </p>
                </div>

                {/* 4 Chiffres OTP Input */}
                <div className="py-2">
                  <OtpInput
                    length={4}
                    value={otp}
                    onChange={setOtp}
                    onComplete={(code) => handleVerifyOtp(code)}
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isLoading || otp.length !== 4}
                  className="w-full rounded-xl bg-orange-600 text-white py-2.5 text-xs font-semibold shadow-xs hover:bg-orange-700 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {mode === "login" ? "Se connecter" : "S'inscrire"}
                </button>

                {/* Renvoi de code et retour */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                    }}
                    className="text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Modifier l'email
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={countdown > 0 || isLoading}
                    className="inline-flex items-center gap-1.5 font-semibold text-orange-600 hover:text-orange-700 disabled:text-zinc-400 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                    <span>{countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer le code"}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <AuthForm />
    </Suspense>
  );
}
