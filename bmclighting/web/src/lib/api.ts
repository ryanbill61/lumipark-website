import { client } from "@/lib/edgespark";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await client.api.fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await client.api.fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
  return data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await client.api.fetch(path, { method: "DELETE" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
  return data as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await client.api.fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
  return data as T;
}
