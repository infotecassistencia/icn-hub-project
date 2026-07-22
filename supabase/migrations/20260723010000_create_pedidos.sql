create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),

  comprador_id uuid not null
    references auth.users(id)
    on delete cascade,

  organizador_id uuid not null
    references auth.users(id)
    on delete restrict,

  evento_id uuid
    references public.eventos(id)
    on delete restrict,

  mentoria_id uuid
    references public.mentorias(id)
    on delete restrict,

  valor numeric(10, 2) not null
    check (valor >= 0),

  status text not null default 'pendente'
    check (
      status in (
        'pendente',
        'aprovado',
        'recusado',
        'cancelado',
        'reembolsado'
      )
    ),

  meio_pagamento text
    check (
      meio_pagamento is null
      or meio_pagamento in (
        'pix',
        'credito',
        'debito',
        'gratuito'
      )
    ),

  pagamento_externo_id text,

  codigo_voucher text unique,

  dados_pagamento jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  aprovado_em timestamptz,

  constraint pedido_deve_ter_um_item check (
    (
      evento_id is not null
      and mentoria_id is null
    )
    or
    (
      evento_id is null
      and mentoria_id is not null
    )
  ),

  constraint comprador_nao_pode_ser_organizador check (
    comprador_id <> organizador_id
  )
);

create index if not exists pedidos_comprador_id_idx
  on public.pedidos(comprador_id);

create index if not exists pedidos_organizador_id_idx
  on public.pedidos(organizador_id);

create index if not exists pedidos_evento_id_idx
  on public.pedidos(evento_id);

create index if not exists pedidos_mentoria_id_idx
  on public.pedidos(mentoria_id);

create index if not exists pedidos_status_idx
  on public.pedidos(status);

create unique index if not exists pedidos_pagamento_externo_id_unique
  on public.pedidos(pagamento_externo_id)
  where pagamento_externo_id is not null;

create or replace function public.update_pedidos_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_pedidos_updated_at
  on public.pedidos;

create trigger set_pedidos_updated_at
before update on public.pedidos
for each row
execute function public.update_pedidos_updated_at();

alter table public.pedidos enable row level security;

create policy "Comprador visualiza os proprios pedidos"
on public.pedidos
for select
to authenticated
using (
  comprador_id = auth.uid()
);

create policy "Organizador visualiza pedidos recebidos"
on public.pedidos
for select
to authenticated
using (
  organizador_id = auth.uid()
);

create policy "Comprador cria os proprios pedidos"
on public.pedidos
for insert
to authenticated
with check (
  comprador_id = auth.uid()
  and comprador_id <> organizador_id
  and status = 'pendente'
);