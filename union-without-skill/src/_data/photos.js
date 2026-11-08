// Фотографии с Unsplash (Unsplash License), подключаются по ссылке.
// Каждый адрес проверен на странице фотографии или в выдаче поиска unsplash.com.
const base = (id) => `https://images.unsplash.com/photo-${id}`;

const list = {
  welderSparks: { id: "1764245546004-e6b743242a80", alt: "Сварщик за работой, во все стороны летят искры", credit: "Unsplash" },
  threads: { id: "1742281692582-3507d7219c33", alt: "Рабочий проверяет нити на большом промышленном станке", credit: "EqualStock / Unsplash" },
  textile: { id: "1741437136281-c66625b1a3c0", alt: "Работницы сортируют и сворачивают ткань в цехе", credit: "EqualStock / Unsplash" },
  meetingWomen: { id: "1676276377440-c180867b1e47", alt: "Три участницы совещания за столом с ноутбуком", credit: "Walls.io / Unsplash" },
  conference: { id: "1573497161249-42447f9f6706", alt: "Пять человек обсуждают вопросы в переговорной", credit: "Christina @ wocintechchat.com / Unsplash" },
  winterStreet: { id: "1714834342915-75210b7341a9", alt: "Заснеженная городская улица с гирляндами между домами", credit: "Natali Bredikhina / Unsplash" },
  builders: { id: "1653280662710-1cac52cde6d7", alt: "Бригада строителей работает на строительной площадке", credit: "Shraga Kopstein / Unsplash" },
  oldBuilding: { id: "1734114963276-770a8a9e9144", alt: "Старинное здание зимой, перед ним скамейки", credit: "Anastasia Zolotukhina / Unsplash" },
  chimney: { id: "1759311854002-5f2777967af9", alt: "Высокая заводская труба на фоне неба", credit: "Hassaan Tahir / Unsplash" },
  welder: { id: "1683470156390-703e9313dab6", alt: "Сварщик обрабатывает металлическую деталь на заводе", credit: "Unsplash" },
  machineHall: { id: "1735494035634-6325a984f431", alt: "Крупное оборудование в просторном заводском цехе", credit: "Unsplash" },
  hospital: { id: "1517120026326-d87759a7b63b", alt: "Медик в форме идёт по больничному коридору", credit: "Unsplash" },
  plant: { id: "1513295202663-54cd69dd2b43", alt: "Промышленное предприятие днём", credit: "Unsplash" },
};

for (const p of Object.values(list)) {
  p.src = (w) => `${base(p.id)}?auto=format&fit=crop&w=${w}&q=70`;
  p.srcset = [480, 800, 1200, 1800].map((w) => `${p.src(w)} ${w}w`).join(", ");
}

export default list;
