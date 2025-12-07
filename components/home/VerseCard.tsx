import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Sparkles, ChevronRight } from 'lucide-react-native';

interface VerseCardProps {
  surahName: string;
  verseNumber: number;
  arabic: string;
  turkish: string;
  name?: string;
  onPress?: () => void;
}

export function VerseCard({ surahName, verseNumber, arabic, turkish, name, onPress }: VerseCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card className="bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#D4AF37]/20 items-center justify-center mr-3">
              <Sparkles size={20} color="#D4AF37" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-[#2D5F4F]">Günün Ayeti</Text>
              {name && <Text className="text-sm text-[#D4AF37]">{name}</Text>}
            </View>
          </View>
          <View className="bg-[#A8D5BA]/30 px-3 py-1 rounded-full">
            <Text className="text-xs text-[#2D5F4F]">{surahName} {verseNumber}</Text>
          </View>
        </View>
        
        <Text className="text-xl text-[#2D5F4F] text-right mb-4 leading-10">
          {arabic}
        </Text>
        
        <View className="h-px bg-[#A8D5BA] my-3" />
        
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-gray-700 flex-1 leading-6 mr-2">
            {turkish}
          </Text>
          <ChevronRight size={20} color="#A8D5BA" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
