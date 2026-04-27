import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { useStore } from '../../store/useStore';
import { getRecommendations } from '../../services/api';
import ActivityCard from '../../components/ActivityCard';
import { UI_TEXT } from '../../constants/translations';
import { Sparkles, BarChart3, Info } from 'lucide-react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);

const { width } = Dimensions.get('window');

export default function RecommendationsScreen() {
  const { recommendations, user, loading, setRecommendations, setLoading } =
    useStore();

  useEffect(() => {
    async function load() {
      if (!user) return;

      setLoading(true);
      try {
        const data = await getRecommendations(user.id);
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  if (loading && recommendations.length === 0) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <StyledText className="text-gray-500 mt-4 font-medium">Sana özel aktiviteler hazırlanıyor...</StyledText>
      </StyledView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Background Gradient */}
      <StyledView className="relative">
        <LinearGradient
          colors={['#0284c7', '#0369a1']}
          className="px-6 pt-12 pb-24 rounded-b-[40px]"
        >
          <StyledView className="flex-row items-center gap-3">
            <Sparkles size={28} color="white" />
            <StyledText className="text-white text-3xl font-extrabold">Sana Özel</StyledText>
          </StyledView>
          <StyledText className="text-blue-100 mt-2 text-base font-medium">
            Profiline ve tercihlerine en uygun {recommendations.length} aktivite bulundu.
          </StyledText>
        </LinearGradient>

        {/* Stats Card (Floating) */}
        <StyledView 
          className="absolute -bottom-12 left-6 right-6 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200 border border-gray-50 flex-row justify-around"
        >
          <StyledView className="items-center">
            <StyledText className="text-gray-400 text-[10px] font-bold uppercase mb-1">Mükemmel</StyledText>
            <StyledText className="text-primary-600 text-xl font-extrabold">
              {recommendations.filter(r => (r.match_result?.score || 0) >= 0.8).length}
            </StyledText>
          </StyledView>
          <StyledView className="w-[1px] h-full bg-gray-100" />
          <StyledView className="items-center">
            <StyledText className="text-gray-400 text-[10px] font-bold uppercase mb-1">İyi Eşleşme</StyledText>
            <StyledText className="text-green-600 text-xl font-extrabold">
              {recommendations.filter(r => (r.match_result?.score || 0) >= 0.5 && (r.match_result?.score || 0) < 0.8).length}
            </StyledText>
          </StyledView>
          <StyledView className="w-[1px] h-full bg-gray-100" />
          <StyledView className="items-center">
            <StyledText className="text-gray-400 text-[10px] font-bold uppercase mb-1">Ortalama</StyledText>
            <StyledText className="text-orange-500 text-xl font-extrabold">
              {recommendations.filter(r => (r.match_result?.score || 0) < 0.5).length}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* List */}
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ActivityCard activity={item} showMatchScore={true} />
        )}
        ListHeaderComponent={
          <StyledView className="flex-row items-center gap-2 mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <Info size={16} color="#0369a1" />
            <StyledText className="text-blue-800 text-xs font-medium flex-1">
              Eşleşme puanı, ilgi alanların ve rekabet seviyen dikkate alınarak hesaplanmıştır.
            </StyledText>
          </StyledView>
        }
        ListEmptyComponent={
          <StyledView className="items-center justify-center mt-20">
            <StyledView className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <BarChart3 size={32} color="#94a3b8" />
            </StyledView>
            <StyledText className="text-gray-500 text-lg font-bold">Öneri Bulunamadı</StyledText>
            <StyledText className="text-gray-400 text-sm mt-2">Daha fazla aktivite keşfetmeyi dene!</StyledText>
          </StyledView>
        }
      />
    </SafeAreaView>
  );
}
