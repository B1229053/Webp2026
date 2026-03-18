from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
# 🌟 核心：新增分頁所需的工具
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import logging

# 同時引入 Post (舊有) 與 User (新進) 模型
from .models import Post, User

logger = logging.getLogger('django')

# ==========================================
# 1. 貼文功能 (原本的 EX2 內容)
# ==========================================
@api_view(['GET'])
def add_post(request):
    title = request.GET.get('title', '')
    content = request.GET.get('content', '')
    photo = request.GET.get('photo', '')
    location = request.GET.get('location', '')

    new_post = Post()
    new_post.title = title
    new_post.content = content
    new_post.photo = photo
    new_post.location = location
    new_post.save()

    logger.debug(" ************** add_post: " + title)
    if title:
        return Response({"data": title + " insert!"}, status=status.HTTP_200_OK)
    return Response({"res": "parameter: title is None"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def list_post(request):
    posts = Post.objects.all().values()
    return JsonResponse(list(posts), safe=False)

# ==========================================
# 2. 巨量 User 分頁功能 (老師最新要求的內容)
# ==========================================
@api_view(['GET'])
def list_users(request):
    # 從 URL 抓取 page 參數，預設為第 1 頁
    page = request.GET.get('page', 1)
    
    # 從資料庫（MySQL）抓取所有 User
    users_list = User.objects.all().values()
    
    # 每頁切成 10 筆資料
    paginator = Paginator(users_list, 10)
    
    

    try:
        users = paginator.page(page)
    except PageNotAnInteger:
        # 如果 page 不是數字，強制顯示第 1 頁
        users = paginator.page(1)
    except EmptyPage:
        # 如果頁數超出範圍，顯示最後一頁
        users = paginator.page(paginator.num_pages)

    # 回傳分頁後的 JSON 資料
    return JsonResponse(list(users), safe=False)