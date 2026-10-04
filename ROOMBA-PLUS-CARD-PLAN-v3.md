# Roomba+ Card — Plan v3 (UX-Neuausrichtung)

> **Stand:** 3. Oktober 2026 (**2.5.0 veröffentlicht**, siehe §4.1 „Umsetzungsstand“) · ersetzt `ROOMBA_PLUS_CARD_VERSION_PLAN_v2_5_updated.md` als
> Vorwärtsplanung (der v2.x-Plan bleibt als Historie der ausgelieferten Versionen gültig).
>
> **Faktenbasis, am Code geprüft:** Integration `ha_roomba_plus` **4.2.18** (`main`) und
> **4.3.0b6** (`dev-4.3`), beide frisch von GitHub; Card **v2.4.0** (GitHub, veröffentlicht)
> und **v2.5.0** (Paket vom Juli, unveröffentlicht); die drei offenen Card-Issues #17, #20, #21;
> alle Release-Notes 3.5.2 → 4.3.0b6 (≈ 100 Versionen) vollständig gelesen.

---

## 1. Kurzfassung

Die Card ist seit dem letzten Abgleich (Integration 3.5.1) **im Feld leise kaputtgegangen** —
nicht durch einen großen Bruch, sondern durch viele kleine: Die Integration hat Zustandswerte
auf übersetzbare Slugs umgestellt, Entitäten umbenannt oder an Fähigkeiten geknüpft und mit
Prime/V4 eine zweite Robotergeneration bekommen. Die Card rät Entity-IDs per String
(`sensor.${n}_…`, rund 196 Stellen, 93 Muster) und vergleicht gegen englische Anzeigetexte.
Weil sie fehlende Daten bewusst still ausblendet, sieht niemand, *dass* etwas fehlt — Nutzer
sehen nur eine dünnere Card.

Gleichzeitig ist die Integration laut eigener `COMPARISON.md` auf rund 154 Sensoren,
22 Binärsensoren, 20 Buttons, 17 Selects, 15 Switches und 5 Bilder gewachsen, dazu Kalender,
Aufgabenliste und Raum-Services. Ein großer Teil davon
hat direkten Alltagswert (Favoriten, Raum-Reinigung mit Optionen, Zeitpläne schreibbar,
Station/Dock, Wisch-Einstellungen, Restzeit, Raumabfolge), den die Card nicht nutzt.

**Der Plan in einem Satz:** Erst wieder *richtig* (2.5.0), dann *ein* Robotermodell für beide
Generationen (3.0.0), dann die vier Alltagsaufgaben nacheinander zu Ende gestalten —
Reinigen, Pflegen, Planen, Zurückblicken (3.1.0–3.4.0).

| Version | Thema | UX-Ergebnis für den Nutzer | Aufwand |
|---|---|---|---|
| **2.5.0** | Wieder richtig | Die Card zeigt bei Classic-Robotern wieder, was sie zeigen soll — Raumauswahl, aktueller Raum, korrekte Hinweise, Karte passt auf den Desktop, 8 Sprachen | M |
| **3.0.0** | Ein Modell, beide Generationen | Prime-Besitzer bekommen eine vollwertige Card; jeder Zustand erscheint in der eigenen Sprache aus der Integration; Card-Diagnose für Support | XL |
| **3.1.0** | Reinigen in einem Fluss | Ein „Reinigen"-Dialog statt vier verstreuter Wege; Vorab-Prüfung; Live-Ansicht mit Raumfolge und echter Restzeit | L |
| **3.2.0** | Pflege & Station | Ein „braucht Aufmerksamkeit"-Eingang, jede Meldung mit Ein-Tipp-Aktion; Verschleißteile in Tagen; Station bedienbar | M |
| **3.3.0** | Zeitpläne | Wochenplan in der Card sehen, ein-/ausschalten, bearbeiten — ohne iRobot-App | L |
| **3.4.0** | Rückblick | „Letzter Lauf" und „Heute" auf einen Blick; Raum-Abdeckung je Lauf; Trends verständlich | M |

Versionsnummern sind ein Vorschlag — siehe Entscheidungen in §9.

---

## 2. Lagebild

### 2.1 Versionsstand

| Komponente | Stand | Bemerkung |
|---|---|---|
| Card auf GitHub | **v2.5.0** (Release 3.10.2026) | `status-zone.ts` entfernt (`4a89e30`), CI grün. Issues #17, #20, #21 beantwortet und geschlossen. Dependabot-PR #22 (vitest 5) scheitert an `npm ci` (vite-Peer ≥ 6.4) — nicht mergen. |
| Card lokal | = GitHub v2.5.0 | 952 Tests, Build 280,6 kB. Nächster Schritt: 3.0.0. |
| Integration stabil | **4.2.18** | `roombapy 2.0.2`, `roombapy-prime 0.3.4`, HA ≥ 2025.5 |
| Integration Beta | **4.3.0b6** | Ein Cloud-Login pro iRobot-Konto, `roombapy-prime 0.5.0b2`. **Nichts Card-Relevantes neu** — Entitäten, Attribute und REST sind identisch mit 4.2.18. |

### 2.2 Was im Feld heute kaputt ist — nach Nutzergruppe

Alle Befunde gegen 4.2.18 und 4.3.0b6 geprüft (Datei:Zeile im Anhang A). „Vorbestehend"
heißt: war schon gegen 3.5.1 kaputt, 4.x hat es nicht verursacht.

| Nutzergruppe | Was der Nutzer sieht | Ursache |
|---|---|---|
| **Classic SMART + Cloud** (i/j/s-Serie mit Konto — der Normalfall) | Keine Raumauswahl, kein „Räume…"-Knopf, keine Raum-Icons und -Flächen | Card sucht `select.{n}_smart_zone_select`; mit Cloud erzeugt die Integration stattdessen `select.{n}_cloud_zone_{pmap_id}`, eine pro Karte (`select.py:233-260`). **Vorbestehend.** |
| alle | Kein „Reinigt gerade: Küche" im Kopf | Card liest `device_tracker.{n}_position`; der Tracker heißt `device_tracker.{n}` (`device_tracker.py:149-185`). **Vorbestehend.** |
| alle mit fälliger Wartung | Bereiter Roboter zeigt „Robot not ready — check the app" (**#17**) | Readiness liefert seit 4.1.8 Slugs (`ready`, `bin_full`, …); Card vergleicht mit `'Ready'` |
| Clean-Base-Besitzer | Kopfzustand „Behälter wird geleert" erscheint nie; Clean-Base-Text roh (`bag_full`) | Phase `'evac'` heißt jetzt `emptying_bin`; Clean-Base-Status als Slug |
| Braava / Combo | Pad- und Wischmodus als Rohwert (`reusable_wet`); Pad-Balken nie sichtbar | Slugs; Card erwartet ein `threshold_days`-Attribut, das nie existierte (**vorbestehend**) |
| alle mit Cloud | Abdeckungsbalken fehlt | `sensor.*_recent_coverage_pct` gibt es seit v3.0 nicht mehr → Attribut `coverage_pct` auf `cleaning_performance` (**vorbestehend**) |
| i7/j7/Braava | Teppich-Boost verschwindet aus ⚙ | gewollt: seit 4.2.15 nur bei `cap.carpetBoost == 1` — Card muss nur sauber damit umgehen |
| Filter/Bürste | Prozentbalken kann falsch stehen | Restwert kommt jetzt aus dem iRobot-Zähler, Card rechnet gegen lokales `threshold_hours`; neues Attribut `max_hours` |
| Alt-Installationen | Batteriebalken bzw. Karten-Overlays fehlen | Schema-Migration 20→21: `_battery` → `_battery_level`, `_map` → `_cleaning_map` je nach Anlagezeitpunkt |
| Desktop | Karte läuft über den Bildschirm, untere Hälfte abgeschnitten (**#20**) | `.rpc-coverage-img { width:100% }` ohne Höhenbegrenzung |
| nicht-englisch | Alles Englisch (**#21**) | v2.5.0-i18n nie veröffentlicht |
| **Prime/V4** (Combo 405/505, Max 705 …) | Nur Kopf, Steuerknöpfe, Batterie. Kein Fehlertext, keine Favoriten, keine Raumauswahl, kein Kartentab, keine Verbrauchsteile. **Prime-only: Verlauf zeigt „requires Roomba+ v1.8"** | Prime-Entitäten heißen `_prime_phase`, `_prime_error`, `favorite_{id}`, `prime_part_{id}` …; kein `coverage_map` → Kartentab-Gate zu; **REST-Endpunkte werden nur im Classic-Setup registriert** (`__init__.py:1145-1155`) |

### 2.3 Offene Issues

| # | Melder | Inhalt | Einordnung |
|---|---|---|---|
| **#17** | @azrael-229 (980 lokal, i7 Cloud) | Readiness-Vergleich case-sensitiv, mit präziser Analyse und Testkritik (Fixture `st('Ready')` zementiert den Fehler) | 2.5.0. Die Testkritik ist berechtigt und wird mitbehoben. |
| **#20** | @azrael-229 | Coverage-Map skaliert nur auf Breite, nie auf Höhe | 2.5.0 (Sofortfix), 3.0.0 (responsive Hülle) |
| **#21** | @Geo26160 (i7+, Französisch) | Eigene FR-Übersetzung als Fork-Datei angehängt | 2.5.0 löst es; seine Datei als Review-Quelle für `fr.ts`. Der Anhang ist über die Sitzung nicht abrufbar — bitte einmal manuell herunterladen. |

### 2.4 Ursachen — warum es so weit kam

1. **Entity-IDs werden geraten, nicht gefunden.** Jede Umbenennung, jedes Prime-Präfix, jede
   dynamische Familie (pro Karte, pro Favorit, pro Teil) bricht still.
2. **Vergleich gegen Anzeigetexte.** `'Ready'`, `'Bin Full'`, `'Empty'`, `'evac'` — die
   Integration hat korrekt auf Translation-Keys umgestellt; die Card hat es nicht bemerkt.
3. **Stille Degradation als Prinzip.** Das Card-Invariant „fehlt etwas, blende es aus" war für
   *ältere Integrationen* gedacht. Gegen eine *neuere* Integration macht es Brüche unsichtbar —
   die Raumauswahl fehlt seit Monaten, ohne dass es jemand gemeldet hat.
4. **Kein Vertragswächter.** Es gibt keinen Test, der rot wird, wenn die Integration einen
   Schlüssel ändert, den die Card benutzt. (Dasselbe Muster wie in STAND.md: „ein Wächter muss
   rot werden können".)
5. **Die Card kennt nur eine Generation.** Prime kam nach der Card-Architektur.

Der wichtigste Befund für die Lösung: **Die Integration vergibt durchgängig `translation_key`s
(Platin-Qualitätsstufe, 394 Setzungen), und Prime teilt sie mit Classic** — `phase`,
`readiness`, `error`, `cleaning_map`, `rooms_map` sind dieselben Schlüssel, nur die
Entity-IDs unterscheiden sich (`sensor_prime.py:1970, 2225, 1363`; `image.py:3622-3651`).
Eine Auflösung über *Gerät + translation_key* löst damit die Ursachen 1 und 5 gemeinsam.

---

## 3. UX-Leitbild

### 3.1 Die sechs Aufgaben, für die jemand die Card öffnet

| # | Aufgabe | Häufigkeit | Heute |
|---|---|---|---|
| J1 | **„Ist alles gut — was macht er gerade?"** | mehrmals täglich | Kopf gut, aber Raum/Restzeit/Dock-Aktivität fehlen oder raten |
| J2 | **„Jetzt reinigen — diese Räume, so"** | täglich | vier verstreute Wege (Kopf, Räume…, ⚙-Tab, Favoriten, Health-ROOMS-Block), Raumwahl bei Cloud tot, keine Optionen |
| J3 | **„Was braucht meine Aufmerksamkeit?"** | wöchentlich | Hinweise verteilt auf Alert-Zone, Health-Balken, Wartungstext „über Developer Tools" |
| J4 | **„Wann reinigt er — und gerade bitte nicht"** | selten bearbeitet, oft gelesen | nur nächster Termin; Bearbeiten nur in der App |
| J5 | **„Wie lief es?"** | gelegentlich | Kalender-Heatmap gut; „letzter Lauf" und „heute" fehlen |
| J6 | **Mehrere Roboter** | Haushalte mit 2+ | Haushaltsansicht gut, Roboterwechsel gut |

J1–J3 tragen den Alltag; die Reihenfolge der Releases folgt dem: erst Korrektheit (alle
Aufgaben), dann Prime (alle Aufgaben für eine wachsende Gruppe), dann J2, J3, J4, J5.

### 3.2 Gestaltungsprinzipien

- **P1 Finden statt raten.** Entitäten werden über das Gerät des Vakuums und ihren
  `translation_key` gefunden. String-Bau nur noch als dokumentierter Rückfall.
- **P2 Ein Modell, zwei Generationen.** Die Oberfläche rendert *Rollen* (Status, Fehler,
  Räume, Favoriten, Station, Verbrauchsteile, Zeitplan), nicht Entitäten. Ein Adapter füllt die
  Rollen aus Classic- oder Prime-Entitäten.
- **P3 Die Integration spricht, die Card zeigt.** Zustände und Attributwerte werden mit
  `hass.formatEntityState` / `formatEntityAttributeValue` angezeigt — damit erscheinen sie in der
  Sprache und Formulierung der Integration (8 Sprachen, vom Integrations-Maintainer gepflegt).
  Verglichen wird nur gegen Slugs, nie gegen Anzeigetexte.
- **P4 Ruhige Oberfläche, ehrliche Diagnose.** Die Hauptansicht bleibt ruhig (Fehlendes wird
  nicht als Fehler gezeigt), aber eine Card-Diagnose im ⚙-Tab zeigt jede Rolle mit ihrer
  Quelle oder dem Grund ihres Fehlens. Erklärende Leerzustände dort, wo der Nutzer etwas
  erwartet („lernt noch — ~2 Läufe", „braucht iRobot-Konto").
- **P5 Handeln, wo man liest.** Jeder Hinweis hat eine Aktion: Zurücksetzen, Behälter leeren,
  auf der Karte zeigen, Raum nachreinigen. Kein „über Developer Tools" mehr.
- **P6 Ein Satz zuerst.** Der Kopf beantwortet J1 in einem Satz mit klarer Rangfolge:
  Problem > blockiert > offline > aktive Reinigung > Station arbeitet > bereit.
- **P7 Ein Weg pro Aufgabe.** Eine Aufgabe hat genau einen Einstieg; Abkürzungen führen in
  denselben Fluss (Favorit im Kopf → derselbe Reinigen-Dialog, vorbelegt).
- **P8 Keine Bedienelemente mit unbelegter Wirkung.** Was die Integration bewusst als
  Automation statt Bedienelement führt (Prime-DND, siehe Versionsplan v4 „Beta-Kriterium"),
  zeigt die Card nur lesend.

### 3.3 Zielbild der Informationsarchitektur

```
┌ Kopf (immer) ───────────────────────────────────────────────┐
│ ● Reinigt Küche · noch ~18 min · 3 von 5 Räumen             │  ← ein Satz (P6)
│ [ Reinigen ▾ ]  [ Pause ]  [ Station ]          ⚠ 2         │  ← Primäraktion + Aufmerksamkeits-Chip
│ (während Reinigung: Raumfolge ✓ Flur ✓ Bad ● Küche ○ Wohnen) │
├ Tabs ───────────────────────────────────────────────────────┤
│ Karte │ Plan │ Pflege │ Verlauf │ ⚙                         │
└─────────────────────────────────────────────────────────────┘
```

- **Karte** — Raumkarte (`image.*_rooms_map`, beide Generationen, kalibriert), Räume
  antippen = Auswahl, Live-Position; Heatmap, Hindernisse, Zonen als zuschaltbare Ebenen.
- **Plan** *(neu)* — Wochenplan, nächster Lauf, Pläne an/aus, Ruhezeiten lesend.
- **Pflege** *(bisher Health)* — Aufmerksamkeits-Eingang oben, Verbrauchsteile, Station,
  Roboter-Gesundheit.
- **Verlauf** — Letzter Lauf, Heute, Kalender, Tagesdetail, Haushalt.
- **⚙** — Einstellungen nach Gruppen (Reinigen, Wischen, Station, Roboter), Card-Diagnose.

Begleitmodus mit xiaomi-vacuum-map-card bleibt: Kartentab aus, Raumwahl über XVMC.

---

## 4. Release-Plan

Jedes Release: Ziel · Umfang · Akzeptanz · Voraussetzungen in der Integration · Feldtest.
Arbeitsweise wie gewohnt: vollständige Umsetzung, Zwischenläufe der betroffenen Testdateien,
mehrere Bug-Hunt-Runden vor Auslieferung, Negativkontrollen für jeden Fix, eine Testdatei je
Moduldatei, Verzeichnisse unter 100 Dateien.

### 4.1 v2.5.0 — „Wieder richtig" *(konsolidiert in die unveröffentlichte 2.5.0)*

**Ziel:** Classic-Nutzer bekommen die Card zurück, die sie installiert haben. Schnell
auslieferbar, geringes Regressionsrisiko — gezielte Korrekturen, noch kein Umbau.

**Bestand aus dem Juli (bleibt):** Gentle Mode, Fleet Health, Household-Skeleton,
Spinner-Fix, i18n in 8 Sprachen.

**Neu hinzu:**

| # | Korrektur | Betroffen | Details |
|---|---|---|---|
| F1 | **Readiness-Slugs (#17)** | alle | Vergleich gegen `ready`/`bin_full`; Text über `hass.formatEntityState` statt eigener Zuordnung. Testfixture `st('Ready')` → `st('ready')`; Negativkontrolle. |
| F2 | **Phase-Slugs** | alle | `emptying_bin` (statt `evac`) für Kopfzustand; neue Werte sauber abbilden: `charging_mid_mission` → Aufladen-Zeile, `no_contact`/`not_responding` → Offline-Zustand, `washing_pad`/`drying_pad`/`refilling_tank` → Stationszustand. |
| F3 | **Raumauswahl wiederbeleben** | Classic SMART + Cloud | Zusätzlich `select.{n}_cloud_zone_*` finden (eine je Karte), aktive Karte über `is_active_map`; `region_icons`/`region_areas_m2` von dort statt vom Vakuum. |
| F4 | **Aktueller Raum** | alle | `device_tracker.{n}` (Rückfall `_position`), Attribut `room` lesen statt Zustandstext. |
| F5 | **Abdeckungsbalken** | Cloud | `cleaning_performance.coverage_pct` statt `recent_coverage_pct`. |
| F6 | **Rohwerte formatieren** | Clean Base, Braava/Combo | `clean_base_status`, `mop_pad`, `mop_behavior` über `formatEntityState`. Pad-Balken: auf `pad_days_until_due` als Tageswert umstellen (es gab nie ein `threshold_days`). |
| F7 | **Verbrauchsbalken** | Classic mit Cloud-Teilen | Bezugsgröße `max_hours` wenn vorhanden, sonst `threshold_hours`. |
| F8 | **Umbenannte Alt-IDs** | Alt-Installationen | Rückfallkette `_battery`→`_battery_level`, `_map`→`_cleaning_map` (Migration `migrations.py:1294-1303`). |
| F9 | **Teppich-Boost** | i7/j7/Braava | Zeile nur bei vorhandener Entität (prüfen, dass kein Geisterzustand bleibt). |
| F10 | **Prime-only-Verlauf** | Prime | Auf 404 statt „requires v1.8" ein ehrlicher Text: „Verlauf für diesen Roboter noch nicht verfügbar" (bis Integration I1). |
| F11 | **Karte auf Desktop (#20)** | alle | Bild-Wrapper mit `max-height: min(70vh, …)` und `aspect-ratio`, damit Pins und Raum-Overlay deckungsgleich bleiben (Overlay hängt am Wrapper). Ausrichtung der Hindernis-Pins gegen die seit a45 gespiegelte Heatmap neu prüfen. |
| F12 | **Explain** | Classic | `pick_events` lesen, `robot_lifted` nur noch als Rückfall. |
| F13 | **Französisch (#21)** | FR | `fr.ts` gegen die Datei von @Geo26160 abgleichen; Credit in Release-Notes. |
| F14 | **Housekeeping** | — | README: Integrationslink `johnnyh1975/ha_roomba_plus` (heute `roomba_plus`); HACS-Badge `category=plugin` (heute `dashboard` → wahrscheinlich @arielgrs „not found"); HA-Minimum 2024.1 → **2025.5** wie die Integration; `status-zone.ts` auf GitHub ausdrücklich als gelöscht melden. |
| F15 | **Vertragswächter v1** | — | Test, der die Slugs, gegen die die Card vergleicht, mit den State-Keys aus `translations/en.json` der Integration abgleicht (eingecheckter Auszug + Skript zum Aktualisieren). Wird rot, wenn ein Vergleichswert verschwindet — genau die Fehlerklasse von #17. |

**Umsetzungsstand (3. Oktober 2026):** F1–F15 umgesetzt. F13: `fr.ts` Text für Text mit der
Datei von @Geo26160 abgeglichen, 44 Formulierungen übernommen; nach v2.4.0 hinzugekommene Texte
bleiben Erstentwurf. Nebenbefund daraus: „Entwicklerwerkzeuge → Dienste“ heißt seit HA 2024.8
„→ Aktionen“, in allen 8 Sprachen korrigiert. 928 Tests, 18 Negativkontrollen, zwei
unabhängige Bug-Hunt-Runden. Mindestanforderung jetzt Integration ≥ 4.2, HA ≥ 2025.5 — von der
Card zur Laufzeit geprüft, Hinweis oben in der Card bei Unterschreitung (942 Tests).
Über den Plan hinaus mitbehoben, weil im Code gefunden:

- **Metrik-Erkennung:** HA meldet `km`/`mi`, die Card prüfte auf `m` — jede metrische
  Installation sah ft². Flächensensoren werden jetzt in ihrer eigenen Einheit (m²) gelesen.
- **Raum-Icons:** Integration sendet `mdi:…`, die Emoji-Tabelle war ohne Präfix — Icons
  erschienen nie. 11 fehlende Raumtypen ergänzt.
- **Karten-Overlays (F11 erweitert):** Bild auf den belegten Rasterbereich zugeschnitten
  (kein leerer Quadratrest), Pins und Raum-Overlay im exakten Rahmen des Renderers
  (`cell_size_mm`) statt per Achse gestreckt bzw. mit der Kalibrierung eines anderen Bildes.
  Hindernis-/Sperrzonen-Pins entfernt — der Hazards-Endpunkt liefert sie in UMF-Einheiten
  (siehe I9); die Zonen-Ebene zeigt dieselben Daten korrekt.
- **Prime-Favoriten** (`_favorite_`), Fehlermeldung von `clean_room` im Klartext, keine
  Knöpfe während der Behälterleerung, Render-Wache als echtes Modul getestet (die alte
  Testkopie war abgedriftet).

Neue Module: `entity-ids.ts` (Rückfalltabelle, Vorstufe zu A1), `slugs.ts` + Vertragswächter,
`relevant-entity-ids.ts`.

**Akzeptanz:** Auf einer Classic-SMART-Installation mit Cloud (i7) erscheinen Raumauswahl,
aktueller Raum, korrekter Wartungshinweis und Abdeckungsbalken; Desktop-Karte vollständig
sichtbar; Oberfläche in DE/FR/IT/PL bei passender HA-Sprache.

**Integration:** keine Voraussetzung.

**Feldtest:** @azrael-229 (Melder #17/#20; 980 lokal + i7 Cloud), @Thonno (i7+, IT),
@mdarocha (i3+, PL), @Geo26160 (i7+, FR), @boutXIII (Braava m6, FR).

### 4.2 v3.0.0 — „Ein Modell, beide Generationen"

**Ziel:** Die Card hat ein tragfähiges Fundament und ist für Prime-Besitzer vollwertig.
Hauptversion, weil Architektur, Kartentab-Quelle und Mindestanforderungen sich ändern.

**A — Fundament**

| # | Baustein | Inhalt |
|---|---|---|
| A1 | **Entity-Resolver** | Vakuum → `hass.entities[vac].device_id` → alle Einträge desselben Geräts mit `platform: roomba_plus` → Index nach `domain:translation_key`. Dynamische Familien (Favoriten, Teile, Zeitpläne, Kartenselects, `last_cleaned_*`) als Listen. Rückfallkette: `translation_key` → `device_class` (Batterie hat keinen Key) → dokumentierter Suffix. Zwischenspeicher an die Identität von `hass.entities` gebunden. Ersetzt alle `${n}_…`-Konstruktionen. |
| A2 | **Robotermodell** | Generationsneutrale Rollen: `status` (Aktivität, Phase-Slug, `dock_activity`, offline), `error` (Code, Titel, Beschreibung, Schwere, `partially_operable`, verfügbare Modi), `startCheck`, `rooms` (id, Name, Karte, Icon, Fläche), `favorites`, `progress` (aktueller/nächster Raum, Folge, beobachtet/geplant, Restzeit), `consumables[]`, `dock`, `mop`, `schedule`, `maps`. Die Zonen rendern Rollen. |
| A3 | **Wertdarstellung** | Alle Zustands- und Attributwerte über `formatEntityState`/`formatEntityAttributeValue`. Card-eigene Wörterbücher schrumpfen auf Card-Bedienelemente — kleineres Bundle, keine doppelte Übersetzungspflege. |
| A4 | **Card-Diagnose** | ⚙ → „Card-Diagnose": Integrationsversion (`X-Roomba-Plus-Api-Version`), Generation/Stufe, Tabelle Rolle → Entität → Quelle (Key/Rückfall/fehlt + Grund), „Für Issue kopieren" als Markdown. Senkt den Supportaufwand direkt. |
| A5 | **Responsive Hülle** | `getGridOptions()` für Abschnitts-Dashboards, Container-Queries; ab ~700 px zweispaltig (Karte | Inhalt). Vollendet #20. |
| A6 | **Visueller Editor** | Entitätsauswahl gefiltert auf `integration: roomba_plus`, `domain: vacuum`, mehrere Roboter; Modus, Standardtab, Kartendrehung. |
| A7 | **Vertragswächter v2** | CI-Job klont `ha_roomba_plus` (`main` und Beta-Branch), extrahiert translation_keys, State-Keys und Service-Felder, die die Rollentabelle benutzt, und schlägt bei Abweichung fehl. Die Integration ist öffentlich, der Job braucht keine Zugangsdaten. |

**B — Prime auf Augenhöhe**

| # | Bereich | Quelle (Prime) |
|---|---|---|
| B1 | Status & Phase | `prime_phase` (Key `phase`, inkl. `dock_task`), Vakuum `dock_activity`, `cleaning_mode`; Tracker-Zustand „Dock busy" |
| B2 | Fehler verständlich | `prime_error` (Key `error`): `error_title`, `error_description`, `severity`; `partially_operable` + `available_modes` → „Wischen nicht möglich — nur Saugen" |
| B3 | Startprüfung | `binary_sensor.*_prime_start_blocked`: `blocked_reason`, `available_modes` |
| B4 | Favoriten | Vakuum-Attribut `favorites` (`[{id,name}]`, **beide Generationen**) + `roomba_plus.run_favorite` — ersetzt die Button-Suche (`_fav_` vs. `favorite_`) |
| B5 | Räume | `select.*_prime_zone_select` (Räume und Zonen, gruppiert nach `segment_map`) → `roomba_plus.clean_room` |
| B6 | Karte | Kartentab-Gate auf `rooms_map` statt `coverage_map`; `image.*_rooms_map` (Räume, `calibration_points`, `room_preferences`), Live-Bild `prime_cleaning_map` (Key `cleaning_map`), `select.*_prime_map` („Dem Roboter folgen") |
| B7 | Verbrauchsteile | `prime_part_{id}` mit eigener Einheit (Stunden, Läufe, Leerungen) |
| B8 | Erreichbarkeit | `binary_sensor.*_connected`, `prime_connection_health`, Phase `no_contact` |

**C — Kartentab für alle neu fundiert:** Basisbild `image.*_rooms_map` (Classic SMART und
EPHEMERAL mit Aligner, Prime) statt der Coverage-Heatmap; Räume antippen = auswählen;
Live-Position (Classic-Pose `x_mm/y_mm` am Tracker, Prime-Live-Bild); Heatmap, Hindernisse,
Zonen, Türen, Möbel als Ebenen. Mehrere Karten: Etagenwahl über Prime-Kartenselect bzw. die
Classic-Selects je Karte. Damit erledigt sich die seit v2.4 offene Frage, ob Overlay
(`image.*_map`) und Bild (`coverage_map`) aus demselben Rahmen stammen — seit 4.0.0b2 teilen
Raumkarte und Reinigungspfad ohnehin einen Rahmen.

**Akzeptanz:** Ein Prime-Combo (z. B. @chairstacker G185020) zeigt Kopfzustand inkl.
Stationsaktivität, verständliche Fehler, Favoriten, Raumauswahl mit Etage, Kartentab mit
Räumen, Verbrauchsteile. Die Card-Diagnose listet für eine Classic- und eine Prime-Installation
jede Rolle mit Quelle. Kein `${n}_`-String-Bau mehr außerhalb der Rückfalltabelle.

**Integration:** I1 (REST im Prime-Pfad) für den Prime-Verlauf, I2 (Prime-Rooms-Overdue)
für den ROOMS-Block — Rest der Card funktioniert ohne beides. Siehe §5.

**Feldtest:** Prime: @chairstacker, @DaRealGuGu, @jayjay13011, @arielgr, @utkjmitch,
@jouwdan. Classic-Gegenprobe: @Thonno, @mdarocha, @liblit (980, EPHEMERAL), eigener 980.
Gemischter Haushalt: @jpatchMC.

**Umsetzungsstand (3. Oktober 2026, Paket 3.0.0, noch nicht veröffentlicht):** A1–A7, B1–B8 und C
umgesetzt, E3 (3.0.0), E6 („Pflege“, EN „Care“, Tab-ID bleibt `health`) und E7 (Heatmap als
Ebene) wie empfohlen entschieden. 1.049 Tests, zwei unabhängige Bug-Hunt-Runden, Negativkontrollen
je Fix, Sichtprüfung (Classic breit/schmal, Prime Karte/Pflege/⚙). Neue Module: `registry.ts`
(einzige Stelle mit ID-Bau), `robot-model.ts` (Rollen status/error/startCheck/rooms/parts/dock),
`zones/map-zone.ts`, `diagnostics.ts`, `layout.ts`; CI-Job `contract` mit
`scripts/contract_check.py` gegen `main` + neuesten `dev-*`-Branch (wöchentlich).
Abweichungen vom Plan bzw. am Code geklärt:

- **Classic-Raumwahl behält Zonen:** `clean_room` lehnt Zonen nur im Prime-Pfad ab; Classic
  schickt sie als `zid` (`room_cleaning.py:1856-1867, 2172`). Prime: Räume des gezeigten
  Stockwerks aus der Raumkarte, Namen anderer Stockwerke bleiben (Prime-`clean_room` nimmt sie).
- **Classic-Fehler „live“ über den `error`-Sensor**, nicht das Vakuum-Attribut `error_code`:
  das bleibt nach dem Andocken stehen (`sensor_helpers.py:150-167`). Betraf auch den
  Health-Alarm seit 2.2.
- **Zwischenladen meldet `paused`** (beide Generationen, `vacuum.py:510/569`) — Kopf zeigte
  „Pausiert“ + Fortsetzen. Behoben.
- **Pose-Rahmen:** Tracker `x_mm/y_mm` ungetauscht, Karten mit vertauschten Achsen
  (`image.py:2034`) — die Card tauscht beim Zeichnen.
- **Unausgerichtete Classic-Karte:** Raumkarte + 2.5-Abdeckungsansicht darunter (Heatmap liegt
  in anderem Rahmen); UMF-Pins werden dort nicht gezeichnet (Einheit der Cloud-Schwerpunkte offen).
- **Kein „Als ersetzt markieren“ bei Prime-Teilen:** `reset_*` setzt den Zähler des Roboters
  nicht zurück (P8).
- Render-Wache vergleicht zusätzlich `last_updated`; identisches Markup wird nicht neu gesetzt.

### 4.3 v3.1.0 — „Reinigen in einem Fluss"

**Ziel:** J2 in einem Weg. Vom Wunsch („Küche und Flur, nur wischen, zweimal") bis zur
Live-Rückmeldung ohne Umweg.

| # | Baustein | Inhalt |
|---|---|---|
| R1 | **Reinigen-Dialog** | Ein Einstieg „Reinigen ▾" mit Quellen: *Alles* · *Räume* (Mehrfachauswahl, Reihenfolge per Ziehen → `ordered: true`) · *Favoriten* · *Zonen* (Prime: `clean_zone`) · *Vorschläge* (überfällige Räume → `clean_overdue_rooms`, schmutzige Räume → `auto_clean_dirty_rooms`). Ersetzt die Raumliste im ⚙-Tab, die Favoritenreihe und die zwei Knöpfe im Health-ROOMS-Block (die dorthin verlinken). Kartentab-Auswahl öffnet denselben Dialog vorbelegt. |
| R2 | **Optionen** | `cleaning_mode` (Saugen/Wischen/beides, nach Fähigkeit gefiltert), `two_pass`, `pad_wetness`, `smart_scrub`; je Raum abweichend über `room_passes`. Nur angeboten, was der Roboter kann (Modell aus A2). |
| R3 | **Vorab-Prüfung** | Vor „Start": Classic-Readiness (Behälter voll, Tank leer …), Classic `start_blocked` (falls aktiviert), Prime `prime_start_blocked`, Karte ≠ Roboterkarte (`segment_map` vs. `robot_on_map`), offline. Blockiert nur, was wirklich blockiert; sonst Hinweis + „trotzdem starten". |
| R4 | **Live-Ansicht** | Im Kopf während der Reinigung: Raumfolge aus `mission_progress.room_sequence` mit ✓/●/○, aktualisiert über das Ereignis `roomba_plus_room_completed`; *geplant* vs. *beobachtet* sichtbar unterschieden (`room_progress_observed`); Restzeit aus `estimated_remaining_min` (ersetzt die 45-Minuten-Schätzung); Zwischenladen mit Fortsetzungszeit; Stationsaktivität. |
| R5 | **Eingreifen** | „Raum überspringen" (`advance_room`), Pause/Zur Station; Festgefahren-Banner aus `roomba_plus_stuck` („steckt seit 4 min im Bad fest") mit „auf Karte zeigen". |

**Akzeptanz:** Raumreinigung mit eigener Reihenfolge und Wischmodus startet in ≤ 3 Tipps;
die Raumfolge im Kopf stimmt mit dem tatsächlichen Ablauf überein (Feldvergleich
Classic + Prime); keine doppelten Einstiege mehr im UI.

**Integration:** keine Voraussetzung (alle Services und Attribute in 4.2.18 vorhanden).

**Feldtest:** @ScenicSystemsLLC (Mehrkarten-Missionen), @Thonno, @chairstacker (Combo),
@KingAntDesigns (j7+, Braava m6).

### 4.4 v3.2.0 — „Pflege & Station"

**Ziel:** J3 — ein Ort, an dem alles steht, was Aufmerksamkeit braucht, und jedes davon ist
mit einem Tipp erledigt.

| # | Baustein | Inhalt |
|---|---|---|
| M1 | **Aufmerksamkeits-Eingang** | Oben im Pflege-Tab, Rangfolge: Fehler > blockiert > offline > Stationsproblem > Wartung fällig > Hinweis. Jede Zeile mit Aktion. Kopf-Chip ⚠ zählt offene Punkte. Bündelt die heutige Alert-Zone. |
| M2 | **Ein-Tipp-Zurücksetzen** | Reset-Buttons statt Developer-Tools-Text: `reset_wheel_cleaning`, `reset_contact_cleaning`, `reset_bin_cleaning`, `reset_side_brush`, `reset_clean_base_bag` (letztere zwei **nur als Button**, kein Service), dazu Filter/Bürste/Pad/Akku. |
| M3 | **Verbrauchsteile in Tagen** | „Filter in ~12 Tagen" aus `*_days_until_due` (Filter, Bürste, Seitenbürste, Pad, Beutel); Prime-Teile mit Originaleinheit; zuletzt ersetzt; Verschleißtrend. Hinweis, wenn Wartungssensoren standardmäßig deaktiviert sind (Rad/Kontakt/Behälter, Beutel) — mit Link zur Entität. |
| M4 | **Station** | Classic: Behälter leeren (`button.*_evac`, bei `dockComm`), Clean-Base-Status/Beutel. Prime: `prime_empty_bin`, `prime_wash_pad`, `switch.*_prime_pad_dry`, Dock-/Wasch-/Trockenstatus, Frischwassertank (`prime_dock_tank_level`), `prime_dock_error`, Absaughäufigkeit. Knöpfe nur, wenn der Dock-Zustand sie zulässt. |
| M5 | **Roboter-Gesundheit** | Score mit `status_text`/`recommendation` (vorhanden), Akkukapazität und voraussichtliches Lebensende. |

**Akzeptanz:** Jede Meldung im Eingang hat eine Aktion oder eine klare Erklärung; kein Text
verweist mehr auf Developer Tools; Prime-Station vollständig bedienbar.

**Integration:** optional I4 (Anleitungslink je Teil).

**Feldtest:** Clean-Base: @ronluna (S9+), @Thonno; Prime-AutoWash: @chairstacker;
Braava: @boutXIII.

### 4.5 v3.3.0 — „Zeitpläne"

**Ziel:** J4 ohne iRobot-App — die Integration kann beide Generationen schreiben, die Card
macht es zugänglich.

| # | Baustein | Inhalt |
|---|---|---|
| S1 | **Plan-Tab** | Wochenansicht aus dem Zeitplan-Kalender — Classic `calendar.*_schedule`, Prime `calendar.*_prime_schedule`, beide mit Key `schedule`, der Resolver findet sie ohne Sonderfall (die Doku nennt für Prime den falschen Namen) — über die Kalender-API; nächster Lauf (Classic `next_clean`, Prime aus dem Kalender abgeleitet — es gibt keinen Prime-`next_clean`). |
| S2 | **An/Aus** | Prime: `switch.*_schedule_{id}` je Plan. Classic: Zeitplan pausieren (`switch.*_schedule_hold`, vorhanden). |
| S3 | **Bearbeiten** | Anlegen/Ändern/Löschen über die Kalender-Websocket-Befehle mit wöchentlicher RRULE, bei Prime mit Räumen. Nach jedem Schreiben zurücklesen und vergleichen; bei Abweichung deutlicher Hinweis. Stufe 1: Uhrzeit, Tage, an/aus. Stufe 2: Räume und Modus (Prime). |
| S4 | **Ruhezeiten** | Prime `prime_quiet_hours` (`windows`) nur lesend (P8). |
| S5 | **Anwesenheit** | Die bestehende Anwesenheits-Auswertung (Gelegenheiten, Auslastung, wahrscheinliches Fenster) zieht hierher. |

**Akzeptanz:** Ein Prime- und ein Classic-Plan lassen sich in der Card anlegen, ändern und
abschalten; die iRobot-App zeigt danach denselben Plan.

**Integration:** keine Voraussetzung (Kalender seit 4.0.0 schreibbar).

**Feldtest:** @chairstacker, @utkjmitch (Prime), @Thonno (Classic), @liblit (980, altes
Zeitplanformat).

### 4.6 v3.4.0 — „Rückblick"

**Ziel:** J5 — in drei Sekunden sehen, wie der letzte Lauf war und was heute passiert ist.

| # | Baustein | Inhalt |
|---|---|---|
| H1 | **Letzter Lauf** | Classic: `last_mission_summary` (Ergebnis, Dauer, Fläche, Räume mit Abdeckung, Akku Start→Ende, Zwischenladungen, Leerungen, Fehler, Auslöser). Prime: aus `records` + `prime_mission_event.unfinished_rooms` („Schlafzimmer ausgelassen"). |
| H2 | **Heute** | REST `/digest` — laut Integration für genau diesen Platz gebaut (Läufe, Fläche, Festfahrer, Bedarfsreinigungen). |
| H3 | **Tagesdetail** | Raum-Abdeckung je Lauf (seit 4.2.15 endlich befüllt; Räume < 10 % zählen nicht als gereinigt — so darstellen), Zwischenladungen, Leerungen, Fahrzeit, Fehlercode, `room_dirt_index`. |
| H4 | **Trends verständlich** | `dirt_trend`/`dirt_cause`, `coverage_pct`, `zone_coverage_health` (jeder Raum gegen seinen eigenen Rhythmus) als Sätze statt Zahlen. |
| H5 | **Haushalt** | Je Roboter „Heute" aus `/digest`; Fleet Health bleibt. |

**Integration:** I1 für Prime-Verlauf.

**Feldtest:** @ScenicSystemsLLC, @nareso (#176, Missionszeiten), @jpatchMC (zwei Roboter).

---

## 5. Anforderungen an die Integration

> **Stand 3. Oktober 2026:** I1, I2, I8 und I9 sind in **4.2.19 / 4.3.0b7** umgesetzt und am
> Code geprüft; Card 2.5.0 nutzt sie (Hazard-`space`, Prime-`rooms_overdue`, Prime-Verlauf).
> Offen: I3 (Doku — DND-IDs `do_not_disturb`/`in_quiet_hours` in FEATURES.md/AUTOMATIONS.md,
> Kalender „read-only“ in README.md:277 und AUTOMATIONS.md:51 stehen weiterhin falsch), I4–I7,
> I10, sowie Event-Entities für Nicht-Admins (Mission beendet) — für Card 3.x relevant.

| # | Anforderung | Warum | Priorität | Vorschlag |
|---|---|---|---|---|
| **I1** | REST-Views auch im Prime-Setup registrieren | Prime-only-Installationen haben **keine** `/api/roomba_plus/*`-Routen (Registrierung nur in `_phase_finalize` des Classic-Pfads, `__init__.py:1145-1155`). API.md sagt „Both generations". Blockiert Prime-Verlauf, Haushalt, Explain. | hoch | 4.3.0 |
| **I2** | Gate von `PrimeRoomsOverdueSensor` / `PrimeRoomCleaningHistorySensor` reparieren | Gate verlangt `cloud_coordinator`, den Prime-Einträge nie haben (`sensor.py:363`, `__init__.py:1825-1844`) — die Sensoren entstehen nie, obwohl der Kommentar ausdrücklich Prime meint. Toter Code. | hoch | 4.3.0 |
| I3 | Doku zu Prime-Entity-IDs korrigieren | FEATURES.md/Release-Notes nennen `switch.*_do_not_disturb`, `binary_sensor.*_in_quiet_hours`, `select.*_select_room_or_zone`, `calendar.*_schedule`; der Code ergibt `prime_quiet_hours_active`, `prime_quiet_hours`, `prime_zone_select`, `prime_schedule`. API.md: `ended_at`, `n_mssn`, `zone_coverage_health`, Status 409/502 fehlen. | mittel | Doku, jederzeit |
| I4 | Anleitungslink je Verbrauchsteil als Attribut | Der ContentStack-Teile-Endpunkt liefert `guide_url` je Teil — als Attribut am Teilesensor könnte die Card „So tauschst du es" verlinken. Erst prüfen, ob schon exponiert. | niedrig | später |
| I5 | `roomba_plus_mission_completed` auf Prime mit Nutzlast | Prime sendet nur `entry_id`; Classic eine reiche Nutzlast. Für Live-Rückmeldung „fertig: 5 Räume, 42 m²". | niedrig | später |
| I6 | Regel für `X-Roomba-Plus-Api-Version` | Header existiert (für die Card gedacht), aber ohne dokumentierte Erhöhungsregel ist er als Kompatibilitätsprüfung wertlos. | niedrig | Doku |
| I7 | AUTOMATIONS.md-Starter-Dashboard | Verweist auf die standardmäßig deaktivierte Wartungsliste und `image.*_cleaning_map`; könnte die Card für Raum-/Kartennutzung empfehlen. | niedrig | Doku |
| **I8** | `clean_room` muss Aliase auflösen | Raumselect benennt Optionen per `resolve_zone_name` (Alias > Cloud > lokal > Label > „Zone N“, `select.py:921-943`); `ClassicRoomCleaning.available_rooms` (`room_cleaning.py:1812ff`) kennt nur `smart_zone_data` und Cloud-Namen. Ein umbenannter Raum steht in der Card, `clean_room` antwortet „Unknown room(s)“. Gefunden im 2.5.0-Bug-Hunt. | hoch | 4.3.0 |
| I9 | Hazards-Endpunkt: einheitlicher Koordinatenrahmen | `format=hazards` liefert `stuck_events` in Pose-mm, `robot_learned`/`keepout` aber in UMF-Einheiten (`api_views.py:556-590`, ohne `umf_to_pose`). Umrechnen oder `space` mitliefern. | mittel | 4.3.x |
| I10 | Kartenrahmen der Coverage-Map | Durch 2.5.0 **nicht mehr nötig**: die Card rechnet den Renderer aus `x/y_min/max_mm` + `cell_size_mm` exakt nach. Ein explizites Attribut (z. B. `render_extent_mm`) wäre robuster gegen spätere Renderer-Änderungen. | niedrig | optional |
| **I11** | Pose im Kartenrahmen am Tracker | `device_tracker` liefert `x_mm/y_mm` aus der Roh-Pose (`device_tracker.py:604`), alle Karten nutzen den getauschten Rahmen (`image.py:2034`). Card 3.0 tauscht selbst; ein rahmengleiches Attributpaar wäre robust. | mittel | 4.3.x |
| **I12** | Raumnamen der Classic-Raumkarte = Anzeigenamen | `rooms` der Raumkarte per `rid_to_name()` (Cloud-Name/ID), Raumselect per `resolve_zone_name()` (Alias zuerst). Räume mit Alias sind auf der Karte nicht antippbar. Gleiche Benennung oder Regions-ID an beiden. | mittel | 4.3.x |
| I13 | Prime-Zonen kenntlich machen | `prime_zone_select` mischt Räume und Zonen aller Karten ohne Kennzeichnung; die Card trennt nur auf dem gezeigten Stockwerk. Attribut z. B. `zones: [...]`. | niedrig | 4.3.x |
| I14 | Einheit der beobachteten Hindernis-Schwerpunkte (Q6) | `observed_zone_centroids` roh aus der Cloud, Raumpolygone ×1000; vor der Ausrichtung zeichnet die Card UMF-Pins deshalb nicht. | niedrig | später |

---

## 6. Architektur & Qualitätssicherung

### 6.1 Rollentabelle (Kern des Resolvers)

Auszug; vollständig im Code als einzige Quelle. „Key" = `translation_key`.

| Rolle | Classic | Prime | Rückfall |
|---|---|---|---|
| Phase | `sensor` · `phase` | `sensor` · `phase` (`_prime_phase`) | `_phase` |
| Bereitschaft | `sensor` · `readiness` | `sensor` · `readiness` (`_prime_readiness`) | `_readiness` |
| Fehler | `sensor` · `error` / `last_error_code` | `sensor` · `error` (`_prime_error`) | — |
| Akku | `sensor` · device_class `battery` | dito | `_battery`, `_battery_level` |
| Fortschritt | `sensor` · `mission_progress` | dito | — |
| Raumwahl | `select` · `cloud_smart_zone_select` (Liste) / `smart_zone_select` | `select` · `prime_zone_select` | `_cloud_zone_*` |
| Raumkarte | `image` · `rooms_map` | `image` · `rooms_map` | — |
| Live-/Pfadkarte | `image` · `cleaning_map` | `image` · `cleaning_map` (`_prime_cleaning_map`) | `_map`, `_cleaning_map` |
| Position | `device_tracker` · `position` | dito | `device_tracker.{n}` |
| Startprüfung | `binary_sensor` · `start_blocked` (opt-in) | `binary_sensor` · `prime_start_blocked` | — |
| Zeitplan | `calendar` · `schedule` | `calendar` · `schedule` (`_prime_schedule`) | — |
| Plan an/aus | `switch` · Zeitplan pausieren (`_schedule_hold`) | `switch` · `prime_schedule` (Liste, `_schedule_{id}`) | — |
| Favoriten | Vakuum-Attribut `favorites` | dito | — |
| Verbrauchsteile | `*_days_until_due`, `*_remaining_hours` | `sensor` · `prime_consumable_part` / je Teil (Liste) | — |

Alle Keys oben sind gegen 4.3.0b6 geprüft (`sensor_prime.py:1363, 1876-1891, 1970, 2225`;
`select_prime.py:1323`; `select.py:605, 904`; `image.py:3080, 3622-3651`;
`device_tracker.py:150`; `binary_sensor.py:685, 1704`; `calendar.py:289, 676`;
`prime_schedule_switch.py:446`). Das Muster ist durchgängig: **Prime teilt die Keys mit
Classic, wo die Rolle dieselbe ist** (Phase, Bereitschaft, Fehler, Pfadkarte, Raumkarte,
Zeitplan) — nur die Entity-IDs tragen das `prime_`-Präfix.

**Voraussetzungen, im ersten Schritt von 3.0.0 zu belegen, bevor der Umbau beginnt:** dass
`hass.entities[...]` im Frontend `device_id`, `platform` und `translation_key` für alle
Roboter-Entitäten liefert, und dass `hass.formatEntityState` / `formatEntityAttributeValue`
die Übersetzungen der Integration verwenden. Beides gehört zu den Frontend-Grundlagen der
HA-Versionen ab dem neuen Card-Minimum 2025.5; geprüft wird mit einem Registry-Schnappschuss
einer echten Installation statt auf Annahme. 2.5.0 nutzt `formatEntityState` bereits für
F1/F6 — dort mit Rückfall auf den Rohwert, falls die Funktion fehlt.

### 6.2 Tests

- **Registry-Schnappschüsse als Fixtures:** echte `hass.entities`-Auszüge je Familie
  (Classic SMART+Cloud, Classic lokal, EPHEMERAL 980, Braava m6, Prime Combo, gemischter
  Haushalt) — aus der Card-Diagnose (A4) gewonnen, nicht erfunden.
- **Eine Testdatei je Moduldatei**, gezielte Tests auf den Kern der Änderung,
  Negativkontrolle je Fix (Fix zurücknehmen → Test rot → Fix wieder rein).
- **Vertragswächter** v1 (2.5.0, Slugs) und v2 (3.0.0, CI gegen beide Integrations-Branches).
- **Dateigrenze:** neue Module (`resolver.ts`, `robot-model.ts`, Plan-Tab, Dialoge) so
  schneiden, dass kein Verzeichnis 100 Dateien erreicht (Web-Upload-Grenze).

### 6.3 Invarianten (neu bzw. geändert)

1. **Keine Entity-ID wird außerhalb der Rückfalltabelle per String gebaut.**
2. **Kein Vergleich gegen Anzeigetext.** Verglichen wird gegen Slugs, angezeigt wird über
   `formatEntityState`.
3. **Fehlende Rolle ≠ unsichtbar.** Die Hauptansicht bleibt ruhig, die Card-Diagnose nennt
   den Grund.
4. Bestehend und weiterhin gültig: Präsenz-Gating für ältere Integrationen; jede neue
   Entität gehört in die Render-Wache (über den Resolver jetzt automatisch: alle Entitäten des
   Geräts).

---

## 7. Bewusst nicht

| Was | Warum |
|---|---|
| Prime-Ruhezeiten (DND) als Schalter | Wirkung im Feld unbelegt (ein Prime fuhr im DND-Fenster); Integration führt es bewusst als Automation. Nur lesend (P8). |
| Kartenbearbeitung (Räume umbenennen, teilen, verbinden) | Gehört in die iRobot-App; hohes Risiko, geringe Häufigkeit. |
| Backup/Restore-Oberfläche | Dateiauswahl, seltener Vorgang, falsche Stelle. |
| Benachrichtigungen in der Card konfigurieren | Gehört in die Blueprints der Integration. |
| Eigener Kartenrenderer statt xiaomi-vacuum-map-card | XVMC-Unterstützung der Integration ist ausgereift; Begleitmodus bleibt. |
| Verbrauchsmaterial-Nachbestellung | Kein Kern-UX-Wert (wie in der UX-Synthese entschieden). |
| Automatisches Fortsetzen nach Festfahren | Beschädigungsrisiko (UX-Synthese). |
| Pro-Sprache nachgeladene Bundles | HACS liefert eine Datei; mit A3 schrumpfen die Wörterbücher ohnehin. Neu bewerten erst über ~400 kB. |
| Coverage-Heatmap als Kartengrundbild | Diagnostisch; wird Ebene auf der Raumkarte. |

---

## 8. Reihenfolge und Abhängigkeiten

```
2.5.0  Wieder richtig ──────────────┐   (keine Integrations-Voraussetzung)
                                     ▼
3.0.0  Resolver · Modell · Prime ───┬──── I1, I2 in Integration 4.3.0 (für Prime-Verlauf/ROOMS)
                                     ▼
3.1.0  Reinigen-Dialog · Live ──────┤   (baut auf Modell-Rollen rooms/favorites/progress)
3.2.0  Pflege & Station ────────────┤   (baut auf consumables/dock)
3.3.0  Zeitpläne ───────────────────┤   (baut auf schedule)
3.4.0  Rückblick ───────────────────┘   (I1 für Prime)
```

3.1–3.4 sind nach 3.0 untereinander unabhängig und könnten bei Feldbedarf umgestellt werden;
die vorgeschlagene Reihenfolge folgt der Nutzungshäufigkeit (§3.1).

---

## 9. Offene Entscheidungen

| # | Frage | Empfehlung |
|---|---|---|
| E1 | Die Kompatibilitätskorrekturen in die unveröffentlichte 2.5.0 aufnehmen — oder 2.5.0 im Juli-Stand zuerst veröffentlichen? | **Aufnehmen.** Der Juli-Stand enthält #17 noch; eine Version, die das bekannte Problem mitbringt, sollte nicht neu erscheinen. |
| E2 | HA-Mindestversion der Card auf 2025.5 anheben? | **Entschieden (3.10.): umgesetzt in 2.5.0** — HA ≥ 2025.5, Integration ≥ 4.2; die Card prüft beide beim Laden (`version-check.ts`, `manifest/get`) und zeigt bei Unterschreitung einen Hinweis. |
| E3 | Hauptversion 3.0.0 für den Umbau? | **Ja** — Kartentab-Quelle, Mindestanforderung und Tab-Struktur ändern sich. |
| E4 | I1/I2 in 4.3.0 oder als 4.2.19? | 4.3.0, sofern dessen Veröffentlichung nicht weit weg ist; I2 ist ein klarer Fehler und könnte auch in 4.2.19. |
| E5 | Zeitpläne in der Card bearbeiten oder nur anzeigen + in HA-Kalender verlinken? | Anzeigen + an/aus in 3.3.0 sicher; Bearbeiten als Stufe 1/2 mit Rücklese-Prüfung. |
| E6 | Tab-Umbenennung (Health → Pflege) und neuer Plan-Tab? | Ja, mit 3.0.0 (Struktur) bzw. 3.3.0 (Plan-Tab erscheint erst mit Inhalt). |
| E7 | Coverage-Heatmap behalten? | Als Ebene behalten; als Grundbild ablösen. |

---

## Anhang A — Feldbruch-Belege (Kurzform)

| Befund | Card | Integration (4.2.18 / 4.3.0b6 identisch) |
|---|---|---|
| Raumwahl mit Cloud tot | `capabilities.ts:35`, `room-selector-zone.ts:162` | `select.py:233-260` (`CloudSmartZoneSelect`, uid `_cloud_zone_{pmap_id}`, `:903-904`) |
| Tracker-ID | `capabilities.ts:119`, `header.ts:381`; Test `header.test.ts:339` zementiert die falsche ID | `device_tracker.py:149-185` (`_attr_name = None`) |
| Readiness | `alert-zone.ts:84-90` | `sensor_helpers.py:66-115`, `const.py:2146-2225` |
| Phase | `header.ts:165, 412` | `sensor_helpers.py:183-233`, `const.py:2040-2089` |
| Coverage-Prozent | `capabilities.ts:47` | `sensor_cloud.py:140` (entfernt), `:645` (`coverage_pct`) |
| Clean Base / Mop | `health-zone.ts:67-74, 919-923` | `const.py:2346-2359, 2390-2406` |
| Teppich-Boost | `room-selector-zone.ts:60, 109` | `const.py:2475-2505`, `select.py:197-209` |
| Filterwert aus Cloud | `health-zone.ts` Balken | `sensor_core.py:1974-1986`, Attribut `max_hours` |
| Alt-IDs | — | `migrations.py:1294-1303` |
| REST nur Classic | `mission-api.ts` | `__init__.py:1145-1155` (Prime-Pfad endet `:1994` ohne Registrierung) |
| Prime-Rooms-Overdue nie erzeugt | `capabilities.ts` | `sensor.py:355-371`, `__init__.py:1825-1844` |
| Prime-Favoriten | `favorites.ts:22` (`_fav_`) | `button_prime.py:97` (`_favorite_{id}`) |

## Anhang B — Quellen dieser Planung

- Integration `ha_roomba_plus`: `main` @ 4.2.18 (`c0c95da`), `dev-4.3` @ 4.3.0b6 (`4d2031a`)
- Card: GitHub `main` @ v2.4.0 (`b00488d`); lokales Paket v2.5.0
- Issues `ha_roomba_plus_card` #17, #20, #21
- Release-Notes 3.5.2, 4.0.0a0–a47, b1–b4, 4.0.0, 4.1.0–4.1.8, 4.2.0b1–b7, 4.2.0–4.2.18, 4.3.0b1–b6
- Projekt: `UX_GAPS_EXPLORATION.md`, `UX_GAPS_SYNTHESE_1_updated.md`, `STAND.md`,
  `ROOMBA-PLUS-VERSION-PLAN-v4-onwards-REFERENZ.md`, `ROOMBA_PLUS_CARD_VERSION_PLAN_v2_1_updated.md`
