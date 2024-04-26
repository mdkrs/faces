from django.db import models
import random
import string
from functools import partial


def gen_hash_id():
    return ''.join(random.choices(string.ascii_uppercase, k=30))


def upload_file_hash_name(instance, filename):
    return "archives/" + gen_hash_id() + '.' + (filename.split('.')[-1])


class ImageArchive(models.Model):
    hash_id = models.CharField(max_length=32, default=gen_hash_id)
    archive = models.FileField(upload_to=upload_file_hash_name, null=True, blank=True)


class ImageLink(models.Model):
    archive = models.ForeignKey(ImageArchive, on_delete=models.CASCADE, related_name='images')
    name = models.CharField(max_length=64)
    raw = models.FileField(null=True, blank=True)
    labeled = models.FileField(null=True, blank=True)
    is_ready = models.BooleanField(default=False)
    is_updated = models.BooleanField(default=False)

    def get_raw_url(self):
        return '' if self.raw == '' else self.raw.url
    
    def get_labeled_url(self):
        return '' if self.labeled == '' else self.labeled.url


class Face(models.Model):
    img = models.ForeignKey(ImageLink, on_delete=models.CASCADE, related_name='faces')
    face = models.FileField(null=True, blank=True)
    embeds_json = models.TextField(blank=True, default="")

    def get_url(self):
        return '' if self.face is None else self.face.url
