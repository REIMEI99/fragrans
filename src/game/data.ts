import type { CustomerCard, Density, Ingredient } from "./types";

export const INGREDIENT_INFO: Record<
  Ingredient,
  { label: string; density: Density; short: string; color: string; order: number }
> = {
  citrus: { label: "柑橘", density: "light", short: "柑", color: "#efe0bb", order: 0 },
  green: { label: "绿叶", density: "light", short: "绿", color: "#cddcb8", order: 1 },
  floral: { label: "花香", density: "mid", short: "花", color: "#e9c7cf", order: 2 },
  fruit: { label: "果香", density: "mid", short: "果", color: "#e8bbad", order: 3 },
  wood: { label: "木质", density: "heavy", short: "木", color: "#cbb9ab", order: 4 },
  spice: { label: "辛香", density: "heavy", short: "辛", color: "#c6a17e", order: 5 },
};

export const POSITION_INFO = [
  { index: 0, label: "I", name: "开场", expected: "light" as Density },
  { index: 1, label: "II", name: "延展", expected: "light" as Density },
  { index: 2, label: "III", name: "主体", expected: "mid" as Density },
  { index: 3, label: "IV", name: "转折", expected: "mid" as Density },
  { index: 4, label: "V", name: "落点", expected: "heavy" as Density },
  { index: 5, label: "VI", name: "余韵", expected: "heavy" as Density },
];

export const BASE_SCORE_BY_COUNT: Record<number, number> = {
  3: 1,
  4: 2,
  5: 4,
  6: 6,
};

export const ORDER_SCORE_BY_LENGTH: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 5,
  6: 8,
};

export const DENSITY_SCORE_BY_REPEAT: Record<number, number> = {
  2: 1,
  3: 3,
  4: 5,
  5: 7,
  6: 10,
};

export const CUSTOMER_CARDS: CustomerCard[] = [
  {
    id: "c1",
    title: "双调成型",
    text: "恰好有 2 种香材。",
    reward: 3,
    predicate: { type: "uniqueIngredientExactly", count: 2 },
  },
  {
    id: "c2",
    title: "五味并陈",
    text: "恰好有 5 种香材。",
    reward: 4,
    predicate: { type: "uniqueIngredientExactly", count: 5 },
  },
  {
    id: "c3",
    title: "六种全开",
    text: "6 格全满且 6 种香材都不同。",
    reward: 8,
    predicate: { type: "allDistinct" },
  },
  {
    id: "c4",
    title: "双对回环",
    text: "恰好有两种香材各重复 2 次。",
    reward: 4,
    predicate: { type: "ingredientsRepeatedExactly", repeatCount: 2, ingredientKinds: 2 },
  },
  {
    id: "c5",
    title: "核心主调",
    text: "恰好有 4 种香材，且其中 1 种重复 3 次。",
    reward: 6,
    predicate: { type: "countPattern", counts: [3, 1, 1, 1] },
  },
  {
    id: "c6",
    title: "即刻封存",
    text: "恰好 3 格时封瓶。",
    reward: 4,
    predicate: { type: "bottleSizeExactly", count: 3 },
  },
  {
    id: "c7",
    title: "四格成章",
    text: "恰好 4 格时封瓶。",
    reward: 3,
    predicate: { type: "bottleSizeExactly", count: 4 },
  },
  {
    id: "c8",
    title: "无伤扩写",
    text: "5 格及以上封瓶，且没有腐朽标记。",
    reward: 3,
    predicate: { type: "bottleSizeAtLeastAndRotExactly", minimum: 5, rotCount: 0 },
  },
  {
    id: "c9",
    title: "带伤封瓶",
    text: "带 1 个腐朽标记封瓶。",
    reward: 3,
    predicate: { type: "rotTokensExactly", count: 1 },
  },
  {
    id: "c10",
    title: "五格发表",
    text: "恰好 5 格时封瓶。",
    reward: 4,
    predicate: { type: "bottleSizeExactly", count: 5 },
  },
  {
    id: "c11",
    title: "余味将散",
    text: "在变淡阶段封瓶。",
    reward: 4,
    predicate: { type: "stageIs", stage: "faded" },
  },
  {
    id: "c12",
    title: "三向均衡",
    text: "恰好有 3 种香材，且三种都各重复 2 次。",
    reward: 6,
    predicate: { type: "countPattern", counts: [2, 2, 2] },
  },
];
