from django.urls import path
from . import views

urlpatterns = [
    # 注意：類別型視圖後面一定要加 .as_view()
    path('', views.HelloApiView.as_view(), name='index'),
]