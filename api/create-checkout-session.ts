import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
  }
  return stripeClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { planId, planName, price, cycle, userId, discountCode, originalPrice, discountPercent } = req.body || {};
    if (!planId || !price) {
      return res.status(400).json({ error: 'Faltan datos requeridos del plan' });
    }

    const stripe = getStripe();
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const baseRecurringPrice = originalPrice && originalPrice > 0 ? originalPrice : price;

    let appliedCouponId: string | null = null;
    if (discountCode && discountPercent && discountPercent > 0 && discountPercent < 100) {
      try {
        const cleanCode = String(discountCode).trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
        const couponId = `PROMO_${cleanCode}_${discountPercent}_ONCE`;
        try {
          await stripe.coupons.create({
            id: couponId,
            duration: 'once',
            percent_off: Number(discountPercent),
            name: `${cleanCode} (${discountPercent}% en primer pago)`,
          });
          appliedCouponId = couponId;
        } catch (cErr: any) {
          if (cErr.code === 'resource_already_exists') {
            appliedCouponId = couponId;
          }
        }
      } catch (err) {
        console.warn('Error creating coupon in backend:', err);
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: planName || 'Plan Pro',
            },
            unit_amount: Math.round((appliedCouponId ? baseRecurringPrice : price) * 100),
            recurring: {
              interval: 'month',
              interval_count: cycle === 'quarterly' ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      discounts: appliedCouponId ? [{ coupon: appliedCouponId }] : undefined,
      mode: 'subscription',
      success_url: `${origin}?checkout=success&plan_id=${planId}&cycle=${cycle}`,
      cancel_url: `${origin}?checkout=canceled`,
      client_reference_id: userId,
      metadata: {
        planId,
        cycle,
        userId,
        discountCode: discountCode || '',
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor de pagos' });
  }
}
