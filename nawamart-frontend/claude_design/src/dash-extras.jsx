// NawaMart — Payments & Reports dashboard pages

/* ============================================================
   DashPayments — receipt review, wallet, transactions
   ============================================================ */
function DashPayments({ storeType, onOpenOrder }) {
  const isDigital = storeType === "digital";
  const pendingOrders = ALL_ORDERS.filter(o => o.status === "pending" && o.type === storeType);
  const txns = TRANSACTIONS.filter(t => t.type === storeType);

  const monthRevenue = txns.filter(t => t.status === "received").reduce((s, t) => s + t.amount, 0);
  const pendingAmount = pendingOrders.reduce((s, o) => s + o.amount, 0);
  const refunds = txns.filter(t => t.status === "refunded").length;

  return (
    <div>
      <div className="dash-kpis">
        <KpiCard label="مبيعات الشهر" value={monthRevenue.toLocaleString("en-US")} suffix=" ر.ي" delta="+12% عن الشهر الماضي" deltaType="up" icon="sales"/>
        <KpiCard label="بانتظار المراجعة" value={pendingOrders.length} suffix=" وصل" delta={`${pendingAmount.toLocaleString("en-US")} ر.ي`} deltaType="down" icon="pending"/>
        <KpiCard label="معاملات هذا الشهر" value={txns.length} delta="مؤكدة" deltaType="up" icon="orders"/>
        <KpiCard label="مرتجعات" value={refunds} delta={refunds === 0 ? "لا توجد" : "بحاجة معالجة"} deltaType={refunds === 0 ? "up" : "down"} icon="customers"/>
      </div>

      {/* Receipts queue + Income / Linked wallets */}
      <div style={{display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16}}>
        <div className="dk-card">
          <div className="dash-card-head">
            <div>
              <h3 className="dash-card-title">وصلات بانتظار المراجعة</h3>
              <div className="dash-card-sub">{pendingOrders.length} وصل · راجع وأكّد ليتقدّم الطلب</div>
            </div>
            <button className="dash-link">عرض الكل ←</button>
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: 10}}>
            {pendingOrders.slice(0, 5).map(o => (
              <div key={o.id} onClick={() => onOpenOrder(o)} style={{display: "grid", gridTemplateColumns: "56px 1fr auto auto", gap: 12, padding: 10, border: "1px solid var(--dk-border)", borderRadius: 10, cursor: "pointer", alignItems: "center"}}>
                <div style={{width: 56, height: 56, background: "var(--dk-bg)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dk-text-subtle)", border: "1px dashed var(--dk-border)"}}>
                  <Icon name="image" size={20}/>
                </div>
                <div style={{minWidth: 0}}>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 14, color: "var(--dk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{o.customer}</div>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12, color: "var(--dk-text-muted)", marginTop: 2}}>
                    <span className="dk-num">{o.id}</span> · {o.date} {isDigital ? <>· <span style={{color: "var(--dk-accent-700)"}}>⚡ {o.product || "رقمي"}</span></> : <>· {o.city}</>}
                  </div>
                </div>
                <div style={{textAlign: "end"}}>
                  <div className="dk-num" style={{fontFamily: "Inter", fontSize: 16, fontWeight: 700, color: "var(--dk-text)"}}>{o.amount.toLocaleString("en-US")}</div>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 11, color: "var(--dk-text-muted)"}}>ر.ي</div>
                </div>
                <button className="dk-btn dk-btn-primary dk-btn-sm" onClick={e => { e.stopPropagation(); onOpenOrder(o); }}>راجع</button>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <div style={{padding: "32px 16px", textAlign: "center", color: "var(--dk-text-muted)", fontFamily: "var(--dk-font-ar)", fontSize: 13.5}}>
                <Icon name="check-circle" size={28} style={{color: "var(--dk-success)", marginBottom: 6, display: "block", margin: "0 auto 6px"}}/>
                <div>كل الوصلات تمت مراجعتها — أحسنت!</div>
              </div>
            )}
          </div>
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          {/* Monthly income card */}
          <div className="dk-card" style={{background: "var(--dk-primary)", color: "white", borderColor: "var(--dk-primary)", position: "relative", overflow: "hidden"}}>
            <div style={{position: "absolute", insetInlineEnd: -20, top: -20, width: 120, height: 120, borderRadius: 60, background: "rgba(245, 166, 35, 0.15)"}}/>
            <div style={{position: "relative"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
                <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 13, opacity: 0.85}}>إيرادات هذا الشهر</span>
                <Icon name="trending" size={18} style={{opacity: 0.7}}/>
              </div>
              <div style={{fontFamily: "Inter", fontSize: 32, fontWeight: 700, fontFeatureSettings: "'tnum'", marginBottom: 4, lineHeight: 1.1}}>
                {monthRevenue.toLocaleString("en-US")}
                <span style={{fontSize: 16, opacity: 0.85, fontWeight: 600, marginInlineStart: 6}}>ر.ي</span>
              </div>
              <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12.5, opacity: 0.85, lineHeight: 1.6, paddingTop: 10, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.15)"}}>
                <Icon name="check-circle" size={13} style={{verticalAlign: "middle", marginInlineEnd: 5, opacity: 0.9}}/>
                تستلم المبالغ مباشرة في محفظتك بعد تأكيد كل وصل دفع
              </div>
            </div>
          </div>

          {/* Linked wallets */}
          <div className="dk-card">
            <div className="dash-card-head">
              <div>
                <h3 className="dash-card-title">محافظي المربوطة</h3>
                <div className="dash-card-sub">المستلَم هذا الشهر لكل قناة</div>
              </div>
              <button className="dash-link">+ إضافة</button>
            </div>
            <div style={{display: "flex", flexDirection: "column"}}>
              {[
                { name: "Cherry",        sub: "محفظة إلكترونية · ٧٧١-XXX-١٢٣", amount: Math.round(monthRevenue * 0.62), color: "var(--dk-accent)",   primary: true },
                { name: "Floosak",       sub: "محفظة إلكترونية · ٧٧٣-XXX-٤٥٦", amount: Math.round(monthRevenue * 0.24), color: "var(--dk-primary)",  primary: false },
                { name: "بنك التسليف",  sub: "تحويل بنكي · حساب رقم ٢٠٤٨",     amount: Math.round(monthRevenue * 0.14), color: "var(--dk-success)",  primary: false },
              ].map((w, i, arr) => (
                <div key={w.name} style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--dk-border)" : 0}}>
                  <div style={{display: "flex", gap: 10, alignItems: "center", minWidth: 0}}>
                    <div style={{width: 36, height: 36, borderRadius: 8, background: w.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 13}}>
                      {w.name.charAt(0)}
                    </div>
                    <div style={{minWidth: 0}}>
                      <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 13.5, color: "var(--dk-text)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6}}>
                        {w.name}
                        {w.primary && <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--dk-primary-50)", color: "var(--dk-primary)"}}>الرئيسية</span>}
                      </div>
                      <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 11.5, color: "var(--dk-text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{w.sub}</div>
                    </div>
                  </div>
                  <div className="dk-num" style={{fontFamily: "Inter", fontSize: 14, fontWeight: 700, color: "var(--dk-text)", flex: "none", marginInlineStart: 8}}>
                    {w.amount.toLocaleString("en-US")} <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 11, color: "var(--dk-text-muted)", fontWeight: 500}}>ر.ي</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="dk-card dash-orders">
        <div className="dash-card-head">
          <div>
            <h3 className="dash-card-title">جميع المعاملات</h3>
            <div className="dash-card-sub">{txns.length} معاملة مالية في آخر 30 يوم</div>
          </div>
          <div className="dash-card-actions">
            <div className="dash-search">
              <Icon name="search" size={16}/>
              <input placeholder="ابحث برقم المعاملة أو الطلب..."/>
            </div>
            <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="filter" size={14}/>تصفية</button>
            <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="download" size={14}/>تصدير</button>
          </div>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>رقم المعاملة</th>
                <th>التاريخ</th>
                <th>الطلب</th>
                <th>العميل</th>
                <th>طريقة الدفع</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id} style={{cursor: "pointer"}}>
                  <td className="dk-num"><strong>{t.id}</strong></td>
                  <td className="dk-muted">{t.date}</td>
                  <td className="dk-num"><strong>{t.orderId}</strong></td>
                  <td>{t.customer}</td>
                  <td>
                    <span style={{display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--dk-font-ar)", fontSize: 13}}>
                      <span style={{width: 6, height: 6, borderRadius: 50, background: t.method === "Cherry" ? "var(--dk-accent)" : "var(--dk-primary)"}}/>
                      {t.method}
                    </span>
                  </td>
                  <td className="dk-num">
                    {t.status === "refunded" && <span style={{color: "var(--dk-danger)", marginInlineEnd: 4}}>−</span>}
                    <strong>{t.amount.toLocaleString("en-US")}</strong> <small className="dk-muted">ر.ي</small>
                  </td>
                  <td>
                    {t.status === "received"
                      ? <span className="dk-badge dk-badge-success"><span className="dot"/>مستلَم</span>
                      : <span className="dk-badge dk-badge-danger">مرتجَع</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DashReports — analytics
   ============================================================ */
function BigChart() {
  const current = [40, 38, 45, 42, 50, 48, 60, 58, 65, 70, 68, 78, 82, 88, 92, 95, 98, 105, 102, 110, 115, 118, 122, 128, 132, 138, 142, 148, 152, 158];
  const prev    = [30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 54, 58, 60, 64, 68, 72, 75, 78, 80, 84, 88, 90, 95, 98, 102, 105, 108, 112, 115, 118];
  const w = 800, h = 240, pad = 24;
  const max = Math.max(...current, ...prev);
  const min = Math.min(...current, ...prev);
  const sx = i => pad + (i * (w - pad*2)) / (current.length - 1);
  const sy = v => h - pad - ((v - min) / (max - min || 1)) * (h - pad*2);
  const currentPath = current.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(v)}`).join(" ");
  const currentArea = `${currentPath} L${sx(current.length-1)},${h-pad} L${pad},${h-pad} Z`;
  const prevPath = prev.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{width: "100%", height: 240, display: "block"}}>
      {[0.25, 0.5, 0.75].map(p => (
        <line key={p} x1={pad} x2={w-pad} y1={pad + (h-pad*2)*p} y2={pad + (h-pad*2)*p} stroke="var(--dk-border)" strokeDasharray="4 4"/>
      ))}
      <path d={currentArea} fill="rgba(27,63,114,0.08)"/>
      <path d={prevPath} fill="none" stroke="var(--dk-accent)" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" opacity="0.75"/>
      <path d={currentPath} fill="none" stroke="var(--dk-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={sx(current.length-1)} cy={sy(current[current.length-1])} r="5" fill="var(--dk-accent)" stroke="white" strokeWidth="2"/>
    </svg>
  );
}

function DashReports({ storeType }) {
  const [period, setPeriod] = React.useState("30d");
  const isDigital = storeType === "digital";

  const periods = [
    { id: "today", label: "اليوم" },
    { id: "7d",    label: "7 أيام" },
    { id: "30d",   label: "30 يوم" },
    { id: "90d",   label: "3 أشهر" },
    { id: "year",  label: "سنة" },
  ];

  const byCity = [
    { name: "صنعاء",   value: 4820000, count: 142 },
    { name: "عدن",     value: 2840000, count: 88 },
    { name: "المكلا",  value: 1560000, count: 42 },
    { name: "تعز",     value: 1240000, count: 38 },
    { name: "إب",      value:  890000, count: 24 },
    { name: "حضرموت",  value:  460000, count: 12 },
  ];
  const byCategory = [
    { name: "اشتراكات", value: 4840000, count: 162 },
    { name: "ألعاب",    value: 3120000, count: 184 },
    { name: "برامج",    value: 2890000, count: 38 },
    { name: "بطاقات",   value: 1480000, count: 92 },
  ];
  const breakdown = isDigital ? byCategory : byCity;
  const maxVal = Math.max(...breakdown.map(b => b.value));

  const ordersByStatus = [
    { name: "تم التسليم", value: 78, color: "var(--dk-success)" },
    { name: isDigital ? "محادثة مفتوحة" : "تم الشحن", value: 12, color: "var(--dk-primary)" },
    { name: "مؤكد",      value: 6,  color: "var(--dk-info)" },
    { name: "بانتظار",   value: 3,  color: "var(--dk-warning)" },
    { name: "مرفوض",     value: 1,  color: "var(--dk-danger)" },
  ];

  const topProducts = (isDigital ? DIGITAL_PRODUCTS : PHYSICAL_PRODUCTS).slice(0, 5).map((p, i) => {
    const sold = 240 - i * 38;
    return { ...p, sold, revenue: p.price * sold };
  });

  const totalRevenue = breakdown.reduce((s, b) => s + b.value, 0);

  return (
    <div>
      {/* Period selector */}
      <div className="dk-card" style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "12px 16px"}}>
        <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 13, color: "var(--dk-text-muted)", flex: "none"}}>الفترة:</span>
        <div style={{display: "flex", gap: 4, flex: 1}}>
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                fontFamily: "var(--dk-font-ar)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                padding: "7px 14px", borderRadius: 999, border: 0,
                background: period === p.id ? "var(--dk-primary)" : "transparent",
                color: period === p.id ? "white" : "var(--dk-text-muted)",
                transition: "background-color 180ms cubic-bezier(.4,0,.2,1)"
              }}>
              {p.label}
            </button>
          ))}
        </div>
        <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{flex: "none"}}><Icon name="calendar" size={14}/>مدى مخصص</button>
        <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{flex: "none"}}><Icon name="download" size={14}/>تصدير PDF</button>
      </div>

      <div className="dash-kpis">
        <KpiCard label="إجمالي المبيعات"    value="14,820,000" suffix=" ر.ي" delta="+18% عن الفترة السابقة" deltaType="up"   icon="sales"/>
        <KpiCard label="عدد الطلبات"        value="427"                       delta="+12%"                    deltaType="up"   icon="orders"/>
        <KpiCard label="متوسط قيمة الطلب"   value="34,710"     suffix=" ر.ي"  delta="+5%"                     deltaType="up"   icon="customers"/>
        <KpiCard label="معدل التحويل"       value="3.8"        suffix="%"     delta="+0.4%"                   deltaType="up"   icon="pending"/>
      </div>

      {/* Chart + Top products */}
      <div style={{display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16}}>
        <div className="dk-card">
          <div className="dash-card-head">
            <div>
              <h3 className="dash-card-title">تطوّر المبيعات</h3>
              <div className="dash-card-sub">إجمالي <span className="dk-num">14,820,000 ر.ي</span> خلال {periods.find(p => p.id === period)?.label}</div>
            </div>
            <div className="dash-chart-legend">
              <span className="dot" style={{background: "var(--dk-primary)"}}/><span>الحالية</span>
              <span className="dot" style={{background: "var(--dk-accent)", marginInlineStart: 10}}/><span>السابقة</span>
            </div>
          </div>
          <BigChart/>
        </div>
        <div className="dk-card">
          <div className="dash-card-head">
            <h3 className="dash-card-title">الأعلى مبيعاً</h3>
            <button className="dash-link">الكل ←</button>
          </div>
          <div style={{display: "flex", flexDirection: "column"}}>
            {topProducts.map((p, i) => (
              <div key={p.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < topProducts.length - 1 ? "1px solid var(--dk-border)" : 0}}>
                <div style={{width: 26, height: 26, borderRadius: 6, background: i === 0 ? "var(--dk-accent)" : "var(--dk-bg)", color: i === 0 ? "white" : "var(--dk-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontSize: 12, fontWeight: 700, flex: "none"}}>{i + 1}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 13.5, fontWeight: 600, color: "var(--dk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{p.name}</div>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 11.5, color: "var(--dk-text-muted)"}}><span className="dk-num">{p.sold}</span> مبيعة</div>
                </div>
                <div className="dk-num" style={{fontFamily: "Inter", fontSize: 13, fontWeight: 700, color: "var(--dk-text)"}}>
                  {(p.revenue / 1000).toFixed(0)}<small style={{fontFamily: "var(--dk-font-ar)", fontWeight: 500, color: "var(--dk-text-muted)", marginInlineStart: 2}}>ك ر.ي</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown row */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
        <div className="dk-card">
          <div className="dash-card-head">
            <div>
              <h3 className="dash-card-title">{isDigital ? "المبيعات حسب الفئة" : "المبيعات حسب المدينة"}</h3>
              <div className="dash-card-sub">إجمالي <span className="dk-num">{totalRevenue.toLocaleString("en-US")} ر.ي</span></div>
            </div>
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: 14}}>
            {breakdown.map(b => (
              <div key={b.name}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "var(--dk-font-ar)"}}>
                  <span style={{fontSize: 13.5, color: "var(--dk-text)", fontWeight: 600}}>
                    {b.name}
                    <span style={{fontSize: 11.5, color: "var(--dk-text-subtle)", marginInlineStart: 6, fontWeight: 500}}>({b.count} طلب)</span>
                  </span>
                  <span className="dk-num" style={{fontSize: 13, color: "var(--dk-text)", fontWeight: 700}}>{b.value.toLocaleString("en-US")} <small style={{color: "var(--dk-text-muted)", fontWeight: 500}}>ر.ي</small></span>
                </div>
                <div style={{height: 8, background: "var(--dk-bg)", borderRadius: 4, overflow: "hidden"}}>
                  <div style={{width: `${(b.value / maxVal) * 100}%`, height: "100%", background: "var(--dk-primary)", borderRadius: 4, transition: "width 280ms cubic-bezier(.4,0,.2,1)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dk-card">
          <div className="dash-card-head">
            <div>
              <h3 className="dash-card-title">توزيع الطلبات حسب الحالة</h3>
              <div className="dash-card-sub"><span className="dk-num">427</span> طلب خلال الفترة</div>
            </div>
          </div>
          <div style={{display: "flex", height: 14, borderRadius: 6, overflow: "hidden", marginBottom: 18, border: "1px solid var(--dk-border)"}}>
            {ordersByStatus.map(s => (
              <div key={s.name} title={`${s.name}: ${s.value}%`} style={{background: s.color, width: `${s.value}%`}}/>
            ))}
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
            {ordersByStatus.map(s => (
              <div key={s.name} style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--dk-font-ar)", fontSize: 13, minWidth: 0}}>
                  <span style={{width: 10, height: 10, borderRadius: 3, background: s.color, flex: "none"}}/>
                  <span style={{color: "var(--dk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{s.name}</span>
                </div>
                <span className="dk-num" style={{fontFamily: "Inter", fontSize: 13, fontWeight: 700, color: "var(--dk-text)", flex: "none"}}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashPayments = DashPayments;
window.DashReports = DashReports;
