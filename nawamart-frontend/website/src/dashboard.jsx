// NawaMart — Merchant dashboard
function Dashboard({ storeType, onOpenOrder, onOpenChat }) {
  const [tab, setTab] = React.useState("overview");
  const titles = {
    overview: "نظرة عامة",
    orders:   "الطلبات",
    products: "المنتجات",
    customers:"العملاء",
    chat:     "المحادثات",
    payments: "المدفوعات",
    reports:  "التقارير",
  };
  return (
    <div className="dash" data-screen-label={`03 — لوحة التاجر · ${titles[tab]}`}>
      <DashSidebar active={tab} onNav={setTab} storeType={storeType}/>
      <main className="dash-main">
        <DashTopBar title={titles[tab]} storeType={storeType}/>
        {tab === "overview" && <DashOverview storeType={storeType} onSeeOrders={() => setTab("orders")} onSeeChat={() => setTab("chat")} onOpenOrder={onOpenOrder}/>}
        {tab === "orders"   && <DashOrders storeType={storeType} onOpenOrder={onOpenOrder}/>}
        {tab === "products" && <DashProducts storeType={storeType}/>}
        {tab === "customers"&& <DashCustomers storeType={storeType}/>}
        {tab === "payments" && <DashPayments storeType={storeType} onOpenOrder={onOpenOrder}/>}
        {tab === "reports"  && <DashReports storeType={storeType}/>}
        {tab === "chat"     && <DashChatInbox storeType={storeType} onOpenChat={onOpenChat}/>}
      </main>
    </div>
  );
}

function DashSidebar({ active, onNav, storeType }) {
  const isDigital = storeType === "digital";
  const chatBadge = CHAT_THREADS.filter(t => t.type === storeType).reduce((n, t) => n + (t.unread || 0), 0);
  const items = [
    { id: "overview",  label: "الرئيسية",   icon: "home" },
    { id: "orders",    label: "الطلبات",    icon: "package", badge: 7 },
    { id: "products",  label: "المنتجات",   icon: "tag" },
    { id: "chat",      label: "المحادثات",  icon: "msgs", badge: chatBadge || null },
    { id: "customers", label: "العملاء",   icon: "users" },
    { id: "payments",  label: "المدفوعات", icon: "credit" },
    { id: "reports",   label: "التقارير",  icon: "chart" },
  ];
  return (
    <aside className="dash-side">
      <div className="dash-brand">
        <img src="assets/logo-mark.svg" alt=""/>
        <div className="dash-brand-name"><span className="nm-nav">Nawa</span><span className="nm-mart">Mart</span></div>
      </div>
      <nav className="dash-nav">
        <div className="dash-nav-sec">الإدارة</div>
        {items.map(i => (
          <a key={i.id} href="#" className={`dash-nav-item ${active === i.id ? "active" : ""}`} onClick={e => { e.preventDefault(); onNav(i.id); }}>
            <Icon name={i.icon} size={18}/>
            <span>{i.label}</span>
            {i.badge ? <span className="dash-nav-badge">{i.badge}</span> : null}
          </a>
        ))}
        <div className="dash-nav-sec">الإعدادات</div>
        <a href="#" className="dash-nav-item"><Icon name="store" size={18}/><span>متجري</span></a>
        <a href="#" className="dash-nav-item"><Icon name="settings" size={18}/><span>الإعدادات العامة</span></a>
      </nav>
      <div className="dash-user">
        <div className="dash-avatar">م</div>
        <div className="dash-user-body">
          <div className="dash-user-name">متجر المختار</div>
          <div className="dash-user-email">mukhtar@nawa.shop</div>
        </div>
      </div>
    </aside>
  );
}

function DashTopBar({ title, storeType }) {
  return (
    <header className="dash-top">
      <div>
        <h1 className="dash-top-title">
          {title}
          <span className={`dash-store-pill ${storeType}`}>
            {storeType === "physical" ? <><Icon name="truck" size={11}/>متجر مادي</> : <><Icon name="bolt" size={11}/>متجر رقمي</>}
          </span>
        </h1>
        <div className="dash-top-sub">مرحباً، الأربعاء ٢٠ مايو ٢٠٢٦</div>
      </div>
      <div className="dash-top-actions">
        <button className="dash-icon-btn"><Icon name="search" size={18}/></button>
        <button className="dash-icon-btn"><Icon name="bell" size={18}/><span className="dash-dot"/></button>
        <button className="dk-btn dk-btn-accent"><Icon name="plus" size={16}/>منتج جديد</button>
      </div>
    </header>
  );
}

function KpiCard({ label, value, suffix, delta, deltaType = "up", icon }) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <div className="kpi-label">{label}</div>
        <div className={`kpi-icon kpi-icon-${icon}`}>
          {icon === "orders"   && <Icon name="package" size={18}/>}
          {icon === "sales"    && <Icon name="credit" size={18}/>}
          {icon === "pending"  && <Icon name="bell" size={18}/>}
          {icon === "customers"&& <Icon name="users" size={18}/>}
          {icon === "chats"    && <Icon name="msgs" size={18}/>}
        </div>
      </div>
      <div className="kpi-value dk-num">{value}{suffix && <span className="kpi-suffix">{suffix}</span>}</div>
      {delta && (
        <div className={`kpi-delta kpi-delta-${deltaType}`}>
          <Icon name={deltaType === "up" ? "arrow-up" : "arrow-down"} size={14}/>{delta}
        </div>
      )}
    </div>
  );
}

function MiniChart() {
  const points = [40, 38, 45, 42, 50, 48, 60, 58, 65, 70, 68, 78, 82];
  const w = 600, h = 120, pad = 8;
  const max = Math.max(...points), min = Math.min(...points);
  const sx = i => pad + (i * (w - pad*2)) / (points.length - 1);
  const sy = v => h - pad - ((v - min) / (max - min || 1)) * (h - pad*2);
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(v)}`).join(" ");
  const area = `${path} L${sx(points.length-1)},${h-pad} L${pad},${h-pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{width: "100%", height: 120}}>
      <path d={area} fill="rgba(27,63,114,0.08)"/>
      <path d={path} fill="none" stroke="var(--dk-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={sx(points.length-1)} cy={sy(points[points.length-1])} r="4" fill="var(--dk-accent)"/>
    </svg>
  );
}

function DashOverview({ storeType, onSeeOrders, onSeeChat, onOpenOrder }) {
  const isDigital = storeType === "digital";
  return (
    <div>
      <div className="dash-kpis">
        <KpiCard label="طلبات اليوم"   value="142" delta="12% عن أمس" deltaType="up" icon="orders"/>
        <KpiCard label="مبيعات اليوم"  value="1,284,500" suffix=" ر.ي" delta="8% عن أمس" deltaType="up" icon="sales"/>
        <KpiCard label="بانتظار الوصل" value="7" delta="يحتاج مراجعة" deltaType="down" icon="pending"/>
        <KpiCard label="عملاء جدد" value="23" delta="هذا الأسبوع" deltaType="up" icon="customers"/>
      </div>

      <div className="dash-grid">
        <div className="dk-card dash-chart-card">
          <div className="dash-card-head">
            <div>
              <h3 className="dash-card-title">المبيعات · آخر 12 يوم</h3>
              <div className="dash-card-sub">إجمالي <span className="dk-num">14,820,000 ر.ي</span></div>
            </div>
            <div className="dash-chart-legend">
              <span className="dot" style={{background: "var(--dk-primary)"}}/><span>المبيعات اليومية</span>
            </div>
          </div>
          <MiniChart/>
        </div>

        <div className="dk-card dash-recent">
          <div className="dash-card-head">
            <h3 className="dash-card-title">طلبات حديثة</h3>
            <button className="dash-link" onClick={onSeeOrders}>عرض الكل</button>
          </div>
          <div className="dash-recent-list">
            {ALL_ORDERS.slice(0, 5).map(o => (
              <div className="dash-recent-row" key={o.id} onClick={() => onOpenOrder(o)} style={{cursor: "pointer"}}>
                <div className="dash-recent-id dk-num">{o.id}</div>
                <div className="dash-recent-customer">
                  {o.customer}
                  <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 11, color: "var(--dk-text-subtle)", marginTop: 1}}>
                    {o.type === "digital" ? <>⚡ {o.product || "منتج رقمي"}</> : <>🚚 {o.city}</>}
                  </div>
                </div>
                <StatusBadge status={o.status}/>
                <div className="dash-recent-amount dk-num">{o.amount.toLocaleString("en-US")}<small> ر.ي</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <div style={{marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16}}>
        <ActionCard
          icon="package" iconBg="var(--dk-primary-100)" iconColor="var(--dk-primary)"
          title="٧ طلبات بحاجة مراجعة"
          sub="راجع وصلات الدفع وأكّد الطلبات لتُرسل أو تُفتح المحادثة."
          cta="فتح الطلبات" onCta={onSeeOrders}/>
        {isDigital ? (
          <ActionCard
            icon="msgs" iconBg="var(--dk-accent-100)" iconColor="var(--dk-accent-700)"
            title="٣ محادثات بانتظارك"
            sub="عملاء أكدوا الدفع — أرسل لهم بيانات المنتج عبر المحادثة."
            cta="فتح المحادثات" onCta={onSeeChat}/>
        ) : (
          <ActionCard
            icon="truck" iconBg="var(--dk-accent-100)" iconColor="var(--dk-accent-700)"
            title="٤ طلبات جاهزة للشحن"
            sub="تم تأكيد الدفع — جهّز الطرود واشحنها."
            cta="عرض الطلبات" onCta={onSeeOrders}/>
        )}
        <ActionCard
          icon="trending" iconBg="var(--dk-success-100)" iconColor="var(--dk-success)"
          title="مبيعات الأسبوع +18%"
          sub="مقارنة بالأسبوع الماضي. ٣ منتجات تصدّرت المبيعات."
          cta="تقرير مفصّل"/>
      </div>
    </div>
  );
}

function ActionCard({ icon, iconBg, iconColor, title, sub, cta, onCta }) {
  return (
    <div className="dk-card" style={{display: "flex", gap: 14, alignItems: "flex-start"}}>
      <div style={{width: 44, height: 44, borderRadius: 10, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
        <Icon name={icon} size={20}/>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 14.5, color: "var(--dk-text)", marginBottom: 4}}>{title}</div>
        <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12.5, color: "var(--dk-text-muted)", lineHeight: 1.55, marginBottom: 10}}>{sub}</div>
        <button className="dash-link" onClick={onCta}>{cta} ←</button>
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */
function DashOrders({ storeType, onOpenOrder }) {
  const [filter, setFilter] = React.useState("all");
  const isDigital = storeType === "digital";
  const visible = ALL_ORDERS.filter(o => !storeType || o.type === storeType);
  const counts = {
    all: visible.length,
    pending: visible.filter(o => o.status === "pending").length,
    confirmed: visible.filter(o => o.status === "confirmed").length,
    shipped: visible.filter(o => o.status === "shipped" || o.status === "chat-open").length,
    delivered: visible.filter(o => o.status === "delivered" || o.status === "digital-delivered").length,
    rejected: visible.filter(o => o.status === "rejected").length,
  };
  const filters = [
    { id: "all", label: "الكل", count: counts.all },
    { id: "pending", label: "بانتظار الوصل", count: counts.pending },
    { id: "confirmed", label: "مؤكد", count: counts.confirmed },
    { id: "shipped", label: isDigital ? "محادثة مفتوحة" : "تم الشحن", count: counts.shipped },
    { id: "delivered", label: "تم التسليم", count: counts.delivered },
    { id: "rejected", label: "مرفوض", count: counts.rejected },
  ];
  const rows = filter === "all" ? visible : visible.filter(o => {
    if (filter === "shipped") return o.status === "shipped" || o.status === "chat-open";
    if (filter === "delivered") return o.status === "delivered" || o.status === "digital-delivered";
    return o.status === filter;
  });

  return (
    <div className="dk-card dash-orders">
      <div className="dash-card-head">
        <h3 className="dash-card-title">جميع الطلبات</h3>
        <div className="dash-card-actions">
          <div className="dash-search">
            <Icon name="search" size={16}/>
            <input placeholder="ابحث برقم الطلب أو اسم العميل..."/>
          </div>
          <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="filter" size={14}/>تصفية</button>
        </div>
      </div>

      <div className="dash-tabs">
        {filters.map(f => (
          <button key={f.id} className={`dash-tab ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}<span className="dash-tab-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>{isDigital ? "المنتج" : "المدينة"}</th>
              <th>التاريخ</th>
              <th>منتجات</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} onClick={() => onOpenOrder(o)} style={{cursor: "pointer"}}>
                <td className="dk-num">
                  <strong>{o.id}</strong>
                  <span style={{marginInlineStart: 8, fontSize: 11, color: "var(--dk-text-subtle)"}}>
                    {o.type === "digital" ? "⚡" : "🚚"}
                  </span>
                </td>
                <td>{o.customer}</td>
                <td className="dk-muted">{o.type === "digital" ? (o.product || "—") : o.city}</td>
                <td className="dk-muted dk-num">{o.date}</td>
                <td className="dk-num">{o.items}</td>
                <td className="dk-num"><strong>{o.amount.toLocaleString("en-US")}</strong> <small className="dk-muted">ر.ي</small></td>
                <td><StatusBadge status={o.status}/></td>
                <td><button className="dash-row-action" onClick={e => { e.stopPropagation(); onOpenOrder(o); }}><Icon name="more" size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dash-pager">
        <span className="dk-muted">عرض ١-{rows.length} من {rows.length} طلب</span>
        <div className="dash-pager-btns">
          <button className="dash-page-btn">السابق</button>
          <button className="dash-page-btn active">1</button>
          <button className="dash-page-btn">2</button>
          <button className="dash-page-btn">3</button>
          <button className="dash-page-btn">التالي</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Products ---------- */
function DashProducts({ storeType }) {
  const products = storeType === "digital" ? DIGITAL_PRODUCTS : PHYSICAL_PRODUCTS;
  const [view, setView] = React.useState("grid");
  return (
    <div>
      <div className="dk-card" style={{padding: 0, overflow: "hidden"}}>
        <div className="dash-card-head" style={{padding: 20, paddingBottom: 0}}>
          <div>
            <h3 className="dash-card-title">المنتجات</h3>
            <div className="dash-card-sub">{products.length} منتج · {storeType === "digital" ? "كلها رقمية ⚡" : "كلها مادية 🚚"}</div>
          </div>
          <div className="dash-card-actions">
            <div className="dash-search">
              <Icon name="search" size={16}/>
              <input placeholder="ابحث عن منتج..."/>
            </div>
            <div style={{display: "flex", border: "1px solid var(--dk-border)", borderRadius: 8, overflow: "hidden"}}>
              <button className="dash-row-action" style={{borderRadius: 0, width: 38, height: 36, background: view === "grid" ? "var(--dk-primary-50)" : "white", color: view === "grid" ? "var(--dk-primary)" : "var(--dk-text-muted)"}} onClick={() => setView("grid")}><Icon name="grid" size={16}/></button>
              <button className="dash-row-action" style={{borderRadius: 0, width: 38, height: 36, background: view === "list" ? "var(--dk-primary-50)" : "white", color: view === "list" ? "var(--dk-primary)" : "var(--dk-text-muted)"}} onClick={() => setView("list")}><Icon name="list" size={16}/></button>
            </div>
            <button className="dk-btn dk-btn-accent dk-btn-sm"><Icon name="plus" size={14}/>منتج جديد</button>
          </div>
        </div>
        <div style={{padding: 20, paddingTop: 20}}>
          <div className="dash-prod-grid">
            {products.map(p => (
              <article key={p.id} className="dash-prod">
                <div className="dash-prod-img">
                  <div className="dash-prod-type-badge">
                    {storeType === "digital" ? <><Icon name="bolt" size={12}/>رقمي</> : <><Icon name="truck" size={12}/>مادي</>}
                  </div>
                </div>
                <div className="dash-prod-body">
                  <div className="dash-prod-name">{p.name}</div>
                  <div className="dash-prod-stock">{p.meta}</div>
                  <div className="dash-prod-foot">
                    <div className="dash-prod-price dk-num">{p.price.toLocaleString("en-US")}<small> ر.ي</small></div>
                    <button className="dash-row-action"><Icon name="more" size={14}/></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Customers ---------- */
function DashCustomers({ storeType }) {
  const isDigital = storeType === "digital";
  const all = CUSTOMERS.filter(c => c.type === storeType);
  const [filter, setFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("spent"); // spent | orders | last

  // KPIs
  const totalCustomers = all.length;
  const newThisMonth = all.filter(c => c.tier === "new").length;
  const vipCount = all.filter(c => c.tier === "vip").length;
  const totalSpent = all.reduce((s, c) => s + c.spent, 0);
  const totalOrders = all.reduce((s, c) => s + c.orders, 0);
  const avgOrderValue = totalOrders ? Math.round(totalSpent / totalOrders) : 0;

  // Top 3 customers
  const top3 = [...all].sort((a, b) => b.spent - a.spent).slice(0, 3);

  // Table rows
  const filtered = filter === "all" ? all : all.filter(c => c.tier === filter);
  const rows = [...filtered].sort((a, b) => {
    if (sortBy === "orders") return b.orders - a.orders;
    if (sortBy === "last") return 0; // already roughly sorted
    return b.spent - a.spent;
  });

  const counts = {
    all: all.length,
    vip: all.filter(c => c.tier === "vip").length,
    regular: all.filter(c => c.tier === "regular").length,
    new: all.filter(c => c.tier === "new").length,
  };
  const filters = [
    { id: "all",     label: "الكل",            count: counts.all },
    { id: "vip",     label: "VIP",             count: counts.vip },
    { id: "regular", label: "عملاء منتظمون", count: counts.regular },
    { id: "new",     label: "جدد",            count: counts.new },
  ];

  return (
    <div>
      <div className="dash-kpis">
        <KpiCard label="إجمالي العملاء" value={totalCustomers}        delta={`+${newThisMonth} هذا الشهر`}  deltaType="up"   icon="customers"/>
        <KpiCard label="عملاء VIP"     value={vipCount}               delta="أعلى إنفاقاً"     deltaType="up"   icon="sales"/>
        <KpiCard label="إجمالي الإنفاق"   value={totalSpent.toLocaleString("en-US")} suffix=" ر.ي" delta="خلال 6 أشهر" deltaType="up" icon="sales"/>
        <KpiCard label="متوسط قيمة الطلب" value={avgOrderValue.toLocaleString("en-US")} suffix=" ر.ي" delta="لكل عميل" deltaType="up" icon="orders"/>
      </div>

      {/* Top customers strip */}
      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16}}>
        {top3.map((c, i) => (
          <div key={c.id} className="dk-card" style={{display: "flex", gap: 14, alignItems: "center", position: "relative", overflow: "hidden"}}>
            <div style={{position: "absolute", insetInlineStart: 0, top: 0, bottom: 0, width: 4, background: i === 0 ? "var(--dk-accent)" : i === 1 ? "var(--dk-primary)" : "var(--dk-success)"}}/>
            <div style={{width: 52, height: 52, borderRadius: 50, background: i === 0 ? "var(--dk-accent)" : i === 1 ? "var(--dk-primary)" : "var(--dk-success)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 19, flex: "none"}}>
              {c.initials}
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 4}}>
                <span style={{fontFamily: "Inter", fontSize: 11, fontWeight: 700, color: "var(--dk-text-subtle)"}}>#{i + 1}</span>
                <span style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 14.5, color: "var(--dk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{c.name}</span>
              </div>
              <div style={{display: "flex", gap: 12, fontFamily: "var(--dk-font-ar)", fontSize: 12.5, color: "var(--dk-text-muted)"}}>
                <span><strong className="dk-num" style={{color: "var(--dk-text)"}}>{c.spent.toLocaleString("en-US")}</strong> ر.ي</span>
                <span style={{color: "var(--dk-text-subtle)"}}>·</span>
                <span><strong className="dk-num" style={{color: "var(--dk-text)"}}>{c.orders}</strong> طلب</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customers table */}
      <div className="dk-card dash-orders">
        <div className="dash-card-head">
          <div>
            <h3 className="dash-card-title">قائمة العملاء</h3>
            <div className="dash-card-sub">{rows.length} عميل · {isDigital ? "متجر رقمي ⚡" : "متجر مادي 🚚"}</div>
          </div>
          <div className="dash-card-actions">
            <div className="dash-search">
              <Icon name="search" size={16}/>
              <input placeholder="ابحث بالاسم أو الجوال..."/>
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{fontFamily: "var(--dk-font-ar)", fontSize: 13, padding: "7px 12px", border: "1px solid var(--dk-border)", borderRadius: 8, background: "white", color: "var(--dk-text)", cursor: "pointer"}}>
              <option value="spent">الأعلى إنفاقاً</option>
              <option value="orders">الأكثر طلباً</option>
              <option value="last">الأحدث</option>
            </select>
            <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="download" size={14}/>تصدير</button>
          </div>
        </div>

        <div className="dash-tabs">
          {filters.map(f => (
            <button key={f.id} className={`dash-tab ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
              {f.label}<span className="dash-tab-count">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>الجوال</th>
                {!isDigital && <th>المدينة</th>}
                <th>عضو منذ</th>
                <th>الطلبات</th>
                <th>إجمالي الإنفاق</th>
                <th>آخر طلب</th>
                <th>الفئة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id} style={{cursor: "pointer"}}>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                      <div style={{width: 34, height: 34, borderRadius: 50, background: c.tier === "vip" ? "var(--dk-accent)" : c.tier === "new" ? "var(--dk-info)" : "var(--dk-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 14, flex: "none"}}>
                        {c.initials}
                      </div>
                      <div style={{display: "flex", flexDirection: "column"}}>
                        <strong style={{fontWeight: 700}}>{c.name}</strong>
                        <span style={{fontFamily: "Inter", fontSize: 11, color: "var(--dk-text-subtle)"}}>{c.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="dk-num dk-muted">{c.phone}</td>
                  {!isDigital && <td className="dk-muted">{c.city || "—"}</td>}
                  <td className="dk-muted">{c.joined}</td>
                  <td className="dk-num"><strong>{c.orders}</strong></td>
                  <td className="dk-num"><strong>{c.spent.toLocaleString("en-US")}</strong> <small className="dk-muted">ر.ي</small></td>
                  <td className="dk-muted">{c.last}</td>
                  <td><TierBadge tier={c.tier}/></td>
                  <td>
                    <div style={{display: "flex", gap: 4}}>
                      <button className="dash-row-action" title="عرض الطلبات"><Icon name="package" size={16}/></button>
                      <button className="dash-row-action" title="اتصل"><Icon name="phone" size={16}/></button>
                      <button className="dash-row-action" title="المزيد"><Icon name="more" size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={isDigital ? 8 : 9} style={{textAlign: "center", padding: "40px 20px", color: "var(--dk-text-muted)"}}>لا يوجد عملاء في هذه الفئة.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-pager">
          <span className="dk-muted">عرض ١-{rows.length} من {rows.length} عميل</span>
          <div className="dash-pager-btns">
            <button className="dash-page-btn">السابق</button>
            <button className="dash-page-btn active">1</button>
            <button className="dash-page-btn">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TierBadge({ tier }) {
  if (tier === "vip") {
    return <span className="dk-badge" style={{background: "var(--dk-accent-100)", color: "var(--dk-accent-700)"}}>★ VIP</span>;
  }
  if (tier === "new") {
    return <span className="dk-badge dk-badge-info"><span className="dot"/>جديد</span>;
  }
  return <span className="dk-badge dk-badge-neutral">منتظم</span>;
}

/* ---------- Chat inbox (in dashboard) ---------- */
function DashChatInbox({ storeType, onOpenChat }) {
  const isDigital = storeType === "digital";
  const threads = CHAT_THREADS.filter(t => t.type === storeType);
  return (
    <div className="dk-card" style={{padding: 0, overflow: "hidden"}}>
      <div className="dash-card-head" style={{padding: 20, paddingBottom: 0}}>
        <div>
          <h3 className="dash-card-title">
            المحادثات · {isDigital ? "تسليم المنتجات الرقمية" : "دعم العملاء"}
          </h3>
          <div className="dash-card-sub">
            {isDigital
              ? "قناة محادثة لكل طلب رقمي مؤكد. أرسل بيانات المنتج وانتظر تأكيد العميل."
              : "محادثات مع عملائك حول طلبات الشحن، تأكيد الوصل، وملاحظات التوصيل."}
          </div>
        </div>
        <div className="dash-card-actions">
          <div className="dash-search">
            <Icon name="search" size={16}/>
            <input placeholder="ابحث في المحادثات..."/>
          </div>
        </div>
      </div>
      <div style={{padding: 8}}>
        {threads.length === 0 ? (
          <div style={{padding: "48px 20px", textAlign: "center", fontFamily: "var(--dk-font-ar)", color: "var(--dk-text-muted)"}}>
            <Icon name="msgs" size={28} style={{color: "var(--dk-text-subtle)", marginBottom: 8}}/>
            <div style={{fontSize: 14}}>لا توجد محادثات حالياً.</div>
          </div>
        ) : threads.map(t => (
          <div key={t.id} className="dash-inbox-row" onClick={() => onOpenChat(t.id)} style={{borderRadius: 10, borderBottom: 0, marginBottom: 4}}>
            <div className="dash-inbox-avatar">{t.initials}</div>
            <div className="dash-inbox-mid">
              <div className="dash-inbox-name">{t.customer} <span style={{fontFamily: "Inter", fontSize: 11, color: "var(--dk-primary)", marginInlineStart: 8, fontWeight: 700, background: "var(--dk-primary-50)", padding: "1px 6px", borderRadius: 4}}>{t.orderId}</span></div>
              <div className="dash-inbox-preview">
                {(() => {
                  const last = t.messages[t.messages.length - 1];
                  if (!last) return "—";
                  if (last.kind === "credentials") return "🔑 تم إرسال بيانات الحساب";
                  if (last.kind === "file") return `📎 ${last.file.name}`;
                  if (last.kind === "info")  return "ℹ️ " + last.text;
                  return (last.from === "merchant" ? "أنت: " : "") + (last.text || "—");
                })()}
              </div>
            </div>
            <div className="dash-inbox-right">
              <span className="dash-inbox-time">{t.lastTime}</span>
              {t.unread > 0 && <span className="dash-inbox-unread">{t.unread}</span>}
              {t.unread === 0 && <span style={{fontFamily: "Inter", fontSize: 10.5, color: "var(--dk-text-subtle)"}}>{t.online ? "متصل" : "غير متصل"}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
