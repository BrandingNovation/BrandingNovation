/**
 * Paywall — Free / Standard / Premium access gate.
 * USB serial (?serial=) unlocks full access. QR visitors get 30s previews until purchase.
 *
 * NOTE: If offering download of full song files, wire sites/shared/email-download-gate.js
 * per DMG standing rule — email capture required before any downloadable audio master.
 */
class PaywallManager {
  static TIERS = {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      previewSeconds: 30,
      features: ['tracklist', 'previews', 'liner_notes', 'about', 'updates_view']
    },
    standard: {
      id: 'standard',
      name: 'Standard',
      price: 12,
      features: ['full_streaming', 'liner_notes', 'videos']
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 35,
      features: ['full_streaming', 'liner_notes', 'videos', 'instrumentals', 'bonus_content', 'giveaway_priority']
    }
  };

  constructor(options = {}) {
    this.storageKey = 'systrum_access_tier';
    this.serialKey = 'systrum_usb_serial';
    this.checkoutApi =
      options.checkoutApi ||
      options.stripeCheckoutUrl ||
      (typeof location !== 'undefined' ? `${location.origin}/checkout-api` : 'https://checkout.dmgdistro.com');
    this.artistId = options.artistId || 'lilbru';
    this.albumTitle = options.albumTitle || "Y'all Know I Don't Rap";
    this.serial = options.serial || new URLSearchParams(window.location.search).get('serial');
    this.onTierChange = options.onTierChange || null;
    this.tier = 'free';
  }

  async init() {
    if (this.serial) {
      const validated = await this.validateSerial(this.serial);
      if (validated) {
        localStorage.setItem(this.serialKey, this.serial);
        this.tier = 'premium';
        localStorage.setItem(this.storageKey, this.tier);
        this._emitChange('usb_serial');
        return { tier: this.tier, source: 'usb_serial', hasAccess: true };
      }
      /* Invalid serial — fall through; do not grant premium */
    }

    const storedSerial = localStorage.getItem(this.serialKey);
    if (storedSerial) {
      const validated = await this.validateSerial(storedSerial);
      if (validated) {
        this.serial = storedSerial;
        this.tier = 'premium';
        localStorage.setItem(this.storageKey, this.tier);
        this._emitChange('usb_serial_cached');
        return { tier: this.tier, source: 'usb_serial_cached', hasAccess: true };
      }
      localStorage.removeItem(this.serialKey);
    }

    const storedTier = localStorage.getItem(this.storageKey);
    if (storedTier && PaywallManager.TIERS[storedTier]) {
      this.tier = storedTier;
      this._emitChange('localStorage');
      return { tier: this.tier, source: 'localStorage', hasAccess: this.tier !== 'free' };
    }

    const urlTier = new URLSearchParams(window.location.search).get('tier');
    if (urlTier && PaywallManager.TIERS[urlTier] && urlTier !== 'free') {
      this.setTier(urlTier, 'url_param');
      return { tier: this.tier, source: 'url_param', hasAccess: true };
    }

    this.tier = 'free';
    return { tier: this.tier, source: 'default', hasAccess: false };
  }

  async validateSerial(serial) {
    if (!serial) return false;
    /* Offline / sample serials still unlock for local USB kit demos */
    if (
      /^DMG-USB-SAMPLE/i.test(serial) ||
      /^DMG-USB-TEST/i.test(serial) ||
      /^DMG-USB-YKIDR/i.test(serial) ||
      /^DMG-USB-MASTER/i.test(serial)
    ) {
      return true;
    }
    try {
      const base =
        (window.SYSTRUM_CONFIG && window.SYSTRUM_CONFIG.brand && window.SYSTRUM_CONFIG.brand.api_url) ||
        'https://admin.dmgdistro.com/api/public/usb';
      const res = await fetch(`${String(base).replace(/\/$/, '')}/serial/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial,
          artist_slug: this.artistId || 'lilbru'
        })
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!(data && data.valid);
    } catch {
      /* network fail — deny premium for unknown serials */
      return false;
    }
  }

  getTier() {
    return this.tier;
  }

  getTierInfo() {
    return PaywallManager.TIERS[this.tier];
  }

  setTier(tier, source = 'manual') {
    if (!PaywallManager.TIERS[tier]) return;
    this.tier = tier;
    localStorage.setItem(this.storageKey, tier);
    this._emitChange(source);
  }

  hasFullAccess() {
    return this.tier === 'standard' || this.tier === 'premium';
  }

  hasPremiumAccess() {
    return this.tier === 'premium';
  }

  canPlayFullTrack(track) {
    if (this.hasFullAccess()) {
      if (track.premium_only) return this.hasPremiumAccess();
      return true;
    }
    return false;
  }

  canPlayVideo(video) {
    if (video && (video.free || video.youtube_id)) return true;
    if (!this.hasFullAccess()) return false;
    if (video.premium_only) return this.hasPremiumAccess();
    return true;
  }

  getPreviewLimitSeconds() {
    return PaywallManager.TIERS.free.previewSeconds;
  }

  getCheckoutUrl(tier) {
    /* Legacy string URL — prefer startCheckout() which calls create-session */
    return this.checkoutApi && !String(this.checkoutApi).startsWith('YOUR_')
      ? `${this.checkoutApi}/create-session`
      : null;
  }

  async startCheckout(tier) {
    const tierInfo = PaywallManager.TIERS[tier];
    if (!tierInfo || tier === 'free') return;

    const amountCents = Math.round((tierInfo.price || 0) * 100);
    if (amountCents <= 0) return;

    const turnstileActive =
      window.DmgTurnstile && window.DmgTurnstile.isEnforced && window.DmgTurnstile.isEnforced();
    const turnstileToken =
      turnstileActive && window.DmgTurnstile.getToken ? window.DmgTurnstile.getToken() : '';
    if (turnstileActive && !turnstileToken) {
      throw new Error('Complete the security check, then try again.');
    }

    const origin = window.location.origin + window.location.pathname.replace(/\/?index\.html$/, '/');
    const deviceId =
      (window.Analytics && Analytics.getOrCreateDeviceId()) ||
      localStorage.getItem('systrum_device_id') ||
      '';

    const focusTitle = (this._focusTrackTitle || '').trim();
    const lineTitle = focusTitle
      ? `${focusTitle} — ${tierInfo.name} access`
      : `${this.albumTitle} — ${tierInfo.name} access`;

    const payload = {
      items: [
        {
          id: `systrum-usb-${this.artistId}-${tier}`,
          title: lineTitle,
          amount_cents: amountCents,
          quantity: 1,
          product_type: 'song',
          artist_id: this.artistId
        }
      ],
      store: 'systrum-usb',
      metadata: {
        tier,
        device_id: deviceId,
        artist_id: this.artistId,
        product: 'systrum-usb',
        track_title: focusTitle || undefined
      },
      success_url: `${origin}?checkout=success&tier=${encodeURIComponent(tier)}&device_id=${encodeURIComponent(deviceId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?checkout=cancel`
    };
    if (turnstileToken) payload.turnstile_token = turnstileToken;

    /* Systrum checkout 404 fix: prefer navigational /go (no Turnstile / WebView-safe).
     * Proxied path: /checkout-api/go → CRM GET /v1/checkout/go
     * Falls back to POST /create-session only if /go health fails. */
    const base = String(this.checkoutApi || (typeof location !== 'undefined' ? `${location.origin}/checkout-api` : 'https://checkout.dmgdistro.com')).replace(/\/$/, '');
    function toB64Url(obj) {
      const s = JSON.stringify(obj);
      const b64 = btoa(unescape(encodeURIComponent(s)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    const goUrl = `${base}/go?p=${encodeURIComponent(toB64Url(payload))}`;
    try {
      const health = await fetch(`${base}/health`, { cache: 'no-store' });
      if (health.ok) {
        window.location.href = goUrl;
        return;
      }
    } catch (_) {
      /* fall through to create-session */
    }
    window.location.href = goUrl;
  }

  /** Unlock after Stripe success return (?checkout=success&tier=…&session_id=…) */
  consumeCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') return false;
    const tier = params.get('tier');
    const sessionId = params.get('session_id');
    const deviceId =
      params.get('device_id') ||
      (window.Analytics && Analytics.getOrCreateDeviceId()) ||
      localStorage.getItem('systrum_device_id');

    const finishLocal = (unlockTier) => {
      if (unlockTier && PaywallManager.TIERS[unlockTier] && unlockTier !== 'free') {
        this.setTier(unlockTier, 'stripe_checkout');
      }
      params.delete('checkout');
      params.delete('session_id');
      const cleanQs = params.toString();
      const clean = `${window.location.pathname}${cleanQs ? '?' + cleanQs : ''}${window.location.hash || ''}`;
      window.history.replaceState({}, '', clean);
    };

    if (sessionId && sessionId.startsWith('cs_')) {
      const base =
        (window.SYSTRUM_CONFIG && window.SYSTRUM_CONFIG.brand && window.SYSTRUM_CONFIG.brand.api_url) ||
        'https://admin.dmgdistro.com/api/public/usb';
      fetch(`${String(base).replace(/\/$/, '')}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          device_id: deviceId,
          artist_slug: this.artistId || 'lilbru',
          tier: tier || undefined
        })
      })
        .then((r) => r.json())
        .then((data) => {
          finishLocal((data && data.tier) || tier);
        })
        .catch(() => {
          finishLocal(tier);
        });
      return true;
    }

    if (tier && PaywallManager.TIERS[tier] && tier !== 'free') {
      finishLocal(tier);
      return true;
    }
    return false;
  }

  _unlockHeadline(trackTitle) {
    const song = (trackTitle || this._focusTrackTitle || '').trim();
    if (song) return `Unlock ${song}`;
    const album = (this.albumTitle || '').trim();
    return album ? `Unlock ${album}` : 'Unlock full access';
  }

  renderPaywallModal(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="paywall-overlay" id="paywall-overlay">
        <div class="paywall-modal">
          <button class="paywall-close" id="paywall-close" aria-label="Close">&times;</button>
          <h2 class="paywall-title" id="paywall-title">${this._unlockHeadline()}</h2>
          <p class="paywall-subtitle">Full album streaming, videos, and exclusive updates.</p>
          <div class="paywall-turnstile" data-dmg-turnstile-section hidden>
            <p class="paywall-turnstile-label">Complete the security check to continue</p>
            <div class="paywall-turnstile-wrap" data-dmg-turnstile data-turnstile-theme="dark" aria-label="Security check"></div>
          </div>
          <div class="paywall-tiers">
            ${this._tierCard('standard', '$12', 'Full album streaming + music videos')}
            ${this._tierCard('premium', '$35', 'Everything + instrumentals, bonus content & VIP giveaways')}
          </div>
          <p class="paywall-note">USB owners: plug in and launch — your serial unlocks automatically.</p>
        </div>
      </div>
    `;

    container.querySelector('#paywall-close').addEventListener('click', () => this.hidePaywall());
    container.querySelector('#paywall-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'paywall-overlay') this.hidePaywall();
    });

    if (window.DmgTurnstile) {
      window.DmgTurnstile.ready(() => {
        const el = container.querySelector('[data-dmg-turnstile]');
        const section = container.querySelector('[data-dmg-turnstile-section]');
        if (section) section.hidden = !window.DmgTurnstile.isEnforced();
        if (el && window.DmgTurnstile.isEnforced()) window.DmgTurnstile.mount(el, { theme: 'dark' });
      });
    }

    container.querySelectorAll('[data-checkout-tier]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const tier = btn.dataset.checkoutTier;
        if (window.analytics) window.analytics.trackPaywallView(tier);
        btn.disabled = true;
        try {
          await this.startCheckout(tier);
        } catch (err) {
          btn.disabled = false;
          if (window.DmgTurnstile) window.DmgTurnstile.reset();
          alert(err?.message || 'Checkout unavailable. Try again or email info@dmgdistro.com.');
        }
      });
    });
  }

  _tierCard(tier, price, desc) {
    const info = PaywallManager.TIERS[tier];
    return `
      <div class="paywall-tier-card ${tier === 'premium' ? 'featured' : ''}">
        <h3>${info.name}</h3>
        <div class="paywall-price">${price}</div>
        <p>${desc}</p>
        <button class="btn btn-gold" data-checkout-tier="${tier}">Get ${info.name}</button>
      </div>
    `;
  }

  showPaywall(trackOrTitle) {
    if (trackOrTitle && typeof trackOrTitle === 'object') {
      this._focusTrackTitle = trackOrTitle.title || '';
    } else if (typeof trackOrTitle === 'string') {
      this._focusTrackTitle = trackOrTitle;
    } else if (
      !this._focusTrackTitle &&
      window.player &&
      typeof window.player.getCurrentTrack === 'function'
    ) {
      const current = window.player.getCurrentTrack();
      if (current?.title) this._focusTrackTitle = current.title;
    }

    const titleEl = document.getElementById('paywall-title');
    if (titleEl) titleEl.textContent = this._unlockHeadline();

    const overlay = document.getElementById('paywall-overlay');
    if (overlay) overlay.classList.add('visible');
  }

  hidePaywall() {
    const overlay = document.getElementById('paywall-overlay');
    if (overlay) overlay.classList.remove('visible');
  }

  _emitChange(source) {
    if (window.analytics) {
      window.analytics.trackTierUnlock(this.tier, source);
    }
    window.dispatchEvent(new CustomEvent('tierChange', {
      detail: { tier: this.tier, source }
    }));
    if (this.onTierChange) this.onTierChange(this.tier, source);
  }
}

window.PaywallManager = PaywallManager;
