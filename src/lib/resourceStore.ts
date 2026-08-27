import fs from 'fs';
import path from 'path';

export interface GlobalResource {
  id: string;
  title: string;
  description: string;
  type: string; // 'video' | 'link'
  url: string;
  category: string;
  visibility?: 'GLOBAL' | 'RESTRICTED';
  departmentIds?: string[];
  teacherIds?: string[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'resources.json');

// Ensure data directory and file exist
function initStore() {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(dataFilePath)) {
    const initialData: GlobalResource[] = [
      {
        id: "1",
        title: "Oliy matematika asoslari",
        description: "Matematika kafedrasi uchun mo'ljallangan video darslik. Limit va hosila tushunchalari.",
        type: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        category: "Video Dars",
      },
      {
        id: "2",
        title: "Fizika qonuniyatlari: Klassik mexanika",
        description: "Klassik mexanika va termodinamika bo'yicha vizual tajribalar va misollar.",
        type: "video",
        url: "https://www.youtube.com/embed/tgbNymZ7vqY",
        category: "Video Dars",
      },
      {
        id: "3",
        title: "Moodle Platformasi",
        description: "Universitetning asosiy masofaviy ta'lim tizimi. Talabalar va o'qituvchilar uchun.",
        type: "link",
        url: "https://moodle.org",
        category: "Foydali Link",
      }
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function getResources(): GlobalResource[] {
  initStore();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data) as GlobalResource[];
  } catch (error) {
    console.error("Failed to read or parse resources.json:", error);
    return [];
  }
}

export function addResource(resource: Omit<GlobalResource, 'id'>): GlobalResource {
  const resources = getResources();
  const newResource: GlobalResource = {
    ...resource,
    id: Date.now().toString(),
  };
  resources.unshift(newResource);
  fs.writeFileSync(dataFilePath, JSON.stringify(resources, null, 2), 'utf-8');
  return newResource;
}

export function updateResource(id: string, updatedData: Partial<GlobalResource>): GlobalResource | null {
  const resources = getResources();
  const index = resources.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  resources[index] = { ...resources[index], ...updatedData };
  fs.writeFileSync(dataFilePath, JSON.stringify(resources, null, 2), 'utf-8');
  return resources[index];
}

export function deleteResource(id: string): boolean {
  let resources = getResources();
  const initialLength = resources.length;
  resources = resources.filter(r => r.id !== id);
  if (resources.length !== initialLength) {
    fs.writeFileSync(dataFilePath, JSON.stringify(resources, null, 2), 'utf-8');
    return true;
  }
  return false;
}
