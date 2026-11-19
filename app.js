/* Dollgirl88 static app — public view + admin edit via Supabase + local catalog + i18n */
(function () {
  'use strict';

  const cfg = window.DOLLGIRL_CONFIG || {};
  const hasConfig =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !String(cfg.SUPABASE_URL).includes('YOUR_PROJECT') &&
    !String(cfg.SUPABASE_ANON_KEY).includes('YOUR_SUPABASE');

  let supabase = null;
  if (hasConfig && window.supabase) {
    supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }

  const LANG_KEY = 'dollgirl_lang';
  const state = {
    settings: null,
    slides: [],
    girls: [],
    photosByGirl: {},
    session: null,
    editingGirlId: null,
    route: 'home',
    detailId: null,
    lang: localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh',
    useLocalCatalog: true,
    catalogLoaded: false,
  };

  const UI = {
    zh: {
      headerNote: 'Private club · Top-tier girls',
      admin: '管理',
      adminOn: '已登录·管理',
      loading: '加载中…',
      callSms: '来电 / 短信预约',
      callHint: 'Out call service · 最好发短信不会错过',
      loc1Time: '门店 1 时间',
      loc2Time: '门店 2 时间',
      qrHint: '微信扫码联系（不主动打扰）',
      bookNow: '立即预约 →',
      girlsTitle: '今日可约佳丽',
      girlsLead: '点击照片进入详情',
      tel1: '电话1',
      sms: '短信',
      wa: 'WhatsApp',
      tel2: '电话2',
      dial: '拨打',
      back: '← 返回 Dollgirl',
      profile: '个人资料',
      bookCall: '来电预约',
      sendSms: '发短信',
      notFound: '未找到该佳丽',
      edit: '编辑',
      del: '删除',
      loginTitle: '管理员登录',
      loginHint: '使用管理员用户名登录',
      username: '用户名',
      password: '密码',
      login: '登录',
      cancel: '取消',
      logout: '退出登录',
      langBtn: 'EN',
      langAria: 'Switch to English',
    },
    en: {
      headerNote: 'Private club · Top-tier girls',
      admin: 'Admin',
      adminOn: 'Admin · On',
      loading: 'Loading…',
      callSms: 'Call / text to book',
      callHint: 'Outcall service · Text preferred so we never miss you',
      loc1Time: 'Location 1 hours',
      loc2Time: 'Location 2 hours',
      qrHint: 'Scan WeChat QR (we won’t message first)',
      bookNow: 'Book now →',
      girlsTitle: 'Available today',
      girlsLead: 'Tap a photo for details',
      tel1: 'Call 1',
      sms: 'SMS',
      wa: 'WhatsApp',
      tel2: 'Call 2',
      dial: 'Call',
      back: '← Back to Dollgirl',
      profile: 'Profile',
      bookCall: 'Call to book',
      sendSms: 'Text',
      notFound: 'Profile not found',
      edit: 'Edit',
      del: 'Delete',
      loginTitle: 'Admin login',
      loginHint: 'Sign in with admin username',
      username: 'Username',
      password: 'Password',
      login: 'Sign in',
      cancel: 'Cancel',
      logout: 'Sign out',
      langBtn: '中文',
      langAria: '切换到中文',
    },
  };

  const SETTINGS_EN = {
    brand: 'Dollgirl',
    tagline: 'Private club for elite companions · from $100',
    intro:
      'Outcall service — texting is best so we never miss you\nPrivate Japanese travel beauties · Private parking\nAll are top-tier girls\nJapanese beauties fly in from time to time (duo / outcall / overnight / full day)\nRelax, enjoy, release stress\nYour high-end private space\nMultiple Asian beauties daily — come choose in person',
    notice_1: 'Hand-picked · Premium quality · Private entry, high privacy',
    notice_2: 'Japanese beauties fly in often · Duo / outcall / overnight / full day',
    loc1_title: 'Flushing · Saull St club',
    loc1_sub: 'Behind Changfa Market · New club, 3rd floor',
    loc1_hours: '11:00AM – 03:00AM',
    loc1_address: 'Flushing Franklin & Saull St (behind Changfa Market, Saull St 3F)',
    loc1_note: 'Outcall · Text preferred · Private parking',
    loc2_title: 'Flushing · Lucky store',
    loc2_sub: 'Open 24 hours',
    loc2_hours: 'Open 24 hours',
    loc2_address: 'Flushing · one block behind Lucky supermarket',
    loc2_note: 'All-day bookings · Call or text for details',
    cta_title: 'Booking starts with one text',
    cta_text: 'We don’t message first. If WeChat is quiet, please call or text directly.',
    footer: 'Dollgirl · All Rights Reserved',
  };

  const DEFAULT_SETTINGS = {
    brand: 'Dollgirl',
    tagline: '精心打造美女私家会所 100起步',
    intro:
      'Out call service — 最好发短信不会错过\n私家提供日本旅游美女。私家车位 方便停车\nAll are top-tier girls\n不定时有日本美女直飞到店（双飞）（外送）（包夜）（包天）满足您的一切需求！陪嗨需询问妹子是否愿意\n放松心情 享受快乐 释放压力\n您的高档私人定制空间\n每天多位亚洲美女等您亲临现场挑选',
    notice_1: '精挑细选 · 高端品质 · 独立出入，隐私度极高',
    notice_2: '不定时日本美女直飞到店 · 双飞 / 外送 / 包夜 / 包天',
    primary_phone: '(718) 223-7425',
    loc1_title: '法拉盛 · Saull St 会所',
    loc1_sub: '昌发超市背后 · 全新会所 3楼',
    loc1_phone: '(718) 223-7425',
    loc1_hours: '11:00AM – 03:00AM',
    loc1_address: '法拉盛 Franklin and Saull St（昌发超市背后 Saull ST 3楼）',
    loc1_note: 'Out call service · 最好发短信不会错过 · 私家车位方便停车',
    loc2_title: '法拉盛 · 好运来店',
    loc2_sub: '24小时营业',
    loc2_phone: '(518) 889-0999',
    loc2_hours: '24小时营业',
    loc2_address: '法拉盛 · 好运来超市后面一条街',
    loc2_note: '全天承接 · 详情请来电 / 短信',
    cta_title: '预约从一条短信开始',
    cta_text: '平时不主动发信息。微信若无回复，请直接电话或短信。',
    footer: 'Dollgirl · All Rights Reserved',
    qr_path: '',
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function t(key) {
    const pack = UI[state.lang] || UI.zh;
    return pack[key] || UI.zh[key] || key;
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add('hidden'), 2200);
  }

  function phoneRaw(v) {
    return String(v || '').replace(/\D+/g, '');
  }

  function publicUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) {
      try {
        const u = new URL(path);
        if (/dollgirl88\.com$/i.test(u.hostname) && /\/wp-content\/uploads\//i.test(u.pathname)) {
          const file = u.pathname.split('/').pop();
          if (/^hero-slide-/i.test(file)) return './images/hero/' + file;
          if (/wechat-qr/i.test(file)) return './images/qr/wechat-qr.jpg';
        }
      } catch (e) {}
      return path;
    }
    if (
      path.startsWith('images/') ||
      path.startsWith('./images/') ||
      path.startsWith('assets/') ||
      path.startsWith('./assets/')
    ) {
      return path.startsWith('./') ? path : './' + path.replace(/^\/+/, '');
    }
    if (!supabase) return './' + String(path).replace(/^\/+/, '');
    const { data } = supabase.storage.from('site-media').getPublicUrl(path);
    return (data && data.publicUrl) || path;
  }

  function isAdmin() {
    return !!(state.session && state.session.user);
  }

  function setAdminUI() {
    document.body.classList.toggle('is-admin', isAdmin());
    $$('.admin-only').forEach((el) => el.classList.toggle('hidden', !isAdmin()));
    const btn = $('#btn-admin-open');
    if (btn) btn.textContent = isAdmin() ? t('adminOn') : t('admin');
    $('#btn-logout')?.classList.toggle('hidden', !isAdmin());
  }

  function applyLangChrome() {
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-Hans';
    document.body.dataset.lang = state.lang;
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    const langBtn = $('#btn-lang');
    if (langBtn) {
      langBtn.textContent = t('langBtn');
      langBtn.setAttribute('aria-label', t('langAria'));
    }
    setAdminUI();
  }

  function displaySettings() {
    const base = { ...DEFAULT_SETTINGS, ...(state.settings || {}) };
    if (state.lang !== 'en') return base;
    const out = { ...base };
    Object.keys(SETTINGS_EN).forEach((k) => {
      out[k] = SETTINGS_EN[k];
    });
    // keep phones/qr as-is
    out.primary_phone = base.primary_phone;
    out.loc1_phone = base.loc1_phone;
    out.loc2_phone = base.loc2_phone;
    out.qr_path = base.qr_path;
    out.footer = SETTINGS_EN.footer || base.footer;
    return out;
  }

  function localizeGirl(g) {
    if (!g) return g;
    const pack = (state.lang === 'en' ? g.en : g.zh) || g.zh || g.en || {};
    const tags =
      Array.isArray(pack.tags) && pack.tags.length
        ? pack.tags
        : Array.isArray(g.tags) && g.tags.length
          ? g.tags
          : [g.origin, g.age, g.height, g.badge].filter(Boolean);
    return {
      ...g,
      banner: pack.banner != null ? pack.banner : g.banner,
      excerpt: pack.excerpt != null ? pack.excerpt : g.excerpt,
      content: pack.content != null ? pack.content : g.content,
      tags,
      origin: tags[0] || g.origin || '',
      age: tags[1] || g.age || '',
      height: tags[2] || g.height || '',
      badge: tags[3] || g.badge || '',
    };
  }

  function mapCatalogGirl(raw) {
    const zh = raw.zh || {};
    const photos = (raw.photos || []).map((p, i) => ({
      id: raw.slug + '-p' + i,
      girl_id: raw.id || raw.slug,
      image_path: p,
      sort_order: i + 1,
    }));
    return {
      id: raw.id || raw.slug,
      slug: raw.slug,
      name: raw.name,
      sort_order: raw.sort_order || 0,
      published: raw.published !== false,
      cover_path: raw.cover || (raw.photos && raw.photos[0]) || '',
      price_1: raw.price_1 || '',
      price_2: raw.price_2 || '',
      price_3: raw.price_3 || '',
      phone: raw.phone || '',
      zh,
      en: raw.en || {},
      tags: zh.tags || [],
      banner: zh.banner || '',
      excerpt: zh.excerpt || '',
      content: zh.content || '',
      origin: (zh.tags && zh.tags[0]) || '',
      age: (zh.tags && zh.tags[1]) || '',
      height: (zh.tags && zh.tags[2]) || '',
      badge: (zh.tags && zh.tags[3]) || '',
      _local: true,
      _photos: photos,
    };
  }

  async function loadLocalCatalog() {
    try {
      const res = await fetch('./girls-catalog.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('catalog ' + res.status);
      const data = await res.json();
      const list = (data.girls || []).map(mapCatalogGirl).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      state.catalogLoaded = true;
      return list;
    } catch (e) {
      console.warn('local catalog failed', e);
      state.catalogLoaded = false;
      return null;
    }
  }

  /* -------------------- data load -------------------- */
  async function loadAll() {
    const localGirls = state.useLocalCatalog ? await loadLocalCatalog() : null;

    if (!supabase) {
      state.settings = { ...DEFAULT_SETTINGS };
      state.slides = [];
      state.photosByGirl = {};
      if (localGirls && localGirls.length) {
        state.girls = localGirls;
        localGirls.forEach((g) => {
          state.photosByGirl[g.id] = g._photos || [];
        });
      } else {
        state.girls = [];
      }
      return;
    }

    const [settingsRes, slidesRes, girlsRes] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('hero_slides').select('*').eq('active', true).order('sort_order'),
      supabase.from('girls').select('*').eq('published', true).order('sort_order').order('id', { ascending: false }),
    ]);

    if (settingsRes.error) {
      console.warn(settingsRes.error);
      if (/Invalid API key|JWT|Unauthorized/i.test(settingsRes.error.message || '')) {
        toast(
          state.lang === 'en'
            ? 'Invalid Supabase key — check Legacy anon key'
            : 'Supabase Key 无效：请到后台复制 Legacy anon (eyJ...) 或完整 publishable key'
        );
      }
    }
    if (slidesRes.error) console.warn(slidesRes.error);
    if (girlsRes.error) console.warn(girlsRes.error);

    state.settings = { ...DEFAULT_SETTINGS, ...(settingsRes.data || {}) };
    state.slides = slidesRes.data || [];

    // Keep existing Supabase girls, then ADD local catalog entries.
    // Same slug/name → local catalog wins (new photos/copy from client).
    const remoteGirls = girlsRes.data || [];
    state.photosByGirl = {};
    const remoteIds = remoteGirls.map((g) => g.id);
    if (remoteIds.length) {
      const { data: photos, error } = await supabase
        .from('girl_photos')
        .select('*')
        .in('girl_id', remoteIds)
        .order('sort_order');
      if (error) console.warn(error);
      (photos || []).forEach((p) => {
        if (!state.photosByGirl[p.girl_id]) state.photosByGirl[p.girl_id] = [];
        state.photosByGirl[p.girl_id].push(p);
      });
    }

    if (localGirls && localGirls.length) {
      // Keep all remote girls; add local ones. Same name OR slug → local wins (client photos).
      const merged = remoteGirls.slice();
      const norm = (v) => String(v || '').trim().toLowerCase();
      localGirls.forEach((lg) => {
        state.photosByGirl[lg.id] = lg._photos || [];
        const idx = merged.findIndex((g) => {
          const sameSlug = norm(g.slug) && norm(g.slug) === norm(lg.slug);
          const sameName = norm(g.name) && norm(g.name) === norm(lg.name);
          // treat emily-xxxx / jenna-xxxx as same base name
          const base = (s) => norm(s).replace(/-[a-z0-9]{3,}$/i, '');
          const sameBase = norm(lg.slug) && base(g.slug) === norm(lg.slug);
          return sameSlug || sameName || sameBase;
        });
        if (idx >= 0) {
          // drop old remote photos for replaced id to avoid stale gallery
          const old = merged[idx];
          if (old && old.id != null) delete state.photosByGirl[old.id];
          merged[idx] = lg;
        } else {
          merged.push(lg);
        }
      });
      state.girls = merged.sort((a, b) => {
        const sa = a.sort_order != null ? a.sort_order : 999;
        const sb = b.sort_order != null ? b.sort_order : 999;
        if (sa !== sb) return sa - sb;
        return String(a.name || '').localeCompare(String(b.name || ''));
      });
    } else {
      state.girls = remoteGirls;
    }
  }

  /* -------------------- render -------------------- */
  function bindSettings() {
    const s = displaySettings();
    $$('[data-bind]').forEach((el) => {
      const key = el.getAttribute('data-bind');
      if (key && s[key] != null) el.textContent = s[key];
    });

    const raw = phoneRaw(s.primary_phone);
    const t1 = phoneRaw(s.loc1_phone || state.settings?.loc1_phone || s.primary_phone);
    const t2 = phoneRaw(s.loc2_phone || state.settings?.loc2_phone || '');
    const primaryTel = $('#primary-tel');
    if (primaryTel) primaryTel.href = 'tel:' + raw;
    $$('.loc1-call').forEach((a) => (a.href = 'tel:' + t1));
    $$('.loc2-call').forEach((a) => (a.href = 'tel:' + t2));
    $$('.cta-call').forEach((a) => {
      a.href = 'tel:' + raw;
      a.textContent = t('dial') + ' ' + (s.primary_phone || state.settings?.primary_phone || '');
    });

    const intro = $('#intro-lines');
    if (intro) {
      intro.innerHTML = '';
      String(s.intro || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => {
          const p = document.createElement('p');
          p.textContent = line;
          if (isAdmin()) p.setAttribute('data-edit-intro-line', '1');
          intro.appendChild(p);
        });
    }

    $('#club-apps').innerHTML = [
      ['tel:' + t1, '☎', t('tel1')],
      ['sms:' + t1, '✉', t('sms')],
      ['https://wa.me/1' + t1, 'W', t('wa')],
      ['tel:' + t2, '☎', t('tel2')],
    ]
      .map(
        ([href, ico, label]) =>
          `<a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><span class="ico">${ico}</span>${label}</a>`
      )
      .join('');

    const qrWrap = $('#qr-wrap');
    const qrImg = $('#qr-img');
    const qrPath = state.settings?.qr_path || s.qr_path;
    if (qrPath) {
      qrImg.src = publicUrl(qrPath);
      qrWrap.classList.remove('hidden');
    } else {
      qrWrap.classList.add('hidden');
    }

    document.title = `${s.brand} – ${s.tagline}`;
  }

  function renderHero() {
    const track = $('#hero-track');
    const dots = $('#hero-dots');
    track.innerHTML = '';
    dots.innerHTML = '';
    // reset carousel init flag so new slides rebind
    const carousel = track.closest('[data-carousel]');
    if (carousel) carousel._inited = false;

    const slides = state.slides.length > 0 ? state.slides : [{ image_path: '', id: 'placeholder' }];

    slides.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'club-carousel__slide' + (i === 0 ? ' is-active' : '');
      const src = s.image_path ? publicUrl(s.image_path) : '';
      div.innerHTML = src
        ? `<img src="${src}" alt="slide ${i + 1}" />`
        : `<div style="height:100%;background:linear-gradient(135deg,#1a3d2a,#2e8b57);display:grid;place-items:center;color:#fff;font-size:24px;">Dollgirl</div>`;
      track.appendChild(div);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'club-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('data-carousel-dot', String(i));
      dots.appendChild(dot);
    });
    initCarousels();
  }

  function renderGirls() {
    const grid = $('#girl-grid');
    grid.innerHTML = '';
    (state.girls || []).forEach((raw) => {
      const g = localizeGirl(raw);
      const prices = [g.price_1, g.price_2, g.price_3].filter((p) => p && String(p).trim());
      const tags = Array.isArray(g.tags) && g.tags.length ? g.tags : [g.origin, g.age, g.height, g.badge].filter(Boolean);
      const cover = g.cover_path ? publicUrl(g.cover_path) : '';
      const art = document.createElement('article');
      art.className = 'girl-card';
      const tagHtml = tags
        .map((tg, i) => {
          const cls = i === 0 ? 'girl-tag--area' : i === 1 ? 'girl-tag--age' : 'girl-tag--height';
          return '<span class="girl-tag ' + cls + '">' + escapeHtml(tg) + '</span>';
        })
        .join('');
      const priceHtml = prices.length
        ? '<div class="girl-prices">' + prices.map((p) => '<span class="girl-price">' + escapeHtml(p) + '</span>').join('') + '</div>'
        : '';
      const adminBar =
        isAdmin() && !raw._local
          ? '<div class="card-admin-bar admin-only">' +
            '<button type="button" class="admin-btn" data-edit-girl="' +
            g.id +
            '">' +
            t('edit') +
            '</button>' +
            '<button type="button" class="admin-btn danger" data-del-girl="' +
            g.id +
            '">' +
            t('del') +
            '</button>' +
            '</div>'
          : '';
      art.innerHTML =
        (g.banner ? '<div class="girl-card__banner">' + escapeHtml(g.banner) + '</div>' : '') +
        '<a class="girl-card__link" href="#/girl/' +
        g.id +
        '">' +
        '<div class="girl-card__media">' +
        (cover
          ? '<img src="' + cover + '" alt="' + escapeHtml(g.name) + '" loading="lazy" />'
          : '<div style="position:absolute;inset:0;background:#d9eae1;display:grid;place-items:center;color:#2e8b57;">' +
            escapeHtml(g.name || '') +
            '</div>') +
        '<div class="girl-tags">' +
        tagHtml +
        '</div></div>' +
        '<div class="girl-card__info">' +
        '<h3 class="girl-card__name">' +
        escapeHtml(g.name || '') +
        '</h3>' +
        (g.excerpt ? '<p class="girl-card__desc">' + escapeHtml(g.excerpt) + '</p>' : '') +
        priceHtml +
        '</div></a>' +
        adminBar;
      grid.appendChild(art);
    });

    $$('[data-edit-girl]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGirlModal(btn.getAttribute('data-edit-girl'));
      });
    });
    $$('[data-del-girl]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-del-girl');
        const g = state.girls.find((x) => String(x.id) === String(id));
        if (!g) return;
        if (!confirm((state.lang === 'en' ? 'Delete ' : '确定删除「') + g.name + (state.lang === 'en' ? '?' : '」？此操作不可恢复。'))) return;
        try {
          const { error } = await supabase.from('girls').delete().eq('id', id);
          if (error) throw error;
          toast((state.lang === 'en' ? 'Deleted ' : '已删除 ') + g.name);
          if (String(state.detailId) === String(id)) location.hash = '#/';
          await loadAll();
          renderAll();
        } catch (err) {
          toast(err.message || 'Delete failed');
        }
      });
    });
  }

  function renderDetail(id) {
    const raw = state.girls.find((x) => String(x.id) === String(id) || String(x.slug) === String(id));
    const root = $('#detail-root');
    if (!raw) {
      root.innerHTML = '<p style="padding:24px;text-align:center;">' + escapeHtml(t('notFound')) + '</p>';
      return;
    }
    const g = localizeGirl(raw);
    const photos = state.photosByGirl[raw.id] || raw._photos || [];
    const list = photos.length
      ? photos.map((p) => publicUrl(p.image_path))
      : g.cover_path
        ? [publicUrl(g.cover_path)]
        : [];
    const main = list[0] || '';
    const prices = [g.price_1, g.price_2, g.price_3].filter((p) => p && String(p).trim());
    const tags = Array.isArray(g.tags) && g.tags.length ? g.tags : [g.origin, g.age, g.height, g.badge].filter(Boolean);
    const phone = g.phone || state.settings?.primary_phone || '';
    const rawPhone = phoneRaw(phone);
    const contentHtml = escapeHtml(g.content || g.excerpt || '').replace(/\n/g, '<br />');

    root.innerHTML = `
      <div class="girl-detail__nav">
        <a href="#/">${escapeHtml(t('back'))}</a>
        ${g.banner ? `<span class="girl-detail__banner-inline">${escapeHtml(g.banner)}</span>` : ''}
      </div>
      <div class="girl-detail__gallery" data-girl-gallery>
        <div class="girl-detail__photo">
          ${main ? `<img data-gallery-main src="${main}" alt="${escapeHtml(g.name)}" />` : ''}
        </div>
        ${
          list.length > 1
            ? `<div class="girl-detail__thumbs">${list
                .map(
                  (src, i) =>
                    `<img data-gallery-thumb data-full="${src}" src="${src}" alt="" class="${i === 0 ? 'is-active' : ''}" />`
                )
                .join('')}</div>`
            : ''
        }
      </div>
      <div class="girl-detail__meta-card">
        <h1>${escapeHtml(g.name || '')}</h1>
        <div class="girl-detail__chips">
          ${tags
            .map(
              (tg, i) =>
                `<span class="chip ${i % 3 === 0 ? 'chip--area' : i % 3 === 1 ? 'chip--age' : 'chip--height'}">${escapeHtml(tg)}</span>`
            )
            .join('')}
        </div>
        ${g.excerpt ? `<p class="girl-detail__lead">${escapeHtml(g.excerpt)}</p>` : ''}
        ${
          prices.length
            ? `<div class="girl-detail__prices">${prices
                .map((p) => `<div class="girl-detail__price-row">${escapeHtml(p)}</div>`)
                .join('')}</div>`
            : ''
        }
      </div>
      <div class="girl-detail__profile">
        <div class="girl-detail__profile-head"><span class="btn-pill">${escapeHtml(t('profile'))}</span></div>
        <div class="girl-detail__body"><p>${contentHtml}</p></div>
      </div>
      <div class="girl-detail__book">
        <a class="book-btn" href="tel:${rawPhone}">${escapeHtml(phone)} ${escapeHtml(t('bookCall'))}</a>
        <a class="book-btn book-btn--ghost" href="sms:${rawPhone}">${escapeHtml(t('sendSms'))}</a>
        <a class="book-btn book-btn--ghost" target="_blank" rel="noopener" href="https://wa.me/1${rawPhone}">WhatsApp</a>
      </div>
      ${
        isAdmin() && !raw._local
          ? `<div class="detail-admin-bar"><button type="button" class="admin-btn" id="btn-edit-this-girl">${escapeHtml(t('edit'))}</button></div>`
          : ''
      }
    `;
    initGalleries();
    const editBtn = $('#btn-edit-this-girl');
    if (editBtn) editBtn.addEventListener('click', () => openGirlModal(raw.id));
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAll() {
    $('#loading').classList.add('hidden');
    applyLangChrome();
    bindSettings();
    renderHero();
    renderGirls();
    setAdminUI();
    setupInlineEdit();
    if (state.route === 'detail' && state.detailId) {
      showView('detail');
      renderDetail(state.detailId);
    } else {
      showView('home');
    }
  }

  function showView(name) {
    $('#view-home').classList.toggle('hidden', name !== 'home');
    $('#view-detail').classList.toggle('hidden', name !== 'detail');
  }

  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem(LANG_KEY, state.lang);
    renderAll();
  }

  /* -------------------- carousel / gallery -------------------- */
  function initCarousels() {
    $$('[data-carousel]').forEach((root) => {
      if (root._inited) return;
      root._inited = true;
      const slides = $$('.club-carousel__slide', root);
      if (!slides.length) return;
      const dots = $$('[data-carousel-dot]', root);
      const prev = $('[data-carousel-prev]', root);
      const next = $('[data-carousel-next]', root);
      const interval = parseInt(root.getAttribute('data-interval') || '4000', 10);
      let index = 0;
      let timer = null;
      let touching = false;
      let startX = 0;
      const go = (i) => {
        index = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
        dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
      };
      const start = () => {
        stop();
        if (slides.length < 2) return;
        timer = setInterval(() => go(index + 1), interval);
      };
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };
      if (prev) prev.addEventListener('click', () => { go(index - 1); start(); });
      if (next) next.addEventListener('click', () => { go(index + 1); start(); });
      dots.forEach((d) =>
        d.addEventListener('click', () => {
          go(parseInt(d.getAttribute('data-carousel-dot'), 10) || 0);
          start();
        })
      );
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener(
        'touchstart',
        (e) => {
          touching = true;
          stop();
          startX = e.changedTouches[0].clientX;
        },
        { passive: true }
      );
      root.addEventListener(
        'touchend',
        (e) => {
          if (!touching) return;
          touching = false;
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          start();
        },
        { passive: true }
      );
      go(0);
      start();
    });
  }

  function initGalleries() {
    $$('[data-girl-gallery]').forEach((root) => {
      const main = $('[data-gallery-main]', root);
      const thumbs = $$('[data-gallery-thumb]', root);
      if (!main || !thumbs.length) return;
      thumbs.forEach((tmb) => {
        tmb.addEventListener('click', () => {
          const src = tmb.getAttribute('data-full') || tmb.getAttribute('src');
          if (src) main.setAttribute('src', src);
          thumbs.forEach((x) => x.classList.toggle('is-active', x === tmb));
        });
      });
    });
  }

  /* -------------------- admin inline edit -------------------- */
  function setupInlineEdit() {
    if (!isAdmin()) return;
    $$('[data-edit]').forEach((el) => {
      if (el._editBound) return;
      el._editBound = true;
      el.contentEditable = 'true';
      el.addEventListener('blur', async () => {
        const key = el.getAttribute('data-edit');
        const val = el.textContent.trim();
        if (!key || !supabase) return;
        if ((state.settings[key] || '') === val) return;
        state.settings[key] = val;
        const { error } = await supabase.from('site_settings').upsert({ id: 1, [key]: val, updated_at: new Date().toISOString() });
        if (error) toast('Save failed: ' + error.message);
        else toast(state.lang === 'en' ? 'Saved' : '已保存');
        bindSettings();
      });
    });
  }

  /* -------------------- auth -------------------- */
  function openLogin() {
    $('#modal-login').classList.remove('hidden');
    $('#login-error').textContent = '';
    if (isAdmin()) $('#btn-logout').classList.remove('hidden');
  }
  function closeLogin() {
    $('#modal-login').classList.add('hidden');
  }

  async function login() {
    if (!supabase) {
      $('#login-error').textContent =
        state.lang === 'en' ? 'Configure Supabase URL / anon key in config.js first' : '请先配置 config.js 中的 Supabase URL / anon key';
      return;
    }
    const username = $('#login-email').value.trim().toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(username)) {
      $('#login-error').textContent =
        state.lang === 'en' ? 'Username: letters, numbers, . _ - only' : '用户名只能包含字母、数字、点、下划线和连字符';
      return;
    }
    if (username !== 'yuank7887') {
      $('#login-error').textContent = state.lang === 'en' ? 'Wrong username or password' : '用户名或密码不正确';
      return;
    }
    const email = 'yuank7887@gmail.com';
    const password = $('#login-password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      $('#login-error').textContent = error.message;
      return;
    }
    state.session = data.session;
    setAdminUI();
    closeLogin();
    toast(state.lang === 'en' ? 'Signed in' : '登录成功');
    await loadAll();
    renderAll();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    state.session = null;
    setAdminUI();
    closeLogin();
    toast(state.lang === 'en' ? 'Signed out' : '已退出');
    renderAll();
  }

  /* -------------------- uploads -------------------- */
  async function uploadFile(file, folder) {
    if (!supabase) throw new Error('Supabase not configured');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('site-media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (error) throw error;
    return path;
  }

  /* -------------------- girl modal -------------------- */
  function openGirlModal(id) {
    if (!isAdmin()) return openLogin();
    state.editingGirlId = id || null;
    const g = id ? state.girls.find((x) => String(x.id) === String(id)) : null;
    if (g && g._local) {
      toast(state.lang === 'en' ? 'Local catalog girl — edit girls-catalog.json' : '本地目录佳丽，请改 girls-catalog.json');
      return;
    }
    $('#girl-modal-title').textContent = g ? (state.lang === 'en' ? 'Edit profile' : '编辑佳丽') : state.lang === 'en' ? 'Add profile' : '新增佳丽';
    $('#g-name').value = g?.name || '';
    const tagList = Array.isArray(g?.tags) && g.tags.length ? g.tags : [g?.origin, g?.age, g?.height, g?.badge].filter(Boolean);
    if ($('#g-tags')) $('#g-tags').value = tagList.join(', ');
    $('#g-banner').value = g?.banner || '';
    $('#g-price1').value = g?.price_1 || '';
    $('#g-price2').value = g?.price_2 || '';
    $('#g-price3').value = g?.price_3 || '';
    $('#g-phone').value = g?.phone || '';
    $('#g-excerpt').value = g?.excerpt || '';
    $('#g-content').value = g?.content || '';
    $('#g-published').checked = g ? !!g.published : true;
    $('#g-cover').value = '';
    $('#g-photos').value = '';
    $('#g-cover-preview').src = g?.cover_path ? publicUrl(g.cover_path) : '';
    $('#g-photos-preview').innerHTML = '';
    (state.photosByGirl[g?.id] || []).forEach((p) => {
      const img = document.createElement('img');
      img.src = publicUrl(p.image_path);
      $('#g-photos-preview').appendChild(img);
    });
    $('#girl-error').textContent = '';
    $('#btn-girl-delete').classList.toggle('hidden', !g);
    $('#modal-girl').classList.remove('hidden');
  }

  function closeGirlModal() {
    $('#modal-girl').classList.add('hidden');
    state.editingGirlId = null;
  }

  function slugify(name) {
    const base = String(name || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9一-鿿-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return base || 'girl-' + Date.now().toString(36);
  }

  async function saveGirl() {
    if (!supabase) return;
    if (saveGirl._busy) return;
    saveGirl._busy = true;
    const saveBtn = $('#btn-girl-save');
    if (saveBtn) saveBtn.disabled = true;
    $('#girl-error').textContent = '';

    const tags = (($('#g-tags') && $('#g-tags').value) || '')
      .split(/[,，、]/)
      .map((x) => x.trim())
      .filter(Boolean);
    const mainDesc = $('#g-excerpt').value.trim();
    const payload = {
      name: $('#g-name').value.trim(),
      tags,
      origin: tags[0] || '',
      age: tags[1] || '',
      height: tags[2] || '',
      badge: tags[3] || '',
      banner: $('#g-banner').value.trim(),
      price_1: $('#g-price1').value.trim(),
      price_2: $('#g-price2').value.trim(),
      price_3: $('#g-price3').value.trim(),
      phone: $('#g-phone').value.trim(),
      excerpt: mainDesc,
      content: mainDesc,
      published: $('#g-published').checked,
      updated_at: new Date().toISOString(),
    };
    if (!payload.name) {
      $('#girl-error').textContent = state.lang === 'en' ? 'Name required' : '请填写名字';
      saveGirl._busy = false;
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    try {
      const coverFile = $('#g-cover').files?.[0];
      if (coverFile) payload.cover_path = await uploadFile(coverFile, 'girls');

      let girlId = state.editingGirlId;
      if (girlId) {
        const { error } = await supabase.from('girls').update(payload).eq('id', girlId);
        if (error) throw error;
      } else {
        payload.slug = slugify(payload.name) + '-' + Date.now().toString(36).slice(-4);
        const { data, error } = await supabase.from('girls').insert(payload).select('*').single();
        if (error) throw error;
        girlId = data.id;
      }

      const photoFiles = [...($('#g-photos').files || [])];
      for (let i = 0; i < photoFiles.length; i++) {
        const path = await uploadFile(photoFiles[i], 'girls');
        const { error } = await supabase.from('girl_photos').insert({
          girl_id: girlId,
          image_path: path,
          sort_order: i,
        });
        if (error) throw error;
      }

      toast(state.lang === 'en' ? 'Saved' : '佳丽已保存');
      closeGirlModal();
      await loadAll();
      renderAll();
    } catch (err) {
      $('#girl-error').textContent = err.message || String(err);
    } finally {
      saveGirl._busy = false;
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  async function deleteGirl() {
    if (!supabase || !state.editingGirlId) return;
    if (!confirm(state.lang === 'en' ? 'Delete this profile?' : '确定删除这位佳丽？')) return;
    const { error } = await supabase.from('girls').delete().eq('id', state.editingGirlId);
    if (error) {
      $('#girl-error').textContent = error.message;
      return;
    }
    toast(state.lang === 'en' ? 'Deleted' : '已删除');
    closeGirlModal();
    location.hash = '#/';
    await loadAll();
    renderAll();
  }

  /* -------------------- hero / qr upload -------------------- */
  async function onHeroUpload(files) {
    if (!supabase || !files?.length) return;
    try {
      for (let i = 0; i < files.length; i++) {
        const path = await uploadFile(files[i], 'hero');
        const { error } = await supabase.from('hero_slides').insert({
          image_path: path,
          sort_order: (state.slides?.length || 0) + i,
          active: true,
        });
        if (error) throw error;
      }
      toast(state.lang === 'en' ? 'Slides uploaded' : '轮播图已上传');
      await loadAll();
      renderAll();
    } catch (e) {
      toast(e.message || 'Upload failed');
    }
  }

  async function onQrUpload(file) {
    if (!supabase || !file) return;
    try {
      const path = await uploadFile(file, 'qr');
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, qr_path: path, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast(state.lang === 'en' ? 'QR updated' : '二维码已更新');
      await loadAll();
      renderAll();
    } catch (e) {
      toast(e.message || 'Upload failed');
    }
  }

  /* -------------------- router -------------------- */
  function handleRoute() {
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/girl\/([^/]+)/);
    if (m) {
      state.route = 'detail';
      state.detailId = decodeURIComponent(m[1]);
    } else {
      state.route = 'home';
      state.detailId = null;
    }
    renderAll();
  }

  /* -------------------- boot -------------------- */
  async function boot() {
    $('#btn-admin-open').addEventListener('click', openLogin);
    $('#btn-login-cancel').addEventListener('click', closeLogin);
    $('#btn-login').addEventListener('click', login);
    $('#btn-logout').addEventListener('click', logout);
    $('#btn-lang')?.addEventListener('click', toggleLang);
    $('#btn-add-girl')?.addEventListener('click', () => openGirlModal(null));
    $('#btn-girl-save').addEventListener('click', saveGirl);
    $('#btn-girl-cancel').addEventListener('click', closeGirlModal);
    $('#btn-girl-delete').addEventListener('click', deleteGirl);
    $('#hero-upload')?.addEventListener('change', (e) => onHeroUpload(e.target.files));
    $('#qr-upload')?.addEventListener('change', (e) => onQrUpload(e.target.files?.[0]));
    window.addEventListener('hashchange', handleRoute);

    applyLangChrome();

    if (!hasConfig) {
      toast(state.lang === 'en' ? 'Supabase not configured — showing local catalog' : '未配置 Supabase：当前显示本地目录');
    } else if (supabase) {
      const { data } = await supabase.auth.getSession();
      state.session = data.session;
      supabase.auth.onAuthStateChange((_e, session) => {
        state.session = session;
        setAdminUI();
      });
    }

    try {
      await loadAll();
    } catch (e) {
      console.error(e);
      state.settings = { ...DEFAULT_SETTINGS };
      toast(state.lang === 'en' ? 'Load failed — using defaults' : '数据加载失败，已使用默认文案');
    }
    handleRoute();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
