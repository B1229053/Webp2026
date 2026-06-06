import CalendarPanel from "../components/CalendarPanel";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;

const buildMonthlyRows = (transactions) => {
  const groups = transactions.reduce((result, item) => {
    const month = item.date.slice(0, 7);

    if (!result[month]) {
      result[month] = { month, income: 0, expense: 0, count: 0 };
    }

    result[month][item.type] += item.amount;
    result[month].count += 1;
    return result;
  }, {});

  return Object.values(groups)
    .map((item) => ({
      ...item,
      balance: item.income - item.expense,
      savingRate: item.income === 0 ? 0 : Math.round(((item.income - item.expense) / item.income) * 100),
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
};

export default function Monthly() {
  const { goals, transactions } = useAppData();
  const monthlyRows = buildMonthlyRows(transactions);

  return (
    <main className="content-grid">
      <PageHeader
        eyebrow="Monthly"
        title="收支月曆"
        description="集中查看每個月的收入、支出、結餘、月曆與發票式支出紀錄"
      />

      <section className="paper-panel">
        <div className="panel-heading">
          <h3>每月收支總表</h3>
          <span className="count-pill">{monthlyRows.length} 個月份</span>
        </div>

        <div className="monthly-table">
          {monthlyRows.length === 0 ? (
            <p className="empty-text">目前還沒有記帳資料</p>
          ) : (
            monthlyRows.map((item) => (
              <article className="monthly-row expanded" key={item.month}>
                <strong>{item.month}</strong>
                <span className="income">收入 {currency(item.income)}</span>
                <span className="expense">支出 {currency(item.expense)}</span>
                <span className={item.balance < 0 ? "danger" : "balance"}>結餘 {currency(item.balance)}</span>
                <small>{item.count} 筆，儲蓄率 {item.savingRate}%</small>
              </article>
            ))
          )}
        </div>
      </section>

      <CalendarPanel goals={goals} transactions={transactions} />
    </main>
  );
}
