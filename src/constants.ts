import { UserRole, HomeworkPriority, HomeworkStatus, User, Student, Homework, HomeworkRecord, Developer } from './types';

export const SCHOOL_INFO = (() => {
  const saved = localStorage.getItem('school_info');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse school_info', e);
    }
  }
  return {
    name: "Sekolah Jenis Kebangsaan (Tamil) Bandar Mahkota Cheras",
    shortName: "Homework Hero",
    location: "Bandar Mahkota Cheras, Selangor",
    code: "BBD4065",
    category: "Public Primary School (SJKT)",
    logoUrl: "https://i.ibb.co/Y4WgtYSg/Homework-Hero-App-New-Logo-500-X500.png"
  };
})();

export const MOCK_USERS: User[] = [
  { id: 't1', name: 'Mdm. Kavitha', role: UserRole.TEACHER, email: 'kavitha@sjkbmc.edu.my', classes: ['1 Semmal', '2 Ambal', '3 Mugil'] },
  { id: 'p1', name: 'Mr. Ramesh', role: UserRole.PARENT, email: 'ramesh@email.com' },
];

export const RANKS = [
  { level: 1, name: "Seedling", minXp: 0, icon: "🌱" },
  { level: 2, name: "Sprout", minXp: 100, icon: "🌿" },
  { level: 3, name: "Leaf", minXp: 300, icon: "🍃" },
  { level: 4, name: "Branch", minXp: 600, icon: "🎋" },
  { level: 5, name: "Tree", minXp: 1000, icon: "🌳" },
  { level: 6, name: "Forest", minXp: 1500, icon: "🌲" },
  { level: 7, name: "Mountain", minXp: 2100, icon: "⛰️" },
  { level: 8, name: "Sky", minXp: 2800, icon: "☁️" },
  { level: 9, name: "Galaxy", minXp: 3600, icon: "🌌" },
  { level: 10, name: "Universe", minXp: 4500, icon: "✨" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Aswin Ramesh', parentId: 'p1', class: '1 Semmal', birthday: new Date().toISOString().split('T')[0], xp: 450, rank: 3 },
  { id: 's2', name: 'Divya Kumar', parentId: 'p1', class: '2 Ambal', birthday: '2015-05-15', xp: 1200, rank: 5 },
  { id: 's3', name: 'Logesh Mani', parentId: 'p2', class: '3 Mugil', birthday: '2015-10-10', xp: 50, rank: 1 },
  { id: 's4', name: 'Meena Raj', parentId: 'p3', class: '1 Semmal', birthday: '2015-12-25', xp: 4600, rank: 10 },
  { id: 's5', name: 'Karthik Raja', parentId: 'p1', class: '2 Ambal', birthday: '2015-01-10', xp: 200, rank: 2 },
  { id: 's6', name: 'Sita Devi', parentId: 'p1', class: '3 Mugil', birthday: '2015-03-20', xp: 800, rank: 4 },
  { id: 's7', name: 'Arjun Singh', parentId: 'p1', class: '1 Semmal', birthday: '2015-06-05', xp: 1800, rank: 6 },
  { id: 's8', name: 'Priya Mani', parentId: 'p1', class: '2 Ambal', birthday: '2015-08-12', xp: 2500, rank: 7 },
  { id: 's9', name: 'Vikram Raj', parentId: 'p1', class: '3 Mugil', birthday: '2015-09-30', xp: 3200, rank: 8 },
  { id: 's10', name: 'Anjali Nair', parentId: 'p1', class: '1 Semmal', birthday: '2015-11-18', xp: 4000, rank: 9 },
];

export const MOCK_DEVELOPERS: Developer[] = [
  { name: 'Kishan Prakash', role: 'Lead Architect & Project Manager' },
  { name: 'Dhiiresh Kumar', role: 'Full-Stack Developer' },
  { name: 'Yashveen', role: 'Frontend & UI/UX Specialist' },
  { name: 'Hans Sheena', role: 'Backend & Database Engineer' },
  { name: 'Parisheena', role: 'AI Integration & QA Engineer' },
];

export const VISION_STATEMENT = "To bridge the communication gap between Homework Hero and home environments, ensuring every student has the digital support they need to excel academically and socially.";