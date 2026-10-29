-- Dollgirl88 Supabase schema
-- 在 Supabase SQL Editor 中整段执行

-- 1) 站点全局配置（单行）
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand text not null default 'Dollgirl',
  tagline text not null default '精心打造美女私家会所 100起步',
  intro text not null default '',
  notice_1 text default '',
  notice_2 text default '',
  primary_phone text default '',
  loc1_title text default '',
  loc1_sub text default '',
  loc1_phone text default '',
  loc1_hours text default '',
  loc1_address text default '',
  loc1_note text default '',
  loc2_title text default '',
  loc2_sub text default '',
  loc2_phone text default '',
  loc2_hours text default '',
  loc2_address text default '',
  loc2_note text default '',
  cta_title text default '预约从一条短信开始',
  cta_text text default '',
  footer text default 'Dollgirl · All Rights Reserved',
  qr_path text default '',
  updated_at timestamptz default now()
);

insert into public.site_settings (id, brand, tagline, intro, notice_1, notice_2, primary_phone,
  loc1_title, loc1_sub, loc1_phone, loc1_hours, loc1_address, loc1_note,
  loc2_title, loc2_sub, loc2_phone, loc2_hours, loc2_address, loc2_note,
  cta_title, cta_text, footer)
values (
  1,
  'Dollgirl',
  '精心打造美女私家会所 100起步',
  E'Out call service — 最好发短信不会错过\n私家提供日本旅游美女。私家车位 方便停车\nAll are top-tier girls\n不定时有日本美女直飞到店（双飞）（外送）（包夜）（包天）满足您的一切需求！陪嗨需询问妹子是否愿意\n放松心情 享受快乐 释放压力\n您的高档私人定制空间\n每天多位亚洲美女等您亲临现场挑选',
  '精挑细选 · 高端品质 · 独立出入，隐私度极高',
  '不定时日本美女直飞到店 · 双飞 / 外送 / 包夜 / 包天',
  '(718) 223-7425',
  '法拉盛 · Saull St 会所',
  '昌发超市背后 · 全新会所 3楼',
  '(718) 223-7425',
  '11:00AM – 03:00AM',
  '法拉盛 Franklin and Saull St（昌发超市背后 Saull ST 3楼）',
  'Out call service · 最好发短信不会错过 · 私家车位方便停车',
  '法拉盛 · 好运来店',
  '24小时营业',
  '(518) 889-0999',
  '24小时营业',
  '法拉盛 · 好运来超市后面一条街',
  '全天承接 · 详情请来电 / 短信',
  '预约从一条短信开始',
  '平时不主动发信息。微信若无回复，请直接电话或短信。',
  'Dollgirl · All Rights Reserved'
) on conflict (id) do nothing;

-- 2) 首页轮播图
create table if not exists public.hero_slides (
  id bigint generated always as identity primary key,
  image_path text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 3) 佳丽
create table if not exists public.girls (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique,
  origin text default '',
  age text default '',
  height text default '',
  badge text default '',
  banner text default '',
  excerpt text default '',
  content text default '',
  price_1 text default '',
  price_2 text default '',
  price_3 text default '',
  phone text default '',
  cover_path text default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) 佳丽多图
create table if not exists public.girl_photos (
  id bigint generated always as identity primary key,
  girl_id bigint not null references public.girls(id) on delete cascade,
  image_path text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists girl_photos_girl_id_idx on public.girl_photos(girl_id);

-- 5) Storage bucket（图片）
-- 在 Dashboard → Storage 新建 bucket：site-media（Public）
-- 或执行：
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- 6) RLS
alter table public.site_settings enable row level security;
alter table public.hero_slides enable row level security;
alter table public.girls enable row level security;
alter table public.girl_photos enable row level security;

-- 访客只读已发布内容
create policy "public read settings" on public.site_settings
  for select using (true);

create policy "public read slides" on public.hero_slides
  for select using (active = true);

create policy "public read girls" on public.girls
  for select using (published = true);

create policy "public read photos" on public.girl_photos
  for select using (
    exists (
      select 1 from public.girls g
      where g.id = girl_id and g.published = true
    )
  );

-- 登录管理员可写
create policy "auth write settings" on public.site_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth write slides" on public.hero_slides
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth write girls" on public.girls
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth write photos" on public.girl_photos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage 策略：公开读，登录写
create policy "public read media" on storage.objects
  for select using (bucket_id = 'site-media');

create policy "auth upload media" on storage.objects
  for insert with check (bucket_id = 'site-media' and auth.role() = 'authenticated');

create policy "auth update media" on storage.objects
  for update using (bucket_id = 'site-media' and auth.role() = 'authenticated');

create policy "auth delete media" on storage.objects
  for delete using (bucket_id = 'site-media' and auth.role() = 'authenticated');
