import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

export default function Settings() {
  const { dataError, profile, updateProfile } = useAppData();
  const [form, setForm] = useState({
    displayName: profile.displayName || "我",
    monthlyBudget: profile.monthlyBudget || 8000,
  });

  useEffect(() => {
    setForm({
      displayName: profile.displayName || "我",
      monthlyBudget: profile.monthlyBudget || 8000,
    });
  }, [profile.displayName, profile.monthlyBudget]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();

    updateProfile({
      displayName: form.displayName.trim() || "我",
      monthlyBudget: Math.max(Number(form.monthlyBudget) || 0, 0),
    });
  };

  return (
    <main className="content-grid">
      <PageHeader eyebrow="Settings" title="個人設定" description="管理會員名稱與每月預算" />

      <section className="single-column align-start">
        <form className="paper-panel settings-form" onSubmit={saveProfile}>
          {dataError && <p className="form-message">{dataError}</p>}
          <label>
            使用者名稱
            <input
              value={form.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
            />
          </label>
          <label>
            每月預算
            <input
              min="0"
              type="number"
              value={form.monthlyBudget}
              onChange={(event) => updateField("monthlyBudget", event.target.value)}
            />
          </label>
          <button className="sketch-button" type="submit">
            <Save size={18} />
            儲存設定
          </button>
        </form>
      </section>
    </main>
  );
}
