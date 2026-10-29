/**
 * 将现站文案/佳丽种子写入 Supabase（需有效 anon/publishable key）
 * 用法：node seed.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const txt = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
  const m = txt.match(/window\.DOLLGIRL_CONFIG\s*=\s*(\{[\s\S]*?\});?/);
  if (!m) throw new Error('config.js parse failed');
  // eslint-disable-next-line no-new-func
  return Function(`return (${m[1]})`)();
}

const cfg = loadConfig();
const URL = cfg.SUPABASE_URL;
const KEY = cfg.SUPABASE_ANON_KEY;

async function api(pathname, { method = 'GET', body, prefer } = {}) {
  const headers = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${URL}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!r.ok) {
    const msg = typeof json === 'object' ? JSON.stringify(json) : text;
    throw new Error(`${method} ${pathname} -> ${r.status} ${msg}`);
  }
  return json;
}

const settings = {
  id: 1,
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
};

const girls = [
  {
    name: 'Mika',
    slug: 'mika',
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
    sort_order: 1,
    published: true,
  },
  {
    name: 'Yuki',
    slug: 'yuki',
    origin: '日本',
    age: '21岁',
    height: '162cm',
    badge: '新人',
    banner: '新人 · 日系甜美',
    excerpt: '21岁日系新人，162cm 娇小玲珑。脸蛋幼态、笑起来很甜，是回头率很高的那一型。',
    content: '21岁日系新人，娇小玲珑，甜美可人。适合喜欢年轻气息与女友感的客人。',
    sort_order: 2,
    published: true,
  },
  {
    name: 'Hana',
    slug: 'hana',
    origin: '亚洲',
    age: '23岁',
    height: '168cm',
    badge: '热门',
    banner: '热门 · 高挑长腿',
    excerpt: '168cm 高挑热门款，气场与身材并存。长腿比例出色，穿搭与裸感写真都极有记忆点。',
    content: '热门位。身高优势明显，肩颈线条与腿部比例很好看。',
    sort_order: 3,
    published: true,
  },
  {
    name: 'Nina',
    slug: 'nina',
    origin: '亚洲',
    age: '20岁',
    height: '160cm',
    badge: '新人',
    banner: '新人 · 清秀可人',
    excerpt: '20岁亚洲新人，160cm 小巧可人。面容清秀，私房光线下皮肤很透，甜中带一点勾人。',
    content: '新人。照片里表情自然、眼神有戏，居家与精致妆造两种风格都好看。',
    sort_order: 4,
    published: true,
  },
];

async function main() {
  console.log('URL', URL);
  console.log('KEY prefix', String(KEY).slice(0, 20) + '...');

  // connectivity
  try {
    const ping = await api('/rest/v1/site_settings?select=id&limit=1');
    console.log('connect OK', ping);
  } catch (e) {
    console.error('\n连接失败：', e.message);
    console.error(`
请到 Supabase → Project Settings → API Keys 重新复制：
1) 推荐复制 Legacy API Keys 里的 anon (public) —— 一长串 eyJ 开头
2) 或复制 Publishable key（sb_publishable_ 开头）完整字符串
填进 config.js 后重跑：node seed.mjs
`);
    process.exit(1);
  }

  await api('/rest/v1/site_settings', {
    method: 'POST',
    body: settings,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
  console.log('settings upserted');

  for (const g of girls) {
    const rows = await api('/rest/v1/girls', {
      method: 'POST',
      body: g,
      prefer: 'resolution=merge-duplicates,return=representation',
    });
    console.log('girl', g.name, Array.isArray(rows) ? rows[0]?.id : rows);
  }

  console.log('\nSeed done. 打开本地站点刷新即可。图片请在管理登录后上传。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
