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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_notes: {
        Row: {
          appointment_id: string
          created_at: string
          doctor_id: string
          follow_up_date: string | null
          id: string
          medicines_prescribed: string | null
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          medicines_prescribed?: string | null
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          medicines_prescribed?: string | null
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          date: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          slot_id: string | null
          status: string
          symptoms: string[] | null
          time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          slot_id?: string | null
          status?: string
          symptoms?: string[] | null
          time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          slot_id?: string | null
          status?: string
          symptoms?: string[] | null
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors_info: {
        Row: {
          about: string | null
          achievements: string[] | null
          clinic_address: string | null
          created_at: string
          experience: number | null
          id: string
          qualification: string | null
          registration_number: string | null
          signature_url: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          achievements?: string[] | null
          clinic_address?: string | null
          created_at?: string
          experience?: number | null
          id?: string
          qualification?: string | null
          registration_number?: string | null
          signature_url?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          achievements?: string[] | null
          clinic_address?: string | null
          created_at?: string
          experience?: number | null
          id?: string
          qualification?: string | null
          registration_number?: string | null
          signature_url?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_doctors_info_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          patient_id: string
          relief_measures: string | null
          report: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          patient_id: string
          relief_measures?: string | null
          report?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          patient_id?: string
          relief_measures?: string | null
          report?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          name: string
          prescription_required: boolean
          price: number
          status: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name: string
          prescription_required?: boolean
          price: number
          status?: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name?: string
          prescription_required?: boolean
          price?: number
          status?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          appointment_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          appointment_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          appointment_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          order_id: string
          price_at_purchase: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          order_id: string
          price_at_purchase: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          order_id?: string
          price_at_purchase?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      patients_info: {
        Row: {
          address: string | null
          age: number | null
          blood_group: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          blood_group?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          age?: number | null
          blood_group?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pharmacy_orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_type: string
          id: string
          order_date: string
          patient_id: string
          pickup_location: string | null
          prescription_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_type: string
          id?: string
          order_date?: string
          patient_id: string
          pickup_location?: string | null
          prescription_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_type?: string
          id?: string
          order_date?: string
          patient_id?: string
          pickup_location?: string | null
          prescription_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_orders_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          id: string
          medicines: Json
          patient_id: string
          prescription_date: string | null
          prescription_url: string
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          id?: string
          medicines: Json
          patient_id: string
          prescription_date?: string | null
          prescription_url: string
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          medicines?: Json
          patient_id?: string
          prescription_date?: string | null
          prescription_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      symptoms_records: {
        Row: {
          additional_notes: string | null
          id: string
          patient_id: string
          recorded_at: string
          symptoms: string[]
        }
        Insert: {
          additional_notes?: string | null
          id?: string
          patient_id: string
          recorded_at?: string
          symptoms: string[]
        }
        Update: {
          additional_notes?: string | null
          id?: string
          patient_id?: string
          recorded_at?: string
          symptoms?: string[]
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string
          day: string
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean
          is_booked: boolean
          patient_id: string | null
          start_time: string
          status: string
        }
        Insert: {
          created_at?: string
          day: string
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean
          is_booked?: boolean
          patient_id?: string | null
          start_time: string
          status?: string
        }
        Update: {
          created_at?: string
          day?: string
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean
          is_booked?: boolean
          patient_id?: string | null
          start_time?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "patient" | "doctor" | "admin" | "pharmacist"
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
      app_role: ["patient", "doctor", "admin", "pharmacist"],
    },
  },
} as const
