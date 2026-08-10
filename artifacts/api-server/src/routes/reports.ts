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
      generated: false,
      message:
        "Report generation is scaffolded. Connect the profiler and analytics services to generate insights from this dataset.",
      metrics: [
        { label: "Revenue", value: "—", change: "Awaiting analysis" },
        { label: "Profit", value: "—", change: "Awaiting analysis" },
        { label: "Orders", value: "—", change: "Awaiting analysis" },
      ],
    }),
  );
});

export default router;