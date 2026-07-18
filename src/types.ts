export type ListingType = 'offer' | 'search';
export type UserRole = 'user' | 'professional';

export const PRO_PLANS = [
  {
    id: 'basic',
    name: 'Plan Basic',
    price: 0,
    priceQuarterly: 0,
    features: ['Perfil básico', '1 Reserva cada 48h'],
    limits: {
      maxBookingsPerDay: 1,
      maxListingsPerAccount: 1,
      maxConcurrentBookings: 1
    }
  },
  {
    id: 'medium',
    name: 'Plan Medium',
    price: 5,
    priceQuarterly: 12,
    isRecommended: true,
    features: ['Perfil Medium', '1 Reserva cada 24h'],
    limits: {
      maxBookingsPerDay: 1,
      maxListingsPerAccount: 1,
      maxConcurrentBookings: 1
    }
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: 10,
    priceQuarterly: 24,
    features: [
      'Perfil Premium',
      'Publicación solo 1 categoría',
      'Permite reserva sin limite'
    ],
    limits: {
      maxBookingsPerDay: 999,
      maxListingsPerAccount: 1,
      maxConcurrentBookings: 1
    }
  },
  {
    id: 'premium-pro',
    name: 'Plan Premium Pro',
    price: 15,
    priceQuarterly: 36,
    features: [
      'Perfil Premium Pro',
      'Publicación hasta 2 categoría',
      'Reserva sin limite',
      'Hasta 2 reservas misma franja horaria'
    ],
    limits: {
      maxBookingsPerDay: 999,
      maxListingsPerAccount: 2,
      maxConcurrentBookings: 2
    }
  }
];

export interface Address {
  streetType: string;
  streetName: string;
  number: string;
  block?: string;
  floor?: string;
  door?: string;
  postalCode: string;
  locality: string;
  province: string;
}

export interface DayShift {
  day: string;
  slots: { start: string; end: string }[];
}

export interface BillingInfo {
  name: string;
  documentId: string;
  phone: string;
  address: Address;
}

export interface UserProfile {
  id: string;
  customId?: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  firstName: string;
  lastName1: string;
  lastName2: string;
  documentId: string;
  phoneNumber: string;
  address: Address;
  photoUrl?: string;
  acceptPromotions?: boolean;
  acceptTerms?: boolean;
  hasClaimedPromotion?: boolean;
  claimedPromotionId?: string;
  blockedUsers?: string[];
  certifications?: {
    serviceGuarantee: boolean;
    professionalInsurance: boolean;
  };
  gallery?: { url: string; category: string }[];
  professionalInfo?: {
    availability: DayShift[];
    workLocation: string;
    workRadius: number;
    workCoords?: [number, number];
    billing: BillingInfo;
    plan?: string;
    planBillingCycle?: 'monthly' | 'quarterly';
    planAutoRenew?: boolean;
    planStatus?: 'active' | 'cancelled';
    planStartDate?: string;
    planEndDate?: string;
    planLastPaymentDate?: string;
    planPaymentMethod?: string;
    planPaymentStatus?: string;
    planHistory?: {
      planId: string;
      planName: string;
      startDate: string;
      endDate?: string;
      status: 'expired' | 'cancelled';
      paymentMethod?: string;
    }[];
  };
  settings?: {
    smartSuggestions?: boolean;
    locationRadius?: number;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  accountStatus?: 'active' | 'suspended' | 'banned';
  suspendedUntil?: any;
  banReason?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  documents?: {
    name: string;
    status: string;
    url: string;
  }[];
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  clientId: string;
  professionalId: string;
  date: string;
  time: string;
  duration?: string;
  location: string;
  description: string;
  totalCost: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  price?: number;
  unit?: 'hour' | 'project' | 'month';
  type: ListingType;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  travelDistance?: number;
  availability?: DayShift[];
  additionalInfo?: string;
  views?: number;
  author: {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    rating?: number;
    isVerified?: boolean;
    certifications?: {
      serviceGuarantee: boolean;
      professionalInsurance: boolean;
    };
    gallery?: { url: string, category: string }[];
  };
  imageUrl?: string;
  createdAt: string;
  expiresAt?: string;
  status?: 'active' | 'inactive' | 'disabled' | 'deleted';
  tags: string[];
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary?: string;
  content: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  published: boolean;
  category?: string;
}

export interface FooterConfig {
  columns: FooterColumn[];
  copyrightText: string;
  pages?: Record<string, string>;
  socialLinks?: SocialLink[];
}

export const CATEGORIES = [
  'Limpieza',
  'Montaje de muebles',
  'Fontanería',
  'Electricidad',
  'Clases particulares',
  'Cuidado de personas',
  'Jardinería',
  'Informática',
  'Otros'
];

export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'Limpieza': ['limpieza', 'limpiador', 'limpiadora', 'limpiar', 'aseo', 'chica', 'asistenta'],
  'Montaje de muebles': ['montaje', 'montador', 'carpintero', 'armar', 'mueble', 'ikea', 'armario', 'estanteria'],
  'Fontanería': ['fontanería', 'fontanero', 'plomero', 'tubería', 'fuga', 'desatasco', 'grifo', 'agua', 'cisterna'],
  'Electricidad': ['electricidad', 'electricista', 'luz', 'enchufe', 'cuadro', 'cortocircuito', 'cable', 'iluminacion'],
  'Clases particulares': ['clase', 'clases', 'profesor', 'profesora', 'tutor', 'enseñar', 'apoyo', 'matemáticas', 'inglés', 'repaso'],
  'Cuidado de personas': ['cuidado', 'cuidador', 'cuidadora', 'niñera', 'canguro', 'ancianos', 'acompañamiento', 'enfermero', 'enfermera', 'mayores'],
  'Jardinería': ['jardinería', 'jardinero', 'jardinera', 'plantas', 'poda', 'césped', 'regar', 'arboles', 'jardin'],
  'Informática': ['informática', 'informático', 'ordenador', 'computadora', 'pc', 'virus', 'formatear', 'tecnico', 'programador', 'mac', 'windows'],
  'Otros': []
};

export function isSearchMatch(search: string, listing: { title?: string, description?: string, category?: string }): boolean {
  if (!search) return true;
  
  const searchLower = search.toLowerCase();
  
  // 1. Direct match in title or description
  const title = listing.title || '';
  const description = listing.description || '';
  if (title.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)) {
    return true;
  }
  
  // 2. Synonym match
  // For each category, if the search term matches any synonym (or the category name itself),
  // we consider it a match if the listing's category is that category.
  for (const [categoryName, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (categoryName.toLowerCase().includes(searchLower) || synonyms.some(s => s.toLowerCase().includes(searchLower))) {
      // The search term points to this category
      if (listing.category === categoryName) {
        return true;
      }
    }
  }
  
  // 3. Reverse synonym match
  // If the listing belongs to a category, and the search term is found within that category's synonyms, it's covered by #2.
  // What if the user searched for something else, but we want to match? The above should cover it.
  
  return false;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [
    {
      title: 'JobPop',
      links: [
        { label: 'Quiénes somos', url: '#page-quienes-somos' },
        { label: 'Cómo funciona', url: '#page-como-funciona' },
        { label: 'Brand Book', url: '#page-brand-book' },
        { label: 'Prensa', url: '#page-prensa' },
        { label: 'Empleo', url: '#page-empleo' },
        { label: 'Sostenibilidad', url: '#page-sostenibilidad' },
        { label: 'JobPop envíos', url: '#page-envios' },
        { label: 'Blog', url: '/blog' }
      ]
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de ayuda', url: '#page-ayuda' },
        { label: 'Normas de la comunidad', url: '#page-normas' },
        { label: 'Consejos de seguridad', url: '#page-seguridad' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Aviso legal', url: '#page-aviso-legal' },
        { label: 'Condiciones de uso', url: '#page-condiciones' },
        { label: 'Política de privacidad', url: '#page-privacidad' },
        { label: 'Política de Cookies', url: '#page-cookies' }
      ]
    },
    {
      title: 'JobPop PRO',
      links: [
        { label: 'Multicategoría', url: '#page-pro-multicategoria' },
        { label: 'Coches', url: '#page-pro-coches' }
      ]
    }
  ],
  copyrightText: '© 2013-2026 JobPop. Todos los derechos reservados',
  pages: {}
};

export interface Review {
  id: string;
  bookingId: string;
  authorId: string;
  authorName?: string;
  authorPhotoUrl?: string;
  clientName?: string;
  clientPhotoUrl?: string;
  targetId: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  createdAt: any;
}

export interface ReviewModalConfig {
  title: string;
  subtitle: string;
  starLabel: string;
  commentLabel: string;
  commentPlaceholder: string;
  photoLabel: string;
  submitButtonText: string;
}

export const DEFAULT_REVIEW_MODAL_CONFIG: ReviewModalConfig = {
  title: 'Valora el servicio',
  subtitle: 'Por favor, puntúa el trabajo realizado para poder continuar.',
  starLabel: 'Puntuación',
  commentLabel: 'Observaciones (opcional)',
  commentPlaceholder: 'Escribe aquí tus observaciones sobre el servicio...',
  photoLabel: 'Adjuntar foto (opcional)',
  submitButtonText: 'Enviar valoración'
};
