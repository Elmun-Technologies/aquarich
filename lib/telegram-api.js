/**
 * Telegram Bot API yordamchi funksiyalar
 */

function getToken() {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

function getWebAppUrl() {
  // WEBAPP_URL birinchi; yo'q bo'lsa production domen (VERCEL_URL emas —
  // u himoyalangan deployment URL bo'lib, Telegram WebView da login ochiladi)
  var url = (
    process.env.WEBAPP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    ""
  ).replace(/\/$/, "");
  if (!url) return "";
  if (url.indexOf("http") !== 0) url = "https://" + url;
  return url;
}

async function tgApi(method, body) {
  var token = getToken();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN yo'q");

  var res = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  var data = await res.json();
  if (!data.ok) {
    throw new Error(method + ": " + JSON.stringify(data));
  }
  return data.result;
}

async function sendMessage(chatId, text, extra) {
  return tgApi("sendMessage", Object.assign({
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  }, extra || {}));
}

async function answerCallbackQuery(callbackQueryId, text) {
  return tgApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text || "",
    show_alert: false,
  });
}

function buildWebAppKeyboard(b2cUrl, b2bUrl) {
  return {
    inline_keyboard: [[
      { text: "🏠 Uy uchun (B2C)", web_app: { url: b2cUrl } },
      { text: "🏢 Biznes (B2B)", web_app: { url: b2bUrl } },
    ]],
  };
}

function buildStartMessage(firstName) {
  var name = firstName ? ", " + firstName : "";
  return (
    "👋 Salom" + name + "!\n\n" +
    "<b>Aquarich</b> — toza suv filtrlari.\n" +
    "<i>Har tomchida g'amxo'rlik</i> 💧\n\n" +
    "Qaysi mahsulot kerak? Tugmani bosing — buyurtma sahifasi ochiladi 👇"
  );
}

function getWebAppUrls(startParam) {
  var base = getWebAppUrl();
  if (!base) return { b2c: "", b2b: "" };

  var src = startParam ? "&start=" + encodeURIComponent(startParam) : "";
  return {
    b2c: base + "/?utm_source=telegram" + src,
    b2b: base + "/b2b?utm_source=telegram" + src,
  };
}

module.exports = {
  getToken,
  getWebAppUrl,
  tgApi,
  sendMessage,
  answerCallbackQuery,
  buildWebAppKeyboard,
  buildStartMessage,
  getWebAppUrls,
};
