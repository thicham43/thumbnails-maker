from abc import ABCMeta
import os
from PIL import Image
from typing import List
from fastapi import UploadFile
import asyncio


class AbstractThumbnailsService(metaclass=ABCMeta):
    """ singleton class """

    __instance = None

    def __new__(cls, *args, **kwargs):
        if cls.__instance is None:
            cls.__instance = super(AbstractThumbnailsService, cls).__new__(cls, *args, **kwargs)
        return cls.__instance

    def __init__(self, *args, **kwargs):
        self.incoming_dir = os.path.join(os.getcwd(), "images_db", "in")
        self.ougoing_dir = os.path.join(os.getcwd(), "images_db", "out")
    


class ThumbnailsMaker(AbstractThumbnailsService):

    async def save_original_image(self, image: UploadFile) -> None:
        """ save image to images_db\in """
        os.makedirs(self.incoming_dir, exist_ok=True)
        complete_path = os.path.join(self.incoming_dir, image.filename)
        with open(complete_path, 'wb') as img:
            content = await image.read()
            img.write(content)


    async def make_thumbnails(self, image_name: str, resolutions: List[int]) -> None:
        """ read the original image from the in dir
            resize it with a new height and width
            save the result image to out dir with a modified name such: \out\image-thumb-24.jpeg
        """
        os.makedirs(self.ougoing_dir, exist_ok=True)
        img_path = os.path.join(self.incoming_dir, image_name)

        with Image.open(img_path) as img:
            _, ext = os.path.splitext(img_path)
            ratio = img.height / img.width
            for w in resolutions:
                h = int(ratio * w)
                size = w, h
                thumbnail = img.resize(size)
                name, ext = image_name.split('.')
                out_path = os.path.join(self.ougoing_dir, f"{name}-thumb-{w}.{ext}")
                thumbnail.save(fp=out_path)



class ThumbnailsFinder(AbstractThumbnailsService):

    async def get_thumbnail_path(self, img_name: str, thumb_resolution: str):
        name, ext = img_name.split(".")
        target = f"{name}-thumb-{thumb_resolution}.{ext}"
        thumb_path = os.path.join(self.ougoing_dir, target)
        if os.path.exists(thumb_path):
            return thumb_path
        return False