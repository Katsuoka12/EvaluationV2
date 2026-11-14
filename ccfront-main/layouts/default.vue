<template>
  <div class="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
    <!-- Mobile Sidebar Backdrop -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
      @click="mobileMenuOpen = false"
    />

    <!-- Sidebar Navigation -->
    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Brand Header -->
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <AppIcon name="award" size="22" />
          </div>
          <div>
            <h1 class="font-bold text-base text-slate-900 leading-tight">ระบบประเมินผล</h1>
            <p class="text-xs text-brand-600 font-medium">Evaluation Portal</p>
          </div>
        </NuxtLink>
        <button
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          @click="mobileMenuOpen = false"
        >
          <AppIcon name="x" size="20" />
        </button>
      </div>

      <!-- User Info Badge -->
      <div class="p-4 mx-4 my-3 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/60 flex items-center gap-3">
        <div class="relative">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            alt="Avatar"
            class="w-11 h-11 rounded-xl object-cover border border-white shadow-sm"
          />
          <div
            v-else
            class="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white flex items-center justify-center font-bold text-base shadow-sm"
          >
            {{ userInitial }}
          </div>
          <span
            class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
            :class="roleBadgeDotColor"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 truncate">
            {{ displayName }}
          </p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider"
              :class="roleBadgeClasses"
            >
              {{ roleNameTh }}
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div class="px-3 pb-2 pt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          เมนูหลัก (Main Menu)
        </div>

        <NuxtLink
          to="/"
          class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isActiveRoute('/') ? 'nav-active' : 'nav-inactive'"
          @click="mobileMenuOpen = false"
        >
          <AppIcon name="dashboard" size="18" />
          <span>แดชบอร์ดภาพรวม</span>
        </NuxtLink>

        <!-- User/Staff: My Evaluation -->
        <NuxtLink
          v-if="isUser"
          to="/evaluation/my-eval"
          class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isActiveRoute('/evaluation/my-eval') ? 'nav-active' : 'nav-inactive'"
          @click="mobileMenuOpen = false"
        >
          <AppIcon name="clipboard-check" size="18" />
          <span>แบบประเมินตนเอง</span>
        </NuxtLink>

        <!-- Assessor / Admin: Evaluations List -->
        <NuxtLink
          v-if="isAssessor || isAdmin"
          to="/evaluation"
          class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isActiveRoute('/evaluation') && !isActiveRoute('/evaluation/my-eval') ? 'nav-active' : 'nav-inactive'"
          @click="mobileMenuOpen = false"
        >
          <AppIcon name="clipboard-check" size="18" />
          <span>รายการประเมินบุคลากร</span>
        </NuxtLink>

        <NuxtLink
          to="/profile"
          class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isActiveRoute('/profile') ? 'nav-active' : 'nav-inactive'"
          @click="mobileMenuOpen = false"
        >
          <AppIcon name="user" size="18" />
          <span>ข้อมูลส่วนตัว (Profile)</span>
        </NuxtLink>

        <!-- Admin Section -->
        <div v-if="isAdmin" class="pt-5">
          <div class="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>ผู้ดูแลระบบ (Admin)</span>
            <AppIcon name="shield" size="13" class="text-indigo-500" />
          </div>

          <NuxtLink
            to="/admin/periods"
            class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActiveRoute('/admin/periods') ? 'nav-active' : 'nav-inactive'"
            @click="mobileMenuOpen = false"
          >
            <AppIcon name="calendar" size="18" />
            <span>รอบการประเมิน</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/criteria"
            class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActiveRoute('/admin/criteria') ? 'nav-active' : 'nav-inactive'"
            @click="mobileMenuOpen = false"
          >
            <AppIcon name="award" size="18" />
            <span>เกณฑ์และตัวชี้วัด KPI</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/positions"
            class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActiveRoute('/admin/positions') ? 'nav-active' : 'nav-inactive'"
            @click="mobileMenuOpen = false"
          >
            <AppIcon name="users" size="18" />
            <span>กำหนดเกณฑ์ตามตำแหน่ง</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Bottom User Controls -->
      <div class="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <div class="flex items-center justify-between px-2 text-xs text-slate-500">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            เชื่อมต่อ API (3333)
          </span>
          <span class="text-[10px] font-mono text-slate-400">Nuxt 3</span>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <AppIcon name="logout" size="17" />
          <span>ออกจากระบบ (Logout)</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 glass-nav px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            class="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            @click="mobileMenuOpen = true"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h2 class="text-lg font-bold text-slate-900 leading-tight">
              {{ currentTitle }}
            </h2>
            <p class="text-xs text-slate-500 hidden sm:block">
              ระบบประเมินสมรรถนะและผลการปฏิบัติงานบุคลากร
            </p>
          </div>
        </div>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/profile"
            class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <span class="hidden sm:inline font-medium">{{ displayName }}</span>
            <div class="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              {{ userInitial }}
            </div>
          </NuxtLink>
        </div>
      </header>

      <!-- Page Slot -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { profile, displayName, role, roleNameTh, isUser, isAssessor, isAdmin, logout, fetchProfile } = useAuth();
const mobileMenuOpen = ref(false);

onMounted(async () => {
  await fetchProfile();
});

const userInitial = computed(() => {
  const name = displayName.value.trim();
  return name.charAt(0).toUpperCase() || 'U';
});

const roleBadgeClasses = computed(() => {
  switch (role.value) {
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'assessor':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
});

const roleBadgeDotColor = computed(() => {
  switch (role.value) {
    case 'admin':
      return 'bg-purple-500';
    case 'assessor':
      return 'bg-amber-500';
    default:
      return 'bg-emerald-500';
  }
});

const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

const currentTitle = computed(() => {
  if (route.path === '/') return 'แดชบอร์ดภาพรวม (Overview)';
  if (route.path.startsWith('/evaluation/my-eval')) return 'แบบประเมินตนเอง (Self Evaluation)';
  if (route.path.startsWith('/evaluation/')) return 'บันทึกคะแนนการประเมินผล';
  if (route.path === '/evaluation') return 'รายการประเมินบุคลากร (Staff Appraisals)';
  if (route.path === '/profile') return 'ข้อมูลส่วนบุคคล (Profile)';
  if (route.path.startsWith('/admin/periods')) return 'จัดการรอบการประเมิน (Evaluation Periods)';
  if (route.path.startsWith('/admin/criteria')) return 'เกณฑ์การประเมินและข้อย่อย (KPI & Criteria)';
  if (route.path.startsWith('/admin/positions')) return 'กำหนดเกณฑ์ตามตำแหน่ง (Position Assignment)';
  return 'ระบบประเมินผลบุคลากร';
});

const handleLogout = () => {
  if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
    logout();
  }
};
</script>

<style scoped>
.nav-item {
  @apply text-slate-600 hover:text-slate-900 hover:bg-slate-100;
}
.nav-active {
  @apply bg-brand-50 text-brand-700 font-semibold shadow-sm border border-brand-100;
}
.nav-inactive {
  @apply text-slate-600;
}
</style>
