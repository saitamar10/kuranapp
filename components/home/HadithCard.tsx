import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { BookOpen } from 'lucide-react-native';

interface HadithCardProps {
  arabic: string;
  turkish: string;
  source: string;
}

export function HadithCard({ arabic, turkish, source }: HadithCardProps) {
  return (
    <Card className="bg-[#F7F3E9]">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-[#2D5F4F] items-center justify-center mr-3">
          <BookOpen size={20} color="#D4AF37" />
        </View>
        <Text className="text-lg font-semibold text-[#2D5F4F]">Günün Hadisi</Text>
      </View>
      
      <Text className="text-xl text-[#2D5F4F] text-right mb-4 leading-10">
        {arabic}
      </Text>
      
      <View className="h-px bg-[#A8D5BA] my-3" />
      
      <Text className="text-base text-gray-700 mb-3 leading-6">
        {turkish}
      </Text>
      
      <Text className="text-sm text-[#D4AF37] italic">
        {source}
      </Text>
    </Card>
  );
}
