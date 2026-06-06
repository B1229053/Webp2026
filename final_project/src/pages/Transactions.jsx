import { Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  type: "expense",
  category: "餐飲",
  amount: "",
  date: today(),
  note: "",
};

const categories = {
  expense: ["餐飲", "交通", "娛樂", "購物", "學習", "儲蓄目標", "其他"],
  income: ["打工", "直播", "接委託", "其他"],
};

const csvHeader = ["日期", "類型", "分類", "金額", "備註"];

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

export default function Transactions() {
  const { transactions, addTransaction, removeTransaction } = useAppData();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setForm((current) => {
      if (field === "type") {
        return { ...current, type: value, category: categories[value][0] };
      }

      return { ...current, [field]: value };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const saved = addTransaction(form);

    if (!saved) {
      setMessage("請填寫分類與正確金額");
      return;
    }

    setForm({ ...emptyForm, date: form.date });
    setMessage("已新增一筆記帳");
  };

  const exportCsv = () => {
    if (transactions.length === 0) {
      setMessage("目前沒有資料可以匯出");
      return;
    }

    const rows = transactions.map((item) => [
      item.date,
      item.type === "income" ? "收入" : "支出",
      item.category,
      item.amount,
      item.note,
    ]);
    const csv = [csvHeader, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StepProfit_transactions_${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("已匯出 CSV 檔");
  };

  return (
    <main className="content-grid">
      <PageHeader
        eyebrow="Ledger"
        title="記帳紀錄"
        description="在手機或電腦打開網頁就能快速記一筆，資料會先在畫面即時更新"
        action={
          <button className="sketch-button" type="button" onClick={exportCsv}>
            <Download size={18} />
            匯出 CSV
          </button>
        }
      />

      <section className="two-column align-start">
        <form className="paper-panel ledger-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <h3>新增一筆</h3>
            <button className="sketch-button icon-button" type="submit" aria-label="新增記帳">
              <Plus size={20} />
            </button>
          </div>

          <div className="segmented-control" aria-label="收支類型">
            <button
              className={form.type === "expense" ? "active" : ""}
              type="button"
              onClick={() => updateField("type", "expense")}
            >
              支出
            </button>
            <button
              className={form.type === "income" ? "active" : ""}
              type="button"
              onClick={() => updateField("type", "income")}
            >
              收入
            </button>
          </div>

          <label>
            分類
            <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              {categories[form.type].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            金額
            <input
              min="1"
              placeholder="例如：85"
              type="number"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
            />
          </label>

          <label>
            日期
            <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
          </label>

          <label>
            備註
            <textarea
              placeholder="例如：午餐、捷運、打工薪水"
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
            />
          </label>

          {message && <p className="form-message">{message}</p>}
        </form>

        <section className="paper-panel">
          <div className="panel-heading">
            <h3>全部紀錄</h3>
            <span className="count-pill">{transactions.length} 筆</span>
          </div>
          <div className="ledger-table">
            {transactions.map((item) => (
              <article className="ledger-row editable" key={item.id}>
                <time>{item.date}</time>
                <div>
                  <strong>{item.category}</strong>
                  <span>{item.note}</span>
                </div>
                <em className={item.type}>{item.type === "income" ? "+" : "-"} {currency(item.amount)}</em>
                <button className="ghost-icon" type="button" onClick={() => removeTransaction(item.id)} aria-label="刪除記帳">
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
