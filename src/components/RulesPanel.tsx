export function RulesPanel() {
  return (
    <section className="panel rules-panel">
      <div className="panel-header">
        <h2>当前规则</h2>
      </div>

      <div className="rules-grid">
        <div className="rule-card">
          <h3>封瓶条件</h3>
          <p>一瓶香水达到 3 格以上，就允许在本轮手动封瓶。</p>
        </div>

        <div className="rule-card">
          <h3>总分公式</h3>
          <p>
            总分 = <strong>基础分</strong> + <strong>排列分</strong> + <strong>浓度分</strong> +{" "}
            <strong>顾客奖励</strong> - <strong>腐朽扣分</strong>
          </p>
        </div>

        <div className="rule-card">
          <h3>基础分</h3>
          <p>3 格 = 1 分</p>
          <p>4 格 = 2 分</p>
          <p>5 格 = 4 分</p>
          <p>6 格 = 6 分</p>
        </div>

        <div className="rule-card">
          <h3>排列分</h3>
          <p>固定顺序：柑橘 → 绿叶 → 花香 → 果香 → 木质 → 辛香</p>
          <p>只看瓶内最长的、连续相邻且符合这个顺序的链条。</p>
          <p>长度 2 / 3 / 4 / 5 / 6，对应 +1 / +2 / +3 / +5 / +8。</p>
        </div>

        <div className="rule-card">
          <h3>浓度分</h3>
          <p>看完全相同香材的最大重复数。</p>
          <p>重复 2 / 3 / 4 / 5 / 6 次，对应 +1 / +3 / +5 / +7 / +10。</p>
        </div>

        <div className="rule-card">
          <h3>顾客奖励</h3>
          <p>场上常驻 2 张公共顾客卡。</p>
          <p>手动封瓶时每满足 1 张，获得 +4。</p>
          <p>完成的顾客卡立刻离场，并从牌库补到 2 张。</p>
          <p>同一瓶最多可同时拿到 +8。</p>
        </div>

        <div className="rule-card">
          <h3>挥发规则</h3>
          <p>香水到 3 格后开始挥发：新鲜 → 变淡 → 腐朽。</p>
          <p>腐朽时移除第 1 格，其余全部左移 1 格，并加 1 个腐朽标记。</p>
          <p>每个腐朽标记在总分里 -2。</p>
        </div>

        <div className="rule-card">
          <h3>终局</h3>
          <p>10 轮后进入终局补封。</p>
          <p>第 10 轮结尾先挥发，再自动封瓶。</p>
          <p>自动封瓶没有顾客奖励。</p>
        </div>
      </div>
    </section>
  );
}
