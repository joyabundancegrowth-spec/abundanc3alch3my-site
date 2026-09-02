'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'operator-profile', 'tracking.js'),
  'utf8'
);

function element(hidden = true) {
  const handlers = {};
  return {
    hidden,
    dataset: {},
    handlers,
    addEventListener(type, handler) { handlers[type] = handler; },
    focus() {},
  };
}

function runTracking({ pixelId = '', storedChoice = '' } = {}) {
  const values = new Map();
  if (storedChoice) values.set('aa.ad_tracking_consent.v1', storedChoice);

  const tag = element();
  tag.dataset.metaPixelId = pixelId;
  const consent = element();
  const choices = element();
  const allow = element();
  const decline = element();
  const nodes = {
    'aa-meta-tracking': tag,
    'tracking-consent': consent,
    'tracking-choices': choices,
    'tracking-allow': allow,
    'tracking-decline': decline,
  };
  const insertedScripts = [];
  const documentHandlers = {};
  let reloads = 0;

  const document = {
    cookie: '',
    getElementById(id) { return nodes[id]; },
    createElement() { return {}; },
    getElementsByTagName() {
      return [{ parentNode: { insertBefore(node) { insertedScripts.push(node); } } }];
    },
    addEventListener(type, handler) { documentHandlers[type] = handler; },
  };
  const localStorage = {
    getItem(key) { return values.get(key) || null; },
    setItem(key, value) { values.set(key, value); },
  };
  const window = {
    crypto: { randomUUID() { return '11111111-2222-4333-8444-555555555555'; } },
    document,
    localStorage,
    location: {
      href: 'https://abundanc3alch3my.com/operator-profile/',
      reload() { reloads += 1; },
    },
  };
  window.window = window;

  vm.runInNewContext(source, { document, URL, window });

  return {
    allow,
    choices,
    consent,
    decline,
    documentHandlers,
    insertedScripts,
    readChoice: () => values.get('aa.ad_tracking_consent.v1') || '',
    reloads: () => reloads,
    window,
  };
}

test('a blank dataset ID makes no Meta request and shows no consent prompt', () => {
  const state = runTracking();
  assert.equal(state.insertedScripts.length, 0);
  assert.equal(state.consent.hidden, true);
  assert.equal(state.choices.hidden, true);
});

test('Meta loads only after affirmative consent', () => {
  const state = runTracking({ pixelId: '1234567890' });
  assert.equal(state.consent.hidden, false);
  assert.equal(state.insertedScripts.length, 0);

  state.allow.handlers.click();

  assert.equal(state.readChoice(), 'allowed');
  assert.equal(state.consent.hidden, true);
  assert.equal(state.insertedScripts.length, 1);
  assert.equal(
    state.insertedScripts[0].src,
    'https://connect.facebook.net/en_US/fbevents.js'
  );
  const eventNames = Array.from(state.window.fbq.queue, (call) => call[1]);
  assert.deepEqual(eventNames, ['1234567890', 'PageView', 'ViewContent']);
});

test('an accepted Stripe link click records InitiateCheckout', () => {
  const state = runTracking({ pixelId: '1234567890', storedChoice: 'allowed' });
  const link = { href: 'https://buy.stripe.com/example' };
  state.documentHandlers.click({
    target: {
      closest() { return link; },
    },
  });

  const eventNames = Array.from(state.window.fbq.queue, (call) => call[1]);
  assert.deepEqual(eventNames, [
    '1234567890', 'PageView', 'ViewContent', 'InitiateCheckout',
  ]);
  assert.equal(
    new URL(link.href).searchParams.get('client_reference_id'),
    'aa_11111111222243338444555555555555'
  );
  assert.equal(
    state.window.fbq.queue[3][3].eventID,
    'aa_11111111222243338444555555555555_checkout'
  );
});

test('declining stores the choice without loading Meta', () => {
  const state = runTracking({ pixelId: '1234567890' });
  state.decline.handlers.click();

  assert.equal(state.readChoice(), 'declined');
  assert.equal(state.insertedScripts.length, 0);
  assert.equal(state.reloads(), 0);
});
