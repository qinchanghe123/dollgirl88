-- Dollgirl88 · 在原有佳丽基础上【新增】客户提供的佳丽（不整批下线）
-- 在 Supabase SQL Editor 执行
-- 图片路径：images/girls/{slug}/n.jpg（随 GitHub Pages 托管）

-- 同 slug 则更新文案/封面；不同 slug 则新增。不会把原有 published 佳丽下线。

insert into public.girls as g (
  name, slug, origin, age, height, badge, banner, excerpt, content,
  cover_path, sort_order, published, tags
) values
(
  'Rose', 'rose', '女友感', '27岁', '167cm', 'BBFS',
  '今日可约 · 全能型 · 可派对',
  'Rose · 27岁 · 身高167cm。温柔女友感，可 BBFS。全能型佳丽，可派对陪同，服务贴心走心。',
  '【基本资料】名字：Rose｜年纪：27｜身高：167cm｜风格：女友感 · 可 BBFS｜特长：全能型 · 可派对',
  'images/girls/rose/1.jpg', 10, true,
  array['女友感','27岁','167cm','BBFS','全能派对']
),
(
  'Gucci', 'gucci', '派对女王', '—', '155cm', '派对',
  '今日可约 · 派对女王',
  'Gucci · 身高155cm。派对女王气场，活泼会玩，适合想嗨、想热闹的夜晚。',
  '【基本资料】名字：Gucci｜身高：155cm｜标签：派对女王',
  'images/girls/gucci/1.jpg', 11, true,
  array['派对女王','155cm','高人气']
),
(
  'Emily', 'emily', '女友感', '二十七八', '155cm', 'BBFS',
  '今日可约 · 全能型 · 可派对 · 可 BBFS',
  'Emily · 年龄二十七八 · 身高155cm · 体重95斤。可 BBFS，女友感满分。全能型，可派对。',
  '【基本资料】名字：Emily｜年纪：二十七八｜身高：155cm｜体重：95斤｜可 BBFS｜全能派对',
  'images/girls/emily/1.jpg', 12, true,
  array['女友感','二十七八','155cm','95斤','BBFS','全能派对']
),
(
  'Jenna', 'jenna', '全能', '27岁', '155cm', 'BBFS',
  '今日可约 · 全能型 · 可派对',
  'Jenna · 27岁 · 155cm · 90lb · 32B。可 BBJ / BBFS。全能型佳丽，可派对。',
  '【基本资料】名字：Jenna｜27岁｜155cm｜90lb｜32B｜BBJ｜BBFS｜全能派对',
  'images/girls/jenna/1.jpg', 13, true,
  array['27岁','155cm','90lb','32B','BBJ','BBFS','全能派对']
),
(
  'Bella', 'bella', '会嗨', '29岁', '155cm', '嗨',
  '今日可约 · 你会嗨吗',
  'Bella · 29岁 · 身高155cm · 体重107斤。会嗨、有气氛，适合想放松狂欢的夜晚。',
  '【基本资料】名字：Bella｜29岁｜155cm｜107斤｜会嗨',
  'images/girls/bella/1.jpg', 14, true,
  array['29岁','155cm','107斤','会嗨']
),
(
  'Reika', 'reika', '日系', '23岁', '164cm', 'H罩杯',
  '今日可约 · 详细档案',
  'Reika（田中麗華）· 23岁 · 164cm · 58kg · H罩杯。详见个人资料服务清单。',
  '名字：田中麗華 / Reika｜164cm｜58kg｜H｜23｜视觉24｜豊胸あり｜服务清单见前台详情',
  'images/girls/reika/1.jpg', 15, true,
  array['田中麗華','23岁','164cm','58kg','H罩杯','日系']
),
(
  'Latina', 'latina', '拉缇娜', '22岁', '160cm', '普通服务',
  '今日可约 · 拉缇娜',
  '拉缇娜（Latina）· 22岁 · 身高160cm。普通服务。',
  '【基本资料】名字：拉缇娜 / Latina｜22岁｜160cm｜普通服务',
  'images/girls/latina/1.jpg', 16, true,
  array['拉缇娜','22岁','160cm','普通服务']
)
on conflict (slug) do update set
  name = excluded.name,
  origin = excluded.origin,
  age = excluded.age,
  height = excluded.height,
  badge = excluded.badge,
  banner = excluded.banner,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_path = excluded.cover_path,
  sort_order = excluded.sort_order,
  published = true,
  tags = excluded.tags,
  updated_at = now();

-- 相册：只重建这批 slug 的照片，不动其他人
delete from public.girl_photos
where girl_id in (select id from public.girls where slug in ('rose','gucci','emily','jenna','bella','reika','latina'));

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/rose/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2)) as u(ord) where g.slug = 'rose';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/gucci/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2),(3)) as u(ord) where g.slug = 'gucci';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/emily/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2),(3),(4),(5),(6),(7),(8)) as u(ord) where g.slug = 'emily';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/jenna/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2),(3)) as u(ord) where g.slug = 'jenna';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/bella/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2),(3)) as u(ord) where g.slug = 'bella';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/reika/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2),(3)) as u(ord) where g.slug = 'reika';

insert into public.girl_photos (girl_id, image_path, sort_order)
select g.id, 'images/girls/latina/' || u.ord || '.jpg', u.ord
from public.girls g cross join (values (1),(2)) as u(ord) where g.slug = 'latina';

select slug, name, published, sort_order from public.girls where published order by sort_order, id;
