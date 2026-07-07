/**
 * Aquarich — ariza (lid) yuboruvchi serverless funksiya.
 *
 * Vercel: avtomatik `/api/lead` endpoint.
 *
 * Muhit o'zgaruvchilari:
 *   TELEGRAM_BOT_TOKEN  — @BotFather token
 *   TELEGRAM_CHAT_ID    — kanal/guruh ID yoki @username
 *                         Bir nechta bo'lsa vergul bilan: -100123,@kanal
 *
 * Kanal uchun: botni kanalga ADMIN qiling («Post messages» ruxsati).
 */

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanUrl(url) {
  if (!url) return "";
  return String(url).split("#")[0].replace(/\/$/, "") || url;
}

function pageLabel(page) {
  var p = String(page || "/");
  if (p.indexOf("b2b") >= 0) return "B2B — biznes";
  return "B2C — uy uchun";
}

function buildMessage(data) {
  const isB2b = (data.form_type || "").toUpperCase() === "B2B";
  const title = isB2b
    ? "🏢 <b>Aquarich — YANGI B2B SO'ROV</b>"
    : "🏠 <b>Aquarich — YANGI B2C ARIZA</b>";
  const rows = [title, ""];

  if (data.company) rows.push("🏷 <b>Kompaniya:</b> " + escapeHtml(data.company));
  if (data.name) rows.push("👤 <b>Ism:</b> " + escapeHtml(data.name));
  if (data.phone) rows.push("📞 <b>Telefon:</b> " + escapeHtml(data.phone));
  if (data.region) rows.push("📍 <b>Viloyat:</b> " + escapeHtml(data.region));
  if (data.segment) rows.push("🏬 <b>Soha:</b> " + escapeHtml(data.segment));
  if (data.volume) rows.push("💧 <b>Hajm:</b> " + escapeHtml(data.volume));

  if (data.tg_user) {
    var uname = String(data.tg_user).replace(/^@/, "");
    rows.push(
      "📲 <b>Telegram:</b> <a href=\"https://t.me/" + escapeHtml(uname) + "\">@" +
      escapeHtml(uname) + "</a>"
    );
  }
  if (data.tg_id) rows.push("🆔 <b>TG ID:</b> " + escapeHtml(data.tg_id));

  rows.push("");
  rows.push("🕒 " + new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }));
  rows.push("📱 <b>Manba:</b> " + (data.tg_id ? "Telegram bot" : "Sayt") + " · " + pageLabel(data.page));

  return rows.join("\n");
}

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body) {
    if (typeof req.body === "string") {
      try { return JSON.parse(req.body); } catch (e) { return {}; }
    }
    return req.body;
  }
  return await new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); } catch (e) { resolve({}); }
    });
  });
}

function parseChatIds(raw) {
  return String(raw || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

async function sendToTelegram(token, chatId, text) {
  const tgRes = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!tgRes.ok) {
    const errText = await tgRes.text();
    throw new Error("chat " + chatId + ": " + errText);
  }
  return tgRes.json();
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return jsonResponse(res, 204, { ok: true });
  }

  if (req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = parseChatIds(process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatIds.length) {
    return jsonResponse(res, 500, {
      ok: false,
      error: "Server sozlanmagan. TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID kerak.",
    });
  }

  let data;
  try {
    data = await readBody(req);
  } catch (e) {
    data = {};
  }

  // Honeypot (botlar uchun yashirin maydon)
  if (data.website) {
    return jsonResponse(res, 200, { ok: true });
  }

  if (!data || (!data.phone && !data.name)) {
    return jsonResponse(res, 400, { ok: false, error: "Telefon yoki ism kerak" });
  }

  const text = buildMessage(data);
  const errors = [];

  for (let i = 0; i < chatIds.length; i++) {
    try {
      await sendToTelegram(token, chatIds[i], text);
    } catch (e) {
      errors.push(String(e.message || e));
    }
  }

  if (errors.length === chatIds.length) {
    return jsonResponse(res, 502, {
      ok: false,
      error: "Telegram'ga yuborib bo'lmadi",
      detail: errors.join(" | "),
    });
  }

  return jsonResponse(res, 200, { ok: true });
};
