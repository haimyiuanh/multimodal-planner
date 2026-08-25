document.addEventListener("DOMContentLoaded", function() {
    let map, currentLocationMarker;
    
    let currentHubId = 'pleiku';
    let totalTime = 0, totalCost = 0, totalDistance = 0, totalCO2 = 0;

    const hubs = { 
        'pleiku': { name: 'TP. Pleiku', lat: 13.9833, lng: 108.0000 }, 
        'icd_song_than': { name: 'ICD Sóng Thần', lat: 10.9167, lng: 106.7500 }, 
        'cat_lai': { name: 'Cảng Cát Lái', lat: 10.7600, lng: 106.7700 },
        'tan_son_nhat': { name: 'Sân bay TSN', lat: 10.8185, lng: 106.6525 },
        'cang_quy_nhon': { name: 'Cảng Quy Nhơn', lat: 13.7700, lng: 109.2300 },
        'doha': { name: 'Sân bay Doha', lat: 25.2731, lng: 51.6081 } 
        'dubai': { name: 'Sân bay Dubai', lat: 25.2532, lng: 55.3657 },
        'singapore': { name: 'Sân bay Changi (SIN)', lat: 1.3644, lng: 103.9915 },
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
        },
        { 
            from: 'pleiku', 
            to: 'cang_quy_nhon', 
            path: [                      
                [13.9833, 108.0000],     
                [13.9667, 108.6500],     
                [13.7700, 109.2300]      
            ],
            modes: [
                { type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 87.5, time: 0.25, co2: 78750, distance: 175, color: 'blue' }
            ] 
        },
        { 
            from: 'tan_son_nhat', 
            to: 'doha', 
            path: [                      
                [10.8185, 106.6525],     
                [16.0000, 98.0000],      
                [22.0000, 80.0000],      
                [26.0000, 65.0000],      
                [25.2731, 51.6081]       
            ],
            modes: [
                { type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13502.25, time: 0.4, co2: 18003000, distance: 6001, color: 'purple' }
            ] 
        },
        { 
        from: 'tan_son_nhat', 
        to: 'dubai', 
        path: [                      
            [10.8185, 106.6525],     
            [18.0000, 85.0000],      
            [23.0000, 70.0000],      
            [25.2532, 55.3657]       
        ],
        modes: [
            { type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 12654, time: 0.375, co2: 16872000, distance: 5624, color: 'purple' }
        ] 
    },
        { 
        from: 'tan_son_nhat', 
        to: 'singapore', 
        path: [                      
            [10.8185, 106.6525],     
            [6.0000, 105.0000],      
            [1.3644, 103.9915]       
        ],
        modes: [
            { type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 2448, time: 0.073, co2: 3264000, distance: 1088, color: 'purple' }
        ] 
    }
    ];

    const introScreen = document.getElementById('intro-screen');
    const mapScreen = document.getElementById('map-screen');

    if (sessionStorage.getItem('appStarted') === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (mapScreen) mapScreen.style.display = 'block';
        
        updateStatsUI();
        initMap();
        setTimeout(function() { if(map) map.invalidateSize(); }, 100);
        startTimer();
    } else {
        if (introScreen) introScreen.style.display = 'block';
        if (mapScreen) mapScreen.style.display = 'none';
    }

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            sessionStorage.setItem('appStarted', 'true');
            sessionStorage.setItem('timerEndTime', Date.now() + 30 * 60 * 1000);

            if (introScreen) introScreen.style.display = 'none';
            if (mapScreen) mapScreen.style.display = 'block';
            
            initMap();
            setTimeout(function() { if(map) map.invalidateSize(); }, 100);
            startTimer();
        });
    }

    function initMap() {
        if (map) return; 
        map = L.map('map', { center: [15.0, 107.0], zoom: 5, minZoom: 2, maxZoom: 15 });

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
        Object.keys(hubs).forEach(hubId => {
            if (hubId === currentHubId) return;
            const nextHub = hubs[hubId];
            const marker = L.marker([nextHub.lat, nextHub.lng], {
                icon: L.divIcon({className: 'custom-hub-icon', iconSize: [14, 14]})
            }).addTo(map);

            marker.bindTooltip(nextHub.name, { permanent: true, direction: 'bottom', className: 'hub-label' });

            const route = routes.find(r => r.from === currentHubId && r.to === hubId);
            if (route) {
                let popupContent = `<div class="mode-selection-popup">`;
                route.modes.forEach((mode, index) => { 
                    popupContent += `<div class="mode-btn" onclick="selectMode('${hubId}', ${index})" title="${mode.name} (${mode.distance} km)">${mode.icon}</div>`; 
                });
                popupContent += `</div>`;
                marker.bindPopup(popupContent);
            }
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
        
        L.polyline(routeCoords, {color: selectedMode.color, weight: 4, dashArray: selectedMode.type === 'air' ? '6, 6' : null}).addTo(map);
        
        currentLocationMarker.setLatLng([nextHub.lat, nextHub.lng]);
        currentLocationMarker.bindTooltip(nextHub.name, { permanent: true, direction: 'bottom', className: 'hub-label' });
        
        totalCost += selectedMode.cost; 
        totalTime += selectedMode.time; 
        totalCO2 += selectedMode.co2;
        totalDistance += selectedMode.distance;
        
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
        if (!display) return;

        if (window.timerInterval) clearInterval(window.timerInterval);

        let endTime = sessionStorage.getItem('timerEndTime');
        let now = Date.now();
        if (!endTime || parseInt(endTime) <= now) {
            endTime = now + 30 * 60 * 1000;
            sessionStorage.setItem('timerEndTime', endTime);
        }

        window.timerInterval = setInterval(function () {
            let currentEndTime = parseInt(sessionStorage.getItem('timerEndTime')) || (Date.now() + 30 * 60 * 1000);
            let timeLeft = Math.floor((currentEndTime - Date.now()) / 1000);
            if (timeLeft < 0) timeLeft = 0;

            let m = parseInt(timeLeft / 60, 10), s = parseInt(timeLeft % 60, 10);
            display.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        }, 1000);
    }
});
