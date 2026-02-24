import { useState, useEffect, useCallback, useRef } from "react";

// ==================== 設定 ====================
const API_URL = "https://script.google.com/a/macros/violetflames.com/s/AKfycbxL0204eM6cvfgtbMy8qZrSPCUtLEYP1k3KgUJoInaowbUIk1YGLIwmaeGzDmIM2kU_/exec";
const AUTO_REFRESH_INTERVAL = 15000; // 15 秒自動刷新

// ==================== 初始資料 ====================
const INITIAL_DATA = [
  { id: 1, date: "114/11/17", category: "總務", requester: "Brenda", description: "總務-公司公用衛生紙*112包", invoice: "VM56982415", income: 0, expense: 1115, company: "紫焰" },
  { id: 2, date: "114/11/29", category: "總務", requester: "Brenda", description: "總務-師尊及佛母用餐調味料醬碟*2", invoice: "VG30592792", income: 0, expense: 278, company: "紫焰" },
];

const DEFAULT_CATEGORIES = ["總務", "創命", "公司商品", "拍賣會", "採購", "創命/拍賣"];
const fmt = (n) => `$${Number(n).toLocaleString()}`;
const determineCompany = (category) => category === "創命" ? "終極" : "紫焰";

// ==================== 判斷是否為唯讀模式 ====================
function isViewMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "view";
}

// ==================== 小元件 ====================
const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: "10px 22px", background: active ? "#1a1a2e" : "transparent", color: active ? "#e8c97a" : "#888", border: "none", borderBottom: active ? "2px solid #e8c97a" : "2px solid transparent", cursor: "pointer", fontSize: "14px", fontFamily: "'Noto Serif TC', serif", fontWeight: active ? "700" : "400", transition: "all 0.2s", whiteSpace: "nowrap" }}>{children}</button>
);

const Badge = ({ children, color }) => (
  <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", background: color === "gold" ? "rgba(232,201,122,0.18)" : "rgba(100,180,255,0.15)", color: color === "gold" ? "#e8c97a" : "#64b4ff", border: `1px solid ${color === "gold" ? "rgba(232,201,122,0.4)" : "rgba(100,180,255,0.3)"}` }}>{children}</span>
);

const StatCard = ({ label, value, sub, highlight }) => (
  <div style={{ background: highlight ? "rgba(232,201,122,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${highlight ? "rgba(232,201,122,0.35)" : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", padding: "16px 20px", minWidth: "140px" }}>
    <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>{label}</div>
    <div style={{ fontSize: "22px", fontWeight: "700", color: highlight ? "#e8c97a" : "#fff", fontFamily: "'Noto Serif TC', serif" }}>{value}</div>
    {sub && <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>{sub}</div>}
  </div>
);

// ==================== 即時同步脈動指示器 ====================
const LivePulse = ({ lastUpdated, isPolling }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span style={{
      width: "8px", height: "8px", borderRadius: "50%",
      background: isPolling ? "#6de89a" : "#ffa36e",
      boxShadow: isPolling ? "0 0 6px rgba(109,232,154,0.6)" : "none",
      animation: isPolling ? "pulse 2s infinite" : "none",
      display: "inline-block"
    }} />
    <span style={{ fontSize: "11px", color: "#888" }}>
      {isPolling ? "即時同步中" : "同步暫停"}
    </span>
    {lastUpdated && (
      <span style={{ fontSize: "10px", color: "#555" }}>
        | 最後更新：{lastUpdated}
      </span>
    )}
  </div>
);

// ==================== 分享連結按鈕 ====================
const ShareButton = ({ viewMode }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = baseUrl + "?mode=view";
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (viewMode) return null;

  return (
    <button onClick={handleShare} style={{
      background: copied ? "rgba(109,232,154,0.15)" : "rgba(100,180,255,0.1)",
      color: copied ? "#6de89a" : "#64b4ff",
      border: `1px solid ${copied ? "rgba(109,232,154,0.3)" : "rgba(100,180,255,0.25)"}`,
      padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
      fontSize: "12px", fontFamily: "'Noto Serif TC', serif",
      transition: "all 0.2s"
    }}>
      {copied ? "已複製連結！" : "分享給財務部門"}
    </button>
  );
};

// ==================== 唯讀模式橫幅 ====================
const ViewModeBanner = () => (
  <div style={{
    background: "linear-gradient(135deg, rgba(100,180,255,0.12), rgba(100,180,255,0.06))",
    border: "1px solid rgba(100,180,255,0.25)",
    borderRadius: "8px",
    padding: "12px 20px",
    margin: "0 24px 16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#64b4ff"
  }}>
    <span style={{ fontSize: "16px" }}>👁</span>
    <span><strong>瀏覽模式</strong> — 此為唯讀檢視，資料每 15 秒自動更新。如需編輯請聯絡管理員。</span>
  </div>
);

// ==================== 主程式 ====================
export default function App() {
  const viewMode = isViewMode();

  const [tab, setTab] = useState("紫焰");
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [filterCat, setFilterCat] = useState("全部");
  const [searchText, setSearchText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [lalaRecords, setLalaRecords] = useState([]);
  const [showLalaForm, setShowLalaForm] = useState(false);
  const [syncStatus, setSyncStatus] = useState("載入中...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);
  const [form, setForm] = useState({ date: "", category: "總務", requester: "Brenda", description: "", invoice: "", income: "", expense: "" });
  const [lalaForm, setLalaForm] = useState({ date: "", description: "", payType: "現金", amount: "", invoice: "" });
  const pollingRef = useRef(null);
  const isSavingRef = useRef(false);

  // ==================== 從 Google Sheets 載入資料 ====================
  const loadFromSheets = useCallback(async (silent = false) => {
    // 儲存中時不拉取，避免衝突
    if (isSavingRef.current) return;

    if (!silent) {
      setIsLoading(true);
      setSyncStatus("從 Google Sheets 載入...");
    }
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.records && data.records.length > 0) {
        setRecords(data.records.map(r => ({ ...r, id: Number(r.id), income: Number(r.income) || 0, expense: Number(r.expense) || 0 })));
      } else if (!silent) {
        setRecords(INITIAL_DATA);
      }
      if (data.lala && data.lala.length > 0) setLalaRecords(data.lala.map(r => ({ ...r, id: Number(r.id), amount: Number(r.amount) || 0 })));
      if (data.categories && data.categories.length > 0) setCategories(data.categories);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      setLastUpdated(timeStr);
      setDataVersion(v => v + 1);
      if (!silent) setSyncStatus("已與 Google Sheets 同步");
      setIsPolling(true);
    } catch (e) {
      if (!silent) setSyncStatus("無法連線，顯示初始資料");
      if (!silent) setRecords(INITIAL_DATA);
      setIsPolling(false);
    }
    if (!silent) {
      setIsLoading(false);
      setTimeout(() => setSyncStatus(""), 4000);
    }
  }, []);

  // ==================== 初始載入 + 自動輪詢 ====================
  useEffect(() => {
    loadFromSheets();
  }, [loadFromSheets]);

  useEffect(() => {
    // 每 15 秒自動從 Google Sheets 拉取最新資料（靜默模式）
    pollingRef.current = setInterval(() => {
      loadFromSheets(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadFromSheets]);

  // ==================== 儲存至 Google Sheets ====================
  const saveToSheets = useCallback(async (r, l, c) => {
    setIsSaving(true);
    isSavingRef.current = true;
    setSyncStatus("儲存至 Google Sheets...");
    try {
      const payload = encodeURIComponent(JSON.stringify({ action: "save_all", records: r, lala: l, categories: c }));
      const res = await fetch(`${API_URL}?data=${payload}`);
      const result = await res.json();
      if (result.success) {
        setSyncStatus("已儲存至 Google Sheets");
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        setLastUpdated(timeStr);
      } else {
        setSyncStatus("儲存失敗：" + (result.error || "未知錯誤"));
      }
    } catch (e) {
      setSyncStatus("儲存失敗，請重試");
    }
    setIsSaving(false);
    isSavingRef.current = false;
    setTimeout(() => setSyncStatus(""), 3000);
  }, []);

  // ==================== 計算統計 ====================
  const ziyanRecords = records.filter(r => r.company === "紫焰");
  const jijieRecords = records.filter(r => r.company === "終極");
  const calcStats = (recs) => ({ totalExpense: recs.reduce((s, r) => s + r.expense, 0), totalIncome: recs.reduce((s, r) => s + r.income, 0), net: recs.reduce((s, r) => s + r.expense - r.income, 0) });
  const ziyanStats = calcStats(ziyanRecords);
  const jijieStats = calcStats(jijieRecords);
  const ziyan_base = 20000, ziyan_subsidy = 15000, ziyan_total_allocated = 35000;
  const ziyan_overrun = ziyanStats.net - ziyan_base;
  const ziyan_pending = ziyan_overrun - ziyan_subsidy;
  const jijie_allocated = 5000;
  const jijie_balance = jijie_allocated - jijieStats.net;
  const activeRecords = tab === "紫焰" ? ziyanRecords : tab === "終極" ? jijieRecords : records;
  const filtered = activeRecords.filter(r => (filterCat === "全部" || r.category === filterCat) && (searchText === "" || r.description.includes(searchText) || r.invoice.includes(searchText)));

  // ==================== LALA 運費 ====================
  const autoLalaRecords = records
    .filter(r => r.description.includes("LALA") && r.expense > 0)
    .map(r => ({
      id: "auto_" + r.id,
      date: r.date,
      description: r.description,
      payType: r.description.includes("儲值") ? "信用卡預儲" : "現金",
      amount: r.expense,
      invoice: r.invoice,
      auto: true,
      company: r.company,
    }));
  const allLalaRecords = [...autoLalaRecords, ...lalaRecords];
  const lalaCash = allLalaRecords.filter(r => r.payType === "現金").reduce((s, r) => s + r.amount, 0);
  const lalaCredit = allLalaRecords.filter(r => r.payType === "信用卡預儲").reduce((s, r) => s + r.amount, 0);

  // ==================== 操作處理 ====================
  const handleAddRecord = () => {
    if (viewMode) return;
    const company = determineCompany(form.category);
    const newRec = { id: editingId || Date.now(), date: form.date, category: form.category, requester: form.requester, description: form.description, invoice: form.invoice, income: Number(form.income) || 0, expense: Number(form.expense) || 0, company };
    const updated = editingId ? records.map(r => r.id === editingId ? newRec : r) : [...records, newRec];
    setRecords(updated);
    saveToSheets(updated, lalaRecords, categories);
    setForm({ date: "", category: "總務", requester: "Brenda", description: "", invoice: "", income: "", expense: "" });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (rec) => {
    if (viewMode) return;
    setForm({ date: rec.date, category: rec.category, requester: rec.requester, description: rec.description, invoice: rec.invoice, income: rec.income || "", expense: rec.expense || "" });
    setEditingId(rec.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (viewMode) return;
    if (!window.confirm("確定刪除？")) return;
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveToSheets(updated, lalaRecords, categories);
  };

  const handleAddCategory = () => {
    if (viewMode) return;
    if (newCat && !categories.includes(newCat)) {
      const updated = [...categories, newCat];
      setCategories(updated);
      saveToSheets(records, lalaRecords, updated);
      setNewCat("");
      setShowAddCat(false);
    }
  };

  const handleAddLala = () => {
    if (viewMode) return;
    const newRec = { id: Date.now(), date: lalaForm.date, description: lalaForm.description, payType: lalaForm.payType, amount: Number(lalaForm.amount) || 0, invoice: lalaForm.invoice };
    const updated = [...lalaRecords, newRec];
    setLalaRecords(updated);
    saveToSheets(records, updated, categories);
    setLalaForm({ date: "", description: "", payType: "現金", amount: "", invoice: "" });
    setShowLalaForm(false);
  };

  const handleDeleteLala = (id) => {
    if (viewMode) return;
    if (!window.confirm("確定刪除？")) return;
    const updated = lalaRecords.filter(r => r.id !== id);
    setLalaRecords(updated);
    saveToSheets(records, updated, categories);
  };

  const exportCSV = () => {
    const rows = [["序號", "日期", "類別", "請款人", "請款內容", "發票/收據", "收入", "支出", "公司"], ...filtered.map((r, i) => [i + 1, r.date, r.category, r.requester, r.description, r.invoice, r.income, r.expense, r.company])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `零用金明細_${tab}.csv`;
    a.click();
  };

  // ==================== 樣式 ====================
  const inputStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", outline: "none", width: "100%", fontFamily: "'Noto Serif TC', serif" };
  const selectStyle = { background: "#2a2a3e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", outline: "none", width: "100%", fontFamily: "'Noto Serif TC', serif" };
  const btnPrimary = { background: "linear-gradient(135deg,#e8c97a,#c9a84c)", color: "#1a1a2e", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: isSaving ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "13px", fontFamily: "'Noto Serif TC', serif", opacity: isSaving ? 0.7 : 1 };
  const btnSecondary = { background: "rgba(255,255,255,0.08)", color: "#ccc", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontFamily: "'Noto Serif TC', serif" };
  const btnDanger = { background: "rgba(255,80,80,0.15)", color: "#ff6060", border: "1px solid rgba(255,80,80,0.3)", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };
  const btnEdit = { background: "rgba(100,180,255,0.12)", color: "#64b4ff", border: "1px solid rgba(100,180,255,0.3)", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };
  const statusColor = syncStatus.includes("已") ? "#6de89a" : syncStatus.includes("失敗") || syncStatus.includes("無法") ? "#ffa36e" : "#aaa";

  // ==================== 渲染 ====================
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#e0e0e0", fontFamily: "'Noto Serif TC', serif" }}>
      {/* CSS 動畫 for 即時同步脈動 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* 載入中遮罩 */}
      {isLoading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,13,26,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <div style={{ color: "#e8c97a", fontSize: "16px", fontFamily: "'Noto Serif TC', serif" }}>從 Google Sheets 載入資料中...</div>
          </div>
        </div>
      )}

      {/* ==================== 頂部導航列 ==================== */}
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderBottom: "1px solid rgba(232,201,122,0.3)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#e8c97a,#c9a84c)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💰</div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#e8c97a" }}>
              零用金管理系統
              {viewMode && <span style={{ fontSize: "12px", color: "#64b4ff", marginLeft: "8px", fontWeight: "400" }}>（瀏覽模式）</span>}
            </div>
            <div style={{ fontSize: "11px", color: "#555" }}>114/11/17 – 115/02/11</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <LivePulse lastUpdated={lastUpdated} isPolling={isPolling} />
          {syncStatus && <span style={{ fontSize: "12px", color: statusColor }}>{syncStatus}</span>}
          <button onClick={() => loadFromSheets(false)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: "12px" }} disabled={isLoading}>🔄 重新整理</button>
          <ShareButton viewMode={viewMode} />
          <span style={{ fontSize: "11px", color: "#4a9", background: "rgba(0,200,100,0.08)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(0,200,100,0.2)" }}>🟢 Google Sheets 已連線</span>
        </div>
      </div>

      {/* ==================== 分頁 ==================== */}
      <div style={{ background: "#13132a", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px", display: "flex", gap: "4px", overflowX: "auto" }}>
        {["紫焰", "終極", "LALA運費"].map(t => <TabButton key={t} active={tab === t} onClick={() => setTab(t)}>{t === "紫焰" ? "🔴 紫焰有限公司" : t === "終極" ? "🔵 終極有限公司" : "📦 LALA運費儲值"}</TabButton>)}
      </div>

      {/* 唯讀模式橫幅 */}
      {viewMode && <div style={{ paddingTop: "16px" }}><ViewModeBanner /></div>}

      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* ==================== LALA 運費分頁 ==================== */}
        {tab === "LALA運費" && (
          <div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
              <StatCard label="現金支付合計" value={fmt(lalaCash)} />
              <StatCard label="信用卡預儲合計" value={fmt(lalaCredit)} highlight />
              <StatCard label="總儲值金額" value={fmt(lalaCash + lalaCredit)} />
              <StatCard label="自動抓取" value={`${autoLalaRecords.length} 筆`} sub="含LALA字樣" />
              <StatCard label="手動新增" value={`${lalaRecords.length} 筆`} />
              <StatCard label="總筆數" value={`${allLalaRecords.length} 筆`} />
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
              <div style={{ background: "rgba(100,180,255,0.08)", border: "1px solid rgba(100,180,255,0.25)", borderRadius: "10px", padding: "14px 20px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>💵 現金支付合計</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#6de89a" }}>{fmt(lalaCash)}</div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>{allLalaRecords.filter(r => r.payType === "現金").length} 筆</div>
              </div>
              <div style={{ background: "rgba(232,201,122,0.08)", border: "1px solid rgba(232,201,122,0.3)", borderRadius: "10px", padding: "14px 20px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>💳 信用卡預儲合計</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#e8c97a" }}>{fmt(lalaCredit)}</div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>{allLalaRecords.filter(r => r.payType === "信用卡預儲").length} 筆</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 20px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>合計</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>{fmt(lalaCash + lalaCredit)}</div>
              </div>
            </div>

            <div style={{ background: "rgba(100,200,100,0.06)", border: "1px solid rgba(100,200,100,0.2)", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px", fontSize: "13px", color: "#ccc" }}>
              🤖 <strong style={{ color: "#6de89a" }}>自動規則：</strong>請款內容含「LALA」+「儲值」→ 信用卡預儲；含「LALA」無「儲值」→ 現金。可手動新增補充其他紀錄。
            </div>

            {/* 手動新增（僅編輯模式） */}
            {!viewMode && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <button style={btnPrimary} onClick={() => setShowLalaForm(v => !v)}>{showLalaForm ? "✕ 取消" : "+ 手動新增紀錄"}</button>
              </div>
            )}

            {!viewMode && showLalaForm && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>手動新增（補充自動抓取以外的 LALA 費用）</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
                  {[["日期", "date", "text"], ["說明", "description", "text"], ["發票/收據", "invoice", "text"], ["金額", "amount", "number"]].map(([label, key, type]) => (
                    <div key={key}><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>{label}</label><input type={type} style={inputStyle} value={lalaForm[key]} onChange={e => setLalaForm(p => ({ ...p, [key]: e.target.value }))} /></div>
                  ))}
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>付款方式</label><select style={selectStyle} value={lalaForm.payType} onChange={e => setLalaForm(p => ({ ...p, payType: e.target.value }))}><option>現金</option><option>信用卡預儲</option></select></div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button style={btnPrimary} onClick={handleAddLala} disabled={isSaving}>儲存</button>
                  <button style={btnSecondary} onClick={() => setShowLalaForm(false)}>取消</button>
                </div>
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead><tr style={{ background: "rgba(255,255,255,0.06)" }}>
                  {["來源", "日期", "說明", "付款方式", "金額", "發票/收據", ...(viewMode ? [] : ["操作"])].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#888", fontWeight: "600", borderBottom: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {allLalaRecords.length === 0 && <tr><td colSpan={viewMode ? 6 : 7} style={{ padding: "40px", textAlign: "center", color: "#555" }}>尚無紀錄</td></tr>}
                  {allLalaRecords.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: r.auto ? "rgba(100,200,100,0.03)" : "rgba(232,201,122,0.03)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        {r.auto
                          ? <span style={{ fontSize: "11px", background: "rgba(100,200,100,0.15)", color: "#6de89a", padding: "2px 7px", borderRadius: "4px", border: "1px solid rgba(100,200,100,0.3)" }}>自動</span>
                          : <span style={{ fontSize: "11px", background: "rgba(232,201,122,0.15)", color: "#e8c97a", padding: "2px 7px", borderRadius: "4px", border: "1px solid rgba(232,201,122,0.3)" }}>手動</span>
                        }
                      </td>
                      <td style={{ padding: "10px 12px", color: "#aaa", whiteSpace: "nowrap" }}>{r.date}</td>
                      <td style={{ padding: "10px 12px", maxWidth: "220px", fontSize: "12px" }}>{r.description}</td>
                      <td style={{ padding: "10px 12px" }}><Badge color={r.payType === "信用卡預儲" ? "gold" : "blue"}>{r.payType}</Badge></td>
                      <td style={{ padding: "10px 12px", color: r.payType === "信用卡預儲" ? "#e8c97a" : "#6de89a", fontWeight: "700" }}>{fmt(r.amount)}</td>
                      <td style={{ padding: "10px 12px", color: "#666", fontSize: "12px" }}>{r.invoice}</td>
                      {!viewMode && (
                        <td style={{ padding: "10px 12px" }}>
                          {r.auto
                            ? <span style={{ fontSize: "11px", color: "#555" }}>—</span>
                            : <button style={btnDanger} onClick={() => handleDeleteLala(r.id)}>刪除</button>
                          }
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "rgba(232,201,122,0.08)", borderTop: "1px solid rgba(232,201,122,0.3)" }}>
                    <td colSpan={4} style={{ padding: "10px", color: "#e8c97a", fontWeight: "700" }}>合計</td>
                    <td style={{ padding: "10px", color: "#fff", fontWeight: "700" }}>{fmt(allLalaRecords.reduce((s, r) => s + r.amount, 0))}</td>
                    <td colSpan={viewMode ? 1 : 2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ==================== 紫焰 / 終極 分頁 ==================== */}
        {(tab === "紫焰" || tab === "終極") && (
          <>
            {tab === "紫焰" && (
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
                <StatCard label="本期總支出" value={fmt(ziyanStats.totalExpense)} />
                <StatCard label="本期收入" value={fmt(ziyanStats.totalIncome)} />
                <StatCard label="本期淨支出" value={fmt(ziyanStats.net)} />
                <StatCard label="常態零用金基數" value={fmt(ziyan_base)} />
                <StatCard label="2/10 已補貼" value={fmt(ziyan_subsidy)} sub={`總撥補 ${fmt(ziyan_total_allocated)}`} />
                <StatCard label="超支金額" value={fmt(Math.max(0, ziyan_overrun))} sub="淨支出 - 常態 $20,000" highlight={ziyan_overrun > 0} />
                <StatCard label="待撥補差額" value={fmt(Math.max(0, ziyan_pending))} sub="超支 - 已補貼 $15,000" highlight />
              </div>
            )}
            {tab === "終極" && (
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
                <StatCard label="本期總支出" value={fmt(jijieStats.totalExpense)} />
                <StatCard label="本期收入" value={fmt(jijieStats.totalIncome)} />
                <StatCard label="本期淨支出" value={fmt(jijieStats.net)} />
                <StatCard label="已撥補金額" value={fmt(jijie_allocated)} />
                <StatCard label={jijie_balance >= 0 ? "尚有結餘" : "待補貼"} value={fmt(Math.abs(jijie_balance))} highlight />
              </div>
            )}

            {/* 類別篩選 */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px", fontWeight: "600" }}>依類別小計（點擊篩選）</div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ background: filterCat === "全部" ? "rgba(232,201,122,0.15)" : "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", border: filterCat === "全部" ? "1px solid rgba(232,201,122,0.4)" : "1px solid transparent" }} onClick={() => setFilterCat("全部")}>
                  <div style={{ fontSize: "11px", color: filterCat === "全部" ? "#e8c97a" : "#888" }}>全部</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: filterCat === "全部" ? "#e8c97a" : "#ccc" }}>{fmt(activeRecords.reduce((s, r) => s + r.expense - r.income, 0))}</div>
                </div>
                {[...new Set(activeRecords.map(r => r.category))].map(cat => {
                  const total = activeRecords.filter(r => r.category === cat).reduce((s, r) => s + r.expense - r.income, 0);
                  return <div key={cat} style={{ background: filterCat === cat ? "rgba(232,201,122,0.15)" : "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", border: filterCat === cat ? "1px solid rgba(232,201,122,0.4)" : "1px solid transparent" }} onClick={() => setFilterCat(f => f === cat ? "全部" : cat)}>
                    <div style={{ fontSize: "11px", color: filterCat === cat ? "#e8c97a" : "#888" }}>{cat}</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: filterCat === cat ? "#e8c97a" : "#ccc" }}>{fmt(total)}</div>
                  </div>;
                })}
              </div>
            </div>

            {/* 工具列 */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
              <input placeholder="🔍 搜尋摘要/發票" style={{ ...inputStyle, width: "200px" }} value={searchText} onChange={e => setSearchText(e.target.value)} />
              <select style={{ ...selectStyle, width: "130px" }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option>全部</option>{categories.map(c => <option key={c}>{c}</option>)}
              </select>
              {!viewMode && (
                <>
                  <button style={btnPrimary} onClick={() => { setEditingId(null); setForm({ date: "", category: tab === "終極" ? "創命" : "總務", requester: "Brenda", description: "", invoice: "", income: "", expense: "" }); setShowAddForm(v => !v); }}>
                    {showAddForm && !editingId ? "✕ 取消" : "+ 新增"}
                  </button>
                  <button style={btnSecondary} onClick={() => setShowAddCat(v => !v)}>＋ 新增類別</button>
                </>
              )}
              <button style={{ ...btnSecondary, marginLeft: "auto" }} onClick={exportCSV}>⬇ 匯出 CSV</button>
              <span style={{ fontSize: "12px", color: "#666" }}>{filtered.length} 筆｜{fmt(filtered.reduce((s, r) => s + r.expense, 0))}</span>
            </div>

            {/* 新增類別（僅編輯模式） */}
            {!viewMode && showAddCat && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
                <input placeholder="輸入新類別名稱" style={{ ...inputStyle, width: "180px" }} value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCategory()} />
                <button style={btnPrimary} onClick={handleAddCategory}>新增</button>
                <button style={btnSecondary} onClick={() => setShowAddCat(false)}>取消</button>
              </div>
            )}

            {/* 新增/編輯表單（僅編輯模式） */}
            {!viewMode && showAddForm && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(232,201,122,0.2)", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", color: "#e8c97a", marginBottom: "14px", fontWeight: "700" }}>{editingId ? "✏️ 編輯紀錄" : "＋ 新增零用金紀錄"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px" }}>
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>日期</label><input style={inputStyle} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="115/02/11" /></div>
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>類別</label><select style={selectStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>請款人</label><input style={inputStyle} value={form.requester} onChange={e => setForm(p => ({ ...p, requester: e.target.value }))} /></div>
                  <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>請款內容</label><input style={inputStyle} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>發票/收據號碼</label><input style={inputStyle} value={form.invoice} onChange={e => setForm(p => ({ ...p, invoice: e.target.value }))} /></div>
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>收入</label><input type="number" style={inputStyle} value={form.income} onChange={e => setForm(p => ({ ...p, income: e.target.value }))} placeholder="0" /></div>
                  <div><label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>支出</label><input type="number" style={inputStyle} value={form.expense} onChange={e => setForm(p => ({ ...p, expense: e.target.value }))} placeholder="0" /></div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}><div style={{ fontSize: "11px", color: "#666", background: "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: "6px", width: "100%" }}>歸屬：<strong style={{ color: form.category === "創命" ? "#64b4ff" : "#e8c97a" }}>{determineCompany(form.category)}</strong></div></div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button style={btnPrimary} onClick={handleAddRecord} disabled={isSaving}>儲存</button>
                  <button style={btnSecondary} onClick={() => { setShowAddForm(false); setEditingId(null); }}>取消</button>
                </div>
              </div>
            )}

            {/* ==================== 資料表格 ==================== */}
            <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr style={{ background: "rgba(255,255,255,0.06)" }}>
                  {["序", "日期", "類別", "請款人", "請款內容", "發票/收據", "收入", "支出", "公司", ...(viewMode ? [] : ["操作"])].map(h => <th key={h} style={{ padding: "10px", textAlign: "left", color: "#888", fontWeight: "600", borderBottom: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={viewMode ? 9 : 10} style={{ padding: "40px", textAlign: "center", color: "#555" }}>無符合條件的紀錄</td></tr>}
                  {filtered.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                      <td style={{ padding: "9px 10px", color: "#555" }}>{i + 1}</td>
                      <td style={{ padding: "9px 10px", color: "#aaa", whiteSpace: "nowrap" }}>{r.date}</td>
                      <td style={{ padding: "9px 10px" }}><Badge color={r.company === "終極" ? "blue" : "gold"}>{r.category}</Badge></td>
                      <td style={{ padding: "9px 10px", color: "#ccc" }}>{r.requester}</td>
                      <td style={{ padding: "9px 10px", maxWidth: "240px" }}>{r.description}</td>
                      <td style={{ padding: "9px 10px", color: "#666", fontSize: "11px" }}>{r.invoice}</td>
                      <td style={{ padding: "9px 10px", color: "#6de89a", fontWeight: r.income > 0 ? "700" : "400" }}>{r.income > 0 ? fmt(r.income) : "—"}</td>
                      <td style={{ padding: "9px 10px", color: "#ff8080", fontWeight: "600" }}>{r.expense > 0 ? fmt(r.expense) : "—"}</td>
                      <td style={{ padding: "9px 10px" }}><Badge color={r.company === "終極" ? "blue" : "gold"}>{r.company}</Badge></td>
                      {!viewMode && (
                        <td style={{ padding: "9px 10px" }}><div style={{ display: "flex", gap: "6px" }}><button style={btnEdit} onClick={() => handleEdit(r)}>編輯</button><button style={btnDanger} onClick={() => handleDelete(r.id)}>刪</button></div></td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "rgba(232,201,122,0.08)", borderTop: "1px solid rgba(232,201,122,0.3)" }}>
                    <td colSpan={6} style={{ padding: "10px", color: "#e8c97a", fontWeight: "700" }}>篩選合計</td>
                    <td style={{ padding: "10px", color: "#6de89a", fontWeight: "700" }}>{fmt(filtered.reduce((s, r) => s + r.income, 0))}</td>
                    <td style={{ padding: "10px", color: "#ff8080", fontWeight: "700" }}>{fmt(filtered.reduce((s, r) => s + r.expense, 0))}</td>
                    <td colSpan={viewMode ? 1 : 2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
