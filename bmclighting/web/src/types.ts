export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  power: string | null;
  lumens: string | null;
  efficacy: string | null;
  dimensions: string | null;
  sortOrder: number | null;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  category: string;
  productType: string | null;
  tagline: string | null;
  description: string | null;
  cct: string | null;
  cri: string | null;
  beamAngle: string | null;
  ugr: string | null;
  inputVoltage: string | null;
  ipRating: string | null;
  dimming: string | null;
  certifications: string | null;
  mainImage: string | null;
  gallery: string | null;
  opticalPerformance: string | null;
  installationGuide: string | null;
  productLogo: string | null;
  certificateLogo: string | null;
  applicationImages: string | null;
  iesFile: string | null;
  specSheet: string | null;
  installManual: string | null;
  createdAt: number | null;
  variantCount?: number;
  variants?: ProductVariant[];
};

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  message: string | null;
  productSlug: string | null;
  status: string | null;
  emailStatus: string | null;
  emailError: string | null;
  createdAt: number | null;
};

export type ArticleAttachment = {
  name: string;
  kind: "pdf" | "image";
  url: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string; // technical | qc | production | management
  coverImage: string | null;
  content: string | null;
  attachments: ArticleAttachment[] | null;
  publishDate: number | null;
  status: string | null;
  createdAt: number | null;
  updatedAt: number | null;
};
