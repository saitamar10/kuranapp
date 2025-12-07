import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { BookMarked, ChevronRight } from 'lucide-react-native';

interface SurahCardProps {
  name: string;
  arabicName: string;
  verseCount: number;
  description: string;
  onPress?: () => void;
}

export function SurahCard({ name, arabicName, verseCount, description, onPress }: SurahCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card className="bg-[#2D5F4F]">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-xl bg-[#A8D5BA]/20 items-center justify-center mr-4">
              <BookMarked size={24} color="#D4AF37" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white mb-1">Günün Suresi</Text>
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-[#D4AF37] mr-2">{name}</Text>
                <Text className="text-lg text-[#A8D5BA]">{arabicName}</Text>
              </View>
            </View>
          </View>
          <ChevronRight size={24} color="#A8D5BA" />
        </View>
        
        <View className="mt-4 pt-4 border-t border-[#A8D5BA]/30">
          <Text className="text-sm text-[#A8D5BA] mb-1">{verseCount} Ayet</Text>
          <Text className="text-sm text-white/80">{description}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
