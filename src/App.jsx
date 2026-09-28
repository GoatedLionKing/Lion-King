import './App.css'

function App() {
  return (
    <div className="site">
      <header className="hero">
        <nav>
          <div className="logo">GOATED_LIONKING</div>
          <a href="#projects">المشاريع</a>
        </nav>

        <div className="hero-content">
          <p className="tag">ARABIC LOCALIZATION PROJECTS</p>
          <h1>مشاريع عربية<br />للألعاب</h1>
          <p>
            ترجمات ودبلجات عربية لمشاريع الألعاب، مع الحفاظ على تجربة
            اللعبة وأسلوبها الأصلي.
          </p>
          <a className="button" href="#projects">استكشف المشاريع</a>
        </div>
      </header>

      <main id="projects">
        <section className="section">
          <p className="tag">OUR PROJECTS</p>
          <h2>المشاريع</h2>

          <div className="projects">
            <article className="card">
              <div className="card-image gta">GTA</div>
              <div className="card-content">
                <span>ANDROID</span>
                <h3>GTA: San Andreas</h3>
                <p>النسخة العربية المدبلجة والمُعاد تعريبها.</p>
                <a
                  className="download"
                  href="https://www.mediafire.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  تحميل المشروع ↗
                </a>
              </div>
            </article>

            <article className="card">
              <div className="card-image gow">GOW</div>
              <div className="card-content">
                <span>PSP</span>
                <h3>God of War</h3>
                <p>مشروع التعريب العربي لسلسلة God of War.</p>
                <a
                  className="download"
                  href="https://www.mediafire.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  تحميل المشروع ↗
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <strong>GOATED_LIONKING</strong>
        <p>© 2026 Goated_LionKing — Remaster & Arabic Dubbing.</p>
        <p>Fan-made project. All rights reserved to their respective owners.</p>
      </footer>
    </div>
  )
}

export default App
