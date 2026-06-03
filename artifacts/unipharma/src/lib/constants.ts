export const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "سوهاج",
  "أسيوط", "الأقصر", "أسوان", "البحر الأحمر", "الوادي الجديد", "مطروح",
  "شمال سيناء", "جنوب سيناء", "كفر الشيخ", "دمياط", "بورسعيد", "السويس",
  "بني سويف", "الشرقية"
];

export const SPECIALIZATIONS = [
  "صيدلي",
  "مساعد صيدلي",
  "مدير فرع",
  "مسؤول وردية",
  "مسؤول تجميل",
  "كاشير",
  "خدمات"
];

export const SHIFTS = ["صباحي", "مسائي", "نايت"];

export const JOB_TYPES = ["دوام كامل", "دوام جزئي", "شفت"];

export const GENDERS = ["ذكر", "أنثى"];

export const GRADES = ["امتياز", "جيد جداً", "جيد", "مقبول"];

export const APP_STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  reviewing: "تحت الفحص",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: "بانتظار الرد",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  closed: "مغلق",
  filled: "تم الشغل",
};
