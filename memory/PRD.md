# LEGYENEZ - Short Video Factory

## Projekt Összefoglaló

**LEGYENEZ** egy AI-alapú YouTube Shorts generáló és optimalizáló platform német nyelvű spirituális/faith niche tartalomhoz.

### Fő funkciók:
- Script generálás (OpenAI GPT)
- Karaoke feliratos videó generálás (ElevenLabs TTS + Pexels B-roll + FFmpeg)
- Hook könyvtár kezelés
- Analitika dashboard
- YouTube integráció (ÚJ!)

---

## AKTUÁLIS ÁLLAPOT (2026-02-22)

### ✅ Elkészült ebben a session-ben:

1. **Analytics oldal újratervezése** - Modern, színes Bento Grid dizájn:
   - Gradient háttér az egész oldalon
   - Kék hero kártya (Összes Megtekintés)
   - Színes stat kártyák (piros/arany/lila/zöld)
   - Kör alakú progress grafikonok (Retention/Swipe Rate)
   - Szimmetrikus elrendezés: meleg színek (piros|arany) és hideg színek (lila|zöld) párban

2. **YouTube OAuth2 integráció alapjai**:
   - Google Cloud Project létrehozva
   - YouTube Data API v3 + YouTube Analytics API engedélyezve
   - OAuth2 credentials beállítva
   - Backend endpoint-ok elkészültek (`/api/youtube/*`)
   - Frontend "Csatorna összekapcsolása" gomb az Analytics oldalon
   - **FONTOS**: A felhasználó email-je (Darvex606@gmail.com) hozzá lett adva a Test Users listához

---

## 🔑 YouTube API Credentials

```
Client ID: 365361016451-46v0bvb1cmf0j2is8a3orp1tucipue5n.apps.googleusercontent.com
Client Secret: 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
Redirect URI: https://subtitle-studio-1.preview.emergentagent.com/api/youtube/callback
```

**Google Cloud Console**: A felhasználónak van egy "LegyenEz-YouTube" nevű projektje.

---

## 📋 KÖVETKEZŐ TEENDŐK (Prioritás sorrendben)

### P0 - YouTube integráció befejezése:

1. **Tesztelni a YouTube OAuth flow-t** - A felhasználó már hozzáadta magát a Test Users-hez, elvileg működik
2. **Szinkronizálás tesztelése** - Videók + analitikák lekérése a csatornáról
3. **Adatok megjelenítése** - YouTube videók listázása az Analytics oldalon

### P1 - Automatikus analitika rendszer:

A felhasználó víziója egy **önfejlesztő, tanuló analitikai gépezet**:

```
YouTube API → Adatgyűjtés → Elemzés → A/B Tesztek → Optimalizálás
     ↑                                                    ↓
     └────────────── Visszacsatolás ──────────────────────┘
```

**Főbb komponensek:**

1. **Adat struktúra** (a felhasználó által definiált):
   - **Hook (0-3 mp)**: Swipe Rate - hány % marad (cél: 85%+)
   - **Dominance Line (3-8 mp)**: Early Retention
   - **Open Loop (8-15 mp)**: Mid-Retention
   - **Body (15-25 mp)**: Value delivery
   - **Close (25-30 mp)**: CTA, lezárás

2. **Metrikák**:
   - **Swipe Rate** = "Akik tovább nézték" % (YouTube: "Félrecsúsztatta" inverze)
   - **Retention Rate** = Átlag megtekintési idő / Videó hossz * 100
   - Views, Likes, Comments, Subscribers gained

3. **A/B Tesztelés logikája**:
   - Ha magas Swipe Rate DE alacsony Retention → Body-val van gond
   - Ha alacsony Swipe Rate → Hook-kal van gond
   - Nyertes hook + új body variációk tesztelése
   - Automatikus "nyertes minta" azonosítás

4. **Jövőbeli Multi-Agent rendszer** (a felhasználó ötlete):
   - Data Collector Agent
   - Analyzer Agent
   - Script Writer Agent (AI)
   - A/B Test Manager Agent
   - Optimizer Agent

### P2 - Egyéb függő feladatok:

1. **VideoFactory fordítási hiba** - Translation keys jelennek meg szöveg helyett
2. **UI blokkolás videó generálás közben** - ThreadPoolExecutor kell az ffmpeg-hez
3. **Többi oldal fordítása** - NotionAnalytics, Settings, Forgot/Reset Password

---

## 🗂️ Fájl Referenciák

### Backend:
- `/app/backend/routes/youtube.py` - YouTube OAuth2 és API endpoint-ok (ÚJ!)
- `/app/backend/server.py` - Fő szerver, YouTube router hozzáadva
- `/app/backend/services/video_service.py` - Videó generálás
- `/app/backend/services/ffmpeg_service.py` - Felirat generálás

### Frontend:
- `/app/frontend/src/pages/Dashboard/Analytics.js` - Analytics oldal (ÁTDOLGOZVA!)
- `/app/frontend/src/pages/Dashboard/VideoFactory.js` - Videó generáló oldal
- `/app/frontend/src/contexts/LanguageContext.js` - Fordítási rendszer

---

## 🎨 Design Guidelines

Az Analytics oldal dizájn elvei (alkalmazandó máshol is):

- **Színek szimmetriája**: Meleg (piros/arany) és hideg (lila/zöld) párosítás
- **Gradient háttér**: `bg-gradient-to-b from-amber-500/5 via-purple-500/5 to-blue-500/5`
- **Kártya stílusok**: `bg-gradient-to-br from-[color]-500/20 to-[color]-500/10 border-l-4 border-l-[color]-400`
- **Gap/Spacing**: `space-y-6` konzisztens távolságokhoz
- **Hover effektek**: `hover:border-[color]-400/40 transition-all duration-300`

---

## 🔧 Technikai Stack

- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **APIs**: OpenAI, ElevenLabs, Pexels, YouTube Data API v3, YouTube Analytics API
- **Video Processing**: FFmpeg

---

## 📊 YouTube API Info

**Kvóták**:
- YouTube Data API v3: 10,000 egység/nap
- YouTube Analytics API: 200 lekérés/nap

**Elérhető metrikák**:
- views, likes, comments
- averageViewDuration (másodpercben)
- averageViewPercentage (retention!)
- subscribersGained

**A felhasználó csatornája**:
- ~300 feliratkozó
- ~50-60k össz megtekintés
- 30-40 Shorts videó
- Német nyelvű spirituális/faith niche

---

## ⚠️ Ismert Problémák

1. **Kettős fordítási rendszer** - `react-i18next` és `LanguageContext` párhuzamosan fut
2. **VideoFactory fordítás** - Kulcsok jelennek meg szöveg helyett
3. **Videó generálás blokkol** - Az ffmpeg szinkron hívások blokkolják az async event loop-ot

---

## 💡 Felhasználó Preferenciái

- **Nyelv**: Magyar (a felhasználóval magyarul kell kommunikálni!)
- **Fókusz**: YouTube Shorts optimalizálás
- **Stílus**: Modern, színes, "catchy" dizájn
- **Megközelítés**: Iteratív fejlesztés, folyamatos visszajelzés

---

## 🚀 Végső Cél

Egy **teljesen automatizált YouTube Shorts optimalizáló rendszer**, ami:
1. Lekéri a videók analitikáit YouTube-ról
2. Elemzi a hook/body/close teljesítményét
3. Azonosítja a nyertes mintázatokat
4. Automatikusan generál új variációkat (AI)
5. A/B/C teszteket futtat
6. Önmagát fejleszti a visszacsatolás alapján
7. "Tölcsér szerűen" szűri és optimalizálja a tartalmat

---

*Utolsó frissítés: 2026-02-22*
