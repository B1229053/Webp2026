import { useMemo, useState } from "react";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const pieColors = ["#ef7b32", "#ffd861", "#91c788", "#93c5fd", "#f6b4c7", "#b87522"];

const monthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const currentMonthKey = () => monthKey(new Date());

const moveMonth = (currentMonth, offset) => {
  const [year, month] = currentMonth.split("-").map(Number);
  return monthKey(new Date(year, month - 1 + offset, 1));
};

export default function CalendarPanel({ goals = [], transactions }) {
  const [visibleMonth, setVisibleMonth] = useState(currentMonthKey);
  const [activeTab, setActiveTab] = useState("calendar");

  const monthReport = useMemo(() => {
    const monthTransactions = transactions.filter((item) => item.date.startsWith(visibleMonth));
    const incomeItems = monthTransactions.filter((item) => item.type === "income");
    const expenseItems = monthTransactions.filter((item) => item.type === "expense");
    const income = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const expense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const balance = income - expense;
    const achievedGoals = goals.filter(
      (goal) =>
        Number(goal.currentAmount || 0) >= Number(goal.targetAmount || 0) &&
        (goal.targetDate?.startsWith(visibleMonth) || goal.deposits?.some((deposit) => deposit.date?.startsWith(visibleMonth))),
    );
    const categoryTotals = expenseItems.reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + item.amount;
      return groups;
    }, {});
    const categories = Object.entries(categoryTotals)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: pieColors[index % pieColors.length],
        percent: expense === 0 ? 0 : Math.round((amount / expense) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
    const pieSlices = categories.reduce(
      (result, category) => ({
        current: result.current + category.percent,
        slices: [...result.slices, `${category.color} ${result.current}% ${result.current + category.percent}%`],
      }),
      { current: 0, slices: [] },
    ).slices;

    return {
      achievedGoals,
      balance,
      categories,
      expense,
      expenseCount: expenseItems.length,
      expenseItems,
      income,
      incomeCount: incomeItems.length,
      savingRate: income === 0 ? 0 : Math.round((balance / income) * 100),
      dailyExpenseAverage: Math.round(expense / 30),
      pieBackground: pieSlices.length > 0 ? `conic-gradient(${pieSlices.join(", ")})` : "#fff6d8",
    };
  }, [goals, transactions, visibleMonth]);

  const calendarDays = useMemo(() => {
    const [year, month] = visibleMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const totals = transactions
      .filter((item) => item.date.startsWith(visibleMonth))
      .reduce((groups, item) => {
        if (!groups[item.date]) {
          groups[item.date] = { income: 0, expense: 0 };
        }

        groups[item.date][item.type] += item.amount;
        return groups;
      }, {});

    return [
      ...Array.from({ length: firstDay.getDay() }, (_, index) => ({ id: `blank-${index}`, empty: true })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const date = `${visibleMonth}-${String(day).padStart(2, "0")}`;

        return {
          id: date,
          day,
          date,
          income: totals[date]?.income || 0,
          expense: totals[date]?.expense || 0,
        };
      }),
    ];
  }, [transactions, visibleMonth]);

  return (
    <section className="paper-panel calendar-panel">
      <div className="panel-heading">
        <div>
          <h3>收支月曆</h3>
          <p>{visibleMonth.replace("-", " 年 ")} 月</p>
        </div>
        <div className="calendar-actions">
          <button type="button" onClick={() => setVisibleMonth((month) => moveMonth(month, -1))}>
            上個月
          </button>
            <button type="button" onClick={() => setVisibleMonth(currentMonthKey())}>
            本月
          </button>
          <button type="button" onClick={() => setVisibleMonth((month) => moveMonth(month, 1))}>
            下個月
          </button>
        </div>
      </div>

      <div className="segmented-control calendar-tabs" aria-label="月曆分頁">
        <button className={activeTab === "calendar" ? "active" : ""} type="button" onClick={() => setActiveTab("calendar")}>
          月曆
        </button>
        <button className={activeTab === "report" ? "active" : ""} type="button" onClick={() => setActiveTab("report")}>
          月報
        </button>
      </div>

      {activeTab === "calendar" ? (
        <div className="calendar-grid">
          {weekdays.map((weekday) => (
            <strong className="weekday" key={weekday}>{weekday}</strong>
          ))}
          {calendarDays.map((day) => (
            <article className={`calendar-day${day.empty ? " empty" : ""}`} key={day.id}>
              {!day.empty && (
                <>
                  <time dateTime={day.date}>{day.day}</time>
                  <div className="day-total">
                    {day.income > 0 && <span className="income">+{currency(day.income)}</span>}
                    {day.expense > 0 && <span className="expense">-{currency(day.expense)}</span>}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="month-report-grid">
          <article className="receipt-summary">
            <span>月收入</span>
            <strong>{currency(monthReport.income)}</strong>
            <p>收入共 {monthReport.incomeCount} 筆</p>
          </article>
          <article className="receipt-summary">
            <span>月支出</span>
            <strong>{currency(monthReport.expense)}</strong>
            <p>支出共 {monthReport.expenseCount} 筆</p>
          </article>
          <article className="receipt-summary">
            <span>月結餘</span>
            <strong className={monthReport.balance < 0 ? "danger-text" : ""}>{currency(monthReport.balance)}</strong>
            <p>儲蓄率 {monthReport.savingRate}%</p>
          </article>
          <article className="receipt-summary">
            <span>目標達標</span>
            <strong>{monthReport.achievedGoals.length} 個</strong>
            <p>{monthReport.achievedGoals.length > 0 ? monthReport.achievedGoals.map((goal) => goal.title).join("、") : "這個月還沒有新達標目標"}</p>
          </article>
          <article className="receipt-summary">
            <span>平均日支出</span>
            <strong>{currency(monthReport.dailyExpenseAverage)}</strong>
            <p>用 30 天估算本月花費壓力</p>
          </article>
          <article className="receipt-summary">
            <span>最大支出類別</span>
            <strong>{monthReport.categories[0]?.name || "無"}</strong>
            <p>{monthReport.categories[0] ? `${currency(monthReport.categories[0].amount)}，佔 ${monthReport.categories[0].percent}%` : "本月沒有支出分類"}</p>
          </article>

          <article className="expense-pie-card">
            <div className="pie-chart" style={{ "--pie": monthReport.pieBackground }} aria-label="支出圓餅圖" />
            <div className="pie-legend">
              <h4>支出分類</h4>
              {monthReport.categories.length === 0 ? (
                <p>本月還沒有支出</p>
              ) : (
                monthReport.categories.map((category) => (
                  <div className="pie-legend-row" key={category.name}>
                    <span style={{ "--slice-color": category.color }} />
                    <strong>{category.name}</strong>
                    <small>{category.percent}%</small>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="receipt-table-card">
            <div className="receipt-head">
              <strong>支出發票</strong>
              <span>{visibleMonth}</span>
            </div>
            <div className="receipt-table">
              {monthReport.expenseItems.length === 0 ? (
                <p className="empty-note">本月沒有支出紀錄</p>
              ) : (
                monthReport.expenseItems.map((item) => (
                  <div className="receipt-row" key={item.id}>
                    <time>{item.date.slice(5)}</time>
                    <span>{item.category}</span>
                    <strong>{currency(item.amount)}</strong>
                    <small>{item.note}</small>
                  </div>
                ))
              )}
            </div>
            <div className="receipt-total">
              <span>支出合計</span>
              <strong>{currency(monthReport.expense)}</strong>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
