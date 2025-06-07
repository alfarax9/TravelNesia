document.addEventListener('DOMContentLoaded', function() {
    const hotelForm = document.getElementById('hotelForm');
    
    if (hotelForm) {
        hotelForm.addEventListener('submit', handleHotelSearch);
    }

    // Set checkout date minimum to checkin date
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput && checkoutInput) {
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            checkoutInput.min = nextDay.toISOString().split('T')[0];
            if (checkoutInput.value && checkoutInput.value <= this.value) {
                checkoutInput.value = nextDay.toISOString().split('T')[0];
            }
        });
    }
});

function handleHotelSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = {
        city: formData.get('city'),
        checkin: formData.get('checkin'),
        checkout: formData.get('checkout'),
        guests: formData.get('guests'),
        rooms: formData.get('rooms'),
        priceRange: formData.get('priceRange')
    };

    // Validate required fields
    const errors = window.TravelNesia.validateForm(searchData, ['city', 'checkin', 'checkout', 'guests', 'rooms']);
    
    if (errors.length > 0) {
        window.TravelNesia.showAlert('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }

    // Validate dates
    const checkinDate = new Date(searchData.checkin);
    const checkoutDate = new Date(searchData.checkout);
    
    if (checkoutDate <= checkinDate) {
        window.TravelNesia.showAlert('Tanggal check-out harus setelah check-in', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('.btn-search');
    const hideLoading = window.TravelNesia.showLoading(submitBtn);

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        performHotelSearch(searchData);
    }, 1500);
}

function performHotelSearch(searchData) {
    // Save search to history
    window.TravelNesia.saveSearchHistory(searchData, 'hotel');

    // Generate dummy hotel data
    const hotels = generateHotelResults(searchData);
    
    // Display results
    window.TravelNesia.displayResults(hotels, 'hotelResultsGrid', generateHotelCard);
}

function generateHotelResults(searchData) {
    const hotelChains = [
        { name: 'Aston', types: ['Hotel', 'Inn', 'Resort'], star: [3, 4, 5] },
        { name: 'Swiss-Belhotel', types: ['Hotel', 'Resort'], star: [4, 5] },
        { name: 'Novotel', types: ['Hotel', 'Resort'], star: [4, 5] },
        { name: 'Mercure', types: ['Hotel'], star: [4] },
        { name: 'Hotel Santika', types: ['Hotel', 'Premiere'], star: [3, 4] },
        { name: 'Grand Zuri', types: ['Hotel'], star: [3, 4] },
        { name: 'MaxOneHotels', types: ['Hotel'], star: [3] },
        { name: 'Favehotel', types: ['Hotel'], star: [3] }
    ];

    const cityAreas = {
        'jakarta': ['Menteng', 'Sudirman', 'Kuningan', 'Kemang', 'Senayan'],
        'surabaya': ['Tunjungan', 'Gubeng', 'Darmo', 'Wiyung', 'Pakuwon'],
        'bali': ['Seminyak', 'Kuta', 'Sanur', 'Ubud', 'Nusa Dua'],
        'bandung': ['Dago', 'Pasteur', 'Setiabudhi', 'Cihampelas', 'Braga'],
        'yogyakarta': ['Malioboro', 'Prawirotaman', 'Jalan Solo', 'UGM', 'Kraton']
    };

    const hotels = [];
    const nights = calculateNights(searchData.checkin, searchData.checkout);
    
    for (let i = 0; i < 8; i++) {
        const chain = hotelChains[i % hotelChains.length];
        const type = chain.types[Math.floor(Math.random() * chain.types.length)];
        const star = chain.star[Math.floor(Math.random() * chain.star.length)];
        const areas = cityAreas[searchData.city] || ['Pusat Kota', 'Bisnis', 'Wisata'];
        const area = areas[Math.floor(Math.random() * areas.length)];
        
        const hotelName = `${chain.name} ${type} ${area}`;
        const basePrice = getHotelBasePrice(searchData.city, star);
        const totalPrice = basePrice * nights * parseInt(searchData.rooms);
        
        // Filter by price range if specified
        if (searchData.priceRange && !isPriceInRange(basePrice, searchData.priceRange)) {
            continue;
        }
        
        hotels.push({
            id: `HTL${Date.now()}${i}`,
            name: hotelName,
            star: star,
            area: area,
            city: searchData.city,
            pricePerNight: basePrice,
            totalPrice: totalPrice,
            nights: nights,
            rooms: parseInt(searchData.rooms),
            rating: generateRating(star),
            reviewCount: Math.floor(Math.random() * 500) + 50,
            amenities: getHotelAmenities(star),
            image: getHotelImage(searchData.city, i),
            distance: (Math.random() * 5 + 0.5).toFixed(1),
            wifi: true,
            breakfast: star >= 4,
            pool: star >= 4,
            gym: star >= 5
        });
    }

    return hotels.sort((a, b) => a.pricePerNight - b.pricePerNight);
}

function calculateNights(checkin, checkout) {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = Math.abs(checkoutDate - checkinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getHotelBasePrice(city, star) {
    const basePrices = {
        'jakarta': { 3: 400000, 4: 800000, 5: 1500000 },
        'bali': { 3: 350000, 4: 700000, 5: 1200000 },
        'surabaya': { 3: 300000, 4: 600000, 5: 1000000 },
        'bandung': { 3: 250000, 4: 500000, 5: 900000 },
        'yogyakarta': { 3: 200000, 4: 400000, 5: 800000 }
    };
    
    const cityPrices = basePrices[city] || basePrices['jakarta'];
    return cityPrices[star] || 500000;
}

function isPriceInRange(price, range) {
    switch (range) {
        case 'budget':
            return price < 500000;
        case 'mid':
            return price >= 500000 && price <= 1500000;
        case 'luxury':
            return price >= 1500000 && price <= 3000000;
        case 'premium':
            return price > 3000000;
        default:
            return true;
    }
}

function generateRating(star) {
    const baseRating = star * 1.8; // 3 star = 5.4, 4 star = 7.2, 5 star = 9.0
    const variation = (Math.random() - 0.5) * 1.0; // ±0.5 variation
    return Math.max(1, Math.min(10, baseRating + variation)).toFixed(1);
}

function getHotelAmenities(star) {
    const baseAmenities = ['WiFi Gratis', 'AC', 'TV', 'Kamar Mandi Pribadi'];
    
    if (star >= 4) {
        baseAmenities.push('Sarapan', 'Kolam Renang', 'Restoran', 'Layanan Kamar');
    }
    
    if (star >= 5) {
        baseAmenities.push('Spa', 'Fitness Center', 'Concierge', 'Business Center');
    }
    
    return baseAmenities;
}

function getHotelImage(city, index) {
    const hotelImages = [
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
        'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
        'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
        'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
        'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
        'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
        'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg',
        'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg'
    ];
    
    return hotelImages[index % hotelImages.length];
}

function generateHotelCard(hotel) {
    const stars = '⭐'.repeat(hotel.star);
    const amenitiesHtml = hotel.amenities.slice(0, 4).map(amenity => 
        `<span class="amenity-tag">${amenity}</span>`
    ).join('');
    
    const moreAmenities = hotel.amenities.length > 4 
        ? `<span class="amenity-tag">+${hotel.amenities.length - 4} lainnya</span>`
        : '';
    
    return `
        <div class="result-card">
            <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image">
            <div class="result-info">
                <div class="result-header">
                    <div>
                        <div class="result-name">${hotel.name}</div>
                        <div class="result-detail">${stars} • ${hotel.area}</div>
                        <div class="hotel-rating">
                            <span>⭐ ${hotel.rating}</span>
                            <span>(${hotel.reviewCount} ulasan)</span>
                        </div>
                    </div>
                    <div>
                        <div class="result-price">${window.TravelNesia.formatPrice(hotel.pricePerNight)}</div>
                        <div style="font-size: 0.8rem; color: #666;">per malam</div>
                    </div>
                </div>
                
                <div class="result-details">
                    <div class="result-detail">
                        <span>📍</span>
                        <span>${hotel.distance} km dari pusat kota</span>
                    </div>
                    <div class="result-detail">
                        <span>🛏️</span>
                        <span>${hotel.rooms} kamar • ${hotel.nights} malam</span>
                    </div>
                    <div class="result-detail">
                        <span>💰</span>
                        <span>Total: ${window.TravelNesia.formatPrice(hotel.totalPrice)}</span>
                    </div>
                </div>
                
                <div class="hotel-amenities">
                    ${amenitiesHtml}
                    ${moreAmenities}
                </div>
                
                <div class="result-actions">
                    <button class="btn-book" onclick="bookHotel('${hotel.id}')">Pesan Sekarang</button>
                    <button class="btn-details" onclick="showHotelDetails('${hotel.id}')">Detail</button>
                </div>
            </div>
        </div>
    `;
}

function bookHotel(hotelId) {
    const submitBtn = event.target;
    const hideLoading = window.TravelNesia.showLoading(submitBtn);
    
    // Simulate booking process
    setTimeout(() => {
        hideLoading();
        window.TravelNesia.showAlert(`Hotel ${hotelId} berhasil dipesan! Silakan lanjutkan ke pembayaran.`, 'success');
        
        // In a real app, redirect to payment page
        setTimeout(() => {
            window.TravelNesia.showAlert('Redirecting ke halaman pembayaran...', 'warning');
        }, 2000);
    }, 2000);
}

function showHotelDetails(hotelId) {
    alert(`Menampilkan detail hotel ${hotelId}.\n\nFitur detail akan tersedia di versi selanjutnya.`);
}