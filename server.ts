import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import cron from "node-cron";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

// Configuración de nodemailer
console.log("Configurando Nodemailer con host:", process.env.SMTP_HOST);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true para 465, false para los demás
  auth: {
    user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
    pass: process.env.SMTP_PASS || "etherealpass"
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
     admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
     });
  } else {
     admin.initializeApp();
  }
} catch (error) {
  console.log("Firebase Admin SDK failed to initialize. Cleanup job may fail:", error);
}

// Cron job: run every hour to delete unverified users older than 24h
cron.schedule('0 * * * *', async () => {
  try {
    console.log("Running unverified user cleanup...");
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
    
    let nextPageToken: string | undefined;
    const usersToDelete: string[] = [];
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      listUsersResult.users.forEach((userRecord) => {
        const creationTime = new Date(userRecord.metadata.creationTime).getTime();
        
        if (!userRecord.emailVerified && creationTime < twentyFourHoursAgo) {
          usersToDelete.push(userRecord.uid);
        }
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    if (usersToDelete.length > 0) {
      console.log(`Found ${usersToDelete.length} unverified users to delete.`);
      
      // Delete in batches of 1000 (Auth max is 1000)
      for (let i = 0; i < usersToDelete.length; i += 1000) {
         const batch = usersToDelete.slice(i, i + 1000);
         await admin.auth().deleteUsers(batch);
         console.log(`Deleted batch of ${batch.length} users from Auth.`);
         
         const db = admin.firestore();
         for (let j = 0; j < batch.length; j += 500) {
            const dbBatch = db.batch();
            const subBatch = batch.slice(j, j + 500);
            for (const uid of subBatch) {
              const userRef = db.collection('users').doc(uid);
              dbBatch.delete(userRef);
            }
            await dbBatch.commit();
         }
         console.log(`Deleted batch of ${batch.length} users from Firestore.`);
      }
    }
  } catch (error) {
    console.error("Error during unverified user cleanup:", error);
  }
});

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    if (key.startsWith('pk_')) {
      throw new Error('Has configurado una "Publishable Key" de Stripe (empieza por pk_). Por favor, usa la "Secret Key" (que empieza por sk_ o rk_). Puedes cambiarla en el botón de ajustes/Secrets.');
    }
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      }
    });

    // Handle sending messages
    socket.on("send_message", (data) => {
      // data: { to: userId, from: userId, text: string, senderName: string }
      if (data.to) {
        io.to(data.to).emit("new_message", {
          from: data.from,
          senderName: data.senderName,
          text: data.text,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle job alerts (could be triggered by some backend logic)
    // For demo, we allow a client to broadcast a job alert to everyone
    socket.on("broadcast_job_alert", (data) => {
      // data: { title: string, category: string, location: string }
      socket.broadcast.emit("job_alert", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API routes
  app.use(express.json());
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Endpoint to trigger a job alert via HTTP (useful for testing)
  app.post("/api/trigger-job-alert", (req, res) => {
    const { title, category, location } = req.body;
    io.emit("job_alert", {
      title,
      category,
      location,
      timestamp: new Date().toISOString(),
    });
    res.json({ success: true });
  });

  // Endpoint for Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, planName, price, cycle, userId } = req.body;
      const stripe = getStripe();
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: planName,
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
        success_url: `${req.headers.origin || 'http://localhost:3000'}?checkout=success&plan_id=${planId}`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}?checkout=canceled`,
        client_reference_id: userId,
        metadata: {
          planId,
          cycle,
          userId
        }
      });
      
      res.json({ url: session.url });
    } catch (err: any) {
      console.error('Error creating checkout session', err);
      // Give a dummy URL if key is missing to not block the UI completely if just testing a preview UI
      if (err.message.includes('STRIPE_SECRET_KEY')) {
         res.status(500).json({ error: 'STRIPE_SECRET_KEY is not defined. Please add it to your environment variables.' });
         return;
      }
      if (err.message.includes('publishable API key')) {
         res.status(500).json({ error: 'Has configurado una "Publishable Key" de Stripe. Por favor, usa la "Secret Key" (que empieza por sk_). Puedes cambiarla en el botón de ajustes/Secrets.' });
         return;
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint for asynchronous heavy tasks (e.g. bulk updates)
  app.post("/api/tasks/bulk-update", async (req, res) => {
    // Acknowledge the request immediately so the client isn't blocked
    res.status(202).json({ status: "accepted", message: "Task started in background" });
    
    const { collectionName, ids, updates } = req.body;
    try {
      if (admin.apps.length > 0) {
        const db = admin.firestore();
        const batch = db.batch();
        ids.forEach((id: string) => {
          const ref = db.collection(collectionName).doc(id);
          batch.update(ref, updates);
        });
        await batch.commit();
        console.log(`[Async Task] Successfully updated ${ids.length} docs in ${collectionName}`);
      } else {
        console.log("[Async Task] Firebase Admin not initialized, skipping DB update");
      }
    } catch (err) {
      console.error("[Async Task] Failed during background execution:", err);
    }
  });

  // Endpoints para envío de correos
  app.post("/api/email/notify-request", async (req, res) => {
    const { clientName, professionalEmail, serviceTitle, dateStr, startTime, location, description } = req.body;
    
    if (!professionalEmail) {
      return res.status(400).json({ error: "Missing professional email" });
    }
  
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="margin: 0; color: #111;">Nueva Solicitud de Servicio</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <p>Hola,</p>
          <p>El cliente <strong>${clientName}</strong> ha solicitado tus servicios para <strong>${serviceTitle}</strong>.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Fecha:</strong> ${dateStr} a las ${startTime}</p>
            <p><strong>Lugar:</strong> ${location}</p>
            <p><strong>Descripción:</strong> ${description}</p>
          </div>
          <p>Por favor, accede a la plataforma para aceptar o rechazar la solicitud.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${req.headers.origin || 'http://localhost:3000'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ir a la plataforma</a>
          </div>
        </div>
      </div>
    `;
  
    try {
      const info = await transporter.sendMail({
        from: `"GigeJob" <${process.env.SMTP_USER || 'no-reply@gigejob.com'}>`,
        to: professionalEmail,
        subject: "Nueva solicitud de servicio",
        html: htmlContent,
      });
      console.log("Notificación de solicitud enviada: %s", info.messageId);
      if (!process.env.SMTP_USER && info.messageId) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error enviando correo de solicitud:", err);
      res.status(500).json({ error: "Error enviando correo" });
    }
  });
  
  app.post("/api/email/notify-accepted", async (req, res) => {
    const { clientEmail, professionalEmail, clientName, professionalName, serviceTitle, dateStr, startTime, location, totalCost } = req.body;
  
    if (!clientEmail || !professionalEmail) {
      return res.status(400).json({ error: "Missing emails" });
    }
  
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="margin: 0; color: #111;">¡Servicio Aceptado!</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <p>Hola,</p>
          <p>Nos complace informar que el servicio <strong>${serviceTitle}</strong> ha sido aceptado definitivamente.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px;">Resumen del Servicio:</h3>
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Profesional:</strong> ${professionalName}</p>
            <p><strong>Fecha y Hora:</strong> ${dateStr} a las ${startTime}</p>
            <p><strong>Lugar:</strong> ${location}</p>
            <p><strong>Presupuesto Acordado:</strong> ${totalCost}€</p>
          </div>
          <p>¡Gracias por confiar en GigeJob!</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${req.headers.origin || 'http://localhost:3000'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ir a la plataforma</a>
          </div>
        </div>
      </div>
    `;
  
    try {
      const info = await transporter.sendMail({
        from: `"GigeJob" <${process.env.SMTP_USER || 'no-reply@gigejob.com'}>`,
        to: [clientEmail, professionalEmail].join(", "),
        subject: "Servicio aceptado definitivamente",
        html: htmlContent,
      });
      console.log("Notificación de aceptación enviada: %s", info.messageId);
      if (!process.env.SMTP_USER && info.messageId) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error enviando correo de aceptación:", err);
      res.status(500).json({ error: "Error enviando correo" });
    }
  });

  app.post("/api/email/notify-cancelled", async (req, res) => {
    const { clientEmail, professionalEmail, clientName, professionalName, serviceTitle, cancelledByRole } = req.body;
    
    if (!clientEmail || !professionalEmail) {
      return res.status(400).json({ error: "Missing emails" });
    }

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #ff0000;">Servicio Cancelado</h2>
        <p>Hola,</p>
        <p>El servicio <strong>${serviceTitle}</strong> entre ${clientName} y ${professionalName} ha sido cancelado por el ${cancelledByRole === "client" ? "cliente" : "profesional"}.</p>
        <p>Si consideras que esto es un error o necesitas más ayuda, por favor contacta con soporte.</p>
        <br/>
        <p>Saludos,<br/>El equipo de GigeJob</p>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: \`"GigeJob" <\${process.env.SMTP_USER || 'no-reply@gigejob.com'}>\`,
        to: [clientEmail, professionalEmail].join(", "),
        subject: "Servicio Cancelado",
        html: htmlContent,
      });
      console.log("Notificación de cancelación enviada: %s", info.messageId);
      if (!process.env.SMTP_USER && info.messageId) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error enviando correo de cancelación:", err);
      res.status(500).json({ error: "Error enviando correo" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    // Import Vite plugins dynamically or at the top. Here we just require them.
    const tailwindcss = (await import('@tailwindcss/vite')).default;
    const react = (await import('@vitejs/plugin-react')).default;

    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': process.cwd(),
        },
      },
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true'
      },
      build: {
        target: 'esnext'
      },
      optimizeDeps: {
        esbuildOptions: {
          target: 'esnext'
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development
    
const validPrefixes = [
  '/pagina/', '/blog', '/explorar', '/admin', '/login', '/registro',
  '/mensajes', '/mis-anuncios', '/favoritos', '/estadisticas', '/monederos',
  '/configuracion/', '/anuncio/', '/publicar', '/perfil'
];

function isKnownRoute(url: string): boolean {
  if (url === '/' || url.startsWith('/?')) return true;
  const path = url.split('?')[0];
  if (path === '/configuracion') return true;
  return validPrefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'));
}

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const status = isKnownRoute(url) ? 200 : 404;
        res.status(status).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const status = isKnownRoute(req.originalUrl) ? 200 : 404;
      res.status(status).sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
