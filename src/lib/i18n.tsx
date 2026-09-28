import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "ar" | "en";

let currentLanguage: Language = "ar";

const translations: Record<string, string> = {
  Home: "الرئيسية", Games: "الألعاب", Projects: "المشاريع", Latest: "الأحدث", Search: "البحث",
  "Search games": "ابحث عن لعبة", "Admin Login": "دخول الإدارة", Dashboard: "لوحة التحكم", Menu: "القائمة", Close: "إغلاق",
  "Browse Games": "تصفح الألعاب", "Latest Releases": "أحدث الإصدارات", Archive: "الأرشيف", "All games": "كل الألعاب",
  "Just in": "أحدث الإضافات", "View all": "عرض الكل", "No games available yet.": "لا توجد ألعاب متاحة حاليًا.",
  "Published featured projects will appear here.": "ستظهر هنا المشاريع المنشورة والمميزة.", "No releases yet.": "لا توجد إصدارات بعد.",
  "New files will show up here as soon as they are published.": "ستظهر الملفات الجديدة هنا فور نشرها.", "View details": "عرض التفاصيل",
  "Catalog": "الكتالوج", "Work": "المشاريع", "Search titles, files, platforms…": "ابحث في العناوين والملفات والمنصات…",
  "Title, platform, type": "العنوان، المنصة، النوع", "All platforms": "كل المنصات", "All types": "كل الأنواع", "All statuses": "كل الحالات",
  "Project type": "نوع المشروع", Platform: "المنصة", Status: "الحالة", "Previous": "السابق", "Next": "التالي",
  "Download": "تنزيل", "Download File": "تنزيل الملف", "Downloads": "التنزيلات", "Added": "أضيف في",
  "Library": "المكتبة", "Game information": "معلومات اللعبة", Versions: "الإصدارات", Files: "الملفات", "File name": "اسم الملف",
  Version: "الإصدار", Size: "الحجم", "Upload date": "تاريخ الرفع", Actions: "الإجراءات", Sample: "عينة", "Add game": "إضافة لعبة",
  "Add Version": "إضافة إصدار", "Save": "حفظ", Name: "الاسم", Description: "الوصف", "Version number": "رقم الإصدار",
  "Release date": "تاريخ الإصدار", "Upload file": "رفع ملف", "Drag a file here or choose one. Size, type, and filename are stored automatically.": "اسحب الملف هنا أو اختره. سيتم حفظ الحجم والنوع واسم الملف تلقائيًا.",
  File: "الملف", "Choose a file.": "اختر ملفًا.", "Create a version first.": "أنشئ إصدارًا أولًا.", "File uploaded": "تم رفع الملف",
  "Upload failed": "فشل الرفع", "Uploading cover…": "جارٍ رفع الغلاف…", "Cover uploaded": "تم رفع الغلاف", "Cover upload failed": "فشل رفع الغلاف",
  "Visible to visitors": "ظاهر للزوار", Cancel: "إلغاء", Slug: "الرابط المختصر",
  Cover: "الغلاف", "Version label": "اسم الإصدار", Developer: "المطور", "Original release": "الإصدار الأصلي", "Localization release": "إصدار التعريب",
 
 
  "Saved": "تم الحفظ", "Save failed": "فشل الحفظ", "Upload": "رفع", "Sign-up failed": "فشل إنشاء الحساب", "Sign-in failed": "فشل تسجيل الدخول", "Something went wrong": "حدث خطأ ما",
  "No files yet.": "لا توجد ملفات بعد.", "Files are streamed directly to the server's persistent storage and are never loaded into application RAM as a whole.": "يتم بث الملفات مباشرة إلى التخزين الدائم للخادم ولا يتم تحميلها كاملةً في ذاكرة التطبيق.", "Loading dashboard…": "جارٍ تحميل لوحة التحكم…", "Unauthorized admin access": "وصول غير مصرح إلى لوحة الإدارة",
  Site: "الموقع", "Maximum: 15 GiB per file.": "الحد الأقصى: 15 جيبيبايت لكل ملف.", Storage: "التخزين",
  "Local disk storage": "التخزين المحلي على القرص", "Active driver:": "المشغل النشط:", "Private access for the site owner. Visitors do not need an account.": "وصول خاص بمالك الموقع. لا يحتاج الزوار إلى حساب.",
  "Sign-in is disabled.": "تسجيل الدخول معطل.", "Checking session…": "جارٍ التحقق من الجلسة…", Email: "البريد الإلكتروني", Password: "كلمة المرور",
  "Please wait…": "يرجى الانتظار…", "Create owner account": "إنشاء حساب المالك", "Sign in": "تسجيل الدخول", "Already have an account? Sign in": "لديك حساب بالفعل؟ تسجيل الدخول",
  "Need the first owner account? Create it": "هل تحتاج إلى إنشاء حساب المالك الأول؟ أنشئه الآن", "Sign in as administrator": "تسجيل الدخول كمسؤول",
  "Signing out…": "جارٍ تسجيل الخروج…", "Sign out": "تسجيل الخروج", Account: "الحساب", "Arabic Game Localization & Modding": "تعريب الألعاب والتعديل عليها",
  "All Rights Reserved.": "جميع الحقوق محفوظة.", "No results found.": "لم يتم العثور على نتائج.",
  "Switch to English": "التبديل إلى الإنجليزية", "Switch to Arabic": "التبديل إلى العربية", "Private access": "وصول خاص",
  "Try a different title, platform, or file name.": "جرّب عنوانًا أو منصة أو اسم ملف مختلفًا.",
  "Published work will appear in this list.": "ستظهر الأعمال المنشورة في هذه القائمة.",
  "No published projects match these filters.": "لا توجد مشاريع منشورة تطابق عوامل التصفية.",
  "New files will appear here once they are published.": "ستظهر الملفات الجديدة هنا فور نشرها.",
  "No downloadable files have been published for this game yet.": "لم يتم نشر ملفات قابلة للتنزيل لهذه اللعبة بعد.",
  "Create game": "إنشاء اللعبة", "Save game": "حفظ اللعبة", "Edit version": "تعديل الإصدار", "Add version": "إضافة إصدار",


  "Enter a MediaFire URL.": "أدخل رابط MediaFire.", "Enter a filename.": "أدخل اسم الملف.", "Enter the file size in MB.": "أدخل حجم الملف بالميغابايت.",
  "Failed to add download link": "فشل إضافة رابط التحميل", "Download link added": "تمت إضافة رابط التحميل", "Add external file": "إضافة ملف خارجي",
  "Game files are not uploaded to this site. Store them on MediaFire and add the download link here.": "ملفات الترجمة لا تُرفع إلى الموقع. خزّنها على MediaFire وأضف رابط التحميل هنا.",
  "Filename": "اسم الملف", "Size (MB)": "الحجم (MB)", "MediaFire URL": "رابط MediaFire", "Saving…": "جارٍ الحفظ…", "Add download link": "إضافة رابط التحميل",
  "Title": "العنوان", "Flags": "العلامات", "Maximum upload size (bytes)": "الحد الأقصى لحجم الغلاف (بالبايت)", "Maximum cover upload size (bytes)": "الحد الأقصى لحجم الغلاف (بالبايت)",

  "Set": "عيّن", "to choose the persistent storage directory.": "لاختيار مجلد التخزين الدائم.", "Game files are hosted externally on MediaFire. Cover uploads use the setting above.": "ملفات الألعاب مستضافة خارجيًا على MediaFire. إعداد الحجم أعلاه مخصص لرفع الأغلفة.", "Game file hosting:": "استضافة ملفات الألعاب:", "External MediaFire links": "روابط MediaFire خارجية", "The website stores file metadata and the download URL; game binaries are not stored on this server.": "يخزن الموقع بيانات الملف ورابط التنزيل فقط؛ ولا تُخزن ملفات الألعاب على هذا الخادم.", "to choose where site assets such as covers are stored.": "لاختيار مكان تخزين أصول الموقع مثل الأغلفة." ,

  "Owner": "المالك",


  "Download localization files.": "تنزيل ملفات التعريب.", "Published games": "الألعاب المنشورة",
  "Arabic Localization": "التعريب العربي", "Arabic Dubbing": "الدبلجة العربية", Translation: "الترجمة", Mod: "تعديل", Patch: "رقعة", Font: "خط", Audio: "صوت", Other: "أخرى",
  Completed: "مكتمل", "In Progress": "قيد العمل", "Coming Soon": "قريبًا", Updated: "محدث",
};

export function tx(value: string): string {
  if (currentLanguage === "en") return value;
  return translations[value] ?? value;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(language: Language) {
  currentLanguage = language;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setState] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    return window.localStorage.getItem("goated-language") === "en" ? "en" : "ar";
  });

  useEffect(() => {
    currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.language = language;
    window.localStorage.setItem("goated-language", language);
  }, [language]);

  const changeLanguage = (next: Language) => {
    currentLanguage = next;
    setState(next);
  };

  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>{children}</LanguageContext.Provider>;
}

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({
  language: "ar",
  setLanguage: () => undefined,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-gold/50 hover:text-gold"
      aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <span className={language === "ar" ? "text-gold" : ""}>ع</span>
      <span>/</span>
      <span className={language === "en" ? "text-gold" : ""}>EN</span>
    </button>
  );
}
