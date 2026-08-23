let map, currentLocationMarker, currentHubId = 'pleiku';
let totalTime = 0, totalCost = 0, totalCO2 = 0;

const hubs = { 
    'pleiku': { name: 'TP. Pleiku', lat: 13.9833, lng: 108.0000 }, 
    'icd_song_than': { name: 'ICD Tân Cảng Sóng Thần', lat: 10.9167, lng: 106.7500 }, 
    'cat_lai': { name: 'Cảng Cát Lái', lat: 10.7600, lng: 106.7700 } 
};
const routes = [
    { 
        from: 'pleiku', 
        to: 'icd_song_than', 
        path: [                      
            [13.9833, 108.0000],     
            [12.6666, 108.0333],     
            [10.9167, 106.7500]      
        ],
        modes: [
            { type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 15000000, time: 1.5, co2: 500, color: 'blue' }
        ] 
    }
];

document.getElementById('start-btn').addEventListener('click', function() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('map-screen').style.display = 'block';
    initMap();
    setTimeout(function() {
        map.invalidateSize();
    }, 100);
    startTimer(30 * 60, document.getElementById('timer-panel'));
});

function initMap() {
    map = L.map('map', { center: [20.0, 70.0], zoom: 3, minZoom: 2, maxZoom: 10 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
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
    
    document.getElementById('stat-cost').innerText = totalCost.toLocaleString('vi-VN');
    document.getElementById('stat-time').innerText = totalTime.toFixed(1);
    document.getElementById('stat-co2').innerText = totalCO2.toFixed(0);
    
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
