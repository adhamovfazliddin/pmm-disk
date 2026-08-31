"use client";

import { useState, useMemo } from "react";
import { Search, Eye, Download, Share2, Image as ImageIcon, ChevronLeft, ChevronRight, Globe, Menu, X, BookOpen, BookMarked, FileText, GraduationCap, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import toast from "react-hot-toast";

type LangType = 'uz' | 'ru' | 'en';

const translations = {
  welcome1: { uz: "Elektron kutubxonaga", ru: "Добро пожаловать в", en: "Welcome to the" },
  welcome2: { uz: "Xush kelibsiz", ru: "электронную библиотеку", en: "Electronic Library" },
  desc: { 
    uz: "Bu yerda siz o'z sohangizga oid barcha kerakli adabiyotlar, metodik qo'llanmalar va darsliklarni topishingiz mumkin.",
    ru: "Здесь вы можете найти всю необходимую литературу, методические пособия и учебники по вашей специальности.",
    en: "Here you can find all the necessary literature, methodological guides, and textbooks for your specialty."
  },
  allBooksTitle: { uz: "Barcha Kitoblar", ru: "Все Книги", en: "All Books" },
  allBooks: { uz: "Barcha kitoblar", ru: "Все книги", en: "All Books" },
  textbooks: { uz: "Darsliklar", ru: "Учебники", en: "Textbooks" },
  methodological: { uz: "Metodik qo'llanmalar", ru: "Методические пособия", en: "Methodological guides" },
  scientific: { uz: "Ilmiy maqolalar", ru: "Научные статьи", en: "Scientific articles" },
  searchPlaceholder: { uz: "Kitob yoki muallif qidirish...", ru: "Поиск книги или автора...", en: "Search book or author..." },
  noBooks: { uz: "Hech qanday kitob topilmadi.", ru: "Книги не найдены.", en: "No books found." },
  view: { uz: "Ko'rish", ru: "Смотреть", en: "View" },
  download: { uz: "Yuklab", ru: "Скачать", en: "Download" },
  share: { uz: "Ulashish", ru: "Поделиться", en: "Share" },
  bookReading: { uz: "Kitob Mutolaasi", ru: "Чтение книги", en: "Book Reading" },
  close: { uz: "Yopish", ru: "Закрыть", en: "Close" },
  downloadFull: { uz: "Yuklab olish", ru: "Скачать", en: "Download" },
  quickLinks: { uz: "Tezkor havolalar", ru: "Быстрые ссылки", en: "Quick Links" },
  contact: { uz: "Bog'lanish", ru: "Контакты", en: "Contact" },
  home: { uz: "Bosh sahifa", ru: "Главная страница", en: "Home" },
  aboutUs: { uz: "Biz haqimizda", ru: "О нас", en: "About Us" },
  address: { uz: "Manzil: Andijon shahar, Istiqlol ko'chasi, 8-Uy.", ru: "Адрес: г. Андижан, ул. Истиклол, 8.", en: "Address: Andijan city, Istiqlol str, 8." },
  footerDesc: { uz: "Zamonaviy ta'lim va innovatsiyalar markazi. Bizning elektron kutubxonamiz barcha o'qituvchilar va izlanuvchilar uchun ochiq.", ru: "Центр современного образования и инноваций. Наша электронная библиотека открыта для всех преподавателей и исследователей.", en: "Center for Modern Education and Innovations. Our electronic library is open to all teachers and researchers." },
  copied: { uz: "Havola nusxalandi!", ru: "Ссылка скопирована!", en: "Link copied!" },
  shareTitle: { uz: "Kutubxonamizdan ushbu kitobni o'qib ko'ring:", ru: "Почитайте эту книгу из нашей библиотеки:", en: "Read this book from our library:" },
  bookDetails: { uz: "Kitob haqida", ru: "О книге", en: "About Book" },
  authorLabel: { uz: "Muallif:", ru: "Автор:", en: "Author:" },
  categoryLabel: { uz: "Kategoriya:", ru: "Категория:", en: "Category:" },
  yearLabel: { uz: "Nashr yili:", ru: "Год издания:", en: "Publication Year:" },
  pagesLabel: { uz: "Sahifalar soni:", ru: "Количество страниц:", en: "Page Count:" },
  annotationLabel: { uz: "Annotatsiya:", ru: "Аннотация:", en: "Annotation:" },
  readBook: { uz: "O'qish", ru: "Читать", en: "Read" },
  zoomIn: { uz: "Yaqinlashtirish", ru: "Увеличить", en: "Zoom In" },
  zoomOut: { uz: "Uzoqlashtirish", ru: "Уменьшить", en: "Zoom Out" },
  darkMode: { uz: "Tungi rejim", ru: "Ночной режим", en: "Dark Mode" },
  lightMode: { uz: "Kunduzgi rejim", ru: "Дневной режим", en: "Light Mode" }
};

interface LibraryBook {
  id: string;
  title: string;
  author: string | null;
  coverImage: string | null;
  driveUrl: string;
  category: string | null;
  publicationYear?: number;
  pageCount?: number;
  annotation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function PublicLibraryClient({ initialBooks }: { initialBooks: LibraryBook[] }) {
  // Use mock data if empty
  const [books] = useState<LibraryBook[]>(initialBooks.length > 0 ? initialBooks : [
    {
      id: "mock-1",
      title: "O'zbekiston tarixi (1-jild)",
      author: "Azamat Ziyoyev",
      coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
      driveUrl: "https://google.com",
      category: "DARSLIK",
      publicationYear: 2022,
      pageCount: 320,
      annotation: "O'zbekiston tarixining qadimgi davrdan to bugungi kungacha bo'lgan eng muhim voqealari va jarayonlarini qamrab olgan keng qamrovli darslik. Talabalar va tadqiqotchilar uchun maxsus ishlab chiqilgan bo'lib, o'z ichiga xaritalar, tarixiy hujjatlar va tahliliy materiallarni oladi.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-2",
      title: "Matematika 11-sinf",
      author: "M.A. Mirzaahmedov",
      coverImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=600",
      driveUrl: "https://google.com",
      category: "QO'LLANMA",
      publicationYear: 2023,
      pageCount: 240,
      annotation: "Umumiy o'rta ta'lim maktablarining 11-sinf o'quvchilari uchun matematika fanidan zamonaviy darslik. Murakkab mavzularni oson tushuntirish va amaliy misollar bilan boyitilgan.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-3",
      title: "Fizika o'qitish metodikasi",
      author: "P. Habibullayev",
      coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600",
      driveUrl: "https://google.com",
      category: "METODIK QO'LLANMA",
      publicationYear: 2021,
      pageCount: 185,
      annotation: "Fizika fanini o'qitishda innovatsion yondashuvlar va ilg'or pedagogik texnologiyalarni qo'llash bo'yicha o'qituvchilar uchun uslubiy tavsiyalar.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-4",
      title: "Informatika va AT",
      author: "B. Boltayev",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
      driveUrl: "https://google.com",
      category: "DARSLIK",
      publicationYear: 2024,
      pageCount: 210,
      annotation: "Axborot texnologiyalari va dasturlash asoslari bo'yicha eng so'nggi ma'lumotlarni o'z ichiga olgan fundamental darslik.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-5",
      title: "Ona tili",
      author: "N. Mahmudov",
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600",
      driveUrl: "https://google.com",
      category: "DARSLIK",
      publicationYear: 2023,
      pageCount: 195,
      annotation: "O'zbek tilining boy va rang-barang imkoniyatlarini mukammal o'zlashtirish uchun yangilangan o'quv qo'llanma.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-6",
      title: "Kimyo 10-sinf",
      author: "I.R. Asqarov",
      coverImage: "https://images.unsplash.com/photo-1603126859232-ea31b0db4330?auto=format&fit=crop&q=80&w=600",
      driveUrl: "https://google.com",
      category: "QO'LLANMA",
      publicationYear: 2022,
      pageCount: 230,
      annotation: "Kimyo fani bo'yicha o'rta ta'lim muassasalari uchun mo'ljallangan, ko'plab laboratoriya ishlari va masalalarni qamrab olgan kitob.",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [quickViewBook, setQuickViewBook] = useState<LibraryBook | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lang, setLang] = useState<LangType>('uz');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Barchasi");
  const [viewerZoom, setViewerZoom] = useState<number>(1);
  const [viewerDarkMode, setViewerDarkMode] = useState<boolean>(false);
  
  const booksPerPage = 8;

  // Extract unique categories for tabs
  const categories = useMemo(() => {
    const cats = new Set(books.map(b => b.category?.trim()).filter(Boolean));
    return ["Barchasi", ...Array.from(cats)] as string[];
  }, [books]);

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "Barchasi" || book.category?.trim() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const currentBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

  const handleRead = (book: LibraryBook) => {
    setSelectedBook(book);
  };

  const getPreviewUrl = (url: string) => {
    let embedUrl = url;
    if (embedUrl.includes("/view?usp=sharing")) {
      return embedUrl.replace("/view?usp=sharing", "/preview");
    } else if (embedUrl.includes("/view")) {
      return embedUrl.replace("/view", "/preview");
    }
    return embedUrl;
  };

  const handleDownload = (url: string) => {
    // In a real app, this might trigger a direct download if available
    window.open(url, '_blank');
  };

  const handleShare = async (book: LibraryBook) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `${translations.shareTitle[lang]} ${book.title}`,
          url: book.driveUrl
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      navigator.clipboard.writeText(book.driveUrl);
      toast.success(translations.copied[lang]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#e7e7e7] to-[#eeeeee]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee-infinite { 
          display: flex;
          width: max-content;
          animation: scroll 60s linear infinite; 
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      
      {/* Top Navbar */}
      <header className="bg-[#19365e] text-white flex-shrink-0 z-30 relative shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <a href="https://andijonpmm.uz/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo2.png" alt="Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain shrink-0" />
              <div className="flex flex-col uppercase font-bold leading-[1.1] text-[10px] md:text-xs text-white tracking-wide">
                <span>Andijon viloyati</span>
                <span>Pedagogik mahorat</span>
                <span>Markazi</span>
              </div>
            </a>
          </div>
          
          <div className="flex-1 overflow-hidden flex items-center px-4">
            <div className="animate-marquee-infinite text-white font-bold tracking-wider uppercase text-xl leading-tight">
              <div className="flex items-center">
                {Array(10).fill('ANDIJON VILOYATI PEDAGOGIK MAHORAT MARKAZI').map((text, i) => (
                  <span key={`a-${i}`} className="flex items-center whitespace-nowrap">
                    {text}
                    <span className="mx-12 text-white/60">•</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                {Array(10).fill('ANDIJON VILOYATI PEDAGOGIK MAHORAT MARKAZI').map((text, i) => (
                  <span key={`b-${i}`} className="flex items-center whitespace-nowrap">
                    {text}
                    <span className="mx-12 text-white/60">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div 
            className="relative shrink-0 min-w-[48px] h-[32px] group"
            onMouseEnter={() => setLangDropdownOpen(true)}
            onMouseLeave={() => setLangDropdownOpen(false)}
          >
            <div className="absolute top-0 right-0 w-full flex flex-col gap-1 bg-[#1c3c6a] p-1 rounded-lg border border-white/20 z-50 shadow-lg">
              {(['uz', 'ru', 'en'] as LangType[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => { setLang(l); setLangDropdownOpen(false); }}
                  className={`
                    w-full px-2 py-1 text-xs font-bold rounded-md transition-all uppercase
                    ${lang === l ? 'bg-blue-600 text-white shadow-sm order-first flex justify-center' : 'text-white/70 hover:text-white hover:bg-white/10 order-last'}
                    ${lang !== l && !langDropdownOpen ? 'hidden' : 'flex justify-center'}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (Sidebar + Grid) */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row relative">
        
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block absolute lg:static inset-y-0 left-0 w-72 z-20 flex-shrink-0 p-4 lg:p-6 lg:pl-8`}>
          <div className="bg-white/70 backdrop-blur-md border border-slate-300/60 shadow-sm p-6 rounded-2xl sticky top-6">
            <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">
              {translations.welcome1[lang]} <br/>
              <span className="text-blue-600">{translations.welcome2[lang]}</span>
            </h2>
            <div className="w-12 h-1 bg-blue-600 rounded-full mt-5 mb-6"></div>
            
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              {translations.desc[lang]}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-blue-600 text-white shadow-sm font-medium rounded-xl px-4 py-3 cursor-pointer transition-all duration-200">
                <BookOpen className="w-5 h-5 shrink-0" />
                <span className="text-sm">{translations.allBooks[lang]}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 hover:bg-slate-200/60 transition-all duration-200 rounded-xl px-4 py-3 cursor-pointer">
                <BookMarked className="w-5 h-5 shrink-0" />
                <span className="text-sm">{translations.textbooks[lang]}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 hover:bg-slate-200/60 transition-all duration-200 rounded-xl px-4 py-3 cursor-pointer">
                <FileText className="w-5 h-5 shrink-0" />
                <span className="text-sm">{translations.methodological[lang]}</span>
              </div>
              <a 
                href="https://andijonpmm.uz/scientific" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-700 hover:bg-slate-200/60 transition-all duration-200 rounded-xl px-4 py-3 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5 shrink-0" />
                <span className="text-sm">{translations.scientific[lang]}</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* Main Section */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0">{translations.allBooksTitle[lang]}</h1>
            
            <div className="relative w-full md:w-80 lg:w-96 shadow-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={translations.searchPlaceholder[lang]} 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex overflow-x-auto hide-scrollbar gap-3 w-full mt-4 mb-8 pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${activeCategory === category 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500">{translations.noBooks[lang]}</p>
              </div>
            ) : (
              currentBooks.map(book => (
                <div key={book.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col group">
                  {/* Image */}
                  <div 
                    className="aspect-[3/4] w-full relative bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100 cursor-pointer"
                    onClick={() => setQuickViewBook(book)}
                  >
                    {book.coverImage ? (
                      <div className="w-full h-full relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            e.currentTarget.nextElementSibling?.classList.add('flex');
                          }}
                        />
                        <div className="hidden absolute inset-0 items-center justify-center bg-slate-100 w-full h-full">
                          <ImageIcon className="w-12 h-12 text-slate-300" />
                        </div>
                      </div>
                    ) : (
                      <ImageIcon className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div 
                    className="p-5 flex-1 flex flex-col cursor-pointer"
                    onClick={() => setQuickViewBook(book)}
                  >
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded uppercase tracking-wider self-start mb-3 border border-amber-200/50">
                      {book.category || 'KITOB'}
                    </span>
                    <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 text-base group-hover:text-blue-600 transition-colors mb-1.5">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-auto">
                      {book.author || 'Noma\'lum muallif'}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100 bg-gray-50/50">
                    <button 
                      onClick={() => handleRead(book)}
                      className="py-3.5 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors group/btn"
                    >
                      <Eye className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-600 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{translations.view[lang]}</span>
                    </button>
                    <button 
                      onClick={() => handleDownload(book.driveUrl)}
                      className="py-3.5 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors group/btn"
                    >
                      <Download className="w-5 h-5 text-gray-600 group-hover/btn:text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{translations.download[lang]}</span>
                    </button>
                    <button 
                      onClick={() => handleShare(book)}
                      className="py-3.5 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors group/btn"
                    >
                      <Share2 className="w-5 h-5 text-gray-600 group-hover/btn:text-purple-600 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{translations.share[lang]}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                    currentPage === page 
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" 
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Dark Footer */}
      <footer className="bg-[#19365e] text-slate-300 py-12 flex-shrink-0 z-20 relative mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo2.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
                <div className="flex flex-col uppercase font-bold leading-[1.1] text-sm text-white tracking-wide">
                  <span>Andijon viloyati</span>
                  <span>Pedagogik mahorat</span>
                  <span>Markazi</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {translations.footerDesc[lang]}
              </p>
            </div>
            <div className="md:justify-self-center">
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">{translations.quickLinks[lang]}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://andijonpmm.uz/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors outline-none focus:outline-none">{translations.home[lang]}</a></li>
                <li><a href="https://andijonpmm.uz/about" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors outline-none focus:outline-none">{translations.aboutUs[lang]}</a></li>
                <li><a href="https://andijonpmm.uz/contacts" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors outline-none focus:outline-none">{translations.contact[lang]}</a></li>
              </ul>
            </div>
            <div className="md:justify-self-end">
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">{translations.contact[lang]}</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>{translations.address[lang]}</li>
                <li>
                  <div className="flex flex-col gap-1.5">
                    <span>Tel: +998 99 999 14 04</span>
                    <span>Tel: +998 90 200 11 20</span>
                    <span>Tel: +998 93 238 91 17</span>
                  </div>
                </li>
                <li>Email: avxtxqtumoi@exat.uz</li>
              </ul>
            </div>
          </div>

        </div>
      </footer>

      {/* Read on Site Modal (Iframe) */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-2 md:p-6 lg:p-12">
          <div className="bg-white max-w-5xl w-full h-[90vh] md:h-[95vh] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 line-clamp-1 max-w-[200px] sm:max-w-xs md:max-w-sm">{selectedBook.title}</h3>
              </div>
              <div className="flex items-center gap-2 md:gap-3 ml-auto">
                {/* PDF Controls */}
                <div className="flex items-center bg-slate-200/70 rounded-lg p-1 mr-2">
                  <button 
                    onClick={() => setViewerZoom(z => Math.max(0.5, z - 0.2))} 
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-all"
                    title={translations.zoomOut?.[lang] || "Zoom Out"}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-600 px-2 min-w-[3ch] text-center">{Math.round(viewerZoom * 100)}%</span>
                  <button 
                    onClick={() => setViewerZoom(z => Math.min(3, z + 0.2))} 
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-all"
                    title={translations.zoomIn?.[lang] || "Zoom In"}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => setViewerDarkMode(!viewerDarkMode)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewerDarkMode ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                  title={viewerDarkMode ? (translations.lightMode?.[lang] || "Light Mode") : (translations.darkMode?.[lang] || "Dark Mode")}
                >
                  {viewerDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                
                <a 
                  href={selectedBook.driveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">{translations.downloadFull[lang]}</span>
                </a>
                <button 
                  onClick={() => { setSelectedBook(null); setViewerZoom(1); setViewerDarkMode(false); }} 
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors ml-1"
                  title={translations.close[lang]}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className={`flex-1 relative w-full h-full overflow-hidden ${viewerDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <div 
                className="absolute inset-0 w-full h-full transition-transform duration-300 origin-top"
                style={{ 
                  transform: `scale(${viewerZoom})`,
                  filter: viewerDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none'
                }}
              >
                <iframe 
                  src={getPreviewUrl(selectedBook.driveUrl)} 
                  className="w-full h-full border-0"
                  allow="autoplay"
                  title="Book Viewer"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View / Detailed Info Modal */}
      {quickViewBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Left: Image */}
            <div className="w-full md:w-2/5 bg-slate-100 relative min-h-[250px] md:min-h-full flex items-center justify-center p-6 border-r border-slate-100">
              {quickViewBook.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={quickViewBook.coverImage} 
                  alt={quickViewBook.title}
                  className="w-full h-auto max-h-[300px] md:max-h-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <ImageIcon className="w-24 h-24 text-slate-300" />
              )}
            </div>

            {/* Right: Content */}
            <div className="w-full md:w-3/5 flex flex-col bg-white overflow-y-auto">
              <div className="p-6 md:p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase tracking-wider border border-amber-200/50">
                    {quickViewBook.category || 'KITOB'}
                  </span>
                  <button 
                    onClick={() => setQuickViewBook(null)} 
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors -mr-2 -mt-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                  {quickViewBook.title}
                </h2>
                
                <p className="text-lg text-slate-600 mb-6 font-medium">
                  {quickViewBook.author || 'Noma\'lum muallif'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{translations.yearLabel?.[lang] || "Nashr yili:"}</p>
                    <p className="font-semibold text-slate-800">{quickViewBook.publicationYear || '2023'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{translations.pagesLabel?.[lang] || "Sahifalar soni:"}</p>
                    <p className="font-semibold text-slate-800">{quickViewBook.pageCount || '150'} {lang === 'uz' ? 'bet' : 'стр.'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">{translations.annotationLabel?.[lang] || "Annotatsiya:"}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {quickViewBook.annotation || translations.desc[lang]}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex gap-4 mt-auto shrink-0">
                <button 
                  onClick={() => {
                    handleRead(quickViewBook);
                    setQuickViewBook(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/30"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>{translations.readBook?.[lang] || "O'qish"}</span>
                </button>
                <button 
                  onClick={() => handleDownload(quickViewBook.driveUrl)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>{translations.downloadFull[lang]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
