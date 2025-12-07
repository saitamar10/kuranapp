import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { 
  Bell, 
  Moon, 
  Type, 
  Globe, 
  Info, 
  ChevronRight,
  Volume2,
  MapPin,
  Clock,
  X,
  Search,
  Navigation,
  ChevronLeft,
  Locate
} from 'lucide-react-native';
import { turkishCities, calculateQiblaDirection } from '@/data/quranData';
import * as Location from 'expo-location';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

function SettingItem({ icon, title, subtitle, rightElement, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View className="flex-row items-center py-4 border-b border-[#2D7A5E]/20">
        <View className="w-10 h-10 rounded-full bg-[#1B4D3E]/10 items-center justify-center mr-4">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
        </View>
        {rightElement || <ChevronRight size={20} color="#C9A227" />}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [prayerAlerts, setPrayerAlerts] = useState(true);
  const [selectedCity, setSelectedCity] = useState(turkishCities.find(c => c.name === 'İstanbul') || turkishCities[0]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [qiblaDirection, setQiblaDirection] = useState(0);

  const filteredCities = turkishCities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  useEffect(() => {
    const direction = calculateQiblaDirection(selectedCity.lat, selectedCity.lng);
    setQiblaDirection(direction);
  }, [selectedCity]);

  const CityModal = () => (
    <Modal
      visible={showCityModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-[#F8F6F0]">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowCityModal(false)}>
            <X size={24} color="#1B4D3E" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Şehir Seç</Text>
          <View className="w-6" />
        </View>

        <View className="px-4 py-3">
          <View className="flex-row items-center bg-white rounded-xl px-3 py-2 shadow-sm">
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
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`p-4 mb-2 rounded-xl ${selectedCity.id === item.id ? 'bg-[#1B4D3E]' : 'bg-white'}`}
              onPress={() => {
                setSelectedCity(item);
                setShowCityModal(false);
                setCitySearch('');
              }}
            >
              <View className="flex-row items-center">
                <MapPin size={20} color={selectedCity.id === item.id ? 'white' : '#1B4D3E'} />
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
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-1">Ayarlar</Text>
        <Text className="text-sm text-[#1B4D3E]">Uygulama tercihlerinizi yönetin</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Görünüm</Text>
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <SettingItem
            icon={<Moon size={20} color="#1B4D3E" />}
            title="Karanlık Mod"
            subtitle="Gece okuma için göz dostu tema"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#C9A227' }}
                thumbColor={darkMode ? '#1B4D3E' : '#9CA3AF'}
              />
            }
          />
          <SettingItem
            icon={<Type size={20} color="#1B4D3E" />}
            title="Yazı Boyutu"
            subtitle="Orta"
          />
          <SettingItem
            icon={<Globe size={20} color="#1B4D3E" />}
            title="Dil"
            subtitle="Türkçe"
          />
        </View>

        {/* Notifications Section */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Bildirimler</Text>
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <SettingItem
            icon={<Bell size={20} color="#1B4D3E" />}
            title="Bildirimler"
            subtitle="Tüm bildirimleri aç/kapat"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E7EB', true: '#C9A227' }}
                thumbColor={notifications ? '#1B4D3E' : '#9CA3AF'}
              />
            }
          />
          <SettingItem
            icon={<Clock size={20} color="#1B4D3E" />}
            title="Ezan Vakti Uyarıları"
            subtitle="Her namaz vaktinde bildirim al"
            rightElement={
              <Switch
                value={prayerAlerts}
                onValueChange={setPrayerAlerts}
                trackColor={{ false: '#E5E7EB', true: '#C9A227' }}
                thumbColor={prayerAlerts ? '#1B4D3E' : '#9CA3AF'}
              />
            }
          />
          <SettingItem
            icon={<Volume2 size={20} color="#1B4D3E" />}
            title="Ezan Sesi"
            subtitle="Varsayılan"
          />
        </View>

        {/* Location Section */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Konum</Text>
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <SettingItem
            icon={<MapPin size={20} color="#1B4D3E" />}
            title="Şehir"
            subtitle={`${selectedCity.name}, Türkiye`}
            onPress={() => setShowCityModal(true)}
          />
        </View>

        {/* About Section */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Hakkında</Text>
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <SettingItem
            icon={<Info size={20} color="#1B4D3E" />}
            title="Uygulama Hakkında"
            subtitle="Versiyon 1.0.0"
          />
        </View>

        {/* App Info */}
        <View className="items-center py-6">
          <View className="w-16 h-16 rounded-2xl bg-[#1B4D3E] items-center justify-center mb-3">
            <Text className="text-2xl">☪</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800">Kuran Uygulaması</Text>
          <Text className="text-sm text-gray-500 mt-1">Manevi rehberiniz</Text>
        </View>
      </ScrollView>

      <CityModal />
    </SafeAreaView>
  );
}
