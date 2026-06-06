import { useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;
const chartWidth = 760;
const chartHeight = 280;
const chartPadding = {
  top: 24,
  right: 28,
  bottom: 44,
  left: 74,
};

const currentMonthKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const moveMonth = (monthKey, offset) => {
  const [year, month] = monthKey.split("-").map(Number);
  const nextDate = new Date(year, month - 1 + offset, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
};

const getGoalDeposits = (goals) =>
  goals.flatMap((goal) =>
    (goal.deposits || []).map((deposit) => ({
      ...deposit,
      goalTitle: goal.title,
      amount: Number(deposit.amount || 0),
    })),
  );

const savingsCategory = "儲蓄目標";

const buildMonthlySeries = (transactions, goals) => {
  const latestMonth = currentMonthKey();
  const deposits = getGoalDeposits(goals);
  const months = new Set(Array.from({ length: 6 }, (_, index) => moveMonth(latestMonth, index - 5)));

  transactions.forEach((item) => months.add(item.date.slice(0, 7)));
  deposits.forEach((item) => months.add(item.date.slice(0, 7)));

  const totals = [...months].reduce((groups, month) => {
    groups[month] = { month, income: 0, expense: 0, balance: 0, savings: 0 };
    return groups;
  }, {});

  transactions.forEach((item) => {
    const month = item.date.slice(0, 7);

    if (item.type === "expense" && item.category === savingsCategory) {
      return;
    }

    totals[month][item.type] += Number(item.amount || 0);
  });

  deposits.forEach((item) => {
    const month = item.date.slice(0, 7);
    totals[month].savings += item.amount;
  });

  return Object.values(totals)
    .map((item) => ({
      ...item,
      balance: item.income - item.expense,
      stackedTotal: item.income + item.expense + item.savings,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const buildExpenseCategories = (transactions) => {
  const expenses = transactions.filter((item) => item.type === "expense" && item.category !== savingsCategory);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const groups = expenses.reduce((result, item) => {
    result[item.category] = (result[item.category] || 0) + Number(item.amount || 0);
    return result;
  }, {});

  return Object.entries(groups)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: totalExpense === 0 ? 0 : Math.round((amount / totalExpense) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
};

const formatMonth = (month) => `${month.slice(0, 4)} / ${month.slice(5)}月`;
const linePath = (points) => points.map((point) => `${point.x},${point.y}`).join(" ");

function MonthlyLineChart({ data }) {
  const [activeMetric, setActiveMetric] = useState(null);
  const maxValue = Math.max(100, ...data.flatMap((item) => [item.income, item.expense, Math.max(item.balance, 0)]));
  const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const xStep = data.length > 1 ? chartInnerWidth / (data.length - 1) : chartInnerWidth;
  const yScale = (value) => chartPadding.top + chartInnerHeight - (Math.max(value, 0) / maxValue) * chartInnerHeight;

  const incomePoints = data.map((item, index) => ({
    x: chartPadding.left + index * xStep,
    y: yScale(item.income),
  }));
  const expensePoints = data.map((item, index) => ({
    x: chartPadding.left + index * xStep,
    y: yScale(item.expense),
  }));
  const balancePoints = data.map((item, index) => ({
    x: chartPadding.left + index * xStep,
    y: yScale(item.balance),
  }));
  const guideValues = [maxValue, Math.round(maxValue * 0.75), Math.round(maxValue / 2), Math.round(maxValue * 0.25), 0];
  const metricClass = (metric) => (activeMetric && activeMetric !== metric ? " muted" : "");
  const toggleMetric = (metric) => {
    setActiveMetric((current) => (current === metric ? null : metric));
  };

  return (
    <section className="paper-panel chart-panel">
      <div className="panel-heading">
        <h3>每月收入支出結餘曲線</h3>
        <div className="chart-legend">
          <button className={`income${activeMetric === "income" ? " active" : ""}`} type="button" onClick={() => toggleMetric("income")}>
            收入
          </button>
          <button className={`expense${activeMetric === "expense" ? " active" : ""}`} type="button" onClick={() => toggleMetric("expense")}>
            支出
          </button>
          <button className={`balance${activeMetric === "balance" ? " active" : ""}`} type="button" onClick={() => toggleMetric("balance")}>
            結餘
          </button>
        </div>
      </div>

      <div className="line-chart-wrap">
        <svg className="line-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="每月收入支出結餘曲線圖">
          {guideValues.map((value) => (
            <g key={value}>
              <line
                className="chart-guide"
                x1={chartPadding.left}
                x2={chartWidth - chartPadding.right}
                y1={yScale(value)}
                y2={yScale(value)}
              />
              <text className="chart-y-label" x={chartPadding.left - 12} y={yScale(value) + 5}>
                {Number(value).toLocaleString()}
              </text>
            </g>
          ))}

          <polyline className={`chart-line income${metricClass("income")}`} points={linePath(incomePoints)} />
          <polyline className={`chart-line expense${metricClass("expense")}`} points={linePath(expensePoints)} />
          <polyline className={`chart-line balance${metricClass("balance")}`} points={linePath(balancePoints)} />

          {data.map((item, index) => (
            <g key={item.month}>
              <line
                className="chart-month-guide"
                x1={chartPadding.left + index * xStep}
                x2={chartPadding.left + index * xStep}
                y1={chartPadding.top}
                y2={chartHeight - chartPadding.bottom}
              />
              <text className="chart-x-label" x={chartPadding.left + index * xStep} y={chartHeight - 16}>
                {item.month.slice(5)}月
              </text>
            </g>
          ))}

          {incomePoints.map((point, index) => (
            <circle className={`chart-dot income${metricClass("income")}`} cx={point.x} cy={point.y} key={`income-${data[index].month}`} r="6" />
          ))}
          {expensePoints.map((point, index) => (
            <circle className={`chart-dot expense${metricClass("expense")}`} cx={point.x} cy={point.y} key={`expense-${data[index].month}`} r="6" />
          ))}
          {balancePoints.map((point, index) => (
            <circle className={`chart-dot balance${metricClass("balance")}`} cx={point.x} cy={point.y} key={`balance-${data[index].month}`} r="6" />
          ))}
        </svg>
      </div>
    </section>
  );
}

function StackedBarChart({ data }) {
  const maxTotal = Math.max(100, ...data.map((item) => item.stackedTotal));
  const chartMax = Math.ceil(maxTotal / 500) * 500;
  const guideValues = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0];
  const segmentHeight = (value) => `${Math.max((value / chartMax) * 100, value > 0 ? 3 : 0)}%`;

  return (
    <section className="paper-panel chart-panel">
      <div className="panel-heading">
        <h3>每月收支存款堆疊圖</h3>
        <div className="stack-legend">
          <span className="income">收入</span>
          <span className="expense">支出</span>
          <span className="saving">存入目標</span>
        </div>
      </div>

      <div className="stacked-chart" role="img" aria-label="每月收入支出與存入目標堆疊長條圖">
        <div className="stack-y-axis" aria-hidden="true">
          {guideValues.map((value) => (
            <span key={value}>{Number(value).toLocaleString()}</span>
          ))}
        </div>

        <div className="stack-plot">
          <div className="stack-guide-lines" aria-hidden="true">
            {guideValues.map((value) => (
              <span key={value} />
            ))}
          </div>

          <div className="stack-columns">
            {data.map((item) => (
              <article className="stack-column-item" key={item.month}>
                <div className="stack-column" title={`${formatMonth(item.month)} 收入 ${currency(item.income)} 支出 ${currency(item.expense)} 存款 ${currency(item.savings)}`}>
                  <span className="stack-segment stack-income" style={{ height: segmentHeight(item.income) }} />
                  <span className="stack-segment stack-expense" style={{ height: segmentHeight(item.expense) }} />
                  <span className="stack-segment stack-saving" style={{ height: segmentHeight(item.savings) }} />
                </div>
                <strong>{item.month.slice(5)}月</strong>
                <small>{currency(item.stackedTotal)}</small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Analytics() {
  const { goals, summary, transactions } = useAppData();
  const monthlyData = useMemo(() => buildMonthlySeries(transactions, goals), [transactions, goals]);
  const allCategories = useMemo(() => buildExpenseCategories(transactions), [transactions]);
  const topCategory = allCategories[0];
  const monthsWithData = monthlyData.filter((item) => item.income > 0 || item.expense > 0 || item.savings > 0);
  const highestIncomeMonth = monthsWithData.reduce((best, item) => (item.income > (best?.income || 0) ? item : best), null);
  const highestExpenseMonth = monthsWithData.reduce((best, item) => (item.expense > (best?.expense || 0) ? item : best), null);
  const bestBalanceMonth = monthsWithData.reduce((best, item) => (item.balance > (best?.balance ?? -Infinity) ? item : best), null);

  return (
    <main className="content-grid">
      <PageHeader
        eyebrow="Analytics"
        title="統計分析"
        description="把記帳資料整理成趨勢、堆疊圖、存款進度與每月平均，報告時可以清楚說明資料怎麼被算出來"
      />

      <section className="stats-grid">
        <StatCard label="收入總計" value={currency(summary.totals.income)} hint={`每月平均 ${currency(summary.averages.income)}`} tone="income" />
        <StatCard
          label="支出總計"
          value={currency(summary.totals.expense)}
          hint={`每月平均 ${currency(summary.averages.expense)}`}
          tone={summary.overBudget ? "danger" : "expense"}
        />
        <StatCard
          label="累計結餘"
          value={currency(summary.totals.balance)}
          hint={`每月平均 ${currency(summary.averages.balance)}`}
          tone={summary.totals.balance < 0 ? "danger" : "balance"}
        />
        <StatCard
          label="目前全部存款"
          value={currency(summary.goalSavedTotal)}
          hint={`所有目標合計 ${summary.goalProgress}%，剩 ${currency(summary.goalRemainingTotal)}`}
          tone="income"
        />
      </section>

      <StackedBarChart data={monthlyData} />
      <MonthlyLineChart data={monthlyData} />

      <section className="analysis-grid">
        <article className="paper-panel analysis-card">
          <span>最高收入月份</span>
          <strong>{highestIncomeMonth ? formatMonth(highestIncomeMonth.month) : "尚無資料"}</strong>
          <p>{highestIncomeMonth ? currency(highestIncomeMonth.income) : "先新增收入紀錄"}</p>
        </article>
        <article className="paper-panel analysis-card">
          <span>最高支出月份</span>
          <strong>{highestExpenseMonth ? formatMonth(highestExpenseMonth.month) : "尚無資料"}</strong>
          <p>{highestExpenseMonth ? currency(highestExpenseMonth.expense) : "先新增支出紀錄"}</p>
        </article>
        <article className="paper-panel analysis-card">
          <span>結餘最好月份</span>
          <strong>{bestBalanceMonth ? formatMonth(bestBalanceMonth.month) : "尚無資料"}</strong>
          <p>{bestBalanceMonth ? currency(bestBalanceMonth.balance) : "先建立月資料"}</p>
        </article>
        <article className="paper-panel analysis-card">
          <span>最大生活支出分類</span>
          <strong>{topCategory?.name || "尚無資料"}</strong>
          <p>{topCategory ? `${currency(topCategory.amount)}，占 ${topCategory.percent}%` : "新增支出後會自動分析"}</p>
        </article>
      </section>

      <section className="paper-panel">
        <div className="panel-heading">
          <h3>累計生活支出分類比例</h3>
          <span className="count-pill">{allCategories.length} 類</span>
        </div>

        {allCategories.length > 0 ? (
          <div className="category-list">
            {allCategories.map((category) => (
              <article className="category-row" key={category.name}>
                <div>
                  <strong>{category.name}</strong>
                  <span>{currency(category.amount)}</span>
                </div>
                <div className="category-meter" aria-label={`${category.name} ${category.percent}%`}>
                  <span style={{ width: `${category.percent}%` }} />
                </div>
                <em>{category.percent}%</em>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-text">目前還沒有支出資料</p>
        )}
      </section>

      <section className="paper-panel">
        <div className="panel-heading">
          <h3>每月摘要表</h3>
          <span className="count-pill">月平均與結餘</span>
        </div>
        <div className="monthly-table">
          {monthlyData.map((item) => (
            <article className="monthly-row expanded" key={item.month}>
              <strong>{item.month}</strong>
              <span className="income">收入 {currency(item.income)}</span>
              <span className="expense">支出 {currency(item.expense)}</span>
              <span className={item.balance < 0 ? "danger" : "balance"}>結餘 {currency(item.balance)}</span>
              <small>存款 {currency(item.savings)}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
