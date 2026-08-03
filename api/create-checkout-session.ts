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
    const { planId, planName, price, cycle, userId } = req.body || {};
    if (!planId || !price) {
      return res.status(400).json({ error: 'Faltan datos requeridos del plan' });
    }

    const stripe = getStripe();
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: planName || 'Plan Pro',
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval: 'month',
              interval_count: cycle === 'quarterly' ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}?checkout=success&plan_id=${planId}`,
      cancel_url: `${origin}?checkout=canceled`,
      client_reference_id: userId,
      metadata: {
        planId,
        cycle,
        userId
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor de pagos' });
  }
}
