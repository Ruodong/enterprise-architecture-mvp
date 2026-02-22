# 企业架构管理 Web 应用 MVP

技术栈：Next.js (App Router) + TypeScript + PostgreSQL + Prisma +（轻量）shadcn/ui 风格组件。

## 1. 本地启动

```bash
cd /Users/ruodongyang/.openclaw/workspace/enterprise-architecture-mvp
cp .env.example .env
npm install
```

### 方式A：Docker 启动 PostgreSQL（推荐）

```bash
docker compose up -d
```

### 方式B：使用本地 PostgreSQL

自行创建数据库 `ea_mvp`，并更新 `.env` 里的 `DATABASE_URL`。

## 2. 数据库迁移 & Seed

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

> 已提供 `prisma/schema.prisma`、`prisma/migrations/20260221193000_init/migration.sql` 与 `prisma/seed.ts`。

## 3. 启动应用

```bash
npm run dev
```

打开 http://localhost:3000

## 4. 功能覆盖

### 主数据 CRUD（4类）
- 业务能力（BusinessCapability）
- 业务应用（BusinessApplication）
- 技术栈（TechStack）
- 技术平台（TechPlatform）

### 关系（多对多）
- 业务应用 <-> 业务能力（ApplicationCapability）
- 业务应用 <-> 技术栈（ApplicationTechStack）
- 业务应用 <-> 技术平台（ApplicationTechPlatform）

### 视角页面
- 按应用查看：`/views/applications`
- 按业务能力查看：`/views/capabilities`
- 按技术平台查看：`/views/platforms`

## 5. 生命周期字段建议（已在 schema 中）
主数据表包含：
- `lifecycleStatus`（PLANNED/ACTIVE/SUNSETTING/RETIRED）
- `createdAt` / `updatedAt`
- `deletedAt`（软删除预留）
- 业务类实体额外包含 `validFrom` / `validTo`

并对 `lifecycleStatus`、`deletedAt` 以及关键关联字段建立索引。

## 6. 当前 MVP 边界
- 详情页可只读查看关系
- CRUD 已实现（Server Actions）
- 关系维护（在表单里直接编辑关联）可在下一迭代补充
