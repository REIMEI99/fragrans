export function RulesPanel() {
  return (
    <section className="panel panel-compact">
      <div className="panel-header">
        <h2>规则摘要</h2>
      </div>

      <div className="brief-list">
        <article className="brief">
          <div className="eyebrow">01. Turn Flow</div>
          <h3>每轮从 4 选 2，且必须全部使用</h3>
          <p>香材放入同一瓶时必须从左到右填格。达到 3 格后可手动封瓶，否则继续承受挥发压力。</p>
        </article>

        <article className="brief">
          <div className="eyebrow">02. Scoring</div>
          <h3>基础分 + 排列分 + 浓度分 + 顾客分 - 腐朽扣分</h3>
          <p>基础分为 1 / 2 / 4 / 6；排列链长 2 / 3 / 4 / 5 / 6 得 1 / 2 / 3 / 5 / 8。</p>
        </article>

        <article className="brief">
          <div className="eyebrow">03. Decay</div>
          <h3>新鲜 → 变淡 → 腐朽</h3>
          <p>腐朽会移除第 1 格并左移整瓶，同时增加 1 个腐朽标记；每个腐朽标记在结算时 -2 分。</p>
        </article>
      </div>
    </section>
  );
}
