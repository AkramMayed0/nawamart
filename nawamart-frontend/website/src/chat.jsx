// NawaMart — Built-in chat for digital product delivery
// 3-column: thread list / messages / order context

function ChatPage({ initialThreadId, asRole, setAsRole, storeType }) {
  const filtered = React.useMemo(
    () => CHAT_THREADS.filter(t => !storeType || t.type === storeType),
    [storeType]
  );
  const [activeId, setActiveId] = React.useState(initialThreadId || filtered[0]?.id);
  const [drafts, setDrafts] = React.useState({});
  const [threads, setThreads] = React.useState(filtered);

  // Re-sync when store type flips (digital ↔ physical) so the list & active thread make sense
  React.useEffect(() => {
    setThreads(filtered);
    if (!filtered.find(t => t.id === activeId)) {
      setActiveId(filtered[0]?.id);
    }
  }, [storeType]); // eslint-disable-line

  const active = threads.find(t => t.id === activeId) || threads[0];

  React.useEffect(() => {
    if (initialThreadId) setActiveId(initialThreadId);
  }, [initialThreadId]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setThreads(cur => cur.map(t => t.id === active.id
      ? { ...t, messages: [...t.messages, { from: asRole, kind: "text", text, time: "الآن" }] }
      : t
    ));
    setDrafts(d => ({ ...d, [active.id]: "" }));
  };

  if (!active) {
    return (
      <div className="chat" data-screen-label="06 — المحادثة المدمجة">
        <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--dk-font-ar)", color: "var(--dk-text-muted)", padding: 40, textAlign: "center"}}>
          لا توجد محادثات لهذا النوع من المتاجر.
        </div>
      </div>
    );
  }

  return (
    <div className="chat" data-screen-label="06 — المحادثة المدمجة">
      <ChatList threads={threads} activeId={active.id} onSelect={setActiveId} asRole={asRole}/>
      <ChatRoom thread={active} asRole={asRole} setAsRole={setAsRole}
        draft={drafts[active.id] || ""}
        setDraft={t => setDrafts(d => ({ ...d, [active.id]: t }))}
        onSend={sendMessage}/>
      <ChatContext thread={active}/>
    </div>
  );
}

function ChatList({ threads, activeId, onSelect, asRole }) {
  return (
    <aside className="chat-list">
      <div className="chat-list-head">
        <h2>
          المحادثات
          <span className="count">{threads.length}</span>
        </h2>
        <div className="chat-search">
          <Icon name="search" size={14}/>
          <input placeholder="ابحث في المحادثات..."/>
        </div>
      </div>
      <div className="chat-list-rows">
        {threads.map(t => {
          const last = t.messages[t.messages.length - 1];
          const preview = last
            ? last.kind === "credentials" ? "🔑 بيانات الحساب"
            : last.kind === "file"        ? `📎 ${last.file.name}`
            : last.kind === "info"        ? "ℹ️ " + last.text
            : (last.from === asRole ? "أنت: " : "") + (last.text || "—")
            : "—";
          return (
            <div key={t.id} className={`chat-list-row ${activeId === t.id ? "active" : ""}`} onClick={() => onSelect(t.id)}>
              <div className="chat-list-avatar">{t.initials}</div>
              <div className="chat-list-mid">
                <div className="chat-list-name-row">
                  <span className="chat-list-name">{t.customer}</span>
                  <span className="chat-list-order">{t.orderId}</span>
                </div>
                <div className="chat-list-preview">{preview}</div>
              </div>
              <div className="chat-list-right">
                <span className="chat-list-time">{t.lastTime}</span>
                {t.unread > 0 && <span className="dash-inbox-unread">{t.unread}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ChatRoom({ thread, asRole, setAsRole, draft, setDraft, onSend }) {
  const feedRef = React.useRef(null);
  React.useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [thread.id, thread.messages.length]);

  return (
    <section className="chat-room">
      <div className="chat-room-head">
        <div className="chat-room-avatar">{thread.initials}</div>
        <div className="chat-room-info">
          <div className="chat-room-name">
            {thread.customer}
            {thread.type === "physical" ? (
              <span className="dash-store-pill physical" style={{margin: 0}}>
                <Icon name="truck" size={11}/>طلب مادي
              </span>
            ) : (
              <span className="dash-store-pill digital" style={{margin: 0}}>
                <Icon name="bolt" size={11}/>منتج رقمي
              </span>
            )}
          </div>
          <div className="chat-room-status">
            <span className="dot"/>{thread.online ? "متصل الآن" : "كان متصلاً قبل قليل"}
          </div>
        </div>
        <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12, color: "var(--dk-text-muted)", marginInlineEnd: 12, display: "flex", alignItems: "center", gap: 6}}>
          عرض كـ:
          <button
            onClick={() => setAsRole(asRole === "merchant" ? "customer" : "merchant")}
            style={{background: "var(--dk-primary-50)", color: "var(--dk-primary)", border: 0, borderRadius: 999, padding: "4px 10px", fontFamily: "var(--dk-font-ar)", fontSize: 12, fontWeight: 700, cursor: "pointer"}}>
            {asRole === "merchant" ? "التاجر" : "العميل"} · بدّل
          </button>
        </div>
        <div className="chat-room-actions">
          <button className="chat-icon-btn" title="بحث"><Icon name="search" size={18}/></button>
          <button className="chat-icon-btn" title="مكالمة"><Icon name="phone" size={18}/></button>
          <button className="chat-icon-btn" title="المزيد"><Icon name="more" size={18}/></button>
        </div>
      </div>

      <div className="chat-feed" ref={feedRef}>
        <div className="chat-day">20 مايو 2026</div>
        {thread.messages.map((m, i) => <ChatMessage key={i} msg={m} asRole={asRole}/>)}
        {/* If last message from merchant, show "confirm receipt" option for customer */}
        {asRole === "customer" && thread.messages[thread.messages.length - 1]?.from === "merchant" && thread.type === "digital" && (
          <button className="chat-confirm-receipt">
            <Icon name="check-circle" size={14}/>
            أكّد استلام المنتج
          </button>
        )}
      </div>

      <ChatComposer draft={draft} setDraft={setDraft} onSend={() => onSend(draft)} asRole={asRole} threadType={thread.type}/>
    </section>
  );
}

function ChatMessage({ msg, asRole }) {
  if (msg.from === "system") {
    return (
      <div style={{alignSelf: "center", maxWidth: "70%", textAlign: "center", padding: "10px 14px", background: "var(--dk-success-100)", color: "var(--dk-success-dark)", borderRadius: 999, fontFamily: "var(--dk-font-ar)", fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6}}>
        <Icon name="check-circle" size={14}/>{msg.text}
      </div>
    );
  }
  const sent = msg.from === asRole;
  return (
    <div className={`chat-msg ${sent ? "sent" : "received"}`}>
      {msg.kind === "text" && (
        <>
          <div className="chat-bubble">{msg.text}</div>
          <div className="chat-time">{msg.time}{sent && <span className="seen">✓✓</span>}</div>
        </>
      )}
      {msg.kind === "credentials" && (
        <>
          <div className="chat-creds">
            <div style={{display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, marginBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.08)"}}>
              <Icon name="key" size={16}/>
              <span style={{fontFamily: "var(--dk-font-ar)", fontSize: 13, fontWeight: 700}}>بيانات تفعيل الحساب</span>
            </div>
            {msg.creds.map((c, i) => (
              <div className="chat-creds-row" key={i}>
                <span className="l">{c.l}</span>
                <span className="v">{c.v}</span>
                <button className="chat-creds-copy" aria-label="نسخ"><Icon name="copy" size={13}/></button>
              </div>
            ))}
          </div>
          <div className="chat-time">{msg.time}{sent && <span className="seen">✓✓</span>}</div>
        </>
      )}
      {msg.kind === "file" && (
        <>
          <div className="chat-file">
            <div className="chat-file-icon"><Icon name="file" size={20}/></div>
            <div className="chat-file-body">
              <div className="chat-file-name">{msg.file.name}</div>
              <div className="chat-file-meta">{msg.file.size}</div>
            </div>
            <button className="chat-icon-btn" style={{flex: "none"}}><Icon name="download" size={16}/></button>
          </div>
          <div className="chat-time">{msg.time}{sent && <span className="seen">✓✓</span>}</div>
        </>
      )}
    </div>
  );
}

function ChatComposer({ draft, setDraft, onSend, asRole, threadType }) {
  const isDigital = threadType === "digital";
  return (
    <div className="chat-composer">
      <div className="chat-composer-attach">
        {asRole === "merchant" && isDigital && (
          <>
            <button className="chat-icon-btn" title="بيانات حساب"><Icon name="key" size={18}/></button>
            <button className="chat-icon-btn" title="رابط"><Icon name="link" size={18}/></button>
          </>
        )}
        <button className="chat-icon-btn" title="ملف"><Icon name="paperclip" size={18}/></button>
        <button className="chat-icon-btn" title="صورة"><Icon name="image" size={18}/></button>
      </div>
      <div className="chat-composer-input">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSend(); }}
          placeholder={
            asRole === "merchant"
              ? (isDigital
                  ? "اكتب رسالة، أرسل بيانات الحساب، ملفاً أو رابطاً..."
                  : "اكتب رسالة لعميلك...")
              : "اكتب رسالة..."
          }/>
        <button className="chat-icon-btn" style={{width: 30, height: 30, color: "var(--dk-text-subtle)"}} title="إيموجي"><Icon name="smile" size={18}/></button>
      </div>
      <button className="chat-send" onClick={onSend} aria-label="إرسال">
        <Icon name="send" size={18} strokeWidth={2}/>
      </button>
    </div>
  );
}

function ChatContext({ thread }) {
  const isDigital = thread.type === "digital";
  return (
    <aside className="chat-context">
      <div>
        <h3>تفاصيل الطلب</h3>
        <div className="chat-context-row"><span>رقم الطلب</span><span className="v dk-num">{thread.orderId}</span></div>
        <div className="chat-context-row">
          <span>الحالة</span>
          <span className="v">
            <StatusBadge status={isDigital ? "chat-open" : "confirmed"}/>
          </span>
        </div>
        <div className="chat-context-row"><span>المبلغ</span><span className="v dk-num">{thread.amount.toLocaleString("en-US")} ر.ي</span></div>
        <div className="chat-context-row"><span>تاريخ الطلب</span><span className="v">20 مايو · 10:18</span></div>
      </div>

      {isDigital ? (
        <div>
          <h3>المنتج المطلوب</h3>
          <div className="chat-context-item">
            <div className="chat-context-thumb"/>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontFamily: "var(--dk-font-ar)", fontWeight: 700, fontSize: 13.5, color: "var(--dk-text)"}}>{thread.product}</div>
              <div style={{fontFamily: "var(--dk-font-ar)", fontSize: 12, color: "var(--dk-text-muted)"}}>منتج رقمي ⚡</div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3>عنوان التوصيل</h3>
          <div style={{display: "flex", gap: 10, alignItems: "flex-start", padding: 12, background: "var(--dk-primary-50)", borderRadius: 10}}>
            <div style={{width: 36, height: 36, borderRadius: 8, background: "var(--dk-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
              <Icon name="map" size={16}/>
            </div>
            <div style={{flex: 1, minWidth: 0, fontFamily: "var(--dk-font-ar)"}}>
              <div style={{fontWeight: 700, fontSize: 13.5, color: "var(--dk-text)"}}>{thread.customer}</div>
              <div style={{fontSize: 13, color: "var(--dk-text-muted)", marginTop: 2}}>{thread.city}</div>
              <div style={{fontSize: 12.5, color: "var(--dk-text-subtle)", marginTop: 2}}>شارع الستين · بجوار صيدلية الشفاء</div>
            </div>
          </div>
        </div>
      )}

      {isDigital ? (
        <div>
          <h3>وصل الدفع</h3>
          <div style={{padding: 12, background: "var(--dk-success-100)", color: "var(--dk-success-dark)", borderRadius: 10, fontFamily: "var(--dk-font-ar)", fontSize: 13, display: "flex", gap: 10, alignItems: "flex-start"}}>
            <Icon name="check-circle" size={16} style={{flex: "none", marginTop: 1}}/>
            <div>
              <strong style={{display: "block", marginBottom: 2}}>الوصل مؤكد ✓</strong>
              <span style={{color: "var(--dk-text-muted)"}}>تم استلام {thread.amount.toLocaleString("en-US")} ر.ي عبر محفظة Cherry</span>
            </div>
          </div>
          <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{marginTop: 10, width: "100%", justifyContent: "center"}}>
            <Icon name="eye" size={14}/>عرض الوصل
          </button>
        </div>
      ) : (
        <div>
          <h3>الشحنة</h3>
          <div style={{padding: 12, background: "var(--dk-bg)", borderRadius: 10, fontFamily: "var(--dk-font-ar)", fontSize: 13}}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 6}}>
              <span style={{color: "var(--dk-text-muted)"}}>الناقل</span>
              <span style={{fontWeight: 600}}>شركة الشحن الوطنية</span>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 6}}>
              <span style={{color: "var(--dk-text-muted)"}}>رقم التتبع</span>
              <span className="dk-num" style={{fontWeight: 600}}>YEM-7741-203</span>
            </div>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <span style={{color: "var(--dk-text-muted)"}}>الوصول المتوقع</span>
              <span style={{fontWeight: 600}}>خلال يومين</span>
            </div>
          </div>
          <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{marginTop: 10, width: "100%", justifyContent: "center"}}>
            <Icon name="truck" size={14}/>تتبع الشحنة
          </button>
        </div>
      )}

      <div>
        <h3>إجراءات سريعة</h3>
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
          {isDigital ? (
            <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{justifyContent: "flex-start"}}>
              <Icon name="check-circle" size={14}/>وضع علامة «تم التسليم»
            </button>
          ) : (
            <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{justifyContent: "flex-start"}}>
              <Icon name="truck" size={14}/>وضع علامة «تم الشحن»
            </button>
          )}
          <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{justifyContent: "flex-start"}}>
            <Icon name="package" size={14}/>صفحة الطلب الكاملة
          </button>
          <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{justifyContent: "flex-start"}}>
            <Icon name="phone" size={14}/>اتصل بالعميل
          </button>
          <button className="dk-btn dk-btn-secondary dk-btn-sm" style={{justifyContent: "flex-start", color: "var(--dk-danger)", borderColor: "var(--dk-danger)"}}>
            <Icon name="x" size={14}/>إغلاق المحادثة
          </button>
        </div>
      </div>
    </aside>
  );
}

window.ChatPage = ChatPage;
