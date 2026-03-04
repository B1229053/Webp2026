from django.shortcuts import render

from django.http import HttpResponse

# Create your views here.
def myIndex(request):
    # 下面這行是從網址抓名字 (GET)，如果你要在網址打 ?name=cj 就用這行
    my_name = request.GET.get('name', "CGU")
    
    # 投影片目前是用 POST，這通常是用在「表單送出」時
    # my_name = request.POST.get('name', "CGU")
    
    return HttpResponse("Hello " + my_name)
