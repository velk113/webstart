from django.urls import path
from .views import delivery_points_json, calculate_shipping_cost_json

urlpatterns = [
    path('deliverypoints/', delivery_points_json, name='delivery_points'),
    path('calculate_shipping_cost/', calculate_shipping_cost_json, name='calculate_shipping_cost'),
]