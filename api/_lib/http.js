export function json(status, body, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function noContent(extraHeaders = {}) {
  return {
    statusCode: 204,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: "",
  };
}

export async function readJson(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}
