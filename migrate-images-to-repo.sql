-- 把图片路径改为站点相对路径（随 GitHub Pages 一起托管，不再依赖 WP）
-- 在 Supabase SQL Editor 执行

-- 轮播
delete from public.hero_slides;
insert into public.hero_slides (image_path, sort_order, active) values
('images/hero/hero-slide-a.webp', 1, true),
('images/hero/hero-slide-b.webp', 2, true),
('images/hero/hero-slide-c.webp', 3, true),
('images/hero/hero-slide-d.webp', 4, true);

-- 二维码
update public.site_settings
set qr_path = 'images/qr/wechat-qr.jpg', updated_at = now()
where id = 1;

-- 佳丽封面
update public.girls set cover_path = 'images/girls/mika/1.jpg', updated_at = now() where slug = 'mika';
update public.girls set cover_path = 'images/girls/yuki/1.jpg', updated_at = now() where slug = 'yuki';
update public.girls set cover_path = 'images/girls/hana/1.jpg', updated_at = now() where slug = 'hana';
update public.girls set cover_path = 'images/girls/nina/1.jpg', updated_at = now() where slug = 'nina';

-- 相册重建
delete from public.girl_photos
where girl_id in (select id from public.girls where slug in ('mika','yuki','hana','nina'));

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/mika/' || u.ord || '.jpg', u.ord
from public.girls g
cross join (values (1),(2),(3),(4),(5),(6)) as u(ord)
where g.slug = 'mika';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/yuki/' || u.ord || '.jpg', u.ord
from public.girls g
cross join (values (1),(2),(3),(4),(5)) as u(ord)
where g.slug = 'yuki';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/hana/' || u.ord || '.jpg', u.ord
from public.girls g
cross join (values (1),(2),(3),(4)) as u(ord)
where g.slug = 'hana';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/nina/' || u.ord || '.jpg', u.ord
from public.girls g
cross join (values (1),(2),(3),(4),(5),(6)) as u(ord)
where g.slug = 'nina';

-- 检查
select 'slides' as k, count(*)::text as v from public.hero_slides
union all
select 'qr', qr_path from public.site_settings where id=1
union all
select name, cover_path from public.girls order by 1;
