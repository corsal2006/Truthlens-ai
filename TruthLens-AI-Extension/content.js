(function truthLensBootstrap() {
  if (window.__truthLensMounted) {
    return;
  }
  window.__truthLensMounted = true;

  const DEFAULT_API_BASE = "https://truthlens-backendd.onrender.com";
  const PANEL_WIDTH = 420;

  const state = {
    isOpen: false,
    activeScreen: "home",
    waitingForSelection: false,
    snippingActive: false,
    analyzing: false,
    selectedText: "",
    verifyResult: null,
    deepfakePreviewUrl: "",
    deepfakeBlob: null,
    deepfakeKind: "image",
    deepfakeResult: null,
    apiBase: DEFAULT_API_BASE,
    userId: "demo-user",
    selectionRect: null,
    selectionDraft: null,
    pointerStart: null,
    recorder: null,
    recordChunks: [],
    captureStream: null,
    recordCanvas: null,
    recordVideo: null,
    recordFrameLoop: null,
    lastToast: ""
  };

  const host = document.createElement("div");
  host.id = "truthlens-ai-host";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host, * {
        box-sizing: border-box;
      }

      .tl-root {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483646;
        font-family: Inter, "Segoe UI", sans-serif;
        color: #f5f7ff;
      }

      .tl-panel {
        position: fixed;
        top: 18px;
        right: 18px;
        width: min(${PANEL_WIDTH}px, calc(100vw - 24px));
        height: calc(100vh - 36px);
        border-radius: 28px;
        overflow: hidden;
        background:
          radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 35%),
          radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.2), transparent 42%),
          linear-gradient(180deg, rgba(12, 16, 28, 0.96), rgba(6, 10, 20, 0.98));
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow:
          0 28px 80px rgba(3, 8, 20, 0.58),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        pointer-events: auto;
        transform: translateX(0);
        transition: transform 220ms ease, opacity 220ms ease;
        backdrop-filter: blur(18px);
      }

      .tl-panel.tl-hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateX(calc(100% + 36px));
      }

      .tl-header {
        padding: 22px 22px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .tl-brand {
        display: flex;
        gap: 14px;
        align-items: center;
      }

      .tl-logo {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: linear-gradient(135deg, #22d3ee, #8b5cf6);
        position: relative;
        box-shadow: 0 10px 26px rgba(35, 211, 238, 0.3);
      }

      .tl-logo::before,
      .tl-logo::after {
        content: "";
        position: absolute;
        inset: 8px;
        border-radius: 10px;
        border: 2px solid rgba(255, 255, 255, 0.9);
      }

      .tl-logo::after {
        inset: 16px 12px 12px 16px;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
        border-radius: 0;
      }

      .tl-brand h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(90deg, #38bdf8, #8b5cf6 76%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .tl-brand p {
        margin: 2px 0 0;
        color: rgba(221, 228, 255, 0.7);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .tl-header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .tl-icon-btn {
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 14px;
        color: #edf2ff;
        background: rgba(255, 255, 255, 0.06);
        cursor: pointer;
        font-size: 18px;
        transition: transform 180ms ease, background 180ms ease;
      }

      .tl-icon-btn:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.12);
      }

      .tl-content {
        flex: 1;
        overflow: auto;
        padding: 18px 18px 28px;
      }

      .tl-section-title {
        margin: 0 0 8px;
        font-size: 30px;
        font-weight: 900;
        letter-spacing: -0.05em;
      }

      .tl-gradient-title {
        background: linear-gradient(90deg, #ffffff, #8b5cf6 90%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .tl-subtitle {
        margin: 0 0 18px;
        color: rgba(218, 224, 255, 0.7);
        font-size: 14px;
        line-height: 1.6;
      }

      .tl-hero {
        padding: 22px;
        border-radius: 24px;
        background: linear-gradient(145deg, rgba(12, 24, 42, 0.88), rgba(8, 10, 18, 0.92));
        border: 1px solid rgba(68, 211, 255, 0.15);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      .tl-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .tl-card {
        border-radius: 24px;
        padding: 18px;
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
      }

      .tl-card h3,
      .tl-card h4 {
        margin: 0 0 8px;
      }

      .tl-card p,
      .tl-card li,
      .tl-empty p {
        margin: 0;
        color: rgba(224, 229, 255, 0.72);
        line-height: 1.55;
      }

      .tl-primary,
      .tl-secondary,
      .tl-danger {
        width: 100%;
        border: none;
        border-radius: 18px;
        padding: 15px 16px;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
      }

      .tl-primary {
        color: #04111d;
        background: linear-gradient(90deg, #3ddcff, #32d74b);
        box-shadow: 0 14px 30px rgba(31, 199, 255, 0.25);
      }

      .tl-secondary {
        color: #eef3ff;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .tl-danger {
        color: #fff1f3;
        background: rgba(255, 89, 120, 0.12);
        border: 1px solid rgba(255, 89, 120, 0.22);
      }

      .tl-primary:hover,
      .tl-secondary:hover,
      .tl-danger:hover {
        transform: translateY(-1px);
      }

      .tl-toolbar {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 18px;
      }

      .tl-steps {
        margin-top: 16px;
        display: grid;
        gap: 12px;
      }

      .tl-step {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding: 15px 16px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .tl-step-badge {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 800;
        color: #031322;
        background: linear-gradient(135deg, #67e8f9, #a78bfa);
        flex-shrink: 0;
      }

      .tl-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(113, 111, 255, 0.14);
        color: #c6c4ff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .tl-input,
      .tl-textarea {
        width: 100%;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.045);
        color: #f8fbff;
        padding: 14px 16px;
        font: inherit;
        outline: none;
      }

      .tl-textarea {
        min-height: 140px;
        resize: vertical;
      }

      .tl-form {
        display: grid;
        gap: 12px;
      }

      .tl-preview {
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(2, 6, 14, 0.66);
      }

      .tl-preview img,
      .tl-preview video {
        display: block;
        width: 100%;
        max-height: 240px;
        object-fit: contain;
        background: #050812;
      }

      .tl-preview-text {
        padding: 16px;
        color: rgba(242, 246, 255, 0.88);
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-wrap;
      }

      .tl-stats {
        display: grid;
        grid-template-columns: 150px 1fr;
        gap: 14px;
        margin-top: 16px;
      }

      .tl-score-card {
        display: grid;
        place-items: center;
        gap: 12px;
      }

      .tl-ring {
        width: 128px;
        height: 128px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 34px;
        font-weight: 900;
        color: #fff;
        position: relative;
        background: conic-gradient(var(--ring-color) calc(var(--score) * 1%), rgba(255, 255, 255, 0.08) 0);
      }

      .tl-ring::before {
        content: "";
        position: absolute;
        inset: 13px;
        border-radius: 50%;
        background: #070b12;
        border: 1px solid rgba(255, 255, 255, 0.04);
      }

      .tl-ring span {
        position: relative;
        z-index: 1;
      }

      .tl-verdict {
        font-size: 24px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tl-report {
        display: grid;
        gap: 12px;
      }

      .tl-report-box {
        padding: 16px 18px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .tl-claim-list {
        display: grid;
        gap: 10px;
      }

      .tl-claim {
        padding: 14px 16px;
        border-radius: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .tl-badge {
        flex-shrink: 0;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .tl-badge.safe {
        color: #d9ffec;
        background: rgba(34, 197, 94, 0.18);
      }

      .tl-badge.warn {
        color: #fff3d0;
        background: rgba(250, 204, 21, 0.18);
      }

      .tl-badge.danger {
        color: #ffd7df;
        background: rgba(255, 95, 133, 0.18);
      }

      .tl-inline-meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .tl-kv {
        padding: 10px 12px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(228, 233, 255, 0.8);
        font-size: 12px;
      }

      .tl-small {
        font-size: 12px;
        color: rgba(210, 219, 255, 0.6);
      }

      .tl-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
      }

      .tl-overlay.active {
        pointer-events: auto;
      }

      .tl-scrim {
        position: absolute;
        inset: 0;
        background: rgba(4, 8, 18, 0.58);
        backdrop-filter: blur(2px);
      }

      .tl-selection {
        position: absolute;
        border: 2px solid #5eead4;
        box-shadow: 0 0 0 9999px rgba(4, 8, 18, 0.52);
        border-radius: 18px;
        background: rgba(94, 234, 212, 0.12);
        display: none;
      }

      .tl-selection.active {
        display: block;
      }

      .tl-overlay-toolbar,
      .tl-record-toolbar {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 12px;
        border-radius: 22px;
        background: rgba(14, 18, 28, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
      }

      .tl-overlay-toolbar {
        top: 22px;
      }

      .tl-record-toolbar {
        bottom: 24px;
      }

      .tl-overlay-btn {
        border: none;
        border-radius: 16px;
        padding: 12px 16px;
        font-weight: 800;
        cursor: pointer;
        color: white;
        background: rgba(255, 255, 255, 0.08);
      }

      .tl-overlay-btn.primary {
        background: linear-gradient(90deg, #22d3ee, #3b82f6);
        color: #031321;
      }

      .tl-overlay-hint {
        position: fixed;
        bottom: 22px;
        left: 22px;
        padding: 14px 16px;
        border-radius: 18px;
        max-width: 320px;
        background: rgba(8, 12, 20, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(240, 245, 255, 0.88);
      }

      .tl-toast {
        position: fixed;
        left: 50%;
        bottom: 22px;
        transform: translateX(-50%) translateY(18px);
        opacity: 0;
        padding: 14px 18px;
        border-radius: 16px;
        background: rgba(9, 14, 24, 0.96);
        color: #eef4ff;
        font-size: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: opacity 220ms ease, transform 220ms ease;
        pointer-events: none;
        box-shadow: 0 14px 38px rgba(0, 0, 0, 0.28);
      }

      .tl-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .tl-empty {
        padding: 22px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.035);
        border: 1px dashed rgba(255, 255, 255, 0.1);
      }

      .tl-loading {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .tl-loading::before {
        content: "";
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.22);
        border-top-color: #67e8f9;
        animation: tl-spin 800ms linear infinite;
      }

      @keyframes tl-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 720px) {
        .tl-panel {
          top: 12px;
          right: 12px;
          left: 12px;
          width: auto;
          height: calc(100vh - 24px);
        }

        .tl-grid,
        .tl-stats,
        .tl-toolbar {
          grid-template-columns: 1fr;
        }
      }
    </style>
    <div class="tl-root">
      <aside class="tl-panel" id="tl-panel"></aside>
      <div class="tl-overlay" id="tl-overlay">
        <div class="tl-scrim"></div>
        <div class="tl-selection" id="tl-selection"></div>
        <div class="tl-overlay-toolbar" id="tl-overlay-toolbar" style="display:none;">
          <button class="tl-overlay-btn" id="tl-cancel-snipping">Cancel</button>
          <button class="tl-overlay-btn primary" id="tl-capture-image">Capture Image</button>
          <button class="tl-overlay-btn" id="tl-capture-video">Capture Video</button>
        </div>
        <div class="tl-record-toolbar" id="tl-record-toolbar" style="display:none;">
          <span class="tl-pill">Recording Selected Region</span>
          <button class="tl-overlay-btn" id="tl-stop-recording">Stop Recording</button>
        </div>
        <div class="tl-overlay-hint" id="tl-overlay-hint">
          Drag to select the suspicious region, then choose <strong>Capture Image</strong> or <strong>Capture Video</strong>.
        </div>
      </div>
      <div class="tl-toast" id="tl-toast"></div>
    </div>
  `;

  const refs = {
    panel: shadow.getElementById("tl-panel"),
    overlay: shadow.getElementById("tl-overlay"),
    selection: shadow.getElementById("tl-selection"),
    overlayToolbar: shadow.getElementById("tl-overlay-toolbar"),
    recordToolbar: shadow.getElementById("tl-record-toolbar"),
    overlayHint: shadow.getElementById("tl-overlay-hint"),
    toast: shadow.getElementById("tl-toast")
  };

  init();

  async function init() {
    await loadSettings();
    render();
    bindOverlayEvents();
    bindSelectionWatchers();
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "TRUTHLENS_TOGGLE_PANEL") {
        state.isOpen = !state.isOpen;
        render();
        sendResponse({ ok: true });
      }
      return false;
    });
  }

  function bindSelectionWatchers() {
    document.addEventListener("mouseup", handlePotentialSelection, true);
    document.addEventListener("keyup", handlePotentialSelection, true);
  }

  function bindOverlayEvents() {
    refs.overlay.addEventListener("pointerdown", onOverlayPointerDown);
    refs.overlay.addEventListener("pointermove", onOverlayPointerMove);
    refs.overlay.addEventListener("pointerup", onOverlayPointerUp);
    refs.overlay.addEventListener("pointercancel", onOverlayPointerUp);
  }

  function render() {
    refs.panel.className = `tl-panel${state.isOpen ? "" : " tl-hidden"}`;
    refs.panel.innerHTML = getPanelMarkup();
    bindPanelEvents();
    renderOverlayState();
  }

  function getPanelMarkup() {
    const screen = state.activeScreen;
    return `
      <div class="tl-header">
        <div class="tl-brand">
          <div class="tl-logo"></div>
          <div>
            <h1>TruthLens AI</h1>
            <p>Your Explainable Trust Layer</p>
          </div>
        </div>
        <div class="tl-header-actions">
          <button class="tl-icon-btn" id="tl-settings" title="Settings">⚙</button>
          <button class="tl-icon-btn" id="tl-close" title="Close">✕</button>
        </div>
      </div>
      <div class="tl-content">
        ${screen === "home" ? getHomeMarkup() : ""}
        ${screen === "verify" ? getVerifyMarkup() : ""}
        ${screen === "deepfake" ? getDeepfakeMarkup() : ""}
        ${screen === "settings" ? getSettingsMarkup() : ""}
      </div>
    `;
  }

  function getHomeMarkup() {
    return `
      <section class="tl-hero">
        <span class="tl-pill">Premium Browser Intelligence</span>
        <h2 class="tl-section-title"><span class="tl-gradient-title">TruthLens</span> extension</h2>
        <p class="tl-subtitle">
          Launch fast fact-checking or a Windows-snipping-style deepfake scan directly on any webpage. The panel hides while you collect evidence, then reappears with preview, explainable analysis, and confidence signals.
        </p>
        <div class="tl-toolbar">
          <button class="tl-primary" id="tl-start-verify">Verify News</button>
          <button class="tl-secondary" id="tl-start-deepfake">Detect Deepfake</button>
        </div>
      </section>
      <section class="tl-grid" style="margin-top:16px;">
        <article class="tl-card">
          <h3>How Verify News Works</h3>
          <div class="tl-steps">
            ${stepMarkup([
              "Click Verify News inside TruthLens AI.",
              "The extension hides so the page stays clean.",
              "Highlight the suspicious text on the webpage.",
              "TruthLens returns, previews the text, then sends it to your `/verify` API.",
              "You see verdict, confidence, claim breakdown, and explainable reasoning."
            ])}
          </div>
        </article>
        <article class="tl-card">
          <h3>How Detect Deepfake Works</h3>
          <div class="tl-steps">
            ${stepMarkup([
              "Click Detect Deepfake to open a full-screen snipping overlay.",
              "Drag any region like Windows Snipping Tool.",
              "Choose Capture Image for a screenshot or Capture Video to record that selected region.",
              "TruthLens reopens with media preview and sends the file to `/deepfake`.",
              "The result includes a risk score, artifact analysis, and explainable AI report."
            ])}
          </div>
        </article>
      </section>
      <section class="tl-grid" style="margin-top:16px;">
        <article class="tl-card">
          <h4>Explainable AI</h4>
          <p>Every scan maps model output into a readable trust score, concise reasoning, red flags, and evidence blocks instead of a black-box yes/no.</p>
        </article>
        <article class="tl-card">
          <h4>Backend Ready</h4>
          <p>The extension posts FormData directly to your Express routes and keeps a fallback demo analyzer available while you finish your model outputs.</p>
        </article>
      </section>
    `;
  }

  function getVerifyMarkup() {
    const hasResult = Boolean(state.verifyResult);
    return `
      <section>
        <span class="tl-pill">Verify News</span>
        <h2 class="tl-section-title">Neural claim validation</h2>
        <p class="tl-subtitle">
          Highlight text on the page, or paste additional context below. TruthLens sends the claim to <code>${escapeHtml(state.apiBase)}/verify</code>.
        </p>
      </section>
      <section class="tl-form">
        <div class="tl-preview">
          <div class="tl-preview-text">${state.selectedText ? escapeHtml(state.selectedText) : "No highlighted text yet. Click “Wait For Highlight” and select a claim on the page."}</div>
        </div>
        <textarea class="tl-textarea" id="tl-verify-input" placeholder="Paste claim, article excerpt, or URL context here...">${escapeHtml(state.selectedText)}</textarea>
        <div class="tl-toolbar">
          <button class="tl-secondary" id="tl-wait-selection">Wait For Highlight</button>
          <button class="tl-primary" id="tl-run-verify" ${state.analyzing ? "disabled" : ""}>${state.analyzing ? "Analyzing..." : "Analyze Claim"}</button>
        </div>
      </section>
      ${hasResult ? getVerifyResultMarkup(state.verifyResult) : `
        <section class="tl-empty" style="margin-top:16px;">
          <p>Run a scan to see the trust score, diagnostic reasoning, claim-by-claim breakdown, and evidence summary here.</p>
        </section>
      `}
    `;
  }

  function getDeepfakeMarkup() {
    const hasPreview = Boolean(state.deepfakePreviewUrl);
    return `
      <section>
        <span class="tl-pill">Detect Deepfake</span>
        <h2 class="tl-section-title">Snip. preview. inspect.</h2>
        <p class="tl-subtitle">
          Pick a suspicious face, video frame, or on-screen media region. TruthLens will reopen with a preview and submit the captured file to <code>${escapeHtml(state.apiBase)}/deepfake</code>.
        </p>
      </section>
      <section class="tl-form">
        ${hasPreview ? `
          <div class="tl-preview">
            ${state.deepfakeKind === "video"
              ? `<video src="${state.deepfakePreviewUrl}" controls></video>`
              : `<img src="${state.deepfakePreviewUrl}" alt="Captured suspicious region" />`}
          </div>
        ` : `
          <div class="tl-empty">
            <p>No media captured yet. Start the snipping workflow to collect a suspicious region exactly like the Windows Snipping Tool flow you showed.</p>
          </div>
        `}
        <div class="tl-toolbar">
          <button class="tl-secondary" id="tl-open-snipping">Open Snipping Mode</button>
          <button class="tl-primary" id="tl-run-deepfake" ${(!state.deepfakeBlob || state.analyzing) ? "disabled" : ""}>${state.analyzing ? "Analyzing..." : "Analyze Media"}</button>
        </div>
      </section>
      ${state.deepfakeResult ? getDeepfakeResultMarkup(state.deepfakeResult) : `
        <section class="tl-empty" style="margin-top:16px;">
          <p>After capture, TruthLens shows artifact hotspots, detection rationale, and the model’s confidence in whether the media is authentic or synthetic.</p>
        </section>
      `}
    `;
  }

  function getSettingsMarkup() {
    return `
      <section>
        <span class="tl-pill">Settings</span>
        <h2 class="tl-section-title">Connection</h2>
        <p class="tl-subtitle">Point the extension to your Express backend and choose the user id sent to Firestore.</p>
      </section>
      <section class="tl-form">
        <input class="tl-input" id="tl-api-base" value="${escapeHtml(state.apiBase)}" placeholder="https://truthlens-backendd.onrender.com" />
        <input class="tl-input" id="tl-user-id" value="${escapeHtml(state.userId)}" placeholder="demo-user" />
        <div class="tl-toolbar">
          <button class="tl-secondary" id="tl-back-home">Back</button>
          <button class="tl-primary" id="tl-save-settings">Save Settings</button>
        </div>
      </section>
      <section class="tl-card" style="margin-top:16px;">
        <h4>Expected backend routes</h4>
        <p><code>POST /verify</code> accepts FormData with <code>text</code>, <code>link</code>, and <code>userId</code>.</p>
        <p style="margin-top:8px;"><code>POST /deepfake</code> accepts FormData with <code>file</code> and <code>userId</code>.</p>
      </section>
    `;
  }

  function getVerifyResultMarkup(result) {
    const scoreColor = result.verdictClass === "safe" ? "#34d399" : result.verdictClass === "warn" ? "#facc15" : "#fb7185";
    return `
      <section class="tl-stats">
        <article class="tl-card tl-score-card">
          <div class="tl-ring" style="--score:${result.score}; --ring-color:${scoreColor};">
            <span>${Math.round(result.score)}%</span>
          </div>
          <div class="tl-verdict" style="color:${scoreColor};">${escapeHtml(result.label)}</div>
          <div class="tl-small">Confidence</div>
        </article>
        <article class="tl-report">
          <div class="tl-report-box">
            <span class="tl-pill">Diagnostic reasoning report</span>
            <p class="tl-subtitle" style="margin-top:12px; margin-bottom:0;">${escapeHtml(result.explanation)}</p>
          </div>
          <div class="tl-claim-list">
            ${result.claims.map((claim) => `
              <div class="tl-claim">
                <div>${escapeHtml(claim.text)}</div>
                <span class="tl-badge ${claim.level}">${escapeHtml(claim.badge)}</span>
              </div>
            `).join("")}
          </div>
          <div class="tl-inline-meta">
            ${result.evidence.map((item) => `<div class="tl-kv">${escapeHtml(item)}</div>`).join("")}
          </div>
        </article>
      </section>
      <section class="tl-toolbar" style="margin-top:16px;">
        <button class="tl-secondary" id="tl-verify-again">Analyze Again</button>
        <button class="tl-primary" id="tl-verify-home">Return To Home</button>
      </section>
    `;
  }

  function getDeepfakeResultMarkup(result) {
    const scoreColor = result.verdictClass === "safe" ? "#34d399" : result.verdictClass === "warn" ? "#f59e0b" : "#fb7185";
    return `
      <section class="tl-stats">
        <article class="tl-card tl-score-card">
          <div class="tl-ring" style="--score:${result.score}; --ring-color:${scoreColor};">
            <span>${Math.round(result.score)}%</span>
          </div>
          <div class="tl-verdict" style="color:${scoreColor};">${escapeHtml(result.label)}</div>
          <div class="tl-small">Synthetic risk score</div>
        </article>
        <article class="tl-report">
          <div class="tl-report-box">
            <span class="tl-pill">Explainable AI report</span>
            <p class="tl-subtitle" style="margin-top:12px; margin-bottom:0;">${escapeHtml(result.explanation)}</p>
          </div>
          <div class="tl-claim-list">
            ${result.findings.map((item) => `
              <div class="tl-claim">
                <div>${escapeHtml(item.text)}</div>
                <span class="tl-badge ${item.level}">${escapeHtml(item.badge)}</span>
              </div>
            `).join("")}
          </div>
          <div class="tl-inline-meta">
            ${result.evidence.map((item) => `<div class="tl-kv">${escapeHtml(item)}</div>`).join("")}
          </div>
        </article>
      </section>
      <section class="tl-toolbar" style="margin-top:16px;">
        <button class="tl-secondary" id="tl-deepfake-again">Analyze Again</button>
        <button class="tl-primary" id="tl-deepfake-home">Return To Home</button>
      </section>
    `;
  }

  function bindPanelEvents() {
    const closeBtn = shadow.getElementById("tl-close");
    const settingsBtn = shadow.getElementById("tl-settings");
    closeBtn?.addEventListener("click", () => {
      state.isOpen = false;
      render();
    });
    settingsBtn?.addEventListener("click", () => {
      state.activeScreen = "settings";
      render();
    });

    shadow.getElementById("tl-start-verify")?.addEventListener("click", armVerifyMode);
    shadow.getElementById("tl-start-deepfake")?.addEventListener("click", armSnippingMode);
    shadow.getElementById("tl-wait-selection")?.addEventListener("click", armVerifyMode);
    shadow.getElementById("tl-open-snipping")?.addEventListener("click", armSnippingMode);
    shadow.getElementById("tl-run-verify")?.addEventListener("click", runVerifyAnalysis);
    shadow.getElementById("tl-run-deepfake")?.addEventListener("click", runDeepfakeAnalysis);
    shadow.getElementById("tl-verify-again")?.addEventListener("click", resetVerifyFlow);
    shadow.getElementById("tl-verify-home")?.addEventListener("click", goHomeFromVerify);
    shadow.getElementById("tl-deepfake-again")?.addEventListener("click", resetDeepfakeFlow);
    shadow.getElementById("tl-deepfake-home")?.addEventListener("click", goHomeFromDeepfake);
    shadow.getElementById("tl-save-settings")?.addEventListener("click", saveSettings);
    shadow.getElementById("tl-back-home")?.addEventListener("click", () => {
      state.activeScreen = "home";
      render();
    });

    shadow.getElementById("tl-cancel-snipping")?.addEventListener("click", stopSnippingMode);
    shadow.getElementById("tl-capture-image")?.addEventListener("click", captureSelectedImage);
    shadow.getElementById("tl-capture-video")?.addEventListener("click", captureSelectedVideo);
    shadow.getElementById("tl-stop-recording")?.addEventListener("click", stopVideoRecording);
  }

  async function loadSettings() {
    const stored = await chrome.storage.sync.get(["truthlensApiBase", "truthlensUserId"]);
    state.apiBase = stored.truthlensApiBase || DEFAULT_API_BASE;
    state.userId = stored.truthlensUserId || "demo-user";
  }

  async function saveSettings() {
    const apiBase = shadow.getElementById("tl-api-base")?.value?.trim() || DEFAULT_API_BASE;
    const userId = shadow.getElementById("tl-user-id")?.value?.trim() || "demo-user";
    state.apiBase = apiBase.replace(/\/+$/, "");
    state.userId = userId;
    await chrome.storage.sync.set({
      truthlensApiBase: state.apiBase,
      truthlensUserId: state.userId
    });
    showToast("TruthLens settings saved.");
    state.activeScreen = "home";
    render();
  }

  function armVerifyMode() {
    state.activeScreen = "verify";
    state.waitingForSelection = true;
    state.isOpen = false;
    render();
    showToast("Highlight text anywhere on the page. TruthLens will reopen when it detects the selection.");
  }

  function handlePotentialSelection() {
    if (!state.waitingForSelection) {
      return;
    }

    window.setTimeout(() => {
      const text = window.getSelection()?.toString().trim() || "";
      if (text.length < 8) {
        return;
      }

      state.selectedText = text;
      state.waitingForSelection = false;
      state.activeScreen = "verify";
      state.isOpen = true;
      render();
      showToast("Highlighted text captured. Review it and run analysis.");
    }, 10);
  }

  async function runVerifyAnalysis() {
    const input = shadow.getElementById("tl-verify-input")?.value?.trim() || state.selectedText;
    if (!input) {
      showToast("Add or highlight some text first.");
      return;
    }

    state.selectedText = input;
    state.analyzing = true;
    state.verifyResult = null;
    render();

    try {
      const result = await analyzeText(input);
      state.verifyResult = result;
      showToast("News verification complete.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Verification failed.");
    } finally {
      state.analyzing = false;
      render();
    }
  }

  function resetVerifyFlow() {
    state.verifyResult = null;
    state.selectedText = "";
    state.waitingForSelection = false;
    state.activeScreen = "verify";
    state.isOpen = true;
    render();
    showToast("Ready for another claim. Highlight new text or paste new content.");
  }

  function goHomeFromVerify() {
    state.verifyResult = null;
    state.waitingForSelection = false;
    state.activeScreen = "home";
    state.isOpen = true;
    render();
  }

  function armSnippingMode() {
    state.activeScreen = "deepfake";
    state.snippingActive = true;
    state.selectionRect = null;
    state.selectionDraft = null;
    state.pointerStart = null;
    state.isOpen = false;
    renderOverlayState();
    render();
    showToast("Snipping mode active. Drag to select a region.");
  }

  function stopSnippingMode() {
    state.snippingActive = false;
    state.selectionRect = null;
    state.selectionDraft = null;
    state.pointerStart = null;
    renderOverlayState();
    state.isOpen = true;
    render();
  }

  function renderOverlayState() {
    refs.overlay.className = `tl-overlay${state.snippingActive ? " active" : ""}`;
    refs.overlay.style.display = state.snippingActive ? "block" : "none";

    const rect = state.selectionDraft || state.selectionRect;
    if (rect) {
      refs.selection.className = "tl-selection active";
      refs.selection.style.left = `${rect.x}px`;
      refs.selection.style.top = `${rect.y}px`;
      refs.selection.style.width = `${rect.width}px`;
      refs.selection.style.height = `${rect.height}px`;
      refs.overlayToolbar.style.display = "flex";
    } else {
      refs.selection.className = "tl-selection";
      refs.overlayToolbar.style.display = "none";
      refs.selection.removeAttribute("style");
    }

    refs.recordToolbar.style.display = state.recorder ? "flex" : "none";
  }

  function onOverlayPointerDown(event) {
    if (!state.snippingActive || event.target.closest(".tl-overlay-toolbar") || event.target.closest(".tl-record-toolbar")) {
      return;
    }

    event.preventDefault();
    state.pointerStart = { x: event.clientX, y: event.clientY };
    state.selectionDraft = { x: event.clientX, y: event.clientY, width: 0, height: 0 };
    renderOverlayState();
  }

  function onOverlayPointerMove(event) {
    if (!state.pointerStart || !state.snippingActive) {
      return;
    }

    event.preventDefault();
    state.selectionDraft = normalizeRect(state.pointerStart, { x: event.clientX, y: event.clientY });
    renderOverlayState();
  }

  function onOverlayPointerUp(event) {
    if (!state.pointerStart || !state.snippingActive) {
      return;
    }

    event.preventDefault();
    state.selectionRect = normalizeRect(state.pointerStart, { x: event.clientX, y: event.clientY });
    state.selectionDraft = null;
    state.pointerStart = null;
    if (state.selectionRect.width < 20 || state.selectionRect.height < 20) {
      state.selectionRect = null;
      showToast("Selection is too small. Drag a larger area.");
    }
    renderOverlayState();
  }

  async function captureSelectedImage() {
    if (!state.selectionRect) {
      showToast("Select a region first.");
      return;
    }

    try {
      const dataUrl = await captureVisibleTab();
      const cropped = await cropDataUrl(dataUrl, state.selectionRect);
      state.deepfakePreviewUrl = cropped.dataUrl;
      state.deepfakeBlob = cropped.blob;
      state.deepfakeKind = "image";
      state.deepfakeResult = null;
      state.snippingActive = false;
      state.activeScreen = "deepfake";
      state.isOpen = true;
      renderOverlayState();
      render();
      showToast("Screenshot captured. Review and analyze when ready.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Unable to capture screenshot.");
    }
  }

  async function captureSelectedVideo() {
    if (!state.selectionRect) {
      showToast("Select a region first.");
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      showToast("This page does not allow screen recording from the extension.");
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      const video = document.createElement("video");
      video.srcObject = displayStream;
      video.muted = true;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(2, Math.floor(state.selectionRect.width * window.devicePixelRatio));
      canvas.height = Math.max(2, Math.floor(state.selectionRect.height * window.devicePixelRatio));
      const context = canvas.getContext("2d");
      const canvasStream = canvas.captureStream(24);
      const recorder = new MediaRecorder(canvasStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm"
      });

      state.captureStream = displayStream;
      state.recordVideo = video;
      state.recordCanvas = canvas;
      state.recordChunks = [];
      state.recorder = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data.size > 0) {
          state.recordChunks.push(evt.data);
        }
      };

      recorder.onstop = () => finalizeVideoCapture();
      recorder.start(300);
      state.snippingActive = true;
      renderOverlayState();
      showToast("Recording started. Use Stop Recording when you have enough evidence.");

      const drawFrame = () => {
        if (!state.recorder || state.recorder.state === "inactive") {
          return;
        }

        const scaleX = video.videoWidth / window.innerWidth;
        const scaleY = video.videoHeight / window.innerHeight;
        const rect = state.selectionRect;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          video,
          rect.x * scaleX,
          rect.y * scaleY,
          rect.width * scaleX,
          rect.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        state.recordFrameLoop = requestAnimationFrame(drawFrame);
      };

      drawFrame();
    } catch (error) {
      console.error(error);
      showToast("Video capture was cancelled or blocked.");
    }
  }

  function stopVideoRecording() {
    if (!state.recorder) {
      return;
    }

    if (state.recordFrameLoop) {
      cancelAnimationFrame(state.recordFrameLoop);
      state.recordFrameLoop = null;
    }

    state.recorder.stop();
    state.captureStream?.getTracks().forEach((track) => track.stop());
  }

  async function finalizeVideoCapture() {
    const blob = new Blob(state.recordChunks, { type: "video/webm" });
    if (blob.size === 0) {
      showToast("No video data was captured.");
      resetRecorderState();
      renderOverlayState();
      return;
    }

    if (state.deepfakePreviewUrl && state.deepfakePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.deepfakePreviewUrl);
    }

    state.deepfakeBlob = blob;
    state.deepfakePreviewUrl = URL.createObjectURL(blob);
    state.deepfakeKind = "video";
    state.deepfakeResult = null;
    state.snippingActive = false;
    state.isOpen = true;
    state.activeScreen = "deepfake";
    resetRecorderState();
    renderOverlayState();
    render();
    showToast("Video region captured. Run the deepfake analysis next.");
  }

  function resetRecorderState() {
    state.recorder = null;
    state.recordChunks = [];
    state.captureStream = null;
    state.recordCanvas = null;
    state.recordVideo = null;
  }

  async function runDeepfakeAnalysis() {
    if (!state.deepfakeBlob) {
      showToast("Capture media first.");
      return;
    }

    state.analyzing = true;
    state.deepfakeResult = null;
    render();

    try {
      const result = await analyzeDeepfake(state.deepfakeBlob, state.deepfakeKind);
      state.deepfakeResult = result;
      showToast("Deepfake analysis complete.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Deepfake analysis failed.");
    } finally {
      state.analyzing = false;
      render();
    }
  }

  function resetDeepfakeFlow() {
    if (state.deepfakePreviewUrl && state.deepfakePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.deepfakePreviewUrl);
    }
    state.deepfakePreviewUrl = "";
    state.deepfakeBlob = null;
    state.deepfakeKind = "image";
    state.deepfakeResult = null;
    state.activeScreen = "deepfake";
    state.isOpen = true;
    render();
    showToast("Ready for another capture. Open snipping mode to select a new region.");
  }

  function goHomeFromDeepfake() {
    state.deepfakeResult = null;
    state.activeScreen = "home";
    state.isOpen = true;
    render();
  }

  async function analyzeText(input) {
    const form = new FormData();
    form.append("text", input);
    form.append("link", location.href);
    form.append("userId", state.userId);

    try {
      const response = await fetch(`${state.apiBase}/verify`, {
        method: "POST",
        body: form
      });

      if (!response.ok) {
        throw new Error(`Verify API returned ${response.status}`);
      }

      const raw = await response.json();
      return normalizeVerifyResult(raw, input);
    } catch (error) {
      console.warn("Using local verify fallback.", error);
      return heuristicVerify(input);
    }
  }

  async function analyzeDeepfake(blob, kind) {
    const fileName = kind === "video" ? "capture.webm" : "capture.png";
    const mimeType = kind === "video" ? "video/webm" : "image/png";
    const file = new File([blob], fileName, { type: mimeType });

    const form = new FormData();
    form.append("file", file);
    form.append("userId", state.userId);

    try {
      const response = await fetch(`${state.apiBase}/deepfake`, {
        method: "POST",
        body: form
      });

      if (!response.ok) {
        throw new Error(`Deepfake API returned ${response.status}`);
      }

      const raw = await response.json();
      return normalizeDeepfakeResult(raw, kind);
    } catch (error) {
      console.warn("Using local deepfake fallback.", error);
      return heuristicDeepfake(kind, blob.size);
    }
  }

  function normalizeVerifyResult(raw, input) {
    const score = clampNumber(
      raw.score ?? raw.confidence ?? raw.trustScore ?? raw.percentage ?? raw.fakeScore ?? 72,
      0,
      100
    );
    const label = String(raw.label ?? raw.verdict ?? raw.classification ?? (score >= 70 ? "Credible" : score >= 45 ? "Mixed" : "Likely False"));
    const explanation = String(raw.explanation ?? raw.reason ?? raw.summary ?? raw.message ?? "The verification model inspected the selected claim and generated an explainable trust assessment.");
    const evidence = arrayify(raw.evidence ?? raw.sources ?? raw.citations ?? [
      `Page source: ${location.hostname || "current page"}`,
      `Captured from: ${new Date().toLocaleTimeString()}`,
      "Explainable claim segmentation enabled"
    ]);
    const rawClaims = arrayify(raw.claims ?? raw.breakdown ?? raw.points ?? [
      { text: shorten(input, 72), status: label }
    ]);
    const verdictClass = getVerdictClass(score, label);

    return {
      score,
      label,
      explanation,
      verdictClass,
      claims: rawClaims.map((claim, index) => normalizeClaim(claim, index)),
      evidence: evidence.map(String)
    };
  }

  function normalizeDeepfakeResult(raw, kind) {
    const riskBase = raw.score ?? raw.confidence ?? raw.riskScore ?? raw.deepfakeScore ?? raw.fakeProbability ?? 61;
    const score = clampNumber(riskBase, 0, 100);
    const label = String(raw.label ?? raw.verdict ?? raw.classification ?? (score >= 70 ? "High Risk" : score >= 45 ? "Needs Review" : "Likely Authentic"));
    const explanation = String(raw.explanation ?? raw.reason ?? raw.summary ?? raw.message ?? "The media scan inspected artifact consistency, motion coherence, and texture anomalies to estimate synthetic risk.");
    const findings = arrayify(raw.findings ?? raw.artifacts ?? raw.breakdown ?? [
      { text: `${kind === "video" ? "Temporal" : "Pixel"} consistency check`, status: score >= 70 ? "High Risk" : "Observed" },
      { text: "Edge blending and facial contour review", status: score >= 55 ? "Suspicious" : "Stable" },
      { text: "Compression and lighting harmony scan", status: score >= 45 ? "Needs review" : "Healthy" }
    ]);
    const evidence = arrayify(raw.evidence ?? raw.signals ?? raw.sources ?? [
      `${kind === "video" ? "Video" : "Image"} capture uploaded`,
      `File size: ${(((state.deepfakeBlob?.size) || 0) / 1024).toFixed(1)} KB`,
      "Explainable artifact report enabled"
    ]);

    return {
      score,
      label,
      explanation,
      verdictClass: label.toLowerCase().includes("authentic") ? "safe" : score >= 70 ? "danger" : score >= 45 ? "warn" : "safe",
      findings: findings.map((finding, index) => normalizeClaim(finding, index)),
      evidence: evidence.map(String)
    };
  }

  function normalizeClaim(claim, index) {
    if (typeof claim === "string") {
      return {
        text: claim,
        badge: index % 2 === 0 ? "Observed" : "Review",
        level: index % 2 === 0 ? "warn" : "safe"
      };
    }

    const text = String(claim.text ?? claim.claim ?? claim.title ?? `Signal ${index + 1}`);
    const badgeText = String(claim.badge ?? claim.status ?? claim.verdict ?? claim.result ?? "Observed");
    const normalizedBadge = badgeText.toLowerCase();
    const level = normalizedBadge.includes("false") || normalizedBadge.includes("risk") || normalizedBadge.includes("susp") ? "danger"
      : normalizedBadge.includes("review") || normalizedBadge.includes("mixed") || normalizedBadge.includes("warn") ? "warn"
      : "safe";

    return {
      text,
      badge: badgeText,
      level
    };
  }

  function heuristicVerify(input) {
    const suspiciousTerms = ["shocking", "breaking", "secret", "surrendered", "guaranteed", "100%", "miracle"];
    const hits = suspiciousTerms.filter((term) => input.toLowerCase().includes(term));
    const score = Math.max(18, 84 - hits.length * 18 - Math.min(28, input.length / 18));
    const label = score >= 70 ? "Credible" : score >= 45 ? "Mixed Signals" : "Likely False";
    return {
      score,
      label,
      explanation: hits.length
        ? `Fallback analysis noticed emotionally loaded or absolute phrasing (${hits.join(", ")}), which commonly appears in misleading claims. Connect your backend for model-grounded verification.`
        : "Fallback analysis found no strong linguistic red flags, but this is still a demo heuristic until the Express verification API responds.",
      verdictClass: getVerdictClass(score, label),
      claims: [
        { text: shorten(input, 86), badge: label, level: getVerdictClass(score, label) },
        { text: "Linguistic certainty and sensational wording check", badge: hits.length ? "Triggered" : "Clean", level: hits.length ? "danger" : "safe" },
        { text: "Source cross-reference", badge: "Backend needed", level: "warn" }
      ],
      evidence: [
        "Local heuristic fallback",
        `Selected from ${location.hostname || "this page"}`,
        "Connect /verify for real evidence retrieval"
      ]
    };
  }

  function heuristicDeepfake(kind, fileSize) {
    const score = kind === "video" ? 64 : 57;
    return {
      score,
      label: score >= 70 ? "High Risk" : "Needs Review",
      explanation: "Fallback deepfake mode checks capture type and metadata only. Your real `/deepfake` endpoint should return model-based artifact analysis, temporal consistency findings, and confidence.",
      verdictClass: score >= 70 ? "danger" : "warn",
      findings: [
        { text: `${kind === "video" ? "Temporal" : "Visual"} artifact scan`, badge: "Demo mode", level: "warn" },
        { text: "Landmark stability / blending review", badge: "Backend needed", level: "warn" },
        { text: `File payload ${(fileSize / 1024).toFixed(1)} KB`, badge: "Captured", level: "safe" }
      ],
      evidence: [
        "Local fallback mode",
        `${kind === "video" ? "Video" : "Image"} successfully captured`,
        "Connect /deepfake for production inference"
      ]
    };
  }

  function captureVisibleTab() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "TRUTHLENS_CAPTURE_VISIBLE_TAB" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response?.ok) {
          reject(new Error(response?.error || "Capture failed"));
          return;
        }
        resolve(response.dataUrl);
      });
    });
  }

  function cropDataUrl(dataUrl, rect) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const scaleX = image.naturalWidth / window.innerWidth;
        const scaleY = image.naturalHeight / window.innerHeight;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(2, Math.floor(rect.width * scaleX));
        canvas.height = Math.max(2, Math.floor(rect.height * scaleY));
        const context = canvas.getContext("2d");
        context.drawImage(
          image,
          rect.x * scaleX,
          rect.y * scaleY,
          rect.width * scaleX,
          rect.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create screenshot blob"));
            return;
          }
          resolve({
            blob,
            dataUrl: canvas.toDataURL("image/png")
          });
        }, "image/png");
      };
      image.onerror = () => reject(new Error("Failed to read captured screenshot"));
      image.src = dataUrl;
    });
  }

  function normalizeRect(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    return { x, y, width, height };
  }

  function showToast(message) {
    if (!message) {
      return;
    }

    state.lastToast = message;
    refs.toast.textContent = message;
    refs.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      refs.toast.classList.remove("show");
    }, 3400);
  }

  function getVerdictClass(score, label) {
    const normalized = String(label).toLowerCase();
    if (normalized.includes("false") || normalized.includes("risk") || normalized.includes("fake")) {
      return "danger";
    }
    if (normalized.includes("mixed") || normalized.includes("review") || normalized.includes("warn")) {
      return "warn";
    }
    return score >= 70 ? "safe" : score >= 45 ? "warn" : "danger";
  }

  function arrayify(value) {
    if (Array.isArray(value)) {
      return value;
    }
    if (value == null) {
      return [];
    }
    return [value];
  }

  function clampNumber(value, min, max) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return min;
    }
    return Math.max(min, Math.min(max, numeric));
  }

  function shorten(text, max) {
    const safe = String(text || "");
    return safe.length > max ? `${safe.slice(0, max - 1)}…` : safe;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function stepMarkup(steps) {
    return steps.map((step, index) => `
      <div class="tl-step">
        <div class="tl-step-badge">${index + 1}</div>
        <p>${escapeHtml(step)}</p>
      </div>
    `).join("");
  }
})();
