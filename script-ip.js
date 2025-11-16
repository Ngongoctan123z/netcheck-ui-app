window.addEventListener('DOMContentLoaded', () => {
  const ipDisplay = document.getElementById('ip');
  const countryDisplay = document.getElementById('country');
  const ispDisplay = document.getElementById('isp');
  const mapContainer = document.getElementById('map-container');

  // SỬA: Dùng local để dev, tránh lỗi mixed content/URL sai
 const API_BASE = 'https://netcheck-api-server.onrender.com';
  // Đổi thành 'https://netcheck-api-server.onrender.com' khi deploy Render online

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

  // THÊM MỚI: Phần kiểm tra proxy (tích hợp vào cùng file, gọi /api/check-proxy-strong)
  const proxyInput = document.getElementById('proxy-input');
  const typeSelect = document.getElementById('type-select');
  const testBtn = document.getElementById('test-btn');
  const resultDiv = document.getElementById('result');  // Div hiển thị kết quả (thêm ID="result" ở HTML nếu chưa)

  if (testBtn) {
    testBtn.addEventListener('click', testProxy);  // Gán event cho nút Test
  }

  function testProxy() {
    const proxyValue = proxyInput ? proxyInput.value.trim() : '';
    const selectedType = typeSelect ? typeSelect.value : 'http';
    if (!proxyValue) {
      alert('Nhập proxy (format: user:pass@ip:port)');
      return;
    }

    console.log('Testing proxy:', proxyValue, 'Type:', selectedType);  // Log debug

    fetch(`${API_BASE}/api/check-proxy-strong`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proxy: proxyValue,  // Single proxy string (backend tự parse user:pass@ip:port)
        type: selectedType,  // HTTP/HTTPS/SOCKS4/SOCKS5 từ dropdown
        timeoutMs: 20000  // 20s timeout, như test trước (có thể thay bằng input nếu có)
      })
    })
    .then(response => {
      console.log('Proxy response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      console.log('Proxy result:', result);  // Log debug
      if (resultDiv) {
        const totalLatency = result.tcp ? result.tcp.latency + (result.http ? result.http.latency : 0) : 'N/A';
        resultDiv.innerHTML = `
          <h3>Kết Quả Kiểm Tra Proxy</h3>
          <p><strong>Proxy:</strong> ${result.proxy || proxyValue}</p>
          <p><strong>Loại:</strong> ${result.type}</p>
          <p><strong>Alive Tổng:</strong> ${result.alive ? 'Sống' : 'Chết'}</p>
          <p><strong>TCP Check:</strong> ${result.tcp.alive ? `Sống (${result.tcp.latency}ms - ${result.tcp.message})` : `Chết - ${result.tcp.message}`}</p>
          <p><strong>HTTP/SOCKS Check:</strong> ${result.http.alive ? `Sống (${result.http.latency}ms, Status: ${result.http.statusCode})` : `Chết - ${result.http.error || 'Unknown'}`}</p>
          <p><strong>Thời Gian Tổng:</strong> ${totalLatency}ms</p>
          <p><strong>Số Lần Thử:</strong> ${result.http ? result.http.tries : 'N/A'}</p>
        `;
      } else {
        alert(`Kết quả: ${result.alive ? 'Sống' : 'Chết'} | Latency: ${totalLatency}ms | TCP: ${result.tcp.message}`);
      }
    })
    .catch(error => {
      console.error('Lỗi kiểm tra proxy:', error);
      if (resultDiv) {
        resultDiv.innerHTML = `<p style="color: red;">Lỗi: ${error.message} (Kiểm tra backend chạy port 4000?)</p>`;
      } else {
        alert('Lỗi kiểm tra: ' + error.message);
      }
    });
  }
});
