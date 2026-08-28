import React, { useEffect } from 'react';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  // Datos opcionales para JSON-LD de Perfil Profesional
  profileData?: {
    id: string;
    name: string;
    profession?: string;
    image?: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    priceRange?: string;
  };
  // Datos opcionales para Lista de Servicios / Búsqueda
  searchData?: {
    category?: string;
    location?: string;
    totalResults?: number;
  };
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  profileData,
  searchData,
}) => {
  useEffect(() => {
    // 1. Metadatos Dinámicos en el <head>
    const defaultTitle = "GigeJob - Encuentra profesionales de confianza cerca de ti";
    const defaultDesc = "Conecta con los mejores profesionales y expertos en tu zona de forma rápida, segura y transparente en GigeJob.";

    const finalTitle = title ? `${title} | GigeJob` : defaultTitle;
    const finalDesc = description || defaultDesc;

    document.title = finalTitle;

    // Actualizar o crear <meta name="description">
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = finalDesc;

    // Actualizar o crear <meta name="keywords">
    if (keywords) {
      let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }

    // Actualizar Open Graph Tags (og:title, og:description)
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = finalTitle;

    let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = finalDesc;

    // Canonical URL
    if (canonicalUrl) {
      let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = canonicalUrl;
    }

    // 2. Datos Estructurados JSON-LD Ocultos
    const scriptId = 'seo-jsonld-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    let jsonLdData: any = null;

    if (profileData) {
      const ratingVal = profileData.rating && profileData.rating > 0 ? profileData.rating : 5.0;
      const countVal = profileData.reviewCount && profileData.reviewCount > 0 ? profileData.reviewCount : 1;

      jsonLdData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${window.location.origin}/perfil/${profileData.id}`,
        "name": profileData.name,
        "image": profileData.image || `${window.location.origin}/logo.png`,
        "description": profileData.description || `Servicios profesionales de ${profileData.profession || 'calidad'} en ${profileData.city || 'tu zona'}.`,
        "telephone": profileData.phone || undefined,
        "email": profileData.email || undefined,
        "priceRange": profileData.priceRange || "€€",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": profileData.city || "España",
          "streetAddress": profileData.address || undefined,
          "addressCountry": "ES"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ratingVal.toFixed(1),
          "reviewCount": countVal,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    } else if (searchData && (searchData.category || searchData.location)) {
      const categoryStr = searchData.category || "Servicios";
      const locationStr = searchData.location || "España";
      jsonLdData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `${categoryStr} en ${locationStr}`,
        "serviceType": categoryStr,
        "provider": {
          "@type": "Organization",
          "name": "GigeJob",
          "url": window.location.origin
        },
        "areaServed": {
          "@type": "City",
          "name": locationStr
        },
        "description": `Catálogo de profesionales de ${categoryStr} disponibles en ${locationStr}.`
      };
    } else {
      // Default WebSite & Organization Schema
      jsonLdData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GigeJob",
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/explorar?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
    }

    scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);

    return () => {
      // Clean up script tag content if unmounting
    };
  }, [title, description, keywords, canonicalUrl, profileData, searchData]);

  return null;
};

export default SeoHead;
