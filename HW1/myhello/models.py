from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    photo = models.URLField(blank=True)
    location = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class Course(models.Model):
    # 按照作業要求建立三個欄位
    Department = models.CharField(max_length=100)   # 開課單位
    CourseTitle = models.CharField(max_length=100)  # 課程名稱
    Instructor = models.CharField(max_length=100)   # 授課老師

    def __str__(self):
        return self.CourseTitle

class User(models.Model):
    user_id = models.CharField(max_length=150)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    last_login = models.DateTimeField(auto_now_add=True)
    picture = models.CharField(max_length=2048)