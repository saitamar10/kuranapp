// Mock data for the Quran application

export const dailyDua = {
  id: 1,
  arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
  turkish: 'Rabbimiz! Bizden kabul buyur. Şüphesiz sen hakkıyla işitensin, hakkıyla bilensin.',
  source: 'Bakara Suresi - 2:127',
};

// Hocalar / Kariler
export const reciters = [
  {
    id: 1,
    name: 'Abdurrahman es-Sudeys',
    title: 'Mekke İmamı',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    surahCount: 114,
    followers: '2.5M',
  },
  {
    id: 2,
    name: 'Mishary Rashid Alafasy',
    title: 'Kuveyt Karisi',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    surahCount: 114,
    followers: '3.1M',
  },
  {
    id: 3,
    name: 'Abdul Basit Abdus Samad',
    title: 'Mısır Karisi',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    surahCount: 114,
    followers: '1.8M',
  },
  {
    id: 4,
    name: 'Maher Al Muaiqly',
    title: 'Medine İmamı',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    surahCount: 114,
    followers: '2.2M',
  },
  {
    id: 5,
    name: 'Saad Al Ghamdi',
    title: 'Suudi Arabistan Karisi',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    surahCount: 114,
    followers: '1.5M',
  },
];

// Popüler Sureler
export const popularSurahs = [
  { id: 1, name: 'Fatiha', arabicName: 'الفاتحة', verseCount: 7, duration: '1:23' },
  { id: 36, name: 'Yasin', arabicName: 'يس', verseCount: 83, duration: '23:45' },
  { id: 55, name: 'Rahman', arabicName: 'الرحمن', verseCount: 78, duration: '12:30' },
  { id: 67, name: 'Mülk', arabicName: 'الملك', verseCount: 30, duration: '8:15' },
  { id: 112, name: 'İhlas', arabicName: 'الإخلاص', verseCount: 4, duration: '0:45' },
];

export const dailySurah = {
  id: 36,
  name: 'Yasin',
  arabicName: 'يس',
  verseCount: 83,
  description: 'Kuran\'ın kalbi olarak bilinen sure',
};

// Yasin Suresi tüm ayetleri
export const yasinSurah = {
  id: 36,
  name: 'Yasin',
  arabicName: 'يس',
  verseCount: 83,
  type: 'Mekki',
  verses: [
    { number: 1, arabic: 'يس', turkish: 'Yâ Sîn.' },
    { number: 2, arabic: 'وَالْقُرْآنِ الْحَكِيمِ', turkish: 'Hikmet dolu Kur\'an\'a andolsun ki,' },
    { number: 3, arabic: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ', turkish: 'Sen elbette gönderilen peygamberlerdensin.' },
    { number: 4, arabic: 'عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ', turkish: 'Dosdoğru bir yol üzerindesin.' },
    { number: 5, arabic: 'تَنزِيلَ الْعَزِيزِ الرَّحِيمِ', turkish: 'Bu Kur\'an, mutlak güç sahibi, çok merhametli Allah\'ın indirmesidir.' },
    { number: 6, arabic: 'لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ', turkish: 'Ataları uyarılmamış, bu yüzden kendileri de gaflet içinde olan bir kavmi uyarman için indirilmiştir.' },
    { number: 7, arabic: 'لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ', turkish: 'Andolsun, onların çoğu üzerine söz hak olmuştur. Artık onlar iman etmezler.' },
    { number: 8, arabic: 'إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُم مُّقْمَحُونَ', turkish: 'Biz onların boyunlarına halkalar geçirdik. O halkalar çenelere kadar dayanmaktadır. Bu yüzden kafaları yukarı kalkıktır.' },
    { number: 9, arabic: 'وَجَعَلْنَا مِن بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ', turkish: 'Önlerine bir set, arkalarına da bir set çektik. Böylece onları sardık, artık göremezler.' },
    { number: 10, arabic: 'وَسَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ', turkish: 'Onları uyarsan da, uyarmasan da onlar için birdir, inanmazlar.' },
    { number: 11, arabic: 'إِنَّمَا تُنذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ بِالْغَيْبِ', turkish: 'Sen ancak Kur\'an\'a uyan ve görmeden Rahman\'dan korkan kimseyi uyarırsın.' },
    { number: 12, arabic: 'إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ', turkish: 'Şüphesiz biz ölüleri diriltiriz. Onların yaptıklarını ve bıraktıkları eserleri yazarız.' },
    { number: 13, arabic: 'وَاضْرِبْ لَهُم مَّثَلًا أَصْحَابَ الْقَرْيَةِ إِذْ جَاءَهَا الْمُرْسَلُونَ', turkish: 'Onlara o şehir halkını örnek ver. Hani oraya elçiler gelmişti.' },
    { number: 14, arabic: 'إِذْ أَرْسَلْنَا إِلَيْهِمُ اثْنَيْنِ فَكَذَّبُوهُمَا فَعَزَّزْنَا بِثَالِثٍ', turkish: 'Hani biz onlara iki elçi göndermiştik de onları yalanlamışlardı. Bunun üzerine üçüncü bir elçi ile destekledik.' },
    { number: 15, arabic: 'قَالُوا مَا أَنتُمْ إِلَّا بَشَرٌ مِّثْلُنَا', turkish: 'Dediler ki: Siz de ancak bizim gibi insansınız.' },
    { number: 16, arabic: 'قَالُوا رَبُّنَا يَعْلَمُ إِنَّا إِلَيْكُمْ لَمُرْسَلُونَ', turkish: 'Elçiler dediler ki: Rabbimiz biliyor, biz gerçekten size gönderilmiş elçileriz.' },
    { number: 17, arabic: 'وَمَا عَلَيْنَا إِلَّا الْبَلَاغُ الْمُبِينُ', turkish: 'Bize düşen sadece apaçık tebliğdir.' },
    { number: 18, arabic: 'قَالُوا إِنَّا تَطَيَّرْنَا بِكُمْ', turkish: 'Dediler ki: Doğrusu biz sizin yüzünüzden uğursuzluğa uğradık.' },
    { number: 19, arabic: 'قَالُوا طَائِرُكُم مَّعَكُمْ', turkish: 'Elçiler dediler ki: Uğursuzluğunuz kendinizdendir.' },
    { number: 20, arabic: 'وَجَاءَ مِنْ أَقْصَى الْمَدِينَةِ رَجُلٌ يَسْعَىٰ', turkish: 'Şehrin en uzak yerinden bir adam koşarak geldi.' },
  ],
};

export const lastReadPosition = {
  surahId: 36,
  surahName: 'Yasin',
  verseNumber: 5,
  timestamp: new Date().toISOString(),
};

// Default prayer times (will be replaced by API data)
export const defaultPrayerTimes = [
  { id: 'imsak', name: 'İmsak', time: '04:30', icon: 'moon', type: 'imsak' },
  { id: 'gunes', name: 'Güneş', time: '06:00', icon: 'sunrise', type: 'gunes' },
  { id: 'ogle', name: 'Öğle', time: '13:00', icon: 'sun', type: 'ogle' },
  { id: 'ikindi', name: 'İkindi', time: '16:30', icon: 'sun', type: 'ikindi' },
  { id: 'aksam', name: 'Akşam', time: '19:30', icon: 'sunset', type: 'aksam' },
  { id: 'yatsi', name: 'Yatsı', time: '21:00', icon: 'moon', type: 'yatsi' },
];

export let prayerTimes = [...defaultPrayerTimes];

// Fetch prayer times from Aladhan API
export const fetchPrayerTimes = async (lat: number, lng: number): Promise<typeof defaultPrayerTimes> => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=13&school=1`
    );
    
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    const timings = data.data.timings;
    
    const newPrayerTimes = [
      { id: 'imsak', name: 'İmsak', time: timings.Fajr, icon: 'moon', type: 'imsak' },
      { id: 'gunes', name: 'Güneş', time: timings.Sunrise, icon: 'sunrise', type: 'gunes' },
      { id: 'ogle', name: 'Öğle', time: timings.Dhuhr, icon: 'sun', type: 'ogle' },
      { id: 'ikindi', name: 'İkindi', time: timings.Asr, icon: 'sun', type: 'ikindi' },
      { id: 'aksam', name: 'Akşam', time: timings.Maghrib, icon: 'sunset', type: 'aksam' },
      { id: 'yatsi', name: 'Yatsı', time: timings.Isha, icon: 'moon', type: 'yatsi' },
    ];
    
    prayerTimes = newPrayerTimes;
    return newPrayerTimes;
  } catch (error) {
    console.error('Prayer times fetch error:', error);
    return defaultPrayerTimes;
  }
};

export const iftarTime = {
  time: '19:30',
  remaining: { hours: 6, minutes: 45 },
};

export const getCurrentPrayer = (times?: typeof defaultPrayerTimes) => {
  const currentTimes = times || prayerTimes;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (let i = currentTimes.length - 1; i >= 0; i--) {
    const [hours, minutes] = currentTimes[i].time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    if (currentTime >= prayerMinutes) {
      return {
        current: currentTimes[i],
        next: currentTimes[(i + 1) % currentTimes.length],
        nextIndex: (i + 1) % currentTimes.length,
      };
    }
  }
  
  return {
    current: currentTimes[currentTimes.length - 1],
    next: currentTimes[0],
    nextIndex: 0,
  };
};

export const getTimeUntilNextPrayer = (times?: typeof defaultPrayerTimes) => {
  const { next } = getCurrentPrayer(times);
  const now = new Date();
  const [hours, minutes] = next.time.split(':').map(Number);
  
  let targetDate = new Date();
  targetDate.setHours(hours, minutes, 0, 0);
  
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  const diff = targetDate.getTime() - now.getTime();
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours: diffHours, minutes: diffMinutes };
};

export const categories = [
  { id: 1, name: 'Namaz Vakitleri', icon: 'clock', color: '#6366F1' },
  { id: 2, name: 'Cami Bul', icon: 'building', color: '#8B5CF6' },
  { id: 3, name: 'Kuran-ı Kerim', icon: 'book', color: '#10B981' },
];

export const hijriDate = {
  day: 13,
  month: 'Şaban',
  year: 1446,
  formatted: '13 Şaban 1446',
};
