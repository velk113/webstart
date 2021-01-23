import requests
import json
from django.conf import settings


class CdekApi:
    client_id = settings.CDEK_API.get('CDEK_ACCOUNT')
    client_secret = settings.CDEK_API.get('CDEK_SECURE_PASSWORD') 
    tariff_code = settings.CDEK_API.get('CDEK_TARIFF_CODE')
    code_from_location = settings.CDEK_API.get('CODE_SENDING_LOCATION')
    is_sandbox = settings.CDEK_API.get('IS_SANDBOX')
    grant_type = 'client_credentials'
    base_url = 'https://api.cdek.ru/v2/'
    access_token = None

    headers = {
        'Content-type': 'application/json; charset=utf-8',
    }

    def __init__(self):
        self.set_jwt_token()    


    def _create_url(self, url):
        full_url = self.base_url + url
        return full_url


    def set_jwt_token(self):

        dt = {
            'grant_type': self.grant_type,
            'client_secret': self.client_secret,
            'client_id': self.client_id,
        }

        if not self.is_sandbox:
            resp = requests.post(self._create_url(f'oauth/token/'), data=dt)
        else:
            resp = requests.post('https://api.edu.cdek.ru/v2/oauth/token/', data=dt)
        
        if resp.ok:
            self.access_token = resp.json()["access_token"]
            self.headers.update({'Authorization': f'Bearer {self.access_token}'})

        return self.access_token



    def get_shipping_cost(self, packages, to_location_code):
        '''Расчет стоимости и сроков доставки по коду тарифа.'''

        data = {
            "type": "1",
            "date": "2020-11-03T11:49:32+0700",
            "currency": "1",
            "lang": "rus",
            "tariff_code": self.tariff_code,
            "from_location": {
                "code": self.code_from_location,
            },
            "to_location": {
                "code": to_location_code,
            },
            "packages": packages,
        }

        resp = requests.post(self._create_url('calculator/tariff/'), data=json.dumps(data), headers=self.headers)

        json_calculate=json.loads(resp.text)
    
        calculate_result = {
            'company': 'cdek',
            'company_name': 'СДЭК',
            'currency': json_calculate.get('currency'),
            'delivery_sum': json_calculate.get('delivery_sum'),
            'period_min': json_calculate.get('period_min'),
            'period_max': json_calculate.get('period_max'),
            'weight_calc': json_calculate.get('weight_calc'),
            'total_sum': json_calculate.get('total_sum'),
        }

        return calculate_result


    def get_delivery_points(self, cdek_region_code, type='ALL'):
        '''Возращает пункты выдачи, субъекта РФ.'''

        params = {
            'region_code': cdek_region_code,
            'type': type,
        }

        resp = requests.get(self._create_url('deliverypoints'), params=params, headers=self.headers)
        
        json_pvz=json.loads(resp.text)
        
        delivery_points = []
        for pvz in json_pvz:
            delivery_points.append({
                'company': 'cdek',
                'company_name': 'СДЭК',
                'code': pvz.get('code'),
                'name': pvz.get('name'),
                'longitude': pvz.get('location')['longitude'],
                'latitude': pvz.get('location')['latitude'],
                'region': pvz.get('location')['region'],
                'city': pvz.get('location')['city'],
                'city_code': pvz.get('location')['city_code'],
                'address': pvz.get('location')['address'],
                'postal_code': pvz.get('postal_code'),
                'work_time': pvz.get('work_time'),
                'email': pvz.get('email'),
                'phones': pvz.get('phones'),
                'cdek_owner_code': pvz.get('owner_code'),
                'is_dressing_room': pvz.get('is_dressing_room'),
                'have_cashless': pvz.get('have_cashless'),
                'have_cash': pvz.get('have_cash'),
                'allowed_cod': pvz.get('allowed_cod'), 
                'office_image_list': pvz.get('office_image_list'),
            })

        return delivery_points