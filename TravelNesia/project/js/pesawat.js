document.addEventListener('DOMContentLoaded', function() {
    const flightForm = document.getElementById('flightForm');
    
    if (flightForm) {
        flightForm.addEventListener('submit', handleFlightSearch);
    }

    // Prevent same origin and destination
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    
    if (fromSelect && toSelect) {
        fromSelect.addEventListener('change', updateDestinationOptions);
        toSelect.addEventListener('change', updateOriginOptions);
    }

    // Set return date minimum to departure date
    const departureInput = document.getElementById('departure');
    const returnInput = document.getElementById('return');
    
    if (departureInput && returnInput) {
        departureInput.addEventListener('change', function() {
            returnInput.min = this.value;
            if (returnInput.value && returnInput.value < this.value) {
                returnInput.value = this.value;
            }
        });
    }
});

function updateDestinationOptions() {
    const fromValue = document.getElementById('from').value;
    const toSelect = document.getElementById('to');
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

function updateOriginOptions() {
    const toValue = document.getElementById('to').value;
    const fromSelect = document.getElementById('from');
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

function handleFlightSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = {
        from: formData.get('from'),
        to: formData.get('to'),
        departure: formData.get('departure'),
        return: formData.get('return'),
        passengers: formData.get('passengers'),
        class: formData.get('class')
    };

    // Validate required fields
    const errors = window.TravelNesia.validateForm(searchData, ['from', 'to', 'departure', 'passengers', 'class']);
    
    if (errors.length > 0) {
        window.TravelNesia.showAlert('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }

    if (searchData.from === searchData.to) {
        window.TravelNesia.showAlert('Kota asal dan tujuan tidak boleh sama', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('.btn-search');
    const hideLoading = window.TravelNesia.showLoading(submitBtn);

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        performFlightSearch(searchData);
    }, 1500);
}

function performFlightSearch(searchData) {
    // Save search to history
    window.TravelNesia.saveSearchHistory(searchData, 'flight');

    // Generate dummy flight data
    const flights = generateFlightResults(searchData);
    
    // Display results
    window.TravelNesia.displayResults(flights, 'resultsGrid', generateFlightCard);
}

function generateFlightResults(searchData) {
    const airlines = [
        { name: 'Garuda Indonesia', code: 'GA', logo: '🛫' },
        { name: 'Lion Air', code: 'JT', logo: '🦁' },
        { name: 'Sriwijaya Air', code: 'SJ', logo: '🛩️' },
        { name: 'Citilink', code: 'QG', logo: '✈️' },
        { name: 'Batik Air', code: 'ID', logo: '🎨' },
        { name: 'Indonesia AirAsia', code: 'QZ', logo: '🔴' }
    ];

    const flights = [];
    const basePrice = getBasePrice(searchData.from, searchData.to, searchData.class);
    
    for (let i = 0; i < 6; i++) {
        const airline = airlines[i % airlines.length];
        const departureTime = generateRandomTime();
        const flightDuration = generateFlightDuration(searchData.from, searchData.to);
        const arrivalTime = calculateArrivalTime(departureTime, flightDuration);
        const price = basePrice + (Math.random() * 500000) - 250000;
        
        flights.push({
            id: `${airline.code}${Math.floor(Math.random() * 1000)}`,
            airline: airline.name,
            airlineCode: airline.code,
            logo: airline.logo,
            from: searchData.from,
            to: searchData.to,
            departure: departureTime,
            arrival: arrivalTime,
            duration: flightDuration,
            price: Math.round(price / 10000) * 10000,
            class: searchData.class,
            seats: Math.floor(Math.random() * 20) + 5,
            stops: Math.random() > 0.7 ? 1 : 0
        });
    }

    return flights.sort((a, b) => a.price - b.price);
}

function getBasePrice(from, to, flightClass) {
    const distances = {
        'CGK-SUB': 600000, 'CGK-DPS': 1200000, 'CGK-MDN': 1500000,
        'CGK-BDO': 300000, 'SUB-DPS': 800000, 'DPS-MDN': 2000000
    };
    
    const route = `${from}-${to}`;
    const reverseRoute = `${to}-${from}`;
    
    let basePrice = distances[route] || distances[reverseRoute] || 800000;
    
    switch (flightClass) {
        case 'business':
            basePrice *= 2.5;
            break;
        case 'first':
            basePrice *= 4;
            break;
        default:
            break;
    }
    
    return basePrice;
}

function generateRandomTime() {
    const hours = Math.floor(Math.random() * 20) + 4; // 04:00 - 23:59
    const minutes = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateFlightDuration(from, to) {
    const durations = {
        'CGK-SUB': '1j 15m', 'CGK-DPS': '2j 30m', 'CGK-MDN': '2j 45m',
        'CGK-BDO': '45m', 'SUB-DPS': '1j 45m', 'DPS-MDN': '4j 15m'
    };
    
    const route = `${from}-${to}`;
    const reverseRoute = `${to}-${from}`;
    
    return durations[route] || durations[reverseRoute] || '2j 00m';
}

function calculateArrivalTime(departure, duration) {
    const [depHour, depMin] = departure.split(':').map(Number);
    const [durHour, durMin] = duration.split(/[jm]/).filter(Boolean).map(Number);
    
    let arrivalHour = depHour + durHour;
    let arrivalMin = depMin + durMin;
    
    if (arrivalMin >= 60) {
        arrivalHour += 1;
        arrivalMin -= 60;
    }
    
    if (arrivalHour >= 24) {
        arrivalHour -= 24;
    }
    
    return `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;
}

function generateFlightCard(flight) {
    const cityNames = {
        'CGK': 'Jakarta',
        'SUB': 'Surabaya',
        'DPS': 'Denpasar',
        'BDO': 'Bandung',
        'MDN': 'Medan',
        'PLM': 'Palembang',
        'BPN': 'Balikpapan',
        'UPG': 'Makassar',
        'SOC': 'Solo',
        'MLG': 'Malang'
    };

    const stopText = flight.stops === 0 ? 'Langsung' : `${flight.stops} transit`;
    
    return `
        <div class="result-card">
            <div class="result-info">
                <div class="result-header">
                    <div>
                        <div class="result-name">${flight.logo} ${flight.airline}</div>
                        <div class="result-detail">${flight.airlineCode}-${flight.id.slice(-3)}</div>
                    </div>
                    <div class="result-price">${window.TravelNesia.formatPrice(flight.price)}</div>
                </div>
                
                <div class="result-details">
                    <div class="result-detail">
                        <span>🛫</span>
                        <span>${flight.departure} - ${cityNames[flight.from]} (${flight.from})</span>
                    </div>
                    <div class="result-detail">
                        <span>🛬</span>
                        <span>${flight.arrival} - ${cityNames[flight.to]} (${flight.to})</span>
                    </div>
                    <div class="result-detail">
                        <span>⏱️</span>
                        <span>${flight.duration} • ${stopText}</span>
                    </div>
                    <div class="result-detail">
                        <span>💺</span>
                        <span>Sisa ${flight.seats} kursi • Kelas ${flight.class}</span>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="btn-book" onclick="bookFlight('${flight.id}')">Pesan Sekarang</button>
                    <button class="btn-details" onclick="showFlightDetails('${flight.id}')">Detail</button>
                </div>
            </div>
        </div>
    `;
}

function bookFlight(flightId) {
    const submitBtn = event.target;
    const hideLoading = window.TravelNesia.showLoading(submitBtn);
    
    // Simulate booking process
    setTimeout(() => {
        hideLoading();
        window.TravelNesia.showAlert(`Penerbangan ${flightId} berhasil dipesan! Silakan lanjutkan ke pembayaran.`, 'success');
        
        // In a real app, redirect to payment page
        setTimeout(() => {
            window.TravelNesia.showAlert('Redirecting ke halaman pembayaran...', 'warning');
        }, 2000);
    }, 2000);
}

function showFlightDetails(flightId) {
    alert(`Menampilkan detail penerbangan ${flightId}.\n\nFitur detail akan tersedia di versi selanjutnya.`);
}