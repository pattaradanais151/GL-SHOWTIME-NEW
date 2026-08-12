<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Play, BookmarkPlus, X, Star, ChevronLeft, ChevronRight, Calendar, Clock, UserCircle, Video } from 'lucide-vue-next'

const seriesList = ref([])
const isLoading = ref(true)
const selectedSeries = ref(null)
const isModalOpen = ref(false)

const currentIndex = ref(0)
let slideInterval = null

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('type', 'BL')
      .order('id', { ascending: false })

    if (error) throw error
    if (data) {
      seriesList.value = data
      if (seriesList.value.length > 1) startSlide()
    }
  } catch (error) {
    console.error("Error fetching BL series:", error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  stopSlide()
})

const startSlide = () => {
  slideInterval = setInterval(() => {
    nextSlide()
  }, 6000)
}

const stopSlide = () => {
  if (slideInterval) clearInterval(slideInterval)
}

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % seriesList.value.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + seriesList.value.length) % seriesList.value.length
}

const handleManualSlide = (direction) => {
  stopSlide()
  if (direction === 'next') nextSlide()
  else prevSlide()
  startSlide()
}

const heroSeries = computed(() => {
  return seriesList.value.length > 0 ? seriesList.value[currentIndex.value] : null
})

const getYoutubeId = (url) => {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const getYoutubeThumbnail = (url, type = 'maxres') => {
  const id = getYoutubeId(url)
  if (!id) return 'https://via.placeholder.com/1280x720/1a1a1a/4a4a4a?text=No+Image'
  return type === 'maxres' 
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

const handleImageError = (e, url) => {
  const fallbackUrl = getYoutubeThumbnail(url, 'hq')
  if (e.target.src !== fallbackUrl) {
    e.target.src = fallbackUrl
  }
}

const openDetails = (series) => {
  selectedSeries.value = series
  isModalOpen.value = true
  stopSlide()
}

const closeModal = () => {
  isModalOpen.value = false
  selectedSeries.value = null
  if (seriesList.value.length > 1) startSlide()
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center text-[#00e054]">
      กำลังโหลดข้อมูลจากระบบ...
    </div>

    <div v-else-if="seriesList.length === 0" class="min-h-screen flex items-center justify-center text-gray-500">
      ยังไม่มีข้อมูลซีรีส์ BL ในระบบ
    </div>

    <div v-else>
      <section class="relative w-full h-[85vh] lg:h-[95vh] flex items-center overflow-hidden bg-[#050505]">
        
        <div class="absolute inset-0 w-full h-full z-0">
          <transition name="fade" mode="in-out">
            <img 
              v-if="heroSeries" 
              :key="heroSeries.id" 
              :src="getYoutubeThumbnail(heroSeries.trailer_url, 'maxres')" 
              @error="handleImageError($event, heroSeries.trailer_url)"
              alt="Hero Background" 
              class="absolute inset-0 w-full h-full object-cover"
            />
          </transition>
          <div class="absolute inset-y-0 left-0 w-full md:w-3/4 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent"></div>
          <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        </div>

        <div class="w-full px-6 md:px-16 relative z-10 pt-20">
          <transition name="fade-slide" mode="out-in">
            <div v-if="heroSeries" :key="heroSeries.id" class="max-w-2xl">
              
              <h1 class="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white mb-6 leading-tight drop-shadow-xl" style="font-family: 'Kanit', sans-serif;">
                {{ heroSeries.title }}
              </h1>
              
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <span class="text-[11px] font-bold text-white bg-[#00e054] px-2 py-0.5 rounded-sm uppercase">
                  BL Series
                </span>
                <span v-if="heroSeries.rating" class="text-xs font-bold text-white bg-black/40 border border-white/20 px-2 py-0.5 rounded-sm flex items-center gap-1 backdrop-blur-md">
                  <Star class="w-3 h-3 text-[#00e054] fill-[#00e054]"/> {{ heroSeries.rating }}
                </span>
                <span class="text-xs font-semibold text-gray-200 bg-white/10 px-2 py-0.5 rounded-sm border border-white/10 backdrop-blur-md">
                  {{ heroSeries.air_date }}
                </span>
              </div>
              <div class="text-sm font-medium text-gray-300 mb-6 flex gap-3">
                <span v-for="(genre, index) in (heroSeries.genres || '').split(',')" :key="index">
                  {{ genre.trim() }}
                </span>
              </div>

              <p class="text-gray-200 text-sm md:text-base mb-8 line-clamp-3 md:line-clamp-4 font-light max-w-xl leading-relaxed drop-shadow-md">
                {{ heroSeries.description }}
              </p>

              <div class="flex items-center gap-4">
                <button @click="openDetails(heroSeries)" class="w-14 h-14 bg-[#00e054] hover:bg-[#00c54f] rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,224,84,0.4)]">
                  <Play class="w-6 h-6 text-black fill-black ml-1" />
                </button>
                <button class="w-14 h-14 bg-black/30 hover:bg-black/50 border border-white/30 hover:border-white/60 rounded-full flex items-center justify-center transition-all backdrop-blur-md text-white">
                  <BookmarkPlus class="w-6 h-6" />
                </button>
              </div>
            </div>
          </transition>
        </div>

        <button @click="handleManualSlide('prev')" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors">
          <ChevronLeft class="w-12 h-12 drop-shadow-lg" />
        </button>
        <button @click="handleManualSlide('next')" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors">
          <ChevronRight class="w-12 h-12 drop-shadow-lg" />
        </button>

        <div class="absolute bottom-8 right-12 z-20 flex gap-2">
          <button 
            v-for="(item, index) in seriesList" 
            :key="index"
            @click="() => { stopSlide(); currentIndex = index; startSlide(); }"
            :class="['h-1.5 rounded-full transition-all duration-300', currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70']"
          ></button>
        </div>
      </section>

      <section class="relative z-10 px-6 md:px-12 pb-20 pt-8">
        <h2 class="text-2xl font-bold text-white mb-6">ยอดนิยม (BL)</h2>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          <div 
            v-for="item in seriesList" 
            :key="item.id" 
            @click="openDetails(item)" 
            class="relative rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-2"
          >
            <div class="aspect-video relative bg-gray-900 rounded-lg overflow-hidden">
              <img 
                :src="getYoutubeThumbnail(item.trailer_url, 'hq')" 
                @error="handleImageError($event, item.trailer_url)"
                :alt="item.title" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div class="absolute top-0 right-0 bg-[#00e054] text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                TOP
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-10 h-10 bg-[#00e054] rounded-full flex items-center justify-center shadow-lg">
                  <Play class="w-4 h-4 text-black fill-black ml-0.5" />
                </div>
              </div>
            </div>
            <div class="pt-3">
              <h3 class="text-white font-medium text-sm truncate group-hover:text-[#00e054] transition-colors">{{ item.title }}</h3>
              <p class="text-gray-500 text-xs mt-1 truncate">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal BL -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate__animated animate__fadeIn animate__faster">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative w-full max-w-4xl glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] bg-[#0d0d0d]">
        <button @click="closeModal" class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-blue-600 rounded-full text-white transition-colors backdrop-blur-sm">
          <X class="w-5 h-5" />
        </button>

        <div class="w-full aspect-video bg-black relative">
          <iframe 
            v-if="getYoutubeId(selectedSeries.trailer_url)"
            class="w-full h-full"
            :src="`https://www.youtube.com/embed/${getYoutubeId(selectedSeries.trailer_url)}?autoplay=1`" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>

        <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <h2 class="text-3xl font-bold text-white mb-3">{{ selectedSeries.title }}</h2>
          <div class="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span class="text-[#00e054] font-bold bg-[#00e054]/10 px-2 py-1 rounded">BL Series</span>
            <span class="text-gray-300">{{ selectedSeries.genres }}</span>
            <span class="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              <Star class="w-4 h-4 fill-current"/> {{ selectedSeries.rating }}
            </span>
          </div>
          <p class="text-gray-300 text-sm md:text-base leading-relaxed mb-8">{{ selectedSeries.description }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div class="flex items-start gap-3"><Calendar class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">วันออนแอร์</p><p class="text-white text-sm">{{ selectedSeries.air_date }}</p></div></div>
            <div class="flex items-start gap-3"><Clock class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">เวลาออนแอร์</p><p class="text-white text-sm">{{ selectedSeries.air_time }}</p></div></div>
            <div class="flex items-start gap-3"><UserCircle class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">ผู้กำกับ</p><p class="text-white text-sm">{{ selectedSeries.director }}</p></div></div>
            <div class="flex items-start gap-3"><Video class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">ลิงก์ต้นฉบับ</p><a :href="selectedSeries.trailer_url" target="_blank" class="text-[#00e054] hover:underline text-sm truncate block max-w-[200px]">รับชมบน YouTube</a></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 224, 84, 0.5);
  border-radius: 10px;
}
</style>