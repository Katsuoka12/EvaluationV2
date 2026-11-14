<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header Banner -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
          <AppIcon name="clipboard-check" size="14" />
          <span>แบบประเมินตนเอง (Self Appraisal)</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
          ประเมินผลการปฏิบัติงานของตนเอง
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          ผู้รับการประเมิน: <span class="font-semibold text-slate-800">{{ displayName }}</span> &bull; ตำแหน่ง: <span class="font-semibold text-slate-800">{{ profile.position || 'ทั่วไป' }}</span>
        </p>
      </div>

      <!-- Status Indicator -->
      <div class="flex items-center gap-3">
        <div
          v-if="evaluation"
          class="px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2"
          :class="isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
        >
          <span class="w-2 h-2 rounded-full" :class="isCompleted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'" />
          <span>{{ isCompleted ? 'ส่งผลการประเมินแล้ว (Completed)' : 'กำลังทำแบบประเมิน (In Progress)' }}</span>
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

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center text-slate-400">
      <span class="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
      <p class="text-sm">กำลังโหลดหัวข้อเกณฑ์การประเมิน...</p>
    </div>

    <!-- No Active Period or Criteria Warning -->
    <div
      v-else-if="filteredCriteria.length === 0"
      class="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm"
    >
      <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <AppIcon name="info" size="32" />
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-2">ยังไม่มีเกณฑ์การประเมินสำหรับคุณ</h3>
      <p class="text-sm text-slate-500 max-w-md mx-auto">
        ยังไม่มีเกณฑ์ที่ผูกกับตำแหน่งของคุณในระบบ กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อกำหนดเกณฑ์การประเมิน
      </p>
    </div>

    <!-- Criteria and Subitems List -->
    <div v-else class="space-y-6">
      <!-- Progress Bar & Score Summary -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex-1 w-full">
          <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>ความคืบหน้าการให้คะแนน</span>
            <span class="text-brand-600">{{ scoredCount }} / {{ totalItemsCount }} ข้อ ({{ scorePercent }}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              class="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${scorePercent}%` }"
            />
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <div class="text-right">
            <p class="text-[11px] text-slate-400 font-medium">คะแนนรวมเฉลี่ยตนเอง</p>
            <p class="text-xl font-black text-slate-900">
              {{ averageSelfScore }} <span class="text-xs font-normal text-slate-400">/ 5.0</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Criteria Cards -->
      <div
        v-for="(crit, cIdx) in filteredCriteria"
        :key="crit.id"
        class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5"
      >
        <!-- Criteria Title & Description -->
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

        <!-- Subitems -->
        <div class="space-y-6">
          <div
            v-for="(sub, sIdx) in crit.subItems"
            :key="sub.id"
            class="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-start gap-2.5">
                <span class="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {{ sIdx + 1 }}
                </span>
                <div>
                  <p class="text-sm font-semibold text-slate-900 leading-snug">
                    {{ sub.name }}
                  </p>
                  <span class="text-[11px] text-slate-400">
                    ประเภท: {{ sub.type === 'document' ? 'เอกสาร/หลักฐาน' : 'ประเมินระดับคะแนน' }}
                  </span>
                </div>
              </div>

              <!-- Rating Buttons (1 to 5) -->
              <div class="flex items-center gap-1.5 self-end sm:self-auto">
                <span class="text-xs text-slate-400 mr-1 hidden sm:inline">คะแนน:</span>
                <button
                  v-for="val in [1, 2, 3, 4, 5]"
                  :key="val"
                  type="button"
                  :disabled="isCompleted"
                  class="w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center"
                  :class="getScoreVal(crit.id, sub.id) === val
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 disabled:hover:bg-white'"
                  @click="setScoreVal(crit.id, sub.id, val)"
                >
                  {{ val }}
                </button>
              </div>
            </div>

            <!-- Notes & Evidence URL Input -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                  หมายเหตุ / ผลการดำเนินงาน
                </label>
                <input
                  :value="getNoteVal(crit.id, sub.id)"
                  :disabled="isCompleted"
                  type="text"
                  placeholder="ระบุรายละเอียดผลการปฏิบัติงานพอสังเขป"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
                  @input="setNoteVal(crit.id, sub.id, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div v-if="crit.requiresEvidence || sub.type === 'document'">
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                  ลิงก์เอกสารหลักฐาน (Document / Link URL)
                </label>
                <input
                  :value="getEvidenceVal(crit.id, sub.id)"
                  :disabled="isCompleted"
                  type="text"
                  placeholder="https://drive.google.com/... หรือลิงก์แนบ"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
                  @input="setEvidenceVal(crit.id, sub.id, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer (Save Draft / Submit) -->
      <div v-if="!isCompleted" class="sticky bottom-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-4">
        <p class="text-xs text-slate-500 hidden sm:block">
          บันทึกแบบร่างสามารถกลับมาแก้ไขได้ตลอดจนกว่าจะกด "ส่งผลการประเมิน"
        </p>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            :disabled="saving"
            class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            @click="handleSave(false)"
          >
            <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง (Save Draft)' }}</span>
          </button>

          <button
            type="button"
            :disabled="saving || scoredCount === 0"
            class="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            @click="handleSave(true)"
          >
            <AppIcon name="check" size="14" />
            <span>ส่งผลการประเมิน (Submit)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { displayName, profile, fetchProfile } = useAuth();
const {
  getPeriods,
  getCriteria,
  getMyCriteriaIds,
  getEvaluations,
  startEvaluation,
  getScores,
  saveScores,
  submitEvaluation
} = useEvaluation();

const loading = ref(true);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const allCriteria = ref<any[]>([]);
const myCriteriaIds = ref<number[]>([]);
const evaluation = ref<any>(null);
const scoreRecords = ref<Record<string, { selfScore: number | null; note: string; managerScore: number | null }>>({});

const isCompleted = computed(() => evaluation.value?.status === 'completed');

onMounted(async () => {
  await fetchProfile();
  await loadEvaluationSession();
});

const loadEvaluationSession = async () => {
  loading.value = true;
  try {
    const [periods, criteria, myIds, evals] = await Promise.all([
      getPeriods().catch(() => []),
      getCriteria().catch(() => []),
      getMyCriteriaIds().catch(() => []),
      getEvaluations().catch(() => [])
    ]);

    allCriteria.value = criteria || [];
    myCriteriaIds.value = myIds || [];

    const activePeriod = periods.find((p: any) => p.status === 'active') || periods[0];
    if (!activePeriod) {
      errorMsg.value = 'ไม่พบรอบการประเมินที่เปิดใช้งานในระบบ';
      return;
    }

    // Find if current user already has an evaluation
    const myName = displayName.value;
    let myEval = evals.find((e: any) => e.employee === myName);

    // If not found, create one automatically
    if (!myEval) {
      myEval = await startEvaluation({
        employee: myName,
        position: profile.value.position || 'ทั่วไป',
        periodId: activePeriod.id
      });
    }

    evaluation.value = myEval;

    // Load saved scores
    if (myEval?.id) {
      const savedScores = await getScores(myEval.id);
      const records: Record<string, any> = {};
      for (const s of savedScores) {
        records[`${s.criteriaId}_${s.subitemId}`] = {
          selfScore: s.selfScore,
          managerScore: s.managerScore,
          note: s.note || ''
        };
      }
      scoreRecords.value = records;
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการโหลดแบบประเมิน';
  } finally {
    loading.value = false;
  }
};

const filteredCriteria = computed(() => {
  if (myCriteriaIds.value.length === 0) {
    return allCriteria.value;
  }
  return allCriteria.value.filter((c) => myCriteriaIds.value.includes(c.id));
});

const getScoreVal = (criteriaId: number, subitemId: number) => {
  return scoreRecords.value[`${criteriaId}_${subitemId}`]?.selfScore ?? null;
};

const setScoreVal = (criteriaId: number, subitemId: number, val: number) => {
  const key = `${criteriaId}_${subitemId}`;
  if (!scoreRecords.value[key]) {
    scoreRecords.value[key] = { selfScore: null, managerScore: null, note: '' };
  }
  scoreRecords.value[key].selfScore = val;
};

const getNoteVal = (criteriaId: number, subitemId: number) => {
  return scoreRecords.value[`${criteriaId}_${subitemId}`]?.note ?? '';
};

const setNoteVal = (criteriaId: number, subitemId: number, val: string) => {
  const key = `${criteriaId}_${subitemId}`;
  if (!scoreRecords.value[key]) {
    scoreRecords.value[key] = { selfScore: null, managerScore: null, note: '' };
  }
  scoreRecords.value[key].note = val;
};

const getEvidenceVal = (criteriaId: number, subitemId: number) => {
  const note = scoreRecords.value[`${criteriaId}_${subitemId}`]?.note ?? '';
  const match = note.match(/\[เอกสาร: (.*?)\]/);
  return match ? match[1] : '';
};

const setEvidenceVal = (criteriaId: number, subitemId: number, val: string) => {
  const key = `${criteriaId}_${subitemId}`;
  if (!scoreRecords.value[key]) {
    scoreRecords.value[key] = { selfScore: null, managerScore: null, note: '' };
  }
  // Remove existing evidence tag if any and append new
  let currentNote = scoreRecords.value[key].note.replace(/\[เอกสาร: .*?\]/, '').trim();
  if (val.trim()) {
    currentNote = currentNote ? `${currentNote} [เอกสาร: ${val.trim()}]` : `[เอกสาร: ${val.trim()}]`;
  }
  scoreRecords.value[key].note = currentNote;
};

const totalItemsCount = computed(() => {
  return filteredCriteria.value.reduce((acc, c) => acc + (c.subItems?.length || 0), 0);
});

const scoredCount = computed(() => {
  let count = 0;
  for (const c of filteredCriteria.value) {
    for (const s of c.subItems || []) {
      if (getScoreVal(c.id, s.id) !== null) count++;
    }
  }
  return count;
});

const scorePercent = computed(() => {
  if (totalItemsCount.value === 0) return 0;
  return Math.round((scoredCount.value / totalItemsCount.value) * 100);
});

const averageSelfScore = computed(() => {
  let sum = 0;
  let count = 0;
  for (const c of filteredCriteria.value) {
    for (const s of c.subItems || []) {
      const v = getScoreVal(c.id, s.id);
      if (v !== null) {
        sum += v;
        count++;
      }
    }
  }
  return count > 0 ? (sum / count).toFixed(1) : '0.0';
});

const handleSave = async (submitFinal: boolean) => {
  if (!evaluation.value?.id) return;

  if (submitFinal && !confirm('คุณต้องการยืนยันการส่งผลการประเมินหรือไม่? หลังจากส่งแล้วจะไม่สามารถแก้ไขคะแนนตนเองได้')) {
    return;
  }

  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  try {
    // Format scores array
    const scoresToSave: any[] = [];
    for (const c of filteredCriteria.value) {
      for (const s of c.subItems || []) {
        const key = `${c.id}_${s.id}`;
        const record = scoreRecords.value[key];
        if (record && record.selfScore !== null) {
          scoresToSave.push({
            criteriaId: c.id,
            subitemId: s.id,
            selfScore: record.selfScore,
            managerScore: record.managerScore ?? null,
            note: record.note || null
          });
        }
      }
    }

    if (scoresToSave.length > 0) {
      await saveScores(evaluation.value.id, scoresToSave);
    }

    if (submitFinal) {
      await submitEvaluation(evaluation.value.id);
      evaluation.value.status = 'completed';
      successMsg.value = 'ส่งผลการประเมินเรียบร้อยแล้ว!';
    } else {
      successMsg.value = 'บันทึกแบบร่างสำเร็จเรียบร้อย';
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
