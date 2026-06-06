import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, ChartPie, CircleDollarSign, Goal, Home, LogOut, NotebookPen, Settings, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";

const navItems = [
  { to: "/", label: "總覽", icon: Home },
  { to: "/transactions", label: "記帳", icon: NotebookPen },
  { to: "/monthly", label: "月曆", icon: CalendarDays },
  { to: "/analytics", label: "統計", icon: ChartPie },
  { to: "/goals", label: "目標", icon: Goal },
  { to: "/settings", label: "設定", icon: Settings },
];

export default function Layout() {
  const { logout, user } = useAuth();
  const { dataError, profile } = useAppData();

  return (
    <div className="notebook-app">
      <aside className="sidebar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">
            <CircleDollarSign size={28} />
          </span>
          <span>
            <strong>步步為盈</strong>
            <small>StepProfit</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="主要功能">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="account-card">
          <strong>
            <User size={17} />
            {profile.displayName || "我的帳號"}
          </strong>
          <span>{user?.email || "尚未登入"}</span>
          {dataError && <small className="sync-error">{dataError}</small>}
          {user && (
            <button type="button" onClick={logout}>
              <LogOut size={16} />
              登出
            </button>
          )}
        </div>
      </aside>

      <div className="page-wrap">
        <Outlet />
      </div>
    </div>
  );
}
