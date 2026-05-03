"use strict";
(() => {
  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/utils/client_auth.ts
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/mzdodrde";
  var SESSION_KEY = "portfolio_client_access";
  var SESSION_TTL_MS = 5 * 60 * 1e3;
  var MAX_ATTEMPTS = 3;
  var LOCKOUT_MS = 3e4;
  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
  function b64ToBytes(b64) {
    const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  }
  function isSafeUrl(url) {
    return /^(https?:\/\/|\/)/.test(url);
  }
  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function makeToken(hash) {
    return btoa(`${hash}.${Date.now() + SESSION_TTL_MS}`);
  }
  function writeSession(hash) {
    sessionStorage.setItem(SESSION_KEY, makeToken(hash));
  }
  var RateLimiter = class {
    constructor() {
      this.attempts = 0;
      this.lockedUntil = 0;
    }
    lockedMessage() {
      if (Date.now() < this.lockedUntil) {
        const secs = Math.ceil((this.lockedUntil - Date.now()) / 1e3);
        return `Too many attempts. Try again in ${secs}s.`;
      }
      return null;
    }
    recordFailure() {
      this.attempts++;
      if (this.attempts >= MAX_ATTEMPTS) {
        this.lockedUntil = Date.now() + LOCKOUT_MS;
        this.attempts = 0;
        return `Too many attempts. Locked for ${LOCKOUT_MS / 1e3}s.`;
      }
      const left = MAX_ATTEMPTS - this.attempts;
      return `Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`;
    }
    reset() {
      this.attempts = 0;
      this.lockedUntil = 0;
    }
  };
  async function sendAccessRequest(email) {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject: "Portfolio Access Request", message: `Access request from ${email}` })
    });
    if (!res.ok) throw new Error("Send failed");
  }

  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/utils/analytics.ts
  function track(payload) {
    window.dataLayer?.push(payload);
  }

  // <stdin>
  async function deriveKey(password, salt, iterations) {
    const raw = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      raw,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }
  async function decrypt(payload, password) {
    const key = await deriveKey(password, b64ToBytes(payload.salt), payload.iterations);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(payload.iv) }, key, b64ToBytes(payload.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  var deviconMap = JSON.parse(
    document.getElementById("devicon-map")?.textContent ?? "{}"
  );
  function techIcon(name) {
    const icon = deviconMap[name];
    if (!icon) return "";
    if (icon.startsWith("/")) return `<img src="${esc(icon)}" alt="${esc(name)}" aria-hidden="true" class="tech-icon-svg colored"/>`;
    const hasVariant = icon.includes("-");
    return `<i class="devicon-${esc(icon)}${hasVariant ? "" : "-plain"} tech-icon-svg colored" aria-hidden="true"></i>`;
  }
  var META_FIELDS = [
    { key: "date", label: "\u{1F4C5} Date" },
    { key: "team_size", label: "\u{1F465} Team Size" },
    { key: "country", label: "\u{1F30E} Country" },
    { key: "language", label: "\u{1F5E3} Language" },
    { key: "note", label: "", note: true }
  ];
  function renderMeta(p) {
    const items = META_FIELDS.filter((f) => p[f.key]).map(
      (f) => f.note ? `<div class="meta-item meta-note"><span class="meta-value">${esc(String(p[f.key]))}</span></div>` : `<div class="meta-item"><span class="meta-label">${f.label}</span><span class="meta-value">${esc(String(p[f.key]))}</span></div>`
    );
    return items.length ? `<div class="project-meta">${items.join("")}</div>` : "";
  }
  var QR_BASE = "https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=";
  var STORE_DEFS = [
    { key: "google_play", label: "Google Play", css: "store-badge-android" },
    { key: "app_store", label: "App Store", css: "store-badge-ios" },
    { key: "google_play_2", label: "Google Play (Pymes)", css: "store-badge-android" },
    { key: "app_store_2", label: "App Store (Pymes)", css: "store-badge-ios" },
    { key: "web", label: "Web App", css: "" }
  ];
  function renderStoreLinks(links) {
    const items = STORE_DEFS.filter((s) => links[s.key]).map((s) => {
      const url = links[s.key];
      const qr = s.key !== "web" ? `<img src="${QR_BASE}${encodeURIComponent(url)}" class="store-qr" alt="QR ${s.label}" loading="lazy"/>` : "";
      return `<div class="store-item"><a href="${esc(url)}" class="store-badge ${s.css}".trimEnd() target="_blank" rel="noopener noreferrer">${s.label}</a>${qr}</div>`;
    });
    return items.length ? `<div class="store-links">${items.join("")}</div>` : "";
  }
  function renderPreview(p) {
    const src = p.preview && isSafeUrl(p.preview) ? p.preview : null;
    return src ? `<img loading="lazy" src="${esc(src)}" alt="Preview of ${esc(p.name)}" class="project-preview-img">` : `<div class="project-preview-placeholder"><span class="placeholder-icon">\u{1F4C1}</span></div>`;
  }
  function renderCard(p) {
    const id = `client-modal-${esc(p.name).replace(/[^a-zA-Z0-9]/g, "-")}`;
    const preview = renderPreview(p);
    const badge = p._complexity ? `<span class="complexity-badge complexity-${esc(p._complexity.toLowerCase())}">${esc(p._complexity)}</span>` : "";
    const featured = p._featured ? `<div class="project-spotlight">\u2B50 Featured</div>` : "";
    const safeLink = p.link && isSafeUrl(p.link) ? p.link : null;
    const actions = safeLink ? `<div class="modal-actions"><a href="${esc(safeLink)}" class="button" target="_blank" rel="noopener noreferrer">View Project</a></div>` : "";
    const status = p._status ? `<div class="modal-actions"><span class="project-status-badge">${esc(p._status)}</span></div>` : "";
    return `
    <div class="project-card${p._featured ? " featured-project" : ""}" data-modal-target="#${id}">
      <div class="card-header">
        <div class="project-type-header">
          <span class="project-type-text">${esc(p.type)}</span>
        </div>
      </div>
      <div class="project-preview">${featured}${badge}${preview}</div>
      <div class="card-body">
        <h3 class="card-title">${esc(p.name)}</h3>
        <p class="card-description">${esc(p.description)}</p>
      </div>
      <div class="card-footer"><span class="project-btn">View Details</span></div>
    </div>

    <div class="modal" id="${id}">
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>${esc(p.name)}</h2>
        <div class="modal-preview">${preview}</div>
        <p>${esc(p.long_description)}</p>
        ${renderMeta(p)}
        <div class="subsection"><span>\u{1F6E0} Technologies</span><ul class="technologies">${p.technologies.map((t) => `<li>${techIcon(t)}${esc(t)}</li>`).join("")}</ul></div>
        ${p.store_links ? renderStoreLinks(p.store_links) : ""}
        ${actions}${status}
      </div>
    </div>
  `;
  }
  function wireModals(container) {
    container.querySelectorAll(".project-card[data-modal-target]").forEach((card) => {
      card.addEventListener("click", () => {
        const modal = document.getElementById(card.dataset.modalTarget.replace("#", ""));
        if (!modal) return;
        modal.style.display = "block";
        requestAnimationFrame(() => {
          modal.style.opacity = "1";
        });
        track({ event: "client_project_opened", project_name: modal.querySelector("h2")?.textContent ?? "" });
      });
    });
    container.querySelectorAll(".close-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      });
    });
    container.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") container.querySelectorAll(".modal").forEach((m) => m.style.display = "none");
    });
  }
  async function unlockAndRender(password) {
    const payloadEl = document.getElementById("client-payload");
    if (!payloadEl) return false;
    try {
      const payload = JSON.parse(payloadEl.textContent ?? "");
      const projects = await decrypt(payload, password);
      writeSession(await sha256(password));
      document.getElementById("client-gate").hidden = true;
      document.getElementById("client-projects-content").hidden = false;
      const grid = document.getElementById("client-projects-grid");
      grid.innerHTML = projects.map(renderCard).join("");
      wireModals(grid);
      track({ event: "client_portfolio_unlocked", project_count: String(projects.length) });
      return true;
    } catch {
      return false;
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const limiter = new RateLimiter();
    const pwForm = document.getElementById("client-password-form");
    const pwHint = document.getElementById("client-pw-hint");
    pwForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const locked = limiter.lockedMessage();
      if (locked) {
        pwHint.textContent = locked;
        return;
      }
      const btn = pwForm.querySelector('button[type="submit"]');
      const pw = document.getElementById("client-password")?.value ?? "";
      btn.disabled = true;
      btn.textContent = "Unlocking\u2026";
      if (await unlockAndRender(pw)) return;
      pwHint.textContent = limiter.recordFailure();
      btn.disabled = false;
      btn.textContent = "Unlock";
      track({ event: "client_portfolio_unlock_failed" });
    });
    const reqForm = document.getElementById("client-request-form");
    const reqHint = document.getElementById("client-request-hint");
    const reqBtn = document.getElementById("client-request-btn");
    reqForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("client-email")?.value?.trim() ?? "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        reqHint.textContent = "Enter a valid email.";
        reqHint.className = "gate-hint gate-hint-error";
        return;
      }
      reqBtn.disabled = true;
      reqBtn.textContent = "Sending\u2026";
      try {
        await sendAccessRequest(email);
        reqHint.textContent = "\u2713 Request sent! You'll receive the password by email.";
        reqHint.className = "gate-hint gate-hint-success";
        reqBtn.textContent = "Sent";
        track({ event: "client_portfolio_access_requested", email });
      } catch {
        reqHint.textContent = "Could not send. Email hello@tech-andgar.me directly.";
        reqHint.className = "gate-hint gate-hint-error";
        reqBtn.disabled = false;
        reqBtn.textContent = "Request Access";
      }
    });
  });
})();
