/* ---------------------------------------------------------------------
 * Dev Resources API — talks to the "Resource Sheet" Google Apps Script.
 *
 *   GET  API_URL                              -> all rows
 *   POST { ...fields }                        -> create
 *   POST { action: "update", resource_url, …} -> update row matching URL
 *   POST { action: "delete", resource_url }   -> delete row matching URL
 * ------------------------------------------------------------------- */

export const API_URL =
  "https://script.google.com/macros/s/AKfycbwpiIoQE77nRCv6AKTJqzfWRWEJj_HxcFd6Y8HCpbYbKksj6Ynub7_DFIV_YsVPj1g5/exec";

// The Apps Script returns { error: "..." } (with HTTP 200) when something goes wrong.
const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) throw new Error(fallbackMessage);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected response from the server.");
  }
  if (data && !Array.isArray(data) && data.error) throw new Error(data.error);
  return data;
};

// Apps Script can't answer CORS preflight requests, so writes are sent as
// text/plain (a "simple" request). The script reads the raw body as JSON
// regardless of the declared content type.
const post = async (body, fallbackMessage) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const data = await parseResponse(response, fallbackMessage);

  // update/delete answer { success: false } when no row matches the URL.
  if (data?.success === false)
    throw new Error(
      "That resource no longer exists in the sheet. Refresh and try again.",
    );
  return data;
};

/** GET: every row in the sheet (raw API shape). */
export const fetchResources = async ({ signal } = {}) => {
  const response = await fetch(API_URL, { signal });
  const data = await parseResponse(
    response,
    "Couldn't load resources. Please try again.",
  );
  if (!Array.isArray(data))
    throw new Error("Unexpected response from the server.");
  return data;
};

/** CREATE: `fields` uses sheet column names; resource_url is required. */
export const createResource = (fields) =>
  post(fields, "Couldn't add the resource. Please try again.");

/**
 * UPDATE: finds the row by its current URL. Pass `new_resource_url` in
 * `fields` to change the URL itself; only the fields sent are changed.
 */
export const updateResource = (currentUrl, fields) =>
  post(
    { ...fields, action: "update", resource_url: currentUrl },
    "Couldn't save your changes. Please try again.",
  );

/** DELETE: removes the row whose resource_url matches `url`. */
export const deleteResource = (url) =>
  post(
    { action: "delete", resource_url: url },
    "Couldn't delete the resource. Please try again.",
  );
