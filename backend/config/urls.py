from django.contrib import admin
from django.urls import include, path

from apps.accounts.views import PublicObtainAuthToken

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", PublicObtainAuthToken.as_view(), name="api_token_auth"),
    path("api/", include("config.api_urls")),
]
