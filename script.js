document.addEventListener("DOMContentLoaded", function() {
    let map, currentLocationMarker;
    
    let currentHubId = 'pleiku';
    let totalTime = 0, totalCost = 0, totalDistance = 0, totalCO2 = 0;

    const hubs = { 
        'pleiku': { name: 'TP. Pleiku', lat: 13.9833, lng: 108.0000 }, 
        'cai_mep': { name: 'Cái Mép – Thị Vải', lat: 10.5500, lng: 107.0333 },
        'tan_son_nhat': { name: 'Sân bay TSN', lat: 10.8185, lng: 106.6525 },
        'long_thanh': { name: 'Sân bay Long Thành', lat: 10.7800, lng: 107.1500 },
        'dong_dang': { name: 'Ga liên vận Đồng Đăng (Lạng Sơn)', lat: 21.9438, lng: 106.6972 },
        'doha': { name: 'Sân bay Doha', lat: 25.2731, lng: 51.6081 },
        'dubai': { name: 'Sân bay Dubai', lat: 25.2532, lng: 55.3657 },
        'singapore': { name: 'Sân bay Changi (SIN)', lat: 1.3644, lng: 103.9915 },
        'hong_kong': { name: 'Sân bay Hong Kong (HKG)', lat: 22.3193, lng: 114.1694 }, 
        'istanbul': { name: 'Sân bay/Ga Istanbul (IST)', lat: 41.2753, lng: 28.7519 },
        'jebel_ali': { name: 'Cảng Jebel Ali (UAE)', lat: 25.0145, lng: 55.0592 }
    };

    const routes = [
        // --- TUYẾN XUẤT PHÁT TỪ PLEIKU (ĐƯỜNG BỘ) ---
        { 
            from: 'pleiku', 
            to: 'cai_mep', 
            path: [[13.9833, 108.0000], [12.6666, 108.0333], [12.0000, 107.6800], [11.2000, 107.1000], [10.5500, 107.0333]],
            modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ (QL51)', cost: 293.0, time: 1.0, co2: 263.7, distance: 586, color: 'blue' }] 
        },
        { 
            from: 'pleiku', 
            to: 'tan_son_nhat', 
            path: [[13.9833, 108.0000], [12.6666, 108.0333], [12.0000, 107.6800], [11.5333, 106.9000], [11.4167, 106.6500], [10.9800, 106.6800], [10.8185, 106.6525]],
            modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 253.0, time: 0.9, co2: 227.7, distance: 506, color: 'blue' }] 
        },
        { 
            from: 'pleiku', 
            to: 'long_thanh', 
            path: [[13.9833, 108.0000], [12.6666, 108.0333], [12.0000, 107.6800], [11.2000, 107.1000], [10.7800, 107.1500]],
            modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 274.5, time: 1.0, co2: 247.1, distance: 549, color: 'blue' }] 
        },
        { 
            from: 'pleiku', 
            to: 'dong_dang', 
            path: [[13.9833, 108.0000], [16.0471, 108.2068], [21.0285, 105.8542], [21.9438, 106.6972]],
            modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 665.0, time: 2.1, co2: 598.5, distance: 1330, color: 'blue' }] 
        },

        // --- TUYẾN ĐƯỜNG SẮT LIÊN VẬN Á - ÂU (MIDDLE CORRIDOR) ---
        {
            from: 'dong_dang',
            to: 'istanbul',
            path: [[21.9438, 106.6972], [30.0000, 100.0000], [40.0000, 70.0000], [41.2753, 28.7519]],
            modes: [{ type: 'rail', icon: '🚆', name: 'Đường sắt (Middle Corridor)', cost: 1700.0, time: 9.5, co2: 977.5, distance: 8500, color: 'green' }]
        },

        // --- TUYẾN HÀNG KHÔNG TỪ TÂN SƠN NHẤT ---
        { 
            from: 'tan_son_nhat', 
            to: 'doha', 
            path: [[10.8185, 106.6525], [16.0000, 98.0000], [22.0000, 80.0000], [26.0000, 65.0000], [25.2731, 51.6081]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13502.3, time: 0.9, co2: 18003.0, distance: 6001, color: 'purple' }] 
        },
        { 
            from: 'tan_son_nhat', 
            to: 'hong_kong', 
            path: [[10.8185, 106.6525], [16.0000, 110.0000], [22.3193, 114.1694]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 3348.0, time: 0.6, co2: 4464.0, distance: 1488, color: 'purple' }] 
        },
        { 
            from: 'tan_son_nhat', 
            to: 'singapore', 
            path: [[10.8185, 106.6525], [5.0000, 105.0000], [1.3644, 103.9915]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 2475.0, time: 0.6, co2: 3300.0, distance: 1100, color: 'purple' }] 
        },
        { 
            from: 'tan_son_nhat', 
            to: 'dubai', 
            path: [[10.8185, 106.6525], [16.0000, 95.0000], [25.2532, 55.3657]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 12654.0, time: 0.9, co2: 16872.0, distance: 5624, color: 'purple' }] 
        },

        // --- TUYẾN HÀNG KHÔNG TỪ LONG THÀNH ---
        { 
            from: 'long_thanh', 
            to: 'singapore', 
            path: [[10.7800, 107.1500], [6.0000, 105.0000], [1.3644, 103.9915]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 2475.0, time: 0.6, co2: 3300.0, distance: 1100, color: 'purple' }] 
        },
        { 
            from: 'long_thanh', 
            to: 'dubai', 
            path: [[10.7800, 107.1500], [18.0000, 80.0000], [25.2532, 55.3657]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 12654.0, time: 0.9, co2: 16872.0, distance: 5624, color: 'purple' }] 
        },
        { 
            from: 'long_thanh', 
            to: 'doha', 
            path: [[10.7800, 107.1500], [16.0000, 98.0000], [22.0000, 80.0000], [25.2731, 51.6081]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13502.3, time: 0.9, co2: 18003.0, distance: 6001, color: 'purple' }] 
        },
        { 
            from: 'long_thanh', 
            to: 'hong_kong', 
            path: [[10.7800, 107.1500], [16.0000, 110.0000], [22.3193, 114.1694]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 3348.0, time: 0.6, co2: 4464.0, distance: 1488, color: 'purple' }] 
        },

        // --- TUYẾN ĐƯỜNG BIỂN TỪ CÁI MÉP ---
        { 
            from: 'cai_mep', 
            to: 'singapore', 
            path: [[10.5500, 107.0333], [7.0000, 105.0000], [1.3644, 103.9915]],
            modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 835.8, time: 3.8, co2: 417.9, distance: 1393, color: 'blue' }] 
        },
        { 
            from: 'cai_mep', 
            to: 'jebel_ali', 
            path: [[10.5500, 107.0333], [6.0000, 103.0000], [5.0000, 80.0000], [15.0000, 65.0000], [25.0145, 55.0592]],
            modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 1308.6, time: 19.4, co2: 654.3, distance: 8724, color: 'blue' }] 
        },
        { 
            from: 'cai_mep', 
            to: 'hong_kong', 
            path: [[10.5500, 107.0333], [15.0000, 112.0000], [22.3193, 114.1694]],
            modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 223.2, time: 4.0, co2: 111.6, distance: 1488, color: 'blue' }] 
        },

        // --- TUYẾN QUỐC TẾ NỐI TIẾP (AIR & SEA) ---
        { 
            from: 'doha', 
            to: 'istanbul', 
            path: [[25.2731, 51.6081], [30.0000, 45.0000], [36.0000, 36.0000], [41.2753, 28.7519]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 6201.0, time: 0.7, co2: 8268.0, distance: 2756, color: 'purple' }] 
        },
        { 
            from: 'dubai', 
            to: 'istanbul', 
            path: [[25.2532, 55.3657], [30.0000, 48.0000], [35.0000, 38.0000], [41.2753, 28.7519]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 6817.5, time: 0.7, co2: 9090.0, distance: 3030, color: 'purple' }] 
        },
        { 
            from: 'hong_kong', 
            to: 'istanbul', 
            path: [[22.3193, 114.1694], [30.0000, 95.0000], [38.0000, 70.0000], [40.0000, 50.0000], [41.2753, 28.7519]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 18047.3, time: 1.0, co2: 24063.0, distance: 8021, color: 'purple' }] 
        },
        { 
            from: 'singapore', 
            to: 'doha', 
            path: [[1.3644, 103.9915], [6.0000, 90.0000], [15.0000, 75.0000], [20.0000, 60.0000], [25.2731, 51.6081]],
            modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13963.5, time: 0.9, co2: 18618.0, distance: 6206, color: 'purple' }] 
        },
        { 
            from: 'singapore', 
            to: 'istanbul', 
            path: [[1.3644, 103.9915], [5.0000, 90.0000], [12.0000, 50.0000], [12.8000, 45.0000], [27.5000, 34.0000], [29.9000, 32.5000], [35.0000, 25.0000], [41.2753, 28.7519]],
            modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển (đi thẳng qua kênh Suez)', cost: 1838.9, time: 26.0, co2: 3677.7, distance: 12259, color: 'blue' }] 
        },
        { 
            from: 'jebel_ali', 
            to: 'istanbul', 
            path: [[25.0145, 55.0592], [20.0000, 60.0000], [12.8000, 45.0000], [27.5000, 34.0000], [29.9000, 32.5000], [35.0000, 25.0000], [41.2753, 28.7519]],
            modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 1195.4, time: 17.9, co2: 597.7, distance: 7969, color: 'blue' }] 
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
        
        L.polyline(routeCoords, {
            color: selectedMode.color, 
            weight: 4, 
            dashArray: selectedMode.type === 'air' ? '6, 6' : (selectedMode.type === 'rail' ? '12, 6' : null)
        }).addTo(map);
        
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
