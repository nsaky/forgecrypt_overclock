import asyncio
import logging
import signal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn

from models.schemas import QueryRequest, FinalReport
from services.orchestrator import run_research_pipeline

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insight-ai")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Insight AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Middleware: catch broken-pipe / connection-reset errors globally so they
# don't bubble up as unhandled 500s or crash the worker.
# ---------------------------------------------------------------------------
class BrokenPipeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as exc:
            logger.warning(f"Client disconnected early ({type(exc).__name__}): {request.url}")
            return JSONResponse(
                status_code=499,  # Client Closed Request (nginx convention)
                content={"detail": "Client disconnected before response was sent."},
            )
        except Exception as exc:
            # Re-raise anything else so FastAPI's normal error handling works
            raise

app.add_middleware(BrokenPipeMiddleware)

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "Research Engine is Online."}


# Maximum time (seconds) the pipeline is allowed to run before we give up.
PIPELINE_TIMEOUT_SECONDS = 300  # 5 minutes


@app.post("/api/research")
async def perform_research(request: QueryRequest, req: Request):
    """
    Main endpoint triggering the 10-layer autonomous research engine.
    """
    if not request.query or len(request.query) < 5:
        raise HTTPException(status_code=400, detail="Query too short.")

    try:
        # Wrap the long-running pipeline in an asyncio timeout so it doesn't
        # hang forever if an external API stalls.
        report = await asyncio.wait_for(
            run_research_pipeline(request.query),
            timeout=PIPELINE_TIMEOUT_SECONDS,
        )
        return JSONResponse(content=report)

    except asyncio.TimeoutError:
        logger.error("Research pipeline timed out.")
        raise HTTPException(
            status_code=504,
            detail="Research pipeline timed out. Please try a simpler query.",
        )
    except asyncio.CancelledError:
        # Client disconnected; the ASGI server cancelled the task.
        logger.warning("Request cancelled (client disconnected).")
        return JSONResponse(
            status_code=499,
            content={"detail": "Request cancelled — client disconnected."},
        )
    except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as exc:
        logger.warning(f"Broken pipe in research endpoint: {exc}")
        return JSONResponse(
            status_code=499,
            content={"detail": "Client disconnected before response was sent."},
        )
    except Exception as e:
        logger.error(f"Global Pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        timeout_keep_alive=120,   # Keep idle connections alive longer
    )
