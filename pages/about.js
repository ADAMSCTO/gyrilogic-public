import Link from 'next/link';
import Image from 'next/image';

export default function About() {
  return (
    <>
      {/* HEADER-BLOCK-START */}
      <div style={{maxWidth:1100, margin:'24px auto 8px', padding:16, fontFamily:'Inter,system-ui,Arial,sans-serif'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <Image
            src="/gyrilogic-logo.png"
            alt="Gyrilogic logo"
            width={160}
            height={64}
            priority
            style={{ borderRadius: 8, height: 'auto', width: 'auto', maxWidth: '40vw' }}
          />
          <h1 style={{margin:0, color:'#0b1220'}}>Gyrilogic — Default Human Logic Layer (Public)</h1>
        </div>

        <div style={{display:'flex', gap:12, marginTop:8, marginBottom:12}}>
          {/* NAV-LINK-HOME-START */}
          <Link
            href="/"
            style={{
              padding:'6px 12px',
              borderRadius:8,
              border:'1px solid #334155',
              color:'#0b1220',
              background:'transparent',
              textDecoration:'none',
              cursor:'pointer'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            Home
          </Link>
          {/* NAV-LINK-HOME-END */}

          {/* NAV-LINK-ABOUT-START */}
          <Link
            href="/about"
            style={{
              padding:'6px 12px',
              borderRadius:8,
              border:'1px solid #334155',
              color:'#0b1220',
              background:'transparent',
              textDecoration:'none',
              cursor:'pointer'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            About
          </Link>
          {/* NAV-LINK-ABOUT-END */}
        </div>
      </div>
      {/* HEADER-BLOCK-END */}

      <div className="max-w-3xl mx-auto p-8 space-y-8 text-slate-800">
        <h1 className="text-3xl font-bold">About Gyrilogic</h1>

        <section>
          <h2 className="text-xl font-semibold mt-6">Vision Statement</h2>
          <p>
            Artificial Intelligence must not only compute — but comprehend.
            Gyrilogic, powered by the Default Human Logic Layer (DHLL), injects
            human instinct into AI systems. It brings emotional realism, scene
            coherence, and cultural meaning to every interaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">Our Name &amp; Logo</h2>
          <p>
            <strong>Brand:</strong> GYRILOGIC — inspired by the “brain folds” of human
            cognition. The logo reflects this identity: a visual mark of
            intelligence, memory, and culture, powered by the Default Human Logic
            Layer (DHLL). It reminds users that this app is not just about
            computation, but about applying human logic, empathy, and cultural
            awareness to every interaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">Purpose of the Application</h2>
          <p>
            Most AI tools feel flat — robotic, emotionless, or culturally tone-deaf.
            Gyrilogic solves this by quietly applying a human logic layer every time
            you enter text. It ensures outputs that are emotionally appropriate,
            culturally sensitive, physically realistic, and intuitively human.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">How It Works</h2>
          <p>
            Every time you enter a prompt, the DHLL engine enriches it with emotion,
            physics, culture, scene logic, time/weather cues, and built-in safeguards.
            You just type → Enhance → get output that feels right.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">Main Elements on the Homepage</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Logo &amp; Header – Gyrilogic branding.</li>
            <li>Input Box – Paste or type what you want to improve.</li>
            <li>Options Panel – Select Tone and Culture.</li>
            <li>Enhance Button – The action button that transforms your input.</li>
            <li>Output Box – Displays the improved result.</li>
            <li>Copy Tools – One-click buttons to copy the result.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">Options Explained</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Tone Selector</strong> – Adjusts style: professional, warm, poetic, casual.</li>
            <li><strong>Culture Selector</strong> – Aligns text with cultural norms (e.g., greetings, formality).</li>
            <li><strong>Policy Mode</strong> (when enabled) – Safety layer: Advisory or Enforce.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">How to Use the Homepage</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Type or paste your text into the Input Box. Example: “Write a wedding toast for my friend.”</li>
            <li>Choose Tone and Culture (or leave default).</li>
            <li>Click <em>Enhance</em> — your refined result appears in the Output Box.</li>
            <li>Copy and use your result.</li>
          </ol>
          <p className="mt-2">That’s it — one big box, one button, clear results.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Q: What’s the purpose of Gyrilogic?</p>
              <p>A: To make AI communication safe, clear, and human-aware. It helps your words resonate — whether for school, work, or family use.</p>
            </div>
            <div>
              <p className="font-semibold">Q: How is this different from grammar checkers?</p>
              <p>A: Grammarly fixes grammar. Gyrilogic adds empathy, cultural sensitivity, and scene realism so your message lands the way humans expect.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Can I use this without technical knowledge?</p>
              <p>A: Yes. Just type → Enhance. No coding required.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Is it safe for kids?</p>
              <p>A: Yes. Gyrilogic is designed with built-in safeguards that keep outputs safe and classroom-friendly, without requiring extra setup.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Will there be a mobile app?</p>
              <p>A: Yes. Gyrilogic will be installable as an app (PWA) and later available in iOS/Android stores.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Do I need to pay?</p>
              <p>A: Basic use is free. Premium tiers (coming soon) unlock unlimited runs, advanced tones, family accounts, and team features.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
