# Brewtiful
## 1. Sprendžiamo uždavinio aprašymas

### 1.1 Sistemos paskirtis

Projekto tikslas - sukurti puslapį, kuris būtų skirtas užsisakyti gėrimus iš kavinės.

Veikimo principas – kuriamą sistemą sudaro dvi dalys: internetinis puslapis, kuriuo
naudosis svečiai, vartotojai, administratorius bei aplikacijų programavimo sąsaja (API).

Svečias atėjęs į svetainę galės naršyti per svetainę ir pamatyti meniu, kokius produktus galima įsigyti parduotuvėje. Norint užsisakyti gėrimus, svečias turės prisiregistruoti ir tada galės pateikti užsakymą. Taip pat, darant užsakymą jei bus pasirinkimas, bus galima keisti gėrimo sudėti. Administratoriai moderuos svetaine, patvirtins gėrimų užsakymus, matys informaciją susijusią su užsakymais.
### 1.2 Funkciniai reikalavimai

Svečias galės:

1. Peržiūrėti pradinį puslapį, puslapį "About"
2. Užsiregistruoti.

Prisijungęs vartotojas galės:

1. Užsisakyti gėrimus.
2. Keisti gėrimų sudėti.
3. Modifikuoti užsakymų krepšelį.
4. Atsijungti.
5. Prisijungti.
6. Matyti savo duomenis profilyje.
7. Matyti užsakymų istorija bei būseną.

Administratorius galės:

1. Kurti naują kategoriją.
2. Modifikuoti kategorijas.
3. Ištrinti kategorijas.
4. Kurti naujus produktus.
5. Modifikuoti produktus.
6. Ištrinti produktus.
7. Ištrinti vartotojus, keisti jų informaciją bei matyti jų sąrašą.
8. Keisti užsakymų būsenas.

## 2. Sistemos architektūra

Sistemos sudedamosios dalys:

- Kliento pusė (angl. Front-End) – naudojant React.js, Tailwind;
- Serverio pusė (angl. Back-End) – naudojant <span>ASP.NET</span> Core. Duomenų bazė – MongoDB.

Sukurtos sistemos backend patalpinta Google Cloud, frontend Firebase.
