export type Course = {
  title: string;
  tagline: string;
  duration: string;
  level: string;
  certificate: string;
  features: string[];
  highlight?: boolean;
};

export const instructorCourses: Course[] = [
  {
    title: "Mat Pilates Eğitmenliği",
    tagline: "MAT 1 + MAT 2 modülleri",
    duration: "5 gün · Yüz yüze",
    level: "Başlangıç → İleri",
    certificate: "Code Pilates eğitmenlik sertifikası",
    features: [
      "Hareket temelleri ve anatomi",
      "Klasik mat repertuvarı",
      "Ders kurgulama ve ipuçları",
      "Uygulamalı pratik saatleri",
    ],
  },
  {
    title: "Reformer Eğitmenliği",
    tagline: "REFORMER 1 + REFORMER 2 modülleri",
    duration: "4 gün · Yüz yüze",
    level: "Temel → İleri",
    certificate: "Code Pilates eğitmenlik sertifikası",
    features: [
      "Alet güvenliği ve yay ayarları",
      "Temel ve ileri reformer akışları",
      "Grup ve özel ders yönetimi",
      "Modifikasyon ve progresyonlar",
    ],
    highlight: true,
  },
  {
    title: "Trapeze Table Uzmanlığı",
    tagline: "TRAPEZE TABLE 1-2-3",
    duration: "3 gün · Yüz yüze",
    level: "İleri seviye",
    certificate: "Code Pilates uzmanlık sertifikası",
    features: [
      "Cadillac / Trapeze Table repertuvarı",
      "Push-through, roll-back ve yay çalışmaları",
      "Rehabilitatif uygulamalar",
      "Vaka bazlı ders planlama",
    ],
  },
];

export const studioCourses: Course[] = [
  {
    title: "Reformer Özel Ders",
    tagline: "Birebir, size özel program",
    duration: "50 dk",
    level: "Her seviye",
    certificate: "8 veya 12 derslik paket",
    features: [
      "Postür ve hareket analizi",
      "Kişiye özel ders akışı",
      "Esnek saat planlaması",
      "İlerleme takibi",
    ],
    highlight: true,
  },
  {
    title: "Düet Reformer",
    tagline: "İki kişilik özel seans",
    duration: "50 dk",
    level: "Her seviye",
    certificate: "8 veya 12 derslik paket",
    features: [
      "Arkadaşınızla birlikte çalışın",
      "Yakın eğitmen takibi",
      "Ortak hedefe göre program",
      "Motivasyonlu ritim",
    ],
  },
  {
    title: "Mat Pilates Grup Dersi",
    tagline: "Küçük gruplar, büyük odak",
    duration: "50 dk",
    level: "Başlangıç & orta",
    certificate: "Aylık paket",
    features: [
      "Core güçlendirme",
      "Esneklik ve nefes",
      "Sınırlı katılımcı sayısı",
      "Ekipmanlar stüdyoda",
    ],
  },
];
