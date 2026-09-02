(function () {
  'use strict';

  var tag = document.getElementById('aa-meta-tracking');
  var pixelId = tag && String(tag.dataset.metaPixelId || '').trim();
  if (!/^\d{6,20}$/.test(pixelId)) return;

  var consentKey = 'aa.ad_tracking_consent.v1';
  var consent = document.getElementById('tracking-consent');
  var choices = document.getElementById('tracking-choices');
  var allow = document.getElementById('tracking-allow');
  var decline = document.getElementById('tracking-decline');
  var product = {
    content_name: 'The Operator Profile',
    content_ids: ['operator_profile'],
    content_type: 'product',
    value: 29.00,
    currency: 'USD'
  };

  function readChoice() {
    try {
      return window.localStorage.getItem(consentKey) || '';
    } catch (error) {
      return '';
    }
  }

  function saveChoice(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (error) {
      // A blocked storage API simply means the choice lasts for this page view.
    }
  }

  function showChoices() {
    consent.hidden = false;
    decline.focus();
  }

  function hideChoices() {
    consent.hidden = true;
  }

  function loadMeta() {
    if (window.fbq) return;
    /* Meta's standard loader, held behind an affirmative choice above. */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'));

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    window.fbq('track', 'ViewContent', product);
  }

  function clearMetaCookies() {
    ['_fbp', '_fbc'].forEach(function (name) {
      document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
    });
  }

  function checkoutReference() {
    try {
      return 'aa_' + window.crypto.randomUUID().replace(/-/g, '');
    } catch (error) {
      return '';
    }
  }

  allow.addEventListener('click', function () {
    saveChoice('allowed');
    hideChoices();
    loadMeta();
  });

  decline.addEventListener('click', function () {
    var wasAllowed = readChoice() === 'allowed';
    saveChoice('declined');
    clearMetaCookies();
    hideChoices();
    if (wasAllowed) window.location.reload();
  });

  choices.hidden = false;
  choices.addEventListener('click', showChoices);

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || readChoice() !== 'allowed') return;
    var url;
    try {
      url = new URL(link.href, window.location.href);
      if (url.hostname !== 'buy.stripe.com') return;
    } catch (error) {
      return;
    }
    var reference = url.searchParams.get('client_reference_id') || checkoutReference();
    if (reference) {
      url.searchParams.set('client_reference_id', reference);
      link.href = url.toString();
    }
    loadMeta();
    window.fbq(
      'track', 'InitiateCheckout', product,
      reference ? { eventID: reference + '_checkout' } : {}
    );
  });

  if (readChoice() === 'allowed') {
    loadMeta();
  } else if (readChoice() !== 'declined') {
    showChoices();
  }
}());
