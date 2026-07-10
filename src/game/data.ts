import type { CustomerCard, Density, Ingredient } from "./types";

export const INGREDIENT_INFO: Record<
  Ingredient,
  { label: string; density: Density; short: string; color: string; order: number }
> = {
  citrus: { label: "柑橘", density: "light", short: "柑", color: "#ffb347", order: 0 },
  green: { label: "绿叶", density: "light", short: "绿", color: "#7cb342", order: 1 },
  floral: { label: "花香", density: "mid", short: "花", color: "#ff7aa2", order: 2 },
  fruit: { label: "果香", density: "mid", short: "果", color: "#f06292", order: 3 },
  wood: { label: "木质", density: "heavy", short: "木", color: "#8d6e63", order: 4 },
  spice: { label: "辛香", density: "heavy", short: "辛", color: "#c77d3a", order: 5 },
};

export const POSITION_INFO = [
  { index: 0, label: "1", name: "开场", expected: "light" as Density },
  { index: 1, label: "2", name: "延展", expected: "light" as Density },
  { index: 2, label: "3", name: "主体", expected: "mid" as Density },
  { index: 3, label: "4", name: "转折", expected: "mid" as Density },
  { index: 4, label: "5", name: "落点", expected: "heavy" as Density },
  { index: 5, label: "6", name: "余韵", expected: "heavy" as Density },
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
  { id: "c1", title: "渐进感", text: "最长排列链长度至少为 2：+4", predicate: { type: "runAtLeast", length: 2 } },
  { id: "c2", title: "长句子", text: "最长排列链长度至少为 3：+4", predicate: { type: "runAtLeast", length: 3 } },
  { id: "c3", title: "偏爱重复", text: "存在同一香材至少重复 2 次：+4", predicate: { type: "sameIngredientAtLeast", count: 2 } },
  { id: "c4", title: "强烈执念", text: "存在同一香材至少重复 3 次：+4", predicate: { type: "sameIngredientAtLeast", count: 3 } },
  { id: "c5", title: "木辛尾调", text: "存在相邻“木质 → 辛香”：+4", predicate: { type: "containsPairAdjacent", pair: ["wood", "spice"] } },
  { id: "c6", title: "花果转折", text: "存在相邻“花香 → 果香”：+4", predicate: { type: "containsPairAdjacent", pair: ["floral", "fruit"] } },
  { id: "c7", title: "柑橘开场", text: "第 1 格是柑橘：+4", predicate: { type: "startsWith", ingredient: "citrus" } },
  { id: "c8", title: "辛香收尾", text: "最后一格是辛香：+4", predicate: { type: "endsWith", ingredient: "spice" } },
  { id: "c9", title: "自然线条", text: "同时包含柑橘、花香、木质：+4", predicate: { type: "containsIngredients", ingredients: ["citrus", "floral", "wood"] } },
  { id: "c10", title: "繁复成香", text: "香材数至少为 5：+4", predicate: { type: "bottleSizeAtLeast", count: 5 } },
  { id: "c11", title: "满而不重", text: "6 格全满且没有重复香材：+4", predicate: { type: "allDistinct" } },
  { id: "c12", title: "两头张扬", text: "同时满足第 1 格是柑橘且最后一格是辛香：+4", predicate: { type: "containsIngredients", ingredients: ["citrus", "spice"] } },
];
