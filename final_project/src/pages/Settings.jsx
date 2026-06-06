import { Camera, Save } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";

export default function Settings() {
  const { dataError, profile, updateProfile } = useAppData();
  const [form, setForm] = useState({
    displayName: profile.displayName || "我",
    monthlyBudget: profile.monthlyBudget || 8000,
    contact: profile.contact || "",
  });
  const avatarStyle = {
    "--avatar-scale": profile.avatarScale / 100,
    "--avatar-x": `${profile.avatarX}%`,
    "--avatar-y": `${profile.avatarY}%`,
  };

  useEffect(() => {
    setForm({
      displayName: profile.displayName || "我",
      monthlyBudget: profile.monthlyBudget || 8000,
      contact: profile.contact || "",
    });
  }, [profile.displayName, profile.monthlyBudget, profile.contact]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = (event) => {
    event.preventDefault();

    updateProfile({
      displayName: form.displayName.trim() || "我",
      monthlyBudget: Math.max(Number(form.monthlyBudget) || 0, 0),
      contact: form.contact.trim(),
    });
  };

  return (
    <main className="content-grid">
      <PageHeader eyebrow="Settings" title="個人設定" description="管理會員名稱、月預算、頭像與顯示大小" />

      <section className="two-column align-start">
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
          <label>
            聯絡方式
            <input
              placeholder="例如 Email 或 LINE ID"
              value={form.contact}
              onChange={(event) => updateField("contact", event.target.value)}
            />
          </label>
          <button className="sketch-button" type="submit">
            <Save size={18} />
            儲存設定
          </button>
        </form>

        <article className="paper-panel avatar-uploader">
          <div className="panel-heading">
            <h3>頭像設定</h3>
            <span className="count-pill">大小 {profile.avatarScale}%</span>
          </div>
          <div className="avatar-upload-body">
            <div className="avatar-preview large" style={avatarStyle}>
              {profile.avatar ? <img src={profile.avatar} alt="我的頭像預覽" /> : <span>我</span>}
            </div>
            <label className="upload-button">
              <Camera size={20} />
              上傳頭像
              <input accept="image/*" type="file" onChange={handleAvatarChange} />
            </label>
          </div>

          <label className="range-field">
            頭像大小
            <input
              max="300"
              min="70"
              type="range"
              value={profile.avatarScale}
              onChange={(event) => updateProfile({ avatarScale: Number(event.target.value) })}
            />
          </label>
          <label className="range-field">
            左右位置
            <input
              max="100"
              min="-100"
              type="range"
              value={profile.avatarX}
              onChange={(event) => updateProfile({ avatarX: Number(event.target.value) })}
            />
          </label>
          <label className="range-field">
            上下位置
            <input
              max="100"
              min="-100"
              type="range"
              value={profile.avatarY}
              onChange={(event) => updateProfile({ avatarY: Number(event.target.value) })}
            />
          </label>
          <button
            className="sketch-button"
            type="button"
            onClick={() => updateProfile({ avatarScale: 100, avatarX: 0, avatarY: 0 })}
          >
            重設頭像位置
          </button>
          <p>頭像會用在朋友圈排名與留言牆，調整到自己喜歡的裁切位置就可以。</p>
        </article>
      </section>
    </main>
  );
}
