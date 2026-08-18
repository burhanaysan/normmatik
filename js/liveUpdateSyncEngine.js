/**
 * NormMatik™ — Canlı Mevzuat ve Veritabanı Eşleme Motoru (LiveUpdateSyncEngine v1.0)
 * 5846 Sayılı FSEK Korumalı • Mimari: Burhan AYSAN
 * 
 * Bu motor; internete bağlı olunduğunda GitHub CDN / normmatik.com.tr üzerinden
 * en güncel MEB mevzuat sürümünü kontrol eder, çevrimdışı kullanım için yerel
 * hafızaya (localStorage) kaydeder veya internetsiz okullar için .json dosyasından
 * kural güncellemesi yüklenmesini sağlar.
 */

import { NORM_RULES_CONFIG } from './normRulesConfig.js';

export class LiveUpdateSyncEngine {
    constructor() {
        this.STORAGE_KEY_RULES = "normmatik_custom_rules_config";
        this.STORAGE_KEY_VERSION = "normmatik_current_rules_version";
        this.DEFAULT_CDN_URL = "https://raw.githubusercontent.com/burhanaysan/normmatik/main/version.json";
        
        this.currentRules = this.loadActiveRules();
    }

    /**
     * Aktif Kuralları Getirir (Yerel Özel Kural veya Varsayılan Konfigürasyon)
     */
    loadActiveRules() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY_RULES);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.metadata && parsed.metadata.version) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Yerel kural konfigürasyonu okunamadı, varsayılan kullanılıyor:", e);
        }
        return NORM_RULES_CONFIG;
    }

    /**
     * Mevcut Aktif Sürüm Bilgisi
     */
    getCurrentVersionInfo() {
        return {
            system: "NormMatik™",
            version: this.currentRules.metadata?.version || "2026.1.0",
            releaseDate: this.currentRules.metadata?.releaseDate || "2026-08-19",
            legislationTitle: this.currentRules.metadata?.legislationTitle || "MEB Norm Kadro Yönetmeliği",
            isCustomLocal: localStorage.getItem(this.STORAGE_KEY_RULES) !== null
        };
    }

    /**
     * Uzak Sunucu / GitHub CDN Üzerinden Güncelleme Kontrolü Yapar (OTA Check)
     * @param {string} customUrl 
     * @returns {Promise<{ hasUpdate: boolean, remoteVersion?: string, changelog?: string[], error?: string }>}
     */
    async checkRemoteUpdate(customUrl = null) {
        const targetUrl = customUrl || this.DEFAULT_CDN_URL;

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return { hasUpdate: false, error: "İnternet bağlantısı yok (Çevrimdışı Mod)." };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 saniye timeout

            const response = await fetch(targetUrl + `?t=${Date.now()}`, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return { hasUpdate: false, error: `Sunucu yanıt vermedi (${response.status})` };
            }

            const remoteData = await response.json();
            const currentVer = this.currentRules.metadata?.version || "2026.1.0";
            const remoteVer = remoteData.version;

            if (remoteVer && this.compareVersions(remoteVer, currentVer) > 0) {
                return {
                    hasUpdate: true,
                    remoteVersion: remoteVer,
                    releaseDate: remoteData.releaseDate,
                    changelog: remoteData.changelog || [],
                    downloadUrl: remoteData.downloadUrl
                };
            }

            return {
                hasUpdate: false,
                currentVersion: currentVer,
                message: "Mevzuat ve kural motorunuz güncel."
            };
        } catch (e) {
            return { hasUpdate: false, error: "Güncelleme sunucusuna ulaşılamadı: " + e.message };
        }
    }

    /**
     * Sürüm Karşılaştırıcı (SemVer)
     */
    compareVersions(v1, v2) {
        const p1 = v1.split('.').map(n => parseInt(n, 10) || 0);
        const p2 = v2.split('.').map(n => parseInt(n, 10) || 0);
        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }

    /**
     * Yeni Kural Paketini Uygular ve Kaydeder
     * @param {Object} newRulesConfig 
     */
    applyRulesConfig(newRulesConfig) {
        if (!newRulesConfig || typeof newRulesConfig !== 'object' || !newRulesConfig.generalCourseLoadRules) {
            throw new Error("Geçersiz kural konfigürasyonu formatı.");
        }

        this.currentRules = newRulesConfig;
        localStorage.setItem(this.STORAGE_KEY_RULES, JSON.stringify(newRulesConfig));
        localStorage.setItem(this.STORAGE_KEY_VERSION, newRulesConfig.metadata?.version || "2026.1.0");

        return {
            success: true,
            version: newRulesConfig.metadata?.version,
            message: "Yeni MEB mevzuat ve norm kural paketi başarıyla yüklendi!"
        };
    }

    /**
     * Varsayılan Fabrika Kurallarına Sıfırlar
     */
    resetToDefaultRules() {
        localStorage.removeItem(this.STORAGE_KEY_RULES);
        localStorage.removeItem(this.STORAGE_KEY_VERSION);
        this.currentRules = NORM_RULES_CONFIG;
        return { success: true, message: "Kural motoru varsayılan MEB standartlarına sıfırlandı." };
    }

    /**
     * Mevcut Kural Paketini .json Olarak Dışa Aktarır
     */
    exportRulesToJson() {
        const jsonStr = JSON.stringify(this.currentRules, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `NormMatik_Mevzuat_Kurallari_${this.currentRules.metadata?.version || '2026'}.json`;
        a.click();
    }
}

if (typeof window !== 'undefined') {
    window.LiveUpdateSyncEngine = LiveUpdateSyncEngine;
}
