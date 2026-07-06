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

  // Bot tavsifi
  await fetch("https://api.telegram.org/bot" + token + "/setMyDescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: "Zilol Suv — toza suv filtrlari. /start bosing va buyurtma bering.",
    }),
  });

  await fetch("https://api.telegram.org/bot" + token + "/setMyShortDescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      short_description: "Uy va biznes uchun suv filtrlari",
    }),
  });

  // Bot buyruqlari
  await fetch("https://api.telegram.org/bot" + token + "/setMyCommands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Buyurtma sahifasini ochish" },
      ],
    }),
  });

  console.log("\n✅ Tayyor! Botda /start bosing.");
  console.log("Reklama uchun deep link:");
  console.log("  B2C: https://t.me/" + (process.env.BOT_USERNAME || "BOT_USERNAME") + "?start=b2c");
  console.log("  B2B: https://t.me/" + (process.env.BOT_USERNAME || "BOT_USERNAME") + "?start=b2b");
  console.log("\n@BotFather → Bot Settings → Menu Button → Web App URL:", webappUrl + "/index.html");
})();
