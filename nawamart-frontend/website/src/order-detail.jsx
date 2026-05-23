// NawaMart — Order detail page (merchant view) with status timeline
// Physical:  pending → confirmed → shipped → delivered
// Digital:   pending → confirmed → chat-open → delivered

function OrderDetail({ order, onBack, onOpenChat }) {
  const o = order || ALL_ORDERS[0];
  const isDigital = o.type === "digital";

  const physicalSteps = [
    { id: "pending",   label: "بانتظار الوصل", time: "20 May · 14:22" },
    { id: "confirmed", label: "مؤكد", time: "20 May · 15:10" },
    { id: "shipped",   label: "تم الشحن", time: "—" },
    { id: "delivered", label: "تم التسليم", time: "—" },
  ];
  const digitalSteps = [
    { id: "pending",   label: "بانتظار الوصل",  time: "20 May · 14:22" },
    { id: "confirmed", label: "مؤكد",           time: "20 May · 15:10" },
    { id: "chat-open", label: "محادثة مفتوحة",   time: "20 May · 15:11" },
    { id: "digital-delivered", label: "تم التسليم", time: "—" },
  ];
  const steps = isDigital ? digitalSteps : physicalSteps;
  const currentIdx = steps.findIndex(s => s.id === o.status);
  const cur = currentIdx === -1 ? 0 : currentIdx;

  // Items reconstruction
  const sampleItems = isDigital
    ? [{ name: o.product || "Microsoft 365 · 12 شهر", meta: "مفتاح تفعيل", qty: 1, price: o.amount }]
    : [
        { name: "عسل سدر يمني أصلي", meta: "500 جرام", qty: 2, price: 14400 },
        { name: "بُن حرازي مطحون",   meta: "250 جرام", qty: 1, price: 8500 },
        { name: "تمر برحي مكنوز",    meta: "1 كيلو",    qty: 1, price: 6200 },
      ];

  const subtotal = sampleItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = isDigital ? 0 : 1500;
  const total = subtotal + shipping;

  return (
    <div className="od" data-screen-label={`05 — تفاصيل الطلب ${o.id}`}>
      <button className="od-back" onClick={onBack}><Icon name="arrow-right" size={14}/>الرجوع للطلبات</button>

      <div className="od-head">
        <div>
          <h1>
            طلب
            <span className="id">{o.id}</span>
            <span className={`dk-badge ${isDigital ? "dk-badge-warning" : "dk-badge-info"}`} style={{fontSize: 12}}>
              {isDigital ? <><Icon name="bolt" size={11}/>منتج رقمي</> : <><Icon name="truck" size={11}/>منتج مادي</>}
            </span>
            <StatusBadge status={o.status}/>
          </h1>
          <div className="od-head-meta">
            <span><Icon name="calendar" size={14} style={{verticalAlign: "middle", marginInlineEnd: 4}}/>{o.date} · 14:22</span>
            <span>·</span>
            <span>{sampleItems.length} منتج</span>
            <span>·</span>
            <span><strong className="dk-num" style={{color: "var(--dk-text)"}}>{total.toLocaleString("en-US")} ر.ي</strong></span>
          </div>
        </div>
        <div className="od-head-actions">
          <button className="dk-btn dk-btn-secondary"><Icon name="download" size={14}/>تحميل PDF</button>
          {!isDigital && o.status === "confirmed" && (
            <button className="dk-btn dk-btn-accent"><Icon name="truck" size={14}/>وضع علامة شُحن</button>
          )}
          {!isDigital && (o.status === "confirmed" || o.status === "shipped" || o.status === "pending") && (
            <button className="dk-btn dk-btn-secondary" onClick={onOpenChat}><Icon name="msgs" size={14}/>فتح محادثة</button>
          )}
          {isDigital && (o.status === "confirmed" || o.status === "chat-open") && (
            <button className="dk-btn dk-btn-accent" onClick={onOpenChat}><Icon name="msgs" size={14}/>فتح المحادثة</button>
          )}
          {o.status === "pending" && (
            <>
              <button className="dk-btn dk-btn-secondary" style={{borderColor: "var(--dk-danger)", color: "var(--dk-danger)"}}><Icon name="x" size={14}/>رفض الطلب</button>
              <button className="dk-btn dk-btn-accent"><Icon name="check" size={14}/>تأكيد الدفع</button>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="od-card compact" style={{marginBottom: 16}}>
        <div className="od-timeline">
          {steps.map((s, i) => {
            let cls = "todo";
            if (i < cur) cls = "done";
            else if (i === cur) cls = "current";
            return (
              <div key={s.id} className={`od-tstep ${cls} ${isDigital && cls === "current" ? "digital" : ""}`}>
                <div className="od-tdot">
                  {cls === "done" ? <Icon name="check" size={16} strokeWidth={3}/> : i + 1}
                </div>
                <div className="od-tlabel">{s.label}</div>
                <div className="od-ttime dk-num">{s.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="od-grid">
        <div className="od-main">

          {/* Status callout */}
          {o.status === "pending" && (
            <div className="od-alert warn">
              <div className="od-alert-icon"><Icon name="bell" size={20}/></div>
              <div className="od-alert-body">
                <strong>راجع وصل الدفع قبل التأكيد</strong>
                تأكّد من المبلغ، رقم الحساب، وتاريخ التحويل. اضغط «تأكيد الدفع» ليُنقل الطلب إلى المرحلة التالية.
              </div>
            </div>
          )}
          {isDigital && o.status === "chat-open" && (
            <div className="od-alert info">
              <div className="od-alert-icon"><Icon name="msgs" size={20}/></div>
              <div className="od-alert-body">
                <strong>المحادثة مفتوحة مع العميل</strong>
                أرسل بيانات المنتج (الحساب، الكود، أو الملف) عبر المحادثة. ستُغلق الجلسة بعد تأكيد الاستلام من العميل.
              </div>
            </div>
          )}

          {/* Items */}
          <div className="od-card">
            <h3>عناصر الطلب</h3>
            <div className="od-items">
              {sampleItems.map((it, i) => (
                <div className="od-item" key={i}>
                  <div className="od-item-thumb">
                    {isDigital ? <Icon name="bolt" size={18}/> : null}
                  </div>
                  <div className="od-item-body">
                    <div className="od-item-name">{it.name}</div>
                    <div className="od-item-meta">{it.meta} · الكمية: {it.qty}</div>
                  </div>
                  <div className="od-item-price">{(it.price * it.qty).toLocaleString("en-US")}<small>ر.ي</small></div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt */}
          <div className="od-card">
            <h3>وصل الدفع</h3>
            <div className="od-receipt">
              <div className="od-receipt-thumb">صورة الوصل</div>
              <div className="od-receipt-body">
                <div className="od-receipt-row"><span className="l">المبلغ المحوّل:</span><span className="v dk-num">{total.toLocaleString("en-US")} ر.ي</span></div>
                <div className="od-receipt-row"><span className="l">المحفظة:</span><span className="v">Cherry — محفظة إلكترونية</span></div>
                <div className="od-receipt-row"><span className="l">من حساب:</span><span className="v dk-num">٧٧١-XXX-١٢٣</span></div>
                <div className="od-receipt-row"><span className="l">تاريخ التحويل:</span><span className="v">20 مايو 2026 · 14:18</span></div>
                <div className="od-receipt-row"><span className="l">رقم العملية:</span><span className="v dk-num">CH-2840-5520198</span></div>
                <div className="od-receipt-actions">
                  <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="eye" size={14}/>عرض كامل</button>
                  <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="download" size={14}/>تحميل</button>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping (physical only) */}
          {!isDigital && (
            <div className="od-card">
              <h3>عنوان التوصيل</h3>
              <div style={{display: "flex", gap: 14, fontFamily: "var(--dk-font-ar)"}}>
                <div style={{width: 44, height: 44, borderRadius: 10, background: "var(--dk-primary-50)", color: "var(--dk-primary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
                  <Icon name="map" size={20}/>
                </div>
                <div style={{flex: 1, lineHeight: 1.7}}>
                  <div style={{fontSize: 15, fontWeight: 700, color: "var(--dk-text)"}}>{o.customer}</div>
                  <div style={{fontSize: 14, color: "var(--dk-text-muted)"}}>{o.city}</div>
                  <div style={{fontSize: 13.5, color: "var(--dk-text-muted)"}}>شارع الستين · بجوار صيدلية الشفاء</div>
                  <div style={{fontSize: 13, color: "var(--dk-text-subtle)", marginTop: 4}}>ملاحظات للسائق: المنزل ذو البوابة الزرقاء</div>
                </div>
              </div>
            </div>
          )}

          {/* Chat preview block (digital only) */}
          {isDigital && (
            <div className="od-card" style={{background: "var(--dk-primary-50)", borderColor: "var(--dk-primary-100)"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14}}>
                <h3 style={{margin: 0}}>قناة تسليم المنتج · محادثة خاصة</h3>
                <button className="dk-btn dk-btn-primary dk-btn-sm" onClick={onOpenChat}>فتح المحادثة <Icon name="arrow-left" size={12}/></button>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "white", borderRadius: 10, border: "1px solid var(--dk-border)"}}>
                <div style={{alignSelf: "flex-start", maxWidth: "75%", background: "var(--dk-bg)", padding: "8px 12px", borderRadius: 12, fontFamily: "var(--dk-font-ar)", fontSize: 13.5}}>
                  السلام عليكم، تم الدفع. متى يصلني التفعيل؟
                  <div style={{fontFamily: "Inter", fontSize: 10.5, color: "var(--dk-text-subtle)", marginTop: 3}}>10:23</div>
                </div>
                <div style={{alignSelf: "flex-end", maxWidth: "75%", background: "var(--dk-primary)", color: "white", padding: "8px 12px", borderRadius: 12, fontFamily: "var(--dk-font-ar)", fontSize: 13.5}}>
                  وعليكم السلام، سأرسل لك بيانات الحساب الآن
                  <div style={{fontFamily: "Inter", fontSize: 10.5, color: "rgba(255,255,255,0.6)", marginTop: 3}}>10:24 ✓✓</div>
                </div>
                <div style={{textAlign: "center", color: "var(--dk-text-subtle)", fontFamily: "var(--dk-font-ar)", fontSize: 12, padding: "4px 0"}}>...</div>
              </div>
            </div>
          )}
        </div>

        <aside className="od-side">
          {/* Customer */}
          <div className="od-card">
            <h3>العميل</h3>
            <div className="od-customer">
              <div style={{display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--dk-border)"}}>
                <div style={{width: 46, height: 46, borderRadius: 50, background: "var(--dk-primary)", color: "white", fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center"}}>
                  {o.customer.charAt(0)}
                </div>
                <div>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 15, color: "var(--dk-text)"}}>{o.customer}</div>
                  <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12, color: "var(--dk-text-muted)"}}>عميل منذ مارس 2025 · 8 طلبات</div>
                </div>
              </div>
              <div className="od-customer-row">
                <Icon name="phone" size={16} className="icon"/>
                <div><div className="l">الجوال</div><div className="v dk-num">+967 770 123 456</div></div>
              </div>
              {!isDigital && (
                <div className="od-customer-row">
                  <Icon name="map" size={16} className="icon"/>
                  <div><div className="l">المحافظة</div><div className="v">{o.city}</div></div>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="od-card">
            <h3>الإجماليات</h3>
            <div className="od-totals-row"><span>المجموع الفرعي</span><span className="dk-num">{subtotal.toLocaleString("en-US")} ر.ي</span></div>
            <div className="od-totals-row">
              <span>{isDigital ? "التسليم" : "الشحن"}</span>
              <span className="dk-num">{isDigital ? "مجاناً" : shipping.toLocaleString("en-US") + " ر.ي"}</span>
            </div>
            <div className="od-totals-row grand"><span>الإجمالي</span><span className="dk-num">{total.toLocaleString("en-US")} ر.ي</span></div>
          </div>

          {/* Actions */}
          <div className="od-card">
            <h3>إجراءات سريعة</h3>
            <div className="od-actions-stacked">
              {o.status === "pending" && (
                <>
                  <button className="dk-btn dk-btn-accent"><Icon name="check" size={14}/>تأكيد الدفع</button>
                  <button className="dk-btn dk-btn-secondary" style={{color: "var(--dk-danger)", borderColor: "var(--dk-danger)"}}><Icon name="x" size={14}/>رفض الطلب</button>
                </>
              )}
              {!isDigital && o.status === "confirmed" && (
                <button className="dk-btn dk-btn-accent"><Icon name="truck" size={14}/>تم الشحن</button>
              )}
              {!isDigital && o.status === "shipped" && (
                <button className="dk-btn dk-btn-accent"><Icon name="check-circle" size={14}/>تم التسليم</button>
              )}
              {!isDigital && (
                <button className="dk-btn dk-btn-secondary" onClick={onOpenChat}><Icon name="msgs" size={14}/>فتح محادثة مع العميل</button>
              )}
              {isDigital && (
                <button className="dk-btn dk-btn-accent" onClick={onOpenChat}><Icon name="msgs" size={14}/>فتح المحادثة</button>
              )}
              <button className="dk-btn dk-btn-secondary"><Icon name="phone" size={14}/>اتصل بالعميل</button>
              <button className="dk-btn dk-btn-ghost"><Icon name="more" size={14}/>المزيد</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.OrderDetail = OrderDetail;
