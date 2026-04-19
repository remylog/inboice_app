import { NextResponse } from "next/server";
import { createDocument, listDocuments } from "@/lib/storage";
import {
  CreateExpenseDocumentInput,
  DocumentStatus,
  DocumentType
} from "@/types/document";

function isDocumentType(value: string): value is DocumentType {
  return value === "invoice" || value === "receipt";
}

function isDocumentStatus(value: string): value is DocumentStatus {
  return value === "未払い" || value === "支払い済み";
}

export async function GET() {
  try {
    const documents = await listDocuments();
    return NextResponse.json(documents);
  } catch {
    return NextResponse.json(
      { message: "ドキュメント一覧の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateExpenseDocumentInput>;

    if (!body.type || !isDocumentType(body.type)) {
      return NextResponse.json({ message: "type が不正です" }, { status: 400 });
    }

    if (!body.requesterName || !body.paidAt || !body.status) {
      return NextResponse.json(
        { message: "requesterName/paidAt/status は必須です" },
        { status: 400 }
      );
    }

    if (!isDocumentStatus(body.status)) {
      return NextResponse.json(
        { message: "status が不正です" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: "items は 1 件以上必要です" },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (!item?.name || !Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0) {
        return NextResponse.json(
          { message: "各品目は名前と 0 より大きい金額が必要です" },
          { status: 400 }
        );
      }
    }

    const created = await createDocument({
      type: body.type,
      title: body.title,
      requesterName: body.requesterName,
      buyerName: body.buyerName,
      items: body.items.map((item) => ({
        name: item.name,
        amount: Number(item.amount)
      })),
      paidAt: body.paidAt,
      status: body.status,
      notes: body.notes?.trim() || undefined
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "ドキュメント作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
