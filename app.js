/* Dollgirl88 static app — public view + admin edit via Supabase */
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

  const state = {
    settings: null,
    slides: [],
    girls: [],
    photosByGirl: {},
    session: null,
    editingGirlId: null,
    route: 'home',
    detailId: null,
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
    $('#btn-admin-open').textContent = isAdmin() ? '已登录·管理' : '管理';
    $('#btn-logout').classList.toggle('hidden', !isAdmin());
  }

  /* -------------------- data load -------------------- */
  async function loadAll() {
    if (!supabase) {
      state.settings = { ...DEFAULT_SETTINGS };
      state.slides = [];
      state.girls = [
        {
          id: 'demo-mika',
          name: 'Mika',
          origin: '日本',
          age: '22岁',
          height: '165cm',
          badge: '推荐',
          banner: '推荐 · 日系高颜值',
          excerpt:
            '日系清冷颜值，165cm 比例优越。五官精致、气质干净，镜头前后都耐看。服务走心，适合喜欢温柔氛围的你。',
          content: '日系清冷颜值，165cm 比例优越。五官精致、气质干净。推荐位佳丽，服务走心。',
          price_1: '',
          price_2: '',
          price_3: '',
          phone: '',
          cover_path: '',
          published: true,
        },
      ];
      state.photosByGirl = {};
      return;
    }

    const [settingsRes, slidesRes, girlsRes] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('hero_slides').select('*').eq('active', true).order('sort_order'),
      supabase.from('girls').select('*').eq('published', true).order('sort_order').order('id', { ascending: false }),
    ]);

    if (settingsRes.error) {
      console.warn(settingsRes.error);
      if (/Invalid API key|JWT|Unauthorized/i.test(settingsRes.error.message||'')) {
        toast('Supabase Key 无效：请到后台复制 Legacy anon (eyJ...) 或完整 publishable key');
      }
    }
    if (slidesRes.error) console.warn(slidesRes.error);
    if (girlsRes.error) console.warn(girlsRes.error);

    state.settings = { ...DEFAULT_SETTINGS, ...(settingsRes.data || {}) };
    state.slides = slidesRes.data || [];
    state.girls = girlsRes.data || [];

    const ids = state.girls.map((g) => g.id);
    state.photosByGirl = {};
    if (ids.length) {
      const { data: photos, error } = await supabase
        .from('girl_photos')
        .select('*')
        .in('girl_id', ids)
        .order('sort_order');
      if (error) console.warn(error);
      (photos || []).forEach((p) => {
        if (!state.photosByGirl[p.girl_id]) state.photosByGirl[p.girl_id] = [];
        state.photosByGirl[p.girl_id].push(p);
      });
    }
  }

  /* -------------------- render -------------------- */
  function bindSettings() {
    const s = state.settings || DEFAULT_SETTINGS;
    $$('[data-bind]').forEach((el) => {
      const key = el.getAttribute('data-bind');
      if (key && s[key] != null) el.textContent = s[key];
    });

    const raw = phoneRaw(s.primary_phone);
    const t1 = phoneRaw(s.loc1_phone);
    const t2 = phoneRaw(s.loc2_phone);
    const primaryTel = $('#primary-tel');
    if (primaryTel) primaryTel.href = 'tel:' + raw;
    $$('.loc1-call').forEach((a) => (a.href = 'tel:' + t1));
    $$('.loc2-call').forEach((a) => (a.href = 'tel:' + t2));
    $$('.cta-call').forEach((a) => {
      a.href = 'tel:' + raw;
      a.textContent = '拨打 ' + (s.primary_phone || '');
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
          if (isAdmin()) {
            p.setAttribute('data-edit-intro-line', '1');
          }
          intro.appendChild(p);
        });
    }

    $('#club-apps').innerHTML = [
      ['tel:' + t1, '☎', '电话1'],
      ['sms:' + t1, '✉', '短信'],
      ['https://wa.me/1' + t1, 'W', 'WhatsApp'],
      ['tel:' + t2, '☎', '电话2'],
    ]
      .map(
        ([href, ico, label]) =>
          `<a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><span class="ico">${ico}</span>${label}</a>`
      )
      .join('');

    const qrWrap = $('#qr-wrap');
    const qrImg = $('#qr-img');
    if (s.qr_path) {
      qrImg.src = publicUrl(s.qr_path);
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
    const slides =
      state.slides.length > 0
        ? state.slides
        : [{ image_path: '', id: 'placeholder' }];

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
    (state.girls || []).forEach((g) => {
      const prices = [g.price_1, g.price_2, g.price_3].filter((p) => p && String(p).trim());
      const tags = Array.isArray(g.tags) && g.tags.length
        ? g.tags
        : [g.origin, g.age, g.height, g.badge].filter(Boolean);
      const cover = g.cover_path ? publicUrl(g.cover_path) : '';
      const art = document.createElement('article');
      art.className = 'girl-card';
      const tagHtml = tags.map((t, i) => {
        const cls = i === 0 ? 'girl-tag--area' : i === 1 ? 'girl-tag--age' : 'girl-tag--height';
        return '<span class="girl-tag ' + cls + '">' + escapeHtml(t) + '</span>';
      }).join('');
      const priceHtml = prices.length
        ? '<div class="girl-prices">' + prices.map((p) => '<span class="girl-price">' + escapeHtml(p) + '</span>').join('') + '</div>'
        : '';
      const adminBar = isAdmin()
        ? '<div class="card-admin-bar admin-only">' +
          '<button type="button" class="admin-btn" data-edit-girl="' + g.id + '">编辑</button>' +
          '<button type="button" class="admin-btn danger" data-del-girl="' + g.id + '">删除</button>' +
          '</div>'
        : '';
      art.innerHTML =
        (g.banner ? '<div class="girl-card__banner">' + escapeHtml(g.banner) + '</div>' : '') +
        '<a class="girl-card__link" href="#/girl/' + g.id + '">' +
        '<div class="girl-card__media">' +
        (cover
          ? '<img src="' + cover + '" alt="' + escapeHtml(g.name) + '" loading="lazy" />'
          : '<div style="position:absolute;inset:0;background:#d9eae1;display:grid;place-items:center;color:#2e8b57;">' + escapeHtml(g.name || '') + '</div>') +
        '<div class="girl-tags">' + tagHtml + '</div></div>' +
        '<div class="girl-card__info">' +
        '<h3 class="girl-card__name">' + escapeHtml(g.name || '') + '</h3>' +
        (g.excerpt ? '<p class="girl-card__desc">' + escapeHtml(g.excerpt) + '</p>' : '') +
        priceHtml +
        '</div></a>' + adminBar;
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
        if (!confirm('确定删除「' + g.name + '」？此操作不可恢复。')) return;
        try {
          const { error } = await supabase.from('girls').delete().eq('id', id);
          if (error) throw error;
          toast('已删除 ' + g.name);
          if (String(state.detailId) === String(id)) location.hash = '#/';
          await loadAll();
          renderAll();
        } catch (err) {
          toast(err.message || '删除失败');
        }
      });
    });
  }

function renderDetail(id) {
    const g = state.girls.find((x) => String(x.id) === String(id));
    const root = $('#detail-root');
    if (!g) {
      root.innerHTML = '<p style="padding:24px;text-align:center;">未找到该佳丽</p>';
      return;
    }
    const photos = state.photosByGirl[g.id] || [];
    const list = photos.length
      ? photos.map((p) => publicUrl(p.image_path))
      : g.cover_path
        ? [publicUrl(g.cover_path)]
        : [];
    const main = list[0] || '';
    const prices = [g.price_1, g.price_2, g.price_3].filter((p) => p && String(p).trim());
    const tags = Array.isArray(g.tags) && g.tags.length
      ? g.tags
      : [g.origin, g.age, g.height, g.badge].filter(Boolean);
    const phone = g.phone || state.settings.primary_phone || '';
    const raw = phoneRaw(phone);

    root.innerHTML = `
      <div class="girl-detail__nav">
        <a href="#/">← 返回 Dollgirl</a>
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
          ${tags.map((t,i)=>`<span class="chip ${i%3===0?'chip--area':i%3===1?'chip--age':'chip--height'}">${escapeHtml(t)}</span>`).join('')}
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
        <div class="girl-detail__profile-head"><span class="btn-pill">个人资料</span></div>
        <div class="girl-detail__body"><p>${escapeHtml(g.content || g.excerpt || '')}</p></div>
      </div>
      <div class="girl-detail__book">
        <a class="book-btn" href="tel:${raw}">${escapeHtml(phone)} 来电预约</a>
        <a class="book-btn book-btn--ghost" href="sms:${raw}">发短信</a>
        <a class="book-btn book-btn--ghost" target="_blank" rel="noopener" href="https://wa.me/1${raw}">WhatsApp</a>
      </div>
      ${
        isAdmin()
          ? `<div class="detail-admin-bar"><button type="button" class="admin-btn" id="btn-edit-this-girl">编辑此佳丽</button></div>`
          : ''
      }
    `;
    initGalleries();
    const editBtn = $('#btn-edit-this-girl');
    if (editBtn) editBtn.addEventListener('click', () => openGirlModal(g.id));
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
      thumbs.forEach((t) => {
        t.addEventListener('click', () => {
          const src = t.getAttribute('data-full') || t.getAttribute('src');
          if (src) main.setAttribute('src', src);
          thumbs.forEach((x) => x.classList.toggle('is-active', x === t));
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
        if (error) toast('保存失败: ' + error.message);
        else toast('已保存');
        bindSettings();
      });
    });
  }

  /* -------------------- auth -------------------- */
  function openLogin() {
    $('#modal-login').classList.remove('hidden');
    $('#login-error').textContent = '';
    if (isAdmin()) {
      $('#btn-logout').classList.remove('hidden');
    }
  }
  function closeLogin() {
    $('#modal-login').classList.add('hidden');
  }

  async function login() {
    if (!supabase) {
      $('#login-error').textContent = '请先配置 config.js 中的 Supabase URL / anon key';
      return;
    }
    const username = $('#login-email').value.trim().toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(username)) {
      $('#login-error').textContent = '用户名只能包含字母、数字、点、下划线和连字符';
      return;
    }
    if (username !== 'yuank7887') {
      $('#login-error').textContent = '用户名或密码不正确';
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
    toast('登录成功');
    await loadAll();
    renderAll();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    state.session = null;
    setAdminUI();
    closeLogin();
    toast('已退出');
    renderAll();
  }

  /* -------------------- uploads -------------------- */
  async function uploadFile(file, folder) {
    if (!supabase) throw new Error('Supabase 未配置');
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
    $('#girl-modal-title').textContent = g ? '编辑佳丽' : '新增佳丽';
    $('#g-name').value = g?.name || '';
    const tagList = Array.isArray(g?.tags) && g.tags.length
      ? g.tags
      : [g?.origin, g?.age, g?.height, g?.badge].filter(Boolean);
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
      .replace(/s+/g, '-')
      .replace(/[^a-z0-9一-鿿-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return base || ('girl-' + Date.now().toString(36));
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
      .map((t) => t.trim())
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
      $('#girl-error').textContent = '请填写名字';
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

      toast('佳丽已保存');
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
    if (!confirm('确定删除这位佳丽？')) return;
    const { error } = await supabase.from('girls').delete().eq('id', state.editingGirlId);
    if (error) {
      $('#girl-error').textContent = error.message;
      return;
    }
    toast('已删除');
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
      toast('轮播图已上传');
      await loadAll();
      renderAll();
    } catch (e) {
      toast(e.message || '上传失败');
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
      toast('二维码已更新');
      await loadAll();
      renderAll();
    } catch (e) {
      toast(e.message || '上传失败');
    }
  }

  /* -------------------- router -------------------- */
  function handleRoute() {
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/girl\/([^/]+)/);
    if (m) {
      state.route = 'detail';
      state.detailId = m[1];
    } else {
      state.route = 'home';
      state.detailId = null;
    }
    renderAll();
  }

  /* -------------------- boot -------------------- */
  async function boot() {
    // events
    $('#btn-admin-open').addEventListener('click', openLogin);
    $('#btn-login-cancel').addEventListener('click', closeLogin);
    $('#btn-login').addEventListener('click', login);
    $('#btn-logout').addEventListener('click', logout);
    $('#btn-add-girl')?.addEventListener('click', () => openGirlModal(null));
    $('#btn-girl-save').addEventListener('click', saveGirl);
    $('#btn-girl-cancel').addEventListener('click', closeGirlModal);
    $('#btn-girl-delete').addEventListener('click', deleteGirl);
    $('#hero-upload')?.addEventListener('change', (e) => onHeroUpload(e.target.files));
    $('#qr-upload')?.addEventListener('change', (e) => onQrUpload(e.target.files?.[0]));
    window.addEventListener('hashchange', handleRoute);

    if (!hasConfig) {
      toast('未配置 Supabase：当前显示本地默认内容');
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
      toast('数据加载失败，已使用默认文案');
    }
    handleRoute();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
