import { notFound } from "next/navigation";
import { findDocumentByShareKey } from "@/lib/storage";
import PDFDownloadButton from "@/components/PDFDownloadButton";

export const dynamic = "force-dynamic";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

function toCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(value);
}

function normalizeStatus(status?: string) {
  if (status === "精算済") {
    return "支払い済み";
  }

  if (status === "未精算") {
    return "未払い";
  }

  return status || "未払い";
}

function formatRequesterName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  return /(様|さま)$/.test(trimmed) ? trimmed : `${trimmed}様`;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const document = await findDocumentByShareKey(id);

  if (!document) {
    notFound();
  }

  const items = document.items?.length
    ? document.items
    : [{ name: document.title, amount: document.amount }];
  const statusText = normalizeStatus(document.status);

  return (
    <main className="receipt-stage">
      <section className="receipt-card">
        <div id="receipt-content">
          <header className="receipt-header">
            <div>
              <p className="receipt-kicker">READ ONLY</p>
              <h1>Payment Log</h1>
            </div>
            <div className="receipt-status">{statusText}</div>
          </header>

          <div className="receipt-body">
            <div className="receipt-summary">
              <div className="receipt-row receipt-row-total">
                <span>合計金額</span>
                <strong>{toCurrency(document.amount)}</strong>
              </div>

              <div className="status-badge">{statusText}</div>
            </div>

            <div className="receipt-partner">
              <span>支払日</span>
              <strong>{document.paidAt}</strong>
            </div>

            <div className="receipt-partner">
              <span>ご請求先</span>
              <strong>{formatRequesterName(document.requesterName)}</strong>
            </div>

            <dl className="receipt-items">
              {items.map((item, index) => (
                <div className="receipt-line" key={`${item.name}-${index}`}>
                  <dt>項目 {index + 1}</dt>
                  <dd>
                    <span className="receipt-item-name">{item.name}</span>
                    <span className="receipt-item-leader" aria-hidden="true" />
                    <strong>{toCurrency(item.amount)}</strong>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="receipt-partner receipt-note">
              <span>備考</span>
              <strong>{document.notes?.trim() || "-"}</strong>
            </div>
          </div>
        </div>

        <div className="receipt-actions">
          <PDFDownloadButton
            targetId="receipt-content"
            createdAt={document.createdAt}
          />
        </div>
      </section>
    </main>
  );
}
