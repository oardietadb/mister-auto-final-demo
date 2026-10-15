create table if not exists public.customer_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (email = lower(email)),
  first_name text not null check (char_length(first_name) between 1 and 80 and btrim(first_name) <> ''),
  last_name text not null check (char_length(last_name) between 1 and 80 and btrim(last_name) <> ''),
  account_type text not null check (account_type in ('particulier', 'professionnel')),
  company text,
  siret text,
  professional_activity text,
  phone text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  terms_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint customer_profiles_marketing_consent_timestamp check (
    (marketing_consent and marketing_consent_at is not null)
    or (not marketing_consent and marketing_consent_at is null)
  ),
  constraint customer_profiles_professional_fields check (
    (account_type = 'particulier' and company is null and siret is null and professional_activity is null and phone is null)
    or (
      account_type = 'professionnel'
      and company is not null
      and char_length(company) <= 120
      and btrim(company) <> ''
      and siret ~ '^[0-9]{14}$'
      and professional_activity in ('Garage / réparateur', 'Carrosserie', 'Revendeur de pièces auto', 'Autre professionnel automobile')
      and phone is not null
      and phone ~ '^\+?[0-9(). -]{7,20}$'
    )
  )
);

alter table public.customer_profiles enable row level security;
revoke all on public.customer_profiles from anon, authenticated;
grant select on public.customer_profiles to authenticated;

create policy "Customers can read their own profile"
  on public.customer_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.create_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile jsonb := new.raw_user_meta_data;
  is_professional boolean := profile ->> 'account_type' = 'professionnel';
  wants_marketing boolean := profile ->> 'marketing_consent' = 'true';
begin
  if profile ->> 'terms_accepted' is distinct from 'true' then
    raise exception 'Terms must be accepted to create an account';
  end if;

  if profile ->> 'account_type' not in ('particulier', 'professionnel') then
    raise exception 'A valid account type is required';
  end if;

  insert into public.customer_profiles (
    id, email, first_name, last_name, account_type, company, siret,
    professional_activity, phone, marketing_consent, marketing_consent_at, terms_accepted_at
  )
  values (
    new.id,
    lower(new.email),
    btrim(profile ->> 'first_name'),
    btrim(profile ->> 'last_name'),
    profile ->> 'account_type',
    case when is_professional then btrim(profile ->> 'company') else null end,
    case when is_professional then profile ->> 'siret' else null end,
    case when is_professional then profile ->> 'professional_activity' else null end,
    case when is_professional then btrim(profile ->> 'phone') else null end,
    wants_marketing,
    case when wants_marketing then now() else null end,
    now()
  );
  return new;
end;
$$;

revoke all on function public.create_customer_profile() from public, anon, authenticated;

drop trigger if exists create_customer_profile_after_signup on auth.users;
create trigger create_customer_profile_after_signup
  after insert on auth.users
  for each row execute procedure public.create_customer_profile();

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  consent boolean not null check (consent),
  consented_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.newsletter_subscriptions enable row level security;
revoke all on public.newsletter_subscriptions from anon, authenticated;
grant insert (email, consent, consented_at) on public.newsletter_subscriptions to anon, authenticated;

create policy "Visitors can record newsletter consent"
  on public.newsletter_subscriptions
  for insert
  to anon, authenticated
  with check (
    email = lower(email)
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and consent
    and consented_at <= now()
    and consented_at > now() - interval '5 minutes'
    and confirmed_at is null
  );

create table if not exists public.storefront_events (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint storefront_events_payload_shape check (
    case payload ->> 'type'
      when 'pageView' then
        payload ?& array['type', 'path', 'title']
        and
        payload - array['type', 'path', 'title'] = '{}'::jsonb
        and payload ->> 'path' like '/%'
        and position('?' in payload ->> 'path') = 0
        and position('#' in payload ->> 'path') = 0
        and char_length(payload ->> 'path') <= 250
        and char_length(payload ->> 'title') between 1 and 120
      when 'productListView' then
        payload ?& array['type', 'category', 'productIds']
        and
        payload - array['type', 'category', 'productIds'] = '{}'::jsonb
        and char_length(payload ->> 'category') between 1 and 100
        and case
          when jsonb_typeof(payload -> 'productIds') = 'array' then jsonb_array_length(payload -> 'productIds') <= 100
          else false
        end
      when 'productView' then
        payload ?& array['type', 'productId', 'name', 'price']
        and
        payload - array['type', 'productId', 'name', 'price'] = '{}'::jsonb
        and payload ->> 'productId' ~ '^[a-zA-Z0-9_-]{1,80}$'
        and char_length(payload ->> 'name') between 1 and 180
        and jsonb_typeof(payload -> 'price') = 'number'
        and (payload ->> 'price')::numeric >= 0
      when 'search' then
        payload ?& array['type', 'query']
        and
        payload - array['type', 'query'] = '{}'::jsonb
        and char_length(payload ->> 'query') between 1 and 120
        and payload ->> 'query' !~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
      when 'accountRegistration' then
        payload ?& array['type', 'accountType', 'marketingConsent']
        and
        payload - array['type', 'accountType', 'marketingConsent'] = '{}'::jsonb
        and payload ->> 'accountType' in ('particulier', 'professionnel')
        and jsonb_typeof(payload -> 'marketingConsent') = 'boolean'
      when 'newsletterSubscribe' then
        payload = '{"type":"newsletterSubscribe"}'::jsonb
      else false
    end
  ),
  constraint storefront_events_no_email_addresses check (
    payload::text !~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
  )
);

alter table public.storefront_events enable row level security;
revoke all on public.storefront_events from anon, authenticated;
grant insert (payload) on public.storefront_events to anon, authenticated;

create policy "Visitors can record validated storefront events"
  on public.storefront_events
  for insert
  to anon, authenticated
  with check (true);
