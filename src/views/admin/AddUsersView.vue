<script setup>
import { ref } from 'vue'
import { supabase } from '../../supabase'
import { UserPlus, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  email: '',
  username: '',
  password: '',
  role: 'User'
})

const handleAddUser = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // 1. สมัคร User เข้า Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
    })

    if (authError) throw authError

    // 2. บันทึกลงตาราง profiles
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: authData.user.id,
      email: form.value.email,
      username: form.value.username,
      role: form.value.role
    }])

    if (profileError) throw profileError
    
    // บันทึก Log
    await supabase.from('logs').insert([{ 
      user_email: 'System', 
      action: 'ADD_USER', 
      details: `เพิ่มผู้ใช้ใหม่: ${form.value.username}` 
    }])

    successMessage.value = 'เพิ่มผู้ใช้สำเร็จ! (ระบบอาจสลับ Session ของคุณเป็นผู้ใช้ใหม่ กรุณาล็อคอินแอดมินใหม่อีกครั้ง)'
    
    // เคลียร์ฟอร์ม
    form.value = { email: '', username: '', password: '', role: 'User' }
    
    // หน่วงเวลา 3 วิแล้วเด้งไปหน้า Login
    setTimeout(() => { router.push('/login') }, 3000)

  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate__animated animate__fadeIn max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-8 border-l-4 border-purple-400 pl-4">เพิ่มผู้ใช้งานใหม่</h1>
    
    <div class="glass-card p-8 rounded-2xl">
      <form @submit.prevent="handleAddUser" class="space-y-6">
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">อีเมล (Email)</label>
          <input v-model="form.email" type="email" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-colors">
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">ชื่อผู้ใช้ (Username)</label>
          <input v-model="form.username" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-colors">
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">รหัสผ่าน (Password)</label>
          <input v-model="form.password" type="password" required minlength="6" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-colors">
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">สิทธิ์ผู้ใช้งาน (Role)</label>
          <select v-model="form.role" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-colors">
            <option value="User">ผู้ใช้งานทั่วไป (User)</option>
            <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
          </select>
        </div>

        <div v-if="successMessage" class="text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-sm text-center animate__animated animate__fadeIn">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-sm text-center animate__animated animate__shakeX">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <UserPlus v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังสร้างบัญชี...' : 'เพิ่มผู้ใช้' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>