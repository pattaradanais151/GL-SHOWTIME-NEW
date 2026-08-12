<script setup>
import { ref } from 'vue'
import { supabase } from '../../supabase'
import { Save, Loader2 } from 'lucide-vue-next'

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  title: '',
  type: 'GL',
  genres: '',
  air_date: '',
  air_time: '',
  trailer_url: '',
  director: '',
  rating: '',
  description: ''
})

const handleSubmit = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    const { error } = await supabase
      .from('series')
      .insert([form.value])

    if (error) throw error

    successMessage.value = 'เพิ่มข้อมูลซีรีส์สำเร็จ!'
    // Reset Form
    form.value = { title: '', type: 'GL', genres: '', air_date: '', air_time: '', trailer_url: '', director: '', rating: '', description: '' }
    
    // บันทึก Log
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: 'ADD_SERIES', 
      details: `เพิ่มซีรีส์เรื่อง: ${form.value.title}` 
    }])

  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate__animated animate__fadeIn max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-8 border-l-4 border-emerald-400 pl-4">เพิ่มซีรีส์ใหม่</h1>
    
    <div class="glass-card p-8 rounded-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">ชื่อเรื่อง (Title)</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">ประเภท (Type)</label>
            <select v-model="form.type" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              <option value="GL">GL Series</option>
              <option value="BL">BL Series</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">หมวดหมู่ (Genres)</label>
            <input v-model="form.genres" type="text" placeholder="เช่น โรแมนติก, ดราม่า" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">ผู้กำกับ (Director)</label>
            <input v-model="form.director" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">วันออนแอร์ (Air Date)</label>
            <input v-model="form.air_date" type="text" placeholder="เช่น ทุกวันศุกร์ หรือ 15 ต.ค. 2024" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">เวลาออนแอร์ (Air Time)</label>
            <input v-model="form.air_time" type="text" placeholder="เช่น 20:30 น." required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">ลิงก์ตัวอย่าง YouTube (Trailer URL)</label>
            <input v-model="form.trailer_url" type="url" placeholder="https://youtube.com/..." required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">คะแนนเรทติ้ง (Rating)</label>
            <input v-model="form.rating" type="number" step="0.1" max="10" placeholder="0.0 - 10.0" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-300">เรื่องย่อ (Description)</label>
          <textarea v-model="form.description" rows="4" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none resize-none"></textarea>
        </div>

        <div v-if="successMessage" class="text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center">{{ successMessage }}</div>
        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center">{{ errorMessage }}</div>

        <button type="submit" :disabled="isLoading" class="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-6">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Save v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกซีรีส์' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>