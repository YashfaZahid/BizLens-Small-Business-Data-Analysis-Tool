# BizLens backend

Standalone FastAPI boundary for continuing BizLens outside the Replit workspace.
Run from the repository root with:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

The current endpoints intentionally keep data in memory and return placeholders.
The future pipeline is:

`Uploaded File → Data Profiler → Column Understanding → Schema Mapper → Canonical Business Schema`

No real upload processing, database writes, authentication, or AI calls are part
of this scaffolding pass.