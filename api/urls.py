from django.urls import path
from .views import *

app_name = "api"

urlpatterns = [
    # path('account/reg/', RegisterAccountView.as_view()),
    path('upload/', LoadImageArchiveView.as_view()),
    path('check/<str:hash_id>/', CheckArchiveView.as_view(), {'all': False}),
    path('check/<str:hash_id>/all/', CheckArchiveView.as_view(), {'all': True})
]