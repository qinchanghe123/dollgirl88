# Dollgirl88（静态站 + Supabase）

本地路径：`D:\001BlackWork\website模板\Dollgirl88`

## 技术栈

| 技术 | 作用 |
|------|------|
| HTML + CSS + JS | 前台展示、点击编辑 |
| Supabase Auth | 管理员登录 |
| Supabase Database | 文案 / 门店 / 佳丽 / 价格 |
| Supabase Storage | 轮播图、佳丽照片、二维码 |

## 你需要先提供的 Supabase 信息

请在 Supabase 建好项目后发给我（或自己填入 `config.js`）：

1. **Project URL**  
   `Supabase → Project Settings → API → Project URL`  
   例：`https://abcdefgh.supabase.co`

2. **anon public key**  
   `Supabase → Project Settings → API → Project API keys → anon public`  
   （前端用，可公开；不要发 `service_role` 密钥）

3. **管理员账号**  
   在 `Authentication → Users → Add user` 创建一个邮箱用户  
   把邮箱/密码自己保管，用于前台管理员登录

4. **（可选）是否已执行** `supabase-schema.sql`  
   未执行的话，我也可以按你给的 URL/Key 指导你点哪里执行

> 有了 1 + 2 就能继续把读写、上传、登录全部接上。  
> 3 用于你登录后台编辑。

## 本地文件

```
Dollgirl88/
├── index.html           # 展示页 + 管理员登录
├── style.css            # 沿用现站绿色 UI
├── app.js               # 数据加载 / 编辑 / 上传
├── config.example.js    # 配置模板
├── config.js            # 你的真实配置（需自建，勿公开）
├── supabase-schema.sql  # 数据库表结构 + RLS
└── README.md
```

## 本地预览

1. 复制 `config.example.js` → `config.js` 并填入 URL / anon key  
2. 在 Supabase SQL Editor 执行 `supabase-schema.sql`  
3. Storage 确认有 public bucket：`site-media`  
4. 用本地静态服务器打开（不要直接 `file://`，否则 ES module / CORS 可能异常）：

```bash
cd "D:\001BlackWork\website模板\Dollgirl88"
npx --yes serve .
```

浏览器打开终端提示的地址（通常是 `http://localhost:3000`）。

## 编辑方式（目标）

- **访客**：只看内容  
- **管理员**：右上角登录后，可点选文字编辑、上传/替换图片、改价格、增删佳丽  
- **样式**：保持现站绿色卡片 / 轮播 / 双门店布局
