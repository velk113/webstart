import json
from django.http import JsonResponse
from .data.region_codes import REGION_CODES
from .api import CdekApi


def delivery_points_json(request):

    if request.is_ajax():
        options = json.loads(request.body)
        iso_3166 = options.get('iso_reg_code')

        if iso_3166:
            cdek_api = CdekApi() 
            del_points = cdek_api.get_delivery_points(REGION_CODES[iso_3166]['CDEK_CODE'], type='ALL')
            response = {
                'data': del_points,
                'status': 'ok',
                'code': '200',
            }
        else:
            response = {
                'status': 'error',
                'code': 'bad_data',
            }

    return JsonResponse(response, safe=False)


def calculate_shipping_cost_json(request):

    if request.is_ajax():
        options = json.loads(request.body)
        
        company = options['toLocation'].get('company')
        packages = options.get('packages')

        if company == 'cdek' and packages:
            code = options['toLocation'].get('code')
            cdek_api = CdekApi()
            shipping_cost = cdek_api.get_shipping_cost(packages=packages, to_location_code=code)
            response = {
                'data': shipping_cost,
                'status': 'ok',
                'code': '200',
            }
        else:
            response = {
                'status': 'error',
                'code': 'bad_data',
            }

    return JsonResponse(response, safe=False)

