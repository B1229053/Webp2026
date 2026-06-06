import { Check, Pencil, PiggyBank, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;
const today = () => new Date().toISOString().slice(0, 10);

const emptyGoal = {
  title: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: today(),
  note: "",
};

const emptyDeposit = {
  amount: "",
  note: "",
  date: today(),
};

export default function Goals() {
  const { addGoal, addGoalDeposit, goals, removeGoal, removeGoalDeposit, updateGoalDeposit } = useAppData();
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [depositForms, setDepositForms] = useState({});
  const [editingDeposits, setEditingDeposits] = useState({});
  const [message, setMessage] = useState("");

  const updateGoalForm = (field, value) => {
    setGoalForm((current) => ({ ...current, [field]: value }));
  };

  const updateDepositForm = (goalId, field, value) => {
    setDepositForms((forms) => ({
      ...forms,
      [goalId]: {
        ...(forms[goalId] || emptyDeposit),
        [field]: value,
      },
    }));
  };

  const startEditingDeposit = (deposit) => {
    setEditingDeposits((items) => ({
      ...items,
      [deposit.id]: {
        amount: deposit.amount,
        note: deposit.note,
        date: deposit.date,
      },
    }));
  };

  const updateEditingDeposit = (depositId, field, value) => {
    setEditingDeposits((items) => ({
      ...items,
      [depositId]: {
        ...items[depositId],
        [field]: value,
      },
    }));
  };

  const cancelEditingDeposit = (depositId) => {
    setEditingDeposits((items) => {
      const nextItems = { ...items };
      delete nextItems[depositId];
      return nextItems;
    });
  };

  const handleGoalSubmit = (event) => {
    event.preventDefault();
    const saved = addGoal(goalForm);

    if (!saved) {
      setMessage("請填寫目標名稱與正確金額");
      return;
    }

    setGoalForm(emptyGoal);
    setShowGoalModal(false);
    setMessage("已新增儲蓄目標");
  };

  const handleDepositSubmit = (event, goalId) => {
    event.preventDefault();
    const saved = addGoalDeposit(goalId, depositForms[goalId] || emptyDeposit);

    if (!saved) {
      setMessage("請填寫正確的存款金額");
      return;
    }

    setDepositForms((forms) => ({ ...forms, [goalId]: emptyDeposit }));
    setMessage("已新增一筆目標存款");
  };

  const handleDepositUpdate = (event, goalId, depositId) => {
    event.preventDefault();
    const saved = updateGoalDeposit(goalId, depositId, editingDeposits[depositId]);

    if (!saved) {
      setMessage("請填寫正確的存款金額");
      return;
    }

    cancelEditingDeposit(depositId);
    setMessage("已更新存款紀錄");
  };

  return (
    <main className="content-grid">
      <PageHeader
        eyebrow="Goals"
        title="儲蓄目標"
        description="把想買的東西變成進度條，例如五萬元的新筆電"
        action={
          <button className="sketch-button" type="button" onClick={() => setShowGoalModal(true)}>
            <Plus size={18} />
            新增目標
          </button>
        }
      />

      {message && <p className="form-message">{message}</p>}

      <section className="goal-card-grid goal-showcase-grid">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const achieved = progress >= 100;
            const depositForm = depositForms[goal.id] || emptyDeposit;

            return (
              <article className={`paper-panel goal-card${achieved ? " achieved" : ""}`} key={goal.id}>
                <span className="tape">{achieved ? "達標" : "目標"}</span>
                {achieved && (
                  <div className="celebration-burst" aria-hidden="true">
                    {Array.from({ length: 14 }, (_, index) => (
                      <span key={index} style={{ "--piece": index }} />
                    ))}
                  </div>
                )}
                <div className="goal-card-title">
                  <div>
                    <h3>{goal.title}</h3>
                    <p>{goal.note}</p>
                  </div>
                  <button className="ghost-icon" type="button" onClick={() => removeGoal(goal.id)} aria-label="刪除目標">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="goal-money">
                  <strong>{currency(goal.currentAmount)}</strong>
                  <span>目標 {currency(goal.targetAmount)}</span>
                </div>
                <small>期限：{goal.targetDate} · 進度 {progress}%</small>
                {achieved && <p className="achieved-message">已達標 可以準備完成這個願望</p>}

                <form className="goal-progress-form" onSubmit={(event) => handleDepositSubmit(event, goal.id)}>
                  <label>
                    新增存款
                    <input
                      min="1"
                      placeholder="例如：500"
                      type="number"
                      value={depositForm.amount}
                      onChange={(event) => updateDepositForm(goal.id, "amount", event.target.value)}
                    />
                  </label>
                  <label>
                    備註
                    <input
                      placeholder="例如：省下飲料錢"
                      value={depositForm.note}
                      onChange={(event) => updateDepositForm(goal.id, "note", event.target.value)}
                    />
                  </label>
                  <button className="sketch-button" type="submit">
                    <PiggyBank size={18} />
                    加到目標
                  </button>
                </form>

                {goal.deposits.length > 0 && (
                  <div className="deposit-list">
                    {goal.deposits.slice(0, 3).map((deposit) => {
                      const editingDeposit = editingDeposits[deposit.id];

                      if (editingDeposit) {
                        return (
                          <form className="deposit-row editing" key={deposit.id} onSubmit={(event) => handleDepositUpdate(event, goal.id, deposit.id)}>
                            <input
                              aria-label="編輯存款日期"
                              type="date"
                              value={editingDeposit.date}
                              onChange={(event) => updateEditingDeposit(deposit.id, "date", event.target.value)}
                            />
                            <input
                              aria-label="編輯存款金額"
                              min="1"
                              type="number"
                              value={editingDeposit.amount}
                              onChange={(event) => updateEditingDeposit(deposit.id, "amount", event.target.value)}
                            />
                            <input
                              aria-label="編輯存款備註"
                              value={editingDeposit.note}
                              onChange={(event) => updateEditingDeposit(deposit.id, "note", event.target.value)}
                            />
                            <div className="deposit-actions">
                              <button className="mini-icon" type="submit" aria-label="儲存存款紀錄">
                                <Check size={16} />
                              </button>
                              <button className="mini-icon" type="button" onClick={() => cancelEditingDeposit(deposit.id)} aria-label="取消編輯">
                                <X size={16} />
                              </button>
                            </div>
                          </form>
                        );
                      }

                      return (
                        <div className="deposit-row" key={deposit.id}>
                          <span>{deposit.date}</span>
                          <strong>+ {currency(deposit.amount)}</strong>
                          <small>{deposit.note}</small>
                          <div className="deposit-actions">
                            <button className="mini-icon" type="button" onClick={() => startEditingDeposit(deposit)} aria-label="編輯存款紀錄">
                              <Pencil size={16} />
                            </button>
                            <button className="mini-icon" type="button" onClick={() => removeGoalDeposit(goal.id, deposit.id)} aria-label="取消存款紀錄">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
      </section>

      {showGoalModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowGoalModal(false)}>
          <form className="paper-panel goal-form goal-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={handleGoalSubmit}>
            <div className="panel-heading">
              <h3>新增目標</h3>
              <button className="ghost-icon" type="button" onClick={() => setShowGoalModal(false)} aria-label="關閉新增目標">
                <X size={18} />
              </button>
            </div>

            <label>
              目標名稱
              <input
                autoFocus
                placeholder="例如：新筆電"
                value={goalForm.title}
                onChange={(event) => updateGoalForm("title", event.target.value)}
              />
            </label>

            <label>
              目標金額
              <input
                min="1"
                placeholder="例如：50000"
                type="number"
                value={goalForm.targetAmount}
                onChange={(event) => updateGoalForm("targetAmount", event.target.value)}
              />
            </label>

            <label>
              目前已存
              <input
                min="0"
                placeholder="例如：3000"
                type="number"
                value={goalForm.currentAmount}
                onChange={(event) => updateGoalForm("currentAmount", event.target.value)}
              />
            </label>

            <label>
              期限
              <input type="date" value={goalForm.targetDate} onChange={(event) => updateGoalForm("targetDate", event.target.value)} />
            </label>

            <label>
              備註
              <textarea
                placeholder="例如：每週少喝兩杯飲料"
                value={goalForm.note}
                onChange={(event) => updateGoalForm("note", event.target.value)}
              />
            </label>

            <button className="sketch-button" type="submit">
              <Plus size={18} />
              建立目標
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
