document.addEventListener('DOMContentLoaded', function() {
    const trainForm = document.getElementById('trainForm');
    
    if (trainForm) {
        trainForm.addEventListener('submit', handleTrainSearch);
    }

    // Prevent same origin and destination
    const fromStation = document.getElementById('fromStation');
    const toStation = document.getElementById('toStation');
    
    if (fromStation && toStation) {
        fromStation.addEventListener('change', updateToStationOptions);
        toStation.addEventListener('change', updateFromStationOptions);
    }
});

function updateToStationOptions() {
    const fromValue = document.getElementById('fromStation').value;
    const toSelect = document.getElementById('toStation');
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

function updateFromStationOptions() {
    const toValue = document.getElementById('toStation').value;
    const fromSelect = document.getElementById('fromStation');
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

function handleTrainSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = {
        fromStation: formData.get('fromStation'),
        toStation: formData.get('toStation'),
        trainDate: formData.get('trainDate'),
        trainPassengers: formData.get('trainPassengers'),
        trainClass: formData.get('trainClass'),
        trainType: formData.get('trainType')
    };

    // Validate required fields
    const errors = window.TravelNesia.validateForm(searchData, ['fromStation', 'toStation', 'trainDate', 'trainPassengers', 'trainClass']);
    
    if (errors.length > 0) {
        window.TravelNesia.showAlert('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }

    if (searchData.fromStation === searchData.toStation) {
        window.TravelNesia.showAlert('Stasiun asal dan tujuan tidak boleh sama', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('.btn-search');
    const hideLoading = window.TravelNesia.showLoading(submitBtn);

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        performTrainSearch(searchData);
    }, 1500);
}

function performTrainSearch(searchData) {
    // Save search to history
    window.TravelNesia.saveSearchHistory(searchData, 'train');

    // Generate dummy train data
    const trains = generateTrainResults(searchData);
    
    // Display results
    window.TravelNesia.displayResults(trains, 'trainResultsGrid', generateTrainCard);
}

function generateTrainResults(searchData) {
    const trainTypes = [
        { name: 'Argo Bromo Anggrek', type: 'argo', logo: '🚄' },
        { name: 'Gajayana', type: 'gajayana', logo: '🚅' },
        { name: 'Taksaka', type: 'taksaka', logo: '🚆' },
        { name: 'Lodaya', type: 'lodaya', logo: '🚇' },
        { name: 'Bima', type: 'bima', logo: '🚈' },
        { name: 'Sancaka', type: 'sancaka', logo: '🚉' }
    ];

    const trains = [];
    const basePrice = getTrainBasePrice(searchData.fromStation, searchData.toStation, searchData.trainClass);
    
    for (let i = 0; i < 5; i++) {
        const train = trainTypes[i % trainTypes.length];
        const departureTime = generateTrainTime();
        const duration = generateTrainDuration(searchData.fromStation, searchData.toStation);
        const arrivalTime = calculateTrainArrivalTime(departureTime, duration);
        const price = basePrice + (Math.random() * 200000) - 100000;
        
        // Filter by train type if specified
        if (searchData.trainType && train.type !== searchData.trainType) {
            continue;
        }
        
        trains.push({
            id: `${train.type.toUpperCase()}${Math.floor(Math.random() * 100)}`,
            name: train.name,
            type: train.type,
            logo: train.logo,
            fromStation: searchData.fromStation,
            toStation: searchData.toStation,
            departure: departureTime,
            arrival: arrivalTime,
            duration: duration,
            price: Math.round(price / 5000) * 5000,
            class: searchData.trainClass,
            seats: Math.floor(Math.random() * 30) + 10,
            facilities: getTrainFacilities(train.type, searchData.trainClass)
        });
    }

    return trains.sort((a, b) => a.price - b.price);
}

function getTrainBasePrice(fromStation, toStation, trainClass) {
    const distances = {
        'GMR-SGU': 120000, 'GMR-YK': 100000, 'GMR-BD': 60000,
        'GMR-SLO': 110000, 'SGU-YK': 80000, 'YK-SLO': 40000
    };
    
    const route = `${fromStation}-${toStation}`;
    const reverseRoute = `${toStation}-${fromStation}`;
    
    let basePrice = distances[route] || distances[reverseRoute] || 90000;
    
    switch (trainClass) {
        case 'eksekutif':
            basePrice *= 2;
            break;
        case 'bisnis':
            basePrice *= 1.5;
            break;
        default:
            break;
    }
    
    return basePrice;
}

function generateTrainTime() {
    const hours = Math.floor(Math.random() * 18) + 5; // 05:00 - 22:59
    const minutes = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateTrainDuration(fromStation, toStation) {
    const durations = {
        'GMR-SGU': '8j 30m', 'GMR-YK': '7j 45m', 'GMR-BD': '3j 15m',
        'GMR-SLO': '7j 00m', 'SGU-YK': '5j 30m', 'YK-SLO': '2j 15m'
    };
    
    const route = `${fromStation}-${toStation}`;
    const reverseRoute = `${toStation}-${fromStation}`;
    
    return durations[route] || durations[reverseRoute] || '6j 00m';
}

function calculateTrainArrivalTime(departure, duration) {
    const [depHour, depMin] = departure.split(':').map(Number);
    const [durHour, durMin] = duration.split(/[jm]/).filter(Boolean).map(Number);
    
    let arrivalHour = depHour + durHour;
    let arrivalMin = depMin + durMin;
    
    if (arrivalMin >= 60) {
        arrivalHour += 1;
        arrivalMin -= 60;
    }
    
    // Handle next day
    const nextDay = arrivalHour >= 24;
    if (nextDay) {
        arrivalHour -= 24;
    }
    
    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;
    return nextDay ? `${arrivalTime} (+1)` : arrivalTime;
}

function getTrainFacilities(trainType, trainClass) {
    const baseFacilities = ['AC', 'Toilet'];
    
    if (trainClass === 'eksekutif') {
        baseFacilities.push('WiFi', 'Makan', 'Reclining Seat');
    } else if (trainClass === 'bisnis') {
        baseFacilities.push('WiFi', 'Snack');
    }
    
    if (['argo', 'gajayana'].includes(trainType)) {
        baseFacilities.push('Premium Service');
    }
    
    return baseFacilities;
}

function generateTrainCard(train) {
    const stationNames = {
        'GMR': 'Gambir (Jakarta)',
        'PSE': 'Pasar Senen (Jakarta)',
        'SGU': 'Surabaya Gubeng',
        'YK': 'Yogyakarta',
        'BD': 'Bandung',
        'SLO': 'Solo Balapan',
        'SMG': 'Semarang Tawang',
        'MLG': 'Malang',
        'PWK': 'Purwokerto',
        'KA': 'Karawang'
    };

    const facilitiesHtml = train.facilities.map(facility => 
        `<span class="amenity-tag">${facility}</span>`
    ).join('');
    
    return `
        <div class="result-card">
            <div class="result-info">
                <div class="result-header">
                    <div>
                        <div class="result-name">${train.logo} ${train.name}</div>
                        <div class="result-detail">Kereta ${train.id}</div>
                    </div>
                    <div class="result-price">${window.TravelNesia.formatPrice(train.price)}</div>
                </div>
                
                <div class="result-details">
                    <div class="result-detail">
                        <span>🚉</span>
                        <span>${train.departure} - ${stationNames[train.fromStation]}</span>
                    </div>
                    <div class="result-detail">
                        <span>🏁</span>
                        <span>${train.arrival} - ${stationNames[train.toStation]}</span>
                    </div>
                    <div class="result-detail">
                        <span>⏱️</span>
                        <span>Perjalanan ${train.duration}</span>
                    </div>
                    <div class="result-detail">
                        <span>💺</span>
                        <span>Sisa ${train.seats} kursi • Kelas ${train.class}</span>
                    </div>
                </div>
                
                <div class="hotel-amenities">
                    ${facilitiesHtml}
                </div>
                
                <div class="result-actions">
                    <button class="btn-book" onclick="bookTrain('${train.id}')">Pesan Sekarang</button>
                    <button class="btn-details" onclick="showTrainDetails('${train.id}')">Detail</button>
                </div>
            </div>
        </div>
    `;
}

function bookTrain(trainId) {
    const submitBtn = event.target;
    const hideLoading = window.TravelNesia.showLoading(submitBtn);
    
    // Simulate booking process
    setTimeout(() => {
        hideLoading();
        window.TravelNesia.showAlert(`Kereta ${trainId} berhasil dipesan! Silakan lanjutkan ke pembayaran.`, 'success');
        
        // In a real app, redirect to payment page
        setTimeout(() => {
            window.TravelNesia.showAlert('Redirecting ke halaman pembayaran...', 'warning');
        }, 2000);
    }, 2000);
}

function showTrainDetails(trainId) {
    alert(`Menampilkan detail kereta ${trainId}.\n\nFitur detail akan tersedia di versi selanjutnya.`);
}