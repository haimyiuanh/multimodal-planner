document.addEventListener("DOMContentLoaded", function() {
    let map, currentLocationMarker;
    let markersGroup = null; // LayerGroup quản lý các marker động
    let currentHubId = 'pleiku';
    let totalTime = 0, totalCost = 0, totalDistance = 0, totalCO2 = 0;

    const hubs = { 
        'pleiku': { name: 'TP. Pleiku', lat: 13.9833, lng: 108.0000 }, 
        'cai_mep': { name: 'Cái Mép – Thị Vải', lat: 10.5500, lng: 107.0333 },
        'tan_son_nhat': { name: 'Sân bay Tân Sơn Nhất', lat: 10.8185, lng: 106.6525 },
        'long_thanh': { name: 'Sân bay Long Thành', lat: 10.7800, lng: 107.1500 },
        'dong_dang': { name: 'Ga liên vận Đồng Đăng', lat: 21.9438, lng: 106.6972 },
        'doha': { name: 'Sân bay Doha', lat: 25.2731, lng: 51.6081 },
        'dubai': { name: 'Sân bay Dubai', lat: 25.2532, lng: 55.3657 },
        'singapore': { name: 'Sân bay Changi', lat: 1.3644, lng: 103.9915 },
        'singapore_port': { name: 'Cảng biển Singapore', lat: 1.2644, lng: 103.8400 },
        'hong_kong': { name: 'Sân bay Hong Kong', lat: 22.3193, lng: 114.1694 }, 
        'istanbul': { name: 'Sân bay/Ga Istanbul', lat: 41.2753, lng: 28.7519 },
        'jebel_ali': { name: 'Cảng Jebel Ali', lat: 25.0145, lng: 55.0592 }
    };

    const routes = [
        { from: 'pleiku', to: 'cai_mep', path: [[13.9833, 108.0000], [12.6666, 108.0333], [12.0000, 107.6800], [11.2000, 107.1000], [10.5500, 107.0333]], modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ (QL51)', cost: 293.0, time: 1.0, co2: 263.7, distance: 586, color: 'blue' }] },
        { from: 'pleiku', to: 'tan_son_nhat', path: [[13.9833, 108.0000], [12.6666, 108.0333], [12.0000, 107.6800], [11.5333, 106.9000], [11.4167, 106.6500], [10.9800, 106.6800], [10.8185, 106.6525]], modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 253.0, time: 0.9, co2: 227.7, distance: 506, color: 'blue' }] },
        { from: 'pleiku', to: 'long_thanh', path: [[13.9833, 108.0000], [12.6666, 108.0333], [12.0000, 107.6800], [11.2000, 107.1000], [10.7800, 107.1500]], modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 274.5, time: 1.0, co2: 247.1, distance: 549, color: 'blue' }] },
        { from: 'pleiku', to: 'dong_dang', path: [[13.9833, 108.0000],[14.3500, 108.0000],[16.0471, 108.2068],[16.4637, 107.5909],[17.4686, 106.6242],[18.6734, 105.6813],[19.8067, 105.7851],[21.0285, 105.8542],[21.2731, 106.1946], [21.9438, 106.6972]], modes: [{ type: 'truck', icon: '🚚', name: 'Đường bộ', cost: 665.0, time: 2.1, co2: 598.5, distance: 1330, color: 'blue' }] },
        { from: 'dong_dang', to: 'istanbul', segments: [{ path: [[21.9438, 106.6972], [22.1100, 106.7600], [34.3416, 108.9398], [44.1300, 80.4200], [43.2220, 76.8512], [43.6500, 51.1500]], color: 'green', type: 'rail' }, { path: [[43.6500, 51.1500], [40.4093, 49.8671]], color: 'blue', type: 'ship' }, { path: [[40.4093, 49.8671], [41.7151, 44.8271], [40.6013, 43.0975], [41.0082, 28.9784]], color: 'green', type: 'rail' }], modes: [{ type: 'rail', icon: '🚂', name: 'Đường sắt & Phà (Middle Corridor)', cost: 3200.0, time: 18.0, co2: 1200.0, distance: 4764, color: 'green' }] },
        { from: 'tan_son_nhat', to: 'doha', path: [[10.8185, 106.6525], [16.0000, 98.0000], [22.0000, 80.0000], [26.0000, 65.0000], [25.2731, 51.6081]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13502.3, time: 0.9, co2: 18003.0, distance: 6001, color: 'purple' }] },
        { from: 'tan_son_nhat', to: 'hong_kong', path: [[10.8185, 106.6525], [16.0000, 110.0000], [22.3193, 114.1694]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 3348.0, time: 0.6, co2: 4464.0, distance: 1488, color: 'purple' }] },
        { from: 'tan_son_nhat', to: 'singapore', path: [[10.8185, 106.6525], [5.0000, 105.0000], [1.3644, 103.9915]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 2475.0, time: 0.6, co2: 3300.0, distance: 1100, color: 'purple' }] },
        { from: 'tan_son_nhat', to: 'dubai', path: [[10.8185, 106.6525], [16.0000, 95.0000], [25.2532, 55.3657]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 12654.0, time: 0.9, co2: 16872.0, distance: 5624, color: 'purple' }] },
        { from: 'long_thanh', to: 'singapore', path: [[10.7800, 107.1500], [6.0000, 105.0000], [1.3644, 103.9915]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 2475.0, time: 0.6, co2: 3300.0, distance: 1100, color: 'purple' }] },
        { from: 'long_thanh', to: 'dubai', path: [[10.7800, 107.1500], [18.0000, 80.0000], [25.2532, 55.3657]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 12654.0, time: 0.9, co2: 16872.0, distance: 5624, color: 'purple' }] },
        { from: 'long_thanh', to: 'doha', path: [[10.7800, 107.1500], [16.0000, 98.0000], [22.0000, 80.0000], [25.2731, 51.6081]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13502.3, time: 0.9, co2: 18003.0, distance: 6001, color: 'purple' }] },
        { from: 'long_thanh', to: 'hong_kong', path: [[10.7800, 107.1500], [16.0000, 110.0000], [22.3193, 114.1694]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 3348.0, time: 0.6, co2: 4464.0, distance: 1488, color: 'purple' }] },
        { from: 'cai_mep', to: 'singapore_port', path: [[10.5500, 107.0333], [7.0000, 105.0000], [3.0000, 104.8000], [1.6000, 104.6000], [1.3000, 104.3500], [1.2200, 104.0500], [1.2644, 103.8400]], modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 835.8, time: 3.8, co2: 417.9, distance: 1393, color: 'blue' }] },
        { from: 'cai_mep', to: 'jebel_ali', path: [[10.5500, 107.0333], [6.0000, 103.0000], [2.5000, 101.5000], [5.5000, 97.5000], [5.8000, 80.5000], [15.0000, 65.0000], [24.0000, 59.0000], [25.0145, 55.0592]], modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 1308.6, time: 19.4, co2: 654.3, distance: 8724, color: 'blue' }] },
        { from: 'cai_mep', to: 'hong_kong', path: [[10.5500, 107.0333], [15.0000, 112.0000], [22.3193, 114.1694]], modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 223.2, time: 4.0, co2: 111.6, distance: 1488, color: 'blue' }] },
        { from: 'singapore_port', to: 'singapore', path: [[1.2644, 103.8400], [1.3644, 103.9915]], modes: [{ type: 'truck', icon: '🚚', name: 'Trung chuyển Sea-Air', cost: 30.0, time: 0.1, co2: 10.0, distance: 20, color: 'blue' }] },
        { from: 'singapore_port', to: 'istanbul', path: [[1.2644, 103.8400], [2.5000, 101.5000], [5.5000, 97.5000], [5.8000, 80.5000], [12.0000, 52.0000], [12.6000, 43.4000], [20.0000, 38.5000], [27.8000, 34.0000], [29.9300, 32.5600], [31.2600, 32.3000], [34.0000, 27.0000], [36.5000, 25.5000], [40.0500, 26.2000], [40.7000, 27.8000], [41.0082, 28.9784]], modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển (Kênh Suez)', cost: 1838.9, time: 26.0, co2: 3677.7, distance: 12259, color: 'blue' }] },
        { from: 'doha', to: 'istanbul', path: [[25.2731, 51.6081], [30.0000, 45.0000], [36.0000, 36.0000], [41.2753, 28.7519]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 6201.0, time: 0.7, co2: 8268.0, distance: 2756, color: 'purple' }] },
        { from: 'dubai', to: 'istanbul', path: [[25.2532, 55.3657], [30.0000, 48.0000], [35.0000, 38.0000], [41.2753, 28.7519]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 6817.5, time: 0.7, co2: 9090.0, distance: 3030, color: 'purple' }] },
        { from: 'hong_kong', to: 'istanbul', path: [[22.3193, 114.1694], [30.0000, 95.0000], [38.0000, 70.0000], [40.0000, 50.0000], [41.2753, 28.7519]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 18047.3, time: 1.0, co2: 24063.0, distance: 8021, color: 'purple' }] },
        { from: 'singapore', to: 'doha', path: [[1.3644, 103.9915], [6.0000, 90.0000], [15.0000, 75.0000], [20.0000, 60.0000], [25.2731, 51.6081]], modes: [{ type: 'air', icon: '✈️', name: 'Đường hàng không', cost: 13963.5, time: 0.9, co2: 18618.0, distance: 6206, color: 'purple' }] },
        { from: 'jebel_ali', to: 'istanbul', path: [[25.0145, 55.0592], [24.0000, 59.0000], [15.0000, 65.0000], [12.6000, 43.4000], [20.0000, 38.5000], [27.8000, 34.0000], [29.9300, 32.5600], [31.2600, 32.3000], [34.0000, 27.0000], [36.5000, 25.5000], [40.0500, 26.2000], [40.7000, 27.8000], [41.2753, 28.7519]], modes: [{ type: 'ship', icon: '🚢', name: 'Đường biển', cost: 1195.4, time: 17.9, co2: 597.7, distance: 7969, color: 'blue' }] },
        { from: 'jebel_ali', to: 'dubai', path: [[25.0145, 55.0592], [25.2532, 55.3657]], modes: [{ type: 'truck', icon: '🚚', name: 'Trung chuyển Sea-Air', cost: 50.0, time: 0.1, co2: 18.0, distance: 40, color: 'blue' }] },
        { from: 'hong_kong', to: 'singapore', path: [[22.3080, 113.9185], [1.3644, 103.9915]], modes: [{ type: 'air', icon: '✈️', name: 'Hàng không', cost: 5800.5, time: 0.67, co2: 7734.0, distance: 2578, color: 'purple' }] },
        { from: 'hong_kong', to: 'dubai', path: [[22.3080, 113.9185], [25.2532, 55.3657]], modes: [{ type: 'air', icon: '✈️', name: 'Hàng không', cost: 13320.0, time: 0.89, co2: 17760.0, distance: 5920, color: 'purple' }] },
        { from: 'hong_kong', to: 'doha', path: [[22.3080, 113.9185], [25.2731, 51.6081]], modes: [{ type: 'air', icon: '✈️', name: 'Hàng không', cost: 14163.75, time: 0.92, co2: 18885.0, distance: 6295, color: 'purple' }] },
        { from: 'singapore', to: 'hong_kong', path: [[1.3644, 103.9915], [22.3080, 113.9185]], modes: [{ type: 'air', icon: '✈️', name: 'Hàng không', cost: 5773.5, time: 0.67, co2: 7698.0, distance: 2566, color: 'purple' }] },
        { from: 'singapore', to: 'dubai', path: [[1.3644, 103.9915], [25.2532, 55.3657]], modes: [{ type: 'air', icon: '✈️', name: 'Hàng không', cost: 13153.5, time: 0.89, co2: 17538.0, distance: 5846, color: 'purple' }] }
    ];

    const introScreen = document.getElementById('intro-screen');
    const mapScreen = document.getElementById('map-screen');

    if (sessionStorage.getItem('appStarted') === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (mapScreen) mapScreen.style.display = 'block';
        updateStatsUI();
        initMap();
        setTimeout(() => { if(map) map.invalidateSize(); }, 100);
        startTimer();
    } else {
        if (introScreen) introScreen.style.display = 'block';
        if (mapScreen) mapScreen.style.display = 'none';
    }

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            sessionStorage.setItem('appStarted', 'true');
            sessionStorage.setItem('timerEndTime', Date.now() + 10 * 60 * 1000);
            if (introScreen) introScreen.style.display = 'none';
            if (mapScreen) mapScreen.style.display = 'block';
            initMap();
            setTimeout(() => { if(map) map.invalidateSize(); }, 100);
            startTimer();
        });
    }

    function initMap() {
        if (map) return; 
        map = L.map('map', { center: [15.0, 107.0], zoom: 5, minZoom: 2, maxZoom: 15 });
        markersGroup = L.layerGroup().addTo(map);

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
    markersGroup.clearLayers();

    Object.keys(hubs).forEach(hubId => {
        if (hubId === currentHubId) return; 

        const nextHub = hubs[hubId];
        const route = routes.find(r => r.from === currentHubId && r.to === hubId);
        const isReachable = !!route; 
        const marker = L.circleMarker([nextHub.lat, nextHub.lng], {
            radius: isReachable ? 8 : 6,
            fillColor: isReachable ? '#27ae60' : '#e74c3c', 
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(markersGroup);
        marker.bindTooltip(nextHub.name, { 
            permanent: true, 
            direction: 'bottom', 
            className: 'hub-label' 
        });

        if (isReachable) {
                       let popupContent = `<div class="mode-selection-popup">`;
            route.modes.forEach((mode, index) => { 
                popupContent += `<div class="mode-btn" onclick="selectMode('${hubId}', ${index})" title="${mode.name} (${mode.distance} km)">${mode.icon}</div>`; 
            });
            popupContent += `</div>`;
            marker.bindPopup(popupContent);
        } else {
                       marker.bindPopup(`
                <div style="padding: 4px; font-size: 12px; text-align: center;">
                    🔒 <b>${nextHub.name}</b><br>
                    <span style="color: #666; font-size: 11px;">Trạm quốc tế (Hãy di chuyển đến điểm trung chuyển để mở tuyến)</span>
                </div>
            `);
        }
    });
}
    window.selectMode = function(nextHubId, modeIndex) {
        const route = routes.find(r => r.from === currentHubId && r.to === nextHubId);
        const selectedMode = route.modes[modeIndex];
        const nextHub = hubs[nextHubId];
        
        if (route.segments) {
            route.segments.forEach(seg => {
                L.polyline(seg.path, {
                    color: seg.color || selectedMode.color, 
                    weight: 4, 
                    dashArray: seg.type === 'air' ? '6, 6' : (seg.type === 'rail' ? '12, 6' : null)
                }).addTo(map);
            });
        } else {
            const routeCoords = route.path ? route.path : [
                [hubs[currentHubId].lat, hubs[currentHubId].lng], 
                [nextHub.lat, nextHub.lng]
            ];
            
            L.polyline(routeCoords, {
                color: selectedMode.color, 
                weight: 4, 
                dashArray: selectedMode.type === 'air' ? '6, 6' : (selectedMode.type === 'rail' ? '12, 6' : null)
            }).addTo(map);
        }
        
        currentLocationMarker.setLatLng([nextHub.lat, nextHub.lng]);
        currentLocationMarker.bindTooltip(nextHub.name, { permanent: true, direction: 'bottom', className: 'hub-label' });
        
        totalCost += selectedMode.cost; 
        totalTime += selectedMode.time; 
        totalCO2 += selectedMode.co2;
        totalDistance += selectedMode.distance;
        
        updateStatsUI();
        currentHubId = nextHubId; 
        map.closePopup(); 

        // Đã đến đích ISTANBUL
        if (currentHubId === 'istanbul') {
            if (window.timerInterval) clearInterval(window.timerInterval);
            setTimeout(() => {
                alert(`🎉 CHÚC MỪNG BẠN ĐÃ ĐẾN ISTANBUL!\n\n` +
                      `⏱ Thời gian: ${totalTime.toFixed(1)} ngày\n` +
                      `💵 Chi phí: $${totalCost.toLocaleString('en-US')}\n` +
                      `🌿 Lượng phát thải: ${totalCO2.toLocaleString('en-US')} kg CO₂\n` +
                      `🗺 Tổng quãng đường: ${totalDistance.toLocaleString('en-US')} km`);
            }, 300);
            markersGroup.clearLayers();
            return;
        }

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
            endTime = now + 10 * 60 * 1000;
            sessionStorage.setItem('timerEndTime', endTime);
        }

        window.timerInterval = setInterval(function () {
            let currentEndTime = parseInt(sessionStorage.getItem('timerEndTime')) || (Date.now() + 10 * 60 * 1000);
            let timeLeft = Math.floor((currentEndTime - Date.now()) / 1000);

            if (timeLeft <= 0) {
                timeLeft = 0;
                clearInterval(window.timerInterval); 
                display.textContent = "00:00";
                
                // Hiển thị modal hết giờ đúng chuẩn UI
                const timeoutModal = document.getElementById('timeout-modal');
                if (timeoutModal) {
                    timeoutModal.style.display = 'flex';
                }
                return;
            }

            let m = parseInt(timeLeft / 60, 10), s = parseInt(timeLeft % 60, 10);
            display.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        }, 1000);
    }
});
