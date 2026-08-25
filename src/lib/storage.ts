const BUCKET = "product-images";

/** Strip whitespace/newlines that break browsers and Next preload selectors. */
export function sanitizePublicUrl(url: string) {
  return url.replace(/[\r\n\t\s]+/g, "").trim();
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase storage is not configured.");
  return { url: sanitizePublicUrl(url.replace(/\/$/, "")), key };
}

export async function uploadProductImage(file: File, productId: string) {
  const { url, key } = supabaseConfig();
  await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: BUCKET, public: true }),
  });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const path = `${productId}/${Date.now()}-${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());
  const upload = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body,
  });
  if (!upload.ok) {
    const text = await upload.text();
    throw new Error(text || "Could not upload the photo.");
  }
  return sanitizePublicUrl(`${url}/storage/v1/object/public/${BUCKET}/${path}`);
}
