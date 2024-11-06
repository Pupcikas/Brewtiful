# Brewtiful
## 1. Sprendžiamo uždavinio aprašymas

### 1.1 Sistemos paskirtis

Projekto tikslas - sukurti puslapį, kuris būtų skirtas užsisakyti gėrimus iš kavinės.

Veikimo principas – kuriamą sistemą sudaro dvi dalys: internetinis puslapis, kuriuo
naudosis svečiai, vartotojai, administratorius bei aplikacijų programavimo sąsaja (API).

Svečias atėjęs į svetainę galės naršyti per svetainę ir pamatyti meniu, kokius produktus galima įsigyti parduotuvėje. Norint užsisakyti gėrimus, svečias turės prisiregistruoti ir tada galės pateikti užsakymą. Taip pat, darant užsakymą jei bus pasirinkimas, bus galima keisti gėrimo sudėti, bei po kiekvieno užsakymo rinkti taškus, kuriuos bus galima iškeisti į nemokamą gėrimą. Administratoriai moderuos svetaine, patvirtins gėrimų užsakymus, matys ataskaitas susijusias su užsakymais.
### 1.2 Funkciniai reikalavimai

Svečias galės:

1. Peržiūrėti kategorijų sąrašą.
2. Užsiregistruoti.

Prisijungęs vartotojas galės:

1. Užsisakyti gėrimus.
2. Keisti gėrimų sudėti.
3. Modifikuoti užsakymų krepšelį.
4. Kaupti taškus nemokamui gėrimui.
5. Atsijungti.
6. Prisijungti

Administratorius galės:

1. Kurti naują kategoriją.
2. Modifikuoti kategorijas.
3. Ištrinti kategorijas.
4. Kurti naujus produktus.
5. Modifikuoti produktus.
6. Ištrinti produktus.

## 2. Sistemos architektūra

Sistemos sudedamosios dalys:

- Kliento pusė (ang. Front-End) – naudojant React.js, Next.js, Tailwind;
- Serverio pusė (angl. Back-End) – naudojant <span>ASP.NET</span> Core. Duomenų bazė – MongoDB.
