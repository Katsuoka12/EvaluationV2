const db = require("../config/db");

// GET /api/evaluation -> list all evaluations (กรองไม่แสดง role admin)
exports.getEvaluations = async (req, res) => {
  try {
    const rows = await db("evaluations as e")
      .leftJoin("users as u", "u.id", "e.employee_id")
      .where((builder) => {
        builder.whereNull("u.role").orWhere("u.role", "<>", "admin");
      })
      .select(
        "e.id",
        "e.employee_name as employee",
        "e.position_name as position",
        db.raw("NULL as period"),
        "e.status"
      )
      .orderBy("e.id", "desc");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Scores per evaluation / criteria / subitem =====

// GET /api/evaluation/:id/scores -> list scores for one evaluation
exports.getScoresForEvaluation = async (req, res) => {
  try {
    const { id } = req.params; // evaluation id
    const rows = await db("evaluation_scores as es")
      .leftJoin("evaluation_subitems as sub", "sub.id", "es.subitem_id")
      .select(
        db.raw("COALESCE(sub.criteria_id, 0) as criteriaId"),
        "es.subitem_id as subitemId",
        "es.self_score as selfScore",
        "es.supervisor_score as managerScore",
        "es.document_url as note"
      )
      .where("es.evaluation_id", id);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/:id/scores
// body: { scores: [{ criteriaId, subitemId, selfScore, managerScore, note }] }
exports.saveScoresForEvaluation = async (req, res) => {
  try {
    const { id } = req.params; // evaluation id
    const { scores } = req.body;

    if (!Array.isArray(scores)) {
      return res.status(400).json({ message: "scores must be an array" });
    }

    for (const s of scores) {
      if (!s || !s.subitemId) continue;

      const existing = await db("evaluation_scores")
        .where({ evaluation_id: id, subitem_id: s.subitemId })
        .first();

      const updateData = {};
      if (s.selfScore !== undefined) updateData.self_score = s.selfScore;
      if (s.managerScore !== undefined) updateData.supervisor_score = s.managerScore;
      if (s.note !== undefined) updateData.document_url = s.note;

      if (existing) {
        await db("evaluation_scores")
          .where({ id: existing.id })
          .update(updateData);
      } else {
        await db("evaluation_scores").insert({
          evaluation_id: id,
          subitem_id: s.subitemId,
          self_score: s.selfScore ?? null,
          supervisor_score: s.managerScore ?? null,
          document_url: s.note ?? null,
        });
      }
    }

    res.json({ message: "scores saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/evaluation/criteria/:id
exports.updateCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, requiresEvidence, subItems, periodStart, periodEnd } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    // อัปเดตหัวข้อหลัก
    const affectedRows = await db("evaluation_criteria")
      .where({ id })
      .update({
        name,
        description: description || "",
        requires_evidence: requiresEvidence ? 1 : 0,
        period_start: periodStart || null,
        period_end: periodEnd || null,
      });

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    let newSubItems = [];
    if (Array.isArray(subItems)) {
      // ลบ subitems เดิมทั้งหมด แล้วเพิ่มใหม่ตามที่ frontend ส่งมา
      await db("evaluation_subitems").where({ criteria_id: id }).del();

      for (const s of subItems) {
        if (!s || !s.name) continue;
        const itemType = s.type === "document" ? "document" : "score";
        const [insertId] = await db("evaluation_subitems").insert({
          criteria_id: id,
          name: s.name,
          item_type: itemType,
        });
        newSubItems.push({ id: insertId, name: s.name, type: itemType });
      }
    }

    res.json({
      id: Number(id),
      name,
      description: description || "",
      requiresEvidence: !!requiresEvidence,
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
      subItems: newSubItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/evaluation/periods/:id
exports.deletePeriod = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await db("evaluation_periods").where({ id }).del();

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Period not found" });
    }

    res.json({ message: "period deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/evaluation/positions -> list positions and employees from profiles (เฉพาะ role = 'user')
exports.getPositionsForEvaluation = async (req, res) => {
  try {
    // ใช้ join กับตาราง users เพื่อกรองเฉพาะผู้ใช้ที่มี role = 'user'
    // ส่ง userId กลับไปให้ frontend ด้วยเพื่อใช้ map กับการตั้งค่าหัวข้อ
    const rows = await db("profiles as p")
      .join("users as u", "u.id", "p.user_id")
      .select("u.id as userId", "p.full_name as employee", "p.position")
      .whereNotNull("p.position")
      .where("p.position", "<>", "")
      .where("u.role", "user")
      .orderBy([
        { column: "p.position", order: "asc" },
        { column: "p.full_name", order: "asc" },
      ]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Periods =====

// GET /api/evaluation/periods
exports.getPeriods = async (req, res) => {
  try {
    const rows = await db("evaluation_periods")
      .select(
        "id",
        "name",
        "start_date as startDate",
        "end_date as endDate",
        "status"
      )
      .orderBy("id", "desc");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/periods
exports.createPeriod = async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "name, startDate, endDate are required" });
    }

    const [id] = await db("evaluation_periods").insert({
      name,
      start_date: startDate,
      end_date: endDate,
      status: status || "draft",
    });

    res.status(201).json({
      id,
      name,
      startDate,
      endDate,
      status: status || "draft",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Criteria & Subitems =====

// GET /api/evaluation/criteria -> return criteria with subitems
exports.getCriteriaWithSubitems = async (req, res) => {
  try {
    const criteriaRows = await db("evaluation_criteria")
      .select(
        "id",
        "name",
        "description",
        "requires_evidence as requiresEvidence",
        "period_start as periodStart",
        "period_end as periodEnd"
      )
      .orderBy("id", "asc");

    const subitemRows = await db("evaluation_subitems")
      .select(
        "id",
        "criteria_id as criteriaId",
        "name",
        "item_type as itemType"
      )
      .orderBy("id", "asc");

    const criteria = criteriaRows.map((c) => ({
      ...c,
      requiresEvidence: !!c.requiresEvidence,
      subItems: subitemRows
        .filter((s) => s.criteriaId === c.id)
        .map((s) => ({ id: s.id, name: s.name, type: s.itemType })),
    }));

    res.json(criteria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/criteria
exports.createCriteria = async (req, res) => {
  try {
    const { name, description, requiresEvidence, periodStart, periodEnd } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const [id] = await db("evaluation_criteria").insert({
      name,
      description: description || "",
      requires_evidence: requiresEvidence ? 1 : 0,
      period_start: periodStart || null,
      period_end: periodEnd || null,
    });

    res.status(201).json({
      id,
      name,
      description: description || "",
      requiresEvidence: !!requiresEvidence,
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
      subItems: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/evaluation/criteria/:id
exports.deleteCriteria = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await db("evaluation_criteria").where({ id }).del();

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    res.json({ message: "criteria deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/criteria/:id/subitems
exports.createSubitem = async (req, res) => {
  try {
    const { id } = req.params; // criteria id
    const { name, type } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const itemType = type === "document" ? "document" : "score";

    const [insertId] = await db("evaluation_subitems").insert({
      criteria_id: id,
      name,
      item_type: itemType,
    });

    res.status(201).json({
      id: insertId,
      name,
      type: itemType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation -> start new evaluation
// body: { employee, position, periodId }
exports.startEvaluation = async (req, res) => {
  try {
    const { employee, position, periodId, employeeId } = req.body;
    if (!employee || !position || !periodId) {
      return res
        .status(400)
        .json({ message: "employee, position and periodId are required" });
    }

    // กำหนด employee_id ให้ตรงกับ users table
    let targetEmployeeId = employeeId;
    if (!targetEmployeeId) {
      const userByName = await db("users").where({ username: employee }).first();
      if (userByName) {
        targetEmployeeId = userByName.id;
      } else {
        const profileByName = await db("profiles").where({ full_name: employee }).first();
        if (profileByName) {
          targetEmployeeId = profileByName.user_id;
        } else {
          targetEmployeeId = req.user?.id;
        }
      }
    }

    // ห้ามประเมิน admin: ตรวจสอบว่า targetEmployee เป็น admin หรือไม่
    if (targetEmployeeId) {
      const targetUser = await db("users").where({ id: targetEmployeeId }).first();
      if (targetUser && targetUser.role === "admin") {
        return res.status(400).json({
          message: "ไม่อนุญาตให้ประเมินผู้ดูแลระบบ (Admin ไม่สามารถรับการประเมินได้)"
        });
      }
    } else if (req.user?.role === "admin") {
      return res.status(400).json({
        message: "ไม่อนุญาตให้ประเมินผู้ดูแลระบบ (Admin ไม่สามารถรับการประเมินได้)"
      });
    }

    const [id] = await db("evaluations").insert({
      period_id: periodId,
      employee_id: targetEmployeeId,
      position_name: position,
      status: "in-progress",
      employee_name: employee,
    });

    const newEval = {
      id,
      employee,
      position,
      period: null,
      status: "in-progress",
    };

    res.status(201).json(newEval);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/evaluation/:id/submit -> mark as completed
exports.submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await db("evaluations")
      .where({ id })
      .update({ status: "completed" });

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    res.json({ message: "evaluation submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Position / Employee / Criteria Mapping =====

// POST /api/evaluation/position-config
// body: { positionName: string, employeeIds: number[], criteriaIds: number[] }
// บันทึก mapping user_id -> criteria_id ตามที่เลือกจากหน้า ตำแหน่งและบุคลากร
exports.savePositionConfig = async (req, res) => {
  try {
    const { positionName, employeeIds, criteriaIds } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res
        .status(400)
        .json({ message: "employeeIds must be a non-empty array" });
    }
    if (!Array.isArray(criteriaIds) || criteriaIds.length === 0) {
      return res
        .status(400)
        .json({ message: "criteriaIds must be a non-empty array" });
    }

    // ลบ mapping เดิมของ user เหล่านี้ทั้งหมดก่อน แล้วค่อยใส่ใหม่
    await db("evaluation_employee_criteria")
      .whereIn("user_id", employeeIds)
      .del();

    // แทรก mapping ใหม่
    const insertRows = [];
    for (const userId of employeeIds) {
      for (const criteriaId of criteriaIds) {
        insertRows.push({ user_id: userId, criteria_id: criteriaId });
      }
    }

    if (insertRows.length > 0) {
      await db("evaluation_employee_criteria").insert(insertRows);
    }

    res.json({ message: "position config saved", positionName, employeeCount: employeeIds.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/evaluation/my-criteria -> return list of criteria_id for current user
exports.getMyCriteriaIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await db("evaluation_employee_criteria")
      .select("criteria_id")
      .where({ user_id: userId });
    const ids = rows.map((r) => r.criteria_id);
    res.json(ids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/evaluation/employee-criteria -> return all mappings { userId, criteriaId }
exports.getAllEmployeeCriteria = async (req, res) => {
  try {
    const rows = await db("evaluation_employee_criteria").select(
      "user_id as userId",
      "criteria_id as criteriaId"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

