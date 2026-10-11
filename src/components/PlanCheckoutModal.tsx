import React, { useState } from "react";
import {
  X,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  Percent,
  ArrowRight,
  Clock,
  Crown,
  Loader2
} from "lucide-react";
import { UserProfile, DiscountPromotion } from "../types";
import { processStripePayment } from "../services/stripeService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface PlanCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any | null;
  cycle: "monthly" | "quarterly";
  user: UserProfile;
  promotions: DiscountPromotion[];
  onPaymentSuccess?: (updatedUser: UserProfile) => void;
}

export const PlanCheckoutModal: React.FC<PlanCheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  cycle,
  user,
  promotions,
  onPaymentSuccess,
}) => {
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<DiscountPromotion | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const originalPrice = cycle === "quarterly" ? (plan.priceQuarterly || plan.price * 3) : plan.price;
  const discountPercent = appliedPromo ? appliedPromo.discountPercent : 0;
  const discountAmount = appliedPromo
    ? Math.round(((originalPrice * discountPercent) / 100) * 100) / 100
    : 0;
  const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);

  const handleApplyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const cleanCode = discountCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setPromoError("Por favor, introduce un código de descuento.");
      return;
    }

    // Buscar en la lista de promociones disponibles
    const matchedPromo = (promotions || []).find(
      (p) => (p.code || "").trim().toUpperCase() === cleanCode
    );

    if (!matchedPromo) {
      setPromoError(`El código "${cleanCode}" no es válido o ha expirado.`);
      setAppliedPromo(null);
      return;
    }

    if (!matchedPromo.isActive) {
      setPromoError(`La promoción "${matchedPromo.name || cleanCode}" está actualmente inactiva.`);
      setAppliedPromo(null);
      return;
    }

    // Verificar compatibilidad de ciclo (mensual, trimestral o ambos)
    const promoCycle = matchedPromo.applicableCycle || "both";
    if (promoCycle === "monthly" && cycle !== "monthly") {
      setPromoError(
        `Este código solo es aplicable a contrataciones mensuales (tu selección actual es trimestral).`
      );
      setAppliedPromo(null);
      return;
    }

    if (promoCycle === "quarterly" && cycle !== "quarterly") {
      setPromoError(
        `Este código solo es aplicable a contrataciones trimestrales (tu selección actual es mensual).`
      );
      setAppliedPromo(null);
      return;
    }

    // Código válido
    setAppliedPromo(matchedPromo);
    setPromoSuccess(
      `¡Código ${matchedPromo.code} aplicado! Se ha descontado un ${matchedPromo.discountPercent}% al total.`
    );
  };

  const handleRemoveCode = () => {
    setAppliedPromo(null);
    setDiscountCodeInput("");
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleProceedToPayment = async () => {
    if (!user) return;
    setIsProcessing(true);
    setGeneralError(null);

    try {
      // Caso 1: Descuento 100% (gratis)
      if (finalPrice <= 0) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + (cycle === "quarterly" ? 3 : 1));

        let newHistory = user.professionalInfo?.planHistory || [];
        if (user.professionalInfo?.plan && user.professionalInfo.plan !== "basic") {
          newHistory = [
            ...newHistory,
            {
              planId: user.professionalInfo.plan,
              planName: plan.name,
              startDate: user.professionalInfo.planStartDate || now.toISOString().split("T")[0],
              endDate: now.toISOString().split("T")[0],
              status: "expired",
              paymentMethod: "promocion",
            },
          ];
        }

        const updatedUser: UserProfile = {
          ...user,
          professionalInfo: {
            ...(user.professionalInfo || { billing: {}, availability: [], workLocation: "" }),
            plan: plan.id,
            planStartDate: now.toISOString().split("T")[0],
            planEndDate: endDate.toISOString().split("T")[0],
            planStatus: "active",
            planBillingCycle: cycle,
            planAutoRenew: false,
            planPaymentMethod: "promocion",
            planHistory: newHistory,
          },
        };

        const { id, ...dataToUpdate } = updatedUser;
        await updateDoc(doc(db, "users", user.id), { ...dataToUpdate });

        if (onPaymentSuccess) {
          onPaymentSuccess(updatedUser);
        }
        alert(`¡Enhorabuena! Promoción del 100% aplicada. Tu ${plan.name} ya está activo.`);
        onClose();
        return;
      }

      // Caso 2: Pago mediante Stripe con precio final con descuento
      const res = await processStripePayment({
        planId: plan.id,
        planName: plan.name,
        price: finalPrice,
        cycle: cycle,
        userId: user.id,
        discountCode: appliedPromo?.code,
      });

      if (!res.success) {
        setGeneralError(res.error || "No se pudo iniciar la pasarela de pago. Inténtalo de nuevo.");
        setIsProcessing(false);
      }
      // Si tuvo éxito, Stripe redirige automáticamente al usuario
    } catch (err: any) {
      console.error("Error al procesar pago del plan:", err);
      setGeneralError(err.message || "Ocurrió un error inesperado al procesar el pago.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-surface relative w-full max-w-lg rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-6 pb-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-on-surface">
                Pantalla de Pago y Confirmación
              </h3>
              <p className="text-xs text-on-surface-variant">
                Revisa los detalles de tu plan y aplica tus promociones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Tarjeta del Plan Seleccionado */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-on-surface">{plan.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-primary text-white rounded-full">
                  {cycle === "quarterly" ? "Trimestral (3 meses)" : "Mensual"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Facturación {cycle === "quarterly" ? "cada 3 meses" : "cada mes"} • Cancelación flexible
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-on-surface">
                €{originalPrice}
              </div>
              <div className="text-[10px] text-on-surface-variant">
                {cycle === "quarterly" ? "/trimestre" : "/mes"}
              </div>
            </div>
          </div>

          {/* Sección de Código de Descuento */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              ¿Tienes un código de descuento?
            </label>

            {!appliedPromo ? (
              <form onSubmit={handleApplyCode} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={discountCodeInput}
                    onChange={(e) => {
                      setDiscountCodeInput(e.target.value.toUpperCase());
                      setPromoError(null);
                    }}
                    placeholder="Ej. WEB"
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono font-bold tracking-wider uppercase text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!discountCodeInput.trim()}
                  className="px-5 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Aplicar
                </button>
              </form>
            ) : (
              <div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-green-800">
                        {appliedPromo.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-green-600 text-white">
                        -{appliedPromo.discountPercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-green-700 font-medium mt-0.5">
                      {appliedPromo.name || "Descuento aplicado con éxito"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCode}
                  className="px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Quitar
                </button>
              </div>
            )}

            {/* Mensaje de error de cupón */}
            {promoError && (
              <div className="flex items-center gap-2 text-xs font-medium text-error bg-error/10 p-3 rounded-xl border border-error/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            {/* Mensaje de éxito de cupón */}
            {promoSuccess && !promoError && (
              <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-500/10 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{promoSuccess}</span>
              </div>
            )}
          </div>

          {/* Desglose de Precios */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 space-y-2.5">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Precio base del plan ({cycle === "quarterly" ? "Trimestral" : "Mensual"}):</span>
              <span className="font-bold text-on-surface">€{originalPrice.toFixed(2)}</span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  Descuento ({appliedPromo.code} - {discountPercent}%):
                </span>
                <span className="font-bold">-€{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-base text-on-surface">Total a pagar:</span>
                <p className="text-[11px] text-on-surface-variant/70">Impuestos incluidos</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">
                  €{finalPrice.toFixed(2)}
                </span>
                <span className="text-xs text-on-surface-variant ml-1">
                  {cycle === "quarterly" ? "/trimestre" : "/mes"}
                </span>
              </div>
            </div>
          </div>

          {/* Error general de pago si ocurre */}
          {generalError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Garantía de Seguridad */}
          <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant/70">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Pago 100% seguro y cifrado con Stripe SSL</span>
          </div>
        </div>

        {/* Pie / Acciones */}
        <div className="p-6 pt-4 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 font-bold text-sm text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="flex-[2] py-3 px-6 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Conectando con Stripe...</span>
              </>
            ) : finalPrice <= 0 ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Activar Plan Gratis</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pagar €{finalPrice.toFixed(2)} con Stripe</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
