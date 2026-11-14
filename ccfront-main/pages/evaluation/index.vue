<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
          รายการประเมินผลบุคลากร (Staff Appraisals)
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          ตรวจสอบ ติดตาม และบันทึกคะแนนการประเมินผลการปฏิบัติงานของบุคลากรในองค์กร
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-95 transition-all self-start sm:self-auto"
        @click="showStartModal = true"
      >
        <AppIcon name="plus" size="16" />
        <span>เริ่มการประเมินใหม่</span>
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <AppIcon name="search" size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อบุคลากร หรือตำแหน่ง..."
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
        />
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="selectedStatus === tab.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="selectedStatus = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <div
      v-if="actionMessage"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2"
    >
      <AppIcon name="check" size="18" class="text-emerald-500" />
      <span>{{ actionMessage }}</span>
    </div>

    <!-- Evaluations Table Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div v-if="loading" class="py-20 text-center text-slate-400">
        <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p class="text-sm">กำลังโหลดรายการการประเมิน...</p>
      </div>

      <div v-else-if="filteredEvaluations.length === 0" class="py-16 text-center text-slate-400">
        <AppIcon name="clipboard-check" size="40" class="mx-auto text-slate-300 mb-2" />
        <p class="text-sm font-semibold text-slate-700">ไม่พบรายการประเมินที่ตรงกับเงื่อนไข</p>
        <p class="text-xs text-slate-400 mt-1">สามารถกดปุ่ม "เริ่มการประเมินใหม่" เพื่อสร้างรายการ</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-6">รหัส (ID)</th>
              <th class="py-3.5 px-6">บุคลากร (Staff)</th>
              <th class="py-3.5 px-6">ตำแหน่งงาน (Position)</th>
              <th class="py-3.5 px-6">สถานะ (Status)</th>
              <th class="py-3.5 px-6 text-right">ดำเนินการ (Actions)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="item in filteredEvaluations"
              :key="item.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-4 px-6 text-xs font-mono text-slate-400">
                #{{ item.id }}
              </td>
              <td class="py-4 px-6 font-medium text-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {{ item.employee ? item.employee.charAt(0) : 'E' }}
                  </div>
                  <div>
                    <span class="font-semibold text-slate-900 block">{{ item.employee }}</span>
                    <span class="text-[11px] text-slate-400">รหัสการประเมิน #{{ item.id }}</span>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-xs text-slate-600">
                <span class="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  {{ item.position || '-' }}
                </span>
              </td>
              <td class="py-4 px-6">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  :class="item.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="item.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"
                  />
                  <span>{{ item.status === 'completed' ? 'เสร็จสิ้น (Completed)' : 'กำลังประเมิน (In Progress)' }}</span>
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <NuxtLink
                  :to="`/evaluation/${item.id}`"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                  :class="item.status === 'completed'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'"
                >
                  <AppIcon name="edit" size="13" />
                  <span>{{ item.status === 'completed' ? 'ดูผลการประเมิน' : 'ตรวจประเมิน & ให้คะแนน' }}</span>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Start Evaluation Modal -->
    <div
      v-if="showStartModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/20 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center">
              <AppIcon name="plus" size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900">เริ่มการประเมินใหม่</h3>
              <p class="text-xs text-slate-500">สร้างแบบประเมินสำหรับบุคลากร</p>
            </div>
          </div>
          <button
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            @click="showStartModal = false"
          >
            <AppIcon name="x" size="20" />
          </button>
        </div>

        <form @submit.prevent="handleStartEvaluation" class="space-y-4">
          <!-- Select Employee from list or type -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกบุคลากรจากระบบ (Staff from Profiles)
            </label>
            <select
              v-model="selectedEmployeeProfile"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              @change="onProfileSelect"
            >
              <option :value="null">-- เลือกจากบุคลากรในระบบ หรือกรอกเองด้านล่าง --</option>
              <option
                v-for="p in positionsList"
                :key="p.userId"
                :value="p"
              >
                {{ p.employee }} ({{ p.position }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อ - นามสกุล บุคลากร (Employee Name) *
            </label>
            <input
              v-model="newEval.employee"
              type="text"
              required
              placeholder="เช่น นาย สมศักดิ์ มุ่งมั่น"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ตำแหน่งงาน (Position) *
            </label>
            <input
              v-model="newEval.position"
              type="text"
              required
              placeholder="เช่น งานสารสนเทศ, การเงิน"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              รอบการประเมิน (Evaluation Period) *
            </label>
            <select
              v-model="newEval.periodId"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option :value="null" disabled>-- เลือกรอบการประเมิน --</option>
              <option
                v-for="p in periodsList"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }} ({{ p.status }})
              </option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              @click="showStartModal = false"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="starting"
              class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-60"
            >
              <span>{{ starting ? 'กำลังสร้าง...' : 'สร้างแบบประเมิน' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getEvaluations, startEvaluation, getPeriods, getPositions } = useEvaluation();

const loading = ref(true);
const starting = ref(false);
const showStartModal = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('all');
const actionMessage = ref('');

const evaluationsList = ref<any[]>([]);
const periodsList = ref<any[]>([]);
const positionsList = ref<any[]>([]);
const selectedEmployeeProfile = ref<any>(null);

const newEval = reactive({
  employee: '',
  position: '',
  periodId: null as number | null
});

const filterTabs = [
  { label: 'ทั้งหมด (All)', value: 'all' },
  { label: 'กำลังประเมิน (In Progress)', value: 'in-progress' },
  { label: 'เสร็จสิ้น (Completed)', value: 'completed' }
];

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const [evals, periods, positions] = await Promise.all([
      getEvaluations().catch(() => []),
      getPeriods().catch(() => []),
      getPositions().catch(() => [])
    ]);

    evaluationsList.value = evals || [];
    periodsList.value = periods || [];
    positionsList.value = positions || [];

    const active = periods.find((p: any) => p.status === 'active') || periods[0];
    if (active) {
      newEval.periodId = active.id;
    }
  } catch (err) {
    console.error('Error fetching evaluations:', err);
  } finally {
    loading.value = false;
  }
};

const onProfileSelect = () => {
  if (selectedEmployeeProfile.value) {
    newEval.employee = selectedEmployeeProfile.value.employee || '';
    newEval.position = selectedEmployeeProfile.value.position || '';
  }
};

const filteredEvaluations = computed(() => {
  let list = evaluationsList.value;

  if (selectedStatus.value !== 'all') {
    list = list.filter((e) => e.status === selectedStatus.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (e) =>
        (e.employee && e.employee.toLowerCase().includes(q)) ||
        (e.position && e.position.toLowerCase().includes(q))
    );
  }

  return list;
});

const handleStartEvaluation = async () => {
  if (!newEval.employee || !newEval.position || !newEval.periodId) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  starting.value = true;
  try {
    const created = await startEvaluation({
      employee: newEval.employee,
      position: newEval.position,
      periodId: newEval.periodId
    });

    evaluationsList.value.unshift(created);
    showStartModal.value = false;
    actionMessage.value = `สร้างแบบประเมินสำหรับ ${newEval.employee} สำเร็จ!`;
    setTimeout(() => {
      actionMessage.value = '';
    }, 4000);

    newEval.employee = '';
    newEval.position = '';
    selectedEmployeeProfile.value = null;
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการสร้างแบบประเมิน');
  } finally {
    starting.value = false;
  }
};
</script>
