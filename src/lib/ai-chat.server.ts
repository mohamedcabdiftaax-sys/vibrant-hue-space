import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TOOLS = [
  {
    name: "search_student",
    description: "Raadi arday (ama dhowr arday) magacooda. Soo celi liiska ardayda la mid ah.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Magaca ardayga ama qayb ka mid ah" } },
      required: ["query"],
    },
  },
  {
    name: "get_student_detail",
    description: "Hel xog faahfaahsan oo ku saabsan hal arday: macluumaadka guud, casharrada Qur'aan/Farbar ee dhawaan, xaalada lacagta, iyo dacwooyinka/anshaxa.",
    input_schema: {
      type: "object",
      properties: { student_id: { type: "string" } },
      required: ["student_id"],
    },
  },
  {
    name: "register_student",
    description: "Diiwaangeli arday cusub oo ku jira nidaamka dugsiga.",
    input_schema: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        dob: { type: "string", description: "YYYY-MM-DD, ikhtiyaari" },
        gender: { type: "string", enum: ["Lab", "Dheddig"] },
        father_name: { type: "string" },
        mother_name: { type: "string" },
        contact_primary: { type: "string" },
        home_address: { type: "string" },
        grade_level: { type: "number" },
        program_xanaano: { type: "boolean" },
        program_boarding: { type: "boolean" },
        program_quran: { type: "boolean" },
        uses_bus: { type: "boolean" },
      },
      required: ["full_name"],
    },
  },
  {
    name: "search_staff",
    description: "Raadi shaqaale (macalin, maamule, iwm) magacooda.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "financial_summary",
    description: "Hel guudmar maaliyadeed (lacagaha la helay iyo kharashka) udhaxaysiisa laba taariikhood.",
    input_schema: {
      type: "object",
      properties: {
        from_date: { type: "string", description: "YYYY-MM-DD" },
        to_date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["from_date", "to_date"],
    },
  },
] as const;

async function runTool(supabase: any, name: string, input: any) {
  switch (name) {
    case "search_student": {
      const { data } = await supabase
        .from("students")
        .select("id, full_name, grade_level, contact_primary, is_active")
        .ilike("full_name", `%${input.query}%`)
        .limit(10);
      return data || [];
    }
    case "get_student_detail": {
      const { data: student } = await supabase.from("students").select("*").eq("id", input.student_id).maybeSingle();
      const { data: quran } = await supabase.from("quran_records").select("*").eq("student_id", input.student_id).order("record_date", { ascending: false }).limit(5);
      const { data: payments } = await supabase.from("tuition_payments").select("*").eq("student_id", input.student_id).order("payment_date", { ascending: false }).limit(5);
      const { data: incidents } = await supabase.from("incidents").select("*").eq("student_id", input.student_id).order("incident_date", { ascending: false }).limit(5);
      return { student, recent_quran_lessons: quran || [], recent_payments: payments || [], incidents: incidents || [] };
    }
    case "register_student": {
      const { data, error } = await supabase.from("students").insert(input).select().single();
      if (error) return { error: error.message };
      return { success: true, student: data };
    }
    case "search_staff": {
      const { data } = await supabase.from("staff").select("id, full_name, role, department, contact").ilike("full_name", `%${input.query}%`).limit(10);
      return data || [];
    }
    case "financial_summary": {
      const { data: expenses } = await supabase.from("expenses").select("amount, category").gte("expense_date", input.from_date).lte("expense_date", input.to_date);
      const { data: payments } = await supabase.from("tuition_payments").select("amount").eq("paid", true).gte("payment_date", input.from_date).lte("payment_date", input.to_date);
      const totalExpenses = (expenses || []).reduce((s: number, e: any) => s + Number(e.amount), 0);
      const totalIncome = (payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
      return { total_income: totalIncome, total_expenses: totalExpenses, net: totalIncome - totalExpenses, expense_count: (expenses || []).length, payment_count: (payments || []).length };
    }
    default:
      return { error: "Unknown tool" };
  }
}

export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { messages: { role: "user" | "assistant"; content: any }[] }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (roleRows || []).map((r: any) => r.role);
    if (!roles.includes("maamule") && !roles.includes("maaliyadda")) {
      throw new Error("Forbidden: AI assistant-ka waxaa kaliya isticmaali kara Maamule iyo Maaliyadda.");
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY lama dejin. Maamulaha dugsiga: ku dar environment variable-kan Netlify si AI-ga uu u shaqeeyo.");
    }

    let messages = [...data.messages];
    const systemPrompt = `Waxaad tahay agent AI ah oo gargaaraya maamulka dugsiga "New Generation International School". Waxaad ka jawaabtaa su'aalaha luqadda Soomaaliga ah. Waxaad awoodaa inaad raadiso/diyaariso xogta ardayda iyo waxbarashadooda, diiwaangeliso arday cusub, raadiso shaqaalaha, iyo inaad bixiso guudmar maaliyadeed. Marka aad u baahato xog database-ka, isticmaal tools-ka la siiyay. Marka aad diiwaangelinayso arday cusub, hubi magaca buuxa ugu yaraan ka hor intaadan tool-ka wici. Jawaabahaaga ka dhig kuwo gaaban, sax ah, oo isticmaale-ku-friendly ah.`;

    for (let iterations = 0; iterations < 6; iterations++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: systemPrompt,
          messages,
          tools: TOOLS,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API error: ${errText}`);
      }
      const result = await res.json();
      const toolUses = (result.content || []).filter((c: any) => c.type === "tool_use");

      if (toolUses.length === 0) {
        const textBlocks = (result.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text);
        return { reply: textBlocks.join("\n\n") };
      }

      messages.push({ role: "assistant", content: result.content });
      const toolResults = [];
      for (const tu of toolUses) {
        const out = await runTool(supabase, tu.name, tu.input);
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(out) });
      }
      messages.push({ role: "user", content: toolResults } as any);
    }
    return { reply: "Waan ka xumahay, su'aasha way adag tahay. Fadlan isku day mar kale si kale." };
  });
