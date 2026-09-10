/**
 * Lista de nacionalidades (gentilicio en español) con código ISO 3166-1 alpha-2.
 * La bandera se genera a partir del código ISO — no hace falta guardar el emoji.
 */
function flagFromISO(cc) {
  return cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

const RAW = [
  ['AF', 'Afgana'], ['AL', 'Albanesa'], ['DE', 'Alemana'], ['AD', 'Andorrana'],
  ['AO', 'Angoleña'], ['AG', 'Antiguana'], ['SA', 'Saudí'], ['DZ', 'Argelina'],
  ['AR', 'Argentina'], ['AM', 'Armenia'], ['AU', 'Australiana'], ['AT', 'Austríaca'],
  ['AZ', 'Azerbaiyana'], ['BS', 'Bahameña'], ['BD', 'Bangladesí'], ['BB', 'Barbadense'],
  ['BH', 'Bareiní'], ['BE', 'Belga'], ['BZ', 'Beliceña'], ['BJ', 'Beninesa'],
  ['BY', 'Bielorrusa'], ['BO', 'Boliviana'], ['BA', 'Bosnia'], ['BW', 'Botsuana'],
  ['BR', 'Brasileña'], ['BN', 'Bruneana'], ['BG', 'Búlgara'], ['BF', 'Burkinesa'],
  ['BI', 'Burundesa'], ['BT', 'Butanesa'], ['CV', 'Caboverdiana'], ['KH', 'Camboyana'],
  ['CM', 'Camerunesa'], ['CA', 'Canadiense'], ['QA', 'Catarí'], ['TD', 'Chadiana'],
  ['CL', 'Chilena'], ['CN', 'China'], ['CY', 'Chipriota'], ['CO', 'Colombiana'],
  ['KM', 'Comorense'], ['KP', 'Norcoreana'], ['KR', 'Surcoreana'], ['CI', 'Marfileña'],
  ['CR', 'Costarricense'], ['HR', 'Croata'], ['CU', 'Cubana'], ['DK', 'Danesa'],
  ['DM', 'Dominiquesa'], ['DO', 'Dominicana'], ['EC', 'Ecuatoriana'], ['EG', 'Egipcia'],
  ['SV', 'Salvadoreña'], ['AE', 'Emiratí'], ['ER', 'Eritrea'], ['SK', 'Eslovaca'],
  ['SI', 'Eslovena'], ['ES', 'Española'], ['US', 'Estadounidense'], ['EE', 'Estonia'],
  ['ET', 'Etíope'], ['PH', 'Filipina'], ['FI', 'Finlandesa'], ['FJ', 'Fiyiana'],
  ['FR', 'Francesa'], ['GA', 'Gabonesa'], ['GM', 'Gambiana'], ['GE', 'Georgiana'],
  ['GH', 'Ghanesa'], ['GD', 'Granadina'], ['GR', 'Griega'], ['GT', 'Guatemalteca'],
  ['GN', 'Guineana'], ['GQ', 'Ecuatoguineana'], ['GW', 'Guineana (Bissau)'],
  ['GY', 'Guyanesa'], ['HT', 'Haitiana'], ['HN', 'Hondureña'], ['HU', 'Húngara'],
  ['IN', 'India'], ['ID', 'Indonesia'], ['IQ', 'Iraquí'], ['IR', 'Iraní'],
  ['IE', 'Irlandesa'], ['IS', 'Islandesa'], ['MH', 'Marshalesa'], ['IL', 'Israelí'],
  ['IT', 'Italiana'], ['JM', 'Jamaicana'], ['JP', 'Japonesa'], ['JO', 'Jordana'],
  ['KZ', 'Kazaja'], ['KE', 'Keniana'], ['KG', 'Kirguisa'], ['KI', 'Kiribatiana'],
  ['KW', 'Kuwaití'], ['LA', 'Laosiana'], ['LS', 'Lesotense'], ['LV', 'Letona'],
  ['LB', 'Libanesa'], ['LR', 'Liberiana'], ['LY', 'Libia'], ['LI', 'Liechtensteiniana'],
  ['LT', 'Lituana'], ['LU', 'Luxemburguesa'], ['MK', 'Macedonia'], ['MG', 'Malgache'],
  ['MY', 'Malasia'], ['MW', 'Malauí'], ['MV', 'Maldiva'], ['ML', 'Maliense'],
  ['MT', 'Maltesa'], ['MA', 'Marroquí'], ['MU', 'Mauriciana'], ['MR', 'Mauritana'],
  ['MX', 'Mexicana'], ['FM', 'Micronesia'], ['MZ', 'Mozambiqueña'], ['MD', 'Moldava'],
  ['MC', 'Monegasca'], ['MN', 'Mongola'], ['ME', 'Montenegrina'], ['MM', 'Birmana'],
  ['NA', 'Namibia'], ['NR', 'Nauruana'], ['NP', 'Nepalí'], ['NI', 'Nicaragüense'],
  ['NE', 'Nigerina'], ['NG', 'Nigeriana'], ['NO', 'Noruega'], ['NZ', 'Neozelandesa'],
  ['OM', 'Omaní'], ['NL', 'Neerlandesa'], ['PK', 'Pakistaní'], ['PW', 'Palauana'],
  ['PA', 'Panameña'], ['PG', 'Papú'], ['PY', 'Paraguaya'], ['PE', 'Peruana'],
  ['PL', 'Polaca'], ['PT', 'Portuguesa'], ['GB', 'Británica'], ['CF', 'Centroafricana'],
  ['CZ', 'Checa'], ['CG', 'Congoleña'], ['CD', 'Congoleña (RD)'], ['RO', 'Rumana'],
  ['RW', 'Ruandesa'], ['RU', 'Rusa'], ['WS', 'Samoana'], ['KN', 'Sankitiana'],
  ['SM', 'Sanmarinense'], ['VC', 'Vicentina'], ['LC', 'Santalucense'],
  ['ST', 'Santotomense'], ['SN', 'Senegalesa'], ['RS', 'Serbia'], ['SC', 'Seychellense'],
  ['SL', 'Sierraleonesa'], ['SG', 'Singapurense'], ['SY', 'Siria'], ['SO', 'Somalí'],
  ['LK', 'Esrilanquesa'], ['SZ', 'Esuatinense'], ['ZA', 'Sudafricana'], ['SD', 'Sudanesa'],
  ['SS', 'Sursudanesa'], ['SE', 'Sueca'], ['CH', 'Suiza'], ['SR', 'Surinamesa'],
  ['TH', 'Tailandesa'], ['TZ', 'Tanzana'], ['TJ', 'Tayika'], ['TL', 'Timorense'],
  ['TG', 'Togolesa'], ['TO', 'Tongana'], ['TT', 'Trinitense'], ['TN', 'Tunecina'],
  ['TM', 'Turcomana'], ['TR', 'Turca'], ['TV', 'Tuvaluana'], ['UA', 'Ucraniana'],
  ['UG', 'Ugandesa'], ['UY', 'Uruguaya'], ['UZ', 'Uzbeka'], ['VU', 'Vanuatuense'],
  ['VA', 'Vaticana'], ['VE', 'Venezolana'], ['VN', 'Vietnamita'], ['YE', 'Yemení'],
  ['DJ', 'Yibutiana'], ['ZM', 'Zambiana'], ['ZW', 'Zimbabuense'], ['PS', 'Palestina'],
  ['TW', 'Taiwanesa'], ['HK', 'Hongkonesa'], ['AN', 'Antillana'], ['PR', 'Puertorriqueña'],
]

export const NATIONALITIES = RAW
  .map(([code, label]) => ({ code, label, flag: flagFromISO(code) }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'))
