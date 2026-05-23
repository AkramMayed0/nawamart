// NawaMart — Landing page
function LandingPage({ onGoOnboarding, onGoStorefront }) {
  return (
    <div className="lp" data-screen-label="01 — الصفحة الرئيسية">
      <LpNav onSignup={onGoOnboarding} />
      <LpHero onSignup={onGoOnboarding} onShop={onGoStorefront} />
      <LpStoreTypes />
      <LpHow />
      <LpPricing onSignup={onGoOnboarding} />
      <LpTestimonials />
      <LpFinalCta onSignup={onGoOnboarding} />
      <LpFooter />
    </div>
  );
}

function LpNav({ onSignup }) {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <img src="assets/logo.png" alt="NawaMart" />
        <div className="lp-nav-links">
          <a>المنصة</a>
          <a>المتاجر المادية</a>
          <a>المتاجر الرقمية</a>
          <a>الأسعار</a>
          <a>تواصل معنا</a>
        </div>
        <div className="lp-nav-actions">
          <button className="dk-btn dk-btn-ghost">تسجيل الدخول</button>
          <button className="dk-btn dk-btn-accent" onClick={onSignup}>ابدأ مجاناً</button>
        </div>
      </div>
    </nav>
  );
}

function LpHero({ onSignup, onShop }) {
  return (
    <section className="lp-hero">
      <div className="lp-hero-inner">
        <div className="lp-hero-copy">
          <span className="lp-hero-eyebrow">
            <span className="dot"/>
            منصة يمنية · للتجار اليمنيين
          </span>
          <h1 className="lp-hero-title">
            أنشئ متجرك<br/>
            في <span className="accent">دقائق</span>،<br/>
            بِع لأي مكان.
          </h1>
          <p className="lp-hero-sub">
            منصة متكاملة لإنشاء متجرك الإلكتروني — منتجات مادية أو رقمية — مع نظام دفع محلي، تأكيد الوصل، وقناة محادثة مباشرة بين التاجر والعميل.
          </p>
          <div className="lp-hero-cta">
            <button className="dk-btn dk-btn-accent dk-btn-lg" onClick={onSignup}>
              ابدأ مجاناً
              <Icon name="arrow-left" size={18}/>
            </button>
            <button className="dk-btn dk-btn-secondary dk-btn-lg" onClick={onShop}>
              <Icon name="eye" size={16}/>
              شاهد متجراً تجريبياً
            </button>
          </div>
          <div className="lp-hero-trust">
            <div><span className="dk-num">1,200+</span><small>تاجر يستخدم المنصة</small></div>
            <div><span className="dk-num">٤٫٨</span><small>تقييم التجار</small></div>
            <div><span className="dk-num">15د</span><small>متوسط فتح المتجر</small></div>
          </div>
        </div>
        <div className="lp-hero-visual">
          {/* Storefront preview */}
          <div className="lp-mock lp-mock-shop">
            <div className="lp-mock-shop-bar">
              <span className="lp-mock-shop-dot"/><span className="lp-mock-shop-dot"/><span className="lp-mock-shop-dot"/>
              <span className="lp-mock-shop-url">almukhtar.nawa.shop</span>
            </div>
            <div className="lp-mock-shop-body">
              <div className="lp-mock-shop-h">
                <strong>متجر المختار</strong>
                منتجات يمنية · توصيل لكل المحافظات
              </div>
              <div className="lp-mock-shop-grid">
                <div className="lp-mock-shop-tile with-truck"/>
                <div className="lp-mock-shop-tile with-truck"/>
                <div className="lp-mock-shop-tile with-truck"/>
                <div className="lp-mock-shop-tile with-truck"/>
                <div className="lp-mock-shop-tile with-truck"/>
                <div className="lp-mock-shop-tile with-truck"/>
              </div>
            </div>
          </div>
          {/* Order tracking preview */}
          <div className="lp-mock lp-mock-order">
            <div className="lp-mock-order-head">
              <strong>تتبع الطلب</strong>
              <span className="lp-mock-order-id">NM-2840-19</span>
            </div>
            <div className="lp-mock-order-body">
              <div className="lp-mock-step done"><span className="dot"><Icon name="check" size={11}/></span><span>تم استلام الوصل</span></div>
              <div className="lp-mock-step done"><span className="dot"><Icon name="check" size={11}/></span><span>تأكيد الدفع</span></div>
              <div className="lp-mock-step active"><span className="dot">3</span><span>قيد الشحن</span></div>
              <div className="lp-mock-step todo"><span className="dot">4</span><span>تم التسليم</span></div>
            </div>
          </div>
          <div className="lp-accent-stripe"/>
        </div>
      </div>
    </section>
  );
}

function LpStoreTypes() {
  return (
    <section className="lp-section">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow-en">Two store types · in one platform</span>
          <h2 className="lp-section-title">متجر يناسب ما تبيعه</h2>
          <p className="lp-section-sub">
            سواء كنت تبيع منتجات مادية تُشحن للعميل، أو منتجات رقمية تُسلَّم فوراً عبر المحادثة — اختر نوع متجرك وستحصل على التدفق المناسب تماماً.
          </p>
        </div>

        <div className="lp-twin">
          <div className="lp-twin-card">
            <div className="lp-twin-icon-wrap">
              <div className="lp-twin-icon"><Icon name="truck" size={28}/></div>
              <span className="lp-twin-badge"><Icon name="truck" size={12}/>توصيل · 🚚</span>
            </div>
            <h3 className="lp-twin-title">منتجات مادية</h3>
            <p className="lp-twin-sub">ملابس، أغذية، إكسسوارات، ومنتجات تُشحن للعميل. عنوان توصيل، تأكيد وصل الدفع، ثم شحن وتتبع.</p>
            <div className="lp-twin-examples">
              <span className="lp-twin-example">ملابس</span>
              <span className="lp-twin-example">أغذية</span>
              <span className="lp-twin-example">إكسسوارات</span>
              <span className="lp-twin-example">منتجات يدوية</span>
            </div>
            <div className="lp-twin-features">
              <div className="lp-twin-feature"><span className="lp-twin-feature-icon"><Icon name="check" size={12} strokeWidth={3}/></span><span>صفحة سلة + إدخال عنوان توصيل</span></div>
              <div className="lp-twin-feature"><span className="lp-twin-feature-icon"><Icon name="check" size={12} strokeWidth={3}/></span><span>رفع صورة الوصل وتأكيد التاجر</span></div>
              <div className="lp-twin-feature"><span className="lp-twin-feature-icon"><Icon name="check" size={12} strokeWidth={3}/></span><span>تتبع حالة الطلب · بانتظار ← مؤكد ← شُحن ← تم التسليم</span></div>
            </div>
          </div>

          <div className="lp-twin-card digital">
            <div className="lp-twin-icon-wrap">
              <div className="lp-twin-icon"><Icon name="bolt" size={28}/></div>
              <span className="lp-twin-badge"><Icon name="bolt" size={12}/>تسليم فوري · ⚡</span>
            </div>
            <h3 className="lp-twin-title">منتجات رقمية</h3>
            <p className="lp-twin-sub">اشتراكات، أكواد ألعاب، حسابات، تطبيقات. لا عنوان توصيل — بل قناة محادثة خاصة تفتح فور تأكيد الدفع.</p>
            <div className="lp-twin-examples">
              <span className="lp-twin-example">اشتراكات</span>
              <span className="lp-twin-example">أكواد ألعاب</span>
              <span className="lp-twin-example">حسابات</span>
              <span className="lp-twin-example">برامج</span>
            </div>
            <div className="lp-twin-features">
              <div className="lp-twin-feature"><span className="lp-twin-feature-icon"><Icon name="check" size={12} strokeWidth={3}/></span><span>سلة دون عنوان شحن · رفع الوصل فقط</span></div>
              <div className="lp-twin-feature"><span className="lp-twin-feature-icon"><Icon name="check" size={12} strokeWidth={3}/></span><span>محادثة خاصة تفتح بعد تأكيد الدفع</span></div>
              <div className="lp-twin-feature"><span className="lp-twin-feature-icon"><Icon name="check" size={12} strokeWidth={3}/></span><span>إرسال المنتج: رابط، كود، حساب، ملف</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LpHow() {
  return (
    <section className="lp-section" style={{paddingTop: 0}}>
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow-en">How it works</span>
          <h2 className="lp-section-title">كيف يعمل المتجر؟</h2>
          <p className="lp-section-sub">٣ خطوات لكل نوع متجر — متطابقة من ناحية البساطة، مختلفة في طريقة التسليم.</p>
        </div>

        <div className="lp-how">
          <div className="lp-how-col">
            <div className="lp-how-head">
              <div className="lp-how-head-icon physical"><Icon name="truck" size={22}/></div>
              <div>
                <h3>تدفق المنتجات المادية</h3>
                <small>للملابس، الأغذية، الإكسسوارات</small>
              </div>
            </div>
            <div className="lp-how-step">
              <span className="lp-how-num">1</span>
              <div className="lp-how-step-body">
                <h4>العميل يتسوق ويضيف للسلة</h4>
                <p>يتصفح المنتجات في متجرك، ويضيف ما يريد، ثم يُدخل عنوان التوصيل في المحافظة المناسبة.</p>
              </div>
            </div>
            <div className="lp-how-step">
              <span className="lp-how-num">2</span>
              <div className="lp-how-step-body">
                <h4>يدفع ويرفع الوصل</h4>
                <p>يحوّل المبلغ عبر Cherry / Kuraimi / OneCash، ثم يرفع صورة وصل الدفع لتأكيد العملية.</p>
              </div>
            </div>
            <div className="lp-how-step">
              <span className="lp-how-num">3</span>
              <div className="lp-how-step-body">
                <h4>تأكّد، اشحن، تابع</h4>
                <p>تأكّد من الوصل، أرسل الطلب، وحدّث حالته. العميل يتابع كل خطوة حتى التسليم.</p>
              </div>
            </div>
          </div>

          <div className="lp-how-col">
            <div className="lp-how-head">
              <div className="lp-how-head-icon digital"><Icon name="bolt" size={22}/></div>
              <div>
                <h3>تدفق المنتجات الرقمية</h3>
                <small>للاشتراكات، الحسابات، أكواد التفعيل</small>
              </div>
            </div>
            <div className="lp-how-step">
              <span className="lp-how-num">1</span>
              <div className="lp-how-step-body">
                <h4>العميل يختار ويدفع</h4>
                <p>يتصفح المنتجات الرقمية ويُتم الطلب — بلا عنوان شحن، فقط بياناته الأساسية ووصل الدفع.</p>
              </div>
            </div>
            <div className="lp-how-step">
              <span className="lp-how-num">2</span>
              <div className="lp-how-step-body">
                <h4>تأكّد من الوصل</h4>
                <p>تراجع الوصل من لوحة التحكم، وبضغطة واحدة تفتح قناة محادثة خاصة بين متجرك والعميل.</p>
              </div>
            </div>
            <div className="lp-how-step">
              <span className="lp-how-num">3</span>
              <div className="lp-how-step-body">
                <h4>سلّم المنتج عبر الشات</h4>
                <p>أرسل الرابط، الحساب، الكود، أو الملف مباشرة. العميل يؤكد الاستلام وتُغلق الجلسة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LpPricing({ onSignup }) {
  const tiers = [
    {
      name: "Free", numAr: "٠", num: "0", unit: "ر.ي / شهر", sub: "ابدأ بدون تكلفة، طوّر متجرك على راحتك.", featured: false,
      features: ["حتى 20 منتج", "نطاق فرعي على nawa.shop", "تأكيد الوصل اليدوي", "تقارير مبيعات أساسية"],
      cta: "ابدأ مجاناً", ctaType: "secondary",
    },
    {
      name: "Pro", numAr: "٤٬٩٠٠", num: "4,900", unit: "ر.ي / شهر", sub: "للتجار النشطين — مادي أو رقمي.", featured: true,
      features: ["منتجات بلا حدود", "نطاق مخصص .com", "قناة محادثة للمتاجر الرقمية", "إشعارات SMS للعملاء", "تقارير متقدمة"],
      cta: "اختر Pro", ctaType: "accent",
    },
    {
      name: "Business", numAr: "١٢٬٠٠٠", num: "12,000", unit: "ر.ي / شهر", sub: "للمتاجر التي تتوسع.", featured: false,
      features: ["كل مميزات Pro", "حتى 5 مستخدمين فريق", "API للتكامل الخارجي", "أولوية الدعم 24/7", "تقارير ضريبية مخصصة"],
      cta: "تواصل معنا", ctaType: "secondary",
    },
  ];
  return (
    <section className="lp-section" style={{background: "var(--dk-surface)", borderTop: "1px solid var(--dk-border)", borderBottom: "1px solid var(--dk-border)"}}>
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow-en">Pricing · plans for every stage</span>
          <h2 className="lp-section-title">خطط بسيطة، بلا مفاجآت</h2>
          <p className="lp-section-sub">ادفع شهرياً، ألغِ متى شئت. كل الخطط تشمل دعم نوعَي المتجر.</p>
        </div>
        <div className="lp-pricing">
          {tiers.map(t => (
            <div key={t.name} className={`lp-price-card ${t.featured ? "featured" : ""}`}>
              <h3 className="lp-price-name">{t.name}</h3>
              <div className="lp-price-amount">
                <span className="lp-price-num dk-num">{t.num}</span>
                <span className="lp-price-unit">{t.unit}</span>
              </div>
              <p className="lp-price-sub">{t.sub}</p>
              <div className="lp-price-features">
                {t.features.map((f, i) => (
                  <div key={i} className="lp-price-feature">
                    <Icon name="check" size={16} strokeWidth={2.5}/>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button className={`dk-btn dk-btn-${t.ctaType} dk-btn-lg`} style={{justifyContent: "center"}} onClick={onSignup}>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LpTestimonials() {
  return (
    <section className="lp-section">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow-en">Trusted by Yemeni merchants</span>
          <h2 className="lp-section-title">تجار يثقون بنا</h2>
          <p className="lp-section-sub">من باعة الأغذية في صنعاء إلى تجار الاشتراكات الرقمية في عدن.</p>
        </div>
        <div className="lp-quotes">
          {TESTIMONIALS.map((q, i) => (
            <div key={i} className="lp-quote">
              <div className="lp-quote-mark">"</div>
              <p className="lp-quote-text">{q.text}</p>
              <div className="lp-quote-author">
                <div className="lp-quote-avatar">{q.initials}</div>
                <div>
                  <div className="lp-quote-name">{q.name}</div>
                  <div className="lp-quote-meta">{q.store}</div>
                </div>
                <span className={`lp-quote-store-type ${q.type}`}>
                  {q.type === "physical"
                    ? <><Icon name="truck" size={11}/>مادي</>
                    : <><Icon name="bolt" size={11}/>رقمي</>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LpFinalCta({ onSignup }) {
  return (
    <section className="lp-cta">
      <div className="lp-cta-inner">
        <div className="lp-accent-bar-cta"/>
        <h2>متجرك جاهز<br/>على بُعد ١٥ دقيقة</h2>
        <p>سجّل حساباً مجانياً، اختر نوع متجرك، وأضف أول منتج اليوم. لا حاجة لبطاقة ائتمانية.</p>
        <div className="lp-cta-actions">
          <button className="dk-btn dk-btn-accent dk-btn-lg" onClick={onSignup}>
            ابدأ مجاناً
            <Icon name="arrow-left" size={18}/>
          </button>
          <button className="dk-btn dk-btn-lg" style={{background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.18)"}}>
            <Icon name="phone" size={16}/>
            تكلم مع فريقنا
          </button>
        </div>
      </div>
    </section>
  );
}

function LpFooter() {
  return (
    <footer className="lp-foot">
      <div className="lp-foot-inner">
        <div>© 2026 NawaMart · صُنع في اليمن بفخر</div>
        <div className="lp-foot-links">
          <a>الخصوصية</a>
          <a>الشروط</a>
          <a>المساعدة</a>
          <a>nawadev.ye</a>
        </div>
      </div>
    </footer>
  );
}

window.LandingPage = LandingPage;
