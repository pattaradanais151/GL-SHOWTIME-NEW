<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { 
  User, LayoutDashboard, Film, ListVideo, FileText, Users, UserPlus, LogOut 
} from 'lucide-vue-next'
import { supabase } from './supabase'

const route = useRoute()
const router = useRouter()

const currentUser = ref(null)
const isAdmin = ref(false)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const checkAdminRole = async (userId) => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      
    if (data && data.role === 'Admin') {
      isAdmin.value = true
    } else {
      isAdmin.value = false
    }
  } catch (error) {
    console.error('Error checking role:', error)
  }
}

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    currentUser.value = data.session?.user || null
    if (currentUser.value) checkAdminRole(currentUser.value.id)
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser.value = session?.user || null
    if (currentUser.value) {
      checkAdminRole(currentUser.value.id)
    } else {
      isAdmin.value = false
    }
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  currentUser.value = null
  isAdmin.value = false
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen relative font-sans text-slate-100 bg-[#050505] flex">
    
    <!-- PUBLIC NAVBAR -->
    <header v-if="!isAdminRoute" class="fixed top-0 left-0 w-full z-50 glass-nav h-20 flex items-center">
      <div class="w-full px-6 md:px-12 flex items-center justify-between">
        <div class="flex items-center gap-10">
          <RouterLink to="/" class="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
            GL<span class="text-white font-light">SHOWTIME</span>
          </RouterLink>
          <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <RouterLink to="/" exact-active-class="text-pink-400 font-bold" class="hover:text-pink-400 transition-colors">GL Home</RouterLink>
            <RouterLink to="/bl" exact-active-class="text-blue-400 font-bold" class="hover:text-blue-400 transition-colors">BL Home</RouterLink>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <template v-if="currentUser">
            <div class="flex items-center gap-3">
              <RouterLink v-if="isAdmin" to="/admin/dashboard" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-medium transition-all text-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <LayoutDashboard class="w-4 h-4" />
                <span class="hidden sm:inline">จัดการหลังบ้าน</span>
              </RouterLink>
              <button @click="handleLogout" class="flex items-center gap-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 px-4 py-2 rounded-full transition-all text-sm">
                <LogOut class="w-4 h-4" />
                <span class="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(219,39,119,0.4)]">
              <User class="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- ADMIN SIDEBAR -->
    <aside v-if="isAdminRoute" class="w-64 fixed h-screen glass-nav border-r border-white/10 flex flex-col z-50">
      <div class="h-20 flex items-center px-6 border-b border-white/10">
        <span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ADMIN<span class="text-white font-light">PANEL</span></span>
      </div>
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        <RouterLink to="/admin/dashboard" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <LayoutDashboard class="w-5 h-5" /> Dashboard
        </RouterLink>
        <RouterLink to="/admin/add-series" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <Film class="w-5 h-5" /> เพิ่มซีรีส์ใหม่
        </RouterLink>
        
        <!-- เมนูใหม่: จัดการซีรีส์ -->
        <RouterLink to="/admin/manage-series" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <ListVideo class="w-5 h-5" /> จัดการซีรีส์
        </RouterLink>

        <RouterLink to="/admin/profiles" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <Users class="w-5 h-5" /> จัดการโปรไฟล์
        </RouterLink>
        <RouterLink to="/admin/add-users" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <UserPlus class="w-5 h-5" /> เพิ่มผู้ใช้งาน
        </RouterLink>
        <RouterLink to="/admin/logs" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <FileText class="w-5 h-5" /> ประวัติระบบ (Logs)
        </RouterLink>
      </nav>
      <div class="p-4 border-t border-white/10">
        <RouterLink to="/" class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all mb-2">
          <Film class="w-5 h-5" /> กลับหน้าแรกเว็บ
        </RouterLink>
        <button @click="handleLogout" class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut class="w-5 h-5" /> ออกจากระบบ
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <main :class="isAdminRoute ? 'flex-1 ml-64 p-8 min-h-screen' : 'w-full pb-20'">
      <RouterView />
    </main>
    
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>