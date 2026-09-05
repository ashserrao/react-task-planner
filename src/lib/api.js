import { fromSheetRow, toSheetRow } from "./sheet-mapper";

export const API_URL =
  "https://script.google.com/macros/s/AKfycbwuOKteLqa-GoDowziP5mTQZqJdiFORp2FUw9Oy2SV9CUl0sbVqd6xc4SV2Rq4Qoic/exec";

async function apiGet(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`${API_URL}?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`API GET "${action}" failed: ${response.status}`);
  }
  return response.json();
}

async function apiPost(action, payload = {}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!response.ok) {
    throw new Error(`API POST "${action}" failed: ${response.status}`);
  }
  const result = await response.json();
  if (result?.result === "error") {
    throw new Error(result.message || `API POST "${action}" failed`);
  }
  return result;
}

export async function fetchTasks() {
  const rows = await apiGet("list");
  if (!Array.isArray(rows)) {
    throw new Error("Unexpected response shape from timeline sheet");
  }
  return rows.map(fromSheetRow);
}

export function createTaskRequest(task) {
  return apiPost("create", toSheetRow(task));
}

export function updateTaskRequest(id, updates = {}) {
  const row = toSheetRow(updates);
  const rowNumber = updates.rowNumber;
  const ticketId = updates.ticketId ?? updates["ticket id"];
  if (rowNumber === undefined || rowNumber === null) {
    return Promise.reject(
      new Error("Cannot update a task without its sheet rowNumber"),
    );
  }
  const payload = {
    ...row,
  };
  if (rowNumber !== undefined) payload.rowNumber = rowNumber;
  if (ticketId !== undefined) payload["ticket id"] = ticketId;
  return apiPost("update", payload);
}

export function deleteTaskRequest(id, task = {}) {
  const rowNumber = task.rowNumber;
  const ticketId = task.ticketId ?? task["ticket id"];
  if (rowNumber === undefined || rowNumber === null) {
    return Promise.reject(
      new Error("Cannot delete a task without its sheet rowNumber"),
    );
  }
  const payload = { rowNumber };
  if (ticketId !== undefined) payload["ticket id"] = ticketId;
  return apiPost("delete", payload);
}
