import { MailPlus, MessageCircle, Send, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { circleMembers } from "../data/mockData";

const currency = (value) => `NT$ ${Number(value).toLocaleString()}`;

const initials = (name) => name.slice(0, 2).toUpperCase();

const emptyComment = {
  target: "我",
  type: "鼓勵",
  content: "",
};

const emptyInvite = {
  name: "",
  contact: "",
};

const friendBudget = 8000;

const getFriendSpending = (contact, index) => {
  const text = `${contact}-${index}`;
  const seed = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 1800 + (seed % 4200);
};

export default function Circle() {
  const { addComment, comments, profile, summary, updateProfile } = useAppData();
  const [commentForm, setCommentForm] = useState(emptyComment);
  const [inviteForm, setInviteForm] = useState(emptyInvite);
  const [inviteMessage, setInviteMessage] = useState("");
  const myAvatarStyle = {
    "--avatar-scale": profile.avatarScale / 100,
    "--avatar-x": `${profile.avatarX}%`,
    "--avatar-y": `${profile.avatarY}%`,
  };
  const invitedFriends = Array.isArray(profile.friends) ? profile.friends : [];

  const members = [
    {
      id: "me",
      name: profile.displayName || "我",
      spending: summary.expense,
      budget: summary.budget,
      avatar: profile.avatar,
    },
    ...circleMembers
      .filter((member) => member.id !== "me")
      .map((member) => ({ ...member, avatar: "" })),
    ...invitedFriends.map((friend, index) => ({
      id: friend.id,
      name: friend.name,
      contact: friend.contact,
      spending: friend.spending ?? getFriendSpending(friend.contact, index),
      budget: friend.budget ?? friendBudget,
      avatar: "",
      invited: true,
    })),
  ];

  const ranking = members
    .map((member) => {
      const saved = member.budget - member.spending;
      const rate = Math.round((member.spending / member.budget) * 100);
      return { ...member, saved, rate };
    })
    .sort((a, b) => b.saved - a.saved);

  const updateComment = (field, value) => {
    setCommentForm((current) => ({ ...current, [field]: value }));
  };

  const submitComment = (event) => {
    event.preventDefault();

    if (!commentForm.content.trim()) {
      return;
    }

    addComment(commentForm);
    setCommentForm(emptyComment);
  };

  const updateInvite = (field, value) => {
    setInviteForm((current) => ({ ...current, [field]: value }));
  };

  const submitInvite = (event) => {
    event.preventDefault();

    const name = inviteForm.name.trim();
    const contact = inviteForm.contact.trim();

    if (!name || !contact) {
      setInviteMessage("請填朋友名稱與聯絡方式");
      return;
    }

    const isDuplicate = members.some(
      (member) => member.name.toLowerCase() === name.toLowerCase() || member.contact?.toLowerCase() === contact.toLowerCase(),
    );

    if (isDuplicate) {
      setInviteMessage("這位朋友已經在朋友圈裡");
      return;
    }

    const nextFriend = {
      id: crypto.randomUUID(),
      name,
      contact,
      budget: friendBudget,
      spending: getFriendSpending(contact, invitedFriends.length),
      invitedAt: new Date().toISOString(),
    };

    updateProfile({ friends: [...invitedFriends, nextFriend] });
    setInviteForm(emptyInvite);
    setInviteMessage(`已邀請 ${name} 加入朋友圈`);
  };

  const removeFriend = (friendId) => {
    updateProfile({ friends: invitedFriends.filter((friend) => friend.id !== friendId) });
  };

  return (
    <main className="content-grid">
      <PageHeader
        eyebrow="Circle"
        title="朋友圈監督"
        description="把朋友加入排名和留言牆，互相提醒、鼓勵，也一起看誰最會守住預算"
      />

      <section className="two-column align-start">
        <form className="paper-panel invite-form" onSubmit={submitInvite}>
          <div className="panel-heading">
            <h3>邀請朋友</h3>
            <span className="count-pill">{invitedFriends.length} 位已邀請</span>
          </div>

          <label>
            朋友名稱
            <input
              placeholder="例如 Amy"
              value={inviteForm.name}
              onChange={(event) => updateInvite("name", event.target.value)}
            />
          </label>

          <label>
            聯絡方式
            <input
              placeholder="Email / LINE ID"
              value={inviteForm.contact}
              onChange={(event) => updateInvite("contact", event.target.value)}
            />
          </label>

          <button className="sketch-button" type="submit">
            <UserPlus size={18} />
            加入朋友圈
          </button>

          {inviteMessage && <p className="form-message">{inviteMessage}</p>}
        </form>

        <section className="paper-panel invite-list">
          <div className="panel-heading">
            <h3>已邀請名單</h3>
            <span className="count-pill">會出現在排名與留言對象</span>
          </div>

          {invitedFriends.length === 0 ? (
            <p className="empty-note">還沒有邀請新朋友，可以先加入一位同學測試。</p>
          ) : (
            <div className="friend-chip-list">
              {invitedFriends.map((friend) => (
                <article className="friend-chip" key={friend.id}>
                  <MailPlus size={18} />
                  <div>
                    <strong>{friend.name}</strong>
                    <span>{friend.contact}</span>
                  </div>
                  <button type="button" aria-label={`移除 ${friend.name}`} onClick={() => removeFriend(friend.id)}>
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="paper-panel">
        <div className="panel-heading">
          <h3>省錢排名</h3>
          <span className="count-pill">剩餘預算排序</span>
        </div>

        <div className="ranking-list">
          {ranking.map((member, index) => (
            <article className={`ranking-row${member.saved < 0 ? " danger" : ""}`} key={member.id}>
              <strong className="rank-badge">#{index + 1}</strong>
              <div className="avatar-preview" style={member.id === "me" ? myAvatarStyle : undefined}>
                {member.avatar ? <img src={member.avatar} alt={`${member.name} 頭像`} /> : <span>{initials(member.name)}</span>}
              </div>
              <div>
                <h3>{member.name}</h3>
                <p>本月支出 {currency(member.spending)}，預算使用 {member.rate}%</p>
              </div>
              <strong className="saved-money">
                {member.saved >= 0 ? "剩餘" : "超出"} {currency(Math.abs(member.saved))}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section className="two-column align-start">
        <form className="paper-panel comment-form" onSubmit={submitComment}>
          <div className="panel-heading">
            <h3>新增留言</h3>
            <button className="sketch-button icon-button" type="submit" aria-label="送出留言">
              <Send size={18} />
            </button>
          </div>

          <label>
              留給誰
            <select value={commentForm.target} onChange={(event) => updateComment("target", event.target.value)}>
              {!members.some((member) => member.name === commentForm.target) && <option>{commentForm.target}</option>}
              {members.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>

          <div className="segmented-control" aria-label="留言類型">
            <button
              className={commentForm.type === "鼓勵" ? "active" : ""}
              type="button"
              onClick={() => updateComment("type", "鼓勵")}
            >
              鼓勵
            </button>
            <button
              className={commentForm.type === "提醒" ? "active" : ""}
              type="button"
              onClick={() => updateComment("type", "提醒")}
            >
              提醒
            </button>
          </div>

          <label>
            內容
            <textarea
              placeholder="例如：這週飲料費有下降，繼續保持"
              value={commentForm.content}
              onChange={(event) => updateComment("content", event.target.value)}
            />
          </label>
        </form>

        <section className="comment-stack">
          {comments.map((comment) => (
            <article className="paper-panel comment-note" key={comment.id}>
              <div className="comment-note-head">
                <span className={`comment-type type-${comment.type}`}>{comment.type}</span>
                <h3>
                  <MessageCircle size={18} />
                  {comment.author} 給 {comment.target}
                </h3>
              </div>
              <p>{comment.content}</p>
              <small>{comment.time}</small>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
