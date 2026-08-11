import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si el usuario ya ha dado o rechazado el consentimiento
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Montar y animar deslizamiento desde abajo
      setIsMounted(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    document.cookie = "cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 400); // Esperar a completar animación de salida
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    document.cookie = "cookie_consent=rejected; path=/; max-age=31536000; SameSite=Lax";
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 400); // Esperar a completar animación de salida
  };

  if (!isMounted) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none p-0 sm:p-3 md:p-4"
      aria-label="Aviso de cookies"
      role="region"
    >
      <div 
        className="pointer-events-auto w-full max-w-7xl mx-auto shadow-2xl border-t sm:border border-slate-300/60 dark:border-slate-700/60 transition-transform duration-400 ease-out"
        style={{
          backgroundColor: 'var(--cookie-banner-bg, #ffffff)',
          color: 'var(--cookie-banner-text, #2c2f30)',
          fontFamily: 'var(--cookie-banner-font, inherit)',
          borderRadius: '0px',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
          opacity: isVisible ? 1 : 0
        }}
      >
        <div className="p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="text-base sm:text-lg font-bold tracking-tight uppercase font-sans">
              Uso de cookies
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90 max-w-4xl">
              Utilizamos cookies propias y de terceros con fines analíticos, de personalización y publicitarios para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias mediante el análisis de sus hábitos de navegación. Puede consultar más detalles en nuestra{' '}
              <Link 
                to="/pagina/privacidad" 
                className="underline font-semibold hover:opacity-75 transition-opacity"
              >
                Política de Privacidad
              </Link>{' '}
              y nuestra{' '}
              <Link 
                to="/pagina/cookies" 
                className="underline font-semibold hover:opacity-75 transition-opacity"
              >
                Política de Cookies
              </Link>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleReject}
              type="button"
              className="px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer text-center border-0"
              style={{
                backgroundColor: 'var(--cookie-btn-secondary-bg, #e5e9e9)',
                color: 'var(--cookie-btn-secondary-text, #2c2f30)',
                borderRadius: '0px',
              }}
            >
              Rechazar todas
            </button>
            <button
              onClick={handleAccept}
              type="button"
              className="px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer text-center border-0 shadow-sm hover:brightness-110"
              style={{
                backgroundColor: 'var(--cookie-btn-primary-bg, #00675b)',
                color: 'var(--cookie-btn-primary-text, #ffffff)',
                borderRadius: '0px',
              }}
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
