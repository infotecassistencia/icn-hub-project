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
      contact_messages: {
        Row: {
          assunto: string
          data_envio: string
          email: string
          id: string
          mensagem: string
          nome: string
          status: string
          telefone: string | null
        }
        Insert: {
          assunto: string
          data_envio?: string
          email: string
          id?: string
          mensagem: string
          nome: string
          status?: string
          telefone?: string | null
        }
        Update: {
          assunto?: string
          data_envio?: string
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          status?: string
          telefone?: string | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          area: Database["public"]["Enums"]["area_nutricao"]
          banner_url: string
          created_at: string
          criado_por: string | null
          data: string
          descricao: string | null
          duracao: string
          estado: string
          id: string
          local: string
          mentor_id: string | null
          ministrante: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          motivo_recusa: string | null
          nome: string
          resumo: string
          status: Database["public"]["Enums"]["status_validacao"]
          tipo: Database["public"]["Enums"]["tipo_evento"]
          updated_at: string
          valor: number
        }
        Insert: {
          area: Database["public"]["Enums"]["area_nutricao"]
          banner_url: string
          created_at?: string
          criado_por?: string | null
          data: string
          descricao?: string | null
          duracao: string
          estado: string
          id?: string
          local: string
          mentor_id?: string | null
          ministrante: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          motivo_recusa?: string | null
          nome: string
          resumo: string
          status?: Database["public"]["Enums"]["status_validacao"]
          tipo: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string
          valor?: number
        }
        Update: {
          area?: Database["public"]["Enums"]["area_nutricao"]
          banner_url?: string
          created_at?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          duracao?: string
          estado?: string
          id?: string
          local?: string
          mentor_id?: string | null
          ministrante?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          motivo_recusa?: string | null
          nome?: string
          resumo?: string
          status?: Database["public"]["Enums"]["status_validacao"]
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentores"
            referencedColumns: ["id"]
          },
        ]
      }
      mentores: {
        Row: {
          areas_atuacao: string[]
          bio: string | null
          cidade: string | null
          created_at: string
          crn: string | null
          curriculo: string | null
          especialidade: string | null
          estado: string | null
          formacao: string | null
          foto_url: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          nome: string
          site: string | null
          slug: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          areas_atuacao?: string[]
          bio?: string | null
          cidade?: string | null
          created_at?: string
          crn?: string | null
          curriculo?: string | null
          especialidade?: string | null
          estado?: string | null
          formacao?: string | null
          foto_url?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          nome: string
          site?: string | null
          slug: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          areas_atuacao?: string[]
          bio?: string | null
          cidade?: string | null
          created_at?: string
          crn?: string | null
          curriculo?: string | null
          especialidade?: string | null
          estado?: string | null
          formacao?: string | null
          foto_url?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          nome?: string
          site?: string | null
          slug?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mentorias: {
        Row: {
          area: Database["public"]["Enums"]["area_nutricao"]
          banner_url: string
          created_at: string
          criado_por: string | null
          data: string
          descricao: string | null
          duracao: string
          estado: string
          id: string
          local: string
          mentor_id: string | null
          ministrante: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          motivo_recusa: string | null
          nome: string
          resumo: string
          status: Database["public"]["Enums"]["status_validacao"]
          updated_at: string
          valor: number
        }
        Insert: {
          area: Database["public"]["Enums"]["area_nutricao"]
          banner_url: string
          created_at?: string
          criado_por?: string | null
          data: string
          descricao?: string | null
          duracao: string
          estado: string
          id?: string
          local: string
          mentor_id?: string | null
          ministrante: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          motivo_recusa?: string | null
          nome: string
          resumo: string
          status?: Database["public"]["Enums"]["status_validacao"]
          updated_at?: string
          valor?: number
        }
        Update: {
          area?: Database["public"]["Enums"]["area_nutricao"]
          banner_url?: string
          created_at?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          duracao?: string
          estado?: string
          id?: string
          local?: string
          mentor_id?: string | null
          ministrante?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          motivo_recusa?: string | null
          nome?: string
          resumo?: string
          status?: Database["public"]["Enums"]["status_validacao"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentorias_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentores"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem: string
          tipo?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          canais_enviados: string[]
          created_at: string
          id: string
          lida: boolean
          mensagem: string
          metadata: Json
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
          updated_at: string
          url_destino: string | null
          user_id: string
        }
        Insert: {
          canais_enviados?: string[]
          created_at?: string
          id?: string
          lida?: boolean
          mensagem: string
          metadata?: Json
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
          updated_at?: string
          url_destino?: string | null
          user_id: string
        }
        Update: {
          canais_enviados?: string[]
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string
          metadata?: Json
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          url_destino?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          aprovado_em: string | null
          codigo_voucher: string | null
          comprador_id: string
          created_at: string
          dados_pagamento: Json
          evento_id: string | null
          id: string
          meio_pagamento: string | null
          mentoria_id: string | null
          organizador_id: string
          pagamento_externo_id: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          aprovado_em?: string | null
          codigo_voucher?: string | null
          comprador_id: string
          created_at?: string
          dados_pagamento?: Json
          evento_id?: string | null
          id?: string
          meio_pagamento?: string | null
          mentoria_id?: string | null
          organizador_id: string
          pagamento_externo_id?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          aprovado_em?: string | null
          codigo_voucher?: string | null
          comprador_id?: string
          created_at?: string
          dados_pagamento?: Json
          evento_id?: string | null
          id?: string
          meio_pagamento?: string | null
          mentoria_id?: string | null
          organizador_id?: string
          pagamento_externo_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_mentoria_id_fkey"
            columns: ["mentoria_id"]
            isOneToOne: false
            referencedRelation: "mentorias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          analisado_em: string | null
          analisado_por: string | null
          area_atuacao: string | null
          ativo: boolean
          avatar_url: string | null
          cidade: string | null
          cpf: string
          created_at: string
          crn: string | null
          crn_solicitado: string | null
          email: string
          estado: string | null
          foto_url: string | null
          id: string
          instituicao: string | null
          mostrar_email: boolean
          mostrar_telefone: boolean
          nome: string
          nome_exibicao: string
          perfil_publico: boolean
          semestre: string | null
          solicitado_em: string | null
          status_validacao: string | null
          telefone: string
          tipo: string
          tipo_solicitado: string | null
          updated_at: string
        }
        Insert: {
          analisado_em?: string | null
          analisado_por?: string | null
          area_atuacao?: string | null
          ativo?: boolean
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string
          crn?: string | null
          crn_solicitado?: string | null
          email?: string
          estado?: string | null
          foto_url?: string | null
          id: string
          instituicao?: string | null
          mostrar_email?: boolean
          mostrar_telefone?: boolean
          nome?: string
          nome_exibicao: string
          perfil_publico?: boolean
          semestre?: string | null
          solicitado_em?: string | null
          status_validacao?: string | null
          telefone?: string
          tipo?: string
          tipo_solicitado?: string | null
          updated_at?: string
        }
        Update: {
          analisado_em?: string | null
          analisado_por?: string | null
          area_atuacao?: string | null
          ativo?: boolean
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string
          crn?: string | null
          crn_solicitado?: string | null
          email?: string
          estado?: string | null
          foto_url?: string | null
          id?: string
          instituicao?: string | null
          mostrar_email?: boolean
          mostrar_telefone?: boolean
          nome?: string
          nome_exibicao?: string
          perfil_publico?: boolean
          semestre?: string | null
          solicitado_em?: string | null
          status_validacao?: string | null
          telefone?: string
          tipo?: string
          tipo_solicitado?: string | null
          updated_at?: string
        }
        Relationships: []
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
      admin_users: {
        Row: {
          analisado_em: string | null
          analisado_por: string | null
          ativo: boolean | null
          avatar_url: string | null
          cidade: string | null
          created_at: string | null
          crn_solicitado: string | null
          email: string | null
          estado: string | null
          id: string | null
          nome: string | null
          roles: Database["public"]["Enums"]["app_role"][] | null
          solicitado_em: string | null
          status_validacao: string | null
          tipo: string | null
          tipo_solicitado: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aprovar_perfil_profissional: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      atualizar_meu_nome_exibicao: {
        Args: { p_nome_exibicao: string }
        Returns: undefined
      }
      atualizar_meu_telefone: {
        Args: { p_telefone: string }
        Returns: undefined
      }
      atualizar_meus_dados_academicos: {
        Args: { p_instituicao: string; p_semestre: string }
        Returns: undefined
      }
      atualizar_minha_area_atuacao: {
        Args: { p_area_atuacao: string }
        Returns: undefined
      }
      atualizar_minha_foto: { Args: { p_foto_url: string }; Returns: undefined }
      atualizar_minhas_preferencias: {
        Args: {
          p_mostrar_email: boolean
          p_mostrar_telefone: boolean
          p_perfil_publico: boolean
        }
        Returns: undefined
      }
      cancelar_minha_solicitacao_profissional: {
        Args: never
        Returns: undefined
      }
      cpf_already_registered: { Args: { input_cpf: string }; Returns: boolean }
      create_notification: {
        Args: {
          _mensagem: string
          _metadata?: Json
          _tipo: string
          _titulo: string
          _url_destino?: string
          _user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      nome_exibicao_valido: {
        Args: { nome_completo: string; nome_publico: string }
        Returns: boolean
      }
      nome_pertence_ao_nome_completo: {
        Args: { p_nome_completo: string; p_nome_exibicao: string }
        Returns: boolean
      }
      normalize_cpf: { Args: { value: string }; Returns: string }
      recusar_perfil_profissional: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      solicitar_perfil_profissional: {
        Args: { p_crn: string; p_novo_tipo: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "organizador" | "participante"
      area_nutricao:
        | "clinica"
        | "esporte"
        | "saude-mulher"
        | "materno-infantil"
        | "oncologia"
        | "uan"
        | "social"
        | "gestao-marketing"
        | "hospitalar"
        | "outros"
      modalidade: "presencial" | "online"
      status_validacao: "pendente" | "aprovado" | "recusado"
      tipo_evento:
        | "curso"
        | "congresso"
        | "workshop"
        | "jornada"
        | "encontro"
        | "outro"
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
      app_role: ["admin", "organizador", "participante"],
      area_nutricao: [
        "clinica",
        "esporte",
        "saude-mulher",
        "materno-infantil",
        "oncologia",
        "uan",
        "social",
        "gestao-marketing",
        "hospitalar",
        "outros",
      ],
      modalidade: ["presencial", "online"],
      status_validacao: ["pendente", "aprovado", "recusado"],
      tipo_evento: [
        "curso",
        "congresso",
        "workshop",
        "jornada",
        "encontro",
        "outro",
      ],
    },
  },
} as const
