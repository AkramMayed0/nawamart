// NawaMart — App shell with Design Tour bar + screen router + Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "storeType": "physical",
  "viewAs": "merchant",
  "showTour": true
}/*EDITMODE-END*/;

const SCREENS = [
  { id: "landing",     num: "01", label: "الصفحة الرئيسية",   icon: "globe"   },
  { id: "onboarding",  num: "02", label: "تسجيل التاجر",      icon: "store"   },
  { id: "dashboard",   num: "03", label: "لوحة التاجر",        icon: "chart"   },
  { id: "storefront",  num: "04", label: "المتجر العام",       icon: "cart"    },
  { id: "checkout",    num: "04ب",label: "إتمام الشراء",       icon: "credit"  },
  { id: "order",       num: "05", label: "تفاصيل الطلب",       icon: "package" },
  { id: "chat",        num: "06", label: "المحادثة المدمجة",   icon: "msgs"    },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState("landing");
  const [activeOrder, setActiveOrder] = React.useState(null);
  const [activeChatId, setActiveChatId] = React.useState(null);
  const [cart, setCart] = React.useState([
    { id: 1, name: "عسل سدر يمني أصلي", cat: "أغذية", meta: "500 جرام", price: 14400, qty: 1, storeType: "physical" },
    { id: 2, name: "بُن حرازي مطحون", cat: "مشروبات", meta: "250 جرام", price: 8500, qty: 1, storeType: "physical" },
  ]);

  // Sync cart with store type — switch sample cart when type changes
  React.useEffect(() => {
    if (t.storeType === "digital") {
      setCart([
        { id: 11, name: "اشتراك سبوتيفاي · 12 شهر", cat: "اشتراكات", meta: "حساب فردي", price: 7500, qty: 1, storeType: "digital" },
        { id: 15, name: "اشتراك Microsoft 365",      cat: "برامج",   meta: "12 شهر",     price: 22000, qty: 1, storeType: "digital" },
      ]);
    } else {
      setCart([
        { id: 1, name: "عسل سدر يمني أصلي", cat: "أغذية", meta: "500 جرام", price: 14400, qty: 1, storeType: "physical" },
        { id: 2, name: "بُن حرازي مطحون",   cat: "مشروبات", meta: "250 جرام", price: 8500, qty: 1, storeType: "physical" },
      ]);
    }
  }, [t.storeType]);

  const goOrder = (o) => { setActiveOrder(o); setScreen("order"); };
  const goChat = (id) => {
    // If no specific thread requested, pick the first one matching current storeType
    if (!id) {
      const first = CHAT_THREADS.find(thr => thr.type === t.storeType);
      id = first?.id;
    }
    setActiveChatId(id);
    setScreen("chat");
  };

  // Default order example based on store type
  const exampleOrder = React.useMemo(() => {
    if (activeOrder) return activeOrder;
    return ALL_ORDERS.find(o => o.type === t.storeType && o.status === "pending") || ALL_ORDERS.find(o => o.type === t.storeType) || ALL_ORDERS[0];
  }, [activeOrder, t.storeType]);

  return (
    <div>
      {t.showTour && <TourBar screen={screen} setScreen={setScreen} storeType={t.storeType} setStoreType={v => setTweak("storeType", v)}/>}
      <div className="screen-frame">
        {screen === "landing" && (
          <LandingPage onGoOnboarding={() => setScreen("onboarding")} onGoStorefront={() => setScreen("storefront")}/>
        )}
        {screen === "onboarding" && (
          <Onboarding storeType={t.storeType} setStoreType={v => setTweak("storeType", v)} onDone={() => setScreen("dashboard")}/>
        )}
        {screen === "dashboard" && (
          <Dashboard storeType={t.storeType} onOpenOrder={goOrder} onOpenChat={(id) => goChat(id)}/>
        )}
        {screen === "storefront" && (
          <Storefront
            storeType={t.storeType}
            cart={cart} setCart={setCart}
            onCheckout={() => setScreen("checkout")}/>
        )}
        {screen === "checkout" && (
          <CheckoutContainer
            cart={cart} storeType={t.storeType}
            onBack={() => setScreen("storefront")}
            onConfirm={() => setScreen("checkout-done")}/>
        )}
        {screen === "checkout-done" && (
          <ConfirmScreen
            orderId="NM-2840-20"
            storeType={t.storeType}
            onHome={() => setScreen("landing")}
            onShop={() => setScreen("storefront")}
            onChat={() => goChat()}/>
        )}
        {screen === "order" && (
          <OrderDetail order={exampleOrder} onBack={() => setScreen("dashboard")} onOpenChat={() => goChat()}/>
        )}
        {screen === "chat" && (
          <ChatPage
            initialThreadId={activeChatId}
            storeType={t.storeType}
            asRole={t.viewAs}
            setAsRole={v => setTweak("viewAs", v)}/>
        )}
      </div>
      <TweaksPanel>
        <TweakSection label="نوع المتجر">
          <TweakRadio
            label="التدفّق"
            value={t.storeType}
            onChange={v => setTweak("storeType", v)}
            options={[
              { value: "physical", label: "🚚 مادي" },
              { value: "digital",  label: "⚡ رقمي" },
            ]}/>
          <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 11.5, color: "var(--dk-text-muted)", lineHeight: 1.55, marginTop: -6}}>
            يغيّر تدفّق الشراء، المنتجات، طريقة التسليم، وحالات الطلب.
          </div>
        </TweakSection>
        <TweakSection label="عرض الشاشة" defaultOpen>
          <TweakRadio
            label="عرض المحادثة كـ"
            value={t.viewAs}
            onChange={v => setTweak("viewAs", v)}
            options={[
              { value: "merchant", label: "تاجر" },
              { value: "customer", label: "عميل" },
            ]}/>
          <TweakToggle
            label="إظهار شريط الجولة"
            value={t.showTour}
            onChange={v => setTweak("showTour", v)}/>
        </TweakSection>
        <TweakSection label="انتقال سريع">
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6}}>
            {SCREENS.map(s => (
              <TweakButton key={s.id} label={`${s.num} · ${s.label}`} onClick={() => setScreen(s.id)}/>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Tour bar -----------------------------------------------------
function TourBar({ screen, setScreen, storeType, setStoreType }) {
  return (
    <header className="tour">
      <div className="tour-brand">
        <img src="assets/logo.png" alt="NawaMart"/>
      </div>
      <div className="tour-chips">
        {SCREENS.map(s => (
          <button key={s.id} className={`tour-chip ${screen === s.id || (s.id === "checkout" && screen === "checkout-done") ? "active" : ""}`} onClick={() => setScreen(s.id)}>
            <span className="num">{s.num}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      <div className="tour-meta">
        <div className="tour-meta-pill">
          نوع المتجر:
          <button onClick={() => setStoreType("physical")} style={{background: storeType === "physical" ? "var(--dk-primary)" : "transparent", color: storeType === "physical" ? "white" : "var(--dk-text-muted)", border: 0, padding: "3px 9px", borderRadius: 999, fontFamily: "var(--dk-font-ar)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4}}>
            🚚 مادي
          </button>
          <button onClick={() => setStoreType("digital")} style={{background: storeType === "digital" ? "var(--dk-accent)" : "transparent", color: storeType === "digital" ? "white" : "var(--dk-text-muted)", border: 0, padding: "3px 9px", borderRadius: 999, fontFamily: "var(--dk-font-ar)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4}}>
            ⚡ رقمي
          </button>
        </div>
      </div>
    </header>
  );
}

// Small wrapper so we can pass `storeType` into Checkout without leaking props
function CheckoutContainer(props) {
  return <Checkout {...props}/>;
}

// Mount --------------------------------------------------------
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
