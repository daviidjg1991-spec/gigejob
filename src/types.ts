export type ListingType = 'offer' | 'search';
export type ListingStatus = 'active' | 'inactive' | 'disabled' | 'deleted' | 'owner_deleted' | 'expired';
export type UserRole = 'user' | 'professional' | 'admin';

// ADMIN CONFIGURATIONS (Hardcoded)
export const ENABLE_SEARCH_PROFESSIONALS = false;


export const PRO_PLANS = [
  {
    "name": "Plan Basic",
    "price": 0,
    "id": "basic",
    "priceQuarterly": 0,
    "limits": {
      "maxConcurrentBookings": 1,
      "maxListingsPerAccount": 1,
      "maxBookingsPerDay": 1,
      "activeDaysPerListing": 30
    },
    "features": [
      "Perfil básico",
      "1 Reserva cada 48h"
    ]
  },
  {
    "priceQuarterly": 12,
    "id": "medium",
    "price": 5,
    "name": "Plan Medium",
    "features": [
      "Perfil Medium",
      "1 Reserva cada 24h"
    ],
    "limits": {
      "maxConcurrentBookings": 1,
      "maxListingsPerAccount": 1,
      "maxBookingsPerDay": 1,
      "activeDaysPerListing": 30
    },
    "isRecommended": true
  },
  {
    "limits": {
      "maxListingsPerAccount": 1,
      "maxConcurrentBookings": 1,
      "maxBookingsPerDay": 999,
      "activeDaysPerListing": 30
    },
    "features": [
      "Perfil Premium",
      "Publicación solo 1 categoría",
      "Permite reserva sin limite"
    ],
    "id": "premium",
    "priceQuarterly": 24,
    "name": "Plan Premium",
    "price": 10
  },
  {
    "limits": {
      "maxListingsPerAccount": 999,
      "maxConcurrentBookings": 4,
      "maxBookingsPerDay": 999,
      "activeDaysPerListing": 30
    },
    "features": [
      "Perfil Premium Pro",
      "Publicación hasta 999 categorías",
      "Reserva sin limite",
      "Hasta 4 reservas misma franja horaria"
    ],
    "price": 15,
    "name": "Plan Premium Pro",
    "priceQuarterly": 36,
    "id": "premium-pro"
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
  createdAt?: any;
  accountStatus?: 'active' | 'suspended' | 'banned';
  suspendedUntil?: any;
  banReason?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  recommendationsCount?: number;
  referredBy?: string;
  recommendationRegistrationsCount?: number;
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
  headerImage?: string;
  images?: string[];
  createdAt: string;
  publishedAt?: string;
  reactivatedAt?: string;
  expiresAt?: string;
  status?: 'active' | 'inactive' | 'disabled' | 'deleted' | 'expired' | 'owner_deleted';
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
  "columns": [
    {
      "title": "GigeJob",
      "links": [
        {
          "label": "Quiénes somos",
          "url": "#page-quienes-somos"
        },
        {
          "label": "Cómo funciona",
          "url": "#page-como-funciona"
        },
        {
          "label": "Blog",
          "url": "/blog"
        }
      ]
    },
    {
      "title": "Soporte",
      "links": [
        {
          "label": "Centro de ayuda",
          "url": "#page-ayuda"
        },
        {
          "label": "Normas de la comunidad",
          "url": "#page-normas"
        },
        {
          "label": "Consejos de seguridad",
          "url": "#page-seguridad"
        }
      ]
    },
    {
      "title": "Legal",
      "links": [
        {
          "label": "Aviso legal",
          "url": "#page-aviso-legal"
        },
        {
          "label": "Condiciones de uso",
          "url": "#page-condiciones"
        },
        {
          "label": "Política de privacidad",
          "url": "#page-privacidad"
        },
        {
          "label": "Política de Cookies",
          "url": "#page-cookies"
        }
      ]
    }
  ],
  "copyrightText": "© 2026 GigeJob. Todos los derechos reservados",
  "pages": {
    "#page-aviso-legal": "# Aviso legal\n\nAVISO LEGAL Y CONDICIONES GENERALES DE CONTRATACIÓN\n1. Información Identificativa (LSSI-CE)\nEn cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se reflejan los siguientes datos del titular:\n\nTitular / Fundador y CEO: David Jimenez Gomez\n\nN.I.F. / D.N.I.: 53671670C\n\nDomicilio Social: Calle Yecla, 2\n\nTeléfono de contacto: 623811991\n\nCorreo electrónico: info@gigejob.com\n\nNombre Comercial / Web: gigejob (en adelante, \"la Plataforma\" o \"gigejob\")\n\n2. Naturaleza del Servicio e Intermediación\ngigejob opera estrictamente como un entorno o marketplace de intermediación técnica digital. La función única de la plataforma es conectar a usuarios que demandan la ejecución de determinadas prestaciones (en adelante, \"Clientes\") con trabajadores independientes o mercantiles que ofertan dichas capacidades (en adelante, \"Profesionales\").\n\n⚠️ Cláusula de Exclusión Absoluta de Responsabilidad: El contrato de arrendamiento de servicios, obra o acuerdo laboral se formaliza exclusiva y directamente entre el Cliente y el Profesional. David Jimenez Gomez no es parte, ni directa, ni indirecta, ni subsidiaria, de dicha relación comercial. La responsabilidad civil, fiscal, laboral o de cualquier otra índole derivada del trabajo final recae al 100% sobre el Cliente y el Profesional intervinientes. gigejob no garantiza la calidad, idoneidad, puntualidad ni licitud de los servicios concertados.\n\n3. Condiciones de Acceso, Registro y Edad Mínima\nEdad Mínima: El acceso y registro en gigejob está estrictamente restringido a personas físicas mayores de 18 años con plena capacidad de obrar, o personas jurídicas legalmente constituidas. Queda prohibido el registro de menores de edad.\n\nVerificación Antifraude: Los Clientes aportarán los datos básicos requeridos para el despliegue del servicio. Los Profesionales quedan sujetos a un proceso interno de verificación documental donde deberán aportar su CIF, NIF profesional o documentación oficial de identidad. gigejob se reserva el derecho de suspender o extinguir cuentas que muestren datos sospechosos o falsos.\n\n4. Régimen Económico y Métodos de Pago\nEl ecosistema financiero de gigejob se divide en dos modalidades operativas coexistentes:\n\nA. Modalidad de Pago en Mano (Transición / Directo)\nLos usuarios pueden acordar voluntariamente el pago físico y directo en mano una vez ejecutado el encargo.\n\nAviso Legal: Esta modalidad corre bajo la exclusiva cuenta y riesgo de los Clientes y Profesionales. gigejob no tiene constancia ni trazabilidad de estos flujos monetarios, por lo que no admitirá disputas, reclamaciones de impago ni solicitudes de reembolso sobre servicios pactados bajo pago en mano.\n\nB. Modalidad de Pago Integrado (Suscripciones, Planes y Pasarela Stripe)\nLa plataforma monetiza sus servicios mediante la inserción de espacios publicitarios, contratación de planes de visibilidad, cuotas de suscripción directa para profesionales y, de forma diferida, mediante el cobro de un porcentaje (%) sobre la transacción de los servicios.\n\nRetención de Fondos (Escrow): Cuando se procese un servicio mediante la pasarela de pagos integrada de Stripe, el dinero abonado por el Cliente será retenido de forma segura por la plataforma y no se liberará en favor del Profesional hasta que el servicio se haya efectuado satisfactoriamente.\n\nSuscripciones Directas: Las cuotas por planes de suscripción se cobrarán de manera directa y periódica a través de la pasarela de pagos, rigiéndose por las condiciones específicas de renovación automática indicadas al contratarse.\n\n5. Política de Cancelaciones, Incumplimientos y Reembolsos\nPara los servicios gestionados y abonados a través de la pasarela de pagos integrada de la plataforma, se aplican de forma vinculante las siguientes reglas:\n\nCancelación por parte del Cliente:\n\nSi el Cliente cancela el servicio con una antelación superior a 48 horas respecto al inicio fijado: se le reembolsará el 100% de la cuantía.\n\nSi la cancelación se produce en la ventana temporal comprendida entre las 48 y las 24 horas previas al inicio: se ejecutará una penalización, abonándose únicamente el 50% del importe.\n\nSi el Cliente cancela con menos de 24 horas de antelación respecto a la hora pactada de inicio: el servicio se cobrará íntegramente (100%), perdiendo el derecho a cualquier devolución a fin de indemnizar el tiempo reservado por el Profesional.\n\nIncomparecencia del Profesional: Si el Profesional no se presenta en el lugar o fecha acordada, el dinero retenido le será devuelto en su totalidad (100%) al Cliente.\n\nDeficiencias o Mal Trabajo (Sistema de Disputas): Si el Cliente alega una mala ejecución del encargo, gigejob activará una mediación interna:\n\nDependiendo de las pruebas aportadas, se buscará una resolución equilibrada de compensación 50-50.\n\nSegún la gravedad de las causas o las consecuencias materiales acreditadas, gigejob se reserva la potestad de decretar métodos alternativos, que abarcan desde reajustes de precio hasta la devolución del 100% al Cliente, conllevando paralelamente una penalización contractual o expulsión fulminante del Profesional de la plataforma.\n\nPlazo de Reclamación: Para que una disputa sea admitida a trámite por el equipo de soporte de gigejob, deberá notificarse formalmente en un plazo máximo e improrrogable de entre 24 y 48 horas a partir de la finalización del servicio. Pasado dicho término, los fondos retenidos se liberarán irreversiblemente al Profesional.",
    "#page-ayuda": "# Centro de ayuda\n\nCENTRO DE AYUDA Y PREGUNTAS FRECUENTES (FAQ)\nBienvenido al Centro de Ayuda de Gigejob. Si tienes dudas sobre cómo usar la plataforma, gestionar tus pagos o resolver una incidencia, encuentra la respuesta en las siguientes secciones.\n\n🔍 Preguntas Generales\n¿Qué es Gigejob y cómo funciona?\nGigejob es una plataforma digital de intermediación que conecta a usuarios particulares que necesitan un servicio con profesionales o empresas capacitadas para realizarlo. Puedes buscar profesionales, acordar detalles mediante el chat interno, reservar con pago seguro o en mano, y valorar la experiencia tras la finalización del trabajo.\n\n¿Tiene algún coste registrarse?\nNo. El registro en Gigejob como Cliente es totalmente gratuito. Para los Profesionales, la plataforma ofrece opciones de visibilidad, planes de suscripción y servicios de conexión adaptados a sus necesidades.\n\n¿Puedo registrarme si soy menor de edad?\nNo. El acceso y uso de Gigejob está estrictamente limitado a mayores de 18 años con capacidad legal para contratar.\n\n🙋‍♂️ Sección para Clientes\n¿Cómo elijo al profesional adecuado?\nPuedes filtrar por categoría de servicio, ubicación geográfica y disponibilidad horaria. Te recomendamos revisar el perfil del profesional, comprobar si cuenta con la insignia de Perfil Verificado y leer las opiniones y valoraciones de otros clientes.\n\n¿Cómo realizo el pago de un servicio?\nTienes dos modalidades disponibles:\n\nPago Integrado (Recomendado): Pagas de forma segura mediante tarjeta bancaria a través de Stripe. El dinero queda retendido en la plataforma y solo se libera al profesional cuando el trabajo se ha completado a tu satisfacción.\n\nPago en Mano: Acuerdas abonar el importe directamente en efectivo al profesional una vez finalizado el encargo (modalidad bajo la exclusiva cuenta y riesgo de los usuarios).\n\n¿Qué ocurre si el profesional no se presenta a la cita?\nSi contrataste el servicio mediante Pago Integrado y el profesional no acude, el dinero retenido te será devuelto de forma íntegra (100%). Recuerda reportar la incomparecencia a soporte en un plazo máximo de 24-48 horas.\n\n¿Cuál es la política de cancelación para clientes?\nMás de 48 horas de antelación: Reembolso del 100% de tu dinero.\n\nEntre 48 y 24 horas de antelación: Reembolso del 50% (el 50% restante cubre la reserva de disponibilidad).\n\nMenos de 24 horas de antelación: No hay reembolso (se cobrarrá el 100% para indemnizar al profesional).\n\n🛠️ Sección para Profesionales\n¿Por qué debo verificar mi perfil profesional?\nLa verificación de identidad mediante tu DNI, NIE o CIF garantiza a los clientes que eres un perfil real y seguro. Los perfiles verificados aparecen con una insignia distintiva y reciben hasta el doble de solicitudes de trabajo.\n\n¿Cuándo y cómo recibo el cobro de mis trabajos?\nEn pagos integrados (Stripe): Los fondos se retienen al momento de la reserva y se liberan a tu cuenta bancaria una vez que el cliente confirme la finalización correcta del trabajo (o transcurrido el plazo máximo de 24-48 horas sin incidencias).\n\nEn pagos en mano: Cobras directamente del cliente al terminar la labor de forma presencial.\n\n¿Qué ocurre si un cliente hace una reclamación sobre mi trabajo?\nSi un cliente abre una disputa alegando deficiencias en el servicio dentro del plazo de 24-48 horas, nuestro equipo de soporte analizará las pruebas aportadas por ambas partes en el chat. Mediante este arbitraje se podrá acordar una compensación justa (como un ajuste 50-50 o reembolsos específicos según la gravedad del caso).\n\n🔒 Seguridad, Chat y Cuenta\n¿Por qué debo comunicarme siempre por el Chat Interno?\nEl Chat Interno de Gigejob es tu única garantía de protección. Permite auditar la conversación en caso de fraude, estafas o reclamaciones de calidad. Recuerda que la plataforma se reserva la facultad de moderar y auditar estas conversaciones para velar por la seguridad de la comunidad.\n\n¿Cómo puedo modificar o eliminar mis datos personales?\nPuedes actualizar tus datos de perfil en cualquier momento desde tu panel de ajustes. Si deseas ejercer tus derechos de acceso, rectificación o supresión definitiva de la cuenta (Derecho al Olvido), envía una solicitud por correo con copia de tu DNI a info@gigejob.com.\n\n📩 ¿No has encontrado la respuesta que buscabas?\nNuestro equipo de atención al cliente está a tu disposición para ayudarte:\n\nCorreo electrónico: info@gigejob.com\n\nAtención al usuario: De Lunes a Viernes de 9:00 a 18:00 h.\n\nTiempo estimado de respuesta: Menos de 24 horas laborables.",
    "#page-como-funciona": "# Cómo funciona\n\nEn Gigejob conectamos a personas que necesitan solucionar tareas o contratar servicios con profesionales capacitados de forma rápida, transparente y segura.\n\n🙋‍♂️ Si eres Cliente (Buscas un servicio)\n1. Busca o publica lo que necesitas\nExplora entre cientos de profesionales categorizados por actividad, ubicación geográfica y horarios de preferencia. También puedes publicar una solicitud detallando el trabajo que necesitas realizar.\n\n2. Compara y chatea sin compromiso\nUtiliza nuestro sistema de Chat Interno para resolver dudas, acordar detalles, consultar tarifas y definir la fecha del servicio directamente con el profesional.\n\n3. Reserva de forma segura\nPago Integrado (Recomendado): Al contratar mediante nuestra pasarela segura (Stripe), tu dinero queda retenido en custodia. El profesional no cobrará hasta que el servicio esté terminado a tu entera satisfacción.\n\nPago en Mano: También dispones de la opción de abonar el trabajo en efectivo una vez finalizado, bajo acuerdo directo con el profesional.\n\n4. Servicio realizado y valoración\nUna vez completado el trabajo, libera el pago (si pagaste con Stripe) y deja una reseña sobre la experiencia para ayudar a otros miembros de la comunidad.\n\n🛠️ Si eres Profesional o Empresa (Ofreces un servicio)\n1. Crea tu perfil profesional\nRegístrate en pocos pasos aportando tus datos identificativos (CIF/NIF), la descripción de tus servicios, tus horarios de disponibilidad laboral y las zonas geográficas donde trabajas.\n\n2. Verificación Antifraude\nPara mantener la máxima seguridad en la plataforma, nuestro equipo validará tu documentación oficial de identidad. Un perfil verificado genera mucha más confianza y atrae a más clientes.\n\n3. Contacta con Clientes y cierra ofertas\nRecibe mensajes directos de usuarios interesados o postula a las solicitudes publicadas. Negocia las condiciones y la fecha a través de nuestro Chat Interno.\n\n4. Realiza el trabajo y cobra\nSi la reserva se hace con Pago Integrado, el importe queda garantizado desde el primer momento y se libera a tu cuenta al finalizar el encargo.\n\nSi elegiste Pago en Mano, cobrarás directamente del cliente al terminar la labor.\n\n🛡️ La Garantía Gigejob\nCuentas Verificadas: Auditamos la identidad de los profesionales para garantizar un entorno seguro.\n\nPagos Protegidos: Con nuestro sistema de retención de fondos, el importe del servicio no se entrega al profesional hasta que el trabajo está completado.\n\nResolución de Disputas: Si surge cualquier imprevisto o desacuerdo con la calidad del trabajo, nuestro equipo de soporte interviene en un plazo de 24-48 horas para ofrecer soluciones justas e imparciales.",
    "#page-condiciones": "# Condiciones de uso\n\n1. DATOS IDENTIFICATIVOS Y TITULARIDADEn cumplimiento de la normativa sobre comercio electrónico y contratación a distancia, se ponen a disposición de los usuarios los datos identificativos del titular de la plataforma web gigejob (en adelante, \"la Plataforma\" o \"el Sitio Web\"):Titular / CEO / Fundador: David Jimenez GomezN.I.F. / D.N.I.: 53671670C Domicilio: Calle Yecla, 2Teléfono de contacto: 623811991 Correo electrónico: info@gigejob.com  Dominio Web: gigejob  2. OBJETO Y ÁMBITO DE APLICACIÓNLas presentes Condiciones Generales regulan el acceso, navegación, registro y contratación de servicios a través del marketplace gigejob.  gigejob opera como una plataforma de intermediación técnica que conecta a usuarios particulares o entidades que requieren la ejecución de determinados servicios (en adelante, los \"Clientes\") con profesionales independientes o empresas que ofertan sus prestaciones (en adelante, los \"Profesionales\").  El mero acceso, navegación o registro en gigejob implica la aceptación plena y sin reservas de la totalidad de las cláusulas contenidas en este documento.3. CONDICIONES DE ACCESO, REGISTRO Y EDAD MÍNIMAEdad Mínima Obligatoria: El acceso y uso de gigejob está estrictamente reservado a personas físicas mayores de 18 años con capacidad legal suficiente para contratar, así como a personas jurídicas debidamente representadas. Queda rotundamente prohibido el registro de menores de edad.Datos del Registro para Clientes: Los Clientes deberán facilitar su nombre completo, dirección de correo electrónico (email), contraseña de acceso, dirección física, localización geográfica y horarios de preferencia para la prestación del servicio.  Datos del Registro para Profesionales: Además de la información exigida a los Clientes, los Profesionales deberán aportar obligatoriamente su Código de Identificación Fiscal (CIF) o NIF profesional, descripción de su actividad comercial y sus franjas de disponibilidad laboral.  Verificación de Identidad Antifraude: Para garantizar la seguridad del entorno y prevenir conductas estafadoras, los Profesionales se someten a un procedimiento de verificación documental en el que gigejob solicitará copias de documentos oficiales (DNI, NIE, CIF o acreditaciones de actividad). gigejob se reserva la facultad de denegar o cancelar cualquier cuenta con datos no contrastados o falsos.  PDF4. NATURALEZA DE LA INTERMEDIACIÓN Y RESPONSABILIDADESExclusión de Vínculo Laboral o Mercantil: gigejob actúa única y exclusivamente como prestador de servicios de intermediación técnica. La relación contractual final de prestación de servicios o trabajos se formaliza directa y exclusivamente entre el Cliente y el Profesional.  PDFResponsabilidad de las Partes (100% Clientes y Profesionales): La responsabilidad sobre la idoneidad, calidad, licitud, desperfectos, daños materiales, retrasos o incumplimientos contractuales derivados de los trabajos pactados recae al 100% sobre el Cliente y el Profesional intervinientes.  David Jimenez Gomez no asume ninguna garantía ni responsabilidad subsidiaria o directa sobre la ejecución del trabajo, comportamiento personal o fiscalidad de las partes contratantes.  5. MODELO ECONÓMICO Y MÉTODOS DE PAGOLa plataforma prevé la convivencia de dos modalidades de gestión económica:5.1. Modalidad de Pago Integrado (Stripe, Suscripciones y Comisión)gigejob monetizará sus servicios mediante publicidad, planes de visibilidad, cuotas de suscripción directa para Profesionales y el cobro diferido de una comisión porcentual (%) sobre el importe del servicio contratado.Depósito en Garantía (Escrow / Retención de Fondos): Cuando se utilice la pasarela de pagos integrada de la web (Stripe), el pago efectuado por el Cliente quedará retenido de forma segura en la plataforma hasta que el servicio contratado sea finalizado de conformidad.Cobro de Suscripciones: Los planes y cuotas periódicas de los Profesionales se tramitarán directamente a través de la pasarela de pago según los plazos seleccionados.5.2. Modalidad de Pago en Mano (Fase Transitoria)Los usuarios pueden acordar voluntariamente abonar el servicio en efectivo/mano tras su finalización.Aviso de Responsabilidad Exclusiva: Los pagos en mano corren a cuenta y riesgo exclusivo de los Clientes y Profesionales. gigejob no intermedia ni supervisa pagos físicos en efectivo, por lo que queda exonerada de tramitar reclamaciones, impagos o disputas sobre encargos pactados bajo esta modalidad.6. POLÍTICA DE CANCELACIONES, INCOMPARECENCIAS Y DEVOLUCIONESPara aquellos servicios gestionados e integrados mediante la pasarela de pagos de la plataforma, regirán de forma obligatoria las siguientes normas de cancelación y disputa:A. Cancelaciones por el ClienteCancelación con más de 48 horas de antelación: El Cliente recibirá el reembolso íntegro del 100% del importe abonado.Cancelación entre 48 horas y 24 horas antes: Se aplicará una penalización por la reserva de disponibilidad, reembolsándose únicamente el 50% del pago.Cancelación con menos de 24 horas de antelación: El servicio se cobrará en su totalidad (100%), sin derecho a devolución alguna para el Cliente.B. Incomparecencia del ProfesionalSi el Profesional no acude a la cita o lugar establecido en la hora acordada, el dinero retenido le será reembolsado al Cliente de forma automática en su 100%.C. Mal Trabajo o Incumplimiento de CalidadSi el Cliente manifiesta que el servicio no ha sido ejecutado correctamente, la plataforma abrirá un proceso interno de mediación.  Según el análisis de las evidencias aportadas por ambas partes, se podrá determinar una compensación del 50% - 50% o decretar medidas progresivas que pueden derivar en la devolución del 100% de la cuantía al Cliente, así como la imposición de penalizaciones o expulsión definitiva del Profesional infractor.D. Plazo Máximo para ReclamacionesPara que una incidencia o solicitud de reembolso sea admitida por el equipo de soporte de gigejob, el aviso deberá enviarse obligatoriamente en un plazo máximo de entre 24 y 48 horas tras la fecha y hora oficial de finalización del servicio. Transcurrido dicho plazo sin alegaciones, los fondos retenidos se liberarán irreversiblemente al Profesional.7. AUDITORÍA DEL SISTEMA DE CHAT INTERNOgigejob pone a disposición un sistema de mensajería (Chat Interno) para facilitar la comunicación entre Clientes y Profesionales.  Se informa expresamente de que estas conversaciones no tienen la consideración de comunicaciones privadas inalterables. Con el fin legítimo de garantizar la seguridad, prevenir estafas, auditar el grado de satisfacción ante disputas de calidad o perseguir infracciones a estos términos, David Jimenez Gomez se reserva la facultad de auditar, moderar y revisar las conversaciones internas exclusivamente en caso de reportes, denuncias o sospechas de actividad fraudulenta.  PDF8. LEGISLACIÓN APLICABLE Y JURISDICCIÓNLas presentes Condiciones Generales se rigen e interpretan de conformidad con la legislación española.Para la resolución de cualquier litigio, conflicto o discrepancia que pudiera surgir en relación con el acceso o uso de gigejob, ambas partes se someten a la jurisdicción de los Juzgados y Tribunales competentes según la normativa de consumidores y usuarios, o al domicilio del titular de la plataforma en caso de disputas de carácter puramente mercantil.",
    "#page-cookies": "# Política de Cookies\n\n1. DATOS IDENTIFICATIVOS Y RESPONSABLE\nEn cumplimiento de lo dispuesto en el artículo 22.2 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), y en consonancia con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), la presente política regula el uso de cookies y dispositivos de almacenamiento y recuperación de datos en la plataforma web gigejob (en adelante, \"la Plataforma\" o \"el Sitio Web\"):\n\nResponsable del Sitio Web: David Jimenez Gomez\n\nN.I.F. / D.N.I.: 53671670C\n\nDomicilio Social: Calle Yecla, 2\n\nTeléfono de contacto: 623811991\n\nCorreo electrónico: info@gigejob.com\n\nSitio Web / Dominio: gigejob\n\n2. ¿QUÉ SON LAS COOKIES Y TECNOLOGÍAS SIMILARES?\nUna cookie es un pequeño archivo de texto que un sitio web almacena en el navegador del usuario al acceder a determinadas páginas. Estas tecnologías permiten a la plataforma gigejob reconocer la sesión del usuario, analizar sus hábitos de navegación, mantener la seguridad de las cuentas y, con su previo consentimiento, mostrar publicidad adaptada a sus preferencias.\n\n3. DETALLE DE COOKIES UTILIZADAS EN GIGEJOB\nEn la plataforma gigejob se emplean cookies propias y de terceros clasificadas según su finalidad y tiempo de conservación:\n\nA. Cookies Técnicas y Necesarias (Exentas de Consentimiento)\nSon aquellas estrictamente imprescindibles para el correcto funcionamiento técnico de la plataforma, el inicio de sesión seguro, la gestión del registro de usuarios y la operativa del Chat Interno.\n\nCookie de Sesión de Gigejob (gigejob_session):\n\nProveedor: Propia.\n\nFinalidad: Gestionar la sesión activa del usuario, mantener el acceso a su panel privado de Cliente o Profesional y habilitar el funcionamiento del Chat Interno.\n\nDuración: Hasta el fin de la sesión.\n\nCookie de Consentimiento (cookie_consent):\n\nProveedor: Propia.\n\nFinalidad: Almacenar la configuración y preferencias de consentimiento elegidas por el usuario en el banner inicial de cookies.\n\nDuración: 1 año.\n\nCookies Técnicas y de Pasarela de Pago (__stripe_mid y __stripe_sid):\n\nProveedor: Stripe (Terceros).\n\nFinalidad: Previsión técnica para flujos financieros, procesamiento de pagos de suscripciones, prevención del fraude bancario y control de la pasarela de pago.\n\nDuración: Entre 30 minutos y 1 año.\n\nB. Cookies de Análisis y Medición (Requieren Consentimiento)\nPermiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización que hacen de gigejob para mejorar la oferta de servicios.\n\nCookies de Métricas de Navegación (_ga y _gid):\n\nProveedor: Google Analytics (Terceros).\n\nFinalidad: Asignación de un identificador anónimo para registrar el número de visitas, el origen del tráfico y el comportamiento estadístico de navegación en gigejob.\n\nDuración: 2 años para _ga y 24 horas para _gid.\n\nC. Cookies de Publicidad Comportamental (Requieren Consentimiento)\nAlmacenan información del comportamiento de los usuarios obtenida a través de la observación continuada de sus hábitos de navegación, lo que permite desarrollar un perfil específico para mostrar publicidad contextualizada.\n\nCookies de Publicidad Dinámica (__gads y DSID):\n\nProveedor: Google Ads / Redes Publicitarias (Terceros).\n\nFinalidad: Registrar la interacción con anuncios para optimizar las campañas publicitarias de la web e integrar anuncios dinámicos en función del perfil del usuario.\n\nDuración: De 3 meses a 2 años.\n\n4. GESTIÓN, ACEPTACIÓN O RECHAZO DE COOKIES\nAl acceder por primera vez a gigejob, se mostrará un banner informativo de cookies que te otorgará las siguientes opciones claras e independientes:\n\nAceptar Todo: Se instalarán y activarán la totalidad de las cookies (técnicas, analíticas y publicitarias).\n\nRechazar Todo: Se denegará el uso de cookies analíticas y publicitarias, manteniéndose activas únicamente las cookies técnicas necesarias para el funcionamiento de gigejob.\n\nConfigurar: Acceso a un panel interactivo que permite aceptar o denegar de forma granular el uso de cada categoría de cookies de forma libre y revocable en cualquier momento.\n\n5. CÓMO DESACTIVAR O ELIMINAR COOKIES DESDE EL NAVEGADOR\nAdemás del panel de configuración de gigejob, puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador que utilices:\n\nGoogle Chrome: Configuración > Privacidad y seguridad > Cookies y otros datos de sitios\n\nMozilla Firefox: Ajustes > Privacidad & Seguridad > Cookies y datos del sitio\n\nSafari: Preferencias > Privacidad > Bloquear todas las cookies\n\nMicrosoft Edge: Configuración > Permisos del sitio > Cookies y datos del sitio\n\n6. ACTUALIZACIONES Y DATOS DE CONTACTO\nDavid Jimenez Gomez se reserva el derecho de modificar la presente Política de Cookies en función de nuevas exigencias legislativas, reglamentarias, o con las instrucciones dictadas por la Agencia Española de Protección de Datos (AEPD).\n\nPara resolver cualquier duda o consulta sobre el uso de cookies en gigejob, puedes contactar directamente enviando un correo electrónico a info@gigejob.com.",
    "#page-normas": "# Normas de la comunidad\n\nEn Gigejob, nuestra misión es conectar a las personas con profesionales de confianza para resolver tareas y prestar servicios de forma ágil y segura.\n\nPara mantener un entorno ético, transparente y respetuoso para todos, la creación de una cuenta implica la aceptación estricta de las siguientes Normas de la Comunidad. El incumplimiento de cualquiera de estas pautas puede derivar en la suspensión temporal o la expulsión definitiva de la plataforma.\n\n1. Respeto, Inclusión y Trato Digno\nTolerancia Cero al Acoso: Queda estrictamente prohibido cualquier tipo de insulto, amenaza, lenguaje discriminatorio, acoso sexual, discriminación por razón de raza, género, orientación sexual, religión, edad o nacionalidad.\n\nComunicación Profesional: Tanto en las solicitudes como en el Chat Interno, las conversaciones deben mantenerse dentro del marco del respeto, la educación y la cordialidad.\n\n2. Autenticidad e Identidad Verificada\nPerfil Real y Único: Todos los usuarios deben utilizar datos reales. Queda prohibida la suplantación de identidad, el uso de perfiles falsos o la creación de múltiples cuentas para eludir sanciones.\n\nVerificación de Profesionales: Los profesionales deben proporcionar documentación oficial verídica (DNI, NIE, CIF) para validar sus servicios. La falsificación documental conllevará la expulsión inmediata y la notificación a las autoridades si correspondiese.\n\nEdad Mínima: Gigejob es una plataforma reservada estrictamente a mayores de 18 años.\n\n3. Uso del Chat Interno y Seguridad en Pagos\nSin Desvíos de Comunicación ni Pagos: Para garantizar la protección frente a estafas y permitir la mediación del equipo de soporte en caso de disputa, toda la negociación previa y la contratación deben gestionarse dentro del Chat Interno de Gigejob.\n\nTransparencia en los Pagos:\n\nEn los pagos procesados por la pasarela de la plataforma (Stripe), los fondos quedan retenidos de forma segura hasta finalizar el encargo.\n\nSi se acuerda la modalidad de Pago en Mano, ambas partes aceptan que asumen el riesgo de la transacción sin intermediación del sistema de disputas monetarias de la plataforma.\n\nMonitoreo por Seguridad: El Chat Interno está auditado y moderado con el fin de detectar posibles estafas, spam, intentos de fraude o conductas inapropiadas.\n\n4. Compromiso, Puntualidad y Calidad\nHonestidad en la Oferta: Los profesionales deben describir sus habilidades, tarifas y disponibilidad de forma transparente, sin prometer resultados que no puedan cumplir.\n\nCumplimiento de Citas: Cancelar un servicio a última hora sin causa justificada perjudica gravemente a la comunidad. Se aplican políticas de penalización sobre las devoluciones en cancelaciones con menos de 24-48 horas de antelación.\n\nCuidado de la Reputación: Se exige a los profesionales realizar los encargos con la máxima diligencia y cuidado técnico, respetando la propiedad y privacidad del cliente.\n\n5. Opiniones y Valoraciones Honestas\nReseñas Reales: El sistema de valoraciones existe para guiar a la comunidad. Las reseñas deben basarse estrictamente en experiencias reales tras la prestación del servicio.\n\nProhibición de Manipulación: Queda prohibida la compra/venta de valoraciones, publicar reseñas falsas para perjudicar a un competidor o chantajear a un profesional/cliente con una nota negativa a cambio de rebajas o concesiones injustificadas.\n\n6. Servicios Prohibidos e Ilícitos\nEstá totalmente prohibido utilizar Gigejob para ofertar, solicitar o negociar cualquiera de las siguientes actividades:\n\nServicios que violen la legislación española vigente.\n\nTareas que impliquen actividades ilegales, peligrosas, venta de sustancias contundentes, armas o bienes regulados.\n\nContenido de carácter adulto, prostitución o servicios de naturaleza sexual.\n\nTrabajos que requieran titulaciones oficiales colegiadas (ej. medicina, abogacía) cuando el usuario no posea la acreditación legal para ejercerlos.\n\n🛑 Medidas Disciplinarias\nAnte el incumplimiento de estas normas, David Jimenez Gomez (Titular de Gigejob) se reserva el derecho de:\n\nEmitir advertencias o apercibimientos formales.\n\nEliminar contenido, publicaciones o comentarios inapropiados.\n\nBloquear o cancelar temporalmente la cuenta del usuario.\n\nExpulsar definitivamente a usuarios reincidentes o implicados en faltas graves/delitos.\n\n📩 Contacto y Reportes\nSi presencias o sufres algún comportamiento que viole estas normas, puedes reportarlo directamente desde el menú del chat o enviando un correo a info@gigejob.com.",
    "#page-privacidad": "# Política de privacidad\n\n1. RESPONSABLE DEL TRATAMIENTO DE SUS DATOS\nDe conformidad con el Reglamento (UE) 2016/679 General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), el usuario queda informado de que los datos personales facilitados a través de esta plataforma serán incorporados a las actividades de tratamiento titularidad de:\n\nResponsable del Tratamiento: David Jiménez Gómez (en adelante, \"El Responsable\").\n\nN.I.F. / D.N.I.: 53671670C.\nDomicilio fiscal: Calle Yecla 2, 29740, España.\nEmail de contacto/delegado: info@gigejob.com\n\n2. DATOS PERSONALES OBJETO DE RECOGIDA\nLa plataforma recopila información del Usuario de manera directa mediante el formulario de registro y uso de la aplicación web. Los datos recogidos varían según el tipo de perfil:\n\nClientes (Usuarios Particulares): Nombre, dirección de correo electrónico (email), contraseña cifrada, dirección física, localización geográfica y horarios de preferencia para la recepción del servicio.\n\nProfesionales y Empresas: Además de los datos listados para los Clientes, se requerirá de manera obligatoria el Código de Identificación Fiscal (CIF / NIF comercial), descripción detallada de actividades y horarios profesionales.\n\nSistema de Verificación de Identidad: Con el fin de mitigar fraudes, suplantaciones de identidad y garantizar la veracidad, la plataforma incorpora un sistema de verificación donde se solicitará al Usuario documentación oficial (DNI, NIE, escrituras o altas de actividad) con la única finalidad de contrastar la información del perfil.\n\n3. FINALIDAD Y LEGITIMACIÓN DEL TRATAMIENTO\nEl Responsable tratará los datos de los Usuarios con las siguientes finalidades y bases legales legitimadoras:\n\nGestión del registro y mantenimiento de la cuenta: Tratamiento necesario para posibilitar el uso del Marketplace. Base legal: Ejecución del contrato (aceptación de los términos de uso).\n\nVerificación de perfiles: Destinado a contrastar la veracidad de los datos introducidos mediante la documentación oficial aportada. Base legal: Interés legítimo del Responsable en mantener la seguridad de la plataforma y evitar fraudes.\n\nAuditoría, control y revisión de la mensajería del chat interno: Aplicado en casos de disputa o reportes de la comunidad. Base legal: Interés legítimo para velar por el orden público del sitio, perseguir conductas inapropiadas o investigar estafas.\n\nPublicidad comportamental e inserción de anuncios: Recogida de datos técnicos de navegación, cookies e identificadores de dispositivo. Base legal: Consentimiento explícito prestado por el usuario mediante el banner de cookies.\n\n4. AUDITORÍA EXPRESA DEL CHAT INTERNO\nSe informa de forma explícita a todos los Usuarios de que las comunicaciones realizadas a través del sistema de chat interno de Gigejob no constituyen comunicaciones estrictamente privadas ajenas a la plataforma. Con el objetivo de monitorizar el correcto funcionamiento de las interacciones, investigar conductas inapropiadas, acoso, estafas, actividades ilegales o incumplimientos contractuales graves de los términos de uso, El Responsable se reserva la facultad de auditar, revisar y acceder al contenido de los mensajes intercambiados en dicho chat.\n\nEste acceso se limitará exclusivamente al personal encargado de la moderación y resolución de reportes del Marketplace, y se usará legítimamente como prueba para la adopción de medidas disciplinarias como el bloqueo o expulsión definitiva de cuentas de usuario.\n\n5. DESTINATARIOS Y CESIÓN DE DATOS A TERCEROS\nLos datos personales del Usuario no serán vendidos ni cedidos a terceras organizaciones con fines comerciales directos bajo ningún concepto. Sin embargo, se prevén las siguientes comunicaciones de datos necesarias para la prestación del servicio:\n\nProveedores de Servicios Técnicos: Empresas de alojamiento web (hosting), desarrollo técnico, soporte administrativo y herramientas de bases de datos que actúan en calidad de Encargados del Tratamiento bajo estrictas cláusulas de confidencialidad.\n\nEmpresas de Publicidad y Redes de Anuncios: Derivado del modelo de negocio publicitario, los datos técnicos de navegación no identificativos serán compartidos con Google Ads y plataformas de publicidad externas similares para la optimización de campañas y muestras de banners personalizados, condicionado a la aceptación previa del banner de cookies.\n\nAutoridades Públicas: Los datos y documentos de verificación serán puestos a disposición de las Fuerzas y Cuerpos de Seguridad del Estado, Juzgados y Tribunales o autoridades fiscales en caso de requerimiento legal firme o sospecha fundada de delito.\n\nPasarelas de Pago (Futura Implementación): En el momento en que se implemente la automatización de flujos financieros, los datos correspondientes se comunicarán a la entidad de procesamiento Stripe bajo sus propias normativas de seguridad bancaria.\n\n6. PLAZO DE CONSERVACIÓN DE LOS DATOS\nLos datos personales se conservarán mientras el Usuario mantenga activa su cuenta en el Marketplace Gigejob y no solicite la supresión de los mismos.\n\nUna vez solicitada la baja o decretada la expulsión de un perfil, los datos serán bloqueados y conservados de forma restringida durante los plazos de prescripción legales establecidos por la legislación civil, penal y mercantil española (por lo general, entre 3 y 5 años) para atender posibles responsabilidades contractuales o requerimientos judiciales de las autoridades. Transcurridos dichos plazos, los datos se eliminarán de forma segura o se anonimizarán de forma irreversible.\n\n7. DERECHOS DE LOS USUARIOS (DERECHOS ARCO-POL)\nEl RGPD concede al Usuario el control absoluto sobre sus datos personales. El Usuario podrá ejercitar en cualquier momento y de forma totalmente gratuita los siguientes derechos:\n\nAcceso: Derecho a conocer qué datos personales están siendo tratados por El Responsable.\n\nRectificación: Derecho a solicitar la modificación o corrección de datos inexactos o incompletos.\n\nSupresión (Derecho al Olvido): Derecho a exigir la eliminación de sus datos personales de las bases de datos cuando, entre otros motivos, ya no sean necesarios para los fines que fueron recogidos.\n\nLimitación del Tratamiento: Derecho a solicitar la suspensión temporal del tratamiento de sus datos en situaciones específicas contempladas por la ley.\n\nOposición: Derecho a oponerse a que sus datos se utilicen para finalidades específicas de interés legítimo o mercadotecnia.\n\nPortabilidad: Derecho a recibir sus datos en un formato electrónico estructurado y de uso común para transmitirlos a otro responsable.\n\nPara ejercitar estos derechos, el Usuario deberá enviar una comunicación por escrito al correo electrónico [Dirección de email de soporte/privacidad] adjuntando una fotocopia de su documento de identidad (DNI/NIE) o documento equivalente que acredite debidamente su identidad, indicando en el asunto \"Ejercicio de Derechos RGPD\".\n\nAsimismo, si el Usuario considera que sus derechos de protección de datos han sido vulnerados, tiene el derecho legítimo a presentar una reclamación formal ante la Agencia Española de Protección de Datos (AEPD) a través de su sede electrónica oficial (www.aepd.es).\n\nCon esto, la infraestructura legal de tu plataforma queda completamente blindada en tres vertientes: Identidad (Aviso Legal), Funcionamiento del Marketplace (Condiciones de Uso) y Privacidad (Política de Privacidad).",
    "#page-quienes-somos": "# Quiénes somos\n\nLA HISTORIA DETRÁS DE GIGEJOB\nBienvenido a Gigejob, el punto de encuentro digital diseñado para conectar de forma rápida, directa y transparente a quienes necesitan solucionar tareas del día a día con profesionales capacitados para ejecutarlas.\n\n🚀 Nuestra Misión\nEn un mundo donde el tiempo es el recurso más valioso, nacemos con un objetivo muy claro: revolucionar la forma en que contratamos y ofrecemos servicios locales.\n\nQueremos eliminar las barreras, las esperas innecesarias y las incertidumbres. Creemos firmemente en el poder de la tecnología para simplificar la vida de las personas, crear oportunidades de trabajo independientes y construir una comunidad basada en la confianza mutua, el respeto y la calidad.\n\n💡 ¿Cómo Nació Gigejob?\nGigejob no nace como una gran corporación impersonal, sino como un proyecto de emprendimiento con alma, liderado por su fundador y CEO, David Jiménez Gómez.\n\nDetectando la necesidad real de contar con un espacio seguro donde particulares y pequeños profesionales pudieran entenderse sin complicaciones, diseñamos una plataforma adaptada a la realidad actual:\n\nPara el Cliente: Un entorno transparente donde encontrar soluciones a medida, comparar perfiles reales, chatear sin compromiso y proteger su dinero hasta ver el trabajo finalizado.\n\nPara el Profesional: Un escaparate justo y competitivo donde poner en valor su talento, gestionar sus horarios con libertad, ganar visibilidad y construir una reputación sólida.\n\n🛡️ Nuestros Valores Fundamentales\nConfianza y Transparencia: Auditamos y verificamos la identidad de nuestros profesionales para garantizar entornos seguros. En Gigejob sabes con quién tratas en todo momento.\n\nSeguridad Financiera: Con nuestro sistema de retención de pagos a través de Stripe, garantizamos que el dinero del cliente esté protegido y que el profesional tenga la certeza de cobrar por su labor.\n\nCercanía y Soporte Humano: Detrás de cada línea de código hay un equipo comprometido en mediar, solucionar incidencias en 24-48 horas y escuchar de forma activa las necesidades de nuestra comunidad.\n\nFlexibilidad e Innovación: Evolucionamos constantemente para ofrecer las mejores herramientas tecnológicas, adaptándonos a las nuevas formas de trabajo independiente.\n\n🤝 Un Ecosistema en Crecimiento\nTanto si buscas a alguien que te eche una mano con un proyecto o reparación, como si eres un profesional en busca de nuevos clientes para hacer crecer tu negocio, Gigejob es tu casa.\n\nGracias por formar parte de esta comunidad y por confiar en nosotros para seguir conectando talento y soluciones día a día.\n\n📩 ¿Quieres hablar con nosotros?\nEstamos siempre abiertos a escuchar sugerencias, resolver dudas o colaborar:\n\nTitular y CEO: David Jiménez Gómez\n\nCorreo de contacto: info@gigejob.com\n\nUbicación: Yecla 2, España",
    "#page-seguridad": "# Consejos de seguridad\n\nEn Gigejob, la seguridad y tranquilidad de nuestra comunidad es lo primero. Aunque trabajamos de forma continua verificando perfiles y monitoreando la plataforma, seguir estas recomendaciones te ayudará a protegerte frente a posibles fraudes, malas experiencias o imprevistos.\n\n🙋‍♂️ Consejos para Clientes\nManten la comunicación dentro de Gigejob: Utiliza siempre nuestro Chat Interno para acordar las condiciones del servicio. Evita derivar las conversaciones a aplicaciones externas (como WhatsApp o Telegram), ya que el chat interno es tu única prueba para resolver disputas o mediaciones.\n\nPrioriza los pagos protegidos con Stripe: Al pagar a través de la pasarela integrada, tu dinero queda custodiado de forma segura y solo se libera al profesional una vez completado el trabajo.\n\nAtención al pago en mano: Si acuerdas la modalidad de pago en mano, exige siempre un recibo o justificante al profesional y ten presente que la plataforma no podrá intervenir en caso de disputas financieras sobre efectivo.\n\nConsulta las reseñas y perfil verificado: Antes de contratar, revisa las valoraciones de otros clientes y confirma que el profesional cuente con el distintivo de Perfil Verificado.\n\nPrecaución en el domicilio: Si el trabajo se realiza en tu vivienda o local, asegúrate de estar presente durante la ejecución del servicio y no dejes objetos de gran valor o documentación sensible a la vista.\n\n🛠️ Consejos para Profesionales\nVerifica tu identidad desde el inicio: Completa el proceso de verificación aportando tu documentación oficial (DNI/CIF). Un perfil verificado genera mayor confianza y duplica las probabilidades de ser contratado.\n\nNo comiences un trabajo con Pago Integrado sin confirmación: Si el servicio se ha contratado mediante pago integrado, asegúrate de que el estado de la reserva en la plataforma confirme que los fondos están retenidos antes de desplazarte o empezar a trabajar.\n\nDefine claramente el alcance del servicio: Detalla con precisión en el chat qué incluye y qué no incluye tu tarifa (materiales, desplazamiento, horas de trabajo) antes de acudir a la cita para evitar malentendidos posteriores.\n\nProtege tus datos personales y bancarios: Nunca facilites tus claves de acceso, datos de tarjetas de crédito o PIN a ningún usuario. Gigejob jamás te solicitará contraseñas por chat o correo electrónico.\n\nInforma de cualquier comportamiento sospechoso: Si un cliente te pide realizar actividades ilegales, peligrosas o que vulneren las normas de la comunidad, declina el encargo de inmediato y repórtalo a nuestro equipo.\n\n⚠️ Red Flags (Señales de Alerta)\nDesconfía y ponte en contacto con soporte si detectas alguna de estas situaciones:\n\nPetición de desvío fuera de la plataforma: Un usuario que insiste de forma agresiva en continuar la conversación o realizar pagos por vías externas no rastreables.\n\nOfertas o presupuestos irreales: Tarifas desproporcionadamente bajas o promesas de ingresos desorbitados por tareas sencillas.\n\nEnlaces sospechosos: Recepción de links externos que soliciten tus credenciales de acceso o datos de tarjeta bancaria fuera del dominio de Gigejob.\n\nPresiones para liberar el pago por adelantado: Solicitudes para liberar los fondos custodiados antes de que el trabajo haya comenzado o finalizado.\n\n🚨 ¿Has detectado un problema o te sientes inseguro?\nSi presencias una actividad sospechosa o sufres alguna incidencia durante un servicio, puedes utilizar el botón de Reportar en el chat interno o escribirnos directamente a info@gigejob.com. Nuestro equipo revisará el caso en un plazo máximo de 24 horas."
  }
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
