from typing import List
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import asyncio
from api import ThumbnailsMaker, ThumbnailsFinder

app = FastAPI(title="Thumbnails Maker",
              version="0.0.1"
              )

# CORS
app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:4200"],
                   allow_methods=["*"],
                   allow_headers=["*"],
                   )

@app.get("/")
def index():
    return "Hello world!"


@app.post("/api/make_thumbnails")
async def make_thumbnails(image: UploadFile = File(...), resolutions: str = Form(...)) -> bool:
    resolutions = list(map(int, resolutions.split(",")))
    finder = ThumbnailsFinder()
    for r in resolutions.copy():
        thumb_path = await finder.get_thumbnail_path(image.filename, r)
        if thumb_path:
            resolutions.remove(r)
    if not resolutions:
        return True
    maker = ThumbnailsMaker()
    await maker.save_original_image(image)
    await maker.make_thumbnails(image.filename, resolutions)
    return True


@app.get("/api/get_thumbnail/{resol:int}/{img_name:str}")
async def get_thumbnail(resol: int, img_name:str):
    finder = ThumbnailsFinder()
    thumb_path = await finder.get_thumbnail_path(img_name, resol)
    return FileResponse(thumb_path)