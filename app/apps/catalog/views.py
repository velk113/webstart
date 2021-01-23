from django.shortcuts import render
from django.views.generic import TemplateView


class CatalogView(TemplateView):
    template_name = 'example_cdek_widget1.html'

