<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabase'
import { Film, Users, FileText, Activity, Clock } from 'lucide-vue-next'

const stats = ref({
  series: 0,
  users: 0,
  logs: 0
})

const recentLogs = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    // นับจำนวน Series
    const { count: seriesCount } = await supabase.from('series').select('*', { count: 'exact', head: true })
    stats.value.series = seriesCount || 0

    // นับจำนวน Profiles
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    stats.value.users = usersCount || 0

    // นับจำนวน Logs
    const { count: logsCount } = await supabase.from('logs').select('*', { count: 'exact', head: true })
    stats.value.logs = logsCount || 0

    // ดึง Log 5 อันล่าสุด
    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      
    if (logsData) recentLogs.value = logsData

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString('th-TH', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="animate__animated animate__fadeIn">
    
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">ภาพรวมระบบ (Overview)</h1>
      <p class="text-gray-400">ยินดีต้อนรับเข้าสู่ระบบจัดการ GL & BL Showtime</p>
    </div>
    
    <!-- Stats Cards (Liquid Glass) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <p class="text-gray-400 text-sm mb-1 font-medium">ซีรีส์ในระบบ</p>
            <h2 class="text-4xl font-extrabold text-white">{{ stats.series }} <span class="text-base font-normal text-gray-500">เรื่อง</span></h2>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Film class="w-7 h-7 text-emerald-400" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <p class="text-gray-400 text-sm mb-1 font-medium">ผู้ใช้งานทั้งหมด</p>
            <h2 class="text-4xl font-extrabold text-white">{{ stats.users }} <span class="text-base font-normal text-gray-500">บัญชี</span></h2>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Users class="w-7 h-7 text-cyan-400" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <p class="text-gray-400 text-sm mb-1 font-medium">บันทึกระบบ (Logs)</p>
            <h2 class="text-4xl font-extrabold text-white">{{ stats.logs }} <span class="text-base font-normal text-gray-500">รายการ</span></h2>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <FileText class="w-7 h-7 text-purple-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="glass-card rounded-2xl p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Activity class="w-5 h-5 text-gray-300" />
        </div>
        <h2 class="text-xl font-bold text-white">ความเคลื่อนไหวล่าสุด</h2>
      </div>

      <div v-if="isLoading" class="py-8 text-center text-gray-500">
        กำลังโหลดประวัติ...
      </div>
      <div v-else-if="recentLogs.length === 0" class="py-8 text-center text-gray-500">
        ยังไม่มีความเคลื่อนไหวในระบบ
      </div>
      <div v-else class="space-y-4">
        <!-- ลูปแสดงประวัติแบบ List -->
        <div v-for="log in recentLogs" :key="log.id" class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors gap-4">
          <div class="flex items-start gap-4">
            <div class="w-2 h-2 rounded-full bg-emerald-500 mt-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <div>
              <p class="text-white text-sm font-medium">{{ log.details }}</p>
              <p class="text-gray-500 text-xs mt-1">โดย: <span class="text-emerald-400">{{ log.user_email }}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800">
            <Clock class="w-3.5 h-3.5" />
            {{ formatDate(log.created_at) }}
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>