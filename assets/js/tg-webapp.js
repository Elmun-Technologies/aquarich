/* Telegram Mini App (Web App) — bot ichida ochilganda */
(function () {
  "use strict";

  var tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;

  document.documentElement.classList.add("tg-webapp");
  tg.ready();
  tg.expand();

  /* Telegram WebView balandligi — CSS da ishlatiladi */
  function applyViewport() {
    var h = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
    document.documentElement.style.setProperty("--tg-viewport-stable-height", h + "px");
  }
  applyViewport();
  if (typeof tg.onEvent === "function") {
    tg.onEvent("viewportChanged", applyViewport);
  }
  window.addEventListener("resize", applyViewport, { passive: true });

  // Telegram Ads / bot ichida yopishni tasdiqlash
  if (typeof tg.enableClosingConfirmation === "function") {
    tg.enableClosingConfirmation();
  }

  if (typeof tg.setHeaderColor === "function") {
    tg.setHeaderColor("#0E86C9");
  }
  if (typeof tg.setBackgroundColor === "function") {
    tg.setBackgroundColor("#ffffff");
  }

  window.__tgWebApp = tg;

  var leadForm = document.getElementById("lead-form");

  /* Scroll paytida MainButton — TG WebView da barqarorroq */
  if (leadForm && typeof tg.MainButton !== "undefined") {
    var mainBtn = tg.MainButton;
    mainBtn.setText("Buyurtma yuborish");
    mainBtn.color = "#0E86C9";
    mainBtn.textColor = "#ffffff";

    function updateMainButton() {
      if (!leadForm) return;
      var rect = leadForm.getBoundingClientRect();
      var vh = tg.viewportStableHeight || window.innerHeight;
      var visible = rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
      if (visible) {
        mainBtn.show();
      } else {
        mainBtn.hide();
      }
    }

    mainBtn.onClick(function () {
      var form = leadForm.querySelector(".lead__form");
      if (form) form.requestSubmit();
    });

    window.addEventListener("scroll", updateMainButton, { passive: true });
    if (typeof tg.onEvent === "function") {
      tg.onEvent("viewportChanged", updateMainButton);
    }
    setTimeout(updateMainButton, 400);
  }

  /* Muvaffaqiyat — botga signal + yopish tugmasi */
  window.__tgOnLeadSuccess = function () {
    if (typeof tg.HapticFeedback !== "undefined") {
      tg.HapticFeedback.notificationOccurred("success");
    }
    if (typeof tg.MainButton !== "undefined") {
      tg.MainButton.setText("Yopish");
      tg.MainButton.show();
      tg.MainButton.onClick(function () { tg.close(); });
    }
  };
})();
