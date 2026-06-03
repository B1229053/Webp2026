export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">網頁程式期末專題</p>
        <h1>步步為盈 StepProfit</h1>
        <p className="subtitle">
          結合個人記帳、儲蓄目標、朋友圈監督與留言牆的即時記帳系統。
        </p>
        <div className="meta">
          <span>顏羽婕</span>
          <span>B1229053</span>
        </div>
      </section>

      <section className="feature-grid" aria-label="功能規劃">
        <article>
          <strong>即時記帳</strong>
          <p>記錄收入、支出、分類、日期與備註，並同步到 Firebase。</p>
        </article>
        <article>
          <strong>儲蓄目標</strong>
          <p>設定目標物與目標金額，追蹤完成百分比與剩餘金額。</p>
        </article>
        <article>
          <strong>朋友圈監督</strong>
          <p>邀請朋友加入圈子，只分享月支出摘要與預算使用比例。</p>
        </article>
        <article>
          <strong>留言牆</strong>
          <p>朋友可以互相留言提醒、鼓勵，並使用 Firestore 即時更新。</p>
        </article>
      </section>
    </main>
  );
}
