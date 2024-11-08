// About.js
import React from "react";

function About() {
  return (
    <div className="container mx-auto mt-8">
      <section className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold primary">Github</h2>
        <p>Čia galite rasti projekto kodą:</p>
        <p>
          <a
            className="hover:underline"
            href="https://github.com/Pupcikas/Brewtiful"
          >
            https://github.com/Pupcikas/Brewtiful
          </a>
        </p>
      </section>
      <section className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold primary mb-4">Sistemos paskirtis</h2>
        <p>
          Projekto tikslas - sukurti puslapį, kuris būtų skirtas užsisakyti
          gėrimus iš kavinės.
        </p>
        <p>
          Veikimo principas – kuriamą sistemą sudaro dvi dalys: internetinis
          puslapis, kuriuo naudosis svečiai, vartotojai, administratorius bei
          aplikacijų programavimo sąsaja (API).
        </p>
        <br />
        <p>
          Svečias atėjęs į svetainę galės naršyti per svetainę ir pamatyti
          meniu, kokius produktus galima įsigyti parduotuvėje. Norint užsisakyti
          gėrimus, svečias turės prisiregistruoti ir tada galės pateikti
          užsakymą. Taip pat, darant užsakymą jei bus pasirinkimas, bus galima
          keisti gėrimo sudėti, bei po kiekvieno užsakymo rinkti taškus, kuriuos
          bus galima iškeisti į nemokamą gėrimą. Administratoriai moderuos
          svetaine, patvirtins gėrimų užsakymus, matys ataskaitas susijusias su
          užsakymais.
        </p>
      </section>

      <section id="menu" className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold primary mb-4">
          Funkciniai reikalavimai
        </h2>
        <div>
          <h3 className="text-lg font-semibold mb-2">Svečias</h3>
          <ul className="list-disc list-inside">
            <li>Peržiūrėti kategorijų sąrašą.</li>
            <li>Užsiregistruoti.</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Prisijungęs vartotojas</h3>
          <ul className="list-disc list-inside">
            <li>Užsisakyti gėrimus.</li>
            <li>Keisti gėrimų sudėtį.</li>
            <li>Modifikuoti užsakymų krepšelį.</li>
            <li>Kaupti taškus nemokamui gėrimui.</li>
            <li>Atsijungti.</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Administratorius</h3>
          <ul className="list-disc list-inside">
            <li>Kurti naują kategoriją.</li>
            <li>Modifikuoti kategorijas.</li>
            <li>Ištrinti kategorijas.</li>
            <li>Kurti naujus produktus.</li>
            <li>Modifikuoti produktus.</li>
            <li>Ištrinti produktus.</li>
          </ul>
        </div>
      </section>

      <section id="architecture" className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold primary mb-4">
          Sistemos architektūra
        </h2>
        <p>Sistemos sudedamosios dalys:</p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Kliento pusė</strong> – naudojant React.js, Tailwind;
          </li>
          <li>
            <strong>Serverio pusė</strong> – naudojant{" "}
            <span className="text-gray-800 font-semibold">ASP.NET</span> Core.
            Duomenų bazė – MongoDB.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default About;
