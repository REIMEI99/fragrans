import { CUSTOMER_CARDS } from "../game/data";
import { createBottle } from "../game/rules";
import type { Bottle, CustomerCard, GameState, Ingredient } from "../game/types";
import type { TutorialStep } from "./types";

function bottle(index: 0 | 1, ingredients: Ingredient[], stage: Bottle["stage"] = "none", rotTokens = 0): Bottle {
  const next = createBottle(index);
  ingredients.forEach((ingredient, slotIndex) => {
    next.slots[slotIndex] = { ingredient, state: "filled" };
  });
  next.stage = stage;
  next.rotTokens = rotTokens;
  return next;
}

function board({
  round,
  phase,
  bottles,
  rolledDice,
  chosenDice = [],
  pendingDice = [],
  score = 0,
  currentCustomers = [],
}: {
  round: number;
  phase: GameState["phase"];
  bottles: GameState["bottles"];
  rolledDice: Ingredient[];
  chosenDice?: number[];
  pendingDice?: number[];
  score?: number;
  currentCustomers?: CustomerCard[];
}): GameState {
  return {
    phase,
    seed: 0,
    rngState: 0,
    round,
    maxRounds: 10,
    score,
    bottles,
    sealedBottles: [],
    customerDeck: [],
    currentCustomers,
    rolledDice,
    chosenDice,
    pendingDice,
    log: [],
  };
}

const tutorialCustomer: CustomerCard = {
  id: "tutorial-chain",
  title: "长链偏好",
  text: "如果这瓶香水的最长排列链大于 3，手动封瓶时额外 +4 分。",
  reward: 4,
  predicate: { type: "bottleSizeAtLeast", count: 5 },
};

const spareCustomer = CUSTOMER_CARDS[0] ?? tutorialCustomer;

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "欢迎来到《余香》",
    body: "欢迎来到《余香》！这是一款在10回合内选择香料卡片填入香水瓶，以获得最高调香分数为目标的游戏。",
    highlightTargets: ["draft-panel", "bottle-0", "bottle-1", "top-action-bar"],
    board: board({
      round: 1,
      phase: "choose",
      bottles: [null, null],
      rolledDice: ["citrus", "green", "floral", "fruit"],
    }),
    completion: { type: "manual" },
    primaryLabel: "开始教程",
  },
  {
    id: "empty-bottles",
    title: "空香水瓶",
    body: "开局时，你拥有2个空香水瓶。之后一旦任意一瓶香水做好，就可以腾出空位给一个新的空香水瓶。",
    highlightTargets: ["bottle-0", "bottle-1"],
    board: board({
      round: 1,
      phase: "choose",
      bottles: [null, null],
      rolledDice: ["citrus", "green", "floral", "fruit"],
    }),
    completion: { type: "manual" },
  },
  {
    id: "pick-citrus-green",
    title: "选择香料",
    body: "下面是本回合可以用的4个香料。先尝试选择【柑橘】和【绿叶】。",
    highlightTargets: ["draft-panel", "draft-card-0", "draft-card-1"],
    board: board({
      round: 1,
      phase: "choose",
      bottles: [null, null],
      rolledDice: ["citrus", "green", "floral", "fruit"],
    }),
    completion: { type: "confirm_choice", draftIndexes: [0, 1] },
  },
  {
    id: "place-citrus",
    title: "放入柑橘",
    body: "现在只剩下这两个香料了，点选【柑橘】放入第一个空瓶。香料会自动按照进入瓶子的顺序自上至下排列。",
    highlightTargets: ["draft-card-0", "bottle-0"],
    board: board({
      round: 1,
      phase: "place",
      bottles: [null, null],
      rolledDice: ["citrus", "green"],
      pendingDice: [0, 1],
    }),
    completion: { type: "place_die", draftIndex: 0, bottleIndex: 0 },
  },
  {
    id: "place-green",
    title: "放入绿叶",
    body: "继续点选【绿叶】放入第一个空瓶，它排在【柑橘】下面。",
    highlightTargets: ["draft-card-1", "bottle-0"],
    board: board({
      round: 1,
      phase: "place",
      bottles: [bottle(0, ["citrus"]), null],
      rolledDice: ["citrus", "green"],
      pendingDice: [1],
    }),
    completion: { type: "place_die", draftIndex: 1, bottleIndex: 0 },
  },
  {
    id: "score-intro",
    title: "记分说明",
    body:
      "注意！这时瓶子下方开始出现这瓶香水的记分了。\n**基础分数**由瓶子里填满的格数决定，但现在的格数还太少，不会计分。\n**排列分数**由这瓶香水中最长的符合“柑橘-绿叶-花香-果香-木质-辛香”这一链条的长度决定。这里的长度是2，记1分。\n**浓度分数**由这瓶香水中重复次数最多的香料决定。这里还没有重复的香料，也不计分。",
    highlightTargets: ["bottle-0", "score-panel"],
    board: board({
      round: 1,
      phase: "seal",
      bottles: [bottle(0, ["citrus", "green"]), null],
      rolledDice: [],
      score: 0,
    }),
    completion: { type: "manual" },
  },
  {
    id: "finish-round-one",
    title: "结束回合",
    body: "现在没有事情可以做了，点击上方的“回合结束”。",
    highlightTargets: ["top-action-bar"],
    board: board({
      round: 1,
      phase: "seal",
      bottles: [bottle(0, ["citrus", "green"]), null],
      rolledDice: [],
    }),
    completion: { type: "finish_round" },
  },
  {
    id: "second-round-overview",
    title: "延续排列",
    body: "进入下一个回合，新的4个香料出现了。为了延续我们的排列，我们直接选择【花香】和【果香】放入第一个瓶子。点击【下一步】，系统会自动操作。",
    highlightTargets: ["draft-panel", "draft-card-0", "draft-card-1", "bottle-0"],
    board: board({
      round: 2,
      phase: "choose",
      bottles: [bottle(0, ["citrus", "green", "floral", "fruit"], "fresh"), null],
      rolledDice: ["floral", "fruit", "wood", "spice"],
    }),
    completion: { type: "manual" },
  },
  {
    id: "fresh-stage",
    title: "新鲜状态",
    body: "注意！此时瓶子下方出现了【新鲜】的标识。由于半成品一直敞口放置着，在任何一瓶香水达到3格后，挥发就会开始。所有【新鲜】的香水在回合结束时会【变淡】。",
    highlightTargets: ["bottle-0", "score-panel"],
    board: board({
      round: 2,
      phase: "seal",
      bottles: [bottle(0, ["citrus", "green", "floral", "fruit"], "fresh"), null],
      rolledDice: [],
    }),
    completion: { type: "manual" },
  },
  {
    id: "faded-stage",
    title: "变淡状态",
    body: "结束回合，我们看看接下来会发生什么。注意看，现在第一瓶香水已经变淡了。",
    highlightTargets: ["bottle-0", "top-action-bar"],
    board: board({
      round: 3,
      phase: "choose",
      bottles: [bottle(0, ["citrus", "green", "floral", "fruit"], "faded"), null],
      rolledDice: ["floral", "floral", "citrus", "green"],
    }),
    completion: { type: "manual" },
  },
  {
    id: "second-bottle-plan",
    title: "第二瓶规划",
    body: "下一回合，我们的4个香料是【花香】【花香】【柑橘】【绿叶】，显然第一瓶香水的排列无法延续下去了，因此选择【柑橘】和【绿叶】放在第二瓶香水的前两格。",
    highlightTargets: ["draft-panel", "bottle-1"],
    board: board({
      round: 3,
      phase: "choose",
      bottles: [bottle(0, ["citrus", "green", "floral", "fruit"], "faded"), bottle(1, ["citrus", "green"])],
      rolledDice: ["floral", "floral", "citrus", "green"],
    }),
    completion: { type: "manual" },
  },
  {
    id: "rot-intro",
    title: "腐朽发生",
    body:
      "结束回合。等等，第一瓶香水发生了什么？\n所有已经【变淡】的香水在回合结束时会【腐朽】，最上方一格的成分消失，其它成分依次向上移动一格，然后回到【新鲜】状态，同时获得一个腐朽标记——这会在结算时减分。所以记得控制每瓶香水完成的轮次，当然或许也可以利用这个机制来更好地排列香气成分！",
    highlightTargets: ["bottle-0", "score-panel"],
    board: board({
      round: 4,
      phase: "choose",
      bottles: [bottle(0, ["green", "floral", "fruit"], "fresh", 1), bottle(1, ["citrus", "green"], "none")],
      rolledDice: ["wood", "spice", "floral", "citrus"],
    }),
    completion: { type: "manual" },
  },
  {
    id: "customer-opportunity",
    title: "顾客奖励",
    body: "下一回合，选择【木质】和【辛香】放入第一瓶香水，这样我们的排列依然能达到5。同时注意看上方的【公共顾客池】——这位顾客想要排列大于3的香水，我们的香水符合这个条件。因此现在给香水封瓶，不但能获得三类计分之和，还能获得额外的顾客卡牌加分！现在点击最上方的【封一号瓶】来封瓶。",
    highlightTargets: ["bottle-0", "customer-pool", "top-action-bar"],
    board: board({
      round: 4,
      phase: "seal",
      bottles: [bottle(0, ["green", "floral", "fruit", "wood", "spice"], "fresh", 1), bottle(1, ["citrus", "green"])],
      rolledDice: [],
      currentCustomers: [tutorialCustomer, spareCustomer],
    }),
    completion: { type: "seal_bottle", bottleIndex: 0 },
  },
  {
    id: "tutorial-finish",
    title: "教程结束",
    body: "更具体的计分规则可以在进入游戏后，查看页面底部的游戏说明。现在，在10个回合内尽可能多地制作高分香水吧！祝你好运！",
    highlightTargets: ["score-panel", "customer-pool", "bottle-1"],
    board: board({
      round: 4,
      phase: "finished",
      bottles: [null, bottle(1, ["citrus", "green"])],
      rolledDice: [],
      score: 11,
      currentCustomers: [spareCustomer],
    }),
    completion: { type: "manual" },
    primaryLabel: "结束教程",
  },
];
