document.addEventListener("DOMContentLoaded", function() {
    let map, currentLocationMarker;
    let currentHubId = localStorage.getItem('currentHubId') || 'pleiku';
    let totalTime = parseFloat(localStorage.getItem('totalTime')) || 0;
    let totalCost = parseFloat(localStorage.getItem('totalCost')) || 0;
    let totalDistance = parseFloat(localStorage.getItem('totalDistance')) || 0;
    let totalCO2 = parseFloat(localStorage.getItem('totalCO2')) || 0;

    const hubs = { 
        'pleiku': { name: 'TP. Pleiku', lat: 13.9833, lng: 108.0000 }, 
        'icd_song_than': { name: 'ICD Sóng Thần', lat: 10.9167, lng: 106.7500 }, 
        'cat_lai': { name: 'Cảng Cát Lái', lat: 10.7600, lng: 106.7700 },
        'tan_son_nhat': { name: 'Sân bay TSN', lat: 10.8185, lng: 106.6525 }
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
        },
        { 
            from: 'pleiku', 
            to: 'cat_lai', 
            path: [                      
                [13.9833, 108.0000],     
                [12.6666, 108.0333],     
                [12.0000, 107.6800],     
                [11.2000, 107.1000],     
                [10.8500, 106.7800],     
                [10.7600, 106.7700]      
            ],
            modes: [
                { type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 280, time: 0.8, co2: 252000, distance: 560, color: 'blue' }
            ] 
        }
    ];

        if (localStorage.getItem('appStarted') === 'true') {
        document.getElementById('intro-screen').style.display = 'none';
        document.getElementById('map-screen').style.display = 'block';
        
        updateStatsUI();
        initMap();
        setTimeout(function() { if(map) map.invalidateSize(); }, 100);
        startTimer();
    }

    document.getElementById('start-btn').addEventListener('click', function() {
        localStorage.setItem('appStarted', 'true');
        if (!localStorage.getItem('timerEndTime')) {
            localStorage.setItem('timerEndTime', Date.now() + 30 * 60 * 1000);
        }

        document.getElementById('intro-screen').style.display = 'none';
        document.getElementById('map-screen').style.display = 'block';
        
        initMap();
        setTimeout(function() { if(map) map.invalidateSize(); }, 100);
        startTimer();
    });

    function initMap() {
        if (map) return; 
        map = L.map('map', { center: [11.5, 107.0], zoom: 8, minZoom: 2, maxZoom: 15 });

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 16
        }).addTo(map);

        const currentHub = hubs[currentHubId];
        currentLocationMarker = L.marker([currentHub.lat, currentHub.lng]).addTo(map);
        currentLocationMarker.bindTooltip(currentHub.name, { permanent: true, direction: 'bottom', className: 'hub-label' });

        drawAvailableNextHubs();
    }

    function drawAvailableNextHubs() {
        const availableRoutes = routes.filter(r => r.from === currentHubId);
        availableRoutes.forEach(route => {
            const nextHub = hubs[route.to];
            const marker = L.marker([nextHub.lat, nextHub.lng], {
                icon: L.divIcon({className: 'custom-hub-icon', iconSize: [14, 14]})
            }).addTo(map);

            marker.bindTooltip(nextHub.name, { permanent: true, direction: 'bottom', className: 'hub-label' });

            let popupContent = `<div class="mode-selection-popup">`;
            route.modes.forEach((mode, index) => { 
                popupContent += `<div class="mode-btn" onclick="selectMode('${route.to}', ${index})" title="${mode.name}">${mode.icon}</div>`; 
            });
            popupContent += `</div>`;
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
        currentLocationMarker.bindTooltip(nextHub.name, { permanent: true, direction: 'bottom', className: 'hub-label' });
        
        totalCost += selectedMode.cost; 
        totalTime += selectedMode.time; 
        totalCO2 += selectedMode.co2;
        totalDistance += selectedMode.distance;

        localStorage.setItem('currentHubId', nextHubId);
        localStorage.setItem('totalTime', totalTime);
        localStorage.setItem('totalCost', totalCost);
        localStorage.setItem('totalDistance', totalDistance);
        localStorage.setItem('totalCO2', totalCO2);
        
        updateStatsUI();
        
        currentHubId = nextHubId; 
        map.closePopup(); 
        drawAvailableNextHubs();
    };

    function updateStatsUI() {
        document.getElementById('stat-cost').innerText = totalCost.toLocaleString('en-US');
        document.getElementById('stat-time').innerText = totalTime.toFixed(1);
        document.getElementById('stat-co2').innerText = totalCO2.toLocaleString('en-US');
        document.getElementById('stat-distance').innerText = totalDistance.toLocaleString('en-US');
    }

    function startTimer() {
        const display = document.getElementById('timer-panel');
        setInterval(function () {
            const endTime = parseInt(localStorage.getItem('timerEndTime')) || (Date.now() + 30 * 60 * 1000);
            let timeLeft = Math.floor((endTime - Date.now()) / 1000);
            if (timeLeft < 0) timeLeft = 0;

            let m = parseInt(timeLeft / 60, 10), s = parseInt(timeLeft % 60, 10);
            display.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        }, 1000);
    }
});
