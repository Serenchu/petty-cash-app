import { useState, useEffect, useCallback } from "react";

const API_URL = "https://script.google.com/a/macros/violetflames.com/s/AKfycbxL0204eM6cvfgtbMy8qZrSPCUtLEYP1k3KgUJoInaowbUIk1YGLIwmaeGzDmIM2kU_/exec";

const INITIAL_DATA = [
  { id: 1, date: "114/11/17", category: "總務", requester: "Brenda", description: "總務-公司公用衛生紙*112包", invoice: "VM56982415", income: 0, expense: 1115, company: "紫焰" },
  { id: 2, date: "114/11/29", category: "總務", requester: "Brenda", description: "總務-師尊及佛母用餐調味料醬碟*2", invoice: "VG30592792", income: 0, expense: 278, company: "紫焰" },
  { id: 3, date: "114/12/01", category: "總務", requester: "Brenda", description: "總務-公司酒精4000ml*2", invoice: "UK10617624", income: 0, expense: 555, company: "紫焰" },
  { id: 4, date: "114/12/01", category: "總務", requester: "Brenda", description: "總務-公司廚房用品及文具一批", invoice: "VM58647451", income: 0, expense: 1457, company: "紫焰" },
  { id: 5, date: "114/12/04", category: "總務", requester: "Brenda", description: "總務-執行長寄送文件給廠商", invoice: "VM20309031", income: 0, expense: 166, company: "紫焰" },
  { id: 6, date: "114/12/05", category: "總務", requester: "Brenda", description: "總務-師尊和佛母捐物資給新北耶誕城", invoice: "免用統一發票", income: 0, expense: 3000, company: "紫焰" },
  { id: 7, date: "114/12/09", category: "總務", requester: "Brenda", description: "總務-Crystal公務計程車來回車費", invoice: "行程證明", income: 0, expense: 307, company: "紫焰" },
  { id: 8, date: "114/12/10", category: "總務", requester: "Brenda", description: "總務-廚房紙巾*18+員工衛生紙*30", invoice: "UK12246416", income: 0, expense: 860, company: "紫焰" },
  { id: 9, date: "114/12/11", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "VM20352451", income: 0, expense: 500, company: "紫焰" },
  { id: 10, date: "114/12/11", category: "總務", requester: "Brenda", description: "總務-公司擦手紙*13包", invoice: "VG37451017", income: 0, expense: 338, company: "紫焰" },
  { id: 11, date: "114/12/12", category: "總務", requester: "Brenda", description: "總務-場勘小登出場地去程1", invoice: "行程證明", income: 0, expense: 280, company: "紫焰" },
  { id: 12, date: "114/12/12", category: "總務", requester: "Brenda", description: "總務-場勘小登出場地去程2", invoice: "行程證明", income: 0, expense: 120, company: "紫焰" },
  { id: 13, date: "114/12/12", category: "總務", requester: "Brenda", description: "總務-師尊柳橙汁", invoice: "免用統一發票", income: 0, expense: 360, company: "紫焰" },
  { id: 14, date: "114/12/12", category: "總務", requester: "Brenda", description: "總務-場勘小登出場地回程", invoice: "行程證明", income: 0, expense: 270, company: "紫焰" },
  { id: 15, date: "114/12/16", category: "總務", requester: "Brenda", description: "總務-場勘拍賣會場地去程*1", invoice: "免用統一發票", income: 0, expense: 210, company: "紫焰" },
  { id: 16, date: "114/12/16", category: "總務", requester: "Brenda", description: "總務-場勘拍賣會場地回程", invoice: "免用統一發票", income: 0, expense: 305, company: "紫焰" },
  { id: 17, date: "114/12/18", category: "總務", requester: "Brenda", description: "總務-FB版主聚餐去程計程車", invoice: "行程證明", income: 0, expense: 327, company: "紫焰" },
  { id: 18, date: "114/12/18", category: "總務", requester: "Brenda", description: "總務-版主聚餐回程計程車費", invoice: "行程證明", income: 0, expense: 580, company: "紫焰" },
  { id: 19, date: "114/12/18", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "VM20387323", income: 0, expense: 500, company: "紫焰" },
  { id: 20, date: "114/12/19", category: "總務", requester: "Brenda", description: "總務-師尊柳橙汁", invoice: "免用統一發票", income: 0, expense: 360, company: "紫焰" },
  { id: 21, date: "114/12/19", category: "總務", requester: "Brenda", description: "總務-師尊柳橙汁", invoice: "免用統一發票", income: 0, expense: 360, company: "紫焰" },
  { id: 22, date: "114/12/21", category: "總務", requester: "Brenda", description: "莫子有約-拍立得底片*30張", invoice: "VN19327943", income: 0, expense: 873, company: "紫焰" },
  { id: 23, date: "114/12/24", category: "總務", requester: "Brenda", description: "總務-Crystal出席會議去程", invoice: "行程證明", income: 0, expense: 264, company: "紫焰" },
  { id: 24, date: "114/12/24", category: "總務", requester: "Brenda", description: "總務-常在律所開會去程計程車", invoice: "乘車證明", income: 0, expense: 215, company: "紫焰" },
  { id: 25, date: "114/12/24", category: "總務", requester: "Brenda", description: "總務-常在律所開會回程計程車", invoice: "乘車證明", income: 0, expense: 230, company: "紫焰" },
  { id: 26, date: "114/12/26", category: "總務", requester: "Brenda", description: "總務-公司咖啡*2包", invoice: "UK14865614", income: 0, expense: 770, company: "紫焰" },
  { id: 27, date: "114/12/26", category: "總務", requester: "Brenda", description: "總務-LALA-寄送登出/空白鍵", invoice: "VM20438394", income: 0, expense: 351, company: "紫焰" },
  { id: 28, date: "114/12/26", category: "總務", requester: "Brenda", description: "總務-LALA-購買精油鋁瓶*6", invoice: "VM20442346", income: 0, expense: 407, company: "紫焰" },
  { id: 29, date: "114/12/29", category: "總務", requester: "Brenda", description: "總務-LALA-寄送物品給師尊", invoice: "VM20452124", income: 0, expense: 458, company: "紫焰" },
  { id: 30, date: "114/12/31", category: "總務", requester: "Brenda", description: "總務-師尊贈與同仁簽名板*23", invoice: "VG71194941", income: 0, expense: 1716, company: "紫焰" },
  { id: 31, date: "115/01/02", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "XK42062405", income: 0, expense: 1000, company: "紫焰" },
  { id: 32, date: "115/01/05", category: "公司商品", requester: "Brenda", description: "2026福袋說明卡*1000份", invoice: "VU23071017", income: 0, expense: 2699, company: "紫焰" },
  { id: 33, date: "115/01/05", category: "總務", requester: "Brenda", description: "總務-泡麵*9+廁所衛生紙*48", invoice: "WV31296905", income: 0, expense: 793, company: "紫焰" },
  { id: 34, date: "115/01/07", category: "總務", requester: "Brenda", description: "總務-員工衛生紙*30包", invoice: "WV31404820", income: 0, expense: 539, company: "紫焰" },
  { id: 35, date: "115/01/08", category: "創命", requester: "Brenda", description: "創命-學員手冊手續費", invoice: "WW87232866", income: 0, expense: 30, company: "終極" },
  { id: 36, date: "115/01/12", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "XK42117728", income: 0, expense: 500, company: "紫焰" },
  { id: 37, date: "115/01/12", category: "總務", requester: "Brenda", description: "總務-LALA-寄件給常在律師", invoice: "XK42131233", income: 0, expense: 204, company: "紫焰" },
  { id: 38, date: "115/01/13", category: "創命/拍賣", requester: "Brenda", description: "創命及拍賣會礦泉水一批", invoice: "XK78498478", income: 0, expense: 2117, company: "紫焰" },
  { id: 39, date: "115/01/14", category: "創命", requester: "Brenda", description: "總務-師尊休息室馬桶坐墊貼", invoice: "XK78638016", income: 0, expense: 250, company: "終極" },
  { id: 40, date: "115/01/14", category: "創命", requester: "Brenda", description: "創命-工作人員口罩*3盒", invoice: "XK78620571", income: 0, expense: 137, company: "終極" },
  { id: 41, date: "115/01/14", category: "採購", requester: "Brenda", description: "調配精油-荷荷芭基底油", invoice: "VT14920250", income: 0, expense: 431, company: "紫焰" },
  { id: 42, date: "115/01/15", category: "總務", requester: "Brenda", description: "總務-師尊/股東使用-白木耳*6", invoice: "WV24357044", income: 0, expense: 399, company: "紫焰" },
  { id: 43, date: "115/01/15", category: "總務", requester: "Brenda", description: "總務-尾牙拍立得底片", invoice: "XK78718645", income: 0, expense: 620, company: "紫焰" },
  { id: 44, date: "115/01/15", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "XK42137812", income: 0, expense: 1200, company: "紫焰" },
  { id: 45, date: "115/01/16", category: "拍賣會", requester: "Brenda", description: "舒跑天然水 (48瓶)", invoice: "XK78884194", income: 0, expense: 308, company: "紫焰" },
  { id: 46, date: "115/01/16", category: "創命", requester: "Brenda", description: "創命-物資紙箱*15", invoice: "WZ01413730", income: 0, expense: 900, company: "終極" },
  { id: 47, date: "115/01/16", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "XK42148476", income: 0, expense: 500, company: "紫焰" },
  { id: 48, date: "115/01/16", category: "總務", requester: "Brenda", description: "總務-回覆律師文件郵資", invoice: "購票證明", income: 0, expense: 28, company: "紫焰" },
  { id: 49, date: "115/01/19", category: "總務", requester: "Brenda", description: "總務-提供常在律師文件郵資", invoice: "購票證明", income: 0, expense: 28, company: "紫焰" },
  { id: 50, date: "115/01/20", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "XK42166007", income: 0, expense: 350, company: "紫焰" },
  { id: 51, date: "115/01/22", category: "拍賣會", requester: "Brenda", description: "A4/A3影印紙、護貝膠膜", invoice: "WV31826592", income: 0, expense: 2702, company: "紫焰" },
  { id: 52, date: "115/01/23", category: "公司商品", requester: "Brenda", description: "真龍項鍊證書印章等雜項", invoice: "VU19869176", income: 0, expense: 347, company: "紫焰" },
  { id: 53, date: "115/01/26", category: "總務", requester: "Brenda", description: "總務-公司文具一批", invoice: "XE55367003", income: 0, expense: 207, company: "紫焰" },
  { id: 54, date: "115/01/27", category: "總務", requester: "Brenda", description: "總務-蓮一卡片遺失收入", invoice: "卡片遺失", income: 100, expense: 0, company: "紫焰" },
  { id: 55, date: "115/01/27", category: "拍賣會", requester: "Brenda", description: "財務用A4壓克力立牌", invoice: "XL08228202", income: 0, expense: 419, company: "紫焰" },
  { id: 56, date: "115/01/27", category: "拍賣會", requester: "Brenda", description: "舒跑天然水 (24瓶)", invoice: "XK80133702", income: 0, expense: 133, company: "紫焰" },
  { id: 57, date: "115/01/27", category: "拍賣會", requester: "Brenda", description: "拍賣會-礦泉水", invoice: "XK80133747", income: 0, expense: 308, company: "紫焰" },
  { id: 58, date: "115/01/27", category: "拍賣會", requester: "Brenda", description: "A木槌2.0及DIY材料", invoice: "WE47019232", income: 0, expense: 122, company: "紫焰" },
  { id: 59, date: "115/01/27", category: "拍賣會", requester: "Brenda", description: "拍賣會-複寫紙及夾鏈袋", invoice: "XK80156838", income: 0, expense: 722, company: "紫焰" },
  { id: 60, date: "115/01/27", category: "總務", requester: "Brenda", description: "總務-大陸公務手機保護殼*2", invoice: "XE56189257", income: 0, expense: 93, company: "紫焰" },
  { id: 61, date: "115/01/28", category: "拍賣會", requester: "Brenda", description: "拍賣會-60樣拍品照片", invoice: "VU23071276", income: 0, expense: 504, company: "紫焰" },
  { id: 62, date: "115/01/29", category: "拍賣會", requester: "Brenda", description: "拍賣會彩排去程 (Uber)", invoice: "行程證明", income: 0, expense: 295, company: "紫焰" },
  { id: 63, date: "115/01/29", category: "拍賣會", requester: "Brenda", description: "拍賣-師尊及佛母簽名桌", invoice: "XK80479959", income: 0, expense: 1329, company: "紫焰" },
  { id: 64, date: "115/01/29", category: "拍賣會", requester: "Brenda", description: "拍賣會-文具用筆", invoice: "XB37725735", income: 0, expense: 1544, company: "紫焰" },
  { id: 65, date: "115/01/30", category: "總務", requester: "Brenda", description: "總務-師尊柳橙汁", invoice: "免用統一發票", income: 0, expense: 360, company: "紫焰" },
  { id: 66, date: "115/01/31", category: "拍賣會", requester: "Brenda", description: "拍賣會-去程計程車費", invoice: "-", income: 0, expense: 206, company: "紫焰" },
  { id: 67, date: "115/01/31", category: "拍賣會", requester: "Brenda", description: "拍賣會-公司組去程計程車", invoice: "行程證明", income: 0, expense: 282, company: "紫焰" },
  { id: 68, date: "115/01/31", category: "拍賣會", requester: "Brenda", description: "拍賣會-公司組回程計程車", invoice: "行程證明", income: 0, expense: 608, company: "紫焰" },
  { id: 69, date: "115/02/06", category: "總務", requester: "Brenda", description: "總務-執行長印章收納盒", invoice: "免用統一發票", income: 0, expense: 394, company: "紫焰" },
  { id: 70, date: "115/02/06", category: "總務", requester: "Brenda", description: "總務-LALA運費儲值", invoice: "XK42272873", income: 0, expense: 1200, company: "紫焰" },
  { id: 71, date: "115/02/09", category: "總務", requester: "Brenda", description: "總務-場勘小登出場地回程", invoice: "乘車證明", income: 0, expense: 260, company: "紫焰" },
  { id: 72, date: "115/02/09", category: "採購", requester: "Brenda", description: "採購-LALA-雙書拆成單書", invoice: "XK42290496", income: 0, expense: 799, company: "紫焰" },
  { id: 73, date: "115/02/09", category: "總務", requester: "Brenda", description: "總務-LALA-寄送師尊所需文件", invoice: "XK42298472", income: 0, expense: 489, company: "紫焰" },
  { id: 74, date: "115/02/10", category: "總務", requester: "Brenda", description: "總務-公司清潔-酒精擦12包", invoice: "XK82210221", income: 0, expense: 902, company: "紫焰" },
  { id: 75, date: "115/02/10", category: "公司商品", requester: "Brenda", description: "商品部-精油填充500ml*5支", invoice: "XE14635760", income: 0, expense: 500, company: "紫焰" },
  { id: 76, date: "115/02/10", category: "公司商品", requester: "Brenda", description: "商品部-精油填充500ml*5支", invoice: "XE14635773", income: 0, expense: 500, company: "紫焰" },
  { id: 77, date: "115/02/11", category: "總務", requester: "Brenda", description: "總務-公司大掃除需要的器具", invoice: "XK39227895", income: 0, expense: 1093, company: "紫焰" },
  { id: 78, date: "115/02/11", category: "總務", requester: "Brenda", description: "總務-75%酒精4000ml*2桶", invoice: "XE10356628", income: 0, expense: 576, company: "紫焰" },
  { id: 79, date: "115/02/11", category: "總務", requester: "Brenda", description: "總務-LALA-寄送精油給師尊", invoice: "XK42301744", income: 0, expense: 351, company: "紫焰" },
  { id: 80, date: "115/02/11", category: "總務", requester: "Brenda", description: "總務-莫源卡片報廢更換收入", invoice: "卡片報廢更換", income: 100, expense: 0, company: "紫焰" },
];

const DEFAULT_CATEGORIES = ["總務", "創命", "公司商品", "拍賣會", "採購", "創命/拍賣"];
const fmt = (n) => `$${Number(n).toLocaleString()}`;
const determineCompany = (category) => category === "創命" ? "終極" : "紫焰";

const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding:"10px 22px", background:active?"#1a1a2e":"transparent", color:active?"#e8c97a":"#888", border:"none", borderBottom:active?"2px solid #e8c97a":"2px solid transparent", cursor:"pointer", fontSize:"14px", fontFamily:"'Noto Serif TC', serif", fontWeight:active?"700":"400", transition:"all 0.2s", whiteSpace:"nowrap" }}>{children}</button>
);

const Badge = ({ children, color }) => (
  <span style={{ padding:"2px 8px", borderRadius:"4px", fontSize:"11px", fontWeight:"700", background:color==="gold"?"rgba(232,201,122,0.18)":"rgba(100,180,255,0.15)", color:color==="gold"?"#e8c97a":"#64b4ff", border:`1px solid ${color==="gold"?"rgba(232,201,122,0.4)":"rgba(100,180,255,0.3)"}` }}>{children}</span>
);

const StatCard = ({ label, value, sub, highlight }) => (
  <div style={{ background:highlight?"rgba(232,201,122,0.08)":"rgba(255,255,255,0.04)", border:`1px solid ${highlight?"rgba(232,201,122,0.35)":"rgba(255,255,255,0.1)"}`, borderRadius:"10px", padding:"16px 20px", minWidth:"140px" }}>
    <div style={{ fontSize:"11px", color:"#888", marginBottom:"6px" }}>{label}</div>
    <div style={{ fontSize:"22px", fontWeight:"700", color:highlight?"#e8c97a":"#fff", fontFamily:"'Noto Serif TC', serif" }}>{value}</div>
    {sub && <div style={{ fontSize:"11px", color:"#666", marginTop:"4px" }}>{sub}</div>}
  </div>
);

export default function App() {
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
  const [syncStatus, setSyncStatus] = useState("⏳ 載入中...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ date:"", category:"總務", requester:"Brenda", description:"", invoice:"", income:"", expense:"" });
  const [lalaForm, setLalaForm] = useState({ date:"", description:"", payType:"現金", amount:"", invoice:"" });

  const loadFromSheets = useCallback(async () => {
    setIsLoading(true);
    setSyncStatus("⏳ 從 Google Sheets 載入...");
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.records && data.records.length > 0) {
        setRecords(data.records.map(r => ({ ...r, id:Number(r.id), income:Number(r.income)||0, expense:Number(r.expense)||0 })));
      } else {
        setRecords(INITIAL_DATA);
      }
      if (data.lala && data.lala.length > 0) setLalaRecords(data.lala.map(r => ({ ...r, id:Number(r.id), amount:Number(r.amount)||0 })));
      if (data.categories && data.categories.length > 0) setCategories(data.categories);
      setSyncStatus("✓ 已與 Google Sheets 同步");
    } catch (e) {
      setSyncStatus("⚠ 無法連線，顯示初始資料");
      setRecords(INITIAL_DATA);
    }
    setIsLoading(false);
    setTimeout(() => setSyncStatus(""), 4000);
  }, []);

  useEffect(() => { loadFromSheets(); }, []);

  const saveToSheets = useCallback(async (r, l, c) => {
    setIsSaving(true);
    setSyncStatus("⏳ 儲存至 Google Sheets...");
    try {
      await fetch(API_URL, {
        method:"POST", mode:"no-cors",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ action:"save_all", records:r, lala:l, categories:c }),
      });
      setSyncStatus("✓ 已儲存至 Google Sheets");
    } catch (e) {
      setSyncStatus("⚠ 儲存失敗，請重試");
    }
    setIsSaving(false);
    setTimeout(() => setSyncStatus(""), 3000);
  }, []);

  const ziyanRecords = records.filter(r => r.company==="紫焰");
  const jijieRecords = records.filter(r => r.company==="終極");
  const calcStats = (recs) => ({ totalExpense:recs.reduce((s,r)=>s+r.expense,0), totalIncome:recs.reduce((s,r)=>s+r.income,0), net:recs.reduce((s,r)=>s+r.expense-r.income,0) });
  const ziyanStats = calcStats(ziyanRecords);
  const jijieStats = calcStats(jijieRecords);
  const ziyan_base=20000, ziyan_subsidy=15000, ziyan_total_allocated=35000;
  const ziyan_overrun = ziyanStats.net - ziyan_base;
  const ziyan_pending = ziyan_overrun - ziyan_subsidy;
  const jijie_allocated=5000;
  const jijie_balance = jijie_allocated - jijieStats.net;
  const activeRecords = tab==="紫焰"?ziyanRecords:tab==="終極"?jijieRecords:records;
  const filtered = activeRecords.filter(r => (filterCat==="全部"||r.category===filterCat) && (searchText===""||r.description.includes(searchText)||r.invoice.includes(searchText)));
  const lalaCash = lalaRecords.filter(r=>r.payType==="現金").reduce((s,r)=>s+r.amount,0);
  const lalaCredit = lalaRecords.filter(r=>r.payType==="信用卡預儲").reduce((s,r)=>s+r.amount,0);

  const handleAddRecord = () => {
    const company = determineCompany(form.category);
    const newRec = { id:editingId||Date.now(), date:form.date, category:form.category, requester:form.requester, description:form.description, invoice:form.invoice, income:Number(form.income)||0, expense:Number(form.expense)||0, company };
    const updated = editingId?records.map(r=>r.id===editingId?newRec:r):[...records,newRec];
    setRecords(updated); saveToSheets(updated, lalaRecords, categories);
    setForm({date:"",category:"總務",requester:"Brenda",description:"",invoice:"",income:"",expense:""});
    setShowAddForm(false); setEditingId(null);
  };
  const handleEdit = (rec) => { setForm({date:rec.date,category:rec.category,requester:rec.requester,description:rec.description,invoice:rec.invoice,income:rec.income||"",expense:rec.expense||""}); setEditingId(rec.id); setShowAddForm(true); };
  const handleDelete = (id) => { if(!window.confirm("確定刪除？"))return; const updated=records.filter(r=>r.id!==id); setRecords(updated); saveToSheets(updated,lalaRecords,categories); };
  const handleAddCategory = () => { if(newCat&&!categories.includes(newCat)){const updated=[...categories,newCat];setCategories(updated);saveToSheets(records,lalaRecords,updated);setNewCat("");setShowAddCat(false);}};
  const handleAddLala = () => { const newRec={id:Date.now(),date:lalaForm.date,description:lalaForm.description,payType:lalaForm.payType,amount:Number(lalaForm.amount)||0,invoice:lalaForm.invoice}; const updated=[...lalaRecords,newRec]; setLalaRecords(updated); saveToSheets(records,updated,categories); setLalaForm({date:"",description:"",payType:"現金",amount:"",invoice:""}); setShowLalaForm(false); };
  const handleDeleteLala = (id) => { if(!window.confirm("確定刪除？"))return; const updated=lalaRecords.filter(r=>r.id!==id); setLalaRecords(updated); saveToSheets(records,updated,categories); };
  const exportCSV = () => { const rows=[["序號","日期","類別","請款人","請款內容","發票/收據","收入","支出","公司"],...filtered.map((r,i)=>[i+1,r.date,r.category,r.requester,r.description,r.invoice,r.income,r.expense,r.company])]; const csv=rows.map(r=>r.join(",")).join("\n"); const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`零用金明細_${tab}.csv`; a.click(); };

  const inputStyle = { background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", padding:"8px 12px", borderRadius:"6px", fontSize:"13px", outline:"none", width:"100%", fontFamily:"'Noto Serif TC', serif" };
  const btnPrimary = { background:"linear-gradient(135deg,#e8c97a,#c9a84c)", color:"#1a1a2e", border:"none", padding:"8px 18px", borderRadius:"6px", cursor:isSaving?"not-allowed":"pointer", fontWeight:"700", fontSize:"13px", fontFamily:"'Noto Serif TC', serif", opacity:isSaving?0.7:1 };
  const btnSecondary = { background:"rgba(255,255,255,0.08)", color:"#ccc", border:"1px solid rgba(255,255,255,0.15)", padding:"8px 18px", borderRadius:"6px", cursor:"pointer", fontSize:"13px", fontFamily:"'Noto Serif TC', serif" };
  const btnDanger = { background:"rgba(255,80,80,0.15)", color:"#ff6060", border:"1px solid rgba(255,80,80,0.3)", padding:"4px 10px", borderRadius:"4px", cursor:"pointer", fontSize:"12px" };
  const btnEdit = { background:"rgba(100,180,255,0.12)", color:"#64b4ff", border:"1px solid rgba(100,180,255,0.3)", padding:"4px 10px", borderRadius:"4px", cursor:"pointer", fontSize:"12px" };
  const statusColor = syncStatus.includes("✓")?"#6de89a":syncStatus.includes("⚠")?"#ffa36e":"#aaa";

  return (
    <div style={{ minHeight:"100vh", background:"#0d0d1a", color:"#e0e0e0", fontFamily:"'Noto Serif TC', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet" />

      {isLoading && (
        <div style={{ position:"fixed", inset:0, background:"rgba(13,13,26,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"40px", marginBottom:"16px" }}>⏳</div>
            <div style={{ color:"#e8c97a", fontSize:"16px", fontFamily:"'Noto Serif TC', serif" }}>從 Google Sheets 載入資料中...</div>
          </div>
        </div>
      )}

      <div style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)", borderBottom:"1px solid rgba(232,201,122,0.3)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"36px", height:"36px", background:"linear-gradient(135deg,#e8c97a,#c9a84c)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>💰</div>
          <div>
            <div style={{ fontSize:"17px", fontWeight:"700", color:"#e8c97a" }}>零用金管理系統</div>
            <div style={{ fontSize:"11px", color:"#555" }}>114/11/17 – 115/02/11</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          {syncStatus && <span style={{ fontSize:"12px", color:statusColor }}>{syncStatus}</span>}
          <button onClick={loadFromSheets} style={{ ...btnSecondary, padding:"6px 14px", fontSize:"12px" }} disabled={isLoading}>🔄 重新整理</button>
          <span style={{ fontSize:"11px", color:"#4a9", background:"rgba(0,200,100,0.08)", padding:"4px 10px", borderRadius:"20px", border:"1px solid rgba(0,200,100,0.2)" }}>🟢 Google Sheets 已連線</span>
        </div>
      </div>

      <div style={{ background:"#13132a", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"0 24px", display:"flex", gap:"4px", overflowX:"auto" }}>
        {["紫焰","終極","LALA運費"].map(t => <TabButton key={t} active={tab===t} onClick={()=>setTab(t)}>{t==="紫焰"?"🔴 紫焰有限公司":t==="終極"?"🔵 終極有限公司":"📦 LALA運費儲值"}</TabButton>)}
      </div>

      <div style={{ padding:"24px", maxWidth:"1400px", margin:"0 auto" }}>

        {tab==="LALA運費" && (
          <div>
            <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginBottom:"24px" }}>
              <StatCard label="現金支付合計" value={fmt(lalaCash)} />
              <StatCard label="信用卡預儲合計" value={fmt(lalaCredit)} highlight />
              <StatCard label="總儲值金額" value={fmt(lalaCash+lalaCredit)} />
              <StatCard label="總筆數" value={`${lalaRecords.length} 筆`} />
            </div>
            <div style={{ background:"rgba(255,200,100,0.06)", border:"1px solid rgba(255,200,100,0.2)", borderRadius:"10px", padding:"14px 18px", marginBottom:"20px", fontSize:"13px", color:"#ccc" }}>
              ⚠️ <strong style={{color:"#e8c97a"}}>注意：</strong>LALA 平台無公開 API，請手動輸入現金或信用卡預儲紀錄。
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"16px" }}>
              <button style={btnPrimary} onClick={()=>setShowLalaForm(v=>!v)}>{showLalaForm?"✕ 取消":"+ 新增運費紀錄"}</button>
            </div>
            {showLalaForm && (
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px", padding:"20px", marginBottom:"20px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"12px" }}>
                  {[["日期","date","text"],["說明","description","text"],["發票/收據","invoice","text"],["金額","amount","number"]].map(([label,key,type])=>(
                    <div key={key}><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>{label}</label><input type={type} style={inputStyle} value={lalaForm[key]} onChange={e=>setLalaForm(p=>({...p,[key]:e.target.value}))} /></div>
                  ))}
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>付款方式</label><select style={inputStyle} value={lalaForm.payType} onChange={e=>setLalaForm(p=>({...p,payType:e.target.value}))}><option>現金</option><option>信用卡預儲</option></select></div>
                </div>
                <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
                  <button style={btnPrimary} onClick={handleAddLala} disabled={isSaving}>儲存</button>
                  <button style={btnSecondary} onClick={()=>setShowLalaForm(false)}>取消</button>
                </div>
              </div>
            )}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                <thead><tr style={{background:"rgba(255,255,255,0.06)"}}>
                  {["日期","說明","付款方式","金額","發票/收據","操作"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",color:"#888",fontWeight:"600",borderBottom:"1px solid rgba(255,255,255,0.1)",whiteSpace:"nowrap"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {lalaRecords.length===0&&<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"#555"}}>尚無紀錄</td></tr>}
                  {lalaRecords.map(r=>(
                    <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      <td style={{padding:"10px 12px",color:"#aaa"}}>{r.date}</td>
                      <td style={{padding:"10px 12px"}}>{r.description}</td>
                      <td style={{padding:"10px 12px"}}><Badge color={r.payType==="信用卡預儲"?"gold":"blue"}>{r.payType}</Badge></td>
                      <td style={{padding:"10px 12px",color:r.payType==="信用卡預儲"?"#e8c97a":"#6de89a",fontWeight:"700"}}>{fmt(r.amount)}</td>
                      <td style={{padding:"10px 12px",color:"#666",fontSize:"12px"}}>{r.invoice}</td>
                      <td style={{padding:"10px 12px"}}><button style={btnDanger} onClick={()=>handleDeleteLala(r.id)}>刪除</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(tab==="紫焰"||tab==="終極") && (
          <>
            {tab==="紫焰" && (
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"24px"}}>
                <StatCard label="本期總支出" value={fmt(ziyanStats.totalExpense)} />
                <StatCard label="本期收入" value={fmt(ziyanStats.totalIncome)} />
                <StatCard label="本期淨支出" value={fmt(ziyanStats.net)} />
                <StatCard label="常態零用金基數" value={fmt(ziyan_base)} />
                <StatCard label="2/10 已補貼" value={fmt(ziyan_subsidy)} sub={`總撥補 ${fmt(ziyan_total_allocated)}`} />
                <StatCard label="超支金額" value={fmt(Math.max(0,ziyan_overrun))} sub="淨支出 - 常態 $20,000" highlight={ziyan_overrun>0} />
                <StatCard label="⚡ 待撥補差額" value={fmt(Math.max(0,ziyan_pending))} sub="超支 - 已補貼 $15,000" highlight />
              </div>
            )}
            {tab==="終極" && (
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"24px"}}>
                <StatCard label="本期總支出" value={fmt(jijieStats.totalExpense)} />
                <StatCard label="本期收入" value={fmt(jijieStats.totalIncome)} />
                <StatCard label="本期淨支出" value={fmt(jijieStats.net)} />
                <StatCard label="已撥補金額" value={fmt(jijie_allocated)} />
                <StatCard label={jijie_balance>=0?"⚡ 尚有結餘":"⚡ 待補貼"} value={fmt(Math.abs(jijie_balance))} highlight />
              </div>
            )}

            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"16px",marginBottom:"20px"}}>
              <div style={{fontSize:"12px",color:"#888",marginBottom:"12px",fontWeight:"600"}}>依類別小計（點擊篩選）</div>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                <div style={{background:filterCat==="全部"?"rgba(232,201,122,0.15)":"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",border:filterCat==="全部"?"1px solid rgba(232,201,122,0.4)":"1px solid transparent"}} onClick={()=>setFilterCat("全部")}>
                  <div style={{fontSize:"11px",color:filterCat==="全部"?"#e8c97a":"#888"}}>全部</div>
                  <div style={{fontSize:"15px",fontWeight:"700",color:filterCat==="全部"?"#e8c97a":"#ccc"}}>{fmt(activeRecords.reduce((s,r)=>s+r.expense-r.income,0))}</div>
                </div>
                {[...new Set(activeRecords.map(r=>r.category))].map(cat=>{
                  const total=activeRecords.filter(r=>r.category===cat).reduce((s,r)=>s+r.expense-r.income,0);
                  return <div key={cat} style={{background:filterCat===cat?"rgba(232,201,122,0.15)":"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",border:filterCat===cat?"1px solid rgba(232,201,122,0.4)":"1px solid transparent"}} onClick={()=>setFilterCat(f=>f===cat?"全部":cat)}>
                    <div style={{fontSize:"11px",color:filterCat===cat?"#e8c97a":"#888"}}>{cat}</div>
                    <div style={{fontSize:"15px",fontWeight:"700",color:filterCat===cat?"#e8c97a":"#ccc"}}>{fmt(total)}</div>
                  </div>;
                })}
              </div>
            </div>

            <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center",marginBottom:"16px"}}>
              <input placeholder="🔍 搜尋摘要/發票" style={{...inputStyle,width:"200px"}} value={searchText} onChange={e=>setSearchText(e.target.value)} />
              <select style={{...inputStyle,width:"130px"}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                <option>全部</option>{categories.map(c=><option key={c}>{c}</option>)}
              </select>
              <button style={btnPrimary} onClick={()=>{setEditingId(null);setForm({date:"",category:tab==="終極"?"創命":"總務",requester:"Brenda",description:"",invoice:"",income:"",expense:""});setShowAddForm(v=>!v);}}>
                {showAddForm&&!editingId?"✕ 取消":"+ 新增"}
              </button>
              <button style={btnSecondary} onClick={()=>setShowAddCat(v=>!v)}>＋ 新增類別</button>
              <button style={{...btnSecondary,marginLeft:"auto"}} onClick={exportCSV}>⬇ 匯出 CSV</button>
              <span style={{fontSize:"12px",color:"#666"}}>{filtered.length} 筆｜{fmt(filtered.reduce((s,r)=>s+r.expense,0))}</span>
            </div>

            {showAddCat && (
              <div style={{display:"flex",gap:"10px",marginBottom:"16px",alignItems:"center"}}>
                <input placeholder="輸入新類別名稱" style={{...inputStyle,width:"180px"}} value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddCategory()} />
                <button style={btnPrimary} onClick={handleAddCategory}>新增</button>
                <button style={btnSecondary} onClick={()=>setShowAddCat(false)}>取消</button>
              </div>
            )}

            {showAddForm && (
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,201,122,0.2)",borderRadius:"10px",padding:"20px",marginBottom:"20px"}}>
                <div style={{fontSize:"13px",color:"#e8c97a",marginBottom:"14px",fontWeight:"700"}}>{editingId?"✏️ 編輯紀錄":"＋ 新增零用金紀錄"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px"}}>
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>日期</label><input style={inputStyle} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} placeholder="115/02/11" /></div>
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>類別</label><select style={inputStyle} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>請款人</label><input style={inputStyle} value={form.requester} onChange={e=>setForm(p=>({...p,requester:e.target.value}))} /></div>
                  <div style={{gridColumn:"span 2"}}><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>請款內容</label><input style={inputStyle} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>發票/收據號碼</label><input style={inputStyle} value={form.invoice} onChange={e=>setForm(p=>({...p,invoice:e.target.value}))} /></div>
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>收入</label><input type="number" style={inputStyle} value={form.income} onChange={e=>setForm(p=>({...p,income:e.target.value}))} placeholder="0" /></div>
                  <div><label style={{fontSize:"11px",color:"#888",display:"block",marginBottom:"4px"}}>支出</label><input type="number" style={inputStyle} value={form.expense} onChange={e=>setForm(p=>({...p,expense:e.target.value}))} placeholder="0" /></div>
                  <div style={{display:"flex",alignItems:"flex-end"}}><div style={{fontSize:"11px",color:"#666",background:"rgba(255,255,255,0.05)",padding:"8px 12px",borderRadius:"6px",width:"100%"}}>歸屬：<strong style={{color:form.category==="創命"?"#64b4ff":"#e8c97a"}}>{determineCompany(form.category)}</strong></div></div>
                </div>
                <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
                  <button style={btnPrimary} onClick={handleAddRecord} disabled={isSaving}>儲存</button>
                  <button style={btnSecondary} onClick={()=>{setShowAddForm(false);setEditingId(null);}}>取消</button>
                </div>
              </div>
            )}

            <div style={{overflowX:"auto",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"rgba(255,255,255,0.06)"}}>
                  {["序","日期","類別","請款人","請款內容","發票/收據","收入","支出","公司","操作"].map(h=><th key={h} style={{padding:"10px",textAlign:"left",color:"#888",fontWeight:"600",borderBottom:"1px solid rgba(255,255,255,0.1)",whiteSpace:"nowrap"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={10} style={{padding:"40px",textAlign:"center",color:"#555"}}>無符合條件的紀錄</td></tr>}
                  {filtered.map((r,i)=>(
                    <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"transparent":"rgba(255,255,255,0.015)"}}>
                      <td style={{padding:"9px 10px",color:"#555"}}>{i+1}</td>
                      <td style={{padding:"9px 10px",color:"#aaa",whiteSpace:"nowrap"}}>{r.date}</td>
                      <td style={{padding:"9px 10px"}}><Badge color={r.company==="終極"?"blue":"gold"}>{r.category}</Badge></td>
                      <td style={{padding:"9px 10px",color:"#ccc"}}>{r.requester}</td>
                      <td style={{padding:"9px 10px",maxWidth:"240px"}}>{r.description}</td>
                      <td style={{padding:"9px 10px",color:"#666",fontSize:"11px"}}>{r.invoice}</td>
                      <td style={{padding:"9px 10px",color:"#6de89a",fontWeight:r.income>0?"700":"400"}}>{r.income>0?fmt(r.income):"—"}</td>
                      <td style={{padding:"9px 10px",color:"#ff8080",fontWeight:"600"}}>{r.expense>0?fmt(r.expense):"—"}</td>
                      <td style={{padding:"9px 10px"}}><Badge color={r.company==="終極"?"blue":"gold"}>{r.company}</Badge></td>
                      <td style={{padding:"9px 10px"}}><div style={{display:"flex",gap:"6px"}}><button style={btnEdit} onClick={()=>handleEdit(r)}>編輯</button><button style={btnDanger} onClick={()=>handleDelete(r.id)}>刪</button></div></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:"rgba(232,201,122,0.08)",borderTop:"1px solid rgba(232,201,122,0.3)"}}>
                    <td colSpan={6} style={{padding:"10px",color:"#e8c97a",fontWeight:"700"}}>篩選合計</td>
                    <td style={{padding:"10px",color:"#6de89a",fontWeight:"700"}}>{fmt(filtered.reduce((s,r)=>s+r.income,0))}</td>
                    <td style={{padding:"10px",color:"#ff8080",fontWeight:"700"}}>{fmt(filtered.reduce((s,r)=>s+r.expense,0))}</td>
                    <td colSpan={2} />
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
