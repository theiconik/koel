/* Global babel'd components for the Koel marketing kit.
   Attach everything to window at the end so other <script type="text/babel"> files can pick them up. */

function KoelWordmark({ size = 22, color = "#1A1A2E" }) {
  return <span style={{ fontFamily: "'Absans', serif", fontSize: size, letterSpacing: "-0.02em", color, textTransform: "lowercase", fontWeight: 400 }}>koel</span>;
}

function KoelLogo({ width = 44, invert = false }) {
  // Square 698×598 mark — render directly.
  return (
    <img src="../../assets/koel-logo.svg" alt="koel"
         width={width} height={width}
         style={{ display: "block", flexShrink: 0, filter: invert ? "invert(1)" : "none" }}/>
  );
}

function Button({ variant = "primary", children, onClick, style }) {
  const base = {
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 10,
    padding: "12px 20px",
    border: "none",
    cursor: "pointer",
    transition: "all 180ms cubic-bezier(0.22,1,0.36,1)",
    lineHeight: 1,
  };
  const variants = {
    primary:   { background: "#E8B04B", color: "#1A1A2E" },
    midnight:  { background: "#1A1A2E", color: "#FAF7F2" },
    outline:   { background: "transparent", color: "#1A1A2E", border: "1px solid #1A1A2E", padding: "11px 19px" },
    ghost:     { background: "transparent", color: "#1A1A2E", padding: "12px 14px" },
    invert:    { background: "#FAF7F2", color: "#1A1A2E" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function Nav({ onStart }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 10,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 48px",
      background: "rgba(250,247,242,0.82)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(26,26,46,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="../../assets/koel-logo.svg" alt="" style={{ height: 28, width: "auto", display: "block" }}/>
          <KoelWordmark size={28} />
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#4A4538" }}>
          <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>product</a>
          <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>pricing</a>
          <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>about</a>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button variant="ghost">sign in</Button>
        <Button variant="midnight" onClick={onStart}>start listening</Button>
      </div>
    </nav>
  );
}

function Eyebrow({ children, color = "#6F685B" }) {
  return <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color, fontWeight: 600 }}>{children}</div>;
}

function Hero({ onStart }) {
  return (
    <section style={{ padding: "96px 48px 120px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <Eyebrow>AI voice surveys</Eyebrow>
          <h1 style={{
            fontFamily: "'Absans',serif", fontSize: "clamp(44px,5.4vw,76px)",
            lineHeight: 1.04, letterSpacing: "-0.02em", color: "#1A1A2E",
            marginTop: 20, marginBottom: 0
          }}>
            listen to what people<br/>actually mean.
          </h1>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, lineHeight: 1.65, color: "#4A4538", marginTop: 20, maxWidth: 520 }}>
            koel turns your survey into a two-minute conversation. respondents speak, we transcribe the pauses and the afterthoughts — you get the answer behind the answer.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 36, alignItems: "center" }}>
            <Button variant="primary" onClick={onStart}>start your first survey</Button>
            <Button variant="ghost">hear a sample →</Button>
          </div>
          <div style={{ marginTop: 28, fontSize: 13, color: "#6F685B" }}>no credit card · takes about 6 minutes to set up</div>
        </div>
        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div style={{ background: "#1A1A2E", borderRadius: 20, padding: 28, color: "#FAF7F2", boxShadow: "0 20px 48px rgba(26,26,46,0.14)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8B04B", fontWeight: 600 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8B04B" }}/> LIVE · maya r.
      </div>
      <div style={{ fontFamily: "'Absans',serif", fontSize: 26, lineHeight: 1.2, marginTop: 14, color: "#FAF7F2" }}>
        &ldquo;honestly? the pricing page confused me more than the product did.&rdquo;
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32, marginTop: 22 }}>
        {[40,70,55,90,60,100,75,45,85,50,65,95,40,80,55,70,50,35,60,40].map((h,i)=>(
          <div key={i} style={{ width: 3, height: `${h}%`, background: "#E8B04B", borderRadius: 2, opacity: i < 15 ? 1 : 0.4 }}/>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, fontSize: 12, color: "rgba(250,247,242,0.55)" }}>
        <span>01:42 / 03:08</span>
        <span>auto-transcribing</span>
      </div>
    </div>
  );
}

function LogoStrip() {
  const names = ["notion", "linear", "vercel", "retool", "plaid", "figma", "stripe", "framer", "raycast"];
  // Duplicate the track so the translateX(-50%) loop is seamless.
  const track = [...names, ...names];
  return (
    <section style={{ padding: "36px 0", borderTop: "1px solid rgba(26,26,46,0.08)", borderBottom: "1px solid rgba(26,26,46,0.08)", background: "#F2EEE6", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ fontSize: 13, color: "#6F685B", flexShrink: 0, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>trusted by</div>
        <div style={{ position: "relative", flex: 1, overflow: "hidden", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
          <div style={{ display: "flex", gap: 56, animation: "koel-marquee 32s linear infinite", width: "max-content" }}>
            {track.map((n, i) => <div key={i} style={{ fontFamily: "'Absans',serif", fontSize: 24, color: "#4A4538", letterSpacing: "-0.02em", flexShrink: 0 }}>{n}</div>)}
          </div>
        </div>
      </div>
      <style>{`@keyframes koel-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "write the questions", d: "plain english. the way you'd ask a friend. koel handles follow-ups." },
    { n: "02", t: "send a link", d: "respondents open it on any device. no app, no signup. just a microphone permission." },
    { n: "03", t: "read between the lines", d: "every pause, every \"wait, actually —\" is preserved. summaries link back to the exact moment." },
  ];
  return (
    <section style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <Eyebrow>how it works</Eyebrow>
      <h2 style={{ fontFamily: "'Absans',serif", fontSize: "clamp(36px,4.4vw,56px)", lineHeight: 1.1, letterSpacing: "-0.015em", color: "#1A1A2E", marginTop: 16, maxWidth: 720 }}>
        a survey that sounds like a conversation, because it is one.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginTop: 64 }}>
        {steps.map(s => (
          <div key={s.n}>
            <div style={{ fontFamily: "'Absans',serif", fontSize: 44, color: "#E8B04B", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 600, color: "#1A1A2E", marginTop: 20 }}>{s.t}</div>
            <div style={{ fontSize: 15, color: "#4A4538", marginTop: 10, lineHeight: 1.65 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section style={{ background: "#1A1A2E", padding: "120px 48px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "left" }}>
        <Eyebrow color="#E8B04B">word of mouth</Eyebrow>
        <div style={{ fontFamily: "'Absans',serif", fontSize: "clamp(32px,3.6vw,48px)", lineHeight: 1.2, letterSpacing: "-0.01em", color: "#FAF7F2", marginTop: 20, textWrap: "pretty" }}>
          &ldquo;we ran one koel survey and learned more in a week than six months of typeform data. the quotes alone rewrote our onboarding.&rdquo;
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#E8E2D5" }}/>
          <div>
            <div style={{ color: "#FAF7F2", fontWeight: 600, fontSize: 15 }}>priya menon</div>
            <div style={{ color: "rgba(250,247,242,0.55)", fontSize: 13 }}>head of research · roshi</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingRow({ name, price, note, features, highlight }) {
  return (
    <div style={{
      background: highlight ? "#1A1A2E" : "#fff",
      color: highlight ? "#FAF7F2" : "#1A1A2E",
      border: highlight ? "1px solid #1A1A2E" : "1px solid rgba(26,26,46,0.10)",
      borderRadius: 16, padding: 28,
      boxShadow: highlight ? "0 20px 48px rgba(26,26,46,0.14)" : "0 2px 8px rgba(26,26,46,0.06)",
    }}>
      <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: highlight ? "#E8B04B" : "#6F685B" }}>{name}</div>
      <div style={{ fontFamily: "'Absans',serif", fontSize: 48, letterSpacing: "-0.02em", marginTop: 14, lineHeight: 1 }}>{price}</div>
      <div style={{ fontSize: 13, color: highlight ? "rgba(250,247,242,0.6)" : "#6F685B", marginTop: 6 }}>{note}</div>
      <div style={{ height: 1, background: highlight ? "rgba(250,247,242,0.15)" : "rgba(26,26,46,0.08)", margin: "20px 0" }}/>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map(f => <li key={f} style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: highlight ? "#E8B04B" : "#4A7C59", marginTop: 2 }}>—</span> {f}
        </li>)}
      </ul>
      <div style={{ marginTop: 24 }}>
        <Button variant={highlight ? "primary" : "outline"} style={{ width: "100%" }}>
          {highlight ? "start listening" : "choose"}
        </Button>
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <section style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <Eyebrow>pricing</Eyebrow>
      <h2 style={{ fontFamily: "'Absans',serif", fontSize: "clamp(36px,4.4vw,56px)", lineHeight: 1.1, letterSpacing: "-0.015em", color: "#1A1A2E", marginTop: 16, maxWidth: 720 }}>
        priced per voice, not per seat.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 56 }}>
        <PricingRow name="nest" price="free" note="for exploring the shape of it" features={["up to 25 respondents","one active survey","auto-transcripts","7-day history"]}/>
        <PricingRow name="flock" price="$79" note="/ month · for small teams" features={["500 respondents / mo","unlimited surveys","themes and auto-tagging","share + export","slack + linear"]} highlight/>
        <PricingRow name="migration" price="let's talk" note="for scale + compliance" features={["unlimited respondents","soc 2 + hipaa","sso + scim","dedicated success","multi-language"]}/>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#FAF7F2", borderTop: "1px solid rgba(26,26,46,0.08)", padding: "56px 48px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="../../assets/koel-logo.svg" alt="" style={{ height: 36, width: "auto", display: "block" }}/>
            <KoelWordmark size={34} />
          </div>
          <div style={{ fontSize: 13, color: "#6F685B", marginTop: 14, maxWidth: 280, lineHeight: 1.6 }}>
            listen closely. built in bangalore + brooklyn.
          </div>
        </div>
        {[
          { h: "product", l: ["features","pricing","changelog","status"] },
          { h: "company", l: ["about","careers","press","contact"] },
        ].map(col => (
          <div key={col.h}>
            <Eyebrow>{col.h}</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14, fontSize: 14, color: "#4A4538" }}>
              {col.l.map(x => <a key={x} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>{x}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1200, margin: "56px auto 0", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F685B", paddingTop: 20, borderTop: "1px solid rgba(26,26,46,0.08)" }}>
        <div>© 2025 koel, inc.</div>
        <div style={{ display: "flex", gap: 20 }}><span>privacy</span><span>terms</span><span>security</span></div>
      </div>
    </footer>
  );
}

Object.assign(window, { KoelWordmark, KoelLogo, Button, Nav, Eyebrow, Hero, HeroCard, LogoStrip, HowItWorks, Quote, PricingRow, Pricing, Footer });
