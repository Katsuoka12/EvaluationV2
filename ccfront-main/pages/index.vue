<template>
  <div class="space-y-6">
    <!-- Top Welcome Banner -->
    <div class="relative overflow-hidden rounded-3xl gradient-brand text-white p-6 sm:p-8 shadow-xl shadow-brand-500/15">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white mb-3">
            <AppIcon name="sparkles" size="14" />
            <span>ยินดีต้อนรับสู่ระบบประเมินผลการปฏิบัติงาน</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            สวัสดี, {{ displayName }}
          </h1>
          <p class="text-indigo-100 text-sm sm:text-base mt-2 leading-relaxed">
            ตำแหน่ง: <span class="font-semibold text-white">{{ profile.position || 'ยังไม่ได้ระบุตำแหน่ง' }}</span>
            &bull; สิทธิ์การใช้งาน: <span class="font-semibold text-white">{{ roleNameTh }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="isUser"
            to="/evaluation/my-eval"
            class="px-5 py-3 rounded-2xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2"
          >
            <AppIcon name="clipboard-check" size="18" />
            <span>ทำแบบประเมินตนเอง</span>
          </NuxtLink>

          <NuxtLink
            v-if="isAssessor || isAdmin"
            to="/evaluation"
            class="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm border border-white/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <AppIcon name="users" size="18" />
            <span>ตรวจประเมินบุคลากร</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Subtle background circles -->
      <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div class="absolute right-1/3 -top-12 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Card 1: Active Period -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">รอบการประเมิน</span>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <AppIcon name="calendar" size="20" />
          </div>
        </div>
        <p class="text-lg font-bold text-slate-900 mt-2 truncate">
          {{ activePeriod ? activePeriod.name : 'ไม่มีรอบที่เปิดอยู่' }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          {{ activePeriod ? `${activePeriod.startDate} ถึง ${activePeriod.endDate}` : 'กรุณาเปิดรอบประเมิน' }}
        </p>
      </div>

      <!-- Card 2: Criteria Count -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">เกณฑ์ประเมิน (KPI)</span>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <AppIcon name="award" size="20" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 mt-2">
          {{ criteriaList.length }} <span class="text-xs font-normal text-slate-500">หัวข้อหลัก</span>
        </p>
        <p class="text-xs text-indigo-600 mt-1 font-medium">
          {{ totalSubitems }} ตัวชี้วัดย่อย
        </p>
      </div>

      <!-- Card 3: Total Evaluations -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">รายการประเมิน</span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AppIcon name="clipboard-check" size="20" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 mt-2">
          {{ evaluationsList.length }} <span class="text-xs font-normal text-slate-500">รายการ</span>
        </p>
        <p class="text-xs text-amber-600 mt-1 font-medium">
          {{ inProgressCount }} กำลังดำเนินการ
        </p>
      </div>

      <!-- Card 4: Completed Status -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">ประเมินเสร็จสิ้น</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <AppIcon name="check" size="20" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 mt-2">
          {{ completedCount }} <span class="text-xs font-normal text-slate-500">เสร็จสมบูรณ์</span>
        </p>
        <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            :style="{ width: `${completionRate}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Main Content Layout (Left: Evaluations Table, Right: Quick Action Cards) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2 Cols): Recent Evaluations Table -->
      <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-slate-900">
              รายการการประเมินล่าสุด (Recent Evaluations)
            </h2>
            <p class="text-xs text-slate-500">
              สถานะการประเมินผลการปฏิบัติงานของบุคลากร
            </p>
          </div>
          <NuxtLink
            to="/evaluation"
            class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <AppIcon name="chevron-right" size="14" />
          </NuxtLink>
        </div>

        <div v-if="loading" class="py-12 text-center text-slate-400">
          <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p class="text-sm">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="evaluationsList.length === 0" class="py-12 text-center text-slate-400">
          <AppIcon name="clipboard-check" size="36" class="mx-auto text-slate-300 mb-2" />
          <p class="text-sm font-medium text-slate-600">ยังไม่มีรายการประเมินในระบบ</p>
          <p class="text-xs text-slate-400 mt-1">สามารถเริ่มต้นการประเมินได้จากเมนูด้านบน</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th class="pb-3 px-2">บุคลากร (Staff)</th>
                <th class="pb-3 px-2">ตำแหน่ง (Position)</th>
                <th class="pb-3 px-2">สถานะ (Status)</th>
                <th class="pb-3 px-2 text-right">ดำเนินการ (Action)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="item in evaluationsList.slice(0, 5)"
                :key="item.id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="py-3.5 px-2 font-medium text-slate-800">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {{ item.employee ? item.employee.charAt(0) : 'E' }}
                    </div>
                    <span class="font-medium text-slate-900">{{ item.employee }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-2 text-slate-600 text-xs">
                  {{ item.position || '-' }}
                </td>
                <td class="py-3.5 px-2">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="item.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'" />
                    {{ item.status === 'completed' ? 'เสร็จสิ้น (Completed)' : 'กำลังประเมิน (In Progress)' }}
                  </span>
                </td>
                <td class="py-3.5 px-2 text-right">
                  <NuxtLink
                    :to="`/evaluation/${item.id}`"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <span>ดูรายละเอียด</span>
                    <AppIcon name="chevron-right" size="13" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Shortcuts & Quick Management -->
      <div class="space-y-5">
        <!-- Self-Evaluation Card for User -->
        <div v-if="isUser" class="bg-gradient-to-br from-indigo-50 to-brand-50/30 rounded-3xl p-6 border border-indigo-100 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <AppIcon name="clipboard-check" size="20" />
            </div>
            <h3 class="font-bold text-sm text-slate-900">แบบประเมินตนเอง</h3>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">
            บันทึกคะแนนประเมินตนเอง พร้อมแนบเอกสารหลักฐานผลงานตามตัวชี้วัดที่ได้รับมอบหมาย
          </p>
          <NuxtLink
            to="/evaluation/my-eval"
            class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <span>เข้าสู่แบบประเมินตนเอง</span>
            <AppIcon name="chevron-right" size="14" />
          </NuxtLink>
        </div>

        <!-- Admin Shortcuts (if Admin) -->
        <div v-if="isAdmin" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <h3 class="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span>การจัดการระบบ (Admin)</span>
            <AppIcon name="shield" size="16" class="text-indigo-600" />
          </h3>

          <NuxtLink
            to="/admin/periods"
            class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <AppIcon name="calendar" size="16" />
              </div>
              <span class="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">กำหนดรอบประเมิน</span>
            </div>
            <AppIcon name="chevron-right" size="14" class="text-slate-400 group-hover:text-indigo-600" />
          </NuxtLink>

          <NuxtLink
            to="/admin/criteria"
            class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <AppIcon name="award" size="16" />
              </div>
              <span class="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">จัดการเกณฑ์ KPI</span>
            </div>
            <AppIcon name="chevron-right" size="14" class="text-slate-400 group-hover:text-indigo-600" />
          </NuxtLink>

          <NuxtLink
            to="/admin/positions"
            class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <AppIcon name="users" size="16" />
              </div>
              <span class="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">ผูกเกณฑ์ตามตำแหน่ง</span>
            </div>
            <AppIcon name="chevron-right" size="14" class="text-slate-400 group-hover:text-indigo-600" />
          </NuxtLink>
        </div>

        <!-- System Info Card -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-xs text-slate-500 space-y-2">
          <p class="font-bold text-slate-800 text-sm">ข้อมูลระบบ</p>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span>เซิร์ฟเวอร์ Backend:</span>
            <span class="font-mono text-slate-700">localhost:3333</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span>ฐานข้อมูล:</span>
            <span class="font-mono text-slate-700">MySQL (Knex)</span>
          </div>
          <div class="flex justify-between py-1">
            <span>สิทธิ์ปัจจุบัน:</span>
            <span class="font-semibold text-brand-600">{{ roleNameTh }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { displayName, profile, roleNameTh, isUser, isAssessor, isAdmin } = useAuth();
const { getPeriods, getCriteria, getEvaluations } = useEvaluation();

const loading = ref(true);
const periodsList = ref<any[]>([]);
const criteriaList = ref<any[]>([]);
const evaluationsList = ref<any[]>([]);

onMounted(async () => {
  try {
    const [p, c, e] = await Promise.all([
      getPeriods().catch(() => []),
      getCriteria().catch(() => []),
      getEvaluations().catch(() => [])
    ]);

    periodsList.value = p || [];
    criteriaList.value = c || [];
    evaluationsList.value = e || [];
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  } finally {
    loading.value = false;
  }
});

const activePeriod = computed(() => {
  return periodsList.value.find((p) => p.status === 'active') || periodsList.value[0] || null;
});

const totalSubitems = computed(() => {
  return criteriaList.value.reduce((acc, c) => acc + (c.subItems?.length || 0), 0);
});

const completedCount = computed(() => {
  return evaluationsList.value.filter((e) => e.status === 'completed').length;
});

const inProgressCount = computed(() => {
  return evaluationsList.value.filter((e) => e.status === 'in-progress' || e.status === 'pending').length;
});

const completionRate = computed(() => {
  if (evaluationsList.value.length === 0) return 0;
  return Math.round((completedCount.value / evaluationsList.value.length) * 100);
});
</script>
