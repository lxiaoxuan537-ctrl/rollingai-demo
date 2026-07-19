const form = document.querySelector("#agentForm");
const emptyState = document.querySelector("#emptyState");
const resultArea = document.querySelector("#resultArea");
const feishuBox = document.querySelector("#feishuBox");
const insightBox = document.querySelector("#insightBox");
const assetBox = document.querySelector("#assetBox");
const layoutBox = document.querySelector("#layoutBox");
const copyCards = document.querySelector("#copyCards");
const recommendBox = document.querySelector("#recommendBox");
const learningBox = document.querySelector("#learningBox");
const checkBox = document.querySelector("#checkBox");
const traceLog = document.querySelector("#traceLog");
const copyMarkdownBtn = document.querySelector("#copyMarkdownBtn");
const loadExampleBtn = document.querySelector("#loadExampleBtn");
const syncFeishuBtn = document.querySelector("#syncFeishuBtn");
const resetBtn = document.querySelector("#resetBtn");
const workflowItems = Array.from(document.querySelectorAll("#workflowList li"));
const interfaceCard = document.querySelector("#interfaceCard");

let latestMarkdown = "";
let syncedFeishu = null;

const example = {
  productName: "影刃 X1 无线电竞鼠标",
  productType: "无线鼠标",
  sellingPoints: "轻量、低延迟、黑色磨砂、适合 FPS、握感稳、本周活动价",
  targetUser: "FPS 玩家、学生党、宿舍党、想换轻量鼠标的人",
  campaignInfo: "本周活动价 199，送鼠标脚贴，库存不多，支持到店试握",
  postGoal: "种草",
  tone: "玩家口吻",
  blockedWords: "全网最强、闭眼入、行业第一、极致性能",
  feishuAppToken: "app_token_demo",
  feishuTableId: "tbl_marketing_demo",
  feishuViewId: "vew_private_domain",
  assetSource: "飞书素材表",
  layoutStyle: "朋友圈单图海报",
  assetKeywords: "黑色鼠标、桌搭、开黑、FPS、磨砂",
  impressions: "1280",
  likes: "92",
  comments: "28",
  privateChats: "19",
  orders: "7",
  topCategory: "无线鼠标",
  customerNotes: "多人问延迟和手小能不能握；有客户问活动什么时候结束；也有人想看宿舍桌面实拍。"
};

const interfaceContracts = {
  feishu: {
    name: "/api/feishu/sync",
    input: "appToken, tableId, viewId",
    output: "营销表行、素材表行、品类销量、互动指标",
    note: "真实环境用飞书开放平台 records/search 或多维表格 Webhook。"
  },
  organize: {
    name: "/api/product/normalize",
    input: "产品名、类型、卖点、目标用户、活动信息",
    output: "结构化产品卡、风险词、目标人群、核心场景",
    note: "把运营输入变成后续节点可消费的 JSON。"
  },
  assets: {
    name: "/api/assets/search",
    input: "产品类型、关键词、素材来源、飞书素材表",
    output: "候选素材、匹配分、推荐首图",
    note: "当前用内置素材库模拟；生产可接飞书附件、OSS 或图片搜索 API。"
  },
  copy: {
    name: "/api/copy/generate",
    input: "产品卡、卖点、运营反馈、禁用词",
    output: "3 条朋友圈文案、去 AI 味版本",
    note: "可替换为 Dify/百炼/HiAgent 大模型节点。"
  },
  layout: {
    name: "/api/poster/layout",
    input: "推荐文案、首图、排版样式",
    output: "单图海报/三图卡片/九宫格首图排版方案",
    note: "当前用 HTML 预览；生产可接 Canva/Figma/图片合成服务。"
  },
  learn: {
    name: "/api/ops/learn",
    input: "曝光、点赞、评论、私聊、成交、热卖品类、客户沟通摘要",
    output: "互动率、私聊转化、品类建议、下一轮内容策略",
    note: "形成反馈闭环，让 Agent 不只生成，还能越用越准。"
  },
  check: {
    name: "/api/publish/check",
    input: "最终文案、素材、活动信息、禁用词",
    output: "可发布程度、风险点、补充信息",
    note: "控制广告味、绝对化表达、参数虚构和活动信息缺失。"
  }
};

const feishuMock = {
  status: "已同步模拟飞书营销表",
  sheet: "私域朋友圈投放复盘表",
  updatedAt: "2026-07-17 13:45",
  categoryStats: [
    { category: "无线鼠标", posts: 18, comments: 436, chats: 185, orders: 61, revenue: 12139 },
    { category: "机械键盘", posts: 14, comments: 286, chats: 104, orders: 34, revenue: 10506 },
    { category: "电竞耳机", posts: 10, comments: 192, chats: 78, orders: 23, revenue: 6677 },
    { category: "电竞椅", posts: 8, comments: 146, chats: 41, orders: 12, revenue: 9588 }
  ],
  materialRows: [
    { id: "fs-001", type: "无线鼠标", title: "黑色鼠标桌搭实拍", tags: ["无线鼠标", "黑色", "桌搭", "FPS"], source: "飞书素材表" },
    { id: "fs-002", type: "无线鼠标", title: "手握鼠标近景", tags: ["无线鼠标", "握感", "磨砂", "细节"], source: "飞书素材表" },
    { id: "fs-003", type: "机械键盘", title: "键盘灯效俯拍", tags: ["机械键盘", "灯效", "桌搭"], source: "飞书素材表" },
    { id: "fs-004", type: "电竞椅", title: "电竞椅桌面整体图", tags: ["电竞椅", "久坐", "工作室"], source: "飞书素材表" }
  ],
  customerQuestions: ["活动什么时候结束", "手小适不适合", "有没有宿舍桌面实拍", "能不能到店试握"]
};

const sceneMap = {
  "无线鼠标": ["晚上开黑", "打两把排位", "宿舍桌面", "急停拉枪"],
  "机械键盘": ["夜里码字和开黑", "桌搭换新", "打字回弹", "宿舍桌面"],
  "电竞耳机": ["听声辨位", "语音开黑", "看比赛", "长时间佩戴"],
  "电竞椅": ["久坐训练", "下班开黑", "宿舍和工作室", "腰背支撑"],
  "游戏手柄": ["主机房", "客厅开局", "周末双人游戏", "赛车和动作游戏"],
  "战队周边": ["赛事日", "战队应援", "收藏展示", "出街搭配"],
  "桌搭氛围产品": ["桌面改造", "夜间氛围", "开黑背景", "拍照出片"]
};

const localAssets = [
  { id: "local-mouse-01", type: "无线鼠标", title: "暗色桌搭首图", tags: ["无线鼠标", "黑色", "桌搭", "开黑"], source: "本地素材库", theme: "mouse" },
  { id: "local-mouse-02", type: "无线鼠标", title: "手握细节图", tags: ["无线鼠标", "握感", "磨砂", "细节"], source: "本地素材库", theme: "detail" },
  { id: "local-keyboard-01", type: "机械键盘", title: "RGB 键盘俯拍", tags: ["机械键盘", "灯效", "桌搭"], source: "本地素材库", theme: "keyboard" },
  { id: "local-headset-01", type: "电竞耳机", title: "耳机挂架场景图", tags: ["电竞耳机", "开黑", "听声辨位"], source: "本地素材库", theme: "headset" },
  { id: "local-chair-01", type: "电竞椅", title: "电竞椅工作室全景", tags: ["电竞椅", "久坐", "腰托"], source: "本地素材库", theme: "chair" },
  { id: "local-pad-01", type: "游戏手柄", title: "主机游戏手柄图", tags: ["游戏手柄", "主机", "客厅"], source: "本地素材库", theme: "gamepad" },
  { id: "local-merch-01", type: "战队周边", title: "赛事周边展示", tags: ["战队周边", "赛事", "收藏"], source: "本地素材库", theme: "merch" },
  { id: "local-desk-01", type: "桌搭氛围产品", title: "夜间氛围桌搭", tags: ["桌搭氛围产品", "灯效", "拍照"], source: "本地素材库", theme: "desk" }
];

const bannedDefaults = ["全网最强", "行业第一", "闭眼入", "颠覆体验", "极致性能", "永久有效", "百分百", "绝对"];

function splitList(value) {
  return (value || "")
    .split(/[、,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pick(list, index = 0) {
  if (!list.length) return "";
  return list[index % list.length];
}

function numberValue(value) {
  return Number.parseInt(value || "0", 10) || 0;
}

function collectFormData() {
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    productName: data.productName.trim(),
    productType: data.productType.trim(),
    sellingPoints: data.sellingPoints.trim(),
    targetUser: data.targetUser.trim(),
    campaignInfo: data.campaignInfo.trim(),
    postGoal: data.postGoal.trim(),
    tone: data.tone.trim(),
    blockedWords: data.blockedWords.trim(),
    feishuAppToken: data.feishuAppToken.trim(),
    feishuTableId: data.feishuTableId.trim(),
    feishuViewId: data.feishuViewId.trim(),
    assetSource: data.assetSource.trim(),
    layoutStyle: data.layoutStyle.trim(),
    assetKeywords: data.assetKeywords.trim(),
    impressions: numberValue(data.impressions),
    likes: numberValue(data.likes),
    comments: numberValue(data.comments),
    privateChats: numberValue(data.privateChats),
    orders: numberValue(data.orders),
    topCategory: data.topCategory.trim(),
    customerNotes: data.customerNotes.trim()
  };
}

function simulateFeishuSync(data) {
  const hasConfig = Boolean(data.feishuAppToken || data.feishuTableId || data.feishuViewId);
  return {
    ...feishuMock,
    mode: hasConfig ? "已读取连接配置，当前用模拟数据返回" : "未填写飞书配置，使用内置模拟营销表",
    config: {
      appToken: data.feishuAppToken || "未填写",
      tableId: data.feishuTableId || "未填写",
      viewId: data.feishuViewId || "未填写"
    }
  };
}

function organizeInput(data) {
  const points = splitList(data.sellingPoints);
  const users = splitList(data.targetUser);
  const campaign = splitList(data.campaignInfo);
  const blocked = [...new Set([...bannedDefaults, ...splitList(data.blockedWords)])];

  return {
    product: data.productName || "这款电竞产品",
    type: data.productType || "电竞产品",
    audience: users.length ? users : ["电竞玩家"],
    rawPoints: points.length ? points : ["手感稳定", "外观耐看", "适合日常开黑"],
    campaign: campaign.length ? campaign : ["可按实际活动信息补充"],
    goal: data.postGoal || "种草",
    tone: data.tone || "玩家口吻",
    blocked,
    assetSource: data.assetSource,
    layoutStyle: data.layoutStyle,
    assetKeywords: splitList(data.assetKeywords)
  };
}

function extractSellingPoints(info, opsLearning) {
  const scenes = sceneMap[info.type] || ["开黑", "桌搭", "日常游戏"];
  const rankedPoints = info.rawPoints.slice(0, 4);
  const painPoint = buildPainPoint(info.type);
  const hotCategoryHint = opsLearning.topCategory === info.type ? "该品类近期转化较好，可提高活动露出" : "该品类不是近期最热卖，可加强场景教育";
  const safeNotes = ["不要编造未提供的参数", "不要承诺一定提升战绩", "价格、库存、活动时间需运营确认"];

  return {
    audience: info.audience.join("、"),
    corePoints: rankedPoints.join("、"),
    scenes: scenes.slice(0, 3).join("、"),
    painPoint,
    angle: `${pick(info.audience)}在${pick(scenes)}时，想要一个更顺手、更不突兀的${info.type}`,
    opsHint: hotCategoryHint,
    safeNotes
  };
}

function buildPainPoint(type) {
  const map = {
    "无线鼠标": "鼠标拖后腿、手腕累、无线不跟手",
    "机械键盘": "键盘手感闷、桌面不统一、打字和游戏都不舒服",
    "电竞耳机": "听不清方位、戴久压耳、开黑沟通费劲",
    "电竞椅": "久坐腰背累、普通椅子支撑不够",
    "游戏手柄": "搓招不顺、握持不稳、长时间玩容易累",
    "战队周边": "想表达喜欢，但不想穿得太夸张",
    "桌搭氛围产品": "桌面杂乱，开黑和拍照都少点氛围"
  };
  return map[type] || "装备不顺手，影响游戏和日常体验";
}

function learnFromOps(data, feishu) {
  const impressions = data.impressions || 1;
  const engagementRate = ((data.likes + data.comments + data.privateChats) / impressions) * 100;
  const chatRate = (data.privateChats / impressions) * 100;
  const orderRate = (data.orders / impressions) * 100;
  const topCategory = data.topCategory || feishu.categoryStats[0].category;
  const notes = splitList(data.customerNotes);
  const bestCategory = feishu.categoryStats.slice().sort((a, b) => b.orders - a.orders)[0];

  const suggestions = [];
  if (engagementRate < 8) suggestions.push("互动率偏低，下一条文案开头加更具体的玩家场景或提问。");
  if (data.comments > data.privateChats) suggestions.push("评论多于私聊，适合在结尾加“要不要我发实拍/链接”把评论导向私聊。");
  if (data.privateChats > 0 && data.orders / Math.max(data.privateChats, 1) < 0.35) suggestions.push("私聊到成交偏弱，需要补充价格、库存、试用方式或常见疑虑回答。");
  if (bestCategory.category === data.productType) suggestions.push("飞书复盘显示该品类成交好，本条可更直接露出活动信息。");
  if (notes.some((note) => /价格|活动|结束|库存/.test(note))) suggestions.push("潜客在问活动门槛，文案里要明确活动截止或库存状态。");
  if (notes.some((note) => /实拍|图片|桌面|细节/.test(note))) suggestions.push("潜客想看实拍，首图优先用真实桌搭或手持细节图。");
  if (!suggestions.length) suggestions.push("当前数据健康，继续保持真实体验风，轻量增加购买入口即可。");

  return {
    engagementRate,
    chatRate,
    orderRate,
    topCategory,
    bestCategory,
    notes,
    suggestions
  };
}

function searchAssets(info, feishu, learning) {
  const sourceRows = info.assetSource === "飞书素材表" ? feishu.materialRows : localAssets;
  const allRows = info.assetSource === "图片搜索 API（模拟）" ? [...localAssets, ...feishu.materialRows] : sourceRows;
  const keywords = [...info.assetKeywords, info.type, ...info.rawPoints, ...learning.notes].map((item) => item.toLowerCase());

  const scored = allRows
    .map((asset) => {
      const tags = [asset.type, asset.title, ...(asset.tags || [])].join(" ").toLowerCase();
      const typeScore = asset.type === info.type ? 8 : 0;
      const keywordScore = keywords.reduce((sum, keyword) => sum + (keyword && tags.includes(keyword.toLowerCase()) ? 2 : 0), 0);
      const realShotBonus = /实拍|桌搭|细节/.test(learning.notes.join("、")) && /桌搭|细节|实拍|握感/.test(tags) ? 4 : 0;
      return {
        ...asset,
        theme: asset.theme || themeFromType(asset.type),
        score: typeScore + keywordScore + realShotBonus
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.length ? scored : localAssets.slice(0, 3);
}

function themeFromType(type) {
  const map = {
    "无线鼠标": "mouse",
    "机械键盘": "keyboard",
    "电竞耳机": "headset",
    "电竞椅": "chair",
    "游戏手柄": "gamepad",
    "战队周边": "merch",
    "桌搭氛围产品": "desk"
  };
  return map[type] || "desk";
}

function generateCopyDrafts(info, insight, learning) {
  const sceneA = pick((sceneMap[info.type] || ["晚上开黑"]), 0);
  const sceneB = pick((sceneMap[info.type] || ["宿舍桌面"]), 1);
  const mainPoint = pick(info.rawPoints, 0);
  const secondPoint = pick(info.rawPoints, 1);
  const thirdPoint = pick(info.rawPoints, 2);
  const campaign = info.campaign.join("，");
  const audience = pick(info.audience, 0);
  const customerQuestion = learning.notes.length ? `最近问得最多的是“${pick(learning.notes, 0)}”` : "最近被问得比较多";
  const categoryBoost = learning.bestCategory.category === info.type ? "这类最近确实更容易被问到。" : "";

  return [
    {
      style: "玩家真实体验风",
      draft: `这两天试了下${info.product}，最明显的感觉是${mainPoint}这点挺舒服。\n${sceneA}的时候不太会分心，${secondPoint || "整体也比较顺手"}。如果你也是${audience}，最近想换一件不折腾的装备，可以把它放进备选。\n${campaign}`
    },
    {
      style: "朋友安利风",
      draft: `${customerQuestion}，我一般会先看是不是适合自己的使用场景。\n${info.product}不是那种硬堆参数的感觉，重点是${mainPoint}，再加上${secondPoint || "日常用起来比较省心"}。\n${campaign}，想看实拍或者链接可以私我。`
    },
    {
      style: "数据反馈优化风",
      draft: `${sceneB}的时候，装备好不好用其实挺明显。\n${info.product}放在桌面上不突兀，${mainPoint}，${thirdPoint || secondPoint || "日常开黑也够用"}。${categoryBoost}\n想看细节图的话我可以单独发。`
    }
  ];
}

function humanizeCopy(text, blockedWords) {
  let result = text
    .replace(/强烈推荐/g, "可以看看")
    .replace(/值得入手/g, "可以放进备选")
    .replace(/体验拉满/g, "用着顺手")
    .replace(/极致/g, "比较")
    .replace(/绝对/g, "相对");

  blockedWords.forEach((word) => {
    if (word) result = result.replaceAll(word, "这个说法建议删掉");
  });

  return result
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function buildLayout(info, recommendation, assets) {
  const hero = assets[0];
  const subAssets = assets.slice(1);
  const shortText = recommendation.text.split("\n").slice(0, 2).join(" ");
  return {
    style: info.layoutStyle,
    hero,
    subAssets,
    headline: info.product,
    subtitle: info.rawPoints.slice(0, 3).join(" / "),
    caption: shortText.length > 88 ? `${shortText.slice(0, 88)}...` : shortText,
    cta: info.goal === "引导私聊" ? "想看实拍可以私我" : "今日朋友圈可发版本"
  };
}

function checkPublication(copies, info, assets, learning) {
  const riskWords = info.blocked.filter((word) => copies.some((item) => item.text.includes(word)));
  const tooLong = copies.filter((item) => item.text.length > 190).map((item) => item.style);
  const hasCampaign = info.campaign.some((item) => item.includes("可按实际"));
  const noAssets = !assets.length;
  const score = 100 - riskWords.length * 18 - tooLong.length * 8 - (hasCampaign ? 12 : 0) - (noAssets ? 18 : 0);

  let level = "高";
  if (score < 72) level = "中";
  if (score < 55) level = "低";

  return {
    level,
    score,
    issues: [
      riskWords.length ? `发现风险词：${riskWords.join("、")}` : "未发现明显绝对化风险词",
      tooLong.length ? `以下文案偏长：${tooLong.join("、")}` : "文案长度适合朋友圈",
      hasCampaign ? "活动信息不完整，需要运营补充价格、库存或时间" : "活动信息已被纳入文案",
      noAssets ? "未找到可用配图素材" : `已自动匹配 ${assets.length} 张素材，并生成排版预览`,
      learning.notes.length ? "已吸收潜客沟通摘要，调优文案和首图选择" : "未输入潜客沟通摘要，建议后续补充"
    ]
  };
}

function recommendCopy(copies, check, learning) {
  let priority = ["玩家真实体验风", "数据反馈优化风", "朋友安利风"];
  if (learning.privateChats > learning.comments) priority = ["朋友安利风", "数据反馈优化风", "玩家真实体验风"];
  if (learning.comments > learning.privateChats) priority = ["数据反馈优化风", "玩家真实体验风", "朋友安利风"];
  const recommended = priority.map((style) => copies.find((copy) => copy.style === style)).find(Boolean) || copies[0];
  return {
    style: recommended.style,
    text: recommended.text,
    reason: check.level === "高"
      ? "这条结合了当前运营反馈，场景、卖点和私聊引导都比较稳。"
      : "这条相对稳妥，但发布前仍建议补齐活动信息并删掉风险表达。"
  };
}

function runAgent(data) {
  const trace = [];
  trace.push("开始运行完整 Agent");

  const feishu = syncedFeishu || simulateFeishuSync(data);
  trace.push(`飞书节点完成：${feishu.mode}`);

  const learning = learnFromOps(data, feishu);
  trace.push(`运营学习完成：互动率 ${learning.engagementRate.toFixed(1)}%，热卖品类 ${learning.bestCategory.category}`);

  const info = organizeInput(data);
  trace.push(`信息整理完成：产品=${info.product}，类型=${info.type}`);

  const insight = extractSellingPoints(info, learning);
  trace.push(`卖点提炼完成：${insight.corePoints}`);

  const assets = searchAssets(info, feishu, learning);
  trace.push(`自动找配图完成：首图=${assets[0].title}，素材来源=${assets[0].source}`);

  const drafts = generateCopyDrafts(info, insight, learning);
  trace.push("已生成 3 条初稿：玩家真实体验风、朋友安利风、数据反馈优化风");

  const copies = drafts.map((item) => ({
    style: item.style,
    text: humanizeCopy(item.draft, info.blocked)
  }));
  trace.push("去 AI 味改写完成：删除模板词，补充使用场景和客户反馈");

  const temporaryCheck = { level: "高" };
  const recommendation = recommendCopy(copies, temporaryCheck, data);
  const layout = buildLayout(info, recommendation, assets);
  trace.push(`自动排版完成：${layout.style}`);

  const check = checkPublication(copies, info, assets, learning);
  trace.push(`发布前检查完成：可发布程度=${check.level}，评分=${check.score}`);

  const finalRecommendation = recommendCopy(copies, check, data);
  trace.push(`推荐发布：${finalRecommendation.style}`);

  return {
    feishu,
    info,
    insight,
    assets,
    copies,
    layout: buildLayout(info, finalRecommendation, assets),
    check,
    recommendation: finalRecommendation,
    learning,
    trace
  };
}

function renderResult(result) {
  emptyState.classList.add("hidden");
  resultArea.classList.remove("hidden");
  copyMarkdownBtn.disabled = false;
  workflowItems.forEach((item) => item.classList.add("active"));

  feishuBox.innerHTML = `
    <dl>
      <dt>同步状态</dt><dd>${escapeHtml(result.feishu.status)}</dd>
      <dt>表格</dt><dd>${escapeHtml(result.feishu.sheet)}</dd>
      <dt>同步时间</dt><dd>${escapeHtml(result.feishu.updatedAt)}</dd>
      <dt>近期热卖</dt><dd>${escapeHtml(result.learning.bestCategory.category)}，成交 ${result.learning.bestCategory.orders} 单</dd>
      <dt>客户高频问题</dt><dd>${escapeHtml(result.feishu.customerQuestions.join("、"))}</dd>
    </dl>
  `;

  insightBox.innerHTML = `
    <dl>
      <dt>适合人群</dt><dd>${escapeHtml(result.insight.audience)}</dd>
      <dt>核心卖点</dt><dd>${escapeHtml(result.insight.corePoints)}</dd>
      <dt>使用场景</dt><dd>${escapeHtml(result.insight.scenes)}</dd>
      <dt>痛点</dt><dd>${escapeHtml(result.insight.painPoint)}</dd>
      <dt>切入角度</dt><dd>${escapeHtml(result.insight.angle)}</dd>
      <dt>运营提示</dt><dd>${escapeHtml(result.insight.opsHint)}</dd>
      <dt>安全边界</dt><dd>${escapeHtml(result.insight.safeNotes.join("；"))}</dd>
    </dl>
  `;

  assetBox.innerHTML = result.assets
    .map((asset, index) => `
      <article class="asset-card">
        <div class="mock-image ${escapeHtml(asset.theme)}">
          <span>${index === 0 ? "首图" : `图 ${index + 1}`}</span>
        </div>
        <div>
          <h5>${escapeHtml(asset.title)}</h5>
          <p>${escapeHtml(asset.source)} · 匹配分 ${asset.score}</p>
          <p>${escapeHtml((asset.tags || []).join(" / "))}</p>
        </div>
      </article>
    `)
    .join("");

  layoutBox.innerHTML = `
    <div class="poster ${escapeHtml(result.layout.hero.theme)}">
      <div class="poster-media">
        <span>${escapeHtml(result.layout.hero.title)}</span>
      </div>
      <div class="poster-copy">
        <p class="poster-label">${escapeHtml(result.layout.style)}</p>
        <h5>${escapeHtml(result.layout.headline)}</h5>
        <p>${escapeHtml(result.layout.subtitle)}</p>
        <p>${escapeHtml(result.layout.caption)}</p>
        <strong>${escapeHtml(result.layout.cta)}</strong>
      </div>
    </div>
    <div class="layout-notes">
      <p>排版策略：首图用最高匹配素材，正文区保留产品名、3 个卖点和轻私聊引导；适合朋友圈单图或九宫格首图。</p>
    </div>
  `;

  copyCards.innerHTML = result.copies
    .map((item, index) => `
      <article class="copy-card">
        <h5>文案 ${index + 1}：${escapeHtml(item.style)}</h5>
        <p class="copy-text">${escapeHtml(item.text)}</p>
      </article>
    `)
    .join("");

  recommendBox.innerHTML = `
    <strong>推荐：${escapeHtml(result.recommendation.style)}</strong>
    <p>${escapeHtml(result.recommendation.reason)}</p>
    <p>${escapeHtml(result.recommendation.text)}</p>
  `;

  learningBox.innerHTML = `
    <article>
      <h5>运营指标</h5>
      <p>互动率：${result.learning.engagementRate.toFixed(1)}%</p>
      <p>私聊率：${result.learning.chatRate.toFixed(1)}%</p>
      <p>成交率：${result.learning.orderRate.toFixed(1)}%</p>
    </article>
    <article>
      <h5>反馈学习</h5>
      <ul>${result.learning.suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
    <article>
      <h5>下一轮建议</h5>
      <p>优先补充客户问得最多的问题，首图选实拍/细节图，结尾把评论引导到私聊。</p>
    </article>
  `;

  const riskClass = result.check.level === "高" ? "risk-low" : result.check.level === "中" ? "risk-mid" : "risk-high";
  checkBox.innerHTML = `
    <p>可发布程度：<span class="${riskClass}">${result.check.level}</span>，综合评分：${result.check.score}/100</p>
    <ul>
      ${result.check.issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("")}
    </ul>
  `;

  traceLog.textContent = result.trace.map((item, index) => `${index + 1}. ${item}`).join("\n");
  latestMarkdown = buildMarkdown(result);
}

function buildMarkdown(result) {
  const copies = result.copies
    .map((item, index) => `### 文案 ${index + 1}：${item.style}\n\n${item.text}`)
    .join("\n\n");
  const assets = result.assets.map((item, index) => `- ${index + 1}. ${item.title}｜${item.source}｜匹配分 ${item.score}`).join("\n");
  const suggestions = result.learning.suggestions.map((item) => `- ${item}`).join("\n");

  return `# 电竞朋友圈文案 Agent 运行结果

## 飞书同步

- 状态：${result.feishu.status}
- 表格：${result.feishu.sheet}
- 近期热卖：${result.learning.bestCategory.category}

## 产品卖点提炼

- 适合人群：${result.insight.audience}
- 核心卖点：${result.insight.corePoints}
- 使用场景：${result.insight.scenes}
- 痛点：${result.insight.painPoint}
- 切入角度：${result.insight.angle}
- 运营提示：${result.insight.opsHint}

## 自动配图

${assets}

## 自动排版

- 样式：${result.layout.style}
- 首图：${result.layout.hero.title}
- 标题：${result.layout.headline}
- CTA：${result.layout.cta}

## 三条朋友圈文案

${copies}

## 推荐发布

- 推荐：${result.recommendation.style}
- 理由：${result.recommendation.reason}

${result.recommendation.text}

## 运营反馈学习

- 互动率：${result.learning.engagementRate.toFixed(1)}%
- 私聊率：${result.learning.chatRate.toFixed(1)}%
- 成交率：${result.learning.orderRate.toFixed(1)}%

${suggestions}

## 发布前检查

- 可发布程度：${result.check.level}
- 综合评分：${result.check.score}/100
${result.check.issues.map((issue) => `- ${issue}`).join("\n")}

## 中间链路日志

${result.trace.map((item, index) => `${index + 1}. ${item}`).join("\n")}
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fillForm(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = document.querySelector(`#${key}`);
    if (field) field.value = value;
  });
}

function syncFeishu() {
  const data = collectFormData();
  syncedFeishu = simulateFeishuSync(data);
  fillForm({
    impressions: "1280",
    likes: "92",
    comments: "28",
    privateChats: "19",
    orders: "7",
    topCategory: syncedFeishu.categoryStats[0].category,
    customerNotes: syncedFeishu.customerQuestions.join("；")
  });
  syncFeishuBtn.textContent = "已同步";
  setTimeout(() => {
    syncFeishuBtn.textContent = "模拟同步飞书";
  }, 1200);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = collectFormData();
  const result = runAgent(data);
  renderResult(result);
});

loadExampleBtn.addEventListener("click", () => {
  fillForm(example);
});

syncFeishuBtn.addEventListener("click", syncFeishu);

resetBtn.addEventListener("click", () => {
  form.reset();
  syncedFeishu = null;
  emptyState.classList.remove("hidden");
  resultArea.classList.add("hidden");
  copyMarkdownBtn.disabled = true;
  latestMarkdown = "";
  workflowItems.forEach((item, index) => item.classList.toggle("active", index === 0));
});

copyMarkdownBtn.addEventListener("click", async () => {
  if (!latestMarkdown) return;
  try {
    await navigator.clipboard.writeText(latestMarkdown);
    copyMarkdownBtn.textContent = "已复制";
    setTimeout(() => {
      copyMarkdownBtn.textContent = "复制结果 Markdown";
    }, 1200);
  } catch {
    window.prompt("复制下面的 Markdown：", latestMarkdown);
  }
});

workflowItems.forEach((item) => {
  item.addEventListener("click", () => {
    const contract = interfaceContracts[item.dataset.node];
    if (!contract) return;
    interfaceCard.innerHTML = `
      <h2>接口契约</h2>
      <p class="interface-name">${escapeHtml(contract.name)}</p>
      <dl>
        <dt>输入</dt><dd>${escapeHtml(contract.input)}</dd>
        <dt>输出</dt><dd>${escapeHtml(contract.output)}</dd>
        <dt>说明</dt><dd>${escapeHtml(contract.note)}</dd>
      </dl>
    `;
  });
});
