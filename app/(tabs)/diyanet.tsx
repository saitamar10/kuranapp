import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, HelpCircle, ChevronRight, Tag } from 'lucide-react-native';

const categories = [
  { id: 1, name: 'Namaz', count: 245, color: '#1B4D3E' },
  { id: 2, name: 'Oruç', count: 128, color: '#8B5CF6' },
  { id: 3, name: 'Zekat', count: 89, color: '#10B981' },
  { id: 4, name: 'Hac', count: 156, color: '#F59E0B' },
  { id: 5, name: 'Aile', count: 312, color: '#EC4899' },
  { id: 6, name: 'Ticaret', count: 178, color: '#14B8A6' },
];

const faqs = [
  {
    id: 1,
    question: 'Namazda sehiv secdesi ne zaman yapılır?',
    category: 'Namaz',
    preview: 'Namazda bir vacibin terk edilmesi veya geciktirilmesi durumunda...',
  },
  {
    id: 2,
    question: 'Oruçluyken diş fırçalamak orucu bozar mı?',
    category: 'Oruç',
    preview: 'Diş fırçalamak orucu bozmaz, ancak macun yutmamaya dikkat edilmelidir...',
  },
  {
    id: 3,
    question: 'Zekat kimlere verilir?',
    category: 'Zekat',
    preview: 'Zekat, Kuran-ı Kerim\'de belirtilen sekiz sınıfa verilir...',
  },
  {
    id: 4,
    question: 'Kadınlar cuma namazı kılabilir mi?',
    category: 'Namaz',
    preview: 'Cuma namazı erkeklere farz olup, kadınlar için farz değildir...',
  },
  {
    id: 5,
    question: 'Faiz haram mıdır?',
    category: 'Ticaret',
    preview: 'Faiz, İslam\'da kesin olarak haram kılınmıştır...',
  },
];

export default function DiyanetScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-[#F8F6F0]">
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-1">Diyanet Soru-Cevap</Text>
        <Text className="text-sm text-[#1B4D3E]">Dini sorularınıza cevaplar</Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Search size={20} color="#1B4D3E" />
          <TextInput
            className="ml-3 flex-1 text-gray-800"
            placeholder="Soru veya konu ara..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View className="px-5 mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Kategoriler</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="rounded-full px-4 py-2 flex-row items-center"
                style={{ backgroundColor: category.color }}
              >
                <Tag size={14} color="white" />
                <Text className="text-white ml-2 font-medium">{category.name}</Text>
                <View className="bg-white/30 rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-xs text-white">{category.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* FAQ List */}
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-lg font-semibold text-gray-800 mb-3">Sık Sorulan Sorular</Text>
        {faqs.map((faq) => (
          <TouchableOpacity key={faq.id} activeOpacity={0.9}>
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-[#1B4D3E]/10 items-center justify-center mr-3">
                  <HelpCircle size={20} color="#1B4D3E" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <View className="bg-[#1B4D3E]/10 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-[#1B4D3E]">{faq.category}</Text>
                    </View>
                  </View>
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {faq.question}
                  </Text>
                  <Text className="text-sm text-gray-500" numberOfLines={2}>
                    {faq.preview}
                  </Text>
                </View>
                <ChevronRight size={20} color="#C9A227" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
