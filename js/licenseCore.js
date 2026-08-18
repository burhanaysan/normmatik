/**
 * MEB NORM KADRO SİSTEMİ - KRİPTOGRAFİK LİSANS ÇEKİRDEĞİ (ECDSA P-256 / SHA-256)
 * Copyright (c) 2026 Burhan AYSAN. Tüm hakları saklıdır.
 * 
 * Bu modül; Web Crypto API (Browser) ve Node.js crypto ortamlarında hibrit çalışır.
 * Asimetrik dijital imzalama (ECDSA P-256) ile lisans üretir ve doğrular.
 */

// Gömülü Master Açık Anahtar (Client-Side Public Key)
const MASTER_PUBLIC_KEY_JWK = {
    "kty": "EC",
    "x": "Ixop_Vp8qOnI_cJ555RRs4c7A9karZ8JlyIrwojiRwA",
    "y": "8mAoQOD1uzeBqcJcgwTprG69YI8jzH1BsP9mLMap3E8",
    "crv": "P-256",
    "kid": "meb-norm-master-key-2026",
    "alg": "ES256",
    "key_ops": ["verify"]
};

class MebLicenseCore {
    constructor() {
        this.publicKeyJwk = MASTER_PUBLIC_KEY_JWK;
        this.cryptoSubtle = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;
    }

    // Base64URL Kodlama & Çözme
    static base64UrlEncode(bufferOrStr) {
        let str = "";
        if (typeof bufferOrStr === 'string') {
            if (typeof btoa !== 'undefined') {
                str = btoa(unescape(encodeURIComponent(bufferOrStr)));
            } else {
                str = Buffer.from(bufferOrStr, 'utf-8').toString('base64');
            }
        } else {
            if (typeof btoa !== 'undefined') {
                const bytes = new Uint8Array(bufferOrStr);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                str = btoa(binary);
            } else {
                str = Buffer.from(bufferOrStr).toString('base64');
            }
        }
        return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    static base64UrlDecode(base64UrlStr) {
        let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        if (typeof atob !== 'undefined') {
            const binaryStr = atob(base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            return bytes;
        } else {
            return new Uint8Array(Buffer.from(base64, 'base64'));
        }
    }

    static base64UrlDecodeToString(base64UrlStr) {
        let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        if (typeof atob !== 'undefined') {
            return decodeURIComponent(escape(atob(base64)));
        } else {
            return Buffer.from(base64, 'base64').toString('utf-8');
        }
    }

    /**
     * Browser Web Crypto API ile Açık Anahtarı İçe Aktarma
     */
    async importPublicKey(jwk = null) {
        if (!this.cryptoSubtle) {
            throw new Error("Web Crypto API bu ortamda bulunamadı.");
        }
        const keyData = jwk || this.publicKeyJwk;
        return await this.cryptoSubtle.importKey(
            "jwk",
            keyData,
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["verify"]
        );
    }

    /**
     * Lisans Verisini Doğrulama (Browser İstemci Tarafı)
     * @param {string} licenseToken - "MEBNORM.<PAYLOAD_B64>.<SIGNATURE_B64>"
     * @param {string} expectedKurumKodu - Doğrulanacak kurum kodu (Opsiyonel)
     * @param {string} currentHardwareId - Doğrulanacak cihaz kimliği (Opsiyonel)
     */
    async verifyLicenseToken(licenseToken, expectedKurumKodu = null, currentHardwareId = null) {
        try {
            if (!licenseToken || typeof licenseToken !== 'string') {
                return { isValid: false, reason: "Lisans anahtarı boş veya geçersiz formatta." };
            }

            const cleanToken = licenseToken.trim().replace(/^['"]|['"]$/g, '');
            const parts = cleanToken.split('.');

            if (parts.length !== 3 || parts[0] !== 'MEBNORM') {
                return { isValid: false, reason: "Geçersiz lisans yapısı. 'MEBNORM...' ile başlamalıdır." };
            }

            const payloadB64 = parts[1];
            const signatureB64 = parts[2];

            const payloadJsonStr = MebLicenseCore.base64UrlDecodeToString(payloadB64);
            const payload = JSON.parse(payloadJsonStr);

            // 1. Dijital İmza Doğrulaması (Kriptografik İspat)
            const dataToVerifyStr = `MEBNORM.${payloadB64}`;
            const signatureBytes = MebLicenseCore.base64UrlDecode(signatureB64);

            let isSigValid = false;

            if (this.cryptoSubtle) {
                const encoder = new TextEncoder();
                const dataToVerify = encoder.encode(dataToVerifyStr);
                const cryptoKey = await this.importPublicKey();
                isSigValid = await this.cryptoSubtle.verify(
                    { name: "ECDSA", hash: { name: "SHA-256" } },
                    cryptoKey,
                    signatureBytes,
                    dataToVerify
                );
            } else if (typeof require !== 'undefined') {
                // Node.js fallback for testing
                const crypto = require('crypto');
                const verify = crypto.createVerify('SHA256');
                verify.update(Buffer.from(dataToVerifyStr));
                verify.end();
                const nodePubKey = crypto.createPublicKey({ key: this.publicKeyJwk, format: 'jwk' });
                isSigValid = verify.verify(
                    { key: nodePubKey, dsaEncoding: 'ieee-p1363' },
                    Buffer.from(signatureBytes)
                );
            }

            if (!isSigValid) {
                return { isValid: false, reason: "Lisans imzası geçersiz veya değiştirilmiş! Kriptografik doğrulama başarısız." };
            }

            // 2. Süre Kontrolü (Expiration Check)
            const now = new Date();
            const expireDate = new Date(payload.expireDate);
            if (now > expireDate) {
                return {
                    isValid: false,
                    isExpired: true,
                    reason: `Lisans süresi ${payload.expireDate} tarihinde dolmuştur. Lütfen lisansınızı yenileyiniz.`,
                    payload
                };
            }

            // 3. Kurum Kodu Eşleşme Kontrolü (Komşu Okul Savunması)
            if (expectedKurumKodu && payload.kurumKodu !== "*" && payload.licenseType !== "MASTER_DEVELOPER") {
                if (String(payload.kurumKodu).trim() !== String(expectedKurumKodu).trim()) {
                    return {
                        isValid: false,
                        reason: `Bu lisans anahtarı [${payload.kurumKodu} - ${payload.okulAdi || 'Farklı Kurum'}] adına kayıtlıdır. Aktif kurum kodu (${expectedKurumKodu}) ile uyuşmuyor!`,
                        payload
                    };
                }
            }

            // 4. Donanım / Bilgisayar Kilidi Kontrolü (Hardware Lock)
            if (currentHardwareId && payload.hardwareId && payload.hardwareId !== "*" && payload.licenseType !== "MASTER_DEVELOPER") {
                if (payload.hardwareId !== currentHardwareId) {
                    return {
                        isValid: false,
                        reason: "Bu lisans anahtarı farklı bir bilgisayar için üretilmiştir. Başka cihazda kullanılamaz.",
                        payload
                    };
                }
            }

            // Lisans Tamamen Geçerli
            const daysRemaining = Math.max(0, Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24)));

            return {
                isValid: true,
                payload,
                daysRemaining,
                licenseType: payload.licenseType,
                isMaster: payload.licenseType === "MASTER_DEVELOPER",
                isDemo: payload.licenseType === "DEMO",
                isAnnual: payload.licenseType === "ANNUAL_SCHOOL",
                kurumKodu: payload.kurumKodu,
                okulAdi: payload.okulAdi,
                okulTuru: payload.okulTuru,
                maxSections: payload.maxSections || -1
            };

        } catch (err) {
            return { isValid: false, reason: "Lisans çözümlenirken hata oluştu: " + err.message };
        }
    }

    /**
     * Cihaz Donanım Parmak İzi Üretimi (Hardware Fingerprint)
     */
    static async generateHardwareFingerprint() {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return "HW-STATIC-TEST-NODE";
        }

        try {
            const nav = window.navigator || {};
            const screen = window.screen || {};
            
            // Canvas Parmak İzi
            let canvasHash = "";
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 50;
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.textBaseline = "alphabetic";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText("MEB Norm Security 2026", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("MEB Norm Security 2026", 4, 17);
                canvasHash = canvas.toDataURL();
            } catch (e) {
                canvasHash = "canvas_disabled";
            }

            const rawString = [
                nav.userAgent || '',
                nav.language || '',
                nav.hardwareConcurrency || '4',
                nav.deviceMemory || '8',
                screen.width || '1920',
                screen.height || '1080',
                screen.colorDepth || '24',
                new Date().getTimezoneOffset(),
                canvasHash
            ].join('###');

            const encoder = new TextEncoder();
            const data = encoder.encode(rawString);
            
            if (window.crypto && window.crypto.subtle) {
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                return `HW-${hashHex.substring(0, 4).toUpperCase()}-${hashHex.substring(4, 8).toUpperCase()}-${hashHex.substring(8, 12).toUpperCase()}-${hashHex.substring(12, 16).toUpperCase()}`;
            }

            return "HW-GENERIC-DEFAULT";
        } catch (e) {
            return "HW-STANDALONE-DEVICE";
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MebLicenseCore, MASTER_PUBLIC_KEY_JWK };
}
if (typeof window !== 'undefined') {
    window.MebLicenseCore = MebLicenseCore;
    window.MASTER_PUBLIC_KEY_JWK = MASTER_PUBLIC_KEY_JWK;
}
