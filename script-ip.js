window.addEventListener('DOMContentLoaded', () => {
  const ipDisplay = document.getElementById('ip');
  const countryDisplay = document.getElementById('country');
  const ispDisplay = document.getElementById('isp');
  const mapContainer = document.getElementById('map-container');

  // SỬA: Dùng local để dev, tránh lỗi mixed content/URL sai
  const API_BASE = 'http://localhost:4000';  // Đổi thành 'https://netcheck-backend-1.onrender.com' khi deploy

  console.log('Calling API:', `${API_BASE}/ip-info`);  // Log để debug

  fetch(`${API_BASE}/ip-info`)
    .then(response => {
      console.log('Response status:', response.status);  // Log để debug
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data);  // Log để debug
      ipDisplay.textContent = data.query || 'N/A';
      countryDisplay.textContent = data.country || 'N/A';
      ispDisplay.textContent = data.isp || 'N/A';

      const lat = data.lat;
      const lon = data.lon;

      if (lat && lon) {
        mapContainer.innerHTML = `<iframe 
          width="100%" 
          height="100%" 
          frameborder="0" 
          style="border:0; border-radius: 8px;"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://maps.google.com/maps?q=${lat},${lon}&z=13&output=embed">
        </iframe>`;
      } else {
        mapContainer.textContent = 'Không thể lấy tọa độ để hiển thị bản đồ';
      }
    })
    .catch(error => {
      console.error('Lỗi khi lấy thông tin IP:', error);  // Log lỗi để debug
      ipDisplay.textContent = 'Không thể lấy thông tin';
      countryDisplay.textContent = 'Không thể lấy thông tin';
      ispDisplay.textContent = 'Không thể lấy thông tin';
      mapContainer.textContent = 'Không thể tải bản đồ';
    });
});
