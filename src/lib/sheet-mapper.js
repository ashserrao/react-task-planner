import { format } from "date-fns";

function capitalize(value) {
  if (!value) return "";
  const str = String(value).trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function isValidDateValue(value) {
  return value && !isNaN(new Date(value).getTime());
}

function isNumeric(value) {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    !isNaN(Number(value))
  );
}

export function fromSheetRow(row) {
  if (!row || typeof row !== "object") return null;

  // Older rows were saved without the ticket-id column, shifting values left.
  const isShiftedLegacyRow =
    !isNumeric(row["ticket id"]) &&
    !row["Task title"] &&
    isValidDateValue(row["Task description"]) &&
    isNumeric(row["task date time"]);

  // Legacy rows have no "ticket id" value in column A, so every value read
  // out of the sheet is actually one column to the RIGHT of where it
  // belongs (e.g. what's in row["ticket id"] is really the task title).
  // Shift everything back into its correct field here.
  // Confirmed against real legacy rows: the shift is NOT a uniform
  // 1-column offset all the way across. "ticket id" and "ticket type"
  // were both added later, at different times, so the offset increases
  // partway through the row:
  //   ticket id -> Task title -> Task description -> task date time
  //   -> task duration -> task priority -> task category -> task status
  //   (ticket type column holds what should be log time)
  //   -> user name -> user type
  // The values that would land in "user type" and "log time" columns
  // never existed in the legacy schema, so they're dropped.
  const source = isShiftedLegacyRow
    ? {
        "ticket id": undefined,
        "Task title": row["ticket id"],
        "Task description": row["Task title"],
        "task date time": row["Task description"],
        "task duration": row["task date time"],
        "task priority": row["task duration"],
        "task category": row["task priority"],
        "task status": row["task category"],
        "log time": row["ticket type"],
        "user name": row["task status"],
        "user type": row["user name"],
        "ticket type": "task",
      }
    : row;

  const rawDateTime =
    source["task date time"] || source.taskDateTime || source.dateTime;
  const dt = rawDateTime ? new Date(rawDateTime) : new Date();
  const isValidDate = !isNaN(dt.getTime());

  const ticketIdCandidate =
    source["ticket id"] ?? source["ticket_id"] ?? source.ticketId;
  const ticketId = isNumeric(ticketIdCandidate)
    ? Number(ticketIdCandidate)
    : undefined;
  const rowNumber = row.rowNumber ?? row["rowNumber"];
  const id =
    ticketId !== undefined && ticketId !== null && ticketId !== ""
      ? ticketId
      : isShiftedLegacyRow
        ? `legacy-${rowNumber}`
        : (rowNumber ?? crypto.randomUUID());

  return {
    id,
    ticketId:
      ticketId !== undefined && ticketId !== null && ticketId !== ""
        ? ticketId
        : undefined,
    rowNumber,
    ticketType: (source["ticket type"] || source["ticketType"] || "task")
      .toString()
      .trim()
      .toLowerCase(),
    userName: (source["user name"] || source["userName"] || "")
      .toString()
      .trim(),
    userType: (source["user type"] || source["userType"] || "")
      .toString()
      .trim(),
    logTime: (source["log time"] || source["logTime"] || "").toString().trim(),
    date: isValidDate
      ? format(dt, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    startHour: isValidDate ? dt.getHours() : 0,
    name: (
      source["Task title"] ||
      source["task title"] ||
      source.name ||
      source.title ||
      "Untitled task"
    )
      .toString()
      .trim(),
    description: (
      source["Task description"] ||
      source["task description"] ||
      source.description ||
      ""
    )
      .toString()
      .trim(),
    duration: Math.max(
      1,
      Number(source["task duration"] ?? source.duration) || 1,
    ),
    priority: (source["task priority"] || source.priority || "medium")
      .toString()
      .trim()
      .toLowerCase(),
    category: (source["task category"] || source.category || "other")
      .toString()
      .trim()
      .toLowerCase(),
    status: (source["task status"] || source.status || "pending")
      .toString()
      .trim()
      .toLowerCase(),
    notes: (
      source["notes"] ||
      source["Task description"] ||
      source.description ||
      ""
    )
      .toString()
      .trim(),
  };
}

export function toSheetRow(task) {
  if (!task || typeof task !== "object") return {};

  let dt;
  if (task.date) {
    const [year, month, day] = String(task.date).split("-").map(Number);
    dt = new Date(
      year,
      (month || 1) - 1,
      day || 1,
      Number(task.startHour) || 0,
      0,
      0,
      0,
    );
  } else {
    dt = new Date();
  }

  const payload = {
    "Task title": (task.name || task.title || "Untitled task")
      .toString()
      .trim(),
    "Task description": (task.description || task.notes || "")
      .toString()
      .trim(),
    "task date time": !isNaN(dt.getTime())
      ? dt.toISOString()
      : new Date().toISOString(),
    "task duration": Math.max(1, Number(task.duration) || 1),
    "task priority": capitalize(task.priority || "medium"),
    "task category": capitalize(task.category || "other"),
    "ticket type": (task.ticketType || "task").toString().trim().toLowerCase(),
    "task status": capitalize(task.status || "pending"),
    "user name": (task.userName || "ashserrao@ashtro.dev").toString().trim(),
    "user type": (task.userType || "admin").toString().trim(),
    "log time": task.logTime || new Date().toISOString(),
  };

  if (task.ticketId !== undefined && task.ticketId !== null) {
    payload["ticket id"] = task.ticketId;
  } else if (task["ticket id"] !== undefined && task["ticket id"] !== null) {
    payload["ticket id"] = task["ticket id"];
  }

  if (task.rowNumber !== undefined && task.rowNumber !== null) {
    payload["rowNumber"] = task.rowNumber;
  }

  return payload;
}
