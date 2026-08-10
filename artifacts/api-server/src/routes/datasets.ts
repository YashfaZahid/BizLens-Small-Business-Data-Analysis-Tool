import { Router, type IRouter } from "express";
import multer from "multer";
import {
  GetDatasetParams,
  UploadDatasetBody,
  UploadDatasetResponse,
  ListDatasetsResponse,
} from "@workspace/api-zod";
import { datasetStore } from "../store";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const extension = file.originalname.split(".").pop()?.toLowerCase();
    callback(null, extension === "csv" || extension === "xlsx");
  },
});

router.post("/upload", (req, res) => {
  const input = UploadDatasetBody.parse(req.body);
  const dataset = datasetStore.register(input);
  res.status(201).json(UploadDatasetResponse.parse(dataset));
});

router.post("/upload/file", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Attach a CSV or XLSX file in the file field." });
    return;
  }

  try {
    const dataset = datasetStore.registerFile(
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      req.file.buffer,
    );
    res.status(201).json(UploadDatasetResponse.parse(dataset));
  } catch {
    res.status(400).json({
      error: "We could not read that spreadsheet. Check that it is a valid CSV or XLSX file.",
    });
  }
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