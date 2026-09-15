"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { GithubIcon } from "../ui/GithubIcon";
import { GoogleIcon } from "../ui/GoogleIcon";
import { OtpInput } from "./OtpInput";
import { useToast } from "../ui/Toast";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export function AuthModal({ isOpen, initialMode = "login", onClose }: AuthModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState<"form" | "otp">("form");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    message?: string;
  } | null>(null);

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setStep("form");
    setOtp("");
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Vérification de la disponibilité du username
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

  if (!isOpen) return null;

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
      showToast(`Code envoyé à ${email}`, "success");
    } catch {
      showToast("Connexion impossible pour le moment. Veuillez vérifier votre réseau.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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

      onClose();
      router.push("/dashboard");
      router.refresh();
    } catch {
      showToast("Une erreur est survenue lors de la vérification. Veuillez réessayer.", "error");
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "github" | "google") => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-2xl z-10 overflow-hidden">
        
        {/* Overlay de chargement (Gel de l'écran avec cercle rotatif) */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent shadow-xs" />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "form" ? (
          <>
            {/* Sliding Switcher */}
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

            {/* OAuth Buttons */}
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

            {/* Form */}
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              {mode === "register" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
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
                    className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@domaine.com"
                  required
                  className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                  <Link
                    href="/terms"
                    onClick={onClose}
                    className="underline hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    Conditions d'utilisation
                  </Link>{" "}
                  et notre{" "}
                  <Link
                    href="/privacy"
                    onClick={onClose}
                    className="underline hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    Politique de Confidentialité
                  </Link>
                  .
                </span>
              </p>
            </form>
          </>
        ) : (
          /* Step 2: 4-digit code */
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xs">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Code de vérification
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Envoyé à : <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{email}</span>
              </p>
            </div>

            <div className="py-1">
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

            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                }}
                className="text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Retour
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || isLoading}
                className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 disabled:text-zinc-400 cursor-pointer disabled:cursor-not-allowed text-[11px]"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>{countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
