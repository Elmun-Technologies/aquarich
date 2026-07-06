/**
 * Telegram bot webhook — /start va inline tugmalar
 *
 * Muhit o'zgaruvchilari:
 *   TELEGRAM_BOT_TOKEN
 *   WEBAPP_URL          — https://zilolsuv.uz yoki Vercel domen
 *   TELEGRAM_WEBHOOK_SECRET (ixtiyoriy, xavfsizlik uchun)
 *
 * Webhook o'rnatish: npm run set-webhook
 */

var bot = require("../lib/telegram-api");

async function readBody(req) {
  if (req.body) {
    if (typeof req.body === "string") {
      try { return JSON.parse(req.body); } catch (e) { return {}; }
    }
    return req.body;
  }
  return await new Promise(function (resolve) {
    var raw = "";
    req.on("data", function (c) { raw += c; });
    req.on("end", function () {
      try { resolve(JSON.parse(raw || "{}")); } catch (e) { resolve({}); }
    });
  });
}

async function handleStart(chatId, firstName, startParam) {
  var urls = bot.getWebAppUrls(startParam || "start");

  if (!urls.b2c || !urls.b2b) {
    await bot.sendMessage(
      chatId,
      "⚠️ Sayt hali ulanmagan.\n\nAdmin: <code>WEBAPP_URL</code> ni sozlang (masalan https://zilolsuv.uz)"
    );
    return;
  }

  var text = bot.buildStartMessage(firstName);

  // Reklama deep link: t.me/bot?start=b2c yoki start=b2b
  if (startParam === "b2c") {
    text += "\n\n🏠 <i>Uy uchun tanlandi — quyidagi tugmani bosing:</i>";
    await bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏠 Uy uchun buyurtma", web_app: { url: urls.b2c } }],
          [{ text: "🏢 Biznes sahifasi", web_app: { url: urls.b2b } }],
        ],
      },
    });
    return;
  }

  if (startParam === "b2b") {
    text += "\n\n🏢 <i>Biznes uchun tanlandi — quyidagi tugmani bosing:</i>";
    await bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏢 Biznes buyurtma", web_app: { url: urls.b2b } }],
          [{ text: "🏠 Uy sahifasi", web_app: { url: urls.b2c } }],
        ],
      },
    });
    return;
  }

  await bot.sendMessage(chatId, text, {
    reply_markup: bot.buildWebAppKeyboard(urls.b2c, urls.b2b),
  });
}

async function handleWebAppData(message) {
  // Mini App ichidan sendData() kelganda (ixtiyoriy)
  var chatId = message.chat.id;
  var data = message.web_app_data && message.web_app_data.data;
  if (!data) return;

  await bot.sendMessage(chatId, "✅ Ariza qabul qilindi!\n\nTez orada bog'lanamiz.");

  // Kanalga ham yuborish
  var channelIds = String(process.env.TELEGRAM_CHAT_ID || "")
    .split(",").map(function (s) { return s.trim(); }).filter(Boolean);

  for (var i = 0; i < channelIds.length; i++) {
    try {
      await bot.sendMessage(channelIds[i], "📲 <b>Web App orqali:</b>\n" + data);
    } catch (e) { /* ignore */ }
  }
}

async function processUpdate(update) {
  if (update.message) {
    var msg = update.message;
    var text = (msg.text || "").trim();

    if (text.indexOf("/start") === 0) {
      var parts = text.split(/\s+/);
      var startParam = parts[1] || "";
      await handleStart(msg.chat.id, msg.from && msg.from.first_name, startParam);
      return;
    }

    if (msg.web_app_data) {
      await handleWebAppData(msg);
      return;
    }
  }

  if (update.callback_query) {
    var cq = update.callback_query;
    await bot.answerCallbackQuery(cq.id, "Tugmani bosing 👇");
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    var urls = bot.getWebAppUrls("start");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({
      ok: true,
      message: "Aquarich Telegram webhook ishlayapti",
      webapp_base: bot.getWebAppUrl(),
      b2c_url: urls.b2c,
      b2b_url: urls.b2b,
      has_bot_token: !!bot.getToken(),
    }, null, 2));
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method not allowed");
  }

  var secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers["x-telegram-bot-api-secret-token"] !== secret) {
    res.statusCode = 401;
    return res.end("Unauthorized");
  }

  if (!bot.getToken()) {
    res.statusCode = 500;
    return res.end("TELEGRAM_BOT_TOKEN sozlanmagan");
  }

  var update;
  try {
    update = await readBody(req);
    await processUpdate(update);
  } catch (e) {
    console.error("Webhook xato:", e);
  }

  // Telegram har doim 200 kutadi
  res.statusCode = 200;
  res.end("ok");
};
