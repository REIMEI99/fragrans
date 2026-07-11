interface RulesPanelProps {
  onOpenRulebook: () => void;
  onStartTutorial: () => void;
}

export function RulesPanel({ onOpenRulebook, onStartTutorial }: RulesPanelProps) {
  return (
    <section className="panel panel-compact">
      <div className="panel-header">
        <h2>说明入口</h2>
      </div>

      <div className="brief-list">
        <article className="brief">
          <div className="eyebrow">01. 新手教程</div>
          <h3>用固定脚本带你走完一遍关键机制</h3>
          <p>教程模式会用预设回合与预设香料，逐步演示选牌、放置、挥发、腐朽、顾客与封瓶的节奏。</p>
          <button type="button" onClick={onStartTutorial}>
            开始新手教程
          </button>
        </article>

        <article className="brief">
          <div className="eyebrow">02. 完整规则</div>
          <h3>随时查看完整计分与回合说明</h3>
          <p>如果你想直接查表，或者回顾基础分、排列分、浓度分与顾客分的构成，可以打开完整规则。</p>
          <button type="button" onClick={onOpenRulebook}>
            打开完整规则
          </button>
        </article>
      </div>
    </section>
  );
}

export function RulebookModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="rulebook-backdrop" role="dialog" aria-modal="true" aria-labelledby="rulebook-title">
      <section className="rulebook">
        <div className="panel-header">
          <h2 id="rulebook-title">余香完整规则</h2>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="rulebook__body">
          <article className="brief">
            <div className="eyebrow">A. 游戏目标</div>
            <h3>在 10 回合里完成尽可能高分的香水</h3>
            <p>你要在有限回合内平衡顺序、重复、顾客需求和腐朽风险，尽量在合适时机封瓶拿分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">B. 每回合做什么</div>
            <h3>从 4 张香料中选 2 张，而且必须全部使用</h3>
            <p>你可以把两张香料放进同一瓶，也可以拆到两瓶；但每一瓶都只能从上到下依次填入，不能跳格。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">C. 封瓶</div>
            <h3>达到 3 格后可以在回合末手动封瓶</h3>
            <p>手动封瓶会立刻结算这瓶的分数，并在满足条件时获得当前公共顾客池的奖励。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">D. 挥发与腐朽</div>
            <h3>达到 3 格后，未封瓶香水会开始老化</h3>
            <p>新鲜会在回合结束时变淡，变淡再拖一回合就会腐朽。腐朽时最上方一格消失，其余成分上移，并获得 1 个腐朽标记。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">E. 排列链</div>
            <h3>顺序链为：柑橘 → 绿叶 → 花香 → 果香 → 木质 → 沉香</h3>
            <p>结算时看这瓶里最长的一段连续顺序链，长度 2 / 3 / 4 / 5 / 6 分别记 1 / 2 / 3 / 5 / 7 分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">F. 总分结构</div>
            <h3>封瓶总分 = 基础分 + 排列分 + 浓度分 + 顾客分 - 腐朽扣分</h3>
            <p>基础分看格数，排列分看顺序链，浓度分看同种香料重复次数，顾客分只在手动封瓶时结算。每个腐朽标记最终 -2 分。</p>
          </article>
        </div>
      </section>
    </div>
  );
}
