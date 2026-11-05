# 素言 · 极简个人空间 (Suyan Personal Space)

极简黑白灰风格的个人拟真移动端空间系统。基于 React 19 + TypeScript + Vite + Tailwind CSS 构建。

## ✨ 特性

- **极简水墨风格**：宋体排版，素雅黑白灰质感，适配日夜深浅主题。
- **拟真移动桌面**：应用图标桌面与自定个人主屏（支持布局切换、顺序拖拽调整、自定义三栏文案）。
- **模块化应用集**：
  - **对话**：拟真延迟回复、已读不回、主动发信、引用回复、字卡提取与多群员对谈。
  - **字卡**：分类管理、批量增删、屏蔽与专属 TXT 格式导入/导出。
  - **便签**：时令节气与时间戳随笔，支持全文检索、标签归纳与销毁。
  - **周规**：月曜日至日曜日每日打卡与目标规划，按周隔离并支持翻阅历史。
  - **相册**：拍立得挂饰手帐，和风倾角与微晃相框质感。
  - **排版 / 拟真 / 通讯录 / 声效 / 归档**：细致的体验参数自定义与全量 JSON 备份。
- **纯客户端无后端依赖**：所有数据自动持久化保存在本地浏览器 `localStorage` 中，支持一键导出/导入迁移。

---

## 🚀 本地开发与运行

### 1. 环境准备
确保电脑已安装 [Node.js](https://nodejs.org/) (建议 Node 18 或 20+)。

### 2. 安装依赖并启动
```bash
# 安装依赖
npm install

# 启动开发服务器（浏览器访问 http://localhost:3000）
npm run dev
```

### 3. 构建生产包
```bash
npm run build
```
构建产物将输出在 `dist/` 文件夹中，为纯静态网页文件。

---

## 🌐 部署托管到 GitHub Pages

项目中已配置了自动部署工作流 (`.github/workflows/deploy.yml`)：

1. **上传代码至 GitHub 仓库**：
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
   git push -u origin main
   ```

2. **开启 GitHub Pages**：
   - 进入 GitHub 仓库页面，点击 **Settings** (设置) -> **Pages**。
   - 在 **Build and deployment** 下的 **Source** 中选择 **GitHub Actions**。
   - 推送代码后，GitHub 会自动运行工作流并生成在线运行网址（例如 `https://<你的用户名>.github.io/<仓库名>/`）。

---

## ⚡ 也可以一键托管到 Vercel 或 Cloudflare Pages
- **Vercel**：在 [Vercel](https://vercel.com) 点击 "Add New Project"，导入该 GitHub 仓库，Framework 选 Vite，点击 Deploy 即可。
- **Cloudflare Pages**：在 Cloudflare 控制台连接 GitHub 仓库，构建命令填写 `npm run build`，输出目录填写 `dist`。
