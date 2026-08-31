"use client";

import { useState } from "react";
import { Plus, X, Trash2, ExternalLink, Image as ImageIcon, Book, User, Tag, Link as LinkIcon, Save, Edit3, Calendar, FileText, AlignLeft } from "lucide-react";
import toast from "react-hot-toast";
import { addLibraryBook, deleteLibraryBook, updateLibraryBook } from "@/app/actions/library";
import { useLanguage } from "@/lib/i18n";

interface LibraryBook {
  id: string;
  title: string;
  author: string | null;
  coverImage: string | null;
  driveUrl: string;
  category: string | null;
  publicationYear?: number | null;
  pageCount?: number | null;
  annotation?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function LibraryClient({ initialBooks }: { initialBooks: LibraryBook[] }) {
  const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    coverImage: "",
    driveUrl: "",
    publicationYear: "",
    pageCount: "",
    annotation: ""
  });

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ title: "", author: "", category: "", coverImage: "", driveUrl: "", publicationYear: "", pageCount: "", annotation: "" });
    setIsModalOpen(true);
  };
  
  const handleEditClick = (book: LibraryBook) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author || "",
      category: book.category || "",
      coverImage: book.coverImage || "",
      driveUrl: book.driveUrl,
      publicationYear: book.publicationYear ? String(book.publicationYear) : "",
      pageCount: book.pageCount ? String(book.pageCount) : "",
      annotation: book.annotation || ""
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", author: "", category: "", coverImage: "", driveUrl: "", publicationYear: "", pageCount: "", annotation: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.driveUrl) {
      toast.error("Sarlavha va Drive URL kiritilishi shart!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await updateLibraryBook(editingId, formData);
        if (res.success) {
          setBooks(books.map(b => b.id === editingId ? res.book : b));
          toast.success("Kitob muvaffaqiyatli saqlandi");
          handleCloseModal();
        } else {
          toast.error("Kitobni tahrirlashda xatolik yuz berdi");
        }
      } else {
        const res = await addLibraryBook(formData);
        if (res.success) {
          setBooks([res.book, ...books]);
          toast.success("Kitob muvaffaqiyatli saqlandi");
          handleCloseModal();
        } else {
          toast.error("Kitob qo'shishda xatolik yuz berdi");
        }
      }
    } catch (error) {
      toast.error("Tizim xatosi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    setIsSubmitting(true);
    try {
      const res = await deleteLibraryBook(deleteConfirmId);
      if (res.success) {
        setBooks(books.filter(b => b.id !== deleteConfirmId));
        toast.success("Muvaffaqiyatli o'chirildi");
        setDeleteConfirmId(null);
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Tizim xatosi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Elektron Kutubxona</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kitoblar va o'quv qo'llanmalarini boshqarish</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Kitob qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white/50 dark:bg-[#111827]/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Book className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Kitoblar topilmadi</h3>
            <p className="text-slate-500 mt-1">Yangi kitob qo'shish uchun yuqoridagi tugmani bosing</p>
          </div>
        ) : (
          books.map(book => (
            <div key={book.id} className="bg-white dark:bg-[#111827]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="aspect-[3/4] relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={book.driveUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 dark:bg-slate-800/90 hover:text-blue-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors text-slate-700 dark:text-slate-300">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleEditClick(book)} className="p-2 bg-white/90 dark:bg-slate-800/90 hover:text-blue-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors text-slate-700 dark:text-slate-300">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirmDelete(book.id)} className="p-2 bg-white/90 dark:bg-slate-800/90 hover:text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors text-slate-700 dark:text-slate-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{book.title}</h3>
                {book.author && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{book.author}</p>}
                {book.category && (
                  <div className="mt-3 mt-auto pt-3 flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                      {book.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? "Kitobni tahrirlash" : "Yangi kitob qo'shish"}</h3>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Sarlavha *</label>
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="Kitob nomini kiriting"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Muallif</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="Muallif ismini kiriting"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Kategoriya</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="Kategoriyani kiriting (Masalan: IT, Tarix...)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nashr yili</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({...formData, publicationYear: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="Masalan: 2023"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Sahifalar soni</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    value={formData.pageCount}
                    onChange={(e) => setFormData({...formData, pageCount: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="Masalan: 250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Muqova rasmi (URL)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="url" 
                    value={formData.coverImage}
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Drive Havolasi (URL) *</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    type="url" 
                    value={formData.driveUrl}
                    onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Annotatsiya</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea 
                    value={formData.annotation}
                    onChange={(e) => setFormData({...formData, annotation: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white text-sm min-h-[100px] resize-y"
                    placeholder="Kitob haqida qisqacha ma'lumot..."
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800/50 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">O'chirishni tasdiqlaysizmi?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Rostdan ham ushbu kitobni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-70 flex-1"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 flex-1 shadow-sm shadow-red-500/20"
              >
                {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
