const fs = require('fs');

const users = [
  { code: null, country: "Ecuador", name: "Javier Toapanta", email: "devys1512@hotmail.com", password: "javier0001" },
  { code: null, country: "Panama", name: "yaneth", email: "enithyabeth@gmail.com", password: "yaneth001" },
  { code: "2741", country: "COLOMBIA", name: "JEIMER SABOGAL", email: "jeimersabogal179@gmail.com", password: "jeimer2741" },
  { code: "2304", country: "Peru", name: "Ruth Esther Figueroa", email: "mejorvision2024@gmail.com", password: "ruth2304" },
  { code: "2680", country: "SALVADOR", name: "MELQUICEDEC GUZMAN", email: "sorgoguz@gmail.com", password: "guz2680" },
  { code: "489", country: "Nicaragua", name: "Munkel", email: "odelgadillo@grupomunkel.com", password: "olga489" },
  { code: "2316", country: "GUATEMALA", name: "KATHERINE LOPEZ", email: "todogafas.gt@gmail.com", password: "lopez2316" },
  { code: "2478", country: "ECUADOR", name: "HENRY CAÑAS", email: "opt.henry.canar@gmail.com", password: "henry2478" },
  { code: "2621", country: "Panama", name: "Claudio Balbi", email: "cbalbi@opticagiras.com", password: "claudio2621" },
  { code: "0000", country: "VENEZUELA", name: "FERNANDO TARAZONA", email: "fernandotc1960@gmail.com", password: "fernando1960" },
  { code: "0000", country: "VENEZUELA", name: "AVELINO AYOS", email: "avelinoayos@gmail.com", password: "ayos0605" },
  { code: "800", country: "Panamá", name: "Daynan Jurado", email: "contabilidad@visioncentergroup.com", password: "daynan800" },
  { code: "1795", country: "Uruguay", name: "Julio Favotto", email: "jfavotto@hotmail.com", password: "julio1795" },
  { code: "1060", country: "El salvador", name: "Jose Ezquivel", email: "joseesquivel2003@yahoo.com", password: "jose1060" },
  { code: "2039", country: "Guatemala", name: "Otto/Lis Mazadiego", email: "mariletlopez@hotmail.com", password: "otto2039" },
  { code: "2718", country: "NICARAGUA", name: "JOSE DORMES", email: "serviciosopticosmelch@gmail.com", password: "dormes2718" },
  { code: "2145", country: "DOMINICANA", name: "CONRADO SHEWORD", email: "opticplanes@gmail.com", password: "conrado2145" },
  { code: "2713", country: "GUATEMALA", name: "JAIRO POZ", email: "jairopoz1690@gmail.com", password: "jairo2713" },
  { code: "1457", country: "VENEZUELA", name: "Salvatore Amato", email: "salvavenezuela@gmail.com", password: "salvatore1457" },
  { code: "901", country: "Panama", name: "Francisco Bonilla", email: "opolicentroparquelefevre@gmail.com", password: "policentro901" },
  { code: "1367", country: "VENEZUELA", name: "Mariana Moncada", email: "Moncada.mariana@gmail.com", password: "Mariana1367" },
  { code: "1610", country: "PANAMA", name: "FRANCISCO GONZALEZ", email: "optica_optivisual@hotmail.com", password: "francisco1610" },
  { code: "2734", country: "COSTA RICA", name: "CARLOS SOLANO", email: "ventas@grupoes-optico.com", password: "solano2734" },
  { code: "2418", country: "VENEZUELA", name: "ALIRIO GARCIA", email: "aliriogacia1966@gmail.com", password: "garcia2418" },
  { code: "0002", country: "COLOMBIA", name: "HUMBERTO PEREZ", email: "hperez.quimcosta@gmail.com", password: "perez02" },
  { code: "1964", country: "SALVADOR", name: "ARACELY GARCIA", email: "aracely-garcia5@hotmail.com", password: "garcia1964" },
  { code: "003", country: "COLOMBIA", name: "Jose Vicente Jimenez", email: "marcasyanteojossas@gmail.com", password: "jose003" },
  { code: "2341", country: "NICARAGUA", name: "EXIEL DAYANA LOPEZ", email: "exielop@hotmail.com", password: "lopez2341" },
  { code: "1474", country: "HONDURAS", name: "JOHNNY GONZALES", email: "johnnyegonzalez86@gmail.com", password: "johnny1474" },
  { code: "1746", country: "NICARAGUA", name: "GRISELDA CORDERO", email: "griselcordero@hotmail.com", password: "cordero1746" },
  { code: "2745", country: "PANAMA", name: "JONATHAN BACH", email: "ioni@homeofbrands.net", password: "bach123" },
  { code: "0004", country: "ARGENTINA", name: "SEBASTIAN PAESANI", email: "sebastianpaesani@gmail.com", password: "paesani123" },
  { code: "2672", country: "HONDURAS", name: "VICTOR MEJIA", email: "varielmejia@gmail.com", password: "mejia2672" },
  { code: "2591", country: "COLOMBIA", name: "JULIANA CARREÑO", email: "neovision_2008@hotmail.com", password: "carreño2591" },
  { code: "2093", country: "VENEZUELA", name: "JHAINI GUEVARA", email: "visiongloblal@gmail.com", password: "guevara2093" },
  { code: "2229", country: "NICARAGUA", name: "LESTER ORTEGA", email: "ortega.lester@hotmail.com", password: "ortega2229" },
  { code: "1969", country: "DOMINICANA", name: "JULIO OVIEDO", email: "juliocesar@opticaoviedo.net", password: "julio1969" },
  { code: "2714", country: "VENEZUELA", name: "ZULIVAN ZORRILA", email: "zulivan72@gmail.com", password: "zorrilla2714" },
  { code: "2674", country: "COSTA RICA", name: "KATIAS VASQUEZ", email: "cvmasopticacr@gmail.com", password: "katia2674" },
  { code: "2482", country: "VENEZUELA", name: "MANUEL LUNA", email: "manuluna82@gmail.com", password: "luna2482" },
  { code: "0004", country: "ECUADOR", name: "ELCIE REYES", email: "optinao@yahoo.com", password: "reyes0004" },
  { code: "2357", country: "VENEZUELA", name: "MARBELLA SOTO", email: "sotozmy@gmail.com", password: "sotozmy" },
  { code: "436", country: "El Salvador", name: "Juan Carlos Flamenco", email: "exit.elsalvador@gmail.com", password: "juan436" },
  { code: "765", country: "NICARAGUA", name: "OSCAR MARTINEZ", email: "oscareuclides@hotmail.com", password: "martinez765" },
  { code: "2448", country: "VENEZUELA", name: "JAVIER PEREZ", email: "Opticaoptiverca@gmail.com", password: "perez2448" },

  { code: "2450", country: "VENEZUELA", name: "MARCOS CASTILLO", email: "dclm.asistenciavisual@gmail.com", password: "castillo2450" },
  { code: "2187", country: "COSTA RICA", name: "LORNA RODRIGUEZ", email: "opticaquepos10@gmail.com", password: "lorna2187" },
  { code: "0005", country: "ECUADOR", name: "LUCIA DICAO", email: "Dikaoluciana@gmail.com", password: "dicao0005" },
  { code: "1667", country: "VENEZUELA", name: "MARGOT MONASTERIO", email: "margotmonasterio@gmail.com", password: "margot1667" },
  { code: "2361", country: "ECUADOR", name: "GUIDO TOAPANTA", email: "guidotoapant@gmail.com", password: "guido2361" },
  { code: "1924", country: "GUATEMALA", name: "ULISES ARREAGA", email: "ulises.arreaga@gmail.com", password: "ulises1924" },
  { code: "25", country: "VENEZUELA", name: "MIKE KOCHMAN", email: "Miguelkl73@gmail.com", password: "mike25" },
  { code: "798", country: "Guatemala", name: "Jordi Jardi", email: "contagjtrade@gmail.com", password: "jordi798" },
  { code: "2419", country: "HONDURAS", name: "GLENYS ALVARADO", email: "glenisalvaradom@gmail.com", password: "alvarado2419" },
  { code: "2697", country: "PERU", name: "RUTH GAMARRA", email: "rgamacu@hotmail.com", password: "ruth2697" },
  { code: "748", country: "VENEZUELA", name: "CARLOS GRANADO", email: "distvenecia@yahoo.com", password: "granado748" },
  { code: "2695", country: "SALVADOR", name: "ENRIQUE GUERRERO", email: "eguerrero.tladd@gmail.com", password: "guerrero2695" },
  { code: "2742", country: "COSTA RICA", name: "RODOLFO JIMENEZ", email: "rodolfojimenezsaenz@gmail.com", password: "rodolfo2742" },
  { code: "2696", country: "COLOMBIA", name: "Nidia Ariza", email: "opticavisionsantander@hotmail.com", password: "Nidia2696" },
  { code: "710", country: "Ecuador", name: "Jimmy Campoverde", email: "jimca_82@hotmail.com", password: "jimmy710" },
  { code: "2221", country: "Ecuador", name: "Fredy Pereira", email: "fredy_p870@hotmail.com", password: "fredy2221" },
  { code: "1499", country: "COLOMBIA", name: "Giovani Gomez", email: "gerencia@grupocolors.com", password: "giovani1499" },
  { code: "2563", country: "COLOMBIA", name: "Liliana Betancourt", email: "dyrro1@hotmail.com", password: "liliana2563" },
  { code: "2126", country: "PANAMA", name: "JENNESY IBARRA", email: "opticaibarra@hotmail.com", password: "ibarra2126" },
  { code: "2707", country: "ECUADOR", name: "ALEJANDRO MURILLO", email: "suoptica1990@hotmail.com", password: "murillo2707" },
  { code: "2274", country: "GUATEMALA", name: "Maria Jardi", email: "mariajardi@gmail.com", password: "maria2274" },
  { code: "1884", country: "colombia", name: "sandra Contreras", email: "sandracontreras81@hotmail.com", password: "sandra1884" },
  { code: "2255", country: "VENEZUELA", name: "ALIBELL PULIDO", email: "alibellpg23@hotmail.com", password: "pulido2255" },
  { code: "0006", country: "NICARAGUA", name: "LIDIA MONCADA", email: "Lymoncadarodriguez@gmail.com", password: "moncada0006" },
  { code: "0007", country: "COLOMBIA", name: "DANIEL DELGADO", email: "danieldelgadosjm@gmail.com", password: "delgado0007" },
  { code: "2281", country: "GUATEMALA", name: "SHARON ALFARO", email: "Centro.ocular0501@hotmail.com", password: "alfaro2281" },
  { code: "0008", country: "CHILE", name: "Juan Pulido", email: "jpulido1978@gmail.com", password: "juan0008" },
  { code: "0008", country: "REP.DOMINICANA", name: "MARLIESE JOGA", email: "gerentegeneral.almanzar@gmail.com", password: "joga0008" },
  { code: "0009", country: "REP.DOMINICANA", name: "OPTICA VILLAR", email: "Villaroptica@gmail.com", password: "villar0009" },
  { code: "123", country: "PANAMA", name: "CLINICA OPT. DE LA HOZ", email: "clinicaopticadelahoz@gmail.com", password: "Delahoz123" },
  { code: "123", country: "PANAMA", name: "TECNOGAFAS", email: "tecnogafas@gmail.com", password: "Tecno123" },
  { code: "123", country: "PANAMA", name: "EYE CARE CENTER PANAMA S.A.", email: "info@eyecarecanterpanama.com", password: "Eyecare123" },
  { code: "123", country: "PANAMA", name: "OPTICA TOTALVISION", email: "sandoval.olga@gmail.com", password: "Totalvision123" },
  { code: "123", country: "PANAMA", name: "SUKHDIPSINGH", email: "visionpluspty@gmail.com", password: "Visionplus123" },
  { code: "123", country: "PANAMA", name: "OPTICA DRA. OJITOS", email: "astrithc27@outlook.com", password: "Ojitos123" },
  { code: "123", country: "PANAMA", name: "MEDI OPTICS S.A.", email: "optica@clinicayee.com", password: "Medi123" },
  { code: "123", country: "PANAMA", name: "OJO PANAMA", email: "ojo.cliente@gmail.com", password: "Ojo123" },
  { code: "123", country: "PANAMA", name: "CLINICA BOYD", email: "thompson.jose@imperial.com.pa", password: "Boyd123" },
  { code: "123", country: "PANAMA", name: "HUMANOPTIC S.A.", email: "opticavistoso@gmail.com", password: "vistoso123" },
  { code: "2608", country: "PANAMA", name: "CLINICA OPTICA CLIOPT", email: "cliopt@clinicacliopt.com", password: "Cliopt2608" },
  { code: "0010", country: "HONDURAS", name: "MARCO MONTALVAN", email: "desperategossip@gmail.com", password: "marco0010" },
  { code: "2759", country: "HONDURAS", name: "CARLOS BARRIENTOS/OPTICAS MATAMALA", email: "carldavidbarrientos.31@gmail.com", password: "carlos2759" },
  { code: "2421", country: "El salvador", name: "MAURICIO SANTOS", email: "mauricio_santos31@yahoo.com", password: "mauricio2421" },
  { code: "2751", country: "El salvador", name: "HUMBERTO SOLANO", email: "solano07hum@gmail.com", password: "solano2751" },
  { code: "1760", country: "PANAMA", name: "ORIANA", email: "consultaopticacenteno@hotmail.com", password: "centeno1760" },
  { code: "2168", country: "COSTA RICA", name: "VANESSA CORTES", email: "stylos_opticos@hotmail.com", password: "vanessa2168" },
  { code: "0011", country: "PANAMA", name: "DOLLY PALMA", email: "Saludvisual@cwpanama.net", password: "palma0011" },

  { code: "2334", country: "COLOMBIA", name: "Sebastian Mora", email: "sebastianmoradiaz.64@gmail.com", password: "sebastian2334" },
  { code: "1920", country: "El salvador", name: "Lourdes Amato", email: "lourdes_visionintegral1970@yahoo.com", password: "lourdes1920" },
  { code: "792", country: "Ecuador", name: "Cesar Gaycha", email: "cosmolens3@gmail.com", password: "cesar792" },
  { code: "888", country: "Costa rica", name: "Jorge Sanchez", email: "gerencia@clinicaocularcr.com", password: "jorge888" },
  { code: "0000", country: "GUATEMALA", name: "Rocio casanueva", email: "paginaweb@opticasdeluxe.com", password: "rocio123" },
  { code: "1280", country: "VENEZUELA", name: "Omaira Uzcategui", email: "grupoopticovision2020@gmail.com", password: "omaira1280" },
  { code: "0000", country: "VENEZUELA", name: "CARLOS DIAZ", email: "diazoptica9@gmail.com", password: "diaz0015" },
  { code: "1274", country: "VENEZUELA", name: "Bladimir Ontiveros", email: "opticaberlud@hotmail.com", password: "bladimir1274" },
  { code: "0000", country: "COLOMBIA", name: "Fernando Alvarez", email: "opticakors@gmail.com", password: "fernando0000" },
  { code: "1298", country: "Nicaragua", name: "Omar Enrique tercero", email: "luzoptical@gmail.com", password: "omar1298" },
  { code: "2560", country: "Ecuador", name: "Claudia Gallo", email: "gioreoptical@gmail.com", password: "claudia2560" },
  { code: "1509", country: "Peru", name: "Alberto Cuadros", email: "williamscuadroc@yahoo.com", password: "alberto1509" },
  { code: "1480", country: "Nicaragua", name: "Kenny Ortiz", email: "opticasbethel@yahoo.com", password: "kenny1480" },
  { code: "1928", country: "PANAMA", name: "VEIRA", email: "veira2106@hotmail.com", password: "jusavi1928" },
  { code: "0018", country: "USA", name: "PEDRO CELESTINO RODRIGUEZ", email: "Pedroceleopti@gmail.com", password: "pedro0018" },
  { code: "1633", country: "COSTA RICA", name: "GIRALDO ANA MARIA", email: "lanita983@gmail.com", password: "ana1633" },
  { code: "1550", country: "COSTA RICA", name: "CHRISTIAN CHARPENTIER GAMBOA", email: "ccharpentier1978@gmail.com", password: "christian1550" },
  { code: "1970", country: "NICARAGUA", name: "Fatima Gaitan", email: "fatimacarolina_85@hotmail.com", password: "fatima1970" },
  { code: "2153", country: "Uruguay", name: "Hector Agüero", email: "hdaguero@gmail.com", password: "hector2153" },
  { code: "2140", country: "El salvador", name: "Carlos Mojica", email: "visioneimagen@hotmail.com", password: "carlos2140" },
  { code: "2584", country: "NICARAGUA", name: "JOHANNA RAMIREZ", email: "Johaaram72@yahoo.es", password: "ramirez2584" },
  { code: "1917", country: "VENEZUELA", name: "Andres Giraldo", email: "andressgiralt@gmail.com", password: "andres1917" },
  { code: "2110", country: "COSTA RICA", name: "Miguel Cuervo", email: "multiopticascr@gmail.com", password: "miguel2110" },
  { code: "2193", country: "COSTA RICA", name: "Katherie Sevilla", email: "Opticlinic.cr@gmail.com", password: "katherine2193" },
  { code: "2438", country: "El Salvador", name: "JAYRO CHACON", email: "multiprofcc@hotmail.com", password: "chacon2438" },
  { code: "1822", country: "Costa Rica", name: "Harold Orozco", email: "recepcion@opticalook.com", password: "harold1822" },
  { code: "2059", country: "COSTA RICA", name: "Tanya Monge", email: "tanya_monge@hotmail.com", password: "tanya2059" },
  { code: "0020", country: "USA", name: "YUDIBEL AGUILA", email: "Yuditbelr@gmail.com", password: "aguila0020" },
  { code: "0021", country: "COLOMBIA", name: "MARIO PARRADO", email: "marioparrado01@gmail.com", password: "parrado0021" },
  { code: null, country: "GUATEMALA", name: "Laura Orrego", email: "info@servilentesgt.com", password: "LauraOrrego" },
  { code: "0021", country: "NICARAGUA", name: "MARALING SOMARRIBA", email: "somarriba_mara09@hotmail.com", password: "somarriba0021" },
  { code: "0022", country: "COLOMBIA", name: "Fernando Hernandez", email: "corpovision_11@hotmail.com", password: "fernando0022" },
  { code: "1392", country: "COSTA RICA", name: "Edgar Arce", email: "edgararcea@gmail.com", password: "edgar1392" },
  { code: "2197", country: "PERU", name: "SAMIR TRAVERSO", email: "samir.traverso@opticasantalucia.com", password: "traverso2197" },
  { code: "0022", country: null, name: "Moshe Shoshan", email: "m.shoshan@kvr-partners.com", password: "moshe0022" }
];

let sql = `-- Habilitar extension pgcrypto si no está activa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
`;

for (let item of users) {
  const email = item.email.toLowerCase().trim().replace(/'/g, "''");
  let pwd = item.password.trim().replace(/'/g, "''");
  if (pwd.length < 6) pwd = pwd.padEnd(6, '0');
  const name = item.name.replace(/'/g, "''");
  const erpCode = item.code ? `'${item.code.replace(/'/g, "''")}'` : 'NULL';
  let countryCode = 'PA';
  if (item.country) {
    const c = item.country.toUpperCase();
    if (c.includes('COLOMBIA')) countryCode = 'CO';
    else if (c.includes('COSTA RICA')) countryCode = 'CR';
    else if (c.includes('ECUADOR')) countryCode = 'EC';
    else if (c.includes('PERU')) countryCode = 'PE';
    else if (c.includes('SALVADOR')) countryCode = 'SV';
    else if (c.includes('NICARAGUA')) countryCode = 'NI';
    else if (c.includes('GUATEMALA')) countryCode = 'GT';
    else if (c.includes('HONDURAS')) countryCode = 'HN';
    else if (c.includes('VENEZUELA')) countryCode = 'VE';
    else if (c.includes('DOMINICANA')) countryCode = 'DO';
    else if (c.includes('URUGUAY')) countryCode = 'UY';
    else if (c.includes('CHILE')) countryCode = 'CL';
    else if (c.includes('ARGENTINA')) countryCode = 'AR';
    else if (c.includes('USA')) countryCode = 'US';
  }

  sql += `
  -- Usuario: ${email}
  SELECT id INTO v_user_id FROM auth.users WHERE email = '${email}';
  IF v_user_id IS NOT NULL THEN
    -- Actualizar contraseña y confirmación de correo si ya existe
    UPDATE auth.users
    SET encrypted_password = crypt('${pwd}', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', '${name}', 'company_name', '${name}'),
        updated_at = now()
    WHERE id = v_user_id;
  ELSE
    -- Crear nuevo usuario en auth.users
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      '${email}',
      crypt('${pwd}', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', '${name}', 'company_name', '${name}'),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Actualizar / Insertar en tabla public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, '${email}', '${name}', '${name}', 'Óptica', '${countryCode}', 'client', ${erpCode}, true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    onboarding_completed = true;
`;
}

sql += `
END $$;
`;

fs.writeFileSync('scripts/import_all_127_users.sql', sql, 'utf8');
console.log('SQL generado con éxito en scripts/import_all_127_users.sql!');
