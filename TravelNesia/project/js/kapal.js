document.addEventListener('DOMContentLoaded', function() {
    const shipForm = document.getElementById('shipForm');
    
    if (shipForm) {
        shipForm.addEventListener('submit', handleShipSearch);
    }

    // Prevent same origin and destination
    const fromPort = document.getElementById('fromPort');
    const toPort = document.getElementById('toPort');
    
    if (fromPort && toPort) {
        fromPort.addEventListener('change', updateToPortOptions);
        toPort.addEventListener('change', updateFromPortOptions);
    }
});

function updateToPortOptions() {
    const fromValue = document.getElementById('fromPort').value;
    const toSelect = document.getElementById('toPort');
    const toOptions = toSelect.querySelectorAll('option');
    
    toOptions.forEach(option => {
        if (option.value === fromValue) {
            option.disabled = true;
            option.style.display = 'none';
        } else {
            option.disabled = false;
            option.style.display = 'block';
        }
    });
    
    if (toSelect.value === fromValue) {
        toSelect.value = '';
    }
}

function updateFromPortOptions() {
    const toValue = document.getElementById('toPort').value;
    const fromSelect = document.getElementById('fromPort');
    const fromOptions = fromSelect.querySelectorAll('option');
    
    fromOptions.forEach(option => {
        if (option.value === toValue) {
            option.disabled = true;
            option.style.display = 'none';
        } else {
            option.disabled = false;
            option.style.display = 'block';
        }
    });
    
    if (fromSelect.value === toValue) {
        fromSelect.value = '';
    }
}

function handleShipSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = {
        fromPort: formData.get('fromPort'),
        toPort: formData.get('toPort'),
        shipDate: formData.get('shipDate'),
        shipPassengers: formData.get('shipPassengers'),
        shipClass: formData.get('shipClass'),
        vehicle: formData.get('vehicle')
    };

    // Validate required fields
    const errors = window.TravelNesia.validateForm(searchData, ['fromPort', 'toPort', 'shipDate', 'shipPassengers', 'shipClass']);
    
    if (errors.length > 0) {
        window.TravelNesia.showAlert('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }

    if (searchData.fromPort === searchData.toPort) {
        window.TravelNesia.showAlert('Pelabuhan asal dan tujuan tidak boleh sama', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('.btn-search');
    const hideLoading = window.TravelNesia.showLoading(submitBtn);

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        performShipSearch(searchData);
    }, 1500);
}

function performShipSearch(searchData) {
    // Save search to history
    window.TravelNesia.saveSearchHistory(searchData, 'ship');

    // Generate dummy ship data
    const ships = generateShipResults(searchData);
    
    // Display results
    window.TravelNesia.displayResults(ships, 'shipResultsGrid', generateShipCard);
}

function generateShipResults(searchData) {
    const shipLines = [
        { name: 'PELNI', ships: ['KM Bukit Raya', 'KM Kelud', 'KM Lambelu'], logo: '🚢' },
        { name: 'ASDP', ships: ['KMP Portlink I', 'KMP Portlink II', 'KMP Jokowi'], logo: '⛴️' },
        { name: 'Dharma Lautan Utama', ships: ['KM Marina', 'KM Oceania', 'KM Pacifica'], logo: '🛳️' },
        { name: 'Tanto Intim Line', ships: ['KM Express Bahari', 'KM Tanto Prima', 'KM Nusantara'], logo: '🚤' }
    ];

    const ships = [];
    const basePrice = getShipBasePrice(searchData.fromPort, searchData.toPort, searchData.shipClass);
    
    for (let i = 0; i < 4; i++) {
        const shipLine = shipLines[i];
        const shipName = shipLine.ships[Math.floor(Math.random() * shipLine.ships.length)];
        const departureTime = generateShipTime();
        const duration = generateShipDuration(searchData.fromPort, searchData.toPort);
        const arrivalTime = calculateShipArrivalTime(departureTime, duration);
        const price = basePrice + (Math.random() * 300000) - 150000;
        
        let totalPrice = Math.round(price / 10000) * 10000;
        
        // Add vehicle fee if applicable
        if (searchData.vehicle && searchData.vehicle !== 'no') {
            totalPrice += getVehicleFee(searchData.vehicle);
        }
        
        ships.push({
            id: `${shipLine.name.replace(/\s+/g, '')}${Math.floor(Math.random() * 100)}`,
            shipName: shipName,
            company: shipLine.name,
            logo: shipLine.logo,
            fromPort: searchData.fromPort,
            toPort: searchData.toPort,
            departure: departureTime,
            arrival: arrivalTime,
            duration: duration,
            price: totalPrice,
            class: searchData.shipClass,
            seats: Math.floor(Math.random() * 50) + 20,
            facilities: getShipFacilities(searchData.shipClass),
            vehicle: searchData.vehicle
        });
    }

    return ships.sort((a, b) => a.price - b.price);
}

function getShipBasePrice(fromPort, toPort, shipClass) {
    const distances = {
        'TNJ-SBY': 200000, 'TNJ-DPS': 400000, 'TNJ-MKS': 800000,
        'TNJ-AMB': 1200000, 'SBY-DPS': 300000, 'DPS-MKS': 600000,
        'MKS-AMB': 700000, 'AMB-JYP': 900000
    };
    
    const route = `${fromPort}-${toPort}`;
    const reverseRoute = `${toPort}-${fromPort}`;
    
    let basePrice = distances[route] || distances[reverseRoute] || 500000;
    
    switch (shipClass) {
        case 'vip':
            basePrice *= 3;
            break;
        case 'kelas1':
            basePrice *= 2;
            break;
        case 'kelas2':
            basePrice *= 1.5;
            break;
        default:
            break;
    }
    
    return basePrice;
}

function getVehicleFee(vehicleType) {
    const fees = {
        'motor': 50000,
        'mobil': 200000,
        'truck': 500000
    };
    
    return fees[vehicleType] || 0;
}

function generateShipTime() {
    const hours = Math.floor(Math.random() * 16) + 6; // 06:00 - 21:59
    const minutes = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateShipDuration(fromPort, toPort) {
    const durations = {
        'TNJ-SBY': '18j 00m', 'TNJ-DPS': '24j 00m', 'TNJ-MKS': '36j 00m',
        'TNJ-AMB': '48j 00m', 'SBY-DPS': '12j 00m', 'DPS-MKS': '20j 00m',
        'MKS-AMB': '24j 00m', 'AMB-JYP': '30j 00m'
    };
    
    const route = `${fromPort}-${toPort}`;
    const reverseRoute = `${toPort}-${fromPort}`;
    
    return durations[route] || durations[reverseRoute] || '24j 00m';
}

function calculateShipArrivalTime(departure, duration) {
    const [depHour, depMin] = departure.split(':').map(Number);
    const [durHour, durMin] = duration.split(/[jm]/).filter(Boolean).map(Number);
    
    let arrivalHour = depHour + durHour;
    let arrivalMin = depMin + durMin;
    
    if (arrivalMin >= 60) {
        arrivalHour += 1;
        arrivalMin -= 60;
    }
    
    // Calculate days
    const days = Math.floor(arrivalHour / 24);
    arrivalHour = arrivalHour % 24;
    
    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;
    return days > 0 ? `${arrivalTime} (+${days})` : arrivalTime;
}

function getShipFacilities(shipClass) {
    const baseFacilities = ['Kamar Mandi', 'Musholla', 'Kantin'];
    
    if (shipClass === 'vip') {
        baseFacilities.push('AC', 'TV', 'Kamar Pribadi', 'WiFi');
    } else if (shipClass === 'kelas1') {
        baseFacilities.push('AC', 'TV', 'Tempat Tidur');
    } else if (shipClass === 'kelas2') {
        baseFacilities.push('Kipas Angin', 'Tempat Tidur');
    }
    
    return baseFacilities;
}

function generateShipCard(ship) {
    const portNames = {
        'TNJ': 'Tanjung Priok (Jakarta)',
        'SBY': 'Surabaya',
        'BPN': 'Balikpapan',
        'DPS': 'Benoa (Bali)',
        'MDN': 'Belawan (Medan)',
        'MKS': 'Makassar',
        'AMB': 'Ambon',
        'JYP': 'Jayapura',
        'BTM': 'Batam',
        'PLB': 'Palembang'
    };

    const facilitiesHtml = ship.facilities.map(facility => 
        `<span class="amenity-tag">${facility}</span>`
    ).join('');

    const vehicleInfo = ship.vehicle && ship.vehicle !== 'no' 
        ? `<div class="result-detail">
               <span>🚗</span>
               <span>Dengan ${ship.vehicle}</span>
           </div>` 
        : '';
    
    return `
        <div class="result-card">
            <div class="result-info">
                <div class="result-header">
                    <div>
                        <div class="result-name">${ship.logo} ${ship.shipName}</div>
                        <div class="result-detail">${ship.company}</div>
                    </div>
                    <div class="result-price">${window.TravelNesia.formatPrice(ship.price)}</div>
                </div>
                
                <div class="result-details">
                    <div class="result-detail">
                        <span>🛳️</span>
                        <span>${ship.departure} - ${portNames[ship.fromPort]}</span>
                    </div>
                    <div class="result-detail">
                        <span>⚓</span>
                        <span>${ship.arrival} - ${portNames[ship.toPort]}</span>
                    </div>
                    <div class="result-detail">
                        <span>⏱️</span>
                        <span>Perjalanan ${ship.duration}</span>
                    </div>
                    <div class="result-detail">
                        <span>💺</span>
                        <span>Sisa ${ship.seats} tempat • Kelas ${ship.class}</span>
                    </div>
                    ${vehicleInfo}
                </div>
                
                <div class="hotel-amenities">
                    ${facilitiesHtml}
                </div>
                
                <div class="result-actions">
                    <button class="btn-book" onclick="bookShip('${ship.id}')">Pesan Sekarang</button>
                    <button class="btn-details" onclick="showShipDetails('${ship.id}')">Detail</button>
                </div>
            </div>
        </div>
    `;
}

function bookShip(shipId) {
    const submitBtn = event.target;
    const hideLoading = window.TravelNesia.showLoading(submitBtn);
    
    // Simulate booking process
    setTimeout(() => {
        hideLoading();
        window.TravelNesia.showAlert(`Kapal ${shipId} berhasil dipesan! Silakan lanjutkan ke pembayaran.`, 'success');
        
        // In a real app, redirect to payment page
        setTimeout(() => {
            window.TravelNesia.showAlert('Redirecting ke halaman pembayaran...', 'warning');
        }, 2000);
    }, 2000);
}

function showShipDetails(shipId) {
    alert(`Menampilkan detail kapal ${shipId}.\n\nFitur detail akan tersedia di versi selanjutnya.`);
}