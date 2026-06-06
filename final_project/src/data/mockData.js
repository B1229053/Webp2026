export const transactions = [
  { id: 1, type: "expense", category: "飲食", amount: 85, note: "早餐飯糰與豆漿", date: "2026-06-03" },
  { id: 2, type: "expense", category: "交通", amount: 30, note: "公車", date: "2026-06-03" },
  { id: 3, type: "expense", category: "飲料", amount: 60, note: "珍珠奶茶", date: "2026-06-02" },
  { id: 4, type: "income", category: "打工", amount: 1200, note: "週末打工", date: "2026-06-01" },
  { id: 5, type: "expense", category: "學校", amount: 240, note: "影印與文具", date: "2026-06-01" },
];

export const goals = [
  {
    id: 1,
    title: "新筆電",
    targetAmount: 50000,
    currentAmount: 18500,
    targetDate: "2026-12-31",
    note: "希望專題展示前先存到一半",
  },
  {
    id: 2,
    title: "畢旅基金",
    targetAmount: 12000,
    currentAmount: 4200,
    targetDate: "2026-09-01",
    note: "每週少買兩杯飲料",
  },
];

export const circleMembers = [
  { id: "me", name: "我", spending: 3260, budget: 8000 },
  { id: "amy", name: "Amy", spending: 5180, budget: 7000 },
  { id: "kai", name: "Kai", spending: 2640, budget: 6500 },
];

export const comments = [
  {
    id: 1,
    author: "Amy",
    target: "我",
    type: "鼓勵",
    content: "這週飲料費有下降欸，繼續保持",
    time: "今天 13:20",
  },
  {
    id: 2,
    author: "Kai",
    target: "Amy",
    type: "提醒",
    content: "妳的外食快超過預算了，月底先忍一下",
    time: "昨天 22:10",
  },
];
