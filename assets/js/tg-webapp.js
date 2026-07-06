/* Telegram Mini App (Web App) — bot ichida ochilganda */
(function () {
  "use strict";

  var tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;

  document.documentElement.classList.add("tg-webapp");
  tg.ready();
  tg.expand();

  // Telegram Ads / bot ichida yopishni tasdiqlash
  if (typeof tg.enableClosingConfirmation === "function") {
    tg.enableClosingConfirmation();
  }

  // Header rangi
  if (typeof tg.setHeaderColor === "function") {
    tg.setHeaderColor("#0a6bdc");
  }
  if (typeof tg.setBackgroundColor === "function") {
    tg.setBackgroundColor("#ffffff");
  }

  window.__tgWebApp = tg;

  /* Asosiy tugma — forma yaqinida "Yuborish" */
  var leadForm = document.getElementById("lead-form");
  if (leadForm && typeof tg.MainButton !== "undefined") {
    var mainBtn = tg.MainButton;
    mainBtn.setText("Buyurtma yuborish");
    mainBtn.color = "#0a6bdc";
    mainBtn.textColor = "#ffffff";

    function updateMainButton() {
      if (!leadForm) return;
      var rect = leadForm.getBoundingClientRect();
      var visible = rect.top < window.innerHeight && rect.bottom > 0;
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
