import React from "react";
import { MapPin, Camera, X, ShieldCheck } from "lucide-react";

export interface PermissionModalProps {
  isOpen: boolean;
  type: "location" | "camera";
  onConfirm: () => void;
  onCancel: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  type,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isLocation = type === "location";

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-low transition-all"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Corporate Branding */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] primary-gradient flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 animate-bounce-subtle">
            {isLocation ? (
              <MapPin className="w-8 h-8 sm:w-10 sm:h-10" />
            ) : (
              <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-display font-black text-on-surface tracking-tight">
            {isLocation
              ? "Acceso a tu Ubicación"
              : "Acceso a tu Cámara"}
          </h3>

          <div className="flex items-center gap-1.5 text-primary text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1">
            <ShieldCheck className="w-4 h-4" />
            GigeJob Privacidad
          </div>
        </div>

        {/* Explanation Text */}
        <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-outline-variant/10 text-center space-y-2">
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
            {isLocation ? (
              <>
                Necesitamos conocer tu ubicación para mostrarte{" "}
                <strong className="text-on-surface font-bold">
                  profesionales y servicios cercanos
                </strong>{" "}
                en tu zona en tiempo real.
              </>
            ) : (
              <>
                Necesitamos acceso a la cámara para que puedas{" "}
                <strong className="text-on-surface font-bold">
                  tomar y adjuntar fotos directamente
                </strong>{" "}
                a tus anuncios, presupuestos o foto de perfil.
              </>
            )}
          </p>
          <p className="text-[10px] text-on-surface-variant/50 font-semibold">
            {isLocation
              ? "Tu ubicación no se compartirá ni publicará sin tu permiso expreso."
              : "Solo se capturarán fotografías cuando tú decidas presionar el botón de disparo."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 primary-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLocation ? (
              <MapPin className="w-4 h-4" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            Continuar y Permitir
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 text-on-surface-variant/60 hover:text-on-surface rounded-2xl font-bold text-xs tracking-wider transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};
