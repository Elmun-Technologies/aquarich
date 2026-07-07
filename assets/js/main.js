/* ============================================================
   Zilol Suv — landing interaktivligi
   ============================================================ */
(function () {
  "use strict";

  /* ---- Konfiguratsiya ---- */
  // Forma yuboriladigan endpoint (serverless funksiya).
  // Agar backend hali ulanmagan bo'lsa, WhatsApp/Telegram fallback ishlaydi.
  var LEAD_ENDPOINT = "/api/lead";
  var WHATSAPP_NUMBER = "998934564000"; // fallback uchun

  /* ---- Burger / mobil menyu ---- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function closeNav() {
    if (!burger || !mobileNav) return;
    burger.classList.remove("is-open");
    mobileNav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  /* ---- Silliq scroll (sticky header hisobga olinadi) ---- */
  function smoothScrollTo(hash) {
    var el = document.querySelector(hash);
    if (!el) return false;
    var y = el.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top: y, behavior: "smooth" });
    return true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var hash = a.getAttribute("href");
      if (hash.length > 1 && document.querySelector(hash)) {
        e.preventDefault();
        closeNav();
        smoothScrollTo(hash);
        history.replaceState(null, "", hash);
      }
    });
  });

  /* ---- FAQ akkordeon ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
    });
  });

  /* ---- Reveal animatsiya (scroll bilan) — failsafe ---- */
  var reveals = document.querySelectorAll(".reveal");
  function revealEl(el) { el.classList.add("is-in"); }
  function revealAll() { reveals.forEach(revealEl); }

  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealEl(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach(function (el) {
        // Yuklanishda ekranda ko'rinib turган elementlar darhol chiqsin
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          revealEl(el);
        } else {
          io.observe(el);
        }
      });
      // Kafolat: har qanday holatda ham hech narsa yashirin qolib ketmasin
      window.addEventListener("load", function () { setTimeout(revealAll, 1000); });
      setTimeout(revealAll, 2600);
    } else {
      revealAll();
    }
  }

  /* ---- Telefon mask (+998 XX XXX XX XX) ---- */
  function formatUzPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.indexOf("998") === 0) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    var out = "+998";
    if (digits.length > 0) out += " " + digits.slice(0, 2);
    if (digits.length > 2) out += " " + digits.slice(2, 5);
    if (digits.length > 5) out += " " + digits.slice(5, 7);
    if (digits.length > 7) out += " " + digits.slice(7, 9);
    return out;
  }
  function phoneDigits(value) {
    var d = value.replace(/\D/g, "");
    if (d.indexOf("998") === 0) d = d.slice(3);
    return d;
  }
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener("focus", function () {
      if (!input.value) input.value = "+998 ";
    });
    input.addEventListener("input", function () {
      input.value = formatUzPhone(input.value);
    });
    input.addEventListener("blur", function () {
      if (input.value.trim() === "+998" || input.value.trim() === "") input.value = "";
    });
  });

  /* ---- Forma validatsiya yordamchilari ---- */
  function setError(field, hasError) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("has-error", hasError);
    field.classList.toggle("is-error", hasError);
  }
  function validateField(field) {
    var val = (field.value || "").trim();
    if (field.type === "tel") {
      var ok = phoneDigits(val).length === 9;
      setError(field, !ok);
      return ok;
    }
    var ok2 = val.length > 0;
    setError(field, !ok2);
    return ok2;
  }

  /* ---- Forma yuborish ---- */
  function handleForm(form, statusEl) {
    if (!form) return;

    // required maydonlar: name, phone, va select bo'lsa "company"/"segment"
    var required = [];
    form.querySelectorAll("input, select").forEach(function (el) {
      if (el.type === "hidden") return;
      if (el.closest(".hp-field")) return; // honeypot — validatsiyadan tashqari
      var name = el.getAttribute("name");
      if (name === "region" || name === "volume" || name === "website") return;
      required.push(el);
    });

    required.forEach(function (el) {
      el.addEventListener("blur", function () { validateField(el); });
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("has-error")) validateField(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      required.forEach(function (el) {
        if (!validateField(el)) valid = false;
      });
      if (!valid) {
        var firstBad = required.find(function (el) {
          return el.closest(".field") && el.closest(".field").classList.contains("has-error");
        });
        if (firstBad) firstBad.focus();
        if (statusEl) {
          statusEl.textContent = "Iltimos, ism va telefonni to'g'ri kiriting.";
          statusEl.className = "form-status bad";
        }
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.page = location.pathname || "/";
      // tgWebAppData hash kanalga ketmasin
      data.url = location.origin + (location.pathname || "/") + (location.search || "");

      if (window.__tgWebApp && window.__tgWebApp.initDataUnsafe && window.__tgWebApp.initDataUnsafe.user) {
        var u = window.__tgWebApp.initDataUnsafe.user;
        data.tg_id = String(u.id || "");
        data.tg_user = u.username ? "@" + u.username : (u.first_name || "");
      }

      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Yuborilmoqda..."; }
      if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

      fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("bad response");
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          showSuccess(form);
        })
        .catch(function () {
          // Backend ulanmagan bo'lsa — WhatsApp orqali fallback
          fallbackToWhatsApp(data, statusEl);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  }

  function showSuccess(form) {
    var lead = form.closest(".lead");
    if (lead) {
      lead.classList.add("lead--success");
      document.body.classList.add("lead-submitted");
      var successEl = lead.querySelector(".lead__success");
      if (window.__tgWebApp && successEl) {
        setTimeout(function () {
          successEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else if (!lead.closest(".seg-modal")) {
        lead.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    if (typeof window.__tgOnLeadSuccess === "function") {
      window.__tgOnLeadSuccess();
    }
  }

  function fallbackToWhatsApp(data, statusEl) {
    var lines = [];
    lines.push("Assalomu alaykum! Suv filtri bo'yicha ariza:");
    if (data.form_type) lines.push("Turi: " + data.form_type);
    if (data.company) lines.push("Kompaniya: " + data.company);
    if (data.name) lines.push("Ism: " + data.name);
    if (data.phone) lines.push("Telefon: " + data.phone);
    if (data.region) lines.push("Viloyat: " + data.region);
    if (data.segment) lines.push("Soha: " + data.segment);
    if (data.volume) lines.push("Hajm: " + data.volume);
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    if (statusEl) {
      statusEl.textContent = "Sizni WhatsApp'ga yo'naltiramiz...";
      statusEl.className = "form-status ok";
    }
    window.open(url, "_blank");
  }

  handleForm(document.getElementById("leadFormB2c"), document.getElementById("statusB2c"));
  handleForm(document.getElementById("leadFormB2b"), document.getElementById("statusB2b"));
  handleForm(document.getElementById("leadFormB2bModal"), document.getElementById("statusB2bModal"));

  /* ---- Lightbox galereya ---- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = document.getElementById("lightboxImg");
    var lbCaption = document.getElementById("lightboxCaption");
    function openLightbox(src, alt, caption) {
      lbImg.src = src;
      lbImg.alt = alt || "";
      lbCaption.textContent = caption || alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      lbImg.src = "";
    }
    document.querySelectorAll(".photo-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var img = card.querySelector("img");
        if (!img) return;
        openLightbox(img.src, img.alt, card.getAttribute("data-caption"));
      });
    });
    lightbox.querySelectorAll("[data-close-lightbox]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---- Mijoz fotolari — bosganda otziv (mobil) ---- */
  document.querySelectorAll(".client-photo").forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasActive = card.classList.contains("is-active");
      document.querySelectorAll(".client-photo.is-active").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-expanded", "false");
      });
      if (!wasActive) {
        card.classList.add("is-active");
        card.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".client-photo.is-active").forEach(function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-expanded", "false");
    });
  });

  /* ---- Reveal stagger (galereya) ---- */
  document.querySelectorAll(".photo-gallery .reveal, .kit-list li.reveal, .adv-card.reveal").forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.08 + "s";
  });

  /* ---- B2B segment modal ---- */
  var segModal = document.getElementById("segModal");
  if (segModal) {
    var modalEmoji = document.getElementById("segModalEmoji");
    var modalTitle = document.getElementById("segModalTitle");
    var modalSummary = document.getElementById("segModalSummary");
    var modalSegment = document.getElementById("segModalSegment");
    var modalLead = document.getElementById("segModalLead");
    var modalForm = document.getElementById("leadFormB2bModal");

    function openSegModal(card) {
      if (!card) return;
      modalEmoji.textContent = card.getAttribute("data-emoji") || "🏢";
      modalTitle.textContent = card.getAttribute("data-title") || "Biznes uchun";
      modalSummary.textContent = card.getAttribute("data-summary") || "";
      modalSegment.value = card.getAttribute("data-segment") || "";

      if (modalLead) modalLead.classList.remove("lead--success");
      if (modalForm) modalForm.reset();
      var statusEl = document.getElementById("statusB2bModal");
      if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

      segModal.classList.add("is-open");
      segModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }

    function closeSegModal() {
      segModal.classList.remove("is-open");
      segModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

    document.querySelectorAll(".seg-card--clickable").forEach(function (card) {
      card.addEventListener("click", function () { openSegModal(card); });
    });

    segModal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeSegModal);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && segModal.classList.contains("is-open")) closeSegModal();
    });
  }

  /* ---- Sticky CTA — mobil pastki panel ---- */
  var stickyCta = document.getElementById("stickyCta");
  if (stickyCta && window.matchMedia("(max-width: 899px)").matches) {
    var leadForm = document.getElementById("lead-form");
    var bottomCta = document.getElementById("bottom-cta");

    function updateSticky() {
      var nearForm = false;
      var scrolledEnough = window.scrollY > 80;
      if (leadForm) {
        var rect = leadForm.getBoundingClientRect();
        nearForm = rect.top < window.innerHeight * 0.85;
      }
      if (bottomCta) {
        var bottomRect = bottomCta.getBoundingClientRect();
        if (bottomRect.top < window.innerHeight * 0.92) nearForm = true;
      }
      if (nearForm || !scrolledEnough) {
        stickyCta.classList.add("is-hidden");
        stickyCta.classList.remove("is-visible");
        stickyCta.setAttribute("aria-hidden", "true");
        document.body.classList.add("body--no-sticky");
      } else {
        stickyCta.classList.add("is-visible");
        stickyCta.classList.remove("is-hidden");
        stickyCta.setAttribute("aria-hidden", "false");
        document.body.classList.remove("body--no-sticky");
      }
    }

    setTimeout(updateSticky, 500);
    window.addEventListener("scroll", updateSticky, { passive: true });
    window.addEventListener("resize", updateSticky, { passive: true });
  }

})();
