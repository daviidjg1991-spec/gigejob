// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
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
  if (process.env.NODE_ENV !== "production") {
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
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
