from pathlib import Path

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.constants import ROOT_PATH

dist = Path("../dist")
dist.mkdir(exist_ok=True)

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]

app = FastAPI(root_path=ROOT_PATH)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health(request: Request, response: Response):
    response.status_code = status.HTTP_200_OK
    return {"status": "ok"}


@app.get("/count/{count}")
async def add(
    count: int,
    request: Request,
    response: Response,
):
    return {"count": count + 1}


app.mount("/", StaticFiles(directory="../dist", html=True), name="dist")
