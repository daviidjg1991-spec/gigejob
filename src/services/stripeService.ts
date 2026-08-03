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
      // Conector directo a la API REST de Checkout de Stripe
      const stripeSecretKey = atob("c2tfbGl2ZV81MVJmZUNoRkZscXRQbkwxZjFkZGgyY2JLdlBUeVVLUll2cHRtcTJTVzZ5WFhmUDhMVmNsdE55YkQyREEwOU8xYUFDZmpYc29UZVppV1c5eDhZNW5pbW5lYjAwd3k0QWlCMTY=");
      const origin = window.location.origin;

      const params = new URLSearchParams();
      params.append("payment_method_types[0]", "card");
      params.append("mode", "subscription");
      params.append("line_items[0][price_data][currency]", "eur");
      params.append("line_items[0][price_data][product_data][name]", planName || "Plan Pro");
      params.append("line_items[0][price_data][unit_amount]", Math.round(price * 100).toString());
      params.append("line_items[0][price_data][recurring][interval]", "month");
      params.append("line_items[0][price_data][recurring][interval_count]", cycle === "quarterly" ? "3" : "1");
      params.append("line_items[0][quantity]", "1");
      params.append("success_url", `${origin}?checkout=success&plan_id=${planId}`);
      params.append("cancel_url", `${origin}?checkout=canceled`);
      params.append("client_reference_id", userId);

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
    }



  } catch (err: any) {
    return { success: false, error: err.message || "Error inesperado al procesar el pago" };
  }
}
