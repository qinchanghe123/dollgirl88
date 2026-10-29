-- 补图 + 轮播 + 二维码 + tags 字段
-- Supabase SQL Editor 执行

-- 0) tags 字段（主描述 + 多标签）
alter table public.girls add column if not exists tags text[] not null default '{}';

-- 1) 确保 bucket
insert into storage.buckets (id, name, public, file_size_limit)
values ('site-media', 'site-media', true, 10485760)
on conflict (id) do update set public = true;

-- 2) 首页轮播（原站 dollgirl88.com）
delete from public.hero_slides;
insert into public.hero_slides (image_path, sort_order, active) values
('https://dollgirl88.com/wp-content/uploads/2026/10/hero-slide-a.webp', 1, true),
('https://dollgirl88.com/wp-content/uploads/2026/10/hero-slide-b.webp', 2, true),
('https://dollgirl88.com/wp-content/uploads/2026/10/hero-slide-c.webp', 3, true),
('https://dollgirl88.com/wp-content/uploads/2026/10/hero-slide-d.webp', 4, true);

-- 3) 微信二维码
update public.site_settings
set qr_path = 'https://dollgirl88.com/wp-content/uploads/2026/10/wechat-qr.jpg',
    updated_at = now()
where id = 1;

-- 4) 清理重复 Nina（若还有）
delete from public.girl_photos
where girl_id in (select id from public.girls where name='Nina' and slug is distinct from 'nina');
delete from public.girls where name='Nina' and slug is distinct from 'nina';

-- 5) Mika 照片
update public.girls set
  cover_path = 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r1-lQDPJx9_bbiicSXNBXrNBGKwE2oofXRfv4MKmv3M8pvDAA_1122_1402.jpg',
  tags = array['日本','22岁','165cm','推荐'],
  updated_at = now()
where slug = 'mika';

delete from public.girl_photos where girl_id = (select id from public.girls where slug='mika');
insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, u.url, u.ord
from public.girls g
cross join (values
  (1, 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r1-lQDPJx9_bbiicSXNBXrNBGKwE2oofXRfv4MKmv3M8pvDAA_1122_1402.jpg'),
  (2, 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r2-73f73a6dc5260504df32376ba9a483b2.jpg'),
  (3, 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r3-lQDPJxliMC754SXNBObNBOawQc3HGFkNvpUKmv3M6w-BAA_1254_1254.jpg'),
  (4, 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r4-lQDPJwKcU8H3QSXNBObNBOawrEPYPG_-bvAKmv3M8pvDAQ_1254_1254.jpg'),
  (5, 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r5-lQDPKdbn6-j4MSXNAmzNAnCw5lLuYJUZXAgKmv3M6w-BAw_624_620.jpg'),
  (6, 'https://dollgirl88.com/wp-content/uploads/2026/10/mika-r6-lQDPJw6wm_IzwSXNAm7NAlewlmc1680FIkQKmv3M6w-BAg_599_622.jpg')
) as u(ord, url)
where g.slug = 'mika';

-- 6) Yuki
update public.girls set
  cover_path = 'https://dollgirl88.com/wp-content/uploads/2026/10/yuki-r1-lQDPKejgJTLiiGXNBqvNBQCwtp5spS1MrSQKmv3vOLQnAQ_1280_1707.jpg',
  tags = array['日本','21岁','162cm','新人'],
  updated_at = now()
where slug = 'yuki';

delete from public.girl_photos where girl_id = (select id from public.girls where slug='yuki');
insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, u.url, u.ord
from public.girls g
cross join (values
  (1, 'https://dollgirl88.com/wp-content/uploads/2026/10/yuki-r1-lQDPKejgJTLiiGXNBqvNBQCwtp5spS1MrSQKmv3vOLQnAQ_1280_1707.jpg'),
  (2, 'https://dollgirl88.com/wp-content/uploads/2026/10/yuki-r2-lQDPJxDSTjO_l2XNBajNBD6w2NwvPFQtJsAKmv3vN3YWAQ_1086_1448.jpg'),
  (3, 'https://dollgirl88.com/wp-content/uploads/2026/10/yuki-r3-lQDPKHBuFjJ8CGXNBgDNBACwBxkEhxYz0rYKmv3vN3YWAA_1024_1536.jpg'),
  (4, 'https://dollgirl88.com/wp-content/uploads/2026/10/yuki-r4-lQDPKHsfqm9CKGXNBgDNBACwxuE_1Pc1Bd0Kmv3vN3YWAw_1024_1536.jpg'),
  (5, 'https://dollgirl88.com/wp-content/uploads/2026/10/yuki-r5-146187c87e37673287c25cb5edea4f09.jpg')
) as u(ord, url)
where g.slug = 'yuki';

-- 7) Hana
update public.girls set
  cover_path = 'https://dollgirl88.com/wp-content/uploads/2026/10/hana-f3-1-lQDPJx7Jh21rdeXNB4DNBQCw4o6nfezyM-0Kmv4eO8qtAA_1280_1920.jpg',
  tags = array['亚洲','23岁','168cm','热门'],
  updated_at = now()
where slug = 'hana';

delete from public.girl_photos where girl_id = (select id from public.girls where slug='hana');
insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, u.url, u.ord
from public.girls g
cross join (values
  (1, 'https://dollgirl88.com/wp-content/uploads/2026/10/hana-f3-1-lQDPJx7Jh21rdeXNB4DNBQCw4o6nfezyM-0Kmv4eO8qtAA_1280_1920.jpg'),
  (2, 'https://dollgirl88.com/wp-content/uploads/2026/10/hana-f3-2-lQDPJwge8-vAteXNBaDNA8CwMdlKgbBwF-sKmv4eQ9f3Ag_960_1440.jpg'),
  (3, 'https://dollgirl88.com/wp-content/uploads/2026/10/hana-f3-3-lQDPKITSlg6N9uXNBaDNA8CwG2SystuS9LgKmv4eQ9f3AQ_960_1440.jpg'),
  (4, 'https://dollgirl88.com/wp-content/uploads/2026/10/hana-f3-4-lQDPJw7e_iTTdeXNBbLNA8Cw5ZBdMe_Euy8Kmv4eQ9f3AA_960_1458.jpg')
) as u(ord, url)
where g.slug = 'hana';

-- 8) Nina：保留已上传图；若 cover 空则用原站图兜底；补 tags
update public.girls set
  cover_path = case
    when cover_path is null or cover_path = '' then
      'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-1-lQDPJwcVYW3X1CXNBqvNBQCwlIG0OcsZPTYKmv5HHmNfAA_1280_1707.jpg'
    else cover_path
  end,
  tags = array['亚洲','20岁','160cm','新人'],
  updated_at = now()
where slug = 'nina';

-- Nina 若相册为空则补原站图
insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, u.url, u.ord
from public.girls g
cross join (values
  (1, 'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-1-lQDPJwcVYW3X1CXNBqvNBQCwlIG0OcsZPTYKmv5HHmNfAA_1280_1707.jpg'),
  (2, 'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-2-c86ba8230932ec0d96c99f08e1815d73.jpg'),
  (3, 'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-3-lQDPKIPVvyu2FCXNB4LNBP-wmenxzUo1_e8Kmv5HFNgrAg_1279_1922.jpg'),
  (4, 'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-4-lQDPJwNsmd25dCXNBaDNA8Cw4lWie71-PPAKmv5HFNgrAw_960_1440.jpg'),
  (5, 'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-5-lQDPJwMIjn7MlCXNBejNA-6wkut1EWP0KnUKmv5HFNgrAA_1006_1512.jpg'),
  (6, 'https://dollgirl88.com/wp-content/uploads/2026/10/nina-f4-6-lQDPKcmeaTGdVCXNBaLNA76wA2AdFxRWH24Kmv5HHmNfAQ_958_1442.jpg')
) as u(ord, url)
where g.slug = 'nina'
  and not exists (select 1 from public.girl_photos p where p.girl_id = g.id);

-- 检查
select id, name, slug, left(cover_path,60) as cover from public.girls order by sort_order, id;
select girl_id, count(*) from public.girl_photos group by girl_id order by girl_id;
select id, left(image_path,70) from public.hero_slides order by sort_order;
select qr_path from public.site_settings where id=1;
