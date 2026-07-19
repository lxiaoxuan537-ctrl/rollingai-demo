# FEISHU_CONNECTOR.md

## 1. 目标

让 Agent 能连接飞书中的营销表格，读取：

- 产品信息
- 活动信息
- 素材附件
- 发布记录
- 评论、私聊、成交等运营指标

## 2. 推荐表结构

### 产品表

| 字段 | 说明 |
|---|---|
| product_name | 产品名称 |
| category | 产品类型 |
| selling_points | 核心卖点 |
| target_user | 目标用户 |
| campaign_info | 活动信息 |
| forbidden_words | 禁用词 |

### 素材表

| 字段 | 说明 |
|---|---|
| material_id | 素材 ID |
| category | 适用品类 |
| title | 素材名称 |
| tags | 标签 |
| attachment | 飞书附件 |
| usage_scene | 桌搭、手持、细节、场景 |

### 发布复盘表

| 字段 | 说明 |
|---|---|
| post_id | 发布记录 ID |
| product_name | 产品名称 |
| category | 品类 |
| copy_style | 文案风格 |
| impressions | 曝光 |
| likes | 点赞 |
| comments | 评论 |
| private_chats | 私聊 |
| orders | 成交 |
| customer_notes | 潜客沟通摘要 |

## 3. 接口设计

```text
POST /api/feishu/sync
```

输入：

```json
{
  "appToken": "app_token_xxx",
  "tableId": "tbl_xxx",
  "viewId": "vew_xxx"
}
```

输出：

```json
{
  "products": [],
  "materials": [],
  "postStats": [],
  "categoryStats": []
}
```

## 4. 当前原型实现

当前版本在 `app.js` 中用 `simulateFeishuSync()` 模拟飞书返回，保证面试时稳定可演示。

真实上线时替换该函数即可，前端字段和后续 Agent 链路不用大改。
