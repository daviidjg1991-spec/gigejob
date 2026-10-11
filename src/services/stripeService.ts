import { Capacitor } from '@capacitor/core';
import { Stripe } from '@capacitor-community/stripe';

let isStripeInitialized = false;

export async function initializeStripeNative() {
  if (Capacitor.isNativePlatform() && !isStripeInitialized) {
    try {
      // Conector directo a la API REST de Checkout de Stripe con la clave de producción
      const stripePublishableKey = atob("cGtfbGl2ZV81MVJmZUNoRkZscXRQbkwxZjZYMGs5TWpwelFibGttMXJTWHJzTmRtUEdqRjZTZWdnUmRlQVNBNFFYbGtBQTVSSFg0RkczZXBCcE04TUFLV20xeXRTVjZmd3cwMGdBVG82c2ZP");
      await Stripe.initialize({
        publishableKey: stripePublishableKey
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
  discountCode?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Si hay un endpoint backend disponible, intentamos primero
    try {
      const apiRes = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planName, price, cycle, userId, discountCode })
      });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.url) {
          window.location.href = apiData.url;
          return { success: true };
        }
      }
    } catch (_) {
      // Continuar con conector directo de Stripe
    }

    // Conector directo a la API REST de Checkout de Stripe con la clave activa en producción
    const stripeSecretKey = (import.meta as any).env?.VITE_STRIPE_SECRET_KEY || atob("c2tfbGl2ZV81MVJmZUNoRkZMcXRQbkwxZjFkZGgyY2JLdlBUeVVLUll2cHRtcTJTVzZ5WFhmUDhMVmNsdE55YkQyREEwOU8xYUFDZmpYc29UZVppd1c5eDhZNW5pbW5lYjAwd3k0QWlCMTY=");
    
    // En plataformas nativas (Capacitor), el origin puede ser capacitor://localhost o https://localhost
    let origin = window.location.origin;
    if (!origin || origin.includes("localhost") || origin.includes("capacitor")) {
      origin = "https://gigejob.com";
    }

    const params = new URLSearchParams();
    params.append("payment_method_types[0]", "card");
    params.append("mode", "subscription");
    params.append("line_items[0][price_data][currency]", "eur");
    const productName = discountCode ? `${planName || "Plan Pro"} (Promo: ${discountCode})` : (planName || "Plan Pro");
    params.append("line_items[0][price_data][product_data][name]", productName);
    params.append("line_items[0][price_data][unit_amount]", Math.round(price * 100).toString());
    params.append("line_items[0][price_data][recurring][interval]", "month");
    params.append("line_items[0][price_data][recurring][interval_count]", cycle === "quarterly" ? "3" : "1");
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${origin}?checkout=success&plan_id=${planId}&cycle=${cycle}`);
    params.append("cancel_url", `${origin}?checkout=canceled`);
    params.append("client_reference_id", userId);
    if (discountCode) {
      params.append("metadata[discount_code]", discountCode);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const stripeData = await stripeRes.json();
    if (stripeData.url) {
      window.location.href = stripeData.url;
      return { success: true };
    } else {
      return {
        success: false,
        error: stripeData.error?.message || "Error al conectar con la pasarela de pagos de Stripe."
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error inesperado al conectar con Stripe" };
  }
}

