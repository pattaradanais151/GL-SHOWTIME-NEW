<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabase'
import { User, Shield } from 'lucide-vue-next'

const profilesList = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (data) profilesList.value = data
  isLoading.value = false
})
</script>

<template>
  <div class="animate__animated animate__fadeIn">
    <h1 class="text-3xl font-bold text-white mb-8 border-l-4 border-blue-400 pl-4">จัดการโปรไฟล์ผู้ใช้</h1>
    
    <div class="glass-card rounded-2xl overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-gray-400">กำลังโหลด...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-800 bg-black/40 text-gray-400 text-sm">
            <th class="p-4 font-medium">Username</th>
            <th class="p-4 font-medium">Email</th>
            <th class="p-4 font-medium">Role</th>
            <th class="p-4 font-medium">วันที่สมัคร</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in profilesList" :key="user.id" class="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
            <td class="p-4 text-white flex items-center gap-2"><User class="w-4 h-4 text-blue-400"/> {{ user.username }}</td>
            <td class="p-4 text-gray-400 text-sm">{{ user.email }}</td>
            <td class="p-4">
              <span class="flex items-center gap-1 w-fit bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20">
                <Shield class="w-3 h-3"/> {{ user.role || 'User' }}
              </span>
            </td>
            <td class="p-4 text-gray-500 text-sm">{{ new Date(user.created_at).toLocaleDateString('th-TH') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>