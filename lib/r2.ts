import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "boxhub-packages";
const publicDomain = process.env.R2_PUBLIC_DOMAIN || "";

export const isR2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey
);

/**
 * Client AWS S3 configuré pour Cloudflare R2 (Endpoint S3 Cloudflare).
 * Conforme à la documentation officielle Cloudflare R2.
 */
export const r2Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    })
  : null;

/**
 * Envoie un fichier (buffer / blob) sur le bucket Cloudflare R2.
 */
export async function uploadToR2({
  key,
  buffer,
  contentType = "application/gzip",
  metadata = {},
}: {
  key: string;
  buffer: Buffer | Uint8Array;
  contentType?: string;
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; key: string; error?: string }> {
  try {
    if (!r2Client) {
      console.warn("⚠️ [Cloudflare R2] Identifiants R2 non configurés. Enregistrement local simulé.");
      return { success: true, key };
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await r2Client.send(command);
    console.log(`☁️ [Cloudflare R2] Fichier téléversé avec succès : ${key}`);
    return { success: true, key };
  } catch (err: any) {
    console.error("❌ [Cloudflare R2 Upload Error]:", err);
    return { success: false, key, error: err?.message || "Erreur upload Cloudflare R2" };
  }
}

/**
 * Génère une URL de téléchargement pré-signée temporaire pour un paquet privé ou protégé.
 */
export async function getR2PresignedDownloadUrl({
  key,
  expiresIn = 3600, // 1 heure par défaut
}: {
  key: string;
  expiresIn?: number;
}): Promise<string | null> {
  try {
    if (!r2Client) return null;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (err) {
    console.error("❌ [Cloudflare R2 Presign Error]:", err);
    return null;
  }
}

/**
 * Retourne l'URL publique de téléchargement direct si un domaine public ou sous-domaine r2.dev est configuré.
 */
export function getR2PublicUrl(key: string): string {
  if (publicDomain) {
    const cleanDomain = publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain;
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    return `${cleanDomain}/${cleanKey}`;
  }
  return `/api/v1/packages/download/${encodeURIComponent(key)}`;
}

/**
 * Supprime un fichier du bucket Cloudflare R2.
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    if (!r2Client) return true;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (err) {
    console.error("❌ [Cloudflare R2 Delete Error]:", err);
    return false;
  }
}
