import type { Product, ProductVariant } from "@/types";

// Sanity content layer — public read (no token). Dataset has public read enabled.
export const SANITY_PROJECT_ID = "e5lza2t9";
export const SANITY_DATASET = "production";

async function sanityView<T>(view: string): Promise<T> {
  const url = `/api/public/sanity?${view}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity query failed (${res.status})`);
  const data = (await res.json()) as { result: T };
  return data.result;
}

// Sanity image asset ref → CDN URL.
// ref format: image-<assetId>-<width>x<height>-<ext>
export function sanityImageUrl(ref: string, width = 1600): string {
  const rest = ref.replace(/^image-/, "");
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${rest}?w=${width}&auto=format&fit=max`;
}

// Sanity file asset ref → CDN URL. ref format: file-<assetId>-<ext>
export function sanityFileUrl(ref: string): string {
  const rest = ref.replace(/^file-/, "");
  return `https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${rest}`;
}

const PRODUCT_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  "category": category->title,
  "productType": productType,
  tagline,
  description,
  "brand": brand->name,
  features,
  applications,
  warranty,
  "specifications": specifications[]{label, value},
  "mainImage": mainImage.asset._ref,
  "gallery": gallery[].asset._ref,
  "specSheet": specSheet.asset._ref,
  "installManual": installManual.asset._ref,
  "iesFile": iesFile.asset._ref,
  "cutSheet": cutSheet.asset._ref,
  variants[]{
    _key,
    "sku": modelNumber,
    "power": powerSize,
    "lumens": luminousFlux,
    "efficacy": efficacy,
    "dimensions": dimensions
  }
}`;

export const PRODUCTS_QUERY = `*[_type == "product" && brand->name == "LEAPPON"] | order(_createdAt asc) ${PRODUCT_PROJECTION}`;

export async function fetchProducts(): Promise<Product[]> {
  try {
    const docs = await sanityView<Array<Record<string, unknown>>>("view=products&brand=LEAPPON");
    return (docs || [])
      .map((d) => {
        try {
          return mapProduct(d);
        } catch {
          return null; // skip a single bad doc instead of crashing the whole list
        }
      })
      .filter((p): p is Product => p !== null);
  } catch {
    return []; // network/query failure → empty list, page shows "no products" not a red error
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const doc = await sanityView<Record<string, unknown> | null>(`view=product&slug=${encodeURIComponent(slug)}`);
    return doc ? mapProduct(doc) : null;
  } catch {
    return null;
  }
}

function specValue(specs: { label: string; value: string }[] | undefined, label: string): string | null {
  const hit = (specs || []).find((s) => s.label?.toLowerCase() === label.toLowerCase());
  return hit?.value || null;
}

export function mapProduct(doc: Record<string, unknown>): Product {
  const variants = (doc.variants as Array<Record<string, unknown>> | undefined) || [];
  const specs = (doc.specifications as Array<{ label: string; value: string }> | undefined) || [];
  const gallery = (doc.gallery as string[] | undefined) || [];

  return {
    id: String(doc._id || ""),
    slug: String(doc.slug || ""),
    title: String(doc.title || ""),
    brand: (doc.brand as string) || null,
    category: String(doc.category || ""),
    productType: (doc.productType as string) || null,
    tagline: (doc.tagline as string) || null,
    description: (doc.description as string) || null,
    cct: specValue(specs, "CCT"),
    cri: specValue(specs, "CRI"),
    beamAngle: specValue(specs, "Beam angle"),
    ugr: specValue(specs, "UGR"),
    inputVoltage: specValue(specs, "Input voltage"),
    ipRating: specValue(specs, "IP rating"),
    dimming: specValue(specs, "Dimming"),
    certifications: specValue(specs, "Certifications"),
    mainImage: doc.mainImage ? sanityImageUrl(String(doc.mainImage)) : null,
    gallery: gallery.length ? JSON.stringify(gallery.map((r) => sanityImageUrl(r))) : "[]",
    opticalPerformance: null,
    installationGuide: null,
    productLogo: null,
    certificateLogo: null,
    applicationImages: "[]",
    iesFile: doc.iesFile ? sanityFileUrl(String(doc.iesFile)) : null,
    specSheet: doc.specSheet ? sanityFileUrl(String(doc.specSheet)) : null,
    installManual: doc.installManual ? sanityFileUrl(String(doc.installManual)) : null,
    createdAt: Date.now(),
    variants: variants.map(
      (v, i): ProductVariant => ({
        id: String(v._key || i),
        productId: String(doc._id || ""),
        sku: String(v.sku || v.modelNumber || ""),
        power: (v.power as string) || null,
        lumens: (v.lumens as string) || null,
        efficacy: (v.efficacy as string) || null,
        dimensions: (v.dimensions as string) || null,
        sortOrder: i,
      }),
    ),
  };
}

export type SiteSettings = Record<string, any>;

export async function fetchSiteSettings(site: string): Promise<SiteSettings | null> {
  try {
    const doc = await sanityView<SiteSettings | null>(`view=settings&site=${encodeURIComponent(site)}`);
    return doc;
  } catch {
    return null;
  }
}
