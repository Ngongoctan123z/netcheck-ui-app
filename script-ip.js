// script-ip.js
// Lấy thông tin IP với nhiều API fallback để tránh lỗi

async function fetchFromIpwho() {
  const res = await fetch("https://ipwho.is/");
  if (!res.ok) throw new Error("ipwho.is lỗi");
  const data = await res.json();
  return {
    ip: data.ip,
    country: data.country,
    isp: data.connection?.isp,
    lat: data.latitude,
    lon: data.longitude
  };
}

async function fetchFromIpapi() {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("ipapi.co lỗi");
  const data = await res.json();
  return {
    ip: data.ip,
    country: data.country_name,
    isp: data.org,
    lat: data.latitude,
    lon: data.longitude
  };
}

async function fetchFromIpinfo() {
  const res = await fetch("https://ipinfo.io/json?token=YOUR_TOKEN"); // nếu có token
  if (!res.ok) throw new Error("ipinfo.io lỗi");
  const data = await res.json();
  const [lat, lon] = data.loc.split(",");
  return {
    ip: data.ip,
    country: data.country,
    isp: data.org,
    lat: parseFloat(lat),
    lon: parseFloat(lon)
  };
}

async function fetchIpInfo() {
  let info = null;
  try {
    info = await fetchFromIpwho();
  } catch (e1) {
    console.warn("ipwho.is lỗi:", e1);
    try {
      info = await fetchFromIpapi();
    } catch (e2) {
      console.warn("ipapi.co lỗi:", e2);
      try {
        info = await fetchFromIpinfo();
      } catch (e3) {
        console.error("ipinfo.io lỗi:", e3);
      }
    }
  }

  if (!info) {
    document.getElementById("ip").textContent = "Không thể tải IP";
    document.getElementById("country").textContent = "Không thể tải quốc gia";
    document.getElementById("isp").textContent = "Không thể tải ISP";
    document.getElementById("map-container").innerHTML =
      "<p style='padding:12px'>Không thể tải bản đồ.</p>";
    return;
  }

  // Hiển thị dữ liệu
  document.getElementById("ip").textContent = info.ip || "Không rõ";
  document.getElementById("country").textContent = info.country || "Không rõ";
  document.getElementById("isp").textContent = info.isp || "Không rõ";

  // Bản đồ
  const lat = info.lat;
  const lon = info.lon;
  const mapContainer = document.getElementById("map-container");

  if (lat && lon && mapContainer) {
    const iframe = document.createElement("iframe");
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";

    const delta = 0.02;
    const bbox = [
      lon - delta,
      lat - delta,
      lon + delta,
      lat + delta
    ].join("%2C");

    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

    mapContainer.innerHTML = "";
    mapContainer.appendChild(iframe);

    const link = document.createElement("a");
    link.href = `https://www.google.com/maps?q=${lat},${lon}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = `Mở Google Maps (${lat}, ${lon})`;
    mapContainer.appendChild(document.createElement("br"));
    mapContainer.appendChild(link);
  }
}

// Luôn gọi API mới mỗi lần load trang
document.addEventListener("DOMContentLoaded", fetchIpInfo);
