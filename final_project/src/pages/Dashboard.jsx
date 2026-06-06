import { Link } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useAppData } from "../context/AppDataContext";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;
const today = () => new Date().toISOString().slice(0, 10);
const friendBudget = 8000;

const getFriendSpending = (contact, index) => {
  const text = `${contact}-${index}`;
  const seed = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 1800 + (seed % 4200);
};

export default function Dashboard() {
  const { addGoalDeposit, addTransaction, goals, profile, summary, transactions, updateProfile } = useAppData();
  const [budgetInput, setBudgetInput] = useState(profile.monthlyBudget || 8000);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    setBudgetInput(profile.monthlyBudget || 8000);
  }, [profile.monthlyBudget]);

  const focusGoal = useMemo(
    () => goals.find((goal) => Number(goal.currentAmount || 0) < Number(goal.targetAmount || 0)) || goals[0],
    [goals],
  );
  const focusGoalProgress = focusGoal
    ? Math.min(Math.round((Number(focusGoal.currentAmount || 0) / Number(focusGoal.targetAmount || 1)) * 100), 100)
    : 0;
  const invitedFriends = Array.isArray(profile.friends) ? profile.friends : [];

  const updateBudget = (value) => {
    setBudgetInput(value);
  };

  const commitBudget = () => {
    updateProfile({ monthlyBudget: Math.max(Number(budgetInput) || 0, 0) });
  };

  const allocateBalanceToGoal = () => {
    if (!focusGoal || summary.availableForGoals <= 0) {
      setSyncMessage("本月目前沒有可分配的正結餘");
      return;
    }

    const remainingGoalAmount = Math.max(Number(focusGoal.targetAmount || 0) - Number(focusGoal.currentAmount || 0), 0);
    const allocationAmount = Math.min(summary.availableForGoals, remainingGoalAmount || summary.availableForGoals);

    const saved = addGoalDeposit(focusGoal.id, {
      amount: allocationAmount,
      note: "本月結餘分配",
      date: today(),
    });

    if (saved) {
      addTransaction({
        type: "expense",
        category: "儲蓄目標",
        amount: allocationAmount,
        date: today(),
        note: `分配到 ${focusGoal.title}`,
      });
    }

    setSyncMessage(saved ? `已把 ${currency(allocationAmount)} 分配到 ${focusGoal.title}` : "分配失敗，請確認金額");
  };

  return (
    <main className="content-grid">
      <PageHeader
        eyebrow="Dashboard"
        title="我的記帳本"
        description="今天先記下一筆小支出，明天就離目標更近一點"
        action={<Link className="sketch-button" to="/transactions">快速記帳</Link>}
      />

      <section className="paper-panel goal-spotlight">
        <div className="goal-spotlight-main">
          <span className="count-pill">目標進度</span>
          {focusGoal ? (
            <>
              <h3>{focusGoal.title}</h3>
              <strong>{focusGoalProgress}%</strong>
              <p>
                已存 {currency(focusGoal.currentAmount)}，還差 {currency(Math.max(focusGoal.targetAmount - focusGoal.currentAmount, 0))}
              </p>
              <div className="progress-track large" aria-label={`${focusGoal.title} 進度 ${focusGoalProgress}%`}>
                <span style={{ width: `${focusGoalProgress}%` }} />
              </div>
            </>
          ) : (
            <>
              <h3>還沒有目標</h3>
              <strong>0%</strong>
              <p>先建立一個想買的東西，結餘就能有方向。</p>
            </>
          )}
        </div>

        <div className="goal-spotlight-side">
          <div>
            <span>本月結餘可投入目標</span>
            <strong className={summary.availableForGoals === 0 && summary.balance < 0 ? "danger-text" : ""}>
              {currency(summary.availableForGoals)}
            </strong>
            <p>{summary.balance < 0 ? "本月先把支出壓回來，再分配到目標" : "可以分配到儲蓄目標"}</p>
          </div>
          <div>
            <span>目前全部存款</span>
            <strong>{currency(summary.goalSavedTotal)}</strong>
            <p>所有目標合計進度 {summary.goalProgress}%，還差 {currency(summary.goalRemainingTotal)}</p>
          </div>
          <div className="spotlight-actions">
            <button className="sketch-button" type="button" onClick={allocateBalanceToGoal}>
              <PiggyBank size={18} />
              分配到目標
            </button>
            <Link className="sketch-button" to="/goals">管理目標</Link>
          </div>
          {syncMessage && <p className="form-message">{syncMessage}</p>}
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="本月收入" value={currency(summary.income)} hint="打工與其他收入" tone="income" />
        <StatCard
          label="本月支出"
          value={currency(summary.expense)}
          hint={summary.overBudget ? `已超出預算 ${currency(summary.overBudgetAmount)}` : `預算已使用 ${summary.budgetRate}%`}
          tone={summary.overBudget ? "danger" : "expense"}
        />
        <StatCard
          label="本月結餘"
          value={currency(summary.balance)}
          hint={summary.negativeBalance ? "本月已經入不敷出，請先暫停非必要支出" : "可分配到儲蓄目標"}
          tone={summary.negativeBalance ? "danger" : "balance"}
        />
      </section>

      <section className="overview-grid">
        <article className="paper-panel budget-form">
          <div className="panel-heading">
            <h3>本月預算</h3>
          </div>
          <label>
            可花費上限
            <input
              min="0"
              type="number"
              value={budgetInput}
              onBlur={commitBudget}
              onChange={(event) => updateBudget(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
            />
          </label>
          <p>目前已使用 {summary.budgetRate}%，剩餘 {currency(Math.max(summary.budget - summary.expense, 0))}</p>
        </article>

        <article className="paper-panel total-summary-card">
          <div className="panel-heading">
            <h3>累計總覽</h3>
            <span className="count-pill">全部紀錄</span>
          </div>
          <div className="mini-stat-grid">
            <div>
              <span>累計收入</span>
              <strong>{currency(summary.totals.income)}</strong>
            </div>
            <div>
              <span>累計支出</span>
              <strong>{currency(summary.totals.expense)}</strong>
            </div>
            <div>
              <span>累計結餘</span>
              <strong className={summary.totals.balance < 0 ? "danger-text" : ""}>{currency(summary.totals.balance)}</strong>
            </div>
          </div>
        </article>

        <article className="paper-panel total-summary-card">
          <div className="panel-heading">
            <h3>每月平均</h3>
            <span className="count-pill">依有資料月份</span>
          </div>
          <div className="mini-stat-grid">
            <div>
              <span>平均收入</span>
              <strong>{currency(summary.averages.income)}</strong>
            </div>
            <div>
              <span>平均支出</span>
              <strong>{currency(summary.averages.expense)}</strong>
            </div>
            <div>
              <span>平均結餘</span>
              <strong className={summary.averages.balance < 0 ? "danger-text" : ""}>{currency(summary.averages.balance)}</strong>
            </div>
          </div>
        </article>
      </section>

      {summary.negativeBalance && (
        <section className="budget-alert" role="alert">
          <strong>結餘提醒</strong>
          <span>本月結餘是負數，代表支出已經超過收入</span>
        </section>
      )}

      <section className="two-column">
        <article className="paper-panel">
          <div className="panel-heading">
            <h3>近期記帳</h3>
            <Link to="/transactions">查看全部</Link>
          </div>
          <div className="ledger-table compact">
            {transactions.slice(0, 4).map((item) => (
              <article className="ledger-row" key={item.id}>
                <time>{item.date}</time>
                <div>
                  <strong>{item.category}</strong>
                  <span>{item.note}</span>
                </div>
                <em className={item.type}>{item.type === "income" ? "+" : "-"} {currency(item.amount)}</em>
              </article>
            ))}
          </div>
        </article>

        <article className="paper-panel">
          <div className="panel-heading">
            <h3>儲蓄目標紀錄</h3>
            <Link to="/goals">查看目標</Link>
          </div>
          <div className="goal-list">
            {goals.map((goal) => {
              const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              return (
                <div className="goal-row" key={goal.id}>
                  <div>
                    <strong>{goal.title}</strong>
                    <span>{currency(goal.currentAmount)} / {currency(goal.targetAmount)}</span>
                  </div>
                  <div className="progress-track" aria-label={`${goal.title} 進度 ${progress}%`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <em>{progress}%</em>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="paper-panel">
        <div className="panel-heading">
          <h3>朋友圈預算摘要</h3>
          <Link to="/circle">前往朋友圈</Link>
        </div>
        <div className="member-list">
          {invitedFriends.length === 0 ? (
            <p className="empty-note">還沒有邀請朋友，加入後會出現在這裡。</p>
          ) : (
            invitedFriends.map((member, index) => {
              const spending = member.spending ?? getFriendSpending(member.contact, index);
              const budget = member.budget ?? friendBudget;
              const rate = Math.round((spending / budget) * 100);

              return (
                <div className="member-row" key={member.id}>
                  <span>{member.name}</span>
                  <strong>{currency(spending)}</strong>
                  <small>預算 {rate}%</small>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
