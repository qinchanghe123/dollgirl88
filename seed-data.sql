-- 在 Supabase SQL Editor 执行本文件
-- 1) 创建公开图片桶
insert into storage.buckets (id, name, public, file_size_limit)
values ('site-media', 'site-media', true, 10485760)
on conflict (id) do update set public = true;

-- 2) 写入 4 位佳丽（可重复执行）
insert into public.girls as g (
  name, slug, origin, age, height, badge, banner, excerpt, content,
  price_1, price_2, price_3, sort_order, published
) values
(
  'Mika', 'mika', '日本', '22岁', '165cm', '推荐', '推荐 · 日系高颜值',
  '日系清冷颜值，165cm 比例优越。五官精致、气质干净，镜头前后都耐看。服务走心，适合喜欢温柔氛围的你。',
  '日系清冷颜值，165cm 比例优越。五官精致、气质干净。推荐位佳丽，服务走心。',
  '', '', '', 1, true
),
(
  'Yuki', 'yuki', '日本', '21岁', '162cm', '新人', '新人 · 日系甜美',
  '21岁日系新人，162cm 娇小玲珑。脸蛋幼态、笑起来很甜，是回头率很高的那一型。',
  '21岁日系新人，娇小玲珑，甜美可人。适合喜欢年轻气息与女友感的客人。',
  '', '', '', 2, true
),
(
  'Hana', 'hana', '亚洲', '23岁', '168cm', '热门', '热门 · 高挑长腿',
  '168cm 高挑热门款，气场与身材并存。长腿比例出色，穿搭与裸感写真都极有记忆点。',
  '热门位。身高优势明显，肩颈线条与腿部比例很好看。',
  '', '', '', 3, true
),
(
  'Nina', 'nina', '亚洲', '20岁', '160cm', '新人', '新人 · 清秀可人',
  '20岁亚洲新人，160cm 小巧可人。面容清秀，私房光线下皮肤很透，甜中带一点勾人。',
  '新人。照片里表情自然、眼神有戏，居家与精致妆造两种风格都好看。',
  '', '', '', 4, true
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
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
