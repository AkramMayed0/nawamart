// NawaMart — Merchant onboarding wizard
function Onboarding({ storeType, setStoreType, onDone }) {
  const [step, setStep] = React.useState(1);
  const [info, setInfo] = React.useState({
    name: "متجر المختار",
    slug: "almukhtar",
    category: "أغذية ومشروبات",
    desc: "منتجات يمنية أصلية بجودة عالية. عسل، بُن، وتمور من قلب اليمن.",
  });

  const steps = [
    { id: 1, title: "اختر نوع المتجر", sub: "مادي أو رقمي" },
    { id: 2, title: "بيانات المتجر",   sub: "الاسم، الشعار، الوصف" },
    { id: 3, title: "إعداد الدفع",     sub: "حساب التحويل" },
    { id: 4, title: "أنشئ المتجر",    sub: "اضغط نشر، ابدأ البيع" },
  ];

  return (
    <div className="onb" data-screen-label="02 — تسجيل التاجر">
      <aside className="onb-side">
        <div className="onb-brand">
          <img src="assets/logo.png" alt="NawaMart"/>
        </div>
        <div className="onb-steps">
          {steps.map(s => (
            <div key={s.id} className={`onb-step-item ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
              <div className="onb-step-num">
                {step > s.id ? <Icon name="check" size={14} strokeWidth={3}/> : s.id}
              </div>
              <div className="onb-step-body">
                <div className="onb-step-title">{s.title}</div>
                <div className="onb-step-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="onb-main">
        {step === 1 && <OnbStepType storeType={storeType} setStoreType={setStoreType} onNext={() => setStep(2)} />}
        {step === 2 && <OnbStepInfo info={info} setInfo={setInfo} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <OnbStepPayment onBack={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <OnbStepDone info={info} storeType={storeType} onDashboard={onDone}/>}
      </main>
    </div>
  );
}

function OnbStepType({ storeType, setStoreType, onNext }) {
  return (
    <>
      <div>
        <span className="onb-eyebrow">الخطوة ١ من ٤</span>
        <h1 className="onb-title">ما نوع المتجر الذي ستفتحه؟</h1>
        <p className="onb-sub">سنُعدّ كل شيء بناءً على نوع منتجاتك. يمكنك تغيير الاختيار لاحقاً من الإعدادات.</p>
      </div>
      <div className="onb-types">
        <div className={`onb-type ${storeType === "physical" ? "selected" : ""}`} onClick={() => setStoreType("physical")}>
          <div className="onb-type-top">
            <div className="onb-type-icon physical"><Icon name="truck" size={28}/></div>
            <div className="onb-type-check">{storeType === "physical" && <Icon name="check" size={14} strokeWidth={3}/>}</div>
          </div>
          <h3>منتجات مادية 🚚</h3>
          <p>ملابس، أغذية، إكسسوارات، أي منتج يُشحن للعميل. يشمل سلة شراء، عنوان توصيل، وتتبع حالة الطلب.</p>
          <div className="onb-type-tags">
            <span className="onb-type-tag">سلة + عنوان</span>
            <span className="onb-type-tag">شحن وتتبع</span>
            <span className="onb-type-tag">إدارة المخزون</span>
          </div>
        </div>

        <div className={`onb-type ${storeType === "digital" ? "selected" : ""}`} onClick={() => setStoreType("digital")}>
          <div className="onb-type-top">
            <div className="onb-type-icon digital"><Icon name="bolt" size={28}/></div>
            <div className="onb-type-check">{storeType === "digital" && <Icon name="check" size={14} strokeWidth={3}/>}</div>
          </div>
          <h3>منتجات رقمية ⚡</h3>
          <p>اشتراكات، حسابات، أكواد ألعاب، برامج. لا شحن — قناة محادثة خاصة بين متجرك والعميل لتسليم المنتج.</p>
          <div className="onb-type-tags">
            <span className="onb-type-tag">دون عنوان</span>
            <span className="onb-type-tag">تسليم فوري</span>
            <span className="onb-type-tag">شات مدمج</span>
          </div>
        </div>
      </div>
      <div className="onb-actions">
        <span className="left"><Icon name="lock" size={14}/>كل بياناتك مشفّرة وآمنة</span>
        <button className="dk-btn dk-btn-primary dk-btn-lg" disabled={!storeType} onClick={onNext}>
          متابعة
          <Icon name="arrow-left" size={16}/>
        </button>
      </div>
    </>
  );
}

function OnbStepInfo({ info, setInfo, onBack, onNext }) {
  const upd = (k, v) => setInfo({ ...info, [k]: v });
  return (
    <>
      <div>
        <span className="onb-eyebrow">الخطوة ٢ من ٤</span>
        <h1 className="onb-title">بيانات متجرك</h1>
        <p className="onb-sub">هذه المعلومات يراها العملاء على صفحة متجرك. يمكنك تعديل كل شيء لاحقاً.</p>
      </div>
      <div className="onb-form">
        <div className="onb-logo-up">
          <div className="onb-logo-thumb"><Icon name="store" size={28}/></div>
          <div className="onb-logo-body">
            <div className="onb-logo-title">شعار المتجر</div>
            <div className="onb-logo-sub">صورة مربعة · PNG أو JPG · حتى 2 ميجابايت</div>
          </div>
          <button className="dk-btn dk-btn-secondary dk-btn-sm"><Icon name="upload" size={14}/>اختر صورة</button>
        </div>

        <div className="onb-row">
          <div className="onb-field">
            <label>اسم المتجر</label>
            <input className="dk-input" value={info.name} onChange={e => upd("name", e.target.value)}/>
          </div>
          <div className="onb-field">
            <label>التصنيف</label>
            <select className="dk-input" value={info.category} onChange={e => upd("category", e.target.value)}>
              <option>أغذية ومشروبات</option>
              <option>ملابس وموضة</option>
              <option>إكسسوارات وهدايا</option>
              <option>إلكترونيات</option>
              <option>اشتراكات وألعاب رقمية</option>
              <option>برامج وتطبيقات</option>
            </select>
          </div>
        </div>

        <div className="onb-field">
          <label>رابط المتجر</label>
          <div className="onb-domain">
            <input className="dk-input" value={info.slug} onChange={e => upd("slug", e.target.value)}/>
            <span className="onb-domain-tld">.nawa.shop</span>
          </div>
          <span className="hint">✓ هذا الرابط متاح — مجاني مدى الحياة</span>
        </div>

        <div className="onb-field">
          <label>وصف المتجر</label>
          <textarea className="dk-input" rows="3" value={info.desc} onChange={e => upd("desc", e.target.value)} style={{resize: "vertical", lineHeight: 1.6}}/>
          <span className="hint">جملة أو اثنتين تظهر في الصفحة الرئيسية لمتجرك.</span>
        </div>
      </div>
      <div className="onb-actions">
        <button className="dk-btn dk-btn-ghost" onClick={onBack}><Icon name="arrow-right" size={16}/>السابق</button>
        <button className="dk-btn dk-btn-primary dk-btn-lg" onClick={onNext}>
          متابعة
          <Icon name="arrow-left" size={16}/>
        </button>
      </div>
    </>
  );
}

function OnbStepPayment({ onBack, onNext }) {
  const wallets = [
    { id: "cherry",   name: "Cherry",   sub: "محفظة إلكترونية يمنية",       placeholder: "٧٧١ XXX XXX" },
    { id: "kuraimi",  name: "الكريمي",   sub: "بنك التضامن — تطبيق الكريمي", placeholder: "رقم الحساب / الهاتف" },
    { id: "onecash",  name: "OneCash",  sub: "محفظة وأن كاش",                placeholder: "٧٣ XXX XXX" },
    { id: "bank",     name: "تحويل بنكي", sub: "حساب بنكي تقليدي",            placeholder: "IBAN / رقم الحساب" },
  ];
  const [selected, setSelected] = React.useState(["cherry"]);
  const [primary, setPrimary] = React.useState("cherry");
  const [accountNumbers, setAccountNumbers] = React.useState({
    cherry: "٧٧١ ٤٢٣ ٨٩٠",
  });

  const toggle = (id) => {
    setSelected(cur => {
      if (cur.includes(id)) {
        const next = cur.filter(x => x !== id);
        // If we removed the primary, promote the next one in the list
        if (primary === id) setPrimary(next[0] || null);
        return next;
      }
      // First pick becomes primary by default
      if (cur.length === 0) setPrimary(id);
      return [...cur, id];
    });
  };

  return (
    <>
      <div>
        <span className="onb-eyebrow">الخطوة ٣ من ٤</span>
        <h1 className="onb-title">طرق استلام المدفوعات</h1>
        <p className="onb-sub">العميل سيحوّل المبلغ ويرفع صورة الوصل. اختر محفظة واحدة أو أكثر، وأدخل رقم الحساب لكلٍّ منها.</p>
      </div>
      <div className="onb-form">
        <div className="onb-field">
          <label>محافظ الاستقبال <span style={{color: "var(--dk-text-subtle)", fontWeight: 500}}>· يمكنك اختيار أكثر من واحدة</span></label>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4}}>
            {wallets.map(w => {
              const isOn = selected.includes(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`onb-type ${isOn ? "selected" : ""}`}
                  style={{padding: 14, gap: 8}}
                  onClick={() => toggle(w.id)}>
                  <div style={{display: "flex", alignItems: "center", gap: 12}}>
                    <div className="onb-type-icon" style={{width: 40, height: 40, borderRadius: 10, background: isOn ? "var(--dk-primary)" : "var(--dk-primary-50)", color: isOn ? "white" : "var(--dk-primary)"}}>
                      <Icon name="credit" size={20}/>
                    </div>
                    <div style={{flex: 1, textAlign: "start", minWidth: 0}}>
                      <div style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6}}>
                        {w.name}
                        {isOn && primary === w.id && (
                          <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--dk-accent-100)", color: "var(--dk-accent-700)"}}>الرئيسية</span>
                        )}
                      </div>
                      <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12, color: "var(--dk-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{w.sub}</div>
                    </div>
                    {/* Checkbox indicator */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flex: "none",
                      border: isOn ? "0" : "1.5px solid var(--dk-border-strong)",
                      background: isOn ? "var(--dk-primary)" : "transparent",
                      color: "white", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {isOn && <Icon name="check" size={13} strokeWidth={3}/>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="onb-field">
            <label>أرقام الحسابات لكل محفظة</label>
            <div style={{display: "flex", flexDirection: "column", gap: 10, marginTop: 4}}>
              {selected.map(id => {
                const w = wallets.find(x => x.id === id);
                const isPrimary = primary === id;
                return (
                  <div key={id} style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 14px",
                    background: "white",
                    border: "1px solid var(--dk-border)",
                    borderRadius: 10,
                  }}>
                    <div style={{width: 36, height: 36, borderRadius: 8, background: "var(--dk-primary-50)", color: "var(--dk-primary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
                      <Icon name="credit" size={18}/>
                    </div>
                    <div style={{minWidth: 0}}>
                      <div style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 14, color: "var(--dk-text)", display: "flex", alignItems: "center", gap: 6}}>
                        {w.name}
                        {isPrimary && (
                          <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--dk-accent-100)", color: "var(--dk-accent-700)"}}>الرئيسية</span>
                        )}
                      </div>
                      <input
                        className="dk-input dk-num"
                        dir="ltr"
                        style={{marginTop: 6, textAlign: "start", padding: "8px 12px", fontSize: 14}}
                        placeholder={w.placeholder}
                        value={accountNumbers[id] || ""}
                        onChange={e => setAccountNumbers(cur => ({ ...cur, [id]: e.target.value }))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrimary(id)}
                      title={isPrimary ? "هذه هي الرئيسية" : "اجعلها الرئيسية"}
                      style={{
                        fontFamily: "var(--dk-font-ar)", fontSize: 12, fontWeight: 600,
                        padding: "6px 10px", borderRadius: 8, cursor: isPrimary ? "default" : "pointer",
                        border: "1px solid var(--dk-border)",
                        background: isPrimary ? "var(--dk-bg-soft)" : "white",
                        color: isPrimary ? "var(--dk-text-subtle)" : "var(--dk-text-muted)",
                        whiteSpace: "nowrap", flex: "none",
                      }}>
                      {isPrimary ? "★ رئيسية" : "اجعلها الرئيسية"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      title="إزالة"
                      aria-label="إزالة"
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: "1px solid var(--dk-border)",
                        background: "white", color: "var(--dk-danger)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flex: "none",
                      }}>
                      <Icon name="x" size={14}/>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="onb-field">
          <label>اسم صاحب الحساب</label>
          <input className="dk-input" defaultValue="عبدالملك المختار"/>
          <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 11.5, color: "var(--dk-text-subtle)", marginTop: 4, display: "block"}}>
            نفس الاسم سيُعرض للعميل عند الدفع في كل المحافظ.
          </span>
        </div>

        <div className="onb-field" style={{background: "var(--dk-info-100)", padding: 14, borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start"}}>
          <Icon name="shield" size={20} style={{color: "var(--dk-info)", flex: "none", marginTop: 1}}/>
          <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 13.5, color: "#1B5BB3", lineHeight: 1.55}}>
            <strong style={{display: "block", marginBottom: 2}}>طبقة حماية إضافية</strong>
            لن يتم تأكيد أي طلب قبل مراجعتك لصورة الوصل. عمولة المنصة 0% على الخطة المجانية، 2.5% على باقي الخطط.
          </div>
        </div>
      </div>
      <div className="onb-actions">
        <button className="dk-btn dk-btn-ghost" onClick={onBack}><Icon name="arrow-right" size={16}/>السابق</button>
        <button
          className="dk-btn dk-btn-primary dk-btn-lg"
          onClick={onNext}
          disabled={selected.length === 0}
          style={selected.length === 0 ? {opacity: 0.5, cursor: "not-allowed"} : {}}>
          متابعة
          <Icon name="arrow-left" size={16}/>
        </button>
      </div>
    </>
  );
}

function OnbStepDone({ info, storeType, onDashboard }) {
  return (
    <>
      <div>
        <span className="onb-eyebrow">الخطوة ٤ من ٤</span>
        <h1 className="onb-title">متجرك جاهز 🎉</h1>
        <p className="onb-sub">تم إنشاء «{info.name}» بنجاح. أضف منتجاتك الأولى وابدأ في استقبال الطلبات.</p>
      </div>
      <div className="onb-done">
        <div className="onb-done-icon"><Icon name="check" size={36} strokeWidth={3}/></div>
        <h2>{info.name} · جاهز للبيع</h2>
        <p>
          {storeType === "digital"
            ? "متجرك من نوع منتجات رقمية. قناة محادثة جاهزة لتسليم المنتج لكل طلب فور تأكيد الدفع."
            : "متجرك من نوع منتجات مادية. تدفّق الطلبات سيشمل عنوان التوصيل وتتبع حالة الشحن."}
        </p>
        <div className="onb-done-link">
          <Icon name="globe" size={14}/>
          {info.slug}.nawa.shop
          <button style={{background: "transparent", border: 0, cursor: "pointer", color: "var(--dk-primary)", padding: 0, marginInlineStart: 6}}><Icon name="copy" size={14}/></button>
        </div>
        <div className="onb-done-actions">
          <button className="dk-btn dk-btn-secondary dk-btn-lg"><Icon name="plus" size={16}/>أضف أول منتج</button>
          <button className="dk-btn dk-btn-primary dk-btn-lg" onClick={onDashboard}>
            إلى لوحة التحكم
            <Icon name="arrow-left" size={16}/>
          </button>
        </div>
      </div>
    </>
  );
}

window.Onboarding = Onboarding;
