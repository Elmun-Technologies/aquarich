# Zilol Suv — Suv filtri landing sayti

Osmos teskari osmos (RO) suv filtrlarini sotuvchi landing sayt. Ikki sahifa:

- `index.html` — **B2C** (uy xo'jaliklari, narx 3 500 000 so'm)
- `b2b.html` — **B2B** (biznes segmentlari, 200-1000 L/kun yechimlar)

Forma orqali kelgan lidlar **Telegram bot**ga yuboriladi.

## Texnologiya

Oddiy **HTML + CSS + JavaScript** — hech qanday build kerak emas. Tez yuklanadi, mobil-birinchi.

## Fayllar tuzilishi

```
.
├── index.html              # B2C landing
├── b2b.html                # B2B sahifa
├── assets/
│   ├── css/style.css       # Barcha stillar
│   ├── js/main.js          # Forma, mask, FAQ, animatsiya
│   └── img/                # Mahsulot rasmlari
├── api/
│   └── lead.js             # Telegram'ga lid yuboruvchi serverless funksiya
└── README.md
```

## Telegram kanal/guruhga ariza yuborish

Forma to'ldirilganda xabar **Telegram kanal yoki guruhga** keladi. Kod tayyor — faqat bot va kanalni ulash kerak.

### 1-qadam: Bot yaratish

1. Telegramda **@BotFather** ga yozing
2. `/newbot` → nom bering (masalan: `Zilol Suv Lidlar`)
3. Username bering (masalan: `zilolsuv_leads_bot`)
4. **Token** ni saqlang: `7123456789:AAE...`

### 2-qadam: Kanal yoki guruh

**Kanal (tavsiya):**
1. Telegramda yangi **kanal** oching: masalan `Zilol Suv — Arizalar`
2. Botni kanalga **admin** qiling
3. «Post messages» ruxsatini yoqing

**Guruh:**
1. Guruh oching yoki mavjud guruhga botni qo'shing
2. Botga xabar yozish ruxsati bering

### 3-qadam: Chat ID olish

**Usul A — @username (ochiq kanal):**
- Kanal username bo'lsa: `@kanal_username` (masalan `@zilolsuv_arizalar`)

**Usul B — raqamli ID:**
1. Botni kanalga admin qiling
2. Kanalga biror xabar post qiling
3. Brauzerda oching:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. `"chat":{"id":-1001234567890` qatoridagi **id** ni oling

> Guruh ID odatda manfiy: `-987654321`  
> Kanal ID: `-100xxxxxxxxxx`

### 4-qadam: Lokal test

```bash
cp .env.example .env
# .env faylini to'ldiring (TOKEN va CHAT_ID)

npm run test:telegram   # kanalga test xabar yuboradi
npm run dev             # sayt + API: http://localhost:8080
```

### 5-qadam: Deploy (Vercel)

1. [vercel.com](https://vercel.com) — loyihani import qiling
2. **Settings → Environment Variables:**
   - `TELEGRAM_BOT_TOKEN` = bot token
   - `TELEGRAM_CHAT_ID` = `-1001234567890` yoki `@kanal_username`
3. **Deploy** bosing

Bir nechta joyga yuborish (kanal + guruh):
```
TELEGRAM_CHAT_ID=-1001234567890,@zilolsuv_arizalar
```

> Token **hech qachon** sayt kodida ko'rinmaydi — faqat serverda (`api/lead.js`).

## Telegram Bot + Web App (Mini App) — Telegram Ads uchun

Foydalanuvchi botda `/start` bosadi → **2 ta inline tugma** (B2C / B2B) → sayt **Telegram ichida** ochiladi → buyurtma beradi → ariza kanalingizga keladi.

### Bot oqimi

```
Foydalanuvchi → /start
       ↓
🏠 Uy uchun (B2C)  |  🏢 Biznes (B2B)   ← inline Web App tugmalari
       ↓                    ↓
  index.html           b2b.html         ← Telegram Mini App ichida
       ↓
  Forma to'ldiradi → /api/lead → Kanal/guruhga xabar
```

### Sozlash (bir marta)

**1. @BotFather**
- `/newbot` → token oling
- **Bot Settings → Domain** → `zilolsuv.uz` (yoki Vercel domeningiz)
- **Bot Settings → Menu Button → Web App** → `https://zilolsuv.uz/index.html`

**2. `.env` fayl**
```bash
cp .env.example .env
```
```env
TELEGRAM_BOT_TOKEN=...
BOT_USERNAME=zilolsuv_bot
WEBAPP_URL=https://zilolsuv.uz
TELEGRAM_CHAT_ID=-100...
```

**3. Deploy (Vercel)** — env o'zgaruvchilarni Vercel dashboardga ham qo'shing

**4. Webhook ulash**
```bash
npm run set-webhook
```

**5. Test** — botda `/start` bosing

### Telegram Ads deep link

Reklama uchun to'g'ridan-to'g'ri B2C yoki B2B ochish:
```
https://t.me/zilolsuv_bot?start=b2c
https://t.me/zilolsuv_bot?start=b2b
```

### Fayllar

| Fayl | Vazifa |
|------|--------|
| `api/telegram-webhook.js` | `/start`, inline tugmalar |
| `lib/telegram-api.js` | Bot API yordamchi |
| `assets/js/tg-webapp.js` | Mini App ichida UI moslash |
| `scripts/set-webhook.js` | Webhook o'rnatish |

## Lokal ko'rish

Saytni ko'rish:

```bash
# API bilan (forma → Telegram):
cp .env.example .env   # token va chat_id ni yozing
npm run dev            # http://localhost:8080

# Faqat statik ko'rish (forma WhatsApp fallback):
python3 -m http.server 8080
```

## Deploy — Netlify

1. Loyihani Netlify ga ulang.
2. `api/lead.js` ni `netlify/functions/lead.js` ga ko'chiring (yoki `netlify.toml` da funksiyalar papkasini `api` deb belgilang va redirect qo'shing):

```toml
# netlify.toml
[build]
  functions = "api"

[[redirects]]
  from = "/api/lead"
  to = "/.netlify/functions/lead"
  status = 200
```

3. **Site settings → Environment variables** ga `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` qo'shing.

## Sozlanadigan joylar

| Nima | Qayerda |
|------|---------|
| Telefon raqami | `index.html`, `b2b.html` (`+998934564000`), `assets/js/main.js` (`WHATSAPP_NUMBER`) |
| Telegram havolasi | `t.me/zilolsuv_uz` — o'z bot/kanal username'ingizga almashtiring |
| Instagram havolasi | `instagram.com/zilolsuv_uz` |
| Narx (3 500 000 so'm) | `index.html` (hero chip, narx kartochka, sticky CTA) |
| Mahsulot rasmlari | `assets/img/` |
| Forma endpoint | `assets/js/main.js` → `LEAD_ENDPOINT` |
| Domen (`zilolsuv.uz`) | `index.html` va `b2b.html` (canonical, og:url, JSON-LD), `sitemap.xml`, `robots.txt` — haqiqiy domeningizga almashtiring |

## Optimizatsiya (kiritilgan)

- **Tezlik:** rasmlar WebP formatga o'tkazilgan (~50% kichik), `<picture>` orqali PNG zaxira bilan beriladi; hero rasmi `preload` qilingan.
- **SEO:** `favicon.svg`, canonical/OG/Twitter meta teglar, JSON-LD (Product + LocalBusiness / Service), `sitemap.xml`, `robots.txt`.
- **Conversion:** statistika paneli, mijoz sharhlari, kafolat bloklari, ishonch belgilari, kuchaytirilgan CTA.
- **Mobil:** anchor scroll offset, kengaytirilgan tap-targetlar, kichik ekran uchun moslashtirilgan bo'sh joylar.

> Domenni almashtirgach, Google Search Console'ga `sitemap.xml` ni qo'shing.

## Forma ishlash mantiqi

1. Foydalanuvchi formani to'ldiradi → `main.js` validatsiya qiladi (telefon +998 mask).
2. `POST /api/lead` ga JSON yuboriladi → `api/lead.js` Telegram botga xabar jo'natadi.
3. Muvaffaqiyatli bo'lsa — "Rahmat" ekrani ko'rsatiladi.
4. Agar backend ulanmagan bo'lsa (masalan, oddiy hostingda) — avtomatik **WhatsApp** orqali yuborishga o'tadi (fallback), shunda forma hamisha ishlaydi.

## Eslatma (tezlik / SEO)

- Mahsulot rasmlarini `.webp` formatga o'tkazsangiz, sayt yanada tez yuklanadi.
- `index.html` va `b2b.html` da `<meta>` teglar to'ldirilgan (OG/SEO uchun).
