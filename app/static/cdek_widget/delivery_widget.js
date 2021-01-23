class DeliveryWidget {
  
  _deliveryPointsLoaded = 0;
  _packages = [];
  _lastOpenDeliveryPointId = 0;
  _defaultBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    `<div style=''>
      <div style="font-weight: bold;font-size:21px; padding: 5px 0 0 10px; color: #000;">
        {{properties.company_name}} {{properties.code}}
      </div>
      <div style='font-size: 18px; color: #444444; padding: 5px 10px 10px 10px;'>
        <div style="display: flex; margin: 0 -3px; padding-top: 3px;">
          {% if properties.have_cash %}
            <span style="margin: 0 3px; padding: 5px; font-size: 16px; background-color: #8cba51; border-radius: 13px; color: #fff">Наличные</span>
          {% endif %}
          {% if properties.have_cashless %}
            <span style="margin: 0 3px; padding: 5px; font-size: 16px; background-color: #8cba51; border-radius: 13px; color: #fff">Банковские карты</span>
          {% endif%}
          {% if properties.is_dressing_room %}
            <span style="margin: 0 3px; padding: 5px; font-size: 16px; background-color: #8cba51; border-radius: 13px; color: #fff">Примерочная</span>
          {% endif %}
        </div>
        {% if properties.choose %}
          <button id="ballonButton" style="padding: 8px 16px; margin-top: 20px; border: 0px; border-radius: 5px; background: #4676d7;
                        color: #fff;  transition: background-color 0.1s ease;
                        font-size: 1rem; cursor: pointer; width:100%;" 
                        onfocus="this.style.outline='none';"
                        onmouseover="this.style.backgroundColor='#1d49aa';"
                        onmouseout="this.style.backgroundColor='#4676d7';"
                        {% if !properties.shippingCost %}disabled{% endif %}>Выбрать</button>
        {% endif %}

        {% if properties.shippingCost && properties.shippingCost != 'error' %}
          <div style=" padding-top: 8px;">Стоимость доставки <span style="font-weight: bold;">{{ properties.shippingCost.total_sum }}&#8381</span>
          от {{ properties.shippingCost.period_min}} до {{ properties.shippingCost.period_max}} дней.</div>
        {% endif %}
        <div style="font-weight: bold; padding-top: 8px;">Адрес:</div>
        <div style="padding-top: 2px;">{{properties.city}} {{properties.address}}</div>
        <div style="padding-top: 6px; font-weight: bold;">Время работы:</div>
        <div style="padding-top: 2px;">{{properties.work_time}}</div>
        {% if properties.office_image_list %}
          <div style="padding-top: 6px; font-weight: bold;">Фото:</div>
          <div style="padding-top: 10px;">
            {% for image in properties.office_image_list %}
              <img width="380" height="300" style="padding-bottom: 2px;" src="{{image.url}}">
            {% endfor %}
          </div>
        {% endif %}
      </div>
    </div>`);



  constructor (link, options) {
   
    this.config = {
      link: link,
      path: options.path,
      csrfToken: options.csrfToken,
      minLoadZoom: options.minLoadZoom || 10,
      center: options.center,
      zoom: options.zoom || 10,
      gridSize: options.gridSize || 70,
      choose: options.choose,
    }

    if (options.onPickDeleveryPoint) {
      this.onPickDeleveryPoint = options.onPickDeleveryPoint;
    } else {
      this.onPickDeleveryPoint = () => {
        
      }
    }

    if (options.packages) {
      this.setPackages(options.packages);
    }

    if (this.config.center) {
      this._createMap({
        center: this.config.center,
      });
    } else {
      this._createGeolacatedMap();
    }
  }

  _createMapListeners() {
    this.yadMap.events.add('boundschange', (event) => {
      if (event.get('newZoom') != event.get('oldZoom')) {  
      }

      if (event.get('newCenter') != event.get('oldCenter')) {
        this._loadDeliveryPoints();
      }
    });
  }

  _updateButtonDeliveryPointListener(){
    //Безысходность
    if (this.config.choose) {
      let button = document.getElementById('ballonButton');
      button.onclick = () => {

        button.style.backgroundColor = "#1d49aa";
        button.style.cursor = "default";
        button.textContent = "Выбрано";
        button.onmouseover = "";
        button.onmouseout = "";
        button.setAttribute("disabled", "true");

        let data = this.deliveryPointsManager
            .objects.getById(this._lastOpenDeliveryPointId).properties;
        
        this.onPickDeleveryPoint(data)
      }
    }
  }

  _createDeliveryPointsListeners() {
    this.deliveryPointsManager.objects.events.add('click', (e) => {
      let objectId = e.get('objectId'),
          obj = this.deliveryPointsManager.objects.getById(objectId);

      this._lastOpenDeliveryPointId = objectId;

      if (this._hasDeliveryPointShippingCost(objectId)) {
        this.deliveryPointsManager.objects.balloon.open(objectId);
        this._updateButtonDeliveryPointListener();
      } else {
        
        let toLocation = {
          company: obj.properties.company,
          code: obj.properties.city_code,
        }

        this._getShippingCost(toLocation).then((response)=> {
          if (response.data) {
            obj.properties.shippingCost = response.data;
            this.deliveryPointsManager.objects.balloon.setData(obj);
          } else {
            obj.properties.shippingCost = 'error';
            this.deliveryPointsManager.objects.balloon.setData(obj);
          }
          this._updateButtonDeliveryPointListener(); 
        })
      }

    });
  }

  _renderDeliveryPoint(deliveryPoint) {
    return {
      type: 'Feature',
      id: this._deliveryPointsLoaded++,
      geometry: {
        type: 'Point',
        coordinates: [deliveryPoint.latitude, deliveryPoint.longitude],
      },
      
      properties: {
        'company': deliveryPoint.company,
        'hintContent': deliveryPoint.company_name,
        'company_name': deliveryPoint.company_name,
        'code': deliveryPoint.code,
        'city': deliveryPoint.city,
        'city_code': deliveryPoint.city_code,
        'address': deliveryPoint.address,
        'work_time': deliveryPoint.work_time,
        'office_image_list': deliveryPoint.office_image_list,
        'have_cash': deliveryPoint.have_cash,
        'have_cashless': deliveryPoint.have_cashless,
        'is_dressing_room': deliveryPoint.is_dressing_room,
        'choose': this.config.choose,
      },
    }
  }

  _loadDeliveryPoints() {
    if (this.yadMap.getZoom() >= this.config.minLoadZoom) {
      this.regionsObjectManager.objects.each((object)=> {
        let objectState = this.regionsObjectManager.getObjectState(object.id);

        if (objectState.isShown && !object.isDeliveryLoad) {    

          object.isDeliveryLoad = true;
          this._getDeliveryPoints(object.id).then((response)=> {
            
            let deliveryPointsCollection = {
              type: 'FeatureCollection',
              features: [],
            }
            console.log(response.data);
            response.data.forEach((deliveryPoint) => {
              deliveryPointsCollection.features.push(this._renderDeliveryPoint(deliveryPoint))  
            })            
            this.deliveryPointsManager.add(deliveryPointsCollection);
          });
        }
      });
    }
  }
  
  async _getShippingCost(toLocation) {
    let data = {
      packages: this.getPackages(),
      toLocation: toLocation,
    }

    let response = await fetch(`${this.config.path}calculate_shipping_cost/`, {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-CSRFToken': this.config.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async _getDeliveryPoints(iso_reg_code) {
    let data = {
      iso_reg_code: iso_reg_code,
    }

    let response = await fetch(`${this.config.path}deliverypoints/`, {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-CSRFToken': this.config.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  _createDistricts() {
    // Создаём на карте геообьекты, субъектов рф. 
    
    ymaps.borders.load('RU', {
      lang: 'ru',
      quality: 2
    }).then((geojson) => {
      
      let features = geojson.features.map((feature) => {
        feature.id = feature.properties.iso3166;
        feature.isDeliveryLoad = false;
        return feature;
      });

      this.regionsObjectManager = new ymaps.ObjectManager({
        fill: false,
        hasHint: false,
        hasBalloon: false,
        outline: false,
        cursor: 'grab',
      });

      this.regionsObjectManager.add(features);
      this.yadMap.geoObjects.add(this.regionsObjectManager);
      this._loadDeliveryPoints();
      
    })
  }

  _createMap(state) {
    this.yadMap = new ymaps.Map(this.config.link, {
      center:state.center || [55.76, 37.64],
      zoom: this.config.zoom || 10,
      controls: ['zoomControl', 'searchControl']
    });

    this.deliveryPointsManager = new ymaps.ObjectManager({
      clusterize: true,
      gridSize: this.config.gridSize,
    });

    this.deliveryPointsManager.objects.options.set('preset', 'islands#darkGreenIcon');
    this.deliveryPointsManager.clusters.options.set('preset', 'islands#darkGreenClusterIcons');
    this.deliveryPointsManager.objects.options.set('balloonContentLayout', this._defaultBalloonContentLayout);

    this.yadMap.geoObjects.add(this.deliveryPointsManager);

    this._createDistricts();
    this._createMapListeners();
    this._createDeliveryPointsListeners();
  }

  _createGeolacatedMap() {
    ymaps.geolocation.get().then((res)=> {
      let mapContainer = document.getElementById(this.config.link),
          bounds = res.geoObjects.get(0).properties.get('boundedBy'),
          mapState = ymaps.util.bounds.getCenterAndZoom(
              bounds,
              [mapContainer.offsetWidth, mapContainer.offsetHeight]
          );

      this._createMap(mapState);
    }, (e) => {
      this._createMap({
        center: this.config.center,
      });
    });
  }

  _hasDeliveryPointShippingCost(objectId) {
    return this.deliveryPointsManager.objects.getById(objectId).properties.shippingCost;
  }

  getCountDeliveryPointsLoaded() {
    return this._deliveryPointsLoaded;
  }

  setPackages(packages) {
    this._packages = packages;
  }

  getPackages() {
    return this._packages
  }

  addPackage(dPackage) {
    this._packages.push(dPackage);
  }

  clearPackages() {
    this._packages.length = 0;
  }

}



