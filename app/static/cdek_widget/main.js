
ymaps.ready(init);

function init(){
    const csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    
    const delivery_widget = new DeliveryWidget('delivery_widget', {
      path: 'http://127.0.0.1:8000/delivery_widget/',
      csrfToken: csrfToken,    
      minLoadZoom: 10,         //начиная с какого маштаба начинать подгрузку ПВЗ
      zoom: 10,
      center: [55.76, 37.64],  //есле не указано, создание карты с местоположением пользователя
      gridSize: 70,            //размер ячейки кластеризации в пикселях.
      choose: true,           // отображение кнопки выбора ПВЗ
      packages: [                 // установка данных о товаре для корректного расчета стоимости доставки
        { length: 20, width: 20, height: 20, weight: 2 },
        { length: 10, width: 10, height: 10, weight: 300 },
        { length: 10, width: 10, height: 10, weight: 300 },
        { length: 10, width: 10, height: 10, weight: 300 },
      ],
      onPickDeleveryPoint: (data) => {
          let area = document.getElementById('last_delivery_point');
          area.value = JSON.stringify(data);
      },
    });


    const showPackagesButton = document.getElementById('showPackages');
    const clearPackagesButton = document.getElementById('clearPackages');
    const addPackageButton = document.getElementById('addPackage');
    const pvzLoadedElem = document.getElementById('pvzLoaded');

    clearPackagesButton.onclick = () => {
        delivery_widget.clearPackages();
        showPackages()
    }

    showPackagesButton.onclick = () => {
        showPackages();
    }

    addPackageButton.onclick = () => {
        let weight = document.getElementById('weight').value;
        let height = document.getElementById('height').value;
        let width = document.getElementById('width').value;
        let length = document.getElementById('length').value;

        delivery_widget.addPackage({
            length: length,
            width: width,
            height: height,
            weight: weight,
        })
    } 
    
    const showPackages = () => {
        let area = document.getElementById('packages');
        let packages = delivery_widget.getPackages();
        area.value = JSON.stringify(packages);
    }

    setInterval(()=>{
        pvzLoadedElem.innerText = delivery_widget.getCountDeliveryPointsLoaded();
    }, 5000);
}