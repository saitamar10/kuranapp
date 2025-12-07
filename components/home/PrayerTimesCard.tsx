import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Clock, Moon, Sun, Sunrise, Sunset } from 'lucide-react-native';

interface PrayerTime {
  id: string;
  name: string;
  time: string;
  icon: string;
}

interface PrayerTimesCardProps {
  prayerTimes: PrayerTime[];
  nextPrayerIndex: number;
  timeUntilNext: { hours: number; minutes: number };
}

const IconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  moon: Moon,
  sun: Sun,
  sunrise: Sunrise,
  sunset: Sunset,
};

export function PrayerTimesCard({ prayerTimes, nextPrayerIndex, timeUntilNext }: PrayerTimesCardProps) {
  return (
    <Card className="bg-white">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-[#2D5F4F] items-center justify-center mr-3">
            <Clock size={20} color="#D4AF37" />
          </View>
          <Text className="text-lg font-semibold text-[#2D5F4F]">Namaz Vakitleri</Text>
        </View>
        <View className="bg-[#D4AF37]/20 px-3 py-1 rounded-full">
          <Text className="text-xs text-[#D4AF37] font-medium">
            {timeUntilNext.hours}s {timeUntilNext.minutes}dk
          </Text>
        </View>
      </View>
      
      <View className="flex-row flex-wrap">
        {prayerTimes.map((prayer, index) => {
          const IconComponent = IconMap[prayer.icon] || Sun;
          const isNext = index === nextPrayerIndex;
          
          return (
            <View 
              key={prayer.id} 
              className={`w-1/3 p-2 ${isNext ? 'bg-[#2D5F4F] rounded-xl' : ''}`}
            >
              <View className="items-center">
                <IconComponent 
                  size={18} 
                  color={isNext ? '#D4AF37' : '#2D5F4F'} 
                />
                <Text className={`text-xs mt-1 ${isNext ? 'text-[#A8D5BA]' : 'text-gray-500'}`}>
                  {prayer.name}
                </Text>
                <Text className={`text-base font-mono font-semibold mt-1 ${isNext ? 'text-white' : 'text-[#2D5F4F]'}`}>
                  {prayer.time}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
