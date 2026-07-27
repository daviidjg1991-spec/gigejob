import * as functions from "firebase-functions/v2";
import * as nodemailer from "nodemailer";

// Leer la contraseña desde el entorno o Secret Manager
const SMTP_USER = process.env.SMTP_USER || "info@gigejob.com";
const SMTP_PASS = process.env.SMTP_PASS || "";

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const notifyRequest = functions.https.onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const {
      clientName,
      professionalEmail,
      serviceTitle,
      dateStr,
      startTime,
      location,
      description,
    } = req.body;

    if (!professionalEmail) {
      res.status(400).json({ error: "Missing professional email" });
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="color: #000; margin: 0;">GigeJob</h2>
          <p style="color: #666; margin-top: 5px;">Nueva Solicitud de Servicio</p>
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
            <a href="${req.headers.origin || 'https://gigejob.com'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ir a la plataforma</a>
          </div>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"GigeJob" <${SMTP_USER}>`,
        to: professionalEmail,
        subject: "Nueva solicitud de servicio",
        html: htmlContent,
      });

      console.log("Mensaje de solicitud enviado: %s", info.messageId);
      res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error("Error al enviar correo de solicitud:", error);
      res.status(500).json({ error: "Error sending email" });
    }
  }
);

export const notifyAccepted = functions.https.onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const {
      clientName,
      professionalName,
      clientEmail,
      professionalEmail,
      serviceTitle,
      dateStr,
      startTime,
      location,
      totalCost,
    } = req.body;

    if (!clientEmail || !professionalEmail) {
      res.status(400).json({ error: "Missing emails" });
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="color: #000; margin: 0;">GigeJob</h2>
          <p style="color: #666; margin-top: 5px;">Servicio Confirmado</p>
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
            <a href="${req.headers.origin || 'https://gigejob.com'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ir a la plataforma</a>
          </div>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"GigeJob" <${SMTP_USER}>`,
        to: [clientEmail, professionalEmail].join(", "),
        subject: "Servicio aceptado definitivamente",
        html: htmlContent,
      });

      console.log("Correo de aceptación enviado: %s", info.messageId);
      res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error("Error al enviar correos de aceptación:", error);
      res.status(500).json({ error: "Error sending email" });
    }
  }
);
