export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bus_routes: {
        Row: {
          bus_number: string | null
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          id: string
          route_name: string
          updated_at: string
        }
        Insert: {
          bus_number?: string | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          route_name: string
          updated_at?: string
        }
        Update: {
          bus_number?: string | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          route_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          assigned_to: string | null
          completed: boolean
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          item_kind: string
          location: string | null
          start_time: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          item_kind?: string
          location?: string | null
          start_time?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          item_kind?: string
          location?: string | null
          start_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          grade_level: number
          id: string
          period: number
          subject: string | null
          teacher: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          grade_level: number
          id?: string
          period: number
          subject?: string | null
          teacher?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          grade_level?: number
          id?: string
          period?: number
          subject?: string | null
          teacher?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          class_teacher_id: string | null
          created_at: string
          grade_level: number
          id: string
          room: string | null
          teacher_name: string | null
          updated_at: string
        }
        Insert: {
          class_teacher_id?: string | null
          created_at?: string
          grade_level: number
          id?: string
          room?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Update: {
          class_teacher_id?: string | null
          created_at?: string
          grade_level?: number
          id?: string
          room?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_items: {
        Row: {
          data_type: string
          deleted_at: string
          deleted_by: string | null
          display_name: string
          id: string
          payload: Json
          table_name: string
        }
        Insert: {
          data_type: string
          deleted_at?: string
          deleted_by?: string | null
          display_name: string
          id?: string
          payload: Json
          table_name: string
        }
        Update: {
          data_type?: string
          deleted_at?: string
          deleted_by?: string | null
          display_name?: string
          id?: string
          payload?: Json
          table_name?: string
        }
        Relationships: []
      }
      exam_scores: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_name: string | null
          grade_level: number
          id: string
          max_score: number | null
          score: number | null
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_name?: string | null
          grade_level: number
          id?: string
          max_score?: number | null
          score?: number | null
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_name?: string | null
          grade_level?: number
          id?: string
          max_score?: number | null
          score?: number | null
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          item_name: string
          notes: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          expense_date?: string
          id?: string
          item_name: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          item_name?: string
          notes?: string | null
        }
        Relationships: []
      }
      farbar_records: {
        Row: {
          created_at: string
          id: string
          reading_lesson: string | null
          reading_quality: string | null
          record_date: string
          student_id: string
          updated_at: string
          writing_lesson: string | null
          writing_quality: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reading_lesson?: string | null
          reading_quality?: string | null
          record_date?: string
          student_id: string
          updated_at?: string
          writing_lesson?: string | null
          writing_quality?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reading_lesson?: string | null
          reading_quality?: string | null
          record_date?: string
          student_id?: string
          updated_at?: string
          writing_lesson?: string | null
          writing_quality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farbar_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          classroom_id: string | null
          created_at: string
          description: string
          fine_amount: number | null
          id: string
          incident_date: string
          reported_by: string | null
          severity: string | null
          student_id: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string
          description: string
          fine_amount?: number | null
          id?: string
          incident_date?: string
          reported_by?: string | null
          severity?: string | null
          student_id?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string
          description?: string
          fine_amount?: number | null
          id?: string
          incident_date?: string
          reported_by?: string | null
          severity?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_records: {
        Row: {
          created_at: string
          dars_ayah_from: number | null
          dars_ayah_to: number | null
          dars_surah: string | null
          id: string
          muraja_ayah_from: number | null
          muraja_ayah_to: number | null
          muraja_quality: string | null
          record_date: string
          sabaa_ayah_from: number | null
          sabaa_ayah_to: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dars_ayah_from?: number | null
          dars_ayah_to?: number | null
          dars_surah?: string | null
          id?: string
          muraja_ayah_from?: number | null
          muraja_ayah_to?: number | null
          muraja_quality?: string | null
          record_date?: string
          sabaa_ayah_from?: number | null
          sabaa_ayah_to?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dars_ayah_from?: number | null
          dars_ayah_to?: number | null
          dars_surah?: string | null
          id?: string
          muraja_ayah_from?: number | null
          muraja_ayah_to?: number | null
          muraja_quality?: string | null
          record_date?: string
          sabaa_ayah_from?: number | null
          sabaa_ayah_to?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quran_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          contact: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean
          photo_url: string | null
          role: string
          salary: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role?: string
          salary?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role?: string
          salary?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          bus_number: string | null
          bus_route: string | null
          contact_primary: string | null
          contact_secondary: string | null
          created_at: string
          dob: string | null
          father_name: string | null
          full_name: string
          gender: string | null
          grade_level: number | null
          home_address: string | null
          id: string
          is_active: boolean
          mother_name: string | null
          photo_url: string | null
          program_boarding: boolean
          program_quran: boolean
          program_xanaano: boolean
          updated_at: string
          uses_bus: boolean
        }
        Insert: {
          bus_number?: string | null
          bus_route?: string | null
          contact_primary?: string | null
          contact_secondary?: string | null
          created_at?: string
          dob?: string | null
          father_name?: string | null
          full_name: string
          gender?: string | null
          grade_level?: number | null
          home_address?: string | null
          id?: string
          is_active?: boolean
          mother_name?: string | null
          photo_url?: string | null
          program_boarding?: boolean
          program_quran?: boolean
          program_xanaano?: boolean
          updated_at?: string
          uses_bus?: boolean
        }
        Update: {
          bus_number?: string | null
          bus_route?: string | null
          contact_primary?: string | null
          contact_secondary?: string | null
          created_at?: string
          dob?: string | null
          father_name?: string | null
          full_name?: string
          gender?: string | null
          grade_level?: number | null
          home_address?: string | null
          id?: string
          is_active?: boolean
          mother_name?: string | null
          photo_url?: string | null
          program_boarding?: boolean
          program_quran?: boolean
          program_xanaano?: boolean
          updated_at?: string
          uses_bus?: boolean
        }
        Relationships: []
      }
      tuition_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string | null
          notes: string | null
          paid: boolean
          payment_date: string | null
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month?: string | null
          notes?: string | null
          paid?: boolean
          payment_date?: string | null
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string | null
          notes?: string | null
          paid?: boolean
          payment_date?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_maamule: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "maamule" | "macalin" | "maaliyadda"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["maamule", "macalin", "maaliyadda"],
    },
  },
} as const
