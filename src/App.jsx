// Welfare chatbot prototype — researcher setup + chat screens.
// Mobile-optimized for elderly users (large type, big touch targets).

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────
const T = {
  primary: '#1B5FB4',        // public-service blue
  primaryDark: '#143F7A',
  primarySoft: '#E8F0FB',
  ink: '#1A1F2B',
  inkMuted: '#5A6477',
  inkSoft: '#8993A4',
  border: '#E2E6EC',
  bg: '#F5F7FA',
  botBubble: '#EEF1F5',
  white: '#FFFFFF',
  hint: '#F4F7FB',
  hintBorder: '#CFDCEC',
  shadow: '0 1px 3px rgba(15,30,60,0.06), 0 4px 14px rgba(15,30,60,0.05)',
};

const FONT = "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif";

// ─────────────────────────────────────────────────────────────
// Setup screen — researcher picks condition + scenario
// ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart, mobile }) {
  const conditions = [1, 2, 3];
  const scenarios = [
    { id: 's1', label: '시나리오 1', sub: '기초연금' },
    { id: 's2', label: '시나리오 2', sub: '노인 일자리' },
    { id: 's3', label: '시나리오 3', sub: '전입신고' },
  ];

  const condDescs = {
    1: '정보만 제공',
    2: '의도 반영 + 정보',
    3: '공감 + 의도 반영 + 정보',
  };

  const topPad = mobile ? 'max(env(safe-area-inset-top, 44px), 44px)' : '58px';
  const botPad = mobile ? 'max(env(safe-area-inset-bottom, 16px), 16px)' : '40px';

  return (
    <div style={{
      width: '100%', height: '100%', background: T.white,
      display: 'flex', flexDirection: 'column',
      padding: `${topPad} 20px ${botPad}`, boxSizing: 'border-box',
      fontFamily: FONT, color: T.ink,
      overflow: 'hidden',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 2,
        color: T.inkSoft, textTransform: 'uppercase',
      }}>Researcher Setup</div>
      <div style={{
        fontSize: 22, fontWeight: 700, lineHeight: 1.3,
        marginTop: 6, color: T.ink,
      }}>실험 조건을 선택하세요</div>
      <div style={{
        fontSize: 12, color: T.inkMuted, marginTop: 6, lineHeight: 1.5,
      }}>버튼을 누르면 즉시 채팅 화면으로 전환됩니다.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18, flex: 1, justifyContent: 'center' }}>
        {conditions.map(c => (
          <div key={c}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6,
              paddingBottom: 5, borderBottom: `1px solid ${T.border}`,
            }}>
              <span style={{
                fontSize: 15, fontWeight: 700, color: T.primaryDark,
              }}>조건 {c}</span>
              <span style={{ fontSize: 11, color: T.inkMuted }}>{condDescs[c]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {scenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => onStart(c, s.id)}
                  style={{
                    minHeight: 64,
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: `1.5px solid ${T.border}`,
                    background: T.white,
                    color: T.ink,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    fontFamily: FONT,
                    boxShadow: T.shadow,
                    transition: 'all .15s ease',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.primary, letterSpacing: 0.5 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginTop: 4 }}>
                    {s.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        paddingTop: 12,
        fontSize: 11, color: T.inkSoft, textAlign: 'center',
      }}>v1.0 · 피험자는 뒤로가기 불가 · 연구자 종료 버튼은 채팅 우상단</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{
      display: 'inline-flex', gap: 5, padding: '14px 18px',
      background: T.botBubble, borderRadius: '4px 18px 18px 18px',
      alignItems: 'center',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: T.inkSoft,
          animation: `bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
        }}/>
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bot avatar (small mark, original — not branded)
// ─────────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: -0.5,
      boxShadow: '0 2px 6px rgba(27,95,180,0.25)',
    }}>안내</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.from === 'user';
  if (isUser) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'flex-end', padding: '4px 0',
      }}>
        <div style={{
          maxWidth: '78%', padding: '14px 18px',
          background: T.primary, color: '#fff',
          borderRadius: '20px 4px 20px 20px',
          fontSize: 18, lineHeight: 1.55,
          wordBreak: 'keep-all',
          whiteSpace: 'pre-line',
          boxShadow: '0 1px 2px rgba(27,95,180,0.18)',
        }}>{msg.text}</div>
      </div>
    );
  }
  // bot message — may have multiple parts (reflect / fact)
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '6px 0',
    }}>
      {msg.showAvatar ? <BotAvatar/> : <div style={{ width: 36, flexShrink: 0 }}/>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '82%' }}>
        {msg.parts.map((p, i) => (
          <div key={i} style={{
            padding: '14px 18px',
            background: p.kind === 'reflect' ? T.primarySoft : T.botBubble,
            color: T.ink,
            borderRadius: i === 0 ? '4px 18px 18px 18px' : '18px 18px 18px 18px',
            fontSize: 18, lineHeight: 1.6,
            wordBreak: 'keep-all',
            whiteSpace: 'pre-line',
            border: p.kind === 'reflect' ? `1px solid ${T.hintBorder}` : 'none',
          }}>{p.text}</div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chat screen
// ─────────────────────────────────────────────────────────────
function ChatScreen({ condition, scenario, onExit, mobile }) {
  const { SCENARIOS, buildResponse, FALLBACK } = window.WELFARE_DATA;
  const meta = SCENARIOS[scenario];

  const [messages, setMessages] = useState(() => ([
    { from: 'bot', parts: [{ kind: 'fact', text: '안녕하세요. 복지 서비스에 대해 궁금한 점을 질문해 주세요.' }], showAvatar: true },
  ]));
  const [input, setInput] = useState('');
  const [turn, setTurn] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    const userMsg = { from: 'user', text };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    setTimeout(() => {
      let parts;
      if (turn < 3) {
        parts = buildResponse(condition, scenario, turn);
      } else {
        parts = [{ kind: 'fact', text: FALLBACK }];
      }
      // determine if previous message was from bot (no avatar on consecutive)
      setMessages(m => {
        const prev = m[m.length - 1];
        return [...m, { from: 'bot', parts, showAvatar: !prev || prev.from !== 'bot' }];
      });
      setTurn(t => t + 1);
      setTyping(false);
    }, 800);
  };

  const fillHint = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  // Hint text for current turn (0,1,2). After turn 3, no hints.
  const currentHints = useMemo(() => {
    if (turn > 2) return [];
    return [meta.hints[turn]];
  }, [turn, meta]);

  // Show all 3 hints initially (turn 0). After each turn, show only the next one.
  const hintsToShow = turn === 0 ? meta.hints : (turn <= 2 ? [meta.hints[turn]] : []);

  return (
    <div style={{
      width: '100%', height: '100%', background: T.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, color: T.ink, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
        color: '#fff',
        padding: mobile ? 'max(env(safe-area-inset-top, 50px), 50px) 16px 14px' : '50px 16px 14px',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(20,63,122,0.18)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 700, letterSpacing: -1,
          }}>안내</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>복지 안내 챗봇</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: '#5DE38C',
                boxShadow: '0 0 0 2px rgba(93,227,140,0.25)',
              }}/>
              상담 가능
            </div>
          </div>
        </div>
        {/* Researcher-only exit button (small, top-right) */}
        <button
          onClick={() => {
            if (confirm('실험 세션을 종료하고 세팅 화면으로 돌아갈까요?')) onExit();
          }}
          title="연구자용 종료"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, padding: 0,
          }}
          aria-label="연구자용 종료"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M3 3l10 10M13 3L3 13" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        padding: '14px 14px 6px',
        display: 'flex', flexDirection: 'column', gap: 2,
        minHeight: 0,
      }}>
        <div style={{
          alignSelf: 'center',
          fontSize: 12, color: T.inkSoft,
          background: 'rgba(255,255,255,0.6)',
          padding: '4px 12px', borderRadius: 999, marginBottom: 8,
        }}>오늘</div>

        {messages.map((m, i) => <Message key={i} msg={m}/>)}

        {typing && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
            <div style={{ width: 36, flexShrink: 0 }}/>
            <TypingDots/>
          </div>
        )}
      </div>

      {/* Hints removed — chat composer is the only input affordance */}

      {/* Composer */}
      <div style={{
        padding: mobile ? '10px 14px max(env(safe-area-inset-bottom, 16px), 16px)' : '10px 14px 36px',
        background: T.white,
        borderTop: `1px solid ${T.border}`,
        display: 'flex', gap: 10, alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1,
          background: T.bg,
          borderRadius: 24,
          border: `1.5px solid ${T.border}`,
          display: 'flex',
          minHeight: 52,
          alignItems: 'center',
          padding: '4px 16px',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="궁금한 내용을 입력하세요"
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', fontSize: 17, fontFamily: FONT,
              color: T.ink, lineHeight: 1.4, padding: '12px 0',
              maxHeight: 100,
            }}
          />
        </div>
        <button
          onClick={send}
          disabled={!input.trim() || typing}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none',
            background: (!input.trim() || typing) ? T.inkSoft : T.primary,
            color: '#fff', cursor: (!input.trim() || typing) ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background .15s',
            boxShadow: (!input.trim() || typing) ? 'none' : '0 2px 8px rgba(27,95,180,0.3)',
          }}
          aria-label="전송"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12l18-8-8 18-2-8-8-2z" fill="#fff"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(null);
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 500;
  const rootRef = useRef(null);

  // iOS Safari: when keyboard opens, it scrolls the visual viewport (offsetTop > 0)
  // and shrinks its height. We counteract both by setting height = vv.height
  // and transform = translateY(vv.offsetTop), so the UI stays exactly in the
  // visible area without anything jumping.
  useEffect(() => {
    if (!mobile) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const el = rootRef.current;
      if (!el) return;
      el.style.height = vv.height + 'px';
      el.style.transform = `translateY(${vv.offsetTop}px)`;
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [mobile]);

  if (mobile) {
    return (
      <>
        <style>{`
          html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; overscroll-behavior: none; }
        `}</style>
        <div ref={rootRef} style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: '100dvh',
          display: 'flex', flexDirection: 'column',
          fontFamily: FONT, overflow: 'hidden',
          background: T.bg,
        }}>
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }} data-screen-label={session ? '02 Chat' : '01 Setup'}>
            {session
              ? <ChatScreen condition={session.condition} scenario={session.scenario} onExit={() => setSession(null)} mobile/>
              : <SetupScreen onStart={(c, s) => setSession({ condition: c, scenario: s })} mobile/>
            }
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0E1420',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: FONT,
    }}>
      <IOSDevice width={393} height={852}>
        <div style={{ width: '100%', height: '100%' }} data-screen-label={session ? '02 Chat' : '01 Setup'}>
          {session
            ? <ChatScreen condition={session.condition} scenario={session.scenario} onExit={() => setSession(null)}/>
            : <SetupScreen onStart={(c, s) => setSession({ condition: c, scenario: s })}/>
          }
        </div>
      </IOSDevice>
    </div>
  );
}

window.App = App;
