import type { CustomerCard } from "../game/types";

interface CustomerCardViewProps {
  customers: CustomerCard[];
}

export function CustomerCardView({ customers }: CustomerCardViewProps) {
  return (
    <section className="panel customer-card">
      <div className="panel-header">
        <h2>公共顾客池</h2>
      </div>
      {customers.length > 0 ? (
        <div className="customer-stack">
          {customers.map((customer) => (
            <div key={customer.id} className="customer-item">
              <p className="customer-title">{customer.title}</p>
              <p className="customer-text">{customer.text}</p>
              <span className="customer-points">奖励 +4</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">终局自动封瓶阶段，没有顾客加成。</p>
      )}
    </section>
  );
}
