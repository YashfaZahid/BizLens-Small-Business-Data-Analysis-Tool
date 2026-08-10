"""Portable FastAPI boundary for the BizLens analytics scaffold.

The Replit preview uses the TypeScript API artifact, while this module mirrors
the same contract so the project can be continued locally with uvicorn.
"""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="BizLens API", version="0.1.0")


class DatasetInput(BaseModel):
    filename: str
    size_bytes: float
    file_type: str


class Dataset(DatasetInput):
    id: str
    status: str
    uploaded_at: str
    row_count: float
    columns: list[str]


class QuestionInput(BaseModel):
    question: str
    dataset_id: str | None = None


class QuestionResponse(BaseModel):
    question: str
    answer: str
    demo: bool


_datasets: dict[str, Dataset] = {
    "demo-retail": Dataset(
        id="demo-retail",
        filename="northstar-sales-q2.csv",
        size_bytes=28400,
        file_type="text/csv",
        status="needs_review",
        uploaded_at="2026-08-08T09:30:00.000Z",
        row_count=1248,
        columns=["Date", "Product", "Qty", "Selling Price", "Purchase Price"],
    )
}


@app.get("/api/health")
@app.get("/api/healthz")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload", response_model=Dataset, status_code=201)
def upload_dataset(payload: DatasetInput) -> Dataset:
    dataset = Dataset(
        id=f"dataset-{uuid4()}",
        status="needs_review",
        uploaded_at=datetime.now(timezone.utc).isoformat(),
        row_count=0,
        columns=[],
        **payload.model_dump(),
    )
    _datasets[dataset.id] = dataset
    return dataset


@app.get("/api/datasets", response_model=list[Dataset])
def list_datasets() -> list[Dataset]:
    return list(_datasets.values())


@app.get("/api/datasets/{dataset_id}", response_model=Dataset)
def get_dataset(dataset_id: str) -> Dataset:
    if dataset_id not in _datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return _datasets[dataset_id]


@app.get("/api/reports/{dataset_id}")
def get_report(dataset_id: str) -> dict:
    get_dataset(dataset_id)
    return {
        "dataset_id": dataset_id,
        "generated": False,
        "message": "Report generation is scaffolded. Connect the profiler and analytics services to generate insights from this dataset.",
        "metrics": [
            {"label": "Revenue", "value": "—", "change": "Awaiting analysis"},
            {"label": "Profit", "value": "—", "change": "Awaiting analysis"},
            {"label": "Orders", "value": "—", "change": "Awaiting analysis"},
        ],
    }


@app.post("/api/questions", response_model=QuestionResponse, status_code=201)
def ask_question(payload: QuestionInput) -> QuestionResponse:
    return QuestionResponse(
        question=payload.question,
        answer="This is a demo response. Once a dataset is connected, BizLens will compute the answer from your business data and explain the result here.",
        demo=True,
    )