from django.urls import path
from . import views  # 從目前的資料夾匯入 views.py

urlpatterns = [
    # 當網址是 'myhello/' 後面什麼都不加時，去執行 views 裡的 myIndex 函式
    path('', views.myIndex, name='index'),
]