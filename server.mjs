// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import cron from "node-cron";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  // true para 465, false para los demás
  auth: {
    user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
    pass: process.env.SMTP_PASS || "etherealpass"
  }
});
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
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
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running unverified user cleanup...");
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3).getTime();
    let nextPageToken;
    const usersToDelete = [];
    do {
      const listUsersResult = await admin.auth().listUsers(1e3, nextPageToken);
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
      for (let i = 0; i < usersToDelete.length; i += 1e3) {
        const batch = usersToDelete.slice(i, i + 1e3);
        await admin.auth().deleteUsers(batch);
        console.log(`Deleted batch of ${batch.length} users from Auth.`);
        const db = admin.firestore();
        for (let j = 0; j < batch.length; j += 500) {
          const dbBatch = db.batch();
          const subBatch = batch.slice(j, j + 500);
          for (const uid of subBatch) {
            const userRef = db.collection("users").doc(uid);
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
var stripeClient = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    if (key.startsWith("pk_")) {
      throw new Error('Has configurado una "Publishable Key" de Stripe (empieza por pk_). Por favor, usa la "Secret Key" (que empieza por sk_ o rk_). Puedes cambiarla en el bot\xF3n de ajustes/Secrets.');
    }
    stripeClient = new Stripe(key, { apiVersion: "2023-10-16" });
  }
  return stripeClient;
}
async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });
  const PORT = 3e3;
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      }
    });
    socket.on("send_message", (data) => {
      if (data.to) {
        io.to(data.to).emit("new_message", {
          from: data.from,
          senderName: data.senderName,
          text: data.text,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    });
    socket.on("broadcast_job_alert", (data) => {
      socket.broadcast.emit("job_alert", {
        ...data,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
  app.use(express.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.post("/api/trigger-job-alert", (req, res) => {
    const { title, category, location } = req.body;
    io.emit("job_alert", {
      title,
      category,
      location,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ success: true });
  });
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, planName, price, cycle, userId } = req.body;
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: planName
              },
              unit_amount: Math.round(price * 100),
              recurring: {
                interval: "month",
                interval_count: cycle === "quarterly" ? 3 : 1
              }
            },
            quantity: 1
          }
        ],
        mode: "subscription",
        success_url: `${req.headers.origin || "http://localhost:3000"}?checkout=success&plan_id=${planId}`,
        cancel_url: `${req.headers.origin || "http://localhost:3000"}?checkout=canceled`,
        client_reference_id: userId,
        metadata: {
          planId,
          cycle,
          userId
        }
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error("Error creating checkout session", err);
      if (err.message.includes("STRIPE_SECRET_KEY")) {
        res.status(500).json({ error: "STRIPE_SECRET_KEY is not defined. Please add it to your environment variables." });
        return;
      }
      if (err.message.includes("publishable API key")) {
        res.status(500).json({ error: 'Has configurado una "Publishable Key" de Stripe. Por favor, usa la "Secret Key" (que empieza por sk_). Puedes cambiarla en el bot\xF3n de ajustes/Secrets.' });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/tasks/bulk-update", async (req, res) => {
    res.status(202).json({ status: "accepted", message: "Task started in background" });
    const { collectionName, ids, updates } = req.body;
    try {
      if (admin.apps.length > 0) {
        const db = admin.firestore();
        const batch = db.batch();
        ids.forEach((id) => {
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
          <p>El cliente <strong>\${clientName}</strong> ha solicitado tus servicios para <strong>\${serviceTitle}</strong>.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Fecha:</strong> \${dateStr} a las \${startTime}</p>
            <p><strong>Lugar:</strong> \${location}</p>
            <p><strong>Descripci\xF3n:</strong> \${description}</p>
          </div>
          <p>Por favor, accede a la plataforma para aceptar o rechazar la solicitud.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="\${req.headers.origin || 'http://localhost:3000'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ir a la plataforma</a>
          </div>
        </div>
      </div>
    `;
    try {
      const info = await transporter.sendMail({
        from: `"JobPop" <${process.env.SMTP_USER || "no-reply@jobpop.com"}>`,
        to: professionalEmail,
        subject: "Nueva solicitud de servicio",
        html: htmlContent
      });
      console.log("Notificaci\xF3n de solicitud enviada: %s", info.messageId);
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
          <h2 style="margin: 0; color: #111;">\xA1Servicio Aceptado!</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <p>Hola,</p>
          <p>Nos complace informar que el servicio <strong>\${serviceTitle}</strong> ha sido aceptado definitivamente.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px;">Resumen del Servicio:</h3>
            <p><strong>Cliente:</strong> \${clientName}</p>
            <p><strong>Profesional:</strong> \${professionalName}</p>
            <p><strong>Fecha y Hora:</strong> \${dateStr} a las \${startTime}</p>
            <p><strong>Lugar:</strong> \${location}</p>
            <p><strong>Presupuesto Acordado:</strong> \${totalCost}\u20AC</p>
          </div>
          <p>\xA1Gracias por confiar en JobPop!</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="\${req.headers.origin || 'http://localhost:3000'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ir a la plataforma</a>
          </div>
        </div>
      </div>
    `;
    try {
      const info = await transporter.sendMail({
        from: `"JobPop" <${process.env.SMTP_USER || "no-reply@jobpop.com"}>`,
        to: [clientEmail, professionalEmail].join(", "),
        subject: "Servicio aceptado definitivamente",
        html: htmlContent
      });
      console.log("Notificaci\xF3n de aceptaci\xF3n enviada: %s", info.messageId);
      if (!process.env.SMTP_USER && info.messageId) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error enviando correo de aceptaci\xF3n:", err);
      res.status(500).json({ error: "Error enviando correo" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    let isKnownRoute2 = function(url) {
      if (url === "/" || url.startsWith("/?")) return true;
      const path2 = url.split("?")[0];
      if (path2 === "/configuracion") return true;
      return validPrefixes.some((prefix) => path2 === prefix || path2.startsWith(prefix + "/"));
    };
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    const react = (await import("@vitejs/plugin-react")).default;
    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      define: {
        "process.env.GEMINI_API_KEY": JSON.stringify(process.env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          "@": process.cwd()
        }
      },
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
    const validPrefixes = [
      "/pagina/",
      "/blog",
      "/explorar",
      "/admin",
      "/login",
      "/registro",
      "/mensajes",
      "/mis-anuncios",
      "/favoritos",
      "/estadisticas",
      "/monederos",
      "/configuracion/",
      "/anuncio/",
      "/publicar",
      "/perfil"
    ];
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        const status = isKnownRoute2(url) ? 200 : 404;
        res.status(status).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const status = isKnownRoute(req.originalUrl) ? 200 : 404;
      res.status(status).sendFile(path.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
