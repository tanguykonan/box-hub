"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Vérification du consentement initial
    const checkConsent = () => {
      try {
        const raw = localStorage.getItem("box_hub_cookie_consent");
        if (raw) {
          const parsed = JSON.parse(raw);
          setHasConsent(Boolean(parsed.analytics));
        }
      } catch {
        setHasConsent(false);
      }
    };

    checkConsent();

    // Écoute des mises à jour de consentement en temps réel
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setHasConsent(Boolean(customEvent.detail.analytics));
      }
    };

    window.addEventListener("boxhub_cookie_consent_changed", handleConsentChange);
    return () => {
      window.removeEventListener("boxhub_cookie_consent_changed", handleConsentChange);
    };
  }, []);

  // Si aucun ID GA n'est configuré ou si les cookies analytiques sont refusés, ne rien injecter
  if (!gaId || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  );
}
