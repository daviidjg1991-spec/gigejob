import { Capacitor } from '@capacitor/core';
import { Stripe } from '@capacitor-community/stripe';

let isStripeInitialized = false;

export async function initializeStripeNative() {
  if (Capacitor.isNativePlatform() && !isStripeInitialized) {
    try {
      await Stripe.initialize({
        publishableKey: "pk_live_51RfeChFFLqtPnL1f6X0k9MjpzQblkm1rSXrsNdmPGjF6SggRdeASA4QXLkAA5RHX4FG3epBpM8MAKWm1ytSV6fwn00gATo6sfO"
      });
      isStripeInitialized = true;
    } catch (e) {
      console.error("Error initializing native Stripe:", e);
    }
  }
}

export async function processStripePayment({
  planId,
  planName,
  price,
  cycle,
  userId
}: {
  planId: string;
  planName: string;
  price: number;
  cycle: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (Capacitor.isNativePlatform()) {
      await initializeStripeNative();
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planName, price, cycle, userId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      } else {
        return { success: false, error: data.error || "Error al generar la pasarela de pago" };
      }
    } else {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planName, price, cycle, userId })
      });
      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Fallback cuando la aplicación está corriendo en hosting estático o SPA sin backend NodeJS proxy
        const text = await res.text();
        if (res.status === 200 && text.trim().startsWith("<!")) {
          // Intentar llamada alternativa a Firebase Function URL directa si existe o lanzar mensaje guiado
          const fbRes = await fetch("https://us-central1-gigejob01.cloudfunctions.net/createCheckoutSession", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, planName, price, cycle, userId })
          });
          const fbContentType = fbRes.headers.get("content-type");
          if (fbContentType && fbContentType.includes("application/json")) {
            data = await fbRes.json();
          } else {
            return { success: false, error: "El backend de pagos en la nube está en proceso de inicialización en Cloud Functions. Por favor reintenta en un momento." };
          }
        } else {
          return { success: false, error: `Error devuelto por el servidor (${res.status}): ${text.substring(0, 80)}...` };
        }
      }
      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      } else {
        return { success: false, error: data.error || "Error al iniciar el proceso de pago" };
      }
    }


  } catch (err: any) {
    return { success: false, error: err.message || "Error inesperado al procesar el pago" };
  }
}
