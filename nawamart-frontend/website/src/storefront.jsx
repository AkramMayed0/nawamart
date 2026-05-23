// NawaMart — Public storefront: grid + product detail + cart drawer
// Checkout lives in checkout.jsx

function Storefront({ storeType, view, setView, cart, setCart, onCheckout }) {
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [cartOpen, setCartOpen] = React.useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const addToCart = (p) => {
    setCart(cur => {
      const ex = cur.find(i => i.id === p.id);
      if (ex) return cur.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...cur, { ...p, qty: 1, storeType }];
    });
  };
  const updateQty = (id, delta) => {
    setCart(cur => cur.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  // Reset selectedProduct when type changes
  React.useEffect(() => { setSelectedProduct(null); }, [storeType]);

  const showPdp = selectedProduct !== null;
  return (
    <div data-screen-label={`04 — المتجر · ${showPdp ? "صفحة المنتج" : "تصفّح"}`}>
      <SfNav storeType={storeType} cartCount={cartCount} onCart={() => setCartOpen(true)}/>
      {!showPdp && (
        <SfBrowse storeType={storeType} onOpen={setSelectedProduct} onAdd={addToCart}/>
      )}
      {showPdp && (
        <SfProductDetail product={selectedProduct} storeType={storeType} onBack={() => setSelectedProduct(null)} onAdd={(p, q) => { for (let i = 0; i < q; i++) addToCart(p); setCartOpen(true); }}/>
      )}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdate={updateQty}
          onCheckout={() => { setCartOpen(false); onCheckout(); }}
          storeType={storeType}
        />
      )}
    </div>
  );
}

function SfNav({ storeType, cartCount, onCart }) {
  return (
    <nav className="sf-nav">
      <div className="sf-nav-inner">
        <div className="sf-brand">
          <img src="assets/logo.png" alt="NawaMart"/>
        </div>
        <div className="sf-links">
          <a className="active">الرئيسية</a>
          <a>المنتجات</a>
          <a>الأقسام</a>
          <a>عن المتجر</a>
        </div>
        <div className="sf-actions">
          <div className="sf-search">
            <Icon name="search" size={16}/>
            <input placeholder={storeType === "digital" ? "ابحث عن منتج رقمي..." : "ابحث عن منتج..."}/>
          </div>
          <button className="sf-icon-btn" aria-label="مفضلة"><Icon name="heart" size={20}/></button>
          <button className="sf-icon-btn" onClick={onCart} aria-label="السلة">
            <Icon name="cart" size={20}/>
            {cartCount > 0 && <span className="sf-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

function SfBrowse({ storeType, onOpen, onAdd }) {
  const products = storeType === "digital" ? DIGITAL_PRODUCTS : PHYSICAL_PRODUCTS;
  const [cat, setCat] = React.useState("all");
  const cats = storeType === "digital"
    ? [{id:"all",label:"كل المنتجات"},{id:"sub",label:"الاشتراكات"},{id:"games",label:"الألعاب"},{id:"apps",label:"البرامج"}]
    : [{id:"all",label:"كل المنتجات"},{id:"food",label:"الأغذية"},{id:"cloth",label:"الملابس"},{id:"acc",label:"الإكسسوارات"}];

  return (
    <>
      <SfHero storeType={storeType}/>
      <section className="dk-section">
        <div className="dk-container">
          <div className="sf-section-head">
            <div>
              <h2 className="sf-section-title">{storeType === "digital" ? "منتجاتنا الرقمية" : "منتجاتنا"}</h2>
              <p className="sf-section-sub">
                {products.length} منتج · {storeType === "digital" ? "⚡ تسليم فوري عبر المحادثة" : "🚚 توصيل لكل المحافظات"}
              </p>
            </div>
            <div className="sf-sort">
              <span>ترتيب:</span>
              <select className="dk-input" style={{width: "auto"}}>
                <option>الأكثر مبيعاً</option>
                <option>السعر: من الأقل</option>
                <option>الأحدث</option>
              </select>
            </div>
          </div>
          <div className="sf-cats">
            {cats.map(c => (
              <button key={c.id} className={`sf-cat ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="sf-grid">
            {products.map(p => (
              <article key={p.id} className="sf-product" onClick={() => onOpen(p)} style={{cursor: "pointer"}}>
                <div className="sf-product-img">
                  {p.tag && <span className={`sf-product-tag tag-${p.tagType || "accent"}`}>{p.tag}</span>}
                  <button className="sf-product-fav" onClick={e => e.stopPropagation()} aria-label="مفضلة">
                    <Icon name="heart" size={18}/>
                  </button>
                  <span className={`sf-product-type-badge ${storeType}`}>
                    {storeType === "digital"
                      ? <><Icon name="bolt" size={12}/>تسليم فوري</>
                      : <><Icon name="truck" size={12}/>توصيل</>}
                  </span>
                </div>
                <div className="sf-product-body">
                  <div className="sf-product-name">{p.name}</div>
                  <div className="sf-product-meta">{p.meta}</div>
                  <div className="sf-product-foot">
                    <div className="sf-product-price dk-num">{p.price.toLocaleString("en-US")}<small> ر.ي</small></div>
                    <button className="dk-btn dk-btn-primary dk-btn-sm" onClick={e => { e.stopPropagation(); onAdd(p); }}>أضف</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SfHero({ storeType }) {
  if (storeType === "digital") {
    return (
      <section className="sf-hero">
        <div className="sf-hero-inner">
          <div className="sf-hero-copy">
            <span className="sf-hero-eyebrow">⚡ تسليم خلال دقائق</span>
            <h1 className="sf-hero-title">اشتراكاتك وأكوادك<br/>بين يديك فوراً</h1>
            <p className="sf-hero-sub">سبوتيفاي، نتفلكس، بطاقات Steam، أكواد ألعاب — ادفع وستصلك بياناتك عبر محادثة خاصة خلال دقائق.</p>
            <div className="sf-hero-cta">
              <button className="dk-btn dk-btn-accent dk-btn-lg">تسوّق الآن</button>
              <button className="dk-btn dk-btn-ghost dk-btn-lg">كيف يعمل؟</button>
            </div>
            <div className="sf-hero-trust">
              <div><span className="dk-num">5,200+</span><small>طلب رقمي مكتمل</small></div>
              <div><span className="dk-num">5د</span><small>متوسط زمن التسليم</small></div>
              <div><span className="dk-num">٤٫٩</span><small>تقييم العملاء</small></div>
            </div>
          </div>
          <div className="sf-hero-visual">
            <div className="sf-hero-card sf-hero-card-1">
              <div className="sf-hero-card-img"/>
              <div className="sf-hero-card-tag">سبوتيفاي · ١٢ شهر</div>
              <div className="sf-hero-card-price dk-num">7,500 <small>ر.ي</small></div>
            </div>
            <div className="sf-hero-card sf-hero-card-2">
              <div className="sf-hero-card-img"/>
              <div className="sf-hero-card-tag">PUBG · 660 UC</div>
              <div className="sf-hero-card-price dk-num">3,200 <small>ر.ي</small></div>
            </div>
            <div className="sf-hero-stripe"/>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="sf-hero">
      <div className="sf-hero-inner">
        <div className="sf-hero-copy">
          <span className="sf-hero-eyebrow">منتجات يمنية أصلية</span>
          <h1 className="sf-hero-title">من المزرعة<br/>إلى بابك مباشرة</h1>
          <p className="sf-hero-sub">اكتشف أجود أنواع العسل، البن، والتمور اليمنية. توصيل لجميع المحافظات خلال 48 ساعة.</p>
          <div className="sf-hero-cta">
            <button className="dk-btn dk-btn-accent dk-btn-lg">تسوّق الآن</button>
            <button className="dk-btn dk-btn-ghost dk-btn-lg">تعرّف علينا</button>
          </div>
          <div className="sf-hero-trust">
            <div><span className="dk-num">5,200+</span><small>عميل سعيد</small></div>
            <div><span className="dk-num">١٤</span><small>محافظة نوصل لها</small></div>
            <div><span className="dk-num">٤٫٨</span><small>تقييم العملاء</small></div>
          </div>
        </div>
        <div className="sf-hero-visual">
          <div className="sf-hero-card sf-hero-card-1">
            <div className="sf-hero-card-img"/>
            <div className="sf-hero-card-tag">عسل سدر</div>
            <div className="sf-hero-card-price dk-num">14,400 <small>ر.ي</small></div>
          </div>
          <div className="sf-hero-card sf-hero-card-2">
            <div className="sf-hero-card-img"/>
            <div className="sf-hero-card-tag">بُن حرازي</div>
            <div className="sf-hero-card-price dk-num">8,500 <small>ر.ي</small></div>
          </div>
          <div className="sf-hero-stripe"/>
        </div>
      </div>
    </section>
  );
}

function SfProductDetail({ product, storeType, onBack, onAdd }) {
  const [qty, setQty] = React.useState(1);
  const [optIdx, setOptIdx] = React.useState(0);
  const isDigital = storeType === "digital";
  const options = isDigital
    ? ["شهر", "3 شهور", "6 شهور", "12 شهر"]
    : ["500 جرام", "1 كيلو", "2 كيلو"];

  return (
    <section className="pdp">
      <button className="pdp-back" onClick={onBack}><Icon name="arrow-right" size={14}/>العودة للمنتجات</button>
      <div className="pdp-grid">
        <div className="pdp-gallery">
          <div className="pdp-hero-img"/>
          <div className="pdp-thumbs">
            <div className="pdp-thumb active"/>
            <div className="pdp-thumb"/>
            <div className="pdp-thumb"/>
            <div className="pdp-thumb"/>
          </div>
        </div>
        <div className="pdp-info">
          <span className="pdp-cat">{product.cat}</span>
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-meta">
            <span className="stars">★★★★★</span>
            <span className="dk-num">4.8</span>
            <span>·</span>
            <span><span className="dk-num">128</span> تقييم</span>
            <span>·</span>
            <span style={{color: "var(--dk-success)", fontWeight: 600}}>متوفر</span>
          </div>
          <div className="pdp-price">
            <span className="pdp-price-num">{product.price.toLocaleString("en-US")}</span>
            <span className="pdp-price-unit">ر.ي</span>
            {product.tagType === "danger" && <span className="pdp-price-old">{(product.price * 1.25).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>}
          </div>
          <p className="pdp-desc">
            {isDigital
              ? "منتج رقمي 100%. سيتم تسليم بيانات الحساب أو كود التفعيل عبر قناة محادثة خاصة فور تأكيد الدفع. تسليم خلال 5-15 دقيقة."
              : "منتج يمني أصلي بجودة ممتازة. مُختار بعناية من أفضل المزارع المحلية، ومُحضّر يدوياً وفقاً للطرق التقليدية."}
          </p>

          <div className={`pdp-delivery ${storeType}`}>
            <div className="pdp-delivery-icon">
              <Icon name={isDigital ? "bolt" : "truck"} size={20}/>
            </div>
            <div className="pdp-delivery-body">
              <div className="pdp-delivery-title">
                {isDigital ? "تسليم فوري عبر المحادثة ⚡" : "توصيل خلال 24-48 ساعة 🚚"}
              </div>
              <div className="pdp-delivery-sub">
                {isDigital ? "ستصلك بيانات المنتج في محادثة خاصة بعد تأكيد الدفع." : "شحن لكل المحافظات · 1,500 ر.ي رسوم توصيل."}
              </div>
            </div>
          </div>

          <div className="pdp-options">
            <span className="pdp-opt-label">{isDigital ? "مدة الاشتراك" : "الحجم"}</span>
            <div className="pdp-opt-row">
              {options.map((o, i) => (
                <button key={o} className={`pdp-opt ${optIdx === i ? "active" : ""}`} onClick={() => setOptIdx(i)}>{o}</button>
              ))}
            </div>
          </div>

          <div className="pdp-cta-row">
            <div className="pdp-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className="dk-btn dk-btn-accent dk-btn-lg" style={{flex: 1, justifyContent: "center"}} onClick={() => onAdd(product, qty)}>
              <Icon name="cart" size={16}/>
              أضف للسلة
            </button>
            <button className="dk-btn dk-btn-secondary dk-btn-lg" aria-label="مفضلة" style={{padding: "14px 16px"}}>
              <Icon name="heart" size={18}/>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ cart, onClose, onUpdate, onCheckout, storeType }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()} data-screen-label="السلة">
        <div className="cart-head">
          <h3>سلة المشتريات <span style={{fontFamily: "Inter", color: "var(--dk-text-muted)", fontWeight: 600, fontSize: 14, marginInlineStart: 6}}>({cart.length})</span></h3>
          <button className="cart-close" onClick={onClose}><Icon name="x" size={20}/></button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <div style={{textAlign: "center", padding: "40px 20px", color: "var(--dk-text-muted)"}}>
              <Icon name="cart" size={36} style={{color: "var(--dk-text-subtle)", marginBottom: 10}}/>
              <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 15}}>السلة فارغة</div>
            </div>
          ) : cart.map(i => (
            <div className="cart-row" key={i.id}>
              <div className="cart-thumb"/>
              <div>
                <div className="cart-name">{i.name}</div>
                <div className="cart-meta">{i.meta}</div>
                <div className="cart-qty">
                  <button onClick={() => onUpdate(i.id, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => onUpdate(i.id, +1)}>+</button>
                </div>
              </div>
              <div className="cart-price dk-num">
                {(i.price * i.qty).toLocaleString("en-US")}<br/>
                <small style={{fontFamily: "var(--dk-font-ar)", color: "var(--dk-text-muted)", fontSize: 11}}>ر.ي</small>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-foot">
            <div className="cart-total-row">
              <span>الإجمالي</span>
              <span className="dk-num">{subtotal.toLocaleString("en-US")} ر.ي</span>
            </div>
            <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12, color: "var(--dk-text-muted)"}}>
              {storeType === "digital" ? "⚡ منتجات رقمية · بلا رسوم شحن" : "🚚 رسوم الشحن تُحسب في الخطوة التالية"}
            </div>
            <button className="dk-btn dk-btn-accent dk-btn-lg" style={{justifyContent: "center"}} onClick={onCheckout}>
              متابعة للدفع
              <Icon name="arrow-left" size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.Storefront = Storefront;
window.SfNav = SfNav;
