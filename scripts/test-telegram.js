#!/usr/bin/env node
/**
 * Telegram sozlamalarini tekshirish.
 * Ishlatish: .env faylini to'ldiring, keyin: npm run test:telegram
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(function (line) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  });
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error("Xato: .env faylida TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID bo'lishi kerak.");
  console.error("Namuna: cp .env.example .env");
  process.exit(1);
}

const text =
  "✅ <b>Test xabar — Aquarich</b>\n\n" +
  "Agar buni ko'rsangiz, bot kanal/guruhga to'g'ri ulangan.\n\n" +
  "🕒 " + new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

const ids = String(chatId).split(",").map(function (s) { return s.trim(); }).filter(Boolean);

(async function () {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    console.log("Yuborilmoqda →", id);
    const res = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: id,
        text: text,
        parse_mode: "HTML",
      }),
    });
    const body = await res.json();
    if (!body.ok) {
      console.error("Xato:", JSON.stringify(body, null, 2));
      process.exit(1);
    }
    console.log("OK:", id);
  }
  console.log("\nHammasi tayyor! Endi saytni deploy qiling.");
})();
