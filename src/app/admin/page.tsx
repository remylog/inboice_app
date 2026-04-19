"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DocumentStatus, ExpenseDocument } from "@/types/document";

type FormState = {
  requesterName: string;
  title: string;
  paidAt: string;
  status: "未払い" | "支払い済み";
  notes: string;
  items: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
};

const defaultForm: FormState = {
  requesterName: "",
  title: "",
  paidAt: new Date().toISOString().slice(0, 10),
  status: "未払い",
  notes: "",
  items: [{ id: crypto.randomUUID(), name: "", amount: 0 }]
};

function formatRequesterName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  return /(様|さま)$/.test(trimmed) ? trimmed : `${trimmed}様`;
}

export default function AdminPage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<ExpenseDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [documents, setDocuments] = useState<ExpenseDocument[]>([]);
  const [listError, setListError] = useState("");
  const [listInfo, setListInfo] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const shareUrl = useMemo(() => {
    if (!created) {
      return "";
    }

    if (typeof window === "undefined") {
      return `/share?id=${created.shareKey}`;
    }

    return `${window.location.origin}/share?id=${created.shareKey}`;
  }, [created]);

  const totalAmount = form.items.reduce(
    (sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0),
    0
  );

  async function loadDocuments() {
    setListError("");
    setListInfo("");
    try {
      const response = await fetch("/api/documents", {
        cache: "no-store"
      });
      const payload = (await response.json()) as ExpenseDocument[] | { message: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(
          !Array.isArray(payload) && "message" in payload
            ? payload.message
            : "一覧の取得に失敗しました"
        );
      }

      setDocuments(payload);
    } catch (loadError) {
      setListError(
        loadError instanceof Error ? loadError.message : "一覧の取得に失敗しました"
      );
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  function updateItem(index: number, patch: Partial<FormState["items"][number]>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      )
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), name: "", amount: 0 }]
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  async function copyShareUrl() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("URLをコピーしました");
    } catch {
      setCopyMessage("コピーに失敗しました");
    }
  }

  async function updateStatus(id: string, status: DocumentStatus) {
    setUpdatingId(id);
    setListError("");
    setListInfo("");

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const payload = (await response.json()) as ExpenseDocument | { message: string };

      if (!response.ok) {
        throw new Error("message" in payload ? payload.message : "更新に失敗しました");
      }

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? (payload as ExpenseDocument) : doc))
      );
    } catch (updateError) {
      setListError(
        updateError instanceof Error ? updateError.message : "更新に失敗しました"
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function deleteDocument(id: string) {
    setDeletingId(id);
    setListError("");
    setListInfo("");

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { message?: string; ok?: boolean };

      if (!response.ok) {
        throw new Error(payload.message || "削除に失敗しました");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (deleteError) {
      setListError(
        deleteError instanceof Error ? deleteError.message : "削除に失敗しました"
      );
    } finally {
      setDeletingId("");
    }
  }

  async function copyRowShareUrl(document: ExpenseDocument) {
    setListError("");
    setListInfo("");

    const shareIdentifier = document.shareKey || document.id;
    const url = `${window.location.origin}/share?id=${shareIdentifier}`;

    try {
      await navigator.clipboard.writeText(url);
      setListInfo("共有リンクをコピーしました");
    } catch {
      setListError("共有リンクのコピーに失敗しました");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreated(null);
    setCopyMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "invoice",
          title: form.title.trim(),
          requesterName: form.requesterName.trim(),
          paidAt: form.paidAt,
          status: form.status,
          notes: form.notes.trim(),
          items: form.items
            .filter((item) => item.name.trim())
            .map((item) => ({
              name: item.name.trim(),
              amount: Number(item.amount)
            }))
        })
      });

      const payload = (await response.json()) as ExpenseDocument | { message: string };

      if (!response.ok) {
        throw new Error("message" in payload ? payload.message : "作成に失敗しました");
      }

      setCreated(payload as ExpenseDocument);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "不明なエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">ADMIN CONSOLE</p>
        <h1>請求作成</h1>
        <p className="subcopy">ご請求先と、複数の品名・金額を追加して保存できます。共有URLは推測しづらいキーで発行されます。</p>
        <form className="document-form" onSubmit={handleSubmit}>
          <label>
            ご請求先
            <input
              required
              value={form.requesterName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, requesterName: event.target.value }))
              }
              placeholder="例: 山田 花子"
            />
          </label>

          <label>
            支払日
            <input
              required
              type="date"
              value={form.paidAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, paidAt: event.target.value }))
              }
            />
          </label>

          <label>
            ステータス
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as "未払い" | "支払い済み"
                }))
              }
            >
              <option value="未払い">未払い</option>
              <option value="支払い済み">支払い済み</option>
            </select>
          </label>

          <div className="item-block">
            <div className="item-block-header">
              <span>品目</span>
              <button className="button ghost small-button" type="button" onClick={addItem}>
                追加
              </button>
            </div>
            <div className="item-list">
              {form.items.map((item, index) => (
                <div className="item-row" key={item.id}>
                  <input
                    required
                    value={item.name}
                    onChange={(event) => updateItem(index, { name: event.target.value })}
                    placeholder="例: ライブチケット"
                  />
                  <input
                    required
                    min={1}
                    type="number"
                    value={item.amount || ""}
                    onChange={(event) =>
                      updateItem(index, { amount: Number(event.target.value) })
                    }
                    placeholder="金額"
                  />
                  <button
                    className="button ghost small-button"
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
            <div className="item-total">
              <span>合計</span>
              <strong>{new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(totalAmount)}</strong>
            </div>
          </div>

          <label>
            備考
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="例: 週末までにお振込みください"
            />
          </label>

          <button className="button primary" disabled={loading} type="submit">
            {loading ? "生成中..." : "請求を作成"}
          </button>
        </form>

        {error ? <p className="message error">{error}</p> : null}

        {created ? (
          <div className="message success">
            <p>作成が完了しました。共有URL:</p>
            <div className="success-actions">
              <a href={shareUrl} target="_blank" rel="noreferrer">
                {shareUrl}
              </a>
              <button className="button ghost small-button" type="button" onClick={copyShareUrl}>
                URLをコピー
              </button>
            </div>
            {copyMessage ? <p>{copyMessage}</p> : null}
          </div>
        ) : null}

        <section className="panel-list">
          <div className="panel-list-header">
            <h2>作成済み請求書</h2>
            <button className="button ghost small-button" type="button" onClick={() => void loadDocuments()}>
              更新
            </button>
          </div>

          {listError ? <p className="message error">{listError}</p> : null}
          {listInfo ? <p className="message success">{listInfo}</p> : null}

          {documents.length === 0 ? (
            <p className="subcopy">まだ請求書はありません。</p>
          ) : (
            <div className="admin-list-wrap">
              <table className="admin-list-table">
                <thead>
                  <tr>
                    <th>ご請求先</th>
                    <th>合計金額</th>
                    <th>支払日</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{formatRequesterName(doc.requesterName)}</td>
                      <td>
                        {new Intl.NumberFormat("ja-JP", {
                          style: "currency",
                          currency: "JPY",
                          maximumFractionDigits: 0
                        }).format(doc.amount)}
                      </td>
                      <td>{doc.paidAt}</td>
                      <td className="status-cell">
                        <select
                          value={doc.status || "未払い"}
                          disabled={updatingId === doc.id || deletingId === doc.id}
                          onChange={(event) =>
                            void updateStatus(doc.id, event.target.value as DocumentStatus)
                          }
                        >
                          <option value="未払い">未払い</option>
                          <option value="支払い済み">支払い済み</option>
                        </select>
                      </td>
                      <td className="actions-cell">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="button ghost small-button"
                            disabled={deletingId === doc.id || updatingId === doc.id}
                            onClick={() => void copyRowShareUrl(doc)}
                          >
                            リンクコピー
                          </button>
                          <button
                            type="button"
                            className="button ghost small-button"
                            disabled={deletingId === doc.id || updatingId === doc.id}
                            onClick={() => void deleteDocument(doc.id)}
                          >
                            {deletingId === doc.id ? "削除中..." : "削除"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
