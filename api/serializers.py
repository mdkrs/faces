from rest_framework import serializers
from .models import *


class LoadImageArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageArchive
        fields = ['archive']


class ImageArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageArchive
        fields = ['hash_id']


class FaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Face
        fields = ['id', 'embeds_json', 'face_url', 'img']

    def get_face_url(self, face):
        return face.get_url()

    img = serializers.PrimaryKeyRelatedField(read_only=True)
    face_url = serializers.SerializerMethodField('get_face_url')


class ImageLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageLink
        fields = ['id', 'name', 'is_ready', 'is_updated', 'raw_url', 'labeled_url', 'faces']

    def get_raw_url(self, imlink):
        return imlink.get_raw_url()
    
    def get_labeled_url(self, imlink):
        return imlink.get_labeled_url()

    raw_url = serializers.SerializerMethodField('get_raw_url')
    labeled_url = serializers.SerializerMethodField('get_labeled_url')
    faces = FaceSerializer(many=True, read_only=True)
