#!/usr/bin/env node
/**
 * Telegram webhook o'rnatish
 * Ishlatish: cp .env.example .env → to'ldiring → npm run set-webhook
 */

var fs = require("fs");
var path = require("path");

var envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(function (line) {
    var m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
}

var token = process.env.TELEGRAM_BOT_TOKEN;
var webappUrl = (process.env.WEBAPP_URL || "").replace(/\/$/, "");
var secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";

if (!token) {
  console.error("Xato: .env da TELEGRAM_BOT_TOKEN kerak");
  process.exit(1);
}

if (!webappUrl) {
  console.error("Xato: .env da WEBAPP_URL kerak (masalan https://zilolsuv.uz)");
  process.exit(1);
}

var webhookUrl = webappUrl + "/api/telegram-webhook";

(async function () {
  console.log("Webhook URL:", webhookUrl);

  var body = { url: webhookUrl, allowed_updates: ["message", "callback_query"] };
  if (secret) body.secret_token = secret;

  var res = await fetch("https://api.telegram.org/bot" + token + "/setWebhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  var data = await res.json();
  console.log("setWebhook:", data);

  if (!data.ok) process.exit(1);

  // Bot tavsifi (BotFather → Edit About / Edit Description bilan bir xil)
  var aboutText =
    "Har tomchida g'amxo'rlik. RO suv filtrlari — uy va biznes uchun. Yetkazamiz, o'rnatamiz, servis.";

  var descriptionText =
    "Aquarich — O'zbekiston uchun aqlli teskari osmos (RO) suv filtrlari.\n\n" +
    "💧 Nima taklif qilamiz?\n" +
    "• 🏠 Uy uchun — 9 bosqichli to'liq to'plam (3 500 000 so'm)\n" +
    "• 🏢 Biznes uchun — 200–1000 L/kun tizimlar\n\n" +
    "✅ Bepul yetkazib berish va o'rnatish\n" +
    "✅ 1 yillik servis kafolati\n" +
    "✅ O'zbekiston bo'ylab xizmat\n\n" +
    "Buyurtma berish: /start bosing — sahifa ochiladi.\n" +
    "Savol: +998 93 456 40 00";

  await fetch("https://api.telegram.org/bot" + token + "/setMyDescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: descriptionText }),
  });

  await fetch("https://api.telegram.org/bot" + token + "/setMyShortDescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ short_description: aboutText }),
  });

  await fetch("https://api.telegram.org/bot" + token + "/setMyName", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Aquarich" }),
  });

  // Bot buyruqlari
  await fetch("https://api.telegram.org/bot" + token + "/setMyCommands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Buyurtma sahifasini ochish (B2C / B2B)" },
        { command: "help", description: "Yordam, narx va aloqa" },
      ],
    }),
  });

  console.log("\n✅ Tayyor! Botda /start bosing.");
  console.log("Reklama uchun deep link:");
  console.log("  B2C: https://t.me/" + (process.env.BOT_USERNAME || "BOT_USERNAME") + "?start=b2c");
  console.log("  B2B: https://t.me/" + (process.env.BOT_USERNAME || "BOT_USERNAME") + "?start=b2b");
  console.log("\n@BotFather → Bot Settings → Menu Button → Web App URL:", webappUrl + "/");
  console.log("@BotFather → Bot Settings → Domain:", webappUrl.replace(/^https?:\/\//, ""));
})();
