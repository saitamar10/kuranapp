import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, FlatList, Modal, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Languages, BookOpen, ChevronDown, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { yasinSurah } from '@/data/mockData';
import { allSurahs, fatihaSurah, rahmanSurah, mulkSurah } from '@/data/quranData';

const surahDataMap: { [key: number]: typeof yasinSurah } = {
  1: fatihaSurah,
  36: yasinSurah,
  55: rahmanSurah,
  67: mulkSurah,
};

export default function MealScreen() {
  const [showArabic, setShowArabic] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState(yasinSurah);
  const [lastReadVerse, setLastReadVerse] = useState(1);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = allSurahs.filter(surah => 
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arabicName.includes(searchQuery) ||
    surah.id.toString() === searchQuery
  );

  // Load last read position
  useEffect(() => {
    loadLastRead();
  }, []);

  const loadLastRead = async () => {
    try {
      const saved = await AsyncStorage.getItem('lastReadMeal');
      if (saved) {
        const data = JSON.parse(saved);
        setLastReadVerse(data.verseNumber || 1);
      }
    } catch (e) {
      console.log('Error loading last read:', e);
    }
  };

  const saveLastRead = async (verseNumber: number) => {
    try {
      await AsyncStorage.setItem('lastReadMeal', JSON.stringify({
        surahId: selectedSurah.id,
        surahName: selectedSurah.name,
        verseNumber,
        timestamp: new Date().toISOString(),
      }));
      setLastReadVerse(verseNumber);
    } catch (e) {
      console.log('Error saving last read:', e);
    }
  };

  const selectSurah = (surah: typeof allSurahs[0]) => {
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
    setLastReadVerse(1);
    setShowSurahPicker(false);
    setSearchQuery('');
  };

  const SurahPickerModal = () => (
    <Modal
      visible={showSurahPicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-[#F8F6F0]">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowSurahPicker(false)}>
            <X size={24} color="#1B4D3E" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Sure Seç</Text>
          <View className="w-6" />
        </View>

        <View className="px-4 py-3">
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`p-4 mb-2 rounded-xl ${selectedSurah.id === item.id ? 'bg-[#1B4D3E]' : 'bg-white'}`}
              onPress={() => selectSurah(item)}
            >
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${selectedSurah.id === item.id ? 'bg-white/20' : 'bg-[#1B4D3E]'}`}>
                  <Text className={`font-bold ${selectedSurah.id === item.id ? 'text-white' : 'text-white'}`}>{item.id}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${selectedSurah.id === item.id ? 'text-white' : 'text-gray-800'}`}>
                    {item.name}
                  </Text>
                  <Text className={`text-xs ${selectedSurah.id === item.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {item.verseCount} Ayet • {item.type}
                  </Text>
                </View>
                <Text className={`text-lg ${selectedSurah.id === item.id ? 'text-white' : 'text-[#1B4D3E]'}`}>
                  {item.arabicName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Türkçe Meal</Text>
            <Text className="text-sm text-[#1B4D3E]">Diyanet İşleri Başkanlığı Meali</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-[#1B4D3E] rounded-full items-center justify-center">
            <Bookmark size={20} color="#C9A227" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Last Read Position */}
      {lastReadVerse > 1 && (
        <View className="px-5 mb-4">
          <TouchableOpacity 
            className="bg-[#1B4D3E] rounded-2xl p-4"
            onPress={() => {
              // Scroll to last read verse
            }}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                <BookmarkCheck size={20} color="#C9A227" />
              </View>
              <View className="flex-1">
                <Text className="text-white/80 text-sm">Kaldığın Yer</Text>
                <Text className="text-white font-bold">{selectedSurah.name} - {lastReadVerse}. Ayet</Text>
              </View>
              <ChevronRight size={24} color="#C9A227" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Surah Selector */}
      <View className="px-5 mb-4">
        <TouchableOpacity 
          className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm"
          onPress={() => setShowSurahPicker(!showSurahPicker)}
        >
          <View className="flex-row items-center">
            <BookOpen size={20} color="#1B4D3E" />
            <Text className="ml-3 text-gray-800 font-semibold">{selectedSurah.name} Suresi</Text>
            <Text className="ml-2 text-[#1B4D3E]">{selectedSurah.arabicName}</Text>
          </View>
          <ChevronDown size={20} color="#1B4D3E" />
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View className="px-5 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Languages size={20} color="#1B4D3E" />
              <Text className="ml-3 text-gray-800 font-medium">Arapça Metni Göster</Text>
            </View>
            <Switch
              value={showArabic}
              onValueChange={setShowArabic}
              trackColor={{ false: '#E5E7EB', true: '#C9A227' }}
              thumbColor={showArabic ? '#1B4D3E' : '#9CA3AF'}
            />
          </View>
        </View>
      </View>

      {/* Verses */}
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {selectedSurah.verses.map((verse) => (
          <TouchableOpacity 
            key={verse.number} 
            activeOpacity={0.9}
            onPress={() => saveLastRead(verse.number)}
          >
            <View className={`bg-white rounded-2xl p-4 mb-3 shadow-sm ${lastReadVerse === verse.number ? 'border-2 border-[#1B4D3E]' : ''}`}>
              <View className="flex-row items-start">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 mt-1 ${lastReadVerse === verse.number ? 'bg-[#1B4D3E]' : 'bg-[#1B4D3E]/10'}`}>
                  <Text className={`text-sm font-bold ${lastReadVerse === verse.number ? 'text-white' : 'text-[#1B4D3E]'}`}>{verse.number}</Text>
                </View>
                <View className="flex-1">
                  {showArabic && (
                    <>
                      <Text className="text-xl text-gray-800 text-right leading-10 mb-3" style={{ fontFamily: 'serif' }}>
                        {verse.arabic}
                      </Text>
                      <View className="h-px bg-[#2D7A5E] mb-3" />
                    </>
                  )}
                  <Text className="text-base text-gray-600 leading-6">
                    {verse.turkish}
                  </Text>
                </View>
              </View>
              {/* Bookmark indicator */}
              {lastReadVerse === verse.number && (
                <View className="absolute right-3 top-3">
                  <BookmarkCheck size={18} color="#1B4D3E" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SurahPickerModal />
    </SafeAreaView>
  );
}
