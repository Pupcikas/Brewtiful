// src/pages/About.js
import React from "react";

function About() {
  return (
    <div className="container mx-auto mt-8">
      {/* Github Section */}
      <section className="bg-white p-6 rounded shadow-md mb-8 transition-transform transform hover:scale-105 duration-300">
        <h2 className="text-xl font-bold text-black mb-2">Github</h2>
        <p className="text-gray-700 font-sans">
          Čia galite rasti projekto kodą:
        </p>
        <p>
          <a
            className="text-secondary hover:underline transition-colors duration-300"
            href="https://github.com/Pupcikas/Brewtiful"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/Pupcikas/Brewtiful
          </a>
        </p>
      </section>

      {/* Sistemos paskirtis Section */}
      <section className="bg-white p-6 rounded shadow-md mb-8 transition-shadow shadow-sm hover:shadow-lg duration-300">
        <h2 className="text-xl font-bold text-black mb-4">
          Sistemos paskirtis
        </h2>
        <p className="text-gray-700 font-sans">
          Projekto tikslas - sukurti puslapį, kuris būtų skirtas užsisakyti
          gėrimus iš kavinės.
        </p>
        <p className="text-gray-70 font-sans">
          Veikimo principas – kuriamą sistemą sudaro dvi dalys: internetinis
          puslapis, kuriuo naudosis svečiai, vartotojai, administratorius bei
          aplikacijų programavimo sąsaja (API).
        </p>
        <br />
        <p className="text-gray-700 font-sans">
          Svečias atėjęs į svetainę galės naršyti per svetainę ir pamatyti
          meniu, kokius produktus galima įsigyti parduotuvėje. Norint užsisakyti
          gėrimus, svečias turės prisiregistruoti ir tada galės pateikti
          užsakymą. Taip pat, darant užsakymą jei bus pasirinkimas, bus galima
          keisti gėrimo sudėtį, bei po kiekvieno užsakymo rinkti taškus, kuriuos
          bus galima iškeisti į nemokamą gėrimą. Administratoriai moderuos
          svetaine, patvirtins gėrimų užsakymus, matys ataskaitas susijusias su
          užsakymais.
        </p>
      </section>

      {/* Funkciniai reikalavimai Section */}
      <section
        id="menu"
        className="bg-white p-6 rounded shadow-md mb-8 transition-transform transform hover:scale-105 duration-300"
      >
        <h2 className="text-xl font-bold text-black mb-4">
          Funkciniai reikalavimai
        </h2>
        <div>
          <h3 className="text-lg font-semibold mb-2 font-sans">Svečias</h3>
          <ul className="list-disc list-inside text-gray-700 font-sans">
            <li>Peržiūrėti kategorijų sąrašą.</li>
            <li>Užsiregistruoti.</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 font-sans">
            Prisijungęs vartotojas
          </h3>
          <ul className="list-disc list-inside text-gray-700 font-sans">
            <li>Užsisakyti gėrimus.</li>
            <li>Keisti gėrimų sudėtį.</li>
            <li>Modifikuoti užsakymų krepšelį.</li>
            <li>Kaupti taškus nemokamui gėrimui.</li>
            <li>Atsijungti.</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Administratorius</h3>
          <ul className="list-disc list-inside text-gray-700 font-sans">
            <li>Kurti naują kategoriją.</li>
            <li>Modifikuoti kategorijas.</li>
            <li>Ištrinti kategorijas.</li>
            <li>Kurti naujus produktus.</li>
            <li>Modifikuoti produktus.</li>
            <li>Ištrinti produktus.</li>
          </ul>
        </div>
      </section>

      {/* Sistemos architektūra Section */}
      <section
        id="architecture"
        className="bg-white p-6 rounded shadow-md transition-shadow shadow-sm hover:shadow-lg duration-300"
      >
        <h2 className="text-xl font-bold text-black mb-4">
          Sistemos architektura
        </h2>
        <p className="text-gray-700">Sistemos sudedamosios dalys:</p>
        <ul className="list-disc list-inside text-gray-700 font-sans">
          <li>
            <strong>Kliento pusė</strong> – naudojant React.js, Tailwind;
          </li>
          <li>
            <strong>Serverio pusė</strong> – naudojant{" "}
            <span className="font-semibold text-gray-800 font-sans">
              ASP.NET
            </span>{" "}
            Core. Duomenų bazė – MongoDB.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default About;
