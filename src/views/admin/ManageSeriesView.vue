<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../../supabase'
import { Edit, Trash2, X, Save, Loader2, Film, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const seriesList = ref([])
const isLoading = ref(true)

// สำหรับ Search & Pagination
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(1)
const totalItems = ref(0)

// สำหรับ Modal แก้ไข
const isEditModalOpen = ref(false)
const isSaving = ref(false)
const editForm = ref({})
const notification = ref({ show: false, message: '', type: 'success' })

// ดึงข้อมูลซีรีส์พร้อม Pagination & Search
const fetchSeries = async () => {
  isLoading.value = true
  try {
    let query = supabase
      .from('series')
      .select('*', { count: 'exact' }) // นับจำนวนทั้งหมดที่ตรงเงื่อนไขด้วย

    // ถ้ามีการค้นหา ให้หาจากชื่อเรื่อง
    if (searchQuery.value) {
      query = query.ilike('title', `%${searchQuery.value}%`)
    }

    // คำนวณช่วงข้อมูล (Pagination)
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    if (data) {
      seriesList.value = data
      totalItems.value = count || 0
      totalPages.value = Math.ceil((count || 0) / itemsPerPage) || 1
    }
  } catch (error) {
    console.error('Error fetching series:', error)
  } finally {
    isLoading.value = false
  }
}

// โหลดครั้งแรก
onMounted(() => {
  fetchSeries()
})

// ดักจับการพิมพ์ค้นหา (ถ้าพิมพ์ให้กลับไปหน้า 1 แล้วดึงข้อมูลใหม่)
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchSeries()
  }, 500) // หน่วงเวลา 0.5 วิ เพื่อไม่ให้ยิง Request รัวเกินไป
}

// เปลี่ยนหน้า
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchSeries()
  }
}

// เปิด/ปิด Modal
const openEditModal = (item) => {
  editForm.value = { ...item }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editForm.value = {}
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 3000)
}

const handleUpdate = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('series')
      .update({
        title: editForm.value.title,
        type: editForm.value.type,
        genres: editForm.value.genres,
        air_date: editForm.value.air_date,
        air_time: editForm.value.air_time,
        trailer_url: editForm.value.trailer_url,
        director: editForm.value.director,
        rating: editForm.value.rating,
        description: editForm.value.description
      })
      .eq('id', editForm.value.id)

    if (error) throw error

    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: 'EDIT_SERIES', 
      details: `อัปเดตข้อมูลซีรีส์: ${editForm.value.title}` 
    }])

    showNotification('อัปเดตข้อมูลสำเร็จ')
    closeEditModal()
    fetchSeries()

  } catch (error) {
    showNotification(error.message, 'error')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id, title) => {
  if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบซีรีส์เรื่อง "${title}"?\nการกระทำนี้ไม่สามารถกู้คืนได้`)) return

  try {
    const { error } = await supabase.from('series').delete().eq('id', id)
    if (error) throw error

    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: 'DELETE_SERIES', 
      details: `ลบซีรีส์: ${title}` 
    }])

    showNotification('ลบซีรีส์สำเร็จ')
    fetchSeries()

  } catch (error) {
    showNotification(error.message, 'error')
  }
}
</script>

<template>
  <div class="animate__animated animate__fadeIn">
    
    <!-- การแจ้งเตือน -->
    <div v-if="notification.show" 
         :class="['fixed top-6 right-6 px-6 py-3 rounded-xl font-medium shadow-lg z-[200] transition-all animate__animated animate__slideInRight', 
                  notification.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white']">
      {{ notification.message }}
    </div>

    <!-- หัวข้อ & ช่องค้นหา -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <h1 class="text-3xl font-bold text-white border-l-4 border-emerald-400 pl-4">จัดการซีรีส์ (แก้ไข/ลบ)</h1>
      
      <div class="relative w-full md:w-80">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="w-5 h-5 text-gray-500" />
        </div>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="ค้นหาชื่อซีรีส์..." 
          class="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none transition-colors"
        >
      </div>
    </div>
    
    <!-- ตารางข้อมูล -->
    <div class="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
      <div class="overflow-x-auto flex-grow">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="border-b border-gray-800 bg-black/40 text-gray-400 text-sm">
              <th class="p-4 font-medium w-24">ภาพปก</th>
              <th class="p-4 font-medium">ชื่อเรื่อง</th>
              <th class="p-4 font-medium">ประเภท</th>
              <th class="p-4 font-medium">วันออนแอร์</th>
              <th class="p-4 font-medium text-center w-32">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="p-16 text-center text-gray-400">
                <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2"/> กำลังโหลดข้อมูล...
              </td>
            </tr>
            <tr v-else-if="seriesList.length === 0">
              <td colspan="5" class="p-16 text-center text-gray-500">
                ไม่พบข้อมูลซีรีส์ที่ค้นหา
              </td>
            </tr>
            <tr v-for="item in seriesList" :key="item.id" class="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
              <td class="p-4">
                <div class="w-20 h-12 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                  <Film v-if="!item.trailer_url" class="w-5 h-5 text-gray-500" />
                  <img v-else :src="`https://img.youtube.com/vi/${item.trailer_url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2]}/hqdefault.jpg`" class="w-full h-full object-cover">
                </div>
              </td>
              <td class="p-4 text-white font-medium">{{ item.title }}</td>
              <td class="p-4">
                <span :class="['text-xs px-2 py-1 rounded border', item.type === 'GL' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20']">
                  {{ item.type }}
                </span>
              </td>
              <td class="p-4 text-gray-400 text-sm">{{ item.air_date }}</td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEditModal(item)" class="p-2 bg-gray-800 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors" title="แก้ไข">
                    <Edit class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(item.id, item.title)" class="p-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors" title="ลบ">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (ส่วนแบ่งหน้า) -->
      <div v-if="!isLoading && totalPages > 0" class="p-4 border-t border-gray-800/50 flex items-center justify-between bg-black/20">
        <span class="text-sm text-gray-500">
          แสดงข้อมูล {{ (currentPage - 1) * itemsPerPage + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, totalItems) }} จากทั้งหมด {{ totalItems }} รายการ
        </span>
        <div class="flex items-center gap-2">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          
          <span class="text-sm text-gray-300 font-medium px-4">
            หน้า {{ currentPage }} / {{ totalPages }}
          </span>

          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal แก้ไขซีรีส์ (เหมือนเดิม) -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate__animated animate__fadeIn animate__faster">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeEditModal"></div>
      
      <div class="relative w-full max-w-4xl glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] bg-[#0d131a]">
        
        <div class="flex items-center justify-between p-6 border-b border-white/10">
          <h2 class="text-2xl font-bold text-white">แก้ไขข้อมูลซีรีส์</h2>
          <button @click="closeEditModal" class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar">
          <form @submit.prevent="handleUpdate" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">ชื่อเรื่อง</label>
                <input v-model="editForm.title" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">ประเภท</label>
                <select v-model="editForm.type" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
                  <option value="GL">GL Series</option>
                  <option value="BL">BL Series</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">หมวดหมู่</label>
                <input v-model="editForm.genres" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">ผู้กำกับ</label>
                <input v-model="editForm.director" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">วันออนแอร์</label>
                <input v-model="editForm.air_date" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">เวลาออนแอร์</label>
                <input v-model="editForm.air_time" type="text" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">ลิงก์ตัวอย่าง YouTube</label>
                <input v-model="editForm.trailer_url" type="url" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">คะแนนเรทติ้ง</label>
                <input v-model="editForm.rating" type="number" step="0.1" max="10" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none">
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">เรื่องย่อ</label>
              <textarea v-model="editForm.description" rows="4" required class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none resize-none"></textarea>
            </div>

            <div class="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
              <button type="button" @click="closeEditModal" class="px-6 py-3 rounded-xl text-gray-300 hover:bg-white/10 transition-colors">
                ยกเลิก
              </button>
              <button type="submit" :disabled="isSaving" class="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
                <Loader2 v-if="isSaving" class="w-5 h-5 animate-spin" />
                <Save v-else class="w-5 h-5" />
                <span>บันทึกการแก้ไข</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>