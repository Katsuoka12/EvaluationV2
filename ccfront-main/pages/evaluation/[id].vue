<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Top Nav / Back Button -->
    <div class="flex items-center justify-between">
      <NuxtLink
        to="/evaluation"
        class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
      >
        <AppIcon name="chevron-right" size="14" class="rotate-180" />
        <span>กลับไปหน้ารายการประเมิน</span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <span
          class="px-3 py-1 rounded-full text-xs font-semibold"
          :class="isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
        >
          {{ isCompleted ? 'เสร็จสิ้น (Completed)' : 'กำลังประเมิน (In Progress)' }}
        </span>
      </div>
    </div>

    <!-- Candidate Info Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
          {{ evaluation?.employee ? evaluation.employee.charAt(0) : 'E' }}
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
            {{ evaluation?.employee || 'ผู้รับการประเมิน' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            ตำแหน่ง: <span class="font-semibold text-slate-700">{{ evaluation?.position || '-' }}</span>
            &bull; รหัสการประเมิน: <span class="font-mono text-slate-600">#{{ evalId }}</span>
          </p>
        </div>
      </div>

      <!-- Live Score Summary Badges -->
      <div class="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
        <div class="text-center px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/60">
          <p class="text-[11px] text-slate-400 font-medium">คะแนนตนเอง</p>
          <p class="text-lg font-black text-slate-800">{{ avgSelfScore }} <span class="text-xs font-normal text-slate-400">/ 5</span></p>
        </div>
        <div class="text-center px-4 py-2 rounded-2xl bg-brand-50 border border-brand-200/60">
          <p class="text-[11px] text-brand-600 font-medium">คะแนนผู้ประเมิน</p>
          <p class="text-lg font-black text-brand-700">{{ avgManagerScore }} <span class="text-xs font-normal text-brand-400">/ 5</span></p>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="successMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3 animate-fade-in"
    >
      <AppIcon name="check" size="20" class="text-emerald-500" />
      <span>{{ successMsg }}</span>
    </div>

    <div
      v-if="errorMsg"
      class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3"
    >
      <AppIcon name="alert-circle" size="20" class="text-rose-500" />
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-20 text-center text-slate-400">
      <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
      <p class="text-sm">กำลังโหลดข้อมูลและเกณฑ์การประเมิน...</p>
    </div>

    <!-- Criteria Rubric Evaluation List -->
    <div v-else class="space-y-6">
      <div
        v-for="(crit, cIdx) in criteriaList"
        :key="crit.id"
        class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
      >
        <!-- Criteria Title -->
        <div class="border-b border-slate-100 pb-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-1.5">
                หมวดที่ {{ cIdx + 1 }}
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">
                {{ crit.name }}
              </h2>
              <p v-if="crit.description" class="text-xs text-slate-500 mt-1 leading-relaxed">
                {{ crit.description }}
              </p>
            </div>
            <span
              v-if="crit.requiresEvidence"
              class="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium flex items-center gap-1"
            >
              <AppIcon name="file-text" size="12" />
              <span>ต้องมีหลักฐาน</span>
            </span>
          </div>
        </div>

        <!-- Subitems Scoring Cards -->
        <div class="space-y-4">
          <div
            v-for="(sub, sIdx) in crit.subItems"
            :key="sub.id"
            class="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-4"
          >
            <!-- Title & Self vs Manager Score -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="flex items-start gap-2.5">
                <span class="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {{ sIdx + 1 }}
                </span>
                <div>
                  <p class="text-sm font-semibold text-slate-900 leading-snug">
                    {{ sub.name }}
                  </p>
                  <span class="text-[11px] text-slate-400">
                    ประเภท: {{ sub.type === 'document' ? 'เอกสาร/หลักฐาน' : 'ระดับคะแนนปฏิบัติงาน' }}
                  </span>
                </div>
              </div>

              <!-- Score Control Panel -->
              <div class="flex flex-wrap items-center gap-4 self-end lg:self-auto">
                <!-- Self Score (Readonly for Assessor) -->
                <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <span class="text-[11px] text-slate-400 font-medium">คะแนนตนเอง:</span>
                  <span class="font-bold text-xs text-slate-800">
                    {{ getSelfScore(crit.id, sub.id) !== null ? `${getSelfScore(crit.id, sub.id)} / 5` : 'ยังไม่ประเมิน' }}
                  </span>
                </div>

                <!-- Assessor/Manager Score Buttons -->
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-semibold text-brand-700 mr-1">คะแนนผู้ประเมิน:</span>
                  <button
                    v-for="val in [1, 2, 3, 4, 5]"
                    :key="val"
                    type="button"
                    class="w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center"
                    :class="getManagerScore(crit.id, sub.id) === val
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:bg-brand-50'"
                    @click="setManagerScore(crit.id, sub.id, val)"
                  >
                    {{ val }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes & Attached Document by Employee -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div class="p-3 rounded-xl bg-white border border-slate-200">
                <p class="text-[11px] font-semibold text-slate-500 mb-1">
                  ข้อความผลงาน / เอกสารที่พนักงานระบุ:
                </p>
                <p class="text-slate-800 whitespace-pre-wrap">
                  {{ getNote(crit.id, sub.id) || 'ไม่มีข้อความระบุ' }}
                </p>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                  ข้อเสนอแนะจากผู้ประเมิน (Assessor Note)
                </label>
                <input
                  :value="getNote(crit.id, sub.id)"
                  type="text"
                  placeholder="เพิ่มข้อเสนอแนะหรือบันทึกของผู้ประเมิน"
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  @input="setNote(crit.id, sub.id, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="sticky bottom-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-4">
        <p class="text-xs text-slate-500 hidden sm:block">
          บันทึกคะแนนเพื่ออัปเดตระบบ หรือกด "ยืนยันผลการประเมิน" เพื่อเปลี่ยนสถานะเป็น Completed
        </p>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            :disabled="saving"
            class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            @click="handleSaveScores(false)"
          >
            <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกคะแนน (Save Scores)' }}</span>
          </button>

          <button
            type="button"
            :disabled="saving"
            class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            @click="handleSaveScores(true)"
          >
            <AppIcon name="check" size="14" />
            <span>ยืนยันผลการประเมิน (Complete)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const evalId = Number(route.params.id);

const { getEvaluations, getCriteria, getScores, saveScores, submitEvaluation } = useEvaluation();

const loading = ref(true);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const evaluation = ref<any>(null);
const criteriaList = ref<any[]>([]);
const scoreRecords = ref<Record<string, { selfScore: number | null; managerScore: number | null; note: string }>>({});

const isCompleted = computed(() => evaluation.value?.status === 'completed');

onMounted(async () => {
  await loadEvaluationDetails();
});

const loadEvaluationDetails = async () => {
  loading.value = true;
  try {
    const [evals, criteria, scores] = await Promise.all([
      getEvaluations().catch(() => []),
      getCriteria().catch(() => []),
      getScores(evalId).catch(() => [])
    ]);

    evaluation.value = evals.find((e: any) => e.id === evalId) || null;
    criteriaList.value = criteria || [];

    const records: Record<string, any> = {};
    for (const s of scores) {
      records[`${s.criteriaId}_${s.subitemId}`] = {
        selfScore: s.selfScore,
        managerScore: s.managerScore,
        note: s.note || ''
      };
    }
    scoreRecords.value = records;
  } catch (err: any) {
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  } finally {
    loading.value = false;
  }
};

const getSelfScore = (criteriaId: number, subitemId: number) => {
  return scoreRecords.value[`${criteriaId}_${subitemId}`]?.selfScore ?? null;
};

const getManagerScore = (criteriaId: number, subitemId: number) => {
  return scoreRecords.value[`${criteriaId}_${subitemId}`]?.managerScore ?? null;
};

const setManagerScore = (criteriaId: number, subitemId: number, val: number) => {
  const key = `${criteriaId}_${subitemId}`;
  if (!scoreRecords.value[key]) {
    scoreRecords.value[key] = { selfScore: null, managerScore: null, note: '' };
  }
  scoreRecords.value[key].managerScore = val;
};

const getNote = (criteriaId: number, subitemId: number) => {
  return scoreRecords.value[`${criteriaId}_${subitemId}`]?.note ?? '';
};

const setNote = (criteriaId: number, subitemId: number, val: string) => {
  const key = `${criteriaId}_${subitemId}`;
  if (!scoreRecords.value[key]) {
    scoreRecords.value[key] = { selfScore: null, managerScore: null, note: '' };
  }
  scoreRecords.value[key].note = val;
};

const avgSelfScore = computed(() => {
  let sum = 0;
  let count = 0;
  for (const c of criteriaList.value) {
    for (const s of c.subItems || []) {
      const v = getSelfScore(c.id, s.id);
      if (v !== null) {
        sum += v;
        count++;
      }
    }
  }
  return count > 0 ? (sum / count).toFixed(1) : '-';
});

const avgManagerScore = computed(() => {
  let sum = 0;
  let count = 0;
  for (const c of criteriaList.value) {
    for (const s of c.subItems || []) {
      const v = getManagerScore(c.id, s.id);
      if (v !== null) {
        sum += v;
        count++;
      }
    }
  }
  return count > 0 ? (sum / count).toFixed(1) : '-';
});

const handleSaveScores = async (finalize: boolean) => {
  if (finalize && !confirm('คุณต้องการยืนยันและปิดผลการประเมินสำหรับบุคลากรคนนี้ใช่หรือไม่?')) {
    return;
  }

  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    const scoresToSave: any[] = [];
    for (const c of criteriaList.value) {
      for (const s of c.subItems || []) {
        const key = `${c.id}_${s.id}`;
        const record = scoreRecords.value[key];
        if (record) {
          scoresToSave.push({
            criteriaId: c.id,
            subitemId: s.id,
            selfScore: record.selfScore ?? null,
            managerScore: record.managerScore ?? null,
            note: record.note || null
          });
        }
      }
    }

    if (scoresToSave.length > 0) {
      await saveScores(evalId, scoresToSave);
    }

    if (finalize) {
      await submitEvaluation(evalId);
      if (evaluation.value) evaluation.value.status = 'completed';
      successMsg.value = 'อนุมัติและปิดผลการประเมินเรียบร้อยแล้ว!';
    } else {
      successMsg.value = 'บันทึกคะแนนผู้ประเมินสำเร็จ';
    }

    setTimeout(() => {
      successMsg.value = '';
    }, 4000);
  } catch (err: any) {
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการบันทึกคะแนน';
  } finally {
    saving.value = false;
  }
};
</script>
