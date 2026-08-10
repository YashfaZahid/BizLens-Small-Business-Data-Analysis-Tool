import { Router, type IRouter } from "express";
import {
  GetDatasetParams,
  UploadDatasetBody,
  UploadDatasetResponse,
  ListDatasetsResponse,
} from "@workspace/api-zod";
import { datasetStore } from "../store";

const router: IRouter = Router();

router.post("/upload", (req, res) => {
  const input = UploadDatasetBody.parse(req.body);
  const dataset = datasetStore.register(input);
  res.status(201).json(UploadDatasetResponse.parse(dataset));
});

router.get("/datasets", (_req, res) => {
  res.json(ListDatasetsResponse.parse(datasetStore.list()));
});

router.get("/datasets/:dataset_id", (req, res) => {
  const { dataset_id: datasetId } = GetDatasetParams.parse(req.params);
  const dataset = datasetStore.get(datasetId);
  if (!dataset) {
    res.status(404).json({ error: "Dataset not found" });
    return;
  }
  res.json(dataset);
});

export default router;