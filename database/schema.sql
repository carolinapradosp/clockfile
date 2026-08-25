--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11 (df1f1a3)
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$;


--
-- Name: validate_invoice_project_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_invoice_project_owner() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  selected_project_owner_id UUID;
BEGIN
  IF NEW.project_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT owner_id
  INTO selected_project_owner_id
  FROM public.projects
  WHERE id = NEW.project_id;

  IF selected_project_owner_id IS NULL THEN
    RAISE EXCEPTION
      'O projeto informado não existe.';
  END IF;

  IF selected_project_owner_id <> NEW.owner_id THEN
    RAISE EXCEPTION
      'O projeto selecionado não pertence ao proprietário da fatura.';
  END IF;

  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: app_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(30),
    company_name character varying(255),
    address_line_1 character varying(255),
    address_line_2 character varying(255),
    city character varying(150),
    state character varying(100),
    postal_code character varying(30),
    country_code character varying(2) DEFAULT 'BR'::character varying,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    password_hash text,
    last_login_at timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT app_users_country_code_check CHECK (((country_code IS NULL) OR (char_length((country_code)::text) = 2))),
    CONSTRAINT app_users_email_check CHECK ((((email)::text = lower(TRIM(BOTH FROM email))) AND ((email)::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text))),
    CONSTRAINT app_users_name_check CHECK ((length(TRIM(BOTH FROM name)) >= 2)),
    CONSTRAINT app_users_password_hash_check CHECK (((password_hash IS NULL) OR (length(password_hash) >= 20))),
    CONSTRAINT app_users_phone_check CHECK (((phone IS NULL) OR ((length(TRIM(BOTH FROM phone)) >= 8) AND (length(TRIM(BOTH FROM phone)) <= 30)))),
    CONSTRAINT app_users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'blocked'::character varying])::text[])))
);


--
-- Name: TABLE app_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.app_users IS 'Contas dos usuários autenticados do Clockfile.';


--
-- Name: COLUMN app_users.email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.app_users.email IS 'Identificador único da conta, armazenado normalizado em lowercase.';


--
-- Name: COLUMN app_users.password_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.app_users.password_hash IS 'Hash seguro da senha. Pode ser NULL somente para contas legadas ainda não ativadas.';


--
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    user_agent text,
    ip_address inet,
    CONSTRAINT auth_sessions_expiration_check CHECK ((expires_at > created_at)),
    CONSTRAINT auth_sessions_revoked_at_check CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at))),
    CONSTRAINT auth_sessions_token_hash_check CHECK ((length(token_hash) >= 32))
);


--
-- Name: TABLE auth_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.auth_sessions IS 'Sessões autenticadas persistidas do Clockfile.';


--
-- Name: COLUMN auth_sessions.token_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.auth_sessions.token_hash IS 'Hash SHA-256 do token armazenado no cookie HttpOnly; o token original nunca é persistido.';


--
-- Name: bug_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bug_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    page_url text,
    user_agent text,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'normal'::character varying NOT NULL,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bug_reports_message_check CHECK ((length(TRIM(BOTH FROM message)) >= 10)),
    CONSTRAINT bug_reports_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT bug_reports_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'reviewing'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[]))),
    CONSTRAINT bug_reports_subject_check CHECK ((length(TRIM(BOTH FROM subject)) >= 3))
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    description text NOT NULL,
    quantity numeric(10,2),
    rate numeric(10,2),
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    source character varying(30) DEFAULT 'manual'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    link text,
    "position" integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoice_items_position_check CHECK (("position" >= 0)),
    CONSTRAINT invoice_items_source_check CHECK (((source)::text = ANY ((ARRAY['monthly-report'::character varying, 'manual'::character varying, 'expense'::character varying, 'adjustment'::character varying])::text[]))),
    CONSTRAINT invoice_items_values_check CHECK ((((quantity IS NULL) OR (quantity >= (0)::numeric)) AND ((rate IS NULL) OR (rate >= (0)::numeric)) AND (amount >= (0)::numeric)))
);


--
-- Name: invoice_report_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_report_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    invoice_item_id uuid,
    report_entry_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoices_invoice_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_invoice_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(50) DEFAULT (nextval('public.invoices_invoice_number_seq'::regclass))::text NOT NULL,
    reference_month character varying(7) NOT NULL,
    invoice_date date DEFAULT CURRENT_DATE NOT NULL,
    tax_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    due_date date,
    notes text,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    paid_at timestamp with time zone,
    issued_at timestamp with time zone,
    sent_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    bill_to_name character varying(255),
    bill_to_company character varying(255),
    bill_to_email character varying(255),
    bill_to_phone character varying(50),
    bill_to_address_line_1 character varying(255),
    bill_to_address_line_2 character varying(255),
    bill_to_city character varying(150),
    bill_to_state character varying(100),
    bill_to_postal_code character varying(30),
    bill_to_country_code character varying(2),
    owner_id uuid NOT NULL,
    CONSTRAINT invoices_currency_check CHECK (((currency)::text ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT invoices_due_date_check CHECK (((due_date IS NULL) OR (due_date >= invoice_date))),
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'sent'::character varying, 'paid'::character varying, 'overdue'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT invoices_values_check CHECK (((tax_percentage >= (0)::numeric) AND (subtotal >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (total_amount >= (0)::numeric)))
);


--
-- Name: COLUMN invoices.project_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.project_id IS 'Projeto opcional pertencente ao mesmo usuário proprietário da fatura.';


--
-- Name: COLUMN invoices.bill_to_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.bill_to_name IS 'Snapshot do nome do destinatário da fatura.';


--
-- Name: COLUMN invoices.bill_to_company; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.bill_to_company IS 'Snapshot da empresa destinatária da fatura.';


--
-- Name: COLUMN invoices.bill_to_email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.bill_to_email IS 'Snapshot do e-mail do destinatário da fatura.';


--
-- Name: COLUMN invoices.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.owner_id IS 'Usuário proprietário da fatura. Define o isolamento e a autorização do registro.';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    default_hourly_rate numeric(12,2),
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_id uuid NOT NULL,
    billing_name character varying(255),
    billing_company character varying(255),
    billing_email character varying(255),
    billing_phone character varying(30),
    billing_address_line_1 character varying(255),
    billing_address_line_2 character varying(255),
    billing_city character varying(150),
    billing_state character varying(100),
    billing_postal_code character varying(30),
    billing_country_code character varying(2) DEFAULT 'BR'::character varying,
    CONSTRAINT projects_billing_country_code_check CHECK (((billing_country_code IS NULL) OR (char_length((billing_country_code)::text) = 2))),
    CONSTRAINT projects_billing_email_check CHECK (((billing_email IS NULL) OR ((billing_email)::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text))),
    CONSTRAINT projects_billing_phone_check CHECK (((billing_phone IS NULL) OR ((length(TRIM(BOTH FROM billing_phone)) >= 8) AND (length(TRIM(BOTH FROM billing_phone)) <= 30)))),
    CONSTRAINT projects_currency_check CHECK ((char_length((currency)::text) = 3)),
    CONSTRAINT projects_dates_check CHECK (((end_date IS NULL) OR (start_date IS NULL) OR (end_date >= start_date))),
    CONSTRAINT projects_hourly_rate_check CHECK (((default_hourly_rate IS NULL) OR (default_hourly_rate >= (0)::numeric))),
    CONSTRAINT projects_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying, 'archived'::character varying])::text[])))
);


--
-- Name: COLUMN projects.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.owner_id IS 'Usuário proprietário do projeto. Define acesso e isolamento dos dados.';


--
-- Name: report_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task character varying(50),
    description text NOT NULL,
    duration character varying(20),
    amount numeric(10,2),
    date timestamp with time zone NOT NULL,
    rate numeric(10,2),
    project_id uuid,
    duration_minutes integer,
    currency character varying(3) DEFAULT 'USD'::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_email_unique UNIQUE (email);


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_token_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_token_hash_unique UNIQUE (token_hash);


--
-- Name: bug_reports bug_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_report_entries invoice_report_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_report_entries
    ADD CONSTRAINT invoice_report_entries_pkey PRIMARY KEY (id);


--
-- Name: invoice_report_entries invoice_report_entries_unique_entry; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_report_entries
    ADD CONSTRAINT invoice_report_entries_unique_entry UNIQUE (report_entry_id);


--
-- Name: invoice_report_entries invoice_report_entries_unique_relation; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_report_entries
    ADD CONSTRAINT invoice_report_entries_unique_relation UNIQUE (invoice_id, report_entry_id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_paid_at_check; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_paid_at_check CHECK ((((status)::text <> 'paid'::text) OR (paid_at IS NOT NULL))) NOT VALID;


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_reference_month_check; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_reference_month_check CHECK (((reference_month)::text ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'::text)) NOT VALID;


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: report_entries report_entries_amount_check; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.report_entries
    ADD CONSTRAINT report_entries_amount_check CHECK (((amount IS NULL) OR (amount >= (0)::numeric))) NOT VALID;


--
-- Name: report_entries report_entries_duration_minutes_check; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.report_entries
    ADD CONSTRAINT report_entries_duration_minutes_check CHECK (((duration_minutes IS NULL) OR (duration_minutes >= 0))) NOT VALID;


--
-- Name: report_entries report_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_entries
    ADD CONSTRAINT report_entries_pkey PRIMARY KEY (id);


--
-- Name: report_entries report_entries_rate_check; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.report_entries
    ADD CONSTRAINT report_entries_rate_check CHECK (((rate IS NULL) OR (rate >= (0)::numeric))) NOT VALID;


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: app_users_email_lower_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX app_users_email_lower_unique ON public.app_users USING btree (lower((email)::text));


--
-- Name: auth_sessions_active_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_sessions_active_user_idx ON public.auth_sessions USING btree (user_id, expires_at DESC) WHERE (revoked_at IS NULL);


--
-- Name: auth_sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_sessions_expires_at_idx ON public.auth_sessions USING btree (expires_at);


--
-- Name: auth_sessions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_sessions_user_id_idx ON public.auth_sessions USING btree (user_id);


--
-- Name: bug_reports_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bug_reports_created_idx ON public.bug_reports USING btree (created_at DESC);


--
-- Name: bug_reports_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bug_reports_priority_idx ON public.bug_reports USING btree (priority);


--
-- Name: bug_reports_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bug_reports_status_idx ON public.bug_reports USING btree (status);


--
-- Name: bug_reports_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bug_reports_user_idx ON public.bug_reports USING btree (user_id);


--
-- Name: invoice_items_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoice_items_invoice_id_idx ON public.invoice_items USING btree (invoice_id);


--
-- Name: invoice_items_invoice_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoice_items_invoice_position_idx ON public.invoice_items USING btree (invoice_id, "position");


--
-- Name: invoice_report_entries_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoice_report_entries_invoice_id_idx ON public.invoice_report_entries USING btree (invoice_id);


--
-- Name: invoice_report_entries_invoice_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoice_report_entries_invoice_item_id_idx ON public.invoice_report_entries USING btree (invoice_item_id) WHERE (invoice_item_id IS NOT NULL);


--
-- Name: invoices_due_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_due_date_idx ON public.invoices USING btree (due_date) WHERE (due_date IS NOT NULL);


--
-- Name: invoices_owner_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_owner_date_idx ON public.invoices USING btree (owner_id, invoice_date DESC);


--
-- Name: invoices_owner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_owner_id_idx ON public.invoices USING btree (owner_id);


--
-- Name: invoices_owner_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_owner_project_idx ON public.invoices USING btree (owner_id, project_id) WHERE (project_id IS NOT NULL);


--
-- Name: invoices_owner_project_reference_month_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invoices_owner_project_reference_month_unique ON public.invoices USING btree (owner_id, project_id, reference_month) WHERE (project_id IS NOT NULL);


--
-- Name: invoices_owner_reference_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_owner_reference_month_idx ON public.invoices USING btree (owner_id, reference_month);


--
-- Name: invoices_owner_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_owner_status_idx ON public.invoices USING btree (owner_id, status);


--
-- Name: invoices_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_project_id_idx ON public.invoices USING btree (project_id);


--
-- Name: invoices_reference_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_reference_month_idx ON public.invoices USING btree (reference_month);


--
-- Name: invoices_reference_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_reference_project_idx ON public.invoices USING btree (reference_month, project_id) WHERE (project_id IS NOT NULL);


--
-- Name: invoices_status_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status_date_idx ON public.invoices USING btree (status, invoice_date DESC);


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: projects_owner_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_owner_created_at_idx ON public.projects USING btree (owner_id, created_at DESC);


--
-- Name: projects_owner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_owner_id_idx ON public.projects USING btree (owner_id);


--
-- Name: projects_owner_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX projects_owner_name_unique ON public.projects USING btree (owner_id, lower((name)::text));


--
-- Name: projects_owner_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_owner_status_idx ON public.projects USING btree (owner_id, status);


--
-- Name: projects_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_status_idx ON public.projects USING btree (status);


--
-- Name: report_entries_project_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_entries_project_date_idx ON public.report_entries USING btree (project_id, date DESC);


--
-- Name: report_entries_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_entries_project_id_idx ON public.report_entries USING btree (project_id);


--
-- Name: app_users app_users_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER app_users_set_updated_at BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoice_items invoice_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoice_items_set_updated_at BEFORE UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices invoices_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_set_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices invoices_validate_project_owner; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_validate_project_owner BEFORE INSERT OR UPDATE OF owner_id, project_id ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.validate_invoice_project_owner();


--
-- Name: projects projects_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: report_entries report_entries_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER report_entries_set_updated_at BEFORE UPDATE ON public.report_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: auth_sessions auth_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: bug_reports bug_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_report_entries invoice_report_entries_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_report_entries
    ADD CONSTRAINT invoice_report_entries_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_report_entries invoice_report_entries_invoice_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_report_entries
    ADD CONSTRAINT invoice_report_entries_invoice_item_id_fkey FOREIGN KEY (invoice_item_id) REFERENCES public.invoice_items(id) ON DELETE SET NULL;


--
-- Name: invoice_report_entries invoice_report_entries_report_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_report_entries
    ADD CONSTRAINT invoice_report_entries_report_entry_id_fkey FOREIGN KEY (report_entry_id) REFERENCES public.report_entries(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: projects projects_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: report_entries report_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_entries
    ADD CONSTRAINT report_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


