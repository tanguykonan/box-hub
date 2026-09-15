import crypto from "crypto";

/**
 * Vérifie si une adresse e-mail vérifiée possède une photo de profil réelle sur Gravatar.
 * Ne devine aucune fausse information : renvoie null si aucune photo n'existe pour cet e-mail.
 */
export async function getVerifiedGravatar(email: string): Promise<string | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const hash = crypto.createHash("md5").update(cleanEmail).digest("hex");
    const testUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(testUrl, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 200) {
      return `https://www.gravatar.com/avatar/${hash}?s=200`;
    }
  } catch {
    // Si timeout ou pas de connexion réseau, on ne bloque pas
  }
  return null;
}
