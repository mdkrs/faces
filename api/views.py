from django.shortcuts import render
from django.db.models import F
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import JsonResponse

from .models import *
from .serializers import *
import random
import string
import datetime
import zipfile
from PIL import Image
import os
from django.conf import settings
import threading
import time
from .facelib.detector import *
import json

def gen_hash_name():
    return ''.join(random.choices(string.ascii_uppercase, k=40))


def extract_archive(archive):
    allowed_formats = ['jpg', 'jpeg']
    arch_name = archive.archive.name.split('.')
    if len(arch_name) > 2 or arch_name[-1] != 'zip':
        raise NotImplementedError('Not supported format')
    with zipfile.ZipFile(archive.archive.path, "r") as f_arch:
        for entry in f_arch.infolist():
            if entry.filename.split('.')[-1] not in allowed_formats:
                raise NotImplementedError('Not supported format')
        for entry in f_arch.infolist():
            file = f_arch.extract(entry, path='./media/raw')
            ext = file.split('.')[-1]
            old_name = file.split('/')[-1]
            new_name = gen_hash_name()
            path = '/'.join(file.split('/')[:-1])
            new_file = path + '/' + new_name + '.' + ext
            os.rename(file, new_file)
            print(new_file)
            imlink = ImageLink(archive=archive, name=old_name)
            imlink.raw.name = new_file.removeprefix("media/")
            imlink.save()


def image_face_detection(img_id):
    image = ImageLink.objects.filter(pk=img_id).first()
    path, bounding_boxes = show_faces_on_image("media/" + image.raw.name)
    faces = get_image_faces("media/" + image.raw.name, bounding_boxes)

    image.labeled.name = path.removeprefix("media/")
    image.is_updated = True
    face_ids = []
    for face in faces:
        face_im = Image.fromarray(face)
        face_path = "media/faces/" + gen_hash_name() + ".jpg"
        face_im.save(face_path)
        face_obj = Face(img_id=img_id)
        face_obj.face.name = face_path.removeprefix("media/")
        face_obj.save()
        face_ids.append(face_obj.id)
    image.save()
    
    face_collection = {}
    embeds = get_embeded_faces(faces)
    for i in range(len(faces)):
        face_collection[face_ids[i]] = embeds[i]

    image.is_updated = True
    image.is_ready = True
    for face_obj in image.faces.all():
        face_obj.embeds_json = json.dumps(face_collection[face_obj.id].tolist())
        face_obj.save()
    image.save()


def archive_face_detection(archive_id):
    archive = ImageArchive.objects.filter(pk=archive_id).first()
    for img in archive.images.all():
        image_face_detection(img.id)


def launch_archive_process(archive):
    t = threading.Thread(target=archive_face_detection, args=[archive.id])
    t.setDaemon(True)
    t.start()


class LoadImageArchiveView(APIView):
    serializer_class = LoadImageArchiveSerializer
    parser_classes = [MultiPartParser]

    def post(self, request):
        MAX_FILE_SIZE = 250_000_000
        serialize = self.serializer_class(data=request.data)
        if not serialize.is_valid():
            return Response({'comment': 'Bad request'}, status=status.HTTP_400_BAD_REQUEST)
        file_obj = request.FILES.pop('file', None)
        if file_obj is None or len(file_obj) == 0:
            return Response({'comment': 'No file attached'}, status=status.HTTP_400_BAD_REQUEST)
        if file_obj[0].size > MAX_FILE_SIZE:
            return Response({'comment': 'File is too big'}, status=status.HTTP_400_BAD_REQUEST)

        archive = ImageArchive(archive=file_obj[0])
        archive.save()
        try:
            extract_archive(archive)
        except:
            return Response({'comment': 'Incorrect format'}, status=status.HTTP_406_NOT_ACCEPTABLE)
        launch_archive_process(archive)
        return Response(ImageArchiveSerializer(archive).data, status=status.HTTP_200_OK)


class CheckArchiveView(APIView):
    serializer_class = ImageArchiveSerializer

    def get(self, request, hash_id, *args, **kwargs):
        serialize = self.serializer_class(data=request.data)
        if not serialize.is_valid():
            return Response({'comment': 'Bad request'}, status=status.HTTP_400_BAD_REQUEST)
        arch = ImageArchive.objects.filter(hash_id=hash_id).first()
        if arch is None:
            return Response({'comment': 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)
        if kwargs['all']:
            qs = arch.images.all()
            qs.update(is_updated=False)
            return Response(ImageLinkSerializer(qs, many=True).data, status=status.HTTP_200_OK)
        qs = arch.images.filter(is_updated=True).all()
        resp = Response(ImageLinkSerializer(qs, many=True).data, status=status.HTTP_200_OK)
        qs.update(is_updated=False)
        return resp

