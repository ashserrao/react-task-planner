import React from "react";
import { fromSheetRow, toSheetRow } from "./sheet-mapper";

export const API_URL =
  "https://script.google.com/macros/s/AKfycbzxrRvX7S2Jh6QOHeeTWaCzTiitdn9Y49CUcI4FZh9MJdnEC_VtF9k04jshmkRavUw/exec";

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
  return response.json();
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

export function updateTaskRequest(id, updates) {
  return apiPost("update", { rowNumber: id, ...toSheetRow(updates) });
}

export function deleteTaskRequest(id) {
  return apiPost("delete", { rowNumber: id });
}
