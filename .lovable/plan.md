## Escopo

Adicionar área de Contato + sistema completo de permissões por papéis (RBAC) + painel administrativo protegido. Isso exige ativar o **Lovable Cloud** (backend) — hoje o projeto usa auth mockado em `localStorage` e não tem banco de dados.

---

## 1. Ativar Lovable Cloud

Provisiona Postgres + Auth. Substitui o `AuthProvider` mockado por sessão real do Supabase (mantendo a mesma API `useAuth()` para não quebrar componentes existentes).

## 2. Banco de dados (migrations)

**Enum e tabela de papéis** (padrão seguro, sem role em `profiles`):
- `app_role` enum: `admin`, `organizador`, `participante`
- Tabela `user_roles (id, user_id, role, unique(user_id, role))`
- Função `has_role(_user_id, _role)` SECURITY DEFINER
- Trigger em `auth.users` que insere `participante` no signup

**Tabela `profiles`** — dados do usuário (nome, telefone, cpf, tipo profissional, crn, instituição, etc.), FK para `auth.users`, trigger de auto-criação.

**Tabela `contact_messages`**:
```
id uuid, nome text, email text, telefone text null,
assunto text, mensagem text,
data_envio timestamptz default now(),
status text check in ('novo','respondido','arquivado') default 'novo'
```
RLS: INSERT liberado para `anon` + `authenticated` (formulário público). SELECT/UPDATE/DELETE apenas para `admin`.

**Grants** em todas as tabelas conforme padrão do projeto.

## 3. Página pública `/contato`

- Rota `src/routes/contato.tsx` com `head()` próprio (SEO).
- Formulário validado com Zod (nome, email, telefone opcional, assunto, mensagem — limites de tamanho).
- Envio via server function `submitContactMessage` (publishable client, RLS permite anon insert).
- Estado de sucesso com card confirmando recebimento + botão "Enviar outra".
- Link "Contato" no Header e Footer.

## 4. RBAC no frontend

- `useAuth()` passa a expor `roles: AppRole[]`, `hasRole(role)`, `isAdmin`, `isOrganizador`.
- Roles carregadas via server function `getMyRoles` após login (query em `user_roles`).
- Layout `_authenticated` continua protegendo login.
- Novo layout `_authenticated/_admin.tsx` (pathless) com `beforeLoad` que verifica `hasRole('admin')` — redireciona para `/dashboard` com toast se não for admin.

## 5. Painel administrativo `/admin/*`

Estrutura de rotas sob `_authenticated/_admin/`:

```
/admin                     → visão geral (contagens)
/admin/mensagens           → lista + busca + filtro status
/admin/mensagens/$id       → detalhe + ações (responder/arquivar/excluir)
/admin/eventos             → listar/aprovar/editar/excluir todos
/admin/mentorias           → listar/aprovar/editar/excluir todas
/admin/usuarios            → listar usuários + atribuir/remover papéis
/admin/configuracoes       → placeholder
```

Sidebar admin com navegação. Todas as ações via server functions com `requireSupabaseAuth` + checagem `has_role(userId, 'admin')`.

**Tela Mensagens** cumpre integralmente o pedido:
- Tabela com colunas nome, assunto, data, status (badge colorido).
- Input de busca (nome/email/assunto/mensagem).
- Select de filtro por status (Todos/Novo/Respondido/Arquivado).
- Drawer/Dialog com mensagem completa + botões: Marcar respondida, Arquivar, Excluir (com confirmação).

## 6. Ajustes em áreas existentes

- **Header/Dashboard**: mostrar link "Admin" só quando `isAdmin`.
- **Meus eventos / Nova mentoria**: server functions passam a checar papel `organizador` ou `admin` para criar; `participante` vê CTA explicando que precisa solicitar papel de organizador.
- **`/dashboard`**: cards adaptados ao papel do usuário (participante vê inscrições/favoritos; organizador vê seus eventos; admin vê atalho para painel).

## 7. E-mails

Nada de envio real nesta fase — apenas persistência e exibição no painel, conforme pedido.

---

## Detalhes técnicos

- Server functions em `src/lib/*.functions.ts` (nunca sob `src/server/`).
- Client Supabase publishable para insert público de contato; `requireSupabaseAuth` para todo o resto; `supabaseAdmin` só para atribuição de papéis por admin (import dinâmico dentro do handler).
- Todas as RLS usam `public.has_role(auth.uid(), 'admin')` — nunca subconsulta na própria tabela.
- Bearer middleware já existe no template Supabase; nada a adicionar em `start.ts` além do que a integração provisiona.
- Grants explícitos em toda tabela nova.

---

## O que fica fora (posso adicionar depois se quiser)

- Envio real de e-mail (Resend/edge function).
- Inscrições e favoritos como tabelas reais — hoje continuam mock; posso migrar em uma próxima iteração.
- UI de solicitação "quero ser organizador" (por ora, admin atribui manualmente em `/admin/usuarios`).

Confirma que posso ativar o Lovable Cloud e seguir com tudo isso?