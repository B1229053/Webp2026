
from rest_framework.decorators import api_view # <--- 就是少了這行通行證！
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import logging # 1. 匯入工具包

# 2. 建立一個叫做 'django' 的紀錄員
logger = logging.getLogger('django')

@api_view(['GET'])
def myhello_api(request):
    my_name = request.GET.get('name', None)
    
    # 3. 關鍵動作：把抓到的名字印在紀錄裡
    logger.debug(" ************** myhello_api: " + str(my_name))
    
    if my_name:
        return Response({"data": "Hello " + my_name}, status=status.HTTP_200_OK)
    else:
        return Response(
            {"res": "parameter: name is None"},
            status=status.HTTP_400_BAD_REQUEST
        )

class HelloApiView(APIView):
    def get(self, request):
        # 嘗試從網址抓取 'name' 參數
        my_name = request.GET.get('name', None)
        
        if my_name:
            retValue = {}
            retValue['data'] = "Hello " + my_name
            # 成功時回傳 200 OK 與 JSON 資料
            return Response(retValue, status=status.HTTP_200_OK)
        else:
            # 沒給名字時回傳 400 Bad Request
            return Response(
                {"res": "parameter: name is None"},
                status=status.HTTP_400_BAD_REQUEST
            )