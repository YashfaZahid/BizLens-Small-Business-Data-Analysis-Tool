import type { DatasetInput } from "@workspace/api-zod";
import { UploadDatasetBody } from "@workspace/api-zod";

export type Dataset = DatasetInput & {
  id: string;
  status: "ready" | "needs_review" | "processing";
  uploaded_at: string;
  row_count: number;
  columns: string[];
};

const demoDataset: Dataset = {
  id: "demo-retail",
  filename: "northstar-sales-q2.csv",
  size_bytes: 28400,
  file_type: "text/csv",
  status: "needs_review",
  uploaded_at: "2026-08-08T09:30:00.000Z",
  row_count: 1248,
  columns: ["Date", "Product", "Qty", "Selling Price", "Purchase Price"],
};

const datasets = new Map<string, Dataset>([[demoDataset.id, demoDataset]]);

export const datasetStore = {
  list(): Dataset[] {
    return Array.from(datasets.values());
  },
  get(id: string): Dataset | undefined {
    return datasets.get(id);
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
    };
    datasets.set(id, dataset);
    return dataset;
  },
};