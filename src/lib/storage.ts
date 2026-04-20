import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  CreateExpenseDocumentInput,
  DocumentStatus,
  ExpenseDocument
} from "@/types/document";

const dataDirPath = path.join(process.cwd(), "data");
const documentsPath = path.join(dataDirPath, "documents.json");

async function ensureStorageReady() {
  await fs.mkdir(dataDirPath, { recursive: true });
  try {
    await fs.access(documentsPath);
  } catch {
    await fs.writeFile(documentsPath, "[]\n", "utf-8");
  }
}

async function readAllDocuments(): Promise<ExpenseDocument[]> {
  await ensureStorageReady();
  const raw = await fs.readFile(documentsPath, "utf-8");
  const docs = JSON.parse(raw) as ExpenseDocument[];
  return Array.isArray(docs) ? docs : [];
}

async function writeAllDocuments(documents: ExpenseDocument[]) {
  await fs.writeFile(
    documentsPath,
    `${JSON.stringify(documents, null, 2)}\n`,
    "utf-8"
  );
}

export async function createDocument(
  input: CreateExpenseDocumentInput
): Promise<ExpenseDocument> {
  const documents = await readAllDocuments();
  const shareKey = crypto.randomUUID().replaceAll("-", "");
  const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);

  const document: ExpenseDocument = {
    id: crypto.randomUUID(),
    shareKey,
    type: input.type,
    title: input.title || input.items[0]?.name || "支払記録",
    requesterName: input.requesterName,
    buyerName: input.buyerName,
    items: input.items,
    amount: totalAmount,
    dueDate: input.dueDate,
    paidDate: input.paidDate,
    status: input.status,
    transferInfo: input.transferInfo,
    notes: input.notes,
    createdAt: new Date().toISOString()
  };

  documents.unshift(document);
  await writeAllDocuments(documents);

  return document;
}

export async function findDocumentById(id: string): Promise<ExpenseDocument | null> {
  const documents = await readAllDocuments();
  return documents.find((doc) => doc.id === id) ?? null;
}

export async function findDocumentByShareKey(identifier: string): Promise<ExpenseDocument | null> {
  const documents = await readAllDocuments();
  return (
    documents.find((doc) => doc.shareKey === identifier) ??
    documents.find((doc) => doc.id === identifier) ??
    null
  );
}

export async function listDocuments(): Promise<ExpenseDocument[]> {
  return readAllDocuments();
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus
): Promise<ExpenseDocument | null> {
  const documents = await readAllDocuments();
  const target = documents.find((doc) => doc.id === id);

  if (!target) {
    return null;
  }

  target.status = status;
  await writeAllDocuments(documents);
  return target;
}

export async function updateDocumentPaidDate(
  id: string,
  paidDate: string
): Promise<ExpenseDocument | null> {
  const documents = await readAllDocuments();
  const target = documents.find((doc) => doc.id === id);

  if (!target) {
    return null;
  }

  target.paidDate = paidDate;
  await writeAllDocuments(documents);
  return target;
}

export async function deleteDocumentById(id: string): Promise<boolean> {
  const documents = await readAllDocuments();
  const filtered = documents.filter((doc) => doc.id !== id);

  if (filtered.length === documents.length) {
    return false;
  }

  await writeAllDocuments(filtered);
  return true;
}
