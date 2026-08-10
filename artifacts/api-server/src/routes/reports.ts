import { Router, type IRouter } from "express";
import { GetReportParams, GetReportResponse } from "@workspace/api-zod";
import { datasetStore } from "../store";

const router: IRouter = Router();

router.get("/reports/:dataset_id", (req, res) => {
  const { dataset_id: datasetId } = GetReportParams.parse(req.params);
  const dataset = datasetStore.get(datasetId);
  if (!dataset) {
    res.status(404).json({ error: "Dataset not found" });
    return;
  }

  res.json(
    GetReportResponse.parse({
      dataset_id: datasetId,
      generated: dataset.id !== "demo-retail",
      message: dataset.id === "demo-retail"
        ? "This is the built-in preview dataset. Upload your own file to generate a report from actual rows."
        : dataset.profile.warnings.length > 0
          ? `The report is grounded in ${dataset.row_count.toLocaleString()} rows, with a few review items before the analysis is complete.`
          : `Computed from ${dataset.row_count.toLocaleString()} rows using the detected business columns.`,
      metrics: [
        {
          label: "Revenue",
          value: dataset.profile.revenue_column ? `$${dataset.profile.revenue_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—",
          change: dataset.profile.revenue_column ? `from ${dataset.profile.revenue_column}` : "Not detected",
        },
        {
          label: "Profit",
          value: dataset.profile.cost_column && dataset.profile.revenue_column
            ? `$${dataset.profile.profit_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "—",
          change: dataset.profile.cost_column ? `after ${dataset.profile.cost_column}` : "Add a cost column",
        },
        {
          label: "Quantity",
          value: dataset.profile.quantity_column ? dataset.profile.quantity_total.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—",
          change: dataset.profile.quantity_column ? `from ${dataset.profile.quantity_column}` : "Not detected",
        },
      ],
    }),
  );
});

export default router;