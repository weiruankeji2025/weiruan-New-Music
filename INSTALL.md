# New Music 安装指南

## 环境要求

| 依赖项 | 最低版本 | 推荐版本 |
|--------|----------|----------|
| Node.js | 18.17+ | 20 LTS |
| npm | 9+ | 10+ |
| 操作系统 | Linux / macOS / Windows | — |

## 一、克隆项目

```bash
git clone https://github.com/weiruankeji2025/weiruan-New-Music.git
cd weiruan-New-Music
```

## 二、安装依赖

```bash
npm install
```

> 安装过程中 `sharp` 模块会下载平台对应的预编译二进制文件，如果网络较慢，可配置镜像：
> ```bash
> npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
> npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
> npm install
> ```

## 三、配置环境变量

复制示例配置文件并编辑：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库路径（SQLite，默认即可）
DATABASE_URL="file:./music.db"

# 默认音乐库路径（可选，也可在界面中配置）
MUSIC_LIBRARY_PATH="/home/你的用户名/Music"
```

## 四、初始化数据库

```bash
# 根据 Prisma Schema 创建数据库表结构
npx prisma db push
```

执行成功后会在 `prisma/` 目录下生成 `music.db` 文件。

> 如需查看数据库内容，可使用 Prisma Studio：
> ```bash
> npm run db:studio
> ```
> 浏览器打开 http://localhost:5555 即可可视化管理数据。

## 五、启动应用

### 开发模式（推荐初次使用）

```bash
npm run dev
```

打开浏览器访问 **http://localhost:3000**

### 生产模式

```bash
# 构建
npm run build

# 启动
npm start
```

默认端口为 `3000`，可通过 `-p` 参数修改：

```bash
npm start -- -p 8080
```

## 六、添加音乐

有两种方式将音乐添加到播放器：

### 方式一：通过界面扫描（推荐）

1. 点击左侧边栏底部的 **「扫描音乐库」** 按钮
2. 输入音乐文件夹的绝对路径（每行一个），例如：
   ```
   /home/user/Music
   /mnt/nas/music/flac
   ```
3. 点击 **「开始扫描」**

### 方式二：通过 API 扫描

```bash
curl -X POST http://localhost:3000/api/library/scan \
  -H "Content-Type: application/json" \
  -d '{"folders": ["/home/user/Music"]}'
```

### 支持的音频格式

| 格式 | 扩展名 |
|------|--------|
| MP3 | `.mp3` |
| FLAC | `.flac` |
| WAV | `.wav` |
| OGG Vorbis | `.ogg` |
| AAC / M4A | `.m4a`, `.aac` |
| WMA | `.wma` |
| Opus | `.opus` |
| AIFF | `.aiff` |
| APE | `.ape` |

扫描器会自动递归子目录，并从文件中提取：
- 标题、艺术家、专辑
- 年份、流派、曲号、碟号
- 时长、比特率、采样率
- 嵌入的封面图片

## 七、常用操作

| 操作 | 说明 |
|------|------|
| 双击歌曲 | 播放该歌曲并将当前列表加入队列 |
| 空格键区域 | 播放/暂停控制 |
| 点击进度条 | 跳转到指定位置 |
| 侧边栏切换 | 在歌曲/专辑/艺术家/歌单/流派/收藏/历史之间切换 |
| 搜索 | 在顶部搜索栏输入关键词，实时搜索 |
| 队列面板 | 点击播放栏右侧队列图标 |
| 歌词面板 | 点击播放栏右侧歌词图标 |
| 主题切换 | 侧边栏底部太阳/月亮图标 |

## 八、目录结构

```
weiruan-New-Music/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   └── music.db           # SQLite 数据库（运行后生成）
├── src/
│   ├── app/               # Next.js 页面与 API 路由
│   ├── components/        # React UI 组件
│   ├── store/             # Zustand 状态管理
│   ├── lib/               # 工具库
│   └── types/             # TypeScript 类型
├── .env                   # 环境变量（需手动创建）
├── .env.example           # 环境变量示例
├── package.json           # 项目配置
└── tailwind.config.ts     # Tailwind 样式配置
```

## 常见问题

### Q: `npm install` 时 sharp 安装失败？
确保 Node.js 版本 >= 18.17，或使用上面提到的镜像源。

### Q: 扫描后看不到歌曲？
- 确认路径是**绝对路径**
- 确认文件扩展名在支持列表中
- 查看终端日志中是否有报错信息

### Q: 如何重置数据库？
```bash
rm prisma/music.db
npx prisma db push
```

### Q: 如何修改端口？
```bash
# 开发模式
npx next dev -p 8080

# 生产模式
npm start -- -p 8080
```

### Q: 数据库在哪里？
SQLite 数据库文件位于 `prisma/music.db`，可直接备份或复制。
