import { NextResponse } from "next/server";
import {
  deleteDocumentById,
  findDocumentById,
  updateDocumentStatus
} from "@/lib/storage";
import { DocumentStatus } from "@/types/document";

function isDocumentStatus(value: string): value is DocumentStatus {
  return value === "未払い" || value === "支払い済み";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const document = await findDocumentById(id);

  if (!document) {
    return NextResponse.json({ message: "ドキュメントが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: string };

    if (!body.status || !isDocumentStatus(body.status)) {
      return NextResponse.json(
        { message: "status が不正です" },
        { status: 400 }
      );
    }

    const updated = await updateDocumentStatus(id, body.status);

    if (!updated) {
      return NextResponse.json(
        { message: "ドキュメントが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "ステータス更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const deleted = await deleteDocumentById(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "ドキュメントが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "ドキュメント削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
