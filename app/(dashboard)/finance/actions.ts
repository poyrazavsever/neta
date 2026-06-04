"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const TRANSACTION_TYPES = ["income", "expense"] as const;
const PAYMENT_STATUSES = ["planned", "pending", "paid", "cancelled"] as const;

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 && text !== "__none" ? text : null;
}

function readType(value: FormDataEntryValue | null) {
  const type = typeof value === "string" ? value : "expense";
  return TRANSACTION_TYPES.includes(type as (typeof TRANSACTION_TYPES)[number])
    ? type
    : "expense";
}

function readPaymentStatus(value: FormDataEntryValue | null) {
  const status = typeof value === "string" ? value : "planned";
  return PAYMENT_STATUSES.includes(status as (typeof PAYMENT_STATUSES)[number])
    ? status
    : "planned";
}

function readAmount(value: FormDataEntryValue | null) {
  const amount = Number(typeof value === "string" ? value.replace(",", ".") : value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Finans işlemi için giriş yapmış kullanıcı bulunamadı.");
  }

  return { supabase, userId: user.id };
}

function readPayload(formData: FormData) {
  return {
    type: readType(formData.get("type")),
    amount: readAmount(formData.get("amount")),
    currency: cleanText(formData.get("currency")) || "USD",
    transaction_date: cleanText(formData.get("transaction_date")) || new Date().toISOString().slice(0, 10),
    category: cleanText(formData.get("category")),
    payment_status: readPaymentStatus(formData.get("payment_status")),
    client_id: cleanText(formData.get("client_id")),
    project_id: cleanText(formData.get("project_id")),
    description: cleanText(formData.get("description")),
  };
}

export async function createFinanceTransactionRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const payload = readPayload(formData);

  if (payload.amount === null) {
    throw new Error("Tutar zorunludur.");
  }

  const { error } = await supabase.from("finance_transactions").insert({
    user_id: userId,
    ...payload,
  });

  if (error) {
    throw new Error(`Finans işlemi eklenemedi: ${error.message}`);
  }

  revalidatePath("/finance");
}

export async function updateFinanceTransactionRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const payload = readPayload(formData);

  if (!id || payload.amount === null) {
    throw new Error("Finans işlemini güncellemek için kayıt kimliği ve tutar zorunludur.");
  }

  const { error } = await supabase
    .from("finance_transactions")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Finans işlemi güncellenemedi: ${error.message}`);
  }

  revalidatePath("/finance");
}

export async function deleteFinanceTransactionRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Silinecek finans işlemi bulunamadı.");
  }

  const { error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Finans işlemi silinemedi: ${error.message}`);
  }

  revalidatePath("/finance");
}
