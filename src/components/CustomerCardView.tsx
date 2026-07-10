import type { CustomerCard } from "../game/types";

interface CustomerCardViewProps {
  customers: CustomerCard[];
}

export function CustomerCardView({ customers }: CustomerCardViewProps) {
  return (
    <section className="panel panel-compact">
      <div className="panel-header">
        <h2>公共顾客池</h2>
        <span className="eyebrow">封瓶时结算</span>
      </div>
      {customers.length > 0 ? (
        <div className="customer-stack">
          {customers.map((customer, index) => (
            <div key={customer.id} className="customer-item">
              <div className="eyebrow">Commission {String(index + 1).padStart(2, "0")}</div>
              <p className="customer-title">{customer.title}</p>
              <p className="customer-text">{customer.text}</p>
              <span className="customer-points">奖励 +{customer.reward}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">终局自动封瓶阶段，没有顾客加成。</p>
      )}
    </section>
  );
}
