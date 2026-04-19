import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell landing-shell">
      <section className="panel hero-panel landing-hero">
        <div className="landing-grid">
          <div className="landing-copy">
            <p className="eyebrow">PROXY PURCHASE LOG</p>
            <h1>代理購入の請求を、すばやく整えて共有</h1>
            <p className="lead">
              公開ページでは個別の請求情報を表示せず、作成・共有・PDF保存までの導線だけをシンプルに提供します。
            </p>
            <div className="cta-row landing-cta-row">
              <Link className="button primary" href="/admin">
                管理ページへ進む
              </Link>
            </div>
            <ul className="landing-pills" aria-label="主要機能">
              <li>請求作成</li>
              <li>共有リンク発行</li>
              <li>PDFダウンロード</li>
            </ul>
          </div>

          <aside className="landing-mock" aria-label="サンプルプレビュー">
            <p className="landing-mock-kicker">SAMPLE PREVIEW</p>
            <div className="landing-mock-card">
              <div className="landing-mock-row">
                <span>ご請求先</span>
                <strong>サンプル様</strong>
              </div>
              <div className="landing-mock-row">
                <span>支払日</span>
                <strong>YYYY-MM-DD</strong>
              </div>
              <div className="landing-mock-row">
                <span>合計金額</span>
                <strong>¥00,000</strong>
              </div>
              <div className="landing-mock-badge">個別データは表示されません</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="landing-features" aria-label="特徴">
        <article className="landing-feature-card">
          <h2>最短で作成</h2>
          <p>入力項目をまとめて登録し、請求の形をすぐに整えられます。</p>
        </article>
        <article className="landing-feature-card">
          <h2>安全に共有</h2>
          <p>共有用URLで内容確認。公開ホームには請求データを出しません。</p>
        </article>
        <article className="landing-feature-card">
          <h2>そのまま保存</h2>
          <p>表示レイアウトを維持したまま、PDFとして手元に残せます。</p>
        </article>
      </section>
    </main>
  );
}
