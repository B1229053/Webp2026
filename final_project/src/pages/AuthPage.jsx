import { ChartLine, Goal, LogIn, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const featureCards = [
  { icon: ChartLine, title: "即時記帳", text: "收入、支出與月曆總覽會同步更新" },
  { icon: Goal, title: "儲蓄目標", text: "把想買的東西拆成可以追蹤的存款進度" },
  { icon: MessageCircle, title: "朋友圈", text: "用排名與留言讓朋友互相提醒、鼓勵" },
];

export default function AuthPage() {
  const { authError, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "login") {
      await login(form.email, form.password);
    } else {
      await register(form.email, form.password);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-intro">
          <p className="eyebrow">StepProfit</p>
          <h1>步步為盈</h1>
          <p>把每天的小花費記下來，讓月結餘變成看得見的儲蓄目標</p>

          <div className="auth-feature-list">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="auth-feature" key={card.title}>
                  <Icon size={22} />
                  <div>
                    <strong>{card.title}</strong>
                    <span>{card.text}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="auth-proof">
            <ShieldCheck size={18} />
            <span>登入後自動保存記帳、目標與朋友圈資料</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Member Login</p>
            <h2>{mode === "login" ? "登入我的記帳本" : "建立 StepProfit 帳號"}</h2>
          </div>

          <div className="segmented-control" aria-label="登入模式">
            <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
              登入
            </button>
            <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>
              註冊
            </button>
          </div>

          <label>
            Email
            <input
              autoComplete="email"
              placeholder="demo@example.com"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label>
            密碼
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="至少 6 碼"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </label>

          {authError && <p className="form-message">{authError}</p>}

          <button className="sketch-button" type="submit">
            <LogIn size={18} />
            {mode === "login" ? "進入記帳本" : "建立我的帳本"}
          </button>

          <p className="auth-note">第一次使用請先註冊，之後用同一組 Email 登入即可。</p>
        </form>
      </section>
    </main>
  );
}
