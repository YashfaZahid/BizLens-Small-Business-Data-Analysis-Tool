/**
 * Partial canonical business schema.
 *
 * Column understanding will eventually map business-specific names such as
 * "Amount Paid", "Sales Value", "Turnover", and "Net Amount" to revenue, and
 * "Item", "Product Name", "Service", and "Description" to product/service.
 */
export interface CanonicalBusinessRecord {
  transaction_id?: string;
  date?: string;
  customer?: string;
  product?: string;
  category?: string;
  quantity?: number;
  revenue?: number;
  cost?: number;
  profit?: number;
  discount?: number;
  expense?: number;
  employee?: string;
  supplier?: string;
  location?: string;
  payment_method?: string;
  inventory?: number;
}

export interface DatasetMetadata {
  filename: string;
  fileType: 'csv' | 'xlsx';
  sizeBytes: number;
  detectedColumns: string[];
}