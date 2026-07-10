interface RulesPanelProps {
  onOpenRulebook: () => void;
}

export function RulesPanel({ onOpenRulebook }: RulesPanelProps) {
  return (
    <section className="panel panel-compact">
      <div className="panel-header">
        <h2>完整规则</h2>
        <button type="button" onClick={onOpenRulebook}>
          打开说明
        </button>
      </div>

      <div className="brief-list">
        <article className="brief">
          <div className="eyebrow">01. 回合流程</div>
          <h3>每回合从 4 个香材中选 2 个，而且必须全部使用</h3>
          <p>你可以把两枚香材放进同一瓶或分到两瓶，但每瓶都必须按 1 到 6 格从左到右依次填入，不能跳格，不能丢弃。</p>
        </article>

        <article className="brief">
          <div className="eyebrow">02. 封瓶与挥发</div>
          <h3>3 格起可以手动封瓶，不封就继续暴露在挥发风险里</h3>
          <p>一瓶香水到 3 格后会开始经历“新鲜 → 变淡 → 腐朽”。腐朽会移除第 1 格，整体左移 1 格，并加入 1 个腐朽标记。</p>
        </article>

        <article className="brief">
          <div className="eyebrow">03. 计分结构</div>
          <h3>基础分 + 排列分 + 浓度分 + 顾客分 - 腐朽扣分</h3>
          <p>基础分看格数，排列分看顺序链，浓度分看同种香材重复数，顾客分只在当回合手动封瓶时结算。每个腐朽标记最终 -2 分。</p>
        </article>

        <article className="brief">
          <div className="eyebrow">04. 完整说明</div>
          <h3>首次进入建议先看完整规则</h3>
          <p>上方按钮会打开完整说明，里面会把开局、放置、封瓶、顾客、挥发和全部计分表一次写清楚。</p>
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
            开始试玩
          </button>
        </div>

        <div className="rulebook__body">
          <article className="brief">
            <div className="eyebrow">A. 游戏目标</div>
            <h3>在 10 回合里完成两瓶高分香水</h3>
            <p>你要在有限回合内平衡顺序、重复、顾客需求和腐朽风险，尽量在合适时机封瓶拿分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">B. 每回合做什么</div>
            <h3>抽 4 选 2，然后把这 2 个都放掉</h3>
            <p>每回合会出现 4 个香材。你必须选其中 2 个，并且这 2 个都要在本回合放进香水瓶里，不能弃掉。</p>
            <p>你可以两枚都放同一瓶，也可以一枚一瓶；但同一瓶永远只能从左往右填，先填 1 格，再填 2 格，直到 6 格。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">C. 封瓶</div>
            <h3>香水达到 3 格后，可以在回合末手动封瓶</h3>
            <p>手动封瓶会立刻结算这瓶的分数，并且如果满足当前两张顾客卡的条件，还会拿到对应顾客奖励。</p>
            <p>第 10 回合结束后，所有未封瓶香水会自动封瓶，但自动封瓶不享受顾客加分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">D. 挥发与腐朽</div>
            <h3>未封瓶且达到 3 格的香水，会在每回合结尾继续老化</h3>
            <p>状态按“新鲜 → 变淡 → 腐朽”推进。到腐朽时，这瓶香水会移除最左侧第 1 格，其余香材整体左移，并加入 1 个腐朽标记。</p>
            <p>每个腐朽标记在最终结算时都会 -2 分，所以拖太久会伤分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">E. 香材与顺序链</div>
            <h3>六种香材的顺序链为：柑橘 → 绿叶 → 花香 → 果香 → 木质 → 辛香</h3>
            <p>结算时只看这瓶香水里“最长的一段连续顺序链”。长度 2 / 3 / 4 / 5 / 6，分别得到 1 / 2 / 3 / 5 / 7 分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">F. 全部计分</div>
            <h3>封瓶总分 = 基础分 + 排列分 + 浓度分 + 顾客分 - 腐朽扣分</h3>
            <p>基础分：3 / 4 / 5 / 6 格，分别得 1 / 2 / 4 / 6 分。</p>
            <p>排列分：顺序链长度 2 / 3 / 4 / 5 / 6，分别得 1 / 2 / 3 / 5 / 7 分。</p>
            <p>浓度分：同一种香材最多重复 2 / 3 / 4 / 5 / 6 次，分别得 1 / 3 / 5 / 7 / 10 分。</p>
            <p>顾客分：只在当回合手动封瓶时结算，满足哪张顾客卡就拿那张卡写明的分数。</p>
            <p>腐朽扣分：每个腐朽标记 -2 分。</p>
          </article>

          <article className="brief">
            <div className="eyebrow">G. 顾客机制</div>
            <h3>场上永远展示 2 张顾客卡</h3>
            <p>当你手动封瓶时，如果这瓶满足其中一张或两张顾客卡，就拿到对应奖励，并将完成的卡从公共牌池中补新。</p>
          </article>
        </div>
      </section>
    </div>
  );
}
