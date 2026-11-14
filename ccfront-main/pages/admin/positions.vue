<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
          กำหนดเกณฑ์ตามตำแหน่งและบุคลากร (Position & Criteria Assignment)
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          ผูกหัวข้อเกณฑ์การประเมินให้ตรงกับตำแหน่งงานและบุคลากรแต่ละกลุ่มในองค์กร
        </p>
      </div>

      <button
        type="button"
        :disabled="saving || selectedEmployees.length === 0 || selectedCriteria.length === 0"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all self-start sm:self-auto"
        @click="handleSaveConfig"
      >
        <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <AppIcon v-else name="check" size="16" />
        <span>บันทึกการกำหนดเกณฑ์</span>
      </button>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="actionMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 animate-fade-in"
    >
      <AppIcon name="check" size="18" class="text-emerald-500" />
      <span>{{ actionMsg }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center text-slate-400">
      <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
      <p class="text-sm">กำลังโหลดข้อมูลบุคลากรและเกณฑ์...</p>
    </div>

    <!-- Two-Column Config Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Step 1: Select Position & Employees -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-900">เลือกตำแหน่งและบุคลากร</h2>
              <p class="text-xs text-slate-400">เลือกพนักงานที่จะได้รับมอบหมายเกณฑ์</p>
            </div>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-brand-600 hover:text-brand-700"
            @click="toggleSelectAllEmployees"
          >
            {{ isAllEmployeesSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด' }}
          </button>
        </div>

        <!-- Position Filter Dropdown -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">
            กรองตามตำแหน่งงาน (Filter by Position)
          </label>
          <select
            v-model="positionFilter"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">ทุกตำแหน่งงาน (All Positions)</option>
            <option
              v-for="pos in distinctPositions"
              :key="pos"
              :value="pos"
            >
              {{ pos }}
            </option>
          </select>
        </div>

        <!-- Employee List Checkboxes -->
        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="emp in filteredEmployees"
            :key="emp.userId"
            class="flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer"
            :class="selectedEmployees.includes(emp.userId)
              ? 'bg-brand-50/60 border-brand-200 shadow-sm'
              : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/60'"
            @click="toggleEmployee(emp.userId)"
          >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :checked="selectedEmployees.includes(emp.userId)"
                class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 pointer-events-none"
              />
              <div>
                <p class="text-xs font-bold text-slate-900">{{ emp.employee }}</p>
                <p class="text-[11px] text-slate-500">ตำแหน่ง: {{ emp.position }}</p>
              </div>
            </div>

            <!-- Existing Criteria Count Pill -->
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
              มีเกณฑ์แล้ว: {{ getEmployeeAssignedCount(emp.userId) }} ข้อ
            </span>
          </div>
        </div>

        <p class="text-xs text-slate-500 pt-2 border-t border-slate-100">
          เลือกแล้ว: <span class="font-bold text-brand-600">{{ selectedEmployees.length }}</span> คน
        </p>
      </div>

      <!-- Step 2: Select Criteria -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-900">เลือกเกณฑ์การประเมิน (KPI)</h2>
              <p class="text-xs text-slate-400">ติ๊กเลือกหัวข้อที่บุคลากรกลุ่มนี้ต้องประเมิน</p>
            </div>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-brand-600 hover:text-brand-700"
            @click="toggleSelectAllCriteria"
          >
            {{ isAllCriteriaSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด' }}
          </button>
        </div>

        <!-- Criteria List Checkboxes -->
        <div class="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          <div
            v-for="crit in criteriaList"
            :key="crit.id"
            class="p-4 rounded-2xl border transition-all cursor-pointer"
            :class="selectedCriteria.includes(crit.id)
              ? 'bg-indigo-50/60 border-indigo-200 shadow-sm'
              : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/60'"
            @click="toggleCriteria(crit.id)"
          >
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :checked="selectedCriteria.includes(crit.id)"
                class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 pointer-events-none mt-0.5"
              />
              <div class="flex-1">
                <p class="text-xs font-bold text-slate-900 leading-snug">
                  {{ crit.name }}
                </p>
                <p v-if="crit.description" class="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {{ crit.description }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    {{ crit.subItems?.length || 0 }} ข้อย่อย
                  </span>
                  <span
                    v-if="crit.requiresEvidence"
                    class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-800"
                  >
                    แนบเอกสาร
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-500 pt-2 border-t border-slate-100">
          เกณฑ์ที่เลือก: <span class="font-bold text-brand-600">{{ selectedCriteria.length }}</span> หัวข้อหลัก
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getPositions, getCriteria, getAllEmployeeCriteria, savePositionConfig } = useEvaluation();

const loading = ref(true);
const saving = ref(false);
const actionMsg = ref('');

const employees = ref<any[]>([]);
const criteriaList = ref<any[]>([]);
const employeeCriteriaMappings = ref<{ userId: number; criteriaId: number }[]>([]);

const positionFilter = ref('all');
const selectedEmployees = ref<number[]>([]);
const selectedCriteria = ref<number[]>([]);

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const [pos, crit, mappings] = await Promise.all([
      getPositions().catch(() => []),
      getCriteria().catch(() => []),
      getAllEmployeeCriteria().catch(() => [])
    ]);

    employees.value = pos || [];
    criteriaList.value = crit || [];
    employeeCriteriaMappings.value = mappings || [];
  } catch (err) {
    console.error('Error fetching position config:', err);
  } finally {
    loading.value = false;
  }
};

const distinctPositions = computed(() => {
  const set = new Set<string>();
  for (const e of employees.value) {
    if (e.position) set.add(e.position);
  }
  return Array.from(set);
});

const filteredEmployees = computed(() => {
  if (positionFilter.value === 'all') return employees.value;
  return employees.value.filter((e) => e.position === positionFilter.value);
});

const getEmployeeAssignedCount = (userId: number) => {
  return employeeCriteriaMappings.value.filter((m) => m.userId === userId).length;
};

const toggleEmployee = (userId: number) => {
  const idx = selectedEmployees.value.indexOf(userId);
  if (idx !== -1) {
    selectedEmployees.value.splice(idx, 1);
  } else {
    selectedEmployees.value.push(userId);
  }
};

const isAllEmployeesSelected = computed(() => {
  return (
    filteredEmployees.value.length > 0 &&
    filteredEmployees.value.every((e) => selectedEmployees.value.includes(e.userId))
  );
});

const toggleSelectAllEmployees = () => {
  if (isAllEmployeesSelected.value) {
    const ids = filteredEmployees.value.map((e) => e.userId);
    selectedEmployees.value = selectedEmployees.value.filter((id) => !ids.includes(id));
  } else {
    const ids = filteredEmployees.value.map((e) => e.userId);
    selectedEmployees.value = Array.from(new Set([...selectedEmployees.value, ...ids]));
  }
};

const toggleCriteria = (critId: number) => {
  const idx = selectedCriteria.value.indexOf(critId);
  if (idx !== -1) {
    selectedCriteria.value.splice(idx, 1);
  } else {
    selectedCriteria.value.push(critId);
  }
};

const isAllCriteriaSelected = computed(() => {
  return (
    criteriaList.value.length > 0 &&
    selectedCriteria.value.length === criteriaList.value.length
  );
});

const toggleSelectAllCriteria = () => {
  if (isAllCriteriaSelected.value) {
    selectedCriteria.value = [];
  } else {
    selectedCriteria.value = criteriaList.value.map((c) => c.id);
  }
};

const handleSaveConfig = async () => {
  if (selectedEmployees.value.length === 0 || selectedCriteria.value.length === 0) {
    alert('กรุณาเลือกบุคลากรและเกณฑ์อย่างน้อย 1 รายการ');
    return;
  }

  saving.value = true;
  try {
    const posName = positionFilter.value === 'all' ? 'ตำแหน่งที่เลือก' : positionFilter.value;
    const res = await savePositionConfig({
      positionName: posName,
      employeeIds: selectedEmployees.value,
      criteriaIds: selectedCriteria.value
    });

    // Refresh mappings
    employeeCriteriaMappings.value = await getAllEmployeeCriteria();

    actionMsg.value = `บันทึกการกำหนดเกณฑ์ให้ ${selectedEmployees.value.length} บุคลากร เรียบร้อยแล้ว!`;
    setTimeout(() => {
      actionMsg.value = '';
    }, 4500);
  } catch (err: any) {
    alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกการกำหนดเกณฑ์');
  } finally {
    saving.value = false;
  }
};
</script>
