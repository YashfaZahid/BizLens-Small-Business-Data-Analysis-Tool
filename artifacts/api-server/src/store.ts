import type { DatasetInput } from "@workspace/api-zod";
import { UploadDatasetBody } from "@workspace/api-zod";
import * as XLSX from "xlsx";

export type Dataset = DatasetInput & {
  id: string;
  status: "ready" | "needs_review" | "processing";
  uploaded_at: string;
  row_count: number;
  columns: string[];
  profile: DataProfile;
};

export type DataProfile = {
  date_column: string | null;
  revenue_column: string | null;
  cost_column: string | null;
  quantity_column: string | null;
  product_column: string | null;
  mappings: Array<{
    source: string;
    canonical: string;
    confidence: "high" | "medium" | "low";
  }>;
  numeric_columns: string[];
  warnings: string[];
  revenue_total: number;
  cost_total: number;
  profit_total: number;
  quantity_total: number;
  top_product: string | null;
  top_product_revenue: number;
};

export type StoredDataset = Dataset & { records: Record<string, unknown>[] };

const demoDataset: Dataset = {
  id: "demo-retail",
  filename: "northstar-sales-q2.csv",
  size_bytes: 28400,
  file_type: "text/csv",
  status: "needs_review",
  uploaded_at: "2026-08-08T09:30:00.000Z",
  row_count: 1248,
  columns: ["Date", "Product", "Qty", "Selling Price", "Purchase Price"],
  profile: {
    date_column: "Date",
    revenue_column: "Selling Price",
    cost_column: "Purchase Price",
    quantity_column: "Qty",
    product_column: "Product",
    mappings: [
      { source: "Date", canonical: "date", confidence: "high" },
      { source: "Product", canonical: "product", confidence: "high" },
      { source: "Qty", canonical: "quantity", confidence: "high" },
      { source: "Selling Price", canonical: "revenue", confidence: "high" },
      { source: "Purchase Price", canonical: "cost", confidence: "high" },
    ],
    numeric_columns: ["Qty", "Selling Price", "Purchase Price"],
    warnings: ["Demo data is illustrative until you upload a file."],
    revenue_total: 48260,
    cost_total: 30140,
    profit_total: 18120,
    quantity_total: 1284,
    top_product: "Demo assortment",
    top_product_revenue: 48260,
  },
};

const datasets = new Map<string, StoredDataset>([
  [demoDataset.id, { ...demoDataset, records: [] }],
]);

const CANONICAL_ALIASES: Record<
  keyof Pick<
    DataProfile,
    | "date_column"
    | "revenue_column"
    | "cost_column"
    | "quantity_column"
    | "product_column"
  >,
  string[]
> = {
  date_column: ["date", "order date", "invoice date", "transaction date"],
  revenue_column: [
    "revenue",
    "amount",
    "amount received",
    "amount paid",
    "sales value",
    "turnover",
    "net amount",
    "selling price",
  ],
  cost_column: ["cost", "purchase price", "supplier cost", "cost price"],
  quantity_column: ["qty", "quantity", "units", "units sold", "hours"],
  product_column: [
    "product",
    "product name",
    "item",
    "service",
    "description",
  ],
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function chooseColumn(columns: string[], aliases: string[]): { column: string | null; confidence: "high" | "medium" | "low" } {
  const exact = columns.find((column) => aliases.includes(normalize(column)));
  if (exact) return { column: exact, confidence: "high" };
  const partial = columns.find((column) => aliases.some((alias) => normalize(column).includes(alias)));
  if (partial) return { column: partial, confidence: "medium" };
  return { column: null, confidence: "low" };
}

export function profileRecords(records: Record<string, unknown>[], columns: string[]): DataProfile {
  const selected = {
    date_column: chooseColumn(columns, CANONICAL_ALIASES.date_column),
    revenue_column: chooseColumn(columns, CANONICAL_ALIASES.revenue_column),
    cost_column: chooseColumn(columns, CANONICAL_ALIASES.cost_column),
    quantity_column: chooseColumn(columns, CANONICAL_ALIASES.quantity_column),
    product_column: chooseColumn(columns, CANONICAL_ALIASES.product_column),
  };
  const mappings = Object.entries(selected)
    .filter(([, value]) => value.column)
    .map(([canonical, value]) => ({
      source: value.column as string,
      canonical: canonical.replace("_column", ""),
      confidence: value.confidence,
    }));
  const numericColumns = columns.filter((column) => {
    const values = records.slice(0, 50).map((record) => record[column]).filter((value) => value !== "" && value != null);
    return values.length > 0 && values.filter((value) => Number.isFinite(toNumber(value))).length / values.length > 0.7;
  });
  const revenueTotal = selected.revenue_column.column
    ? records.reduce((sum, record) => sum + toNumber(record[selected.revenue_column.column as string]), 0)
    : 0;
  const costTotal = selected.cost_column.column
    ? records.reduce((sum, record) => sum + toNumber(record[selected.cost_column.column as string]), 0)
    : 0;
  const quantityTotal = selected.quantity_column.column
    ? records.reduce((sum, record) => sum + toNumber(record[selected.quantity_column.column as string]), 0)
    : 0;
  const productRevenue = new Map<string, number>();
  if (selected.product_column.column && selected.revenue_column.column) {
    for (const record of records) {
      const product = String(record[selected.product_column.column] ?? "Unspecified");
      productRevenue.set(product, (productRevenue.get(product) ?? 0) + toNumber(record[selected.revenue_column.column]));
    }
  }
  const topProduct = [...productRevenue.entries()].sort((a, b) => b[1] - a[1])[0];
  const warnings: string[] = [];
  if (!selected.date_column.column) warnings.push("No date column was confidently detected.");
  if (!selected.revenue_column.column) warnings.push("No revenue or amount column was detected.");
  if (!selected.product_column.column) warnings.push("No product, item, or service column was detected.");
  if (records.length === 0) warnings.push("The file contains headers but no data rows.");
  return {
    date_column: selected.date_column.column,
    revenue_column: selected.revenue_column.column,
    cost_column: selected.cost_column.column,
    quantity_column: selected.quantity_column.column,
    product_column: selected.product_column.column,
    mappings,
    numeric_columns: numericColumns,
    warnings,
    revenue_total: Math.round(revenueTotal * 100) / 100,
    cost_total: Math.round(costTotal * 100) / 100,
    profit_total: Math.round((revenueTotal - costTotal) * 100) / 100,
    quantity_total: Math.round(quantityTotal * 100) / 100,
    top_product: topProduct?.[0] ?? null,
    top_product_revenue: Math.round((topProduct?.[1] ?? 0) * 100) / 100,
  };
}

export function parseSpreadsheet(buffer: Buffer, filename: string): { columns: string[]; records: Record<string, unknown>[] } {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return { columns: [], records: [] };
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
  const columns = records.length > 0
    ? Object.keys(records[0])
    : (XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1 })[0] as unknown[] | undefined)?.map(String) ?? [];
  return { columns, records };
}

export const datasetStore = {
  list(): Dataset[] {
    return Array.from(datasets.values()).map(({ records: _records, ...dataset }) => dataset);
  },
  get(id: string): Dataset | undefined {
    const dataset = datasets.get(id);
    if (!dataset) return undefined;
    const { records: _records, ...publicDataset } = dataset;
    return publicDataset;
  },
  records(id: string): Record<string, unknown>[] {
    return datasets.get(id)?.records ?? [];
  },
  register(input: DatasetInput): Dataset {
    const id = `dataset-${Date.now()}`;
    const dataset: Dataset = {
      ...input,
      id,
      status: "needs_review",
      uploaded_at: new Date().toISOString(),
      row_count: 0,
      columns: [],
      profile: profileRecords([], []),
    };
    datasets.set(id, { ...dataset, records: [] });
    return dataset;
  },
  registerFile(filename: string, sizeBytes: number, mimeType: string, buffer: Buffer): Dataset {
    const { columns, records } = parseSpreadsheet(buffer, filename);
    const profile = profileRecords(records, columns);
    const id = `dataset-${Date.now()}`;
    const dataset: Dataset = {
      id,
      filename,
      size_bytes: sizeBytes,
      file_type: filename.toLowerCase().endsWith(".xlsx") ? "xlsx" : mimeType || "csv",
      status: profile.warnings.length > 0 ? "needs_review" : "ready",
      uploaded_at: new Date().toISOString(),
      row_count: records.length,
      columns,
      profile,
    };
    datasets.set(id, { ...dataset, records });
    return dataset;
  },
};