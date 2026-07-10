# Fragrans / 余香

一个用 React + Vite 实现的桌游规则原型，用来测试《余香》这一套“选材、排瓶、封瓶、挥发、顾客卡”机制是否能自然形成策略取舍。

当前原型重点验证：

- 是否会出现“短瓶保守封”与“做大瓶吃高分”的真实取舍
- 长链奖励是否足够推动玩家追求更完整的顺序结构
- 顾客卡是否会改变封瓶时机
- 腐朽是否能在中后段真正产生压力

## 当前规则摘要

- 每局 `10` 轮
- 每轮从 `4` 个香材里选择 `2` 个，且必须全部使用
- 工作台同时最多保留 `2` 瓶未封瓶香水
- 同一瓶内必须从左到右填入，不能跳格
- 达到 `3` 格后可手动封瓶
- 第 `10` 轮结束时，先结算挥发，再对剩余香水自动封瓶

计分结构：

- 基础分：`3/4/5/6` 格 = `1/2/4/6`
- 排列分：最长合法链 `2/3/4/5/6` = `+1/+2/+3/+5/+8`
- 浓度分：看同种香材最大重复次数
- 顾客分：手动封瓶时，每满足 1 张公共顾客卡 `+4`
- 腐朽扣分：每个腐朽标记 `-2`

固定顺序链：

`柑橘 -> 绿叶 -> 花香 -> 果香 -> 木质 -> 辛香`

## 本地运行

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 种子说明

- 输入任意数字：使用固定种子开局
- 输入 `-1`：生成一个新的随机种子开局
- 输入 `-1` 后，界面会回写本次实际使用的种子，方便复盘

## 项目结构

```text
src/
  components/   界面组件
  game/         游戏状态、规则、数据、reducer
```

主要文件：

- `src/App.tsx`：页面布局与开局控制
- `src/game/rules.ts`：核心规则与计分
- `src/game/reducer.ts`：状态流转
- `src/components/RulesPanel.tsx`：界面内规则说明

## 分享给他人试玩

这是一个纯前端静态项目，适合直接部署到：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

构建配置：

- Build Command: `npm run build`
- Output Directory: `dist`

## 仓库建议

建议提交这些内容：

- `src/`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig*.json`
- `vite.config.ts`
- 规则文档和设计文档

不建议提交这些内容：

- `node_modules/`
- `dist/`
- `*.tsbuildinfo`
- `vite.config.js`
- `vite.config.d.ts`
