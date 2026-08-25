document.addEventListener("DOMContentLoaded", function() {
    let map, currentLocationMarker, currentHubId = 'pleiku';
    let totalTime = 0, totalCost = 0, totalDistance = 0, totalCO2 = 0;

    const hubs = { 
        'pleiku': { name: 'TP. Pleiku', lat: 13.9833, lng: 108.0000 }, 
        'icd_song_than': { name: 'ICD Tân Cảng Sóng Thần', lat: 10.9167, lng: 106.7500 }, 
        'cat_lai': { name: 'Cảng Cát Lái', lat: 10.7600, lng: 106.7700 },
        'tan_son_nhat': { name: 'Sân bay Tân Sơn Nhất', lat: 10.8185, lng: 106.6525 }
    };

    const routes = [
        { 
            from: 'pleiku', 
            to: 'icd_song_than', 
            path: [                     
                [13.9833, 108.0000],     
                [12.6666, 108.0333],     
                [12.0000, 107.6800],     
                [11.5333, 106.9000],     
                [11.4167, 106.6500],     
                [10.9800, 106.6800],     
                [10.9167, 106.7500]      
            ],
            modes: [
                { type: 'rail', icon: '🚆', name: 'Đường sắt', cost: 100, time: 1.6667, co2: 57500, distance: 550, color: 'green' }
            ] 
        },
        { 
            from: 'pleiku', 
            to: 'tan_son_nhat', 
            path: [                      
                [13.9833, 108.0000],     
                [12.6666, 108.0333],     
                [12.0000, 107.6800],     
                [11.5333, 106.9000],     
                [11.4167, 106.6500],     
                [10.9800, 106.6800],     
                [10.8185, 106.6525]      
            ],
            modes: [
                { type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 267.5, time: 0.764, co2: 240750, distance: 535, color: 'blue' }
            ] 
        }
    ];

    // Lắng nghe sự kiện bấm nút Bắt đầu an toàn
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            document.getElementById('intro-screen').style.display = 'none';
            document.getElementById('map-screen').style.display = 'block';
            
            initMap();
            
            setTimeout(function() {
                if(map) map.invalidateSize();
            }, 100);

            startTimer(30 * 60, document.getElementById('timer-panel'));
        });
    }

    function initMap() {
        if (map) return; 
        map = L.map('map', { center: [15.0, 107.0], zoom: 6, minZoom: 2, maxZoom: 15 });

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 16
        }).addTo(map);

        currentLocationMarker = L.marker([hubs['pleiku'].lat, hubs['pleiku'].lng]).addTo(map).bindPopup("<b>TP. Pleiku</b>");
        drawAvailableNextHubs();
    }

    function drawAvailableNextHubs() {
        const availableRoutes = routes.filter(r => r.from === currentHubId);
        availableRoutes.forEach(route => {
            const nextHub = hubs[route.to];
            const marker = L.marker([nextHub.lat, nextHub.lng], {icon: L.divIcon({className: 'custom-hub-icon', iconSize: [14, 14]})}).addTo(map);
            let popupContent = `<div class="mode-selection-popup">`;
            route.modes.forEach((mode, index) => { 
                popupContent += `<div class="mode-btn" onclick="selectMode('${route.to}', ${index})">${mode.icon}</div>`; 
            });
            marker.bindPopup(popupContent);
        });
    }

    window.selectMode = function(nextHubId, modeIndex) {
        const route = routes.find(r => r.from === currentHubId && r.to === nextHubId);
        const selectedMode = route.modes[modeIndex];
        const nextHub = hubs[nextHubId];
        
        const routeCoords = route.path ? route.path : [
            [hubs[currentHubId].lat, hubs[currentHubId].lng], 
            [nextHub.lat, nextHub.lng]
        ];
        
        L.polyline(routeCoords, {color: selectedMode.color, weight: 4}).addTo(map);
        currentLocationMarker.setLatLng([nextHub.lat, nextHub.lng]);
        
        totalCost += selectedMode.cost; 
        totalTime += selectedMode.time; 
        totalCO2 += selectedMode.co2;
        totalDistance += selectedMode.distance;
        
        document.getElementById('stat-cost').innerText = totalCost.toLocaleString('en-US');
        document.getElementById('stat-time').innerText = totalTime.toFixed(1);
        document.getElementById('stat-co2').innerText = totalCO2.toFixed(0);
        document.getElementById('stat-distance').innerText = totalDistance.toLocaleString('en-US');
        
        currentHubId = nextHubId; 
        map.closePopup(); 
        drawAvailableNextHubs();
    };

    function startTimer(duration, display) {
        let timer = duration;
        setInterval(function () {
            let m = parseInt(timer / 60, 10), s = parseInt(timer % 60, 10);
            display.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
            if (--timer < 0) timer = 0;
        }, 1000);
    }
});
