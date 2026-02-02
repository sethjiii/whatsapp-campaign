import axios from "axios";

export async function sendWhatsAppMessage({
  to,
  message,
  settings,
}) {
  const { evolutionApiUrl, evolutionApiKey, instanceName } = settings;

  /* 1️⃣ Config validation */
  if (!evolutionApiUrl || !evolutionApiKey || !instanceName) {
    throw new Error("Evolution API not fully configured");
  }

  if (!to || !message) {
    throw new Error("Invalid WhatsApp payload");
  }

  /* 2️⃣ Normalize phone */
  const formatted = to.replace(/\D/g, "").replace(/^91/, "");
  const whatsappNumber = `91${formatted}@s.whatsapp.net`;

  /* 3️⃣ Payload (Evolution v2.x compatible) */
  const payload = {
    number: whatsappNumber,
    text: message,
    options: {
      delay: 1200,
      presence: "composing",
      linkPreview: false,
    },
  };

  /* 🔥 CRITICAL FIX: normalize base URL */
  const baseUrl = evolutionApiUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/message/sendText/${instanceName}`;

  /* 4️⃣ Send */
  const response = await axios.post(url, payload, {
    headers: {
      apikey: evolutionApiKey,
      "Content-Type": "application/json",
    },
    timeout: 10_000,
  });

  return response.data;
}
