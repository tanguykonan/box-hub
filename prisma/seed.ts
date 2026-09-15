import {
  PrismaClient,
  Role,
  AdminRole,
  UserTier,
  RuntimeType,
  PackageCategory,
  SubscriptionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du peuplement de la base de données (Seeding exhaustif 18 tables)...");

  // 1. Nettoyage dans l'ordre strict des contraintes de clés étrangères
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dailyMetric.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.alertChannel.deleteMany();
  await prisma.adminInvite.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.packageWebhook.deleteMany();
  await prisma.packageCollaborator.deleteMany();
  await prisma.packageStar.deleteMany();
  await prisma.packageVersion.deleteMany();
  await prisma.package.deleteMany();
  await prisma.apiToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Toutes les tables ont été nettoyées.");

  // =========================================================================
  // 2. PARAMÈTRES SYSTÈME DU HUB
  // =========================================================================

  await prisma.systemSetting.createMany({
    data: [
      {
        key: "maintenance_mode",
        value: "false",
        description: "Bascule globale du mode maintenance sur le Hub et les API",
      },
      {
        key: "max_package_size_bytes",
        value: "104857600", // 100 MB
        description: "Taille maximale autorisée pour un fichier .box lors d'un push",
      },
      {
        key: "platform_notice",
        value: "Bienvenue sur le registre officiel Box Hub !",
        description: "Bannière d'information générale",
      },
    ],
  });

  // =========================================================================
  // 3. UTILISATEURS DU REGISTRE
  // =========================================================================

  const adminUser = await prisma.user.create({
    data: {
      username: "alex",
      email: "alex@boxhub.dev",
      role: Role.ADMIN,
      tier: UserTier.TIER_5,
      quotaBytes: BigInt(10737418240), // 10 GB
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      lastLoginAt: new Date(),
      locale: "fr",
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      username: "sarah",
      email: "sarah.k@clouddev.io",
      role: Role.USER,
      tier: UserTier.TIER_20,
      quotaBytes: BigInt(107374182400), // 100 GB
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      locale: "fr",
    },
  });

  const marcUser = await prisma.user.create({
    data: {
      username: "marc",
      email: "marc@devops.fr",
      role: Role.USER,
      tier: UserTier.TIER_5,
      quotaBytes: BigInt(10737418240), // 10 GB
      lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      locale: "fr",
    },
  });

  const emmaUser = await prisma.user.create({
    data: {
      username: "emma",
      email: "emma.ai@labs.io",
      role: Role.USER,
      tier: UserTier.TIER_10,
      quotaBytes: BigInt(32212254720), // 30 GB
      lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      locale: "fr",
    },
  });

  const lucasUser = await prisma.user.create({
    data: {
      username: "lucas",
      email: "lucas.tools@openweb.org",
      role: Role.USER,
      tier: UserTier.FREE,
      quotaBytes: BigInt(524288000), // 500 MB
      lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      locale: "fr",
    },
  });

  const davidUser = await prisma.user.create({
    data: {
      username: "david",
      email: "david@sqlite-api.net",
      role: Role.USER,
      tier: UserTier.FREE,
      quotaBytes: BigInt(524288000), // 500 MB
      lastLoginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      locale: "fr",
    },
  });

  // =========================================================================
  // 4. COMPTES OAUTH (NextAuth) & JETONS CLI (PAT)
  // =========================================================================

  await prisma.account.create({
    data: {
      userId: adminUser.id,
      type: "oauth",
      provider: "github",
      providerAccountId: "gh_12345678",
      access_token: "gho_mock_access_token_alex",
      token_type: "Bearer",
      scope: "read:user,user:email",
    },
  });

  await prisma.apiToken.createMany({
    data: [
      {
        userId: adminUser.id,
        name: "CLI Macbook Pro",
        tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        tokenPrefix: "box_pat_9a8f",
        scopes: ["packages:read", "packages:write", "admin:all"],
        lastUsedAt: new Date(Date.now() - 3 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        name: "Token Équipe CI/CD",
        tokenHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        tokenPrefix: "box_pat_33bf",
        scopes: ["packages:read"],
        lastUsedAt: new Date(Date.now() - 14 * 60 * 1000),
      },
    ],
  });

  // =========================================================================
  // 5. PAQUETS, VERSIONS & METADONNÉES
  // =========================================================================

  // Paquet 1 : Discord Bot (Alex)
  const discordBot = await prisma.package.create({
    data: {
      name: "discord-bot",
      description: "Bot Discord autonome et modulaire avec commandes vocales, lecteur audio haute fidélité et modération automatique avec base SQLite locale hermétique.",
      runtime: RuntimeType.NODEJS,
      runtimeVersion: "26.0.0",
      category: PackageCategory.BOTS,
      isPrivate: false,
      isProtected: true,
      tags: ["#discord", "#bot", "#audio", "#sqlite"],
      license: "MIT",
      authorId: adminUser.id,
      totalDownloads: 30700,
      versions: {
        create: [
          {
            version: "1.0.4",
            tag: "latest",
            checksumSha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            fileSizeBytes: BigInt(14889779),
            storageKey: "packages/alex/discord-bot/1.0.4/discord-bot.box",
            targetArch: "universal",
            downloadCount: 18400,
            readme: "### Fonctionnalités\n- Modération automatique : Anti-spam et filtrage.\n- Lecteur audio haute fidélité.\n- Stockage SQLite local autonome.\n\n### Utilisation\n```bash\nbox pull alex/discord-bot:latest\nbox run alex/discord-bot:latest -e DISCORD_TOKEN=\"votre_token\"\n```",
            envVariables: {
              DISCORD_TOKEN: { description: "Token secret de votre bot", required: true, secret: true },
              PREFIX: { description: "Préfixe des commandes", default: "!" },
            },
          },
          {
            version: "1.0.3",
            tag: "v1.0.3",
            checksumSha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            fileSizeBytes: BigInt(14575206),
            storageKey: "packages/alex/discord-bot/1.0.3/discord-bot.box",
            downloadCount: 9200,
            readme: "Version stable précédente avec modération de base.",
          },
          {
            version: "1.0.0",
            tag: "v1.0.0",
            checksumSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
            fileSizeBytes: BigInt(13421772),
            storageKey: "packages/alex/discord-bot/1.0.0/discord-bot.box",
            downloadCount: 3100,
            readme: "Version initiale de lancement.",
          },
        ],
      },
    },
  });

  // Paquet 2 : FastAPI Groq (Sarah)
  const fastapiGroq = await prisma.package.create({
    data: {
      name: "fastapi-groq",
      description: "Microservice FastAPI haute performance de génération de lettres de motivation, analyse d'offres et parsing de CV propulsé par Groq LLaMA 3.3.",
      runtime: RuntimeType.PYTHON,
      runtimeVersion: "3.12",
      category: PackageCategory.AI,
      isPrivate: false,
      isProtected: true,
      tags: ["#fastapi", "#ai", "#groq", "#llama"],
      license: "Apache-2.0",
      authorId: sarahUser.id,
      totalDownloads: 17500,
      versions: {
        create: [
          {
            version: "1.2.0",
            tag: "latest",
            checksumSha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
            fileSizeBytes: BigInt(23907532),
            storageKey: "packages/sarah/fastapi-groq/1.2.0/fastapi-groq.box",
            downloadCount: 12100,
            readme: "### FastAPI Groq v1.2.0\nSupport complet LLaMA 3.3 70B via Groq Cloud API.",
            envVariables: {
              GROQ_API_KEY: { description: "Clé API Groq Cloud", required: true, secret: true },
              PORT: { description: "Port d'écoute HTTP", default: "8000" },
            },
          },
          {
            version: "1.1.0",
            tag: "v1.1.0",
            checksumSha256: "8750be66d79e8e04e4ec6f55db67b3ba577bdcc045c71b3e51f49615a6b0c2a2",
            fileSizeBytes: BigInt(22544384),
            storageKey: "packages/sarah/fastapi-groq/1.1.0/fastapi-groq.box",
            downloadCount: 5400,
          },
        ],
      },
    },
  });

  // Paquets 3 à 6
  const telegramBot = await prisma.package.create({
    data: {
      name: "telegram-notifier",
      description: "Assistant d'alertes financières et surveillance crypto en temps réel avec SQLite embarqué et webhooks entrants.",
      runtime: RuntimeType.PYTHON,
      runtimeVersion: "3.11",
      category: PackageCategory.BOTS,
      tags: ["#telegram", "#alerts", "#crypto"],
      authorId: marcUser.id,
      totalDownloads: 6900,
      versions: {
        create: [
          {
            version: "2.0.1",
            tag: "latest",
            checksumSha256: "275a2d677d3f27f07e59fe9fcb2ec63c7ef2882897fa1f21cc74184ea0bc7d7f",
            fileSizeBytes: BigInt(19398656),
            storageKey: "packages/marc/telegram-notifier/2.0.1/telegram-notifier.box",
            downloadCount: 6900,
          },
        ],
      },
    },
  });

  const ollamaBridge = await prisma.package.create({
    data: {
      name: "ollama-bridge",
      description: "Passerelle proxy ultra-rapide compatible API OpenAI vers les modèles locaux Ollama avec streaming tokenisé.",
      runtime: RuntimeType.NODEJS,
      runtimeVersion: "22.0.0",
      category: PackageCategory.AI,
      tags: ["#ollama", "#ai", "#proxy", "#openai"],
      isProtected: true,
      authorId: emmaUser.id,
      totalDownloads: 24700,
      versions: {
        create: [
          {
            version: "1.0.0",
            tag: "latest",
            checksumSha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
            fileSizeBytes: BigInt(16882073),
            storageKey: "packages/emma/ollama-bridge/1.0.0/ollama-bridge.box",
            downloadCount: 24700,
          },
        ],
      },
    },
  });

  const puppeteerScraper = await prisma.package.create({
    data: {
      name: "puppeteer-scraper",
      description: "Scraper web headless haute performance avec rotation d'empreintes et export JSON ou CSV sans configuration Chromium.",
      runtime: RuntimeType.NODEJS,
      runtimeVersion: "22.0.0",
      category: PackageCategory.TOOLS,
      tags: ["#scraping", "#puppeteer", "#automation"],
      isProtected: true,
      authorId: lucasUser.id,
      totalDownloads: 9300,
      versions: {
        create: [
          {
            version: "1.0.4",
            tag: "latest",
            checksumSha256: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
            fileSizeBytes: BigInt(40265318),
            storageKey: "packages/lucas/puppeteer-scraper/1.0.4/puppeteer-scraper.box",
            downloadCount: 9300,
          },
        ],
      },
    },
  });

  const sqliteApi = await prisma.package.create({
    data: {
      name: "sqlite-rest-api",
      description: "Générateur automatique d'API REST sécurisée avec OpenAPI et JWT au-dessus de toute base SQLite locale.",
      runtime: RuntimeType.PYTHON,
      runtimeVersion: "3.13",
      category: PackageCategory.API,
      tags: ["#sqlite", "#api", "#rest", "#openapi"],
      isProtected: true,
      authorId: davidUser.id,
      totalDownloads: 5800,
      versions: {
        create: [
          {
            version: "1.0.0",
            tag: "latest",
            checksumSha256: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
            fileSizeBytes: BigInt(20656947),
            storageKey: "packages/david/sqlite-rest-api/1.0.0/sqlite-rest-api.box",
            downloadCount: 5800,
          },
        ],
      },
    },
  });

  // =========================================================================
  // 6. COLLABORATIONS, WEBHOOKS & ÉTOILES
  // =========================================================================

  await prisma.packageCollaborator.create({
    data: {
      packageId: discordBot.id,
      userId: sarahUser.id,
      role: "write",
    },
  });

  await prisma.packageWebhook.create({
    data: {
      packageId: discordBot.id,
      url: "https://discord.com/api/webhooks/1209/deployments",
      events: ["push", "release"],
      isActive: true,
    },
  });

  await prisma.packageStar.createMany({
    data: [
      { userId: adminUser.id, packageId: fastapiGroq.id },
      { userId: adminUser.id, packageId: ollamaBridge.id },
      { userId: sarahUser.id, packageId: discordBot.id },
      { userId: sarahUser.id, packageId: ollamaBridge.id },
      { userId: marcUser.id, packageId: discordBot.id },
      { userId: emmaUser.id, packageId: discordBot.id },
      { userId: lucasUser.id, packageId: sqliteApi.id },
      { userId: davidUser.id, packageId: puppeteerScraper.id },
    ],
  });

  // =========================================================================
  // 7. ABONNEMENTS & TRANSACTIONS (Monétisation R2)
  // =========================================================================

  await prisma.subscription.createMany({
    data: [
      {
        userId: sarahUser.id,
        tier: UserTier.TIER_20,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date("2026-02-01"),
        currentPeriodEnd: new Date("2026-03-01"),
        stripeCustomerId: "cus_sarah_123",
        stripeSubscriptionId: "sub_sarah_123",
      },
      {
        userId: adminUser.id,
        tier: UserTier.TIER_5,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date("2026-02-15"),
        currentPeriodEnd: new Date("2026-03-15"),
        stripeCustomerId: "cus_alex_123",
        stripeSubscriptionId: "sub_alex_123",
      },
    ],
  });

  await prisma.paymentTransaction.createMany({
    data: [
      {
        userId: sarahUser.id,
        tierName: "Supporter 20 € (100 Go)",
        amount: 2000,
        currency: "EUR",
        status: "paid",
        externalId: "tx_101",
        createdAt: new Date(),
      },
      {
        userId: emmaUser.id,
        tierName: "Donateur 10 € (30 Go)",
        amount: 1000,
        currency: "EUR",
        status: "paid",
        externalId: "tx_102",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        tierName: "Sponsor 5 € (10 Go)",
        amount: 500,
        currency: "EUR",
        status: "paid",
        externalId: "tx_103",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        userId: marcUser.id,
        tierName: "Sponsor 5 € (10 Go)",
        amount: 500,
        currency: "EUR",
        status: "paid",
        externalId: "tx_104",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // =========================================================================
  // 8. ÉQUIPE D'ADMINISTRATION & ALERTES
  // =========================================================================

  await prisma.adminInvite.create({
    data: {
      email: "thomas.infra@boxhub.dev",
      name: "Thomas B.",
      role: AdminRole.ADMINISTRATOR,
      token: "adm_tok_invite_thomas_9a8f",
      accepted: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.alertChannel.createMany({
    data: [
      {
        type: "telegram",
        name: "Telegram Bot Alertes",
        isEnabled: true,
        target: "bot7123984712:AAFqW8912389123_xXz",
        extraTarget: "-100234891234",
        triggers: { newDonation: true, trafficSpike: true, storageSaturation: true },
      },
      {
        type: "discord",
        name: "Discord Webhook Alerte",
        isEnabled: true,
        target: "https://discord.com/api/webhooks/1209/box-alerts",
        triggers: { newDonation: true, adminChanges: true, maintenanceToggle: true },
      },
    ],
  });

  // =========================================================================
  // 9. NOTIFICATIONS & JOURNAL D'AUDIT DU REGISTRE
  // =========================================================================

  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        category: "star",
        title: "",
        message: "@sarah a attribué une étoile à votre box discord-bot.",
        level: "info",
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        category: "pull",
        title: "",
        message: "Nouveau pull sur votre box fastapi-groq:v1.2.0.",
        level: "info",
        isRead: false,
        createdAt: new Date(Date.now() - 18 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        category: "milestone",
        title: "",
        message: "Votre box discord-bot a franchi le cap des 50 pulls.",
        level: "success",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        platform: "cli",
        action: "box push alex/discord-bot:v1.0.4",
        status: "success",
        durationMs: 1800,
        ipAddress: "127.0.0.1",
        deviceInfo: "Macbook Pro M2 (macOS 15)",
        createdAt: new Date(Date.now() - 4 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        platform: "web",
        action: "box tag release alex/discord-bot:latest -> v1.0.4",
        status: "success",
        durationMs: 42,
        ipAddress: "127.0.0.1",
        deviceInfo: "Chrome Desktop",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  });

  // =========================================================================
  // 10. TÉLÉMÉTRIE QUOTIDIENNE (Historique 7 jours)
  // =========================================================================

  const today = new Date();
  const dailyPoints = [
    { offset: 6, pulls: 8200, signups: 6, bandwidth: BigInt(180000000000) },
    { offset: 5, pulls: 9400, signups: 8, bandwidth: BigInt(210000000000) },
    { offset: 4, pulls: 11100, signups: 12, bandwidth: BigInt(260000000000) },
    { offset: 3, pulls: 10800, signups: 9, bandwidth: BigInt(240000000000) },
    { offset: 2, pulls: 13500, signups: 15, bandwidth: BigInt(310000000000) },
    { offset: 1, pulls: 8900, signups: 5, bandwidth: BigInt(190000000000) },
    { offset: 0, pulls: 9340, signups: 7, bandwidth: BigInt(200000000000) },
  ];

  for (const pt of dailyPoints) {
    const d = new Date(today);
    d.setDate(d.getDate() - pt.offset);
    d.setHours(0, 0, 0, 0);

    await prisma.dailyMetric.create({
      data: {
        date: d,
        pullsCount: pt.pulls,
        signupsCount: pt.signups,
        bandwidthBytes: pt.bandwidth,
      },
    });
  }

  console.log("✅ Seeding des 18 tables terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
