-- 删除多余的 Nina（保留 seed 的 id=8）
delete from public.girl_photos
where girl_id in (
  select id from public.girls
  where name = 'Nina' and id <> 8
);

delete from public.girls
where name = 'Nina' and id <> 8;

-- 确认结果
select id, name, slug, created_at from public.girls order by id;
