# PMM Loyihasi — Agent Xotira Fayli (GEMINI.md)

> Bu fayl agent tomonidan har yangi suhbatda avtomatik o'qiladi.
> Loyihaga yangilik qo'shilganda bu faylga ham qo'shib qo'yiladi.

---

## 1. LOYIHA HAQIDA

- **Nomi:** Andijon PMM — Pedagogik Mahorat Markazi platformasi
- **Maqsad:** O'qituvchilar, kafedralar va super admin uchun raqamli material boshqaruv tizimi
- **GitHub:** https://github.com/adhamovfazliddin/pmm-disk.git
- **Lokal papka:** `C:\Users\Adxamov Fazliddin\Desktop\pmm2`
- **Lokal URL:** http://localhost:3000
- **Deployment:** Vercel (hozircha) + Hostmaster.uz domen + VDS server (kelgusida)
- **Domen:** andijonpmm.uz (hostmaster.uz orqali sotib olingan)
- **VDS:** Hostmaster.uz dan sotib olingan (IP, username, password, SSH bor)

---

## 2. TEXNOLOGIYALAR (TECH STACK)

| Texnologiya | Versiya / Izoh |
|---|---|
| Framework | Next.js 14+ (App Router, Turbopack) |
| Til | TypeScript |
| Ma'lumotlar bazasi | PostgreSQL + Prisma ORM |
| Autentifikatsiya | NextAuth.js |
| UI | Tailwind CSS + Lucide Icons |
| Xabarlar | Sonner (toast) |
| Paket menejeri | npm |
| Xavfsizlik | Zod (validatsiya) + NextAuth sessiya |

---

## 3. QOIDALAR (DOIM AMAL QILISH SHART)

### ⛔ QOIDA 1: GitHub'ga PUSH QILMA
Foydalanuvchi **aniq va ochiq ruxsat bermagunicha** GitHub'ga hech qachon push qilma.
Foydalanuvchi ruxsat berganda aytadi: "GitHub'ga push qil" yoki "push qil".

### ⚠️ QOIDA 2: Windows EPERM Muammosi
`npm run dev` ishlab turganida `npx prisma db push` yoki boshqa Prisma buyruqlari ISHLATMA.
Avval dev serverni to'xtat (`Ctrl+C`), keyin Prisma buyrug'ini bajar.

### 🔐 QOIDA 3: Xavfsizlik Birinchi O'rinda
- Har qanday yangi funksiya qo'shilganda xavfsizlik tekshiruvi o'tkazilishi shart
- Foydalanuvchi kiritgan ma'lumotlar DOIM Zod bilan validatsiya qilinishi kerak
- Server Action'larda DOIM `getServerSession()` bilan autentifikatsiya tekshirilishi kerak
- Rolga asoslangan ruxsat (RBAC) DOIM tekshirilishi kerak
- `.env` faylga hech qachon tegma, ko'rsatma

### 📝 QOIDA 4: Commit Xabarlari
Commit xabarlari ingliz tilida yoziladi: `feat:`, `fix:`, `perf:`, `refactor:` prefikslari bilan.

### 🌐 QOIDA 5: GEMINI.md ni Yangilab Tur
Loyihaga har qanday yangilik qo'shilganda (yangi sahifa, yangi funksiya, xatolik tuzatilganda) bu faylning "LOYIHA TARIXI" bo'limini yangilab qo'y.

---

## 4. FOYDALANUVCHI ROLLARI

| Rol | Tur | Huquqlari |
|---|---|---|
| SUPER_ADMIN | Admin | Barcha tizimni boshqaradi, o'qituvchi/kafedra yaratadi, materiallarni tasdiqlaydi |
| TEACHER | O'qituvchi | O'z materiallarini yuklaydi, shaxsiy resurslarini boshqaradi |
| DEPARTMENT | Kafedra | Kafedra materiallarini boshqaradi |

---

## 5. TARJIMA ARXITEKTURASI (i18n)

- **Tizim:** `useLanguage` hook — `src/lib/i18n.ts`
- **Fayllar:** `src/locales/uz.ts` (o'zbek) va `src/locales/ru.ts` (rus)
- **Muhim:** `useLanguage` faqat `"use client"` komponentlarda ishlaydi!
- **Server Component'lardan** (`page.tsx`) to'g'ridan-to'g'ri `t()` ishlatib bo'lmaydi
- **Format:** `{t('key') || "fallback matn"}`
- **Yangi kalit qo'shilganda:** IKKALA `uz.ts` va `ru.ts` faylga qo'shilishi shart!

---

## 6. MA'LUMOTLAR BAZASI QOIDALARI

- **Tartib:** `orderBy: { createdAt: "asc" }` — eng eskisi #1 bo'ladi
- **Raqamlash:** `(currentPage - 1) * itemsPerPage + index + 1`
- **Sana formati:** `dd.MM.yyyy HH:mm` (vaqt ham ko'rsatiladi)
- **Kafedra statistikasi** = kafedra materiallari + unga biriktirilgan barcha o'qituvchilar materiallari
- **Parol:** Prisma'da `password` maydoni hech qachon `select` da ko'rsatilmasin

---

## 7. LOYIHA STRUKTURASI

```
src/
├── app/
│   ├── admin/               # Super Admin sahifalari
│   │   ├── dashboard/       # Admin bosh sahifasi
│   │   ├── teachers/        # O'qituvchilar ro'yxati va detail
│   │   ├── departments/     # Kafedralar ro'yxati va detail
│   │   ├── materials/       # Materiallar + pending (tasdiq kutuvchi)
│   │   └── resources/       # Resurslar boshqaruvi
│   ├── dashboard/           # O'qituvchi/Kafedra sahifalari
│   │   ├── my-materials/    # Mening materiallarim
│   │   ├── my-resources/    # Mening resurslarim (YouTube, havolalar)
│   │   └── materials/new/   # Yangi material qo'shish
│   ├── catalog/             # Foydali Resurslar (umumiy katalog)
│   └── actions/             # Server Actions
├── components/
│   ├── layout/AppLayout.tsx # Yon menyu (sidebar)
│   └── MaterialPreviewModal.tsx  # Fayl ko'rish modali
├── lib/
│   └── i18n.ts              # Tarjima tizimi
└── locales/
    ├── uz.ts                # O'zbekcha tarjimalar
    └── ru.ts                # Ruscha tarjimalar
```

---

## 8. XAVFSIZLIK HIMOYASI (AMALGA OSHIRILGAN)

| Xavfsizlik turi | Holati | Izoh |
|---|---|---|
| SQL Injection | ✅ Himoyalangan | Prisma ORM parametrli so'rovlar |
| XSS | ✅ Himoyalangan | React avtomatik escaping |
| CSRF | ✅ Himoyalangan | NextAuth o'rnatilgan himoya |
| Autentifikatsiya | ✅ | NextAuth.js sessiya tekshiruvi |
| Rolga asoslangan kirish (RBAC) | ✅ | Har sahifada rol tekshiruvi |
| Input validatsiyasi | ✅ | Zod library |
| Parol saqlash | ✅ | bcrypt hash |
| Rate limiting | ⚠️ To'liq emas | Kelgusida qo'shish kerak |
| PPTX Preview xavfsizligi | ⚠️ | Google Drive embed xavfsizligi yetarli |

---

## 9. QILISH KERAK BO'LGAN ISHLAR (TO-DO)

| Vazifa | Muhimligi | Holati |
|---|---|---|
| PPTX fayllarni chiroyli ko'rsatish (Microsoft Office Online embed) | O'rta | ⏳ Keyinga qoldirildi |
| VDS ga loyihani deploy qilish | Yuqori | ⏳ Keyinga qoldirildi |
| Domen ulash (andijonpmm.uz) | Yuqori | ⏳ Keyinga qoldirildi |
| Rate Limiting qo'shish | Yuqori | ⏳ Qilinmagan |
| UptimeRobot sozlash (Vercel cold start) | O'rta | ⏳ Qilinmagan |

---

## 10. LOYIHA TARIXI (NIMA QILINDI)

### [2026-09-07] — Asosiy tizim va admin panel
- ✅ O'qituvchi, Kafedra, Super Admin profillari yaratildi
- ✅ NextAuth.js autentifikatsiya tizimi o'rnatildi
- ✅ Material yuklash va tasdiqlash tizimi yaratildi
- ✅ Admin paneli: O'qituvchilar, Kafedralar, Materiallar sahifalari

### [2026-09-07] — Xatoliklar va optimizatsiyalar
- ✅ `react-hot-toast` xatosi tuzatildi (`sonner` ga o'tkazildi)
- ✅ Barcha admin sahifalari mobil uchun moslashtirildi
- ✅ Rasmlar `lazy loading` bilan tezlashtirildi
- ✅ 5 ta admin sahifa `Promise.all()` bilan parallel so'rovlarga o'tkazildi
- ✅ Prisma so'rovlarda faqat kerakli ustunlar tanlanadi (`select`)

### [2026-09-08] — O'qituvchi va Kafedra profil sahifalari
- ✅ O'qituvchi detail sahifasi yaratildi (statistika, materiallar, Drive papka)
- ✅ Kafedra detail sahifasi yaratildi (O'qituvchiga o'xshash)
- ✅ Excel eksport funksiyasi qo'shildi (O'qituvchilar va Kafedralar)
- ✅ Excel eksport xatosi tuzatildi (har ustun o'z yacheykasiga)
- ✅ O'qituvchi profilida "Kafedra Boshqaruv Paneli" ko'rinishi xatosi tuzatildi

### [2026-09-09] — Xavfsizlik auditi
- ✅ To'liq xavfsizlik auditi o'tkazildi
- ✅ XSS, SQL Injection, CSRF himoyasi tekshirildi
- ✅ Barcha Server Action'larda autentifikatsiya va rol tekshiruvi bor
- ✅ Zod validatsiya barcha formlarda ishlayapti
- ✅ Xavfsizlik auditi hisoboti tayyorlandi

### [2026-09-16] — "Mening Resurslarim" funksiyasi
- ✅ `PersonalResource` Prisma modeli qo'shildi
- ✅ O'qituvchi o'z profilidan YouTube va boshqa havolalar qo'sha oladi
- ✅ Qo'shilgan havolalar `/catalog` (Foydali Resurslar) sahifasida ko'rinadi
- ✅ DashboardClient'dagi "Mening Resurslarim" tab olib tashlandi
- ✅ Sidebar'da "Mening Resurslarim" sahifasiga havolasi bor

### [2026-09-16] — Kutubxona va Bookmark (esdan chiqqan xususiyatlar)
- ✅ `LibraryBook` Prisma modeli va `library.ts` actionlari qo'shildi
- ✅ Admin panelda kutubxona materiallarini boshqarish yaratildi
- ✅ Barcha o'qituvchilar va mehmonlar uchun jamoat kutubxonasi (`PublicLibraryClient.tsx`) shakllantirildi
- ✅ `Bookmark` modeli qo'shildi — o'qituvchilar kerakli material va resurslarni "Saqlanganlar"ga qo'shishi mumkin (`bookmark.ts`)

### [2026-09-21] — Bug tuzatishlari va Kod tahlili
- ✅ Tizim kodlari to'liq qatorma-qator tahlil qilinib, hisobot berildi
- ✅ **KRITIK BUG**: Kafedra o'chirilganda unga biriktirilgan o'qituvchilar sababli `500 Server Error` (Foreign Key Constraint) berishi muammosi hal etildi (`schema.prisma` da `onDelete: SetNull` qo'shildi)
- ✅ **BUG**: `next.config.ts` faylida xavfli bo'lgan `ignoreBuildErrors: true` olib tashlandi
- ✅ **BUG**: Eskirgan `react-hot-toast` kutubxonasi kutubxona fayllaridan (`PublicLibraryClient.tsx`, `LibraryClient.tsx`) tozalandi va `sonner` ga o'tkazildi
- ✅ **BUG**: `package.json` dan `react-hot-toast` butunlay o'chirildi (npm uninstall)
- ✅ **Optimizatsiya**: `material.ts` da materialni o'chirishdagi ortiqcha (manual kaskad) kodlar olib tashlandi, endi Prisma `onDelete: Cascade` o'zi hal qiladi
- ✅ **UI/UX**: "Mening Resurslarim" sahifasidagi resurs qo'shish modali zamonaviy ikonkalarga boy va gorizontal tartibdagi 2 ustunli (`grid-cols-2`) dizaynga o'tkazildi.

### [2026-09-16] — To'liq i18n tarjimasi (O'zbek + Rus)
- ✅ Sidebar havolalari tarjima qilindi (`AppLayout.tsx`)
- ✅ `NewMaterialClient.tsx` — barcha forma matnlari tarjima qilindi
- ✅ `MyMaterialsClient.tsx` — jadval sarlavhalari tarjima qilindi
- ✅ `MyResourcesClient.tsx` — tugmalar, tab'lar, modal tarjima qilindi
- ✅ `PendingMaterialsClient.tsx` — Tasdiqlash/Rad etish tugmalari tarjima qilindi
- ✅ `uz.ts` va `ru.ts` ga 40+ yangi kalit qo'shildi
- ✅ `useLanguage` import unutilgan xatolik tuzatildi

### [2026-09-19] — Muhokamalar
- ℹ️ PPTX va PDF preview farqi muhokama qilindi (tuzatish keyinga qoldirildi)
- ℹ️ VDS va domen ulash muhokama qilindi (Hostmaster.uz'dan domen+VDS sotib olingan)
- ℹ️ Bitta VDS'da bir nechta loyiha ishlashi mumkinligi tushuntirildi

---

## 11. MUHIM TEXNIK ESLATMALAR

### Lokal server ishga tushirish
```bash
cd C:\Users\Adxamov Fazliddin\Desktop\pmm2
npm run dev
```

### GitHub'ga push (FAQAT RUXSAT BERILGANDA)
```bash
git add .
git commit -m "feat: ..."
git push
```

### Prisma migratsiyasi (dev server TO'XTATILGAN HOLDA)
```bash
npx prisma db push
npx prisma studio
```
