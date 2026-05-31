// NawaMart — Checkout & confirmation
// Physical = address + receipt; Digital = receipt only (chat opens after merchant confirm)

function Checkout({ cart, storeType, onBack, onConfirm }) {
  const isDigital = storeType === "digital";
  const [receipt, setReceipt] = React.useState(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("صنعاء");
  const [addr, setAddr] = React.useState("");
  const [wallet, setWallet] = React.useState("cherry");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = isDigital ? 0 : 1500;
  const total = subtotal + shipping;

  const canSubmit = receipt && name && phone && (isDigital || addr);

  return (
    <section className="dk-section" data-screen-label="04 — المتجر · إتمام الشراء">
      <div className="dk-container sf-checkout">
        <button className="sf-back" onClick={onBack}>
          <Icon name="arrow-right" size={14}/>
          العودة للتسوق
        </button>

        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 20}}>
          <h1 style={{fontFamily: "var(--dk-font-ar)", fontSize: 28, fontWeight: 800, color: "var(--dk-text)", margin: 0}}>
            إتمام الطلب
          </h1>
          <span className={`dk-badge ${isDigital ? "dk-badge-warning" : "dk-badge-info"}`} style={{marginInlineStart: 4}}>
            {isDigital ? <><Icon name="bolt" size={11}/>تسليم فوري</> : <><Icon name="truck" size={11}/>توصيل</>}
          </span>
        </div>

        <div className="sf-checkout-grid">
          <div className="sf-checkout-main">
            {/* Contact / Delivery */}
            <div className="dk-card">
              <h3 className="sf-card-title">
                {isDigital ? "معلومات التواصل" : "معلومات التوصيل"}
              </h3>
              {isDigital && (
                <p className="sf-card-sub" style={{marginBottom: 14}}>
                  هذا منتج رقمي — لن نحتاج عنوان شحن. سنفتح معك محادثة خاصة لتسليم المنتج بعد تأكيد الدفع.
                </p>
              )}
              <div className="sf-form">
                <div className="sf-form-row">
                  <div>
                    <label className="dk-label">الاسم الكامل</label>
                    <input className="dk-input" placeholder="مثال: عبدالرحمن المقطري" value={name} onChange={e => setName(e.target.value)}/>
                  </div>
                  <div>
                    <label className="dk-label">رقم الجوال (للواتساب)</label>
                    <input className="dk-input" placeholder="7XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)}/>
                  </div>
                </div>
                {!isDigital && (
                  <div className="sf-form-row">
                    <div>
                      <label className="dk-label">المحافظة</label>
                      <select className="dk-input" value={city} onChange={e => setCity(e.target.value)}>
                        <option>صنعاء</option><option>عدن</option><option>تعز</option>
                        <option>إب</option><option>الحديدة</option><option>المكلا</option>
                      </select>
                    </div>
                    <div>
                      <label className="dk-label">العنوان التفصيلي</label>
                      <input className="dk-input" placeholder="الحي، الشارع، علامة مميزة" value={addr} onChange={e => setAddr(e.target.value)}/>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment + Receipt */}
            <div className="dk-card">
              <h3 className="sf-card-title">طريقة الدفع</h3>
              <p className="sf-card-sub">
                اختر المحفظة، حوّل المبلغ <strong className="dk-num">{total.toLocaleString("en-US")} ر.ي</strong>، ثم ارفع صورة الوصل.
              </p>

              <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16}}>
                {[
                  { id: "cherry",  name: "Cherry",   sub: "محفظة" },
                  { id: "kuraimi", name: "الكريمي",   sub: "تطبيق بنك التضامن" },
                  { id: "onecash", name: "OneCash",  sub: "محفظة" },
                ].map(w => (
                  <button key={w.id}
                    onClick={() => setWallet(w.id)}
                    style={{
                      padding: "12px 14px",
                      background: wallet === w.id ? "var(--dk-primary-50)" : "white",
                      border: "1.5px solid " + (wallet === w.id ? "var(--dk-primary)" : "var(--dk-border)"),
                      borderRadius: 10, cursor: "pointer", textAlign: "start",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}>
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                      <div style={{width: 28, height: 28, borderRadius: 6, background: wallet === w.id ? "var(--dk-primary)" : "var(--dk-bg-soft)", color: wallet === w.id ? "white" : "var(--dk-text-muted)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <Icon name="credit" size={14}/>
                      </div>
                      <span style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 14}}>{w.name}</span>
                    </div>
                    <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 11.5, color: "var(--dk-text-muted)"}}>{w.sub}</span>
                  </button>
                ))}
              </div>

              <div className="sf-bank">
                <div><span className="sf-bank-l">المحفظة:</span> {wallet === "cherry" ? "Cherry" : wallet === "kuraimi" ? "بنك التضامن — الكريمي" : "OneCash"}</div>
                <div><span className="sf-bank-l">رقم الحساب:</span> <span className="dk-num">٧٧١ ٤٢٣ ٨٩٠</span></div>
                <div><span className="sf-bank-l">باسم:</span> عبدالملك المختار</div>
              </div>

              {!receipt ? (
                <label className="sf-uploader">
                  <input type="file" accept="image/*" hidden onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setReceipt({ name: f.name, size: (f.size/1024/1024).toFixed(1) });
                  }}/>
                  <div className="sf-uploader-icon"><Icon name="upload" size={22}/></div>
                  <div className="sf-uploader-body">
                    <div className="sf-uploader-title">ارفع صورة الوصل</div>
                    <div className="sf-uploader-sub">PNG أو JPG · حتى 5 ميجابايت</div>
                  </div>
                  <span className="dk-btn dk-btn-primary dk-btn-sm">اختر ملف</span>
                </label>
              ) : (
                <div className="sf-uploaded">
                  <div className="sf-uploaded-thumb">وصل</div>
                  <div className="sf-uploaded-body">
                    <div className="sf-uploaded-name">{receipt.name || "receipt.jpg"}</div>
                    <div className="sf-uploaded-meta">{receipt.size} ميجابايت · تم الرفع ✓</div>
                  </div>
                  <button className="sf-uploaded-remove" onClick={() => setReceipt(null)} aria-label="إزالة">×</button>
                </div>
              )}
              {!receipt && (
                <button className="sf-skip" onClick={() => setReceipt({ name: "receipt-sample.jpg", size: "2.4" })}>
                  (تخطّي للعرض — استخدم صورة تجريبية)
                </button>
              )}
            </div>

            {isDigital && (
              <div className="dk-card" style={{background: "var(--dk-accent-50)", borderColor: "var(--dk-accent-100)"}}>
                <div style={{display: "flex", gap: 14, alignItems: "flex-start"}}>
                  <div style={{width: 40, height: 40, borderRadius: 10, background: "var(--dk-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
                    <Icon name="msgs" size={20}/>
                  </div>
                  <div>
                    <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 14.5, fontWeight: 700, color: "var(--dk-text)", marginBottom: 4}}>
                      ماذا يحدث بعد تأكيد الدفع؟
                    </div>
                    <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 13, color: "var(--dk-text-muted)", lineHeight: 1.6}}>
                      فور مراجعة التاجر للوصل (عادةً خلال دقائق)، ستفتح <strong>محادثة خاصة</strong> بينك وبين متجر «المختار». يرسل لك التاجر بيانات المنتج (الحساب، الكود، أو الملف)، ثم تؤكد الاستلام داخل المحادثة نفسها.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="sf-summary">
            <h3 className="sf-card-title">ملخص الطلب</h3>
            <div className="sf-items">
              {cart.map((i, idx) => (
                <div className="sf-item" key={idx}>
                  <div className="sf-item-thumb"/>
                  <div className="sf-item-body">
                    <div className="sf-item-name">{i.name}</div>
                    <div className="sf-item-meta">{i.meta} · ×{i.qty}</div>
                  </div>
                  <div className="sf-item-price dk-num">{(i.price * i.qty).toLocaleString("en-US")}</div>
                </div>
              ))}
            </div>
            <div className="sf-totals">
              <div className="sf-total-row"><span>المجموع الفرعي</span><span className="dk-num">{subtotal.toLocaleString("en-US")} ر.ي</span></div>
              <div className="sf-total-row">
                <span>{isDigital ? "التسليم" : "الشحن"}</span>
                <span className="dk-num">{isDigital ? "مجاناً ⚡" : `${shipping.toLocaleString("en-US")} ر.ي`}</span>
              </div>
              <div className="sf-total-row sf-total-grand">
                <span>الإجمالي</span><span className="dk-num">{total.toLocaleString("en-US")} ر.ي</span>
              </div>
            </div>
            <button
              className={`dk-btn ${canSubmit ? "dk-btn-accent" : "dk-btn-primary"} dk-btn-lg`}
              style={{width: "100%", justifyContent: "center", opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed"}}
              disabled={!canSubmit}
              onClick={onConfirm}>
              تأكيد الطلب
            </button>
            <div className="sf-summary-note">
              {isDigital
                ? "سيراجع التاجر الوصل خلال دقائق وتفتح المحادثة فوراً."
                : "سيتواصل التاجر معك خلال 24 ساعة لتأكيد الطلب."}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ConfirmScreen({ orderId, storeType, onShop, onHome, onChat }) {
  const isDigital = storeType === "digital";
  return (
    <div className="sf-confirm" data-screen-label="04 — المتجر · تم استلام الطلب">
      <div className="sf-confirm-icon">
        <Icon name="check" size={32} strokeWidth={3}/>
      </div>
      <h2>تم استلام طلبك ✓</h2>
      <p>
        {isDigital
          ? "سيراجع التاجر صورة الوصل ويفتح معك محادثة خاصة لتسليم المنتج. عادةً خلال 5-15 دقيقة."
          : "سيتواصل التاجر معك خلال 24 ساعة لتأكيد الطلب ومراجعة الوصل. شكراً لثقتك بنا."}
      </p>
      <div className="sf-confirm-id">{orderId}</div>
      <div style={{display: "flex", gap: 12, justifyContent: "center"}}>
        <button className="dk-btn dk-btn-secondary" onClick={onHome}>للصفحة الرئيسية</button>
        {isDigital
          ? <button className="dk-btn dk-btn-accent" onClick={onChat}><Icon name="msgs" size={14}/>افتح المحادثة</button>
          : <button className="dk-btn dk-btn-primary" onClick={onShop}>تابع التسوق</button>}
      </div>
    </div>
  );
}

window.Checkout = Checkout;
window.ConfirmScreen = ConfirmScreen;
