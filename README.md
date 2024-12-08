Projekto ataskaita pdf formatu: [IFK-2_Domas_Gladkauskas.pdf](https://github.com/user-attachments/files/18053842/IFK-2_Domas_Gladkauskas.pdf)

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

![image](https://github.com/user-attachments/assets/4e23a706-71c6-4fc8-b9d7-b90430102823)

# 3. Naudotojo sąsajos projektas

![image](https://github.com/user-attachments/assets/3241413a-f6d0-40bc-a1fe-8bdbb64abf8c)
![image](https://github.com/user-attachments/assets/bdd52440-836c-4bf3-bbdd-2e4534b22f1d)
![image](https://github.com/user-attachments/assets/9a108667-ec63-4f46-80df-2dda0962aec0)
![image](https://github.com/user-attachments/assets/1a17f5b8-9886-4eee-adf3-ff1a9e9140be)
![image](https://github.com/user-attachments/assets/cc85b662-2137-49fb-b3e3-29aea390774f)
![image](https://github.com/user-attachments/assets/ddb8b907-64c5-4268-9241-b48434e898cb)
![image](https://github.com/user-attachments/assets/f9f6fb0f-b952-43fd-bc93-52eb0ace9274)
![image](https://github.com/user-attachments/assets/88b3bf14-26fa-45a2-9855-313a530000ec)
![image](https://github.com/user-attachments/assets/2ff6edf4-347a-4ed9-9e78-dea0b9790368)
![image](https://github.com/user-attachments/assets/b5007212-3b3a-4f4f-aae0-b4fa6d5ec14c)
![image](https://github.com/user-attachments/assets/ccbb5293-3228-4753-8467-5a4fa5f3c1d0)
![image](https://github.com/user-attachments/assets/5affbd4c-368d-410a-b5c7-ece73b079363)
![image](https://github.com/user-attachments/assets/29a67483-b840-439d-9c9c-bd88320c5f1e)
![image](https://github.com/user-attachments/assets/8cc310be-4404-41e7-b03d-021a6faf3a76)
![image](https://github.com/user-attachments/assets/47b560d8-baf9-421a-ba26-73f1da9d1910)
![image](https://github.com/user-attachments/assets/203fe10e-f009-481c-b9ec-bde08e8716b2)

# 4. API specifikacija
baseurl: https://woven-ceremony-440709-s5.lm.r.appspot.com 
Testuajant visus api buvo naudojamas Bearer authentification token autorizacija, vieni api buvo pasiekiami tik user arba tik admin rolėms, kaikurie abiems rolėms buvo pasiekiami.

Buvo testuojami GET, PUT, POST, DELETE užklausos su skirtingais atsakais: 200, 404, 400.

Toliau pateikiami kontrolerių pavadinimai, kuriuose yra api metodai ir jų užklausos bei atsakymai matomi nuotraukose.

<span>AuthController</span>
![image](https://github.com/user-attachments/assets/b58e3c6e-6cc3-42ef-b17b-9a02fb06bb48)
![image](https://github.com/user-attachments/assets/8ce4eefe-3768-4cf8-a76b-a3d0f8d077e1)
![image](https://github.com/user-attachments/assets/4bcba296-1def-4173-9510-a51a4942f488)
![image](https://github.com/user-attachments/assets/a18a5c1e-788d-411d-b608-2c3b9e352727)
![image](https://github.com/user-attachments/assets/3790561b-230d-42f4-a90a-67495c30df2b)
![image](https://github.com/user-attachments/assets/c99ca6b8-83be-443c-90ac-9e93f4450224)
![image](https://github.com/user-attachments/assets/f5898ffc-b646-4675-b346-980b49479d7e)
<span>CartController</span>
![image](https://github.com/user-attachments/assets/09fa3054-f87a-444d-ab4b-709d6e30509a)
![image](https://github.com/user-attachments/assets/15df6bbc-e01d-4af8-9c9b-ecc452e83f5e)
![image](https://github.com/user-attachments/assets/25387357-bed3-449b-8e24-ae68042f6015)
![image](https://github.com/user-attachments/assets/84563126-7a49-40a7-8558-ac613845dd90)
![image](https://github.com/user-attachments/assets/b63898c8-094b-4783-93d1-4079b3a02556)
<span>CategoryController</span>
![image](https://github.com/user-attachments/assets/0a51e785-7700-4f27-b6e2-f32a7a1febb3)
![image](https://github.com/user-attachments/assets/edbf9aa4-f086-4282-835d-06159ed961bb)
![image](https://github.com/user-attachments/assets/d1684332-d7dd-462d-b301-978fd73ab0e8)
![image](https://github.com/user-attachments/assets/70c40710-325f-40f0-b04a-0d7365eabb14)
![image](https://github.com/user-attachments/assets/62c4ee40-9940-4126-9058-baf710afcd80)
![image](https://github.com/user-attachments/assets/80d7a6a4-8061-4f80-b880-0adab5fdea58)
![image](https://github.com/user-attachments/assets/69789b64-1941-4521-ade8-c18528224512)
![image](https://github.com/user-attachments/assets/a2e13775-1d1c-4c23-b9c4-162ed88beb13)
<span>IngredientController</span>
![image](https://github.com/user-attachments/assets/c81d368d-219e-48fa-99fd-57225410b153)
![image](https://github.com/user-attachments/assets/fd5e92d3-f76e-483a-882a-63cae494e203)
![image](https://github.com/user-attachments/assets/6ad8d3a0-3166-47a6-8ec6-bd805379c1f0)
![image](https://github.com/user-attachments/assets/5e31dd2d-60fd-4b95-93f6-03c9001846b0)
![image](https://github.com/user-attachments/assets/b68da454-073a-4c8e-a6de-3727cde2d754)
![image](https://github.com/user-attachments/assets/8698fb19-3c89-42a0-89c9-450ab5e724d7)
![image](https://github.com/user-attachments/assets/fcd455c8-45b8-4e8b-a723-1e54bc268922)
![image](https://github.com/user-attachments/assets/a148d4f8-fd11-4859-96d9-a66d56d42ea7)
![image](https://github.com/user-attachments/assets/dcbdd641-222b-4892-982d-1238907b086d)
![image](https://github.com/user-attachments/assets/90200b6d-370e-4076-98f4-11cf57a2de1e)
<span>ItemControler</span>
![image](https://github.com/user-attachments/assets/4f281538-b289-4866-9226-7b02950f0016)
![image](https://github.com/user-attachments/assets/1d4b7622-a7d3-492c-b7ea-24fd35f954a4)
![image](https://github.com/user-attachments/assets/0058f6e1-5531-4086-8c05-faf3fb520b7b)
![image](https://github.com/user-attachments/assets/9b6e2f21-f282-41d3-a68f-32a0d7591737)
![image](https://github.com/user-attachments/assets/64610a4e-f53b-4050-8ee0-747c1cb3be51)
![image](https://github.com/user-attachments/assets/9fc10fef-7d7e-435c-9c4f-afd56cab3f91)
![image](https://github.com/user-attachments/assets/083eab8d-009c-49b8-996a-95ace62565a0)
![image](https://github.com/user-attachments/assets/6ab3ed9f-70c6-41eb-9747-76c68b9e272d)
![image](https://github.com/user-attachments/assets/f95b77b1-b027-494d-a3a4-70cc4e1b2649)

# 5. Išvados
Sistemą pavyko relizuoti pagal išsikeltus tikslus ir funkcijas. Buvo įgytos žinios apie JWT autentifikaciją ir autorizaciją ir kaip relizuoti bei pritaikyti jį sistemai. Buvo relizuotas responsive UI, sukurtos naudotojo sąsajos, skirtingi informacijos įvedimo elementai, padarytas responsive menu, puslapio dizainas atitiko tematiką, panaudotas modulinis langas, naudojamos buvo vektorinės ikonos. Buvo pritaikytos debesijos paslaugų talpinimas. Naudota OpenAPI specifikacija ir Postman testuojant backend.





