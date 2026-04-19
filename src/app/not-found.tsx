import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">SIGNAL LOST</p>
        <h1>書類が見つかりません</h1>
        <p className="lead">URLが間違っているか、対象データが削除されています。</p>
        <div className="cta-row">
          <Link className="button ghost" href="/admin">
            管理ページへ
          </Link>
        </div>
      </section>
    </main>
  );
}
