import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  dailyDua, 
  defaultPrayerTimes,
  fetchPrayerTimes,
  getCurrentPrayer, 
  getTimeUntilNextPrayer,
  hijriDate,
  lastReadPosition,
} from '@/data/mockData';
import { turkishCities } from '@/data/quranData';
import { Moon, Sun, Sunset, Sunrise, Clock, MapPin, BookOpen, Headphones, ChevronRight, Play, Bell, X, Search } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(turkishCities.find(c => c.name === 'İstanbul') || turkishCities[0]);
  const [citySearch, setCitySearch] = useState('');
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(defaultPrayerTimes);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(true);
  const [currentPrayerData, setCurrentPrayerData] = useState(getCurrentPrayer(defaultPrayerTimes));
  const [timeUntilNext, setTimeUntilNext] = useState(getTimeUntilNextPrayer(defaultPrayerTimes));

  const filteredCities = turkishCities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    loadPrayerTimes();
  }, [selectedCity]);

  // Update time until next prayer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrayerData(getCurrentPrayer(prayerTimes));
      setTimeUntilNext(getTimeUntilNextPrayer(prayerTimes));
    }, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const loadPrayerTimes = async () => {
    setIsLoadingPrayers(true);
    try {
      const times = await fetchPrayerTimes(selectedCity.lat, selectedCity.lng);
      setPrayerTimes(times);
      setCurrentPrayerData(getCurrentPrayer(times));
      setTimeUntilNext(getTimeUntilNextPrayer(times));
    } catch (error) {
      console.error('Error loading prayer times:', error);
    } finally {
      setIsLoadingPrayers(false);
    }
  };

  const checkFirstLaunch = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('selectedCity');
      if (!savedCity) {
        setIsFirstLaunch(true);
        setShowCityModal(true);
      } else {
        const city = turkishCities.find(c => c.name === savedCity);
        if (city) setSelectedCity(city);
      }
    } catch {
      setIsFirstLaunch(true);
      setShowCityModal(true);
    }
  };

  const handleCitySelect = async (city: typeof turkishCities[0]) => {
    setSelectedCity(city);
    setShowCityModal(false);
    setCitySearch('');
    setIsFirstLaunch(false);
    try {
      await AsyncStorage.setItem('selectedCity', city.name);
    } catch {}
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Hayırlı Geceler';
    if (hour < 12) return 'Hayırlı Sabahlar';
    if (hour < 18) return 'Hayırlı Günler';
    return 'Hayırlı Akşamlar';
  };

  const getPrayerIcon = (icon: string, isActive: boolean) => {
    const color = isActive ? '#FFFFFF' : '#065F46';
    const size = 20;
    switch (icon) {
      case 'moon': return <Moon size={size} color={color} />;
      case 'sunrise': return <Sunrise size={size} color={color} />;
      case 'sunset': return <Sunset size={size} color={color} />;
      default: return <Sun size={size} color={color} />;
    }
  };

  const CitySelectionModal = () => (
    <Modal
      visible={showCityModal}
      animationType="slide"
      presentationStyle={isFirstLaunch ? "fullScreen" : "pageSheet"}
    >
      <SafeAreaView className="flex-1 bg-[#F8F6F0]">
        {isFirstLaunch ? (
          <View className="px-5 pt-10 pb-6 bg-[#065F46]">
            <Text className="text-3xl font-bold text-white mb-2">Hoş Geldiniz! 🌙</Text>
            <Text className="text-white/80 text-base">
              Namaz vakitlerini ve kıble yönünü doğru hesaplayabilmemiz için şehrinizi seçin.
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowCityModal(false)}>
              <X size={24} color="#1B4D3E" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Şehir Seç</Text>
            <View className="w-6" />
          </View>
        )}

        <View className="px-4 py-3">
          <View className="flex-row items-center bg-white rounded-xl px-3 py-3 shadow-sm">
            <Search size={18} color="#1B4D3E" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Şehir ara..."
              placeholderTextColor="#9CA3AF"
              value={citySearch}
              onChangeText={setCitySearch}
            />
            {citySearch.length > 0 && (
              <TouchableOpacity onPress={() => setCitySearch('')}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`p-4 mb-2 rounded-xl ${selectedCity.id === item.id ? 'bg-[#065F46]' : 'bg-white'}`}
              onPress={() => handleCitySelect(item)}
            >
              <View className="flex-row items-center">
                <MapPin size={20} color={selectedCity.id === item.id ? 'white' : '#065F46'} />
                <Text className={`ml-3 text-base font-medium ${selectedCity.id === item.id ? 'text-white' : 'text-gray-800'}`}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAF8]">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View className="bg-[#065F46] px-5 pt-4 pb-32">
          {/* Top Bar */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-emerald-200 text-sm">{hijriDate.formatted}</Text>
              <Text className="text-white text-2xl font-bold mt-1">{getGreeting()}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                <Bell size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center bg-white/10 px-3 py-2 rounded-full"
                onPress={() => setShowCityModal(true)}
              >
                <MapPin size={14} color="#34D399" />
                <Text className="text-white text-sm ml-1">{selectedCity.name}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content - Overlapping Cards */}
        <View className="px-5 -mt-24">
          {/* Next Prayer Card */}
          <View>
            <View className="bg-white rounded-3xl p-5 shadow-xl shadow-black/10 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center">
                    <Clock size={24} color="#065F46" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-gray-500 text-sm">Sonraki Namaz</Text>
                    <Text className="text-[#065F46] text-xl font-bold">{currentPrayerData.next?.name || 'İkindi'}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-[#065F46] text-3xl font-bold">{currentPrayerData.next?.time || '14:24'}</Text>
                  <View className="bg-amber-100 px-2 py-1 rounded-full mt-1">
                    <Text className="text-amber-700 text-xs font-medium">{timeUntilNext.hours}s {timeUntilNext.minutes}dk</Text>
                  </View>
                </View>
              </View>

              {/* Prayer Times Grid */}
              {isLoadingPrayers ? (
                <View className="bg-gray-50 rounded-2xl p-6 items-center justify-center">
                  <ActivityIndicator size="small" color="#065F46" />
                  <Text className="text-gray-500 text-xs mt-2">Namaz vakitleri yükleniyor...</Text>
                </View>
              ) : (
                <View className="flex-row justify-between bg-gray-50 rounded-2xl p-3">
                  {prayerTimes.map((prayer, index) => {
                    const isNext = index === currentPrayerData.nextIndex;
                    return (
                      <View 
                        key={prayer.id} 
                        className={`items-center px-2 py-2 rounded-xl flex-1 ${isNext ? 'bg-[#065F46]' : ''}`}
                      >
                        {getPrayerIcon(prayer.icon, isNext)}
                        <Text className={`text-[10px] mt-1 ${isNext ? 'text-emerald-200' : 'text-gray-400'}`}>
                          {prayer.name}
                        </Text>
                        <Text className={`text-xs font-bold ${isNext ? 'text-white' : 'text-[#065F46]'}`}>
                          {prayer.time}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Günün Ayeti Card */}
          <View>
            <View className="bg-[#065F46] rounded-3xl p-5 mb-4 overflow-hidden">
              {/* Decorative circles */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
              <View className="absolute -bottom-20 -left-10 w-32 h-32 bg-white/5 rounded-full" />
              
              <View className="flex-row items-center mb-4">
                <Text className="text-2xl mr-2">📿</Text>
                <Text className="text-emerald-200 font-medium">Günün Duası</Text>
              </View>
              
              <Text className="text-white text-2xl text-right leading-[45px] mb-4" style={{ fontFamily: 'serif' }}>
                {dailyDua.arabic}
              </Text>
              
              <View className="h-px bg-white/20 my-3" />
              
              <Text className="text-white/90 text-base leading-6">
                "{dailyDua.turkish}"
              </Text>
              
              <View className="flex-row items-center justify-between mt-4">
                <Text className="text-emerald-300 text-sm">{dailyDua.source}</Text>
                <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full">
                  <Text className="text-white text-sm font-medium">Paylaş</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Continue Reading */}
          <View>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/(tabs)/quran', params: { mode: 'reading' } })}
              className="bg-white rounded-3xl p-5 shadow-lg shadow-black/5 mb-4"
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl items-center justify-center" style={{ backgroundColor: '#065F46' }}>
                  <BookOpen size={32} color="white" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-gray-400 text-sm">Kaldığın Yerden Devam Et</Text>
                  <Text className="text-[#065F46] text-xl font-bold">{lastReadPosition.surahName} Suresi</Text>
                  <Text className="text-gray-500 text-sm">{lastReadPosition.verseNumber}. Ayet</Text>
                </View>
                <View className="w-12 h-12 bg-amber-400 rounded-full items-center justify-center">
                  <ChevronRight size={24} color="#065F46" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions Grid */}
          <View className="mb-4">
            <Text className="text-[#065F46] font-bold text-lg mb-3">Keşfet</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => router.push({ pathname: '/(tabs)/quran', params: { mode: 'reading' } })}
              >
                <View className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center mb-3">
                  <BookOpen size={24} color="#065F46" />
                </View>
                <Text className="text-[#065F46] font-bold">Kuran Oku</Text>
                <Text className="text-gray-400 text-xs mt-1">114 Sure</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => router.push({ pathname: '/(tabs)/quran', params: { mode: 'reciters' } })}
              >
                <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mb-3">
                  <Headphones size={24} color="#B45309" />
                </View>
                <Text className="text-[#065F46] font-bold">Dinle</Text>
                <Text className="text-gray-400 text-xs mt-1">Hafızlar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => router.push('/(tabs)/meal')}
              >
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mb-3">
                  <Text className="text-xl">📖</Text>
                </View>
                <Text className="text-[#065F46] font-bold">Meal</Text>
                <Text className="text-gray-400 text-xs mt-1">Türkçe</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Listen to Reciters */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#065F46] font-bold text-lg">Hafızlardan Dinle</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/quran', params: { mode: 'reciters' } })}>
                <Text className="text-emerald-600 font-medium">Tümü</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="bg-[#F59E0B] rounded-2xl p-4 flex-row items-center"
              onPress={() => router.push({ pathname: '/(tabs)/quran', params: { mode: 'reciters' } })}
            >
              <View className="w-14 h-14 bg-white/30 rounded-2xl items-center justify-center mr-4">
                <Play size={28} color="white" fill="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Kuran-ı Kerim Dinle</Text>
                <Text className="text-white/80 text-sm">Dünyaca ünlü hafızlardan</Text>
              </View>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <ChevronRight size={20} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <CitySelectionModal />
    </SafeAreaView>
  );
}
