# 🌳 Gárdony Környezeti Dashboard - Projekt Állapot

Ez a dokumentum összefoglalja, hogy jelenleg hol tartunk, melyik modul mit csinál, és hogyan épül fel a felület.

## 📐 Vizuális Elrendezés Térkép

Az alábbi ábra (táblázat) mutatja a képernyő felosztását.  
A **zöld pipával (✅)** jelölt részek már élő kódként futnak és be vannak kötve az adatbázisba/térképbe, míg a **sárga homokórával (⏳)** jelölt részek még csak statikus "helykitöltők" (szövegek dobozokban), amik várják, hogy programozzuk őket.

| ⚙️ FEJLÉC (Gárdony Környezeti Dashboard - Fő KPI mutatók) ✅ (Statikus, de végleges) |
| :--- |

| ☁️ METEOROLÓGIA ✅ | 🗺️ INTERAKTÍV TÉRKÉP ✅ | 🗑️ HULLADÉK ⏳ |
| :--- | :--- | :--- |
| **Élő adatbázis kapcsolat**<br>Honnan: `Supabase`<br>Tábla: `air_weather_data`<br><br>*Mit látsz:*<br>Hőmérséklet, Pára, Szél (Folyamatosan frissül) | **Élő Térkép**<br>Alap: `OpenStreetMap`<br>Műhold: `Copernicus WMS 1 & 2`<br>Pöttyök: `Supabase` -> `citizen_reports`<br><br>*Mit látsz:*<br>Nagyítós, mozgatható térkép a bejelentésekkel. | **Helykitöltő**<br>Ide jöhetnek a kukák töltöttségi adatai.<br><br>*Jelenleg:*<br>Sima statikus narancssárga doboz. |
| *(Ez a doboz leér egészen idáig)* | 🌊 VÍZMINŐSÉG TRENDEK ⏳ | 💨 LEVEGŐMINŐSÉG & ZÖLDFELÜLET ⏳ | ⚠️ AI RIASZTÁSOK ⏳ |
|  | **Helykitöltő**<br>Ide jöhetnek a bóják adatai (vonaldiagramok).<br><br>*Jelenleg:*<br>Sima statikus zöld doboz. | **Helykitöltő**<br>Ide jöhet a PM2.5 / PM10 diagram.<br><br>*Jelenleg:*<br>Sima statikus lila doboz. | **Helykitöltő**<br>Ide jöhet a szöveges anomália detektor.<br><br>*Jelenleg:*<br>Sima statikus piros doboz. |

---

## 🔗 Adatkapcsolatok (Folyamatábra)

Így áramlanak jelenleg az adatok a rendszeredben:

```mermaid
graph TD
    subgraph Külvilág
        S1[Make.com / IoT Szenzorok]
        S2[Lakossági Tally űrlap]
        S3[Copernicus Műholdak]
    end

    subgraph Supabase Adatbázis
        DB1[(air_weather_data)]
        DB2[(citizen_reports)]
    end

    subgraph React Dashboard
        UI1(☁️ WeatherPanel)
        UI2(🗺️ GardonyDashboardMap)
    end

    S1 -- Valós idejű beszúrás --> DB1
    S2 -- Új bejelentés --> DB2
    
    DB1 -- Automatikus frissítés Realtime --> UI1
    DB2 -- Betöltés induláskor --> UI2
    S3 -- WMS Képrétegek --> UI2
```

## 🛰️ Copernicus Műholdas Rétegek Konfigurációja

Az alábbi táblázat összefoglalja a térkép modulhoz kapcsolt Copernicus rétegeket:

| Réteg Neve (UI) | Copernicus Layer ID | Endpoint / Instance ID | Megjegyzés |
| :--- | :--- | :--- | :--- |
| **Zavarosság (NDWI)** | `1_TRUE_COLOR` | `e28f1a16-eeae-472b-b095-39a50537ba6c` | Alga1 rétegként is hivatkozva a gyökérben |
| **Sentinel-2 Algásodási Hőtérkép (NDCI)** | `2_TRUE_COLOR` | `841fca04-e199-424a-b6f7-86d4aa23b911` | Alga2 rétegként is hivatkozva a gyökérben |
| **Hőtérkép (LST)** | `LST_HOTERKEP` | `5d044f7a-d7a1-4fb2-aeef-c5b6181e121c` | **[ÚJ]** Felszíni hőmérséklet hőtérkép |
| **Beépítettség (NDBI)** | `NDBI_BEEPITETTSEG` | `5d044f7a-d7a1-4fb2-aeef-c5b6181e121c` | **[ÚJ]** Városi / beépített területek indexe |
| **Zöldterület (NDVI)** | `NDVI_ZOLDTERULET` | `5d044f7a-d7a1-4fb2-aeef-c5b6181e121c` | **[ÚJ]** Vegetáció sűrűség és egészség |
| **Légszennyezettség (NO₂)** | `NO2_LEGSZENNYEZES` | `5d044f7a-d7a1-4fb2-aeef-c5b6181e121c` | **[ÚJ]** Nitrogén-dioxid koncentráció |

A rétegek a térkép jobb felső sarkában lévő **rétegválasztó (Layers Control)** menüből egyszerűen ki- és bekapcsolhatóak. Minden rétegnél a felhőlefedettségi küszöbérték `maxcc={20}`-ra van állítva a tiszta látvány érdekében, a `transparent={true}` és `format="image/png"` beállítások pedig biztosítják az OpenStreetMap alaptérkép feletti rétegződést.

