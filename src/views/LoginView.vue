<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Loader2, ArrowLeft } from 'lucide-vue-next'
import { supabase } from '../supabase'

const router = useRouter()
const identifier = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    let loginEmail = identifier.value

    // ถ้ายูสเซอร์พิมพ์ Username (ไม่มี @) ให้ไปหา Email ใน Profiles ก่อน
    if (!loginEmail.includes('@')) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', loginEmail)
        .single()
        
      if (error || !data) {
        throw new Error('ไม่พบ Username นี้ในระบบ')
      }
      loginEmail = data.email
    }

    // 1. ทำการล็อกอินกับ Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password.value,
    })

    if (authError) throw authError

    // 2. ล็อกอินสำเร็จ -> เช็ค Role ว่าเป็น Admin หรือไม่
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    // 3. ทำการ Redirect ตามสิทธิ์
    if (profile && profile.role === 'Admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
    
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative px-4 pt-20 bg-[#050505]">
    <div class="w-full max-w-md glass-card rounded-2xl p-8 sm:p-10 z-10 animate__animated animate__fadeIn">
      
      <button @click="router.push('/')" class="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft class="w-4 h-4" /> กลับหน้าหลัก
      </button>

      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 mb-2">
          เข้าสู่ระบบ
        </h1>
        <p class="text-gray-400 text-sm">เข้าสู่ระบบเพื่อรับชมเนื้อหาและจัดการข้อมูล</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">Email หรือ Username</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User class="w-5 h-5 text-gray-500" />
            </div>
            <input 
              v-model="identifier" 
              type="text" 
              required
              class="w-full pl-11 pr-4 py-3 bg-[#0a0f16]/80 border border-gray-800 rounded-xl focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-white placeholder-gray-600 transition-all outline-none"
              placeholder="glshowtime หรือ mail@example.com"
            >
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">รหัสผ่าน</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock class="w-5 h-5 text-gray-500" />
            </div>
            <input 
              v-model="password" 
              type="password" 
              required
              class="w-full pl-11 pr-4 py-3 bg-[#0a0f16]/80 border border-gray-800 rounded-xl focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-white placeholder-gray-600 transition-all outline-none"
              placeholder="••••••••"
            >
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center animate__animated animate__shakeX">
          {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(219,39,119,0.3)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <span>{{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>