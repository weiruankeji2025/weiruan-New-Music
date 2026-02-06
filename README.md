# New Music - 现代音乐播放器

一款功能丰富的现代音乐播放器，类似音流(Stream Music)，基于 Next.js 全栈开发。

## 功能特性

### 音乐库管理
- 自动扫描本地音乐文件夹，支持递归扫描
- 自动解析音频元数据（标题、艺术家、专辑、封面等）
- 支持多种音频格式：MP3, FLAC, WAV, OGG, M4A, AAC, WMA, OPUS, AIFF, APE
- 按歌曲、专辑、艺术家、流派多维度浏览
- 库统计信息（歌曲数、专辑数、时长、存储大小）

### 播放功能
- 完整的播放控制（播放/暂停/上一曲/下一曲/进度拖拽）
- HTTP Range 流式传输，支持拖拽进度
- 播放模式：顺序播放、列表循环、单曲循环、随机播放
- 播放队列管理（添加、移除、拖拽排序）
- 音量控制与静音
- 3秒内切换上一曲规则

### 播放列表
- 创建/编辑/删除自定义歌单
- 歌单内曲目排序
- 智能歌单（基于规则自动筛选）
- 歌单封面

### 歌词
- LRC 时间轴歌词解析与同步高亮
- 纯文本歌词展示
- 歌词翻译支持
- 点击歌词跳转播放进度
- 自动滚动到当前歌词行

### 搜索
- 全局搜索（歌曲、专辑、艺术家、歌单）
- 实时防抖搜索
- 搜索结果分类展示

### 收藏与历史
- 歌曲收藏/取消收藏
- 播放历史记录
- 清空历史记录

### 界面
- 深色/浅色主题切换
- 响应式布局（桌面/平板/移动端）
- 可折叠侧边栏
- 全屏正在播放页面
- 列表/网格视图切换
- 流畅的动画过渡
- 自定义滚动条

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 数据库 | SQLite + Prisma ORM |
| 音频解析 | music-metadata |
| 图片处理 | Sharp |

## API 接口

### 歌曲 (Tracks)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tracks` | 获取歌曲列表（分页、排序、过滤） |
| GET | `/api/tracks/:id` | 获取歌曲详情 |
| PATCH | `/api/tracks/:id` | 更新歌曲信息（评分、歌词） |
| GET | `/api/tracks/:id/stream` | 流式播放音频（支持 Range） |
| GET | `/api/tracks/:id/cover` | 获取封面图片 |
| GET | `/api/tracks/:id/lyrics` | 获取歌词 |
| PUT | `/api/tracks/:id/lyrics` | 更新歌词 |

### 专辑 (Albums)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/albums` | 获取专辑列表 |
| GET | `/api/albums/:id` | 获取专辑详情（含曲目） |

### 艺术家 (Artists)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/artists` | 获取艺术家列表 |
| GET | `/api/artists/:id` | 获取艺术家详情（含专辑） |

### 歌单 (Playlists)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/playlists` | 获取歌单列表 |
| POST | `/api/playlists` | 创建歌单 |
| GET | `/api/playlists/:id` | 获取歌单详情（含曲目） |
| PATCH | `/api/playlists/:id` | 更新歌单信息 |
| DELETE | `/api/playlists/:id` | 删除歌单 |
| POST | `/api/playlists/:id/tracks` | 添加曲目到歌单 |
| DELETE | `/api/playlists/:id/tracks` | 从歌单移除曲目 |
| PATCH | `/api/playlists/:id/tracks` | 歌单曲目排序 |

### 搜索 (Search)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/search?q=关键词` | 全局搜索 |

### 收藏 (Favorites)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/favorites` | 获取收藏列表 |
| POST | `/api/favorites` | 切换收藏状态 |

### 播放历史 (History)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/history` | 获取播放历史 |
| POST | `/api/history` | 记录播放 |
| DELETE | `/api/history` | 清空历史 |

### 播放队列 (Queue)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/queue` | 获取当前队列 |
| POST | `/api/queue` | 设置队列 |
| DELETE | `/api/queue` | 清空队列 |

### 音乐库 (Library)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/library/stats` | 获取库统计 |
| GET | `/api/library/genres` | 获取流派列表 |
| POST | `/api/library/scan` | 扫描音乐文件夹 |

### 设置 (Settings)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 获取用户设置 |
| PATCH | `/api/settings` | 更新用户设置 |

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 访问应用。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── tracks/        # 歌曲相关 API
│   │   ├── albums/        # 专辑相关 API
│   │   ├── artists/       # 艺术家相关 API
│   │   ├── playlists/     # 歌单相关 API
│   │   ├── search/        # 搜索 API
│   │   ├── favorites/     # 收藏 API
│   │   ├── history/       # 播放历史 API
│   │   ├── queue/         # 播放队列 API
│   │   ├── library/       # 音乐库管理 API
│   │   └── settings/      # 设置 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── player/            # 播放器组件
│   │   ├── AudioEngine    # 音频引擎
│   │   ├── PlayerBar      # 底部播放栏
│   │   ├── NowPlaying     # 全屏播放页
│   │   ├── QueuePanel     # 队列面板
│   │   └── LyricsPanel    # 歌词面板
│   ├── library/           # 音乐库组件
│   │   ├── TrackList      # 歌曲列表
│   │   ├── AlbumGrid      # 专辑网格
│   │   ├── ArtistGrid     # 艺术家网格
│   │   ├── PlaylistGrid   # 歌单网格
│   │   ├── GenreView      # 流派视图
│   │   └── *Detail        # 详情页组件
│   ├── dialogs/           # 对话框组件
│   ├── Sidebar            # 侧边栏
│   ├── MainContent        # 主内容区
│   ├── SearchBar          # 搜索栏
│   └── icons              # 图标组件
├── store/                 # Zustand 状态管理
│   ├── playerStore        # 播放器状态
│   ├── libraryStore       # 音乐库状态
│   └── uiStore            # UI 状态
├── lib/                   # 工具库
│   ├── prisma             # Prisma 客户端
│   └── utils              # 工具函数
└── types/                 # TypeScript 类型定义
```

## 许可证

MIT License
