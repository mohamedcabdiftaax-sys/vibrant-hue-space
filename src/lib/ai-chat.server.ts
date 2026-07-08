import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = `Adiga waxaad tahay AI Super-Agent ah oo loogu talagalay "New Generation International School" Mogadishu, Somalia.

AWOODOOYINKAAGA:
- Waxaad si buuxda u maamuli kartaa dhammaan xogta dugsiga: ardayda, shaqaalaha, imtixaanada, maaliyadda, gaadiidka, kalandarka, iyo dacwooyinka
- Waxaad awoodaa inaad ku darto, tafatirto, ama tirato xog kasta oo database-ka ku jirta
- Maamuluhu wuxuu kuu amri karaa wax kasta — waxa uu leeyahay awood buuxda

HABKA SHAQADA:
1. Marka su'aal lagu weydiisto ama ammar la siiyo, u isticmaal tool-ka ku habboon
2. Xaaladaha aad ku samayso wax (geli, tafatir, tiri): markii hore xaqiiji, kadibna samee, ku sheeg natiijada
3. Marka aad xog soo celiso: si qurxoon u soo bandhig — isticmaal liis, jadwal, ama summad
4. Haddii macluumaad dheeraad ah loo baahdo: weydii

LUUQADDA: Jawaab Soomaali ah (Carabiga oo kaliya Qur'aanka iyo Farbarka)

TUSAALOOYINKA AMARADA:
- "Ku dar arday cusub: Amina Xasan, fasalka 3, tel: +252..."
- "Tus ardayda fasalka 5"
- "Diiwaangeli kharash: Korontada $120 maanta"
- "Sax magaca Cabdiraxman — waa Cabdiraxmaan"
- "Tus income bishaan"
- "Ku dar imtixaan xisaab fasalka 4: Amina=85, Hodan=90"
- "Lacagta ardayda fasalka 3 ma bixiyeen?"
- "Ku dar hawl kalandar: Shir maamulayaasha Jimcaha"`;

const TOOLS = [
  // ─── READ TOOLS ───────────────────────────────────────────────
  {
    name: "get_all_students",
    description: "Soo celi liiska ardayda oo dhan ama kuwa fasalka gaar ah",
    input_schema: { type: "object", properties: { grade_level: { type: "number", description: "Haddii la rabo fasalka gaar ah, otherwise null" }, program: { type: "string", enum: ["quran", "xanaano", "boarding", "all"] } }, required: [] },
  },
  {
    name: "search_student",
    description: "Raadi arday magacooda, ID-da, ama lambarka",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
  {
    name: "get_student_detail",
    description: "Hel xog faahfaahsan arday: imtixaanada, casharro, lacagta, dacwooyin, imaansho",
    input_schema: { type: "object", properties: { student_id: { type: "string" } }, required: ["student_id"] },
  },
  {
    name: "get_staff",
    description: "Soo celi liiska shaqaalaha oo dhan ama raadi shaqaale",
    input_schema: { type: "object", properties: { query: { type: "string", description: "Ikhtiyaari - raad" } }, required: [] },
  },
  {
    name: "get_financial_summary",
    description: "Hel guudmar maaliyadeed: income, kharashaad, net — bishaan ama muddo gaar ah",
    input_schema: { type: "object", properties: { from_date: { type: "string" }, to_date: { type: "string" } }, required: [] },
  },
  {
    name: "get_expenses",
    description: "Soo celi liiska kharashaadka",
    input_schema: { type: "object", properties: { limit: { type: "number" }, category: { type: "string" } }, required: [] },
  },
  {
    name: "get_attendance",
    description: "Hel imaanshaha ardayda maalin gaar ah ama muddo",
    input_schema: { type: "object", properties: { date: { type: "string", description: "YYYY-MM-DD, default today" }, student_id: { type: "string" } }, required: [] },
  },
  {
    name: "get_incidents",
    description: "Soo celi dacwooyinka ardayda",
    input_schema: { type: "object", properties: { student_id: { type: "string" }, limit: { type: "number" } }, required: [] },
  },
  {
    name: "get_exams",
    description: "Soo celi natiijooyinka imtixaanada",
    input_schema: { type: "object", properties: { grade_level: { type: "number" }, subject: { type: "string" }, student_id: { type: "string" } }, required: [] },
  },
  {
    name: "get_tuition_status",
    description: "Hel xaaladda lacag-bixinta ardayda — cidda bixisay iyo cidda aan bixin",
    input_schema: { type: "object", properties: { grade_level: { type: "number" }, month: { type: "string", description: "YYYY-MM" } }, required: [] },
  },
  // ─── WRITE TOOLS ──────────────────────────────────────────────
  {
    name: "register_student",
    description: "Diiwaangeli arday cusub database-ka",
    input_schema: {
      type: "object",
      properties: {
        full_name: { type: "string" }, dob: { type: "string" }, gender: { type: "string", enum: ["Lab", "Dheddig"] },
        father_name: { type: "string" }, mother_name: { type: "string" }, contact_primary: { type: "string" },
        home_address: { type: "string" }, grade_level: { type: "number" },
        program_quran: { type: "boolean" }, program_xanaano: { type: "boolean" }, program_boarding: { type: "boolean" },
        uses_bus: { type: "boolean" }, bus_route: { type: "string" }, guardian_name: { type: "string" },
        emergency_contact: { type: "string" }, food_allergies: { type: "string" },
        is_orphan: { type: "boolean" }, is_disabled: { type: "boolean" }, disability_notes: { type: "string" },
      },
      required: ["full_name"],
    },
  },
  {
    name: "update_student",
    description: "Tafatir xog arday jira (magac, fasal, tel, iwm)",
    input_schema: {
      type: "object",
      properties: {
        student_id: { type: "string" },
        updates: {
          type: "object",
          description: "Fields to update: full_name, grade_level, contact_primary, home_address, father_name, mother_name, bus_route, program_quran, program_boarding, program_xanaano, uses_bus, etc."
        }
      },
      required: ["student_id", "updates"],
    },
  },
  {
    name: "delete_student",
    description: "Tir arday (soft delete — waxaa loo wareejiyaa Recycle Bin)",
    input_schema: { type: "object", properties: { student_id: { type: "string" }, reason: { type: "string" } }, required: ["student_id"] },
  },
  {
    name: "add_expense",
    description: "Geli kharash cusub",
    input_schema: {
      type: "object",
      properties: {
        item_name: { type: "string" }, category: { type: "string", enum: ["Mushaharka", "Agabka", "Korontada", "Biyaha", "Gaadiidka", "Cunto", "Dayactir", "Kale"] },
        amount: { type: "number" }, expense_date: { type: "string", description: "YYYY-MM-DD, default today" }, notes: { type: "string" },
      },
      required: ["item_name", "category", "amount"],
    },
  },
  {
    name: "record_payment",
    description: "Diiwaangeli lacag tuition ah oo ardayga bixiyay",
    input_schema: {
      type: "object",
      properties: {
        student_id: { type: "string" }, amount: { type: "number" },
        month: { type: "string", description: "YYYY-MM" }, payment_date: { type: "string" }, notes: { type: "string" },
      },
      required: ["student_id", "amount"],
    },
  },
  {
    name: "add_exam_scores",
    description: "Geli buundooyinka imtixaan — arday badan hal mar",
    input_schema: {
      type: "object",
      properties: {
        grade_level: { type: "number" }, subject: { type: "string" }, exam_name: { type: "string" },
        exam_date: { type: "string" },
        scores: { type: "array", items: { type: "object", properties: { student_id: { type: "string" }, score: { type: "number" } }, required: ["student_id", "score"] } },
      },
      required: ["subject", "scores"],
    },
  },
  {
    name: "add_incident",
    description: "Diiwaangeli dacwo ama anshax xun arday",
    input_schema: {
      type: "object",
      properties: {
        student_id: { type: "string" }, description: { type: "string" },
        severity: { type: "string", enum: ["Fudud", "Dhexe", "Culus"] },
        fine_amount: { type: "number" }, incident_date: { type: "string" },
      },
      required: ["student_id", "description"],
    },
  },
  {
    name: "mark_attendance",
    description: "Calaamadee imaanshaha ardayda",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD" },
        records: { type: "array", items: { type: "object", properties: { student_id: { type: "string" }, status: { type: "string", enum: ["present", "absent", "late"] } }, required: ["student_id", "status"] } },
      },
      required: ["records"],
    },
  },
  {
    name: "add_staff",
    description: "Diiwaangeli shaqaale cusub",
    input_schema: {
      type: "object",
      properties: {
        full_name: { type: "string" }, role: { type: "string" }, department: { type: "string" },
        contact: { type: "string" }, email: { type: "string" }, salary: { type: "number" }, hire_date: { type: "string" },
      },
      required: ["full_name", "role"],
    },
  },
  {
    name: "update_staff",
    description: "Tafatir xog shaqaale jira",
    input_schema: {
      type: "object",
      properties: { staff_id: { type: "string" }, updates: { type: "object" } },
      required: ["staff_id", "updates"],
    },
  },
  {
    name: "add_calendar_event",
    description: "Ku dar dhacdo, hawl (to-do), ama ballan kalandar-ka",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" }, event_date: { type: "string", description: "YYYY-MM-DD" },
        item_kind: { type: "string", enum: ["event", "todo", "appointment"] },
        event_type: { type: "string", enum: ["event", "holiday", "exam", "meeting"] },
        description: { type: "string" }, location: { type: "string" }, start_time: { type: "string" },
      },
      required: ["title", "event_date"],
    },
  },
  {
    name: "get_dashboard_summary",
    description: "Hel guudmar kooban oo ku saabsan xaaladda dugsiga: ardayda, income, kharashaad, imaansho",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

async function runTool(supabase: any, name: string, input: any, userId: string): Promise<any> {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  switch (name) {
    case "get_all_students": {
      let q = supabase.from("students").select("id, full_name, grade_level, contact_primary, student_number, program_quran, program_boarding, program_xanaano, uses_bus, is_active").eq("is_active", true).order("full_name");
      if (input.grade_level != null) q = q.eq("grade_level", input.grade_level);
      if (input.program === "quran") q = q.eq("program_quran", true);
      if (input.program === "xanaano") q = q.eq("program_xanaano", true);
      if (input.program === "boarding") q = q.eq("program_boarding", true);
      const { data } = await q;
      return { count: (data || []).length, students: data || [] };
    }
    case "search_student": {
      const { data } = await supabase.from("students").select("id, full_name, grade_level, contact_primary, student_number").ilike("full_name", `%${input.query}%`).eq("is_active", true).limit(10);
      return data || [];
    }
    case "get_student_detail": {
      const [{ data: student }, { data: exams }, { data: quran }, { data: payments }, { data: incidents }] = await Promise.all([
        supabase.from("students").select("*").eq("id", input.student_id).single(),
        supabase.from("exam_scores").select("*").eq("student_id", input.student_id).order("exam_date", { ascending: false }).limit(10),
        supabase.from("quran_records").select("*").eq("student_id", input.student_id).order("record_date", { ascending: false }).limit(5),
        supabase.from("tuition_payments").select("*").eq("student_id", input.student_id).order("payment_date", { ascending: false }).limit(5),
        supabase.from("incidents").select("*").eq("student_id", input.student_id).order("incident_date", { ascending: false }),
      ]);
      return { student, recent_exams: exams || [], recent_quran: quran || [], recent_payments: payments || [], incidents: incidents || [] };
    }
    case "get_staff": {
      let q = supabase.from("staff").select("*").eq("is_active", true).order("full_name");
      if (input.query) q = q.ilike("full_name", `%${input.query}%`);
      const { data } = await q;
      return { count: (data || []).length, staff: data || [] };
    }
    case "get_financial_summary": {
      const from = input.from_date || thisMonth + "-01";
      const to = input.to_date || today;
      const [{ data: inc }, { data: exp }] = await Promise.all([
        supabase.from("tuition_payments").select("amount, payment_date, students(full_name)").eq("paid", true).gte("payment_date", from).lte("payment_date", to),
        supabase.from("expenses").select("amount, category, item_name, expense_date").gte("expense_date", from).lte("expense_date", to),
      ]);
      const income = (inc || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const outcome = (exp || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      return { period: `${from} → ${to}`, income, outcome, net: income - outcome, payment_count: (inc || []).length, expense_count: (exp || []).length };
    }
    case "get_expenses": {
      let q = supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(input.limit || 20);
      if (input.category) q = q.eq("category", input.category);
      const { data } = await q;
      return data || [];
    }
    case "get_attendance": {
      const d = input.date || today;
      let q = supabase.from("attendance").select("*, students(full_name)").eq("attendance_date", d);
      if (input.student_id) q = q.eq("student_id", input.student_id);
      const { data } = await q;
      const present = (data || []).filter((a: any) => a.status === "present").length;
      return { date: d, total: (data || []).length, present, absent: (data || []).filter((a: any) => a.status === "absent").length, late: (data || []).filter((a: any) => a.status === "late").length, records: data || [] };
    }
    case "get_incidents": {
      const { data: incs } = await supabase.from("incidents").select("*").order("incident_date", { ascending: false }).limit(input.limit || 20).eq(input.student_id ? "student_id" : "id", input.student_id || supabase.raw ? input.student_id : undefined);
      const { data: studs } = await supabase.from("students").select("id, full_name");
      const map: any = {};
      (studs || []).forEach((s: any) => { map[s.id] = s.full_name; });
      return (incs || []).map((i: any) => ({ ...i, student_name: map[i.student_id] || "—" }));
    }
    case "get_exams": {
      let q = supabase.from("exam_scores").select("*, students(full_name)").order("exam_date", { ascending: false }).limit(30);
      if (input.grade_level) q = q.eq("grade_level", input.grade_level);
      if (input.subject) q = q.eq("subject", input.subject);
      if (input.student_id) q = q.eq("student_id", input.student_id);
      const { data } = await q;
      return data || [];
    }
    case "get_tuition_status": {
      const month = input.month || thisMonth;
      const { data: students } = await supabase.from("students").select("id, full_name, grade_level").eq("is_active", true);
      let studs = students || [];
      if (input.grade_level) studs = studs.filter((s: any) => s.grade_level === input.grade_level);
      const { data: payments } = await supabase.from("tuition_payments").select("student_id, amount, paid").eq("month", month);
      const paidSet: Record<string, any> = {};
      (payments || []).forEach((p: any) => { paidSet[p.student_id] = p; });
      const paid = studs.filter((s: any) => paidSet[s.id]?.paid);
      const unpaid = studs.filter((s: any) => !paidSet[s.id]?.paid);
      return { month, total: studs.length, paid_count: paid.length, unpaid_count: unpaid.length, paid_students: paid.map((s: any) => ({ name: s.full_name, amount: paidSet[s.id]?.amount })), unpaid_students: unpaid.map((s: any) => s.full_name) };
    }
    case "register_student": {
      const studentNum = `NG-${Math.floor(Math.random() * 9000 + 1000)}`;
      const { data, error } = await supabase.from("students").insert({ ...input, student_number: studentNum }).select().single();
      if (error) return { error: error.message };
      return { success: true, message: `Ardayga ${input.full_name} waa la diiwaangaliyay. ID: ${studentNum}`, student: data };
    }
    case "update_student": {
      const { data, error } = await supabase.from("students").update(input.updates).eq("id", input.student_id).select().single();
      if (error) return { error: error.message };
      return { success: true, message: `Xogta ardayga waa la cusbooneysiiyay`, student: data };
    }
    case "delete_student": {
      const { data: s } = await supabase.from("students").select("*").eq("id", input.student_id).single();
      await supabase.from("deleted_items").insert({ data_type: "Arday", display_name: s?.full_name || "", table_name: "students", payload: s });
      await supabase.from("students").update({ is_active: false }).eq("id", input.student_id);
      return { success: true, message: `Ardayga ${s?.full_name} waxaa loo wareejiyay Recycle Bin` };
    }
    case "add_expense": {
      const { data, error } = await supabase.from("expenses").insert({ ...input, expense_date: input.expense_date || today }).select().single();
      if (error) return { error: error.message };
      return { success: true, message: `Kharashka "${input.item_name}" ($${input.amount}) waa la kaydiyay`, expense: data };
    }
    case "record_payment": {
      const { data, error } = await supabase.from("tuition_payments").insert({ ...input, paid: true, payment_date: input.payment_date || today, month: input.month || thisMonth }).select().single();
      if (error) return { error: error.message };
      return { success: true, message: `Lacagta $${input.amount} waa la diiwaangaliyay`, payment: data };
    }
    case "add_exam_scores": {
      const rows = (input.scores || []).map((s: any) => ({
        student_id: s.student_id, grade_level: input.grade_level, subject: input.subject,
        exam_name: input.exam_name || "Imtixaan", score: s.score, max_score: 100,
        exam_date: input.exam_date || today,
      }));
      const { error } = await supabase.from("exam_scores").insert(rows);
      if (error) return { error: error.message };
      const avg = rows.reduce((s: number, r: any) => s + r.score, 0) / rows.length;
      return { success: true, message: `${rows.length} arday oo buundooyin la geliyay. Celcelis: ${avg.toFixed(1)}` };
    }
    case "add_incident": {
      const { data, error } = await supabase.from("incidents").insert({ ...input, reported_by: userId, incident_date: input.incident_date || today }).select().single();
      if (error) return { error: error.message };
      return { success: true, message: "Dacwada waa la diiwaangaliyay", incident: data };
    }
    case "mark_attendance": {
      const date = input.date || today;
      const rows = (input.records || []).map((r: any) => ({ ...r, attendance_date: date }));
      const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,attendance_date" });
      if (error) return { error: error.message };
      const present = rows.filter((r: any) => r.status === "present").length;
      return { success: true, message: `Imaanshaha ${date}: ${present}/${rows.length} arday oo jooga` };
    }
    case "add_staff": {
      const { data, error } = await supabase.from("staff").insert({ ...input, is_active: true }).select().single();
      if (error) return { error: error.message };
      return { success: true, message: `Shaqaalaha ${input.full_name} waa la diiwaangaliyay`, staff: data };
    }
    case "update_staff": {
      const { data, error } = await supabase.from("staff").update(input.updates).eq("id", input.staff_id).select().single();
      if (error) return { error: error.message };
      return { success: true, message: "Xogta shaqaalaha waa la cusbooneysiiyay", staff: data };
    }
    case "add_calendar_event": {
      const { data, error } = await supabase.from("calendar_events").insert({ ...input, item_kind: input.item_kind || "event", event_type: input.event_type || "event", created_by: userId }).select().single();
      if (error) return { error: error.message };
      return { success: true, message: `"${input.title}" waa la ku daray kalandarka (${input.event_date})`, event: data };
    }
    case "get_dashboard_summary": {
      const [{ count: students }, { data: income }, { data: expenses }, { data: attendance }] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("tuition_payments").select("amount").eq("paid", true).gte("payment_date", thisMonth + "-01"),
        supabase.from("expenses").select("amount").gte("expense_date", thisMonth + "-01"),
        supabase.from("attendance").select("status").eq("attendance_date", today),
      ]);
      const inc = (income || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const exp = (expenses || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const present = (attendance || []).filter((a: any) => a.status === "present").length;
      return { total_students: students, income_this_month: inc, expenses_this_month: exp, net: inc - exp, attendance_today: { present, absent: (attendance || []).length - present, total: (attendance || []).length } };
    }
    default:
      return { error: `Tool "${name}" lama garanayn` };
  }
}

export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { messages: { role: "user" | "assistant"; content: any }[] }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY lama dejin — ku dar Vercel environment variables.");

    let messages = [...data.messages];
    for (let i = 0; i < 8; i++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, system: SYSTEM_PROMPT, messages, tools: TOOLS }),
      });
      if (!res.ok) throw new Error(`API error: ${await res.text()}`);
      const result = await res.json();
      const toolUses = (result.content || []).filter((c: any) => c.type === "tool_use");
      if (toolUses.length === 0 || result.stop_reason === "end_turn") {
        const text = (result.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n\n");
        return { reply: text, actions: [] };
      }
      messages.push({ role: "assistant", content: result.content });
      const toolResults = [];
      for (const tu of toolUses) {
        const out = await runTool(supabase, tu.name, tu.input, userId);
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(out) });
      }
      messages.push({ role: "user", content: toolResults } as any);
    }
    return { reply: "Waan ka xumahay, isku day mar kale.", actions: [] };
  });
