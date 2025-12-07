import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, FlatList, Alert, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BookOpen, Bookmark, Search, Play, Pause, ChevronRight, ChevronLeft, SkipBack, SkipForward, Heart, X, Headphones, Compass, MapPin, Navigation, Music } from 'lucide-react-native';
import { yasinSurah, lastReadPosition, reciters } from '@/data/mockData';
import { allSurahs, fatihaSurah, rahmanSurah, mulkSurah, reciterAudioUrls, turkishCities, calculateQiblaDirection } from '@/data/quranData';
import { Audio } from 'expo-av';

type ViewMode = 'home' | 'reading' | 'reciters' | 'surahList' | 'reciterSurahs' | 'player';

const surahDataMap: { [key: number]: typeof yasinSurah } = {
  1: fatihaSurah,
  36: yasinSurah,
  55: rahmanSurah,
  67: mulkSurah,
};

export default function QuranScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedSurah, setSelectedSurah] = useState(yasinSurah);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQiblaModal, setShowQiblaModal] = useState(false);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [selectedCity, setSelectedCity] = useState(turkishCities.find(c => c.name === 'İstanbul') || turkishCities[0]);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(35); // Yasin default

  useEffect(() => {
    if (params.mode === 'reading') {
      setViewMode('reading');
    } else if (params.mode === 'reciters') {
      setViewMode('reciters');
    }
  }, [params.mode]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Kıble için basit hesaplama
  useEffect(() => {
    if (showQiblaModal) {
      const direction = calculateQiblaDirection(selectedCity.lat, selectedCity.lng);
      setQiblaDirection(direction);
    }
  }, [showQiblaModal, selectedCity]);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        setIsLoading(false);
        return;
      }

      const audioUrl = reciterAudioUrls[selectedReciter.id]?.[selectedSurah.id];
      if (!audioUrl) {
        Alert.alert('Uyarı', 'Bu sure için ses dosyası bulunamadı.');
        setIsLoading(false);
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            // Sure bitti, sonraki sureye geç
            goToNextSurah();
          }
        }
      });
    } catch (error) {
      Alert.alert('Hata', 'Ses dosyası yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  };

  const goToNextSurah = async () => {
    await stopAudio();
    const nextIndex = currentSurahIndex + 1;
    if (nextIndex < allSurahs.length) {
      setCurrentSurahIndex(nextIndex);
      selectSurah(allSurahs[nextIndex], true);
    } else {
      setIsPlaying(false);
    }
  };

  const goToPrevSurah = async () => {
    await stopAudio();
    const prevIndex = currentSurahIndex - 1;
    if (prevIndex >= 0) {
      setCurrentSurahIndex(prevIndex);
      selectSurah(allSurahs[prevIndex], true);
    }
  };

  const selectSurah = (surah: typeof allSurahs[0], listen: boolean = false) => {
    stopAudio();
    const surahData = surahDataMap[surah.id];
    if (surahData) {
      setSelectedSurah(surahData);
    } else {
      setSelectedSurah({
        ...yasinSurah,
        id: surah.id,
        name: surah.name,
        arabicName: surah.arabicName,
        verseCount: surah.verseCount,
        type: surah.type,
        verses: [
          { number: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', turkish: 'Rahman ve Rahim olan Allah\'ın adıyla.' },
        ],
      });
    }
    setCurrentVerseIndex(0);
    setCurrentSurahIndex(allSurahs.findIndex(s => s.id === surah.id));
    
    if (listen) {
      setViewMode('player');
      setTimeout(() => playAudio(), 500);
    } else {
      setViewMode('reading');
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSurahs = allSurahs.filter(surah => 
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arabicName.includes(searchQuery) ||
    surah.id.toString() === searchQuery
  );

  // Kıble Bulucu Modal
  const QiblaModal = () => (
    <Modal
      visible={showQiblaModal}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView className="flex-1 bg-[#1B4D3E]">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => setShowQiblaModal(false)} className="p-2">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white">Kıble Bulucu</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="w-72 h-72 rounded-full bg-white/10 items-center justify-center mb-8">
            <View
              style={{
                width: 256,
                height: 256,
                borderRadius: 128,
                backgroundColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View className="absolute top-2">
                <Text className="text-white font-bold text-lg">K</Text>
              </View>
              <View className="absolute bottom-2">
                <Text className="text-white/60 font-bold text-lg">G</Text>
              </View>
              <View className="absolute left-2">
                <Text className="text-white/60 font-bold text-lg">B</Text>
              </View>
              <View className="absolute right-2">
                <Text className="text-white/60 font-bold text-lg">D</Text>
              </View>

              <View
                style={{
                  position: 'absolute',
                  transform: [{ rotate: `${qiblaDirection}deg` }],
                }}
              >
                <View className="items-center">
                  <View className="w-1 h-24 bg-[#C9A227] rounded-full" />
                  <View 
                    style={{
                      position: 'absolute',
                      top: -10,
                      width: 0,
                      height: 0,
                      borderLeftWidth: 10,
                      borderRightWidth: 10,
                      borderBottomWidth: 20,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderBottomColor: '#C9A227',
                    }}
                  />
                </View>
              </View>

              <View className="w-16 h-16 bg-[#C9A227] rounded-lg items-center justify-center">
                <Text className="text-2xl">🕋</Text>
              </View>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-white/80 text-base mb-2">Kıble Yönü</Text>
            <Text className="text-white text-4xl font-bold mb-4">{Math.round(qiblaDirection)}°</Text>
            
            <View className="bg-white/10 rounded-2xl p-4 w-full">
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#C9A227" />
                <Text className="text-white ml-2">{selectedCity.name}, Türkiye</Text>
              </View>
              <View className="flex-row items-center">
                <Navigation size={16} color="#C9A227" />
                <Text className="text-white/70 ml-2 text-sm">
                  Kabe: Mekke, Suudi Arabistan
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-white/60 text-center text-sm mt-6 px-4">
            Kıble yönü şehrinize göre hesaplanmıştır
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Player View - Müzik Çalar Tarzı
  const PlayerView = () => (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#1B4D3E] to-[#0d2820]">
      <View className="flex-1 bg-[#1B4D3E]">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <TouchableOpacity onPress={() => { stopAudio(); setViewMode('home'); }} className="p-2">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white/60 text-xs">ŞİMDİ ÇALIYOR</Text>
            <Text className="text-white font-semibold text-sm">{selectedReciter.name}</Text>
          </View>
          <TouchableOpacity className="p-2" onPress={() => setViewMode('reading')}>
            <BookOpen size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Album Art / Surah Info */}
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-64 h-64 bg-white/10 rounded-3xl items-center justify-center mb-6 shadow-2xl">
            <Text className="text-6xl text-white mb-2" style={{ fontFamily: 'serif' }}>
              {selectedSurah.arabicName}
            </Text>
            <Text className="text-white/80 text-xl font-semibold">{selectedSurah.name}</Text>
            <Text className="text-white/60 text-sm mt-1">{selectedSurah.verseCount} Ayet • {selectedSurah.type}</Text>
          </View>

          {/* Sure Info */}
          <Text className="text-white text-2xl font-bold mb-1">{selectedSurah.name} Suresi</Text>
          <Text className="text-white/70 text-base mb-6">{selectedReciter.name}</Text>
        </View>

        {/* Progress Bar */}
        <View className="px-8 mb-4">
          <View className="h-1 bg-white/20 rounded-full">
            <View 
              className="h-1 bg-[#C9A227] rounded-full" 
              style={{ width: playbackDuration > 0 ? `${(playbackPosition / playbackDuration) * 100}%` : '0%' }} 
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white/60 text-xs">{formatTime(playbackPosition)}</Text>
            <Text className="text-white/60 text-xs">{formatTime(playbackDuration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center gap-6 mb-8 px-8">
          <TouchableOpacity 
            className="w-14 h-14 items-center justify-center"
            onPress={goToPrevSurah}
            disabled={currentSurahIndex === 0}
          >
            <SkipBack size={28} color={currentSurahIndex === 0 ? '#666' : 'white'} fill={currentSurahIndex === 0 ? '#666' : 'white'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-lg"
            onPress={playAudio}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text className="text-[#1B4D3E] text-lg">...</Text>
            ) : isPlaying ? (
              <Pause size={36} color="#1B4D3E" fill="#1B4D3E" />
            ) : (
              <Play size={36} color="#1B4D3E" fill="#1B4D3E" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-14 h-14 items-center justify-center"
            onPress={goToNextSurah}
            disabled={currentSurahIndex >= allSurahs.length - 1}
          >
            <SkipForward size={28} color={currentSurahIndex >= allSurahs.length - 1 ? '#666' : 'white'} fill={currentSurahIndex >= allSurahs.length - 1 ? '#666' : 'white'} />
          </TouchableOpacity>
        </View>

        {/* Sureleri Oku Butonu */}
        <View className="px-8 mb-6">
          <TouchableOpacity 
            className="bg-white/20 rounded-xl py-3 flex-row items-center justify-center"
            onPress={() => setViewMode('reading')}
          >
            <BookOpen size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Sureyi Oku (Arapça + Meal)</Text>
          </TouchableOpacity>
        </View>

        {/* Next/Prev Surah Info */}
        <View className="flex-row justify-between px-8 pb-6">
          {currentSurahIndex > 0 && (
            <TouchableOpacity onPress={goToPrevSurah} className="flex-row items-center">
              <ChevronLeft size={16} color="#C9A227" />
              <Text className="text-[#C9A227] text-xs ml-1">{allSurahs[currentSurahIndex - 1]?.name}</Text>
            </TouchableOpacity>
          )}
          <View className="flex-1" />
          {currentSurahIndex < allSurahs.length - 1 && (
            <TouchableOpacity onPress={goToNextSurah} className="flex-row items-center">
              <Text className="text-[#C9A227] text-xs mr-1">{allSurahs[currentSurahIndex + 1]?.name}</Text>
              <ChevronRight size={16} color="#C9A227" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );

  // Reading View - Arapça ve Türkçe Meal Yan Yana
  const ReadingView = () => (
    <SafeAreaView className="flex-1 bg-[#1a1a2e]">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
        <TouchableOpacity onPress={() => { stopAudio(); setViewMode('home'); }} className="p-2">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="items-center flex-1">
          <Text className="text-white/60 text-xs">AYET {currentVerseIndex + 1} / {selectedSurah.verses.length}</Text>
          <Text className="text-white font-semibold text-sm">{selectedSurah.name} Suresi</Text>
        </View>
        <TouchableOpacity className="p-2" onPress={() => setViewMode('player')}>
          <Music size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-[#1B4D3E] rounded-2xl p-4 mb-4 items-center">
          <Text className="text-4xl text-white mb-1" style={{ fontFamily: 'serif' }}>
            {selectedSurah.arabicName}
          </Text>
          <Text className="text-white/80 text-base">{selectedSurah.name} Suresi</Text>
          <Text className="text-white/60 text-xs mt-1">{selectedSurah.verseCount} Ayet • {selectedSurah.type}</Text>
          
          {/* Dinle Butonu */}
          <TouchableOpacity 
            className="bg-white/20 rounded-xl py-2 px-4 mt-3 flex-row items-center"
            onPress={() => {
              setViewMode('player');
              setTimeout(() => playAudio(), 300);
            }}
          >
            <Play size={16} color="white" fill="white" />
            <Text className="text-white font-medium ml-2 text-sm">Dinle</Text>
          </TouchableOpacity>
        </View>

        {/* Tüm Ayetler - Arapça ve Türkçe Yan Yana */}
        {selectedSurah.verses.map((verse, index) => (
          <TouchableOpacity 
            key={verse.number}
            onPress={() => setCurrentVerseIndex(index)}
            className={`rounded-2xl p-4 mb-3 ${currentVerseIndex === index ? 'bg-[#1B4D3E]' : 'bg-[#252542]'}`}
          >
            {/* Ayet Numarası */}
            <View className="flex-row items-center mb-3">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${currentVerseIndex === index ? 'bg-white/20' : 'bg-[#1B4D3E]'}`}>
                <Text className="text-white text-xs font-bold">{verse.number}</Text>
              </View>
              {currentVerseIndex === index && (
                <View className="bg-[#C9A227] px-2 py-1 rounded-full ml-2">
                  <Text className="text-white text-[10px]">Seçili</Text>
                </View>
              )}
            </View>
            
            {/* Arapça Metin */}
            <Text className="text-xl text-white text-right leading-[36px] mb-3" style={{ fontFamily: 'serif' }}>
              {verse.arabic}
            </Text>
            
            {/* Ayırıcı Çizgi */}
            <View className="h-px bg-white/10 mb-3" />
            
            {/* Türkçe Meal */}
            <Text className="text-white/80 text-sm leading-6">
              {verse.turkish}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View className="h-32" />
      </ScrollView>

      {/* Alt Navigasyon */}
      <View className="bg-[#252542] px-4 py-3 border-t border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center py-2"
            onPress={() => setCurrentVerseIndex(Math.max(0, currentVerseIndex - 1))}
            disabled={currentVerseIndex === 0}
          >
            <ChevronLeft size={18} color={currentVerseIndex === 0 ? '#666' : '#C9A227'} />
            <Text className={`ml-1 font-medium text-sm ${currentVerseIndex === 0 ? 'text-gray-600' : 'text-[#C9A227]'}`}>Önceki Ayet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-12 h-12 bg-[#1B4D3E] rounded-full items-center justify-center mx-4"
            onPress={() => {
              setViewMode('player');
              setTimeout(() => playAudio(), 300);
            }}
          >
            <Play size={20} color="white" fill="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center py-2"
            onPress={() => setCurrentVerseIndex(Math.min(selectedSurah.verses.length - 1, currentVerseIndex + 1))}
          >
            <Text className="text-white font-medium text-sm mr-1">Sonraki Ayet</Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // Surah List View
  const SurahListView = () => (
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => setViewMode('home')} className="mr-3 p-1">
          <ChevronLeft size={24} color="#1B4D3E" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">Tüm Sureler</Text>
          <Text className="text-xs text-[#1B4D3E]">114 Sure</Text>
        </View>
      </View>

      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 shadow-sm">
          <Search size={18} color="#1B4D3E" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Sure ara..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white rounded-xl p-3 mb-2 shadow-sm"
            onPress={() => selectSurah(item, false)}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-lg bg-[#1B4D3E] items-center justify-center mr-3">
                <Text className="text-white font-bold text-sm">{item.id}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
                  <Text className="text-lg text-[#1B4D3E]">{item.arabicName}</Text>
                </View>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-[10px] text-gray-500">{item.verseCount} Ayet</Text>
                  <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
                  <Text className="text-[10px] text-[#2D7A5E]">{item.type}</Text>
                </View>
              </View>
              <View className="flex-row ml-2">
                <TouchableOpacity 
                  className="w-9 h-9 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-1"
                  onPress={() => selectSurah(item, false)}
                >
                  <BookOpen size={14} color="#1B4D3E" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="w-9 h-9 bg-[#1B4D3E] rounded-full items-center justify-center"
                  onPress={() => selectSurah(item, true)}
                >
                  <Play size={14} color="white" fill="white" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );

  // Reciter Surahs View
  const ReciterSurahsView = () => (
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => setViewMode('reciters')} className="mr-3 p-1">
          <ChevronLeft size={24} color="#1B4D3E" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">{selectedReciter.name}</Text>
          <Text className="text-xs text-[#1B4D3E]">{selectedReciter.title}</Text>
        </View>
      </View>

      <View className="px-4 mb-4">
        <View className="bg-[#1B4D3E] rounded-2xl p-4 flex-row items-center">
          <View className="w-16 h-16 rounded-xl mr-3 bg-white/20 items-center justify-center">
            <Text className="text-white font-bold text-2xl">{selectedReciter.name.charAt(0)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{selectedReciter.name}</Text>
            <Text className="text-white/70 text-sm">{selectedReciter.title}</Text>
            <View className="flex-row items-center mt-1">
              <Heart size={12} color="#C9A227" fill="#C9A227" />
              <Text className="text-white/80 text-xs ml-1">{selectedReciter.followers} takipçi</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 shadow-sm">
          <Search size={18} color="#1B4D3E" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Sure ara..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text className="px-4 text-base font-semibold text-gray-800 mb-2">Sureler</Text>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white rounded-xl p-3 mb-2 shadow-sm"
            onPress={() => selectSurah(item, true)}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-lg bg-[#1B4D3E] items-center justify-center mr-3">
                <Text className="text-white font-bold text-sm">{item.id}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
                  <Text className="text-lg text-[#1B4D3E]">{item.arabicName}</Text>
                </View>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-[10px] text-gray-500">{item.verseCount} Ayet</Text>
                  <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
                  <Text className="text-[10px] text-[#2D7A5E]">{item.type}</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="w-9 h-9 bg-[#1B4D3E] rounded-full items-center justify-center ml-2"
                onPress={() => selectSurah(item, true)}
              >
                <Play size={16} color="white" fill="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );

  // Reciters View
  const RecitersView = () => (
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => setViewMode('home')} className="mr-3 p-1">
          <ChevronLeft size={24} color="#1B4D3E" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">Hocalardan Dinle</Text>
          <Text className="text-xs text-[#1B4D3E]">Ünlü karilerden Kuran dinleyin</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 mb-4">
          <View className="bg-[#1B4D3E] rounded-2xl p-4">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-xl mr-3 bg-white/20 items-center justify-center">
                <Text className="text-white font-bold text-xl">{reciters[0].name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/80 text-xs">Öne Çıkan Kari</Text>
                <Text className="text-white font-bold text-lg">{reciters[0].name}</Text>
                <Text className="text-white/70 text-xs">{reciters[0].title}</Text>
                <View className="flex-row items-center mt-1">
                  <Heart size={12} color="#C9A227" fill="#C9A227" />
                  <Text className="text-white/80 text-xs ml-1">{reciters[0].followers} takipçi</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              className="bg-white/20 rounded-xl py-2.5 mt-3 flex-row items-center justify-center"
              onPress={() => {
                setSelectedReciter(reciters[0]);
                setSearchQuery('');
                setViewMode('reciterSurahs');
              }}
            >
              <BookOpen size={18} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">Sureleri Görüntüle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Tüm Kariler</Text>
          {reciters.map((reciter) => (
            <TouchableOpacity 
              key={reciter.id}
              className="bg-white rounded-xl p-3 mb-2 shadow-sm flex-row items-center"
              onPress={() => {
                setSelectedReciter(reciter);
                setSearchQuery('');
                setViewMode('reciterSurahs');
              }}
            >
              <View className="w-12 h-12 rounded-lg mr-3 bg-[#1B4D3E]/10 items-center justify-center">
                <Text className="text-[#1B4D3E] font-bold text-lg">{reciter.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">{reciter.name}</Text>
                <Text className="text-[#1B4D3E] text-xs">{reciter.title}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-gray-500 text-[10px]">{reciter.surahCount} Sure</Text>
                  <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
                  <Text className="text-gray-500 text-[10px]">{reciter.followers} takipçi</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#1B4D3E" />
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );

  // Home View
  const HomeView = () => (
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-800">Kuran-ı Kerim</Text>
            <Text className="text-xs text-[#1B4D3E]">Oku • Dinle • Anla</Text>
          </View>
          <TouchableOpacity 
            className="w-9 h-9 bg-[#1B4D3E] rounded-full items-center justify-center"
            onPress={() => setViewMode('surahList')}
          >
            <Search size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Kıble Bulucu */}
        <View className="px-4 mb-3">
          <TouchableOpacity 
            className="bg-[#1B4D3E] rounded-xl p-4 flex-row items-center"
            onPress={() => setShowQiblaModal(true)}
          >
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
              <Compass size={24} color="#C9A227" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Kıble Bulucu</Text>
              <Text className="text-white/70 text-xs">Kıble yönünü bul</Text>
            </View>
            <ChevronRight size={20} color="#C9A227" />
          </TouchableOpacity>
        </View>

        {/* Continue Reading Card */}
        <View className="px-4 mb-3">
          <View className="bg-[#1B4D3E] rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white/80 text-xs mb-0.5">Kaldığın Yerden Devam Et</Text>
                <Text className="text-white font-bold text-lg mb-0.5">
                  {lastReadPosition.surahName} Suresi
                </Text>
                <Text className="text-white/70 text-xs">
                  {lastReadPosition.verseNumber}. Ayet
                </Text>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <BookOpen size={24} color="#C9A227" />
              </View>
            </View>
            <View className="flex-row items-center mt-3 gap-2">
              <TouchableOpacity 
                className="flex-1 bg-white/20 rounded-lg py-2 flex-row items-center justify-center"
                onPress={() => {
                  selectSurah(allSurahs.find(s => s.name === lastReadPosition.surahName) || allSurahs[35], false);
                }}
              >
                <BookOpen size={14} color="white" />
                <Text className="text-white font-medium ml-1.5 text-sm">Oku</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-white rounded-lg py-2 flex-row items-center justify-center"
                onPress={() => {
                  setViewMode('player');
                  setTimeout(() => playAudio(), 500);
                }}
              >
                <Play size={14} color="#1B4D3E" fill="#1B4D3E" />
                <Text className="text-[#1B4D3E] font-medium ml-1.5 text-sm">Dinle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hocalardan Dinle Section */}
        <View className="px-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-gray-800">Hocalardan Dinle</Text>
            <TouchableOpacity onPress={() => setViewMode('reciters')}>
              <Text className="text-[#1B4D3E] font-medium text-sm">Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {reciters.slice(0, 4).map((reciter) => (
                <TouchableOpacity 
                  key={reciter.id}
                  className="bg-white rounded-xl p-2.5 shadow-sm items-center"
                  style={{ width: width * 0.26, minWidth: 90, maxWidth: 110 }}
                  onPress={() => {
                    setSelectedReciter(reciter);
                    setSearchQuery('');
                    setViewMode('reciterSurahs');
                  }}
                >
                  <View className="w-12 h-12 rounded-full mb-1.5 bg-[#1B4D3E]/10 items-center justify-center">
                    <Text className="text-[#1B4D3E] font-bold text-lg">{reciter.name.charAt(0)}</Text>
                  </View>
                  <Text className="text-gray-800 font-medium text-xs text-center" numberOfLines={1}>
                    {reciter.name.split(' ')[0]}
                  </Text>
                  <Text className="text-[#1B4D3E] text-[10px] text-center" numberOfLines={1}>
                    {reciter.title}
                  </Text>
                  <View className="w-7 h-7 bg-[#1B4D3E] rounded-full items-center justify-center mt-1.5">
                    <Headphones size={12} color="white" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tüm Sureler */}
        <View className="px-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-gray-800">Tüm Sureler</Text>
            <TouchableOpacity onPress={() => setViewMode('surahList')}>
              <Text className="text-[#1B4D3E] font-medium text-sm">Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {allSurahs.slice(0, 10).map((surah) => (
            <TouchableOpacity 
              key={surah.id}
              className="bg-white rounded-xl p-3 mb-2 shadow-sm"
              onPress={() => selectSurah(surah, false)}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-lg bg-[#1B4D3E] items-center justify-center mr-3">
                  <Text className="text-white font-bold text-sm">{surah.id}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-gray-800">{surah.name}</Text>
                    <Text className="text-lg text-[#1B4D3E]">{surah.arabicName}</Text>
                  </View>
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-[10px] text-gray-500">{surah.verseCount} Ayet</Text>
                    <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
                    <Text className="text-[10px] text-[#2D7A5E]">{surah.type}</Text>
                  </View>
                </View>
                <View className="flex-row ml-2">
                  <TouchableOpacity 
                    className="w-8 h-8 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-1"
                    onPress={() => selectSurah(surah, false)}
                  >
                    <BookOpen size={14} color="#1B4D3E" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="w-8 h-8 bg-[#1B4D3E] rounded-full items-center justify-center"
                    onPress={() => selectSurah(surah, true)}
                  >
                    <Play size={14} color="white" fill="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tüm Sureler Butonu */}
        <View className="px-4 mb-3">
          <TouchableOpacity 
            className="bg-[#1B4D3E] rounded-xl p-4 flex-row items-center justify-center"
            onPress={() => setViewMode('surahList')}
          >
            <BookOpen size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Tüm 114 Sureyi Görüntüle</Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );

  // Render based on view mode
  if (viewMode === 'reading') return <ReadingView />;
  if (viewMode === 'reciters') return <RecitersView />;
  if (viewMode === 'surahList') return <SurahListView />;
  if (viewMode === 'reciterSurahs') return <ReciterSurahsView />;
  if (viewMode === 'player') return <PlayerView />;
  return (
    <>
      <HomeView />
      <QiblaModal />
    </>
  );
}
