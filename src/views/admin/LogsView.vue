<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabase'
import { FileText, Clock } from 'lucide-vue-next'

const logsList = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
    
  if (data) logsList.value = data
  isLoading.value = false
})

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString('th-TH')
}
</script>

<template>
  <div class="animate__animated animate__fadeIn">
    <h1 class="text-3xl font-bold text-white mb-8 border-l-4 border-cyan-400 pl-4">ประวัติระบบ (System Logs)</h1>
    
    <div class="glass-card rounded-2xl overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-gray-400">กำลังโหลด...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-800 bg-black/40 text-gray-400 text-sm">
            <th class="p-4 font-medium">วันเวลา</th>
            <th class="p-4 font-medium">ผู้ดำเนินการ</th>
            <th class="p-4 font-medium">การกระทำ (Action)</th>
            <th class="p-4 font-medium">รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logsList" :key="log.id" class="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
            <td class="p-4 text-gray-400 text-sm flex items-center gap-2"><Clock class="w-4 h-4"/> {{ formatDate(log.created_at) }}</td>
            <td class="p-4 text-emerald-400 text-sm">{{ log.user_email }}</td>
            <td class="p-4">
              <span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{{ log.action }}</span>
            </td>
            <td class="p-4 text-gray-300 text-sm">{{ log.details }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>