const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// 랜덤 숫자 생성
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 랜덤 LocalDateTime 생성
const randomDateTime = (year, month, day) => {
  const h = random(0, 23);
  const m = random(0, 59);
  const s = random(0, 59);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
};

// days 40개 생성
const generateDays = (year, month) => {
  const days = [];
  const videoLinks = [
    "https://video-previews.elements.envatousercontent.com/09664892-2b57-461c-8055-eec6dc4b03f1/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/8c037672-3c88-4e30-a270-32401c0b3426/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/68c3dbdb-dfed-4263-be19-6e7b6f993ffd/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/b89cfa86-d8ad-4c46-806e-c8eec174b255/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/82fde809-6805-445a-94e5-4c0a478e732f/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/77b39e58-b4a2-40bd-9862-3daac799d80b/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/b0e950da-0a79-483f-9804-b5cea4f6d195/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/b0e950da-0a79-483f-9804-b5cea4f6d195/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/adec4248-7da9-40e6-bab5-ed8c06ed16f6/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/cbb4ddfa-909d-4798-9846-78287ddd2ec5/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/f95259b9-ae81-471c-8f22-03513c4e98c7/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/596bf1d5-19f7-4698-b5ec-1a58061b542c/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/ecac03b1-dc83-4e96-9c15-3847c3ec95fe/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/5c866122-ec42-455b-9bef-b3791fe57471/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/3bbc7c7f-0613-4c70-8b36-c4c5d1a4b920/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/18ad1c3f-f58f-4c9a-a7d2-6ffcc0b75498/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/89d7b3a7-45bb-4737-a30d-a69f564f1c07/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/28dc12f5-20b8-4039-ac4e-1daa989618c0/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/f95259b9-ae81-471c-8f22-03513c4e98c7/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/4d322fdc-713c-4bde-bdaa-28d78d97e5fd/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/8f3c2327-efde-466b-b1b8-2b2ada5f6583/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/3d604467-076d-4a68-a0af-92a965734161/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/ff4edec5-fc82-4e3e-848a-7ae6119c869f/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/89d7b3a7-45bb-4737-a30d-a69f564f1c07/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/28dc12f5-20b8-4039-ac4e-1daa989618c0/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/f95259b9-ae81-471c-8f22-03513c4e98c7/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/4d322fdc-713c-4bde-bdaa-28d78d97e5fd/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/8f3c2327-efde-466b-b1b8-2b2ada5f6583/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/3d604467-076d-4a68-a0af-92a965734161/watermarked_preview/watermarked_preview.mp4",
    "https://video-previews.elements.envatousercontent.com/ff4edec5-fc82-4e3e-848a-7ae6119c869f/watermarked_preview/watermarked_preview.mp4",
  ];

  for (let i = 0; i < 40; i++) {
    const day = random(1, 28);
    const count = random(1, 10);

    const highlights = [];
    for (let j = 0; j < count; j++) {
      highlights.push({
        highlightId: uuidv4(),
        createdDate: randomDateTime(year, month, day),
        totalTwoPoint: random(0, 20),
        totalThreePoint: random(0, 10),
        highlightUrl: videoLinks[random(0, videoLinks.length - 1)],
      });
    }

    days.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`,
      count,
      highlights,
    });
  }

  return days;
};

// 월별 응답 객체 생성
const generateMonthResponse = (year, month) => {
  return {
    year,
    month,
    response: {
      status: 200, // ⭐ Integer 값
      success: true,
      data: {
        year,
        month,
        days: generateDays(year, month),
      },
    },
  };
};

// 2025년 전체 12개월 생성
const calendar = [];
for (let m = 1; m <= 12; m++) {
  calendar.push(generateMonthResponse(2025, m));
}

// JSON Server 전체 DB 파일 구조
const db = {
  calendar,
};

// 파일 저장
fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

console.log("🎉 db.json 생성 완료 (status: 200 - integer)!");
