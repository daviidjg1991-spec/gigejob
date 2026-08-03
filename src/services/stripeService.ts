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
        const text = await res.text();
        return { success: false, error: `El servidor Node.js backend no devolvió JSON (${res.status}): ${text.substring(0, 80)}...` };
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
