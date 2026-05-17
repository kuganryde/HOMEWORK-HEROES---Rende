
export interface Festival {
  name: string;
  startDate: string; // MM-DD
  endDate: string;   // MM-DD
  themeColor: string; // Tailwind color class or hex
  accentColor: string;
  icon: string; // Emoji or Lucide icon name
  message: string;
}

export const FESTIVALS: Festival[] = [
  {
    name: "Chinese New Year",
    startDate: "01-28",
    endDate: "02-05",
    themeColor: "bg-red-600",
    accentColor: "text-yellow-400",
    icon: "🧧",
    message: "Gong Xi Fa Cai!"
  },
  {
    name: "Thaipusam",
    startDate: "02-10",
    endDate: "02-15",
    themeColor: "bg-yellow-500",
    accentColor: "text-orange-600",
    icon: "🔱",
    message: "Happy Thaipusam!"
  },
  {
    name: "Hari Raya Aidilfitri",
    startDate: "03-25",
    endDate: "04-05",
    themeColor: "bg-emerald-600",
    accentColor: "text-yellow-300",
    icon: "🌙",
    message: "Selamat Hari Raya Aidilfitri!"
  },
  {
    name: "Wesak Day",
    startDate: "05-10",
    endDate: "05-15",
    themeColor: "bg-orange-500",
    accentColor: "text-yellow-200",
    icon: "☸️",
    message: "Happy Wesak Day!"
  },
  {
    name: "Agong's Birthday",
    startDate: "06-01",
    endDate: "06-05",
    themeColor: "bg-yellow-600",
    accentColor: "text-slate-900",
    icon: "👑",
    message: "Daulat Tuanku!"
  },
  {
    name: "Hari Raya Haji",
    startDate: "06-15",
    endDate: "06-20",
    themeColor: "bg-green-700",
    accentColor: "text-white",
    icon: "🕋",
    message: "Selamat Hari Raya Aidiladha!"
  },
  {
    name: "Awal Muharram",
    startDate: "07-05",
    endDate: "07-10",
    themeColor: "bg-emerald-800",
    accentColor: "text-yellow-100",
    icon: "🕌",
    message: "Selamat Tahun Baru Hijrah!"
  },
  {
    name: "Merdeka Day",
    startDate: "08-25",
    endDate: "09-05",
    themeColor: "bg-blue-700",
    accentColor: "text-red-500",
    icon: "🇲🇾",
    message: "Selamat Hari Kebangsaan!"
  },
  {
    name: "Malaysia Day",
    startDate: "09-10",
    endDate: "09-20",
    themeColor: "bg-blue-800",
    accentColor: "text-yellow-500",
    icon: "🤝",
    message: "Selamat Hari Malaysia!"
  },
  {
    name: "Deepavali",
    startDate: "10-15",
    endDate: "10-25",
    themeColor: "bg-orange-600",
    accentColor: "text-yellow-400",
    icon: "🪔",
    message: "Happy Deepavali!"
  },
  {
    name: "Christmas",
    startDate: "12-15",
    endDate: "12-31",
    themeColor: "bg-red-700",
    accentColor: "text-green-400",
    icon: "🎄",
    message: "Merry Christmas!"
  }
];

export const getCurrentFestival = (date: Date = new Date()): Festival | null => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const currentMD = `${month}-${day}`;

  return FESTIVALS.find(f => {
    if (f.startDate <= f.endDate) {
      return currentMD >= f.startDate && currentMD <= f.endDate;
    } else {
      // Handles year wrap if needed (e.g. Dec 25 - Jan 5)
      return currentMD >= f.startDate || currentMD <= f.endDate;
    }
  }) || null;
};
