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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          acao: string
          admin_id: string
          alvo_email: string | null
          antes: Json | null
          criado_em: string
          depois: Json | null
          id: string
        }
        Insert: {
          acao: string
          admin_id: string
          alvo_email?: string | null
          antes?: Json | null
          criado_em?: string
          depois?: Json | null
          id?: string
        }
        Update: {
          acao?: string
          admin_id?: string
          alvo_email?: string | null
          antes?: Json | null
          criado_em?: string
          depois?: Json | null
          id?: string
        }
        Relationships: []
      }
      applyfy_events: {
        Row: {
          access_status: string
          account_status: string
          customer_email: string | null
          error_code: string | null
          event_key: string
          id: string
          lease_until: string
          payment_status: string
          plan: string | null
          processed_at: string | null
          processing_status: string
          provider_status: string
          received_at: string
        }
        Insert: {
          access_status?: string
          account_status?: string
          customer_email?: string | null
          error_code?: string | null
          event_key: string
          id?: string
          lease_until?: string
          payment_status?: string
          plan?: string | null
          processed_at?: string | null
          processing_status?: string
          provider_status?: string
          received_at?: string
        }
        Update: {
          access_status?: string
          account_status?: string
          customer_email?: string | null
          error_code?: string | null
          event_key?: string
          id?: string
          lease_until?: string
          payment_status?: string
          plan?: string | null
          processed_at?: string | null
          processing_status?: string
          provider_status?: string
          received_at?: string
        }
        Relationships: []
      }
      avisos_vencimento: {
        Row: {
          criado_em: string
          enviado: boolean
          member_id: string
          tipo: string
          vencimento: string
        }
        Insert: {
          criado_em?: string
          enviado?: boolean
          member_id: string
          tipo: string
          vencimento: string
        }
        Update: {
          criado_em?: string
          enviado?: boolean
          member_id?: string
          tipo?: string
          vencimento?: string
        }
        Relationships: []
      }
      cadastro_rate: {
        Row: {
          contagem: number
          ip: string
          janela: string
        }
        Insert: {
          contagem?: number
          ip: string
          janela: string
        }
        Update: {
          contagem?: number
          ip?: string
          janela?: string
        }
        Relationships: []
      }
      cliques: {
        Row: {
          canal: string | null
          criado_em: string
          id: string
          loja_id: string
          meu_produto_id: string
        }
        Insert: {
          canal?: string | null
          criado_em?: string
          id?: string
          loja_id: string
          meu_produto_id: string
        }
        Update: {
          canal?: string | null
          criado_em?: string
          id?: string
          loja_id?: string
          meu_produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliques_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliques_meu_produto_id_fkey"
            columns: ["meu_produto_id"]
            isOneToOne: false
            referencedRelation: "meus_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      codigos_redirect: {
        Row: {
          codigo_antigo: string
          expira_em: string
          influenciador_id: string
        }
        Insert: {
          codigo_antigo: string
          expira_em?: string
          influenciador_id: string
        }
        Update: {
          codigo_antigo?: string
          expira_em?: string
          influenciador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "codigos_redirect_influenciador_id_fkey"
            columns: ["influenciador_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
      config_admin: {
        Row: {
          atualizado_em: string
          dominios_checkout: string[]
          id: boolean
          link_afiliacao_mensal: string
          link_afiliacao_vitalicio: string
          link_cadastro_applyfy: string
          link_padrao_mensal: string
          link_padrao_vitalicio: string
          modelos_whatsapp: Json
          percentual_influenciador: number
        }
        Insert: {
          atualizado_em?: string
          dominios_checkout?: string[]
          id?: boolean
          link_afiliacao_mensal?: string
          link_afiliacao_vitalicio?: string
          link_cadastro_applyfy?: string
          link_padrao_mensal?: string
          link_padrao_vitalicio?: string
          modelos_whatsapp?: Json
          percentual_influenciador?: number
        }
        Update: {
          atualizado_em?: string
          dominios_checkout?: string[]
          id?: boolean
          link_afiliacao_mensal?: string
          link_afiliacao_vitalicio?: string
          link_cadastro_applyfy?: string
          link_padrao_mensal?: string
          link_padrao_vitalicio?: string
          modelos_whatsapp?: Json
          percentual_influenciador?: number
        }
        Relationships: []
      }
      config_ia: {
        Row: {
          limite_mensal: number
          modelo: string
          plano: string
        }
        Insert: {
          limite_mensal: number
          modelo?: string
          plano: string
        }
        Update: {
          limite_mensal?: number
          modelo?: string
          plano?: string
        }
        Relationships: []
      }
      convite_usos: {
        Row: {
          convite_id: string
          criado_em: string
          id: string
          ip: string | null
          user_id_criado: string | null
        }
        Insert: {
          convite_id: string
          criado_em?: string
          id?: string
          ip?: string | null
          user_id_criado?: string | null
        }
        Update: {
          convite_id?: string
          criado_em?: string
          id?: string
          ip?: string | null
          user_id_criado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convite_usos_convite_id_fkey"
            columns: ["convite_id"]
            isOneToOne: false
            referencedRelation: "convites"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          ativo: boolean
          codigo: string
          criado_em: string
          expira_em: string
          gerente_id: string | null
          id: string
          limite_usos: number
          usos: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          criado_em?: string
          expira_em?: string
          gerente_id?: string | null
          id?: string
          limite_usos?: number
          usos?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          criado_em?: string
          expira_em?: string
          gerente_id?: string | null
          id?: string
          limite_usos?: number
          usos?: number
        }
        Relationships: [
          {
            foreignKeyName: "convites_gerente_id_fkey"
            columns: ["gerente_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons_influenciador: {
        Row: {
          ativo: boolean
          codigo: string
          criado_em: string
          desconto_max_percentual: number
          id: string
          validade: string | null
          valor_desconto: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          criado_em?: string
          desconto_max_percentual?: number
          id?: string
          validade?: string | null
          valor_desconto?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          criado_em?: string
          desconto_max_percentual?: number
          id?: string
          validade?: string | null
          valor_desconto?: number
        }
        Relationships: []
      }
      divulgacoes: {
        Row: {
          alvo_id: string | null
          alvo_tipo: string
          canal: string
          grupo_id: string | null
          id: string
          postado_em: string
          user_id: string
        }
        Insert: {
          alvo_id?: string | null
          alvo_tipo: string
          canal: string
          grupo_id?: string | null
          id?: string
          postado_em?: string
          user_id: string
        }
        Update: {
          alvo_id?: string | null
          alvo_tipo?: string
          canal?: string
          grupo_id?: string | null
          id?: string
          postado_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "divulgacoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_conexoes: {
        Row: {
          app_id: string
          atualizado_em: string
          criado_em: string
          fornecedor: string
          id: string
          secret_cifrado: string
          status: string
          ultimo_erro: string | null
          ultimo_teste_em: string | null
          user_id: string
        }
        Insert: {
          app_id: string
          atualizado_em?: string
          criado_em?: string
          fornecedor: string
          id?: string
          secret_cifrado: string
          status: string
          ultimo_erro?: string | null
          ultimo_teste_em?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          atualizado_em?: string
          criado_em?: string
          fornecedor?: string
          id?: string
          secret_cifrado?: string
          status?: string
          ultimo_erro?: string | null
          ultimo_teste_em?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fornecedor_rate: {
        Row: {
          contagem: number
          janela: string
          user_id: string
        }
        Insert: {
          contagem?: number
          janela: string
          user_id: string
        }
        Update: {
          contagem?: number
          janela?: string
          user_id?: string
        }
        Relationships: []
      }
      grupo_denuncias: {
        Row: {
          criado_em: string
          grupo_id: string
          id: string
          motivo: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          grupo_id: string
          id?: string
          motivo: string
          user_id: string
        }
        Update: {
          criado_em?: string
          grupo_id?: string
          id?: string
          motivo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupo_denuncias_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupo_postagens: {
        Row: {
          grupo_id: string
          id: string
          item_id: string
          postado_em: string
          user_id: string
        }
        Insert: {
          grupo_id: string
          id?: string
          item_id: string
          postado_em?: string
          user_id: string
        }
        Update: {
          grupo_id?: string
          id?: string
          item_id?: string
          postado_em?: string
          user_id?: string
        }
        Relationships: []
      }
      grupos: {
        Row: {
          ativo: boolean
          busca: unknown
          criado_em: string
          exige_foto: boolean
          frequencia_min_horas: number
          id: string
          legado_id: string | null
          link: string
          membros_aprox: number | null
          nichos: string[]
          nome: string
          palavras_chave: string[]
          rede: string
          regras: string | null
          verificado_em: string | null
        }
        Insert: {
          ativo?: boolean
          busca?: unknown
          criado_em?: string
          exige_foto?: boolean
          frequencia_min_horas?: number
          id?: string
          legado_id?: string | null
          link: string
          membros_aprox?: number | null
          nichos?: string[]
          nome: string
          palavras_chave?: string[]
          rede: string
          regras?: string | null
          verificado_em?: string | null
        }
        Update: {
          ativo?: boolean
          busca?: unknown
          criado_em?: string
          exige_foto?: boolean
          frequencia_min_horas?: number
          id?: string
          legado_id?: string | null
          link?: string
          membros_aprox?: number | null
          nichos?: string[]
          nome?: string
          palavras_chave?: string[]
          rede?: string
          regras?: string | null
          verificado_em?: string | null
        }
        Relationships: []
      }
      grupos_salvos: {
        Row: {
          grupo_id: string
          salvo_em: string
          user_id: string
        }
        Insert: {
          grupo_id: string
          salvo_em?: string
          user_id: string
        }
        Update: {
          grupo_id?: string
          salvo_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_salvos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_geracoes: {
        Row: {
          com_texto: boolean
          conceitos: Json
          criado_em: string
          custo_estimado: number | null
          custo_real: number | null
          descricao: string | null
          escolhida_url: string | null
          estilo: string
          id: string
          limpo: boolean
          loja_id: string | null
          modelo: string | null
          motivo: string | null
          opcoes: Json
          origem_id: string | null
          peso: number
          status: string
          tipo: string
          user_id: string
          variacoes: Json
        }
        Insert: {
          com_texto?: boolean
          conceitos?: Json
          criado_em?: string
          custo_estimado?: number | null
          custo_real?: number | null
          descricao?: string | null
          escolhida_url?: string | null
          estilo: string
          id?: string
          limpo?: boolean
          loja_id?: string | null
          modelo?: string | null
          motivo?: string | null
          opcoes?: Json
          origem_id?: string | null
          peso?: number
          status: string
          tipo: string
          user_id: string
          variacoes?: Json
        }
        Update: {
          com_texto?: boolean
          conceitos?: Json
          criado_em?: string
          custo_estimado?: number | null
          custo_real?: number | null
          descricao?: string | null
          escolhida_url?: string | null
          estilo?: string
          id?: string
          limpo?: boolean
          loja_id?: string | null
          modelo?: string | null
          motivo?: string | null
          opcoes?: Json
          origem_id?: string | null
          peso?: number
          status?: string
          tipo?: string
          user_id?: string
          variacoes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ia_geracoes_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_demo_batches: {
        Row: {
          batch_key: string
          created_at: string
          events: Json
          ficticio: boolean
          user_id: string
        }
        Insert: {
          batch_key: string
          created_at?: string
          events?: Json
          ficticio?: boolean
          user_id: string
        }
        Update: {
          batch_key?: string
          created_at?: string
          events?: Json
          ficticio?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_demo_batches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "influencer_demo_settings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      influencer_demo_settings: {
        Row: {
          activated_at: string
          commission_percent: number
          member_id: string
          seed: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          commission_percent?: number
          member_id: string
          seed?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          commission_percent?: number
          member_id?: string
          seed?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_demo_settings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      influenciadores: {
        Row: {
          applyfy_afiliado_id: string | null
          applyfy_email: string | null
          aprovado_em: string | null
          codigo: string | null
          comissao_percentual: number
          criado_em: string
          gerente_id: string | null
          id: string
          is_gerente: boolean
          link_mensal: string | null
          link_vitalicio: string | null
          member_id: string
          motivo_recusa: string | null
          passos: Json
          pedido_troca_links: Json | null
          status_cadastro: string
        }
        Insert: {
          applyfy_afiliado_id?: string | null
          applyfy_email?: string | null
          aprovado_em?: string | null
          codigo?: string | null
          comissao_percentual?: number
          criado_em?: string
          gerente_id?: string | null
          id?: string
          is_gerente?: boolean
          link_mensal?: string | null
          link_vitalicio?: string | null
          member_id: string
          motivo_recusa?: string | null
          passos?: Json
          pedido_troca_links?: Json | null
          status_cadastro?: string
        }
        Update: {
          applyfy_afiliado_id?: string | null
          applyfy_email?: string | null
          aprovado_em?: string | null
          codigo?: string | null
          comissao_percentual?: number
          criado_em?: string
          gerente_id?: string | null
          id?: string
          is_gerente?: boolean
          link_mensal?: string | null
          link_vitalicio?: string | null
          member_id?: string
          motivo_recusa?: string | null
          passos?: Json
          pedido_troca_links?: Json | null
          status_cadastro?: string
        }
        Relationships: [
          {
            foreignKeyName: "influenciadores_gerente_id_fkey"
            columns: ["gerente_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influenciadores_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_produtos: {
        Row: {
          loja_id: string
          meu_produto_id: string
          ordem: number
          secao: string | null
        }
        Insert: {
          loja_id: string
          meu_produto_id: string
          ordem?: number
          secao?: string | null
        }
        Update: {
          loja_id?: string
          meu_produto_id?: string
          ordem?: number
          secao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loja_produtos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loja_produtos_meu_produto_id_fkey"
            columns: ["meu_produto_id"]
            isOneToOne: false
            referencedRelation: "meus_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          atualizado_em: string
          banner_alinhamento: string
          banner_altura: string
          banner_botao: string | null
          banner_estilo: string
          banner_frase: string | null
          banner_posicao: string
          banner_url: string | null
          banners: Json
          briefing: Json
          cor_destaque: string
          criado_em: string
          id: string
          logo_estilo: string
          logo_url: string | null
          nicho: string | null
          nome: string
          passo_atual: number
          pausada_por_sistema: boolean
          preset: string
          publicada_em: string | null
          slug: string | null
          slug_travado: boolean
          status: string
          tema: Json | null
          user_id: string
          versao: number
        }
        Insert: {
          atualizado_em?: string
          banner_alinhamento?: string
          banner_altura?: string
          banner_botao?: string | null
          banner_estilo?: string
          banner_frase?: string | null
          banner_posicao?: string
          banner_url?: string | null
          banners?: Json
          briefing?: Json
          cor_destaque?: string
          criado_em?: string
          id?: string
          logo_estilo?: string
          logo_url?: string | null
          nicho?: string | null
          nome?: string
          passo_atual?: number
          pausada_por_sistema?: boolean
          preset?: string
          publicada_em?: string | null
          slug?: string | null
          slug_travado?: boolean
          status?: string
          tema?: Json | null
          user_id?: string
          versao?: number
        }
        Update: {
          atualizado_em?: string
          banner_alinhamento?: string
          banner_altura?: string
          banner_botao?: string | null
          banner_estilo?: string
          banner_frase?: string | null
          banner_posicao?: string
          banner_url?: string | null
          banners?: Json
          briefing?: Json
          cor_destaque?: string
          criado_em?: string
          id?: string
          logo_estilo?: string
          logo_url?: string | null
          nicho?: string | null
          nome?: string
          passo_atual?: number
          pausada_por_sistema?: boolean
          preset?: string
          publicada_em?: string | null
          slug?: string | null
          slug_travado?: boolean
          status?: string
          tema?: Json | null
          user_id?: string
          versao?: number
        }
        Relationships: []
      }
      marcas_bloqueadas: {
        Row: {
          criado_em: string
          termo: string
        }
        Insert: {
          criado_em?: string
          termo: string
        }
        Update: {
          criado_em?: string
          termo?: string
        }
        Relationships: []
      }
      meli_affiliate_profile: {
        Row: {
          profile_url: string | null
          tag_confirmed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          profile_url?: string | null
          tag_confirmed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          profile_url?: string | null
          tag_confirmed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meli_connections: {
        Row: {
          access_token: string
          affiliate_tag: string
          connected_at: string
          expires_at: string | null
          meli_user_id: number
          nickname: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          affiliate_tag?: string
          connected_at?: string
          expires_at?: string | null
          meli_user_id: number
          nickname: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          affiliate_tag?: string
          connected_at?: string
          expires_at?: string | null
          meli_user_id?: number
          nickname?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      member_roles: {
        Row: {
          id: string
          member_id: string
          role: string
        }
        Insert: {
          id?: string
          member_id: string
          role: string
        }
        Update: {
          id?: string
          member_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          demo_commission_percent: number
          email: string
          expires_at: string | null
          forma_pagamento: string | null
          id: string
          is_test: boolean
          name: string
          plan: string
          status: string
          ultimo_pagamento_em: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          demo_commission_percent?: number
          email: string
          expires_at?: string | null
          forma_pagamento?: string | null
          id?: string
          is_test?: boolean
          name: string
          plan?: string
          status?: string
          ultimo_pagamento_em?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          demo_commission_percent?: number
          email?: string
          expires_at?: string | null
          forma_pagamento?: string | null
          id?: string
          is_test?: boolean
          name?: string
          plan?: string
          status?: string
          ultimo_pagamento_em?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      meus_produtos: {
        Row: {
          adicionado_em: string
          fornecedor: string
          id: string
          item_id: string
          link_afiliado: string | null
          link_gerado_em: string | null
          preco_ao_adicionar: number
          user_id: string
        }
        Insert: {
          adicionado_em?: string
          fornecedor: string
          id?: string
          item_id: string
          link_afiliado?: string | null
          link_gerado_em?: string | null
          preco_ao_adicionar: number
          user_id?: string
        }
        Update: {
          adicionado_em?: string
          fornecedor?: string
          id?: string
          item_id?: string
          link_afiliado?: string | null
          link_gerado_em?: string | null
          preco_ao_adicionar?: number
          user_id?: string
        }
        Relationships: []
      }
      modelos_mensagem: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          nome: string
          ordem: number
          texto: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          texto: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          texto?: string
        }
        Relationships: []
      }
      nao_contatar: {
        Row: {
          criado_em: string
          email: string | null
          id: string
          telefone: string | null
        }
        Insert: {
          criado_em?: string
          email?: string | null
          id?: string
          telefone?: string | null
        }
        Update: {
          criado_em?: string
          email?: string | null
          id?: string
          telefone?: string | null
        }
        Relationships: []
      }
      perfil_publicacoes: {
        Row: {
          id: string
          item_id: string
          publicado_em: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          publicado_em?: string
          status: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          publicado_em?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      produto_progresso: {
        Row: {
          concluido_em: string
          etapa: string
          item_id: string
          user_id: string
        }
        Insert: {
          concluido_em?: string
          etapa: string
          item_id: string
          user_id: string
        }
        Update: {
          concluido_em?: string
          etapa?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos_atualizacoes: {
        Row: {
          avisos: string[]
          categorias_feitas: string[]
          concluido_em: string | null
          fora_do_ar: number
          id: string
          iniciado_em: string
          ml_total: number
          origem: string
          shopee_total: number
        }
        Insert: {
          avisos?: string[]
          categorias_feitas?: string[]
          concluido_em?: string | null
          fora_do_ar?: number
          id?: string
          iniciado_em?: string
          ml_total?: number
          origem?: string
          shopee_total?: number
        }
        Update: {
          avisos?: string[]
          categorias_feitas?: string[]
          concluido_em?: string | null
          fora_do_ar?: number
          id?: string
          iniciado_em?: string
          ml_total?: number
          origem?: string
          shopee_total?: number
        }
        Relationships: []
      }
      produtos_cache: {
        Row: {
          atualizado_em: string
          avaliacao: number | null
          categoria: string
          comissao_percentual: number | null
          criado_em: string
          fornecedor: string
          frete_gratis: boolean
          id: string
          imagens: string[]
          item_id: string
          link_origem: string
          posicao_ranking: number | null
          preco: number
          preco_original: number | null
          reputacao: string | null
          shop_id: string | null
          status: string
          titulo: string
          validado: boolean
          vendidos_estimado: number | null
        }
        Insert: {
          atualizado_em?: string
          avaliacao?: number | null
          categoria: string
          comissao_percentual?: number | null
          criado_em?: string
          fornecedor: string
          frete_gratis?: boolean
          id?: string
          imagens?: string[]
          item_id: string
          link_origem: string
          posicao_ranking?: number | null
          preco: number
          preco_original?: number | null
          reputacao?: string | null
          shop_id?: string | null
          status?: string
          titulo: string
          validado?: boolean
          vendidos_estimado?: number | null
        }
        Update: {
          atualizado_em?: string
          avaliacao?: number | null
          categoria?: string
          comissao_percentual?: number | null
          criado_em?: string
          fornecedor?: string
          frete_gratis?: boolean
          id?: string
          imagens?: string[]
          item_id?: string
          link_origem?: string
          posicao_ranking?: number | null
          preco?: number
          preco_original?: number | null
          reputacao?: string | null
          shop_id?: string | null
          status?: string
          titulo?: string
          validado?: boolean
          vendidos_estimado?: number | null
        }
        Relationships: []
      }
      recuperacao: {
        Row: {
          atualizado_em: string
          contatado_em: string | null
          criado_em: string
          email: string | null
          forma: string | null
          id: string
          member_id: string | null
          motivo: string
          nome: string | null
          origem: string
          plano: string | null
          recuperado_em: string | null
          responsavel: string | null
          status: string
          telefone: string | null
          tentativas: Json
          valor: number | null
        }
        Insert: {
          atualizado_em?: string
          contatado_em?: string | null
          criado_em?: string
          email?: string | null
          forma?: string | null
          id?: string
          member_id?: string | null
          motivo: string
          nome?: string | null
          origem: string
          plano?: string | null
          recuperado_em?: string | null
          responsavel?: string | null
          status?: string
          telefone?: string | null
          tentativas?: Json
          valor?: number | null
        }
        Update: {
          atualizado_em?: string
          contatado_em?: string | null
          criado_em?: string
          email?: string | null
          forma?: string | null
          id?: string
          member_id?: string | null
          motivo?: string
          nome?: string | null
          origem?: string
          plano?: string | null
          recuperado_em?: string | null
          responsavel?: string | null
          status?: string
          telefone?: string | null
          tentativas?: Json
          valor?: number | null
        }
        Relationships: []
      }
      slugs_reservados: {
        Row: {
          criado_em: string
          termo: string
        }
        Insert: {
          criado_em?: string
          termo: string
        }
        Update: {
          criado_em?: string
          termo?: string
        }
        Relationships: []
      }
      sugestoes_fornecedor: {
        Row: {
          criado_em: string
          id: string
          nome: string
          observacao: string | null
          site: string | null
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
          observacao?: string | null
          site?: string | null
          user_id?: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          observacao?: string | null
          site?: string | null
          user_id?: string
        }
        Relationships: []
      }
      test_balance_entries: {
        Row: {
          amount_cents: number
          batch_key: string
          created_at: string
          events: Json
          ficticio: boolean
          id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          batch_key: string
          created_at?: string
          events?: Json
          ficticio?: boolean
          id?: string
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          batch_key?: string
          created_at?: string
          events?: Json
          ficticio?: boolean
          id?: string
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      test_balance_settings: {
        Row: {
          auto_daily_cents: number
          auto_daily_enabled: boolean
          auto_started_at: string
          rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_daily_cents?: number
          auto_daily_enabled?: boolean
          auto_started_at?: string
          rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_daily_cents?: number
          auto_daily_enabled?: boolean
          auto_started_at?: string
          rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      times: {
        Row: {
          atualizado_em: string
          gerente_id: string
          link_afiliacao_mensal: string | null
          link_afiliacao_vitalicio: string | null
          link_coproducao: string | null
          mensagem_boas_vindas: string | null
          nome: string | null
          percentual_gerente_info: number | null
        }
        Insert: {
          atualizado_em?: string
          gerente_id: string
          link_afiliacao_mensal?: string | null
          link_afiliacao_vitalicio?: string | null
          link_coproducao?: string | null
          mensagem_boas_vindas?: string | null
          nome?: string | null
          percentual_gerente_info?: number | null
        }
        Update: {
          atualizado_em?: string
          gerente_id?: string
          link_afiliacao_mensal?: string | null
          link_afiliacao_vitalicio?: string | null
          link_coproducao?: string | null
          mensagem_boas_vindas?: string | null
          nome?: string | null
          percentual_gerente_info?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "times_gerente_id_fkey"
            columns: ["gerente_id"]
            isOneToOne: true
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      vendas_influenciador: {
        Row: {
          afiliado_ref: string | null
          applyfy_pedido_id: string
          cliente_email: string | null
          comissao: number
          data_venda: string
          estornada_em: string | null
          id: string
          influenciador_id: string | null
          percentual: number
          plano: string | null
          status: string
          valor_bruto: number
        }
        Insert: {
          afiliado_ref?: string | null
          applyfy_pedido_id: string
          cliente_email?: string | null
          comissao?: number
          data_venda?: string
          estornada_em?: string | null
          id?: string
          influenciador_id?: string | null
          percentual: number
          plano?: string | null
          status?: string
          valor_bruto?: number
        }
        Update: {
          afiliado_ref?: string | null
          applyfy_pedido_id?: string
          cliente_email?: string | null
          comissao?: number
          data_venda?: string
          estornada_em?: string | null
          id?: string
          influenciador_id?: string | null
          percentual?: number
          plano?: string | null
          status?: string
          valor_bruto?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_influenciador_influenciador_id_fkey"
            columns: ["influenciador_id"]
            isOneToOne: false
            referencedRelation: "influenciadores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cadastro_rate_hit: {
        Args: { _ip: string; _limit: number }
        Returns: boolean
      }
      claim_applyfy_event: {
        Args: {
          p_email: string
          p_key: string
          p_payment: string
          p_plan: string
          p_status: string
        }
        Returns: Json
      }
      convite_publico: { Args: { _codigo: string }; Returns: Json }
      finish_applyfy_event: {
        Args: {
          p_account: string
          p_action: string
          p_error?: string
          p_id: string
        }
        Returns: undefined
      }
      fornecedor_rate_hit: {
        Args: { _limit: number; _user: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      influenciador_publico: { Args: { _codigo: string }; Returns: Json }
      is_influencer: { Args: { _user_id: string }; Returns: boolean }
      limite_lojas: { Args: { _uid: string }; Returns: number }
      loja_publica: { Args: { _slug: string }; Returns: Json }
      meu_influenciador_id: { Args: never; Returns: string }
      minhas_conexoes_fornecedor: {
        Args: never
        Returns: {
          app_id_mascarado: string
          fornecedor: string
          id: string
          status: string
          ultimo_erro: string
          ultimo_teste_em: string
        }[]
      }
      pagamento_aprovado: {
        Args: { p_email: string; p_forma: string; p_telefone: string }
        Returns: undefined
      }
      registrar_recuperacao: {
        Args: {
          p_email: string
          p_forma: string
          p_member: string
          p_motivo: string
          p_nome: string
          p_origem: string
          p_plano: string
          p_telefone: string
          p_valor: number
        }
        Returns: undefined
      }
      rotina_vencimentos: { Args: never; Returns: Json }
      sincronizar_lojas_assinatura: { Args: never; Returns: undefined }
      tem_acesso_ativo: { Args: { _user_id: string }; Returns: boolean }
      usar_convite: { Args: { _codigo: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
