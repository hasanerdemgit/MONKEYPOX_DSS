import sys
import json
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

# Tahmin Modeli
def tahmin_yap(veri, steps=12):
    model = ARIMA(veri, order=(1, 1, 1))
    model_fit = model.fit()
    tahmin = model_fit.forecast(steps=steps)
    return tahmin.tolist()

# Risk Seviyesi Belirleme
def risk_seviyesi_hesapla(max_tahmin, mevcut_kapasite):
    oran = max_tahmin / mevcut_kapasite
    if oran > 0.9:
        return "Yuksek Risk"
    elif 0.7 < oran <= 0.9:
        return "Orta Risk"
    else:
        return "Dusuk Risk"

if __name__ == "__main__":
    # Node.js'den gelen veriyi al
    data = json.loads(sys.argv[1])
    df = pd.DataFrame(data)

    # Mevcut kapasite bilgisi (örnek veriler, veritabanından alınmalı)
    kapasite_bilgisi = {
        "Ege Bolgesi": 10000,
        "Marmara Bolgesi": 15000,
        "Akdeniz Bolgesi": 12000,
        "Karadeniz Bolgesi": 11000,
        "Ic Anadolu Bolgesi": 13000,
        "Dogu Anadolu Bolgesi": 8000,
        "Guneydogu Anadolu Bolgesi": 7000,
    }

    tahmin_sonuclari = {}

    for bolge in df['bolge_adi'].unique():
        # Bölgeye göre filtreleme ve kopyalama
        bolge_verisi = df[df['bolge_adi'] == bolge].copy()

        # Tarih sütunu oluşturma
        bolge_verisi['tarih'] = pd.to_datetime(
            bolge_verisi['yil'].astype(str) + '-' + bolge_verisi['ay'].astype(str) + '-01'
        )
        bolge_verisi.set_index('tarih', inplace=True)

        # Vaka serisi oluşturma ve tür dönüşümü
        vaka_serisi = bolge_verisi['toplam_vaka'].sort_index()
        vaka_serisi = pd.to_numeric(vaka_serisi, errors='coerce').fillna(0)

        # Frekansı belirtme
        vaka_serisi = vaka_serisi.asfreq('MS').fillna(0)

        # Tahminler
        try:
            # Vaka tahmini
            vaka_tahmin = tahmin_yap(vaka_serisi, steps=12)

            # Mevcut kapasiteyi al
            mevcut_kapasite = kapasite_bilgisi.get(bolge, 0)

            # Ek kapasite ihtiyacını hesapla
            max_tahmin = max(vaka_tahmin)
            ek_kapasite_ihtiyaci = max(0, int(max_tahmin - mevcut_kapasite))

            # İlaç ihtiyacını hesapla
            ilac_ihtiyaci = sum([int(vaka / 100) for vaka in vaka_tahmin])

            # Risk seviyesi belirleme
            risk_seviyesi = risk_seviyesi_hesapla(max_tahmin, mevcut_kapasite)

            # Tahminleri ve diğer parametreleri düzenli bir formatta sakla
            tahmin_sonuclari[bolge] = {
                "tahminler": [
                    {"ay": i + 1, "tahmin_vaka": int(tahmin)} for i, tahmin in enumerate(vaka_tahmin)
                ],
                "kapasite_onerisi": ek_kapasite_ihtiyaci,
                "ilac_ihtiyaci": ilac_ihtiyaci,
                "risk_seviyesi": risk_seviyesi
            }
        except Exception as e:
            print(f"Hata (Bölge: {bolge}): {e}", file=sys.stderr)
            continue

    # Sonuçları JSON formatında yazdır
    print(json.dumps(tahmin_sonuclari))
