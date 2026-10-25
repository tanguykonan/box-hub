/**
 * Configuration centralisée du site Box Hub
 * Toutes les constantes partagées sont rassemblées ici sans aucune modification de valeur.
 */

export const SITE_CONFIG = {
  // URL publique du Hub
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://boxhub.paxiz.org",
  name: "Box Hub",
  shortName: "hub",
  description: "L'Écosystème Universel des Applications Autonomes",

  // Dépôt GitHub et Releases officielles du CLI Box
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || "tanguykonan/box",
  get githubRepoUrl() {
    return `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO || "tanguykonan/box"}`;
  },
  getCliDownloadUrl: (filename: string) => {
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "tanguykonan/box";
    return `https://github.com/${repo}/releases/latest/download/${filename}`;
  },

  // Téléchargement Android Runner (redirige automatiquement vers le dernier release GitHub)
  apkDownloadUrl: "/api/v1/mobile/apk",
  apkGithubRepo: "https://github.com/tanguykonan/box-runner",
  // Commandes d'installation CLI
  getInstallCommandUnix: (host?: string) => `curl -fsSL ${host || SITE_CONFIG.url}/install.sh | bash`,
  getInstallCommandWindows: (host?: string) => `irm ${host || SITE_CONFIG.url}/install.ps1 | iex`,
} as const;

export const STORAGE_LIMIT_MB = 500;
export const STORAGE_LIMIT_BYTES = BigInt(524288000); // 500 MB

export const STORAGE_QUOTAS = {
  FREE: {
    totalBytes: STORAGE_LIMIT_BYTES,
    totalMB: STORAGE_LIMIT_MB,
    maxFileBytes: null,
    maxFileMB: null,
    name: "500 MB",
  },
  TIER_5: {
    totalBytes: STORAGE_LIMIT_BYTES,
    totalMB: STORAGE_LIMIT_MB,
    maxFileBytes: null,
    maxFileMB: null,
    name: "500 MB",
  },
  TIER_10: {
    totalBytes: STORAGE_LIMIT_BYTES,
    totalMB: STORAGE_LIMIT_MB,
    maxFileBytes: null,
    maxFileMB: null,
    name: "500 MB",
  },
  TIER_20: {
    totalBytes: STORAGE_LIMIT_BYTES,
    totalMB: STORAGE_LIMIT_MB,
    maxFileBytes: null,
    maxFileMB: null,
    name: "500 MB",
  },
} as const;

export const BOX_CATEGORIES = [
  { id: "bots", label: "Bots et Automatisation" },
  { id: "api", label: "Services et APIs" },
  { id: "tools", label: "Outils et Utilitaires" },
  { id: "ai", label: "Intelligence Artificielle" },
] as const;

export const BOX_RUNTIMES = [
  { id: "PYTHON", label: "Python", defaultVersion: "3.12" },
  { id: "NODE", label: "Node.js", defaultVersion: "22" },
] as const;
