import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { goals as initialGoals, transactions as initialTransactions } from "../data/mockData";

const AppDataContext = createContext(null);
const STORAGE_KEY = "stepProfitTransactions";
const GOALS_KEY = "stepProfitGoals";
const PROFILE_KEY = "stepProfitProfile";

const defaultProfile = {
  displayName: "我",
  monthlyBudget: 8000,
  contact: "",
  avatar: "",
  avatarScale: 100,
  avatarX: 0,
  avatarY: 0,
};

const today = () => new Date().toISOString().slice(0, 10);
const currentMonthKey = () => today().slice(0, 7);

const buildMoneySummary = (items) =>
  items.reduce(
    (result, item) => {
      result[item.type] += item.amount;
      return result;
    },
    { income: 0, expense: 0 },
  );

const buildExpenseCategories = (items, totalExpense) => {
  const categoryTotals = items
    .filter((item) => item.type === "expense")
    .reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + item.amount;
      return groups;
    }, {});

  return Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: totalExpense === 0 ? 0 : Math.round((amount / totalExpense) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
};

const loadTransactions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTransactions;
  } catch {
    return initialTransactions;
  }
};

const normalizeGoals = (items) =>
  items.map((goal) => ({
    ...goal,
    deposits: goal.deposits || [],
  }));

const loadGoals = () => {
  try {
    const saved = localStorage.getItem(GOALS_KEY);
    return saved ? normalizeGoals(JSON.parse(saved)) : normalizeGoals(initialGoals);
  } catch {
    return normalizeGoals(initialGoals);
  }
};

const loadProfile = () => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(loadTransactions);
  const [goals, setGoals] = useState(loadGoals);
  const [profile, setProfile] = useState(loadProfile);
  const [dataError, setDataError] = useState("");
  const useCloud = Boolean(isFirebaseConfigured && db && user);

  const runCloudAction = useCallback((action, errorMessage) => {
    setDataError("");
    action().catch(() => {
      setDataError(errorMessage);
    });
  }, []);

  useEffect(() => {
    if (useCloud) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, useCloud]);

  useEffect(() => {
    if (useCloud) {
      return;
    }

    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals, useCloud]);

  useEffect(() => {
    if (useCloud) {
      return;
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, useCloud]);

  useEffect(() => {
    if (!useCloud) {
      return undefined;
    }

    const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const goalsQuery = query(collection(db, "goals"), where("userId", "==", user.uid));
    const profileRef = doc(db, "users", user.uid);

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const nextTransactions = snapshot.docs
          .map((transactionDoc) => ({ ...transactionDoc.data(), id: transactionDoc.id }))
          .sort((a, b) => b.date.localeCompare(a.date));
        setTransactions(nextTransactions);
      },
      () => setDataError("讀取記帳資料失敗，請確認 Firestore 規則與 Firebase 設定"),
    );

    const unsubscribeGoals = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const nextGoals = normalizeGoals(snapshot.docs.map((goalDoc) => ({ ...goalDoc.data(), id: goalDoc.id })));
        setGoals(nextGoals);
      },
      () => setDataError("讀取目標資料失敗，請確認 Firestore 規則與 Firebase 設定"),
    );

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ ...defaultProfile, ...snapshot.data() });
        } else {
          const nextProfile = {
            ...defaultProfile,
            displayName: user.displayName || user.email?.split("@")[0] || defaultProfile.displayName,
            contact: user.email || "",
            email: user.email,
          };
          setProfile(nextProfile);
          runCloudAction(
            () => setDoc(profileRef, nextProfile, { merge: true }),
            "建立使用者資料失敗，請確認 users 規則",
          );
        }
      },
      () => setDataError("讀取個人資料失敗，請確認 users 規則"),
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeGoals();
      unsubscribeProfile();
    };
  }, [runCloudAction, useCloud, user]);

  const addTransaction = (payload) => {
    const amount = Number(payload.amount);

    if (!payload.category.trim() || !amount || amount < 0) {
      return false;
    }

    const nextTransaction = {
      id: crypto.randomUUID(),
      type: payload.type,
      category: payload.category.trim(),
      amount,
      note: payload.note.trim() || "未填寫備註",
      date: payload.date || today(),
    };

    if (useCloud) {
      runCloudAction(
        () =>
          addDoc(collection(db, "transactions"), {
            ...nextTransaction,
            userId: user.uid,
          }),
        "新增記帳失敗，請確認 transactions 規則",
      );
      return true;
    }

    setTransactions((items) => [nextTransaction, ...items]);
    return true;
  };

  const removeTransaction = (id) => {
    if (useCloud) {
      runCloudAction(() => deleteDoc(doc(db, "transactions", id)), "刪除記帳失敗，請確認資料權限");
      return;
    }

    setTransactions((items) => items.filter((item) => item.id !== id));
  };

  const updateProfile = (patch) => {
    if (useCloud) {
      const nextProfile = { ...profile, ...patch };
      setProfile(nextProfile);
      runCloudAction(
        () => setDoc(doc(db, "users", user.uid), { ...nextProfile, updatedAt: Date.now() }, { merge: true }),
        "儲存個人設定失敗，請確認 users 規則",
      );
      return;
    }

    setProfile((current) => ({ ...current, ...patch }));
  };

  const addGoal = (payload) => {
    const targetAmount = Number(payload.targetAmount);
    const currentAmount = Number(payload.currentAmount || 0);

    if (!payload.title.trim() || !targetAmount || targetAmount <= 0 || currentAmount < 0) {
      return false;
    }

    const nextGoal = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      targetAmount,
      currentAmount,
      targetDate: payload.targetDate || today(),
      note: payload.note.trim() || "未填寫備註",
      deposits: [],
    };

    if (useCloud) {
      runCloudAction(
        () =>
          addDoc(collection(db, "goals"), {
            ...nextGoal,
            userId: user.uid,
          }),
        "新增目標失敗，請確認 goals 規則",
      );
      return true;
    }

    setGoals((items) => [nextGoal, ...items]);
    return true;
  };

  const addGoalDeposit = (goalId, payload) => {
    const amount = Number(payload.amount);

    if (!amount || amount <= 0) {
      return false;
    }

    const nextGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      return {
        ...goal,
        currentAmount: goal.currentAmount + amount,
        deposits: [
          {
            id: crypto.randomUUID(),
            amount,
            note: payload.note.trim() || "新增存款",
            date: payload.date || today(),
          },
          ...goal.deposits,
        ],
      };
    });
    const nextGoal = nextGoals.find((goal) => goal.id === goalId);

    if (useCloud && nextGoal) {
      runCloudAction(
        () =>
          updateDoc(doc(db, "goals", goalId), {
            currentAmount: nextGoal.currentAmount,
            deposits: nextGoal.deposits,
          }),
        "新增存款失敗，請確認 goals 更新規則",
      );
      return true;
    }

    setGoals(nextGoals);
    return true;
  };

  const updateGoalDeposit = (goalId, depositId, payload) => {
    const amount = Number(payload.amount);

    if (!amount || amount <= 0) {
      return false;
    }

    const nextGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const oldDeposit = goal.deposits.find((deposit) => deposit.id === depositId);

      if (!oldDeposit) {
        return goal;
      }

      const amountDiff = amount - oldDeposit.amount;

      return {
        ...goal,
        currentAmount: Math.max(goal.currentAmount + amountDiff, 0),
        deposits: goal.deposits.map((deposit) =>
          deposit.id === depositId
            ? {
                ...deposit,
                amount,
                note: payload.note.trim() || "新增存款",
                date: payload.date || today(),
              }
            : deposit,
        ),
      };
    });
    const nextGoal = nextGoals.find((goal) => goal.id === goalId);

    if (useCloud && nextGoal) {
      runCloudAction(
        () =>
          updateDoc(doc(db, "goals", goalId), {
            currentAmount: nextGoal.currentAmount,
            deposits: nextGoal.deposits,
          }),
        "編輯存款失敗，請確認 goals 更新規則",
      );
      return true;
    }

    setGoals(nextGoals);
    return true;
  };

  const removeGoalDeposit = (goalId, depositId) => {
    const nextGoals = goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const deposit = goal.deposits.find((item) => item.id === depositId);

      if (!deposit) {
        return goal;
      }

      return {
        ...goal,
        currentAmount: Math.max(goal.currentAmount - deposit.amount, 0),
        deposits: goal.deposits.filter((item) => item.id !== depositId),
      };
    });
    const nextGoal = nextGoals.find((goal) => goal.id === goalId);

    if (useCloud && nextGoal) {
      runCloudAction(
        () =>
          updateDoc(doc(db, "goals", goalId), {
            currentAmount: nextGoal.currentAmount,
            deposits: nextGoal.deposits,
          }),
        "取消存款失敗，請確認 goals 更新規則",
      );
      return;
    }

    setGoals(nextGoals);
  };

  const removeGoal = (goalId) => {
    if (useCloud) {
      runCloudAction(() => deleteDoc(doc(db, "goals", goalId)), "刪除目標失敗，請確認資料權限");
      return;
    }

    setGoals((items) => items.filter((goal) => goal.id !== goalId));
  };

  const summary = useMemo(() => {
    const month = currentMonthKey();
    const monthTransactions = transactions.filter((item) => item.date.startsWith(month));
    const monthMoney = buildMoneySummary(monthTransactions);
    const totalMoney = buildMoneySummary(transactions);
    const income = monthMoney.income;
    const expense = monthMoney.expense;
    const balance = income - expense;
    const budget = Number(profile.monthlyBudget) || defaultProfile.monthlyBudget;
    const budgetRate = expense === 0 ? 0 : Math.round((expense / budget) * 100);
    const overBudget = expense > budget;
    const overBudgetAmount = Math.max(expense - budget, 0);
    const negativeBalance = balance < 0;
    const totalBalance = totalMoney.income - totalMoney.expense;
    const activeMonths = new Set(transactions.map((item) => item.date.slice(0, 7))).size || 1;
    const goalSavedTotal = goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0);
    const goalTargetTotal = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
    const achievedGoals = goals.filter((goal) => Number(goal.currentAmount || 0) >= Number(goal.targetAmount || 0));
    const monthAchievedGoals = achievedGoals.filter(
      (goal) => goal.targetDate?.startsWith(month) || goal.deposits?.some((deposit) => deposit.date?.startsWith(month)),
    );

    return {
      month,
      income,
      expense,
      balance,
      budget,
      budgetRate,
      overBudget,
      overBudgetAmount,
      negativeBalance,
      categories: buildExpenseCategories(monthTransactions, expense),
      monthTransactions,
      goalSavedTotal,
      goalTargetTotal,
      goalRemainingTotal: Math.max(goalTargetTotal - goalSavedTotal, 0),
      goalProgress: goalTargetTotal === 0 ? 0 : Math.min(Math.round((goalSavedTotal / goalTargetTotal) * 100), 100),
      availableForGoals: Math.max(balance, 0),
      achievedGoalsCount: achievedGoals.length,
      monthAchievedGoalsCount: monthAchievedGoals.length,
      totals: {
        income: totalMoney.income,
        expense: totalMoney.expense,
        balance: totalBalance,
      },
      averages: {
        income: Math.round(totalMoney.income / activeMonths),
        expense: Math.round(totalMoney.expense / activeMonths),
        balance: Math.round(totalBalance / activeMonths),
      },
    };
  }, [goals, transactions, profile.monthlyBudget]);

  const value = useMemo(
    () => ({
      transactions,
      goals,
      profile,
      summary,
      dataError,
      addTransaction,
      removeTransaction,
      updateProfile,
      addGoal,
      addGoalDeposit,
      updateGoalDeposit,
      removeGoalDeposit,
      removeGoal,
      useCloud,
    }),
    [transactions, goals, profile, summary, dataError, useCloud],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
