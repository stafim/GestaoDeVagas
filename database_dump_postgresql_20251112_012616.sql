--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: approval_workflow_step_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.approval_workflow_step_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'skipped'
);


ALTER TYPE public.approval_workflow_step_status OWNER TO neondb_owner;

--
-- Name: approval_workflow_step_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.approval_workflow_step_type AS ENUM (
    'dual',
    'user',
    'role',
    'permission'
);


ALTER TYPE public.approval_workflow_step_type OWNER TO neondb_owner;

--
-- Name: client_employee_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.client_employee_status AS ENUM (
    'ativo',
    'desligado',
    'ferias',
    'afastamento'
);


ALTER TYPE public.client_employee_status OWNER TO neondb_owner;

--
-- Name: contract_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.contract_type AS ENUM (
    'clt',
    'pj',
    'freelancer',
    'estagio',
    'temporario'
);


ALTER TYPE public.contract_type OWNER TO neondb_owner;

--
-- Name: dual_approval_subtype; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.dual_approval_subtype AS ENUM (
    'user',
    'permission'
);


ALTER TYPE public.dual_approval_subtype OWNER TO neondb_owner;

--
-- Name: gender; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.gender AS ENUM (
    'masculino',
    'feminino',
    'indiferente'
);


ALTER TYPE public.gender OWNER TO neondb_owner;

--
-- Name: interview_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.interview_type AS ENUM (
    'phone_screening',
    'technical',
    'behavioral',
    'final',
    'panel'
);


ALTER TYPE public.interview_type OWNER TO neondb_owner;

--
-- Name: job_reason; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.job_reason AS ENUM (
    'substituicao',
    'aumento_quadro'
);


ALTER TYPE public.job_reason OWNER TO neondb_owner;

--
-- Name: job_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.job_status AS ENUM (
    'active',
    'closed',
    'expired',
    'aberto',
    'aprovada',
    'em_recrutamento',
    'em_documentacao',
    'dp',
    'em_mobilizacao',
    'cancelada',
    'concluida'
);


ALTER TYPE public.job_status OWNER TO neondb_owner;

--
-- Name: job_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.job_type AS ENUM (
    'produtiva',
    'improdutiva'
);


ALTER TYPE public.job_type OWNER TO neondb_owner;

--
-- Name: kanban_stage; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.kanban_stage AS ENUM (
    'entrevista_inicial',
    'teste_tecnico',
    'entrevista_gestor',
    'proposta',
    'contratado'
);


ALTER TYPE public.kanban_stage OWNER TO neondb_owner;

--
-- Name: permission_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.permission_type AS ENUM (
    'create_jobs',
    'edit_jobs',
    'delete_jobs',
    'view_jobs',
    'approve_jobs',
    'assign_to_jobs',
    'create_companies',
    'edit_companies',
    'delete_companies',
    'view_companies',
    'manage_cost_centers',
    'view_applications',
    'manage_applications',
    'interview_candidates',
    'hire_candidates',
    'view_reports',
    'export_data',
    'manage_users',
    'manage_permissions'
);


ALTER TYPE public.permission_type OWNER TO neondb_owner;

--
-- Name: role_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.role_type AS ENUM (
    'super_admin',
    'admin',
    'hr_manager',
    'recruiter',
    'interviewer',
    'viewer',
    'approver',
    'manager'
);


ALTER TYPE public.role_type OWNER TO neondb_owner;

--
-- Name: selection_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.selection_status AS ENUM (
    'applied',
    'under_review',
    'phone_screening',
    'technical_test',
    'interview_scheduled',
    'interview_completed',
    'final_review',
    'approved',
    'rejected',
    'hired'
);


ALTER TYPE public.selection_status OWNER TO neondb_owner;

--
-- Name: unhealthiness_level; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.unhealthiness_level AS ENUM (
    'nao',
    '10',
    '20',
    '40'
);


ALTER TYPE public.unhealthiness_level OWNER TO neondb_owner;

--
-- Name: work_scale; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.work_scale AS ENUM (
    '5x1',
    '5x2',
    '6x1',
    '12x36',
    'outro'
);


ALTER TYPE public.work_scale OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: application_stage_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.application_stage_progress (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    application_id character varying,
    stage_id character varying,
    status character varying DEFAULT 'pending'::character varying,
    score integer,
    feedback text,
    completed_at timestamp without time zone,
    reviewed_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.application_stage_progress OWNER TO neondb_owner;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.applications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying NOT NULL,
    candidate_id character varying NOT NULL,
    cover_letter text,
    status public.selection_status DEFAULT 'applied'::public.selection_status,
    current_stage character varying DEFAULT 'application_received'::character varying,
    kanban_stage_id character varying,
    overall_score integer DEFAULT 0,
    rejection_reason text,
    notes text,
    applied_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.applications OWNER TO neondb_owner;

--
-- Name: approval_workflow_steps; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.approval_workflow_steps (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    workflow_id character varying NOT NULL,
    step_order integer NOT NULL,
    step_name character varying(255) NOT NULL,
    step_type public.approval_workflow_step_type NOT NULL,
    dual_approval_subtype public.dual_approval_subtype,
    user_id character varying,
    user_id2 character varying,
    role public.role_type,
    role2 public.role_type,
    permission public.permission_type,
    is_required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.approval_workflow_steps OWNER TO neondb_owner;

--
-- Name: approval_workflows; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.approval_workflows (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    division_id character varying NOT NULL,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.approval_workflows OWNER TO neondb_owner;

--
-- Name: benefits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.benefits (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.benefits OWNER TO neondb_owner;

--
-- Name: blacklist_candidates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blacklist_candidates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    full_name character varying(255) NOT NULL,
    cpf character varying(14) NOT NULL,
    reason text NOT NULL,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blacklist_candidates OWNER TO neondb_owner;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.candidates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    document character varying(20),
    birth_date timestamp without time zone,
    resume character varying,
    skills text,
    experience text,
    education text,
    linkedin_url character varying,
    portfolio_url character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.candidates OWNER TO neondb_owner;

--
-- Name: client_dashboard_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.client_dashboard_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying NOT NULL,
    dashboard_key character varying(100) NOT NULL,
    is_enabled boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_dashboard_permissions OWNER TO neondb_owner;

--
-- Name: client_employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.client_employees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying NOT NULL,
    cost_center_id character varying,
    name character varying(255) NOT NULL,
    "position" character varying(255),
    status public.client_employee_status DEFAULT 'ativo'::public.client_employee_status NOT NULL,
    admission_date timestamp without time zone,
    termination_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_employees OWNER TO neondb_owner;

--
-- Name: client_profession_limits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.client_profession_limits (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying NOT NULL,
    profession_id character varying NOT NULL,
    max_jobs integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_profession_limits OWNER TO neondb_owner;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clients (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    phone character varying(20),
    email character varying(255),
    address text,
    city character varying(100),
    state character varying(2),
    notes text,
    contract_file_name character varying(255),
    contract_file_path character varying(500),
    max_jobs integer,
    is_active boolean DEFAULT true,
    imported_from_senior boolean DEFAULT false,
    senior_id character varying(100),
    last_synced_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.clients OWNER TO neondb_owner;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying,
    name character varying(255) NOT NULL,
    cnpj character varying(18),
    contact_person character varying(255),
    phone character varying(20),
    email character varying(255),
    industry_type character varying(100),
    description text,
    website character varying,
    logo character varying,
    color character varying(7) DEFAULT '#10b981'::character varying,
    job_counter integer DEFAULT 0,
    imported_from_senior boolean DEFAULT false,
    senior_id character varying(100),
    last_synced_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cost_centers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    company_id character varying,
    division_id character varying,
    budget numeric(10,2),
    imported_from_senior boolean DEFAULT false,
    senior_id character varying(100),
    last_synced_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cost_centers OWNER TO neondb_owner;

--
-- Name: divisions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.divisions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.divisions OWNER TO neondb_owner;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    employee_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    company_id character varying NOT NULL,
    department character varying(100),
    "position" character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employees OWNER TO neondb_owner;

--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.integration_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    integration_type character varying(50) NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text,
    is_encrypted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.integration_settings OWNER TO neondb_owner;

--
-- Name: interview_criteria; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interview_criteria (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    interview_id character varying,
    criterion character varying(255) NOT NULL,
    score integer NOT NULL,
    notes text
);


ALTER TABLE public.interview_criteria OWNER TO neondb_owner;

--
-- Name: interviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interviews (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    application_id character varying,
    interviewer_id character varying,
    stage_id character varying,
    type public.interview_type NOT NULL,
    scheduled_at timestamp without time zone,
    duration integer DEFAULT 60,
    location character varying,
    status character varying DEFAULT 'scheduled'::character varying,
    score integer,
    feedback text,
    recommendations text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.interviews OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    invoice_number character varying(50),
    description text,
    amount numeric(10,2) NOT NULL,
    due_date timestamp without time zone NOT NULL,
    paid_date timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    boleto_url text,
    boleto_barcode character varying(100),
    boleto_digitable_line character varying(100),
    pix_qr_code text,
    pix_qr_code_text text,
    external_id character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: job_approval_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_approval_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying NOT NULL,
    workflow_step_id character varying NOT NULL,
    step_name character varying(255) NOT NULL,
    step_order integer NOT NULL,
    status public.approval_workflow_step_status NOT NULL,
    approved_by character varying,
    comments text,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    approved_by_2 character varying,
    approved_at_2 timestamp without time zone
);


ALTER TABLE public.job_approval_history OWNER TO neondb_owner;

--
-- Name: job_benefits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_benefits (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying NOT NULL,
    benefit_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.job_benefits OWNER TO neondb_owner;

--
-- Name: job_status_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_status_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying NOT NULL,
    previous_status character varying(50),
    new_status character varying(50) NOT NULL,
    changed_by character varying,
    changed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_status_history OWNER TO neondb_owner;

--
-- Name: job_statuses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_statuses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    variant character varying(20) DEFAULT 'default'::character varying NOT NULL,
    color character varying(7),
    description text,
    display_order integer DEFAULT 0,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_final boolean DEFAULT false
);


ALTER TABLE public.job_statuses OWNER TO neondb_owner;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_code character varying(50),
    title character varying(255),
    profession_id character varying,
    description text,
    requirements text,
    company_id character varying,
    cost_center_id character varying,
    cost_center_description text,
    work_position character varying(255),
    recruiter_id character varying,
    department character varying,
    location character varying,
    contract_type public.contract_type DEFAULT 'clt'::public.contract_type,
    job_type public.job_type,
    opening_date timestamp without time zone,
    start_date timestamp without time zone,
    opening_reason public.job_reason,
    replacement_employee_name character varying(255),
    age_range_min integer,
    age_range_max integer,
    specifications text,
    client_id character varying NOT NULL,
    vacancy_quantity integer DEFAULT 1,
    gender public.gender DEFAULT 'indiferente'::public.gender,
    work_scale_id character varying,
    work_hours character varying(100),
    salary_min numeric(10,2),
    bonus numeric(10,2),
    has_hazard_pay boolean DEFAULT false,
    unhealthiness_level public.unhealthiness_level DEFAULT 'nao'::public.unhealthiness_level,
    kanban_board_id character varying,
    status character varying(50) DEFAULT 'nova_vaga'::character varying,
    created_by character varying,
    expires_at timestamp without time zone,
    sla_deadline timestamp without time zone,
    notes text,
    completed_at timestamp without time zone,
    admission_date timestamp without time zone,
    hired_candidate_id character varying,
    approval_workflow_id character varying,
    approval_status character varying(50) DEFAULT 'pending'::character varying,
    current_approval_step integer,
    approved_by character varying,
    approved_at timestamp without time zone,
    created_with_irregularity boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.jobs OWNER TO neondb_owner;

--
-- Name: kanban_boards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kanban_boards (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.kanban_boards OWNER TO neondb_owner;

--
-- Name: kanban_stages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kanban_stages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    kanban_board_id character varying NOT NULL,
    name character varying(255) NOT NULL,
    "order" integer NOT NULL,
    color character varying(50) DEFAULT 'bg-blue-500'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.kanban_stages OWNER TO neondb_owner;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organizations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    cnpj character varying(18),
    contact_name character varying(255),
    contact_email character varying(255),
    contact_phone character varying(20),
    address text,
    logo character varying,
    is_active boolean DEFAULT true,
    max_users integer DEFAULT 50,
    plan_type character varying(50) DEFAULT 'basic'::character varying,
    monthly_price numeric(10,2) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.organizations OWNER TO neondb_owner;

--
-- Name: payment_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    invoice_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date timestamp without time zone NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(255),
    status character varying(20) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payment_history OWNER TO neondb_owner;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    monthly_price numeric(10,2) NOT NULL,
    yearly_price numeric(10,2),
    max_users integer DEFAULT 10,
    max_jobs integer,
    features jsonb NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.plans OWNER TO neondb_owner;

--
-- Name: professions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.professions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    "union" character varying(255),
    cbo_code character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    senior_id character varying(100),
    senior_establishment character varying(50),
    imported_from_senior boolean DEFAULT false,
    last_synced_at timestamp without time zone
);


ALTER TABLE public.professions OWNER TO neondb_owner;

--
-- Name: role_job_status_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_job_status_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role public.role_type NOT NULL,
    job_status_id character varying NOT NULL,
    can_view boolean DEFAULT false NOT NULL,
    can_edit boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.role_job_status_permissions OWNER TO neondb_owner;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role public.role_type NOT NULL,
    permission public.permission_type NOT NULL,
    is_granted boolean DEFAULT true
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- Name: selection_stages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.selection_stages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_id character varying,
    name character varying(255) NOT NULL,
    description text,
    "order" integer NOT NULL,
    is_required boolean DEFAULT true,
    passing_score integer DEFAULT 70,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.selection_stages OWNER TO neondb_owner;

--
-- Name: senior_integration_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.senior_integration_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    api_url character varying(255) DEFAULT 'https://senior-sql.acelera-it.io'::character varying NOT NULL,
    api_key character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    auto_sync boolean DEFAULT false,
    sync_interval integer DEFAULT 60,
    last_sync_at timestamp without time zone,
    last_sync_status character varying(50),
    last_sync_error text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.senior_integration_settings OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: status_notification_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.status_notification_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    status_id character varying NOT NULL,
    email_notification_enabled boolean DEFAULT false,
    whatsapp_notification_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.status_notification_settings OWNER TO neondb_owner;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key character varying(100) NOT NULL,
    value character varying(255) NOT NULL,
    label character varying(255) NOT NULL,
    description text,
    min_value integer,
    max_value integer,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_settings OWNER TO neondb_owner;

--
-- Name: user_company_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_company_roles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    company_id character varying,
    role public.role_type NOT NULL,
    cost_center_id character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_company_roles OWNER TO neondb_owner;

--
-- Name: user_menu_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_menu_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    menu_path character varying(255) NOT NULL,
    menu_name character varying(255) NOT NULL,
    can_access boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_menu_permissions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying,
    email character varying,
    password_hash character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: work_positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.work_positions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    short_name character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    senior_establishment character varying(50),
    imported_from_senior boolean DEFAULT false,
    last_synced_at timestamp without time zone
);


ALTER TABLE public.work_positions OWNER TO neondb_owner;

--
-- Name: work_scales; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.work_scales (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    start_time character varying(5),
    end_time character varying(5),
    break_intervals text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.work_scales OWNER TO neondb_owner;

--
-- Name: workflow_job_status_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.workflow_job_status_rules (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    workflow_id character varying NOT NULL,
    job_status_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.workflow_job_status_rules OWNER TO neondb_owner;

--
-- Data for Name: application_stage_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.application_stage_progress (id, application_id, stage_id, status, score, feedback, completed_at, reviewed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.applications (id, job_id, candidate_id, cover_letter, status, current_stage, kanban_stage_id, overall_score, rejection_reason, notes, applied_at, updated_at) FROM stdin;
c602d6e6-08df-4071-a07e-2ed964525227	057358c7-b2e4-4824-b77e-cba574c9c846	3446b91c-9f8b-4bdd-a90b-ad90f2941e0b	\N	applied	application_received	29861c03-6750-4e51-b592-de70f56dd11b	0	\N	\N	2025-11-12 00:23:08.772392	2025-11-12 00:28:54.414
\.


--
-- Data for Name: approval_workflow_steps; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.approval_workflow_steps (id, workflow_id, step_order, step_name, step_type, dual_approval_subtype, user_id, user_id2, role, role2, permission, is_required, created_at, updated_at) FROM stdin;
48339572-3654-4993-b556-7c742f28417e	886acb6b-1ebb-4f51-89b3-d2f3673a2838	1	Dupla Alçada - Etapa 1	dual	user	37612170-8e14-40cd-ac66-3c6a6ffd093a	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	\N	\N	t	2025-11-11 21:15:03.409124	2025-11-11 21:15:03.409124
c980893f-ed0f-415a-b4a1-9a3f2340b70c	fdaec6c5-7573-4292-8053-eb847c092317	1	Dupla Alçada - Etapa 1	dual	user	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	37612170-8e14-40cd-ac66-3c6a6ffd093a	\N	\N	\N	t	2025-11-11 22:03:25.672882	2025-11-11 22:03:25.672882
07b90d0d-19b4-460f-a434-a8f4ccadcfcc	8bef2d1d-ab52-4daa-8405-fecd7ff18015	1	Dupla Alçada - Etapa 1	dual	user	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	37612170-8e14-40cd-ac66-3c6a6ffd093a	\N	\N	\N	t	2025-11-11 22:08:13.467377	2025-11-11 22:08:13.467377
\.


--
-- Data for Name: approval_workflows; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.approval_workflows (id, name, description, division_id, is_active, is_default, created_at, updated_at) FROM stdin;
886acb6b-1ebb-4f51-89b3-d2f3673a2838	WK Critico	teste	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	t	f	2025-11-11 21:15:03.155943	2025-11-11 21:15:03.155943
fdaec6c5-7573-4292-8053-eb847c092317	Wk2 Admn	etste	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	t	t	2025-11-11 22:03:25.42176	2025-11-11 22:03:25.42176
8bef2d1d-ab52-4daa-8405-fecd7ff18015	admin3	tred	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	t	f	2025-11-11 22:08:13.213055	2025-11-11 22:08:13.213055
\.


--
-- Data for Name: benefits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.benefits (id, name, description, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: blacklist_candidates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blacklist_candidates (id, organization_id, full_name, cpf, reason, created_by, created_at, updated_at) FROM stdin;
1859826a-036d-4452-b140-ad2ee3d066aa	a6b0e84d-df56-45ab-810b-310f100cd760	ricardo	054.580.009-94	dssdsddsdsdsds	\N	2025-11-12 00:27:30.75005	2025-11-12 00:27:30.75005
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.candidates (id, name, email, phone, document, birth_date, resume, skills, experience, education, linkedin_url, portfolio_url, notes, created_at, updated_at) FROM stdin;
3446b91c-9f8b-4bdd-a90b-ad90f2941e0b	Ricardo Stafim	sfds@gmail.com	419921392121	05458000994	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-12 00:23:08.517981	2025-11-12 00:23:08.517981
\.


--
-- Data for Name: client_dashboard_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.client_dashboard_permissions (id, client_id, dashboard_key, is_enabled, created_at, updated_at) FROM stdin;
d101ccbe-a056-4fca-9c29-1bdd7c42934c	607dbda8-0553-4817-bcd1-0827084cc7fb	realtime	t	2025-11-11 18:25:41.938664	2025-11-11 18:25:41.938664
f07735e7-d790-41a7-a70b-f4764da032d5	607dbda8-0553-4817-bcd1-0827084cc7fb	analytics	t	2025-11-11 18:25:42.059853	2025-11-11 18:25:42.059853
986739e5-b0f5-454a-bfbe-1ebdf4fcc7d7	607dbda8-0553-4817-bcd1-0827084cc7fb	reports	t	2025-11-11 18:25:42.178348	2025-11-11 18:25:42.178348
\.


--
-- Data for Name: client_employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.client_employees (id, client_id, cost_center_id, name, "position", status, admission_date, termination_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_profession_limits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.client_profession_limits (id, client_id, profession_id, max_jobs, created_at, updated_at) FROM stdin;
8da86d6e-5781-41ca-b6cb-baf827dbf794	607dbda8-0553-4817-bcd1-0827084cc7fb	10db9e0b-5a24-4940-b3d4-c4c64c58bdac	99	2025-11-12 00:53:55.678573	2025-11-12 00:53:55.678573
990eb7f9-0aac-4580-afc6-7a281a5432a7	607dbda8-0553-4817-bcd1-0827084cc7fb	71232e5a-c913-4308-ae29-b5809cd24dff	1	2025-11-12 00:54:13.396721	2025-11-12 00:54:13.396721
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clients (id, organization_id, name, contact_person, phone, email, address, city, state, notes, contract_file_name, contract_file_path, max_jobs, is_active, imported_from_senior, senior_id, last_synced_at, created_at, updated_at) FROM stdin;
607dbda8-0553-4817-bcd1-0827084cc7fb	\N	Localiza	Ricardo	41992392227	stafim2@gmail.com	teste	Três Lagoas	MS		\N	\N	\N	t	f	\N	\N	2025-11-11 18:25:41.811443	2025-11-11 18:25:41.811443
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, organization_id, name, cnpj, contact_person, phone, email, industry_type, description, website, logo, color, job_counter, imported_from_senior, senior_id, last_synced_at, created_at, updated_at) FROM stdin;
5e7417e0-9e91-4234-a182-c89f89920532	a6b0e84d-df56-45ab-810b-310f100cd760	OPUS CONSULTORIA LTDA	\N	\N	(41) 30204000	\N	\N	OPUS CONSULTORIA LTDA	\N	\N	#10b981	0	t	1	2025-11-11 18:58:10.827	2025-11-11 18:58:10.858693	2025-11-11 18:58:10.858693
8380284d-034b-4bca-b059-05f5bf700f72	a6b0e84d-df56-45ab-810b-310f100cd760	BBML COMERCIO VAREJ DE ALIMENTOS LTDA ME	\N	\N	(71) 35085331	\N	\N	FRANGO AMERICANO INATIVA	\N	\N	#10b981	0	t	2	2025-11-11 18:58:11.017	2025-11-11 18:58:11.049858	2025-11-11 18:58:11.049858
0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	a6b0e84d-df56-45ab-810b-310f100cd760	OPUS SERVICES SERV DE APOIO ADM LTDA ME	\N	\N	(41) 30204000	\N	\N	SERVICES INATIVA	\N	\N	#10b981	0	t	3	2025-11-11 18:58:11.197	2025-11-11 18:58:11.231593	2025-11-11 18:58:11.231593
c9c914c1-7dd9-4878-93c8-5fa4fd3f05ed	a6b0e84d-df56-45ab-810b-310f100cd760	LBCC COMERCIO VAREJ DE ALIMENTOS LTDA ME	\N	\N	(71) 32881048	\N	\N	FRANGO AMERICANO - INATIVA	\N	\N	#10b981	0	t	4	2025-11-11 18:58:11.382	2025-11-11 18:58:11.41477	2025-11-11 18:58:11.41477
920badc4-8144-4940-8c33-2196116941a9	a6b0e84d-df56-45ab-810b-310f100cd760	FRANGO AMERICANO BAHIA LTDA EPP	\N	\N	(71) 30246663	\N	\N	FRANGO AMERICANO - INATIVA	\N	\N	#10b981	0	t	5	2025-11-11 18:58:11.57	2025-11-11 18:58:11.604813	2025-11-11 18:58:11.604813
673a19aa-72e2-49ba-b7d4-ca194933547c	a6b0e84d-df56-45ab-810b-310f100cd760	TELOS CONSULTORIA EMPRESARIAL LTDA	\N	\N	(41) 30204012	\N	\N	TELOS CONSULTORIA EMPRESARIAL LTDA	\N	\N	#10b981	0	t	6	2025-11-11 18:58:11.757	2025-11-11 18:58:11.790469	2025-11-11 18:58:11.790469
d06878be-ae25-4860-ba2f-88639dd96bf8	a6b0e84d-df56-45ab-810b-310f100cd760	SEVEN TERCEIRIZACAO DE MAO DE OBRA LTDA	\N	\N	(41) 30204000	\N	\N	SEVEN TERCEIRIZACAO DE MAO DE OBRA LTDA	\N	\N	#10b981	0	t	7	2025-11-11 18:58:11.945	2025-11-11 18:58:11.977528	2025-11-11 18:58:11.977528
96a2f2df-78f5-4b59-92f3-ac04396b09ab	a6b0e84d-df56-45ab-810b-310f100cd760	OPUS SERVICOS ESPECIALIZADOS LTDA	\N	\N	(41) 30722600	\N	\N	OPUS SERVICOS LTDA	\N	\N	#10b981	0	t	8	2025-11-11 18:58:12.316	2025-11-11 18:58:12.349364	2025-11-11 18:58:12.349364
ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	a6b0e84d-df56-45ab-810b-310f100cd760	OPUS LOGISTICA LTDA	\N	\N	(41) 30204000	\N	\N	OPUS LOGISTICA LTDA	\N	\N	#10b981	0	t	9	2025-11-11 18:58:12.699	2025-11-11 18:58:12.732935	2025-11-11 18:58:12.732935
767c65ac-b94f-4187-b6c2-f310cc7cac4f	a6b0e84d-df56-45ab-810b-310f100cd760	OPUS MANUTENCAO LTDA	\N	\N	(41) 30204000	\N	\N	OPUS MANUTENCAO LTDA	\N	\N	#10b981	0	t	10	2025-11-11 18:58:12.893	2025-11-11 18:58:12.92608	2025-11-11 18:58:12.92608
125cc65a-b995-49a7-9d1e-f28a1013a0b8	a6b0e84d-df56-45ab-810b-310f100cd760	ATENAS SERVICOS DE APOIO LTDA	\N	\N	(41) 30204000	\N	\N	ATENAS SERVICOS DE APOIO LTDA	\N	\N	#10b981	0	t	11	2025-11-11 18:58:13.265	2025-11-11 18:58:13.300642	2025-11-11 18:58:13.300642
619bf5b4-4e62-4ef6-8cb5-a8f73820a443	a6b0e84d-df56-45ab-810b-310f100cd760	MOSS DO BRASIL EQUIPAMENTOS LTDA	\N	\N	 	\N	\N	MOSS DO BRASIL EQUIPAMENTOS LTDA	\N	\N	#10b981	0	t	12	2025-11-11 18:58:13.575	2025-11-11 18:58:13.608749	2025-11-11 18:58:13.608749
c0c66615-69ec-45bd-9bf1-bcc55aeb7737	a6b0e84d-df56-45ab-810b-310f100cd760	ACELERA IT TECNOLOGIA LTDA	\N	\N	(41) 30204000	\N	\N	ACELERA IT TECNOLOGIA LTDA	\N	\N	#10b981	0	t	13	2025-11-11 18:58:13.83	2025-11-11 18:58:13.862788	2025-11-11 18:58:13.862788
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cost_centers (id, name, code, company_id, division_id, budget, imported_from_senior, senior_id, last_synced_at, created_at, updated_at) FROM stdin;
26277817-2af2-4903-851d-c1883e236756	TRELLEBORG DO BRASIL SOLUCOES EM VEDACAO	9010424	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010424	2025-11-11 18:59:43.7	2025-11-11 18:59:43.736036	2025-11-11 18:59:43.736036
732f547d-c60e-4f1c-b643-2c2477d2cbc4	K.F. INDUSTRIA E COMERCIO DE PECAS EIREL	9010455	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010455	2025-11-11 18:59:45.575	2025-11-11 18:59:45.607113	2025-11-11 18:59:45.607113
45e3d20e-c34f-4c4b-99e4-a16b742bad3f	CALDERMEC INDUSTRIA MECANICA EIRELI	9010456	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010456	2025-11-11 18:59:45.635	2025-11-11 18:59:45.667503	2025-11-11 18:59:45.667503
64f4753a-a839-4fe6-b977-95d2181b5510	OPUS CONSULTORIA LTDA	9010457	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010457	2025-11-11 18:59:45.696	2025-11-11 18:59:45.727849	2025-11-11 18:59:45.727849
c604e9b8-97e6-4505-9557-c36326cdead6	MULTIMATECH INDUSTRIA METALURGICA EIRELI	9010458	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010458	2025-11-11 18:59:45.756	2025-11-11 18:59:45.787947	2025-11-11 18:59:45.787947
666957dd-8f62-4132-ad10-d8a11b4987de	DONALDSON DO BRASIL EQUIPAMENTOS INDUSTR	9010459	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010459	2025-11-11 18:59:45.816	2025-11-11 18:59:45.848167	2025-11-11 18:59:45.848167
c036e714-265e-42f5-ad9d-d1a683abe67c	TECUMSEH DO BRASIL LTDA	9010460	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010460	2025-11-11 18:59:45.876	2025-11-11 18:59:45.908052	2025-11-11 18:59:45.908052
be88ec9a-a92c-4bef-a565-39b4c9bda974	TOWER AUTOMOTIVE DO BRASIL LTDA.	9010461	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010461	2025-11-11 18:59:45.936	2025-11-11 18:59:45.96796	2025-11-11 18:59:45.96796
6225b04a-0a23-4ca9-9bd3-3034afd53aeb	JL CAPACITORES LTDA	9010462	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010462	2025-11-11 18:59:45.996	2025-11-11 18:59:46.028525	2025-11-11 18:59:46.028525
98ce012a-38f7-45f7-8242-06031f4be236	Contas Administrativo	000001	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	000001	2025-11-11 18:58:21.687	2025-11-11 18:58:21.719223	2025-11-11 18:58:21.719223
5cd545ea-4d8d-48b2-bdd3-21a84c63595f	Contas Comercial	000002	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	000002	2025-11-11 18:58:21.748	2025-11-11 18:58:21.780853	2025-11-11 18:58:21.780853
b864dd74-9cc4-4aaf-a0ec-afc1e17a2402	Contas Custo	000003	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	000003	2025-11-11 18:58:21.809	2025-11-11 18:58:21.84028	2025-11-11 18:58:21.84028
4cc5874f-ad96-4862-844e-1085d9d6e22f	Contas Custo Regional	000004	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	000004	2025-11-11 18:58:21.868	2025-11-11 18:58:21.900676	2025-11-11 18:58:21.900676
5ed39283-7f56-4163-9244-1b8d93877f3e	WHB QUALIDADE - REGIONAL PR	000420197	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	000420197	2025-11-11 18:58:21.928	2025-11-11 18:58:21.959265	2025-11-11 18:58:21.959265
8bf6db68-67ca-4830-9262-debc18ce4d61	GERAL	1	5e7417e0-9e91-4234-a182-c89f89920532	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	1	2025-11-11 18:58:21.986	2025-11-11 18:58:22.019103	2025-11-11 18:58:22.019103
19570e1a-b545-4745-b96b-7fada7e25564	MATRIZ	100	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	100	2025-11-11 18:58:22.047	2025-11-11 18:58:22.079746	2025-11-11 18:58:22.079746
2e4d5a53-8f80-42e2-af1f-6caf0ed81580	CEO	100001	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	100001	2025-11-11 18:58:22.107	2025-11-11 18:58:22.139689	2025-11-11 18:58:22.139689
d9b6ba5c-e7a8-4c46-8f2e-ba326d61a661	PIC	101	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	101	2025-11-11 18:58:22.167	2025-11-11 18:58:22.199201	2025-11-11 18:58:22.199201
2a6b9900-ad8d-495d-9220-2eab99012e32	CONTRATOS PIC - INATIVO	102	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	102	2025-11-11 18:58:22.227	2025-11-11 18:58:22.264434	2025-11-11 18:58:22.264434
12fea943-7eb9-49b5-8891-9218bbc286ec	RENAULT CVU  - INATIVO	103	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	103	2025-11-11 18:58:22.292	2025-11-11 18:58:22.327263	2025-11-11 18:58:22.327263
40170606-dd86-41fd-a3b9-3d0ef7faa6e3	RENAULT CVP - INATIVO	104	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	104	2025-11-11 18:58:22.355	2025-11-11 18:58:22.387094	2025-11-11 18:58:22.387094
fd3e8a24-6524-4ae0-9752-6fb36551fc9d	RENAULT PDI - INATIVO	105	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	105	2025-11-11 18:58:22.414	2025-11-11 18:58:22.447212	2025-11-11 18:58:22.447212
d5da5d2e-a840-4a4a-8e55-47c7010e50d9	RENAULT POSTO - INATIVO	106	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	106	2025-11-11 18:58:22.475	2025-11-11 18:58:22.507656	2025-11-11 18:58:22.507656
113dfd92-5f94-47c4-939d-f22ec485508b	RENAULT PEGUFORM - INATIVO	107	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	107	2025-11-11 18:58:22.535	2025-11-11 18:58:22.567491	2025-11-11 18:58:22.567491
c025256d-8f09-4f58-8721-165f6b69b960	ASSISTENCIA TECNICA INATIVO	108	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	108	2025-11-11 18:58:22.595	2025-11-11 18:58:22.627533	2025-11-11 18:58:22.627533
e87c80f9-7135-4504-aeec-f4e88672538f	AKER 	109	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	109	2025-11-11 18:58:22.655	2025-11-11 18:58:22.687615	2025-11-11 18:58:22.687615
4fc6c0e3-8768-4559-8692-9e358d882bb6	ALSTOM  INATIVO	110	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	110	2025-11-11 18:58:22.715	2025-11-11 18:58:22.747969	2025-11-11 18:58:22.747969
c91b3870-ceb5-412e-b8be-f5f43debb084	CONTINENTAL	111	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	111	2025-11-11 18:58:22.775	2025-11-11 18:58:22.807686	2025-11-11 18:58:22.807686
000d40ba-d096-4c32-8352-fa415e5a3b14	FRANGO BAHIA - INATIVO	112	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	112	2025-11-11 18:58:22.835	2025-11-11 18:58:22.867653	2025-11-11 18:58:22.867653
73e07748-ba03-4f6b-83d3-fb5d971a1488	ACOES EXPORADICAS - INATIVO	113	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	113	2025-11-11 18:58:22.895	2025-11-11 18:58:22.927639	2025-11-11 18:58:22.927639
c630df35-5d2d-4b69-a09f-1f87db139ead	FORD BAHIA QUALIDADE	114	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	114	2025-11-11 18:58:22.955	2025-11-11 18:58:22.987585	2025-11-11 18:58:22.987585
d806d671-36af-4fd5-ad8f-20a2e054e45b	BOSCH CURITIBA	115	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	115	2025-11-11 18:58:23.015	2025-11-11 18:58:23.047739	2025-11-11 18:58:23.047739
8f73cd57-0566-49a0-b084-4e4caca8df70	VW CURITIBA INATIVO	116	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	116	2025-11-11 18:58:23.076	2025-11-11 18:58:23.10876	2025-11-11 18:58:23.10876
ffed4f2e-ae76-4a8c-9677-9769e3399f2d	FORD SP QUALIDADE INATIVO	117	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	117	2025-11-11 18:58:23.136	2025-11-11 18:58:23.167466	2025-11-11 18:58:23.167466
59801a41-6c14-4898-beb7-1ff2fc6fc910	FORD TAUBATE QUALIDADE	118	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	118	2025-11-11 18:58:23.195	2025-11-11 18:58:23.228269	2025-11-11 18:58:23.228269
9bfd6e40-86e4-47f3-993f-714d283e0897	SMP- PIC- CURITIBA	119	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	119	2025-11-11 18:58:23.261	2025-11-11 18:58:23.293844	2025-11-11 18:58:23.293844
e49c4c9e-c81d-48a4-8c93-5f14522b8612	FORMTAP	120	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	120	2025-11-11 18:58:23.321	2025-11-11 18:58:23.354055	2025-11-11 18:58:23.354055
e580c5c2-b452-41c5-ba8a-5a5feca7d26a	METAGAL - INATIVO	121	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	121	2025-11-11 18:58:23.381	2025-11-11 18:58:23.413545	2025-11-11 18:58:23.413545
64fc67d6-b34d-4c00-b40f-6257611c227d	PILKINGTON EMPILHADEIRA  INATIVO	122	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	122	2025-11-11 18:58:23.441	2025-11-11 18:58:23.473282	2025-11-11 18:58:23.473282
ab5052fe-5322-478e-a7b4-92b6e56f11bd	VW SP QUALIDADE  INATIVO	123	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	123	2025-11-11 18:58:23.5	2025-11-11 18:58:23.53312	2025-11-11 18:58:23.53312
6bb39587-7e28-4421-90f9-a951fba574fc	MAGNA CURITIBA INATIVO	124	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	124	2025-11-11 18:58:23.56	2025-11-11 18:58:23.592692	2025-11-11 18:58:23.592692
01357adf-69cf-402c-ad4a-de48170762e8	MAGNA BA  INATIVO	125	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	125	2025-11-11 18:58:23.62	2025-11-11 18:58:23.651966	2025-11-11 18:58:23.651966
56f398b4-fcb2-47f7-bbe4-a682c9703470	VW SAO CARLOS	126	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	126	2025-11-11 18:58:23.679	2025-11-11 18:58:23.711735	2025-11-11 18:58:23.711735
c968c4a3-3ad4-422c-b322-567c676e7643	PSA INATIVO	127	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	127	2025-11-11 18:58:23.739	2025-11-11 18:58:23.77169	2025-11-11 18:58:23.77169
d2df1fac-818e-4c6a-8bc1-dae014a14118	JAGUAR  INATIVO	128	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	128	2025-11-11 18:58:23.799	2025-11-11 18:58:23.831074	2025-11-11 18:58:23.831074
47b10137-029b-48ef-86af-7a0deffa1f5d	FORD BAHIA RODAGEM	129	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	129	2025-11-11 18:58:23.858	2025-11-11 18:58:23.896768	2025-11-11 18:58:23.896768
1f4354ad-503c-450d-80a7-06cdee985bc7	FORD BAHIA ASSISTENCIA TECNICA INATIVO	130	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	130	2025-11-11 18:58:23.93	2025-11-11 18:58:23.965585	2025-11-11 18:58:23.965585
6cc41d11-e1e3-4dad-8f23-4bd069427674	VIBRAC  INATIVO	131	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	131	2025-11-11 18:58:23.998	2025-11-11 18:58:24.043143	2025-11-11 18:58:24.043143
9c5889a7-ddaa-473c-95cc-46ca31b85dab	BOSCH POMERODE	132	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	132	2025-11-11 18:58:24.073	2025-11-11 18:58:24.105494	2025-11-11 18:58:24.105494
05aa24a6-054b-45fd-9a60-c2a1f126b67d	FORD SP RODAGEM	133	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	133	2025-11-11 18:58:24.133	2025-11-11 18:58:24.167463	2025-11-11 18:58:24.167463
14fec9c9-6324-4f0d-881d-6e4eecc5f9ca	VW SP LOGISTICA INATIVO	134	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	134	2025-11-11 18:58:24.195	2025-11-11 18:58:24.227443	2025-11-11 18:58:24.227443
c09f3dbd-19dc-4490-a011-d2bed0ec3ed5	NSK  INATIVO	135	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	135	2025-11-11 18:58:24.275	2025-11-11 18:58:24.307727	2025-11-11 18:58:24.307727
49d00b8c-9289-48f0-ab75-772dc420273d	PILKINGTON ASSISTENCIA INATIVO	136	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	136	2025-11-11 18:58:24.335	2025-11-11 18:58:24.36814	2025-11-11 18:58:24.36814
8392a28e-5fff-46da-8790-8bb0821a5d82	HANON  INATIVO	137	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	137	2025-11-11 18:58:24.395	2025-11-11 18:58:24.427686	2025-11-11 18:58:24.427686
71ff04ab-5ce2-4cb3-8c42-2fc5b8a24ed1	VISTEON INATIVO	138	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	138	2025-11-11 18:58:24.455	2025-11-11 18:58:24.487126	2025-11-11 18:58:24.487126
6b262701-0406-4b07-8c66-7d800919f382	SMP ATIBAIA  INATIVO	139	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	139	2025-11-11 18:58:24.514	2025-11-11 18:58:24.546256	2025-11-11 18:58:24.546256
7ed48d96-4a5b-4d8f-b897-efa6c09b6803	HARMANN	140	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	140	2025-11-11 18:58:24.574	2025-11-11 18:58:24.606191	2025-11-11 18:58:24.606191
cf22659d-db56-49ca-802a-d0a605c9c95b	MAN MKT INATIVO	141	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	141	2025-11-11 18:58:24.695	2025-11-11 18:58:24.727115	2025-11-11 18:58:24.727115
a1ae784f-605f-4a37-a13a-6bfd5f8849e5	MAN PAINT SHOP INATIVO	142	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	142	2025-11-11 18:58:24.754	2025-11-11 18:58:24.786613	2025-11-11 18:58:24.786613
d3551f48-e221-4633-876c-f3e5e36b308b	MAN COMPRAS INATIVO	143	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	143	2025-11-11 18:58:24.814	2025-11-11 18:58:24.847081	2025-11-11 18:58:24.847081
b76b899f-7867-4e80-892b-57536abaceb6	NAKAYONE  INATIVO	144	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	144	2025-11-11 18:58:24.874	2025-11-11 18:58:24.906646	2025-11-11 18:58:24.906646
a13f15cc-72fd-45b5-bcd4-05ddd7c64be9	MAGNA RS  INATIVO	145	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	145	2025-11-11 18:58:24.934	2025-11-11 18:58:24.965404	2025-11-11 18:58:24.965404
d5218349-d9d1-43ab-9483-fa953b6d3bf1	ACUMENT ATIBAIA INATIVO	146	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	146	2025-11-11 18:58:24.994	2025-11-11 18:58:25.030206	2025-11-11 18:58:25.030206
472798d1-ab53-4ee8-9a6f-b17404c9c1e8	FORD TATUI OFICINA	147	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	147	2025-11-11 18:58:25.058	2025-11-11 18:58:25.094224	2025-11-11 18:58:25.094224
7cc796c1-95b7-42da-acaf-04faed0264da	FCA - QUALIDADE	148	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	148	2025-11-11 18:58:25.122	2025-11-11 18:58:25.153223	2025-11-11 18:58:25.153223
a629602b-62d4-4c34-ae67-82543babd76f	MAN PERSEU INATIVO	149	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	149	2025-11-11 18:58:25.18	2025-11-11 18:58:25.212708	2025-11-11 18:58:25.212708
837ca5aa-d473-439b-9cbf-866b10ec2d1e	VOLVO CURITIBA QUALIDADE	150	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	150	2025-11-11 18:58:25.24	2025-11-11 18:58:25.272754	2025-11-11 18:58:25.272754
ef888a1b-4bcc-4eba-87de-d5f841db6292	VOLVO PEDERNEIRAS QUALIDADE	151	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	151	2025-11-11 18:58:25.3	2025-11-11 18:58:25.332673	2025-11-11 18:58:25.332673
3f319679-bf7d-45fc-8919-aff0a3033f2a	PELZER	152	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	152	2025-11-11 18:58:25.36	2025-11-11 18:58:25.392567	2025-11-11 18:58:25.392567
1442dce7-d3c0-4df8-86d6-bd64e0b6c5ec	FORD BAHIA MOD CENTER	153	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	153	2025-11-11 18:58:25.42	2025-11-11 18:58:25.452957	2025-11-11 18:58:25.452957
1e4ae13e-dcc4-46a6-8fae-2f7684213375	NSK SUZANO	154	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	154	2025-11-11 18:58:25.481	2025-11-11 18:58:25.513306	2025-11-11 18:58:25.513306
f1e0a495-1d31-4f85-aeb7-d113f195135a	EDSCHA INATIVO	155	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	155	2025-11-11 18:58:25.54	2025-11-11 18:58:25.57266	2025-11-11 18:58:25.57266
351dce30-9af5-4fa9-80b2-9df30f30aa59	LEAR  INATIVO	156	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	156	2025-11-11 18:58:25.6	2025-11-11 18:58:25.632216	2025-11-11 18:58:25.632216
4897197c-c1cd-4abb-b6b5-19a70e9f4c00	JTEKT	157	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	157	2025-11-11 18:58:25.659	2025-11-11 18:58:25.6918	2025-11-11 18:58:25.6918
c619acf2-7053-4bfa-85ba-25db59d33497	NETZSCH	158	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	158	2025-11-11 18:58:25.719	2025-11-11 18:58:25.751612	2025-11-11 18:58:25.751612
e8dd33a6-90d6-47a0-97fb-de536db52542	VOLVO EXTERNOS	159	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	159	2025-11-11 18:58:25.779	2025-11-11 18:58:25.811539	2025-11-11 18:58:25.811539
6934c9fe-eda4-4ccf-a17f-34190962824b	AETHRA INATIVO	160	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	160	2025-11-11 18:58:25.839	2025-11-11 18:58:25.871202	2025-11-11 18:58:25.871202
82638236-dae4-420b-80bb-e31c6553be45	BOSCH SOROCABA	161	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	161	2025-11-11 18:58:25.899	2025-11-11 18:58:25.935544	2025-11-11 18:58:25.935544
ebd4ed62-ae2b-4335-af4c-96b775cb8fba	GM SCS REPACK	162	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	162	2025-11-11 18:58:25.963	2025-11-11 18:58:25.995415	2025-11-11 18:58:25.995415
3c0873c2-b34b-42fd-94dd-d58d0c5c3d68	FAURECIA BA QUALIDADE	163	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	163	2025-11-11 18:58:26.023	2025-11-11 18:58:26.056886	2025-11-11 18:58:26.056886
57f68da5-3d01-4190-85ed-11d8399d9b8c	VW ANCHIETA TETOS	164	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	164	2025-11-11 18:58:26.087	2025-11-11 18:58:26.122517	2025-11-11 18:58:26.122517
42ec3374-83bd-43b7-a535-d30904eadaa6	VW ANCHIETA RETROVISOR MACANETA	165	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	165	2025-11-11 18:58:26.15	2025-11-11 18:58:26.182429	2025-11-11 18:58:26.182429
20316604-70eb-48bf-955b-24f0762d2c68	VW ANCHIETA ESCAPAMENTO	166	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	166	2025-11-11 18:58:26.21	2025-11-11 18:58:26.24228	2025-11-11 18:58:26.24228
5678906f-e67e-4a5e-898e-47bf7883c0b3	VW ANCHIETA GRADES FRISOS PEDALEIRA	167	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	167	2025-11-11 18:58:26.27	2025-11-11 18:58:26.302061	2025-11-11 18:58:26.302061
c5de6f17-a53c-49c3-8601-8d5b2c00037e	VW ANCHIETA PARA-CHOQUES	168	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	168	2025-11-11 18:58:26.329	2025-11-11 18:58:26.361882	2025-11-11 18:58:26.361882
3471f46d-e7ef-4ed2-844e-aeacdec5e1c1	GM SCS EMBALAGEM PARA-CHOQUE	169	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	169	2025-11-11 18:58:26.389	2025-11-11 18:58:26.421842	2025-11-11 18:58:26.421842
b72b36b3-2531-4ef1-a316-ad710d68e26a	GM SCS PLASTIFICACAO	170	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	170	2025-11-11 18:58:26.449	2025-11-11 18:58:26.482021	2025-11-11 18:58:26.482021
54d12e0b-9d0d-465a-a900-ad93d54183b2	GM GVT EMBALAGEM PARA-CHOQUE  INATIVO	171	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	171	2025-11-11 18:58:26.51	2025-11-11 18:58:26.543503	2025-11-11 18:58:26.543503
33057938-0ff7-4b90-b64e-3c8683b56f45	PSA MONOZUKURI  INATIVO	172	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	172	2025-11-11 18:58:26.571	2025-11-11 18:58:26.603192	2025-11-11 18:58:26.603192
32a77565-2747-4d09-bb5c-e2283cdf7bb0	ADMINISTRATIVO PARANA	173	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	173	2025-11-11 18:58:26.63	2025-11-11 18:58:26.663095	2025-11-11 18:58:26.663095
07d5d855-7825-4f9a-b2dd-c9cab4295ad2	ADMINISTRATIVO BAHIA	174	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	174	2025-11-11 18:58:26.69	2025-11-11 18:58:26.722814	2025-11-11 18:58:26.722814
728ab094-dd54-47e0-ab47-e85e610f9d47	ADMINISTRATIVO SAO PAULO	175	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	175	2025-11-11 18:58:26.75	2025-11-11 18:58:26.782355	2025-11-11 18:58:26.782355
02ea17a7-d847-49c8-9ddf-4cbfd2bbb690	VW TAUBATE	176	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	176	2025-11-11 18:58:26.809	2025-11-11 18:58:26.842041	2025-11-11 18:58:26.842041
9eff99e2-59f0-472e-9ff0-5e577d613328	VW ANCHIETA PARA-CHOQUES PLASCAR	177	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	177	2025-11-11 18:58:26.869	2025-11-11 18:58:26.902358	2025-11-11 18:58:26.902358
6d167006-1bfd-4192-b857-0d28cc315ed2	GM SCS CAMUFLAGEM	178	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	178	2025-11-11 18:58:26.93	2025-11-11 18:58:26.962168	2025-11-11 18:58:26.962168
2c4f8c2b-3be0-4b41-8b47-a6ecf5eb0218	FAURECIA QUALIDADE SJP  INATIVO	179	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	179	2025-11-11 18:58:26.989	2025-11-11 18:58:27.021616	2025-11-11 18:58:27.021616
645117e5-dfa5-4ddb-baa6-1a6d7b97b0a8	HARMANN CATALAO	180	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	180	2025-11-11 18:58:27.049	2025-11-11 18:58:27.081607	2025-11-11 18:58:27.081607
81e11477-3a19-4d79-8d7c-6c34b9a2c026	MAGNA RS QUALIDADE  INATIVO	181	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	181	2025-11-11 18:58:27.109	2025-11-11 18:58:27.141774	2025-11-11 18:58:27.141774
6a766104-c5f4-4fb7-b6e9-99dcc045b8eb	MAGNA PR QUALIDADE	182	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	182	2025-11-11 18:58:27.169	2025-11-11 18:58:27.201674	2025-11-11 18:58:27.201674
0a546f65-626f-4309-8657-c85d13c0039d	THYSSENKRUPP QUALIDADE	183	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	183	2025-11-11 18:58:27.232	2025-11-11 18:58:27.265212	2025-11-11 18:58:27.265212
9ada23ac-ce0f-422a-9186-c53e64f85dd7	VW TAUBATE - SEQUENCIAMENTO DE VIDROS	184	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	184	2025-11-11 18:58:27.292	2025-11-11 18:58:27.325056	2025-11-11 18:58:27.325056
5b94a1bd-a575-4ee0-b559-1d8fdb37686c	AMVIAN PIC SJP	185	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	185	2025-11-11 18:58:27.352	2025-11-11 18:58:27.384469	2025-11-11 18:58:27.384469
08330c1c-c149-4d4b-8ba7-3043f9835bb7	MAGNA COSMA BAHIA	186	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	186	2025-11-11 18:58:27.412	2025-11-11 18:58:27.444307	2025-11-11 18:58:27.444307
b6877d16-33c9-4832-9ee4-d0eb7e5c446d	MAGNA METROLOGIA BA	187	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	187	2025-11-11 18:58:27.471	2025-11-11 18:58:27.503728	2025-11-11 18:58:27.503728
178f0222-1b3d-4483-8951-ba291675dcc3	PSA BALANCA	188	5e7417e0-9e91-4234-a182-c89f89920532	6a52b2fc-1ec7-41e6-a156-91cbfd9e69de	\N	t	188	2025-11-11 18:58:27.531	2025-11-11 18:58:27.563548	2025-11-11 18:58:27.563548
1cc46c26-36d7-4155-8761-3af7c18c119c	MAGNA LIMPEZA TECNICA BA	189	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	189	2025-11-11 18:58:27.591	2025-11-11 18:58:27.624123	2025-11-11 18:58:27.624123
88fbc8e3-f0ef-4881-bcee-6e9e5693b107	BOSCH CURITIBA REPACK	190	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	190	2025-11-11 18:58:27.651	2025-11-11 18:58:27.683754	2025-11-11 18:58:27.683754
897ad886-9ab5-4617-9703-36df76249354	TW ESPUMAS SJP ASSIST TECNICA	191	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	191	2025-11-11 18:58:27.713	2025-11-11 18:58:27.745273	2025-11-11 18:58:27.745273
66b91b8e-1247-4be8-bf41-03eadd14a949	FAURECIA QUALIDADE - PE	192	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	192	2025-11-11 18:58:27.772	2025-11-11 18:58:27.804761	2025-11-11 18:58:27.804761
f5d7e55f-24bf-40ef-aec7-7676000e16f7	AFASTADOS	193	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	193	2025-11-11 18:58:27.832	2025-11-11 18:58:27.864468	2025-11-11 18:58:27.864468
b4403f64-cd7f-41cd-9513-6720ff976174	AFASTADOS FILIAL	194	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	194	2025-11-11 18:58:27.892	2025-11-11 18:58:27.924066	2025-11-11 18:58:27.924066
6a6da260-b2cd-4dbb-acf2-e94b96584a15	IVECO RODAGEM MG	195	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	195	2025-11-11 18:58:27.951	2025-11-11 18:58:27.983476	2025-11-11 18:58:27.983476
6aad8dde-8d03-4196-b188-36d7db406024	THYSSENKRUPP - POCOS DE CALDAS -MG	196	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	196	2025-11-11 18:58:28.011	2025-11-11 18:58:28.043159	2025-11-11 18:58:28.043159
1bd9f3f8-b91c-42c4-8a76-161d849d4df2	WHIRLPOOL SP REOPERACAO	197	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	197	2025-11-11 18:58:28.07	2025-11-11 18:58:28.102959	2025-11-11 18:58:28.102959
b65e8db9-8321-4777-b3d3-b105d73cb969	AMBEV	198	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	198	2025-11-11 18:58:28.13	2025-11-11 18:58:28.162751	2025-11-11 18:58:28.162751
91bef1d7-6d14-4b67-a6c7-19249c8c7e2f	CISA QUALIDADE	199	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	199	2025-11-11 18:58:28.19	2025-11-11 18:58:28.222633	2025-11-11 18:58:28.222633
cbea11bf-3d57-4aac-805b-abd0c706e3e0	TUPER QUALIDADE	200	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200	2025-11-11 18:58:28.25	2025-11-11 18:58:28.281347	2025-11-11 18:58:28.281347
efcaa4ac-963e-41ac-ac78-78c16debfb82	DEPARTAMENTO PESSOAL - MATRIZ	200001	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200001	2025-11-11 18:58:28.309	2025-11-11 18:58:28.341258	2025-11-11 18:58:28.341258
0dd2579e-7454-487b-8bd4-b9c000fe1829	RECURSOS HUMANOS - MATRIZ	200002	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200002	2025-11-11 18:58:28.368	2025-11-11 18:58:28.400835	2025-11-11 18:58:28.400835
87ba3b1f-5d2b-41c4-b6cd-6190c4e0ef88	T.I - MATRIZ	200003	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200003	2025-11-11 18:58:28.429	2025-11-11 18:58:28.461386	2025-11-11 18:58:28.461386
8767d200-1efb-4129-aca1-a6eb08fa40c9	FINANCEIRO - MATRIZ	200004	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200004	2025-11-11 18:58:28.489	2025-11-11 18:58:28.521329	2025-11-11 18:58:28.521329
2398e26a-8aee-45db-94cc-cd8a35a98e88	COMERCIAL - MATRIZ	200005	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200005	2025-11-11 18:58:28.548	2025-11-11 18:58:28.580877	2025-11-11 18:58:28.580877
9eba2408-709e-4692-873e-999b39cb15df	FATURAMENTO - MATRIZ	200006	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200006	2025-11-11 18:58:28.608	2025-11-11 18:58:28.64091	2025-11-11 18:58:28.64091
503d0eef-0cca-4dcb-bfa0-bc5167a9f87e	COMPRAS - MATRIZ	200007	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200007	2025-11-11 18:58:28.668	2025-11-11 18:58:28.700427	2025-11-11 18:58:28.700427
03a5c69a-dce7-48e5-b216-b660b38f8b0d	JURIDICO - MATRIZ	200008	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200008	2025-11-11 18:58:28.728	2025-11-11 18:58:28.760154	2025-11-11 18:58:28.760154
c764da40-ee2f-4f7c-88e4-d4fc4b9ff42b	CUSTOS EXTRA - ORÇAMENTO - MATRIZ	200009	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200009	2025-11-11 18:58:28.787	2025-11-11 18:58:28.819807	2025-11-11 18:58:28.819807
922c0088-8d7f-4a2f-85d5-f712d37659c7	DP - TEMPORARIOS - MATRIZ	200010	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200010	2025-11-11 18:58:28.847	2025-11-11 18:58:28.878532	2025-11-11 18:58:28.878532
6fc07ebc-9910-41ec-b9b2-209f4a60b426	PRESTADORES DE SERVIÇOS - MATRIZ	200011	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200011	2025-11-11 18:58:28.906	2025-11-11 18:58:28.938219	2025-11-11 18:58:28.938219
0a13f34d-1e69-412a-b3da-5280f37026d3	GERAL MATRIZ	200012	5e7417e0-9e91-4234-a182-c89f89920532	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200012	2025-11-11 18:58:28.965	2025-11-11 18:58:29.00077	2025-11-11 18:58:29.00077
c003c7f7-dc51-43e7-9434-555d9ac39f5f	QUALIDADE - MATRIZ	200013	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200013	2025-11-11 18:58:29.028	2025-11-11 18:58:29.059284	2025-11-11 18:58:29.059284
659795be-7887-46a9-a8cf-f6bb8c76dabc	CONTROLADORIA - MATRIZ	200014	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200014	2025-11-11 18:58:29.087	2025-11-11 18:58:29.118265	2025-11-11 18:58:29.118265
0a7ec791-ffe7-4b93-ba51-839f4b21a36d	INVESTIMENTOS ADMINISTRATIVOS - MATRIZ	200030	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	200030	2025-11-11 18:58:29.146	2025-11-11 18:58:29.177985	2025-11-11 18:58:29.177985
d901c8cf-f78a-46fd-9e9b-e1c55e717787	VIEMAR QUALIDADE	201	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	201	2025-11-11 18:58:29.205	2025-11-11 18:58:29.237688	2025-11-11 18:58:29.237688
f5ab7360-37bd-43b3-83ad-6053bdca096c	ATIVIDADES ESPORADICAS PR	202	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	202	2025-11-11 18:58:29.265	2025-11-11 18:58:29.2969	2025-11-11 18:58:29.2969
384b17e7-115d-4919-b25f-2bec55f19d75	METAGAL CONCEICAO DOS OUROS	36	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	36	2025-11-11 18:58:29.324	2025-11-11 18:58:29.35689	2025-11-11 18:58:29.35689
cb2ceb72-0444-4ec5-8d73-8221ed02e0e2	ADIENT	40002	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	40002	2025-11-11 18:58:29.384	2025-11-11 18:58:29.416597	2025-11-11 18:58:29.416597
22400c66-c345-4ec1-beef-cfdbd433922a	COOPER ATIBAIA	410198	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410198	2025-11-11 18:58:29.444	2025-11-11 18:58:29.475842	2025-11-11 18:58:29.475842
31180e56-21a7-4d86-86d3-d45c355bd7c2	VERALLIA PORTO FERREIRA	410199	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410199	2025-11-11 18:58:29.503	2025-11-11 18:58:29.536022	2025-11-11 18:58:29.536022
8f90fe3a-969f-4930-a63e-c52de5317ae7	VERALLIA JACUTINGA LOGISTICA CHAPA	410202	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410202	2025-11-11 18:58:29.563	2025-11-11 18:58:29.595452	2025-11-11 18:58:29.595452
b3528125-acf9-44a8-bb68-2db2dbe61512	GM SCS CAMUFLAGEM	410203	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410203	2025-11-11 18:58:29.623	2025-11-11 18:58:29.655077	2025-11-11 18:58:29.655077
a4315542-a26d-4c15-bbba-235ba5dbc034	ZF RESIDENTE	410204	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410204	2025-11-11 18:58:29.682	2025-11-11 18:58:29.714602	2025-11-11 18:58:29.714602
80c7a472-b12e-430c-a3a0-4eea7fe807db	VERALLIA JACUTINGA AREA FRIA QUALIDADE 	410205	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410205	2025-11-11 18:58:29.742	2025-11-11 18:58:29.774046	2025-11-11 18:58:29.774046
7c9a3a83-00ec-4e34-be4e-3b48436e2d67	VERALLIA JACUTINGA FUSAO	410206	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410206	2025-11-11 18:58:29.801	2025-11-11 18:58:29.833527	2025-11-11 18:58:29.833527
1d9c5bf3-273b-4fbe-9223-b0c2f7225b56	VERALLIA JACUTINGA AREA FRIA PRODUCAO	410207	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410207	2025-11-11 18:58:29.861	2025-11-11 18:58:29.892849	2025-11-11 18:58:29.892849
2ea476d5-5b8a-44ef-9dc5-1de1e860e34e	FORD CAJAMAR	410208	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410208	2025-11-11 18:58:29.92	2025-11-11 18:58:29.952409	2025-11-11 18:58:29.952409
91c1c3aa-1e5a-4d1d-a2d3-caff7cf40b8d	VERALLIA JACUTINGA - LINHA DE MONTAGEM	410209	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410209	2025-11-11 18:58:29.98	2025-11-11 18:58:30.011944	2025-11-11 18:58:30.011944
f85a43df-9810-4b17-91e4-fc9c560ed96e	MARTINREA	410210	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410210	2025-11-11 18:58:30.039	2025-11-11 18:58:30.070261	2025-11-11 18:58:30.070261
f74252a1-b51d-4124-9c3f-efdac562ab71	GVS MONTE MOR	410211	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410211	2025-11-11 18:58:30.097	2025-11-11 18:58:30.131231	2025-11-11 18:58:30.131231
34eaca6b-4359-45d6-a89a-ca86f34b9a2a	VERALLIA JACUTINGA - ADM	410212	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410212	2025-11-11 18:58:30.158	2025-11-11 18:58:30.191224	2025-11-11 18:58:30.191224
561cc4bf-141d-448b-a060-dd7c33625c71	OPUS - SP - FIPS - MANUTENÇAO	410213	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410213	2025-11-11 18:58:30.222	2025-11-11 18:58:30.254556	2025-11-11 18:58:30.254556
9ff9834f-0e34-47f7-8aaa-fa55d00f1f0a	FIPS - SP - LIMPEZA	410214	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	410214	2025-11-11 18:58:30.282	2025-11-11 18:58:30.313952	2025-11-11 18:58:30.313952
7660b25a-75e8-4b8e-b366-ba0b6b37be2f	ADIENT SOROCABA	410215	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410215	2025-11-11 18:58:30.341	2025-11-11 18:58:30.373464	2025-11-11 18:58:30.373464
bcda69bc-75cc-4043-9845-0b814c80459f	VERALLIA PORTO FERREIRA – REESCOLHA	410217	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	410217	2025-11-11 18:58:30.401	2025-11-11 18:58:30.433144	2025-11-11 18:58:30.433144
92e6ba57-cbf4-49b9-b35c-042af1e7ed5e	ADIENT	420002	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420002	2025-11-11 18:58:30.46	2025-11-11 18:58:30.492778	2025-11-11 18:58:30.492778
70a87929-83f2-4f69-8bf7-85b702c5fca7	PLASCAR SJP	420003	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420003	2025-11-11 18:58:30.52	2025-11-11 18:58:30.55209	2025-11-11 18:58:30.55209
3ee753b7-50af-4005-80e2-c070146f3dea	BOSCH CURITIBA QUALIDADE	420115	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420115	2025-11-11 18:58:30.579	2025-11-11 18:58:30.611948	2025-11-11 18:58:30.611948
4a7510b5-1c68-4e8e-86cf-6a3d6c55dae4	VOLVO C3 SJP	420151	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420151	2025-11-11 18:58:30.641	2025-11-11 18:58:30.672894	2025-11-11 18:58:30.672894
57b04436-7eb3-43f2-996a-159d708b55a0	AAM LOGISTICA	420189	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420189	2025-11-11 18:58:30.7	2025-11-11 18:58:30.732513	2025-11-11 18:58:30.732513
6598e4dd-ee18-4e8f-a274-63d7692d66ef	AAM QUALIDADE	420193	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420193	2025-11-11 18:58:30.76	2025-11-11 18:58:30.792093	2025-11-11 18:58:30.792093
3385c4e6-f899-44d3-9f2c-56ea43e15fb3	COOPERSTANDARD-SC	420195	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420195	2025-11-11 18:58:30.819	2025-11-11 18:58:30.851509	2025-11-11 18:58:30.851509
44f7f8f1-d1b3-420b-9490-081bd366f48c	CR BLUECAST INDUSTRIA MECANICA DO BRASIL	420196	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420196	2025-11-11 18:58:30.88	2025-11-11 18:58:30.911946	2025-11-11 18:58:30.911946
f69890a8-ede4-4646-aff0-e85b0893629e	BOSCH CURITIBA LIMP. DE PÇS	420198	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	420198	2025-11-11 18:58:30.939	2025-11-11 18:58:30.971446	2025-11-11 18:58:30.971446
55171186-1d70-4668-9274-1c5be8970236	BOSCH CURITIBA MOE EMBALAGEM	420200	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420200	2025-11-11 18:58:30.999	2025-11-11 18:58:31.031058	2025-11-11 18:58:31.031058
9efafbd8-c56e-4d03-81b0-c254adec2b5a	BELLS QUALIDADE - PR	420201	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420201	2025-11-11 18:58:31.058	2025-11-11 18:58:31.090841	2025-11-11 18:58:31.090841
b267a30b-2413-42ca-b3cf-9e50b838356c	FAURECIA RESIDENTE	420202	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	420202	2025-11-11 18:58:31.118	2025-11-11 18:58:31.150665	2025-11-11 18:58:31.150665
8ac3c377-53f3-43a9-9e03-dbaee95d2e63	MAGNA SJP	420203	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	420203	2025-11-11 18:58:31.178	2025-11-11 18:58:31.210553	2025-11-11 18:58:31.210553
47c17462-174b-4775-a1ad-6a538e49a8b1	IAGA - POMERODE	430210	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	430210	2025-11-11 18:58:31.238	2025-11-11 18:58:31.270109	2025-11-11 18:58:31.270109
e83e12ad-403a-4eff-b833-2fa485096f77	CGE	430250	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	430250	2025-11-11 18:58:31.297	2025-11-11 18:58:31.329639	2025-11-11 18:58:31.329639
5bc14a1b-e4bf-4159-8b64-72f73d686aa2	HARMAN RESIDENTE PE	450002	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	450002	2025-11-11 18:58:31.357	2025-11-11 18:58:31.389005	2025-11-11 18:58:31.389005
e8c5a96f-6951-4b7e-827b-d4b9c9c30298	TW ESPUMAS PE	450003	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	450003	2025-11-11 18:58:31.416	2025-11-11 18:58:31.44855	2025-11-11 18:58:31.44855
c2b2b103-ec76-4fb4-9c4a-2956763cae79	FERROLENE - RJ	470001	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	470001	2025-11-11 18:58:31.477	2025-11-11 18:58:31.509177	2025-11-11 18:58:31.509177
500d4197-123b-4c4d-b311-3b76fc1980b6	COOPER VARGINHA LUBRIFICAÇÃO	480197	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	480197	2025-11-11 18:58:31.536	2025-11-11 18:58:31.568706	2025-11-11 18:58:31.568706
522a5bb6-abc8-4bf0-9cbf-ba3c32db1b4b	COOPER VARGINHA MANUTENCAO ELETRICA	480198	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	480198	2025-11-11 18:58:31.596	2025-11-11 18:58:31.628538	2025-11-11 18:58:31.628538
88d7d90f-51e4-4de6-8416-ea1b7612f332	COOPER VARGINHA SERRALHERIA	480199	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	480199	2025-11-11 18:58:31.656	2025-11-11 18:58:31.688643	2025-11-11 18:58:31.688643
44dcf618-8bef-4b83-aedc-c460ef98d0c1	COOPER VARGINHA USINAGEM	480200	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	480200	2025-11-11 18:58:31.716	2025-11-11 18:58:31.747201	2025-11-11 18:58:31.747201
06b1a4e3-a672-4471-8f72-c116b9e08281	PLASCAR VARGINHA	480201	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	480201	2025-11-11 18:58:31.776	2025-11-11 18:58:31.808617	2025-11-11 18:58:31.808617
3b8ffcec-6c07-43ed-88b3-113f01dccda5	MAGNA SAP	490002	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	490002	2025-11-11 18:58:31.836	2025-11-11 18:58:31.867951	2025-11-11 18:58:31.867951
80bbc39c-4e48-41cc-9861-011795af58e6	ENSINGER RS	490003	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	490003	2025-11-11 18:58:31.895	2025-11-11 18:58:31.927681	2025-11-11 18:58:31.927681
d8c3641e-82b9-440a-8eba-4bde4bf2e4c6	MAGNA SAP SERRALHEIRO  - RS	490004	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	490004	2025-11-11 18:58:31.955	2025-11-11 18:58:31.986903	2025-11-11 18:58:31.986903
5d32c956-ba51-404e-bc10-c629e20ce6e2	VERALLIA CAMPO BOM - RS	490005	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	490005	2025-11-11 18:58:32.014	2025-11-11 18:58:32.045219	2025-11-11 18:58:32.045219
be5198c4-23d4-4804-ba14-ea104dab1f36	VERALLIA CAMPO BOM REESCOLHA PALLET	490006	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	490006	2025-11-11 18:58:32.073	2025-11-11 18:58:32.105711	2025-11-11 18:58:32.105711
2f8886a9-4dfc-475c-ab60-06f4b67eda43	VERALLIA CAMPO BOM REESCOLHA GARRAFA	490007	5e7417e0-9e91-4234-a182-c89f89920532	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	490007	2025-11-11 18:58:32.133	2025-11-11 18:58:32.165501	2025-11-11 18:58:32.165501
df62c015-1936-4ba3-9317-7b13eb2ea9ac	FAURECIA LIMEIRA LIMPEZA CAIXAS	810002	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	810002	2025-11-11 18:58:32.193	2025-11-11 18:58:32.225122	2025-11-11 18:58:32.225122
4ad19542-7bc5-4cb7-8cdf-3965451a8de3	PINAUTO GO	850066	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	850066	2025-11-11 18:58:32.252	2025-11-11 18:58:32.28477	2025-11-11 18:58:32.28477
d7279428-b30a-441e-a518-90f95a485a71	RENAULT DO BRASIL S.A	9010001	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010001	2025-11-11 18:58:32.312	2025-11-11 18:58:32.344638	2025-11-11 18:58:32.344638
8aaf7ac7-483f-44a6-a581-bdd6e0e2de34	PILKINGTON BRASIL LTDA	9010002	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010002	2025-11-11 18:58:32.373	2025-11-11 18:58:32.404925	2025-11-11 18:58:32.404925
c0f139d9-6824-4fa8-92c5-7738cfc69f67	ZF AUTOMOTIVE BRASIL LTDA.	9010003	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010003	2025-11-11 18:58:32.432	2025-11-11 18:58:32.464477	2025-11-11 18:58:32.464477
3bc5d68c-eb8d-4194-b7d0-6a38392398e8	VALEO SISTEMAS AUTOMOTIVOS LTDA	9010004	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010004	2025-11-11 18:58:32.492	2025-11-11 18:58:32.524797	2025-11-11 18:58:32.524797
346a50ca-400c-4316-822b-5777e4f94b87	ZF AUTOMOTIVE BRASIL LTDA.	9010005	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010005	2025-11-11 18:58:32.552	2025-11-11 18:58:32.64087	2025-11-11 18:58:32.64087
0700da9f-3983-440d-9829-a408346cb97b	NISSAN DO BRASIL AUTOMOVEIS LTDA	9010006	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010006	2025-11-11 18:58:32.668	2025-11-11 18:58:32.700581	2025-11-11 18:58:32.700581
d2895fb8-f641-42f9-84f9-a4500b3b9bff	SMP AUTOMOTIVE P. AUT.DO BRASIL LTDA	9010007	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010007	2025-11-11 18:58:32.728	2025-11-11 18:58:32.760128	2025-11-11 18:58:32.760128
e87f6cae-9603-4443-b220-5f14c01f59e9	ZF AUTOMOTIVE BRASIL LTDA.	9010008	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010008	2025-11-11 18:58:32.787	2025-11-11 18:58:32.819675	2025-11-11 18:58:32.819675
a07a61df-5eaa-43d3-abad-cbf978b2966e	VISTEON AMAZONAS LTDA	9010009	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010009	2025-11-11 18:58:32.847	2025-11-11 18:58:32.880096	2025-11-11 18:58:32.880096
4867957e-afb7-4ad9-b73b-b33e53b3e54e	AKER SOLUTIONS DO BRASIL LTDA	9010010	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010010	2025-11-11 18:58:32.907	2025-11-11 18:58:32.939358	2025-11-11 18:58:32.939358
9aa11054-1de6-4fed-b665-55dad754f0b5	GE ENERGIAS RENOVAVEIS LTDA	9010011	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010011	2025-11-11 18:58:32.966	2025-11-11 18:58:32.998702	2025-11-11 18:58:32.998702
153e572d-b3b6-4a9e-8eba-d9af6d0f8d09	OPUS CONSULTORIA LTDA	9010012	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010012	2025-11-11 18:58:33.026	2025-11-11 18:58:33.057548	2025-11-11 18:58:33.057548
ed0b4674-8848-45ff-bffb-2f09374be01d	ALSTOM BRASIL ENERGIA E TRANSPORTE LTDA	9010013	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010013	2025-11-11 18:58:33.085	2025-11-11 18:58:33.11721	2025-11-11 18:58:33.11721
bd349ed3-0bf6-4c6e-aa38-6f6b21f08283	AKER SOLUTIONS DO BRASIL LTDA	9010014	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010014	2025-11-11 18:58:33.144	2025-11-11 18:58:33.176799	2025-11-11 18:58:33.176799
59d50d87-653f-4c54-9807-033d928ef31e	ZF DO BRASIL LTDA	9010015	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010015	2025-11-11 18:58:33.204	2025-11-11 18:58:33.236134	2025-11-11 18:58:33.236134
0fa0876c-19f2-4737-ae51-39b7217afe0d	OBRA AKER	9010016	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010016	2025-11-11 18:58:33.263	2025-11-11 18:58:33.295653	2025-11-11 18:58:33.295653
d7cb6302-a2d5-4415-8a21-a95a0a301733	TRW AUTOMOTIVE LTDA	9010017	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010017	2025-11-11 18:58:33.323	2025-11-11 18:58:33.354864	2025-11-11 18:58:33.354864
16183636-15c2-45e5-9e78-a98ac0a60636	NISSAN DO BRASIL AUTOMOTIVEIS LTDA	9010018	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010018	2025-11-11 18:58:33.382	2025-11-11 18:58:33.414625	2025-11-11 18:58:33.414625
05eb5454-b788-4666-8d3f-e8c8701ec54f	AUTONEUM BRASIL TEXTEIS ACUSTICOS LTDA	9010019	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010019	2025-11-11 18:58:33.442	2025-11-11 18:58:33.473999	2025-11-11 18:58:33.473999
5b3e6145-6ba6-4669-9302-5239e248c159	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS SA	9010020	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010020	2025-11-11 18:58:33.501	2025-11-11 18:58:33.533438	2025-11-11 18:58:33.533438
2b54d613-a41c-4a1a-aa9d-beab7e8da995	FAGOR EDERLAN BRASILEIRA AUTO PECAS LTDA	9010021	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010021	2025-11-11 18:58:33.561	2025-11-11 18:58:33.594301	2025-11-11 18:58:33.594301
7265c494-f50d-4f80-a864-067709fe908e	AUTONEUM BRASIL TEXTEIS ACUSTCOS LTDA	9010022	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010022	2025-11-11 18:58:33.663	2025-11-11 18:58:33.695824	2025-11-11 18:58:33.695824
06878a1c-818e-4b8f-8766-cb59a5f4ab50	ESTRUTURAS METALICAS SANTO A. LTDA EPP	9010023	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010023	2025-11-11 18:58:33.723	2025-11-11 18:58:33.756062	2025-11-11 18:58:33.756062
97babaea-6545-4fb0-8159-766a4c8ed101	FORMATO CLEAR ROOM COMERCIO E SERVICOS L	9010024	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010024	2025-11-11 18:58:33.783	2025-11-11 18:58:33.81561	2025-11-11 18:58:33.81561
759ba86e-b706-41dd-be21-4469795d0513	SODECIA DA BAHIA LTDA	9010025	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010025	2025-11-11 18:58:33.843	2025-11-11 18:58:33.874974	2025-11-11 18:58:33.874974
9ee5c114-73e7-4654-8b87-6cc9ba83673a	METAGAL INDUSTRIA E COMERCIO LTDA	9010026	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010026	2025-11-11 18:58:33.902	2025-11-11 18:58:33.934611	2025-11-11 18:58:33.934611
2db8cb00-0b94-456c-b1ed-711e2fae9151	FORD MOTOR COMPANY BRASIL LTDA	9010027	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010027	2025-11-11 18:58:33.962	2025-11-11 18:58:33.994429	2025-11-11 18:58:33.994429
580c1ba1-7502-41b9-92bc-cefd79f60532	CONTINENTAL DO BRASIL PRODUTOS AUTOMOTIV	9010028	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010028	2025-11-11 18:58:34.022	2025-11-11 18:58:34.053254	2025-11-11 18:58:34.053254
a8e1766c-1933-4f4c-8450-a65c14d238b5	HARMANN DA AMAZONIA INDUSTRIA ELETRONICA	9010029	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010029	2025-11-11 18:58:34.08	2025-11-11 18:58:34.112794	2025-11-11 18:58:34.112794
24ff501f-a325-416f-ac16-3d092397f185	SODECIA DA BAHIA LTDA	9010030	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010030	2025-11-11 18:58:34.14	2025-11-11 18:58:34.172394	2025-11-11 18:58:34.172394
6c058900-b14b-4008-8745-07fc07640500	AUTO FORJAS LTDA	9010031	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010031	2025-11-11 18:58:34.199	2025-11-11 18:58:34.232031	2025-11-11 18:58:34.232031
417f3eae-ade9-45ba-9576-e8a038bc72f2	ROBERT BOSCH LIMITADA	9010032	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010032	2025-11-11 18:58:34.259	2025-11-11 18:58:34.291555	2025-11-11 18:58:34.291555
21740f0d-1535-48cc-8dd9-a24136b066df	THYSSENKRUPP BRASIL LTDA	9010033	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010033	2025-11-11 18:58:34.319	2025-11-11 18:58:34.351067	2025-11-11 18:58:34.351067
c25954c5-a3c4-4601-8f58-59c28ea33367	FORD MOTOR COMPANY BRASIL LTDA	9010034	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010034	2025-11-11 18:58:34.378	2025-11-11 18:58:34.410472	2025-11-11 18:58:34.410472
78806940-130c-4c1b-bd43-816ef9547933	VOLKSWAGEN DO BRASIL INDUSTRIA DE VEICUL	9010035	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010035	2025-11-11 18:58:34.441	2025-11-11 18:58:34.47331	2025-11-11 18:58:34.47331
1350cb4d-9c6f-4377-bb24-22d216fec605	CONTINENTAL AUTOMOTIVE DO BRASIL LTDA	9010036	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010036	2025-11-11 18:58:34.5	2025-11-11 18:58:34.532918	2025-11-11 18:58:34.532918
cccb1db5-98d3-4de1-bcd5-8b4669d131b2	OLSA BRASIL INDUSTRIA E COMERCIO LTDA	9010037	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010037	2025-11-11 18:58:34.56	2025-11-11 18:58:34.591309	2025-11-11 18:58:34.591309
2415cee9-e591-4480-988a-a031b92ab4da	JARDIM SISTEMAS AUTOMOTIVOS E INDUSTRIA	9010038	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010038	2025-11-11 18:58:34.619	2025-11-11 18:58:34.652099	2025-11-11 18:58:34.652099
0627f48d-19d1-4ac9-917e-3684944fb637	TENNECO AUTOMOTIVE BRASIL LTDA	9010039	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010039	2025-11-11 18:58:34.679	2025-11-11 18:58:34.711384	2025-11-11 18:58:34.711384
ccb6c7dd-0521-4597-9a8e-ee500eb3e0b9	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A	9010040	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010040	2025-11-11 18:58:34.739	2025-11-11 18:58:34.770774	2025-11-11 18:58:34.770774
277814b8-9788-4019-8977-8b056d15aff7	SAINT GOBAIN DO BRASIL PRODUTOS INDUSTRI	9010041	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010041	2025-11-11 18:58:34.798	2025-11-11 18:58:34.836335	2025-11-11 18:58:34.836335
afb3e3f2-289a-42c7-ab8e-ac1cd8d7c60f	BROSE DO BRASIL LTDA	9010042	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010042	2025-11-11 18:58:34.864	2025-11-11 18:58:34.896123	2025-11-11 18:58:34.896123
00632b4b-cdc5-481b-86bd-8e150d604dcd	INDEBRAS INDUSTRIA ELETROMECANICA BRASIL	9010043	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010043	2025-11-11 18:58:34.923	2025-11-11 18:58:34.955783	2025-11-11 18:58:34.955783
f39acb94-dfbc-4c6f-8405-862e0a7f51d5	BENTELER SISTEMAS AUTOMOTIVOS LTDA	9010044	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010044	2025-11-11 18:58:34.983	2025-11-11 18:58:35.015643	2025-11-11 18:58:35.015643
da372048-dd6c-4cd2-b258-8e8f22b4e669	MAGNA DO BRASIL PRODUTOS E SERVICOS AUTO	9010045	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010045	2025-11-11 18:58:35.043	2025-11-11 18:58:35.074167	2025-11-11 18:58:35.074167
e39f1063-5f1e-4a00-b765-b206ac4c9a81	ULIANA INDUSTRIA METALURGICA LIMITADA	9010046	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010046	2025-11-11 18:58:35.101	2025-11-11 18:58:35.133591	2025-11-11 18:58:35.133591
a2e659d3-1582-4a67-a2eb-0fdb61fa17b4	VIBRACOUSTIC SOUTH AMERICA LTDA	9010047	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010047	2025-11-11 18:58:35.161	2025-11-11 18:58:35.193566	2025-11-11 18:58:35.193566
54f21e2c-7bb5-4fdb-81cc-3ba1f4840464	BREMBO DO BRASIL LTDA	9010048	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010048	2025-11-11 18:58:35.221	2025-11-11 18:58:35.25326	2025-11-11 18:58:35.25326
94eba86e-925c-4327-809b-79f8224ed724	SONAVOX INDUSTRIA E COMERCIO DE ALTOS FA	9010049	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010049	2025-11-11 18:58:35.28	2025-11-11 18:58:35.312565	2025-11-11 18:58:35.312565
f49e1c91-e60e-4d9f-9d94-1a90ff1c96d3	METAGAL INDUSTRIA E COMERCIO LTDA	9010050	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010050	2025-11-11 18:58:35.34	2025-11-11 18:58:35.371974	2025-11-11 18:58:35.371974
ee806abb-5419-4836-8173-b915c134cdf6	INDUSTRIA MECANICA BRASILEIRA DE ESTAMPO	9010051	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010051	2025-11-11 18:58:35.399	2025-11-11 18:58:35.431538	2025-11-11 18:58:35.431538
90664aa8-9ecc-4da1-a465-196c91651258	ITW DELFAST DO BRASIL LTDA	9010052	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010052	2025-11-11 18:58:35.459	2025-11-11 18:58:35.49122	2025-11-11 18:58:35.49122
b24ef53d-539c-41af-bfa9-3362c7397e33	MAPRA MANGUEIRAS E ARTEFATOS DE BORRACHA	9010053	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010053	2025-11-11 18:58:35.52	2025-11-11 18:58:35.552027	2025-11-11 18:58:35.552027
b24e7802-3027-412e-b2e0-c2869aa73e34	FEDERAL-MOGUL COMPONENTES DE MOTORES LTD	9010054	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010054	2025-11-11 18:58:35.579	2025-11-11 18:58:35.611409	2025-11-11 18:58:35.611409
2cabe808-eadd-482a-8739-3407bc27f241	COPAM COMPONENTES DE PAPELAO E MADEIRA L	9010055	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010055	2025-11-11 18:58:35.638	2025-11-11 18:58:35.670577	2025-11-11 18:58:35.670577
e1e7201e-30dc-43ea-b72c-676b5112f964	FIBAM COMPANHIA INDUSTRIAL	9010056	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010056	2025-11-11 18:58:35.699	2025-11-11 18:58:35.731829	2025-11-11 18:58:35.731829
34f28142-e155-4241-9754-233ced4aec17	ABC GROUP DO BRASIL LTDA	9010057	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010057	2025-11-11 18:58:35.759	2025-11-11 18:58:35.791203	2025-11-11 18:58:35.791203
c910cbb7-6371-43f2-a135-6b6466168a2e	POLISTAMPO INDUSTRIA METALURGICA LTDA	9010058	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010058	2025-11-11 18:58:35.818	2025-11-11 18:58:35.850522	2025-11-11 18:58:35.850522
753373b5-b567-458d-a599-ef0e9a210146	MUBEA DO BRASIL LTDA	9010059	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010059	2025-11-11 18:58:35.878	2025-11-11 18:58:35.91011	2025-11-11 18:58:35.91011
5c1fc203-c2a3-4098-ae18-5d7ddae7d99d	LABORTEX IND E COM DE PRODUTOS DE BORRAC	9010060	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010060	2025-11-11 18:58:35.937	2025-11-11 18:58:35.969546	2025-11-11 18:58:35.969546
f0d734b5-1c4f-42c9-a0c2-6cdbc5bf5fbd	JTEKT AUTOMOTIVA BRASIL LTDA	9010061	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010061	2025-11-11 18:58:35.997	2025-11-11 18:58:36.029319	2025-11-11 18:58:36.029319
280db7fc-19dc-4a00-8b67-1c1bc3c21786	SOGEFI SUSPENSION BRASIL LTDA	9010062	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010062	2025-11-11 18:58:36.057	2025-11-11 18:58:36.088224	2025-11-11 18:58:36.088224
1b466a8a-2d3e-46f3-974a-65be6de4899c	BOLLHOFF SERVICE CENTER LTDA	9010063	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010063	2025-11-11 18:58:36.116	2025-11-11 18:58:36.147904	2025-11-11 18:58:36.147904
932cb3b6-ab20-45bd-a7be-9e1d52930e95	ZANINI DO BRASIL LTDA	9010064	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010064	2025-11-11 18:58:36.175	2025-11-11 18:58:36.207549	2025-11-11 18:58:36.207549
e48e4539-8696-4dc2-be7f-1d6bb92d2107	AETHRA SISTEMAS AUTOMOTIVOS S.A	9010065	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010065	2025-11-11 18:58:36.235	2025-11-11 18:58:36.26684	2025-11-11 18:58:36.26684
449ccff2-05db-4629-9226-f8bfc30c9b86	OMRON COMPONENTES AUTOMOTIVOS LTDA	9010066	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010066	2025-11-11 18:58:36.294	2025-11-11 18:58:36.326352	2025-11-11 18:58:36.326352
14e358ee-3a68-4eed-aa97-fba0ecacf66e	METALURGICA NAKAYONE LTDA	9010067	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010067	2025-11-11 18:58:36.353	2025-11-11 18:58:36.385531	2025-11-11 18:58:36.385531
03400c19-3939-4b3c-9b42-215e4283fb5c	CASCO DO BRASIL LTDA	9010068	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010068	2025-11-11 18:58:36.413	2025-11-11 18:58:36.445149	2025-11-11 18:58:36.445149
22490bbb-1fc9-404c-98a0-77839996edec	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010069	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010069	2025-11-11 18:58:36.472	2025-11-11 18:58:36.504555	2025-11-11 18:58:36.504555
f955082c-253a-4358-a70a-c945f749f6f8	DYNA INDUSTRIA E COMERCIO LTDA.	9010070	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010070	2025-11-11 18:58:36.532	2025-11-11 18:58:36.563372	2025-11-11 18:58:36.563372
39882301-bdc3-49d9-ac4c-f9cda0cbbd50	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010071	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010071	2025-11-11 18:58:36.59	2025-11-11 18:58:36.622807	2025-11-11 18:58:36.622807
706ec19d-479b-46c8-a493-48cd281e01ea	A. RAYMOND BRASIL LTDA	9010072	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010072	2025-11-11 18:58:36.65	2025-11-11 18:58:36.681988	2025-11-11 18:58:36.681988
dcc13cad-b482-416a-b88b-cb15ed0a5c35	SCHAEFFLER BRASIL LTDA.	9010073	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010073	2025-11-11 18:58:36.709	2025-11-11 18:58:36.741607	2025-11-11 18:58:36.741607
03c9da1e-d0a9-4a22-8e65-258329591ede	YAZAKI DO BRASIL LTDA	9010074	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010074	2025-11-11 18:58:36.769	2025-11-11 18:58:36.801041	2025-11-11 18:58:36.801041
4ad0ba4b-e517-4ffd-b5b4-639bf20f0825	ROBERT BOSCH LIMITADA	9010075	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010075	2025-11-11 18:58:36.828	2025-11-11 18:58:36.860895	2025-11-11 18:58:36.860895
8cbfabf3-725d-477d-8f32-48ac850ce193	INTERTRIM LTDA	9010076	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010076	2025-11-11 18:58:36.889	2025-11-11 18:58:36.921142	2025-11-11 18:58:36.921142
76facd11-8c48-437b-ba0d-7fda1a5acd3c	SOGEFI FILTRATION DO BRASIL LTDA	9010077	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010077	2025-11-11 18:58:36.948	2025-11-11 18:58:36.980857	2025-11-11 18:58:36.980857
153277de-885c-4d82-9c13-46c53dbb2281	THYSSENKRUPP BRASIL LTDA.	9010078	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010078	2025-11-11 18:58:37.008	2025-11-11 18:58:37.040227	2025-11-11 18:58:37.040227
de2f5b76-0c53-4506-aed4-fc0b4c9e4d60	TP INDUSTRIAL DE PNEUS BRASIL LTDA.	9010079	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010079	2025-11-11 18:58:37.068	2025-11-11 18:58:37.101032	2025-11-11 18:58:37.101032
5c337ed4-c294-417d-95ea-0130d7ad370c	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010080	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010080	2025-11-11 18:58:37.128	2025-11-11 18:58:37.1605	2025-11-11 18:58:37.1605
13ce489d-34e2-4c99-aa6d-3a5f82557b96	GKN SINTER METALS LTDA.	9010081	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010081	2025-11-11 18:58:37.188	2025-11-11 18:58:37.219896	2025-11-11 18:58:37.219896
45729a0a-eab3-4cdc-abfa-e9e48a0987cf	GALUTTI AUTOMOTIVE INDUSTRIA METALURGICA	9010082	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010082	2025-11-11 18:58:37.247	2025-11-11 18:58:37.279412	2025-11-11 18:58:37.279412
a908059c-82d8-4066-ab63-34ac6515c18e	GKN DO BRASIL LTDA	9010083	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010083	2025-11-11 18:58:37.306	2025-11-11 18:58:37.338962	2025-11-11 18:58:37.338962
40047cc2-75e7-4c66-8dac-6022fafb0f7c	DIEHL DO BRASIL METALURGICA LTDA	9010084	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010084	2025-11-11 18:58:37.366	2025-11-11 18:58:37.398496	2025-11-11 18:58:37.398496
89ffa6c8-1442-419e-a5f5-adb4061f1015	MAHLE METAL LEVE S.A.	9010085	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010085	2025-11-11 18:58:37.426	2025-11-11 18:58:37.457764	2025-11-11 18:58:37.457764
cb73c700-3f95-478a-8d9b-d5dbef5a644d	U-SHIN DO BRASIL SISTEMAS AUTOMOTIVOS LT	9010086	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010086	2025-11-11 18:58:37.485	2025-11-11 18:58:37.517547	2025-11-11 18:58:37.517547
fe1be975-e433-4340-84f9-2d7da0b65c61	VOSS AUTOMOTIVE LTDA	9010087	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010087	2025-11-11 18:58:37.545	2025-11-11 18:58:37.576834	2025-11-11 18:58:37.576834
12fcdf03-c54d-49f7-a5c3-517a00c78b15	AUTOCAM DO BRASIL USINAGEM LTDA.	9010088	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010088	2025-11-11 18:58:37.604	2025-11-11 18:58:37.635332	2025-11-11 18:58:37.635332
e0821b40-b3e2-4741-b4ba-e27eebff4af6	GERDAU S.A.	9010089	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010089	2025-11-11 18:58:37.662	2025-11-11 18:58:37.694792	2025-11-11 18:58:37.694792
0bc08416-6b74-436d-b323-b6e344e65ad0	WHB FUNDICAO S/A	9010090	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010090	2025-11-11 18:58:37.722	2025-11-11 18:58:37.753914	2025-11-11 18:58:37.753914
9e01643d-8d06-4d5a-a606-0421127e0b2f	TRICO LATINOAMERICANA DO BRASIL LTDA.	9010091	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010091	2025-11-11 18:58:37.781	2025-11-11 18:58:37.813444	2025-11-11 18:58:37.813444
f4d081ed-692e-4e44-b41c-461600ef8313	INDUSTRIA MECANICA BRASPAR LTDA	9010092	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010092	2025-11-11 18:58:37.841	2025-11-11 18:58:37.872979	2025-11-11 18:58:37.872979
b0172f69-9bdc-45bf-874b-ad16bc7aa53e	3M DO BRASIL LTDA	9010093	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010093	2025-11-11 18:58:37.9	2025-11-11 18:58:37.932092	2025-11-11 18:58:37.932092
d2a1c40e-4cb8-43f3-8b7b-25cb89bc825d	ALUJET INDUSTRIAL E COMERCIAL LTDA.	9010094	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010094	2025-11-11 18:58:37.96	2025-11-11 18:58:37.992147	2025-11-11 18:58:37.992147
4df33da6-4140-4cbe-b686-89ee7f7c7796	CLARION DO BRASIL LTDA	9010095	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010095	2025-11-11 18:58:38.019	2025-11-11 18:58:38.051615	2025-11-11 18:58:38.051615
7281f939-67ea-43a1-bdea-6e5410eb9c35	FORD MOTOR COMPANY BRASIL LTDA	9010096	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010096	2025-11-11 18:58:38.079	2025-11-11 18:58:38.111358	2025-11-11 18:58:38.111358
614e5bb0-41d0-4769-b813-5f9d464fd32e	AB SISTEMA DE FREIOS LTDA	9010097	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010097	2025-11-11 18:58:38.138	2025-11-11 18:58:38.171142	2025-11-11 18:58:38.171142
45fb6e47-b75a-4424-9fc3-289103391357	BOSCH REXROTH LTDA	9010098	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010098	2025-11-11 18:58:38.198	2025-11-11 18:58:38.230655	2025-11-11 18:58:38.230655
658f5141-39bf-4707-9cf6-1637db65037d	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010099	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010099	2025-11-11 18:58:38.258	2025-11-11 18:58:38.289941	2025-11-11 18:58:38.289941
82154259-9296-43b4-83e3-becb51eb3b8f	MICROPARTS PECAS INJETADAS LTDA	9010100	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010100	2025-11-11 18:58:38.317	2025-11-11 18:58:38.349444	2025-11-11 18:58:38.349444
a08ca615-aa6a-4dcf-8ddf-b9e5806c1a67	ADVAL TECH DO BRASIL INDUS ADE AUTO LTDA	9010101	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010101	2025-11-11 18:58:38.376	2025-11-11 18:58:38.408885	2025-11-11 18:58:38.408885
f67585b2-da47-4db0-920e-b43f7230d4da	TUPY S/A	9010102	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010102	2025-11-11 18:58:38.436	2025-11-11 18:58:38.468226	2025-11-11 18:58:38.468226
f5aa289f-3759-45c6-bc95-298f6c9a3287	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010103	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010103	2025-11-11 18:58:38.496	2025-11-11 18:58:38.528905	2025-11-11 18:58:38.528905
ec32b9ad-deff-4c48-b367-8c9eb6251576	SHW DO BRASIL LTDA	9010104	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010104	2025-11-11 18:58:38.556	2025-11-11 18:58:38.588886	2025-11-11 18:58:38.588886
daa9e01c-07ce-44ae-a027-182649487fcd	FORMTAP INDUSTRIA E COMERCIO S/A	9010105	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010105	2025-11-11 18:58:38.616	2025-11-11 18:58:38.64842	2025-11-11 18:58:38.64842
4d3dd3a8-7f95-4ea8-8ca6-7f212192ee21	FORD MOTOR COMPANY BRASIL LTDA	9010106	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010106	2025-11-11 18:58:38.675	2025-11-11 18:58:38.707829	2025-11-11 18:58:38.707829
a9fdf0a4-cb58-4033-a67a-e3dac8cb1462	FICOSA DO BRASIL LTDA	9010107	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010107	2025-11-11 18:58:38.735	2025-11-11 18:58:38.767492	2025-11-11 18:58:38.767492
646ef956-37f3-4f9f-875e-14291a624f42	HUF DO BRASIL LTDA	9010108	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010108	2025-11-11 18:58:38.795	2025-11-11 18:58:38.826842	2025-11-11 18:58:38.826842
e5e91ed6-1275-4eac-970f-c29efbf86c7b	ASBRASIL S/A - EM RECUPERACAO JUDICIAL	9010109	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010109	2025-11-11 18:58:38.854	2025-11-11 18:58:38.887192	2025-11-11 18:58:38.887192
f6e841de-1c3d-4a72-af00-aebf89ffb0c9	ASPRO PLASTIC INDUSTRIA E COMERCIO DE AR	9010110	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010110	2025-11-11 18:58:38.914	2025-11-11 18:58:38.946511	2025-11-11 18:58:38.946511
3d37458d-5522-4c89-8cc1-902529345d4f	MAGNA DO BRASIL PRODUTOS E SERVICOS AUTO	9010111	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010111	2025-11-11 18:58:38.974	2025-11-11 18:58:39.005872	2025-11-11 18:58:39.005872
306b60f3-0ba9-40a0-a9bf-37c53de5b105	WEBER HIDRÃ ULICA DO BRASIL LTDA.	9010112	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010112	2025-11-11 18:58:39.033	2025-11-11 18:58:39.065738	2025-11-11 18:58:39.065738
51e7b12e-50b4-467e-aa26-b1d62ee732dc	CONTINENTAL PARAFUSOS S/A	9010113	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010113	2025-11-11 18:58:39.093	2025-11-11 18:58:39.125151	2025-11-11 18:58:39.125151
45ee9eec-875a-4448-bcff-f3909db0e87c	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010114	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010114	2025-11-11 18:58:39.153	2025-11-11 18:58:39.18507	2025-11-11 18:58:39.18507
9d228b25-949f-4882-a547-16757fbcc718	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010115	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010115	2025-11-11 18:58:39.213	2025-11-11 18:58:39.244594	2025-11-11 18:58:39.244594
e8240599-c276-4bc6-945e-81ad0cb8b1c4	MAAC INDUSTRIA E COMERCIO DE PECAS EIREL	9010116	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010116	2025-11-11 18:58:39.272	2025-11-11 18:58:39.304504	2025-11-11 18:58:39.304504
26c12adf-9e58-4b1b-9b43-42015dece82b	TEKNIA BRASIL LTDA.	9010117	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010117	2025-11-11 18:58:39.332	2025-11-11 18:58:39.363902	2025-11-11 18:58:39.363902
15f2ec7b-bd81-452f-adab-bbcf18eeb466	BASF SA	9010119	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010119	2025-11-11 18:58:39.391	2025-11-11 18:58:39.423565	2025-11-11 18:58:39.423565
b21600a1-d3ef-4607-9f40-d7d7e6096e42	INDUSTRIAS MANGOTEX LTDA	9010120	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010120	2025-11-11 18:58:39.451	2025-11-11 18:58:39.483171	2025-11-11 18:58:39.483171
8e1bade1-3658-4e24-84ff-a1ac838a5ab3	METALURGICA FORMIGARI LTDA	9010121	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010121	2025-11-11 18:58:39.51	2025-11-11 18:58:39.542492	2025-11-11 18:58:39.542492
62aa2732-a2cc-4a81-bb60-39bcb25f8e62	CONTINENTAL DO BRASIL PRODUTOS AUTOMOTIV	9010122	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010122	2025-11-11 18:58:39.57	2025-11-11 18:58:39.602172	2025-11-11 18:58:39.602172
7516a4e4-e196-419a-9b9e-3cd61bbda5b4	MICHEL THIERRY DO BRASIL INDUSTRIA TEXTI	9010123	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010123	2025-11-11 18:58:39.629	2025-11-11 18:58:39.661513	2025-11-11 18:58:39.661513
418e23fd-ae06-4c2c-94e0-37353b18c870	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010124	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010124	2025-11-11 18:58:39.689	2025-11-11 18:58:39.720908	2025-11-11 18:58:39.720908
c61ed5f0-5662-4b82-80ab-12550e3df41d	CONFAB INDUSTRIAL SOCIEDADE ANONIMA	9010125	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010125	2025-11-11 18:58:39.748	2025-11-11 18:58:39.780831	2025-11-11 18:58:39.780831
602b0681-34b9-4224-869a-68af3e523db0	VIBRAC SYSTEM S/A	9010126	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010126	2025-11-11 18:58:39.808	2025-11-11 18:58:39.840464	2025-11-11 18:58:39.840464
cea0d734-75c3-4750-8ad2-905be3c7e473	ARVEDI METALFER DO BRASIL S.A	9010127	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010127	2025-11-11 18:58:39.868	2025-11-11 18:58:39.900156	2025-11-11 18:58:39.900156
5a6636dd-80e0-41a0-b18e-c47a1806dde9	AUTOMETAL SBC INJ E PINT PLASTICOS LTDA	9010128	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010128	2025-11-11 18:58:39.928	2025-11-11 18:58:39.960196	2025-11-11 18:58:39.960196
82ff4f7a-4454-4992-81d9-30a523acd0de	TEKNIA BRASIL LTDA	9010129	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010129	2025-11-11 18:58:39.987	2025-11-11 18:58:40.019686	2025-11-11 18:58:40.019686
bc6d0922-21f4-4974-a361-b004f6cb8c37	MANGELS INDUSTRIAL S.A	9010130	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010130	2025-11-11 18:58:40.047	2025-11-11 18:58:40.078319	2025-11-11 18:58:40.078319
43f8e65b-ecd0-4063-b0d0-3b4ea37e940a	BENTELER COMPONENTES AUTOMOTIVOS LTDA	9010131	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010131	2025-11-11 18:58:40.106	2025-11-11 18:58:40.13807	2025-11-11 18:58:40.13807
096970df-a478-4e93-99a1-c1a149e0f39a	SAINT-GOBAIN DO BRASIL PRODUTOS INDUSTRI	9010132	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010132	2025-11-11 18:58:40.165	2025-11-11 18:58:40.197769	2025-11-11 18:58:40.197769
5d1b7340-2615-4e12-b74f-b24c8ca8ee59	COBIAN REPRESENTACAO TECNICA E COMERCIAL	9010133	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010133	2025-11-11 18:58:40.225	2025-11-11 18:58:40.257716	2025-11-11 18:58:40.257716
5787b443-8945-4091-8dc3-0ee39165a42d	AUTOCOM COMPONENTES AUTOMOTIVOS DO BRASI	9010134	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010134	2025-11-11 18:58:40.285	2025-11-11 18:58:40.317508	2025-11-11 18:58:40.317508
8f146ddd-8417-41b6-8ed3-8e34297174b0	MANN HUMMEL BRASIL LTDA.	9010135	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010135	2025-11-11 18:58:40.345	2025-11-11 18:58:40.376448	2025-11-11 18:58:40.376448
b5077d1f-1546-492b-b631-8496525ed42a	RUDOLPH USINADOS S/A	9010136	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010136	2025-11-11 18:58:40.404	2025-11-11 18:58:40.435901	2025-11-11 18:58:40.435901
cbd911fd-6c9b-4a97-b8af-3a433ad3aae9	KOSTAL ELETROMECANICA LTDA	9010137	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010137	2025-11-11 18:58:40.463	2025-11-11 18:58:40.495592	2025-11-11 18:58:40.495592
97018f4b-b215-4262-b878-ed89f94f8c0f	REFAL INDUSTRIA E COMERCIO DE REBITES E	9010138	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010138	2025-11-11 18:58:40.523	2025-11-11 18:58:40.554932	2025-11-11 18:58:40.554932
53533a56-70b4-45c9-a48b-8e66470f56b9	PELZER DA BAHIA LTDA	9010139	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010139	2025-11-11 18:58:40.582	2025-11-11 18:58:40.614536	2025-11-11 18:58:40.614536
72af9bd5-046a-4b82-a50a-2758bc083ace	BORGWARNER BRASIL LTDA	9010140	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010140	2025-11-11 18:58:40.642	2025-11-11 18:58:40.673971	2025-11-11 18:58:40.673971
b7d09d9a-99ef-4856-a3ab-499daa9371ad	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010141	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010141	2025-11-11 18:58:40.701	2025-11-11 18:58:40.73219	2025-11-11 18:58:40.73219
59c12687-ea53-4402-ab7c-54dd1d0d79a2	BENTELER COMPONENTES AUTOMOTIVOS LTDA	9010142	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010142	2025-11-11 18:58:40.76	2025-11-11 18:58:40.792655	2025-11-11 18:58:40.792655
8cea16ed-ad57-4e13-8dc0-f8d98088270f	MAQUINAS AGRICOLAS JACTO S A	9010143	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010143	2025-11-11 18:58:40.82	2025-11-11 18:58:40.852185	2025-11-11 18:58:40.852185
6f7fcf76-68f9-46d2-94d1-2f234eb81a65	MAHLE BEHR GERENCIAMENTO TERMICO BRASIL	9010144	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010144	2025-11-11 18:58:40.879	2025-11-11 18:58:40.911575	2025-11-11 18:58:40.911575
3267074e-7f51-4c93-a22b-edd04be7170d	DAYCO POWER TRANSMISSION LTDA	9010145	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010145	2025-11-11 18:58:40.939	2025-11-11 18:58:40.971615	2025-11-11 18:58:40.971615
ff0c5176-cb10-47d3-9a26-6b8c6e4f2bb8	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010146	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010146	2025-11-11 18:58:40.999	2025-11-11 18:58:41.036464	2025-11-11 18:58:41.036464
c71ca5a5-f916-48be-b430-6d99f9c15c47	IOCHPE MAXION SA	9010147	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010147	2025-11-11 18:58:41.064	2025-11-11 18:58:41.096356	2025-11-11 18:58:41.096356
5014440f-eff4-4595-bb0d-ec8ebc284f41	NORGREN LTDA	9010148	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010148	2025-11-11 18:58:41.124	2025-11-11 18:58:41.156169	2025-11-11 18:58:41.156169
a3131cf1-a328-4e5d-b9e0-be5315ca6235	MANN HUMMEL BRASIL LTDA.	9010149	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010149	2025-11-11 18:58:41.183	2025-11-11 18:58:41.215679	2025-11-11 18:58:41.215679
ba9f3a60-4096-4d9b-a4b9-4f69ff35ffce	KSPG AUTOMOTIVE BRAZIL LTDA.	9010150	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010150	2025-11-11 18:58:41.243	2025-11-11 18:58:41.274281	2025-11-11 18:58:41.274281
bab37f93-a05e-4ac3-9818-c1e45ffda460	MAGNETI MARELLI COFAP FABRICADORA DE PEC	9010151	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010151	2025-11-11 18:58:41.301	2025-11-11 18:58:41.333763	2025-11-11 18:58:41.333763
42e1cdfd-c03b-4fac-b354-4b69ea3d2b77	STAMPTEC INDUSTRIA E COMERCIO DE PECAS E	9010152	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010152	2025-11-11 18:58:41.361	2025-11-11 18:58:41.392261	2025-11-11 18:58:41.392261
79b65686-0d56-4e32-a0b7-90ee9a4cd066	L L PRODUCTS DO BRASIL SERVICOS E COMERC	9010153	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010153	2025-11-11 18:58:41.419	2025-11-11 18:58:41.451797	2025-11-11 18:58:41.451797
66af1264-4f25-4906-8eca-b5d22b50d172	BOGE RUBBER e  PLASTICS BRASIL S.A.	9010154	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010154	2025-11-11 18:58:41.479	2025-11-11 18:58:41.511374	2025-11-11 18:58:41.511374
b600c576-cea3-4001-95b3-159df36566ed	CERAMICA E VELAS DE IGNICAO NGK DO BRASI	9010155	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010155	2025-11-11 18:58:41.539	2025-11-11 18:58:41.570979	2025-11-11 18:58:41.570979
97b7f76d-482d-40f0-9a3a-374635997259	ELISMOL INDUSTRIA METALURGICA LTDA	9010156	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010156	2025-11-11 18:58:41.598	2025-11-11 18:58:41.630931	2025-11-11 18:58:41.630931
06d3fe96-2ee0-4a72-b60f-9235e966cd68	AETHRA SISTEMAS AUTOMOTIVOS S.A.	9010157	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010157	2025-11-11 18:58:41.658	2025-11-11 18:58:41.690966	2025-11-11 18:58:41.690966
0e4ff7e6-3256-40b5-920d-1cf4c77c62ae	NEUMAYER TEKFOR AUTOMOTIVE BRASIL LTDA.	9010158	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010158	2025-11-11 18:58:41.718	2025-11-11 18:58:41.750714	2025-11-11 18:58:41.750714
7f788e28-df9b-42c1-a3fd-1e9df38af073	HANON SYSTEMS CLIMATIZACAO DO BRASIL IND	9010159	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010159	2025-11-11 18:58:41.778	2025-11-11 18:58:41.810249	2025-11-11 18:58:41.810249
f8661a9b-3ae9-4afb-8901-a1b1937e4848	QUALYTEC QUALIDADE TECNICA LTDA EPP	9010160	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010160	2025-11-11 18:58:41.837	2025-11-11 18:58:41.870193	2025-11-11 18:58:41.870193
2b2a2dee-e76d-46f1-911a-5841a03ccfa9	EDSCHA DO BRASIL LTDA	9010161	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010161	2025-11-11 18:58:41.897	2025-11-11 18:58:41.929605	2025-11-11 18:58:41.929605
94a75850-d819-4dc2-b515-48708b0c5065	TTB INDUSTRIA COM DE PRO METALICOS LTDA	9010162	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010162	2025-11-11 18:58:41.957	2025-11-11 18:58:41.988922	2025-11-11 18:58:41.988922
8afde178-36c9-4829-9dde-d3d46dc27755	DELGA INDUSTRIA E COMERCIO S A	9010163	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010163	2025-11-11 18:58:42.017	2025-11-11 18:58:42.049285	2025-11-11 18:58:42.049285
30ac24c7-313d-4f1b-93c2-c0fe8f7604fd	METALURGICA RIGITEC LTDA	9010164	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010164	2025-11-11 18:58:42.076	2025-11-11 18:58:42.108713	2025-11-11 18:58:42.108713
d44ce1d3-23f3-43c2-b163-e4a082dc31c7	INDUSTRIA DE ART DE BORRACHA WOLF LTDA	9010165	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010165	2025-11-11 18:58:42.136	2025-11-11 18:58:42.167988	2025-11-11 18:58:42.167988
19c2924f-9f50-4a85-86cc-bd19332644d1	RASSINI NHK AUTOPECAS LTDA	9010166	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010166	2025-11-11 18:58:42.195	2025-11-11 18:58:42.228262	2025-11-11 18:58:42.228262
951fc14d-264a-4128-83f3-a8b0230f9732	SNR ROLAMENTOS DO BRASIL LTDA	9010167	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010167	2025-11-11 18:58:42.256	2025-11-11 18:58:42.288687	2025-11-11 18:58:42.288687
b7740d57-8382-4359-8eca-8e233fac7852	KAUTEX TEXTRON DO BRASIL LTDA	9010168	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010168	2025-11-11 18:58:42.316	2025-11-11 18:58:42.348287	2025-11-11 18:58:42.348287
c7317fb4-03ca-4da0-9554-e12aebec78a3	WHB FUNDICAO S A	9010169	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010169	2025-11-11 18:58:42.375	2025-11-11 18:58:42.408925	2025-11-11 18:58:42.408925
a25d5bd5-947b-44b0-bb34-1be1e96dcd34	DURA AUTOMOTIVE SYSTEMS DO BRASIL LTDA	9010170	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010170	2025-11-11 18:58:42.436	2025-11-11 18:58:42.468527	2025-11-11 18:58:42.468527
d1a5f726-d01b-435d-886f-4d9aba04f841	ELRING KLINGER DO BRASIL LTDA	9010171	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010171	2025-11-11 18:58:42.496	2025-11-11 18:58:42.527811	2025-11-11 18:58:42.527811
7ea0f097-34d6-4d7c-b77b-03fc90f2402d	PIRELLI PNEUS LTDA.	9010172	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010172	2025-11-11 18:58:42.555	2025-11-11 18:58:42.587674	2025-11-11 18:58:42.587674
0678e1fb-7698-41f2-aadd-3710cca5f0c6	METALURGICA HASSMANN SA	9010173	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010173	2025-11-11 18:58:42.646	2025-11-11 18:58:42.678636	2025-11-11 18:58:42.678636
16ecc791-0612-4d4c-a387-36a43968b26a	TYCO ELECTRONICS BRASIL LTDA	9010174	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010174	2025-11-11 18:58:42.706	2025-11-11 18:58:42.738064	2025-11-11 18:58:42.738064
1195d306-df59-4b8e-a01a-12ad37c2bcad	SABO INDUSTRIA E COMERCIO DE AUTOPECAS S	9010175	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010175	2025-11-11 18:58:42.765	2025-11-11 18:58:42.798181	2025-11-11 18:58:42.798181
bca0bb7f-59d5-4410-b1e4-cf3de31bf886	METALURGICA HAME LTDA	9010176	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010176	2025-11-11 18:58:42.825	2025-11-11 18:58:42.85774	2025-11-11 18:58:42.85774
eee757b6-69c6-4dd0-a66b-b38e53d6486a	CUMMINS BRASIL LIMITDA	9010177	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010177	2025-11-11 18:58:42.885	2025-11-11 18:58:42.918257	2025-11-11 18:58:42.918257
437c58b9-4397-40cc-9dd9-fb67c6a04216	METALKRAFT S A SISTEMAS AUTOMOTIVOS	9010178	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010178	2025-11-11 18:58:42.946	2025-11-11 18:58:42.978114	2025-11-11 18:58:42.978114
1aa6aea4-98c0-4529-9587-4a9633c420d7	TECHAL INDUST E COM CONJ TUBULARES LTDA	9010179	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010179	2025-11-11 18:58:43.005	2025-11-11 18:58:43.037614	2025-11-11 18:58:43.037614
1858b302-5776-40ae-92e8-539033603ab7	METALTORK INDUS E COMERAUTO PECAS LTDA	9010180	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010180	2025-11-11 18:58:43.065	2025-11-11 18:58:43.098609	2025-11-11 18:58:43.098609
e4d31cb4-4c5c-478c-acab-d8dc7aeefb1f	NOVA INJ SOB PRES COMER  PECAS IND LTDA	9010181	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010181	2025-11-11 18:58:43.126	2025-11-11 18:58:43.157854	2025-11-11 18:58:43.157854
3ea0c585-5fb3-45ef-a713-cd44a21783a9	PRODUFLEX IND DE BORRACHAS LTDA	9010182	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010182	2025-11-11 18:58:43.185	2025-11-11 18:58:43.217234	2025-11-11 18:58:43.217234
cec1093c-c345-4bce-a3c8-81b1ae9b9d64	COOPER-STANDARD AUTOMOTIVE BRASIL SEALIN	9010183	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010183	2025-11-11 18:58:43.245	2025-11-11 18:58:43.277476	2025-11-11 18:58:43.277476
e2d67a94-3134-42f1-985b-48f8ee05e152	FLEXNGATE BRASIL INDUSTRIAL LTDA	9010184	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010184	2025-11-11 18:58:43.306	2025-11-11 18:58:43.337916	2025-11-11 18:58:43.337916
9a5d2c69-f96a-403c-9037-ded9c98936cc	FORMTAP INDUSTRIA E COMERCIO S/A	9010185	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010185	2025-11-11 18:58:43.365	2025-11-11 18:58:43.397547	2025-11-11 18:58:43.397547
f11797b8-225c-46b2-8e1d-9554d0301c66	CUMMINS BRASIL LIMITADA	9010186	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010186	2025-11-11 18:58:43.425	2025-11-11 18:58:43.457668	2025-11-11 18:58:43.457668
8e624a52-c49b-4b33-934a-26f64b2cc6cc	JAT TRANSPORTES E LOGISTICA S.A	9010187	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010187	2025-11-11 18:58:43.485	2025-11-11 18:58:43.517067	2025-11-11 18:58:43.517067
6b98845d-a44b-47bb-82e5-4962810caac5	AUTOMETAL S/A	9010188	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010188	2025-11-11 18:58:43.544	2025-11-11 18:58:43.576523	2025-11-11 18:58:43.576523
3b635e36-fcd7-417f-8eec-6618d5d9f036	DYSTRAY INDUSTRIA E COMERCIO EIRELI - EP	9010189	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010189	2025-11-11 18:58:43.604	2025-11-11 18:58:43.63599	2025-11-11 18:58:43.63599
717b1d83-2b61-48e7-81d1-7014f3f23397	THOMAS KL INDUSTRIA DE ALTO FALANTES SA	9010190	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010190	2025-11-11 18:58:43.663	2025-11-11 18:58:43.69543	2025-11-11 18:58:43.69543
81e2a2bf-1363-4dc2-ba2b-32be7f80335a	METALURGICA MURCIA LTDA	9010191	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010191	2025-11-11 18:58:43.722	2025-11-11 18:58:43.754818	2025-11-11 18:58:43.754818
ae8052b3-22ef-4894-a4c4-c48af7b8f0cd	CLIPTECH INDUSTRIA E COMERCIO LTDA	9010192	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010192	2025-11-11 18:58:43.782	2025-11-11 18:58:43.816763	2025-11-11 18:58:43.816763
ea497143-eace-47c0-b40a-47201a262ab1	SUMIRIKO DO BRASIL INDUSTRIA DE BORRACHA	9010193	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010193	2025-11-11 18:58:43.844	2025-11-11 18:58:43.876509	2025-11-11 18:58:43.876509
a5e10a6e-3b57-4cbc-aa2c-bc8727374fd2	KYB-MANDO DO BRASIL FABRICANTE DE AUTOPE	9010194	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010194	2025-11-11 18:58:43.904	2025-11-11 18:58:43.936859	2025-11-11 18:58:43.936859
8be3fe3c-de2f-4a4d-b77b-ae4a998b1dc6	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010195	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010195	2025-11-11 18:58:43.964	2025-11-11 18:58:43.997319	2025-11-11 18:58:43.997319
1a12e9c9-03af-48aa-8377-7a4304476040	S RIKO AUTOMOTIVE HOSE TECALON BRASIL S.	9010196	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010196	2025-11-11 18:58:44.024	2025-11-11 18:58:44.056609	2025-11-11 18:58:44.056609
387979f2-6772-4550-ab66-addf940ed5da	ROCHLING AUTOMOTIVE DO BRASIL LTDA	9010197	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010197	2025-11-11 18:58:44.084	2025-11-11 18:58:44.116132	2025-11-11 18:58:44.116132
6f549a17-24c5-4b87-8ca6-3fb936525ecb	MAHLE METAL LEVE S.A.	9010198	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010198	2025-11-11 18:58:44.144	2025-11-11 18:58:44.177213	2025-11-11 18:58:44.177213
e604a754-cad6-491f-9343-8e9ce169849c	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010199	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010199	2025-11-11 18:58:44.205	2025-11-11 18:58:44.237263	2025-11-11 18:58:44.237263
e523318a-edbe-4c28-bf89-983d7894e0fb	NIDEC GPM DO BRASIL AUTOMOTIVA LTDA	9010200	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010200	2025-11-11 18:58:44.265	2025-11-11 18:58:44.296888	2025-11-11 18:58:44.296888
7f555785-c25b-408f-b7eb-e9d7731f9cb1	TRIMTEC LTDA	9010201	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010201	2025-11-11 18:58:44.324	2025-11-11 18:58:44.356603	2025-11-11 18:58:44.356603
a6aa2f98-90fa-4aa9-b4fc-17a2e6f6b46b	FAURECIA EMISSIONS CONTROL TECHNOLOGIES	9010202	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010202	2025-11-11 18:58:44.384	2025-11-11 18:58:44.416262	2025-11-11 18:58:44.416262
31209244-0252-45ff-b6fd-bd1499426210	INTEVA PRODUCTS SISTEMAS E COMPONENTES A	9010203	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010203	2025-11-11 18:58:44.444	2025-11-11 18:58:44.476647	2025-11-11 18:58:44.476647
eae51982-b4f4-4f6b-a973-c5a2f2c35f07	ROBERT BOSCH LIMITADA	9010204	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010204	2025-11-11 18:58:44.504	2025-11-11 18:58:44.536818	2025-11-11 18:58:44.536818
a939d6ef-6a64-4b76-9d47-9ca5a0c8451b	PLASTICOS MAUA LTDA	9010205	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010205	2025-11-11 18:58:44.564	2025-11-11 18:58:44.596323	2025-11-11 18:58:44.596323
127ef658-0219-4fe4-9430-7a75d7a3c072	INDUSTRIA METALURGICA FANANDRI LTDA	9010206	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010206	2025-11-11 18:58:44.623	2025-11-11 18:58:44.655876	2025-11-11 18:58:44.655876
099fb394-c600-463f-b863-fa15bf149897	NEMAK ALUMINIO DO BRASIL LTDA	9010207	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010207	2025-11-11 18:58:44.683	2025-11-11 18:58:44.715791	2025-11-11 18:58:44.715791
d237535e-9551-4f85-909b-d896d28156b4	CLICK AUTOMOTIVA INDUSTRIAL LTDA.	9010208	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010208	2025-11-11 18:58:44.743	2025-11-11 18:58:44.775166	2025-11-11 18:58:44.775166
dd28d2f0-d1d8-489c-b3af-7c41cab7b677	HIDROVER EQUIPAMENTOS HIDRAULICOS LTDA.	9010209	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010209	2025-11-11 18:58:44.802	2025-11-11 18:58:44.834529	2025-11-11 18:58:44.834529
4f29a1f0-4e6e-4aa8-8c2f-99a8a01bb67a	METALAC SPS INDUSTRIA E COMERCIO LTDA.	9010210	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010210	2025-11-11 18:58:44.862	2025-11-11 18:58:44.894192	2025-11-11 18:58:44.894192
c3b72b65-3bfd-45b2-b876-dcf484723b74	ELDORADO INDUSTRIAS PLASTICAS LTDA	9010211	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010211	2025-11-11 18:58:44.921	2025-11-11 18:58:44.953776	2025-11-11 18:58:44.953776
123997bf-1f29-432e-8a2a-a3e32c2b1605	INDUSTRIA METALURGICA FRUM LTDA	9010212	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010212	2025-11-11 18:58:44.986	2025-11-11 18:58:45.021875	2025-11-11 18:58:45.021875
18761459-018e-4ca0-83d9-de8bf23ef765	PEUGEOT-CITROEN DO BRASIL AUTOMOVEIS LTD	9010213	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010213	2025-11-11 18:58:45.049	2025-11-11 18:58:45.082053	2025-11-11 18:58:45.082053
6920d591-bfa3-4389-9581-0f95d6d0235c	FAURECIA EMISSIONS CONTROL TECHNOLOGIES	9010214	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010214	2025-11-11 18:58:45.11	2025-11-11 18:58:45.141839	2025-11-11 18:58:45.141839
e303fa1e-b8d9-4465-af25-083f227dd3b7	FREUDENBERG-NOK COMPONENTES BRASIL LTDA	9010215	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010215	2025-11-11 18:58:45.169	2025-11-11 18:58:45.201727	2025-11-11 18:58:45.201727
c2c6fb53-fa8e-4374-b8ec-38398f7f150a	CGE SOCIEDADE FABRICADORA DE PECAS PLAST	9010216	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010216	2025-11-11 18:58:45.23	2025-11-11 18:58:45.266053	2025-11-11 18:58:45.266053
d9358685-1956-4c43-8d2a-25f27ea2476b	ZANETTINI BAROSSI S A INDUSTRIA E COMERC	9010217	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010217	2025-11-11 18:58:45.294	2025-11-11 18:58:45.327043	2025-11-11 18:58:45.327043
745c8d94-578e-4eef-af10-42e5ee4dd462	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010218	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010218	2025-11-11 18:58:45.354	2025-11-11 18:58:45.387398	2025-11-11 18:58:45.387398
dc8bbe11-1f4c-4c67-8c00-69762228436b	GLOBAL STEERING SYSTEMS DO BRASIL INDUST	9010219	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010219	2025-11-11 18:58:45.415	2025-11-11 18:58:45.447147	2025-11-11 18:58:45.447147
966eb03a-c710-48bb-8b46-28d5e3cf8046	WAPMETAL INDUSTRIA E COMERCIO DE MOLAS E	9010220	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010220	2025-11-11 18:58:45.474	2025-11-11 18:58:45.506869	2025-11-11 18:58:45.506869
9dcf94a3-8ac6-404b-b09c-7a14f96b218a	MAHLE METAL LEVE S.A.	9010221	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010221	2025-11-11 18:58:45.534	2025-11-11 18:58:45.566618	2025-11-11 18:58:45.566618
838714cf-fe41-4003-b08b-5c222580da9f	ZF DO BRASIL LTDA.	9010222	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010222	2025-11-11 18:58:45.594	2025-11-11 18:58:45.626421	2025-11-11 18:58:45.626421
382f8979-5efe-4361-9983-1d0968c3239d	METALURGICA QUASAR LTDA. EM RECUPERACAO	9010223	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010223	2025-11-11 18:58:45.654	2025-11-11 18:58:45.686108	2025-11-11 18:58:45.686108
493ecd4d-67fe-4f80-a562-cad5fed0c9e4	NICHIBRAS INDUSTRIA E COMERCIO LTDA	9010224	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010224	2025-11-11 18:58:45.714	2025-11-11 18:58:45.746235	2025-11-11 18:58:45.746235
f758f1ea-6e57-4c2c-a190-ab217305b261	RESIL COMERCIAL INDUSTRIAL LTDA	9010225	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010225	2025-11-11 18:58:45.775	2025-11-11 18:58:45.80713	2025-11-11 18:58:45.80713
b78aeb60-69e9-41a4-8c68-cf5295aaddd3	SIKA AUTOMOTIVE LTDA.	9010226	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010226	2025-11-11 18:58:45.835	2025-11-11 18:58:45.868086	2025-11-11 18:58:45.868086
623ad5f1-656f-4fd8-aea8-4738bfa55474	INDUSTRIA METALURGICA MAXDEL LTDA	9010227	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010227	2025-11-11 18:58:45.895	2025-11-11 18:58:45.927763	2025-11-11 18:58:45.927763
df8da949-f624-4da6-891d-437f88d51734	KIDDE BRASIL LTDA.	9010228	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010228	2025-11-11 18:58:45.955	2025-11-11 18:58:45.986153	2025-11-11 18:58:45.986153
fca056c3-ad0c-447a-ae54-14e24b5bf29b	ITESAPAR FUNDICAO S.A.	9010229	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010229	2025-11-11 18:58:46.014	2025-11-11 18:58:46.046237	2025-11-11 18:58:46.046237
e1fb2c53-00dc-4c8d-80f9-57c109455ae8	DELGA INDUSTRIA E COMERCIO LTDA	9010230	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010230	2025-11-11 18:58:46.073	2025-11-11 18:58:46.105791	2025-11-11 18:58:46.105791
a8172c16-2ff1-47ea-96c8-2a16db8e6e02	FAURECIA AUTO DO BRASIL LTDA	9010231	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010231	2025-11-11 18:58:46.133	2025-11-11 18:58:46.165645	2025-11-11 18:58:46.165645
f058bab1-3afa-4ccb-89d4-aa233d846489	INDUSTRIA ARTEB S A	9010232	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010232	2025-11-11 18:58:46.193	2025-11-11 18:58:46.226063	2025-11-11 18:58:46.226063
c4f52486-5504-4941-8c40-ead644d8169e	DANA INDUSTRIAS LTDA	9010233	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010233	2025-11-11 18:58:46.254	2025-11-11 18:58:46.287526	2025-11-11 18:58:46.287526
f48d5b9e-c171-4b8e-8eea-ee4cdbd81185	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010234	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010234	2025-11-11 18:58:46.315	2025-11-11 18:58:46.347062	2025-11-11 18:58:46.347062
01a8b91f-0242-4080-ac08-3ad414fe9d0c	CLARION DO BRASIL LTDA	9010235	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010235	2025-11-11 18:58:46.374	2025-11-11 18:58:46.406757	2025-11-11 18:58:46.406757
0233227b-3623-4753-9918-aede8c76b093	CISER FIXADORES AUTOMOTIVOS SA	9010236	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010236	2025-11-11 18:58:46.434	2025-11-11 18:58:46.465289	2025-11-11 18:58:46.465289
2934f09a-2d6f-4400-a713-69e123dd23d5	MULTIPARTS INDUSTRIA E COMERCIO EIRELI	9010237	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010237	2025-11-11 18:58:46.492	2025-11-11 18:58:46.524638	2025-11-11 18:58:46.524638
fedda36a-0ada-43b3-b8f6-1f87acaaed48	SOGEFI FILTRATION DO BRASIL LTDA	9010238	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010238	2025-11-11 18:58:46.552	2025-11-11 18:58:46.583171	2025-11-11 18:58:46.583171
57f8c953-53ef-4316-ab82-bda2d1a1cb74	VOLSWAGEN DO BRASIL INDUSTRIA DE VEICULO	9010239	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010239	2025-11-11 18:58:46.611	2025-11-11 18:58:46.643002	2025-11-11 18:58:46.643002
ac3debdf-6394-4478-84a1-8e33c82f01e9	BRANDL DO BRASIL LTDA	9010240	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010240	2025-11-11 18:58:46.675	2025-11-11 18:58:46.707745	2025-11-11 18:58:46.707745
4c14e12e-252e-4690-b1bd-87aee7fba2f1	AUTOMETAL SA	9010241	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010241	2025-11-11 18:58:46.735	2025-11-11 18:58:46.767814	2025-11-11 18:58:46.767814
ae3c61db-f656-4d0f-b142-34a166c9b6ab	COOPER STANDARD AUTOMOTIVE BRASIL SEALIN	9010242	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010242	2025-11-11 18:58:46.795	2025-11-11 18:58:46.82622	2025-11-11 18:58:46.82622
f196cd60-9990-4680-9601-3a71f045dec2	JOYSON SAFETY SYSTEMS BRASIL LTDA	9010243	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010243	2025-11-11 18:58:46.854	2025-11-11 18:58:46.886841	2025-11-11 18:58:46.886841
e789484e-889e-4436-8c29-81d84beff768	WEGMANN AUTOMOTIVE BRASIL LTDA	9010244	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010244	2025-11-11 18:58:46.917	2025-11-11 18:58:46.948929	2025-11-11 18:58:46.948929
b361186c-e589-489b-835f-4b6467568188	KATHREIN AUTOMOTIVE DO BRASIL LTDA	9010245	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010245	2025-11-11 18:58:46.976	2025-11-11 18:58:47.008329	2025-11-11 18:58:47.008329
6393b063-908d-43d8-be5f-a21cc8fb5fc1	BINSIT COMPONENTES AUTOMOTIVOS LTDA	9010246	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010246	2025-11-11 18:58:47.036	2025-11-11 18:58:47.068084	2025-11-11 18:58:47.068084
d207f30c-1478-4f11-ae2e-d565eeecf5d7	YAZAKI DO BRASIL LTDA	9010247	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010247	2025-11-11 18:58:47.096	2025-11-11 18:58:47.128132	2025-11-11 18:58:47.128132
4be24863-ef69-404a-b641-9541e0735153	FUPRESA S A	9010248	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010248	2025-11-11 18:58:47.156	2025-11-11 18:58:47.188875	2025-11-11 18:58:47.188875
1100ab6a-9287-4caa-85ce-0787969d1f1f	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010249	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010249	2025-11-11 18:58:47.216	2025-11-11 18:58:47.248582	2025-11-11 18:58:47.248582
ef8773f7-1445-4ea2-88b0-36046a963fd0	WHB FUNDICAO S A	9010250	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010250	2025-11-11 18:58:47.276	2025-11-11 18:58:47.317099	2025-11-11 18:58:47.317099
f52e8bd1-2f9c-4d31-87ce-21bb2d2d8563	INDUSTRIA DE ARTEFATOS PLASTICOS LTDA	9010251	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010251	2025-11-11 18:58:47.344	2025-11-11 18:58:47.377749	2025-11-11 18:58:47.377749
2340e1b2-3cc2-4cea-829e-de697c10e6a6	VALEO SISTEMAS AUTOMOTIVOS LTDA	9010252	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010252	2025-11-11 18:58:47.405	2025-11-11 18:58:47.437903	2025-11-11 18:58:47.437903
e8247e37-4f3d-4f4f-98bd-dd6db52476ff	PILKINGTON BRASIL LTDA	9010253	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010253	2025-11-11 18:58:47.467	2025-11-11 18:58:47.499509	2025-11-11 18:58:47.499509
119f98f7-baa7-4b08-a086-1cc34776a626	TORO INDUSTRIA E COMERCIO LTDA	9010254	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010254	2025-11-11 18:58:47.527	2025-11-11 18:58:47.558215	2025-11-11 18:58:47.558215
343cf47c-a1be-4d56-9ae9-c0c5190675df	INDUSTRIA AUTO METALURGICA S A	9010255	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010255	2025-11-11 18:58:47.585	2025-11-11 18:58:47.617642	2025-11-11 18:58:47.617642
867f9535-7430-4aac-b917-f1253f8908ad	INDEMETAL INDUSTRIA DE ETIQUETAS METALIC	9010256	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010256	2025-11-11 18:58:47.646	2025-11-11 18:58:47.678507	2025-11-11 18:58:47.678507
840a347c-e55e-4da6-b4e8-0ee56f252d1e	PLANMAR INDUSTRIA E COMERCIO DE PRODUTOS	9010257	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010257	2025-11-11 18:58:47.706	2025-11-11 18:58:47.785904	2025-11-11 18:58:47.785904
41038bde-fb7f-4d32-a775-575c3e8df672	WEBASTO ROOF SYSTEMS BRASIL LTDA.	9010258	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010258	2025-11-11 18:58:47.814	2025-11-11 18:58:47.846618	2025-11-11 18:58:47.846618
75adb18e-8b21-47d2-8dd2-685d47f1f2a2	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010259	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010259	2025-11-11 18:58:47.874	2025-11-11 18:58:47.90643	2025-11-11 18:58:47.90643
9d7526b4-25fd-4d25-98dc-f0bcc5ec6c0c	ZF DO BRASIL LTDA.	9010260	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010260	2025-11-11 18:58:47.934	2025-11-11 18:58:47.966149	2025-11-11 18:58:47.966149
6743fc06-78d7-4612-8107-9a5589ebadea	NEO RODAS S.A.	9010261	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010261	2025-11-11 18:58:47.993	2025-11-11 18:58:48.02582	2025-11-11 18:58:48.02582
500d4648-ef6b-45d9-b26f-4da4a8fd8824	SMP AUTOMOTIVE PRODUTOS AUTOMOTIVOS DO B	9010262	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010262	2025-11-11 18:58:48.054	2025-11-11 18:58:48.086183	2025-11-11 18:58:48.086183
beafbcc1-a65a-4115-bec1-a638ad810c76	BROSE DO BRASIL LTDA	9010263	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010263	2025-11-11 18:58:48.113	2025-11-11 18:58:48.145859	2025-11-11 18:58:48.145859
92649519-e5cd-4a12-bf7a-2fe92b63fc2f	SMP AUTOMOTIVE PRODUTOS AUTOMOTIVOS DO B	9010264	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010264	2025-11-11 18:58:48.173	2025-11-11 18:58:48.205603	2025-11-11 18:58:48.205603
edd8862f-896a-406e-96e0-1c0d3a17c829	PLASTICOS PREMIUM PACK INDUSTRIA E COMER	9010265	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010265	2025-11-11 18:58:48.233	2025-11-11 18:58:48.265241	2025-11-11 18:58:48.265241
8f805dab-d2a6-49a5-b909-ed96654d8a10	BONTAZ CENTRE DO BRASIL INDUSTRIA E COME	9010266	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010266	2025-11-11 18:58:48.292	2025-11-11 18:58:48.325411	2025-11-11 18:58:48.325411
02d96112-1399-47b9-bddd-3776582313dd	METAL TECNICA BOVENAU LTDA	9010267	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010267	2025-11-11 18:58:48.353	2025-11-11 18:58:48.385558	2025-11-11 18:58:48.385558
868a0450-9a03-4d95-9e1b-0a93e733abe1	PILKINGTON BRASIL LTDA	9010268	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010268	2025-11-11 18:58:48.413	2025-11-11 18:58:48.445477	2025-11-11 18:58:48.445477
f3440f3d-c2e0-457c-8980-ab3c79573e97	AMVIAN INDUSTRIA E COMERCIO DE PECAS AUT	9010269	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010269	2025-11-11 18:58:48.473	2025-11-11 18:58:48.505677	2025-11-11 18:58:48.505677
af51cc07-89ff-47c7-a72b-9fd2d0d2d0bd	VIBRACOUSTIC SOUTH AMERICA LTDA	9010270	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010270	2025-11-11 18:58:48.536	2025-11-11 18:58:48.568123	2025-11-11 18:58:48.568123
1a928e7d-c11b-499d-8287-069d8889bbc3	KATHREIN AUTOMOTIVE DO BRASIL LTDA	9010271	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010271	2025-11-11 18:58:48.595	2025-11-11 18:58:48.627886	2025-11-11 18:58:48.627886
451177ab-733a-47ee-8a9b-5bdaf2f81bf1	BORGWARNER EMISSIONS SYSTEMS LTDA.	9010272	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010272	2025-11-11 18:58:48.655	2025-11-11 18:58:48.687578	2025-11-11 18:58:48.687578
c0d0258c-f3d9-4894-a014-9a83b43991aa	ALEXANDRE CARVALHO OLIVEIRA 91706440987	9010273	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010273	2025-11-11 18:58:48.715	2025-11-11 18:58:48.747362	2025-11-11 18:58:48.747362
ea4ee869-0661-4d6b-8054-54eb54e198bd	Z.H.S INDUSTRIA E COMERCIO LTDA	9010274	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010274	2025-11-11 18:58:48.775	2025-11-11 18:58:48.807304	2025-11-11 18:58:48.807304
c293eebb-bedb-4112-94d5-9004b3d99de1	MAXION WHEELS DO BRASIL LTDA.	9010275	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010275	2025-11-11 18:58:48.835	2025-11-11 18:58:48.868696	2025-11-11 18:58:48.868696
25889d80-f194-48b7-b697-0cadb913502b	AUTOMETAL S/A	9010276	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010276	2025-11-11 18:58:48.896	2025-11-11 18:58:48.940108	2025-11-11 18:58:48.940108
cd6ce2c2-2f53-48a8-bf31-cabd1560dd74	MAC INDUSTRIA MECANICA LTDA	9010277	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010277	2025-11-11 18:58:48.968	2025-11-11 18:58:49.000286	2025-11-11 18:58:49.000286
30ef71ac-71ac-4dff-a30d-d990979c2a46	EATON LTDA	9010278	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010278	2025-11-11 18:58:49.028	2025-11-11 18:58:49.060242	2025-11-11 18:58:49.060242
825d8980-127e-4e79-9190-8f45dd25dc9b	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS E C	9010279	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010279	2025-11-11 18:58:49.088	2025-11-11 18:58:49.12039	2025-11-11 18:58:49.12039
db5f6806-aa53-45d8-a191-28a5a27e28e4	SAARGUMMI DO BRASIL LTDA	9010280	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010280	2025-11-11 18:58:49.15	2025-11-11 18:58:49.183114	2025-11-11 18:58:49.183114
cff157a1-908d-4c1e-9ade-7574206c4efe	VMG INDUSTRIA METALURGICA LTDA	9010281	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010281	2025-11-11 18:58:49.211	2025-11-11 18:58:49.243427	2025-11-11 18:58:49.243427
d48ce437-5274-4e5d-a3d3-0ceda4adea29	NSK BRASIL LTDA	9010282	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010282	2025-11-11 18:58:49.273	2025-11-11 18:58:49.304226	2025-11-11 18:58:49.304226
a12a981b-a5e3-4820-8658-a4fae71935d3	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS IND	9010283	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010283	2025-11-11 18:58:49.332	2025-11-11 18:58:49.379059	2025-11-11 18:58:49.379059
48553d9a-01d3-46fa-9c12-1595826f681e	NIKEN INDUSTRIA E COMERCIO METALURGICA L	9010284	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010284	2025-11-11 18:58:49.407	2025-11-11 18:58:49.438231	2025-11-11 18:58:49.438231
5ebb1409-6d67-45c4-b9fb-4fe0416cb20e	VOLKSWAGEN DO BRASIL INDUSTRIA DE VEICUL	9010285	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010285	2025-11-11 18:58:49.465	2025-11-11 18:58:49.49761	2025-11-11 18:58:49.49761
eb65e127-c040-45b0-bb9a-56c6784de80f	PARKER HANNIFIN INDUSTRIA E COMERCIO LTD	9010286	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010286	2025-11-11 18:58:49.525	2025-11-11 18:58:49.556685	2025-11-11 18:58:49.556685
ca64f1f5-862c-4866-a42f-824e8f6c8e29	METALURGICA SUPRENS LTDA	9010287	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010287	2025-11-11 18:58:49.584	2025-11-11 18:58:49.615154	2025-11-11 18:58:49.615154
83d67752-e179-4a83-a97c-eb88a3a6a174	IRMAOS PARASMO SA INDUSTRIA MECANICA	9010288	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010288	2025-11-11 18:58:49.642	2025-11-11 18:58:49.674783	2025-11-11 18:58:49.674783
38bacc72-e13a-4f34-90c3-a2f2fc4b6fe1	AUTO PARTS ALUMINIO DO BRASIL LTDA	9010289	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010289	2025-11-11 18:58:49.702	2025-11-11 18:58:49.73472	2025-11-11 18:58:49.73472
678589fa-050d-4ac8-9f1c-cb39744f9515	MAHLE METAL LEVE S.A.	9010290	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010290	2025-11-11 18:58:49.762	2025-11-11 18:58:49.794578	2025-11-11 18:58:49.794578
f517128c-1ebc-43d5-b782-506dbe517366	FUJIKURA AUTOMOTIVE DO BRASIL LTDA.	9010291	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010291	2025-11-11 18:58:49.822	2025-11-11 18:58:49.85425	2025-11-11 18:58:49.85425
83ce5622-3325-434e-8fd2-1707a3b834c2	SIKA S A	9010292	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010292	2025-11-11 18:58:49.881	2025-11-11 18:58:49.913914	2025-11-11 18:58:49.913914
006f1870-e3ac-4df4-ba57-d3ef1f7193da	VARROC DO BRASIL COMERCIO, IMPORTACAO E	9010293	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010293	2025-11-11 18:58:49.942	2025-11-11 18:58:49.975015	2025-11-11 18:58:49.975015
ccf8fbed-ffb0-4453-bcf7-e1537008da55	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010294	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010294	2025-11-11 18:58:50.003	2025-11-11 18:58:50.100167	2025-11-11 18:58:50.100167
976e512f-fa88-4029-95d2-16a3df9693ec	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010295	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010295	2025-11-11 18:58:50.128	2025-11-11 18:58:50.160086	2025-11-11 18:58:50.160086
35e1a812-a3e1-45e6-87b0-cbce81fa16f3	THYSSENKRUPP BRASIL LTDA.	9010296	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010296	2025-11-11 18:58:50.187	2025-11-11 18:58:50.220123	2025-11-11 18:58:50.220123
54ac3cea-0f44-425e-a3ab-015353400d91	FOCUS TECNOLOGIA DE PLASTICOS S/A	9010297	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010297	2025-11-11 18:58:50.248	2025-11-11 18:58:50.281686	2025-11-11 18:58:50.281686
5eb06de5-e28b-4a50-955a-7deef5964663	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010298	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010298	2025-11-11 18:58:50.309	2025-11-11 18:58:50.341144	2025-11-11 18:58:50.341144
88be9b2c-2493-448c-bc8a-54c59a83bb8b	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010299	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010299	2025-11-11 18:58:50.369	2025-11-11 18:58:50.401114	2025-11-11 18:58:50.401114
964751e8-6e71-45cd-bda8-c425a4eabb24	BINS INDUSTRIA DE ARTEFATOS DE BORRACHA	9010300	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010300	2025-11-11 18:58:50.428	2025-11-11 18:58:50.460975	2025-11-11 18:58:50.460975
b34a7d0e-58cd-4a8f-a8a1-1921224dd22f	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010301	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010301	2025-11-11 18:58:50.488	2025-11-11 18:58:50.520663	2025-11-11 18:58:50.520663
ee89004a-45ec-4033-b4c5-c730563cd8db	ASPOL INDUSTRIA E COMERCIO LTDA	9010302	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010302	2025-11-11 18:58:50.548	2025-11-11 18:58:50.58054	2025-11-11 18:58:50.58054
8494853f-fcef-4d90-b721-3b07522e98fc	ENGEMET INDUSTRIA E COMERCIO DE EQUIPAME	9010303	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010303	2025-11-11 18:58:50.608	2025-11-11 18:58:50.640095	2025-11-11 18:58:50.640095
8f3924e1-6908-4866-8b0b-268df4a0098f	THYSSENKRUPP BRASIL LTDA.	9010304	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010304	2025-11-11 18:58:50.667	2025-11-11 18:58:50.699517	2025-11-11 18:58:50.699517
a721436b-f41b-4bfd-abf3-534d24139880	METALURGICA FEY LTDA	9010305	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010305	2025-11-11 18:58:50.727	2025-11-11 18:58:50.759081	2025-11-11 18:58:50.759081
872a46da-cefd-4ded-b942-7ba4191246c2	AUTO PARTS ALUMINIO DO BRASIL LTDA	9010306	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010306	2025-11-11 18:58:50.786	2025-11-11 18:58:50.818858	2025-11-11 18:58:50.818858
84b32e10-0686-4730-91c2-30f974f0e1bd	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010307	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010307	2025-11-11 18:58:50.846	2025-11-11 18:58:50.878504	2025-11-11 18:58:50.878504
dd60fa50-3c95-4474-9023-8d5c5e987c3f	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010308	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010308	2025-11-11 18:58:50.906	2025-11-11 18:58:50.938092	2025-11-11 18:58:50.938092
6a35765a-313c-456f-859e-4c2ab4f57411	AUDI DO BRASIL INDUSTRIA E COMERCIO DE V	9010309	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010309	2025-11-11 18:58:50.965	2025-11-11 18:58:50.997655	2025-11-11 18:58:50.997655
6e943adb-17e5-4133-99b7-f8cbc766f36c	REAL MECANICA DE PRECISAO EIRELI	9010310	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010310	2025-11-11 18:58:51.025	2025-11-11 18:58:51.05727	2025-11-11 18:58:51.05727
6249c8dd-e7c5-498a-b36c-67d21a2f8362	QUALIFLEX PRODUTOS TÃ‰CNICOS DE BORRACHA	9010311	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010311	2025-11-11 18:58:51.086	2025-11-11 18:58:51.117259	2025-11-11 18:58:51.117259
910996c4-2404-44de-87d1-066f46cb2919	SCHLEMMER DO BRASIL	9010312	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010312	2025-11-11 18:58:51.144	2025-11-11 18:58:51.176807	2025-11-11 18:58:51.176807
780869fc-1545-4464-bc31-b591cc47b503	OMRCOMPONENTES AUTOMOTIVOS LTDA	9010313	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010313	2025-11-11 18:58:51.204	2025-11-11 18:58:51.236602	2025-11-11 18:58:51.236602
bb8037fa-cc82-40ee-9edd-57a351505549	KNORR BREMSE SPVC LTDA	9010314	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010314	2025-11-11 18:58:51.264	2025-11-11 18:58:51.296104	2025-11-11 18:58:51.296104
0f26e261-c74e-47da-a2e1-1d466d001d58	NYCOL - PLAST INDUSTRIA E COMERCIO LTDA	9010315	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010315	2025-11-11 18:58:51.323	2025-11-11 18:58:51.355429	2025-11-11 18:58:51.355429
c9ab75ab-d234-43dc-a768-a49210c081b9	MAN LATIN AMERICA INDUSTRIA E COMERCIO D	9010316	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010316	2025-11-11 18:58:51.383	2025-11-11 18:58:51.414883	2025-11-11 18:58:51.414883
194529b2-36e1-4fb5-b5cc-03f971b21f06	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010317	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010317	2025-11-11 18:58:51.442	2025-11-11 18:58:51.474435	2025-11-11 18:58:51.474435
42573191-d6fd-416e-a64d-da8ca2a3b87e	ENGEMET METALURGIA E COMERCIO LTDA	9010318	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010318	2025-11-11 18:58:51.502	2025-11-11 18:58:51.533238	2025-11-11 18:58:51.533238
7d33c095-dcdd-43d7-965a-6140d68ac7e5	KONGSBERG AUTOMOTIVE LTDA	9010319	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010319	2025-11-11 18:58:51.56	2025-11-11 18:58:51.592569	2025-11-11 18:58:51.592569
f9a81c8d-a319-480f-bae6-c9460ca58f9d	FIPLAS INDUSTRIA E COMERCIO LTDA	9010320	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010320	2025-11-11 18:58:51.62	2025-11-11 18:58:51.652971	2025-11-11 18:58:51.652971
80640499-0b4a-41ea-a20b-f52dce9239b1	ENARPE SERVICOS E SOLUCOES AMBIENTAIS LT	9010321	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010321	2025-11-11 18:58:51.68	2025-11-11 18:58:51.712741	2025-11-11 18:58:51.712741
980ddf35-90f5-45c1-b7fc-d4debca45347	METAL. MAUSER INDUSTRIAL E COMERCIO LTDA	9010322	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010322	2025-11-11 18:58:51.741	2025-11-11 18:58:51.773107	2025-11-11 18:58:51.773107
d7bec849-e36a-4ba6-8d26-96bec6e81456	BLEISTAHL BRASIL METALURGIA LTDA	9010323	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010323	2025-11-11 18:58:51.8	2025-11-11 18:58:51.833017	2025-11-11 18:58:51.833017
070becdf-e299-4620-8b7b-cbbd4e307a6d	MCP TRANSPORTES RODOVIARIOS S/A	9010324	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010324	2025-11-11 18:58:51.86	2025-11-11 18:58:51.939247	2025-11-11 18:58:51.939247
b1a4c444-ef7d-4f7a-8ca7-82174753b023	COMPONENT INDUSTRIA E COMERCIO LTDA	9010325	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010325	2025-11-11 18:58:51.966	2025-11-11 18:58:51.998845	2025-11-11 18:58:51.998845
ce7169ac-0e40-410e-a995-e2d7d783b3bb	METALAC INDUSTRIA E COMERCIO LTDA.	9010326	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010326	2025-11-11 18:58:52.027	2025-11-11 18:58:52.059095	2025-11-11 18:58:52.059095
ec6e9015-b5d2-48b6-8987-dcfcb319e169	W. D. COMERCIO DE PECAS E ACESSORIOS PAR	9010327	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010327	2025-11-11 18:58:52.087	2025-11-11 18:58:52.118428	2025-11-11 18:58:52.118428
3c717c12-4a9d-412f-b7c9-61285e7ade2e	H.SILVA INJEÃ‡AO DE TERMOPLASTICOS	9010328	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010328	2025-11-11 18:58:52.146	2025-11-11 18:58:52.178656	2025-11-11 18:58:52.178656
127f0ac6-318f-42c0-b31e-a448267ed9f6	INYLBRA INDUSTRIA E COMERCIO LTDA	9010329	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010329	2025-11-11 18:58:52.206	2025-11-11 18:58:52.238259	2025-11-11 18:58:52.238259
6a0a1924-b66b-4e56-acc9-3a2e1a7d23b1	ZF DO BRASIL LTDA	9010330	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010330	2025-11-11 18:58:52.265	2025-11-11 18:58:52.297797	2025-11-11 18:58:52.297797
574f1fe4-064c-4dac-b3a2-010a4354799f	COBRA METAIS DECORATIVOS LTDA	9010331	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010331	2025-11-11 18:58:52.325	2025-11-11 18:58:52.357461	2025-11-11 18:58:52.357461
d877fb71-56bc-4767-9979-e20b25f6acd6	COOPER-STANDARD AUTOMOTIVE BRASIL SEALIN	9010332	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010332	2025-11-11 18:58:52.385	2025-11-11 18:58:52.417614	2025-11-11 18:58:52.417614
9326faaa-70cc-4650-a417-6d2a71dc98a4	MDA DO BRASIL INDUSTRIA E COMERCIO EIREL	9010333	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010333	2025-11-11 18:58:52.445	2025-11-11 18:58:52.477132	2025-11-11 18:58:52.477132
a1b57a79-0c79-48f6-a825-1bb216fba352	PRICOL DO BRASIL COMPONENTES AUTOMOTIVOS	9010334	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010334	2025-11-11 18:58:52.505	2025-11-11 18:58:52.536989	2025-11-11 18:58:52.536989
71f78c21-f96a-4a85-96e1-95a9b455c3a9	ROBERT BOSCH DIRECAO AUTOMOTIVA LTDA	9010335	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010335	2025-11-11 18:58:52.564	2025-11-11 18:58:52.596856	2025-11-11 18:58:52.596856
d738a95e-e301-47d9-9b35-4d15e2d58001	SUNNINGDALE TECH PLASTICOS (BRASIL) LTDA	9010336	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010336	2025-11-11 18:58:52.624	2025-11-11 18:58:52.656469	2025-11-11 18:58:52.656469
d69b031b-11c9-4f0f-9d55-7b14b38160b8	TEKSID DO BRASIL LTDA	9010337	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010337	2025-11-11 18:58:52.683	2025-11-11 18:58:52.715679	2025-11-11 18:58:52.715679
a305d619-a86a-43bd-b37f-3022eb963290	D. DE S. SALES MANUTENCAO	9010338	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010338	2025-11-11 18:58:52.743	2025-11-11 18:58:52.775733	2025-11-11 18:58:52.775733
b4cae99a-984d-4d62-b8a7-4f24b9648e37	FEDERAL-MOGUL SISTEMAS AUTOMOTIVOS LTDA.	9010339	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010339	2025-11-11 18:58:52.803	2025-11-11 18:58:52.835061	2025-11-11 18:58:52.835061
823079f7-9e16-4764-8704-0059e1c03989	FCA FIAT CHRYSLER AUTOMOVEIS BRASIL LTDA	9010340	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010340	2025-11-11 18:58:52.863	2025-11-11 18:58:52.895924	2025-11-11 18:58:52.895924
d3dc8ef1-8218-418b-b7f6-e2efe3760976	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS IND	9010341	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010341	2025-11-11 18:58:52.923	2025-11-11 18:58:52.955482	2025-11-11 18:58:52.955482
7752e095-c453-4756-b39c-5af2deb9e9cd	SANOH DO BRASIL INDUSTRIA E COMERCIO DE	9010342	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010342	2025-11-11 18:58:52.983	2025-11-11 18:58:53.015147	2025-11-11 18:58:53.015147
d6a61f38-88cf-425e-9a27-36b6bfc042e3	SOCIEDADE COMERCIAL TOYOTA TSUSHO DO BRA	9010343	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010343	2025-11-11 18:58:53.042	2025-11-11 18:58:53.074496	2025-11-11 18:58:53.074496
4b52ed75-0005-4e17-9dba-a8d92aebde7e	PARANOA INDUSTRIA DE BORRACHA LTDA.	9010344	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010344	2025-11-11 18:58:53.102	2025-11-11 18:58:53.134417	2025-11-11 18:58:53.134417
29fe68ca-fa4c-4c7a-bcc6-a071cb11eec4	FCA POWERTRAIN BRASIL INDUSTRIA E COMERC	9010345	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010345	2025-11-11 18:58:53.162	2025-11-11 18:58:53.195015	2025-11-11 18:58:53.195015
348d1454-d696-4c7a-a725-e04b15414c46	PLASTICOS NOVEL SAO PAULO LTDA.	9010346	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010346	2025-11-11 18:58:53.222	2025-11-11 18:58:53.25483	2025-11-11 18:58:53.25483
d8a7a1c2-17d4-4854-8ce5-60972c876f07	TEKNIA BRASIL LTDA.	9010347	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010347	2025-11-11 18:58:53.282	2025-11-11 18:58:53.313268	2025-11-11 18:58:53.313268
2b350645-a370-44d8-aff1-c539d2267986	SKF DO BRASIL LTDA	9010348	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010348	2025-11-11 18:58:53.34	2025-11-11 18:58:53.37287	2025-11-11 18:58:53.37287
0f0833cf-9806-44f1-bdef-01f708a3a23f	VOLVO DO BRASIL VEICULOS LTDA	9010349	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010349	2025-11-11 18:58:53.401	2025-11-11 18:58:53.432872	2025-11-11 18:58:53.432872
99ae3dd7-b2ff-4a1b-b18d-c66cb505436d	GT TECHNOLOGIES DO BRASIL COMPONENTES AU	9010350	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010350	2025-11-11 18:58:53.46	2025-11-11 18:58:53.493003	2025-11-11 18:58:53.493003
548bb347-edd3-42e5-abe7-f20d131b2acb	TESA BRASIL LTDA	9010351	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010351	2025-11-11 18:58:53.52	2025-11-11 18:58:53.552616	2025-11-11 18:58:53.552616
79ee12ab-537c-415e-8926-c9aa0dab801f	KONNECT INDUSTRIA E COMERCIO LTDA	9010352	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010352	2025-11-11 18:58:53.58	2025-11-11 18:58:53.612485	2025-11-11 18:58:53.612485
150a3ac3-e802-4aea-99f6-d10ceb4f599e	SCHULZ S/A	9010353	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010353	2025-11-11 18:58:53.64	2025-11-11 18:58:53.672199	2025-11-11 18:58:53.672199
0c5bdb69-e832-43c4-8ed5-4c1d55d4df63	VETORE INDUSTRIA E COMERCIO DE AUTOPECAS	9010354	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010354	2025-11-11 18:58:53.7	2025-11-11 18:58:53.732502	2025-11-11 18:58:53.732502
64d988d3-9987-4693-89df-c0264d576d7a	TUBODIN INDUSTRIAL LTDA	9010355	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010355	2025-11-11 18:58:53.76	2025-11-11 18:58:53.792086	2025-11-11 18:58:53.792086
2ac1904f-9a1b-4d9a-b965-a453e5026ffd	ISEL USINAGEM E MECANICA EM GERAL LTDA	9010356	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010356	2025-11-11 18:58:53.819	2025-11-11 18:58:53.85151	2025-11-11 18:58:53.85151
9a04d349-9ce4-461c-ad71-450e83d2f837	PELZER DA BAHIA LTDA	9010357	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010357	2025-11-11 18:58:53.879	2025-11-11 18:58:53.910818	2025-11-11 18:58:53.910818
718bcebc-7991-46ce-95b2-625b22162986	ETHOS INDUSTRIAL LTDA.	9010358	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010358	2025-11-11 18:58:53.938	2025-11-11 18:58:53.970874	2025-11-11 18:58:53.970874
57860bbe-767b-4f79-8ad3-46c85e5272d6	GRANACO FUNDICAO LTDA.	9010359	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010359	2025-11-11 18:58:53.998	2025-11-11 18:58:54.030564	2025-11-11 18:58:54.030564
b949162d-3bee-4273-90a6-6e40befc124f	EATON LTDA	9010360	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010360	2025-11-11 18:58:54.058	2025-11-11 18:58:54.09022	2025-11-11 18:58:54.09022
082e884e-6b01-4789-b4d8-a483fe30c512	BATZ LIGHTWEIGHT SYSTEMS DO BRASIL LTDA	9010361	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010361	2025-11-11 18:58:54.118	2025-11-11 18:58:54.150219	2025-11-11 18:58:54.150219
fd9b1a22-22e9-4ca1-a9ea-3f5dc7f4597d	DICASTAL DO BRASIL PECAS PARA VEICULOS L	9010362	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010362	2025-11-11 18:58:54.178	2025-11-11 18:58:54.209974	2025-11-11 18:58:54.209974
d85b3897-606f-4ddc-91a8-9596a4c5a318	FUJI AUTOTECH AUTOPECAS DO BRASIL LTDA	9010363	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010363	2025-11-11 18:58:54.237	2025-11-11 18:58:54.269925	2025-11-11 18:58:54.269925
8ab29e9c-30d4-41da-9125-fa03070bd7e6	VOLVO DO BRASIL VEICULOS LTDA	9010365	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010365	2025-11-11 18:58:54.298	2025-11-11 18:58:54.330921	2025-11-11 18:58:54.330921
506f02f3-b81f-44ce-80d8-dd67a03a1a48	BRIENZI USINAGEM EIRELI	9010366	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010366	2025-11-11 18:58:54.358	2025-11-11 18:58:54.390374	2025-11-11 18:58:54.390374
09a5a52a-fa0a-4221-aefe-06739cf09bfa	ELDOR DO BRASIL COMPONENTES AUTOMOTIVOS	9010367	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010367	2025-11-11 18:58:54.418	2025-11-11 18:58:54.449993	2025-11-11 18:58:54.449993
89cff538-c665-4335-8003-cc2bae2b187f	LQ REPRESENTACOES	9010368	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010368	2025-11-11 18:58:54.477	2025-11-11 18:58:54.510212	2025-11-11 18:58:54.510212
b6c85ecb-8a89-4acc-b56b-a9cf913707b6	TUPER S/A	9010369	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010369	2025-11-11 18:58:54.539	2025-11-11 18:58:54.584084	2025-11-11 18:58:54.584084
7d2a71dc-6fa4-4f13-ba6b-f7df2c5a748f	HENGST INDUSTRIA DE FILTROS LTDA	9010370	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010370	2025-11-11 18:58:54.612	2025-11-11 18:58:54.643952	2025-11-11 18:58:54.643952
05be0828-5753-463f-9e66-bb32b5db9061	TI BRASIL INDUSTRIA E COMERCIO LTDA	9010371	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010371	2025-11-11 18:58:54.671	2025-11-11 18:58:54.704096	2025-11-11 18:58:54.704096
62160827-502f-40d4-9fc0-1564dc0c1b49	MARTINREA HONSEL BRASIL FUNDICAO E COMER	9010372	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010372	2025-11-11 18:58:54.731	2025-11-11 18:58:54.763636	2025-11-11 18:58:54.763636
922dd40b-210a-448e-84a9-44ed8d2141ff	SKY CORTE LASER EIRELI	9010373	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010373	2025-11-11 18:58:54.791	2025-11-11 18:58:54.823588	2025-11-11 18:58:54.823588
4004b784-631a-459b-b66b-246275760fa8	SMR AUTOMOTIVE BRASIL LTDA.	9010374	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010374	2025-11-11 18:58:54.851	2025-11-11 18:58:54.883291	2025-11-11 18:58:54.883291
2090df6f-be56-4e29-94d2-63ddf61b0401	TENNECO AUTOMOTIVE BRASIL LTDA	9010375	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010375	2025-11-11 18:58:54.91	2025-11-11 18:58:54.942771	2025-11-11 18:58:54.942771
62e5c56a-1777-4ae2-a09c-028281296b7c	SEG AUTOMOTIVE COMPONENTS BRAZIL LTDA.	9010376	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010376	2025-11-11 18:58:54.97	2025-11-11 18:58:55.001395	2025-11-11 18:58:55.001395
b34ef398-c43e-4bed-b112-e12f663c7d9a	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010377	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010377	2025-11-11 18:58:55.029	2025-11-11 18:58:55.061298	2025-11-11 18:58:55.061298
3162c42a-842b-4ef2-a2bc-b7d2732d14d1	GILVANEY SANTOS ASSUMPCAO	9010378	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010378	2025-11-11 18:58:55.088	2025-11-11 18:58:55.12097	2025-11-11 18:58:55.12097
2bf482dc-3273-472d-94f4-743952ab8c1e	MAN LATIN AMERICA INDUSTRIA E COMERCIO D	9010379	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010379	2025-11-11 18:58:55.148	2025-11-11 18:58:55.180314	2025-11-11 18:58:55.180314
da91cafa-70b2-4381-980e-3c2e90e958d8	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010380	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010380	2025-11-11 18:58:55.207	2025-11-11 18:58:55.239788	2025-11-11 18:58:55.239788
626aeb8a-aee8-425c-8c95-72122ebb7a90	VETORE INDUSTRIA E COMERCIO DE AUTOPECAS	9010381	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010381	2025-11-11 18:58:55.276	2025-11-11 18:58:55.308738	2025-11-11 18:58:55.308738
e6db649c-cdf8-4eda-ad76-0f9bb5394d91	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010382	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010382	2025-11-11 18:58:55.336	2025-11-11 18:58:55.368224	2025-11-11 18:58:55.368224
d7dc425f-6c3e-4f35-8234-6b731d9bb4ab	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010383	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010383	2025-11-11 18:58:55.395	2025-11-11 18:58:55.427881	2025-11-11 18:58:55.427881
0df749e3-e22f-4972-a99e-61f39b1c97b4	BRIENZE USINAGEM EIRELI	9010384	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010384	2025-11-11 18:58:55.455	2025-11-11 18:58:55.487409	2025-11-11 18:58:55.487409
714dfacb-d99f-42d3-8e8c-ef33470a5ae2	GILVANEY SANTOS ASSUMPCAO	9010385	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010385	2025-11-11 18:58:55.515	2025-11-11 18:58:55.546773	2025-11-11 18:58:55.546773
ce12d6a9-9f74-4b77-8837-e368ee7677b0	C R W INDUSTRIA E COMERCIO DE PLASTICOS	9010386	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010386	2025-11-11 18:58:55.574	2025-11-11 18:58:55.606457	2025-11-11 18:58:55.606457
ce66bbab-8583-4464-91f0-21877eca3e54	FORD BAHIA	114	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	114	2025-11-11 18:59:06.078	2025-11-11 18:59:06.110135	2025-11-11 18:59:06.110135
d7be8192-1967-4117-91b7-39201692b737	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010387	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010387	2025-11-11 18:58:55.634	2025-11-11 18:58:55.665883	2025-11-11 18:58:55.665883
feb652c7-590e-4e0a-b2c7-bd15cd4d55de	SIAN - SISTEMAS DE ILUMINACAO AUTOMOTIVA	9010388	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010388	2025-11-11 18:58:55.693	2025-11-11 18:58:55.725156	2025-11-11 18:58:55.725156
ba0ff7ff-548e-4416-859b-29aea266ffec	SCHULZ S/A	9010389	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010389	2025-11-11 18:58:55.782	2025-11-11 18:58:55.814798	2025-11-11 18:58:55.814798
c0bb6b70-f701-429b-b101-e157216702f5	AUTOMETAL S/A	9010390	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010390	2025-11-11 18:58:55.842	2025-11-11 18:58:55.873502	2025-11-11 18:58:55.873502
1db788f5-cd04-4673-8a58-740cd84f21e3	PELZER DA BAHIA LTDA	9010391	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010391	2025-11-11 18:58:55.901	2025-11-11 18:58:55.933392	2025-11-11 18:58:55.933392
d7673764-dde8-42be-b830-7e702787c594	MEGATECH BRASIL COMPONENTES AUTOMOTIVOS	9010392	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010392	2025-11-11 18:58:55.961	2025-11-11 18:58:55.99282	2025-11-11 18:58:55.99282
b55c1818-58fb-4222-9d75-b8aafc00150b	AUTOLIV DO BRASIL LTDA	9010393	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010393	2025-11-11 18:58:56.02	2025-11-11 18:58:56.052669	2025-11-11 18:58:56.052669
ce296cdd-9224-4df1-96e7-390f74782043	ALPINO INDUSTRIA METALURGICA LTDA	9010394	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010394	2025-11-11 18:58:56.08	2025-11-11 18:58:56.112578	2025-11-11 18:58:56.112578
4228767f-d632-443b-b5ff-0791a9f15cef	PELZER DO BRASIL LTDA	9010395	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010395	2025-11-11 18:58:56.14	2025-11-11 18:58:56.172105	2025-11-11 18:58:56.172105
c2c72158-3687-43b0-95da-060f6e2893e5	HI-LEX DO BRASIL LTDA.	9010396	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010396	2025-11-11 18:58:56.199	2025-11-11 18:58:56.231842	2025-11-11 18:58:56.231842
59b1cb82-524d-491d-b471-6495886c221a	MAGIUS METALURGICA INDUSTRIAL LTDA	9010397	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010397	2025-11-11 18:58:56.259	2025-11-11 18:58:56.291244	2025-11-11 18:58:56.291244
1714719d-2794-4f53-9710-36a630dbfd9f	LC PECAS TECNICAS EM ESPUMAS - EIRELI	9010398	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010398	2025-11-11 18:58:56.318	2025-11-11 18:58:56.35056	2025-11-11 18:58:56.35056
df73db4f-9301-428b-b4d9-648a15f53b13	PELZER DA BAHIA LTDA	9010399	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010399	2025-11-11 18:58:56.378	2025-11-11 18:58:56.411247	2025-11-11 18:58:56.411247
c8a60613-2baf-4d72-bee6-65376d9a5d7d	FUNDIMISA - FUNDICAO E USINAGEM LTDA.	9010400	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010400	2025-11-11 18:58:56.439	2025-11-11 18:58:56.471031	2025-11-11 18:58:56.471031
e690f2da-1f43-4840-a585-94e541be969a	FLAMMA AUTOMOTIVA S/A	9010401	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010401	2025-11-11 18:58:56.498	2025-11-11 18:58:56.530526	2025-11-11 18:58:56.530526
4048c2c1-9162-444b-9f90-cd0c821135ca	MUSASHI DO BRASIL LTDA	9010402	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010402	2025-11-11 18:58:56.558	2025-11-11 18:58:56.590057	2025-11-11 18:58:56.590057
50c49475-121f-4b29-bdd3-6a186dd6545f	FEEDER INDUSTRIAL LTDA	9010403	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010403	2025-11-11 18:58:56.617	2025-11-11 18:58:56.649807	2025-11-11 18:58:56.649807
7b1cac2d-1592-43c4-bd0c-0860df227478	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010404	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010404	2025-11-11 18:58:56.677	2025-11-11 18:58:56.709481	2025-11-11 18:58:56.709481
7ddb952a-09d0-4bdf-bc65-d6a695e4dd0a	NETZSCH INDUSTRIA E COMERCIO DE EQUIPAME	9010405	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010405	2025-11-11 18:58:56.737	2025-11-11 18:58:56.768972	2025-11-11 18:58:56.768972
50b62ff3-c247-4cf5-8d19-5cd928855a60	PILKINGTON BRASIL LTDA	9010406	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010406	2025-11-11 18:58:56.796	2025-11-11 18:58:56.828447	2025-11-11 18:58:56.828447
6840a1a3-e3d5-4c73-9ec5-b1923a3fca58	PROGERAL INDUSTRIA DE ARTEFATOS PLASTICO	9010407	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010407	2025-11-11 18:58:56.856	2025-11-11 18:58:56.888448	2025-11-11 18:58:56.888448
1c6ba852-d05d-4432-bf2a-ac4c54693ea6	SETAL TRANSPORTES LTDA	9010408	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010408	2025-11-11 18:58:56.916	2025-11-11 18:58:56.947993	2025-11-11 18:58:56.947993
4ebce586-3e50-4328-ac10-020678a9c590	THYSSENKRUPP METALURGICA CAMPO LIMPO LTD	9010409	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010409	2025-11-11 18:58:56.975	2025-11-11 18:58:57.006166	2025-11-11 18:58:57.006166
e7fe6969-d1c3-4d97-90f3-a9ce1738a7af	WEIDPLAS BRASIL INDUSTRIA E COMERCIO DE	9010410	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010410	2025-11-11 18:58:57.033	2025-11-11 18:58:57.066113	2025-11-11 18:58:57.066113
816f39b2-e377-4a1f-aaa3-22e9bb647927	AETHRA SISTEMAS AUTOMOTIVOS S.A.	9010411	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010411	2025-11-11 18:58:57.093	2025-11-11 18:58:57.125707	2025-11-11 18:58:57.125707
87bc68f8-500a-4fce-969a-3ea1bec9bfb8	INBRASC - INDUSTRIA BRASILEIRA DE COMPON	9010412	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010412	2025-11-11 18:58:57.153	2025-11-11 18:58:57.185264	2025-11-11 18:58:57.185264
10d03706-6821-41cc-a85b-1914facd8764	SMP AUTOMOTIVE P. AUT.DO BRASIL LTDA	9010413	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010413	2025-11-11 18:58:57.212	2025-11-11 18:58:57.244819	2025-11-11 18:58:57.244819
a90e074e-6514-4407-879a-0e31028572c5	ADIENT DO BRASIL BANCOS AUTOMOTIVOS LTDA	9010414	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010414	2025-11-11 18:58:57.272	2025-11-11 18:58:57.304208	2025-11-11 18:58:57.304208
1636c051-d0a1-4720-92e1-8da99a1025c6	GENERAL MOTORS DO BRASIL LTDA	9010415	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010415	2025-11-11 18:58:57.331	2025-11-11 18:58:57.363736	2025-11-11 18:58:57.363736
2ef5727c-f28f-4b03-aa37-e631af7844e7	VITESCO TECNOLOGIA BRASIL AUTOMOTIVA LTD	9010416	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010416	2025-11-11 18:58:57.391	2025-11-11 18:58:57.423059	2025-11-11 18:58:57.423059
05e8ddb3-2cd4-4d10-b9c4-9109a0133f69	TRG MONTAGEM E ACABAMENTO DE PECAS LTDA	9010417	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010417	2025-11-11 18:58:57.45	2025-11-11 18:58:57.483852	2025-11-11 18:58:57.483852
b1a48ab5-64fa-4179-b302-1ddb0863f0fe	TUPER S/A	9010418	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010418	2025-11-11 18:58:57.511	2025-11-11 18:58:57.543606	2025-11-11 18:58:57.543606
e13a07c7-8582-4e03-903a-5845028f4637	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010419	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010419	2025-11-11 18:58:57.571	2025-11-11 18:58:57.603353	2025-11-11 18:58:57.603353
15843a5d-6a05-4935-bbfb-f03b5a8dcd06	PEUGEOT-CITROEN DO BRASIL AUTOMOVEIS LTD	9010420	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010420	2025-11-11 18:58:57.631	2025-11-11 18:58:57.66314	2025-11-11 18:58:57.66314
a3ec188f-d195-462f-94a7-94ac2e57b46e	CESTARI INDUSTRIAL E COMERCIAL SA	9010421	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010421	2025-11-11 18:58:57.69	2025-11-11 18:58:57.724183	2025-11-11 18:58:57.724183
edfe4701-4243-4d85-94e0-a41f8603a593	INDUSTRIA MECANICA KONDOR LTDA	9010422	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010422	2025-11-11 18:58:57.751	2025-11-11 18:58:57.783854	2025-11-11 18:58:57.783854
58d18e49-b4ee-4400-8fd0-ad26352a45cb	W V INDUSTRIA METALURGICA LTDA	9010423	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010423	2025-11-11 18:58:57.811	2025-11-11 18:58:57.843323	2025-11-11 18:58:57.843323
1c7b3190-4d53-4dc2-a8c3-b8ea0ecec364	TRELLEBORG DO BRASIL SOLUCOES EM VEDACAO	9010424	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010424	2025-11-11 18:58:57.871	2025-11-11 18:58:57.902876	2025-11-11 18:58:57.902876
6ff5fe2d-31bf-4336-a421-00bb27572235	MIBA SINTER BRASIL LTDA	9010425	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010425	2025-11-11 18:58:57.93	2025-11-11 18:58:57.962332	2025-11-11 18:58:57.962332
7220fd56-6a07-45e0-a0ae-91e0849fded8	ALBANO E FARIAS PRESTADORA DE SERVICOS L	9010426	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010426	2025-11-11 18:58:57.989	2025-11-11 18:58:58.021582	2025-11-11 18:58:58.021582
7b97448e-8b6c-41be-bc3c-1d6a3e5cb072	BOSAL DO BRASIL LTDA.	9010427	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010427	2025-11-11 18:58:58.049	2025-11-11 18:58:58.081312	2025-11-11 18:58:58.081312
d1f6c5cc-c0b1-4ede-b0bf-8f4ee8c98d24	C.C.S. TECNOLOGIA E SERVICOS S.A.	9010428	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010428	2025-11-11 18:58:58.108	2025-11-11 18:58:58.140654	2025-11-11 18:58:58.140654
ed65d281-eafb-47fe-b9e2-789bd9329659	ARTMETAL INDUSTRIA E COMERCIO LTDA	9010429	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010429	2025-11-11 18:58:58.168	2025-11-11 18:58:58.200428	2025-11-11 18:58:58.200428
02f579aa-0ce2-4730-b256-368291b58f53	REQUIPH INDUSTRIA E COMERCIO DE EQUIP HI	9010430	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010430	2025-11-11 18:58:58.228	2025-11-11 18:58:58.261422	2025-11-11 18:58:58.261422
5783fd4a-ffb9-4c92-80c9-95e9a31941b5	ELECTRO ACO ALTONA S A	9010431	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010431	2025-11-11 18:58:58.289	2025-11-11 18:58:58.320996	2025-11-11 18:58:58.320996
b9366d3e-d634-49f5-b258-66b595ef67b6	WETZEL S/A EM RECUPERACAO JUDICIAL	9010432	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010432	2025-11-11 18:58:58.348	2025-11-11 18:58:58.380644	2025-11-11 18:58:58.380644
d83cf575-2875-4b6e-ae86-915c0f1b3197	GGB BRASIL INDUSTRIA DE MANCAIS E COMPON	9010433	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010433	2025-11-11 18:58:58.408	2025-11-11 18:58:58.440158	2025-11-11 18:58:58.440158
60bcbc2a-9e88-4b09-8c3f-9cdffe0e5766	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010434	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010434	2025-11-11 18:58:58.467	2025-11-11 18:58:58.499848	2025-11-11 18:58:58.499848
225f75ab-58b0-4849-a3d5-a3353f53813d	INCOM - INDUSTRIAL EIRELI	9010435	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010435	2025-11-11 18:58:58.528	2025-11-11 18:58:58.559978	2025-11-11 18:58:58.559978
b92c68a4-caae-473a-95a2-0707604c6ec9	ITP SYSTEMS CONECTORES ELETRICO E ELETRO	9010436	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010436	2025-11-11 18:58:58.587	2025-11-11 18:58:58.619346	2025-11-11 18:58:58.619346
f9f258e3-3305-409e-8dba-85e495c58a6f	ITP SYSTEMS CONECTORES ELETRICO E ELETRO	9010437	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010437	2025-11-11 18:58:58.647	2025-11-11 18:58:58.679035	2025-11-11 18:58:58.679035
c07c9b6d-fe10-47ec-aecf-501acb32a6ff	REFLEXALLEN DO BRASIL AUTOMOTIVA LTDA.	9010438	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010438	2025-11-11 18:58:58.706	2025-11-11 18:58:58.738601	2025-11-11 18:58:58.738601
c75e21f4-8bed-4bdd-a434-bdf952042385	PLASCAR INDUSTRIA DE COMPONENTES PLASTIC	9010439	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010439	2025-11-11 18:58:58.766	2025-11-11 18:58:58.797251	2025-11-11 18:58:58.797251
04b41e3c-3f6a-4b49-8ae6-bd14b82e497e	GENERAL MOTORS DO BRASIL LTDA	9010440	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010440	2025-11-11 18:58:58.824	2025-11-11 18:58:58.856508	2025-11-11 18:58:58.856508
7e830a6e-e64f-4b77-92a6-365c170ee375	RIVETS INDUSTRIA E COMERCIO LTDA	9010441	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010441	2025-11-11 18:58:58.884	2025-11-11 18:58:58.916443	2025-11-11 18:58:58.916443
68ffbb09-49b9-4ae8-9e6a-a31894493ae7	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010442	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010442	2025-11-11 18:58:58.944	2025-11-11 18:58:58.976092	2025-11-11 18:58:58.976092
cfeac6d7-8f50-46e3-be63-7420705e7121	KAUTEX TEXTRON DO BRASIL LTDA	9010443	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010443	2025-11-11 18:58:59.003	2025-11-11 18:58:59.035454	2025-11-11 18:58:59.035454
99409a24-8734-4e08-b9d2-b16479ad8cb9	ENSINGER INDUSTRIA DE PLASTICOS TECNICOS	9010444	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010444	2025-11-11 18:58:59.063	2025-11-11 18:58:59.095109	2025-11-11 18:58:59.095109
9c0460c5-63b6-4f3c-9715-ba9cfa81c5e6	MARELLI COFAP DO BRASIL LTDA.	9010445	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010445	2025-11-11 18:58:59.122	2025-11-11 18:58:59.154488	2025-11-11 18:58:59.154488
df3d67ec-1e3d-4081-98c9-bb14090860a2	MARELLI COFAP DO BRASIL LTDA.	9010446	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010446	2025-11-11 18:58:59.182	2025-11-11 18:58:59.21403	2025-11-11 18:58:59.21403
838503dc-399a-4599-ac2e-6f06a254ce05	MHB MANGUEIRAS E CONEXOES LTDA	9010447	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010447	2025-11-11 18:58:59.242	2025-11-11 18:58:59.274294	2025-11-11 18:58:59.274294
3e64e3e2-f480-4bea-8791-5c0075e4e88a	LINKPLAS INDUSTRIA DE PLASTICOS LTDA	9010448	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010448	2025-11-11 18:58:59.302	2025-11-11 18:58:59.334107	2025-11-11 18:58:59.334107
5a1322b1-9388-4d77-bcc6-56965d4132c2	HANON SYSTEMS CLIMATIZACAO DO BRASIL IND	9010449	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010449	2025-11-11 18:58:59.361	2025-11-11 18:58:59.393604	2025-11-11 18:58:59.393604
429529c0-77b2-4745-befd-4e2258b96e7c	SMRC FABRICACAO E COMERCIO DE PRODUTOS A	9010450	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010450	2025-11-11 18:58:59.421	2025-11-11 18:58:59.453114	2025-11-11 18:58:59.453114
368014b3-dfe9-4c1b-a4cf-d5b953387c78	PICHININ INDUSTRIA E COMERCIO LTDA	9010451	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010451	2025-11-11 18:58:59.481	2025-11-11 18:58:59.512886	2025-11-11 18:58:59.512886
21d04894-3e2b-4028-82a4-2ae4f7c0010e	METALURGICA WELOZE LTDA	9010452	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010452	2025-11-11 18:58:59.54	2025-11-11 18:58:59.572389	2025-11-11 18:58:59.572389
1be3e73a-a321-4a1f-bb88-56e477e66d7f	LOG PRINT GRAFICA DADOS VARIAVEIS E L	9010453	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010453	2025-11-11 18:58:59.601	2025-11-11 18:58:59.633149	2025-11-11 18:58:59.633149
0f3ea55a-3773-455c-98c7-7e39bb4951b4	TENNECO INDUSTRIA DE AUTOPECAS LTDA	9010454	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010454	2025-11-11 18:58:59.66	2025-11-11 18:58:59.693118	2025-11-11 18:58:59.693118
c7aaf27d-ab73-41bb-b36c-c30c073e7dff	K.F. INDUSTRIA E COMERCIO DE PECAS EIREL	9010455	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010455	2025-11-11 18:58:59.72	2025-11-11 18:58:59.752606	2025-11-11 18:58:59.752606
a2d16ec9-5e6f-4f34-b3c2-e9e500d72fcd	CALDERMEC INDUSTRIA MECANICA EIRELI	9010456	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010456	2025-11-11 18:58:59.78	2025-11-11 18:58:59.812071	2025-11-11 18:58:59.812071
3ec5994c-ac20-4663-bd90-6eb4c6bee81e	OPUS CONSULTORIA LTDA	9010457	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010457	2025-11-11 18:58:59.839	2025-11-11 18:58:59.871792	2025-11-11 18:58:59.871792
de20fb32-0b2a-48a1-a844-a0f57eb04283	MULTIMATECH INDUSTRIA METALURGICA EIRELI	9010458	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010458	2025-11-11 18:58:59.899	2025-11-11 18:58:59.931126	2025-11-11 18:58:59.931126
e57325a5-d473-4e5f-bb37-8b9c2a061a02	DONALDSON DO BRASIL EQUIPAMENTOS INDUSTR	9010459	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010459	2025-11-11 18:58:59.958	2025-11-11 18:58:59.991533	2025-11-11 18:58:59.991533
710dd94d-1e39-4095-8aa1-64b466f8111f	TECUMSEH DO BRASIL LTDA	9010460	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010460	2025-11-11 18:59:00.019	2025-11-11 18:59:00.050911	2025-11-11 18:59:00.050911
6514957d-946f-4868-8319-669f2d36f5af	TOWER AUTOMOTIVE DO BRASIL LTDA.	9010461	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010461	2025-11-11 18:59:00.078	2025-11-11 18:59:00.110358	2025-11-11 18:59:00.110358
057d2914-388b-4141-8f03-54e670875361	JL CAPACITORES LTDA	9010462	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010462	2025-11-11 18:59:00.137	2025-11-11 18:59:00.169755	2025-11-11 18:59:00.169755
1c47aae2-5ada-4162-b8b8-865f9e40a62f	META GALVANIZACAO COMERCIO E INDUSTRIA E	9010463	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010463	2025-11-11 18:59:00.197	2025-11-11 18:59:00.228924	2025-11-11 18:59:00.228924
fea4f701-e7a6-46a4-b6fd-9dbb5578ece2	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010464	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010464	2025-11-11 18:59:00.256	2025-11-11 18:59:00.289124	2025-11-11 18:59:00.289124
c395b2da-9625-41df-99d1-3f4e4f6d183f	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010465	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010465	2025-11-11 18:59:00.316	2025-11-11 18:59:00.348265	2025-11-11 18:59:00.348265
6584c725-00a9-41cc-8ff9-302d1459a692	COMP - INDUSTRIA E COMERCIO DE METAIS LT	9010466	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010466	2025-11-11 18:59:00.378	2025-11-11 18:59:00.416457	2025-11-11 18:59:00.416457
e8f3e83e-7525-4378-beae-a0551763473d	HOBER BAHIA INDUSTRIA PLASTICA LTDA	9010467	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010467	2025-11-11 18:59:00.444	2025-11-11 18:59:00.475823	2025-11-11 18:59:00.475823
9cf69ab3-703f-485f-872a-9c9fedcf82a2	TECUMSEH DO BRASIL LTDA	9010468	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010468	2025-11-11 18:59:00.503	2025-11-11 18:59:00.535358	2025-11-11 18:59:00.535358
20067a69-efec-4c21-96ca-efb58de18b20	COPO INDUSTRIA DE POLIURETANO DO BRASIL	9010469	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010469	2025-11-11 18:59:00.562	2025-11-11 18:59:00.594625	2025-11-11 18:59:00.594625
30a08757-2492-4461-b83b-48aa521532ea	METALURGICA GOLIN SA	9010470	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010470	2025-11-11 18:59:00.622	2025-11-11 18:59:00.654148	2025-11-11 18:59:00.654148
1006d72c-d0f6-4268-b4e1-43c8dc2b64d2	TESCA TEXTIL COMPONENTES PARA ASSENTOS	9010471	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010471	2025-11-11 18:59:00.682	2025-11-11 18:59:00.71839	2025-11-11 18:59:00.71839
787b8fba-960c-4da1-a160-0e50bf91c2fb	REFAL INDUSTRIA E COMERCIO DE REBITES E	9010472	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010472	2025-11-11 18:59:00.746	2025-11-11 18:59:00.778062	2025-11-11 18:59:00.778062
2ce843e3-7bc6-4aa6-aa6e-6dee902b3f4e	PLANO INDUSTRIA E COMERCIO DE PLASTICOS	9010473	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010473	2025-11-11 18:59:00.805	2025-11-11 18:59:00.837752	2025-11-11 18:59:00.837752
510b8a96-92a0-4600-9b3b-72b8f2d6c1cd	CEZAN EMBALAGENS LTDA	9010474	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010474	2025-11-11 18:59:00.867	2025-11-11 18:59:00.89935	2025-11-11 18:59:00.89935
486dc9c5-451a-4175-9801-8766c5b03d02	MAFLOW DO BRASIL LTDA.	9010475	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010475	2025-11-11 18:59:00.941	2025-11-11 18:59:00.972647	2025-11-11 18:59:00.972647
77c1203a-4214-4e9d-aa74-2d990c368824	ARGENTAUREOS DOURACAO E PRATEACAO LTDA	9010476	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010476	2025-11-11 18:59:01.003	2025-11-11 18:59:01.035099	2025-11-11 18:59:01.035099
1641a373-53a9-4049-8893-2de6819c1a86	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010477	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010477	2025-11-11 18:59:01.062	2025-11-11 18:59:01.09458	2025-11-11 18:59:01.09458
54052c1c-01a9-4791-abd8-f4c0f8dc9f0b	FUNDICAO SIDERAL LTDA	9010478	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010478	2025-11-11 18:59:01.122	2025-11-11 18:59:01.153831	2025-11-11 18:59:01.153831
56754d78-de08-47ce-a464-392a6ab95a86	LEAS INDUSTRIAL LTDA	9010479	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010479	2025-11-11 18:59:01.181	2025-11-11 18:59:01.212996	2025-11-11 18:59:01.212996
c665de80-7093-4159-a80b-acff4528fb06	METAL ONE SHIBAURA BRASIL LTDA.	9010480	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010480	2025-11-11 18:59:01.241	2025-11-11 18:59:01.272769	2025-11-11 18:59:01.272769
cff90cef-0b74-4d41-8fb2-e2a062c06c32	PAINCO INDUSTRIA E COMERCIO SOCIEDADE AN	9010481	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010481	2025-11-11 18:59:01.3	2025-11-11 18:59:01.332368	2025-11-11 18:59:01.332368
46c97aab-7d26-47d2-b68f-bd06e4347d44	NIPRA TRATAMENTOS DE SUPERFICIE LTDA.	9010482	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010482	2025-11-11 18:59:01.36	2025-11-11 18:59:01.392475	2025-11-11 18:59:01.392475
4b7d7d5e-adeb-4dd3-928d-7d6eb528a900	TECPARTS DO BRASIL INDUSTRIA E COMERCIO	9010483	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010483	2025-11-11 18:59:01.42	2025-11-11 18:59:01.452056	2025-11-11 18:59:01.452056
d0ead9e4-d1b3-4e7b-9a9b-a425798b3cf4	BELLS INDUSTRIA E COMERCIO DE PLASTICOS	9010484	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010484	2025-11-11 18:59:01.479	2025-11-11 18:59:01.51154	2025-11-11 18:59:01.51154
c58959ec-55ac-4047-af41-8a7a48693992	WIPRO DO BRASIL INDUSTRIAL S.A.	9010485	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010485	2025-11-11 18:59:01.539	2025-11-11 18:59:01.570948	2025-11-11 18:59:01.570948
80c84f77-669f-4edf-8897-ee7363c2bc08	FANIA COMERCIO E INDUSTRIA DE PECAS LTDA	9010486	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010486	2025-11-11 18:59:01.598	2025-11-11 18:59:01.630449	2025-11-11 18:59:01.630449
77606d0a-92a9-4eab-9996-6f2acaf418b2	CARHEJ INDUSTRIA E COMERCIO DE PRODUTOS	9010487	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010487	2025-11-11 18:59:01.658	2025-11-11 18:59:01.690138	2025-11-11 18:59:01.690138
c12efdff-e31b-4388-b324-8f266eb76cfa	BLUFIX INDÃšSTRIA E COMÃ‰RCIO LTDA	9010488	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010488	2025-11-11 18:59:01.717	2025-11-11 18:59:01.749878	2025-11-11 18:59:01.749878
75596adf-dda3-4f17-95a7-75c5b50a638e	HENNINGS VEDACOES HIDRAULICAS LTDA	9010489	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010489	2025-11-11 18:59:01.777	2025-11-11 18:59:01.809385	2025-11-11 18:59:01.809385
b40404f2-3576-4dff-a835-95b0a977d999	VOLVO DO BRASIL VEICULOS LTDA	9010490	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010490	2025-11-11 18:59:01.837	2025-11-11 18:59:01.868849	2025-11-11 18:59:01.868849
6355e78c-f3fb-4ce2-8333-c08143847ab8	BUDAI INDUSTRIA METALURGICA LTDA	9010491	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010491	2025-11-11 18:59:01.896	2025-11-11 18:59:01.928652	2025-11-11 18:59:01.928652
e64621e9-38e6-41ee-98ab-11be801e177d	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010492	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010492	2025-11-11 18:59:01.956	2025-11-11 18:59:01.989146	2025-11-11 18:59:01.989146
81eda5cc-bdb0-4a8e-ab31-6b19c5663382	LINKPLAS INDUSTRIA DE PLASTICOS LTDA	9010493	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010493	2025-11-11 18:59:02.016	2025-11-11 18:59:02.048683	2025-11-11 18:59:02.048683
481f760a-4af2-4fa9-b396-e63643be70f7	SOLUCOES EM ACO USIMINAS S.A.	9010494	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010494	2025-11-11 18:59:02.076	2025-11-11 18:59:02.108214	2025-11-11 18:59:02.108214
a1a042ec-66af-4914-b5d0-0e8fd81076b9	INDUSTRIA METALURGICA LIPOS LTDA	9010495	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010495	2025-11-11 18:59:02.135	2025-11-11 18:59:02.167654	2025-11-11 18:59:02.167654
ecc4254b-5b9f-48f5-bc0b-5d5e9f6b1d6b	VEXILOM EMBLEMAS TECNICOS COMERCIAIS LTD	9010496	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010496	2025-11-11 18:59:02.195	2025-11-11 18:59:02.227311	2025-11-11 18:59:02.227311
58c66b0a-1c8e-4b02-bcc7-650940501086	J A STEFANINI EIRELI	9010497	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010497	2025-11-11 18:59:02.254	2025-11-11 18:59:02.286961	2025-11-11 18:59:02.286961
f79db8b7-3ed3-4cb3-accd-39672ff57642	STAMPLINE METAIS ESTAMPADOS LTDA	9010498	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010498	2025-11-11 18:59:02.314	2025-11-11 18:59:02.346457	2025-11-11 18:59:02.346457
e5341448-568b-4bff-8211-e82bcee795e2	BCS SOLUCOES EM INTERF AUTOM BRASIL LTDA	9010499	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010499	2025-11-11 18:59:02.374	2025-11-11 18:59:02.406236	2025-11-11 18:59:02.406236
307846b0-7a4f-4efd-8348-464942d108bb	SOLUZ INDUSTRIA E COMERCIO LTDA	9010500	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010500	2025-11-11 18:59:02.434	2025-11-11 18:59:02.465979	2025-11-11 18:59:02.465979
1051f2c2-9593-4fd9-a9c5-63141f924df9	FERROLENE SA INDUSTRIA E COMERCIO DE MET	9010501	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010501	2025-11-11 18:59:02.493	2025-11-11 18:59:02.525254	2025-11-11 18:59:02.525254
f0ef47ec-4b2f-4311-9927-ed95ee85f8c4	DENSO DO BRASIL LTDA	9010502	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010502	2025-11-11 18:59:02.552	2025-11-11 18:59:02.584669	2025-11-11 18:59:02.584669
168d165b-c112-4bab-b589-bcb465ed2247	NYLOK TECNOLOGIA EM FIXACAO LTDA	9010503	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010503	2025-11-11 18:59:02.612	2025-11-11 18:59:02.645169	2025-11-11 18:59:02.645169
ef58fd1c-64b0-4e75-8276-b3b27eaeabf4	CHRIS CINTOS DE SEGURANÃ‡A LTDA	9010504	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010504	2025-11-11 18:59:02.673	2025-11-11 18:59:02.705479	2025-11-11 18:59:02.705479
662b777c-100f-400b-a82c-743cbb47d1d9	LINKPLAS IND E COM DE PALSTICOS LTDA	9010505	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010505	2025-11-11 18:59:02.733	2025-11-11 18:59:02.764876	2025-11-11 18:59:02.764876
f58c2cde-1e5e-423c-897e-c81734b61e9c	PICHININ INDUSTRIA E COMERCIO LTDA	9010506	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010506	2025-11-11 18:59:02.792	2025-11-11 18:59:02.82511	2025-11-11 18:59:02.82511
a0355b00-2ba2-4956-b9be-f142d33dda3b	PARKER HANNIFIN IND E COM LTDA	9010507	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010507	2025-11-11 18:59:02.853	2025-11-11 18:59:02.884857	2025-11-11 18:59:02.884857
387752d0-1876-4b01-b4d7-cae1cfa7cf37	INDUSTRIA MECANICA PRIMAR LTDA	9010508	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010508	2025-11-11 18:59:02.912	2025-11-11 18:59:02.944626	2025-11-11 18:59:02.944626
bdf894d0-ae34-462f-b115-32f3d5316573	AMVIAN INDUSTRIA E COMERCIO DE PECAS AUT	9010509	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010509	2025-11-11 18:59:02.972	2025-11-11 18:59:03.004147	2025-11-11 18:59:03.004147
4bb1e701-2aa8-407b-a5d3-0024ab7025e5	THYSSENKRUPP DO BRASIL LTDA	9010510	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010510	2025-11-11 18:59:03.031	2025-11-11 18:59:03.063562	2025-11-11 18:59:03.063562
a5e8f3f9-4ac9-444a-9ccc-75b620266c62	DAYCO POWER TRANSMISSION LTDA	9010511	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010511	2025-11-11 18:59:03.091	2025-11-11 18:59:03.123001	2025-11-11 18:59:03.123001
c944d5bd-c9a5-4282-a7e6-161474ccdcb1	CINPAL COMPANHIA IND PECAS AUTOMOVEIS	9010512	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010512	2025-11-11 18:59:03.15	2025-11-11 18:59:03.182565	2025-11-11 18:59:03.182565
a5410763-4ec8-4583-a38c-a2216aae1e8e	TECNAUT INDUSTRIA E COMERCIO METAIS LTDA	9010513	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010513	2025-11-11 18:59:03.216	2025-11-11 18:59:03.248718	2025-11-11 18:59:03.248718
2f6d1176-499f-49e4-a729-c041b7c5e5a9	MOVENT AUTOMOTIVE IND E COM AUTOPECAS LT	9010514	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010514	2025-11-11 18:59:03.276	2025-11-11 18:59:03.308003	2025-11-11 18:59:03.308003
1a1d927b-f60c-4446-b24a-1c7898523c67	BIMARA IND E COM DE PRODUTOS PLASTICOS L	9010515	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010515	2025-11-11 18:59:03.335	2025-11-11 18:59:03.367649	2025-11-11 18:59:03.367649
f6c45c69-3591-4fd4-b5b9-1fdb6a6ef63d	JTEKT AUTOMOTIVA BRASIL LTDA	9010516	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010516	2025-11-11 18:59:03.395	2025-11-11 18:59:03.428345	2025-11-11 18:59:03.428345
ceff93a0-424d-4544-b0c9-bcad736aa669	INFERTEQ IND COMERCIO DE ETIQUETAS LTDA	9010517	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9010517	2025-11-11 18:59:03.456	2025-11-11 18:59:03.488235	2025-11-11 18:59:03.488235
4ec5a47d-7cf5-4a11-acfe-03cb35d10b10	TELOS CONSULTORIA EMPRESARIAL LTDA	9060001	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060001	2025-11-11 18:59:03.516	2025-11-11 18:59:03.548187	2025-11-11 18:59:03.548187
03ab8945-ab34-47e2-b2f8-3877d5415b77	VIBRAC SYSTEM S/A	9060002	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060002	2025-11-11 18:59:03.575	2025-11-11 18:59:03.607799	2025-11-11 18:59:03.607799
9d4273a8-f99a-4075-8b61-4d39b1eb6407	EDSCHA DO BRASIL LTDA	9060003	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060003	2025-11-11 18:59:03.635	2025-11-11 18:59:03.66734	2025-11-11 18:59:03.66734
f4094176-e176-45ea-8c38-b3d572b80c9a	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060004	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060004	2025-11-11 18:59:03.695	2025-11-11 18:59:03.727145	2025-11-11 18:59:03.727145
d4f2af2d-7f2a-4be5-9814-4502b6038086	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060005	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060005	2025-11-11 18:59:03.754	2025-11-11 18:59:03.786745	2025-11-11 18:59:03.786745
b0b11d9f-bdb0-4789-8be0-81e2f30e7b66	AKER SOLUTIONS DO BRASIL LTDA	9060006	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060006	2025-11-11 18:59:03.814	2025-11-11 18:59:03.84527	2025-11-11 18:59:03.84527
23df6072-fd64-40a8-8d6a-393307373e98	FIBRA COMERCIO E DISTRIBUICAO LTDA	9060008	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060008	2025-11-11 18:59:03.873	2025-11-11 18:59:03.905016	2025-11-11 18:59:03.905016
2e5a1a96-f3d4-4023-82a2-4266bb991d06	EMBRART IND DE EMBALAGEM E ARTEFATOS DE	9060009	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060009	2025-11-11 18:59:03.932	2025-11-11 18:59:03.964863	2025-11-11 18:59:03.964863
920d97b7-f8d9-42b1-a933-95eb85239a0c	EMBRART IND DE EMBALAGEM E ARTEFATOS DE	9060010	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060010	2025-11-11 18:59:03.992	2025-11-11 18:59:04.024094	2025-11-11 18:59:04.024094
d0bcff6c-46f7-4434-a98f-ef2abe9a4ea3	AKER SOLUTIONS DO BRASIL LTDA	9060011	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060011	2025-11-11 18:59:04.051	2025-11-11 18:59:04.083779	2025-11-11 18:59:04.083779
969770f8-8589-4bc7-945a-000e5a49d336	BELFIX IMPORTACAO LTDA	9060012	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060012	2025-11-11 18:59:04.112	2025-11-11 18:59:04.144381	2025-11-11 18:59:04.144381
4b9945c5-9591-4eb3-a2c4-6e444c9c2f15	PELZER DA BAHIA LTDA	9060013	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060013	2025-11-11 18:59:04.172	2025-11-11 18:59:04.204434	2025-11-11 18:59:04.204434
84e36dcf-ea75-4322-9fbc-d6ab4e9acd11	BIMARA INDUSTRIA E COMERCIO DE PRODUTOS	9060014	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060014	2025-11-11 18:59:04.231	2025-11-11 18:59:04.263812	2025-11-11 18:59:04.263812
417b5536-8070-483c-bf8b-d70c4196597a	LEYSIN MARKETING EIRELI	9060015	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060015	2025-11-11 18:59:04.291	2025-11-11 18:59:04.323296	2025-11-11 18:59:04.323296
5dac5959-099f-4512-806b-8e56146f07f2	COLORFIX ITAMASTER INDUSTRIA DE MASTERBA	9060016	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060016	2025-11-11 18:59:04.35	2025-11-11 18:59:04.383257	2025-11-11 18:59:04.383257
95e0bc05-9365-483d-a83d-b991fa2316b4	TECNOPLAST S.A - INDUSTRIA E COMERCIO DE	9060017	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060017	2025-11-11 18:59:04.41	2025-11-11 18:59:04.442371	2025-11-11 18:59:04.442371
c6fed41a-712d-4113-b15f-2fb9d43e6e18	LEYSIN MARKETING EIRELI	9060018	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060018	2025-11-11 18:59:04.469	2025-11-11 18:59:04.50153	2025-11-11 18:59:04.50153
ce5bfe00-c818-4d4a-9e3e-7018bfaa8c8e	BIMARA INDUSTRIA E COMERCIO DE PRODUTOS	9060019	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060019	2025-11-11 18:59:04.529	2025-11-11 18:59:04.560308	2025-11-11 18:59:04.560308
f8641adf-68c5-430a-a000-c4bc731c8a62	LECLAIR IND E COM PERF E COSM  LTDA	9060020	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060020	2025-11-11 18:59:04.588	2025-11-11 18:59:04.620264	2025-11-11 18:59:04.620264
deaa8a32-8343-41fe-be62-5a6edce60d18	COOPERATIVA CENTRAL AURORA ALIMENTOS	9060021	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060021	2025-11-11 18:59:04.647	2025-11-11 18:59:04.679823	2025-11-11 18:59:04.679823
bb8503b2-6517-4d70-af58-30252b3c615a	NELSON DO BRASIL P T E TUB DE EXAUS LTDA	9060022	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060022	2025-11-11 18:59:04.707	2025-11-11 18:59:04.7393	2025-11-11 18:59:04.7393
e946d5c0-0a09-4a05-a45c-3243b35f573b	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060023	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060023	2025-11-11 18:59:04.766	2025-11-11 18:59:04.798652	2025-11-11 18:59:04.798652
7d2ae9a0-80e3-414e-b73a-76c14eb22202	EMBALOG FABRICACAO EMBALAGENS LTDA	9060024	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9060024	2025-11-11 18:59:04.826	2025-11-11 18:59:04.858011	2025-11-11 18:59:04.858011
43962aae-3b59-4803-82d9-1a16a4f89004	SEVEN TERCEIRIZACAO DE MAO DE OBRA LTDA	9070001	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9070001	2025-11-11 18:59:04.885	2025-11-11 18:59:04.917562	2025-11-11 18:59:04.917562
c9bd58e8-9094-4628-95b6-d00571dbaae5	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9070002	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9070002	2025-11-11 18:59:04.945	2025-11-11 18:59:04.976432	2025-11-11 18:59:04.976432
0a9137d9-f9d4-463a-8899-b5b640e89b70	COSMA DO BRASIL PROD E SERV AUTOMOTIVOS	9070003	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9070003	2025-11-11 18:59:05.004	2025-11-11 18:59:05.03622	2025-11-11 18:59:05.03622
6553b72f-088b-4267-8dff-27aebf648953	DAX OIL REFINO SA	9070004	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	t	9070004	2025-11-11 18:59:05.065	2025-11-11 18:59:05.097275	2025-11-11 18:59:05.097275
5c196c3c-33fb-494b-a743-a2eeb84bc0e0	ADMINISTRATIVO	1	8380284d-034b-4bca-b059-05f5bf700f72	\N	\N	t	1	2025-11-11 18:59:05.125	2025-11-11 18:59:05.156976	2025-11-11 18:59:05.156976
111abf29-2380-43c8-9961-34e95cc9f03c	OPERACOES	2	8380284d-034b-4bca-b059-05f5bf700f72	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	2	2025-11-11 18:59:05.184	2025-11-11 18:59:05.216596	2025-11-11 18:59:05.216596
42d5c7b4-3353-481d-9b08-d78856ef4621	MATRIZ	100	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	100	2025-11-11 18:59:05.244	2025-11-11 18:59:05.276399	2025-11-11 18:59:05.276399
d0835e44-6f8e-4374-828e-3cfb29d7b8e7	PIC	101	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	101	2025-11-11 18:59:05.304	2025-11-11 18:59:05.335828	2025-11-11 18:59:05.335828
6fc58233-a083-4089-8cd4-716889c09b4c	CONTRATOS PIC	102	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	102	2025-11-11 18:59:05.363	2025-11-11 18:59:05.395704	2025-11-11 18:59:05.395704
02193f4a-f16a-4650-8cd9-c09eb7b3015d	RENAULT CVU	103	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	103	2025-11-11 18:59:05.423	2025-11-11 18:59:05.455119	2025-11-11 18:59:05.455119
27348ab4-b789-492a-8203-5fe5736af6f4	RENAULT CVP	104	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	104	2025-11-11 18:59:05.482	2025-11-11 18:59:05.514725	2025-11-11 18:59:05.514725
eadc3c16-cdd3-4d78-b1cb-aaacb422a12d	RENAULT PDI	105	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	105	2025-11-11 18:59:05.544	2025-11-11 18:59:05.576019	2025-11-11 18:59:05.576019
13a54066-96c3-43bb-aa8f-c21580dee199	RENAULT POSTO	106	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	106	2025-11-11 18:59:05.603	2025-11-11 18:59:05.635499	2025-11-11 18:59:05.635499
7375f72d-1f3b-4fa6-b494-ac162c49bea2	RENAULT PEGUFORM	107	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	107	2025-11-11 18:59:05.663	2025-11-11 18:59:05.694724	2025-11-11 18:59:05.694724
2625a7bc-2ca9-44c1-8b39-c8d104043bb0	EXTERNOS	108	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	108	2025-11-11 18:59:05.722	2025-11-11 18:59:05.753976	2025-11-11 18:59:05.753976
e06bbacb-ebcd-46f9-b98a-13e66aefc401	AKER	109	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	109	2025-11-11 18:59:05.781	2025-11-11 18:59:05.813413	2025-11-11 18:59:05.813413
c3a887f6-888d-49ec-9c66-0adc5644efff	ALSTOM	110	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	110	2025-11-11 18:59:05.841	2025-11-11 18:59:05.873144	2025-11-11 18:59:05.873144
7ea67b44-6efa-4aca-a5f6-ec3f05f5f6f9	CONTINENTAL	111	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	111	2025-11-11 18:59:05.9	2025-11-11 18:59:05.932803	2025-11-11 18:59:05.932803
7d45c023-ad9c-4c60-9231-e0f4ae23ccba	FRANGO BAHIA	112	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	112	2025-11-11 18:59:05.96	2025-11-11 18:59:05.991181	2025-11-11 18:59:05.991181
0db66897-c8db-496c-9215-a6306ce671ed	ACOES EXPORADICAS	113	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	113	2025-11-11 18:59:06.018	2025-11-11 18:59:06.050786	2025-11-11 18:59:06.050786
606f6410-8209-4138-9d8c-90fd170603d0	BOSCH	115	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	115	2025-11-11 18:59:06.137	2025-11-11 18:59:06.169497	2025-11-11 18:59:06.169497
f31b5f19-01e4-4556-8f9e-7603b0825d5a	VW CURITIBA	116	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	116	2025-11-11 18:59:06.197	2025-11-11 18:59:06.229167	2025-11-11 18:59:06.229167
186a330e-e159-4372-87bd-ea0b925e2503	FORD SBC	117	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	117	2025-11-11 18:59:06.256	2025-11-11 18:59:06.288523	2025-11-11 18:59:06.288523
c9ce03bb-3c95-4cae-b0ba-324c0f722cbb	FORD TAUBATE	118	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	118	2025-11-11 18:59:06.316	2025-11-11 18:59:06.34798	2025-11-11 18:59:06.34798
68f5381f-02ca-43b3-a850-b89638fd6dad	SMP	119	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	119	2025-11-11 18:59:06.375	2025-11-11 18:59:06.407575	2025-11-11 18:59:06.407575
fd0597df-1b8a-4df7-9fd6-89dbb09b0807	FORMTAP	120	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	120	2025-11-11 18:59:06.435	2025-11-11 18:59:06.466941	2025-11-11 18:59:06.466941
323a5fad-92a3-4f04-955b-20f456a44bba	METAGAL	121	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	121	2025-11-11 18:59:06.494	2025-11-11 18:59:06.526355	2025-11-11 18:59:06.526355
dbc9795d-8636-494a-a63e-2512fa44559d	PILKINGTON	122	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	\N	\N	t	122	2025-11-11 18:59:06.553	2025-11-11 18:59:06.585648	2025-11-11 18:59:06.585648
47af09f3-0ef5-42a7-842f-723075dcb21d	ADMINISTRATIVO	1	c9c914c1-7dd9-4878-93c8-5fa4fd3f05ed	\N	\N	t	1	2025-11-11 18:59:06.613	2025-11-11 18:59:06.676033	2025-11-11 18:59:06.676033
5e9cd952-5ad7-40a8-81a3-aaff79f74232	OPERACOES	2	c9c914c1-7dd9-4878-93c8-5fa4fd3f05ed	\N	\N	t	2	2025-11-11 18:59:06.706	2025-11-11 18:59:06.738663	2025-11-11 18:59:06.738663
ff16cfaa-a1bf-4247-8fbd-eecedd8d2d08	ADMINISTRATIVO	1	920badc4-8144-4940-8c33-2196116941a9	\N	\N	t	1	2025-11-11 18:59:06.771	2025-11-11 18:59:06.804057	2025-11-11 18:59:06.804057
536032ee-e237-4560-9736-45b5cf0d10ec	OPERACOES	2	920badc4-8144-4940-8c33-2196116941a9	\N	\N	t	2	2025-11-11 18:59:06.834	2025-11-11 18:59:06.866856	2025-11-11 18:59:06.866856
f984a589-993a-4ac8-9fa3-38787f3b5352	VIBRAC	1	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	1	2025-11-11 18:59:06.906	2025-11-11 18:59:06.938199	2025-11-11 18:59:06.938199
d0615bc7-2b33-44f1-8113-013ac222ecf4	BELFIX TEMPORARIOS	10	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	10	2025-11-11 18:59:06.966	2025-11-11 18:59:06.998726	2025-11-11 18:59:06.998726
b0fa37dd-4649-4056-9cce-a38c082f5914	PELZER DIAS D AVILA TEMPORARIOS	11	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	11	2025-11-11 18:59:07.025	2025-11-11 18:59:07.057658	2025-11-11 18:59:07.057658
a12b5cdc-2f74-4159-9615-9c8dd6240725	LEYSIN TEMPORARIOS	12	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	12	2025-11-11 18:59:07.084	2025-11-11 18:59:07.116547	2025-11-11 18:59:07.116547
5db39884-d86d-4738-b037-c309cdffa4c1	BIMARA TEMPORARIOS	13	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	13	2025-11-11 18:59:07.143	2025-11-11 18:59:07.175464	2025-11-11 18:59:07.175464
a48cb4ed-0324-47b2-8211-8ce599e9e4e7	COLORFIX TEMPORARIOS	14	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	14	2025-11-11 18:59:07.206	2025-11-11 18:59:07.238638	2025-11-11 18:59:07.238638
76a858e8-06cb-4667-840c-1b2a2106a619	TECNOPLAST TEMPORARIOS	15	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	15	2025-11-11 18:59:07.266	2025-11-11 18:59:07.2979	2025-11-11 18:59:07.2979
b9bfa881-7e3b-48ca-b14f-3eb605a97f7f	MAGNA SJP TEMPORARIOS	16	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	16	2025-11-11 18:59:07.326	2025-11-11 18:59:07.357891	2025-11-11 18:59:07.357891
31da8fda-9e31-43fe-bd4e-9337b29bd60d	LECLAIR BAURU TEMPORARIOS	17	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	17	2025-11-11 18:59:07.385	2025-11-11 18:59:07.417039	2025-11-11 18:59:07.417039
5b0fbefe-56cf-446e-a45b-f1e2955a04cc	MAGNA DIARISTAS	18	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	18	2025-11-11 18:59:07.444	2025-11-11 18:59:07.475068	2025-11-11 18:59:07.475068
e8fe8604-c0bd-4759-b8ce-112c770a7cd4	AURORA TEMPORARIOS	19	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	19	2025-11-11 18:59:07.502	2025-11-11 18:59:07.533896	2025-11-11 18:59:07.533896
c800c904-6887-481a-bc1a-844176d7b7f5	CISA QUALIDADE	199	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	199	2025-11-11 18:59:07.561	2025-11-11 18:59:07.592679	2025-11-11 18:59:07.592679
c2bfe086-1801-4738-a606-370a7f79e9b0	EDSCHA INATIVO	2	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	2	2025-11-11 18:59:07.619	2025-11-11 18:59:07.651609	2025-11-11 18:59:07.651609
8392e7a6-9353-42ce-8b1f-7531fc61941d	NELSON TEMPORARIOS	20	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	20	2025-11-11 18:59:07.678	2025-11-11 18:59:07.71053	2025-11-11 18:59:07.71053
063951db-b62c-4e49-bc93-a5390a55ed24	EMBALOG TEMPORARIOS	21	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	21	2025-11-11 18:59:07.738	2025-11-11 18:59:07.770162	2025-11-11 18:59:07.770162
683a0695-56ca-49ef-a4bf-dfd8183a5679	MAO COLORIDA TEMPORARIOS	22	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	22	2025-11-11 18:59:07.797	2025-11-11 18:59:07.829278	2025-11-11 18:59:07.829278
dc43a516-6da3-4182-8f38-73c9a749a6c8	SUPERFRIO TEMPORARIOS	23	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	23	2025-11-11 18:59:07.857	2025-11-11 18:59:07.889051	2025-11-11 18:59:07.889051
195fa0b5-1f40-4b2a-9077-e22e7304469b	METAGAL TEMPORARIOS	24	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	24	2025-11-11 18:59:07.916	2025-11-11 18:59:07.948112	2025-11-11 18:59:07.948112
97f98690-ba61-493f-8c43-be29acdca14f	REALFIX	25	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	25	2025-11-11 18:59:07.975	2025-11-11 18:59:08.006953	2025-11-11 18:59:08.006953
4d0dc8a5-a991-4acd-9d07-1eed98d2ee99	SAVANA COMERCIO DE VEICULOS LTDA	26	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	26	2025-11-11 18:59:08.034	2025-11-11 18:59:08.066141	2025-11-11 18:59:08.066141
71bd5672-eb19-4fe6-bf70-4abc59cda452	SUPERFRIO SJP TEMPORARIOS	27	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	27	2025-11-11 18:59:08.093	2025-11-11 18:59:08.124065	2025-11-11 18:59:08.124065
2d4da2c5-2498-4a71-adca-a43309b3ae82	SUPERFRIO CUIABA TEMPORARIOS	28	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	28	2025-11-11 18:59:08.151	2025-11-11 18:59:08.182988	2025-11-11 18:59:08.182988
2142e6a9-aafc-4d83-a82b-fe17bbddf4f4	SUPERFRIO MANAUS TEMPORARIOS	29	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	29	2025-11-11 18:59:08.21	2025-11-11 18:59:08.242111	2025-11-11 18:59:08.242111
2b437c22-bdb6-4266-aa40-1a47f3d290c1	MAGNA SAP METROLOGIA	3	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	3	2025-11-11 18:59:08.269	2025-11-11 18:59:08.300147	2025-11-11 18:59:08.300147
6c14e3ee-7b12-4f2c-9dfd-d424ad42c613	AFASTADOS	30	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	30	2025-11-11 18:59:08.327	2025-11-11 18:59:08.359459	2025-11-11 18:59:08.359459
d550c483-6557-4534-b059-693ab654d6c9	ONESUBSEA TEMPORARIO RJ	31	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	31	2025-11-11 18:59:08.387	2025-11-11 18:59:08.419078	2025-11-11 18:59:08.419078
5d626568-9180-4fd5-b4af-202d1a3c06ba	SUPERFRIO GARUVA TEMPORARIOS	33	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	33	2025-11-11 18:59:08.446	2025-11-11 18:59:08.477954	2025-11-11 18:59:08.477954
69c6f3e7-f884-4bfc-8783-1496568e02b4	MED ME TEMPORARIOS	34	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	34	2025-11-11 18:59:08.505	2025-11-11 18:59:08.537058	2025-11-11 18:59:08.537058
d2aa8f7a-e388-47ea-93a8-e6840eb2ecc6	KAPAZI TEMPORARIOS	35	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	35	2025-11-11 18:59:08.564	2025-11-11 18:59:08.595906	2025-11-11 18:59:08.595906
6dda9cbe-d3fa-435e-974f-1b69aeec0d44	METAGAL CONCEICAO DOS OUROS	36	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	36	2025-11-11 18:59:08.623	2025-11-11 18:59:08.654881	2025-11-11 18:59:08.654881
343ee62c-e67a-468d-8645-29aa329d8873	UPNUTRI	37	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	37	2025-11-11 18:59:08.682	2025-11-11 18:59:08.713934	2025-11-11 18:59:08.713934
92b69d37-c87e-4d29-82a9-6ecba0497d16	SUPERFRIO SIMOES FILHO TEMPORARIOS	38	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	38	2025-11-11 18:59:08.741	2025-11-11 18:59:08.77311	2025-11-11 18:59:08.77311
456251bf-dab5-421b-82af-0accb83b3834	MARTIACO TEMPORARIOS	39	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	39	2025-11-11 18:59:08.8	2025-11-11 18:59:08.832377	2025-11-11 18:59:08.832377
87cd0726-2173-43df-88d6-83332b895763	MAGNA PR METROLOGIA	4	673a19aa-72e2-49ba-b7d4-ca194933547c	6a52b2fc-1ec7-41e6-a156-91cbfd9e69de	\N	t	4	2025-11-11 18:59:08.859	2025-11-11 18:59:08.891502	2025-11-11 18:59:08.891502
1ead55e8-2984-4ff7-bd09-fd069f407655	SUPERFRIO BENEVIDES TEMPORARIOS	40	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	40	2025-11-11 18:59:08.918	2025-11-11 18:59:08.950451	2025-11-11 18:59:08.950451
88e7f62a-39d9-48d3-9506-a4a07dd6e687	SUPERFRIO OSASCO	41	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	41	2025-11-11 18:59:08.977	2025-11-11 18:59:09.009628	2025-11-11 18:59:09.009628
303a9f98-b798-43cc-bf77-0b4b0946808e	ATILATTE TEMPORARIOS	42	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	42	2025-11-11 18:59:09.036	2025-11-11 18:59:09.068743	2025-11-11 18:59:09.068743
70e6d793-9843-40f4-8484-3dfa52dbd227	AAM QUALIDADE	420193	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	420193	2025-11-11 18:59:09.096	2025-11-11 18:59:09.12767	2025-11-11 18:59:09.12767
9c716cea-4e11-4788-ae46-a5af5ca173c6	AKER PR TEMPORARIOS	5	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	5	2025-11-11 18:59:09.155	2025-11-11 18:59:09.187132	2025-11-11 18:59:09.187132
99a617bb-a71a-4f46-8283-a0d62e94e50a	MAGNA PR TEMPORARIOS	6	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	6	2025-11-11 18:59:09.214	2025-11-11 18:59:09.246837	2025-11-11 18:59:09.246837
64ee5aba-2f55-48cb-bdb6-9b70ed9087b3	COMOLATTI (BELÉM) - TEMPORÁRIOS	610002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	610002	2025-11-11 18:59:09.274	2025-11-11 18:59:09.305606	2025-11-11 18:59:09.305606
2082f98a-b565-480a-bc4f-27e1226f66b1	COMOLATTI (BELÉM)/GUANABARA - TEMPORÁRIOS	610003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	610003	2025-11-11 18:59:09.333	2025-11-11 18:59:09.365113	2025-11-11 18:59:09.365113
4a36f652-751e-411c-8401-bc222d542016	AVON SIMOES FILHO TEMPORARIOS	610039	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	610039	2025-11-11 18:59:09.392	2025-11-11 18:59:09.424023	2025-11-11 18:59:09.424023
7e9d8d33-8e62-480b-83b9-e1035291d444	AUSTRAL TEMPORARIOS	610040	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	610040	2025-11-11 18:59:09.451	2025-11-11 18:59:09.482984	2025-11-11 18:59:09.482984
830dc9d4-bcf8-4062-923b-5305656f60ab	PELZER JOAO PESSOA TEMPORARIOS	611001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	611001	2025-11-11 18:59:09.51	2025-11-11 18:59:09.541061	2025-11-11 18:59:09.541061
45f06928-ad87-40dc-8a27-d583d0f453a8	KAPAZI MACEIO TEMPORARIOS	612001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	612001	2025-11-11 18:59:09.568	2025-11-11 18:59:09.600071	2025-11-11 18:59:09.600071
a1f2079f-adb1-4441-be44-7d5984be8853	LOCALIZA PORTO ALEGRE TEMPORARIOS	613001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	613001	2025-11-11 18:59:09.627	2025-11-11 18:59:09.65892	2025-11-11 18:59:09.65892
f5f2e378-ee74-413f-bfb1-e2be50224908	SUPERFRIO SANTA RITA 	613002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	613002	2025-11-11 18:59:09.686	2025-11-11 18:59:09.717799	2025-11-11 18:59:09.717799
242858d2-0ce2-47c4-8666-50113dda94ba	MATRIZ TELOS	620001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620001	2025-11-11 18:59:09.745	2025-11-11 18:59:09.776551	2025-11-11 18:59:09.776551
c3f9f616-9a74-4a36-84cd-9fc76dcae9ce	COMOLATTI (BLUMENAU) - TEMPORÁRIOS	620003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620003	2025-11-11 18:59:09.804	2025-11-11 18:59:09.83573	2025-11-11 18:59:09.83573
2c291831-d770-4424-bbb0-b96831c76b3e	COMOLATTI (CURITIBA) - TEMPORÁRIOS	620004	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620004	2025-11-11 18:59:09.863	2025-11-11 18:59:09.895339	2025-11-11 18:59:09.895339
9a124db3-d4bc-455a-935c-7d3540b55b33	COMOLATTI (PORTO ALEGRE) - TEMPORÁRIOS	620011	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620011	2025-11-11 18:59:09.922	2025-11-11 18:59:09.954461	2025-11-11 18:59:09.954461
0b4a004c-d529-4784-8c5d-47853fa01654	COMOLATTI (LONDRINA) - TEMPORÁRIOS	620014	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620014	2025-11-11 18:59:09.981	2025-11-11 18:59:10.013625	2025-11-11 18:59:10.013625
4a3a7895-f668-4279-a5ab-111218b61e48	COMOLATTI (CHAPECÓ) - TEMPORÁRIOS	620015	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620015	2025-11-11 18:59:10.04	2025-11-11 18:59:10.072553	2025-11-11 18:59:10.072553
9154e0a1-af1b-457f-9f7f-3c618c74a266	COMOLATTI (CURITIBA)/JARDIM BOTÂNICO - TEMPORÁRIOS	620016	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620016	2025-11-11 18:59:10.1	2025-11-11 18:59:10.131861	2025-11-11 18:59:10.131861
5918496d-5d10-4b75-974d-7d45e964260a	BOAS VENDAS TEMPORARIOS	620017	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620017	2025-11-11 18:59:10.159	2025-11-11 18:59:10.190693	2025-11-11 18:59:10.190693
1e3f5ed7-991a-4440-8eed-6f14909446c0	MERCADO LIVRE LONDRINA TEMPORARIOS	620021	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620021	2025-11-11 18:59:10.217	2025-11-11 18:59:10.249597	2025-11-11 18:59:10.249597
0281ba86-0f63-438c-a0ad-f86f75b57b5f	FEMSA SC BLUMENAU TEMPORARIOS	620023	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620023	2025-11-11 18:59:10.276	2025-11-11 18:59:10.308758	2025-11-11 18:59:10.308758
1cef2cb5-338e-4001-862a-140ca8029178	FEMSA SC JOINVILLE TEMPORARIOS	620024	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620024	2025-11-11 18:59:10.336	2025-11-11 18:59:10.368421	2025-11-11 18:59:10.368421
347fc0fc-a381-4e48-85df-adb80e99ad23	FEMSA SC TUBARÃO TEMPORARIOS	620025	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620025	2025-11-11 18:59:10.395	2025-11-11 18:59:10.427517	2025-11-11 18:59:10.427517
bb57a486-0cf3-4e8a-aab2-f63f92cf536b	AGROARACA TEMPORARIOS	620028	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620028	2025-11-11 18:59:10.454	2025-11-11 18:59:10.486773	2025-11-11 18:59:10.486773
784a1662-6464-4168-b26a-924002727836	BRF VIDEIRA – SC TEMPORARIOS	620029	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620029	2025-11-11 18:59:10.514	2025-11-11 18:59:10.545987	2025-11-11 18:59:10.545987
eccf237a-c147-44e9-a5a7-9d2062f8bc45	LEVO ALIMENTOS TEMPORARIOS	620030	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620030	2025-11-11 18:59:10.573	2025-11-11 18:59:10.604873	2025-11-11 18:59:10.604873
a44e5a58-bdb0-4dd6-9aaf-555cb0443ad9	TURIM TEMPORARIOS	620031	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620031	2025-11-11 18:59:10.632	2025-11-11 18:59:10.66414	2025-11-11 18:59:10.66414
58b8ed79-0d4e-4749-ad9b-bae645058c6f	BRF ITAJAI TEMPORARIOS	620032	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620032	2025-11-11 18:59:10.691	2025-11-11 18:59:10.723166	2025-11-11 18:59:10.723166
db2c438f-6b7a-42e4-bd9d-a3bac874a4e8	FEMSA PLANTA ANTONIO CARLOS TEMPORARIOS	620033	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620033	2025-11-11 18:59:10.75	2025-11-11 18:59:10.782102	2025-11-11 18:59:10.782102
32188cc4-47c7-47fb-abe5-cb04801e853e	FEMSA ARAUCARIA TEMPORARIOS	620036	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620036	2025-11-11 18:59:10.809	2025-11-11 18:59:10.840898	2025-11-11 18:59:10.840898
11367b7f-458e-40b0-a630-301accf7758b	FEMSA CURITIBA TEMPORARIOS	620039	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620039	2025-11-11 18:59:10.868	2025-11-11 18:59:10.900625	2025-11-11 18:59:10.900625
e9907bdd-94d0-4e03-ab89-341b77c362e7	FEMSA PLANTA CURITIBA TEMPORARIOS	620040	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620040	2025-11-11 18:59:10.927	2025-11-11 18:59:10.959692	2025-11-11 18:59:10.959692
ab6fd5e6-c87c-4123-927c-c3d843f0efc4	FEMSA BALNEARIO CAMBORIU TEMPORARIOS	620041	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620041	2025-11-11 18:59:10.987	2025-11-11 18:59:11.018691	2025-11-11 18:59:11.018691
57f53a33-6f8a-4662-8a14-d6b747491c74	FEMSA CHAPECO TEMPORARIOS	620042	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620042	2025-11-11 18:59:11.046	2025-11-11 18:59:11.078017	2025-11-11 18:59:11.078017
30811595-da2d-492d-ab11-509453d14cc3	COMERCIAL BOCCHI TEMPORARIOS	620044	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620044	2025-11-11 18:59:11.105	2025-11-11 18:59:11.137128	2025-11-11 18:59:11.137128
8a08bc4d-d8d8-4828-bf94-b3a763473721	LECLAIR TEMPORARIOS	620045	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620045	2025-11-11 18:59:11.164	2025-11-11 18:59:11.196381	2025-11-11 18:59:11.196381
3b6fe4a2-bf31-46c6-899a-7c255dab43c4	CONTITECH PG TEMPORARIOS	620046	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620046	2025-11-11 18:59:11.223	2025-11-11 18:59:11.255721	2025-11-11 18:59:11.255721
52ef435b-140b-443c-91d1-5f259ccc515e	CSI JOINVILLE TEMPORARIOS	620047	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620047	2025-11-11 18:59:11.283	2025-11-11 18:59:11.315042	2025-11-11 18:59:11.315042
a40cd291-d550-4e90-8eab-8a4ff2c3c8fa	PORTO SEGURO TEMPORARIOS	620048	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620048	2025-11-11 18:59:11.342	2025-11-11 18:59:11.374055	2025-11-11 18:59:11.374055
28adf980-8aba-420a-b1a9-61e9980c7078	PSCA SJP TEMPORARIOS	620049	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620049	2025-11-11 18:59:11.401	2025-11-11 18:59:11.432153	2025-11-11 18:59:11.432153
ba2929ae-2845-4a82-9f3f-1311afc28d61	RECON ELETRO TEMPORARIOS	620050	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620050	2025-11-11 18:59:11.459	2025-11-11 18:59:11.491287	2025-11-11 18:59:11.491287
94da031b-a54a-4f4a-bccc-a174e64a665a	LECLAIR TEMPORARIOS MATRIZ	620051	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620051	2025-11-11 18:59:11.518	2025-11-11 18:59:11.550069	2025-11-11 18:59:11.550069
ea588d6e-d9f7-446a-9f85-5726a296a2a7	ARTHA TEMPORARIOS	620052	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620052	2025-11-11 18:59:11.577	2025-11-11 18:59:11.609441	2025-11-11 18:59:11.609441
68629fb3-99b9-44a6-b321-fea43e027b5b	COMERCIAL BOCCHI FILIAL                  	620054	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620054	2025-11-11 18:59:11.636	2025-11-11 18:59:11.668414	2025-11-11 18:59:11.668414
d773d4e0-e536-4e5c-be3c-18a75f346997	CRV INDUSTRIAL 	620055	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620055	2025-11-11 18:59:11.695	2025-11-11 18:59:11.727288	2025-11-11 18:59:11.727288
31e3de28-2e1f-46c5-9a0f-bd89bfebec8c	AEROFLEX	620056	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620056	2025-11-11 18:59:11.754	2025-11-11 18:59:11.786344	2025-11-11 18:59:11.786344
1967e638-a092-4dc0-afdf-673c28694bb0	FEMSA TEMPORARIOS PORTO ALEGRE	620057	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620057	2025-11-11 18:59:11.813	2025-11-11 18:59:11.845237	2025-11-11 18:59:11.845237
d5bc7d4b-1501-490d-aa7c-c11476521712	LEGU TECNOLOGIA TEMPORARIOS	620058	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620058	2025-11-11 18:59:11.872	2025-11-11 18:59:11.90418	2025-11-11 18:59:11.90418
de1570db-14b4-46d2-9ee0-156669cdee89	JOAOMED TEMPORARIOS	620059	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620059	2025-11-11 18:59:11.931	2025-11-11 18:59:11.963638	2025-11-11 18:59:11.963638
b4616879-b5e4-41f2-9bdc-0a095c1ea1fa	METHAL COMPANY TEMPORARIOS	620060	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620060	2025-11-11 18:59:11.991	2025-11-11 18:59:12.022342	2025-11-11 18:59:12.022342
f0c302db-d660-453f-9d18-6531a9bb8e4d	MERCADO LIVRE CASCAVEL	620061	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620061	2025-11-11 18:59:12.049	2025-11-11 18:59:12.081428	2025-11-11 18:59:12.081428
d32846a9-c718-4816-a929-4a56ec0aadf4	PELZER GRAVATAI TEMPORARIOS	620062	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620062	2025-11-11 18:59:12.108	2025-11-11 18:59:12.140593	2025-11-11 18:59:12.140593
baf21405-5155-41d5-b747-08292ba36334	ROGGA TEMPORARIOS	620063	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620063	2025-11-11 18:59:12.167	2025-11-11 18:59:12.19934	2025-11-11 18:59:12.19934
8817176d-c208-4d58-9d62-451d02a4b385	MERCADO LIVRE CHAPECO	620064	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620064	2025-11-11 18:59:12.226	2025-11-11 18:59:12.258334	2025-11-11 18:59:12.258334
43d059b9-605c-4d7a-b919-b450e5873112	FEMSA TEMPORARIOS GUARAPUAVA	620065	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620065	2025-11-11 18:59:12.285	2025-11-11 18:59:12.317454	2025-11-11 18:59:12.317454
b62029d7-9a61-4ec0-9358-4237c8f66cba	CR BLUECAST	620066	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620066	2025-11-11 18:59:12.344	2025-11-11 18:59:12.376579	2025-11-11 18:59:12.376579
ed339487-dbdf-4286-bffe-661dbaa86e54	MERCADO LIVRE SAPUCAIA DO SUL	620067	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620067	2025-11-11 18:59:12.404	2025-11-11 18:59:12.436703	2025-11-11 18:59:12.436703
568789d5-5135-4d8d-89c9-b3de1d24f52e	FEMSA PONTA GROSSA	620068	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620068	2025-11-11 18:59:12.464	2025-11-11 18:59:12.496114	2025-11-11 18:59:12.496114
bd8f412b-ff19-4d7e-b9b1-6f8ea4c1b0e7	MERCADO LIVRE CAXIAS DO SUL	620069	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620069	2025-11-11 18:59:12.523	2025-11-11 18:59:12.555468	2025-11-11 18:59:12.555468
e750ded1-ffc5-48ed-9717-3d1a1ed97d18	FEMSA SANTO ANGELO TEMPORARIOS	620070	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620070	2025-11-11 18:59:12.582	2025-11-11 18:59:12.614568	2025-11-11 18:59:12.614568
a5483c8c-6db5-4edf-ae3d-a9183c9d6b9d	MAXO TEMPORARIOS	620071	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620071	2025-11-11 18:59:12.641	2025-11-11 18:59:12.673632	2025-11-11 18:59:12.673632
b376000b-9b4b-402b-836b-7f3cb45899fa	FEMSA SANTA MARIA TEMPORARIOS	620073	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620073	2025-11-11 18:59:12.701	2025-11-11 18:59:12.732658	2025-11-11 18:59:12.732658
7c066643-a537-4096-9278-f5c961d60b4c	FEMSA CAMBE TEMPORARIOS	620074	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620074	2025-11-11 18:59:12.759	2025-11-11 18:59:12.791602	2025-11-11 18:59:12.791602
c875f1e0-ce19-4b46-8df1-e1b7c7bbb70f	FEMSA FARROUPILHA TEMPORARIOS	620075	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620075	2025-11-11 18:59:12.819	2025-11-11 18:59:12.851001	2025-11-11 18:59:12.851001
2c5dfd71-7a0e-4ec6-82a4-a03e57a3f3b8	FEMSA MARINGA TEMPORARIOS	620076	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620076	2025-11-11 18:59:12.878	2025-11-11 18:59:12.909811	2025-11-11 18:59:12.909811
930bdf77-53a6-4698-beac-4f458f47125a	MERCADO LIVRE PORTO ALEGRE TEMPORARIOS	620077	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620077	2025-11-11 18:59:12.937	2025-11-11 18:59:12.968714	2025-11-11 18:59:12.968714
60622752-d827-439a-91ee-cd5cc549d8cb	FEMSA PLANTA SANTA MARIA TEMPORARIOS	620079	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620079	2025-11-11 18:59:12.996	2025-11-11 18:59:13.028167	2025-11-11 18:59:13.028167
50f7cfb8-fb31-44ef-acff-62d0090ace4c	MERCADO LIVRE MARINGA TEMPORARIOS	620080	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620080	2025-11-11 18:59:13.055	2025-11-11 18:59:13.087479	2025-11-11 18:59:13.087479
77192cef-6a55-4b0a-88a1-beb39a3e5186	MERCADO LIVRE PASSO FUNDO TEMPORARIOS	620081	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620081	2025-11-11 18:59:13.114	2025-11-11 18:59:13.146637	2025-11-11 18:59:13.146637
973bfc1a-f4e5-434d-9a68-93241a2f2f30	MERCADO LIVRE PELOTAS TEMPORARIOS	620082	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620082	2025-11-11 18:59:13.173	2025-11-11 18:59:13.205469	2025-11-11 18:59:13.205469
388b75d3-51cb-4032-b56a-efb41d350e3a	BRF PTG TEMPORARIOS	620083	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620083	2025-11-11 18:59:13.232	2025-11-11 18:59:13.264596	2025-11-11 18:59:13.264596
85d21e33-5188-4e23-8b12-ef3a6bd93bd3	METALURGICA EXPOENTE TEMPORARIOS	620084	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620084	2025-11-11 18:59:13.291	2025-11-11 18:59:13.323751	2025-11-11 18:59:13.323751
15faf615-0175-4b59-9445-5a77b0f6165f	MERCADO LIVRE SANTA MARIA TEMPORARIOS	620085	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620085	2025-11-11 18:59:13.35	2025-11-11 18:59:13.382648	2025-11-11 18:59:13.382648
5cbac886-cbc8-4dd3-b6bb-4dbdf8738c16	MERCADO LIVRE BIGACU TEMPORARIOS	620086	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620086	2025-11-11 18:59:13.409	2025-11-11 18:59:13.441648	2025-11-11 18:59:13.441648
d845bbfc-c548-4ad9-b708-639d1047c522	FEMSA CAMPO MOURAO TEMPORARIOS	620087	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620087	2025-11-11 18:59:13.468	2025-11-11 18:59:13.500698	2025-11-11 18:59:13.500698
e59c7488-ebd4-4e9f-a53b-eff7026ed7d6	MAGNA SJP BPO	620088	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620088	2025-11-11 18:59:13.528	2025-11-11 18:59:13.560054	2025-11-11 18:59:13.560054
6f7c720e-cd9c-466c-b4ab-e20c5d9c7fbf	FEMSA SAO JOSE TEMPORARIOS	620089	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620089	2025-11-11 18:59:13.587	2025-11-11 18:59:13.619271	2025-11-11 18:59:13.619271
af11b74b-c9c4-40ad-a8d9-186a7160093e	BRF PTG LOGISTICA	620090	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620090	2025-11-11 18:59:13.646	2025-11-11 18:59:13.67845	2025-11-11 18:59:13.67845
4c05e8ae-34e2-4843-999f-8319886f4431	BRF LONDRINA TEMPORARIOS	620091	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620091	2025-11-11 18:59:13.705	2025-11-11 18:59:13.737666	2025-11-11 18:59:13.737666
41b34689-19b2-4b3d-a76e-17219da17e0e	BRF SAO JOSE DOS PINHAIS TEMPORARIOS	620092	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620092	2025-11-11 18:59:13.764	2025-11-11 18:59:13.796464	2025-11-11 18:59:13.796464
b1098207-571d-4bd7-8ec6-559c3c010a70	BRF CURITIBA TEMPORARIOS	620093	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620093	2025-11-11 18:59:13.824	2025-11-11 18:59:13.855662	2025-11-11 18:59:13.855662
a1591835-62a6-4155-938b-5d368f728184	BRF CONTROLADORIA NOVA SANTA RITA TEMPORARIOS	620096	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	620096	2025-11-11 18:59:13.883	2025-11-11 18:59:13.914888	2025-11-11 18:59:13.914888
edcf3a7e-1334-419e-a219-9f852146f54e	NATURA SIMOES FILHO TEMPORARIOS	630001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	630001	2025-11-11 18:59:13.942	2025-11-11 18:59:13.973848	2025-11-11 18:59:13.973848
f6282c43-94c6-42ac-9b9d-bc58779a6663	BRF SANTO ANTAO TEMPORARIOS	630032	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	630032	2025-11-11 18:59:14.001	2025-11-11 18:59:14.032875	2025-11-11 18:59:14.032875
2a110999-6022-4d57-a74c-05bf75248082	COMOLATTI (VITÓRIA) - TEMPORÁRIOS	640001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640001	2025-11-11 18:59:14.06	2025-11-11 18:59:14.092151	2025-11-11 18:59:14.092151
81801230-578a-41e5-bd03-c38f509fd9b7	COMOLATTI (BAURU) - TEMPORÁRIOS	640002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640002	2025-11-11 18:59:14.119	2025-11-11 18:59:14.150898	2025-11-11 18:59:14.150898
8dc6e500-56d4-444b-ad31-dc84a75796a5	COMOLATTI (SÃO JOSÉ DO RIO PRETO) - TEMPORÁRIOS	640003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640003	2025-11-11 18:59:14.178	2025-11-11 18:59:14.209222	2025-11-11 18:59:14.209222
9b76d804-df17-45bc-a920-c519d322136f	FEMSA ABC SANTO ANDRE TEMPORARIOS	640004	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640004	2025-11-11 18:59:14.236	2025-11-11 18:59:14.26832	2025-11-11 18:59:14.26832
e2355982-f888-41ff-b3a0-e0cad4512c09	FEMSA ABC ITAIM PAULISTA TEMPORARIOS	640005	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640005	2025-11-11 18:59:14.295	2025-11-11 18:59:14.327436	2025-11-11 18:59:14.327436
7c0915bf-70bb-461d-95b7-88edc6b79783	FEMSA MG JOAO  MONLEVADE TEMPORARIOS	640006	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640006	2025-11-11 18:59:14.355	2025-11-11 18:59:14.386733	2025-11-11 18:59:14.386733
7b442e74-efc9-46d5-b7e5-aec5df0ff592	FEMSA ABC – IPIRANGA TEMPORARIOS	640007	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640007	2025-11-11 18:59:14.413	2025-11-11 18:59:14.445614	2025-11-11 18:59:14.445614
c5091f3e-c1e7-4747-abe8-92ce150828a1	FEMSA SP JURUBATUBA TEMPORARIOS	640008	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640008	2025-11-11 18:59:14.473	2025-11-11 18:59:14.505074	2025-11-11 18:59:14.505074
a8961c47-202a-4ce3-9e84-f9dbee166c13	FEMSA SP JUNDIAI TEMPORARIOS	640009	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640009	2025-11-11 18:59:14.533	2025-11-11 18:59:14.565069	2025-11-11 18:59:14.565069
3fba8efe-b9c5-496e-9017-cdc50a3fdc43	FEMSA SP CONCENTRADORA JUNDIAI TEMPORARIOS	640012	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640012	2025-11-11 18:59:14.593	2025-11-11 18:59:14.625053	2025-11-11 18:59:14.625053
cf834f4b-79aa-4cfa-9f4e-8f8810d70bca	FEMSA SUMARE TEMPORARIOS	640013	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640013	2025-11-11 18:59:14.652	2025-11-11 18:59:14.684303	2025-11-11 18:59:14.684303
9c291ca6-0a61-4d5d-8f70-1f4768dbd2ef	FEMSA IPATINGA MG TEMPORARIOS	640014	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640014	2025-11-11 18:59:14.711	2025-11-11 18:59:14.744158	2025-11-11 18:59:14.744158
2220bd45-ee1c-4735-be24-a3f47672a4cc	FEMSA SP CORDEIROPOLIS TEMPORARIOS	640015	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640015	2025-11-11 18:59:14.771	2025-11-11 18:59:14.802088	2025-11-11 18:59:14.802088
e06d10a3-680e-49ec-98bf-dd14e76fe393	ONESUBSEA RJ BPO	640016	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640016	2025-11-11 18:59:14.829	2025-11-11 18:59:14.861421	2025-11-11 18:59:14.861421
e84f06ab-8552-49dd-ae82-9e43e983e8cd	BRF JUNDIAI TEMPORARIOS	640019	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640019	2025-11-11 18:59:14.888	2025-11-11 18:59:14.920508	2025-11-11 18:59:14.920508
d54e282a-4415-4993-896a-b4b7593f9da8	FEMSA MG BETIM TEMPORARIOS	640020	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640020	2025-11-11 18:59:14.947	2025-11-11 18:59:14.979405	2025-11-11 18:59:14.979405
57672d6b-3295-4531-a78d-3e93e0169be8	SKYRAIL TERCEIRIZADOS	640021	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640021	2025-11-11 18:59:15.006	2025-11-11 18:59:15.038189	2025-11-11 18:59:15.038189
f8ae1544-6627-49b2-bf56-1415a1a91794	FEMSA JUNDIAI	640022	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640022	2025-11-11 18:59:15.065	2025-11-11 18:59:15.09743	2025-11-11 18:59:15.09743
005221aa-4014-4b52-88fe-24e7ada1c70c	COOPERSTAND VARGINHA TERCEIRIZADOS	640023	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640023	2025-11-11 18:59:15.126	2025-11-11 18:59:15.158782	2025-11-11 18:59:15.158782
aebcb1ae-f2d8-4bc5-baa6-e058bd5b343b	FEMSA JUNDIAI FOUNTAIN	640025	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640025	2025-11-11 18:59:15.186	2025-11-11 18:59:15.217657	2025-11-11 18:59:15.217657
4ccb0627-1419-4154-85dc-26ad067daf72	FEMSA GUARATINGUETA TEMPORARIOS	640026	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640026	2025-11-11 18:59:15.245	2025-11-11 18:59:15.276732	2025-11-11 18:59:15.276732
538e9d35-88a9-45f4-ae26-c3271018184f	AVON CABREUVA TEMPORARIOS	640043	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640043	2025-11-11 18:59:15.304	2025-11-11 18:59:15.335736	2025-11-11 18:59:15.335736
09f0423f-4e89-42ad-a4b0-936f45f2ce34	AVON INTERLAGOS TEMPORARIOS	640044	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640044	2025-11-11 18:59:15.363	2025-11-11 18:59:15.394851	2025-11-11 18:59:15.394851
adfc1b25-ae20-44eb-9314-713306fcbbb4	COOPERSTANDARD ATIBAIA TEMPORARIOS	640045	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640045	2025-11-11 18:59:15.422	2025-11-11 18:59:15.453578	2025-11-11 18:59:15.453578
914fb965-c7f3-481f-a61e-4b440fdde4a2	NATURA ITUPEVA TEMPORARIOS	640046	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640046	2025-11-11 18:59:15.48	2025-11-11 18:59:15.512621	2025-11-11 18:59:15.512621
02a0a19e-ff1b-462e-957e-3264d2c2326e	COOPERSTANDARD HQ TEMPORARIOS	640047	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640047	2025-11-11 18:59:15.539	2025-11-11 18:59:15.572178	2025-11-11 18:59:15.572178
1c616478-b5da-45f2-a467-071b76b56cac	CONSORCIO BYD SKYRAIL SP	640048	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640048	2025-11-11 18:59:15.599	2025-11-11 18:59:15.63166	2025-11-11 18:59:15.63166
fa94e998-6dbd-4da2-8d8b-5b59270f5e65	FEMSA BAURU TEMPORARIOS	640049	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640049	2025-11-11 18:59:15.659	2025-11-11 18:59:15.691598	2025-11-11 18:59:15.691598
82646d4a-5781-4291-8eba-2385a20e5196	FEMSA BARRETOS TEMPORARIOS	640050	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640050	2025-11-11 18:59:15.718	2025-11-11 18:59:15.750689	2025-11-11 18:59:15.750689
f52f625c-30a3-4bd6-a297-ee65419ab878	FEMSA JUIZ DE FORA TEMPORARIOS	640051	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640051	2025-11-11 18:59:15.778	2025-11-11 18:59:15.809692	2025-11-11 18:59:15.809692
644c02d6-5671-4d79-ac08-ee3f5e81a2c8	FEMSA PORTO REAL TEMPORARIOS	640052	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640052	2025-11-11 18:59:15.836	2025-11-11 18:59:15.868444	2025-11-11 18:59:15.868444
3a3a3ffd-97f5-41c9-a337-612b45dfe9c1	FEMSA ANGRA DOS REIS TEMPORARIOS	640053	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640053	2025-11-11 18:59:15.896	2025-11-11 18:59:15.92772	2025-11-11 18:59:15.92772
6e457997-1613-406a-97d5-a7d7ba88dec2	STRATTNER TEMPORARIOS	640054	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640054	2025-11-11 18:59:15.955	2025-11-11 18:59:15.986868	2025-11-11 18:59:15.986868
a09d2bd1-b506-45fd-a6b7-02ec60e17ecb	FEMSA SAO JOSE DO RIO PRETO TEMPORARIOS	640055	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640055	2025-11-11 18:59:16.014	2025-11-11 18:59:16.0456	2025-11-11 18:59:16.0456
8aa88387-3545-456a-9297-499e26f51695	MATTOS FILHO TEMPORARIOS	640056	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640056	2025-11-11 18:59:16.072	2025-11-11 18:59:16.104549	2025-11-11 18:59:16.104549
c7b474dd-40b9-462c-b03e-0965f1ea762b	UNICABOS TEMPORARIOS	640057	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640057	2025-11-11 18:59:16.132	2025-11-11 18:59:16.163813	2025-11-11 18:59:16.163813
9aa4b004-3c80-4681-86af-6eee53a1741e	FEMSA JALES TEMPORARIOS	640058	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640058	2025-11-11 18:59:16.191	2025-11-11 18:59:16.223199	2025-11-11 18:59:16.223199
1a32d8f3-b61e-41fb-bd61-39abb6b04b4c	FEMSA BELO HORIZONTE TEMPORARIOS	640059	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640059	2025-11-11 18:59:16.25	2025-11-11 18:59:16.282923	2025-11-11 18:59:16.282923
79aab39d-1bd7-4cdb-bab9-234647b32554	FEMSA ARACATUBA TEMPORARIOS	640060	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640060	2025-11-11 18:59:16.31	2025-11-11 18:59:16.342336	2025-11-11 18:59:16.342336
586865a7-520e-4e50-9602-4236fafa7806	FEMSA CARAGUATATUBA TEMPORARIOS	640061	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640061	2025-11-11 18:59:16.37	2025-11-11 18:59:16.401708	2025-11-11 18:59:16.401708
eb08f144-6433-4f7c-bc42-8f9e6cc4c6a0	FEMSA MOGI BODEGA	640062	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640062	2025-11-11 18:59:16.429	2025-11-11 18:59:16.460855	2025-11-11 18:59:16.460855
1de74cdd-9db2-4019-be34-9f04b000e9d0	FEMSA OSASCO TEMPORARIOS	640063	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640063	2025-11-11 18:59:16.488	2025-11-11 18:59:16.52011	2025-11-11 18:59:16.52011
83ecc9c3-95c5-4039-83ae-cd9d0800edbd	FEMSA SANTOS TEMPORARIOS	640064	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640064	2025-11-11 18:59:16.547	2025-11-11 18:59:16.579115	2025-11-11 18:59:16.579115
6eb5abb6-f55d-4233-94b1-084b4c956e98	FEMSA PETROPOLIS TEMPORARIOS	640065	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640065	2025-11-11 18:59:16.606	2025-11-11 18:59:16.638227	2025-11-11 18:59:16.638227
851d91e6-853b-4821-889f-268542b97fbb	FEMSA JURUBATUBA OPERACOES TEMPORARIOS	640066	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640066	2025-11-11 18:59:16.665	2025-11-11 18:59:16.69735	2025-11-11 18:59:16.69735
3f321787-0976-454d-807a-449d669ffbd9	FEMSA MARILIA TEMPORARIOS	640067	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640067	2025-11-11 18:59:16.724	2025-11-11 18:59:16.756697	2025-11-11 18:59:16.756697
e09fbdd7-0f82-4cf6-bab2-f3365684b296	BRF JUNDIAI TEMPORARIOS	640069	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640069	2025-11-11 18:59:16.784	2025-11-11 18:59:16.816002	2025-11-11 18:59:16.816002
dbf5af0d-5b95-4a74-b47a-761b03e271b4	BRF FRIOZEM SP TEMPORARIOS	640071	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640071	2025-11-11 18:59:16.843	2025-11-11 18:59:16.874896	2025-11-11 18:59:16.874896
11ca6842-72e6-4948-9da0-6e89e4789dd5	BRF CONTROLADORIA RIBEIRAO DAS NEVES TEMPORARIOS	640073	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640073	2025-11-11 18:59:16.904	2025-11-11 18:59:16.93614	2025-11-11 18:59:16.93614
22676425-a8f4-449c-897d-d4f838bc68f8	BRF CONTROLADORIA DUQUE DE CAXIAS TEMPORARIOS	640074	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640074	2025-11-11 18:59:16.963	2025-11-11 18:59:16.994115	2025-11-11 18:59:16.994115
0adbd85b-17f1-48cf-b6be-4f0dc8004794	BRF CONTROLADORIA BAURU TEMPORARIOS	640078	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640078	2025-11-11 18:59:17.021	2025-11-11 18:59:17.053409	2025-11-11 18:59:17.053409
6fe9b86e-471a-4c72-b69d-24811a2ab2c0	BRF CONTROLADORIA EMBU TEMPORARIOS	640080	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	640080	2025-11-11 18:59:17.08	2025-11-11 18:59:17.112259	2025-11-11 18:59:17.112259
71376244-de24-4686-9838-8f8a9dcc77c1	COMOLATTI (GOIÂNIA) - TEMPORÁRIOS	650001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	650001	2025-11-11 18:59:17.139	2025-11-11 18:59:17.171345	2025-11-11 18:59:17.171345
518776cc-1ae2-453b-a719-c5e96a3fcf6a	COMOLATTI (CAMPO GRANDE) - TEMPORÁRIOS	650002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	650002	2025-11-11 18:59:17.198	2025-11-11 18:59:17.230192	2025-11-11 18:59:17.230192
bd5e2670-32d9-485f-af11-6752b144ce06	COMOLATTI (CAMPO GRANDE)/DASA - TEMPORÁRIOS	650003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	650003	2025-11-11 18:59:17.257	2025-11-11 18:59:17.289553	2025-11-11 18:59:17.289553
9840415a-a7aa-4cd9-a79e-d55aa1ebf97b	BRF MINEIROS TEMPORARIOS	650005	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	650005	2025-11-11 18:59:17.316	2025-11-11 18:59:17.348621	2025-11-11 18:59:17.348621
2186d48c-8aa4-47f1-a351-cc046c7bdc21	FEMSA TEMPORARIOS CAMPO GRANDE	660024	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	660024	2025-11-11 18:59:17.375	2025-11-11 18:59:17.407603	2025-11-11 18:59:17.407603
6ca2570a-6d26-40bd-b8ec-efa8255d77e3	FEMSA TRES LAGOAS TEMPORARIOS	660025	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	660025	2025-11-11 18:59:17.434	2025-11-11 18:59:17.466563	2025-11-11 18:59:17.466563
1c8ab275-a24b-4d66-a325-51fb6fca504a	COOPERSTANDARD - SAO BENTO DO SUL	680035	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	680035	2025-11-11 18:59:17.493	2025-11-11 18:59:17.525451	2025-11-11 18:59:17.525451
3fac4d99-16d0-4e93-8013-495c66b130f4	FEZER INDUSTRIA MECANICA SA	680036	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	680036	2025-11-11 18:59:17.553	2025-11-11 18:59:17.584978	2025-11-11 18:59:17.584978
a1ec2fff-3df6-4020-8262-e9f6c2ee745d	SUPERFRIO CANOAS TEMPORARIOS	680037	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	680037	2025-11-11 18:59:17.612	2025-11-11 18:59:17.644218	2025-11-11 18:59:17.644218
81f58c8d-1aab-4473-868c-bc7c67fa2583	MERCADO LIVRE BLUMENAU TEMPORARIOS	680038	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	680038	2025-11-11 18:59:17.671	2025-11-11 18:59:17.705018	2025-11-11 18:59:17.705018
0b2ac026-f9ff-44ec-bb46-ff22f195ab22	MERCADO LIVRE CRICIUMA TEMPORARIOS	680039	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	680039	2025-11-11 18:59:17.732	2025-11-11 18:59:17.763096	2025-11-11 18:59:17.763096
050b9648-e132-4f91-a322-2a318707d114	MERCADO LIVRE FL GOV CELSO RAMOS TEMPORARIOS	680040	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	680040	2025-11-11 18:59:17.79	2025-11-11 18:59:17.822795	2025-11-11 18:59:17.822795
5a93d9ff-79c1-4999-82d7-0b9ae45ea2a2	LIV UP MG TEMPORARIOS	690002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	690002	2025-11-11 18:59:17.849	2025-11-11 18:59:17.881662	2025-11-11 18:59:17.881662
61e3d631-a7b0-43b9-9311-cdd2e924ebef	METAGAL SANTA RITA DO SAPUCAI	690037	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	690037	2025-11-11 18:59:17.909	2025-11-11 18:59:17.940981	2025-11-11 18:59:17.940981
5c466489-f08f-47b7-8dea-6d4f04db71db	COOPERSTANDARD VARGINHA TEMPORARIOS	690038	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	690038	2025-11-11 18:59:17.968	2025-11-11 18:59:17.99983	2025-11-11 18:59:17.99983
0bf80f6e-dbbf-491f-8e89-6140747ec982	VIVENSIS INDUSTRIA - TEMPORARIOS	690039	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	690039	2025-11-11 18:59:18.027	2025-11-11 18:59:18.058858	2025-11-11 18:59:18.058858
1db085d0-b9e1-4492-a9dd-11b640121a95	TELOS LIV UP TEMPORÁRIOS	690040	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	690040	2025-11-11 18:59:18.086	2025-11-11 18:59:18.117632	2025-11-11 18:59:18.117632
286557ca-b133-44f3-a1dd-cd411b64e112	LIV UP BARUERI - TEMPORÁRIOS	690041	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	690041	2025-11-11 18:59:18.144	2025-11-11 18:59:18.176341	2025-11-11 18:59:18.176341
5d904e26-411e-448a-b8b4-f65e55353e30	FIBRA PR TEMPORARIOS	7	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	7	2025-11-11 18:59:18.203	2025-11-11 18:59:18.235524	2025-11-11 18:59:18.235524
a98f0f4b-276b-4335-b9cb-d4523b331fd6	IBD TEMPORARIOS	710012	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	710012	2025-11-11 18:59:18.263	2025-11-11 18:59:18.294981	2025-11-11 18:59:18.294981
1c70024a-89bc-40c0-a69d-baadce05bdd8	EMBRART TEMPORARIOS	8	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	8	2025-11-11 18:59:18.322	2025-11-11 18:59:18.354771	2025-11-11 18:59:18.354771
5f1cd8a8-8079-42e1-b6ad-cde24513f424	LOCALIZA DISTRITO FEDERAL	830005	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	830005	2025-11-11 18:59:18.382	2025-11-11 18:59:18.414027	2025-11-11 18:59:18.414027
34efce71-f8cd-4f91-beff-5743cb9e707c	EMBRART ARAUCARIA TEMPORARIOS	9	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9	2025-11-11 18:59:18.441	2025-11-11 18:59:18.472992	2025-11-11 18:59:18.472992
42eb32e1-4687-4139-bb1b-8b84cbda1699	RENAULT DO BRASIL S.A	9010001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010001	2025-11-11 18:59:18.5	2025-11-11 18:59:18.532694	2025-11-11 18:59:18.532694
93c380b9-a7f1-4d66-99f5-53a6f45d48c6	PILKINGTON BRASIL LTDA	9010002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010002	2025-11-11 18:59:18.559	2025-11-11 18:59:18.591625	2025-11-11 18:59:18.591625
238536be-cd98-4173-ae9e-44a1e72d5d7e	ZF AUTOMOTIVE BRASIL LTDA.	9010003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010003	2025-11-11 18:59:18.619	2025-11-11 18:59:18.650777	2025-11-11 18:59:18.650777
1ff480ea-f1a7-4f33-a672-fdb8ff2f3ff6	VALEO SISTEMAS AUTOMOTIVOS LTDA	9010004	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010004	2025-11-11 18:59:18.678	2025-11-11 18:59:18.709621	2025-11-11 18:59:18.709621
6a2e78a8-4a0b-4579-9ce4-70aae681a273	ZF AUTOMOTIVE BRASIL LTDA.	9010005	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010005	2025-11-11 18:59:18.737	2025-11-11 18:59:18.768886	2025-11-11 18:59:18.768886
d99fc3e5-e3b6-4ecc-ad1e-7d584b2aefc6	NISSAN DO BRASIL AUTOMOVEIS LTDA	9010006	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010006	2025-11-11 18:59:18.796	2025-11-11 18:59:18.828512	2025-11-11 18:59:18.828512
ad1cbd56-1ba9-411f-a8b9-77e3c9256e2a	SMP AUTOMOTIVE P. AUT.DO BRASIL LTDA	9010007	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010007	2025-11-11 18:59:18.856	2025-11-11 18:59:18.889381	2025-11-11 18:59:18.889381
e95fea63-8673-4acd-a60b-a003ecb5b070	ZF AUTOMOTIVE BRASIL LTDA.	9010008	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010008	2025-11-11 18:59:18.916	2025-11-11 18:59:18.948422	2025-11-11 18:59:18.948422
686d0252-0163-45e8-8089-159320f49019	VISTEON AMAZONAS LTDA	9010009	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010009	2025-11-11 18:59:18.975	2025-11-11 18:59:19.007759	2025-11-11 18:59:19.007759
a503a70b-6d21-465c-b6ab-5f90c9dacba8	AKER SOLUTIONS DO BRASIL LTDA	9010010	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010010	2025-11-11 18:59:19.035	2025-11-11 18:59:19.067616	2025-11-11 18:59:19.067616
555a2022-f63d-481c-8f9a-d72871d9a467	GE ENERGIAS RENOVAVEIS LTDA	9010011	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010011	2025-11-11 18:59:19.095	2025-11-11 18:59:19.127065	2025-11-11 18:59:19.127065
b4bafe04-e0cb-4fe6-8b71-df5d9ada5091	OPUS CONSULTORIA LTDA	9010012	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010012	2025-11-11 18:59:19.154	2025-11-11 18:59:19.186009	2025-11-11 18:59:19.186009
d87213a1-2e7a-4028-b5f5-72cbbbde621f	ALSTOM BRASIL ENERGIA E TRANSPORTE LTDA	9010013	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010013	2025-11-11 18:59:19.213	2025-11-11 18:59:19.244867	2025-11-11 18:59:19.244867
d4ebd718-6cda-4e45-9eff-d41d98d23133	AKER SOLUTIONS DO BRASIL LTDA	9010014	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010014	2025-11-11 18:59:19.275	2025-11-11 18:59:19.307219	2025-11-11 18:59:19.307219
cad6cf5b-d260-420b-a271-e49f06faba4c	ZF DO BRASIL LTDA	9010015	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010015	2025-11-11 18:59:19.334	2025-11-11 18:59:19.366832	2025-11-11 18:59:19.366832
40dd82c5-7d70-4bcc-85b0-6afea10c4220	OBRA AKER	9010016	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010016	2025-11-11 18:59:19.394	2025-11-11 18:59:19.426283	2025-11-11 18:59:19.426283
65287086-eea9-436c-ad7c-44af057705a2	TRW AUTOMOTIVE LTDA	9010017	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010017	2025-11-11 18:59:19.453	2025-11-11 18:59:19.485171	2025-11-11 18:59:19.485171
13761695-d42b-464b-8166-97fd4137b20a	NISSAN DO BRASIL AUTOMOTIVEIS LTDA	9010018	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010018	2025-11-11 18:59:19.512	2025-11-11 18:59:19.544066	2025-11-11 18:59:19.544066
a2f7158a-0894-4e86-93a6-e416a2267403	AUTONEUM BRASIL TEXTEIS ACUSTICOS LTDA	9010019	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010019	2025-11-11 18:59:19.571	2025-11-11 18:59:19.60311	2025-11-11 18:59:19.60311
79b5de64-131b-4300-a3c1-0796f436e6d9	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS SA	9010020	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010020	2025-11-11 18:59:19.63	2025-11-11 18:59:19.66236	2025-11-11 18:59:19.66236
86445e61-b8c2-41bf-8d7b-06800c93e73c	FAGOR EDERLAN BRASILEIRA AUTO PECAS LTDA	9010021	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010021	2025-11-11 18:59:19.689	2025-11-11 18:59:19.721596	2025-11-11 18:59:19.721596
34ed1e56-8a5d-490f-a581-ee6785ca15b7	AUTONEUM BRASIL TEXTEIS ACUSTCOS LTDA	9010022	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010022	2025-11-11 18:59:19.748	2025-11-11 18:59:19.780318	2025-11-11 18:59:19.780318
7be3d3a8-dd2a-4c94-83d7-85033268e1e9	ESTRUTURAS METALICAS SANTO A. LTDA EPP	9010023	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010023	2025-11-11 18:59:19.807	2025-11-11 18:59:19.83956	2025-11-11 18:59:19.83956
da83d47c-d080-4ded-9988-f506b96b5508	FORMATO CLEAR ROOM COMERCIO E SERVICOS L	9010024	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010024	2025-11-11 18:59:19.866	2025-11-11 18:59:19.898839	2025-11-11 18:59:19.898839
3887c61a-59fc-4cad-bc53-113dcfed6905	SODECIA DA BAHIA LTDA	9010025	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010025	2025-11-11 18:59:19.926	2025-11-11 18:59:19.958462	2025-11-11 18:59:19.958462
e38afef3-2483-4aa8-bd11-d2b293cf30b3	METAGAL INDUSTRIA E COMERCIO LTDA	9010026	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010026	2025-11-11 18:59:19.986	2025-11-11 18:59:20.018109	2025-11-11 18:59:20.018109
f6606035-0b62-4a98-a927-a6857d977a3e	FORD MOTOR COMPANY BRASIL LTDA	9010027	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010027	2025-11-11 18:59:20.045	2025-11-11 18:59:20.077004	2025-11-11 18:59:20.077004
52e2811c-0d63-4fd0-a8f6-14c92e969203	CONTINENTAL DO BRASIL PRODUTOS AUTOMOTIV	9010028	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010028	2025-11-11 18:59:20.104	2025-11-11 18:59:20.135078	2025-11-11 18:59:20.135078
8a9953d3-478b-4a9d-aabf-fa176637463b	HARMANN DA AMAZONIA INDUSTRIA ELETRONICA	9010029	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010029	2025-11-11 18:59:20.162	2025-11-11 18:59:20.194615	2025-11-11 18:59:20.194615
f6f1afb5-c824-49c6-972d-f27f1e6dff31	SODECIA DA BAHIA LTDA	9010030	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010030	2025-11-11 18:59:20.221	2025-11-11 18:59:20.254067	2025-11-11 18:59:20.254067
c3364c85-b411-46ec-b9e1-7a63aab0e5fc	AUTO FORJAS LTDA	9010031	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010031	2025-11-11 18:59:20.281	2025-11-11 18:59:20.312859	2025-11-11 18:59:20.312859
24369a5c-2725-49ae-b944-510fc1c8b983	ROBERT BOSCH LIMITADA	9010032	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010032	2025-11-11 18:59:20.34	2025-11-11 18:59:20.371635	2025-11-11 18:59:20.371635
03f07bd8-1c8c-479c-94f4-e579529c8e80	THYSSENKRUPP BRASIL LTDA	9010033	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010033	2025-11-11 18:59:20.399	2025-11-11 18:59:20.43108	2025-11-11 18:59:20.43108
a7f348c1-c431-43c0-ba12-cee272e6974b	FORD MOTOR COMPANY BRASIL LTDA	9010034	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010034	2025-11-11 18:59:20.458	2025-11-11 18:59:20.490794	2025-11-11 18:59:20.490794
6557ffb8-5734-4e06-87cc-9517230a2c3f	VOLKSWAGEN DO BRASIL INDUSTRIA DE VEICUL	9010035	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010035	2025-11-11 18:59:20.517	2025-11-11 18:59:20.549788	2025-11-11 18:59:20.549788
cfb64c89-cf20-44e4-b39f-e0697ce07fc0	CONTINENTAL AUTOMOTIVE DO BRASIL LTDA	9010036	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010036	2025-11-11 18:59:20.577	2025-11-11 18:59:20.60881	2025-11-11 18:59:20.60881
78b7a100-e439-4ce7-86ce-0f4b0df3872c	OLSA BRASIL INDUSTRIA E COMERCIO LTDA	9010037	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010037	2025-11-11 18:59:20.636	2025-11-11 18:59:20.667951	2025-11-11 18:59:20.667951
8fe54dc2-64cd-4bdb-94b0-34ba0929fdca	JARDIM SISTEMAS AUTOMOTIVOS E INDUSTRIA	9010038	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010038	2025-11-11 18:59:20.695	2025-11-11 18:59:20.726775	2025-11-11 18:59:20.726775
fb89de68-ce47-4b58-83a0-b905903ae17e	TENNECO AUTOMOTIVE BRASIL LTDA	9010039	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010039	2025-11-11 18:59:20.754	2025-11-11 18:59:20.786035	2025-11-11 18:59:20.786035
48f725c0-d8a8-4cfc-8392-538984202490	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A	9010040	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010040	2025-11-11 18:59:20.813	2025-11-11 18:59:20.844774	2025-11-11 18:59:20.844774
fa89cfdb-2b6b-4a58-93b0-414d40993857	SAINT GOBAIN DO BRASIL PRODUTOS INDUSTRI	9010041	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010041	2025-11-11 18:59:20.872	2025-11-11 18:59:20.904038	2025-11-11 18:59:20.904038
10595cff-2c73-4595-9b05-0e83261c227c	BROSE DO BRASIL LTDA	9010042	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010042	2025-11-11 18:59:20.931	2025-11-11 18:59:20.964165	2025-11-11 18:59:20.964165
e87dd10c-097c-4cef-8cc5-2cda8e0ee947	INDEBRAS INDUSTRIA ELETROMECANICA BRASIL	9010043	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010043	2025-11-11 18:59:20.991	2025-11-11 18:59:21.022995	2025-11-11 18:59:21.022995
f5016313-22ab-45da-8267-a9891dfd76cd	BENTELER SISTEMAS AUTOMOTIVOS LTDA	9010044	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010044	2025-11-11 18:59:21.05	2025-11-11 18:59:21.08237	2025-11-11 18:59:21.08237
3c4f4631-5fb8-4299-8ad6-86b7e2f94335	MAGNA DO BRASIL PRODUTOS E SERVICOS AUTO	9010045	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010045	2025-11-11 18:59:21.109	2025-11-11 18:59:21.141316	2025-11-11 18:59:21.141316
809fe1b6-0641-411e-a0bf-e88a43e97eff	ULIANA INDUSTRIA METALURGICA LIMITADA	9010046	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010046	2025-11-11 18:59:21.168	2025-11-11 18:59:21.20038	2025-11-11 18:59:21.20038
d1682bbb-d824-44c9-b574-f7eb7b53dc99	VIBRACOUSTIC SOUTH AMERICA LTDA	9010047	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010047	2025-11-11 18:59:21.228	2025-11-11 18:59:21.259971	2025-11-11 18:59:21.259971
3b8d18d0-2bc0-4623-881f-a410370f305b	BREMBO DO BRASIL LTDA	9010048	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010048	2025-11-11 18:59:21.287	2025-11-11 18:59:21.318791	2025-11-11 18:59:21.318791
79eb5f96-44fc-4b92-aa54-ca19fd53f4d6	SONAVOX INDUSTRIA E COMERCIO DE ALTOS FA	9010049	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010049	2025-11-11 18:59:21.346	2025-11-11 18:59:21.377665	2025-11-11 18:59:21.377665
81e86b89-3f01-4329-8f2f-0102c3906708	METAGAL INDUSTRIA E COMERCIO LTDA	9010050	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010050	2025-11-11 18:59:21.404	2025-11-11 18:59:21.436691	2025-11-11 18:59:21.436691
4a451a83-6fad-491b-8e5e-b2bbc76193e5	INDUSTRIA MECANICA BRASILEIRA DE ESTAMPO	9010051	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010051	2025-11-11 18:59:21.464	2025-11-11 18:59:21.49605	2025-11-11 18:59:21.49605
b9998c2c-c3e4-4504-b0d9-4e543fdd2038	ITW DELFAST DO BRASIL LTDA	9010052	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010052	2025-11-11 18:59:21.524	2025-11-11 18:59:21.555123	2025-11-11 18:59:21.555123
47390120-7468-4c87-9bbe-148a58c697db	MAPRA MANGUEIRAS E ARTEFATOS DE BORRACHA	9010053	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010053	2025-11-11 18:59:21.582	2025-11-11 18:59:21.614625	2025-11-11 18:59:21.614625
b4e76d30-8658-4da4-b25f-7fea033e07e9	FEDERAL-MOGUL COMPONENTES DE MOTORES LTD	9010054	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010054	2025-11-11 18:59:21.642	2025-11-11 18:59:21.673612	2025-11-11 18:59:21.673612
d7e12a33-2b60-4ab4-9ae3-02c368d0b9fe	COPAM COMPONENTES DE PAPELAO E MADEIRA L	9010055	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010055	2025-11-11 18:59:21.7	2025-11-11 18:59:21.732542	2025-11-11 18:59:21.732542
475ca6f2-1cde-4bb3-8b87-5f3b59828a47	FIBAM COMPANHIA INDUSTRIAL	9010056	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010056	2025-11-11 18:59:21.759	2025-11-11 18:59:21.791428	2025-11-11 18:59:21.791428
f7f69113-cbe6-4592-8ab2-76968391c4ce	ABC GROUP DO BRASIL LTDA	9010057	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010057	2025-11-11 18:59:21.818	2025-11-11 18:59:21.850213	2025-11-11 18:59:21.850213
aa134b00-99cc-42fb-ab63-3f0c32de2fc4	POLISTAMPO INDUSTRIA METALURGICA LTDA	9010058	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010058	2025-11-11 18:59:21.877	2025-11-11 18:59:21.908946	2025-11-11 18:59:21.908946
14eaabbf-642a-48bb-9306-3723b5618d8d	MUBEA DO BRASIL LTDA	9010059	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010059	2025-11-11 18:59:21.936	2025-11-11 18:59:21.96798	2025-11-11 18:59:21.96798
ff38a6c2-120a-4ba2-b22c-b1d5316d5fc7	LABORTEX IND E COM DE PRODUTOS DE BORRAC	9010060	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010060	2025-11-11 18:59:21.995	2025-11-11 18:59:22.027314	2025-11-11 18:59:22.027314
cc00078e-d591-4085-aa4b-3e587e8cd8d7	JTEKT AUTOMOTIVA BRASIL LTDA	9010061	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010061	2025-11-11 18:59:22.054	2025-11-11 18:59:22.086639	2025-11-11 18:59:22.086639
bfda8511-c6e8-4530-a7ca-17e1052f0f07	SOGEFI SUSPENSION BRASIL LTDA	9010062	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010062	2025-11-11 18:59:22.114	2025-11-11 18:59:22.147243	2025-11-11 18:59:22.147243
6a19d6ae-d91b-4ec8-b84e-10885cbd622d	BOLLHOFF SERVICE CENTER LTDA	9010063	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010063	2025-11-11 18:59:22.174	2025-11-11 18:59:22.206388	2025-11-11 18:59:22.206388
bc2183c4-e642-4efb-9466-a63cbb9324ef	ZANINI DO BRASIL LTDA	9010064	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010064	2025-11-11 18:59:22.233	2025-11-11 18:59:22.265657	2025-11-11 18:59:22.265657
c62b9e5e-e6ab-41f2-8f39-40ba9e961f71	AETHRA SISTEMAS AUTOMOTIVOS S.A	9010065	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010065	2025-11-11 18:59:22.293	2025-11-11 18:59:22.327309	2025-11-11 18:59:22.327309
f7fe70d7-3ae4-4e4e-9ac4-8ed1bd1784eb	OMRON COMPONENTES AUTOMOTIVOS LTDA	9010066	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010066	2025-11-11 18:59:22.354	2025-11-11 18:59:22.38636	2025-11-11 18:59:22.38636
7c11c7d4-af1f-4cfa-b586-25de9f4770df	METALURGICA NAKAYONE LTDA	9010067	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010067	2025-11-11 18:59:22.413	2025-11-11 18:59:22.445373	2025-11-11 18:59:22.445373
bfef1e95-94a5-4fb7-83e5-04267bf04b6b	CASCO DO BRASIL LTDA	9010068	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010068	2025-11-11 18:59:22.472	2025-11-11 18:59:22.504672	2025-11-11 18:59:22.504672
bc620cc9-c0d4-4b92-990d-a61995fa8cbe	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010069	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010069	2025-11-11 18:59:22.532	2025-11-11 18:59:22.563688	2025-11-11 18:59:22.563688
629d77d5-b5b0-4545-ad2f-ad9e52129bc7	DYNA INDUSTRIA E COMERCIO LTDA.	9010070	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010070	2025-11-11 18:59:22.591	2025-11-11 18:59:22.62302	2025-11-11 18:59:22.62302
f2ce6631-45e9-4cd6-b846-f63782261999	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010071	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010071	2025-11-11 18:59:22.65	2025-11-11 18:59:22.681265	2025-11-11 18:59:22.681265
ff85ada8-e6d8-4229-9527-bc66f2a0b273	A. RAYMOND BRASIL LTDA	9010072	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010072	2025-11-11 18:59:22.708	2025-11-11 18:59:22.740394	2025-11-11 18:59:22.740394
3b15ca4e-12d7-4ec4-82e6-bbdb71384328	SCHAEFFLER BRASIL LTDA.	9010073	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010073	2025-11-11 18:59:22.767	2025-11-11 18:59:22.799612	2025-11-11 18:59:22.799612
1f64073e-9c0e-4cba-8cc8-385975934d27	YAZAKI DO BRASIL LTDA	9010074	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010074	2025-11-11 18:59:22.826	2025-11-11 18:59:22.858462	2025-11-11 18:59:22.858462
f35ac025-298a-407b-b1d3-d72be3118d27	ROBERT BOSCH LIMITADA	9010075	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010075	2025-11-11 18:59:22.885	2025-11-11 18:59:22.917601	2025-11-11 18:59:22.917601
7c95b651-b6c7-4231-87e7-b68445a3330b	INTERTRIM LTDA	9010076	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010076	2025-11-11 18:59:22.944	2025-11-11 18:59:22.976428	2025-11-11 18:59:22.976428
3639aa87-7888-4509-aa58-965cf4e3cf36	SOGEFI FILTRATION DO BRASIL LTDA	9010077	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010077	2025-11-11 18:59:23.003	2025-11-11 18:59:23.035539	2025-11-11 18:59:23.035539
ec8aed7c-9843-4c44-acd8-0f29af0c8b6d	THYSSENKRUPP BRASIL LTDA.	9010078	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010078	2025-11-11 18:59:23.063	2025-11-11 18:59:23.095057	2025-11-11 18:59:23.095057
96b5a557-e377-40b1-89b2-3fd80fd223af	TP INDUSTRIAL DE PNEUS BRASIL LTDA.	9010079	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010079	2025-11-11 18:59:23.122	2025-11-11 18:59:23.154182	2025-11-11 18:59:23.154182
95147d9c-f5d6-42be-8342-642502bae145	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010080	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010080	2025-11-11 18:59:23.182	2025-11-11 18:59:23.215477	2025-11-11 18:59:23.215477
3b5c2893-18d0-4afc-818b-97878496046e	GKN SINTER METALS LTDA.	9010081	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010081	2025-11-11 18:59:23.242	2025-11-11 18:59:23.27435	2025-11-11 18:59:23.27435
45aadc5e-55b5-4935-9bc5-19b7096936f6	GALUTTI AUTOMOTIVE INDUSTRIA METALURGICA	9010082	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010082	2025-11-11 18:59:23.301	2025-11-11 18:59:23.333447	2025-11-11 18:59:23.333447
fae4c19e-e4cc-43d9-be97-da4cd3976583	GKN DO BRASIL LTDA	9010083	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010083	2025-11-11 18:59:23.36	2025-11-11 18:59:23.392631	2025-11-11 18:59:23.392631
193aa13d-f60f-4365-a2d2-a6980b8da1ca	DIEHL DO BRASIL METALURGICA LTDA	9010084	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010084	2025-11-11 18:59:23.419	2025-11-11 18:59:23.451482	2025-11-11 18:59:23.451482
a46ed7f4-e8e7-49e8-8ff6-b15cda50e3f8	MAHLE METAL LEVE S.A.	9010085	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010085	2025-11-11 18:59:23.478	2025-11-11 18:59:23.510378	2025-11-11 18:59:23.510378
33acd007-7d2b-4c0c-8ca8-f0527e945681	U-SHIN DO BRASIL SISTEMAS AUTOMOTIVOS LT	9010086	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010086	2025-11-11 18:59:23.537	2025-11-11 18:59:23.569426	2025-11-11 18:59:23.569426
2a5b6986-4a4a-46d4-94d2-2ab624a904d1	VOSS AUTOMOTIVE LTDA	9010087	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010087	2025-11-11 18:59:23.596	2025-11-11 18:59:23.6285	2025-11-11 18:59:23.6285
c83e9083-052c-4e2e-ba3c-c06d8da2c8c5	AUTOCAM DO BRASIL USINAGEM LTDA.	9010088	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010088	2025-11-11 18:59:23.656	2025-11-11 18:59:23.688855	2025-11-11 18:59:23.688855
ba70bcdc-528f-42e4-b1dd-e7341c098c04	GERDAU S.A.	9010089	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010089	2025-11-11 18:59:23.716	2025-11-11 18:59:23.747685	2025-11-11 18:59:23.747685
55afe47a-b427-4536-9dc4-ab8f3472b409	WHB FUNDICAO S/A	9010090	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010090	2025-11-11 18:59:23.774	2025-11-11 18:59:23.806675	2025-11-11 18:59:23.806675
0c760091-4bac-466a-bb89-c015f65f4f61	TRICO LATINOAMERICANA DO BRASIL LTDA.	9010091	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010091	2025-11-11 18:59:23.833	2025-11-11 18:59:23.865346	2025-11-11 18:59:23.865346
ae548767-0529-479c-b6db-0376cb11b5ae	INDUSTRIA MECANICA BRASPAR LTDA	9010092	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010092	2025-11-11 18:59:23.892	2025-11-11 18:59:23.924437	2025-11-11 18:59:23.924437
f8244caa-7d4f-4ed8-b21c-8fd48db43735	3M DO BRASIL LTDA	9010093	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010093	2025-11-11 18:59:23.951	2025-11-11 18:59:23.983664	2025-11-11 18:59:23.983664
a551a08c-f2fc-4636-864f-2208133168e2	ALUJET INDUSTRIAL E COMERCIAL LTDA.	9010094	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010094	2025-11-11 18:59:24.011	2025-11-11 18:59:24.043243	2025-11-11 18:59:24.043243
60bc6ffc-65c0-45ee-95a0-a0afbe40b152	CLARION DO BRASIL LTDA	9010095	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010095	2025-11-11 18:59:24.07	2025-11-11 18:59:24.10344	2025-11-11 18:59:24.10344
af71451b-e7f2-46d8-b6ab-a9d9d370f565	FORD MOTOR COMPANY BRASIL LTDA	9010096	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010096	2025-11-11 18:59:24.13	2025-11-11 18:59:24.162826	2025-11-11 18:59:24.162826
8f0c3655-9e45-4ad8-8ee1-e0c4dc724a69	AB SISTEMA DE FREIOS LTDA	9010097	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010097	2025-11-11 18:59:24.19	2025-11-11 18:59:24.222283	2025-11-11 18:59:24.222283
990ce778-a5df-4e11-9469-ae212726c337	BOSCH REXROTH LTDA	9010098	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010098	2025-11-11 18:59:24.249	2025-11-11 18:59:24.28144	2025-11-11 18:59:24.28144
6c30ee7f-dbe4-42ae-b500-df3e81d324d1	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010099	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010099	2025-11-11 18:59:24.309	2025-11-11 18:59:24.34082	2025-11-11 18:59:24.34082
ac2a36d9-b1f7-4a2e-a9ea-00ef0d0ffe59	MICROPARTS PECAS INJETADAS LTDA	9010100	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010100	2025-11-11 18:59:24.368	2025-11-11 18:59:24.399871	2025-11-11 18:59:24.399871
c452607b-ea81-432c-8c75-6641d2ec5659	ADVAL TECH DO BRASIL INDUS ADE AUTO LTDA	9010101	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010101	2025-11-11 18:59:24.427	2025-11-11 18:59:24.458047	2025-11-11 18:59:24.458047
29656c3a-90f8-4c82-969f-c5598556e28b	TUPY S/A	9010102	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010102	2025-11-11 18:59:24.485	2025-11-11 18:59:24.516962	2025-11-11 18:59:24.516962
13c6a7a1-c7a9-4769-b695-510b2ee22273	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010103	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010103	2025-11-11 18:59:24.544	2025-11-11 18:59:24.575654	2025-11-11 18:59:24.575654
837db158-29f2-4b29-b39b-2902705598fb	SHW DO BRASIL LTDA	9010104	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010104	2025-11-11 18:59:24.603	2025-11-11 18:59:24.634862	2025-11-11 18:59:24.634862
0806b508-2aa2-4ec7-bd92-f014678c29cb	FORMTAP INDUSTRIA E COMERCIO S/A	9010105	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010105	2025-11-11 18:59:24.662	2025-11-11 18:59:24.693992	2025-11-11 18:59:24.693992
55454742-6aad-4388-a99a-02edc7adae68	FORD MOTOR COMPANY BRASIL LTDA	9010106	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010106	2025-11-11 18:59:24.721	2025-11-11 18:59:24.753181	2025-11-11 18:59:24.753181
d653e056-b315-450c-a44c-5306f5681f64	FICOSA DO BRASIL LTDA	9010107	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010107	2025-11-11 18:59:24.78	2025-11-11 18:59:24.812344	2025-11-11 18:59:24.812344
2b111885-63c2-451b-a4c6-3c44d41cc9e7	HUF DO BRASIL LTDA	9010108	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010108	2025-11-11 18:59:24.839	2025-11-11 18:59:24.870081	2025-11-11 18:59:24.870081
7ae2ff20-a1c8-42ba-a94a-2207f12fb7b0	ASBRASIL S/A - EM RECUPERACAO JUDICIAL	9010109	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010109	2025-11-11 18:59:24.897	2025-11-11 18:59:24.929213	2025-11-11 18:59:24.929213
aebccff2-2625-4a63-b0e7-f7298298e6c1	ASPRO PLASTIC INDUSTRIA E COMERCIO DE AR	9010110	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010110	2025-11-11 18:59:24.956	2025-11-11 18:59:24.988405	2025-11-11 18:59:24.988405
7a1074b6-61c6-452c-af2e-71c1e802831e	MAGNA DO BRASIL PRODUTOS E SERVICOS AUTO	9010111	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010111	2025-11-11 18:59:25.015	2025-11-11 18:59:25.047438	2025-11-11 18:59:25.047438
c99e3929-471c-4fd7-8a61-394aa7284155	WEBER HIDRÃ ULICA DO BRASIL LTDA.	9010112	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010112	2025-11-11 18:59:25.074	2025-11-11 18:59:25.10658	2025-11-11 18:59:25.10658
c86fbcd6-af66-4c67-93c4-dab9ac1c4ec1	CONTINENTAL PARAFUSOS S/A	9010113	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010113	2025-11-11 18:59:25.133	2025-11-11 18:59:25.165689	2025-11-11 18:59:25.165689
8d92af2e-b410-4d08-990a-c619c2225ad6	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010114	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010114	2025-11-11 18:59:25.193	2025-11-11 18:59:25.22509	2025-11-11 18:59:25.22509
b37da4f8-a447-4a5a-bb96-1d876b4fc04d	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010115	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010115	2025-11-11 18:59:25.252	2025-11-11 18:59:25.284338	2025-11-11 18:59:25.284338
33222e5b-30b2-4f8a-b010-b9d1d2718a31	MAAC INDUSTRIA E COMERCIO DE PECAS EIREL	9010116	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010116	2025-11-11 18:59:25.313	2025-11-11 18:59:25.346463	2025-11-11 18:59:25.346463
04b6c816-b837-40ba-8bf4-32c3e3afcadf	TEKNIA BRASIL LTDA.	9010117	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010117	2025-11-11 18:59:25.373	2025-11-11 18:59:25.405509	2025-11-11 18:59:25.405509
3a1b4be9-619b-48f3-ad89-7b1cc7614160	BASF SA	9010119	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010119	2025-11-11 18:59:25.432	2025-11-11 18:59:25.464211	2025-11-11 18:59:25.464211
76d800cd-ee14-444b-a601-cec8ba01d128	INDUSTRIAS MANGOTEX LTDA	9010120	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010120	2025-11-11 18:59:25.491	2025-11-11 18:59:25.523545	2025-11-11 18:59:25.523545
b39c82b3-50d2-4b6d-bd6d-e3624138ee47	METALURGICA FORMIGARI LTDA	9010121	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010121	2025-11-11 18:59:25.55	2025-11-11 18:59:25.582576	2025-11-11 18:59:25.582576
d4165877-076d-40ec-a550-1721b6569d3f	CONTINENTAL DO BRASIL PRODUTOS AUTOMOTIV	9010122	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010122	2025-11-11 18:59:25.609	2025-11-11 18:59:25.641376	2025-11-11 18:59:25.641376
3cd60709-225a-4792-ab3f-5926b033319f	MICHEL THIERRY DO BRASIL INDUSTRIA TEXTI	9010123	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010123	2025-11-11 18:59:25.668	2025-11-11 18:59:25.700966	2025-11-11 18:59:25.700966
349f37b5-7a9b-4c08-a559-5a6e926fb28d	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010124	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010124	2025-11-11 18:59:25.728	2025-11-11 18:59:25.759134	2025-11-11 18:59:25.759134
c78c5ac1-59a1-432b-8ba3-f04a9005ff4a	CONFAB INDUSTRIAL SOCIEDADE ANONIMA	9010125	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010125	2025-11-11 18:59:25.786	2025-11-11 18:59:25.818256	2025-11-11 18:59:25.818256
90087979-c135-4926-96ef-c26ebc866a32	VIBRAC SYSTEM S/A	9010126	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010126	2025-11-11 18:59:25.845	2025-11-11 18:59:25.877533	2025-11-11 18:59:25.877533
68f25cce-8c94-4d58-890b-3b2816abbfbe	ARVEDI METALFER DO BRASIL S.A	9010127	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010127	2025-11-11 18:59:25.904	2025-11-11 18:59:25.936534	2025-11-11 18:59:25.936534
2475a85a-bc16-456a-8750-6240f3f099da	AUTOMETAL SBC INJ E PINT PLASTICOS LTDA	9010128	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010128	2025-11-11 18:59:25.963	2025-11-11 18:59:25.995566	2025-11-11 18:59:25.995566
1facc2b8-4ebd-4b0f-92cb-19224e092cd9	TEKNIA BRASIL LTDA	9010129	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010129	2025-11-11 18:59:26.022	2025-11-11 18:59:26.054492	2025-11-11 18:59:26.054492
84ff0e2d-6f41-4ce8-9f8c-d91379309d61	MANGELS INDUSTRIAL S.A	9010130	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010130	2025-11-11 18:59:26.081	2025-11-11 18:59:26.113279	2025-11-11 18:59:26.113279
6d7176a4-acbc-43bf-8dd6-af74b4c07edd	BENTELER COMPONENTES AUTOMOTIVOS LTDA	9010131	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010131	2025-11-11 18:59:26.14	2025-11-11 18:59:26.172445	2025-11-11 18:59:26.172445
9f281536-ffc6-4d3e-8432-f1acd2b47436	SAINT-GOBAIN DO BRASIL PRODUTOS INDUSTRI	9010132	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010132	2025-11-11 18:59:26.2	2025-11-11 18:59:26.23264	2025-11-11 18:59:26.23264
b5048abb-ac87-4404-a403-1d8096f601e5	COBIAN REPRESENTACAO TECNICA E COMERCIAL	9010133	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010133	2025-11-11 18:59:26.259	2025-11-11 18:59:26.291054	2025-11-11 18:59:26.291054
5d33b8cf-d6cf-4cb1-8d3c-2f80996e14b2	AUTOCOM COMPONENTES AUTOMOTIVOS DO BRASI	9010134	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010134	2025-11-11 18:59:26.318	2025-11-11 18:59:26.350097	2025-11-11 18:59:26.350097
4fb05893-326a-4a83-b68a-5397da3e08c4	MANN HUMMEL BRASIL LTDA.	9010135	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010135	2025-11-11 18:59:26.377	2025-11-11 18:59:26.410125	2025-11-11 18:59:26.410125
b8a42b4e-6a3f-42c6-a2fe-1ef686317b65	RUDOLPH USINADOS S/A	9010136	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010136	2025-11-11 18:59:26.437	2025-11-11 18:59:26.469237	2025-11-11 18:59:26.469237
d2c5c180-17b3-4d66-bc5f-9308c8cb1fd0	KOSTAL ELETROMECANICA LTDA	9010137	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010137	2025-11-11 18:59:26.496	2025-11-11 18:59:26.528357	2025-11-11 18:59:26.528357
1947e8a8-19a5-49e3-8f4f-af0a8e76fa13	REFAL INDUSTRIA E COMERCIO DE REBITES E	9010138	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010138	2025-11-11 18:59:26.555	2025-11-11 18:59:26.587342	2025-11-11 18:59:26.587342
978d24df-247a-48e4-b8ad-46dcb048816c	PELZER DA BAHIA LTDA	9010139	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010139	2025-11-11 18:59:26.614	2025-11-11 18:59:26.646703	2025-11-11 18:59:26.646703
64a2f6b5-8013-40f9-803d-81180cef74b0	BORGWARNER BRASIL LTDA	9010140	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010140	2025-11-11 18:59:26.673	2025-11-11 18:59:26.7055	2025-11-11 18:59:26.7055
f42d29eb-e5fe-4849-b11f-db2e3e9fff9b	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010141	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010141	2025-11-11 18:59:26.733	2025-11-11 18:59:26.765052	2025-11-11 18:59:26.765052
bb9192d5-0d90-42ef-b1cb-d6fbf6579dfb	BENTELER COMPONENTES AUTOMOTIVOS LTDA	9010142	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010142	2025-11-11 18:59:26.792	2025-11-11 18:59:26.82457	2025-11-11 18:59:26.82457
50d7d0c7-9275-40e2-bff5-f697b77e1f17	MAQUINAS AGRICOLAS JACTO S A	9010143	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010143	2025-11-11 18:59:26.851	2025-11-11 18:59:26.883472	2025-11-11 18:59:26.883472
fbd65fd5-7bc7-490e-8a2c-31afc6e5a2e4	MAHLE BEHR GERENCIAMENTO TERMICO BRASIL	9010144	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010144	2025-11-11 18:59:26.91	2025-11-11 18:59:26.942422	2025-11-11 18:59:26.942422
24bd3a3d-7eb0-46ee-90c6-a42295b2e809	DAYCO POWER TRANSMISSION LTDA	9010145	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010145	2025-11-11 18:59:26.969	2025-11-11 18:59:27.001119	2025-11-11 18:59:27.001119
52d0665a-65e1-4648-b09f-9f3df9b986f5	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010146	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010146	2025-11-11 18:59:27.028	2025-11-11 18:59:27.060491	2025-11-11 18:59:27.060491
450b089b-aaa7-48b0-afc2-46dcb5bf721b	IOCHPE MAXION SA	9010147	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010147	2025-11-11 18:59:27.087	2025-11-11 18:59:27.119397	2025-11-11 18:59:27.119397
c5151419-4477-4096-92fe-b4281ff6a4ec	NORGREN LTDA	9010148	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010148	2025-11-11 18:59:27.146	2025-11-11 18:59:27.176966	2025-11-11 18:59:27.176966
6ffe67d3-2eb7-46d6-af54-a32afd8b677a	MANN HUMMEL BRASIL LTDA.	9010149	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010149	2025-11-11 18:59:27.204	2025-11-11 18:59:27.235039	2025-11-11 18:59:27.235039
9e971994-bdd2-4966-b99c-d0de8f7dd8b1	KSPG AUTOMOTIVE BRAZIL LTDA.	9010150	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010150	2025-11-11 18:59:27.262	2025-11-11 18:59:27.294808	2025-11-11 18:59:27.294808
e96d5f4f-0746-4d76-936f-bef67eab098b	MAGNETI MARELLI COFAP FABRICADORA DE PEC	9010151	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010151	2025-11-11 18:59:27.322	2025-11-11 18:59:27.355074	2025-11-11 18:59:27.355074
13eb5371-933c-4a4a-9f47-b527d34f5c1d	STAMPTEC INDUSTRIA E COMERCIO DE PECAS E	9010152	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010152	2025-11-11 18:59:27.382	2025-11-11 18:59:27.415134	2025-11-11 18:59:27.415134
08c994c1-13ee-4302-84a1-b17895ae269b	L L PRODUCTS DO BRASIL SERVICOS E COMERC	9010153	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010153	2025-11-11 18:59:27.444	2025-11-11 18:59:27.478664	2025-11-11 18:59:27.478664
cbd1d999-16bf-48bf-ab33-e266f6fd46d6	BOGE RUBBER e  PLASTICS BRASIL S.A.	9010154	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010154	2025-11-11 18:59:27.506	2025-11-11 18:59:27.53801	2025-11-11 18:59:27.53801
e98d8f13-ed1f-4790-b7a9-1047a6bc81dc	CERAMICA E VELAS DE IGNICAO NGK DO BRASI	9010155	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010155	2025-11-11 18:59:27.565	2025-11-11 18:59:27.597324	2025-11-11 18:59:27.597324
281f1920-1d3f-4537-8ed6-954c1a89af12	ELISMOL INDUSTRIA METALURGICA LTDA	9010156	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010156	2025-11-11 18:59:27.624	2025-11-11 18:59:27.656372	2025-11-11 18:59:27.656372
72380405-0e48-4836-b8b2-4f8ff616dcfb	AETHRA SISTEMAS AUTOMOTIVOS S.A.	9010157	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010157	2025-11-11 18:59:27.684	2025-11-11 18:59:27.715866	2025-11-11 18:59:27.715866
492540c8-6a32-4155-bb5c-53262f5bc90c	NEUMAYER TEKFOR AUTOMOTIVE BRASIL LTDA.	9010158	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010158	2025-11-11 18:59:27.743	2025-11-11 18:59:27.775452	2025-11-11 18:59:27.775452
8fca921a-c760-4cd6-bd9c-a920ed36b391	HANON SYSTEMS CLIMATIZACAO DO BRASIL IND	9010159	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010159	2025-11-11 18:59:27.803	2025-11-11 18:59:27.835022	2025-11-11 18:59:27.835022
0ded4dba-d1a3-4fcf-9204-96f68cf71c19	QUALYTEC QUALIDADE TECNICA LTDA EPP	9010160	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010160	2025-11-11 18:59:27.868	2025-11-11 18:59:27.899208	2025-11-11 18:59:27.899208
167091ee-5310-4ca6-8a57-923a72b38763	EDSCHA DO BRASIL LTDA	9010161	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010161	2025-11-11 18:59:27.926	2025-11-11 18:59:27.958372	2025-11-11 18:59:27.958372
0001583f-00a3-46ac-a9f0-ce6ce0e0e49a	TTB INDUSTRIA COM DE PRO METALICOS LTDA	9010162	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010162	2025-11-11 18:59:27.986	2025-11-11 18:59:28.018325	2025-11-11 18:59:28.018325
f0a894bd-a46a-48df-a96f-312f37644d69	DELGA INDUSTRIA E COMERCIO S A	9010163	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010163	2025-11-11 18:59:28.045	2025-11-11 18:59:28.077281	2025-11-11 18:59:28.077281
74b734b3-312b-4c26-9072-1e95cde52e6c	METALURGICA RIGITEC LTDA	9010164	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010164	2025-11-11 18:59:28.104	2025-11-11 18:59:28.136388	2025-11-11 18:59:28.136388
17550b48-0363-44b6-a871-f0394b5cc7f5	INDUSTRIA DE ART DE BORRACHA WOLF LTDA	9010165	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010165	2025-11-11 18:59:28.163	2025-11-11 18:59:28.195157	2025-11-11 18:59:28.195157
2a86bd91-fc0c-4c29-bf12-37733024700d	RASSINI NHK AUTOPECAS LTDA	9010166	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010166	2025-11-11 18:59:28.222	2025-11-11 18:59:28.254157	2025-11-11 18:59:28.254157
476ca90c-9700-4006-9018-806ee9c09dad	SNR ROLAMENTOS DO BRASIL LTDA	9010167	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010167	2025-11-11 18:59:28.281	2025-11-11 18:59:28.313197	2025-11-11 18:59:28.313197
28253da0-2da0-4b6f-be9b-cfc0c59501ca	KAUTEX TEXTRON DO BRASIL LTDA	9010168	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010168	2025-11-11 18:59:28.34	2025-11-11 18:59:28.372582	2025-11-11 18:59:28.372582
31028768-2c06-4491-b561-e6b18783c371	WHB FUNDICAO S A	9010169	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010169	2025-11-11 18:59:28.399	2025-11-11 18:59:28.43181	2025-11-11 18:59:28.43181
50fb734f-378e-4812-ab1f-e7760676d310	DURA AUTOMOTIVE SYSTEMS DO BRASIL LTDA	9010170	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010170	2025-11-11 18:59:28.459	2025-11-11 18:59:28.491654	2025-11-11 18:59:28.491654
ff78f14e-e04c-4dfd-a5c3-f351a24f3824	ELRING KLINGER DO BRASIL LTDA	9010171	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010171	2025-11-11 18:59:28.519	2025-11-11 18:59:28.550876	2025-11-11 18:59:28.550876
73692f66-befd-4601-9b1f-d3bede1852da	PIRELLI PNEUS LTDA.	9010172	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010172	2025-11-11 18:59:28.578	2025-11-11 18:59:28.609893	2025-11-11 18:59:28.609893
f7e451b1-7062-4840-b98b-5bbe6dcba871	METALURGICA HASSMANN SA	9010173	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010173	2025-11-11 18:59:28.637	2025-11-11 18:59:28.669376	2025-11-11 18:59:28.669376
dd8c6d4e-d1f9-43db-9702-0851fb006d75	TYCO ELECTRONICS BRASIL LTDA	9010174	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010174	2025-11-11 18:59:28.696	2025-11-11 18:59:28.728211	2025-11-11 18:59:28.728211
87fc52c7-76af-475c-bc42-eddefb94b551	SABO INDUSTRIA E COMERCIO DE AUTOPECAS S	9010175	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010175	2025-11-11 18:59:28.755	2025-11-11 18:59:28.787085	2025-11-11 18:59:28.787085
0a2d7f48-111e-48da-9d26-510dbf29e39f	METALURGICA HAME LTDA	9010176	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010176	2025-11-11 18:59:28.814	2025-11-11 18:59:28.846298	2025-11-11 18:59:28.846298
ca4c2ab0-733f-4213-b9eb-dbc3c0f6a9bb	CUMMINS BRASIL LIMITDA	9010177	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010177	2025-11-11 18:59:28.873	2025-11-11 18:59:28.905404	2025-11-11 18:59:28.905404
969b2fbd-33c5-4651-b24e-418505a15186	METALKRAFT S A SISTEMAS AUTOMOTIVOS	9010178	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010178	2025-11-11 18:59:28.932	2025-11-11 18:59:28.964656	2025-11-11 18:59:28.964656
b5d694dc-878f-4563-b10d-fc7b7e29569b	TECHAL INDUST E COM CONJ TUBULARES LTDA	9010179	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010179	2025-11-11 18:59:28.991	2025-11-11 18:59:29.023719	2025-11-11 18:59:29.023719
e73e6785-6a3b-4ccd-96aa-ca1f2cb71b11	METALTORK INDUS E COMERAUTO PECAS LTDA	9010180	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010180	2025-11-11 18:59:29.051	2025-11-11 18:59:29.082878	2025-11-11 18:59:29.082878
9521da18-a8e6-47ad-9e75-90f9a36d5593	NOVA INJ SOB PRES COMER  PECAS IND LTDA	9010181	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010181	2025-11-11 18:59:29.11	2025-11-11 18:59:29.141831	2025-11-11 18:59:29.141831
a5422d76-97a1-4b57-b6d9-0e4400e3eac7	PRODUFLEX IND DE BORRACHAS LTDA	9010182	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010182	2025-11-11 18:59:29.169	2025-11-11 18:59:29.201425	2025-11-11 18:59:29.201425
3eae3211-a1e5-46aa-9dbb-50c1d5559d3d	COOPER-STANDARD AUTOMOTIVE BRASIL SEALIN	9010183	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010183	2025-11-11 18:59:29.228	2025-11-11 18:59:29.260323	2025-11-11 18:59:29.260323
8a11aa43-775e-412e-bbfa-52cc8e00f578	FLEXNGATE BRASIL INDUSTRIAL LTDA	9010184	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010184	2025-11-11 18:59:29.287	2025-11-11 18:59:29.319891	2025-11-11 18:59:29.319891
ae5cdc32-9e0c-4d10-b807-05a542090e71	FORMTAP INDUSTRIA E COMERCIO S/A	9010185	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010185	2025-11-11 18:59:29.347	2025-11-11 18:59:29.378868	2025-11-11 18:59:29.378868
ef5db64b-3c74-453b-a6d4-418c6fb21483	CUMMINS BRASIL LIMITADA	9010186	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010186	2025-11-11 18:59:29.406	2025-11-11 18:59:29.43778	2025-11-11 18:59:29.43778
3cde3a00-574b-44bb-94d2-8fee5cf2bd01	JAT TRANSPORTES E LOGISTICA S.A	9010187	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010187	2025-11-11 18:59:29.465	2025-11-11 18:59:29.497133	2025-11-11 18:59:29.497133
42606bb4-9fc5-4716-82b2-b35e0d3eba2e	AUTOMETAL S/A	9010188	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010188	2025-11-11 18:59:29.524	2025-11-11 18:59:29.556726	2025-11-11 18:59:29.556726
f7c46394-2fca-4771-81e7-6da9cd3aab33	DYSTRAY INDUSTRIA E COMERCIO EIRELI - EP	9010189	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010189	2025-11-11 18:59:29.584	2025-11-11 18:59:29.615888	2025-11-11 18:59:29.615888
8b63e089-fab1-4ce2-8f30-133a6b7f6963	THOMAS KL INDUSTRIA DE ALTO FALANTES SA	9010190	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010190	2025-11-11 18:59:29.643	2025-11-11 18:59:29.675265	2025-11-11 18:59:29.675265
9b01c07a-5be1-4214-85d9-7af2c6523767	METALURGICA MURCIA LTDA	9010191	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010191	2025-11-11 18:59:29.702	2025-11-11 18:59:29.734683	2025-11-11 18:59:29.734683
2f8aa41a-5f2a-45be-a056-3419f06047cd	CLIPTECH INDUSTRIA E COMERCIO LTDA	9010192	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010192	2025-11-11 18:59:29.762	2025-11-11 18:59:29.793768	2025-11-11 18:59:29.793768
ed3c6a6b-a5c1-48bf-bd6d-764ce2bd6eb4	SUMIRIKO DO BRASIL INDUSTRIA DE BORRACHA	9010193	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010193	2025-11-11 18:59:29.821	2025-11-11 18:59:29.852538	2025-11-11 18:59:29.852538
7ed70709-9477-4d0d-b37a-60335cb11e71	KYB-MANDO DO BRASIL FABRICANTE DE AUTOPE	9010194	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010194	2025-11-11 18:59:29.879	2025-11-11 18:59:29.911589	2025-11-11 18:59:29.911589
6221c088-96e9-4a93-938e-695242d5c30e	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010195	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010195	2025-11-11 18:59:29.938	2025-11-11 18:59:29.971059	2025-11-11 18:59:29.971059
5ec9d147-6077-4a0f-9ee5-651b7e13e853	S RIKO AUTOMOTIVE HOSE TECALON BRASIL S.	9010196	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010196	2025-11-11 18:59:29.998	2025-11-11 18:59:30.030632	2025-11-11 18:59:30.030632
fd5d6528-a590-4032-854f-c732f56141f1	ROCHLING AUTOMOTIVE DO BRASIL LTDA	9010197	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010197	2025-11-11 18:59:30.058	2025-11-11 18:59:30.08989	2025-11-11 18:59:30.08989
4e0ec7b5-78e4-4db5-8d82-a476d298cd72	MAHLE METAL LEVE S.A.	9010198	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010198	2025-11-11 18:59:30.117	2025-11-11 18:59:30.149528	2025-11-11 18:59:30.149528
e67f1ccd-4ef7-4047-b31f-3dfb33bd500c	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010199	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010199	2025-11-11 18:59:30.176	2025-11-11 18:59:30.208384	2025-11-11 18:59:30.208384
90a05664-6cb2-495c-8c65-71b688368363	NIDEC GPM DO BRASIL AUTOMOTIVA LTDA	9010200	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010200	2025-11-11 18:59:30.236	2025-11-11 18:59:30.268063	2025-11-11 18:59:30.268063
781f4a3d-fb0d-48ff-ab81-a2581fd8faad	TRIMTEC LTDA	9010201	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010201	2025-11-11 18:59:30.295	2025-11-11 18:59:30.32752	2025-11-11 18:59:30.32752
86fa048a-d144-4ed3-b7f5-cd2d0c97aaae	FAURECIA EMISSIONS CONTROL TECHNOLOGIES	9010202	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010202	2025-11-11 18:59:30.355	2025-11-11 18:59:30.386689	2025-11-11 18:59:30.386689
e05cef0a-10b6-49d8-935d-864e30209ede	INTEVA PRODUCTS SISTEMAS E COMPONENTES A	9010203	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010203	2025-11-11 18:59:30.416	2025-11-11 18:59:30.447906	2025-11-11 18:59:30.447906
f6854ab8-7f9b-4a15-8247-1c758a7410f9	ROBERT BOSCH LIMITADA	9010204	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010204	2025-11-11 18:59:30.475	2025-11-11 18:59:30.506942	2025-11-11 18:59:30.506942
94defc6b-8c66-4560-b556-db21c4248144	PLASTICOS MAUA LTDA	9010205	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010205	2025-11-11 18:59:30.534	2025-11-11 18:59:30.565102	2025-11-11 18:59:30.565102
e25e4d15-8333-4a0c-89fc-e37c186d9db0	INDUSTRIA METALURGICA FANANDRI LTDA	9010206	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010206	2025-11-11 18:59:30.593	2025-11-11 18:59:30.624064	2025-11-11 18:59:30.624064
7982488d-21fa-4fa4-90a1-4315bfd9e302	NEMAK ALUMINIO DO BRASIL LTDA	9010207	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010207	2025-11-11 18:59:30.651	2025-11-11 18:59:30.682045	2025-11-11 18:59:30.682045
f9faf429-adf2-4ad1-ae14-2625df539e17	CLICK AUTOMOTIVA INDUSTRIAL LTDA.	9010208	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010208	2025-11-11 18:59:30.709	2025-11-11 18:59:30.741319	2025-11-11 18:59:30.741319
a0c13f49-9978-47d9-88cf-4a901aacaa86	HIDROVER EQUIPAMENTOS HIDRAULICOS LTDA.	9010209	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010209	2025-11-11 18:59:30.768	2025-11-11 18:59:30.801336	2025-11-11 18:59:30.801336
3ef67084-9c5b-4ae8-ac24-be94d2bf7c75	METALAC SPS INDUSTRIA E COMERCIO LTDA.	9010210	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010210	2025-11-11 18:59:30.828	2025-11-11 18:59:30.860385	2025-11-11 18:59:30.860385
f1535a55-43ff-41ab-9032-f6bb472204bc	ELDORADO INDUSTRIAS PLASTICAS LTDA	9010211	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010211	2025-11-11 18:59:30.887	2025-11-11 18:59:30.919247	2025-11-11 18:59:30.919247
51cdad90-e959-4d00-a02c-c269286ff3a6	INDUSTRIA METALURGICA FRUM LTDA	9010212	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010212	2025-11-11 18:59:30.947	2025-11-11 18:59:30.979255	2025-11-11 18:59:30.979255
db37a78a-e0fc-4d4b-9b2f-443a6b02db92	PEUGEOT-CITROEN DO BRASIL AUTOMOVEIS LTD	9010213	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010213	2025-11-11 18:59:31.006	2025-11-11 18:59:31.037411	2025-11-11 18:59:31.037411
2568ab35-0243-4535-a1c0-ac9167c9f87b	FAURECIA EMISSIONS CONTROL TECHNOLOGIES	9010214	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010214	2025-11-11 18:59:31.064	2025-11-11 18:59:31.096518	2025-11-11 18:59:31.096518
3c2437e6-f42c-4d64-9de4-9d38bc936fce	FREUDENBERG-NOK COMPONENTES BRASIL LTDA	9010215	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010215	2025-11-11 18:59:31.123	2025-11-11 18:59:31.156037	2025-11-11 18:59:31.156037
011546f7-70ab-411a-8d00-024df9071f1f	CGE SOCIEDADE FABRICADORA DE PECAS PLAST	9010216	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010216	2025-11-11 18:59:31.183	2025-11-11 18:59:31.215068	2025-11-11 18:59:31.215068
1838888c-b14a-4e9e-90ca-426e03a83c03	ZANETTINI BAROSSI S A INDUSTRIA E COMERC	9010217	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010217	2025-11-11 18:59:31.242	2025-11-11 18:59:31.274007	2025-11-11 18:59:31.274007
94db7fe8-0113-4c87-af17-6a98a4f1832c	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010218	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010218	2025-11-11 18:59:31.301	2025-11-11 18:59:31.333001	2025-11-11 18:59:31.333001
6d036c85-5579-436f-b143-e6c3e5742a86	GLOBAL STEERING SYSTEMS DO BRASIL INDUST	9010219	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010219	2025-11-11 18:59:31.36	2025-11-11 18:59:31.391815	2025-11-11 18:59:31.391815
60d157f8-d8d7-4d5b-8ede-c5d75027166f	WAPMETAL INDUSTRIA E COMERCIO DE MOLAS E	9010220	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010220	2025-11-11 18:59:31.419	2025-11-11 18:59:31.450822	2025-11-11 18:59:31.450822
585f27fc-495f-42eb-8855-186d4b2b3c01	MAHLE METAL LEVE S.A.	9010221	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010221	2025-11-11 18:59:31.478	2025-11-11 18:59:31.509958	2025-11-11 18:59:31.509958
8dd9c573-333d-479e-902a-715ce80c0ed9	ZF DO BRASIL LTDA.	9010222	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010222	2025-11-11 18:59:31.537	2025-11-11 18:59:31.568655	2025-11-11 18:59:31.568655
33cb3b60-b2a1-41bd-bc5e-7e9e3beff183	METALURGICA QUASAR LTDA. EM RECUPERACAO	9010223	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010223	2025-11-11 18:59:31.596	2025-11-11 18:59:31.631365	2025-11-11 18:59:31.631365
c74c73a6-12b2-48fd-ba15-f8e43a5672a1	NICHIBRAS INDUSTRIA E COMERCIO LTDA	9010224	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010224	2025-11-11 18:59:31.66	2025-11-11 18:59:31.691774	2025-11-11 18:59:31.691774
12c4afd8-bc3f-4cde-9c27-d09bab273a45	RESIL COMERCIAL INDUSTRIAL LTDA	9010225	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010225	2025-11-11 18:59:31.719	2025-11-11 18:59:31.750556	2025-11-11 18:59:31.750556
5fd86e5e-8fec-4e9f-ac33-421d09ae7229	SIKA AUTOMOTIVE LTDA.	9010226	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010226	2025-11-11 18:59:31.777	2025-11-11 18:59:31.80957	2025-11-11 18:59:31.80957
8b57cfca-2667-45ea-bd08-a867d4b88aeb	INDUSTRIA METALURGICA MAXDEL LTDA	9010227	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010227	2025-11-11 18:59:31.836	2025-11-11 18:59:31.868719	2025-11-11 18:59:31.868719
12286d4e-f6ab-4339-8e69-fda3fc8d7399	KIDDE BRASIL LTDA.	9010228	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010228	2025-11-11 18:59:31.896	2025-11-11 18:59:31.92855	2025-11-11 18:59:31.92855
9d343e47-6c20-4eeb-9133-04ff2a5cdf12	ITESAPAR FUNDICAO S.A.	9010229	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010229	2025-11-11 18:59:31.955	2025-11-11 18:59:31.987318	2025-11-11 18:59:31.987318
8548e2a5-a79c-42a3-a3a1-fe93ad4fc871	DELGA INDUSTRIA E COMERCIO LTDA	9010230	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010230	2025-11-11 18:59:32.014	2025-11-11 18:59:32.046681	2025-11-11 18:59:32.046681
6744f283-b3c8-4a86-ae54-6ba494601362	FAURECIA AUTO DO BRASIL LTDA	9010231	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010231	2025-11-11 18:59:32.074	2025-11-11 18:59:32.106077	2025-11-11 18:59:32.106077
40c45fd5-8c84-4250-9c33-9cc6b24ca2ec	INDUSTRIA ARTEB S A	9010232	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010232	2025-11-11 18:59:32.133	2025-11-11 18:59:32.165086	2025-11-11 18:59:32.165086
1cbab9a5-ebae-4396-af5e-8f53fc67354c	DANA INDUSTRIAS LTDA	9010233	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010233	2025-11-11 18:59:32.192	2025-11-11 18:59:32.224206	2025-11-11 18:59:32.224206
e66f7662-103d-44c4-a71e-ba16355b2c4a	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010234	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010234	2025-11-11 18:59:32.251	2025-11-11 18:59:32.283242	2025-11-11 18:59:32.283242
223787a2-7dc6-4361-9721-feeb28578888	CLARION DO BRASIL LTDA	9010235	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010235	2025-11-11 18:59:32.31	2025-11-11 18:59:32.342546	2025-11-11 18:59:32.342546
58262e2e-b484-47e3-addf-9f7712e06464	CISER FIXADORES AUTOMOTIVOS SA	9010236	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010236	2025-11-11 18:59:32.37	2025-11-11 18:59:32.401592	2025-11-11 18:59:32.401592
dc37a5ad-427d-40ff-a2d5-2dab0a97dfdf	MULTIPARTS INDUSTRIA E COMERCIO EIRELI	9010237	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010237	2025-11-11 18:59:32.428	2025-11-11 18:59:32.460057	2025-11-11 18:59:32.460057
8ecdf4c6-6b19-4a05-8cea-eb239d89a9d7	SOGEFI FILTRATION DO BRASIL LTDA	9010238	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010238	2025-11-11 18:59:32.487	2025-11-11 18:59:32.519156	2025-11-11 18:59:32.519156
f45d290c-0a90-44b3-a9b4-c90a954d3809	VOLSWAGEN DO BRASIL INDUSTRIA DE VEICULO	9010239	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010239	2025-11-11 18:59:32.546	2025-11-11 18:59:32.578706	2025-11-11 18:59:32.578706
bded9b81-33de-4af7-885e-51cff5cc41d2	BRANDL DO BRASIL LTDA	9010240	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010240	2025-11-11 18:59:32.606	2025-11-11 18:59:32.638019	2025-11-11 18:59:32.638019
8b3ed1de-7934-46ae-ae61-ccb52c584734	AUTOMETAL SA	9010241	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010241	2025-11-11 18:59:32.665	2025-11-11 18:59:32.696079	2025-11-11 18:59:32.696079
a292b9d3-e293-4192-b27c-47fe1668c389	COOPER STANDARD AUTOMOTIVE BRASIL SEALIN	9010242	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010242	2025-11-11 18:59:32.723	2025-11-11 18:59:32.755349	2025-11-11 18:59:32.755349
339b385a-5dce-4c48-9af4-91b952b12dd8	JOYSON SAFETY SYSTEMS BRASIL LTDA	9010243	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010243	2025-11-11 18:59:32.782	2025-11-11 18:59:32.81436	2025-11-11 18:59:32.81436
4c817bd1-0906-4d42-b25b-9dfac9616a00	WEGMANN AUTOMOTIVE BRASIL LTDA	9010244	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010244	2025-11-11 18:59:32.841	2025-11-11 18:59:32.873525	2025-11-11 18:59:32.873525
0b2d79e3-56a7-447d-9649-857848f5991c	KATHREIN AUTOMOTIVE DO BRASIL LTDA	9010245	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010245	2025-11-11 18:59:32.901	2025-11-11 18:59:32.933194	2025-11-11 18:59:32.933194
3b799cf2-33fb-43f3-8c10-834204c06fbe	BINSIT COMPONENTES AUTOMOTIVOS LTDA	9010246	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010246	2025-11-11 18:59:32.96	2025-11-11 18:59:32.992373	2025-11-11 18:59:32.992373
bbcfd1ab-7129-49f2-b473-4c386a0c630a	YAZAKI DO BRASIL LTDA	9010247	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010247	2025-11-11 18:59:33.019	2025-11-11 18:59:33.051357	2025-11-11 18:59:33.051357
cee4e18f-4318-4e37-b92f-62a9f0c5a6a9	FUPRESA S A	9010248	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010248	2025-11-11 18:59:33.079	2025-11-11 18:59:33.11083	2025-11-11 18:59:33.11083
22192b62-7d1d-416b-a209-96eeeb5e116c	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010249	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010249	2025-11-11 18:59:33.138	2025-11-11 18:59:33.170101	2025-11-11 18:59:33.170101
39508c16-e51c-4102-a072-e2def6e37c94	WHB FUNDICAO S A	9010250	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010250	2025-11-11 18:59:33.197	2025-11-11 18:59:33.229066	2025-11-11 18:59:33.229066
7f65ea7a-560c-4eee-83e5-92abd7123205	INDUSTRIA DE ARTEFATOS PLASTICOS LTDA	9010251	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010251	2025-11-11 18:59:33.256	2025-11-11 18:59:33.289191	2025-11-11 18:59:33.289191
c0765b84-c60e-4a99-a649-6151bb72158e	VALEO SISTEMAS AUTOMOTIVOS LTDA	9010252	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010252	2025-11-11 18:59:33.316	2025-11-11 18:59:33.347887	2025-11-11 18:59:33.347887
ef39c486-8645-4a99-9a74-f36758b4216d	PILKINGTON BRASIL LTDA	9010253	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010253	2025-11-11 18:59:33.375	2025-11-11 18:59:33.406977	2025-11-11 18:59:33.406977
95ba63f8-8609-4eed-b072-2efb24b1be2b	TORO INDUSTRIA E COMERCIO LTDA	9010254	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010254	2025-11-11 18:59:33.434	2025-11-11 18:59:33.465756	2025-11-11 18:59:33.465756
f8f86c83-6535-4a7b-8361-3c03abf2dd1f	INDUSTRIA AUTO METALURGICA S A	9010255	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010255	2025-11-11 18:59:33.493	2025-11-11 18:59:33.524977	2025-11-11 18:59:33.524977
cd5acd63-834a-4fa4-b277-29aecd6d8e64	INDEMETAL INDUSTRIA DE ETIQUETAS METALIC	9010256	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010256	2025-11-11 18:59:33.552	2025-11-11 18:59:33.583984	2025-11-11 18:59:33.583984
b54f1494-3e2f-47b2-93cf-04faedb1d984	PLANMAR INDUSTRIA E COMERCIO DE PRODUTOS	9010257	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010257	2025-11-11 18:59:33.611	2025-11-11 18:59:33.642947	2025-11-11 18:59:33.642947
531c3fed-2326-4b73-b83b-b88b26ce6f1b	WEBASTO ROOF SYSTEMS BRASIL LTDA.	9010258	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010258	2025-11-11 18:59:33.67	2025-11-11 18:59:33.702094	2025-11-11 18:59:33.702094
81bf43a9-c457-4fc8-9f6c-b33631bdf767	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010259	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010259	2025-11-11 18:59:33.729	2025-11-11 18:59:33.774347	2025-11-11 18:59:33.774347
e836a5ae-bf1b-4e8e-9e9c-c7d8009344b9	ZF DO BRASIL LTDA.	9010260	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010260	2025-11-11 18:59:33.801	2025-11-11 18:59:33.833481	2025-11-11 18:59:33.833481
aa2fd9ca-6c54-4f1e-a313-f5f91abddca9	NEO RODAS S.A.	9010261	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010261	2025-11-11 18:59:33.862	2025-11-11 18:59:33.894225	2025-11-11 18:59:33.894225
adc5f4ed-8e49-4df8-8919-81860beed480	SMP AUTOMOTIVE PRODUTOS AUTOMOTIVOS DO B	9010262	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010262	2025-11-11 18:59:33.921	2025-11-11 18:59:33.954059	2025-11-11 18:59:33.954059
24005aba-8d20-4f83-85e3-283f4d181bef	BROSE DO BRASIL LTDA	9010263	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010263	2025-11-11 18:59:33.981	2025-11-11 18:59:34.01208	2025-11-11 18:59:34.01208
d91a0272-8f45-4d03-b5e1-438828ee4df0	SMP AUTOMOTIVE PRODUTOS AUTOMOTIVOS DO B	9010264	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010264	2025-11-11 18:59:34.039	2025-11-11 18:59:34.070044	2025-11-11 18:59:34.070044
c4f8a28b-cd0f-442f-9046-c71da4e73f58	PLASTICOS PREMIUM PACK INDUSTRIA E COMER	9010265	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010265	2025-11-11 18:59:34.097	2025-11-11 18:59:34.128144	2025-11-11 18:59:34.128144
52fb70c5-c35e-4367-9cce-72d6547067e7	BONTAZ CENTRE DO BRASIL INDUSTRIA E COME	9010266	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010266	2025-11-11 18:59:34.155	2025-11-11 18:59:34.189099	2025-11-11 18:59:34.189099
b6b948e5-50fd-4752-90a0-1a425a9a1b25	METAL TECNICA BOVENAU LTDA	9010267	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010267	2025-11-11 18:59:34.216	2025-11-11 18:59:34.249368	2025-11-11 18:59:34.249368
b46c92f8-1d0a-4d7b-9f24-35dd32bd44a8	PILKINGTON BRASIL LTDA	9010268	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010268	2025-11-11 18:59:34.277	2025-11-11 18:59:34.30863	2025-11-11 18:59:34.30863
17a18910-45aa-4ba0-a2b7-2245bf72116e	AMVIAN INDUSTRIA E COMERCIO DE PECAS AUT	9010269	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010269	2025-11-11 18:59:34.336	2025-11-11 18:59:34.368078	2025-11-11 18:59:34.368078
ce87e1a5-157f-46cf-8c7e-8a802faea3e9	VIBRACOUSTIC SOUTH AMERICA LTDA	9010270	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010270	2025-11-11 18:59:34.395	2025-11-11 18:59:34.426794	2025-11-11 18:59:34.426794
11d98a93-fd2c-44c5-a1b1-31d11f95b225	KATHREIN AUTOMOTIVE DO BRASIL LTDA	9010271	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010271	2025-11-11 18:59:34.455	2025-11-11 18:59:34.487002	2025-11-11 18:59:34.487002
9052c50b-9582-4e9e-89f3-2880a443b1f2	BORGWARNER EMISSIONS SYSTEMS LTDA.	9010272	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010272	2025-11-11 18:59:34.514	2025-11-11 18:59:34.545014	2025-11-11 18:59:34.545014
b52e45c0-0c1c-4718-a2c6-0448b25593aa	ALEXANDRE CARVALHO OLIVEIRA 91706440987	9010273	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010273	2025-11-11 18:59:34.572	2025-11-11 18:59:34.603938	2025-11-11 18:59:34.603938
edb30e3a-7912-43bb-8820-e297c0626b43	Z.H.S INDUSTRIA E COMERCIO LTDA	9010274	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010274	2025-11-11 18:59:34.631	2025-11-11 18:59:34.663153	2025-11-11 18:59:34.663153
54391a1e-e266-4f3e-bde4-556c3f36fa5e	MAXION WHEELS DO BRASIL LTDA.	9010275	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010275	2025-11-11 18:59:34.691	2025-11-11 18:59:34.722992	2025-11-11 18:59:34.722992
7895e85c-f946-401c-b504-706cf57c28a0	AUTOMETAL S/A	9010276	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010276	2025-11-11 18:59:34.75	2025-11-11 18:59:34.782049	2025-11-11 18:59:34.782049
3a461b1f-84df-48ff-b700-9d1abcd27398	MAC INDUSTRIA MECANICA LTDA	9010277	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010277	2025-11-11 18:59:34.809	2025-11-11 18:59:34.840165	2025-11-11 18:59:34.840165
598e6f14-562d-41c3-9d05-fc5bbe155d82	EATON LTDA	9010278	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010278	2025-11-11 18:59:34.867	2025-11-11 18:59:34.89914	2025-11-11 18:59:34.89914
a85241f8-1626-41c0-87a0-8fec2cc3ca48	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS E C	9010279	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010279	2025-11-11 18:59:34.926	2025-11-11 18:59:34.957857	2025-11-11 18:59:34.957857
2abf0c77-2494-4111-8cb9-08aff88a26f7	SAARGUMMI DO BRASIL LTDA	9010280	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010280	2025-11-11 18:59:34.985	2025-11-11 18:59:35.017097	2025-11-11 18:59:35.017097
aefdb580-6617-4f00-9de1-75b8ef08ba4d	MATRIZ	4	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	4	2025-11-11 18:59:51.3	2025-11-11 18:59:51.332035	2025-11-11 18:59:51.332035
0462f484-bcf9-487b-9e63-28e48a39b1d7	VMG INDUSTRIA METALURGICA LTDA	9010281	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010281	2025-11-11 18:59:35.044	2025-11-11 18:59:35.075914	2025-11-11 18:59:35.075914
85c27e79-2ff0-48d3-97aa-18e112750329	NSK BRASIL LTDA	9010282	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010282	2025-11-11 18:59:35.103	2025-11-11 18:59:35.135151	2025-11-11 18:59:35.135151
ef244e4d-b5ab-46af-b6b6-4b5af5a27853	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS IND	9010283	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010283	2025-11-11 18:59:35.162	2025-11-11 18:59:35.19432	2025-11-11 18:59:35.19432
0bf0eb8d-8b4a-48ac-bd97-27fd9395f839	NIKEN INDUSTRIA E COMERCIO METALURGICA L	9010284	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010284	2025-11-11 18:59:35.221	2025-11-11 18:59:35.253456	2025-11-11 18:59:35.253456
9936f624-a671-43f4-834b-d2e8d5a174bc	VOLKSWAGEN DO BRASIL INDUSTRIA DE VEICUL	9010285	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010285	2025-11-11 18:59:35.28	2025-11-11 18:59:35.312667	2025-11-11 18:59:35.312667
75f78b3f-122f-42f3-bf0c-747ee7c4b40e	PARKER HANNIFIN INDUSTRIA E COMERCIO LTD	9010286	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010286	2025-11-11 18:59:35.34	2025-11-11 18:59:35.371851	2025-11-11 18:59:35.371851
45426d09-9ed9-4725-b0f9-a8b0ea28b14f	METALURGICA SUPRENS LTDA	9010287	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010287	2025-11-11 18:59:35.399	2025-11-11 18:59:35.431098	2025-11-11 18:59:35.431098
aded3a52-fd55-44c8-9825-586d09f0b1dd	IRMAOS PARASMO SA INDUSTRIA MECANICA	9010288	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010288	2025-11-11 18:59:35.459	2025-11-11 18:59:35.491239	2025-11-11 18:59:35.491239
b978c7e4-7dd5-4afa-9d8c-68cc33ea6ba4	AUTO PARTS ALUMINIO DO BRASIL LTDA	9010289	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010289	2025-11-11 18:59:35.519	2025-11-11 18:59:35.553538	2025-11-11 18:59:35.553538
d316180c-ac06-4ee0-91b1-ec2ee4aaa2ca	MAHLE METAL LEVE S.A.	9010290	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010290	2025-11-11 18:59:35.58	2025-11-11 18:59:35.612564	2025-11-11 18:59:35.612564
98e35d68-48b0-4df2-a891-03cae06c7055	FUJIKURA AUTOMOTIVE DO BRASIL LTDA.	9010291	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010291	2025-11-11 18:59:35.639	2025-11-11 18:59:35.671388	2025-11-11 18:59:35.671388
ad553756-560d-4aef-9e39-3764f3ff917f	SIKA S A	9010292	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010292	2025-11-11 18:59:35.699	2025-11-11 18:59:35.730747	2025-11-11 18:59:35.730747
9c19c289-6c1d-4faf-8fd6-105250cb5e76	VARROC DO BRASIL COMERCIO, IMPORTACAO E	9010293	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010293	2025-11-11 18:59:35.758	2025-11-11 18:59:35.790381	2025-11-11 18:59:35.790381
07599e8c-e3f5-43f7-84df-6cb559893536	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010294	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010294	2025-11-11 18:59:35.817	2025-11-11 18:59:35.84931	2025-11-11 18:59:35.84931
6c9f5a5f-ded0-424e-af76-8067bfcd3884	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010295	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010295	2025-11-11 18:59:35.876	2025-11-11 18:59:35.909113	2025-11-11 18:59:35.909113
fc5fcce0-9914-4285-b421-ed797438665f	THYSSENKRUPP BRASIL LTDA.	9010296	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010296	2025-11-11 18:59:35.936	2025-11-11 18:59:35.968164	2025-11-11 18:59:35.968164
f9c15c1b-cd9f-4c15-91b6-3aca511054ac	FOCUS TECNOLOGIA DE PLASTICOS S/A	9010297	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010297	2025-11-11 18:59:35.995	2025-11-11 18:59:36.027087	2025-11-11 18:59:36.027087
04418f8c-c889-475f-87da-16349da27cf4	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010298	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010298	2025-11-11 18:59:36.054	2025-11-11 18:59:36.086355	2025-11-11 18:59:36.086355
b732e1fd-b54c-4d7a-8e24-9c9a5572c486	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010299	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010299	2025-11-11 18:59:36.113	2025-11-11 18:59:36.145423	2025-11-11 18:59:36.145423
7a80eb74-bcd8-4c22-900f-c083f60c7218	BINS INDUSTRIA DE ARTEFATOS DE BORRACHA	9010300	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010300	2025-11-11 18:59:36.172	2025-11-11 18:59:36.204674	2025-11-11 18:59:36.204674
4e1d84b9-d0f8-4aae-ba31-464a6ecee2f5	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010301	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010301	2025-11-11 18:59:36.232	2025-11-11 18:59:36.263378	2025-11-11 18:59:36.263378
b21c4aa8-209e-45cc-aade-909e0e24b108	ASPOL INDUSTRIA E COMERCIO LTDA	9010302	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010302	2025-11-11 18:59:36.29	2025-11-11 18:59:36.322756	2025-11-11 18:59:36.322756
ad29676a-f35b-4567-8e3b-743d1a98edab	ENGEMET INDUSTRIA E COMERCIO DE EQUIPAME	9010303	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010303	2025-11-11 18:59:36.35	2025-11-11 18:59:36.381994	2025-11-11 18:59:36.381994
33189555-7359-4fe6-8b63-6d8db5894565	THYSSENKRUPP BRASIL LTDA.	9010304	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010304	2025-11-11 18:59:36.409	2025-11-11 18:59:36.441153	2025-11-11 18:59:36.441153
eb668286-eff4-4a13-a53e-3eb6ce6436b1	METALURGICA FEY LTDA	9010305	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010305	2025-11-11 18:59:36.47	2025-11-11 18:59:36.502048	2025-11-11 18:59:36.502048
1b3a853f-36c8-42c4-9c23-e75f1e2a82e3	AUTO PARTS ALUMINIO DO BRASIL LTDA	9010306	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010306	2025-11-11 18:59:36.529	2025-11-11 18:59:36.561184	2025-11-11 18:59:36.561184
d9c0f277-c3e9-4f67-a671-7a338dc94f38	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010307	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010307	2025-11-11 18:59:36.589	2025-11-11 18:59:36.620901	2025-11-11 18:59:36.620901
1cd05353-fa83-4335-ae5f-13e23adcec2d	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010308	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010308	2025-11-11 18:59:36.648	2025-11-11 18:59:36.67998	2025-11-11 18:59:36.67998
6f189cc2-25aa-4de7-826c-1070ec1e673d	AUDI DO BRASIL INDUSTRIA E COMERCIO DE V	9010309	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010309	2025-11-11 18:59:36.707	2025-11-11 18:59:36.738981	2025-11-11 18:59:36.738981
6b18dc64-f13c-48f5-9966-7f62e3354c49	REAL MECANICA DE PRECISAO EIRELI	9010310	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010310	2025-11-11 18:59:36.766	2025-11-11 18:59:36.798119	2025-11-11 18:59:36.798119
a030cb73-419f-46ae-a6c9-cbb803d80ff7	QUALIFLEX PRODUTOS TÃ‰CNICOS DE BORRACHA	9010311	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010311	2025-11-11 18:59:36.825	2025-11-11 18:59:36.856152	2025-11-11 18:59:36.856152
a7babd08-7ff2-4b5f-ac36-52a00f0c3b63	SCHLEMMER DO BRASIL	9010312	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010312	2025-11-11 18:59:36.883	2025-11-11 18:59:36.915916	2025-11-11 18:59:36.915916
08f86517-7370-49d6-b24c-0513e62e454d	OMRCOMPONENTES AUTOMOTIVOS LTDA	9010313	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010313	2025-11-11 18:59:36.943	2025-11-11 18:59:36.975113	2025-11-11 18:59:36.975113
3feea67c-e236-438e-a128-87a1fc61f65f	KNORR BREMSE SPVC LTDA	9010314	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010314	2025-11-11 18:59:37.002	2025-11-11 18:59:37.033891	2025-11-11 18:59:37.033891
374d5d5f-e2d1-45e3-ae6d-f4f90add1374	NYCOL - PLAST INDUSTRIA E COMERCIO LTDA	9010315	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010315	2025-11-11 18:59:37.061	2025-11-11 18:59:37.093129	2025-11-11 18:59:37.093129
0c8c2798-04f2-4fe1-bd46-2d1b89591613	MAN LATIN AMERICA INDUSTRIA E COMERCIO D	9010316	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010316	2025-11-11 18:59:37.12	2025-11-11 18:59:37.152212	2025-11-11 18:59:37.152212
dc6f30cc-7f6c-420a-81c2-4445d059e8bc	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010317	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010317	2025-11-11 18:59:37.179	2025-11-11 18:59:37.211167	2025-11-11 18:59:37.211167
8e7f1a27-8e7c-4146-bb4c-a2abac6d921b	ENGEMET METALURGIA E COMERCIO LTDA	9010318	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010318	2025-11-11 18:59:37.244	2025-11-11 18:59:37.283416	2025-11-11 18:59:37.283416
ceeb2408-9cef-4415-a487-b99cebc624ff	KONGSBERG AUTOMOTIVE LTDA	9010319	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010319	2025-11-11 18:59:37.31	2025-11-11 18:59:37.351219	2025-11-11 18:59:37.351219
795e7e9d-1a5d-4336-9ce8-c1c804c50b51	FIPLAS INDUSTRIA E COMERCIO LTDA	9010320	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010320	2025-11-11 18:59:37.379	2025-11-11 18:59:37.411922	2025-11-11 18:59:37.411922
ef7e1eec-237c-42de-8393-ec4fe1c442b2	ENARPE SERVICOS E SOLUCOES AMBIENTAIS LT	9010321	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010321	2025-11-11 18:59:37.439	2025-11-11 18:59:37.473006	2025-11-11 18:59:37.473006
15517c1b-ecbf-4e31-a410-994906193575	METAL. MAUSER INDUSTRIAL E COMERCIO LTDA	9010322	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010322	2025-11-11 18:59:37.501	2025-11-11 18:59:37.541305	2025-11-11 18:59:37.541305
84d3bf46-bcdb-4650-b838-aff94f0a2731	BLEISTAHL BRASIL METALURGIA LTDA	9010323	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010323	2025-11-11 18:59:37.569	2025-11-11 18:59:37.600856	2025-11-11 18:59:37.600856
63be5532-ba7a-417d-9b2a-d449bf204e72	MCP TRANSPORTES RODOVIARIOS S/A	9010324	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010324	2025-11-11 18:59:37.628	2025-11-11 18:59:37.659801	2025-11-11 18:59:37.659801
fbe2dc64-3d49-4fcb-864c-82330d8c4991	COMPONENT INDUSTRIA E COMERCIO LTDA	9010325	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010325	2025-11-11 18:59:37.687	2025-11-11 18:59:37.718918	2025-11-11 18:59:37.718918
78c75bfa-aa18-4fa2-a193-b100447492f0	METALAC INDUSTRIA E COMERCIO LTDA.	9010326	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010326	2025-11-11 18:59:37.746	2025-11-11 18:59:37.777708	2025-11-11 18:59:37.777708
b41a4e09-6da2-4a4e-b209-f6db84d0cb1f	W. D. COMERCIO DE PECAS E ACESSORIOS PAR	9010327	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010327	2025-11-11 18:59:37.805	2025-11-11 18:59:37.837664	2025-11-11 18:59:37.837664
5f3b2ea2-3be3-4b08-ace2-a2020971300f	H.SILVA INJEÃ‡AO DE TERMOPLASTICOS	9010328	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010328	2025-11-11 18:59:37.867	2025-11-11 18:59:37.899923	2025-11-11 18:59:37.899923
7592d2ac-43ba-473c-96b7-59f92e658f99	INYLBRA INDUSTRIA E COMERCIO LTDA	9010329	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010329	2025-11-11 18:59:37.928	2025-11-11 18:59:37.959982	2025-11-11 18:59:37.959982
9ad094c4-ecbe-49dd-b46f-114453382058	ZF DO BRASIL LTDA	9010330	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010330	2025-11-11 18:59:37.987	2025-11-11 18:59:38.01902	2025-11-11 18:59:38.01902
2ea20456-7156-4d25-a042-fe22f7243ac8	COBRA METAIS DECORATIVOS LTDA	9010331	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010331	2025-11-11 18:59:38.046	2025-11-11 18:59:38.07824	2025-11-11 18:59:38.07824
b55bff87-5c31-4029-8e81-4801b2f715f9	COOPER-STANDARD AUTOMOTIVE BRASIL SEALIN	9010332	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010332	2025-11-11 18:59:38.107	2025-11-11 18:59:38.142527	2025-11-11 18:59:38.142527
c48ae267-5480-4cd5-ac41-63ff8b6ffa1e	MDA DO BRASIL INDUSTRIA E COMERCIO EIREL	9010333	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010333	2025-11-11 18:59:38.171	2025-11-11 18:59:38.269184	2025-11-11 18:59:38.269184
99683b9f-4990-41d0-a552-4e73dbbb06bf	PRICOL DO BRASIL COMPONENTES AUTOMOTIVOS	9010334	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010334	2025-11-11 18:59:38.297	2025-11-11 18:59:38.329277	2025-11-11 18:59:38.329277
cfaab75c-a04f-405c-8e80-0e0c8073b939	ROBERT BOSCH DIRECAO AUTOMOTIVA LTDA	9010335	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010335	2025-11-11 18:59:38.357	2025-11-11 18:59:38.392396	2025-11-11 18:59:38.392396
d2747c20-aeff-48a4-b2a5-371c8717920d	SUNNINGDALE TECH PLASTICOS (BRASIL) LTDA	9010336	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010336	2025-11-11 18:59:38.424	2025-11-11 18:59:38.457247	2025-11-11 18:59:38.457247
496a0d96-d9bd-4da5-9dcd-84aee19bb3ef	TEKSID DO BRASIL LTDA	9010337	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010337	2025-11-11 18:59:38.491	2025-11-11 18:59:38.526299	2025-11-11 18:59:38.526299
3b04238f-7af5-4f44-b8de-d5869edc8db2	D. DE S. SALES MANUTENCAO	9010338	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010338	2025-11-11 18:59:38.562	2025-11-11 18:59:38.593686	2025-11-11 18:59:38.593686
c4683fcd-de86-4c37-8ba9-bb3aaa2da2ee	FEDERAL-MOGUL SISTEMAS AUTOMOTIVOS LTDA.	9010339	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010339	2025-11-11 18:59:38.622	2025-11-11 18:59:38.654361	2025-11-11 18:59:38.654361
ba614a96-a423-410e-82e3-2304b092568e	FCA FIAT CHRYSLER AUTOMOVEIS BRASIL LTDA	9010340	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010340	2025-11-11 18:59:38.683	2025-11-11 18:59:38.715359	2025-11-11 18:59:38.715359
3c059a2b-256a-473a-8177-166d2d004de6	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS IND	9010341	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010341	2025-11-11 18:59:38.743	2025-11-11 18:59:38.775744	2025-11-11 18:59:38.775744
a2aedb18-3c24-4c4c-bbc5-042ceedbdcfc	SANOH DO BRASIL INDUSTRIA E COMERCIO DE	9010342	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010342	2025-11-11 18:59:38.804	2025-11-11 18:59:38.8358	2025-11-11 18:59:38.8358
84a16034-e300-4226-9d8f-0c5cef0c59c0	SOCIEDADE COMERCIAL TOYOTA TSUSHO DO BRA	9010343	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010343	2025-11-11 18:59:38.864	2025-11-11 18:59:38.895782	2025-11-11 18:59:38.895782
f768bc44-84f0-4efd-85a3-91ed19dc4689	PARANOA INDUSTRIA DE BORRACHA LTDA.	9010344	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010344	2025-11-11 18:59:38.924	2025-11-11 18:59:38.956041	2025-11-11 18:59:38.956041
47288c90-d36d-44e2-adcd-e8b89f526b21	FCA POWERTRAIN BRASIL INDUSTRIA E COMERC	9010345	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010345	2025-11-11 18:59:38.984	2025-11-11 18:59:39.016197	2025-11-11 18:59:39.016197
c63fd8ef-e098-4fbe-b8ee-de67915d4669	PLASTICOS NOVEL SAO PAULO LTDA.	9010346	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010346	2025-11-11 18:59:39.045	2025-11-11 18:59:39.077284	2025-11-11 18:59:39.077284
57be0f0d-abaf-486e-8d10-7f270aa146b4	TEKNIA BRASIL LTDA.	9010347	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010347	2025-11-11 18:59:39.105	2025-11-11 18:59:39.137572	2025-11-11 18:59:39.137572
44ec5f66-29ad-4d28-93d5-f837c9ddb692	SKF DO BRASIL LTDA	9010348	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010348	2025-11-11 18:59:39.165	2025-11-11 18:59:39.197599	2025-11-11 18:59:39.197599
20e61975-bc23-43c4-858d-f5eb201b6747	VOLVO DO BRASIL VEICULOS LTDA	9010349	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010349	2025-11-11 18:59:39.225	2025-11-11 18:59:39.257917	2025-11-11 18:59:39.257917
db1daded-b0a2-452a-bfc9-ecbfcec8357c	GT TECHNOLOGIES DO BRASIL COMPONENTES AU	9010350	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010350	2025-11-11 18:59:39.286	2025-11-11 18:59:39.326976	2025-11-11 18:59:39.326976
709e8c08-497f-4841-9089-5d68f64d86d9	TESA BRASIL LTDA	9010351	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010351	2025-11-11 18:59:39.355	2025-11-11 18:59:39.387588	2025-11-11 18:59:39.387588
3e9da3e6-a345-406c-b018-3cf3357d7dd7	KONNECT INDUSTRIA E COMERCIO LTDA	9010352	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010352	2025-11-11 18:59:39.415	2025-11-11 18:59:39.447557	2025-11-11 18:59:39.447557
219493d6-2a18-4038-9144-33da6c75c129	SCHULZ S/A	9010353	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010353	2025-11-11 18:59:39.476	2025-11-11 18:59:39.508268	2025-11-11 18:59:39.508268
6d4ecbbc-c758-4ef4-9714-c1312e025c22	VETORE INDUSTRIA E COMERCIO DE AUTOPECAS	9010354	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010354	2025-11-11 18:59:39.537	2025-11-11 18:59:39.56811	2025-11-11 18:59:39.56811
717d77e4-55a1-4dcb-aca3-b6de175ab2a5	TUBODIN INDUSTRIAL LTDA	9010355	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010355	2025-11-11 18:59:39.596	2025-11-11 18:59:39.628005	2025-11-11 18:59:39.628005
04431c40-c992-4552-aca3-4ddd63618587	ISEL USINAGEM E MECANICA EM GERAL LTDA	9010356	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010356	2025-11-11 18:59:39.656	2025-11-11 18:59:39.688387	2025-11-11 18:59:39.688387
4bb970dc-b38a-4201-8646-40507c3d2285	PELZER DA BAHIA LTDA	9010357	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010357	2025-11-11 18:59:39.716	2025-11-11 18:59:39.748752	2025-11-11 18:59:39.748752
7fe5e23d-d845-4da4-a35b-d8ca8cd2b629	ETHOS INDUSTRIAL LTDA.	9010358	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010358	2025-11-11 18:59:39.777	2025-11-11 18:59:39.808963	2025-11-11 18:59:39.808963
eb9340f7-d874-4353-8ed8-015c7c3abcdb	GRANACO FUNDICAO LTDA.	9010359	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010359	2025-11-11 18:59:39.837	2025-11-11 18:59:39.868798	2025-11-11 18:59:39.868798
8a4a17ac-5f5e-4d7b-95c4-8fd34efadbb0	EATON LTDA	9010360	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010360	2025-11-11 18:59:39.897	2025-11-11 18:59:39.928928	2025-11-11 18:59:39.928928
bb4b9a1b-5ff5-497b-9639-a39fde5fe4be	BATZ LIGHTWEIGHT SYSTEMS DO BRASIL LTDA	9010361	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010361	2025-11-11 18:59:39.957	2025-11-11 18:59:39.989676	2025-11-11 18:59:39.989676
94754009-f26d-4a45-ac2d-42d87effc5d3	DICASTAL DO BRASIL PECAS PARA VEICULOS L	9010362	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010362	2025-11-11 18:59:40.018	2025-11-11 18:59:40.049833	2025-11-11 18:59:40.049833
46dedb4a-45f8-4c84-a489-04015b212836	FUJI AUTOTECH AUTOPECAS DO BRASIL LTDA	9010363	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010363	2025-11-11 18:59:40.078	2025-11-11 18:59:40.110034	2025-11-11 18:59:40.110034
ad893ef8-9065-4a0f-811f-b1b55f01783d	VOLVO DO BRASIL VEICULOS LTDA	9010365	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010365	2025-11-11 18:59:40.138	2025-11-11 18:59:40.169177	2025-11-11 18:59:40.169177
b4e253e9-c640-4661-ab16-28b5e5c7e1a1	BRIENZI USINAGEM EIRELI	9010366	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010366	2025-11-11 18:59:40.197	2025-11-11 18:59:40.229497	2025-11-11 18:59:40.229497
e9916f53-d43f-4a50-b922-d727afa2c78f	ELDOR DO BRASIL COMPONENTES AUTOMOTIVOS	9010367	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010367	2025-11-11 18:59:40.257	2025-11-11 18:59:40.289511	2025-11-11 18:59:40.289511
7f670125-faf2-465d-a3ba-750f924f471a	LQ REPRESENTACOES	9010368	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010368	2025-11-11 18:59:40.318	2025-11-11 18:59:40.349198	2025-11-11 18:59:40.349198
ba672b18-57d3-435b-9ae4-17a27be40ca3	TUPER S/A	9010369	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010369	2025-11-11 18:59:40.377	2025-11-11 18:59:40.409532	2025-11-11 18:59:40.409532
7c89dc9b-f995-473d-9b5f-de1166581b05	HENGST INDUSTRIA DE FILTROS LTDA	9010370	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010370	2025-11-11 18:59:40.437	2025-11-11 18:59:40.470001	2025-11-11 18:59:40.470001
d3c93c1f-0343-4283-9150-08c9078d78e0	TI BRASIL INDUSTRIA E COMERCIO LTDA	9010371	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010371	2025-11-11 18:59:40.498	2025-11-11 18:59:40.530085	2025-11-11 18:59:40.530085
18bf9f7d-fc71-414a-8da2-d0a1e2050af4	MARTINREA HONSEL BRASIL FUNDICAO E COMER	9010372	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010372	2025-11-11 18:59:40.558	2025-11-11 18:59:40.590219	2025-11-11 18:59:40.590219
196e9a5f-da44-438b-8407-9f15af1ea732	SKY CORTE LASER EIRELI	9010373	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010373	2025-11-11 18:59:40.618	2025-11-11 18:59:40.650101	2025-11-11 18:59:40.650101
dd0ca9bb-92ec-4eea-969b-2627d1ef0081	SMR AUTOMOTIVE BRASIL LTDA.	9010374	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010374	2025-11-11 18:59:40.678	2025-11-11 18:59:40.710197	2025-11-11 18:59:40.710197
46065e58-e33e-4401-a60c-7b60ca66a8bd	TENNECO AUTOMOTIVE BRASIL LTDA	9010375	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010375	2025-11-11 18:59:40.738	2025-11-11 18:59:40.770646	2025-11-11 18:59:40.770646
72a439ee-7591-47af-93d2-f5e5ac56bdb5	SEG AUTOMOTIVE COMPONENTS BRAZIL LTDA.	9010376	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010376	2025-11-11 18:59:40.799	2025-11-11 18:59:40.831162	2025-11-11 18:59:40.831162
577f499b-5f21-46b6-bb61-8f14142cc9bc	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010377	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010377	2025-11-11 18:59:40.859	2025-11-11 18:59:40.891831	2025-11-11 18:59:40.891831
5db4a076-0a82-4162-986a-a34ace471660	GILVANEY SANTOS ASSUMPCAO	9010378	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010378	2025-11-11 18:59:40.92	2025-11-11 18:59:40.951686	2025-11-11 18:59:40.951686
43fc7c41-3b78-43c3-ab8c-b0f76c90b3bc	MAN LATIN AMERICA INDUSTRIA E COMERCIO D	9010379	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010379	2025-11-11 18:59:40.98	2025-11-11 18:59:41.011951	2025-11-11 18:59:41.011951
2ae8bb06-7dde-4ed4-8beb-415ae48f29c5	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010380	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010380	2025-11-11 18:59:41.04	2025-11-11 18:59:41.072222	2025-11-11 18:59:41.072222
07efe406-47a3-4d35-b6cb-7fb3eeaf117b	VETORE INDUSTRIA E COMERCIO DE AUTOPECAS	9010381	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010381	2025-11-11 18:59:41.1	2025-11-11 18:59:41.132391	2025-11-11 18:59:41.132391
8088e7ce-be6c-4742-8711-3b57c45ef35e	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010382	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010382	2025-11-11 18:59:41.161	2025-11-11 18:59:41.193047	2025-11-11 18:59:41.193047
809ba75c-c0cd-4683-92c7-e1cf514a0db2	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010383	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010383	2025-11-11 18:59:41.221	2025-11-11 18:59:41.253396	2025-11-11 18:59:41.253396
03441ccd-9b0e-42ff-9a13-10f416380383	BRIENZE USINAGEM EIRELI	9010384	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010384	2025-11-11 18:59:41.281	2025-11-11 18:59:41.313538	2025-11-11 18:59:41.313538
118c7c1d-e8a2-464d-92ce-4b8a38ca8013	GILVANEY SANTOS ASSUMPCAO	9010385	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010385	2025-11-11 18:59:41.341	2025-11-11 18:59:41.373629	2025-11-11 18:59:41.373629
ff1be788-16c5-490e-8c2f-b9074ef835ca	C R W INDUSTRIA E COMERCIO DE PLASTICOS	9010386	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010386	2025-11-11 18:59:41.402	2025-11-11 18:59:41.433797	2025-11-11 18:59:41.433797
7bf10683-5199-4112-86a6-e1bb4316cfca	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010387	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010387	2025-11-11 18:59:41.462	2025-11-11 18:59:41.494425	2025-11-11 18:59:41.494425
e6b06316-a1a6-4c3c-924f-b1365573c604	SIAN - SISTEMAS DE ILUMINACAO AUTOMOTIVA	9010388	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010388	2025-11-11 18:59:41.522	2025-11-11 18:59:41.55442	2025-11-11 18:59:41.55442
91b1eb3a-131f-4649-87c9-b8d250faebb3	SCHULZ S/A	9010389	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010389	2025-11-11 18:59:41.582	2025-11-11 18:59:41.614839	2025-11-11 18:59:41.614839
32bd81c9-be7c-413c-830f-ce790d4085e0	AUTOMETAL S/A	9010390	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010390	2025-11-11 18:59:41.643	2025-11-11 18:59:41.675506	2025-11-11 18:59:41.675506
dc2f4cd6-14b9-43de-b3b9-ae006a55e444	PELZER DA BAHIA LTDA	9010391	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010391	2025-11-11 18:59:41.703	2025-11-11 18:59:41.735441	2025-11-11 18:59:41.735441
87e0540a-442a-4635-afb6-019c4b4e0ca2	MEGATECH BRASIL COMPONENTES AUTOMOTIVOS	9010392	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010392	2025-11-11 18:59:41.763	2025-11-11 18:59:41.795882	2025-11-11 18:59:41.795882
8aac2751-96e0-475b-a248-6cb4457546a3	AUTOLIV DO BRASIL LTDA	9010393	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010393	2025-11-11 18:59:41.825	2025-11-11 18:59:41.856747	2025-11-11 18:59:41.856747
3fc9ca62-5845-4136-bf55-3e26d732f164	ALPINO INDUSTRIA METALURGICA LTDA	9010394	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010394	2025-11-11 18:59:41.885	2025-11-11 18:59:41.917592	2025-11-11 18:59:41.917592
ceb28f9f-c1d1-4dda-87bb-b1048597ad09	PELZER DO BRASIL LTDA	9010395	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010395	2025-11-11 18:59:41.946	2025-11-11 18:59:41.977739	2025-11-11 18:59:41.977739
a112e418-76f1-46fd-a4ca-8e1cfe9e5c30	HI-LEX DO BRASIL LTDA.	9010396	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010396	2025-11-11 18:59:42.006	2025-11-11 18:59:42.037922	2025-11-11 18:59:42.037922
b60e52f0-dff0-4cc0-8501-e0d6102224e8	MAGIUS METALURGICA INDUSTRIAL LTDA	9010397	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010397	2025-11-11 18:59:42.066	2025-11-11 18:59:42.097995	2025-11-11 18:59:42.097995
b25931b9-f611-43f4-850c-e77e356f2114	LC PECAS TECNICAS EM ESPUMAS - EIRELI	9010398	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010398	2025-11-11 18:59:42.126	2025-11-11 18:59:42.159076	2025-11-11 18:59:42.159076
c6a49c8a-7ffc-4c1b-83a4-dc56599a5a06	PELZER DA BAHIA LTDA	9010399	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010399	2025-11-11 18:59:42.187	2025-11-11 18:59:42.219173	2025-11-11 18:59:42.219173
3da5caf5-911b-4986-9259-512cd221a083	FUNDIMISA - FUNDICAO E USINAGEM LTDA.	9010400	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010400	2025-11-11 18:59:42.247	2025-11-11 18:59:42.280193	2025-11-11 18:59:42.280193
6db009c9-c8cb-4970-81eb-676b1feac30d	FLAMMA AUTOMOTIVA S/A	9010401	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010401	2025-11-11 18:59:42.308	2025-11-11 18:59:42.340694	2025-11-11 18:59:42.340694
33f9996b-444f-4e35-af20-14f90bb299a5	MUSASHI DO BRASIL LTDA	9010402	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010402	2025-11-11 18:59:42.369	2025-11-11 18:59:42.40104	2025-11-11 18:59:42.40104
7847435b-298f-4ef3-a194-202402617b34	FEEDER INDUSTRIAL LTDA	9010403	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010403	2025-11-11 18:59:42.429	2025-11-11 18:59:42.461274	2025-11-11 18:59:42.461274
efba5f2c-a1d6-42ae-a2c3-97bad1028b27	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010404	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010404	2025-11-11 18:59:42.489	2025-11-11 18:59:42.520155	2025-11-11 18:59:42.520155
89a40be7-0d04-4707-a1e8-69937ee20bf2	NETZSCH INDUSTRIA E COMERCIO DE EQUIPAME	9010405	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010405	2025-11-11 18:59:42.548	2025-11-11 18:59:42.582068	2025-11-11 18:59:42.582068
1ca36f70-9f53-4a6b-b37f-811102ad5a3b	PILKINGTON BRASIL LTDA	9010406	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010406	2025-11-11 18:59:42.61	2025-11-11 18:59:42.642328	2025-11-11 18:59:42.642328
c8e4e08c-800f-4265-ac9d-01388c411c5f	PROGERAL INDUSTRIA DE ARTEFATOS PLASTICO	9010407	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010407	2025-11-11 18:59:42.67	2025-11-11 18:59:42.70267	2025-11-11 18:59:42.70267
97a1aafc-1982-46da-bad9-b50645c9979d	SETAL TRANSPORTES LTDA	9010408	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010408	2025-11-11 18:59:42.73	2025-11-11 18:59:42.762647	2025-11-11 18:59:42.762647
9f6aa20d-c978-438a-98dd-90067a1285c8	THYSSENKRUPP METALURGICA CAMPO LIMPO LTD	9010409	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010409	2025-11-11 18:59:42.79	2025-11-11 18:59:42.822529	2025-11-11 18:59:42.822529
62aa57a7-083a-4d29-b1e9-4f4cca41f878	WEIDPLAS BRASIL INDUSTRIA E COMERCIO DE	9010410	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010410	2025-11-11 18:59:42.851	2025-11-11 18:59:42.882218	2025-11-11 18:59:42.882218
eed4b662-6fc0-4f12-b778-2f3629edd121	AETHRA SISTEMAS AUTOMOTIVOS S.A.	9010411	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010411	2025-11-11 18:59:42.91	2025-11-11 18:59:42.942465	2025-11-11 18:59:42.942465
dd49d799-edce-4b16-8173-f7eeb84f628b	INBRASC - INDUSTRIA BRASILEIRA DE COMPON	9010412	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010412	2025-11-11 18:59:42.97	2025-11-11 18:59:43.002493	2025-11-11 18:59:43.002493
0c674c55-d9d6-4db9-a20c-80e5b3d176cc	SMP AUTOMOTIVE P. AUT.DO BRASIL LTDA	9010413	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010413	2025-11-11 18:59:43.03	2025-11-11 18:59:43.062262	2025-11-11 18:59:43.062262
832e2369-6219-4dca-954a-42538dc64a94	ADIENT DO BRASIL BANCOS AUTOMOTIVOS LTDA	9010414	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010414	2025-11-11 18:59:43.09	2025-11-11 18:59:43.12275	2025-11-11 18:59:43.12275
ad713a72-8b8b-4753-8685-a7485e511da8	GENERAL MOTORS DO BRASIL LTDA	9010415	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010415	2025-11-11 18:59:43.151	2025-11-11 18:59:43.183093	2025-11-11 18:59:43.183093
0d0150ad-8f50-4b29-b234-b9a4593a3ee5	VITESCO TECNOLOGIA BRASIL AUTOMOTIVA LTD	9010416	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010416	2025-11-11 18:59:43.211	2025-11-11 18:59:43.242209	2025-11-11 18:59:43.242209
68a31853-ad28-43ca-a80c-5ba01c2f8c00	TRG MONTAGEM E ACABAMENTO DE PECAS LTDA	9010417	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010417	2025-11-11 18:59:43.276	2025-11-11 18:59:43.308705	2025-11-11 18:59:43.308705
df89a0e3-bd35-4e0b-b726-8afd4eb85421	TUPER S/A	9010418	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010418	2025-11-11 18:59:43.337	2025-11-11 18:59:43.368848	2025-11-11 18:59:43.368848
13b602c9-0694-40d5-9fab-7ffda8d986d8	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010419	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010419	2025-11-11 18:59:43.397	2025-11-11 18:59:43.429135	2025-11-11 18:59:43.429135
9828ae44-0517-4759-bb6d-212d21b2401f	PEUGEOT-CITROEN DO BRASIL AUTOMOVEIS LTD	9010420	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010420	2025-11-11 18:59:43.457	2025-11-11 18:59:43.490134	2025-11-11 18:59:43.490134
c45bb1ff-fb59-465e-aac9-3deaa47c4b10	CESTARI INDUSTRIAL E COMERCIAL SA	9010421	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010421	2025-11-11 18:59:43.518	2025-11-11 18:59:43.550387	2025-11-11 18:59:43.550387
42126793-9e8a-4dc2-a1a5-0a2ccdb8abb5	INDUSTRIA MECANICA KONDOR LTDA	9010422	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010422	2025-11-11 18:59:43.578	2025-11-11 18:59:43.61195	2025-11-11 18:59:43.61195
9142a81b-7e32-497e-a11c-a23c991658f6	W V INDUSTRIA METALURGICA LTDA	9010423	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010423	2025-11-11 18:59:43.64	2025-11-11 18:59:43.67181	2025-11-11 18:59:43.67181
69f655a4-f522-4258-bfec-6fa618c97ea6	MIBA SINTER BRASIL LTDA	9010425	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010425	2025-11-11 18:59:43.764	2025-11-11 18:59:43.796327	2025-11-11 18:59:43.796327
acf9e3aa-4dad-45b0-b698-a585178cb673	ALBANO E FARIAS PRESTADORA DE SERVICOS L	9010426	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010426	2025-11-11 18:59:43.824	2025-11-11 18:59:43.856233	2025-11-11 18:59:43.856233
17f5d83b-b95a-4f75-9813-8cf591f5185f	BOSAL DO BRASIL LTDA.	9010427	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010427	2025-11-11 18:59:43.885	2025-11-11 18:59:43.917078	2025-11-11 18:59:43.917078
aaad9975-1866-4ab1-8be7-e9f98a0d40a2	C.C.S. TECNOLOGIA E SERVICOS S.A.	9010428	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010428	2025-11-11 18:59:43.945	2025-11-11 18:59:43.977764	2025-11-11 18:59:43.977764
819d0e58-5123-48d6-bd4f-51dc625b9447	ARTMETAL INDUSTRIA E COMERCIO LTDA	9010429	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010429	2025-11-11 18:59:44.006	2025-11-11 18:59:44.038016	2025-11-11 18:59:44.038016
9f546ac3-5f08-4cb8-8b62-f3c25f6149d6	REQUIPH INDUSTRIA E COMERCIO DE EQUIP HI	9010430	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010430	2025-11-11 18:59:44.066	2025-11-11 18:59:44.097734	2025-11-11 18:59:44.097734
1affa24d-41c7-4c39-ac13-78001d6ec1ba	ELECTRO ACO ALTONA S A	9010431	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010431	2025-11-11 18:59:44.126	2025-11-11 18:59:44.157739	2025-11-11 18:59:44.157739
ea5bf123-68fa-4b98-90bf-2a5621575437	WETZEL S/A EM RECUPERACAO JUDICIAL	9010432	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010432	2025-11-11 18:59:44.189	2025-11-11 18:59:44.221652	2025-11-11 18:59:44.221652
2fea3f80-c71e-45cb-8757-b97e48a63ba8	GGB BRASIL INDUSTRIA DE MANCAIS E COMPON	9010433	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010433	2025-11-11 18:59:44.25	2025-11-11 18:59:44.281803	2025-11-11 18:59:44.281803
2e7d11dd-6183-4529-9cc7-7f59a3c02bb4	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010434	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010434	2025-11-11 18:59:44.31	2025-11-11 18:59:44.341977	2025-11-11 18:59:44.341977
b5ef02f8-75c5-4192-9fde-1c2fa53f04a4	INCOM - INDUSTRIAL EIRELI	9010435	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010435	2025-11-11 18:59:44.37	2025-11-11 18:59:44.402464	2025-11-11 18:59:44.402464
566a3c52-6b33-4cf8-8187-cb90c549a93c	ITP SYSTEMS CONECTORES ELETRICO E ELETRO	9010436	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010436	2025-11-11 18:59:44.43	2025-11-11 18:59:44.462656	2025-11-11 18:59:44.462656
1994bc76-832c-4d6e-8d52-826639ca9f3b	ITP SYSTEMS CONECTORES ELETRICO E ELETRO	9010437	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010437	2025-11-11 18:59:44.491	2025-11-11 18:59:44.522851	2025-11-11 18:59:44.522851
8de3d8d8-0114-434a-943f-f9dff15c2f25	REFLEXALLEN DO BRASIL AUTOMOTIVA LTDA.	9010438	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010438	2025-11-11 18:59:44.551	2025-11-11 18:59:44.583119	2025-11-11 18:59:44.583119
070a9f34-78b5-46bf-a7f1-a6b15e947c29	PLASCAR INDUSTRIA DE COMPONENTES PLASTIC	9010439	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010439	2025-11-11 18:59:44.611	2025-11-11 18:59:44.642226	2025-11-11 18:59:44.642226
eb52429a-1246-43dc-b280-d4e373ca6ee2	GENERAL MOTORS DO BRASIL LTDA	9010440	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010440	2025-11-11 18:59:44.67	2025-11-11 18:59:44.703486	2025-11-11 18:59:44.703486
32b28a5a-46c5-4a8d-af65-c65987a5d3c4	RIVETS INDUSTRIA E COMERCIO LTDA	9010441	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010441	2025-11-11 18:59:44.731	2025-11-11 18:59:44.763677	2025-11-11 18:59:44.763677
66af5737-a96e-4f22-9924-3b5a88484b76	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010442	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010442	2025-11-11 18:59:44.792	2025-11-11 18:59:44.823746	2025-11-11 18:59:44.823746
058873ea-69b7-4ec2-978b-7f30f9f5c0de	KAUTEX TEXTRON DO BRASIL LTDA	9010443	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010443	2025-11-11 18:59:44.852	2025-11-11 18:59:44.883758	2025-11-11 18:59:44.883758
2529610f-0eab-4959-960b-e58d5ff89c11	ENSINGER INDUSTRIA DE PLASTICOS TECNICOS	9010444	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010444	2025-11-11 18:59:44.912	2025-11-11 18:59:44.944137	2025-11-11 18:59:44.944137
129e101e-75e4-4725-8ea9-c1fd41dbffd3	MARELLI COFAP DO BRASIL LTDA.	9010445	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010445	2025-11-11 18:59:44.972	2025-11-11 18:59:45.004553	2025-11-11 18:59:45.004553
99e3d949-d315-4c8c-acac-50ab3c86eed1	MARELLI COFAP DO BRASIL LTDA.	9010446	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010446	2025-11-11 18:59:45.033	2025-11-11 18:59:45.064899	2025-11-11 18:59:45.064899
d517e024-8b22-4200-a150-e782e3e855de	MHB MANGUEIRAS E CONEXOES LTDA	9010447	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010447	2025-11-11 18:59:45.093	2025-11-11 18:59:45.125524	2025-11-11 18:59:45.125524
b09d8c94-ad08-43de-b8a3-11f67b857adc	LINKPLAS INDUSTRIA DE PLASTICOS LTDA	9010448	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010448	2025-11-11 18:59:45.153	2025-11-11 18:59:45.185669	2025-11-11 18:59:45.185669
62220749-dcf9-4be8-b6dc-a238b14d62c8	HANON SYSTEMS CLIMATIZACAO DO BRASIL IND	9010449	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010449	2025-11-11 18:59:45.214	2025-11-11 18:59:45.245593	2025-11-11 18:59:45.245593
a63da7c9-7343-4c8c-a103-ba86e19d5141	SMRC FABRICACAO E COMERCIO DE PRODUTOS A	9010450	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010450	2025-11-11 18:59:45.274	2025-11-11 18:59:45.305871	2025-11-11 18:59:45.305871
9b130ac1-4610-45d7-b73f-64cab407bad8	PICHININ INDUSTRIA E COMERCIO LTDA	9010451	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010451	2025-11-11 18:59:45.334	2025-11-11 18:59:45.365996	2025-11-11 18:59:45.365996
011d5f70-5248-472b-b255-2428dd73afeb	METALURGICA WELOZE LTDA	9010452	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010452	2025-11-11 18:59:45.394	2025-11-11 18:59:45.426669	2025-11-11 18:59:45.426669
2f26c410-d256-4b2b-828a-b2ab24ccba87	LOG PRINT GRAFICA DADOS VARIAVEIS E L	9010453	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010453	2025-11-11 18:59:45.455	2025-11-11 18:59:45.486859	2025-11-11 18:59:45.486859
201fc1f3-f162-482f-ad04-46fad3ba9c1a	TENNECO INDUSTRIA DE AUTOPECAS LTDA	9010454	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010454	2025-11-11 18:59:45.515	2025-11-11 18:59:45.546853	2025-11-11 18:59:45.546853
a124b9a6-6640-47fb-95b7-15eacc16f3e3	META GALVANIZACAO COMERCIO E INDUSTRIA E	9010463	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010463	2025-11-11 18:59:46.056	2025-11-11 18:59:46.088702	2025-11-11 18:59:46.088702
30d7e289-d19f-4661-8fd4-832d8f2e4d97	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010464	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010464	2025-11-11 18:59:46.117	2025-11-11 18:59:46.149015	2025-11-11 18:59:46.149015
c2e89268-9957-47da-87f5-15154d6e4705	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010465	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010465	2025-11-11 18:59:46.177	2025-11-11 18:59:46.208956	2025-11-11 18:59:46.208956
f829ddde-adcc-4ab6-ad23-a9bf98abfe3a	COMP - INDUSTRIA E COMERCIO DE METAIS LT	9010466	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010466	2025-11-11 18:59:46.237	2025-11-11 18:59:46.269659	2025-11-11 18:59:46.269659
cb6d7fec-9fcf-4306-9aa9-546a4a2db5c1	HOBER BAHIA INDUSTRIA PLASTICA LTDA	9010467	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010467	2025-11-11 18:59:46.297	2025-11-11 18:59:46.329615	2025-11-11 18:59:46.329615
a5fabf5f-b70f-4411-8ad4-3772ceb21861	TECUMSEH DO BRASIL LTDA	9010468	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010468	2025-11-11 18:59:46.358	2025-11-11 18:59:46.389915	2025-11-11 18:59:46.389915
3cb1de27-656e-4f4a-8af9-2b2b661a967e	COPO INDUSTRIA DE POLIURETANO DO BRASIL	9010469	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010469	2025-11-11 18:59:46.418	2025-11-11 18:59:46.449839	2025-11-11 18:59:46.449839
29e97986-788a-4d79-b7a9-c0161318c081	METALURGICA GOLIN SA	9010470	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010470	2025-11-11 18:59:46.478	2025-11-11 18:59:46.510197	2025-11-11 18:59:46.510197
80e826ea-25f7-4a4a-a15c-f2d6ef9d9334	TESCA TEXTIL COMPONENTES PARA ASSENTOS	9010471	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010471	2025-11-11 18:59:46.538	2025-11-11 18:59:46.570708	2025-11-11 18:59:46.570708
ef73d442-6288-43b6-b93e-ad21913d1d7a	REFAL INDUSTRIA E COMERCIO DE REBITES E	9010472	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010472	2025-11-11 18:59:46.599	2025-11-11 18:59:46.630814	2025-11-11 18:59:46.630814
62086d1c-81e1-4017-bfea-fab1a002b95a	PLANO INDUSTRIA E COMERCIO DE PLASTICOS	9010473	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010473	2025-11-11 18:59:46.659	2025-11-11 18:59:46.69092	2025-11-11 18:59:46.69092
2c34c9ab-aac3-45e2-86b3-459cee909b11	CEZAN EMBALAGENS LTDA	9010474	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010474	2025-11-11 18:59:46.719	2025-11-11 18:59:46.751167	2025-11-11 18:59:46.751167
c7a6e2f8-2fb3-4267-bb78-d6f7eebed152	MAFLOW DO BRASIL LTDA.	9010475	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010475	2025-11-11 18:59:46.779	2025-11-11 18:59:46.811399	2025-11-11 18:59:46.811399
c0d7d1e4-707e-491e-a0d9-1ab1050be6f9	ARGENTAUREOS DOURACAO E PRATEACAO LTDA	9010476	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010476	2025-11-11 18:59:46.839	2025-11-11 18:59:46.871513	2025-11-11 18:59:46.871513
cf1ff5d0-add3-4304-b658-f8e146e95b15	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010477	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010477	2025-11-11 18:59:46.9	2025-11-11 18:59:46.932126	2025-11-11 18:59:46.932126
d2ecd6af-8999-4415-8b79-3793f2735cb1	FUNDICAO SIDERAL LTDA	9010478	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010478	2025-11-11 18:59:46.96	2025-11-11 18:59:46.99224	2025-11-11 18:59:46.99224
62a51810-fc44-4b18-a6f1-d08552766947	LEAS INDUSTRIAL LTDA	9010479	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010479	2025-11-11 18:59:47.02	2025-11-11 18:59:47.05218	2025-11-11 18:59:47.05218
b91dd747-3c8a-4bec-86f7-ec13b18e7b02	METAL ONE SHIBAURA BRASIL LTDA.	9010480	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010480	2025-11-11 18:59:47.08	2025-11-11 18:59:47.112273	2025-11-11 18:59:47.112273
020513c9-f2d6-4bb3-be30-62ca1de3d8d8	PAINCO INDUSTRIA E COMERCIO SOCIEDADE AN	9010481	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010481	2025-11-11 18:59:47.141	2025-11-11 18:59:47.173517	2025-11-11 18:59:47.173517
7241f5be-b2cb-4529-98db-883b488dff37	NIPRA TRATAMENTOS DE SUPERFICIE LTDA.	9010482	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010482	2025-11-11 18:59:47.201	2025-11-11 18:59:47.233472	2025-11-11 18:59:47.233472
55e56536-aca7-41f0-aff5-62ce013a9127	TECPARTS DO BRASIL INDUSTRIA E COMERCIO	9010483	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010483	2025-11-11 18:59:47.261	2025-11-11 18:59:47.293761	2025-11-11 18:59:47.293761
72a27ba1-d5b2-4fca-a5b4-5fd239a7a763	BELLS INDUSTRIA E COMERCIO DE PLASTICOS	9010484	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010484	2025-11-11 18:59:47.322	2025-11-11 18:59:47.353871	2025-11-11 18:59:47.353871
6fc3a6de-ba16-44e3-947a-0786bdb769fa	WIPRO DO BRASIL INDUSTRIAL S.A.	9010485	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010485	2025-11-11 18:59:47.382	2025-11-11 18:59:47.414771	2025-11-11 18:59:47.414771
41889d6a-a48d-4e60-a2ce-cba1e0dd6f22	FANIA COMERCIO E INDUSTRIA DE PECAS LTDA	9010486	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010486	2025-11-11 18:59:47.443	2025-11-11 18:59:47.474628	2025-11-11 18:59:47.474628
a7acff62-c2fa-49ba-abdd-8556ef416228	CARHEJ INDUSTRIA E COMERCIO DE PRODUTOS	9010487	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010487	2025-11-11 18:59:47.503	2025-11-11 18:59:47.534818	2025-11-11 18:59:47.534818
531c58a0-9a2f-45fb-b44a-f76844fbdc31	BLUFIX INDÃšSTRIA E COMÃ‰RCIO LTDA	9010488	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010488	2025-11-11 18:59:47.563	2025-11-11 18:59:47.595099	2025-11-11 18:59:47.595099
501067cb-2cba-4745-97c9-ac98da00a53c	HENNINGS VEDACOES HIDRAULICAS LTDA	9010489	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010489	2025-11-11 18:59:47.623	2025-11-11 18:59:47.655109	2025-11-11 18:59:47.655109
5c3c7bc5-ac7e-49a6-a938-b9213d5e844f	VOLVO DO BRASIL VEICULOS LTDA	9010490	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010490	2025-11-11 18:59:47.683	2025-11-11 18:59:47.715808	2025-11-11 18:59:47.715808
ef7a00ae-156b-4064-baaf-1e75e1b8e05b	BUDAI INDUSTRIA METALURGICA LTDA	9010491	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010491	2025-11-11 18:59:47.744	2025-11-11 18:59:47.776102	2025-11-11 18:59:47.776102
1e53ddbe-bb1e-4881-948c-1736313c0941	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010492	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010492	2025-11-11 18:59:47.804	2025-11-11 18:59:47.837234	2025-11-11 18:59:47.837234
38b4b1d1-a5f8-4615-8aee-d375cabb2fbc	LINKPLAS INDUSTRIA DE PLASTICOS LTDA	9010493	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010493	2025-11-11 18:59:47.865	2025-11-11 18:59:47.897507	2025-11-11 18:59:47.897507
d1288bc4-fa2f-4170-8e23-7f4e10a1b4d3	SOLUCOES EM ACO USIMINAS S.A.	9010494	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010494	2025-11-11 18:59:47.927	2025-11-11 18:59:47.959863	2025-11-11 18:59:47.959863
9d9dc2a7-c558-4eea-b4f6-e15ca41b4c62	INDUSTRIA METALURGICA LIPOS LTDA	9010495	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010495	2025-11-11 18:59:47.988	2025-11-11 18:59:48.019983	2025-11-11 18:59:48.019983
7101d492-f9fa-4eac-826a-bfcbaebfa449	VEXILOM EMBLEMAS TECNICOS COMERCIAIS LTD	9010496	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010496	2025-11-11 18:59:48.048	2025-11-11 18:59:48.080162	2025-11-11 18:59:48.080162
eeb13274-af57-4603-be51-d6c5aea4ae7e	J A STEFANINI EIRELI	9010497	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010497	2025-11-11 18:59:48.108	2025-11-11 18:59:48.141215	2025-11-11 18:59:48.141215
cb889393-2b43-413b-9225-64e49b90e0b6	STAMPLINE METAIS ESTAMPADOS LTDA	9010498	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010498	2025-11-11 18:59:48.169	2025-11-11 18:59:48.201837	2025-11-11 18:59:48.201837
50794dcb-b81a-4f8b-84cd-1adeb20b42a3	BCS SOLUCOES EM INTERF AUTOM BRASIL LTDA	9010499	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010499	2025-11-11 18:59:48.23	2025-11-11 18:59:48.263403	2025-11-11 18:59:48.263403
98118121-2bfb-4770-89e4-a3fbc9c70aab	SOLUZ INDUSTRIA E COMERCIO LTDA	9010500	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010500	2025-11-11 18:59:48.291	2025-11-11 18:59:48.323549	2025-11-11 18:59:48.323549
80b1d42a-571d-4081-a22a-22fd4ba1a1cb	FERROLENE SA INDUSTRIA E COMERCIO DE MET	9010501	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010501	2025-11-11 18:59:48.351	2025-11-11 18:59:48.383725	2025-11-11 18:59:48.383725
02c97561-7ad1-4c50-a3c5-495e7434e0b5	DENSO DO BRASIL LTDA	9010502	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010502	2025-11-11 18:59:48.412	2025-11-11 18:59:48.444056	2025-11-11 18:59:48.444056
3d289e49-a9b1-440c-bd09-eeae4f316a07	NYLOK TECNOLOGIA EM FIXACAO LTDA	9010503	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010503	2025-11-11 18:59:48.472	2025-11-11 18:59:48.503883	2025-11-11 18:59:48.503883
d0417deb-7757-4c13-a80a-3b888dd1b6ea	CHRIS CINTOS DE SEGURANÃ‡A LTDA	9010504	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010504	2025-11-11 18:59:48.532	2025-11-11 18:59:48.563939	2025-11-11 18:59:48.563939
761f6d53-ff9d-4436-bca8-72d95b7c69d7	LINKPLAS IND E COM DE PALSTICOS LTDA	9010505	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010505	2025-11-11 18:59:48.592	2025-11-11 18:59:48.62323	2025-11-11 18:59:48.62323
e62029e0-c783-43fd-b690-242b3a7e2c6c	PICHININ INDUSTRIA E COMERCIO LTDA	9010506	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010506	2025-11-11 18:59:48.651	2025-11-11 18:59:48.683671	2025-11-11 18:59:48.683671
41b1369a-c97e-4f71-840c-79e84628dc67	PARKER HANNIFIN IND E COM LTDA	9010507	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010507	2025-11-11 18:59:48.712	2025-11-11 18:59:48.743829	2025-11-11 18:59:48.743829
d208fe5d-5160-4dd2-85f7-abee8502bdcc	INDUSTRIA MECANICA PRIMAR LTDA	9010508	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010508	2025-11-11 18:59:48.772	2025-11-11 18:59:48.805428	2025-11-11 18:59:48.805428
4c8a6a1d-f43c-4fe0-a3d2-6ffd4adbb547	AMVIAN INDUSTRIA E COMERCIO DE PECAS AUT	9010509	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010509	2025-11-11 18:59:48.833	2025-11-11 18:59:48.865689	2025-11-11 18:59:48.865689
2cde0aa7-cd4d-486f-9983-11887a4f1457	THYSSENKRUPP DO BRASIL LTDA	9010510	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010510	2025-11-11 18:59:48.894	2025-11-11 18:59:48.925855	2025-11-11 18:59:48.925855
a467faa3-7b1c-4a46-92ac-a02f7afd5adf	DAYCO POWER TRANSMISSION LTDA	9010511	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010511	2025-11-11 18:59:48.954	2025-11-11 18:59:48.985807	2025-11-11 18:59:48.985807
751d883e-81fa-4f54-a482-69b544db9d74	CINPAL COMPANHIA IND PECAS AUTOMOVEIS	9010512	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010512	2025-11-11 18:59:49.014	2025-11-11 18:59:49.045862	2025-11-11 18:59:49.045862
2f2b95bf-fabf-419e-b473-17f3eb62e9eb	TECNAUT INDUSTRIA E COMERCIO METAIS LTDA	9010513	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010513	2025-11-11 18:59:49.074	2025-11-11 18:59:49.105932	2025-11-11 18:59:49.105932
f9fb4d4f-fbcc-4208-b42d-a1380a15cd36	MOVENT AUTOMOTIVE IND E COM AUTOPECAS LT	9010514	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010514	2025-11-11 18:59:49.134	2025-11-11 18:59:49.165842	2025-11-11 18:59:49.165842
b478c6dd-4824-484c-b92f-c516a2c7a519	BIMARA IND E COM DE PRODUTOS PLASTICOS L	9010515	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010515	2025-11-11 18:59:49.194	2025-11-11 18:59:49.225884	2025-11-11 18:59:49.225884
fc67084c-287c-4925-8e6c-62cffcb3a01e	JTEKT AUTOMOTIVA BRASIL LTDA	9010516	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010516	2025-11-11 18:59:49.254	2025-11-11 18:59:49.286086	2025-11-11 18:59:49.286086
82278c45-541a-4b29-9fb1-c720fa06a5ed	INFERTEQ IND COMERCIO DE ETIQUETAS LTDA	9010517	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9010517	2025-11-11 18:59:49.314	2025-11-11 18:59:49.345119	2025-11-11 18:59:49.345119
4f6bbdb7-43fb-4cec-aec2-351efdfbc0db	TELOS CONSULTORIA EMPRESARIAL LTDA	9060001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060001	2025-11-11 18:59:49.373	2025-11-11 18:59:49.404095	2025-11-11 18:59:49.404095
e8431962-6de4-4c6a-84bf-f741fefb8b35	VIBRAC SYSTEM S/A	9060002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060002	2025-11-11 18:59:49.432	2025-11-11 18:59:49.464416	2025-11-11 18:59:49.464416
3acefdaf-3416-4d6f-a9b2-7bf48b76916b	EDSCHA DO BRASIL LTDA	9060003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060003	2025-11-11 18:59:49.492	2025-11-11 18:59:49.524645	2025-11-11 18:59:49.524645
e56df963-d44c-4669-862f-c61675a3ea9c	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060004	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060004	2025-11-11 18:59:49.553	2025-11-11 18:59:49.584865	2025-11-11 18:59:49.584865
2c02a57c-db80-43b3-9cea-5fbd1a741609	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060005	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060005	2025-11-11 18:59:49.613	2025-11-11 18:59:49.644741	2025-11-11 18:59:49.644741
77a47c92-130d-4bb6-9149-6c0786714873	AKER SOLUTIONS DO BRASIL LTDA	9060006	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060006	2025-11-11 18:59:49.673	2025-11-11 18:59:49.705365	2025-11-11 18:59:49.705365
680a0613-3485-4d73-8687-15010bd40066	FIBRA COMERCIO E DISTRIBUICAO LTDA	9060008	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060008	2025-11-11 18:59:49.734	2025-11-11 18:59:49.766384	2025-11-11 18:59:49.766384
18b7f4de-9cf6-4c41-ae03-9b119c18ff2f	EMBRART IND DE EMBALAGEM E ARTEFATOS DE	9060009	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060009	2025-11-11 18:59:49.794	2025-11-11 18:59:49.826548	2025-11-11 18:59:49.826548
2c9c4953-9e9f-4f40-87ad-43c32f7e8b53	EMBRART IND DE EMBALAGEM E ARTEFATOS DE	9060010	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060010	2025-11-11 18:59:49.855	2025-11-11 18:59:49.886821	2025-11-11 18:59:49.886821
75aa1160-5564-4185-ae50-aeeb7fd16e6f	AKER SOLUTIONS DO BRASIL LTDA	9060011	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060011	2025-11-11 18:59:49.915	2025-11-11 18:59:49.947101	2025-11-11 18:59:49.947101
1ae5b752-a993-465c-8c25-4617bd7b4d9e	BELFIX IMPORTACAO LTDA	9060012	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060012	2025-11-11 18:59:49.975	2025-11-11 18:59:50.006982	2025-11-11 18:59:50.006982
a3f4e906-06be-420f-82b0-4fb826639e04	PELZER DA BAHIA LTDA	9060013	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060013	2025-11-11 18:59:50.035	2025-11-11 18:59:50.067454	2025-11-11 18:59:50.067454
0e6ffe40-78e5-4b54-a818-5a2a81f0b4eb	BIMARA INDUSTRIA E COMERCIO DE PRODUTOS	9060014	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060014	2025-11-11 18:59:50.096	2025-11-11 18:59:50.127769	2025-11-11 18:59:50.127769
dbfb5e61-1a2f-41df-ad28-8b3a436780ac	LEYSIN MARKETING EIRELI	9060015	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060015	2025-11-11 18:59:50.156	2025-11-11 18:59:50.188166	2025-11-11 18:59:50.188166
80dc4e77-8d99-4a36-9268-09665d4a3637	COLORFIX ITAMASTER INDUSTRIA DE MASTERBA	9060016	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060016	2025-11-11 18:59:50.216	2025-11-11 18:59:50.248324	2025-11-11 18:59:50.248324
aebfe7d5-46ab-4ec6-baf8-1a3804012731	TECNOPLAST S.A - INDUSTRIA E COMERCIO DE	9060017	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060017	2025-11-11 18:59:50.276	2025-11-11 18:59:50.308611	2025-11-11 18:59:50.308611
6859987f-9208-4ad6-b51a-5a1c6b8c2073	LEYSIN MARKETING EIRELI	9060018	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060018	2025-11-11 18:59:50.337	2025-11-11 18:59:50.368879	2025-11-11 18:59:50.368879
7a73310e-719b-4dbb-89df-afe9b9082358	BIMARA INDUSTRIA E COMERCIO DE PRODUTOS	9060019	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060019	2025-11-11 18:59:50.397	2025-11-11 18:59:50.430116	2025-11-11 18:59:50.430116
ed769522-1b01-4d30-84c3-1b13400b0548	LECLAIR IND E COM PERF E COSM  LTDA	9060020	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060020	2025-11-11 18:59:50.459	2025-11-11 18:59:50.490646	2025-11-11 18:59:50.490646
5011a425-3a36-43bc-8ce1-9911d97a0c3d	COOPERATIVA CENTRAL AURORA ALIMENTOS	9060021	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060021	2025-11-11 18:59:50.519	2025-11-11 18:59:50.550846	2025-11-11 18:59:50.550846
c852d889-8aa8-41f8-a2f1-712a0c695f02	NELSON DO BRASIL P T E TUB DE EXAUS LTDA	9060022	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060022	2025-11-11 18:59:50.579	2025-11-11 18:59:50.610822	2025-11-11 18:59:50.610822
7a6894b0-425d-4bc3-b0b8-26f43250a464	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060023	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060023	2025-11-11 18:59:50.639	2025-11-11 18:59:50.670767	2025-11-11 18:59:50.670767
16dfc507-d542-42b4-a322-41626bead9c0	EMBALOG FABRICACAO EMBALAGENS LTDA	9060024	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9060024	2025-11-11 18:59:50.699	2025-11-11 18:59:50.730735	2025-11-11 18:59:50.730735
f75814f1-c085-4686-ba58-6e5084011860	SEVEN TERCEIRIZACAO DE MAO DE OBRA LTDA	9070001	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9070001	2025-11-11 18:59:50.759	2025-11-11 18:59:50.790879	2025-11-11 18:59:50.790879
8ec907bb-c1ac-4fee-9d4b-3a695f6a3240	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9070002	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9070002	2025-11-11 18:59:50.819	2025-11-11 18:59:50.851087	2025-11-11 18:59:50.851087
e83b9380-3de3-4d9a-b0c5-9ac355e08ad7	COSMA DO BRASIL PROD E SERV AUTOMOTIVOS	9070003	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9070003	2025-11-11 18:59:50.879	2025-11-11 18:59:50.911613	2025-11-11 18:59:50.911613
d5abc47c-89bd-4155-b532-8a3fa3c69ed2	DAX OIL REFINO SA	9070004	673a19aa-72e2-49ba-b7d4-ca194933547c	\N	\N	t	9070004	2025-11-11 18:59:50.94	2025-11-11 18:59:50.971818	2025-11-11 18:59:50.971818
1cad8c7d-62ea-4550-8e74-09c1e7c2165b	MAGNA	1	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	1	2025-11-11 18:59:51	2025-11-11 18:59:51.031722	2025-11-11 18:59:51.031722
bc2004e5-c954-4414-b238-6a5a13dcd83f	COOPERSTANDARD	10	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	10	2025-11-11 18:59:51.06	2025-11-11 18:59:51.092017	2025-11-11 18:59:51.092017
7ae2c152-a8bb-4f3d-815a-bae97eb2dcf8	KAPAZI LIMPEZA	11	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	11	2025-11-11 18:59:51.12	2025-11-11 18:59:51.151935	2025-11-11 18:59:51.151935
42dcb7bc-00fe-4726-bace-1a62b60a30f8	MAGNA COSMA BAHIA	2	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	2	2025-11-11 18:59:51.18	2025-11-11 18:59:51.211876	2025-11-11 18:59:51.211876
0b06130c-5c11-4498-a0be-ca83ef0c60f5	DAX	3	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	3	2025-11-11 18:59:51.24	2025-11-11 18:59:51.271856	2025-11-11 18:59:51.271856
90e08ab9-195a-4b49-88cc-85fbc830c441	TUPER	5	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	5	2025-11-11 18:59:51.36	2025-11-11 18:59:51.392346	2025-11-11 18:59:51.392346
e817c351-73b1-4fc3-bf77-af9b253c68ca	PILKINGTON RESIDENTE PR	6	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	6	2025-11-11 18:59:51.42	2025-11-11 18:59:51.452637	2025-11-11 18:59:51.452637
25308d5d-cef0-437d-915f-c14e7bfe9ae8	AFASTADOS	7	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	7	2025-11-11 18:59:51.481	2025-11-11 18:59:51.512953	2025-11-11 18:59:51.512953
173583ec-60cb-4cec-91ed-0de037d689ea	PLASCAR SJP SEVEN	710013	d06878be-ae25-4860-ba2f-88639dd96bf8	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	710013	2025-11-11 18:59:51.541	2025-11-11 18:59:51.573057	2025-11-11 18:59:51.573057
f478f99d-9096-4c03-805a-41f056c45e03	MARELLI RESIDENTE PR	8	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	8	2025-11-11 18:59:51.601	2025-11-11 18:59:51.633686	2025-11-11 18:59:51.633686
17c07c18-b831-47f9-8059-82c2e43e83f6	CABRA FORTE	9	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9	2025-11-11 18:59:51.662	2025-11-11 18:59:51.69359	2025-11-11 18:59:51.69359
e323ecd4-582b-4f1a-9cf3-226dd1ebc415	RENAULT DO BRASIL S.A	9010001	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010001	2025-11-11 18:59:51.721	2025-11-11 18:59:51.753704	2025-11-11 18:59:51.753704
c594859a-9df3-464f-834d-0ca581b87338	PILKINGTON BRASIL LTDA	9010002	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010002	2025-11-11 18:59:51.782	2025-11-11 18:59:51.814243	2025-11-11 18:59:51.814243
652e1dd1-c178-4472-a276-10b3bd5f48a5	ZF AUTOMOTIVE BRASIL LTDA.	9010003	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010003	2025-11-11 18:59:51.842	2025-11-11 18:59:51.874183	2025-11-11 18:59:51.874183
0ce77676-7e21-4618-a2c7-a696960d7e7d	VALEO SISTEMAS AUTOMOTIVOS LTDA	9010004	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010004	2025-11-11 18:59:51.902	2025-11-11 18:59:51.934335	2025-11-11 18:59:51.934335
b9306f12-7691-40ed-a038-239ddd9338a0	ZF AUTOMOTIVE BRASIL LTDA.	9010005	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010005	2025-11-11 18:59:51.962	2025-11-11 18:59:51.994442	2025-11-11 18:59:51.994442
6fb96b51-9876-4081-8a1a-a112274b611e	NISSAN DO BRASIL AUTOMOVEIS LTDA	9010006	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010006	2025-11-11 18:59:52.022	2025-11-11 18:59:52.054679	2025-11-11 18:59:52.054679
44361693-2d69-4e21-bf0b-e449c3c76150	SMP AUTOMOTIVE P. AUT.DO BRASIL LTDA	9010007	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010007	2025-11-11 18:59:52.083	2025-11-11 18:59:52.115169	2025-11-11 18:59:52.115169
76ded8ac-8dd6-480e-abe1-5d21f80654ae	ZF AUTOMOTIVE BRASIL LTDA.	9010008	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010008	2025-11-11 18:59:52.144	2025-11-11 18:59:52.176219	2025-11-11 18:59:52.176219
9267c9e3-5e0f-4951-8f5a-eacb6e2c2c5a	VISTEON AMAZONAS LTDA	9010009	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010009	2025-11-11 18:59:52.204	2025-11-11 18:59:52.236052	2025-11-11 18:59:52.236052
d327b87d-2cac-447b-a654-ebf3ae6d3df8	AKER SOLUTIONS DO BRASIL LTDA	9010010	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010010	2025-11-11 18:59:52.264	2025-11-11 18:59:52.296058	2025-11-11 18:59:52.296058
adf6ac8d-6adf-4f4b-893d-67db91adf68d	GE ENERGIAS RENOVAVEIS LTDA	9010011	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010011	2025-11-11 18:59:52.324	2025-11-11 18:59:52.356043	2025-11-11 18:59:52.356043
5672be9d-9eb3-48b6-9455-0caf3121444f	OPUS CONSULTORIA LTDA	9010012	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010012	2025-11-11 18:59:52.384	2025-11-11 18:59:52.415176	2025-11-11 18:59:52.415176
a7e04cc8-cc44-4464-b858-a643a5a4d453	ALSTOM BRASIL ENERGIA E TRANSPORTE LTDA	9010013	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010013	2025-11-11 18:59:52.443	2025-11-11 18:59:52.475556	2025-11-11 18:59:52.475556
0693cd2a-0b67-410b-a6ac-35b1c6f4f381	AKER SOLUTIONS DO BRASIL LTDA	9010014	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010014	2025-11-11 18:59:52.503	2025-11-11 18:59:52.536176	2025-11-11 18:59:52.536176
afa5bb91-5503-4590-a0f4-4c836484c81d	ZF DO BRASIL LTDA	9010015	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010015	2025-11-11 18:59:52.564	2025-11-11 18:59:52.595986	2025-11-11 18:59:52.595986
7411fc87-e4fe-4a30-ad92-6b33bb924b09	OBRA AKER	9010016	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010016	2025-11-11 18:59:52.624	2025-11-11 18:59:52.656338	2025-11-11 18:59:52.656338
7d5e2047-2442-4c9d-b525-4b97a78e1e2d	TRW AUTOMOTIVE LTDA	9010017	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010017	2025-11-11 18:59:52.684	2025-11-11 18:59:52.715154	2025-11-11 18:59:52.715154
f3f11e7d-05c1-43d8-838e-92cd3ea3135d	NISSAN DO BRASIL AUTOMOTIVEIS LTDA	9010018	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010018	2025-11-11 18:59:52.743	2025-11-11 18:59:52.774363	2025-11-11 18:59:52.774363
82761322-d964-41e6-b29f-eb9a5ea0db7a	AUTONEUM BRASIL TEXTEIS ACUSTICOS LTDA	9010019	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010019	2025-11-11 18:59:52.802	2025-11-11 18:59:52.83336	2025-11-11 18:59:52.83336
7f183126-cf34-442c-8665-3decd340eaf7	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS SA	9010020	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010020	2025-11-11 18:59:52.862	2025-11-11 18:59:52.894101	2025-11-11 18:59:52.894101
5b5df428-a60b-4985-9ba2-efc9377963df	FAGOR EDERLAN BRASILEIRA AUTO PECAS LTDA	9010021	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010021	2025-11-11 18:59:52.922	2025-11-11 18:59:52.953944	2025-11-11 18:59:52.953944
6b72b8c0-871e-496e-94b4-c147979a74f8	AUTONEUM BRASIL TEXTEIS ACUSTCOS LTDA	9010022	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010022	2025-11-11 18:59:52.982	2025-11-11 18:59:53.014424	2025-11-11 18:59:53.014424
cf75929f-a50b-43ca-8930-aafcad034fb2	ESTRUTURAS METALICAS SANTO A. LTDA EPP	9010023	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010023	2025-11-11 18:59:53.043	2025-11-11 18:59:53.075587	2025-11-11 18:59:53.075587
be6c776e-8e62-490f-9038-aad2569d5df6	FORMATO CLEAR ROOM COMERCIO E SERVICOS L	9010024	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010024	2025-11-11 18:59:53.105	2025-11-11 18:59:53.13698	2025-11-11 18:59:53.13698
9501d8ce-8ead-406b-b094-48196aac6136	SODECIA DA BAHIA LTDA	9010025	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010025	2025-11-11 18:59:53.165	2025-11-11 18:59:53.196873	2025-11-11 18:59:53.196873
76accbaf-43f2-42c4-8fba-31905723ac2c	METAGAL INDUSTRIA E COMERCIO LTDA	9010026	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010026	2025-11-11 18:59:53.225	2025-11-11 18:59:53.257018	2025-11-11 18:59:53.257018
47388514-ba70-447a-9256-4d743e4653f7	FORD MOTOR COMPANY BRASIL LTDA	9010027	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010027	2025-11-11 18:59:53.285	2025-11-11 18:59:53.317051	2025-11-11 18:59:53.317051
f59ab739-2b4d-4055-9c24-da5c495ca638	CONTINENTAL DO BRASIL PRODUTOS AUTOMOTIV	9010028	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010028	2025-11-11 18:59:53.345	2025-11-11 18:59:53.377053	2025-11-11 18:59:53.377053
aa65ae06-4eed-4c4d-a60b-07631d403296	HARMANN DA AMAZONIA INDUSTRIA ELETRONICA	9010029	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010029	2025-11-11 18:59:53.405	2025-11-11 18:59:53.437034	2025-11-11 18:59:53.437034
52076d2f-a7e2-425b-b769-d328a9cd90cb	SODECIA DA BAHIA LTDA	9010030	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010030	2025-11-11 18:59:53.465	2025-11-11 18:59:53.49711	2025-11-11 18:59:53.49711
b1d3e183-ba3e-4a68-996d-6de6e2ff7581	AUTO FORJAS LTDA	9010031	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010031	2025-11-11 18:59:53.525	2025-11-11 18:59:53.55732	2025-11-11 18:59:53.55732
c37fb68a-f8b7-40f5-bcdb-b0bd875e539a	ROBERT BOSCH LIMITADA	9010032	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010032	2025-11-11 18:59:53.585	2025-11-11 18:59:53.617349	2025-11-11 18:59:53.617349
36015e9f-a057-4446-ac16-37205a73febe	THYSSENKRUPP BRASIL LTDA	9010033	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010033	2025-11-11 18:59:53.645	2025-11-11 18:59:53.677478	2025-11-11 18:59:53.677478
3ecb871c-fe66-4854-840e-f1bf63d8dbe3	FORD MOTOR COMPANY BRASIL LTDA	9010034	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010034	2025-11-11 18:59:53.705	2025-11-11 18:59:53.737375	2025-11-11 18:59:53.737375
3095582b-961e-4f6a-9937-9063f244cff8	VOLKSWAGEN DO BRASIL INDUSTRIA DE VEICUL	9010035	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010035	2025-11-11 18:59:53.765	2025-11-11 18:59:53.797251	2025-11-11 18:59:53.797251
45164495-d6f6-4fc9-9c2a-80eaae45503e	CONTINENTAL AUTOMOTIVE DO BRASIL LTDA	9010036	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010036	2025-11-11 18:59:53.825	2025-11-11 18:59:53.857539	2025-11-11 18:59:53.857539
8dd97022-71a7-44ad-a7c1-87840f961bc1	OLSA BRASIL INDUSTRIA E COMERCIO LTDA	9010037	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010037	2025-11-11 18:59:53.885	2025-11-11 18:59:53.91764	2025-11-11 18:59:53.91764
56bd4aa8-87b5-474a-8eee-1f245e6cbeed	JARDIM SISTEMAS AUTOMOTIVOS E INDUSTRIA	9010038	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010038	2025-11-11 18:59:53.946	2025-11-11 18:59:53.977346	2025-11-11 18:59:53.977346
89225654-fd85-41fe-8c91-4a6ef6b43a31	TENNECO AUTOMOTIVE BRASIL LTDA	9010039	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010039	2025-11-11 18:59:54.006	2025-11-11 18:59:54.038096	2025-11-11 18:59:54.038096
c5350acc-68da-4469-a97c-52844e02df67	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A	9010040	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010040	2025-11-11 18:59:54.066	2025-11-11 18:59:54.098686	2025-11-11 18:59:54.098686
cc61e3ef-7f2c-4e9e-b512-fd2cc0f8583b	SAINT GOBAIN DO BRASIL PRODUTOS INDUSTRI	9010041	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010041	2025-11-11 18:59:54.127	2025-11-11 18:59:54.158645	2025-11-11 18:59:54.158645
38d4f301-31b7-4a8a-9aa0-6dcecedeb271	BROSE DO BRASIL LTDA	9010042	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010042	2025-11-11 18:59:54.187	2025-11-11 18:59:54.219211	2025-11-11 18:59:54.219211
4fc0d5d4-8ad0-42c5-9af3-f9e6da5f70fa	INDEBRAS INDUSTRIA ELETROMECANICA BRASIL	9010043	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010043	2025-11-11 18:59:54.247	2025-11-11 18:59:54.279255	2025-11-11 18:59:54.279255
3825b652-5d7a-4d01-9db9-a9427a7a3fe2	BENTELER SISTEMAS AUTOMOTIVOS LTDA	9010044	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010044	2025-11-11 18:59:54.307	2025-11-11 18:59:54.338287	2025-11-11 18:59:54.338287
7b4c4fcc-09d3-4bc1-8ac0-f9bfb4bdeddf	MAGNA DO BRASIL PRODUTOS E SERVICOS AUTO	9010045	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010045	2025-11-11 18:59:54.366	2025-11-11 18:59:54.398587	2025-11-11 18:59:54.398587
8b747224-b805-4145-a5c6-fa2e1ecdbc5e	ULIANA INDUSTRIA METALURGICA LIMITADA	9010046	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010046	2025-11-11 18:59:54.426	2025-11-11 18:59:54.458563	2025-11-11 18:59:54.458563
17691780-7570-4749-a336-70f815b26c3f	VIBRACOUSTIC SOUTH AMERICA LTDA	9010047	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010047	2025-11-11 18:59:54.486	2025-11-11 18:59:54.51918	2025-11-11 18:59:54.51918
3b8e254c-256d-4043-b58c-1f099db064c2	BREMBO DO BRASIL LTDA	9010048	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010048	2025-11-11 18:59:54.547	2025-11-11 18:59:54.579409	2025-11-11 18:59:54.579409
23c3f708-7a5b-48c9-b441-75bd23daae5f	SONAVOX INDUSTRIA E COMERCIO DE ALTOS FA	9010049	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010049	2025-11-11 18:59:54.608	2025-11-11 18:59:54.639833	2025-11-11 18:59:54.639833
233cfac5-bd41-4e8a-aa44-ec2977487b42	METAGAL INDUSTRIA E COMERCIO LTDA	9010050	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010050	2025-11-11 18:59:54.668	2025-11-11 18:59:54.699576	2025-11-11 18:59:54.699576
0089a093-90cd-4204-98cd-d08e038563b9	INDUSTRIA MECANICA BRASILEIRA DE ESTAMPO	9010051	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010051	2025-11-11 18:59:54.728	2025-11-11 18:59:54.759822	2025-11-11 18:59:54.759822
2876d7e8-b263-4b11-9762-bac5be91b90d	ITW DELFAST DO BRASIL LTDA	9010052	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010052	2025-11-11 18:59:54.788	2025-11-11 18:59:54.819656	2025-11-11 18:59:54.819656
5b4f3199-1d79-471f-be4f-bfaddff7facf	MAPRA MANGUEIRAS E ARTEFATOS DE BORRACHA	9010053	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010053	2025-11-11 18:59:54.847	2025-11-11 18:59:54.879465	2025-11-11 18:59:54.879465
3df9cd59-3eb4-428c-be64-dd1135f814d3	FEDERAL-MOGUL COMPONENTES DE MOTORES LTD	9010054	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010054	2025-11-11 18:59:54.908	2025-11-11 18:59:54.940038	2025-11-11 18:59:54.940038
3f698454-c7a2-453d-89ca-1d6bf8a01d9e	COPAM COMPONENTES DE PAPELAO E MADEIRA L	9010055	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010055	2025-11-11 18:59:54.968	2025-11-11 18:59:55.000572	2025-11-11 18:59:55.000572
25d77786-cd13-4ca9-afc0-45c34bbdca2c	FIBAM COMPANHIA INDUSTRIAL	9010056	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010056	2025-11-11 18:59:55.028	2025-11-11 18:59:55.060457	2025-11-11 18:59:55.060457
7df8bfbe-8ced-46fa-a7e8-304b3dcd0ddb	ABC GROUP DO BRASIL LTDA	9010057	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010057	2025-11-11 18:59:55.088	2025-11-11 18:59:55.120641	2025-11-11 18:59:55.120641
222f6e2d-1575-4099-ae53-488445df2168	POLISTAMPO INDUSTRIA METALURGICA LTDA	9010058	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010058	2025-11-11 18:59:55.149	2025-11-11 18:59:55.181173	2025-11-11 18:59:55.181173
063ea5bb-74aa-4892-ae57-c615f5e03457	MUBEA DO BRASIL LTDA	9010059	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010059	2025-11-11 18:59:55.209	2025-11-11 18:59:55.241446	2025-11-11 18:59:55.241446
0f60fa68-4b48-4cc0-9f92-8140d870c0cb	LABORTEX IND E COM DE PRODUTOS DE BORRAC	9010060	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010060	2025-11-11 18:59:55.269	2025-11-11 18:59:55.301751	2025-11-11 18:59:55.301751
15a9ff22-2644-4923-b7fc-5357afda4371	JTEKT AUTOMOTIVA BRASIL LTDA	9010061	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010061	2025-11-11 18:59:55.33	2025-11-11 18:59:55.361218	2025-11-11 18:59:55.361218
a8992c05-248d-40c1-b40e-a1b56dd45d80	SOGEFI SUSPENSION BRASIL LTDA	9010062	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010062	2025-11-11 18:59:55.389	2025-11-11 18:59:55.420159	2025-11-11 18:59:55.420159
28c264fb-e34b-4434-a147-1a3b575253c7	BOLLHOFF SERVICE CENTER LTDA	9010063	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010063	2025-11-11 18:59:55.448	2025-11-11 18:59:55.479097	2025-11-11 18:59:55.479097
f4217809-4fe1-4331-b736-faa0a410ef35	ZANINI DO BRASIL LTDA	9010064	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010064	2025-11-11 18:59:55.507	2025-11-11 18:59:55.538096	2025-11-11 18:59:55.538096
910f8b5c-b00c-4837-a076-310d3d9371e2	AETHRA SISTEMAS AUTOMOTIVOS S.A	9010065	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010065	2025-11-11 18:59:55.566	2025-11-11 18:59:55.598318	2025-11-11 18:59:55.598318
00bb21ca-24e2-42c9-9377-1d6f7b6af54c	OMRON COMPONENTES AUTOMOTIVOS LTDA	9010066	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010066	2025-11-11 18:59:55.626	2025-11-11 18:59:55.658491	2025-11-11 18:59:55.658491
ed5b1f22-7b00-4290-b168-6ade4c3e3035	METALURGICA NAKAYONE LTDA	9010067	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010067	2025-11-11 18:59:55.686	2025-11-11 18:59:55.71837	2025-11-11 18:59:55.71837
aaa3b70f-2715-457e-a017-ace4e73172f1	CASCO DO BRASIL LTDA	9010068	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010068	2025-11-11 18:59:55.746	2025-11-11 18:59:55.778537	2025-11-11 18:59:55.778537
27135030-40c0-4461-90c5-dd71b44925a0	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010069	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010069	2025-11-11 18:59:55.806	2025-11-11 18:59:55.838624	2025-11-11 18:59:55.838624
83245b34-79da-4d9e-be66-3e34c7cf0b81	DYNA INDUSTRIA E COMERCIO LTDA.	9010070	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010070	2025-11-11 18:59:55.866	2025-11-11 18:59:55.898464	2025-11-11 18:59:55.898464
b8e8ec01-a60e-419e-8737-9bb42002aaf4	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010071	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010071	2025-11-11 18:59:55.926	2025-11-11 18:59:55.958658	2025-11-11 18:59:55.958658
eadbb654-b0c0-44fe-8c7d-4a6f9920c12a	A. RAYMOND BRASIL LTDA	9010072	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010072	2025-11-11 18:59:55.987	2025-11-11 18:59:56.018729	2025-11-11 18:59:56.018729
d88f6708-3da7-4468-a01b-6783498d97a2	SCHAEFFLER BRASIL LTDA.	9010073	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010073	2025-11-11 18:59:56.048	2025-11-11 18:59:56.079907	2025-11-11 18:59:56.079907
6da53799-e19b-474d-a39f-189ecbf73aeb	YAZAKI DO BRASIL LTDA	9010074	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010074	2025-11-11 18:59:56.108	2025-11-11 18:59:56.140456	2025-11-11 18:59:56.140456
dbac018c-45b4-4d33-8214-1906118573d5	ROBERT BOSCH LIMITADA	9010075	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010075	2025-11-11 18:59:56.169	2025-11-11 18:59:56.200845	2025-11-11 18:59:56.200845
c368d012-9c07-4d6a-a679-4a4bc1087bff	INTERTRIM LTDA	9010076	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010076	2025-11-11 18:59:56.229	2025-11-11 18:59:56.260953	2025-11-11 18:59:56.260953
fd83719c-af6e-4bfd-ac8a-7120051086a9	SOGEFI FILTRATION DO BRASIL LTDA	9010077	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010077	2025-11-11 18:59:56.29	2025-11-11 18:59:56.322337	2025-11-11 18:59:56.322337
003ed827-d9bc-41ce-9785-0f316c36c752	THYSSENKRUPP BRASIL LTDA.	9010078	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010078	2025-11-11 18:59:56.35	2025-11-11 18:59:56.38214	2025-11-11 18:59:56.38214
05dab98f-279c-4125-b349-9c5abf2ffabb	TP INDUSTRIAL DE PNEUS BRASIL LTDA.	9010079	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010079	2025-11-11 18:59:56.41	2025-11-11 18:59:56.442136	2025-11-11 18:59:56.442136
11eb52a7-dbed-4eb2-baaa-2b47d619fa8c	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010080	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010080	2025-11-11 18:59:56.47	2025-11-11 18:59:56.502312	2025-11-11 18:59:56.502312
c4bc3253-7ebc-482d-8977-4a90f73a7eee	GKN SINTER METALS LTDA.	9010081	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010081	2025-11-11 18:59:56.531	2025-11-11 18:59:56.562747	2025-11-11 18:59:56.562747
a9b9bad6-0654-4055-841b-947e4145aa42	GALUTTI AUTOMOTIVE INDUSTRIA METALURGICA	9010082	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010082	2025-11-11 18:59:56.591	2025-11-11 18:59:56.622599	2025-11-11 18:59:56.622599
0c3c40ac-0681-4610-90e3-76441ff62056	GKN DO BRASIL LTDA	9010083	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010083	2025-11-11 18:59:56.651	2025-11-11 18:59:56.682847	2025-11-11 18:59:56.682847
bae5b820-2de6-40cc-b266-535e3ccc0b0e	DIEHL DO BRASIL METALURGICA LTDA	9010084	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010084	2025-11-11 18:59:56.711	2025-11-11 18:59:56.7429	2025-11-11 18:59:56.7429
993e2558-6e40-4741-b56a-ea1c5c28ee08	MAHLE METAL LEVE S.A.	9010085	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010085	2025-11-11 18:59:56.771	2025-11-11 18:59:56.80299	2025-11-11 18:59:56.80299
dc5f1fce-be4f-4481-a64a-9b7d2c646190	U-SHIN DO BRASIL SISTEMAS AUTOMOTIVOS LT	9010086	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010086	2025-11-11 18:59:56.831	2025-11-11 18:59:56.863079	2025-11-11 18:59:56.863079
452040d0-8547-49ea-a501-fec35f2e0d61	VOSS AUTOMOTIVE LTDA	9010087	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010087	2025-11-11 18:59:56.891	2025-11-11 18:59:56.922998	2025-11-11 18:59:56.922998
3b931649-c6a0-4e01-a523-96689cf5dfc1	AUTOCAM DO BRASIL USINAGEM LTDA.	9010088	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010088	2025-11-11 18:59:56.951	2025-11-11 18:59:56.982798	2025-11-11 18:59:56.982798
3077acb9-aa36-4e79-87dc-93e06a9415ea	GERDAU S.A.	9010089	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010089	2025-11-11 18:59:57.011	2025-11-11 18:59:57.042714	2025-11-11 18:59:57.042714
ea78edb6-f5ec-4a30-893a-30600ec556d3	WHB FUNDICAO S/A	9010090	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010090	2025-11-11 18:59:57.071	2025-11-11 18:59:57.102969	2025-11-11 18:59:57.102969
ff5531b6-a23c-4891-81b7-c4ebad94d178	TRICO LATINOAMERICANA DO BRASIL LTDA.	9010091	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010091	2025-11-11 18:59:57.131	2025-11-11 18:59:57.162107	2025-11-11 18:59:57.162107
d14e19e3-067f-4108-a858-8fe5bc72e531	INDUSTRIA MECANICA BRASPAR LTDA	9010092	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010092	2025-11-11 18:59:57.19	2025-11-11 18:59:57.222467	2025-11-11 18:59:57.222467
7fdc17ae-f996-4998-836d-ac640f94e535	3M DO BRASIL LTDA	9010093	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010093	2025-11-11 18:59:57.251	2025-11-11 18:59:57.28352	2025-11-11 18:59:57.28352
e45afe99-daf0-42e0-bef7-60a6dd40efb1	ALUJET INDUSTRIAL E COMERCIAL LTDA.	9010094	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010094	2025-11-11 18:59:57.311	2025-11-11 18:59:57.343615	2025-11-11 18:59:57.343615
7849fed9-041e-44da-88b2-390b25a806b3	CLARION DO BRASIL LTDA	9010095	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010095	2025-11-11 18:59:57.371	2025-11-11 18:59:57.403747	2025-11-11 18:59:57.403747
a53f9924-1391-4f66-b0e2-5262ef341ced	FORD MOTOR COMPANY BRASIL LTDA	9010096	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010096	2025-11-11 18:59:57.432	2025-11-11 18:59:57.463804	2025-11-11 18:59:57.463804
9237ce1a-f66c-4d32-b0dc-94a982617fd2	AB SISTEMA DE FREIOS LTDA	9010097	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010097	2025-11-11 18:59:57.492	2025-11-11 18:59:57.523696	2025-11-11 18:59:57.523696
4d1300b8-faae-4c16-8cc6-e4b3bab01e9c	BOSCH REXROTH LTDA	9010098	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010098	2025-11-11 18:59:57.552	2025-11-11 18:59:57.58382	2025-11-11 18:59:57.58382
47e95825-2be8-44f8-b492-67b1a22e16f1	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010099	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010099	2025-11-11 18:59:57.612	2025-11-11 18:59:57.644085	2025-11-11 18:59:57.644085
f9788957-f043-4075-ad31-0733a78555a7	MICROPARTS PECAS INJETADAS LTDA	9010100	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010100	2025-11-11 18:59:57.672	2025-11-11 18:59:57.704173	2025-11-11 18:59:57.704173
7e2ef9c2-b1b1-4ac9-ba01-039097ff7a94	ADVAL TECH DO BRASIL INDUS ADE AUTO LTDA	9010101	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010101	2025-11-11 18:59:57.732	2025-11-11 18:59:57.76437	2025-11-11 18:59:57.76437
9a6a3c0a-59c5-4e58-8648-a3bf892a728e	TUPY S/A	9010102	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010102	2025-11-11 18:59:57.792	2025-11-11 18:59:57.824402	2025-11-11 18:59:57.824402
dc0f0c4a-1f75-4a73-84a4-96be94f7a5fe	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010103	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010103	2025-11-11 18:59:57.853	2025-11-11 18:59:57.884884	2025-11-11 18:59:57.884884
41a2a4a6-e6a6-4c8c-a873-e9adc68c8013	SHW DO BRASIL LTDA	9010104	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010104	2025-11-11 18:59:57.913	2025-11-11 18:59:57.945057	2025-11-11 18:59:57.945057
80fb7c01-e16c-411f-b475-a15787fa8355	FORMTAP INDUSTRIA E COMERCIO S/A	9010105	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010105	2025-11-11 18:59:57.973	2025-11-11 18:59:58.005096	2025-11-11 18:59:58.005096
2d63ea14-c752-47be-b821-7be1f7f5cdde	FORD MOTOR COMPANY BRASIL LTDA	9010106	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010106	2025-11-11 18:59:58.034	2025-11-11 18:59:58.065637	2025-11-11 18:59:58.065637
96a61997-264c-432b-9b7d-5491a89d9ccf	FICOSA DO BRASIL LTDA	9010107	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010107	2025-11-11 18:59:58.093	2025-11-11 18:59:58.126148	2025-11-11 18:59:58.126148
e0c2f2f7-e78b-4a96-b488-b04ec1fd1871	HUF DO BRASIL LTDA	9010108	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010108	2025-11-11 18:59:58.154	2025-11-11 18:59:58.188428	2025-11-11 18:59:58.188428
5a271b11-66da-479b-97e2-087a2eabb8f4	ASBRASIL S/A - EM RECUPERACAO JUDICIAL	9010109	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010109	2025-11-11 18:59:58.216	2025-11-11 18:59:58.24847	2025-11-11 18:59:58.24847
69ef95f4-fb1a-4a28-9181-41b115217110	ASPRO PLASTIC INDUSTRIA E COMERCIO DE AR	9010110	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010110	2025-11-11 18:59:58.276	2025-11-11 18:59:58.308633	2025-11-11 18:59:58.308633
24a9e01f-ee8b-4ed5-874e-9aece96d27bc	MAGNA DO BRASIL PRODUTOS E SERVICOS AUTO	9010111	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010111	2025-11-11 18:59:58.337	2025-11-11 18:59:58.368684	2025-11-11 18:59:58.368684
71c0e24a-d82e-4e99-a71d-00b3eb0a1fd2	WEBER HIDRÃ ULICA DO BRASIL LTDA.	9010112	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010112	2025-11-11 18:59:58.397	2025-11-11 18:59:58.428991	2025-11-11 18:59:58.428991
8c707c45-5242-4200-8f30-ebb415f5134a	CONTINENTAL PARAFUSOS S/A	9010113	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010113	2025-11-11 18:59:58.457	2025-11-11 18:59:58.489282	2025-11-11 18:59:58.489282
db67f7b8-1944-4768-a9b1-fb357556ab5a	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010114	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010114	2025-11-11 18:59:58.517	2025-11-11 18:59:58.549364	2025-11-11 18:59:58.549364
46e56d9c-a9e8-445a-af02-49c45070a8a1	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010115	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010115	2025-11-11 18:59:58.577	2025-11-11 18:59:58.6096	2025-11-11 18:59:58.6096
68ac792a-a878-4051-a31e-f0692d3a8640	MAAC INDUSTRIA E COMERCIO DE PECAS EIREL	9010116	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010116	2025-11-11 18:59:58.637	2025-11-11 18:59:58.669483	2025-11-11 18:59:58.669483
e1c65b59-0515-4d15-a8cd-c0cdd8b3c1c6	TEKNIA BRASIL LTDA.	9010117	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010117	2025-11-11 18:59:58.698	2025-11-11 18:59:58.730545	2025-11-11 18:59:58.730545
9fb9d0ae-9b1e-4c3d-b919-146972b0bfd7	BASF SA	9010119	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010119	2025-11-11 18:59:58.759	2025-11-11 18:59:58.790987	2025-11-11 18:59:58.790987
6c112e4c-5107-4c2e-bab2-736283331be7	INDUSTRIAS MANGOTEX LTDA	9010120	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010120	2025-11-11 18:59:58.82	2025-11-11 18:59:58.852305	2025-11-11 18:59:58.852305
c0c499f8-2eed-404d-8386-10dd2a158d7d	METALURGICA FORMIGARI LTDA	9010121	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010121	2025-11-11 18:59:58.88	2025-11-11 18:59:58.912343	2025-11-11 18:59:58.912343
e80a4948-d629-454b-81b2-632439acfe1e	CONTINENTAL DO BRASIL PRODUTOS AUTOMOTIV	9010122	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010122	2025-11-11 18:59:58.94	2025-11-11 18:59:58.972557	2025-11-11 18:59:58.972557
bf9041af-0144-40e0-afa5-d5d7b66512c2	MICHEL THIERRY DO BRASIL INDUSTRIA TEXTI	9010123	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010123	2025-11-11 18:59:59	2025-11-11 18:59:59.032554	2025-11-11 18:59:59.032554
289d843c-a5aa-44f2-a5d3-efcff3e0cd01	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010124	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010124	2025-11-11 18:59:59.061	2025-11-11 18:59:59.093113	2025-11-11 18:59:59.093113
006a6437-4558-42b3-9583-97d77f3048b1	CONFAB INDUSTRIAL SOCIEDADE ANONIMA	9010125	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010125	2025-11-11 18:59:59.121	2025-11-11 18:59:59.15314	2025-11-11 18:59:59.15314
5b36bf24-e11b-4687-bada-a86cc2e34952	VIBRAC SYSTEM S/A	9010126	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010126	2025-11-11 18:59:59.181	2025-11-11 18:59:59.213506	2025-11-11 18:59:59.213506
3861e261-4b38-46b5-94a3-2d96d482a575	ARVEDI METALFER DO BRASIL S.A	9010127	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010127	2025-11-11 18:59:59.242	2025-11-11 18:59:59.274378	2025-11-11 18:59:59.274378
96920531-9031-4c14-bf6d-1d936f225489	AUTOMETAL SBC INJ E PINT PLASTICOS LTDA	9010128	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010128	2025-11-11 18:59:59.302	2025-11-11 18:59:59.334744	2025-11-11 18:59:59.334744
ce532544-f28b-48ce-9064-ee68ec4b645b	TEKNIA BRASIL LTDA	9010129	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010129	2025-11-11 18:59:59.363	2025-11-11 18:59:59.39495	2025-11-11 18:59:59.39495
5de9febb-1621-4da3-bcdd-a2a673657ef2	MANGELS INDUSTRIAL S.A	9010130	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010130	2025-11-11 18:59:59.423	2025-11-11 18:59:59.454905	2025-11-11 18:59:59.454905
33325e28-b897-4126-ad07-f95475d6c92c	BENTELER COMPONENTES AUTOMOTIVOS LTDA	9010131	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010131	2025-11-11 18:59:59.483	2025-11-11 18:59:59.515265	2025-11-11 18:59:59.515265
d84bc22f-25f7-4407-b877-b602a79b1818	SAINT-GOBAIN DO BRASIL PRODUTOS INDUSTRI	9010132	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010132	2025-11-11 18:59:59.543	2025-11-11 18:59:59.575399	2025-11-11 18:59:59.575399
83b8862f-4348-46c8-b1b2-00384af9295f	COBIAN REPRESENTACAO TECNICA E COMERCIAL	9010133	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010133	2025-11-11 18:59:59.603	2025-11-11 18:59:59.635437	2025-11-11 18:59:59.635437
a71890e5-2a1a-4eb1-815e-7bf76799238b	AUTOCOM COMPONENTES AUTOMOTIVOS DO BRASI	9010134	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010134	2025-11-11 18:59:59.664	2025-11-11 18:59:59.695691	2025-11-11 18:59:59.695691
6a3ba84f-b5c2-432c-b721-84402abaed79	MANN HUMMEL BRASIL LTDA.	9010135	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010135	2025-11-11 18:59:59.724	2025-11-11 18:59:59.755905	2025-11-11 18:59:59.755905
512fa44d-8586-4c8a-b1c8-3e139e3f0d20	RUDOLPH USINADOS S/A	9010136	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010136	2025-11-11 18:59:59.784	2025-11-11 18:59:59.816021	2025-11-11 18:59:59.816021
633d4b3a-80cb-44b9-80c3-e1683e14a32a	KOSTAL ELETROMECANICA LTDA	9010137	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010137	2025-11-11 18:59:59.845	2025-11-11 18:59:59.877059	2025-11-11 18:59:59.877059
0df012aa-5fbc-4918-be02-3d03b16f8d10	REFAL INDUSTRIA E COMERCIO DE REBITES E	9010138	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010138	2025-11-11 18:59:59.905	2025-11-11 18:59:59.937429	2025-11-11 18:59:59.937429
f5e40bfa-11d2-449f-bff7-27d1600c785a	PELZER DA BAHIA LTDA	9010139	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010139	2025-11-11 18:59:59.965	2025-11-11 18:59:59.99742	2025-11-11 18:59:59.99742
6e73b66d-234d-49b0-9771-0a0e768b0e2d	BORGWARNER BRASIL LTDA	9010140	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010140	2025-11-11 19:00:00.026	2025-11-11 19:00:00.057191	2025-11-11 19:00:00.057191
d5908702-a3a0-470f-9039-26e8313f2a56	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010141	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010141	2025-11-11 19:00:00.085	2025-11-11 19:00:00.117346	2025-11-11 19:00:00.117346
e9de24a7-459d-488c-aad4-52b7fb284aa6	BENTELER COMPONENTES AUTOMOTIVOS LTDA	9010142	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010142	2025-11-11 19:00:00.145	2025-11-11 19:00:00.177592	2025-11-11 19:00:00.177592
6902d037-1be4-433d-94d2-910897cf22f6	MAQUINAS AGRICOLAS JACTO S A	9010143	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010143	2025-11-11 19:00:00.206	2025-11-11 19:00:00.238019	2025-11-11 19:00:00.238019
f8ac37cf-5530-4278-918f-2df51b86dc18	MAHLE BEHR GERENCIAMENTO TERMICO BRASIL	9010144	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010144	2025-11-11 19:00:00.267	2025-11-11 19:00:00.299066	2025-11-11 19:00:00.299066
0f221bad-a872-4a87-a7b6-170034132546	DAYCO POWER TRANSMISSION LTDA	9010145	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010145	2025-11-11 19:00:00.327	2025-11-11 19:00:00.359814	2025-11-11 19:00:00.359814
fd07eb65-767c-47f4-9ba2-1c85896bb044	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010146	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010146	2025-11-11 19:00:00.389	2025-11-11 19:00:00.421425	2025-11-11 19:00:00.421425
c70f5107-774f-4ee5-9097-041802f11381	IOCHPE MAXION SA	9010147	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010147	2025-11-11 19:00:00.449	2025-11-11 19:00:00.48166	2025-11-11 19:00:00.48166
99730da9-0087-4650-ac9e-a53b7719aeb9	NORGREN LTDA	9010148	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010148	2025-11-11 19:00:00.51	2025-11-11 19:00:00.541382	2025-11-11 19:00:00.541382
3c2660bf-cbfd-43bf-a621-1c0dfd5c37a0	MANN HUMMEL BRASIL LTDA.	9010149	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010149	2025-11-11 19:00:00.569	2025-11-11 19:00:00.601726	2025-11-11 19:00:00.601726
9ae0b639-cb36-4e1f-ba10-aea7b676a4c4	KSPG AUTOMOTIVE BRAZIL LTDA.	9010150	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010150	2025-11-11 19:00:00.63	2025-11-11 19:00:00.661942	2025-11-11 19:00:00.661942
cd5b9236-d6ac-49ff-9ec2-6b8c61dfdca1	MAGNETI MARELLI COFAP FABRICADORA DE PEC	9010151	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010151	2025-11-11 19:00:00.69	2025-11-11 19:00:00.722281	2025-11-11 19:00:00.722281
51fa8859-00c2-4f08-9b09-c1affd336661	STAMPTEC INDUSTRIA E COMERCIO DE PECAS E	9010152	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010152	2025-11-11 19:00:00.75	2025-11-11 19:00:00.783242	2025-11-11 19:00:00.783242
645e4585-4245-4443-84bc-5df629157536	L L PRODUCTS DO BRASIL SERVICOS E COMERC	9010153	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010153	2025-11-11 19:00:00.812	2025-11-11 19:00:00.8444	2025-11-11 19:00:00.8444
a0220a86-b54d-4c67-81aa-449cd053f189	BOGE RUBBER e  PLASTICS BRASIL S.A.	9010154	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010154	2025-11-11 19:00:00.872	2025-11-11 19:00:00.904345	2025-11-11 19:00:00.904345
7d4240f0-21e0-4373-9e33-8b53cf5c0328	CERAMICA E VELAS DE IGNICAO NGK DO BRASI	9010155	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010155	2025-11-11 19:00:00.932	2025-11-11 19:00:00.964784	2025-11-11 19:00:00.964784
473ffca9-08a2-4c7c-8e7e-6e617ca94538	ELISMOL INDUSTRIA METALURGICA LTDA	9010156	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010156	2025-11-11 19:00:00.993	2025-11-11 19:00:01.027282	2025-11-11 19:00:01.027282
5c48b699-92e4-49e8-b5e9-d58882b52e6b	AETHRA SISTEMAS AUTOMOTIVOS S.A.	9010157	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010157	2025-11-11 19:00:01.055	2025-11-11 19:00:01.087252	2025-11-11 19:00:01.087252
75cb3a2a-a0d7-4385-86cf-8a5b821a3c5e	NEUMAYER TEKFOR AUTOMOTIVE BRASIL LTDA.	9010158	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010158	2025-11-11 19:00:01.115	2025-11-11 19:00:01.14607	2025-11-11 19:00:01.14607
ec2c0341-8976-4a69-bc70-e7566e2ccf90	HANON SYSTEMS CLIMATIZACAO DO BRASIL IND	9010159	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010159	2025-11-11 19:00:01.174	2025-11-11 19:00:01.206294	2025-11-11 19:00:01.206294
e7a87b23-d9f6-4d2e-8ac2-8dcb72e4ba96	QUALYTEC QUALIDADE TECNICA LTDA EPP	9010160	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010160	2025-11-11 19:00:01.234	2025-11-11 19:00:01.266669	2025-11-11 19:00:01.266669
4b5ac2c4-8c74-4594-9204-70a5eb3c0658	EDSCHA DO BRASIL LTDA	9010161	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010161	2025-11-11 19:00:01.294	2025-11-11 19:00:01.327222	2025-11-11 19:00:01.327222
fbed3cac-13ca-4756-8f53-d0acabe0d826	TTB INDUSTRIA COM DE PRO METALICOS LTDA	9010162	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010162	2025-11-11 19:00:01.356	2025-11-11 19:00:01.387755	2025-11-11 19:00:01.387755
d214c085-ef44-4fd3-9185-25dcb3a90d5e	DELGA INDUSTRIA E COMERCIO S A	9010163	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010163	2025-11-11 19:00:01.416	2025-11-11 19:00:01.448327	2025-11-11 19:00:01.448327
f815c02d-3db1-4583-9e99-67174341cafd	METALURGICA RIGITEC LTDA	9010164	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010164	2025-11-11 19:00:01.476	2025-11-11 19:00:01.508546	2025-11-11 19:00:01.508546
8896daf7-44f2-4385-862d-e6c08f29fc99	INDUSTRIA DE ART DE BORRACHA WOLF LTDA	9010165	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010165	2025-11-11 19:00:01.537	2025-11-11 19:00:01.569155	2025-11-11 19:00:01.569155
d615e53a-1d4b-4bf2-b8f8-77a52c0e3b41	RASSINI NHK AUTOPECAS LTDA	9010166	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010166	2025-11-11 19:00:01.597	2025-11-11 19:00:01.630699	2025-11-11 19:00:01.630699
8f89f82b-ff2e-4dc2-93d4-522e3dedc85c	SNR ROLAMENTOS DO BRASIL LTDA	9010167	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010167	2025-11-11 19:00:01.659	2025-11-11 19:00:01.690895	2025-11-11 19:00:01.690895
5d9b8364-6924-4ca9-a0a5-18f2d7e9c13c	KAUTEX TEXTRON DO BRASIL LTDA	9010168	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010168	2025-11-11 19:00:01.719	2025-11-11 19:00:01.75096	2025-11-11 19:00:01.75096
bbdaf00f-40c2-4bc5-9358-29bddc28200d	WHB FUNDICAO S A	9010169	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010169	2025-11-11 19:00:01.779	2025-11-11 19:00:01.811295	2025-11-11 19:00:01.811295
fc8276d3-a23a-4168-971f-49895afc272d	DURA AUTOMOTIVE SYSTEMS DO BRASIL LTDA	9010170	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010170	2025-11-11 19:00:01.839	2025-11-11 19:00:01.871469	2025-11-11 19:00:01.871469
16347795-b60d-4219-a2e3-4bc47c0f70f1	ELRING KLINGER DO BRASIL LTDA	9010171	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010171	2025-11-11 19:00:01.9	2025-11-11 19:00:01.931309	2025-11-11 19:00:01.931309
c5e42e4b-02ce-4894-92b0-3b868af46d2b	PIRELLI PNEUS LTDA.	9010172	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010172	2025-11-11 19:00:01.959	2025-11-11 19:00:01.991741	2025-11-11 19:00:01.991741
9108f56a-6b5d-4979-9adc-f2959874d774	METALURGICA HASSMANN SA	9010173	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010173	2025-11-11 19:00:02.02	2025-11-11 19:00:02.052444	2025-11-11 19:00:02.052444
98055ccc-d2e4-451f-a362-71a3e8bc9695	TYCO ELECTRONICS BRASIL LTDA	9010174	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010174	2025-11-11 19:00:02.08	2025-11-11 19:00:02.112668	2025-11-11 19:00:02.112668
7d668f2f-a9cd-43ec-a295-f33f2eb87850	SABO INDUSTRIA E COMERCIO DE AUTOPECAS S	9010175	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010175	2025-11-11 19:00:02.141	2025-11-11 19:00:02.173038	2025-11-11 19:00:02.173038
a065c148-2fd8-4704-99b6-68bcbd3fff6c	METALURGICA HAME LTDA	9010176	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010176	2025-11-11 19:00:02.201	2025-11-11 19:00:02.233049	2025-11-11 19:00:02.233049
4e77212c-ff2c-44d7-af9e-2325578b8d1d	CUMMINS BRASIL LIMITDA	9010177	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010177	2025-11-11 19:00:02.261	2025-11-11 19:00:02.293087	2025-11-11 19:00:02.293087
8c761ef7-ccd9-44a6-b0a6-4e6abb623a41	METALKRAFT S A SISTEMAS AUTOMOTIVOS	9010178	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010178	2025-11-11 19:00:02.321	2025-11-11 19:00:02.353225	2025-11-11 19:00:02.353225
e76a72e3-a8ff-4a3a-9c37-3ad8f882e871	TECHAL INDUST E COM CONJ TUBULARES LTDA	9010179	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010179	2025-11-11 19:00:02.382	2025-11-11 19:00:02.414142	2025-11-11 19:00:02.414142
900c2ba5-ab31-40af-ad9a-250abc0ffffc	METALTORK INDUS E COMERAUTO PECAS LTDA	9010180	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010180	2025-11-11 19:00:02.442	2025-11-11 19:00:02.474573	2025-11-11 19:00:02.474573
c5a35204-946d-4788-9ef8-515c2c940856	NOVA INJ SOB PRES COMER  PECAS IND LTDA	9010181	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010181	2025-11-11 19:00:02.503	2025-11-11 19:00:02.535191	2025-11-11 19:00:02.535191
ff7d05bc-c802-4de7-8bb7-1121027e077a	PRODUFLEX IND DE BORRACHAS LTDA	9010182	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010182	2025-11-11 19:00:02.564	2025-11-11 19:00:02.595816	2025-11-11 19:00:02.595816
6d70b146-2fc3-4446-822a-d5b14a67aa13	COOPER-STANDARD AUTOMOTIVE BRASIL SEALIN	9010183	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010183	2025-11-11 19:00:02.624	2025-11-11 19:00:02.656061	2025-11-11 19:00:02.656061
0683411c-8c42-4362-bef9-a9e388ce5c2a	FLEXNGATE BRASIL INDUSTRIAL LTDA	9010184	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010184	2025-11-11 19:00:02.684	2025-11-11 19:00:02.715129	2025-11-11 19:00:02.715129
9757e76b-a8a9-4895-a5cb-a67a0b8e1a17	FORMTAP INDUSTRIA E COMERCIO S/A	9010185	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010185	2025-11-11 19:00:02.743	2025-11-11 19:00:02.775298	2025-11-11 19:00:02.775298
86cea9d2-4c57-442d-ac4e-814e9955e6e4	CUMMINS BRASIL LIMITADA	9010186	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010186	2025-11-11 19:00:02.803	2025-11-11 19:00:02.83532	2025-11-11 19:00:02.83532
126ca4ac-3eea-4519-bd76-90659fb72293	JAT TRANSPORTES E LOGISTICA S.A	9010187	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010187	2025-11-11 19:00:02.863	2025-11-11 19:00:02.895202	2025-11-11 19:00:02.895202
0af3d76f-28a0-4c5b-a813-cbc8fa9dd860	AUTOMETAL S/A	9010188	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010188	2025-11-11 19:00:02.923	2025-11-11 19:00:02.955221	2025-11-11 19:00:02.955221
5bfdd282-80e4-4d5b-b9d8-b308285ff27e	DYSTRAY INDUSTRIA E COMERCIO EIRELI - EP	9010189	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010189	2025-11-11 19:00:02.983	2025-11-11 19:00:03.015282	2025-11-11 19:00:03.015282
6bcde243-79de-40b3-aede-add3e30e5f74	THOMAS KL INDUSTRIA DE ALTO FALANTES SA	9010190	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010190	2025-11-11 19:00:03.043	2025-11-11 19:00:03.076074	2025-11-11 19:00:03.076074
0090cf93-58a7-490d-9ec9-9a8fd8dca041	METALURGICA MURCIA LTDA	9010191	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010191	2025-11-11 19:00:03.104	2025-11-11 19:00:03.13641	2025-11-11 19:00:03.13641
2f2803d1-94dc-40b5-899a-da5b0c6ac393	CLIPTECH INDUSTRIA E COMERCIO LTDA	9010192	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010192	2025-11-11 19:00:03.164	2025-11-11 19:00:03.196482	2025-11-11 19:00:03.196482
506146a2-9e5d-47bb-bb97-ba31f5a71cf1	SUMIRIKO DO BRASIL INDUSTRIA DE BORRACHA	9010193	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010193	2025-11-11 19:00:03.224	2025-11-11 19:00:03.256255	2025-11-11 19:00:03.256255
b86627ab-e8e2-460a-931e-9d6b46122190	KYB-MANDO DO BRASIL FABRICANTE DE AUTOPE	9010194	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010194	2025-11-11 19:00:03.284	2025-11-11 19:00:03.316682	2025-11-11 19:00:03.316682
a362ac82-02ea-4c05-95eb-0cc308da70f3	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010195	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010195	2025-11-11 19:00:03.345	2025-11-11 19:00:03.376934	2025-11-11 19:00:03.376934
f32e73ee-6552-4294-9eae-04f06e894cc9	S RIKO AUTOMOTIVE HOSE TECALON BRASIL S.	9010196	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010196	2025-11-11 19:00:03.405	2025-11-11 19:00:03.437954	2025-11-11 19:00:03.437954
20314b4e-da7d-401e-bfb1-42bc9cc6ad29	ROCHLING AUTOMOTIVE DO BRASIL LTDA	9010197	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010197	2025-11-11 19:00:03.466	2025-11-11 19:00:03.498038	2025-11-11 19:00:03.498038
2d8ff2c3-4860-40f4-af1f-28b28d3796ba	MAHLE METAL LEVE S.A.	9010198	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010198	2025-11-11 19:00:03.527	2025-11-11 19:00:03.559568	2025-11-11 19:00:03.559568
88423e52-2746-4409-bd1d-a30967a2fb53	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010199	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010199	2025-11-11 19:00:03.588	2025-11-11 19:00:03.619969	2025-11-11 19:00:03.619969
6be50f3b-ca26-4ac7-86c4-126cc9f4da32	NIDEC GPM DO BRASIL AUTOMOTIVA LTDA	9010200	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010200	2025-11-11 19:00:03.648	2025-11-11 19:00:03.679945	2025-11-11 19:00:03.679945
871af7c3-ba53-49e9-b8d1-67b8248de509	TRIMTEC LTDA	9010201	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010201	2025-11-11 19:00:03.708	2025-11-11 19:00:03.741418	2025-11-11 19:00:03.741418
4354d85d-4ee0-4e85-a321-266ffb9130c9	FAURECIA EMISSIONS CONTROL TECHNOLOGIES	9010202	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010202	2025-11-11 19:00:03.77	2025-11-11 19:00:03.80204	2025-11-11 19:00:03.80204
3645de36-7827-47bc-80ad-d1da51f3147f	INTEVA PRODUCTS SISTEMAS E COMPONENTES A	9010203	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010203	2025-11-11 19:00:03.83	2025-11-11 19:00:03.862538	2025-11-11 19:00:03.862538
d68a1da9-527e-4905-b19a-6ad01b5bea99	ROBERT BOSCH LIMITADA	9010204	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010204	2025-11-11 19:00:03.89	2025-11-11 19:00:03.922781	2025-11-11 19:00:03.922781
554a504b-e530-48fb-a02b-a15cb8ec9687	PLASTICOS MAUA LTDA	9010205	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010205	2025-11-11 19:00:03.951	2025-11-11 19:00:03.982699	2025-11-11 19:00:03.982699
aed51512-9e66-4b01-baef-65ad0a8e9f6b	INDUSTRIA METALURGICA FANANDRI LTDA	9010206	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010206	2025-11-11 19:00:04.011	2025-11-11 19:00:04.042816	2025-11-11 19:00:04.042816
2fdefee4-6b0f-4706-84b6-1b564e280053	NEMAK ALUMINIO DO BRASIL LTDA	9010207	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010207	2025-11-11 19:00:04.071	2025-11-11 19:00:04.103422	2025-11-11 19:00:04.103422
6c7a9cb0-5472-43dc-9c69-f8c5e4501cc2	CLICK AUTOMOTIVA INDUSTRIAL LTDA.	9010208	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010208	2025-11-11 19:00:04.132	2025-11-11 19:00:04.163877	2025-11-11 19:00:04.163877
ff073f9b-1641-4e5f-88a9-4bb54de3aad4	HIDROVER EQUIPAMENTOS HIDRAULICOS LTDA.	9010209	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010209	2025-11-11 19:00:04.192	2025-11-11 19:00:04.224021	2025-11-11 19:00:04.224021
72f3e1e6-a737-427c-9a06-710c459fe6a4	METALAC SPS INDUSTRIA E COMERCIO LTDA.	9010210	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010210	2025-11-11 19:00:04.252	2025-11-11 19:00:04.284472	2025-11-11 19:00:04.284472
57c72025-a6bd-4cd1-99c9-8f8cb3c5e747	ELDORADO INDUSTRIAS PLASTICAS LTDA	9010211	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010211	2025-11-11 19:00:04.313	2025-11-11 19:00:04.344919	2025-11-11 19:00:04.344919
860bff5b-4a4f-46f1-868b-6178dd14bec4	INDUSTRIA METALURGICA FRUM LTDA	9010212	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010212	2025-11-11 19:00:04.373	2025-11-11 19:00:04.404924	2025-11-11 19:00:04.404924
caee7f98-53f7-446b-a5fd-8c9d5f381792	PEUGEOT-CITROEN DO BRASIL AUTOMOVEIS LTD	9010213	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010213	2025-11-11 19:00:04.433	2025-11-11 19:00:04.464914	2025-11-11 19:00:04.464914
0aa96ab4-a6be-4e57-80e0-26d247a15873	FAURECIA EMISSIONS CONTROL TECHNOLOGIES	9010214	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010214	2025-11-11 19:00:04.493	2025-11-11 19:00:04.52509	2025-11-11 19:00:04.52509
3c9e1181-206f-41ec-b07e-074be0491918	FREUDENBERG-NOK COMPONENTES BRASIL LTDA	9010215	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010215	2025-11-11 19:00:04.553	2025-11-11 19:00:04.586232	2025-11-11 19:00:04.586232
c9130c84-7ba1-499c-83ab-248a91407738	CGE SOCIEDADE FABRICADORA DE PECAS PLAST	9010216	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010216	2025-11-11 19:00:04.614	2025-11-11 19:00:04.647179	2025-11-11 19:00:04.647179
a537dbc3-05d8-4d55-900e-703616ffe5cc	ZANETTINI BAROSSI S A INDUSTRIA E COMERC	9010217	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010217	2025-11-11 19:00:04.676	2025-11-11 19:00:04.707814	2025-11-11 19:00:04.707814
6974681a-3725-43b4-bc19-f2ab8b77108e	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010218	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010218	2025-11-11 19:00:04.736	2025-11-11 19:00:04.767735	2025-11-11 19:00:04.767735
be53c4dd-35b1-4d60-85de-6b926a67f040	GLOBAL STEERING SYSTEMS DO BRASIL INDUST	9010219	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010219	2025-11-11 19:00:04.796	2025-11-11 19:00:04.827932	2025-11-11 19:00:04.827932
bb797f18-f096-4302-971f-157979703bb7	WAPMETAL INDUSTRIA E COMERCIO DE MOLAS E	9010220	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010220	2025-11-11 19:00:04.856	2025-11-11 19:00:04.888268	2025-11-11 19:00:04.888268
45b88506-8fe3-41c4-9753-a00405d1fac4	MAHLE METAL LEVE S.A.	9010221	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010221	2025-11-11 19:00:04.916	2025-11-11 19:00:04.948079	2025-11-11 19:00:04.948079
9c08304a-6cb7-4c63-9e97-9f779c8ad6d2	ZF DO BRASIL LTDA.	9010222	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010222	2025-11-11 19:00:04.976	2025-11-11 19:00:05.00849	2025-11-11 19:00:05.00849
c7efce63-8adf-42ea-8c33-592bfd1ff3e8	METALURGICA QUASAR LTDA. EM RECUPERACAO	9010223	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010223	2025-11-11 19:00:05.037	2025-11-11 19:00:05.068718	2025-11-11 19:00:05.068718
4996a639-eec0-484a-b950-63f9235c3a45	NICHIBRAS INDUSTRIA E COMERCIO LTDA	9010224	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010224	2025-11-11 19:00:05.097	2025-11-11 19:00:05.128942	2025-11-11 19:00:05.128942
db916c3d-6b99-493e-a9bd-58321a853a77	RESIL COMERCIAL INDUSTRIAL LTDA	9010225	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010225	2025-11-11 19:00:05.157	2025-11-11 19:00:05.189158	2025-11-11 19:00:05.189158
2dfe63ca-97eb-4915-a6ca-615766bdc07d	SIKA AUTOMOTIVE LTDA.	9010226	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010226	2025-11-11 19:00:05.217	2025-11-11 19:00:05.249387	2025-11-11 19:00:05.249387
ebdb5bf4-2272-4cfa-8b0d-0d59f081a565	INDUSTRIA METALURGICA MAXDEL LTDA	9010227	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010227	2025-11-11 19:00:05.278	2025-11-11 19:00:05.311631	2025-11-11 19:00:05.311631
f5d1c5f6-c5f7-4c1f-965f-519e81eb9339	KIDDE BRASIL LTDA.	9010228	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010228	2025-11-11 19:00:05.339	2025-11-11 19:00:05.371695	2025-11-11 19:00:05.371695
31dd54d1-28c5-4af9-b5ce-c92a78487272	ITESAPAR FUNDICAO S.A.	9010229	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010229	2025-11-11 19:00:05.4	2025-11-11 19:00:05.431917	2025-11-11 19:00:05.431917
779bf5b6-f036-4689-a57a-3e5f89d3d3d8	DELGA INDUSTRIA E COMERCIO LTDA	9010230	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010230	2025-11-11 19:00:05.46	2025-11-11 19:00:05.492634	2025-11-11 19:00:05.492634
b6a42357-da35-4069-8941-d14b9233b492	FAURECIA AUTO DO BRASIL LTDA	9010231	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010231	2025-11-11 19:00:05.521	2025-11-11 19:00:05.552895	2025-11-11 19:00:05.552895
effdaa74-ea76-4bf7-aa49-067cc7fab21c	INDUSTRIA ARTEB S A	9010232	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010232	2025-11-11 19:00:05.581	2025-11-11 19:00:05.613603	2025-11-11 19:00:05.613603
6642ad42-e18c-477d-8786-ba8611e5af4a	DANA INDUSTRIAS LTDA	9010233	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010233	2025-11-11 19:00:05.642	2025-11-11 19:00:05.673977	2025-11-11 19:00:05.673977
4146897c-9531-4ff8-95e6-0d2d870a0548	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010234	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010234	2025-11-11 19:00:05.702	2025-11-11 19:00:05.734686	2025-11-11 19:00:05.734686
6c776f16-1bfc-442c-a293-a5dd4c86c4b2	CLARION DO BRASIL LTDA	9010235	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010235	2025-11-11 19:00:05.763	2025-11-11 19:00:05.794632	2025-11-11 19:00:05.794632
0b016122-1ea7-42e9-9b19-9ecfabeb4e11	CISER FIXADORES AUTOMOTIVOS SA	9010236	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010236	2025-11-11 19:00:05.823	2025-11-11 19:00:05.855479	2025-11-11 19:00:05.855479
9b8942a8-f9ee-4b12-bca6-a1806a59f891	MULTIPARTS INDUSTRIA E COMERCIO EIRELI	9010237	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010237	2025-11-11 19:00:05.883	2025-11-11 19:00:05.916261	2025-11-11 19:00:05.916261
2f6273c4-c808-4a41-9982-a161b683f123	SOGEFI FILTRATION DO BRASIL LTDA	9010238	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010238	2025-11-11 19:00:05.944	2025-11-11 19:00:05.975087	2025-11-11 19:00:05.975087
67afaac5-5d9c-484f-952e-9c0ce9c322a2	VOLSWAGEN DO BRASIL INDUSTRIA DE VEICULO	9010239	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010239	2025-11-11 19:00:06.003	2025-11-11 19:00:06.035639	2025-11-11 19:00:06.035639
f06f0cfc-4be7-427e-88c0-bfe0b86c7f64	BRANDL DO BRASIL LTDA	9010240	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010240	2025-11-11 19:00:06.064	2025-11-11 19:00:06.095854	2025-11-11 19:00:06.095854
74c1c1c6-84cd-429a-86d1-2efbae2c0b67	AUTOMETAL SA	9010241	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010241	2025-11-11 19:00:06.124	2025-11-11 19:00:06.155758	2025-11-11 19:00:06.155758
0715b2ca-8fe4-4a8c-bb66-e4584babe267	COOPER STANDARD AUTOMOTIVE BRASIL SEALIN	9010242	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010242	2025-11-11 19:00:06.184	2025-11-11 19:00:06.215884	2025-11-11 19:00:06.215884
a00b5b6a-85fb-4311-9ab6-a26f028f9f70	JOYSON SAFETY SYSTEMS BRASIL LTDA	9010243	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010243	2025-11-11 19:00:06.244	2025-11-11 19:00:06.276043	2025-11-11 19:00:06.276043
37ebcf38-2910-4005-b8a6-0a58a8237716	WEGMANN AUTOMOTIVE BRASIL LTDA	9010244	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010244	2025-11-11 19:00:06.304	2025-11-11 19:00:06.336598	2025-11-11 19:00:06.336598
7aa2d1a6-96f1-4be5-bfaf-b49ab429766c	KATHREIN AUTOMOTIVE DO BRASIL LTDA	9010245	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010245	2025-11-11 19:00:06.364	2025-11-11 19:00:06.396586	2025-11-11 19:00:06.396586
818dd043-95f9-4a49-ba2c-c19ceb64d0a3	BINSIT COMPONENTES AUTOMOTIVOS LTDA	9010246	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010246	2025-11-11 19:00:06.425	2025-11-11 19:00:06.456889	2025-11-11 19:00:06.456889
93e9cec0-da01-41d1-8058-1f885dec2b1f	YAZAKI DO BRASIL LTDA	9010247	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010247	2025-11-11 19:00:06.485	2025-11-11 19:00:06.517152	2025-11-11 19:00:06.517152
0fa2cd37-dc45-4a14-b547-e8b5114800bf	FUPRESA S A	9010248	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010248	2025-11-11 19:00:06.545	2025-11-11 19:00:06.577175	2025-11-11 19:00:06.577175
fd629f5c-cd21-47a2-832d-9e3a5ccd4d2a	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010249	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010249	2025-11-11 19:00:06.605	2025-11-11 19:00:06.637514	2025-11-11 19:00:06.637514
6ed3f056-c60e-4ced-900b-1cff26f7fd88	WHB FUNDICAO S A	9010250	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010250	2025-11-11 19:00:06.666	2025-11-11 19:00:06.697702	2025-11-11 19:00:06.697702
29d0254e-f91b-40fe-b606-9cdf1a874404	INDUSTRIA DE ARTEFATOS PLASTICOS LTDA	9010251	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010251	2025-11-11 19:00:06.726	2025-11-11 19:00:06.757804	2025-11-11 19:00:06.757804
edaa2e1f-41af-48fc-a9b2-093cbc3631cd	VALEO SISTEMAS AUTOMOTIVOS LTDA	9010252	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010252	2025-11-11 19:00:06.786	2025-11-11 19:00:06.817923	2025-11-11 19:00:06.817923
d31caca0-8663-472b-83d9-ca1c2435dd4d	PILKINGTON BRASIL LTDA	9010253	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010253	2025-11-11 19:00:06.846	2025-11-11 19:00:06.877922	2025-11-11 19:00:06.877922
b55d039b-9f0c-467f-9251-2c6bdbf1f3cc	TORO INDUSTRIA E COMERCIO LTDA	9010254	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010254	2025-11-11 19:00:06.906	2025-11-11 19:00:06.938141	2025-11-11 19:00:06.938141
1246107d-d928-4d66-a7ed-a425514b7f97	INDUSTRIA AUTO METALURGICA S A	9010255	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010255	2025-11-11 19:00:06.966	2025-11-11 19:00:06.998351	2025-11-11 19:00:06.998351
3114268e-548a-4d6b-8752-13a12f0bc125	INDEMETAL INDUSTRIA DE ETIQUETAS METALIC	9010256	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010256	2025-11-11 19:00:07.026	2025-11-11 19:00:07.058296	2025-11-11 19:00:07.058296
9c3097cb-77e0-4c98-ba76-92a28bf59f6f	PLANMAR INDUSTRIA E COMERCIO DE PRODUTOS	9010257	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010257	2025-11-11 19:00:07.087	2025-11-11 19:00:07.118741	2025-11-11 19:00:07.118741
0c2b843d-1a84-4a2d-b1ce-7fa16f927302	WEBASTO ROOF SYSTEMS BRASIL LTDA.	9010258	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010258	2025-11-11 19:00:07.147	2025-11-11 19:00:07.179445	2025-11-11 19:00:07.179445
11bfd2d1-63b6-4247-ba38-772c567d5fab	HBA HUTCHINSON BRASIL AUTOMOTIVE LTDA	9010259	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010259	2025-11-11 19:00:07.207	2025-11-11 19:00:07.239516	2025-11-11 19:00:07.239516
55976980-9db6-4e5b-b15d-1ff498986d4e	ZF DO BRASIL LTDA.	9010260	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010260	2025-11-11 19:00:07.267	2025-11-11 19:00:07.29947	2025-11-11 19:00:07.29947
0d59fbe6-60b9-4422-9874-772d8b202dda	NEO RODAS S.A.	9010261	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010261	2025-11-11 19:00:07.328	2025-11-11 19:00:07.360383	2025-11-11 19:00:07.360383
1cefe30a-58eb-4dc9-a9e8-d1ef8889ed0f	SMP AUTOMOTIVE PRODUTOS AUTOMOTIVOS DO B	9010262	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010262	2025-11-11 19:00:07.398	2025-11-11 19:00:07.430202	2025-11-11 19:00:07.430202
3c7c80c3-8464-4ea3-aa42-c3d366ff1376	BROSE DO BRASIL LTDA	9010263	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010263	2025-11-11 19:00:07.458	2025-11-11 19:00:07.490419	2025-11-11 19:00:07.490419
70f9603c-caef-442f-acb8-0aa13e6d60bc	SMP AUTOMOTIVE PRODUTOS AUTOMOTIVOS DO B	9010264	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010264	2025-11-11 19:00:07.518	2025-11-11 19:00:07.550579	2025-11-11 19:00:07.550579
4b39be1c-8c85-4554-9931-1f4d40d51176	PLASTICOS PREMIUM PACK INDUSTRIA E COMER	9010265	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010265	2025-11-11 19:00:07.578	2025-11-11 19:00:07.610602	2025-11-11 19:00:07.610602
0a5a9a02-a724-49cf-8079-bf9753c116a8	BONTAZ CENTRE DO BRASIL INDUSTRIA E COME	9010266	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010266	2025-11-11 19:00:07.638	2025-11-11 19:00:07.670432	2025-11-11 19:00:07.670432
c78d8024-18ab-4aea-99d6-b2d7a688345c	METAL TECNICA BOVENAU LTDA	9010267	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010267	2025-11-11 19:00:07.698	2025-11-11 19:00:07.730276	2025-11-11 19:00:07.730276
973d9ab6-a9ed-4ba7-ba4c-7e31015c1344	PILKINGTON BRASIL LTDA	9010268	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010268	2025-11-11 19:00:07.759	2025-11-11 19:00:07.790875	2025-11-11 19:00:07.790875
df4eea3a-1ffe-440e-ba6b-799c9c8648f2	AMVIAN INDUSTRIA E COMERCIO DE PECAS AUT	9010269	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010269	2025-11-11 19:00:07.819	2025-11-11 19:00:07.851191	2025-11-11 19:00:07.851191
34d40896-a95a-4385-8a16-53c3d4a28dfd	VIBRACOUSTIC SOUTH AMERICA LTDA	9010270	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010270	2025-11-11 19:00:07.879	2025-11-11 19:00:07.911035	2025-11-11 19:00:07.911035
29e3fc06-7771-4d51-8dd9-be82f8909aa5	KATHREIN AUTOMOTIVE DO BRASIL LTDA	9010271	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010271	2025-11-11 19:00:07.939	2025-11-11 19:00:07.971243	2025-11-11 19:00:07.971243
1bb78b39-d6e0-4429-9635-1400ff806e9a	BORGWARNER EMISSIONS SYSTEMS LTDA.	9010272	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010272	2025-11-11 19:00:07.999	2025-11-11 19:00:08.031383	2025-11-11 19:00:08.031383
af2e9d3f-8649-4b51-bd8f-8b7d7edbcd2d	ALEXANDRE CARVALHO OLIVEIRA 91706440987	9010273	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010273	2025-11-11 19:00:08.059	2025-11-11 19:00:08.091362	2025-11-11 19:00:08.091362
376c5c8b-40bb-44d6-bb56-c198604954f2	Z.H.S INDUSTRIA E COMERCIO LTDA	9010274	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010274	2025-11-11 19:00:08.119	2025-11-11 19:00:08.15152	2025-11-11 19:00:08.15152
3653ed43-ae13-4e80-9a4b-cc7f7207c39f	MAXION WHEELS DO BRASIL LTDA.	9010275	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010275	2025-11-11 19:00:08.179	2025-11-11 19:00:08.21167	2025-11-11 19:00:08.21167
1594a3c0-bf6a-446a-ac96-14d4e3c76950	AUTOMETAL S/A	9010276	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010276	2025-11-11 19:00:08.239	2025-11-11 19:00:08.271586	2025-11-11 19:00:08.271586
e1e5395f-03ff-4af1-84d6-d2cabdc5ed79	MAC INDUSTRIA MECANICA LTDA	9010277	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010277	2025-11-11 19:00:08.3	2025-11-11 19:00:08.331841	2025-11-11 19:00:08.331841
a5f7ff31-8a97-49c0-a910-d080a5aa77bb	EATON LTDA	9010278	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010278	2025-11-11 19:00:08.36	2025-11-11 19:00:08.392182	2025-11-11 19:00:08.392182
9b1fcfdd-d522-4b75-b85d-09fdf29b2708	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS E C	9010279	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010279	2025-11-11 19:00:08.422	2025-11-11 19:00:08.454232	2025-11-11 19:00:08.454232
147baa38-fb27-4472-8360-90c9a7e36102	SAARGUMMI DO BRASIL LTDA	9010280	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010280	2025-11-11 19:00:08.482	2025-11-11 19:00:08.514497	2025-11-11 19:00:08.514497
663d0883-fa2b-4ee3-9b36-04f72fa91a47	VMG INDUSTRIA METALURGICA LTDA	9010281	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010281	2025-11-11 19:00:08.542	2025-11-11 19:00:08.574544	2025-11-11 19:00:08.574544
99edfeb1-ab83-4062-a7cc-758e174376a2	NSK BRASIL LTDA	9010282	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010282	2025-11-11 19:00:08.602	2025-11-11 19:00:08.634548	2025-11-11 19:00:08.634548
fa039d1f-702e-4f13-815e-4f375fbee443	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS IND	9010283	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010283	2025-11-11 19:00:08.663	2025-11-11 19:00:08.694625	2025-11-11 19:00:08.694625
b7d90f85-a384-40ee-a10f-7b73a13ce430	NIKEN INDUSTRIA E COMERCIO METALURGICA L	9010284	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010284	2025-11-11 19:00:08.723	2025-11-11 19:00:08.754729	2025-11-11 19:00:08.754729
d7e696a4-c298-4df9-a010-f44c7e60768c	VOLKSWAGEN DO BRASIL INDUSTRIA DE VEICUL	9010285	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010285	2025-11-11 19:00:08.784	2025-11-11 19:00:08.815992	2025-11-11 19:00:08.815992
7af7b12f-4319-4840-b3cc-711c78127fc0	PARKER HANNIFIN INDUSTRIA E COMERCIO LTD	9010286	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010286	2025-11-11 19:00:08.844	2025-11-11 19:00:08.876537	2025-11-11 19:00:08.876537
fe0a387b-d4ec-4364-aca3-a3569ed416ad	METALURGICA SUPRENS LTDA	9010287	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010287	2025-11-11 19:00:08.905	2025-11-11 19:00:08.936863	2025-11-11 19:00:08.936863
7402f42d-48f2-45e6-b39d-6592b1b0cebe	IRMAOS PARASMO SA INDUSTRIA MECANICA	9010288	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010288	2025-11-11 19:00:08.965	2025-11-11 19:00:08.996985	2025-11-11 19:00:08.996985
97a84342-f22a-48fd-881e-eb72436476ff	AUTO PARTS ALUMINIO DO BRASIL LTDA	9010289	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010289	2025-11-11 19:00:09.025	2025-11-11 19:00:09.057049	2025-11-11 19:00:09.057049
77b71ce2-2613-489f-bb45-494710b31492	MAHLE METAL LEVE S.A.	9010290	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010290	2025-11-11 19:00:09.085	2025-11-11 19:00:09.117215	2025-11-11 19:00:09.117215
0f5548a2-85f8-4cc9-91cc-7d84042888fb	FUJIKURA AUTOMOTIVE DO BRASIL LTDA.	9010291	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010291	2025-11-11 19:00:09.145	2025-11-11 19:00:09.176167	2025-11-11 19:00:09.176167
babbbf19-2c59-495d-b1c7-2b0673f2fbf4	SIKA S A	9010292	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010292	2025-11-11 19:00:09.204	2025-11-11 19:00:09.236486	2025-11-11 19:00:09.236486
a16a1446-8020-4a37-8766-6dad0ce5b5d3	VARROC DO BRASIL COMERCIO, IMPORTACAO E	9010293	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010293	2025-11-11 19:00:09.264	2025-11-11 19:00:09.296512	2025-11-11 19:00:09.296512
a977ff2c-84d0-47c5-8e05-35c45042d9d0	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010294	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010294	2025-11-11 19:00:09.324	2025-11-11 19:00:09.356447	2025-11-11 19:00:09.356447
888f85ec-6858-44e4-94e0-def14c61084a	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010295	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010295	2025-11-11 19:00:09.384	2025-11-11 19:00:09.416377	2025-11-11 19:00:09.416377
8d619174-3ee9-4ea4-ae76-ea4406f73a68	THYSSENKRUPP BRASIL LTDA.	9010296	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010296	2025-11-11 19:00:09.444	2025-11-11 19:00:09.476694	2025-11-11 19:00:09.476694
22210009-9b9e-4c7d-bce6-c42614562b58	FOCUS TECNOLOGIA DE PLASTICOS S/A	9010297	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010297	2025-11-11 19:00:09.505	2025-11-11 19:00:09.536996	2025-11-11 19:00:09.536996
380393ff-bc0a-4af0-81f1-0a302cc7e2e9	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010298	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010298	2025-11-11 19:00:09.565	2025-11-11 19:00:09.59625	2025-11-11 19:00:09.59625
38579809-7ed2-404f-a429-9b479745b186	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010299	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010299	2025-11-11 19:00:09.624	2025-11-11 19:00:09.656384	2025-11-11 19:00:09.656384
2d5b36a7-5388-416c-bb17-badc21796857	BINS INDUSTRIA DE ARTEFATOS DE BORRACHA	9010300	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010300	2025-11-11 19:00:09.685	2025-11-11 19:00:09.716872	2025-11-11 19:00:09.716872
2e2d44bc-3525-4728-9eda-d78adf1e8636	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010301	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010301	2025-11-11 19:00:09.745	2025-11-11 19:00:09.776756	2025-11-11 19:00:09.776756
61f470ad-72ee-427e-a142-e027b7b5881b	ASPOL INDUSTRIA E COMERCIO LTDA	9010302	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010302	2025-11-11 19:00:09.805	2025-11-11 19:00:09.837497	2025-11-11 19:00:09.837497
ad7646b5-2678-4c86-8a43-933e2547147e	ENGEMET INDUSTRIA E COMERCIO DE EQUIPAME	9010303	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010303	2025-11-11 19:00:09.865	2025-11-11 19:00:09.897653	2025-11-11 19:00:09.897653
1fbbd3f5-2a14-45c3-9a19-e64bbf5b0ee4	THYSSENKRUPP BRASIL LTDA.	9010304	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010304	2025-11-11 19:00:09.926	2025-11-11 19:00:09.957933	2025-11-11 19:00:09.957933
5734d45d-5c0f-4efc-8159-87f6efcab941	METALURGICA FEY LTDA	9010305	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010305	2025-11-11 19:00:09.986	2025-11-11 19:00:10.018133	2025-11-11 19:00:10.018133
f75fd944-d41f-4532-b18b-970d1033f8f4	AUTO PARTS ALUMINIO DO BRASIL LTDA	9010306	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010306	2025-11-11 19:00:10.046	2025-11-11 19:00:10.078419	2025-11-11 19:00:10.078419
ea685199-63da-4f83-a70f-bc2b727bb2c0	CONTINENTAL BRASIL INDUSTRIA AUTOMOTIVA	9010307	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010307	2025-11-11 19:00:10.107	2025-11-11 19:00:10.140106	2025-11-11 19:00:10.140106
bb313d3e-f9b2-4c9e-a4f3-6a0ac7f5c475	ACUMENT BRASIL SISTEMAS DE FIXACAO S.A.	9010308	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010308	2025-11-11 19:00:10.168	2025-11-11 19:00:10.200095	2025-11-11 19:00:10.200095
6f554598-7dcb-4052-8835-bdf6a6a63ac8	AUDI DO BRASIL INDUSTRIA E COMERCIO DE V	9010309	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010309	2025-11-11 19:00:10.228	2025-11-11 19:00:10.259115	2025-11-11 19:00:10.259115
e460ddb6-bbb1-400b-b538-30382749d777	REAL MECANICA DE PRECISAO EIRELI	9010310	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010310	2025-11-11 19:00:10.288	2025-11-11 19:00:10.319821	2025-11-11 19:00:10.319821
ff8f8c31-ab03-401f-ac38-7148117660c5	QUALIFLEX PRODUTOS TÃ‰CNICOS DE BORRACHA	9010311	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010311	2025-11-11 19:00:10.348	2025-11-11 19:00:10.379684	2025-11-11 19:00:10.379684
58263cd9-781c-4276-94f7-2c45f7cf4aec	SCHLEMMER DO BRASIL	9010312	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010312	2025-11-11 19:00:10.407	2025-11-11 19:00:10.439666	2025-11-11 19:00:10.439666
f8665155-1b80-4520-8748-cd530082c3a0	OMRCOMPONENTES AUTOMOTIVOS LTDA	9010313	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010313	2025-11-11 19:00:10.468	2025-11-11 19:00:10.500078	2025-11-11 19:00:10.500078
73547fcf-9b8e-4a4e-9832-d88c07f38d5a	KNORR BREMSE SPVC LTDA	9010314	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010314	2025-11-11 19:00:10.528	2025-11-11 19:00:10.560718	2025-11-11 19:00:10.560718
e9b0293f-5a48-4706-869a-89b0525325f5	NYCOL - PLAST INDUSTRIA E COMERCIO LTDA	9010315	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010315	2025-11-11 19:00:10.589	2025-11-11 19:00:10.621108	2025-11-11 19:00:10.621108
f615936d-1164-43b1-9153-e5244acf1e3e	MAN LATIN AMERICA INDUSTRIA E COMERCIO D	9010316	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010316	2025-11-11 19:00:10.649	2025-11-11 19:00:10.681285	2025-11-11 19:00:10.681285
a76a3546-9483-4260-8f28-d9daebf57b17	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010317	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010317	2025-11-11 19:00:10.709	2025-11-11 19:00:10.74156	2025-11-11 19:00:10.74156
fa4ff31c-600e-405e-9e19-aefc8962eed8	ENGEMET METALURGIA E COMERCIO LTDA	9010318	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010318	2025-11-11 19:00:10.77	2025-11-11 19:00:10.80226	2025-11-11 19:00:10.80226
df4893ca-0f05-4f6d-b412-36c47361bd36	KONGSBERG AUTOMOTIVE LTDA	9010319	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010319	2025-11-11 19:00:10.83	2025-11-11 19:00:10.862141	2025-11-11 19:00:10.862141
34c6ba23-df97-458d-9836-0add8a88c36a	FIPLAS INDUSTRIA E COMERCIO LTDA	9010320	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010320	2025-11-11 19:00:10.89	2025-11-11 19:00:10.922547	2025-11-11 19:00:10.922547
842d189e-5899-458a-a520-4c6b4327961a	ENARPE SERVICOS E SOLUCOES AMBIENTAIS LT	9010321	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010321	2025-11-11 19:00:10.951	2025-11-11 19:00:10.982773	2025-11-11 19:00:10.982773
2ca6b226-056a-47e5-8ebc-694029f9f4b2	METAL. MAUSER INDUSTRIAL E COMERCIO LTDA	9010322	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010322	2025-11-11 19:00:11.011	2025-11-11 19:00:11.043117	2025-11-11 19:00:11.043117
e6f6c200-9fdc-4a88-b12a-afc00aaacd19	BLEISTAHL BRASIL METALURGIA LTDA	9010323	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010323	2025-11-11 19:00:11.071	2025-11-11 19:00:11.103326	2025-11-11 19:00:11.103326
e36c5fc5-77f8-48e0-a91e-d0b6742ab2fe	MCP TRANSPORTES RODOVIARIOS S/A	9010324	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010324	2025-11-11 19:00:11.131	2025-11-11 19:00:11.163498	2025-11-11 19:00:11.163498
a49c2118-680f-458d-b1ce-aa4447e5bd68	COMPONENT INDUSTRIA E COMERCIO LTDA	9010325	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010325	2025-11-11 19:00:11.192	2025-11-11 19:00:11.223749	2025-11-11 19:00:11.223749
d5784fe6-4a84-454b-83e1-41b0c65ceb2e	METALAC INDUSTRIA E COMERCIO LTDA.	9010326	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010326	2025-11-11 19:00:11.252	2025-11-11 19:00:11.284048	2025-11-11 19:00:11.284048
15d6d821-046a-4e86-9aee-fcf7f128aa77	W. D. COMERCIO DE PECAS E ACESSORIOS PAR	9010327	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010327	2025-11-11 19:00:11.312	2025-11-11 19:00:11.343191	2025-11-11 19:00:11.343191
dc55d334-13fe-41cc-9e2e-5afaa0baa8fd	H.SILVA INJEÃ‡AO DE TERMOPLASTICOS	9010328	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010328	2025-11-11 19:00:11.371	2025-11-11 19:00:11.40316	2025-11-11 19:00:11.40316
1f50d6a4-73ec-4254-9fde-72aae170f11d	INYLBRA INDUSTRIA E COMERCIO LTDA	9010329	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010329	2025-11-11 19:00:11.431	2025-11-11 19:00:11.46335	2025-11-11 19:00:11.46335
8e4f573e-d866-4de9-893d-27445203c57f	ZF DO BRASIL LTDA	9010330	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010330	2025-11-11 19:00:11.492	2025-11-11 19:00:11.523833	2025-11-11 19:00:11.523833
6fd6a5e2-0f4d-4617-b908-966347bb7d55	COBRA METAIS DECORATIVOS LTDA	9010331	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010331	2025-11-11 19:00:11.552	2025-11-11 19:00:11.584127	2025-11-11 19:00:11.584127
dcc87eb0-0f4f-4675-9384-a23450e9b1f8	COOPER-STANDARD AUTOMOTIVE BRASIL SEALIN	9010332	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010332	2025-11-11 19:00:11.612	2025-11-11 19:00:11.644091	2025-11-11 19:00:11.644091
1ce24910-e5b4-4a59-aeb0-82f78df7bbe7	MDA DO BRASIL INDUSTRIA E COMERCIO EIREL	9010333	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010333	2025-11-11 19:00:11.672	2025-11-11 19:00:11.704348	2025-11-11 19:00:11.704348
1a6cfe50-4473-407d-9574-ac24d2c34494	PRICOL DO BRASIL COMPONENTES AUTOMOTIVOS	9010334	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010334	2025-11-11 19:00:11.732	2025-11-11 19:00:11.764416	2025-11-11 19:00:11.764416
196f0deb-8acf-4054-ab73-7910ee5f8ede	ROBERT BOSCH DIRECAO AUTOMOTIVA LTDA	9010335	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010335	2025-11-11 19:00:11.792	2025-11-11 19:00:11.824547	2025-11-11 19:00:11.824547
0e95a4ef-6cc4-47e6-a365-9eb5c3e4853e	SUNNINGDALE TECH PLASTICOS (BRASIL) LTDA	9010336	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010336	2025-11-11 19:00:11.852	2025-11-11 19:00:11.884485	2025-11-11 19:00:11.884485
4f9250cc-2c3d-4e67-80e5-65830c4ff353	TEKSID DO BRASIL LTDA	9010337	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010337	2025-11-11 19:00:11.913	2025-11-11 19:00:11.944927	2025-11-11 19:00:11.944927
0d119231-5040-4fc4-ad09-1049599f68f9	D. DE S. SALES MANUTENCAO	9010338	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010338	2025-11-11 19:00:11.973	2025-11-11 19:00:12.004716	2025-11-11 19:00:12.004716
a77a4fe0-bef8-490e-8352-e5a7f45912e1	FEDERAL-MOGUL SISTEMAS AUTOMOTIVOS LTDA.	9010339	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010339	2025-11-11 19:00:12.033	2025-11-11 19:00:12.065059	2025-11-11 19:00:12.065059
427ff62d-bca2-4254-b2c7-e58327a6dc3f	FCA FIAT CHRYSLER AUTOMOVEIS BRASIL LTDA	9010340	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010340	2025-11-11 19:00:12.093	2025-11-11 19:00:12.125528	2025-11-11 19:00:12.125528
79752bcf-e63a-4de2-91c4-8a45d0269014	MAGNETI MARELLI SISTEMAS AUTOMOTIVOS IND	9010341	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010341	2025-11-11 19:00:12.153	2025-11-11 19:00:12.185741	2025-11-11 19:00:12.185741
a6d94e3d-8465-4434-82b3-99d4d08fcc4b	SANOH DO BRASIL INDUSTRIA E COMERCIO DE	9010342	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010342	2025-11-11 19:00:12.214	2025-11-11 19:00:12.245975	2025-11-11 19:00:12.245975
1e092f97-08c5-4b94-97fc-24037e48b9ae	SOCIEDADE COMERCIAL TOYOTA TSUSHO DO BRA	9010343	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010343	2025-11-11 19:00:12.274	2025-11-11 19:00:12.306152	2025-11-11 19:00:12.306152
20831fd6-ce06-46e1-8ded-db5f16d35b83	PARANOA INDUSTRIA DE BORRACHA LTDA.	9010344	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010344	2025-11-11 19:00:12.334	2025-11-11 19:00:12.36614	2025-11-11 19:00:12.36614
8bbf4b92-872d-421f-93a9-ac6f058ebc7a	FCA POWERTRAIN BRASIL INDUSTRIA E COMERC	9010345	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010345	2025-11-11 19:00:12.394	2025-11-11 19:00:12.426496	2025-11-11 19:00:12.426496
8839f52b-d506-4904-9c47-b77667bf1cbd	PLASTICOS NOVEL SAO PAULO LTDA.	9010346	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010346	2025-11-11 19:00:12.454	2025-11-11 19:00:12.486924	2025-11-11 19:00:12.486924
bee1e47c-e2eb-402f-9a1b-9f5fa736e362	TEKNIA BRASIL LTDA.	9010347	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010347	2025-11-11 19:00:12.515	2025-11-11 19:00:12.546894	2025-11-11 19:00:12.546894
ab3ece17-2b3c-4692-9e6d-4c813ab40124	SKF DO BRASIL LTDA	9010348	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010348	2025-11-11 19:00:12.575	2025-11-11 19:00:12.606731	2025-11-11 19:00:12.606731
08316b7c-6d77-43a2-9665-ea1ae78afa68	VOLVO DO BRASIL VEICULOS LTDA	9010349	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010349	2025-11-11 19:00:12.635	2025-11-11 19:00:12.666757	2025-11-11 19:00:12.666757
dbe646ca-1033-40f5-9d8a-324276a5ded6	GT TECHNOLOGIES DO BRASIL COMPONENTES AU	9010350	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010350	2025-11-11 19:00:12.695	2025-11-11 19:00:12.727116	2025-11-11 19:00:12.727116
5e7a3334-834a-4412-a2df-224ac03ca2c2	TESA BRASIL LTDA	9010351	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010351	2025-11-11 19:00:12.755	2025-11-11 19:00:12.787673	2025-11-11 19:00:12.787673
7bbaf224-3f4b-4fa2-88a4-3e3afbe0ecaf	KONNECT INDUSTRIA E COMERCIO LTDA	9010352	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010352	2025-11-11 19:00:12.816	2025-11-11 19:00:12.847689	2025-11-11 19:00:12.847689
33e0499a-bf3c-474b-b71f-e9b7b31d1c54	SCHULZ S/A	9010353	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010353	2025-11-11 19:00:12.875	2025-11-11 19:00:12.907574	2025-11-11 19:00:12.907574
a08baf11-3cc9-4c41-af37-862684847d85	VETORE INDUSTRIA E COMERCIO DE AUTOPECAS	9010354	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010354	2025-11-11 19:00:12.936	2025-11-11 19:00:12.967737	2025-11-11 19:00:12.967737
fe930da0-e861-4373-979a-41318d0bc295	TUBODIN INDUSTRIAL LTDA	9010355	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010355	2025-11-11 19:00:12.996	2025-11-11 19:00:13.028183	2025-11-11 19:00:13.028183
c8a4700d-13cd-49a5-a909-ee174adc6b2c	ISEL USINAGEM E MECANICA EM GERAL LTDA	9010356	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010356	2025-11-11 19:00:13.056	2025-11-11 19:00:13.08834	2025-11-11 19:00:13.08834
c6c981ec-fa39-48cd-9e03-4eeed4c19ffb	PELZER DA BAHIA LTDA	9010357	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010357	2025-11-11 19:00:13.116	2025-11-11 19:00:13.148421	2025-11-11 19:00:13.148421
de96ad9e-a2b0-4674-800e-c4bf09f109a5	ETHOS INDUSTRIAL LTDA.	9010358	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010358	2025-11-11 19:00:13.176	2025-11-11 19:00:13.208616	2025-11-11 19:00:13.208616
aa38e986-183f-4690-a2bd-183456b068a7	GRANACO FUNDICAO LTDA.	9010359	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010359	2025-11-11 19:00:13.237	2025-11-11 19:00:13.26889	2025-11-11 19:00:13.26889
50068555-5935-419d-8746-b952eaf3a4ec	EATON LTDA	9010360	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010360	2025-11-11 19:00:13.297	2025-11-11 19:00:13.329281	2025-11-11 19:00:13.329281
a5dd1a3d-5924-4fd9-9427-762ae12d0cc1	BATZ LIGHTWEIGHT SYSTEMS DO BRASIL LTDA	9010361	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010361	2025-11-11 19:00:13.357	2025-11-11 19:00:13.389496	2025-11-11 19:00:13.389496
ac416eb1-fbcf-4b0e-aa14-09ccb60bcafe	DICASTAL DO BRASIL PECAS PARA VEICULOS L	9010362	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010362	2025-11-11 19:00:13.417	2025-11-11 19:00:13.449678	2025-11-11 19:00:13.449678
1e7ca7e8-f92d-477c-abaf-2d78c6a6b2b5	FUJI AUTOTECH AUTOPECAS DO BRASIL LTDA	9010363	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010363	2025-11-11 19:00:13.477	2025-11-11 19:00:13.509716	2025-11-11 19:00:13.509716
4ba35edf-1936-4b41-b071-b71dab2350b4	VOLVO DO BRASIL VEICULOS LTDA	9010365	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010365	2025-11-11 19:00:13.538	2025-11-11 19:00:13.57038	2025-11-11 19:00:13.57038
189ecdad-ba26-4ddf-8670-1dc0d5fb7c20	BRIENZI USINAGEM EIRELI	9010366	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010366	2025-11-11 19:00:13.599	2025-11-11 19:00:13.630882	2025-11-11 19:00:13.630882
ce1251df-94ed-4f79-94db-67582b5f3199	ELDOR DO BRASIL COMPONENTES AUTOMOTIVOS	9010367	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010367	2025-11-11 19:00:13.659	2025-11-11 19:00:13.691208	2025-11-11 19:00:13.691208
7349d691-5f39-4a13-be96-3346df16586c	LQ REPRESENTACOES	9010368	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010368	2025-11-11 19:00:13.719	2025-11-11 19:00:13.751295	2025-11-11 19:00:13.751295
396ac483-ecc1-4116-9f98-2f1363f1e5d7	TUPER S/A	9010369	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010369	2025-11-11 19:00:13.779	2025-11-11 19:00:13.811584	2025-11-11 19:00:13.811584
90f636fe-9716-4ec1-bbb7-216eabf319bf	HENGST INDUSTRIA DE FILTROS LTDA	9010370	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010370	2025-11-11 19:00:13.84	2025-11-11 19:00:13.871669	2025-11-11 19:00:13.871669
53fd9c2e-e279-4e03-989f-d9ce9cc382f9	TI BRASIL INDUSTRIA E COMERCIO LTDA	9010371	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010371	2025-11-11 19:00:13.9	2025-11-11 19:00:13.931655	2025-11-11 19:00:13.931655
2be86902-67e4-47e4-89a1-8635aaa247a4	MARTINREA HONSEL BRASIL FUNDICAO E COMER	9010372	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010372	2025-11-11 19:00:13.959	2025-11-11 19:00:13.99162	2025-11-11 19:00:13.99162
a79fe2a1-dbd0-440e-83ab-e36297609486	SKY CORTE LASER EIRELI	9010373	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010373	2025-11-11 19:00:14.02	2025-11-11 19:00:14.05196	2025-11-11 19:00:14.05196
095ba815-d375-4837-a99f-10b00773f84e	SMR AUTOMOTIVE BRASIL LTDA.	9010374	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010374	2025-11-11 19:00:14.08	2025-11-11 19:00:14.11219	2025-11-11 19:00:14.11219
2395a3f6-3780-4c6e-a032-31569577166d	TENNECO AUTOMOTIVE BRASIL LTDA	9010375	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010375	2025-11-11 19:00:14.14	2025-11-11 19:00:14.172745	2025-11-11 19:00:14.172745
c089aac9-2233-46c0-baf7-c7c3b2c0ecb1	SEG AUTOMOTIVE COMPONENTS BRAZIL LTDA.	9010376	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010376	2025-11-11 19:00:14.267	2025-11-11 19:00:14.298818	2025-11-11 19:00:14.298818
49d70838-4218-4e73-b838-b66bb10db578	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010377	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010377	2025-11-11 19:00:14.327	2025-11-11 19:00:14.359181	2025-11-11 19:00:14.359181
18d6eaf3-bae8-4f87-b664-b064f4c4843f	GILVANEY SANTOS ASSUMPCAO	9010378	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010378	2025-11-11 19:00:14.387	2025-11-11 19:00:14.419463	2025-11-11 19:00:14.419463
8409eeed-134b-45ff-a750-0b0ebf5629b4	MAN LATIN AMERICA INDUSTRIA E COMERCIO D	9010379	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010379	2025-11-11 19:00:14.448	2025-11-11 19:00:14.479332	2025-11-11 19:00:14.479332
4d9ffd34-d2b7-4e07-ae43-94d48f0c7e35	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010380	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010380	2025-11-11 19:00:14.508	2025-11-11 19:00:14.539191	2025-11-11 19:00:14.539191
bf6c9d58-c5d1-4a5c-aa66-c74f6428d168	VETORE INDUSTRIA E COMERCIO DE AUTOPECAS	9010381	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010381	2025-11-11 19:00:14.567	2025-11-11 19:00:14.599538	2025-11-11 19:00:14.599538
3b69c909-ad81-443e-802b-faf762fab76d	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010382	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010382	2025-11-11 19:00:14.627	2025-11-11 19:00:14.659701	2025-11-11 19:00:14.659701
ff085854-6631-4d4f-97c6-3d44e40f4993	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010383	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010383	2025-11-11 19:00:14.688	2025-11-11 19:00:14.720101	2025-11-11 19:00:14.720101
479b832e-5dc8-47b0-b6dd-10a07207cacd	BRIENZE USINAGEM EIRELI	9010384	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010384	2025-11-11 19:00:14.748	2025-11-11 19:00:14.780597	2025-11-11 19:00:14.780597
ad2a8e58-023e-445b-ad0e-d1da13873202	GILVANEY SANTOS ASSUMPCAO	9010385	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010385	2025-11-11 19:00:14.809	2025-11-11 19:00:14.84073	2025-11-11 19:00:14.84073
85dc400d-2951-445e-be54-35af2a4b00bb	C R W INDUSTRIA E COMERCIO DE PLASTICOS	9010386	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010386	2025-11-11 19:00:14.869	2025-11-11 19:00:14.900965	2025-11-11 19:00:14.900965
378d5958-c38d-4691-95da-3a370ef377aa	VOLVO EQUIPAMENTOS DE CONSTRUCAO LATIN A	9010387	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010387	2025-11-11 19:00:14.929	2025-11-11 19:00:14.960957	2025-11-11 19:00:14.960957
dd122533-d1b1-4f9c-8871-e3f129a7cc28	SIAN - SISTEMAS DE ILUMINACAO AUTOMOTIVA	9010388	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010388	2025-11-11 19:00:14.989	2025-11-11 19:00:15.020931	2025-11-11 19:00:15.020931
4d4e13a9-09b0-49e8-a7c6-48320bcb20f3	SCHULZ S/A	9010389	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010389	2025-11-11 19:00:15.049	2025-11-11 19:00:15.080975	2025-11-11 19:00:15.080975
c7229e78-82d6-46b3-8a11-3f0424ecefa3	AUTOMETAL S/A	9010390	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010390	2025-11-11 19:00:15.109	2025-11-11 19:00:15.141172	2025-11-11 19:00:15.141172
f7d872fc-5493-434c-971e-caab6715b87a	PELZER DA BAHIA LTDA	9010391	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010391	2025-11-11 19:00:15.169	2025-11-11 19:00:15.201302	2025-11-11 19:00:15.201302
1051576c-7bbf-40d9-83bd-e1974a53fcb0	MEGATECH BRASIL COMPONENTES AUTOMOTIVOS	9010392	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010392	2025-11-11 19:00:15.23	2025-11-11 19:00:15.262017	2025-11-11 19:00:15.262017
4f6d0f88-3e37-4c88-8202-accd0e5764d2	AUTOLIV DO BRASIL LTDA	9010393	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010393	2025-11-11 19:00:15.29	2025-11-11 19:00:15.322134	2025-11-11 19:00:15.322134
ead2e56c-eb49-4f6a-8380-b5005f0dedc6	ALPINO INDUSTRIA METALURGICA LTDA	9010394	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010394	2025-11-11 19:00:15.35	2025-11-11 19:00:15.382443	2025-11-11 19:00:15.382443
e1fab8ae-1653-4c1c-ad1c-533188d27861	PELZER DO BRASIL LTDA	9010395	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010395	2025-11-11 19:00:15.412	2025-11-11 19:00:15.444151	2025-11-11 19:00:15.444151
89f6802a-1ccc-482f-a14a-918be3c942c6	HI-LEX DO BRASIL LTDA.	9010396	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010396	2025-11-11 19:00:15.472	2025-11-11 19:00:15.504286	2025-11-11 19:00:15.504286
9b60e37f-d865-41ff-a868-b41d158ebf66	MAGIUS METALURGICA INDUSTRIAL LTDA	9010397	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010397	2025-11-11 19:00:15.532	2025-11-11 19:00:15.564521	2025-11-11 19:00:15.564521
546ca2c7-e1f5-4ac1-9a92-e223a64c7104	LC PECAS TECNICAS EM ESPUMAS - EIRELI	9010398	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010398	2025-11-11 19:00:15.593	2025-11-11 19:00:15.624951	2025-11-11 19:00:15.624951
8e3e04a0-a758-4445-bb01-f0ff5ae66491	PELZER DA BAHIA LTDA	9010399	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010399	2025-11-11 19:00:15.653	2025-11-11 19:00:15.685598	2025-11-11 19:00:15.685598
15fe1312-a652-44ea-9818-f8aa7a8f489d	FUNDIMISA - FUNDICAO E USINAGEM LTDA.	9010400	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010400	2025-11-11 19:00:15.714	2025-11-11 19:00:15.746097	2025-11-11 19:00:15.746097
c5859a7d-9a43-4b3b-b612-f851233ed2ab	FLAMMA AUTOMOTIVA S/A	9010401	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010401	2025-11-11 19:00:15.775	2025-11-11 19:00:15.807427	2025-11-11 19:00:15.807427
835ed51d-36ac-4fa2-aca7-9a0c1ed469fc	MUSASHI DO BRASIL LTDA	9010402	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010402	2025-11-11 19:00:15.835	2025-11-11 19:00:15.867413	2025-11-11 19:00:15.867413
8194b4c5-1ff8-41a2-8384-b6a70d60b991	FEEDER INDUSTRIAL LTDA	9010403	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010403	2025-11-11 19:00:15.896	2025-11-11 19:00:15.927892	2025-11-11 19:00:15.927892
a4d28f90-16b2-4d98-8b99-08f0d25c1e97	GESTAMP BRASIL INDUSTRIA DE AUTOPECAS S/	9010404	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010404	2025-11-11 19:00:15.956	2025-11-11 19:00:15.988277	2025-11-11 19:00:15.988277
7707c6a8-642f-4027-9492-2bcfc32bb8fe	NETZSCH INDUSTRIA E COMERCIO DE EQUIPAME	9010405	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010405	2025-11-11 19:00:16.016	2025-11-11 19:00:16.048226	2025-11-11 19:00:16.048226
2d868915-e7d2-456e-a3d9-dfcf16262bee	PILKINGTON BRASIL LTDA	9010406	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010406	2025-11-11 19:00:16.076	2025-11-11 19:00:16.108106	2025-11-11 19:00:16.108106
a819692b-c488-4809-a460-0bdf64de07aa	PROGERAL INDUSTRIA DE ARTEFATOS PLASTICO	9010407	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010407	2025-11-11 19:00:16.136	2025-11-11 19:00:16.168317	2025-11-11 19:00:16.168317
53ccd2bb-2c04-45f1-99bc-1790cdc9fd2d	SETAL TRANSPORTES LTDA	9010408	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010408	2025-11-11 19:00:16.196	2025-11-11 19:00:16.228798	2025-11-11 19:00:16.228798
22a4ca62-ea27-4468-8d2b-185eac3220f8	THYSSENKRUPP METALURGICA CAMPO LIMPO LTD	9010409	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010409	2025-11-11 19:00:16.257	2025-11-11 19:00:16.289572	2025-11-11 19:00:16.289572
f7afbd36-0194-4085-9415-b2bba7fff0fd	WEIDPLAS BRASIL INDUSTRIA E COMERCIO DE	9010410	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010410	2025-11-11 19:00:16.318	2025-11-11 19:00:16.350616	2025-11-11 19:00:16.350616
bf8ca370-327c-43b4-811d-ebad1b7a6131	AETHRA SISTEMAS AUTOMOTIVOS S.A.	9010411	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010411	2025-11-11 19:00:16.379	2025-11-11 19:00:16.413724	2025-11-11 19:00:16.413724
37fa1981-c0f0-4d31-88a2-55d56954021b	INBRASC - INDUSTRIA BRASILEIRA DE COMPON	9010412	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010412	2025-11-11 19:00:16.442	2025-11-11 19:00:16.475091	2025-11-11 19:00:16.475091
0476f2cb-e7db-4fcf-ae7b-d362e78a1ede	SMP AUTOMOTIVE P. AUT.DO BRASIL LTDA	9010413	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010413	2025-11-11 19:00:16.503	2025-11-11 19:00:16.535642	2025-11-11 19:00:16.535642
829db5f7-6fcd-4ebf-b786-f3748c489f2b	ADIENT DO BRASIL BANCOS AUTOMOTIVOS LTDA	9010414	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010414	2025-11-11 19:00:16.563	2025-11-11 19:00:16.595644	2025-11-11 19:00:16.595644
17398021-cbd4-4ea0-bceb-c743a234af30	GENERAL MOTORS DO BRASIL LTDA	9010415	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010415	2025-11-11 19:00:16.623	2025-11-11 19:00:16.655801	2025-11-11 19:00:16.655801
769b9dc2-a1c9-4045-8d27-4acf6c84b449	VITESCO TECNOLOGIA BRASIL AUTOMOTIVA LTD	9010416	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010416	2025-11-11 19:00:16.684	2025-11-11 19:00:16.71591	2025-11-11 19:00:16.71591
eb0cf289-1da6-4e99-934f-30ec669a604b	TRG MONTAGEM E ACABAMENTO DE PECAS LTDA	9010417	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010417	2025-11-11 19:00:16.744	2025-11-11 19:00:16.775934	2025-11-11 19:00:16.775934
a2371190-951d-4025-a64a-1c8232dec8f8	TUPER S/A	9010418	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010418	2025-11-11 19:00:16.804	2025-11-11 19:00:16.835901	2025-11-11 19:00:16.835901
8da415d6-1b71-4e1d-9608-9e3b03986930	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010419	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010419	2025-11-11 19:00:16.864	2025-11-11 19:00:16.897867	2025-11-11 19:00:16.897867
c858dc1e-9512-4ac0-9773-c0031fcad88f	PEUGEOT-CITROEN DO BRASIL AUTOMOVEIS LTD	9010420	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010420	2025-11-11 19:00:16.926	2025-11-11 19:00:16.957959	2025-11-11 19:00:16.957959
0c228caa-fc3f-43cb-9d0e-27a1781eb42c	CESTARI INDUSTRIAL E COMERCIAL SA	9010421	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010421	2025-11-11 19:00:16.986	2025-11-11 19:00:17.017866	2025-11-11 19:00:17.017866
4551d9db-3ccb-4af2-bbd9-b8cd57953cfd	INDUSTRIA MECANICA KONDOR LTDA	9010422	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010422	2025-11-11 19:00:17.046	2025-11-11 19:00:17.077992	2025-11-11 19:00:17.077992
80c69258-17e7-4a65-9fac-548e9b06ca13	W V INDUSTRIA METALURGICA LTDA	9010423	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010423	2025-11-11 19:00:17.106	2025-11-11 19:00:17.13834	2025-11-11 19:00:17.13834
b0a3d59b-fcfe-4fac-8144-20c3d7205bf8	TRELLEBORG DO BRASIL SOLUCOES EM VEDACAO	9010424	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010424	2025-11-11 19:00:17.166	2025-11-11 19:00:17.198501	2025-11-11 19:00:17.198501
ce7a82b2-fb9e-479f-8aad-d736cb5a2297	MIBA SINTER BRASIL LTDA	9010425	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010425	2025-11-11 19:00:17.226	2025-11-11 19:00:17.258636	2025-11-11 19:00:17.258636
67e4b587-295c-4aa8-b54a-9a932f53f134	ALBANO E FARIAS PRESTADORA DE SERVICOS L	9010426	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010426	2025-11-11 19:00:17.287	2025-11-11 19:00:17.320216	2025-11-11 19:00:17.320216
fec09b58-b8c9-498e-b1e3-fc19d50f07cd	BOSAL DO BRASIL LTDA.	9010427	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010427	2025-11-11 19:00:17.348	2025-11-11 19:00:17.380387	2025-11-11 19:00:17.380387
4b625912-d680-4faa-9dda-dc02ca875cc1	C.C.S. TECNOLOGIA E SERVICOS S.A.	9010428	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010428	2025-11-11 19:00:17.408	2025-11-11 19:00:17.440539	2025-11-11 19:00:17.440539
d528de5a-863c-43b3-b2b2-40b5af2ba8c5	ARTMETAL INDUSTRIA E COMERCIO LTDA	9010429	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010429	2025-11-11 19:00:17.469	2025-11-11 19:00:17.500712	2025-11-11 19:00:17.500712
6d125f98-e3b4-423f-9e90-3f770b7c8f71	REQUIPH INDUSTRIA E COMERCIO DE EQUIP HI	9010430	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010430	2025-11-11 19:00:17.529	2025-11-11 19:00:17.561308	2025-11-11 19:00:17.561308
1c888bf3-cade-4038-9fe9-60e5096f2300	ELECTRO ACO ALTONA S A	9010431	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010431	2025-11-11 19:00:17.589	2025-11-11 19:00:17.621586	2025-11-11 19:00:17.621586
33f213d1-fe25-43bb-be77-4a3b9ffa50f0	WETZEL S/A EM RECUPERACAO JUDICIAL	9010432	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010432	2025-11-11 19:00:17.65	2025-11-11 19:00:17.68229	2025-11-11 19:00:17.68229
cfcd64fc-00e5-4291-8d9b-ff75e23c2984	GGB BRASIL INDUSTRIA DE MANCAIS E COMPON	9010433	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010433	2025-11-11 19:00:17.711	2025-11-11 19:00:17.742945	2025-11-11 19:00:17.742945
62cb150c-f71e-44cb-a199-443a97657bb8	FAURECIA AUTOMOTIVE DO BRASIL LTDA	9010434	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010434	2025-11-11 19:00:17.771	2025-11-11 19:00:17.80286	2025-11-11 19:00:17.80286
5faa2dbe-64f7-4fca-ad2a-49069a7a6998	INCOM - INDUSTRIAL EIRELI	9010435	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010435	2025-11-11 19:00:17.831	2025-11-11 19:00:17.863478	2025-11-11 19:00:17.863478
442533e9-6da5-451c-97aa-86e2626ff53b	ITP SYSTEMS CONECTORES ELETRICO E ELETRO	9010436	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010436	2025-11-11 19:00:17.891	2025-11-11 19:00:17.923623	2025-11-11 19:00:17.923623
2c606e04-ce80-4b1a-863b-a6ec84beecbe	ITP SYSTEMS CONECTORES ELETRICO E ELETRO	9010437	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010437	2025-11-11 19:00:17.952	2025-11-11 19:00:17.984603	2025-11-11 19:00:17.984603
772d2d49-8f12-4b6a-844c-036e050aa472	REFLEXALLEN DO BRASIL AUTOMOTIVA LTDA.	9010438	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010438	2025-11-11 19:00:18.013	2025-11-11 19:00:18.044841	2025-11-11 19:00:18.044841
ed69c519-2bf2-4df2-8524-f442d452c549	PLASCAR INDUSTRIA DE COMPONENTES PLASTIC	9010439	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010439	2025-11-11 19:00:18.073	2025-11-11 19:00:18.113351	2025-11-11 19:00:18.113351
648b5782-7dc8-4937-90ff-af892201ce94	GENERAL MOTORS DO BRASIL LTDA	9010440	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010440	2025-11-11 19:00:18.141	2025-11-11 19:00:18.173481	2025-11-11 19:00:18.173481
513239f8-797c-4170-afec-34859578a14f	RIVETS INDUSTRIA E COMERCIO LTDA	9010441	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010441	2025-11-11 19:00:18.201	2025-11-11 19:00:18.233489	2025-11-11 19:00:18.233489
bd188d8a-9573-440b-93db-00ac33a95f72	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010442	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010442	2025-11-11 19:00:18.262	2025-11-11 19:00:18.293952	2025-11-11 19:00:18.293952
b7d3d48e-f9d0-4c9c-8306-17e6ca5390c0	KAUTEX TEXTRON DO BRASIL LTDA	9010443	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010443	2025-11-11 19:00:18.322	2025-11-11 19:00:18.354292	2025-11-11 19:00:18.354292
3d89d197-dc68-473b-bde4-ed919451cc7f	ENSINGER INDUSTRIA DE PLASTICOS TECNICOS	9010444	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010444	2025-11-11 19:00:18.382	2025-11-11 19:00:18.414839	2025-11-11 19:00:18.414839
66681e6a-a715-41f6-9caa-79366bc3b8d2	MARELLI COFAP DO BRASIL LTDA.	9010445	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010445	2025-11-11 19:00:18.443	2025-11-11 19:00:18.475208	2025-11-11 19:00:18.475208
c9ec011c-3fcd-4e1e-87f5-24e94ae26306	MARELLI COFAP DO BRASIL LTDA.	9010446	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010446	2025-11-11 19:00:18.503	2025-11-11 19:00:18.535426	2025-11-11 19:00:18.535426
1ae0f78a-8926-457b-a3e6-48ef6b1c9bdc	MHB MANGUEIRAS E CONEXOES LTDA	9010447	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010447	2025-11-11 19:00:18.564	2025-11-11 19:00:18.596042	2025-11-11 19:00:18.596042
37aea340-e1c1-4fae-aa63-f7f26a3f274e	LINKPLAS INDUSTRIA DE PLASTICOS LTDA	9010448	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010448	2025-11-11 19:00:18.624	2025-11-11 19:00:18.658106	2025-11-11 19:00:18.658106
9eacd5a0-e134-4aaf-8614-ea1c4da835f8	HANON SYSTEMS CLIMATIZACAO DO BRASIL IND	9010449	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010449	2025-11-11 19:00:18.686	2025-11-11 19:00:18.718409	2025-11-11 19:00:18.718409
30817265-2833-4d16-ba06-b9659e02fd62	SMRC FABRICACAO E COMERCIO DE PRODUTOS A	9010450	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010450	2025-11-11 19:00:18.747	2025-11-11 19:00:18.779095	2025-11-11 19:00:18.779095
8bb04c7e-5c43-452b-9270-a0023cf3421c	PICHININ INDUSTRIA E COMERCIO LTDA	9010451	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010451	2025-11-11 19:00:18.807	2025-11-11 19:00:18.8381	2025-11-11 19:00:18.8381
0fbb2da5-b311-421f-8674-639dd16d038a	METALURGICA WELOZE LTDA	9010452	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010452	2025-11-11 19:00:18.866	2025-11-11 19:00:18.897135	2025-11-11 19:00:18.897135
db6ddaf0-addd-496f-be61-220525d44fb4	LOG PRINT GRAFICA DADOS VARIAVEIS E L	9010453	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010453	2025-11-11 19:00:18.925	2025-11-11 19:00:18.95733	2025-11-11 19:00:18.95733
370042f0-ea86-44a2-98c1-13423cabccbf	TENNECO INDUSTRIA DE AUTOPECAS LTDA	9010454	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010454	2025-11-11 19:00:18.985	2025-11-11 19:00:19.017858	2025-11-11 19:00:19.017858
5c8f0c1a-29a4-4573-96ab-ff8d3dcd24e5	K.F. INDUSTRIA E COMERCIO DE PECAS EIREL	9010455	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010455	2025-11-11 19:00:19.051	2025-11-11 19:00:19.08379	2025-11-11 19:00:19.08379
72c68522-3595-4407-b0f4-b3dad3519a7d	CALDERMEC INDUSTRIA MECANICA EIRELI	9010456	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010456	2025-11-11 19:00:19.112	2025-11-11 19:00:19.143786	2025-11-11 19:00:19.143786
0577c2ae-b912-481a-bbbe-684b2d852027	OPUS CONSULTORIA LTDA	9010457	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010457	2025-11-11 19:00:19.172	2025-11-11 19:00:19.203711	2025-11-11 19:00:19.203711
1f118bc7-8721-485b-9d87-aef0205a2813	MULTIMATECH INDUSTRIA METALURGICA EIRELI	9010458	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010458	2025-11-11 19:00:19.232	2025-11-11 19:00:19.263609	2025-11-11 19:00:19.263609
40dcef87-cd77-44c7-abfb-fe3cee9cb8fb	DONALDSON DO BRASIL EQUIPAMENTOS INDUSTR	9010459	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010459	2025-11-11 19:00:19.292	2025-11-11 19:00:19.323745	2025-11-11 19:00:19.323745
d6e0ecb3-4d54-4329-9629-f0d60fd0eac5	TECUMSEH DO BRASIL LTDA	9010460	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010460	2025-11-11 19:00:19.352	2025-11-11 19:00:19.383922	2025-11-11 19:00:19.383922
6dbcf4a6-331d-453d-8060-c02b10aef797	TOWER AUTOMOTIVE DO BRASIL LTDA.	9010461	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010461	2025-11-11 19:00:19.412	2025-11-11 19:00:19.44418	2025-11-11 19:00:19.44418
b8e33d0d-bca3-45e5-a4ad-1d9920f909c4	JL CAPACITORES LTDA	9010462	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010462	2025-11-11 19:00:19.472	2025-11-11 19:00:19.504415	2025-11-11 19:00:19.504415
42b98ee4-8238-4f8a-93f6-514f7f608499	META GALVANIZACAO COMERCIO E INDUSTRIA E	9010463	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010463	2025-11-11 19:00:19.532	2025-11-11 19:00:19.570043	2025-11-11 19:00:19.570043
d01b7ca3-78cb-4707-8b4e-3799dc0d2bfd	VALEO SISTEMAS AUTOMOTIVOS LTDA.	9010464	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010464	2025-11-11 19:00:19.598	2025-11-11 19:00:19.630147	2025-11-11 19:00:19.630147
7f4fad1a-14e6-43ae-b038-41fd7e7ae57d	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010465	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010465	2025-11-11 19:00:19.658	2025-11-11 19:00:19.690732	2025-11-11 19:00:19.690732
5c4b160b-8f9c-443c-a1f3-b213ffa10f27	COMP - INDUSTRIA E COMERCIO DE METAIS LT	9010466	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010466	2025-11-11 19:00:19.719	2025-11-11 19:00:19.750264	2025-11-11 19:00:19.750264
00c11ab6-05f0-4f63-b426-148dec09c36e	HOBER BAHIA INDUSTRIA PLASTICA LTDA	9010467	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010467	2025-11-11 19:00:19.778	2025-11-11 19:00:19.810663	2025-11-11 19:00:19.810663
8f8df279-50fe-4060-b239-d124fbd8432f	TECUMSEH DO BRASIL LTDA	9010468	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010468	2025-11-11 19:00:19.838	2025-11-11 19:00:19.870663	2025-11-11 19:00:19.870663
2ae00797-89f1-4012-a15b-00273dd1ff55	COPO INDUSTRIA DE POLIURETANO DO BRASIL	9010469	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010469	2025-11-11 19:00:19.899	2025-11-11 19:00:19.930773	2025-11-11 19:00:19.930773
8e5b7a7c-dde4-4baa-a9a2-37832676d370	METALURGICA GOLIN SA	9010470	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010470	2025-11-11 19:00:19.959	2025-11-11 19:00:19.99071	2025-11-11 19:00:19.99071
10ebbd65-ae01-4aca-8de2-3ee10c0b1a9d	TESCA TEXTIL COMPONENTES PARA ASSENTOS	9010471	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010471	2025-11-11 19:00:20.019	2025-11-11 19:00:20.050826	2025-11-11 19:00:20.050826
a3ab2f53-ce7f-40ff-8887-b6eae96c2581	REFAL INDUSTRIA E COMERCIO DE REBITES E	9010472	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010472	2025-11-11 19:00:20.079	2025-11-11 19:00:20.112379	2025-11-11 19:00:20.112379
d9be9228-92c2-482b-99a2-6047b2ebe099	PLANO INDUSTRIA E COMERCIO DE PLASTICOS	9010473	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010473	2025-11-11 19:00:20.14	2025-11-11 19:00:20.172787	2025-11-11 19:00:20.172787
8e712e38-54b7-4b82-98b1-b5557b29f680	CEZAN EMBALAGENS LTDA	9010474	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010474	2025-11-11 19:00:20.201	2025-11-11 19:00:20.232755	2025-11-11 19:00:20.232755
5e5060c9-88d8-4afa-b9bf-9b25e95d3a28	MAFLOW DO BRASIL LTDA.	9010475	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010475	2025-11-11 19:00:20.261	2025-11-11 19:00:20.292789	2025-11-11 19:00:20.292789
d15cd235-3d34-4e2a-b8d6-51e2b2dcc56e	ARGENTAUREOS DOURACAO E PRATEACAO LTDA	9010476	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010476	2025-11-11 19:00:20.321	2025-11-11 19:00:20.352683	2025-11-11 19:00:20.352683
b06e2f74-6502-4096-ac93-2ceb46d81544	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9010477	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010477	2025-11-11 19:00:20.381	2025-11-11 19:00:20.413022	2025-11-11 19:00:20.413022
187e9ae3-2a65-44e9-b38f-823273aea51e	FUNDICAO SIDERAL LTDA	9010478	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010478	2025-11-11 19:00:20.441	2025-11-11 19:00:20.473445	2025-11-11 19:00:20.473445
68eb4551-7776-45e1-9a98-a76ec9761aae	LEAS INDUSTRIAL LTDA	9010479	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010479	2025-11-11 19:00:20.513	2025-11-11 19:00:20.548361	2025-11-11 19:00:20.548361
223b10d9-3202-42de-bb92-375554d82d65	METAL ONE SHIBAURA BRASIL LTDA.	9010480	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010480	2025-11-11 19:00:20.58	2025-11-11 19:00:20.611884	2025-11-11 19:00:20.611884
6a9e9140-af0c-447d-901f-05f0e8457fdf	PAINCO INDUSTRIA E COMERCIO SOCIEDADE AN	9010481	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010481	2025-11-11 19:00:20.64	2025-11-11 19:00:20.673132	2025-11-11 19:00:20.673132
d434e5e6-89c7-41ff-a8d6-970d2cfe0c66	NIPRA TRATAMENTOS DE SUPERFICIE LTDA.	9010482	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010482	2025-11-11 19:00:20.701	2025-11-11 19:00:20.733354	2025-11-11 19:00:20.733354
4a56341a-d613-4cc9-98a6-96180d7b752c	TECPARTS DO BRASIL INDUSTRIA E COMERCIO	9010483	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010483	2025-11-11 19:00:20.761	2025-11-11 19:00:20.793678	2025-11-11 19:00:20.793678
2d6b7ac3-2669-4aad-a495-99bfaf08d1af	BELLS INDUSTRIA E COMERCIO DE PLASTICOS	9010484	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010484	2025-11-11 19:00:20.821	2025-11-11 19:00:20.853797	2025-11-11 19:00:20.853797
2119f684-3de6-4820-901a-ed32050ef44e	WIPRO DO BRASIL INDUSTRIAL S.A.	9010485	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010485	2025-11-11 19:00:20.882	2025-11-11 19:00:20.91552	2025-11-11 19:00:20.91552
219ea69d-9538-43b5-9520-9766a68effae	FANIA COMERCIO E INDUSTRIA DE PECAS LTDA	9010486	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010486	2025-11-11 19:00:20.944	2025-11-11 19:00:20.976032	2025-11-11 19:00:20.976032
f6fff348-718f-4b94-a5f3-4b2573f99a83	CARHEJ INDUSTRIA E COMERCIO DE PRODUTOS	9010487	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010487	2025-11-11 19:00:21.004	2025-11-11 19:00:21.03592	2025-11-11 19:00:21.03592
275fcbaf-d172-43cf-b89d-22b3680b298e	BLUFIX INDÃšSTRIA E COMÃ‰RCIO LTDA	9010488	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010488	2025-11-11 19:00:21.064	2025-11-11 19:00:21.096038	2025-11-11 19:00:21.096038
6f97f464-56dd-45bd-8051-3afc3b2da0df	HENNINGS VEDACOES HIDRAULICAS LTDA	9010489	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010489	2025-11-11 19:00:21.124	2025-11-11 19:00:21.156934	2025-11-11 19:00:21.156934
7fcec372-8488-4cbd-985c-e06006511a58	VOLVO DO BRASIL VEICULOS LTDA	9010490	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010490	2025-11-11 19:00:21.186	2025-11-11 19:00:21.218651	2025-11-11 19:00:21.218651
c1577574-f3b4-408d-8e27-781f331d6fd6	BUDAI INDUSTRIA METALURGICA LTDA	9010491	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010491	2025-11-11 19:00:21.247	2025-11-11 19:00:21.278758	2025-11-11 19:00:21.278758
76eab440-9f69-41f7-a4b4-59d46edcd9b4	APTIV MANUFATURA E SERVICOS DE DISTRIBUI	9010492	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010492	2025-11-11 19:00:21.307	2025-11-11 19:00:21.338782	2025-11-11 19:00:21.338782
98cee5fa-655d-488e-a713-2e7970ebc27a	LINKPLAS INDUSTRIA DE PLASTICOS LTDA	9010493	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010493	2025-11-11 19:00:21.367	2025-11-11 19:00:21.399079	2025-11-11 19:00:21.399079
eaa86846-a4b0-4fcb-920a-58998d090fc7	SOLUCOES EM ACO USIMINAS S.A.	9010494	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010494	2025-11-11 19:00:21.427	2025-11-11 19:00:21.458874	2025-11-11 19:00:21.458874
5212b371-1e70-466d-9b06-9cdcc655ebde	INDUSTRIA METALURGICA LIPOS LTDA	9010495	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010495	2025-11-11 19:00:21.488	2025-11-11 19:00:21.520668	2025-11-11 19:00:21.520668
4a350720-11ae-4d96-90ef-6c78ae00d8ee	VEXILOM EMBLEMAS TECNICOS COMERCIAIS LTD	9010496	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010496	2025-11-11 19:00:21.549	2025-11-11 19:00:21.580719	2025-11-11 19:00:21.580719
8ec4d8ef-752d-4145-bc84-281efa214cdf	J A STEFANINI EIRELI	9010497	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010497	2025-11-11 19:00:21.609	2025-11-11 19:00:21.64191	2025-11-11 19:00:21.64191
04cf79c1-7113-4e4b-99bc-33bc5984ca45	STAMPLINE METAIS ESTAMPADOS LTDA	9010498	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010498	2025-11-11 19:00:21.671	2025-11-11 19:00:21.703247	2025-11-11 19:00:21.703247
2258d1f8-c3fc-4302-a686-d013019796eb	BCS SOLUCOES EM INTERF AUTOM BRASIL LTDA	9010499	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010499	2025-11-11 19:00:21.731	2025-11-11 19:00:21.76349	2025-11-11 19:00:21.76349
86ace12a-c1d1-4067-bfca-c02acb89c64d	SOLUZ INDUSTRIA E COMERCIO LTDA	9010500	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010500	2025-11-11 19:00:21.791	2025-11-11 19:00:21.823728	2025-11-11 19:00:21.823728
1aa1deab-a7d3-4faf-b84d-14f9595274ef	FERROLENE SA INDUSTRIA E COMERCIO DE MET	9010501	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010501	2025-11-11 19:00:21.852	2025-11-11 19:00:21.883946	2025-11-11 19:00:21.883946
799f26af-0b3c-48ca-9236-649f7142efaf	DENSO DO BRASIL LTDA	9010502	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010502	2025-11-11 19:00:21.913	2025-11-11 19:00:21.944836	2025-11-11 19:00:21.944836
3e341e47-821b-4e6e-8e99-368d4148b5e8	NYLOK TECNOLOGIA EM FIXACAO LTDA	9010503	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010503	2025-11-11 19:00:21.973	2025-11-11 19:00:22.00504	2025-11-11 19:00:22.00504
adb19f58-d5cc-4651-bfb0-d09b32e6be1c	CHRIS CINTOS DE SEGURANÃ‡A LTDA	9010504	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010504	2025-11-11 19:00:22.033	2025-11-11 19:00:22.064072	2025-11-11 19:00:22.064072
f64a63b4-a3d0-4e02-9ea4-3f2ebce0734b	LINKPLAS IND E COM DE PALSTICOS LTDA	9010505	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010505	2025-11-11 19:00:22.092	2025-11-11 19:00:22.124073	2025-11-11 19:00:22.124073
f3851811-9e33-4941-8c9f-b883bce5ebd8	PICHININ INDUSTRIA E COMERCIO LTDA	9010506	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010506	2025-11-11 19:00:22.152	2025-11-11 19:00:22.183929	2025-11-11 19:00:22.183929
d567895a-2a16-485a-aa44-014dd5f380c2	PARKER HANNIFIN IND E COM LTDA	9010507	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010507	2025-11-11 19:00:22.212	2025-11-11 19:00:22.244555	2025-11-11 19:00:22.244555
d5860635-ee1b-49e1-ba85-5701f99ad7f0	INDUSTRIA MECANICA PRIMAR LTDA	9010508	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010508	2025-11-11 19:00:22.272	2025-11-11 19:00:22.304605	2025-11-11 19:00:22.304605
59dca056-4624-49b4-b7e9-37ed2dc0eb5f	AMVIAN INDUSTRIA E COMERCIO DE PECAS AUT	9010509	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010509	2025-11-11 19:00:22.333	2025-11-11 19:00:22.364731	2025-11-11 19:00:22.364731
3266aa27-a3c8-4dbe-9245-5d9889384a93	THYSSENKRUPP DO BRASIL LTDA	9010510	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010510	2025-11-11 19:00:22.393	2025-11-11 19:00:22.424069	2025-11-11 19:00:22.424069
66f0a199-b01a-4b0e-bc16-163ff9e001d1	DAYCO POWER TRANSMISSION LTDA	9010511	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010511	2025-11-11 19:00:22.452	2025-11-11 19:00:22.48395	2025-11-11 19:00:22.48395
40921a1e-463f-475c-bc2d-1a0ee16ce8bc	CINPAL COMPANHIA IND PECAS AUTOMOVEIS	9010512	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010512	2025-11-11 19:00:22.512	2025-11-11 19:00:22.54399	2025-11-11 19:00:22.54399
8a9c2a40-596f-4308-824b-e93f29c3d057	TECNAUT INDUSTRIA E COMERCIO METAIS LTDA	9010513	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010513	2025-11-11 19:00:22.572	2025-11-11 19:00:22.603808	2025-11-11 19:00:22.603808
625e41c0-0356-481e-a981-4c7415b68314	MOVENT AUTOMOTIVE IND E COM AUTOPECAS LT	9010514	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010514	2025-11-11 19:00:22.632	2025-11-11 19:00:22.664177	2025-11-11 19:00:22.664177
48415e20-5138-480d-a011-ddfaa7977846	BIMARA IND E COM DE PRODUTOS PLASTICOS L	9010515	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010515	2025-11-11 19:00:22.692	2025-11-11 19:00:22.725168	2025-11-11 19:00:22.725168
a98d35f6-c9c2-430a-a3ea-78bc4d5a8490	JTEKT AUTOMOTIVA BRASIL LTDA	9010516	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010516	2025-11-11 19:00:22.753	2025-11-11 19:00:22.785315	2025-11-11 19:00:22.785315
aea6ade5-c258-44ec-90fa-94f58bc911a1	INFERTEQ IND COMERCIO DE ETIQUETAS LTDA	9010517	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9010517	2025-11-11 19:00:22.813	2025-11-11 19:00:22.844158	2025-11-11 19:00:22.844158
1d547249-f72b-424d-bac8-c6aaa4976724	TELOS CONSULTORIA EMPRESARIAL LTDA	9060001	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060001	2025-11-11 19:00:22.872	2025-11-11 19:00:22.905481	2025-11-11 19:00:22.905481
ba3f5a7d-cb45-4a46-b3c8-4b11b1a6bcf4	VIBRAC SYSTEM S/A	9060002	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060002	2025-11-11 19:00:22.934	2025-11-11 19:00:22.965824	2025-11-11 19:00:22.965824
dbb7282d-a124-4c8d-ab60-754732d9be6f	EDSCHA DO BRASIL LTDA	9060003	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060003	2025-11-11 19:00:22.994	2025-11-11 19:00:23.02591	2025-11-11 19:00:23.02591
3081ce9b-eb8d-4f7b-92f1-663b67d4f0fe	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060004	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060004	2025-11-11 19:00:23.054	2025-11-11 19:00:23.086305	2025-11-11 19:00:23.086305
4f06792a-6c00-4c49-b8ea-c55919eb58b7	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060005	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060005	2025-11-11 19:00:23.114	2025-11-11 19:00:23.14636	2025-11-11 19:00:23.14636
8f682e77-b579-4d8a-a5cd-1b3d99a17105	AKER SOLUTIONS DO BRASIL LTDA	9060006	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060006	2025-11-11 19:00:23.175	2025-11-11 19:00:23.206625	2025-11-11 19:00:23.206625
fbf390cc-b03c-408c-9db9-ef05884672d1	FIBRA COMERCIO E DISTRIBUICAO LTDA	9060008	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060008	2025-11-11 19:00:23.235	2025-11-11 19:00:23.267627	2025-11-11 19:00:23.267627
108abe31-735e-4885-a204-31ed04fb57f6	EMBRART IND DE EMBALAGEM E ARTEFATOS DE	9060009	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060009	2025-11-11 19:00:23.296	2025-11-11 19:00:23.327615	2025-11-11 19:00:23.327615
79bd4207-6e93-4bc3-9383-3d9e1118495f	EMBRART IND DE EMBALAGEM E ARTEFATOS DE	9060010	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060010	2025-11-11 19:00:23.355	2025-11-11 19:00:23.387599	2025-11-11 19:00:23.387599
7d66c870-1f34-47bf-85df-83dba93226ca	AKER SOLUTIONS DO BRASIL LTDA	9060011	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060011	2025-11-11 19:00:23.415	2025-11-11 19:00:23.447472	2025-11-11 19:00:23.447472
601d3efb-77d4-4668-9d01-979ee2f645d6	BELFIX IMPORTACAO LTDA	9060012	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060012	2025-11-11 19:00:23.476	2025-11-11 19:00:23.507735	2025-11-11 19:00:23.507735
4d59d3ed-309e-4974-aa1e-967d2c9f9c93	PELZER DA BAHIA LTDA	9060013	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060013	2025-11-11 19:00:23.536	2025-11-11 19:00:23.56803	2025-11-11 19:00:23.56803
79cf8ce0-6b94-4b36-8aa3-854a7b6055a9	BIMARA INDUSTRIA E COMERCIO DE PRODUTOS	9060014	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060014	2025-11-11 19:00:23.596	2025-11-11 19:00:23.62829	2025-11-11 19:00:23.62829
f89b15f9-bbe9-4172-a400-c18509a53af8	LEYSIN MARKETING EIRELI	9060015	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060015	2025-11-11 19:00:23.709	2025-11-11 19:00:23.741221	2025-11-11 19:00:23.741221
49501a11-a5e9-47c8-be9e-4844b67c4672	COLORFIX ITAMASTER INDUSTRIA DE MASTERBA	9060016	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060016	2025-11-11 19:00:23.769	2025-11-11 19:00:23.801498	2025-11-11 19:00:23.801498
eb615e87-e3e4-4627-8d83-b8adf49373ed	TECNOPLAST S.A - INDUSTRIA E COMERCIO DE	9060017	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060017	2025-11-11 19:00:23.829	2025-11-11 19:00:23.863061	2025-11-11 19:00:23.863061
206a36b4-bf04-4908-8d2e-0819812d9b1e	LEYSIN MARKETING EIRELI	9060018	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060018	2025-11-11 19:00:23.891	2025-11-11 19:00:23.923821	2025-11-11 19:00:23.923821
8b30759e-81dd-45f4-b71c-5d1b73f958d2	BIMARA INDUSTRIA E COMERCIO DE PRODUTOS	9060019	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060019	2025-11-11 19:00:23.952	2025-11-11 19:00:23.983977	2025-11-11 19:00:23.983977
2baa8c1b-93ad-473a-9880-2fcefeb9118f	LECLAIR IND E COM PERF E COSM  LTDA	9060020	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060020	2025-11-11 19:00:24.012	2025-11-11 19:00:24.044029	2025-11-11 19:00:24.044029
c862f290-0656-4f6e-9af6-5bb6312484d9	COOPERATIVA CENTRAL AURORA ALIMENTOS	9060021	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060021	2025-11-11 19:00:24.072	2025-11-11 19:00:24.104414	2025-11-11 19:00:24.104414
deee4dc6-2486-4ed2-93b6-0f49db5cdac8	NELSON DO BRASIL P T E TUB DE EXAUS LTDA	9060022	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060022	2025-11-11 19:00:24.133	2025-11-11 19:00:24.164787	2025-11-11 19:00:24.164787
59c42895-9500-4879-bdbb-5cf5d6a6a6de	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9060023	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060023	2025-11-11 19:00:24.193	2025-11-11 19:00:24.224865	2025-11-11 19:00:24.224865
caa65d39-64be-4f0e-9035-c2ac3ef7ca2f	EMBALOG FABRICACAO EMBALAGENS LTDA	9060024	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9060024	2025-11-11 19:00:24.253	2025-11-11 19:00:24.285677	2025-11-11 19:00:24.285677
bd4cfe2d-c308-4d45-adac-e36ab4c6c5c2	SEVEN TERCEIRIZACAO DE MAO DE OBRA LTDA	9070001	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9070001	2025-11-11 19:00:24.314	2025-11-11 19:00:24.346022	2025-11-11 19:00:24.346022
9ea2a9aa-39f5-478f-8fc8-7055cc8eb063	COSMA DO BRASIL PRODUTOS E SERVICOS AUTO	9070002	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9070002	2025-11-11 19:00:24.374	2025-11-11 19:00:24.406089	2025-11-11 19:00:24.406089
241687c0-fa3b-4d72-bb22-0f43b1d64635	COSMA DO BRASIL PROD E SERV AUTOMOTIVOS	9070003	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9070003	2025-11-11 19:00:24.434	2025-11-11 19:00:24.465983	2025-11-11 19:00:24.465983
b4668de3-a819-4357-bacd-628a5eb42af9	DAX OIL REFINO SA	9070004	d06878be-ae25-4860-ba2f-88639dd96bf8	\N	\N	t	9070004	2025-11-11 19:00:24.494	2025-11-11 19:00:24.526977	2025-11-11 19:00:24.526977
ae97d89e-f40e-4a0c-bb86-65637f0f4742	FAURECIA LIMEIRA FACILITIES	01	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	01	2025-11-11 19:00:24.555	2025-11-11 19:00:24.586787	2025-11-11 19:00:24.586787
732b7634-1e89-4456-b9fc-02d47d107b0c	MERCEDES BENZ DO BRASIL	02	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	02	2025-11-11 19:00:24.615	2025-11-11 19:00:24.64699	2025-11-11 19:00:24.64699
1b60c03b-2d00-47ac-aac9-304c257080ee	FAURECIA SOROCABA	03	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	03	2025-11-11 19:00:24.675	2025-11-11 19:00:24.70743	2025-11-11 19:00:24.70743
0a1adfb4-f0d9-4c68-9771-f30e4a06ee7b	STELLANTIS MG ENGENHARIA	04	96a2f2df-78f5-4b59-92f3-ac04396b09ab	6a52b2fc-1ec7-41e6-a156-91cbfd9e69de	\N	t	04	2025-11-11 19:00:24.735	2025-11-11 19:00:24.76772	2025-11-11 19:00:24.76772
57c3c9ea-07be-4699-9836-2d4e0f2dc602	LOCALIZA MINAS GERAIS	05	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	05	2025-11-11 19:00:24.796	2025-11-11 19:00:24.827899	2025-11-11 19:00:24.827899
634fee80-1d44-4182-a86c-054039329a1d	 	1	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	1	2025-11-11 19:00:24.856	2025-11-11 19:00:24.887825	2025-11-11 19:00:24.887825
f62b5fcc-03a4-4455-beb4-6443717b1361	ADMINISTRATIVO OPUS SERVICOS	100	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	100	2025-11-11 19:00:24.916	2025-11-11 19:00:24.948256	2025-11-11 19:00:24.948256
df32276d-86d1-4447-aa2c-33a068c07f6c	 	2	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	2	2025-11-11 19:00:24.977	2025-11-11 19:00:25.009167	2025-11-11 19:00:25.009167
6b702b42-e0e8-4eb8-9ff3-a037796eb263	DEPARTAMENTO PESSOAL - MATRIZ	200001	96a2f2df-78f5-4b59-92f3-ac04396b09ab	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200001	2025-11-11 19:00:25.037	2025-11-11 19:00:25.069077	2025-11-11 19:00:25.069077
3d879b72-9c84-43b5-a0f9-ed50bc2338dd	RECURSOS HUMANOS - MATRIZ	200002	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	200002	2025-11-11 19:00:25.098	2025-11-11 19:00:25.129234	2025-11-11 19:00:25.129234
12daa6a8-3c8e-4d08-a6bc-1d8c5ed45a62	JURIDICO - MATRIZ	200008	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	200008	2025-11-11 19:00:25.159	2025-11-11 19:00:25.191332	2025-11-11 19:00:25.191332
3fa6672a-8a87-4a49-ad2b-553ba94b3db9	 	4	96a2f2df-78f5-4b59-92f3-ac04396b09ab	a950d03a-cfca-41d2-a376-59d5ac32f021	\N	t	4	2025-11-11 19:00:25.219	2025-11-11 19:00:25.251525	2025-11-11 19:00:25.251525
eb049907-8a80-42ab-84ce-a75dfda1e842	ADIENT	40002	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	40002	2025-11-11 19:00:25.28	2025-11-11 19:00:25.31186	2025-11-11 19:00:25.31186
12e89104-6d9d-4d29-8e91-0e841cec9765	NESTLE - SANTANDER SP	410219	96a2f2df-78f5-4b59-92f3-ac04396b09ab	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	410219	2025-11-11 19:00:25.34	2025-11-11 19:00:25.371881	2025-11-11 19:00:25.371881
371ba595-866e-421b-aa19-96bc0babb341	M.EXPOENTE LIMPEZA	420194	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	420194	2025-11-11 19:00:25.402	2025-11-11 19:00:25.434015	2025-11-11 19:00:25.434015
5694953d-72d7-4471-92ca-8ff9109f61de	TECNOFIBRA LIMPEZA - SC	430201	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	430201	2025-11-11 19:00:25.462	2025-11-11 19:00:25.494098	2025-11-11 19:00:25.494098
63f4c8eb-23f0-4876-b425-75a18bf15ee3	OPUS - RJ - STELLANTIS PORTO REAL	470189	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	470189	2025-11-11 19:00:25.522	2025-11-11 19:00:25.554115	2025-11-11 19:00:25.554115
96d70d0e-1b94-4b60-9640-a4cd9fe405dd	COOPER VARGINHA LUBRIFICAÇÃO	480197	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	480197	2025-11-11 19:00:25.582	2025-11-11 19:00:25.614017	2025-11-11 19:00:25.614017
796fc06e-cab9-482a-8451-e62194ba63e3	COOPER VARGINHA MANNUTENCAO ELETRICA	480198	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	480198	2025-11-11 19:00:25.642	2025-11-11 19:00:25.673205	2025-11-11 19:00:25.673205
b7b9e0aa-e05d-4346-b787-7f3f6304cfc6	LOCALIZA	5	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	5	2025-11-11 19:00:25.701	2025-11-11 19:00:25.733078	2025-11-11 19:00:25.733078
16a7bb73-b736-493b-9484-0372d1e63334	ADMINISTRATIVO FACILITIES	800001	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	800001	2025-11-11 19:00:25.761	2025-11-11 19:00:25.79335	2025-11-11 19:00:25.79335
dcf35592-f0fe-4e7b-a5d2-678290adb0c6	RH REGIONAL FACILITIES 	800002	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	800002	2025-11-11 19:00:25.821	2025-11-11 19:00:25.853633	2025-11-11 19:00:25.853633
aec05c38-a8b6-4298-a6be-c544b6cee86d	FAURECIA LIMEIRA LIMPEZA CAIXAS	810002	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	810002	2025-11-11 19:00:25.882	2025-11-11 19:00:25.914485	2025-11-11 19:00:25.914485
fd11550d-0ccf-422a-b4c5-7d9a16f1d410	ADMINISTRATIVO FILIAL MG	820001	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	820001	2025-11-11 19:00:25.942	2025-11-11 19:00:25.974434	2025-11-11 19:00:25.974434
f3da5c82-2180-4f4a-ae12-7124f8ee1966	STELLANTIS XP	820003	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	820003	2025-11-11 19:00:26.002	2025-11-11 19:00:26.034536	2025-11-11 19:00:26.034536
6db04edc-8be5-41bc-bc72-e582de41c4c0	MERCEDES ENGENHARIA SP	820009	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	820009	2025-11-11 19:00:26.063	2025-11-11 19:00:26.095342	2025-11-11 19:00:26.095342
fe7a642a-0e49-4af6-94d2-f50ba38efd60	TEKSID BETIM QUALIDADE	820011	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	820011	2025-11-11 19:00:26.123	2025-11-11 19:00:26.155574	2025-11-11 19:00:26.155574
d00cd80e-ef1f-48ef-8922-eb6c839492db	VALLOUREC JECEABA - LIMPEZA	820012	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	820012	2025-11-11 19:00:26.183	2025-11-11 19:00:26.215631	2025-11-11 19:00:26.215631
c0287a10-836f-486c-8c80-df9deed5b73c	VALLOUREC BRUMADINHO - LIMPEZA	820013	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	820013	2025-11-11 19:00:26.244	2025-11-11 19:00:26.275766	2025-11-11 19:00:26.275766
0482ca74-d4e4-4abb-8afd-6b98307da706	VALLOUREC BARREIRO - LIMPEZA	820014	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	820014	2025-11-11 19:00:26.304	2025-11-11 19:00:26.336039	2025-11-11 19:00:26.336039
06e43650-3ce9-47bc-b0ae-c32e0db66898	VALLOUREC FAZENDA - LIMPEZA	820015	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	820015	2025-11-11 19:00:26.364	2025-11-11 19:00:26.396249	2025-11-11 19:00:26.396249
273586eb-4817-4b2a-bd15-f3fbe9c206d9	ARDAGH JUIZ DE FORA - CAPINA	820016	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	820016	2025-11-11 19:00:26.424	2025-11-11 19:00:26.456606	2025-11-11 19:00:26.456606
08114cd9-cc34-4e0d-9e72-95b3fe5a0e79	ARDAGH JUIZ DE FORA - LIMPEZA	820017	96a2f2df-78f5-4b59-92f3-ac04396b09ab	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	820017	2025-11-11 19:00:26.485	2025-11-11 19:00:26.51678	2025-11-11 19:00:26.51678
9c9e9073-781c-4583-af6a-f3e3403dd655	LOCALIZA ADMINISTRATIVO	83000	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	83000	2025-11-11 19:00:26.545	2025-11-11 19:00:26.57691	2025-11-11 19:00:26.57691
259be7ed-457a-43b7-ac5e-0feed2c10382	LOCALIZA MINAS GERAIS	830001	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830001	2025-11-11 19:00:26.605	2025-11-11 19:00:26.636791	2025-11-11 19:00:26.636791
fe744110-ec73-47be-a39a-132b63c25bf2	LOCALIZA SAO PAULO	830002	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830002	2025-11-11 19:00:26.665	2025-11-11 19:00:26.69672	2025-11-11 19:00:26.69672
31223306-3cce-491d-9df4-cc6101032ca6	LOCALIZA ESPIRITO SANTO	830003	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830003	2025-11-11 19:00:26.725	2025-11-11 19:00:26.757096	2025-11-11 19:00:26.757096
7c834d90-90eb-45f1-9a57-faa743275927	LOCALIZA BRASILIA	830005	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830005	2025-11-11 19:00:26.785	2025-11-11 19:00:26.817063	2025-11-11 19:00:26.817063
6302538f-4878-4067-8748-31783f651ba7	LOCALIZA GOIAS	830006	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830006	2025-11-11 19:00:26.845	2025-11-11 19:00:26.877531	2025-11-11 19:00:26.877531
c3a27a4b-4147-4263-a475-065cf7004df6	LOCALIZA MATO GROSSO	830007	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830007	2025-11-11 19:00:26.905	2025-11-11 19:00:26.93785	2025-11-11 19:00:26.93785
bc60717e-789d-442a-a47e-520f928da80b	LOCALIZA MATO GROSSO DO SUL	830008	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830008	2025-11-11 19:00:26.966	2025-11-11 19:00:26.998042	2025-11-11 19:00:26.998042
470bf0fd-932d-4790-88ac-dc1125b42a44	LOCALIZA TOCANTINS	830009	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830009	2025-11-11 19:00:27.026	2025-11-11 19:00:27.058381	2025-11-11 19:00:27.058381
f1c41b92-e5fa-4257-80ce-2465816a19d4	LOCALIZA MARANHAO	830010	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830010	2025-11-11 19:00:27.087	2025-11-11 19:00:27.119038	2025-11-11 19:00:27.119038
f1896ba6-c137-43a7-8f9f-a18e22274244	LOCALIZA SANTA CATARINA - INATIVO	830011	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830011	2025-11-11 19:00:27.147	2025-11-11 19:00:27.17908	2025-11-11 19:00:27.17908
47b7b0c3-1196-4203-949a-a97b07acfe7d	LOCALIZA RIO DE JANEIRO	830013	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830013	2025-11-11 19:00:27.207	2025-11-11 19:00:27.239259	2025-11-11 19:00:27.239259
cab688cb-9ad6-4922-9f4b-93aa980b9535	LOCALIZA FRENTISTAS SAO PAULO	830030	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830030	2025-11-11 19:00:27.267	2025-11-11 19:00:27.299451	2025-11-11 19:00:27.299451
133fec01-b182-4276-87cf-d560c9afda6e	LOCALIZA FRENTISTAS RIO DE JANEIRO	830031	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830031	2025-11-11 19:00:27.328	2025-11-11 19:00:27.360591	2025-11-11 19:00:27.360591
7b55837d-224d-4049-b249-206372a3961d	LOCALIZA FRENTISTAS RIO GRANDE DO SUL	830032	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830032	2025-11-11 19:00:27.388	2025-11-11 19:00:27.420615	2025-11-11 19:00:27.420615
0a09ef3e-d90d-4ce9-aa8f-60587191603d	LOCALIZA FRENTISTAS PARANA	830033	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830033	2025-11-11 19:00:27.449	2025-11-11 19:00:27.480697	2025-11-11 19:00:27.480697
e2c82e65-8203-454b-b1d5-11aa5c5b6534	LOCALIZA FRENTISTAS MG	830034	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830034	2025-11-11 19:00:27.509	2025-11-11 19:00:27.541164	2025-11-11 19:00:27.541164
a622e8be-d075-44a9-a38f-45ca5e2ce552	LOCALIZA FRENTISTAS SANTA CATARINA	830035	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830035	2025-11-11 19:00:27.569	2025-11-11 19:00:27.601227	2025-11-11 19:00:27.601227
716d4851-2c61-4867-8622-9cd747f5c94d	LOCALIZA HIGIENIZADORES SP	830040	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	830040	2025-11-11 19:00:27.629	2025-11-11 19:00:27.66097	2025-11-11 19:00:27.66097
b5c4fe69-748b-4cb7-a1a3-8bf912438aa3	ADMINISTRATIVO RUMO	840001	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840001	2025-11-11 19:00:27.689	2025-11-11 19:00:27.720724	2025-11-11 19:00:27.720724
8acc013c-4d54-4378-aa29-4c9851df1ca8	RUMO MALHA SUL	840002	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840002	2025-11-11 19:00:27.749	2025-11-11 19:00:27.780637	2025-11-11 19:00:27.780637
f4adb7f0-7136-4e77-aa7e-93ec21a919a8	RUMO MALHA PAULISTA	840003	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840003	2025-11-11 19:00:27.809	2025-11-11 19:00:27.841391	2025-11-11 19:00:27.841391
d33538aa-7aea-4379-99c0-675e90f45f9b	RUMO MALHA NORTE	840004	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840004	2025-11-11 19:00:27.87	2025-11-11 19:00:27.901828	2025-11-11 19:00:27.901828
a1ccb119-16ce-42e1-a7d0-cc2bebcb0e65	RUMO MALHA OESTE	840005	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840005	2025-11-11 19:00:27.93	2025-11-11 19:00:27.96218	2025-11-11 19:00:27.96218
6b5ca969-ae0f-46cb-a0dd-c98f48d7c697	RUMO MALHA CENTRAL	840006	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840006	2025-11-11 19:00:27.99	2025-11-11 19:00:28.02343	2025-11-11 19:00:28.02343
591bf15d-164b-4dba-a411-7de89ee0a6ed	RUMO MALHA SP - OESTE	840007	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840007	2025-11-11 19:00:28.052	2025-11-11 19:00:28.084104	2025-11-11 19:00:28.084104
16fa9435-9fe6-42a2-bde8-69ec7d8618f5	RUMO MALHA SP - ELEVAÇÕES	840008	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840008	2025-11-11 19:00:28.112	2025-11-11 19:00:28.143941	2025-11-11 19:00:28.143941
32a6aae4-541b-4ef4-a56e-979c6876c6e8	RUMO MALHA SP - LOGISPOT	840009	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840009	2025-11-11 19:00:28.172	2025-11-11 19:00:28.204215	2025-11-11 19:00:28.204215
a178ade9-5355-4599-a944-cb3b3d1cfe57	RUMO MALHA SP - RUMO SA	840010	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840010	2025-11-11 19:00:28.232	2025-11-11 19:00:28.263065	2025-11-11 19:00:28.263065
7a5a45b9-dcb6-495a-ba66-1c462c49005e	RUMO MALHA SUL - SC	840011	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840011	2025-11-11 19:00:28.291	2025-11-11 19:00:28.32334	2025-11-11 19:00:28.32334
f1cc50a7-1282-4ac2-8f3b-97b7dcdcdd04	RUMO MALHA SUL - RS	840012	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	840012	2025-11-11 19:00:28.351	2025-11-11 19:00:28.383235	2025-11-11 19:00:28.383235
c5f6e5cb-6db5-41e8-9a73-9336cfde1399	LOCALIZA -BELO HORIZONTE - CACHOEIRINHA - 16.670.085/0001-55	9820251	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820251	2025-11-11 19:00:28.411	2025-11-11 19:00:28.443116	2025-11-11 19:00:28.443116
cb2551e6-2c95-43dc-8ec2-879c74857a06	LOCALIZA -CACHOEIRO DE ITAPEMIRIM - PARAISO - 16.670.085/0255-73	9820252	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820252	2025-11-11 19:00:28.471	2025-11-11 19:00:28.503279	2025-11-11 19:00:28.503279
c5d3ae50-2019-49a4-a13d-659d6d80ccad	LOCALIZA -GUARAPARI - AEROPORTO - 16.670.085/0249-25	9820253	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820253	2025-11-11 19:00:28.532	2025-11-11 19:00:28.564041	2025-11-11 19:00:28.564041
ced13e8e-08e9-4bf0-b3a4-6228699f4d8f	LOCALIZA -VITORIA - AEROPORTO - 16.670.085/0024-41	9820254	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820254	2025-11-11 19:00:28.592	2025-11-11 19:00:28.624162	2025-11-11 19:00:28.624162
9ac2aaaa-23f8-4a90-95ee-e96f317ac5e6	LOCALIZA -VITORIA - SANTA LUCIA - 16.670.085/0341-30	9820255	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820255	2025-11-11 19:00:28.652	2025-11-11 19:00:28.684439	2025-11-11 19:00:28.684439
d3a4fc53-48d3-48a6-83e2-e5b3283a8183	LOCALIZA -SERRA - JARDIM LIMOEIRO - 16.670.085/0903-91	9820256	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820256	2025-11-11 19:00:28.712	2025-11-11 19:00:28.744253	2025-11-11 19:00:28.744253
ffca699c-d9d9-49bc-a1bd-c3aae6ff5629	LOCALIZA -VITORIA - AEROPORTO - 16.670.085/0009-02	9820257	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820257	2025-11-11 19:00:28.772	2025-11-11 19:00:28.804312	2025-11-11 19:00:28.804312
53980736-3ee5-4413-bf77-10bd945699e3	LOCALIZA -VILA VELHA - PRAIA DA COSTA - 16.670.085/0141-05	9820258	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820258	2025-11-11 19:00:28.832	2025-11-11 19:00:28.864163	2025-11-11 19:00:28.864163
849de84b-39bc-42d2-88de-e9e557831701	LOCALIZA -COLATINA - LACE - 16.670.085/0329-44	9820259	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820259	2025-11-11 19:00:28.892	2025-11-11 19:00:28.924053	2025-11-11 19:00:28.924053
7cc2ac59-5019-45d2-8584-d5e565e78473	LOCALIZA -LINHARES - CENTRO - 16.670.085/0277-89	9820260	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820260	2025-11-11 19:00:28.952	2025-11-11 19:00:28.984034	2025-11-11 19:00:28.984034
0a78adce-72fe-433a-925b-2ad8f3cafec4	LOCALIZA -SAO MATEUS - VILA NOVA - 16.670.085/0250-69	9820262	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820262	2025-11-11 19:00:29.012	2025-11-11 19:00:29.044034	2025-11-11 19:00:29.044034
542f635f-e694-4562-942f-f85a0870e002	LOCALIZA -BARBACENA - PONTILHAO - 16.670.085/0292-18	9820263	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820263	2025-11-11 19:00:29.072	2025-11-11 19:00:29.104347	2025-11-11 19:00:29.104347
e26b7394-44ea-4275-a9c3-ab1dfcbdfd85	LOCALIZA -VARGINHA - AEROPORTO - 16.670.085/0420-79	9820264	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820264	2025-11-11 19:00:29.132	2025-11-11 19:00:29.164415	2025-11-11 19:00:29.164415
8cce3a85-8daf-4237-bd9b-366fcd09aa42	LOCALIZA -UBERABA - SANTOS DUMONT - 16.670.085/0115-13	9820265	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820265	2025-11-11 19:00:29.193	2025-11-11 19:00:29.224873	2025-11-11 19:00:29.224873
76995c64-0ff1-413a-bc62-7a972dfe32ef	LOCALIZA -ARAXA - AEROPORTO - 16.670.085/0670-63	9820266	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820266	2025-11-11 19:00:29.253	2025-11-11 19:00:29.284929	2025-11-11 19:00:29.284929
4a524d1d-2345-47c0-9931-9b44c6dc3451	LOCALIZA -ARAXA - CENTRO - 16.670.085/0736-24	9820267	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820267	2025-11-11 19:00:29.315	2025-11-11 19:00:29.348136	2025-11-11 19:00:29.348136
83c00531-0043-48cd-b36d-05cae8839708	LOCALIZA -ITUIUTABA - CENTRO - 16.670.085/0485-14	9820268	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820268	2025-11-11 19:00:29.376	2025-11-11 19:00:29.408225	2025-11-11 19:00:29.408225
265f3b66-b14d-4b0e-9e73-3779ed94eb51	LOCALIZA -JOAO PINHEIRO - CENTRO - 16.670.085/0740-00	9820269	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820269	2025-11-11 19:00:29.436	2025-11-11 19:00:29.468071	2025-11-11 19:00:29.468071
b7b8b0f4-c743-49a7-8047-3e30631c79dc	LOCALIZA -PARACATU - AMOREIRAS I - 16.670.085/0674-97	9820270	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820270	2025-11-11 19:00:29.496	2025-11-11 19:00:29.527114	2025-11-11 19:00:29.527114
480ded2d-5c6d-409c-9838-5ad6efc1fb8c	LOCALIZA -UBERABA - SANTOS DUMONT - 16.670.085/0116-02	9820271	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820271	2025-11-11 19:00:29.555	2025-11-11 19:00:29.58721	2025-11-11 19:00:29.58721
b4fb6b52-d3b6-4139-b9cf-93b5c42f4007	LOCALIZA -UNAI - CENTRO - 16.670.085/0661-72	9820272	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820272	2025-11-11 19:00:29.618	2025-11-11 19:00:29.650558	2025-11-11 19:00:29.650558
d4f30652-6173-4508-a3da-f54875764089	LOCALIZA -PATOS DE MINAS - CRISTO REDENTOR - 16.670.085/0742-72	9820273	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820273	2025-11-11 19:00:29.678	2025-11-11 19:00:29.710496	2025-11-11 19:00:29.710496
005492d1-8024-4f1a-a948-5b1b9e2a5211	LOCALIZA -SAO GOTARDO - CENTRO - 16.670.085/0669-20	9820274	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820274	2025-11-11 19:00:29.739	2025-11-11 19:00:29.785919	2025-11-11 19:00:29.785919
6512563d-fb0c-4557-b8bf-75793fb27a4f	LOCALIZA -ARAGUARI - BOSQUE - 16.670.085/0586-68	9820275	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820275	2025-11-11 19:00:29.817	2025-11-11 19:00:29.848533	2025-11-11 19:00:29.848533
8340d612-5a65-4f82-b0a9-57115d048009	LOCALIZA -PATROCINIO - SAO JUDAS - 16.670.085/0730-39	9820276	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820276	2025-11-11 19:00:29.876	2025-11-11 19:00:29.908995	2025-11-11 19:00:29.908995
b7527c5c-943f-49b9-b806-3dab5b8646ed	LOCALIZA -UBERLANDIA - JARDIM IPANEMA - 16.670.085/0113-51	9820277	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820277	2025-11-11 19:00:29.937	2025-11-11 19:00:29.969408	2025-11-11 19:00:29.969408
583bde0b-53a0-406e-9d8e-74bc33bcb8e6	LOCALIZA -UBERLANDIA - TIBERY - 16.670.085/0114-32	9820278	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820278	2025-11-11 19:00:29.997	2025-11-11 19:00:30.029792	2025-11-11 19:00:30.029792
14826172-7776-476f-b9e6-6978cacbf0f3	LOCALIZA -UBERLANDIA - JARDIM IPANEMA - 16.670.085/0610-22	9820280	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820280	2025-11-11 19:00:30.058	2025-11-11 19:00:30.090502	2025-11-11 19:00:30.090502
a72cc1fa-2193-4ab5-8292-420d984f7cd8	LOCALIZA -POUSO ALEGRE - SAO JOSE - 16.670.085/0163-10	9820281	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820281	2025-11-11 19:00:30.118	2025-11-11 19:00:30.150648	2025-11-11 19:00:30.150648
234f7b85-6eee-4f53-b56b-24f0d4de7829	LOCALIZA -LAVRAS - ARTHUR BERNARDES - 16.670.085/0293-07	9820282	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820282	2025-11-11 19:00:30.18	2025-11-11 19:00:30.215875	2025-11-11 19:00:30.215875
32287ae6-7b97-4973-92c6-1eb56bae3224	LOCALIZA -ITABIRA - CENTRO - 16.670.085/0552-19	9820283	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820283	2025-11-11 19:00:30.244	2025-11-11 19:00:30.275347	2025-11-11 19:00:30.275347
a0d99fb3-59e0-451c-a148-5455fb0cf5cc	LOCALIZA -ITAJUBA - AVENIDA - 16.670.085/0470-38	9820284	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820284	2025-11-11 19:00:30.303	2025-11-11 19:00:30.335982	2025-11-11 19:00:30.335982
cc1ebe71-20d4-4113-83d7-3188b45d7f4e	LOCALIZA -VARGINHA - JARDIM ANDERE - 16.670.085/0344-83	9820285	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820285	2025-11-11 19:00:30.364	2025-11-11 19:00:30.396291	2025-11-11 19:00:30.396291
db50e666-c035-4f7b-9b83-225e3199905a	LOCALIZA -TRES CORACOES - NOSSA SENHORA APARECIDA - 16.670.085/0390-19	9820286	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820286	2025-11-11 19:00:30.424	2025-11-11 19:00:30.458165	2025-11-11 19:00:30.458165
6b6200a7-b49f-4aef-88cf-53d5d4ac6676	LOCALIZA -JOAO MONLEVADE - CARNEIRINHOS - 16.670.085/0555-61	9820287	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820287	2025-11-11 19:00:30.486	2025-11-11 19:00:30.518243	2025-11-11 19:00:30.518243
9147022f-3e75-479c-8376-904c8caaa8b3	LOCALIZA -BOM DESPACHO - SAO JOAO - 16.670.085/0928-40	9820288	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820288	2025-11-11 19:00:30.546	2025-11-11 19:00:30.578381	2025-11-11 19:00:30.578381
837ce454-9aec-4119-8a90-2e1224ac0a55	LOCALIZA -ITAUNA - UNIVERSITARIO - 16.670.085/0927-69	9820289	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820289	2025-11-11 19:00:30.606	2025-11-11 19:00:30.638292	2025-11-11 19:00:30.638292
c2dd2957-0a41-4624-984d-c5a994c0b2a9	LOCALIZA -CAMPO BELO - SAO FRANCISCO - 16.670.085/0657-96	9820290	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820290	2025-11-11 19:00:30.667	2025-11-11 19:00:30.700352	2025-11-11 19:00:30.700352
e5ca6661-4040-4029-9249-77d5d74ed84a	LOCALIZA -CONFINS - CENTRO - 16.670.085/0092-92	9820291	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820291	2025-11-11 19:00:30.728	2025-11-11 19:00:30.760361	2025-11-11 19:00:30.760361
0f1f9bc8-292a-4268-9d10-a16ac0d59664	LOCALIZA -BELO HORIZONTE - LOURDES - 16.670.085/0788-55	9820292	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820292	2025-11-11 19:00:30.788	2025-11-11 19:00:30.820382	2025-11-11 19:00:30.820382
06992d3e-3bfe-4aaa-8a6a-55c65c42d74a	LOCALIZA -BELO HORIZONTE - CAICARAS - 16.670.085/0901-20	9820293	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820293	2025-11-11 19:00:30.848	2025-11-11 19:00:30.880472	2025-11-11 19:00:30.880472
5106890d-566e-410d-9168-770fb2106cd6	LOCALIZA -BELO HORIZONTE - IPIRANGA - 16.670.085/0297-22	9820294	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820294	2025-11-11 19:00:30.908	2025-11-11 19:00:30.940682	2025-11-11 19:00:30.940682
ee836ff1-6df1-4bdb-ba75-e48da58e2b3b	LOCALIZA -BELO HORIZONTE - AEROPORTO - 16.670.085/0120-80	9820295	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820295	2025-11-11 19:00:30.968	2025-11-11 19:00:31.000705	2025-11-11 19:00:31.000705
63a97f1b-1dc7-43f5-81e3-601c93ab0441	LOCALIZA -POCOS DE CALDAS - CENTRO - 16.670.085/0170-40	9820298	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820298	2025-11-11 19:00:31.029	2025-11-11 19:00:31.061	2025-11-11 19:00:31.061
b417f0f8-f116-4b13-8dc3-0273e6bbb3ce	LOCALIZA -PASSOS - VILA RICA - 16.670.085/0638-23	9820299	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820299	2025-11-11 19:00:31.09	2025-11-11 19:00:31.122161	2025-11-11 19:00:31.122161
322f15f7-c35f-4ac9-9033-9cb25ee51f3a	LOCALIZA -DIVINOPOLIS - PADRE LIBERIO - 16.670.085/0935-79	9820300	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820300	2025-11-11 19:00:31.15	2025-11-11 19:00:31.182241	2025-11-11 19:00:31.182241
9a834a06-197d-45b0-a834-0f7cb66354a8	LOCALIZA -SAO BRAS DO SUACUI - CENTRO - 16.670.085/0421-50	9820301	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820301	2025-11-11 19:00:31.21	2025-11-11 19:00:31.242569	2025-11-11 19:00:31.242569
4a9d60bb-666d-41d0-977b-e536a32edcfd	LOCALIZA -OURO PRETO - SAO CRISTOVAO - 16.670.085/0925-05	9820302	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820302	2025-11-11 19:00:31.271	2025-11-11 19:00:31.302998	2025-11-11 19:00:31.302998
c39a8277-0010-4f8f-96ae-1c6cf1405d31	LOCALIZA -MARIANA - VILA DO CARMO - 16.670.085/0446-08	9820303	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820303	2025-11-11 19:00:31.331	2025-11-11 19:00:31.363326	2025-11-11 19:00:31.363326
66f25d71-4033-4aa5-b88f-0f8b3ed4277a	LOCALIZA -CONSELHEIRO LAFAIETE - CAMPO ALEGRE - 16.670.085/0924-16	9820304	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820304	2025-11-11 19:00:31.392	2025-11-11 19:00:31.423967	2025-11-11 19:00:31.423967
e173abcf-ab7b-4ee4-966e-99d6bc36d9b4	LOCALIZA -RIO NOVO - AEROPORTO - 16.670.085/0534-37	9820305	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820305	2025-11-11 19:00:31.452	2025-11-11 19:00:31.484375	2025-11-11 19:00:31.484375
26cfe6af-7208-4f83-ae4f-a0d7bfb4ecd4	LOCALIZA -JUIZ DE FORA - CENTRO - 16.670.085/0532-75	9820306	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820306	2025-11-11 19:00:31.513	2025-11-11 19:00:31.545986	2025-11-11 19:00:31.545986
68fb86b8-223e-4730-a0ba-caf8643f17eb	LOCALIZA -SAO JOAO DEL REI - FABRICAS - 16.670.085/0294-80	9820307	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820307	2025-11-11 19:00:31.574	2025-11-11 19:00:31.606243	2025-11-11 19:00:31.606243
71508ed8-78b9-4550-8460-a0aec09a97bc	LOCALIZA -OURO BRANCO - CENTRO - 16.670.085/0447-99	9820308	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820308	2025-11-11 19:00:31.634	2025-11-11 19:00:31.666756	2025-11-11 19:00:31.666756
e88fcbf5-ed7f-43a1-a3db-b94feb8d48ce	LOCALIZA -PARA DE MINAS - SAO JOSE - 16.670.085/0929-20	9820309	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820309	2025-11-11 19:00:31.695	2025-11-11 19:00:31.727265	2025-11-11 19:00:31.727265
4ade2968-f08f-4634-b730-0af03dd10a2c	LOCALIZA -PIRAPORA - SANTOS DUMONT SEDE - 16.670.085/0556-42	9820310	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820310	2025-11-11 19:00:31.755	2025-11-11 19:00:31.787402	2025-11-11 19:00:31.787402
8bf10ec4-aca8-45a0-81d5-9b4583368d98	LOCALIZA -MONTES CLAROS - JARAGUA - 16.670.085/0553-08	9820311	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820311	2025-11-11 19:00:31.815	2025-11-11 19:00:31.847316	2025-11-11 19:00:31.847316
2d2abe05-2fba-4735-a4b9-e0dc19cf6fc0	LOCALIZA -MONTES CLAROS - SAO JOSE - 16.670.085/0563-71	9820312	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820312	2025-11-11 19:00:31.876	2025-11-11 19:00:31.907724	2025-11-11 19:00:31.907724
0b489927-8e08-4c2f-9cc1-de88ebd0577d	LOCALIZA -MONTES CLAROS - JARAGUA - 16.670.085/0611-03	9820313	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820313	2025-11-11 19:00:31.936	2025-11-11 19:00:31.967918	2025-11-11 19:00:31.967918
f5a2ef66-be77-432c-885d-be203cd52a38	LOCALIZA -NOVA LIMA - VILA DA SERRA - 16.670.085/0508-45	9820314	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820314	2025-11-11 19:00:31.996	2025-11-11 19:00:32.027774	2025-11-11 19:00:32.027774
5c86699b-dae1-4fdb-96fa-39624fbf4a35	LOCALIZA -BELO HORIZONTE - BARREIRO - 16.670.085/0391-08	9820315	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820315	2025-11-11 19:00:32.056	2025-11-11 19:00:32.087951	2025-11-11 19:00:32.087951
e32d6834-ca4d-43f7-a25b-d188336fb18c	LOCALIZA -BELO HORIZONTE - JARDIM AMERICA - 16.670.085/0400-25	9820316	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820316	2025-11-11 19:00:32.116	2025-11-11 19:00:32.14805	2025-11-11 19:00:32.14805
a4ffd9b2-908f-4621-a122-224b43d46469	LOCALIZA -BELO HORIZONTE - FUNCIONARIOS - 16.670.085/0049-08	9820317	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820317	2025-11-11 19:00:32.176	2025-11-11 19:00:32.208325	2025-11-11 19:00:32.208325
f9d08e66-ba6e-4432-886c-b70a8d1b3749	LOCALIZA -BELO HORIZONTE - ESTORIL - 16.670.085/0612-94	9820318	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820318	2025-11-11 19:00:32.236	2025-11-11 19:00:32.268288	2025-11-11 19:00:32.268288
36946212-c95e-4388-9e26-cfc6fa8a0941	LOCALIZA -ABADIA DOS DOURADOS - SAVASSI - 16.670.085/0676-59	9820319	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820319	2025-11-11 19:00:32.297	2025-11-11 19:00:32.329827	2025-11-11 19:00:32.329827
190bd53d-1543-4ea7-81bb-0ff2544e91c5	LOCALIZA -BETIM - FILADELFIA - 16.670.085/0310-34	9820320	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820320	2025-11-11 19:00:32.358	2025-11-11 19:00:32.389395	2025-11-11 19:00:32.389395
d592e520-5af9-4f94-aaac-13ca93e7d12e	LOCALIZA -CONTAGEM - ELDORADO - 16.670.085/0137-29	9820321	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820321	2025-11-11 19:00:32.417	2025-11-11 19:00:32.449432	2025-11-11 19:00:32.449432
1f568b9c-c169-4b2f-a86e-edbaf9a6e23e	LOCALIZA -BELO HORIZONTE - PADRE EUSTAQUIO - 16.670.085/0392-80	9820322	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820322	2025-11-11 19:00:32.477	2025-11-11 19:00:32.509465	2025-11-11 19:00:32.509465
d2c1e70c-1363-4510-839a-3f8f246f3afb	LOCALIZA -JANAUBA - CENTRO - 16.670.085/0562-90	9820323	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820323	2025-11-11 19:00:32.537	2025-11-11 19:00:32.569732	2025-11-11 19:00:32.569732
ca93b39f-6bf5-46f3-bb59-f28d7f341d7a	LOCALIZA -IPOJUCA - PORTO DE GALINHAS - 16.670.085/0512-21	9820324	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820324	2025-11-11 19:00:32.598	2025-11-11 19:00:32.630448	2025-11-11 19:00:32.630448
5dec3904-4442-42e0-a02e-ca35bcc98b63	LOCALIZA -RECIFE - BOA VIAGEM - 16.670.085/0035-02	9820325	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820325	2025-11-11 19:00:32.658	2025-11-11 19:00:32.690665	2025-11-11 19:00:32.690665
d0c108aa-6645-4228-821a-15e893157c92	LOCALIZA -RECIFE - IBURA - 16.670.085/0039-28	9820327	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820327	2025-11-11 19:00:32.719	2025-11-11 19:00:32.75126	2025-11-11 19:00:32.75126
e7f2a1a1-4819-4ee3-b76e-f7402ad4b445	LOCALIZA -CARUARU - PINHEIROPOLIS - 16.670.085/0491-62	9820328	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820328	2025-11-11 19:00:32.779	2025-11-11 19:00:32.811464	2025-11-11 19:00:32.811464
ce5ae74c-d065-4db0-b326-57260894dddc	LOCALIZA -RECIFE - BOA VIAGEM - 16.670.085/0767-20	9820329	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820329	2025-11-11 19:00:32.839	2025-11-11 19:00:32.871427	2025-11-11 19:00:32.871427
c2dc4655-0ce0-4e2a-ac52-b89141bb45ae	LOCALIZA -GOIANA - CENTRO - 16.670.085/0516-55	9820330	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820330	2025-11-11 19:00:32.899	2025-11-11 19:00:32.931339	2025-11-11 19:00:32.931339
be108b51-3f9e-4599-a210-94e153a8e9e7	LOCALIZA -VITORIA - FORTE SAO JOAO - 16.670.085/0327-82	9820331	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820331	2025-11-11 19:00:32.959	2025-11-11 19:00:32.991459	2025-11-11 19:00:32.991459
1102cbbf-aca0-46a7-8cac-7d0822bd7434	LOCALIZA -BELO HORIZONTE - PADRE EUSTAQUIO - 16.670.085/0066-09	9820332	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820332	2025-11-11 19:00:33.019	2025-11-11 19:00:33.051398	2025-11-11 19:00:33.051398
2ca1f5c4-e7ab-4aae-b2a4-0eb549c050d2	LOCALIZA -BELO HORIZONTE - CARLOS PRATES - 16.670.085/0208-57	9820333	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820333	2025-11-11 19:00:33.08	2025-11-11 19:00:33.111946	2025-11-11 19:00:33.111946
028d0d31-bd05-4c7a-86b6-fe226d61e2a7	LOCALIZA -BELO HORIZONTE - IPIRANGA - 16.670.085/0209-38	9820334	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820334	2025-11-11 19:00:33.141	2025-11-11 19:00:33.173083	2025-11-11 19:00:33.173083
bda242d0-86df-4755-a7a1-2c9860e0c739	LOCALIZA -UBERLANDIA - SANTA MONICA - 16.670.085/0394-42	9820335	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820335	2025-11-11 19:00:33.201	2025-11-11 19:00:33.233315	2025-11-11 19:00:33.233315
491e4ef6-1bf8-46df-a017-84a923bbe679	LOCALIZA -BETIM - INGA - 16.670.085/0422-30	9820336	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820336	2025-11-11 19:00:33.265	2025-11-11 19:00:33.298175	2025-11-11 19:00:33.298175
df524508-9b9d-4354-ac07-2967537044e7	LOCALIZA -CONTAGEM - ELDORADO - 16.670.085/0482-71	9820337	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820337	2025-11-11 19:00:33.326	2025-11-11 19:00:33.358627	2025-11-11 19:00:33.358627
7d8cf0c6-3239-4690-b195-4553e17ccdbd	LOCALIZA -BELO HORIZONTE - SANTA LUCIA - 16.670.085/0309-09	9820338	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820338	2025-11-11 19:00:33.387	2025-11-11 19:00:33.418789	2025-11-11 19:00:33.418789
391eb6ea-1b40-4209-9953-08a635f94d98	LOCALIZA -BELO HORIZONTE - VENDA NOVA - 16.670.085/0436-36	9820339	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820339	2025-11-11 19:00:33.447	2025-11-11 19:00:33.478969	2025-11-11 19:00:33.478969
8a710280-29ab-41e8-a9d1-353dd24f6a53	LOCALIZA -CONTAGEM - AGUA BRANCA - 16.670.085/0673-06	9820341	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820341	2025-11-11 19:00:33.507	2025-11-11 19:00:33.539702	2025-11-11 19:00:33.539702
0e165fa8-9565-41d7-b8ee-cf0774d17cd8	LOCALIZA -UBERABA - SAO BENEDITO - 16.670.085/0679-00	9820342	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820342	2025-11-11 19:00:33.568	2025-11-11 19:00:33.599865	2025-11-11 19:00:33.599865
bfd4d775-8b7c-452a-a28c-148720d9273a	LOCALIZA -BELO HORIZONTE - LIBERDADE - 16.670.085/0808-33	9820343	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820343	2025-11-11 19:00:33.629	2025-11-11 19:00:33.66013	2025-11-11 19:00:33.66013
8769a0a0-2e6a-438a-8f1b-169a58748a56	LOCALIZA -CONTAGEM - JARDIM INDUSTRIAL - 16.670.085/0910-10	9820344	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820344	2025-11-11 19:00:33.688	2025-11-11 19:00:33.7191	2025-11-11 19:00:33.7191
86fa31a0-36d9-43a0-ba8d-da08a422fdae	LOCALIZA -JUIZ DE FORA - MARIANO PROCOPIO - 16.670.085/0916-06	9820345	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820345	2025-11-11 19:00:33.747	2025-11-11 19:00:33.779288	2025-11-11 19:00:33.779288
671876e9-0604-431f-a863-25daa64b811c	LOCALIZA -RECIFE - IMBIRIBEIRA - 16.670.085/0136-48	9820346	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820346	2025-11-11 19:00:33.807	2025-11-11 19:00:33.839507	2025-11-11 19:00:33.839507
1973c7b3-fafd-4b5a-9704-6277cfff8200	LOCALIZA -RECIFE - CORDEIRO - 16.670.085/0221-24	9820347	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820347	2025-11-11 19:00:33.869	2025-11-11 19:00:33.900843	2025-11-11 19:00:33.900843
6b55d986-e333-4987-9b35-96e33a9108b9	LOCALIZA -CARUARU - MAURICIO DE NASSAU - 16.670.085/0799-08	9820348	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820348	2025-11-11 19:00:33.929	2025-11-11 19:00:33.960809	2025-11-11 19:00:33.960809
2f19c30a-0b80-450c-adb1-501f63e69781	LOCALIZA -PETROLINA - PALHINHAS - 16.670.085/0835-06	9820349	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820349	2025-11-11 19:00:33.989	2025-11-11 19:00:34.020781	2025-11-11 19:00:34.020781
52488e43-b0d0-44f5-bfdf-a9c3130666c8	LOCALIZA -JABOATAO DOS GUARARAPES - CAJUEIRO SECO - 16.670.085/0877-65	9820350	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820350	2025-11-11 19:00:34.049	2025-11-11 19:00:34.081235	2025-11-11 19:00:34.081235
654f271e-11cb-4c4e-bb39-ea4e65feb4e7	LOCALIZA -CAMPINAS - GUANABARA - 16.670.085/0121-61	9820354	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820354	2025-11-11 19:00:34.109	2025-11-11 19:00:34.140054	2025-11-11 19:00:34.140054
d2f5326b-647a-4bdf-8465-5153fd752746	LOCALIZA -SOROCABA - JARDIM SANTA ROSALIA - 16.670.085/0126-76	9820355	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820355	2025-11-11 19:00:34.168	2025-11-11 19:00:34.200452	2025-11-11 19:00:34.200452
8bb4d553-c9aa-4bde-9b52-0516b98f4dcd	LOCALIZA -SAO PAULO - VILA PRUDENTE - 16.670.085/0081-30	9820356	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820356	2025-11-11 19:00:34.228	2025-11-11 19:00:34.260403	2025-11-11 19:00:34.260403
c9632f8e-94fc-44fc-8feb-4be798aba07c	LOCALIZA -SAO PAULO - VILA GUILHERME - 16.670.085/0203-42	9820357	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820357	2025-11-11 19:00:34.288	2025-11-11 19:00:34.320655	2025-11-11 19:00:34.320655
fc2281ae-6a54-42f3-bee2-ce8a9e78d6b3	LOCALIZA -CAMPINAS - JARDIM NOSSA SENHORA AUXILIADORA - 16.670.085/0196-89	9820358	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820358	2025-11-11 19:00:34.349	2025-11-11 19:00:34.380862	2025-11-11 19:00:34.380862
5fc37de8-eead-4e00-9838-451731570949	LOCALIZA -SAO PAULO - VILA SONIA - 16.670.085/0216-67	9820359	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820359	2025-11-11 19:00:34.409	2025-11-11 19:00:34.440865	2025-11-11 19:00:34.440865
81d445c4-7488-4e1c-a8c2-963caff47898	LOCALIZA -SAO PAULO - PENHA - 16.670.085/0300-62	9820360	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820360	2025-11-11 19:00:34.469	2025-11-11 19:00:34.501313	2025-11-11 19:00:34.501313
8ba32357-4d0a-4741-ad56-f273277b07de	LOCALIZA -SAO JOSE DOS CAMPOS - JARDIM SATELITE - 16.670.085/0128-38	9820361	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820361	2025-11-11 19:00:34.53	2025-11-11 19:00:34.561984	2025-11-11 19:00:34.561984
513504cf-5cf7-4175-b829-b653f074c2dc	LOCALIZA -SANTO ANDRE - PARQUE JACATUBA - 16.670.085/0319-72	9820362	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820362	2025-11-11 19:00:34.59	2025-11-11 19:00:34.623139	2025-11-11 19:00:34.623139
ecb81507-7038-4c92-9bb7-c7827fe5f134	LOCALIZA -SAO PAULO - ITAIM PAULISTA - 16.670.085/0322-78	9820363	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820363	2025-11-11 19:00:34.651	2025-11-11 19:00:34.683283	2025-11-11 19:00:34.683283
b294b80b-2f23-4449-9a67-fbb814850096	LOCALIZA -MOJI DAS CRUZES - VILA LAVINIA - 16.670.085/0331-69	9820364	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820364	2025-11-11 19:00:34.711	2025-11-11 19:00:34.743609	2025-11-11 19:00:34.743609
c3514343-e165-4cc2-a98d-4e836fe28260	LOCALIZA -SAO PAULO - VILLA LEOPOLDINA - 16.670.085/0325-10	9820365	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820365	2025-11-11 19:00:34.772	2025-11-11 19:00:34.803995	2025-11-11 19:00:34.803995
0e203771-d5e6-4dfe-b012-141bca78bca9	LOCALIZA -SAO JOSE DOS CAMPOS - JARDIM SERIMBURA - 16.670.085/0399-57	9820366	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820366	2025-11-11 19:00:34.832	2025-11-11 19:00:34.863789	2025-11-11 19:00:34.863789
f2596fd3-c6d7-4804-bde3-d9c7de433755	LOCALIZA -SAO PAULO - AGUA BRANCA - 16.670.085/0444-46	9820367	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820367	2025-11-11 19:00:34.892	2025-11-11 19:00:34.924032	2025-11-11 19:00:34.924032
36ab3765-2947-429e-a9b4-9300a8c85553	LOCALIZA -OSASCO - UMUARAMA - 16.670.085/0419-35	9820368	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820368	2025-11-11 19:00:34.952	2025-11-11 19:00:34.983981	2025-11-11 19:00:34.983981
efe06dec-6a1f-4a99-8e72-2c5a4836ed03	LOCALIZA -SAO PAULO - SANTO AMARO - 16.670.085/0458-41	9820369	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820369	2025-11-11 19:00:35.012	2025-11-11 19:00:35.043865	2025-11-11 19:00:35.043865
cb7e768c-5bf6-4123-9b0d-deb7df9db5dd	LOCALIZA -SAO PAULO - VILA ALMEIDA - 16.670.085/0457-60	9820370	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820370	2025-11-11 19:00:35.072	2025-11-11 19:00:35.103147	2025-11-11 19:00:35.103147
b99b9fd6-e2b1-4275-ab18-fc0607bad6df	LOCALIZA -GUARULHOS - MACEDO - 16.670.085/0456-80	9820371	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820371	2025-11-11 19:00:35.131	2025-11-11 19:00:35.163334	2025-11-11 19:00:35.163334
1ba25e5e-ff24-4476-aacd-5aab3b9b1d10	LOCALIZA -SAO PAULO - SAUDE - 16.670.085/0480-00	9820372	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820372	2025-11-11 19:00:35.192	2025-11-11 19:00:35.225221	2025-11-11 19:00:35.225221
a947f367-a926-41ca-9f18-0e1f1b4d6edc	LOCALIZA -BAURU - CENTRO - 16.670.085/0493-24	9820373	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820373	2025-11-11 19:00:35.254	2025-11-11 19:00:35.285659	2025-11-11 19:00:35.285659
d8da1c6e-b513-4c5b-a5a8-cbfd76eb4b28	LOCALIZA -PIRACICABA - MORUMBI - 16.670.085/0478-95	9820374	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820374	2025-11-11 19:00:35.314	2025-11-11 19:00:35.345666	2025-11-11 19:00:35.345666
85bcd8de-10c2-4434-bccd-fab6a0c35b36	LOCALIZA -CAMPINAS - NOVA CAMPINAS - 16.670.085/0615-37	9820375	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820375	2025-11-11 19:00:35.374	2025-11-11 19:00:35.406036	2025-11-11 19:00:35.406036
6d640f74-dc43-4217-b762-f6bbda1e971f	LOCALIZA -SAO PAULO - LIMAO - 16.670.085/0466-51	9820376	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820376	2025-11-11 19:00:35.434	2025-11-11 19:00:35.466104	2025-11-11 19:00:35.466104
43644dcd-d3fd-4903-956b-d40fdac6f23c	LOCALIZA -SANTOS - GONZAGA - 16.670.085/0652-81	9820377	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820377	2025-11-11 19:00:35.494	2025-11-11 19:00:35.52692	2025-11-11 19:00:35.52692
619031f9-309b-4e23-8659-7645aab33ed2	LOCALIZA -MARILIA - FRAGATA - 16.670.085/0711-76	9820378	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820378	2025-11-11 19:00:35.555	2025-11-11 19:00:35.587379	2025-11-11 19:00:35.587379
9f0d0b2d-3ccb-4dcd-bc3c-fd3140982223	LOCALIZA -SAO PAULO - VILA MARIETA - 16.670.085/0704-47	9820379	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820379	2025-11-11 19:00:35.616	2025-11-11 19:00:35.648171	2025-11-11 19:00:35.648171
eed77d6e-dae1-4f77-b61c-a70243c75cf2	LOCALIZA -ARARAQUARA - CENTRO - 16.670.085/0771-07	9820382	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820382	2025-11-11 19:00:35.677	2025-11-11 19:00:35.709385	2025-11-11 19:00:35.709385
88ec2d84-ad8f-4257-ab6c-59db6dcb4008	LOCALIZA -JUNDIAI - PONTE DE CAMPINAS - 16.670.085/0783-40	9820383	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820383	2025-11-11 19:00:35.737	2025-11-11 19:00:35.769716	2025-11-11 19:00:35.769716
d62ba29b-750b-4e12-b0b8-ae049913d4d3	LOCALIZA -AMERICANA - VILA ISRAEL - 16.670.085/0796-65	9820384	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820384	2025-11-11 19:00:35.798	2025-11-11 19:00:35.830098	2025-11-11 19:00:35.830098
d158adf2-c3d4-44bd-a652-5371141c789a	LOCALIZA -SAO PAULO - VILA GUILHERME - 16.670.085/0801-67	9820385	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820385	2025-11-11 19:00:35.858	2025-11-11 19:00:35.8909	2025-11-11 19:00:35.8909
df3abbb7-a314-42ba-bc88-de0342d5ca39	LOCALIZA -TAUBATE - BARRANCO - 16.670.085/0603-01	9820386	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820386	2025-11-11 19:00:35.919	2025-11-11 19:00:35.950913	2025-11-11 19:00:35.950913
9ec1f932-e957-438b-8f5f-b3a3f320ba87	LOCALIZA -INDAIATUBA - VILA HOMERO - 16.670.085/0833-44	9820387	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820387	2025-11-11 19:00:35.979	2025-11-11 19:00:36.010294	2025-11-11 19:00:36.010294
079c4feb-d9cf-4178-904b-0115467282f4	LOCALIZA -SAO PAULO - JARDIM TRES MARIAS - 16.670.085/0830-00	9820388	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820388	2025-11-11 19:00:36.038	2025-11-11 19:00:36.069126	2025-11-11 19:00:36.069126
365fa29e-e07c-4757-81c2-b48661efb598	LOCALIZA -PRAIA GRANDE - SITIO DO CAMPO - 16.670.085/0821-00	9820389	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820389	2025-11-11 19:00:36.097	2025-11-11 19:00:36.129463	2025-11-11 19:00:36.129463
992c1998-f38b-4524-bccf-fecd7eb37723	LOCALIZA -SAO JOSE DO RIO PRETO - VILA ANCHIETA - 16.670.085/0853-98	9820390	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820390	2025-11-11 19:00:36.157	2025-11-11 19:00:36.189546	2025-11-11 19:00:36.189546
f777f9b4-a44f-45d2-a097-60b4f6d47521	LOCALIZA -RIBEIRAO PRETO - RIBEIRANIA - 16.670.085/0844-05	9820391	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820391	2025-11-11 19:00:36.218	2025-11-11 19:00:36.249827	2025-11-11 19:00:36.249827
92c2080a-29d6-4728-9261-9efdf2401f02	LOCALIZA -SAO CAETANO DO SUL - SANTO ANTONIO - 16.670.085/0899-70	9820392	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820392	2025-11-11 19:00:36.278	2025-11-11 19:00:36.309811	2025-11-11 19:00:36.309811
23d4929c-ac21-4825-9c57-facbd2e3db74	LOCALIZA -LIMEIRA - JARDIM NEREIDE - 16.670.085/0837-78	9820393	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820393	2025-11-11 19:00:36.338	2025-11-11 19:00:36.369947	2025-11-11 19:00:36.369947
1bf2041d-27f6-4f1e-b6ef-33394b57a875	LOCALIZA -CAMPINAS - JARDIM DO LAGO - 16.670.085/0923-35	9820394	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820394	2025-11-11 19:00:36.398	2025-11-11 19:00:36.430676	2025-11-11 19:00:36.430676
ff067d81-6614-46e7-88d1-2a3d53111709	LOCALIZA -ARACATUBA - JARDIM NOVA YORQUE - 16.670.085/0894-66	9820395	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820395	2025-11-11 19:00:36.459	2025-11-11 19:00:36.490921	2025-11-11 19:00:36.490921
3e28b46a-73b7-440b-87ed-dde31c26d001	LOCALIZA -SAO CARLOS - RECREIO SAO JUDAS TADEU - 16.670.085/0865-21	9820396	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820396	2025-11-11 19:00:36.519	2025-11-11 19:00:36.551499	2025-11-11 19:00:36.551499
71e80869-3fff-42e5-b247-c16578136e30	LOCALIZA -PRESIDENTE PRUDENTE - VILA SANTA HELENA - 16.670.085/0898-90	9820397	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820397	2025-11-11 19:00:36.58	2025-11-11 19:00:36.611762	2025-11-11 19:00:36.611762
b013b772-e75d-4adf-8a9d-0672eefd36f0	LOCALIZA -JUNDIAI - RETIRO - 16.670.085/0714-19	9820398	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820398	2025-11-11 19:00:36.64	2025-11-11 19:00:36.671759	2025-11-11 19:00:36.671759
af7a5448-352e-4424-83e8-6a20b1bfd7b7	LOCALIZA -VINHEDO - CASA VERDE - 16.670.085/0710-95	9820399	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820399	2025-11-11 19:00:36.7	2025-11-11 19:00:36.732695	2025-11-11 19:00:36.732695
d198da2c-837b-4323-97c3-4e7ff989231f	LOCALIZA -ITATIBA - JARDIM DA LUZ - 16.670.085/0542-47	9820400	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820400	2025-11-11 19:00:36.761	2025-11-11 19:00:36.792933	2025-11-11 19:00:36.792933
3a9c0d58-ecd1-40a6-a60f-38ad4e5d032a	LOCALIZA -JAGUARIUNA - ROSEIRA DE BAIXO - 16.670.085/0171-20	9820401	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820401	2025-11-11 19:00:36.821	2025-11-11 19:00:36.853539	2025-11-11 19:00:36.853539
5f0d644b-b868-41f8-8693-89ab63246219	LOCALIZA -JUNDIAI - PONTE DE CAMPINAS - 16.670.085/0118-66	9820402	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820402	2025-11-11 19:00:36.882	2025-11-11 19:00:36.91394	2025-11-11 19:00:36.91394
de333f19-90b7-43ed-b860-808351ec3fbe	LOCALIZA -PAULINIA - MORUMBI - 16.670.085/0465-70	9820403	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820403	2025-11-11 19:00:36.942	2025-11-11 19:00:36.974276	2025-11-11 19:00:36.974276
fdefe7f5-7937-442e-888e-06ad60f33786	LOCALIZA -VALINHOS - VILA BISSOTO - 16.670.085/0497-58	9820404	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820404	2025-11-11 19:00:37.002	2025-11-11 19:00:37.034638	2025-11-11 19:00:37.034638
e5461b06-c1e9-47f5-a012-5413e39a98a5	LOCALIZA -VINHEDO - DISTRITO INDUSTRIAL - 16.670.085/0634-08	9820405	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820405	2025-11-11 19:00:37.063	2025-11-11 19:00:37.094889	2025-11-11 19:00:37.094889
a3674409-7e53-4385-b889-9ca873a89874	LOCALIZA -AMERICANA - CIDADE JARDIM I - 16.670.085/0206-95	9820406	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820406	2025-11-11 19:00:37.123	2025-11-11 19:00:37.154971	2025-11-11 19:00:37.154971
af48b803-dd70-4c44-8a66-eb02d0b690c5	LOCALIZA -LIMEIRA - VILA SAO JOAO - 16.670.085/0305-77	9820407	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820407	2025-11-11 19:00:37.183	2025-11-11 19:00:37.215603	2025-11-11 19:00:37.215603
9c001b10-4ddd-4e98-8834-4973c3245463	LOCALIZA -PIRACICABA - SAO DIMAS - 16.670.085/0204-23	9820408	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820408	2025-11-11 19:00:37.244	2025-11-11 19:00:37.275914	2025-11-11 19:00:37.275914
0009634d-beba-471e-8ff8-2a8f0748cbe7	LOCALIZA -RIO CLARO - CENTRO - 16.670.085/0306-58	9820409	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820409	2025-11-11 19:00:37.304	2025-11-11 19:00:37.336706	2025-11-11 19:00:37.336706
20d864f2-9fba-4b0e-84a7-e4bd25ee634a	LOCALIZA -SUMARE - CENTRO - 16.670.085/0496-77	9820410	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820410	2025-11-11 19:00:37.365	2025-11-11 19:00:37.397031	2025-11-11 19:00:37.397031
8da5c554-be28-48e7-9c48-635f0e0db75f	LOCALIZA -HORTOLANDIA - PARQUE RESIDENCIAL JOAO LUIZ - 16.670.085/0269-79	9820411	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820411	2025-11-11 19:00:37.425	2025-11-11 19:00:37.457148	2025-11-11 19:00:37.457148
9afdd0d1-4f6a-4278-ba15-3842803ecb69	LOCALIZA -ITAPEVA - JARDIM DONA MIRIAM - 16.670.085/0639-04	9820412	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820412	2025-11-11 19:00:37.485	2025-11-11 19:00:37.517633	2025-11-11 19:00:37.517633
4e3360a5-abd4-42a7-a98c-66c96a5e30c7	LOCALIZA -SAO CAETANO DO SUL - SANTA PAULA - 16.670.085/0101-18	9820413	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820413	2025-11-11 19:00:37.546	2025-11-11 19:00:37.577768	2025-11-11 19:00:37.577768
412a4b3d-7022-4360-881c-bc6369d9b9b9	LOCALIZA -SANTO ANDRE - BANGU - 16.670.085/0688-92	9820414	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820414	2025-11-11 19:00:37.606	2025-11-11 19:00:37.638452	2025-11-11 19:00:37.638452
42139d4f-099b-4270-84ce-61b2a80ba024	LOCALIZA -SANTO ANDRE - VILA HOMERO THON - 16.670.085/0683-88	9820415	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820415	2025-11-11 19:00:37.666	2025-11-11 19:00:37.69894	2025-11-11 19:00:37.69894
40184966-040b-43fd-bf9c-62e90402d9a2	LOCALIZA -RIBEIRAO PIRES - JARDIM AMELIA - 16.670.085/0225-58	9820416	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820416	2025-11-11 19:00:37.727	2025-11-11 19:00:37.759048	2025-11-11 19:00:37.759048
d01790e4-dd32-4ea1-8f28-aeb131203ff6	LOCALIZA -SANTO ANDRE - JARDIM - 16.670.085/0182-83	9820417	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820417	2025-11-11 19:00:37.787	2025-11-11 19:00:37.821235	2025-11-11 19:00:37.821235
ce36b2a7-0d50-4ca1-a79d-5cf0bf1e394c	LOCALIZA -SAO SEBASTIAO - PORTO GRANDE - 16.670.085/0174-73	9820418	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820418	2025-11-11 19:00:37.85	2025-11-11 19:00:37.881815	2025-11-11 19:00:37.881815
bf06f136-68bc-41d1-b078-8680e6bb9b7f	LOCALIZA -SAO PAULO - CASA VERDE - 16.670.085/0686-20	9820419	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820419	2025-11-11 19:00:37.91	2025-11-11 19:00:37.941846	2025-11-11 19:00:37.941846
b103ecd7-db47-4955-b78d-acb292724468	LOCALIZA -SAO PAULO - VILA GUILHERME - 16.670.085/0716-80	9820420	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820420	2025-11-11 19:00:37.972	2025-11-11 19:00:38.003915	2025-11-11 19:00:38.003915
49e42cd0-675d-44a2-a71f-a8dceaecf779	LOCALIZA -SAO PAULO - CANINDE - 16.670.085/0762-16	9820421	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820421	2025-11-11 19:00:38.032	2025-11-11 19:00:38.063131	2025-11-11 19:00:38.063131
d7c911c2-6e69-44f1-96d2-77825959a13c	LOCALIZA -SAO PAULO - SANTANA - 16.670.085/0185-26	9820422	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820422	2025-11-11 19:00:38.091	2025-11-11 19:00:38.123242	2025-11-11 19:00:38.123242
5ab5ffb1-053c-4f02-b2ae-cc11ff34b9fd	LOCALIZA -SAO PAULO - AEROPORTO - 16.670.085/0015-50	9820423	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820423	2025-11-11 19:00:38.151	2025-11-11 19:00:38.183594	2025-11-11 19:00:38.183594
44449c4c-fc7b-438c-8fd5-8c69a4406e32	LOCALIZA -SAO PAULO - CAMPO BELO - 16.670.085/0097-05	9820424	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820424	2025-11-11 19:00:38.211	2025-11-11 19:00:38.243654	2025-11-11 19:00:38.243654
8363044f-ac25-4869-a75e-f9f71112b0ad	LOCALIZA -LEME - CENTRO - 16.670.085/0503-30	9820425	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820425	2025-11-11 19:00:38.272	2025-11-11 19:00:38.306092	2025-11-11 19:00:38.306092
d39053ca-26d0-41d2-9a99-4d8657d94e44	LOCALIZA -ARARAS - JARDIM BELVEDERE - 16.670.085/0304-96	9820426	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820426	2025-11-11 19:00:38.334	2025-11-11 19:00:38.366664	2025-11-11 19:00:38.366664
ea75bcb0-cb96-4a61-98ba-c32fc9bdfddc	LOCALIZA -BAURU - RIO VERDE - 16.670.085/0152-68	9820427	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820427	2025-11-11 19:00:38.394	2025-11-11 19:00:38.426652	2025-11-11 19:00:38.426652
f8323af8-22bd-4b05-b06f-53554c31303c	LOCALIZA -MARILIA - JARDIM MARIA ISABEL - 16.670.085/0151-87	9820428	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820428	2025-11-11 19:00:38.455	2025-11-11 19:00:38.486766	2025-11-11 19:00:38.486766
f2292aed-e0c5-462e-91dc-8bc985e5c34f	LOCALIZA -AVARE - CENTRO - 16.670.085/0524-65	9820429	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820429	2025-11-11 19:00:38.515	2025-11-11 19:00:38.546841	2025-11-11 19:00:38.546841
854bb880-bc0e-4033-af4b-398dc9351c3f	LOCALIZA -BAURU - VILA NOVA CIDADE UNIVERSITARIA - 16.670.085/0165-82	9820430	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820430	2025-11-11 19:00:38.575	2025-11-11 19:00:38.607136	2025-11-11 19:00:38.607136
e81d9b3c-f67f-4c78-83d9-3c6a6af29f6a	LOCALIZA -JAU - JARDIM ESTADIO - 16.670.085/0191-74	9820431	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820431	2025-11-11 19:00:38.635	2025-11-11 19:00:38.667373	2025-11-11 19:00:38.667373
672d642c-8428-4201-a542-c703e0e887a7	LOCALIZA -LINS - VILA PERIN - 16.670.085/0609-99	9820432	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820432	2025-11-11 19:00:38.695	2025-11-11 19:00:38.727525	2025-11-11 19:00:38.727525
a1477160-8c01-4ced-8b21-4f6f9f5ffa20	LOCALIZA -LENCOIS PAULISTA - VILA ANTONIETA II - 16.670.085/0648-03	9820433	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820433	2025-11-11 19:00:38.755	2025-11-11 19:00:38.787914	2025-11-11 19:00:38.787914
f2a0a968-9a86-478c-90f7-36032647188d	LOCALIZA -MARILIA - JARDIM JEQUITIBA - 16.670.085/0147-09	9820434	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820434	2025-11-11 19:00:38.816	2025-11-11 19:00:38.848194	2025-11-11 19:00:38.848194
17ab975e-b9d4-4ec9-ae27-b37ad7eb46e1	LOCALIZA -OURINHOS - NOVA OURINHOS - 16.670.085/0513-02	9820435	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820435	2025-11-11 19:00:38.876	2025-11-11 19:00:38.908727	2025-11-11 19:00:38.908727
faaef671-e776-4522-9aed-003d22f022fc	LOCALIZA -ARACATUBA - AEROPORTO - 16.670.085/0782-60	9820436	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820436	2025-11-11 19:00:38.937	2025-11-11 19:00:38.968174	2025-11-11 19:00:38.968174
5e12865f-7421-4689-9111-91155a7a87cc	LOCALIZA -PRESIDENTE PRUDENTE - AEROPORTO - 16.670.085/0223-96	9820437	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820437	2025-11-11 19:00:38.996	2025-11-11 19:00:39.027054	2025-11-11 19:00:39.027054
a8b92992-8dbd-4f42-84bf-41bd4c6086c6	LOCALIZA -ARACATUBA - CENTRO - 16.670.085/0774-50	9820438	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820438	2025-11-11 19:00:39.055	2025-11-11 19:00:39.087452	2025-11-11 19:00:39.087452
b6414620-5ec6-411c-a5b3-8c06d66bead0	LOCALIZA -BIRIGUI - NOVO JARDIM STABILE - 16.670.085/0775-30	9820439	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820439	2025-11-11 19:00:39.116	2025-11-11 19:00:39.147845	2025-11-11 19:00:39.147845
d8d651bc-179d-413f-b150-d065f57bf5f8	LOCALIZA -FERNANDOPOLIS - JARDIM SANTA HELENA - 16.670.085/0872-50	9820440	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820440	2025-11-11 19:00:39.178	2025-11-11 19:00:39.211161	2025-11-11 19:00:39.211161
02823303-f9cb-4eee-87e9-b03b663ce154	LOCALIZA -JALES - PARQUE INDUSTRIAL II - 16.670.085/0856-30	9820441	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820441	2025-11-11 19:00:39.239	2025-11-11 19:00:39.271296	2025-11-11 19:00:39.271296
b1556c53-ac06-4af5-9e4a-adcd1699a607	LOCALIZA -PRESIDENTE PRUDENTE - SANTA HELENA - 16.670.085/0320-06	9820442	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820442	2025-11-11 19:00:39.299	2025-11-11 19:00:39.331351	2025-11-11 19:00:39.331351
80324df1-98be-4220-8e15-80076567e7c7	LOCALIZA -CACAPAVA - CENTRO - 16.670.085/0529-70	9820443	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820443	2025-11-11 19:00:39.359	2025-11-11 19:00:39.391493	2025-11-11 19:00:39.391493
e2d77b48-cdab-41d2-8b0a-d94928070244	LOCALIZA -CAMPOS DO JORDAO - JAGUARIBE - 16.670.085/0231-04	9820444	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820444	2025-11-11 19:00:39.419	2025-11-11 19:00:39.451699	2025-11-11 19:00:39.451699
fc53e109-4938-47d1-9dc5-dbdcb3863d86	LOCALIZA -CRUZEIRO - VILA ANA ROSA NOVAES - 16.670.085/0701-02	9820445	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820445	2025-11-11 19:00:39.489	2025-11-11 19:00:39.521542	2025-11-11 19:00:39.521542
ad05148f-d8aa-4774-ab28-e0360fa0eacc	LOCALIZA -GUARATINGUETA - CAMPO DO GALVAO - 16.670.085/0365-08	9820446	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820446	2025-11-11 19:00:39.549	2025-11-11 19:00:39.58154	2025-11-11 19:00:39.58154
c2bfba9e-a811-4618-9314-2af0971f446c	LOCALIZA -JACAREI - VILA PINHEIRO - 16.670.085/0709-51	9820447	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820447	2025-11-11 19:00:39.61	2025-11-11 19:00:39.641912	2025-11-11 19:00:39.641912
c5c82be2-8159-40c6-a15d-49ea57178abf	LOCALIZA -PINDAMONHANGABA - RESID. E COMERCIAL VILA VERDE - 16.670.085/0528-99	9820448	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820448	2025-11-11 19:00:39.67	2025-11-11 19:00:39.701161	2025-11-11 19:00:39.701161
982f8d27-81d2-47be-8cbc-ab77f2383c71	LOCALIZA -SAO JOSE DOS CAMPOS - JARDIM SERIMBURA - 16.670.085/0142-96	9820451	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820451	2025-11-11 19:00:39.731	2025-11-11 19:00:39.763178	2025-11-11 19:00:39.763178
fe5c8af8-a5a3-4328-9e27-7fb22cd5ffcf	LOCALIZA -TAUBATE - PARQUE SENHOR DO BONFIM - 16.670.085/0718-42	9820452	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820452	2025-11-11 19:00:39.794	2025-11-11 19:00:39.82588	2025-11-11 19:00:39.82588
5b3ec8d4-3880-4c4e-a6ee-eb8e45f6959b	LOCALIZA -SAO JOSE DOS CAMPOS - PARQUE MARTIN CERERE - 16.670.085/0148-81	9820453	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820453	2025-11-11 19:00:39.854	2025-11-11 19:00:39.886153	2025-11-11 19:00:39.886153
a916dbf8-ab28-46ef-a0c9-7718b2e7141e	LOCALIZA -BATATAIS - CENTRO - 16.670.085/0569-67	9820454	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820454	2025-11-11 19:00:39.915	2025-11-11 19:00:39.947485	2025-11-11 19:00:39.947485
af21d3c1-9d43-4154-8bc5-da01217da5d6	LOCALIZA -FRANCA - PARQUE PROGRESSO - 16.670.085/0571-81	9820455	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820455	2025-11-11 19:00:39.975	2025-11-11 19:00:40.007395	2025-11-11 19:00:40.007395
db978d25-b002-4ec6-bfa2-b8a5fc265485	LOCALIZA -RIBEIRAO PRETO - SANTA CRUZ DO JOSE JACQUES - 16.670.085/0843-16	9820456	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820456	2025-11-11 19:00:40.036	2025-11-11 19:00:40.067284	2025-11-11 19:00:40.067284
85f13770-60fe-4c0f-bddb-75b8caf1ee53	LOCALIZA -SERTAOZINHO - CHACARAS RECREIO PLANALTO - 16.670.085/0852-07	9820457	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820457	2025-11-11 19:00:40.095	2025-11-11 19:00:40.127602	2025-11-11 19:00:40.127602
6e5c2337-94cf-43f5-a663-53cc9f6b82de	LOCALIZA -SAO JOAQUIM DA BARRA - CENTRO - 16.670.085/0570-09	9820458	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820458	2025-11-11 19:00:40.155	2025-11-11 19:00:40.187897	2025-11-11 19:00:40.187897
f007b664-7587-4603-9f0e-d07c72ec5dd7	LOCALIZA -SAO PAULO - VILA ANDRADE - 16.670.085/0685-40	9820459	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820459	2025-11-11 19:00:40.216	2025-11-11 19:00:40.248079	2025-11-11 19:00:40.248079
400af45d-2cf4-4bc6-88c0-53ecf249ff00	LOCALIZA -SAO PAULO - INTERLAGOS - 16.670.085/0680-35	9820460	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820460	2025-11-11 19:00:40.277	2025-11-11 19:00:40.309876	2025-11-11 19:00:40.309876
e96c753c-846a-494c-bee3-c4b5919e8090	LOCALIZA -SAO PAULO - VILA GERTRUDES - 16.670.085/0338-35	9820461	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820461	2025-11-11 19:00:40.338	2025-11-11 19:00:40.370074	2025-11-11 19:00:40.370074
5435f97b-ff00-4d5e-ac5c-492ddcd9c078	LOCALIZA -SAO PAULO - SANTO AMARO - 16.670.085/0684-69	9820462	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820462	2025-11-11 19:00:40.398	2025-11-11 19:00:40.429926	2025-11-11 19:00:40.429926
f207238d-670b-4825-bc58-bba63884a181	LOCALIZA -SAO PAULO - SANTO AMARO - 16.670.085/0445-27	9820463	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820463	2025-11-11 19:00:40.458	2025-11-11 19:00:40.490414	2025-11-11 19:00:40.490414
1757a589-309d-47f5-bab0-212c0332e4d0	LOCALIZA -SAO PAULO - VILA ALMEIDA - 16.670.085/0425-83	9820464	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820464	2025-11-11 19:00:40.518	2025-11-11 19:00:40.550545	2025-11-11 19:00:40.550545
5a469dcb-c950-47a7-98da-7e9874250c54	LOCALIZA -CARAGUATATUBA - INDAIA - 16.670.085/0175-54	9820465	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820465	2025-11-11 19:00:40.578	2025-11-11 19:00:40.610694	2025-11-11 19:00:40.610694
dc369715-4a29-4973-862a-b2c9ad5ca39e	LOCALIZA -SAO PAULO - AGUA BRANCA - 16.670.085/0278-60	9820466	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820466	2025-11-11 19:00:40.639	2025-11-11 19:00:40.67109	2025-11-11 19:00:40.67109
589a29f8-56a1-40c4-aa91-fb67f2de8149	LOCALIZA -GUARULHOS - CUMBICAS - 16.670.085/0042-23	9820467	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820467	2025-11-11 19:00:40.7	2025-11-11 19:00:40.732152	2025-11-11 19:00:40.732152
57648b6e-217f-4f0a-a6d7-3fbe2be360a1	LOCALIZA -GUARULHOS - CUMBICA - 16.670.085/0089-97	9820468	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820468	2025-11-11 19:00:40.761	2025-11-11 19:00:40.793592	2025-11-11 19:00:40.793592
1665fe9c-4a4a-4e33-ae4c-3843116c1bac	LOCALIZA -GUARULHOS - AEROPORTO - 16.670.085/0579-39	9820469	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820469	2025-11-11 19:00:40.822	2025-11-11 19:00:40.853837	2025-11-11 19:00:40.853837
67efedcc-aa2e-4ab5-9bec-ce41d4195e98	LOCALIZA -GUARULHOS - MACEDO - 16.670.085/0690-07	9820470	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820470	2025-11-11 19:00:40.882	2025-11-11 19:00:40.913996	2025-11-11 19:00:40.913996
61ddedc8-ef86-4028-a019-4256b00e35ed	LOCALIZA -GUARULHOS - AEROPORTO - 16.670.085/0287-50	9820471	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820471	2025-11-11 19:00:40.942	2025-11-11 19:00:40.974388	2025-11-11 19:00:40.974388
ab81f645-96b5-4579-875e-8ccbb90c6549	LOCALIZA -SAO CARLOS - CENTRO - 16.670.085/0205-04	9820472	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820472	2025-11-11 19:00:41.003	2025-11-11 19:00:41.034888	2025-11-11 19:00:41.034888
a8ab8b0c-1253-4944-900d-497665448f66	LOCALIZA -SAO JOSE DO RIO PRETO - JARDIM NOVO AEROPORTO - 16.670.085/0849-01	9820473	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820473	2025-11-11 19:00:41.063	2025-11-11 19:00:41.095631	2025-11-11 19:00:41.095631
527eef89-95da-4b31-99d2-5018d0cdd81a	LOCALIZA -BEBEDOURO - JARDIM LUCIANA - 16.670.085/0207-76	9820474	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820474	2025-11-11 19:00:41.124	2025-11-11 19:00:41.155642	2025-11-11 19:00:41.155642
b1b0b13f-639b-4835-9fbd-67573e056b2c	LOCALIZA -CATANDUVA - CENTRO - 16.670.085/0840-73	9820475	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820475	2025-11-11 19:00:41.184	2025-11-11 19:00:41.215608	2025-11-11 19:00:41.215608
f13810c1-8c89-4e70-8990-3eb5cf9ddd0f	LOCALIZA -JABOTICABAL - BARRA FUNDA - 16.670.085/0624-28	9820476	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820476	2025-11-11 19:00:41.244	2025-11-11 19:00:41.275946	2025-11-11 19:00:41.275946
bc3e76db-2d26-40a2-88d8-d6bcf5461f01	LOCALIZA -SAO JOSE DO RIO PRETO - UNIVERSITARIO - 16.670.085/0847-40	9820477	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820477	2025-11-11 19:00:41.304	2025-11-11 19:00:41.33623	2025-11-11 19:00:41.33623
c1c7a7df-0541-4e0d-873d-0c395d74a8d0	LOCALIZA -ARARAQUARA - VILA ORIENTE - 16.670.085/0212-33	9820478	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820478	2025-11-11 19:00:41.364	2025-11-11 19:00:41.396399	2025-11-11 19:00:41.396399
48938e34-9c04-4b64-a396-8bc92f2dde40	LOCALIZA -MATAO - VILA SANTA CRUZ - 16.670.085/0625-09	9820479	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820479	2025-11-11 19:00:41.424	2025-11-11 19:00:41.456385	2025-11-11 19:00:41.456385
26f6ce2d-2ce6-47b0-9162-f0d769e5a432	LOCALIZA -AMPARO - FIGUEIRA - 16.670.085/0247-63	9820480	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820480	2025-11-11 19:00:41.486	2025-11-11 19:00:41.518007	2025-11-11 19:00:41.518007
73f4be11-1815-4768-bace-c693c04d69f8	LOCALIZA -CAMPINAS - CAMBUI - 16.670.085/0869-55	9820481	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820481	2025-11-11 19:00:41.546	2025-11-11 19:00:41.578312	2025-11-11 19:00:41.578312
425232ad-81b9-4deb-8097-6398045c45d4	LOCALIZA -CAMPINAS - FAZENDA SANTANA (SOUSAS) - 16.670.085/0717-61	9820482	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820482	2025-11-11 19:00:41.606	2025-11-11 19:00:41.638482	2025-11-11 19:00:41.638482
d6e0ec84-c50d-4d78-a70f-4200e3b8a0d1	LOCALIZA -CAMPINAS - JARDIM DO TREVO - 16.670.085/0087-25	9820483	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820483	2025-11-11 19:00:41.692	2025-11-11 19:00:41.723778	2025-11-11 19:00:41.723778
ad12e034-259c-4c3e-8616-24f812f24e2f	LOCALIZA -HORTOLANDIA - CHACARAS ASSAY - 16.670.085/0870-99	9820484	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820484	2025-11-11 19:00:41.753	2025-11-11 19:00:41.785324	2025-11-11 19:00:41.785324
777caea7-8773-4f6a-8db9-ca2373a23e06	LOCALIZA -CAMPINAS - PARQUE DOM PEDRO SHOPPING - 16.670.085/0190-93	9820485	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820485	2025-11-11 19:00:41.813	2025-11-11 19:00:41.845541	2025-11-11 19:00:41.845541
d5a52860-f834-4bab-a738-e753dc7d1fd5	LOCALIZA -OSASCO - VILA YARA - 16.670.085/0712-57	9820486	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820486	2025-11-11 19:00:41.874	2025-11-11 19:00:41.906352	2025-11-11 19:00:41.906352
6bd137d0-b1bd-4ae0-b890-2b6f8b308ba4	LOCALIZA -SAO PAULO - VILA LAGEADO - 16.670.085/0764-88	9820487	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820487	2025-11-11 19:00:41.934	2025-11-11 19:00:41.966786	2025-11-11 19:00:41.966786
dd54a355-4554-48fd-932c-51cb357da5b2	LOCALIZA -COTIA - MOINHO VELHO - 16.670.085/0224-77	9820488	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820488	2025-11-11 19:00:41.995	2025-11-11 19:00:42.027342	2025-11-11 19:00:42.027342
b5fd100d-7d63-4a0b-bc95-f93de73ca380	LOCALIZA -OSASCO - CENTRO - 16.670.085/0715-08	9820489	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820489	2025-11-11 19:00:42.056	2025-11-11 19:00:42.087861	2025-11-11 19:00:42.087861
e6a19d76-13f9-408d-b46d-03abaa964bd2	LOCALIZA -TABOAO DA SERRA - CIDADE INTERCAP - 16.670.085/0226-39	9820490	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820490	2025-11-11 19:00:42.116	2025-11-11 19:00:42.149124	2025-11-11 19:00:42.149124
31e73a3e-cb8b-42d7-a6fb-1e485be5007d	LOCALIZA -CAMPINAS - JD PRINCESA D OESTE - 16.670.085/0094-54	9820491	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820491	2025-11-11 19:00:42.177	2025-11-11 19:00:42.209523	2025-11-11 19:00:42.209523
52b2ad6b-af52-4586-8e44-b9d078e679e8	LOCALIZA -CAMPINAS - POLO II DE ALTA TECNOLOGIA CAMPINAS - 16.670.085/0622-66	9820492	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820492	2025-11-11 19:00:42.238	2025-11-11 19:00:42.270002	2025-11-11 19:00:42.270002
2323638b-04ad-439e-b027-03e9e4dbd8fb	LOCALIZA -CAMPINAS - JARDIM DO LAGO - 16.670.085/0778-83	9820493	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820493	2025-11-11 19:00:42.298	2025-11-11 19:00:42.332689	2025-11-11 19:00:42.332689
4448d7ef-215f-4d2f-b10e-28e11dbf7052	LOCALIZA -MOGI GUACU - CENTRO - 16.670.085/0168-25	9820494	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820494	2025-11-11 19:00:42.361	2025-11-11 19:00:42.392765	2025-11-11 19:00:42.392765
807ad2e5-52d5-4c5d-ac0a-c7e5a4fed253	LOCALIZA -CAMPINAS - CAMBUI - 16.670.085/0153-49	9820495	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820495	2025-11-11 19:00:42.421	2025-11-11 19:00:42.453262	2025-11-11 19:00:42.453262
e2aef2dc-3ecf-429c-8170-365360188792	LOCALIZA -ADAMANTINA - JARDIM LUCILA - 16.670.085/0744-34	9820496	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820496	2025-11-11 19:00:42.481	2025-11-11 19:00:42.51382	2025-11-11 19:00:42.51382
780fb8da-ce49-4a7e-8e42-2f486cc7e866	LOCALIZA -ITAPETININGA - CENTRO - 16.670.085/0647-14	9820497	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820497	2025-11-11 19:00:42.543	2025-11-11 19:00:42.575481	2025-11-11 19:00:42.575481
6685ab29-ba3b-4971-bf78-bdced9cb6306	LOCALIZA -ATIBAIA - ALVINOPOLIS - 16.670.085/0245-00	9820498	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820498	2025-11-11 19:00:42.603	2025-11-11 19:00:42.63547	2025-11-11 19:00:42.63547
7c5265ee-65ab-4d1a-b1a8-ba70fdded215	LOCALIZA -BRAGANCA PAULISTA - CENTRO - 16.670.085/0246-82	9820499	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820499	2025-11-11 19:00:42.663	2025-11-11 19:00:42.69554	2025-11-11 19:00:42.69554
a95be6bd-4b33-47f8-9895-f95b2bf51295	LOCALIZA -MAUA - VILA BOCAINA - 16.670.085/0232-87	9820500	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820500	2025-11-11 19:00:42.723	2025-11-11 19:00:42.755517	2025-11-11 19:00:42.755517
f8d08ee7-8a89-4c05-b9f3-6d754ec01198	LOCALIZA -SUZANO - VILA FIGUEIRA - 16.670.085/0484-33	9820501	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820501	2025-11-11 19:00:42.785	2025-11-11 19:00:42.817509	2025-11-11 19:00:42.817509
5f754637-5b44-4221-9b5d-b2ba183e2bbe	LOCALIZA -DIADEMA - CENTRO - 16.670.085/0763-05	9820503	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820503	2025-11-11 19:00:42.846	2025-11-11 19:00:42.877862	2025-11-11 19:00:42.877862
0fb88d5f-0289-41f1-b2a4-abc465614296	LOCALIZA -SAO BERNARDO DO CAMPO - CENTRO - 16.670.085/0765-69	9820504	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820504	2025-11-11 19:00:42.906	2025-11-11 19:00:42.938487	2025-11-11 19:00:42.938487
7a28b837-f94d-479d-b687-566ff661655e	LOCALIZA -SAO PAULO - SAUDE - 16.670.085/0487-86	9820505	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820505	2025-11-11 19:00:42.966	2025-11-11 19:00:42.998956	2025-11-11 19:00:42.998956
d724eeeb-8d22-4fc8-94aa-0df56a2a3f0d	LOCALIZA -SAO BERNARDO DO CAMPO - CENTRO - 16.670.085/0215-86	9820506	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820506	2025-11-11 19:00:43.027	2025-11-11 19:00:43.059455	2025-11-11 19:00:43.059455
4577b8bb-6cbe-431f-994a-e0ba9f509ceb	LOCALIZA -SAO PAULO - VILA MARIANA - 16.670.085/0798-27	9820507	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820507	2025-11-11 19:00:43.09	2025-11-11 19:00:43.122471	2025-11-11 19:00:43.122471
fc03f33b-1ebe-45d8-b0cb-015874180ef5	LOCALIZA -SAO PAULO - BUTANTA - 16.670.085/0426-64	9820508	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820508	2025-11-11 19:00:43.151	2025-11-11 19:00:43.183094	2025-11-11 19:00:43.183094
f7e3cd6a-f6e5-42b6-a4e4-5396d0877b23	LOCALIZA -SAO PAULO - VILA LEOPOLDINA - 16.670.085/0687-01	9820509	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820509	2025-11-11 19:00:43.211	2025-11-11 19:00:43.243377	2025-11-11 19:00:43.243377
c48f1a7c-64a0-4720-a68e-a0d1030b7dcb	LOCALIZA -SAO PAULO - JARDIM PAULISTANO - 16.670.085/0589-00	9820510	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820510	2025-11-11 19:00:43.271	2025-11-11 19:00:43.3037	2025-11-11 19:00:43.3037
20f42cb3-5af9-4456-aeee-36be2d21ef1d	LOCALIZA -SAO PAULO - INDIANOPOLIS - 16.670.085/0955-12	9820511	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820511	2025-11-11 19:00:43.332	2025-11-11 19:00:43.364588	2025-11-11 19:00:43.364588
72944f43-6255-4863-88a6-8bb1077d68ae	LOCALIZA -SAO PAULO - VILA NOVA - 16.670.085/0160-78	9820512	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820512	2025-11-11 19:00:43.394	2025-11-11 19:00:43.426522	2025-11-11 19:00:43.426522
6e7eb6aa-5055-46c9-ba8a-d79a4dc626fd	LOCALIZA -SAO PAULO - BROOKLIN PAULISTA - 16.670.085/0892-02	9820513	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820513	2025-11-11 19:00:43.454	2025-11-11 19:00:43.486729	2025-11-11 19:00:43.486729
24464546-aac2-4012-8049-c218c3285d59	LOCALIZA -UBATUBA - CENTRO - 16.670.085/0230-15	9820514	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820514	2025-11-11 19:00:43.515	2025-11-11 19:00:43.546789	2025-11-11 19:00:43.546789
cb68eab6-caf2-4ae1-8f71-3e2749af1b47	LOCALIZA -CUBATAO - CENTRO - 16.670.085/0507-64	9820515	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820515	2025-11-11 19:00:43.575	2025-11-11 19:00:43.607241	2025-11-11 19:00:43.607241
d12fae89-4cfb-467a-9cc1-85605d19a3f4	LOCALIZA -GUARUJA - CENTRO - 16.670.085/0315-49	9820516	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820516	2025-11-11 19:00:43.635	2025-11-11 19:00:43.667557	2025-11-11 19:00:43.667557
1eb2862e-970d-4cfb-8093-2cf4e1dcaf85	LOCALIZA -SANTOS - VILA MATHIAS - 16.670.085/0758-30	9820517	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820517	2025-11-11 19:00:43.696	2025-11-11 19:00:43.727856	2025-11-11 19:00:43.727856
bbfa45eb-8567-4bed-b61f-6a459111a5e3	LOCALIZA -ITANHAEM - BALNEARIO SAO JORGE - 16.670.085/0424-00	9820518	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820518	2025-11-11 19:00:43.757	2025-11-11 19:00:43.789645	2025-11-11 19:00:43.789645
2ef75bd3-1ddf-4e93-abf7-c6cd485c0b04	LOCALIZA -PERUIBE - BALNEARIO FLORIDA PERUIBE - 16.670.085/0453-37	9820521	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820521	2025-11-11 19:00:43.818	2025-11-11 19:00:43.84994	2025-11-11 19:00:43.84994
38e47dfb-eec9-4b02-ba2e-d259b130a4dd	LOCALIZA -PRAIA GRANDE - XIXOVA - 16.670.085/0330-88	9820522	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820522	2025-11-11 19:00:43.878	2025-11-11 19:00:43.909133	2025-11-11 19:00:43.909133
62a6f4fd-79bd-4fde-9bc8-b9265d0224ac	LOCALIZA -SANTOS - VILA MATIAS - 16.670.085/0135-67	9820523	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820523	2025-11-11 19:00:43.937	2025-11-11 19:00:43.970199	2025-11-11 19:00:43.970199
48295367-04f3-4420-a524-7908ea99af3c	LOCALIZA -SAO VICENTE - ITARARE - 16.670.085/0459-22	9820524	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820524	2025-11-11 19:00:43.998	2025-11-11 19:00:44.030693	2025-11-11 19:00:44.030693
1de51c19-6b72-4e05-9a95-e7b8dc93a6b3	LOCALIZA -PIRASSUNUNGA - VILA SANTA TEREZINHA - 16.670.085/0502-50	9820525	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820525	2025-11-11 19:00:44.059	2025-11-11 19:00:44.091532	2025-11-11 19:00:44.091532
5cd59d8e-38d4-487a-ad80-ad55018ca7e0	LOCALIZA -SAO PAULO - JARDIM SANTA TEREZINHA (ZONA LESTE) - 16.670.085/0857-11	9820526	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820526	2025-11-11 19:00:44.12	2025-11-11 19:00:44.151661	2025-11-11 19:00:44.151661
da821c32-53b0-44bf-9d69-91d5ca15cdb8	LOCALIZA -GUARULHOS - PORTAL DOS GRAMADOS - 16.670.085/0932-26	9820527	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820527	2025-11-11 19:00:44.18	2025-11-11 19:00:44.212732	2025-11-11 19:00:44.212732
66d2ce5a-d42d-46ba-ba22-a8ec4ec2a2b2	LOCALIZA -SAO PAULO - TATUAPE - 16.670.085/0682-05	9820528	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820528	2025-11-11 19:00:44.241	2025-11-11 19:00:44.276191	2025-11-11 19:00:44.276191
a5241ec7-fc9d-4951-967d-41e263e51e45	LOCALIZA -SAO PAULO - JARDIM AMERICA DA PENHA - 16.670.085/0335-92	9820529	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820529	2025-11-11 19:00:44.304	2025-11-11 19:00:44.336574	2025-11-11 19:00:44.336574
f78ceb56-af74-469d-b69e-7f0f86a647dc	LOCALIZA -SAO PAULO - VILA NORMA - 16.670.085/0659-58	9820530	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820530	2025-11-11 19:00:44.365	2025-11-11 19:00:44.397304	2025-11-11 19:00:44.397304
265575be-9627-4271-9d1a-a949b8fd7663	LOCALIZA -SAO PAULO - TATUAPE - 16.670.085/0257-35	9820531	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820531	2025-11-11 19:00:44.425	2025-11-11 19:00:44.457637	2025-11-11 19:00:44.457637
5fb654cd-7fc0-43d3-967a-5a83eb4825b8	LOCALIZA -SOROCABA - PARQUE CAMPOLIM - 16.670.085/0501-79	9820532	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820532	2025-11-11 19:00:44.486	2025-11-11 19:00:44.517592	2025-11-11 19:00:44.517592
562c68e1-88e6-4376-9fd4-b18f753187f1	LOCALIZA -SOROCABA - VILA CARVALHO - 16.670.085/0689-73	9820533	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820533	2025-11-11 19:00:44.545	2025-11-11 19:00:44.577605	2025-11-11 19:00:44.577605
4612aea2-a3d1-4911-9721-1be8a9a18d14	LOCALIZA -ITU - VILA NOVA - 16.670.085/0540-85	9820534	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820534	2025-11-11 19:00:44.606	2025-11-11 19:00:44.637891	2025-11-11 19:00:44.637891
aaacf809-4421-4ee0-820f-36421158e5bd	LOCALIZA -INDAIATUBA - RECREIO CAMPESTRE - 16.670.085/0149-62	9820535	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820535	2025-11-11 19:00:44.666	2025-11-11 19:00:44.698307	2025-11-11 19:00:44.698307
8d628a65-132d-4973-906d-ab0aec2b5336	LOCALIZA -SOROCABA - JARDIM PELEGRINO - 16.670.085/0098-88	9820536	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820536	2025-11-11 19:00:44.726	2025-11-11 19:00:44.758716	2025-11-11 19:00:44.758716
1804fed7-8837-4125-a6b7-6a9f30ece77e	LOCALIZA -SAO ROQUE - TABOAO - 16.670.085/0818-05	9820537	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820537	2025-11-11 19:00:44.787	2025-11-11 19:00:44.818754	2025-11-11 19:00:44.818754
0e3ddd1b-54a6-4447-ad10-7848ee46f157	LOCALIZA -SALTO - CENTRO - 16.670.085/0539-41	9820538	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820538	2025-11-11 19:00:44.847	2025-11-11 19:00:44.878094	2025-11-11 19:00:44.878094
e0eee687-a961-4a6a-892d-8424da21e122	LOCALIZA -SAO PAULO - VARZEA DA BARRA FUNDA - 16.670.085/0713-38	9820539	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820539	2025-11-11 19:00:44.906	2025-11-11 19:00:44.938803	2025-11-11 19:00:44.938803
7737dffc-34d7-4448-b212-727e6337ebbb	LOCALIZA -SAO PAULO - CERQUEIRA CESAR - 16.670.085/0934-98	9820540	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820540	2025-11-11 19:00:44.967	2025-11-11 19:00:44.999721	2025-11-11 19:00:44.999721
af87d489-6fb1-49ad-bbce-cb0452e69e5a	LOCALIZA -SAO PAULO - CENTRO - 16.670.085/0013-99	9820541	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820541	2025-11-11 19:00:45.028	2025-11-11 19:00:45.059989	2025-11-11 19:00:45.059989
88740f9b-9266-4caf-99ee-ec6a5fc69f99	LOCALIZA -SAO PAULO - PARQUE INDUSTRIAL TOMAS EDSON - 16.670.085/0951-99	9820542	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820542	2025-11-11 19:00:45.088	2025-11-11 19:00:45.122051	2025-11-11 19:00:45.122051
e5d83d6f-e0a0-43f4-8403-12fd99533935	LOCALIZA -SAO PAULO - BARRA FUNDA - 16.670.085/0173-92	9820543	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820543	2025-11-11 19:00:45.15	2025-11-11 19:00:45.182546	2025-11-11 19:00:45.182546
0d771807-61e5-4534-8d59-311edf46441a	LOCALIZA -SAO PAULO - BOSQUE DA SAUDE - 16.670.085/0971-32	9820544	96a2f2df-78f5-4b59-92f3-ac04396b09ab	\N	\N	t	9820544	2025-11-11 19:00:45.211	2025-11-11 19:00:45.242944	2025-11-11 19:00:45.242944
2a214e31-1967-4fa5-94c3-ee1693f66cba	DEPARTAMENTO PESSOAL - MATRIZ	200001	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200001	2025-11-11 19:00:45.271	2025-11-11 19:00:45.303491	2025-11-11 19:00:45.303491
fcc939e7-74de-421c-bdec-b091d12753c8	RECURSOS HUMANOS - MATRIZ	200002	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200002	2025-11-11 19:00:45.331	2025-11-11 19:00:45.363681	2025-11-11 19:00:45.363681
17592e00-274b-4443-aad7-8fd5abd4e84f	T.I - MATRIZ	200003	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200003	2025-11-11 19:00:45.404	2025-11-11 19:00:45.43647	2025-11-11 19:00:45.43647
39e4baf3-1f05-466c-8744-ca9b7de83e36	FINANCEIRO - MATRIZ	200004	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200004	2025-11-11 19:00:45.464	2025-11-11 19:00:45.496848	2025-11-11 19:00:45.496848
6bf58ac9-081b-4a57-a054-9aa34f200727	COMERCIAL - MATRIZ	200005	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200005	2025-11-11 19:00:45.525	2025-11-11 19:00:45.55776	2025-11-11 19:00:45.55776
c861cfba-085d-4322-a329-e9dd9fecf7f0	FATURAMENTO - MATRIZ	200006	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200006	2025-11-11 19:00:45.586	2025-11-11 19:00:45.618982	2025-11-11 19:00:45.618982
40da45b2-74b2-4cd1-aa16-c9a1ee8f407b	COMPRAS - MATRIZ	200007	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200007	2025-11-11 19:00:45.647	2025-11-11 19:00:45.67926	2025-11-11 19:00:45.67926
b0b5cc73-724c-4b8b-9c42-3391cbb649c4	JURIDICO - MATRIZ	200008	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200008	2025-11-11 19:00:45.707	2025-11-11 19:00:45.739493	2025-11-11 19:00:45.739493
56796c48-8712-416b-b62c-075252b90621	CUSTOS EXTRA - ORÇAMENTO MATRIZ	200009	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200009	2025-11-11 19:00:45.768	2025-11-11 19:00:45.799915	2025-11-11 19:00:45.799915
4c081f93-053b-400d-ba53-7e442e64bdbc	PRESTADORES DE SERVIÇOS - MATRIZ	200011	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200011	2025-11-11 19:00:45.828	2025-11-11 19:00:45.859958	2025-11-11 19:00:45.859958
105d3e4c-be5a-4b42-b55d-918b40cdf5f6	GERAL MATRIZ	200012	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200012	2025-11-11 19:00:45.888	2025-11-11 19:00:45.920139	2025-11-11 19:00:45.920139
e7c7de9e-f06b-4061-8cb6-1312966a738a	QUALIDADE - MATRIZ	200013	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200013	2025-11-11 19:00:45.948	2025-11-11 19:00:45.979098	2025-11-11 19:00:45.979098
fb6894f2-4b90-400f-9655-02c7a640c444	CONTROLADORIA - MATRIZ	200014	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200014	2025-11-11 19:00:46.007	2025-11-11 19:00:46.039124	2025-11-11 19:00:46.039124
5fdc2d41-7c58-43f2-a590-2e56758cb411	INVESTIMENTOS ADMINISTRATIVOS - MATRIZ	200030	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	200030	2025-11-11 19:00:46.067	2025-11-11 19:00:46.099347	2025-11-11 19:00:46.099347
69855eac-ca93-43bd-856a-6045b58ca405	MARKETING - MATRIZ	200031	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200031	2025-11-11 19:00:46.127	2025-11-11 19:00:46.159441	2025-11-11 19:00:46.159441
f8e8ac31-cf75-4ed5-985a-1dfd541cb1ca	ADMINISTRATIVO - OPUS LOGISTICA	850001	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850001	2025-11-11 19:00:46.188	2025-11-11 19:00:46.219877	2025-11-11 19:00:46.219877
cbabbe02-7728-4c80-a450-ca99b5716657	LOCALIZA - HIGIENIZADORES	850002	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850002	2025-11-11 19:00:46.248	2025-11-11 19:00:46.280891	2025-11-11 19:00:46.280891
415d09db-aa7c-422a-9857-944e5b96aa55	ADMINISTRATIVO LOCALIZA	850003	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850003	2025-11-11 19:00:46.309	2025-11-11 19:00:46.341247	2025-11-11 19:00:46.341247
42c4948a-fe56-4f54-9131-7d22d531151a	LOCALIZA - MG	850004	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850004	2025-11-11 19:00:46.369	2025-11-11 19:00:46.402159	2025-11-11 19:00:46.402159
21012a41-2737-4eaa-958a-1ea11a5a6148	LOCALIZA - SP	850005	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850005	2025-11-11 19:00:46.43	2025-11-11 19:00:46.462636	2025-11-11 19:00:46.462636
7a285f8c-be90-4667-a7b2-19f18aa85cb3	LOCALIZA - ES	850006	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850006	2025-11-11 19:00:46.491	2025-11-11 19:00:46.522631	2025-11-11 19:00:46.522631
249fc1c9-9aaa-47e0-af82-f9791680d568	LOCALIZA - PE	850007	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850007	2025-11-11 19:00:46.551	2025-11-11 19:00:46.583168	2025-11-11 19:00:46.583168
174eea7c-0ebd-4407-b1e1-9e675ddcefea	LOCALIZA - DF	850008	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850008	2025-11-11 19:00:46.614	2025-11-11 19:00:46.646008	2025-11-11 19:00:46.646008
d2a67599-9efb-4c14-a4ff-9b8d9d2e5406	LOCALIZA - GO	850009	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850009	2025-11-11 19:00:46.674	2025-11-11 19:00:46.705108	2025-11-11 19:00:46.705108
22ad17c2-65d1-4d12-9697-01f178cfe40a	LOCALIZA - MT	850010	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850010	2025-11-11 19:00:46.733	2025-11-11 19:00:46.765428	2025-11-11 19:00:46.765428
6fb995ac-a410-41ab-a005-fbab0c6f9975	LOCALIZA - MTS	850011	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850011	2025-11-11 19:00:46.793	2025-11-11 19:00:46.825617	2025-11-11 19:00:46.825617
4b994106-4db0-4b5e-8c50-5d66d74ea42e	LOCALIZA - TO	850012	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850012	2025-11-11 19:00:46.853	2025-11-11 19:00:46.885581	2025-11-11 19:00:46.885581
35841110-92ba-46a9-8385-d53d7a943c75	LOCALIZA - MA	850013	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850013	2025-11-11 19:00:46.914	2025-11-11 19:00:46.945805	2025-11-11 19:00:46.945805
b39292a4-8fdb-47b5-89ea-8fbd11a44072	LOCALIZA RENT A CAR	850014	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850014	2025-11-11 19:00:46.974	2025-11-11 19:00:47.006107	2025-11-11 19:00:47.006107
5d8b961d-6bc8-422b-afb4-050e471a31a1	LOCALIZA - SC	850015	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850015	2025-11-11 19:00:47.034	2025-11-11 19:00:47.06725	2025-11-11 19:00:47.06725
cf105247-4308-4afc-b303-70f44cd2fed3	LOCALIZA - RJ	850016	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850016	2025-11-11 19:00:47.095	2025-11-11 19:00:47.127499	2025-11-11 19:00:47.127499
cc609caf-a16e-418b-abfb-5493b2162514	LOCALIZA FRENTISTAS SP - CGH	850017	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850017	2025-11-11 19:00:47.156	2025-11-11 19:00:47.187792	2025-11-11 19:00:47.187792
7f39c9cd-0fe4-469b-b141-877214660b4d	LOCALIZA FRENTISTAS RJ	850018	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850018	2025-11-11 19:00:47.216	2025-11-11 19:00:47.24797	2025-11-11 19:00:47.24797
298e55b9-a65c-44a3-952f-77c5ebd2cf89	LOCALIZA FRENTISTAS - RS	850019	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850019	2025-11-11 19:00:47.276	2025-11-11 19:00:47.308722	2025-11-11 19:00:47.308722
95e94787-607e-40d1-b1f3-7e7c3219689d	LOCALIZA FRENTISTAS - PR	850020	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850020	2025-11-11 19:00:47.337	2025-11-11 19:00:47.374395	2025-11-11 19:00:47.374395
c6fee89d-ecc2-44e3-a51d-da31c0082efc	LOCALIZA FRENTISTAS - MG	850021	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850021	2025-11-11 19:00:47.402	2025-11-11 19:00:47.43463	2025-11-11 19:00:47.43463
836a0324-2a0e-4fdc-a7be-5b5f5259cf39	LOCALIZA FRENTISTAS - SC	850022	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850022	2025-11-11 19:00:47.463	2025-11-11 19:00:47.495132	2025-11-11 19:00:47.495132
e1dce908-a3cb-4b98-bf5e-e640be149e81	LOCALIZA LAVADORES	850023	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850023	2025-11-11 19:00:47.523	2025-11-11 19:00:47.555174	2025-11-11 19:00:47.555174
4ac29975-965f-4126-b940-0a4fc65e4b37	LOCALIZA - BAHIA	850024	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850024	2025-11-11 19:00:47.584	2025-11-11 19:00:47.616523	2025-11-11 19:00:47.616523
e1ec75d0-a3d7-43f3-976d-408d5c07ab24	LOCALIZA - RS	850025	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850025	2025-11-11 19:00:47.644	2025-11-11 19:00:47.676965	2025-11-11 19:00:47.676965
da8a04fb-271c-4772-839d-36573c133b47	LOCALIZA HIGIENIZADORES - SC	850027	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850027	2025-11-11 19:00:47.706	2025-11-11 19:00:47.742018	2025-11-11 19:00:47.742018
18c02695-411a-47eb-9041-a349282bb451	LOCALIZA HIGIENIZADORES - PR	850028	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850028	2025-11-11 19:00:47.77	2025-11-11 19:00:47.80111	2025-11-11 19:00:47.80111
a87a2def-a630-470d-bdbe-189cd73f0037	MOVIDA - MOVIMENTAÇÃO BA	850029	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850029	2025-11-11 19:00:47.83	2025-11-11 19:00:47.862305	2025-11-11 19:00:47.862305
9129ca56-b8bc-4076-9475-6f7dbea8ce3c	MOVIDA - MOVIMENTACAO SP	850030	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850030	2025-11-11 19:00:47.89	2025-11-11 19:00:47.922606	2025-11-11 19:00:47.922606
646cc8ab-9822-417f-b7cd-894cdd0b06c2	MOVIDA - MOVIMENTAÇÃO MG	850031	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850031	2025-11-11 19:00:47.951	2025-11-11 19:00:47.983473	2025-11-11 19:00:47.983473
cdb8a26d-5dd4-4026-a43c-feb40f2311ce	UNIDAS GUARULHOS - HIGIENIZADORES	850035	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850035	2025-11-11 19:00:48.012	2025-11-11 19:00:48.04444	2025-11-11 19:00:48.04444
fef72751-d536-4a48-bd27-53264730f8c8	UNIDAS CONGONHAS - HIGIENIZADORESS	850036	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850036	2025-11-11 19:00:48.072	2025-11-11 19:00:48.104646	2025-11-11 19:00:48.104646
d8cba867-616f-4540-a070-73949f53318c	UNIDAS CONFINS BHZ - HIGIENIZADORES	850038	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850038	2025-11-11 19:00:48.134	2025-11-11 19:00:48.165983	2025-11-11 19:00:48.165983
9acb5474-bfc4-42b0-a89e-1d984055d7f9	UNIDAS JUNDIAÍ - JDI3 - HIGIENIZADORES	850039	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850039	2025-11-11 19:00:48.194	2025-11-11 19:00:48.226737	2025-11-11 19:00:48.226737
2f63f94e-fbba-4aec-8795-567f5b4ed03d	LOC DESAT. SP PATIOS EXTERNOS	850040	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850040	2025-11-11 19:00:48.255	2025-11-11 19:00:48.287556	2025-11-11 19:00:48.287556
97153f97-bf03-4cce-b211-c56db817815c	LOC DESAT.ITAQUAQUECETUBA	850041	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850041	2025-11-11 19:00:48.316	2025-11-11 19:00:48.347905	2025-11-11 19:00:48.347905
be3b9403-65b1-44d4-89b6-3c7d0c0f744f	LOC DESAT. BARUERI	850042	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850042	2025-11-11 19:00:48.376	2025-11-11 19:00:48.408306	2025-11-11 19:00:48.408306
35a80cef-e43b-4e19-b8f3-2282ec526bd9	LOC DESAT. JUNDIAI	850043	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850043	2025-11-11 19:00:48.436	2025-11-11 19:00:48.473784	2025-11-11 19:00:48.473784
4b236d99-43ad-4b75-99c6-b8839ddcdeb7	LOC DESAT. SOROCABA	850044	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850044	2025-11-11 19:00:48.502	2025-11-11 19:00:48.533824	2025-11-11 19:00:48.533824
6075ff50-231c-4ee9-94da-b3bf3856ff73	LOC DESAT. CAMPINAS	850045	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850045	2025-11-11 19:00:48.562	2025-11-11 19:00:48.593187	2025-11-11 19:00:48.593187
f49e436e-22f3-4da3-8067-b64c861461a2	LOC DESAT. PIRACICABA	850046	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850046	2025-11-11 19:00:48.622	2025-11-11 19:00:48.653755	2025-11-11 19:00:48.653755
48ff65fc-c843-4830-80ed-4cabb043bce2	LOC DESAT. RIBEIRAO PRETO	850047	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850047	2025-11-11 19:00:48.682	2025-11-11 19:00:48.713997	2025-11-11 19:00:48.713997
34bf5a9b-a884-4cd7-a62b-94897acd55f6	LOC DESAT. SAO JOSE DO RIO PRETO	850048	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850048	2025-11-11 19:00:48.742	2025-11-11 19:00:48.774214	2025-11-11 19:00:48.774214
99d39958-bd8c-49dd-b658-56bcf75bc4b9	LOC DESAT. BAURU	850049	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850049	2025-11-11 19:00:48.802	2025-11-11 19:00:48.834971	2025-11-11 19:00:48.834971
41045523-57e1-4127-861f-4d4156d49fc2	LOC DESAT. MARILIA	850050	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850050	2025-11-11 19:00:48.864	2025-11-11 19:00:48.896777	2025-11-11 19:00:48.896777
11edc169-b66e-4430-9091-7a238b03135b	LOC DESAT. PRESIDENTE PRUDENTE	850051	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850051	2025-11-11 19:00:48.925	2025-11-11 19:00:48.957231	2025-11-11 19:00:48.957231
2e3bfa7b-95f3-4451-9797-7f7d68e2ea4a	LOC DESAT. SAO JOSEE DOS CAMPOS	850052	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850052	2025-11-11 19:00:48.985	2025-11-11 19:00:49.017427	2025-11-11 19:00:49.017427
7e79bd43-030c-4c15-8ab6-69fc5b85679e	LOC DESAT. ARARAQUARA	850053	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850053	2025-11-11 19:00:49.045	2025-11-11 19:00:49.077785	2025-11-11 19:00:49.077785
36c6dd6f-7ae7-4afd-919e-5333c66b9073	LOC DESAT. BRASILIA	850054	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850054	2025-11-11 19:00:49.106	2025-11-11 19:00:49.138864	2025-11-11 19:00:49.138864
23d50ed4-484c-4008-ac38-e0678ab826f6	LOC DESAT. GOIANIA	850055	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850055	2025-11-11 19:00:49.167	2025-11-11 19:00:49.19897	2025-11-11 19:00:49.19897
45de0cd5-5bc0-4b3a-8b30-3b70c7dd7657	LOC DESAT. CAMPO GRANDE	850056	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850056	2025-11-11 19:00:49.227	2025-11-11 19:00:49.259245	2025-11-11 19:00:49.259245
4cfd8df8-629f-4564-ae1f-f341116413a3	LOC DESAT. CUIABA	850057	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850057	2025-11-11 19:00:49.287	2025-11-11 19:00:49.31968	2025-11-11 19:00:49.31968
35dc9313-2c6f-4786-ad78-14a464e9f825	LOC DESAT. VITORIA	850058	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850058	2025-11-11 19:00:49.348	2025-11-11 19:00:49.38028	2025-11-11 19:00:49.38028
ab67e4d9-20ee-4603-bf4b-634e061b2237	LOC DESAT. LAGOA SANTA	850059	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850059	2025-11-11 19:00:49.408	2025-11-11 19:00:49.440519	2025-11-11 19:00:49.440519
d90c6c40-d443-4361-8f5c-dea3097efd2a	LOC DESAT. PALMAS	850060	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850060	2025-11-11 19:00:49.468	2025-11-11 19:00:49.500718	2025-11-11 19:00:49.500718
5641a9e7-b90f-4c89-b382-6367c625c8de	LOC DESAT. BELO HORIZONTE	850061	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850061	2025-11-11 19:00:49.529	2025-11-11 19:00:49.561226	2025-11-11 19:00:49.561226
7ded8257-3cc4-4ebe-ad09-074537363dd8	LOC DESAT. UBERABA	850062	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850062	2025-11-11 19:00:49.589	2025-11-11 19:00:49.621605	2025-11-11 19:00:49.621605
51fabc71-9d10-4460-873f-05d0c24018d8	LOC DESAT. UBERLANDIA	850063	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850063	2025-11-11 19:00:49.65	2025-11-11 19:00:49.682367	2025-11-11 19:00:49.682367
612c5d1b-f5cb-4c60-8e8f-01e2d40bf3ec	MOVIDA DESAT. GOIANIA	850064	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850064	2025-11-11 19:00:49.71	2025-11-11 19:00:49.743058	2025-11-11 19:00:49.743058
971c35b5-c369-446f-b206-f390eab1921c	PINAUTO - GO	850066	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850066	2025-11-11 19:00:49.771	2025-11-11 19:00:49.803118	2025-11-11 19:00:49.803118
e5549dac-6138-45f0-9a5b-96c0ffb8ed5d	MOVIDA SALVADOR	850068	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850068	2025-11-11 19:00:49.831	2025-11-11 19:00:49.864086	2025-11-11 19:00:49.864086
10e8c725-4c8d-4078-b535-83c7fd556cfc	UNIDAS MOVIMENTACAO MG	850069	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	\N	\N	t	850069	2025-11-11 19:00:49.892	2025-11-11 19:00:49.924625	2025-11-11 19:00:49.924625
80d6f452-fe25-4e14-bef3-36e057a77023	LOCALIZA FRENTISTAS SP - GRU	850071	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850071	2025-11-11 19:00:49.953	2025-11-11 19:00:49.985051	2025-11-11 19:00:49.985051
a8b0f923-2206-4e8f-8a58-b34aed75c833	LOC. HIGIENIZADORES - BA - ITABUNA	850072	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850072	2025-11-11 19:00:50.013	2025-11-11 19:00:50.045581	2025-11-11 19:00:50.045581
74588d9c-f330-45dc-852c-17f44924bbc3	LOC. HIGIENIZADORES - BA - BARREIRAS	850073	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850073	2025-11-11 19:00:50.074	2025-11-11 19:00:50.105835	2025-11-11 19:00:50.105835
798c608e-b215-453f-9cbc-d797b4d85e8c	LOC. HIGIENIZADORES - DF - BRASILIA	850074	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850074	2025-11-11 19:00:50.134	2025-11-11 19:00:50.166062	2025-11-11 19:00:50.166062
ef5b7b3d-e2f0-4433-8bbc-551c00806a27	LOC. HIGIENIZADORES - SC - CHAPECO	850075	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850075	2025-11-11 19:00:50.194	2025-11-11 19:00:50.226525	2025-11-11 19:00:50.226525
1c6ad09c-6ce3-46ca-b74c-cc618189ebaf	LOC. HIGIENIZADORES - AL - MACEIO	850076	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850076	2025-11-11 19:00:50.255	2025-11-11 19:00:50.28682	2025-11-11 19:00:50.28682
fbaa359d-38b8-45c9-b191-ddf8127a2b31	LOC. HIGIENIZADORES - PR - MARINGA	850077	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850077	2025-11-11 19:00:50.315	2025-11-11 19:00:50.34742	2025-11-11 19:00:50.34742
24dc2e93-c406-4962-9d0b-8eebadbfd7a8	LOC. HIGIENIZADORES - SP - IGNACIO	850078	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850078	2025-11-11 19:00:50.375	2025-11-11 19:00:50.407799	2025-11-11 19:00:50.407799
3d20cd82-1a8f-47b3-b1ae-075a4cd0a905	LOC. HIGIENIZADORES - PA - SANTAREM	850079	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850079	2025-11-11 19:00:50.436	2025-11-11 19:00:50.468063	2025-11-11 19:00:50.468063
3454a308-3ad7-48ea-bcce-5630b33fc1a8	LOC. HIGIENIZADORES - PI - TERESINA	850080	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850080	2025-11-11 19:00:50.496	2025-11-11 19:00:50.528965	2025-11-11 19:00:50.528965
16c67f1a-a570-49cf-a06d-8ca92d10f304	LOC. HIGIENIZADORES - BA - VITORIA DA CONQUISTA	850081	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850081	2025-11-11 19:00:50.557	2025-11-11 19:00:50.588173	2025-11-11 19:00:50.588173
95b6ae07-7714-42eb-a12b-286be8d0d2c3	LOC. HIGIENIZADORES - SP - JOAO DIAS	850082	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850082	2025-11-11 19:00:50.616	2025-11-11 19:00:50.648436	2025-11-11 19:00:50.648436
53b784ca-38d9-4363-8d61-c9dda620b1c9	LOC. HIGIENIZADORES - SP - JUNDIAI	850083	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850083	2025-11-11 19:00:50.676	2025-11-11 19:00:50.708855	2025-11-11 19:00:50.708855
24e2cbf0-0291-4105-8cce-de3fd23003cb	LOC. HIGIENIZADORES - SP - CARRAO	850084	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850084	2025-11-11 19:00:50.737	2025-11-11 19:00:50.769258	2025-11-11 19:00:50.769258
b8e9c2bb-7525-492b-b38d-7a9f432001f6	LOC. HIGIENIZADORES - SP - RIBEIRAO PRETO	850085	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850085	2025-11-11 19:00:50.797	2025-11-11 19:00:50.829324	2025-11-11 19:00:50.829324
d283021d-d5a8-4b37-8d70-f26cd615b032	LOC. HIGIENIZADORES - SP - BADY BASSIT	850086	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850086	2025-11-11 19:00:50.857	2025-11-11 19:00:50.889519	2025-11-11 19:00:50.889519
a791768a-4c52-418d-abcc-63ab5d3ac7b1	LOC. HIGIENIZADORES - SP - GUAIANASES	850087	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850087	2025-11-11 19:00:50.917	2025-11-11 19:00:50.949729	2025-11-11 19:00:50.949729
8c526e71-b88e-4519-9b9d-e8036d72a1cc	LOC. HIGIENIZADORES - SP - SAO BERNARDO DO CAMPO	850088	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	450845c1-6fb4-4a61-8165-4a25f130c3e8	\N	t	850088	2025-11-11 19:00:50.978	2025-11-11 19:00:51.010508	2025-11-11 19:00:51.010508
ca9118be-8cb9-4bff-86f6-6131ab37e164	CEO	100001	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	100001	2025-11-11 19:00:51.039	2025-11-11 19:00:51.071703	2025-11-11 19:00:51.071703
dc84a7f7-c48e-45fc-8daf-d7fdd4092556	DEPARTAMENTO PESSOAL - MATRIZ	200001	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200001	2025-11-11 19:00:51.1	2025-11-11 19:00:51.131992	2025-11-11 19:00:51.131992
40406b70-1bb1-42f3-9f3d-296139202f91	RECURSOS HUMANOS - MATRIZ	200002	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200002	2025-11-11 19:00:51.16	2025-11-11 19:00:51.192166	2025-11-11 19:00:51.192166
3509a623-2510-490c-adff-20c97347f72f	T.I - MATRIZ	200003	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200003	2025-11-11 19:00:51.221	2025-11-11 19:00:51.253049	2025-11-11 19:00:51.253049
d6218c7f-1565-4a52-8f46-c4c2a0b711ce	FINANCEIRO - MATRIZ	200004	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200004	2025-11-11 19:00:51.282	2025-11-11 19:00:51.314763	2025-11-11 19:00:51.314763
d3c9d24b-c9f7-4467-9ded-375ecf8245a0	FATURAMENTO - MATRIZ	200006	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200006	2025-11-11 19:00:51.343	2025-11-11 19:00:51.374925	2025-11-11 19:00:51.374925
35ef021f-e084-4359-86a8-45b6dfa709bf	COMPRAS - MATRIZ	200007	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200007	2025-11-11 19:00:51.404	2025-11-11 19:00:51.435987	2025-11-11 19:00:51.435987
aff92024-8105-4af6-b131-fc330c3570b1	DEPARTAMENTO PESSOAL - TELOS	200010	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200010	2025-11-11 19:00:51.464	2025-11-11 19:00:51.496299	2025-11-11 19:00:51.496299
bc41562f-71a4-4dde-97bb-46060850a385	GERAL MATRIZ	200012	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200012	2025-11-11 19:00:51.525	2025-11-11 19:00:51.556848	2025-11-11 19:00:51.556848
dbedd293-7ad1-475a-be3b-75364321b593	QUALIDADE MATRIZ	200013	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	200013	2025-11-11 19:00:51.585	2025-11-11 19:00:51.616796	2025-11-11 19:00:51.616796
ee3c1f01-6013-49f6-8a7e-ef486143a643	CONTROLADORIA - MATRIZ	200014	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	200014	2025-11-11 19:00:51.645	2025-11-11 19:00:51.677423	2025-11-11 19:00:51.677423
09e33a2b-dd12-4873-a4fb-105bde917361	MARKETING - MATRIZ	200031	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	200031	2025-11-11 19:00:51.707	2025-11-11 19:00:51.739389	2025-11-11 19:00:51.739389
c8554c42-f92a-4645-bb61-887c6a596196	COMERCIAL - MATRIZ	300001	767c65ac-b94f-4187-b6c2-f310cc7cac4f	e51ccbf7-3477-49dd-948d-0d80fadbf2a5	\N	t	300001	2025-11-11 19:00:51.768	2025-11-11 19:00:51.80048	2025-11-11 19:00:51.80048
8bb8cda2-446d-41a4-9bd2-b8c1b52d333f	OPUS MANUTENÇÃO - ADMINISTRATIVO	500001	767c65ac-b94f-4187-b6c2-f310cc7cac4f	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	500001	2025-11-11 19:00:51.829	2025-11-11 19:00:51.861463	2025-11-11 19:00:51.861463
48cf144a-f6e3-4c53-94c4-d436a231f569	ALLOS SHOPPING STA. MARIA	500002	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500002	2025-11-11 19:00:51.89	2025-11-11 19:00:51.922177	2025-11-11 19:00:51.922177
eca2a63e-c3f8-4603-8110-6bf94eb2a132	ALLOS SHOPPING - BAURU SP	500003	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500003	2025-11-11 19:00:51.95	2025-11-11 19:00:51.98323	2025-11-11 19:00:51.98323
e8c3107c-dea2-44b2-870d-84788acef70c	ALLOS SHOPPING - CURITIBA PR	500004	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500004	2025-11-11 19:00:52.011	2025-11-11 19:00:52.043725	2025-11-11 19:00:52.043725
cd980a51-5334-4ef0-b388-beaf9c081f0b	SYN - SHOPPING CERRADO	500005	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500005	2025-11-11 19:00:52.072	2025-11-11 19:00:52.104142	2025-11-11 19:00:52.104142
105d97af-40e7-43cc-9e20-69f9b9bf9b69	NIAD BOULEVARD LONDRINA SHOPPING	500006	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500006	2025-11-11 19:00:52.132	2025-11-11 19:00:52.164397	2025-11-11 19:00:52.164397
e8bf0303-f132-4251-acd9-38057e75cc10	ALLOS SHOPPING - ARACATUBA SP	500007	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500007	2025-11-11 19:00:52.192	2025-11-11 19:00:52.224538	2025-11-11 19:00:52.224538
5e29ed4d-f549-4061-b37a-d7e21f6a3204	ALLOS SHOPPING - SAO BERNARDO SP	500008	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500008	2025-11-11 19:00:52.253	2025-11-11 19:00:52.284848	2025-11-11 19:00:52.284848
7cb4a588-5d84-46d6-b89c-57968a65804e	ALLOS SHOPPING - GOIANIA GO	500010	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500010	2025-11-11 19:00:52.313	2025-11-11 19:00:52.345039	2025-11-11 19:00:52.345039
902d138d-6031-49f1-a4d7-662b68dbe7b6	ALLOS SHOPPING - CATUAI LONDRINA	500011	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500011	2025-11-11 19:00:52.373	2025-11-11 19:00:52.406212	2025-11-11 19:00:52.406212
e83660f5-58c9-4980-b9dd-c8a8c48ec7dd	ALLOS SHOPPING - DEL REY BH	500012	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500012	2025-11-11 19:00:52.434	2025-11-11 19:00:52.466936	2025-11-11 19:00:52.466936
ca83c6c5-b771-4a59-a36f-7dbfe0dc3eca	MICHELIN - ENGENHARIA RJ	500013	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500013	2025-11-11 19:00:52.495	2025-11-11 19:00:52.527397	2025-11-11 19:00:52.527397
70fd2c53-d41a-461c-b5ec-eaf7669860aa	VALLOUREC JECEABA - MANUTENÇÃO	500014	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500014	2025-11-11 19:00:52.556	2025-11-11 19:00:52.588195	2025-11-11 19:00:52.588195
72dd3a7b-3807-4b1b-ad5f-cb870064f224	VALLOUREC BRUMADINHO - MANUTENÇÃO	500015	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500015	2025-11-11 19:00:52.617	2025-11-11 19:00:52.648843	2025-11-11 19:00:52.648843
7a44c7bc-7679-455a-bec9-2b170010511e	VALLOUREC BARREIRO - MANUTENÇÃO	500016	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500016	2025-11-11 19:00:52.677	2025-11-11 19:00:52.708912	2025-11-11 19:00:52.708912
d4079c78-bb4a-4433-85fa-51b32e33c853	VALLOUREC GESTÃO - ADMINISTRATIVO	500018	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500018	2025-11-11 19:00:52.737	2025-11-11 19:00:52.768077	2025-11-11 19:00:52.768077
75b407b1-7fd3-41a9-bd02-48d72f2e1d75	ALLOS CENTER SHOPPING UBERLANDIA	500019	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500019	2025-11-11 19:00:52.796	2025-11-11 19:00:52.828525	2025-11-11 19:00:52.828525
20885c81-eaf5-45fd-8e28-b797cd768920	VALLOUREC JECEABA MANUTENÇÃO	500020	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500020	2025-11-11 19:00:52.857	2025-11-11 19:00:52.890232	2025-11-11 19:00:52.890232
0506b775-3fb3-446c-b7bd-4210c2e29ee9	VALLOUREC BARREIRO MANUTENÇÃO	500021	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500021	2025-11-11 19:00:52.918	2025-11-11 19:00:52.950671	2025-11-11 19:00:52.950671
c638d2cb-55a5-42ed-a3e2-087eed37d5a8	ALLOS SHOPPING VILLA LOBOS	500022	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500022	2025-11-11 19:00:52.979	2025-11-11 19:00:53.010982	2025-11-11 19:00:53.010982
0b00f92f-b0c3-4ee5-a0ae-a12ff7785ba7	CPFL - JARDINAGEM	500023	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500023	2025-11-11 19:00:53.039	2025-11-11 19:00:53.07128	2025-11-11 19:00:53.07128
0567f570-75ee-47ba-8b93-f0e734622d6a	TUPY - MG	500024	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500024	2025-11-11 19:00:53.1	2025-11-11 19:00:53.131485	2025-11-11 19:00:53.131485
3d16ebd0-1ef9-44cc-8db0-9e88617b187f	MERCEDES MANUTENÇÃO	500025	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500025	2025-11-11 19:00:53.16	2025-11-11 19:00:53.191844	2025-11-11 19:00:53.191844
c206ce7b-eb9c-4780-b5eb-4250dd93a08b	ALLOS CENTER SHOPPING UBERLANDIA PREDIAL	500026	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500026	2025-11-11 19:00:53.22	2025-11-11 19:00:53.251925	2025-11-11 19:00:53.251925
d88b8e6d-2c85-40b0-bfe9-4deebdf2a469	TUPY MG TELHADOS	500027	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500027	2025-11-11 19:00:53.28	2025-11-11 19:00:53.312065	2025-11-11 19:00:53.312065
8410f8ff-4a6b-4bd3-ac07-ccec52753992	TUPY PINTURA MG	500028	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500028	2025-11-11 19:00:53.34	2025-11-11 19:00:53.372485	2025-11-11 19:00:53.372485
81ceaf9e-5061-409f-9599-2ab8452fb845	MAXION CRUZEIRO - LIMPEZA	500029	767c65ac-b94f-4187-b6c2-f310cc7cac4f	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	500029	2025-11-11 19:00:53.4	2025-11-11 19:00:53.432832	2025-11-11 19:00:53.432832
d18f0e72-e410-49c1-b312-a689e7a35d92	MAXION RESENDE - LIMPEZA	500030	767c65ac-b94f-4187-b6c2-f310cc7cac4f	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	500030	2025-11-11 19:00:53.461	2025-11-11 19:00:53.493088	2025-11-11 19:00:53.493088
86adcbbb-1c04-459c-91ed-8a334ca9acb3	TUPY MG MECANICOS MACHARIA	500031	767c65ac-b94f-4187-b6c2-f310cc7cac4f	3a731a2b-842e-4340-92af-e98e2d7e5665	\N	t	500031	2025-11-11 19:00:53.521	2025-11-11 19:00:53.555206	2025-11-11 19:00:53.555206
b8ad14ce-83cc-4103-985d-98a693ef2414	CPFL - RIBEIRAO PRETO SP	500032	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500032	2025-11-11 19:00:53.583	2025-11-11 19:00:53.615679	2025-11-11 19:00:53.615679
7fc59feb-5f47-401f-9a5c-64be41c21733	CPFL - SAO JOSE DO RIO PRETO SP	500033	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c255fa6d-7c7a-4974-ab31-fd31c4d71168	\N	t	500033	2025-11-11 19:00:53.644	2025-11-11 19:00:53.676415	2025-11-11 19:00:53.676415
96f7045f-2060-4549-93e6-98b4e0e16b0b	MAXION SPOT	500034	767c65ac-b94f-4187-b6c2-f310cc7cac4f	1c2ea93e-9e97-46c0-ac47-b83954a47d3d	\N	t	500034	2025-11-11 19:00:53.704	2025-11-11 19:00:53.736747	2025-11-11 19:00:53.736747
08e71db6-a5af-4623-bc8e-8c1bc8fd95f1	VESUVIOS KAIZEN - RJ	500035	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500035	2025-11-11 19:00:53.766	2025-11-11 19:00:53.79815	2025-11-11 19:00:53.79815
5cc995f0-df62-488c-98cf-0d53303b59f6	VESUVIOS SERRALHERIA - RJ	500036	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	500036	2025-11-11 19:00:53.826	2025-11-11 19:00:53.858726	2025-11-11 19:00:53.858726
b6e43bab-f770-43da-8fd0-1863e36a1da6	FEMSA SP JURUBATUBA TEMPORARIOS	640008	767c65ac-b94f-4187-b6c2-f310cc7cac4f	\N	\N	t	640008	2025-11-11 19:00:53.887	2025-11-11 19:00:53.919027	2025-11-11 19:00:53.919027
36c3d1c7-935c-4a0b-a301-02494137c3ed	FEMSA SC JOINVILLE TEMPORARIOS	620024	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	620024	2025-11-11 19:00:53.947	2025-11-11 19:00:53.979803	2025-11-11 19:00:53.979803
afec262e-3ef8-41d6-9a87-2b0b87c78690	FEMSA ABC ITAIM PAULISTA TEMPORARIOS	640005	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	640005	2025-11-11 19:00:54.008	2025-11-11 19:00:54.040127	2025-11-11 19:00:54.040127
1c1dfac8-bed2-460e-8d75-cae263617975	FEMSA MG JOAO  MONLEVADE TEMPORARIOS	640006	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	640006	2025-11-11 19:00:54.068	2025-11-11 19:00:54.100533	2025-11-11 19:00:54.100533
0c2e59c5-c03d-42a1-9316-3d470f12bc40	FEMSA ABC IPIRANGA TEMPORARIOS	640007	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	640007	2025-11-11 19:00:54.129	2025-11-11 19:00:54.16086	2025-11-11 19:00:54.16086
537f5ed9-a26a-45ca-84b9-33128f343d31	FEMSA SP JURUBATUBA TEMPORARIOS	640008	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	640008	2025-11-11 19:00:54.19	2025-11-11 19:00:54.221809	2025-11-11 19:00:54.221809
d9e57f26-1573-4340-8756-6fe7bbc2509d	FEMSA SP JUNDIAI TEMPORARIOS	640009	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	640009	2025-11-11 19:00:54.25	2025-11-11 19:00:54.282281	2025-11-11 19:00:54.282281
127c1922-f3a2-4f78-a13e-f2704cdcedc0	ADMINISTRATIVO ATENAS	890001	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890001	2025-11-11 19:00:54.31	2025-11-11 19:00:54.34275	2025-11-11 19:00:54.34275
75f2e29d-f89e-47c7-b6d0-49c8e3330ee7	CENTRO CLINICO VIDA E SAÚDE	890002	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890002	2025-11-11 19:00:54.371	2025-11-11 19:00:54.403638	2025-11-11 19:00:54.403638
763a1454-d33c-4ac4-abb5-a70048d554a6	CONDOMINIO CONJUNTO RESIDENCIAL BURITI	890003	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890003	2025-11-11 19:00:54.432	2025-11-11 19:00:54.464071	2025-11-11 19:00:54.464071
fc6647b1-0d9f-4fa0-850f-da44e5b21b2b	CONDOMINIO RESIDENCIAL SOLATIUM	890004	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890004	2025-11-11 19:00:54.492	2025-11-11 19:00:54.52582	2025-11-11 19:00:54.52582
39f85f0b-bc98-4995-9a6f-4107e48680ee	CONDOMINIO ROYAL LIGHT	890005	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890005	2025-11-11 19:00:54.554	2025-11-11 19:00:54.586988	2025-11-11 19:00:54.586988
ec9753ff-3c47-4f91-968c-a121f7e7c0f3	ATENAS - MACROPLASTIC	890006	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890006	2025-11-11 19:00:54.616	2025-11-11 19:00:54.648155	2025-11-11 19:00:54.648155
9d59331c-59b8-40c2-9c71-cd855e344a66	ANATERRA	890007	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890007	2025-11-11 19:00:54.676	2025-11-11 19:00:54.708494	2025-11-11 19:00:54.708494
f993c292-b403-4e4b-b33e-e8ea253d9356	CONDOMINIO PALLADIUM	890008	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890008	2025-11-11 19:00:54.737	2025-11-11 19:00:54.769516	2025-11-11 19:00:54.769516
dd4007c2-04e4-4aa6-9afe-bc9df505960b	L.GIOIA	890009	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890009	2025-11-11 19:00:54.798	2025-11-11 19:00:54.829947	2025-11-11 19:00:54.829947
b9e407e8-9122-4319-9a3e-49359bb04418	INSTITUTO FEDERAL DE EDUC CIENCIA TEC RS	890011	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890011	2025-11-11 19:00:54.86	2025-11-11 19:00:54.892848	2025-11-11 19:00:54.892848
21e3b194-aa63-4bc0-8d72-8e5bf05e246d	SUP FED AGRICULTURA ESTADO RS	890012	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890012	2025-11-11 19:00:54.921	2025-11-11 19:00:54.953391	2025-11-11 19:00:54.953391
7f4390f5-84d0-4a91-ac5a-1d876e7978e1	SEBRAE MT	890015	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890015	2025-11-11 19:00:54.981	2025-11-11 19:00:55.013504	2025-11-11 19:00:55.013504
b495d4d8-1885-40af-a27e-3eca91ac9eda	DEFENSORIA PUBLICA DA UNIAO	890017	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890017	2025-11-11 19:00:55.043	2025-11-11 19:00:55.07511	2025-11-11 19:00:55.07511
b19dfeac-d3b7-4fad-bc4c-0eb7d6936437	MINISTERIO PUBLICO DA UNIAO RO	890018	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890018	2025-11-11 19:00:55.103	2025-11-11 19:00:55.135457	2025-11-11 19:00:55.135457
0adb2187-f0b3-4060-a2e1-c7ba32117a08	MINISTERIO PUBLICO DA UNIAO SP	890019	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890019	2025-11-11 19:00:55.164	2025-11-11 19:00:55.196107	2025-11-11 19:00:55.196107
8a7bc6f8-7f7d-44e8-b096-cb2882df9a5c	FUNDACAO NACIONAL DO INDIO	890020	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890020	2025-11-11 19:00:55.224	2025-11-11 19:00:55.256777	2025-11-11 19:00:55.256777
c62d3ac8-8f7c-41f3-ae45-f896ea81b95b	CONSELHO REG FISIOTERAPIA E TERAPIA OCUP	890021	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890021	2025-11-11 19:00:55.285	2025-11-11 19:00:55.317355	2025-11-11 19:00:55.317355
e8beb1b5-8bc6-403d-ad7a-39c804d80ac3	CONSELHO REG DE FONOAUDIOLOGIA 1 REGIAO	890022	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890022	2025-11-11 19:00:55.346	2025-11-11 19:00:55.378307	2025-11-11 19:00:55.378307
5f47db22-099b-4073-887e-3ccbbf077089	MUTUA DE ASSIST DOS PROF ENG AGRONOMIA	890023	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890023	2025-11-11 19:00:55.406	2025-11-11 19:00:55.438577	2025-11-11 19:00:55.438577
c4ab8450-09ff-4357-bd17-eee9ec36292c	TRIBUNAL REGIONAL ELEITORAL DE SP	890027	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890027	2025-11-11 19:00:55.467	2025-11-11 19:00:55.499007	2025-11-11 19:00:55.499007
422140b6-47cc-4d42-910f-0f5b93e70a67	CONSELHO REG DE ENFERMAGEM MATO GROSSO	890028	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890028	2025-11-11 19:00:55.527	2025-11-11 19:00:55.559165	2025-11-11 19:00:55.559165
472f7329-ab37-4ae5-877e-15966160d2c8	SERV NACIONAL APREND COOPERATIVISMO DF	890030	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890030	2025-11-11 19:00:55.587	2025-11-11 19:00:55.619868	2025-11-11 19:00:55.619868
6080c05b-f4f7-4f59-9a5c-8168fd8ec1ff	SERVICO SOCIAL DA INDUSTRIA SESI BENTO 2	890031	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890031	2025-11-11 19:00:55.648	2025-11-11 19:00:55.680677	2025-11-11 19:00:55.680677
d55d9f70-8d77-4844-975b-6f224fbe28ac	SERVICO SOCIAL DA INDUSTRIA SESI BENTO G	890032	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890032	2025-11-11 19:00:55.709	2025-11-11 19:00:55.741342	2025-11-11 19:00:55.741342
58f53431-6305-484f-bb8e-5bbb53a67f8c	SERVICO SOCIAL DA INDUSTRIA SESI CAXIAS	890033	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890033	2025-11-11 19:00:55.77	2025-11-11 19:00:55.801825	2025-11-11 19:00:55.801825
0a9da152-3d75-492e-9fb9-d9fef04d3271	SERVICO SOCIAL DA INDUSTRIA SESI FARROUP	890034	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890034	2025-11-11 19:00:55.83	2025-11-11 19:00:55.861123	2025-11-11 19:00:55.861123
862c3454-67b3-4537-99a5-05f45fa49ef5	SERVICO SOCIAL DA INDUSTRIA SESI PELOTAS	890035	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890035	2025-11-11 19:00:55.889	2025-11-11 19:00:55.921462	2025-11-11 19:00:55.921462
2bed8542-2bb1-402c-920e-53d60d54895b	SERVICO SOCIAL DA INDUSTRIA SESI STA CRU	890036	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890036	2025-11-11 19:00:55.949	2025-11-11 19:00:55.982072	2025-11-11 19:00:55.982072
6b81af1c-d4c7-431f-a11e-0ccfd3871cd9	SERVICO SOCIAL DA INDUST SESI STA CRUZ 2	890037	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890037	2025-11-11 19:00:56.01	2025-11-11 19:00:56.043096	2025-11-11 19:00:56.043096
f1ddb3a6-3a5f-4854-adea-0f4b849e1ff8	SERVICO SOCIAL DA INDUST SESI STA MARIA	890038	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890038	2025-11-11 19:00:56.071	2025-11-11 19:00:56.103563	2025-11-11 19:00:56.103563
14e0c9a5-b3dc-4a3a-810b-55ee5b3ceeac	SERVICO SOCIAL DA INDUST SESI CAXIAS	890039	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890039	2025-11-11 19:00:56.132	2025-11-11 19:00:56.164415	2025-11-11 19:00:56.164415
be7ab6bd-258b-4d89-b903-83e76ea8cc2f	COPEL DISTRIBUICAO SA	890041	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890041	2025-11-11 19:00:56.192	2025-11-11 19:00:56.224807	2025-11-11 19:00:56.224807
38338c55-2d7b-46ec-b1cd-725e1d5db47e	INSTITUTO FEDERAL DE MATO GROSSO	890043	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890043	2025-11-11 19:00:56.253	2025-11-11 19:00:56.285538	2025-11-11 19:00:56.285538
412dc9fd-2a94-48ef-b1e8-b6838ac7b0f7	RECEITA FEDERAL EM CAXIAS DO SUL/RS	890044	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890044	2025-11-11 19:00:56.314	2025-11-11 19:00:56.346478	2025-11-11 19:00:56.346478
e8facf6a-3685-4755-904e-a6bcfc55a2d6	SERVICO SOCIAL DA INDUSTRIA SESI	890045	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890045	2025-11-11 19:00:56.375	2025-11-11 19:00:56.406946	2025-11-11 19:00:56.406946
e0e9e905-bbca-40c1-aff8-2ef23215eeac	SERVICO SOCIAL DA INDUSTRIA SESI	890046	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890046	2025-11-11 19:00:56.436	2025-11-11 19:00:56.468629	2025-11-11 19:00:56.468629
273c96e1-b2a5-4a5b-ae15-cfa8b7d0dec3	FUNDACAO NACIONAL DO INDIO MT	890047	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890047	2025-11-11 19:00:56.497	2025-11-11 19:00:56.529139	2025-11-11 19:00:56.529139
047627ba-6d4a-49f4-af9c-27114d02a688	SKYMARINE LOGISTICA LTDA - CURITIBA	890048	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890048	2025-11-11 19:00:56.558	2025-11-11 19:00:56.589098	2025-11-11 19:00:56.589098
673a6162-5b61-4ff4-8c1c-6139db107632	DNIT - DEPTO NACIO DE INFRAESTRU DE TRAN	890049	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890049	2025-11-11 19:00:56.619	2025-11-11 19:00:56.651457	2025-11-11 19:00:56.651457
d298f3c9-f776-4945-9f2c-252e7bf14f86	DELEGACIA DA RECEITA FEDERAL DO BRASIL	890050	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890050	2025-11-11 19:00:56.679	2025-11-11 19:00:56.711534	2025-11-11 19:00:56.711534
543a1a1b-9430-48aa-89e2-0962a33be338	SUPERINTENDENCIA DE ADM DO MF NA BAHIA	890051	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890051	2025-11-11 19:00:56.739	2025-11-11 19:00:56.771921	2025-11-11 19:00:56.771921
30adffc9-dca5-4f86-b66c-7676f155941c	AUDITORIAS DA JUSTIÇA MILITAR	890052	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890052	2025-11-11 19:00:56.8	2025-11-11 19:00:56.831149	2025-11-11 19:00:56.831149
120147c5-b58f-4cae-b4b0-f62f240cf0e8	INSTITUTO NACIONAL DA PROPRIEDADE INDUST	890053	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890053	2025-11-11 19:00:56.859	2025-11-11 19:00:56.891289	2025-11-11 19:00:56.891289
adf7cced-1dce-47ca-954d-2a92e37a40ae	CONSELHO REG DE ENFERMAGEM SP	890054	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890054	2025-11-11 19:00:56.919	2025-11-11 19:00:56.951799	2025-11-11 19:00:56.951799
fb71be49-0a44-4d13-9e58-9c18c939c06a	SERVIÇO SOCIAL DA INDUSTRIA SAO JOSE	890055	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890055	2025-11-11 19:00:56.98	2025-11-11 19:00:57.012089	2025-11-11 19:00:57.012089
7b591f0c-32fc-4012-8dd1-749a463fc0bd	SERV NACIO DE APREND INDUSTRIAL ITAJAI	890056	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890056	2025-11-11 19:00:57.04	2025-11-11 19:00:57.071208	2025-11-11 19:00:57.071208
298e3861-900c-4ea2-9cdf-6d6f9b97d55e	SERVIÇO SOCIAL  INDUSTRIA BALN CAMBORIU	890057	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890057	2025-11-11 19:00:57.1	2025-11-11 19:00:57.131157	2025-11-11 19:00:57.131157
8c91c447-0bfb-4ad6-a3bb-d5cc1cdc0e05	SERV NACIO APREND INDUSTRIAL BALN CAMBOR	890058	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890058	2025-11-11 19:00:57.159	2025-11-11 19:00:57.191507	2025-11-11 19:00:57.191507
af1b9858-103a-415f-9585-e778b20b0725	SKYMARINE LOGISTICA LTDA- ITAJAI/SC	890059	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890059	2025-11-11 19:00:57.225	2025-11-11 19:00:57.257505	2025-11-11 19:00:57.257505
84ad59bc-1dbe-40ba-9f78-09956191ffd2	EMPRESA BRAS DE PESQ AGROP - EMBRAPA	890060	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890060	2025-11-11 19:00:57.286	2025-11-11 19:00:57.318433	2025-11-11 19:00:57.318433
dd2af567-13d5-4c85-a1b0-763f3ff6d1cb	SERVICO SOCIAL DA INDUSTRIA SESI PANAMBI	890061	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890061	2025-11-11 19:00:57.348	2025-11-11 19:00:57.380024	2025-11-11 19:00:57.380024
f442f088-4e00-42d2-bd05-6ecd2d365842	HOSPITAL REGIONAL DA LAPA SAO SEBASTIAO	890062	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890062	2025-11-11 19:00:57.409	2025-11-11 19:00:57.441219	2025-11-11 19:00:57.441219
6d64dd93-a75d-4920-99db-eb4bbedb5858	SKYMARINE LOGISTICA LTDA  SAO PAULO	890063	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890063	2025-11-11 19:00:57.469	2025-11-11 19:00:57.501443	2025-11-11 19:00:57.501443
f9430234-8e2b-4378-a5e8-5971582988b1	CONDOMINIO EDIFICIO JOAO XXIII-BACACHERI	890064	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890064	2025-11-11 19:00:57.531	2025-11-11 19:00:57.563031	2025-11-11 19:00:57.563031
dad7b297-d153-4b8b-bb38-e797bd84b8e9	CONDOMINIO EDIFICIO FORTALEZA - PORTAO	890065	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890065	2025-11-11 19:00:57.591	2025-11-11 19:00:57.623404	2025-11-11 19:00:57.623404
bcd980c0-4298-42ae-a530-d97676090baa	MAPA - SEDE	890066	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890066	2025-11-11 19:00:57.651	2025-11-11 19:00:57.683623	2025-11-11 19:00:57.683623
8e08971d-e604-4c29-938c-dda80d572c30	MAPA - UTRA	890067	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890067	2025-11-11 19:00:57.711	2025-11-11 19:00:57.743613	2025-11-11 19:00:57.743613
260a081f-39d5-4467-9c96-9be84e42b100	MAPA - UVAGRO	890068	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890068	2025-11-11 19:00:57.772	2025-11-11 19:00:57.804	2025-11-11 19:00:57.804
eb536d59-9d30-4577-80d1-da94742e8af2	H.A. OFFICES	890070	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890070	2025-11-11 19:00:57.832	2025-11-11 19:00:57.864457	2025-11-11 19:00:57.864457
afb76124-67b8-4276-a7ce-3af2471172a2	EMBAIXADA DA FINLANDIA 	890072	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890072	2025-11-11 19:00:57.892	2025-11-11 19:00:57.92454	2025-11-11 19:00:57.92454
49011e2e-5e66-4c3c-920a-7167694ba76a	CSM TATUAPE	890073	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890073	2025-11-11 19:00:57.953	2025-11-11 19:00:57.984853	2025-11-11 19:00:57.984853
2dc513e2-b75c-4be3-abfd-f936ebbd37af	GRUPO TULIO	890074	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	890074	2025-11-11 19:00:58.013	2025-11-11 19:00:58.044218	2025-11-11 19:00:58.044218
a3aa032d-a36d-4ad8-ae08-91f613587b8c	Plano Contábil	P	125cc65a-b995-49a7-9d1e-f28a1013a0b8	\N	\N	t	P	2025-11-11 19:00:58.072	2025-11-11 19:00:58.104503	2025-11-11 19:00:58.104503
b44a9f61-071c-4142-87db-4c95ab2849ba	ACELERA IT	10000	c0c66615-69ec-45bd-9bf1-bcc55aeb7737	\N	\N	t	10000	2025-11-11 19:00:58.134	2025-11-11 19:00:58.166753	2025-11-11 19:00:58.166753
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.divisions (id, code, name, is_active, created_at, updated_at) FROM stdin;
e51ccbf7-3477-49dd-948d-0d80fadbf2a5	1	ADMINISTRATIVO	t	2025-11-11 18:49:59.964597	2025-11-11 18:49:59.964597
3a731a2b-842e-4340-92af-e98e2d7e5665	2	FACILITIES	t	2025-11-11 18:50:00.031595	2025-11-11 18:50:00.031595
1c2ea93e-9e97-46c0-ac47-b83954a47d3d	3	INDUSTRIAL	t	2025-11-11 18:50:00.089529	2025-11-11 18:50:00.089529
a950d03a-cfca-41d2-a376-59d5ac32f021	4	LOGISTICA	t	2025-11-11 18:50:00.148971	2025-11-11 18:50:00.148971
c255fa6d-7c7a-4974-ab31-fd31c4d71168	5	MANUTENCAO	t	2025-11-11 18:50:00.209355	2025-11-11 18:50:00.209355
6a52b2fc-1ec7-41e6-a156-91cbfd9e69de	6	ENGENHARIA	t	2025-11-11 18:50:00.269277	2025-11-11 18:50:00.269277
450845c1-6fb4-4a61-8165-4a25f130c3e8	7	MOBILIDADE	t	2025-11-11 18:50:00.329242	2025-11-11 18:50:00.329242
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employees (id, employee_code, name, company_id, department, "position", is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.integration_settings (id, integration_type, config_key, config_value, is_encrypted, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: interview_criteria; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.interview_criteria (id, interview_id, criterion, score, notes) FROM stdin;
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.interviews (id, application_id, interviewer_id, stage_id, type, scheduled_at, duration, location, status, score, feedback, recommendations, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, organization_id, invoice_number, description, amount, due_date, paid_date, status, payment_method, boleto_url, boleto_barcode, boleto_digitable_line, pix_qr_code, pix_qr_code_text, external_id, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_approval_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_approval_history (id, job_id, workflow_step_id, step_name, step_order, status, approved_by, comments, approved_at, created_at, updated_at, approved_by_2, approved_at_2) FROM stdin;
6bfec018-4f9d-43fe-8655-468d139b859f	c90328cd-ec9a-4c00-bf11-8bafb48e6257	48339572-3654-4993-b556-7c742f28417e	Dupla Alçada - Etapa 1	1	pending	\N	\N	\N	2025-11-11 21:56:49.256968	2025-11-11 21:56:49.256968	\N	\N
6e62e9c9-bb80-4310-b3df-617feba64c19	c90328cd-ec9a-4c00-bf11-8bafb48e6257	48339572-3654-4993-b556-7c742f28417e	Etapa 1	1	approved	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	teste	2025-11-11 21:59:33.538	2025-11-11 21:59:33.571216	2025-11-11 21:59:33.571216	\N	\N
bc7683a9-6064-4ef6-88f4-067e0e2d3daf	057358c7-b2e4-4824-b77e-cba574c9c846	c980893f-ed0f-415a-b4a1-9a3f2340b70c	Etapa 1	1	approved	37612170-8e14-40cd-ac66-3c6a6ffd093a	teste	2025-11-11 23:16:04.348	2025-11-11 23:16:04.381863	2025-11-11 23:16:27.852	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-11 23:16:27.852
\.


--
-- Data for Name: job_benefits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_benefits (id, job_id, benefit_id, created_at) FROM stdin;
\.


--
-- Data for Name: job_status_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_status_history (id, job_id, previous_status, new_status, changed_by, changed_at) FROM stdin;
9a6e5ab6-6f60-4023-858f-823bfea5ae06	057358c7-b2e4-4824-b77e-cba574c9c846	aprovada	finalizada	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-12 00:29:18.133153
4087b0ae-e3fa-4e0f-8ca7-64acff7a03ac	057358c7-b2e4-4824-b77e-cba574c9c846	finalizada	concluida	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-12 00:29:27.439078
99c033ee-54cf-450a-a534-41d9eb0ba5e4	c5816c70-7fdd-42af-b360-034914dca1f2	nova_vaga	finalizada	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-12 00:53:03.038674
79804085-fd4a-48ff-bd58-8c96f2734822	c90328cd-ec9a-4c00-bf11-8bafb48e6257	aprovada	finalizada	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-12 00:53:18.067608
7b4ac236-0fb7-4a21-9d68-aaaf5944002b	00b3d931-ff7c-4c09-92d7-f36dabd664f5	nova_vaga	em_dp	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-12 00:53:24.36287
\.


--
-- Data for Name: job_statuses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_statuses (id, key, label, variant, color, description, display_order, is_default, is_active, created_at, updated_at, is_final) FROM stdin;
2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	aprovada	Vaga Aprovada	default	#3bf7a6		1	f	t	2025-11-11 18:24:32.327329	2025-11-11 18:24:32.327329	f
2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	em_dp	Departamento Pessoal	default	#19396b		2	f	t	2025-11-11 18:24:52.484435	2025-11-11 18:24:52.484435	f
733daa89-b7d8-4403-b289-cb47947d4a95	finalizada	Admitido	default	#4eaa27		3	f	t	2025-11-11 18:25:14.787089	2025-11-11 18:25:14.787089	f
368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	nova_vaga	Nova Vagass	default		teste	0	f	t	2025-11-11 18:24:03.195623	2025-11-11 18:38:10.675	f
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.jobs (id, job_code, title, profession_id, description, requirements, company_id, cost_center_id, cost_center_description, work_position, recruiter_id, department, location, contract_type, job_type, opening_date, start_date, opening_reason, replacement_employee_name, age_range_min, age_range_max, specifications, client_id, vacancy_quantity, gender, work_scale_id, work_hours, salary_min, bonus, has_hazard_pay, unhealthiness_level, kanban_board_id, status, created_by, expires_at, sla_deadline, notes, completed_at, admission_date, hired_candidate_id, approval_workflow_id, approval_status, current_approval_step, approved_by, approved_at, created_with_irregularity, created_at, updated_at) FROM stdin;
3216aa74-71a3-401d-9552-2b1d10b7ea3b	LOC001	\N	0d283998-3a1a-4210-99c3-33642558cf6a	adas	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	ca9118be-8cb9-4bff-86f6-6131ab37e164	\N	\N	\N	ADMINISTRATIVO	Abaetetuba	pj	produtiva	2025-11-11 00:00:00	2025-11-25 00:00:00	aumento_quadro	\N	18	65	rewe	607dbda8-0553-4817-bcd1-0827084cc7fb	1	masculino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1500.00	\N	f	nao	\N	nova_vaga	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-25 21:44:33.061	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-11 21:44:33.596382	2025-11-11 21:44:33.596382
00381c1c-c564-4140-a45b-55d618b6830d	LOC002	\N	78ae89e4-a63c-4f81-b97b-15c2b3734095	ewewwe	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	dc84a7f7-c48e-45fc-8daf-d7fdd4092556	\N	\N	\N	ADMINISTRATIVO	Altos	pj	improdutiva	2025-11-11 00:00:00	2025-11-26 00:00:00	aumento_quadro	\N	18	35	ewdew	607dbda8-0553-4817-bcd1-0827084cc7fb	1	masculino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1500.00	\N	f	nao	\N	nova_vaga	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-25 21:54:46.019	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-11 21:54:46.553367	2025-11-11 21:54:46.553367
b5e00cc4-2e3e-474e-b418-a5771919d0e3	LOC003	\N	78ae89e4-a63c-4f81-b97b-15c2b3734095	dasdas	\N	5e7417e0-9e91-4234-a182-c89f89920532	\N	\N	\N	\N	ADMINISTRATIVO	Alto Alegre	pj	produtiva	2025-11-11 00:00:00	2025-11-25 00:00:00	aumento_quadro	\N	18	65	dsadsaads	607dbda8-0553-4817-bcd1-0827084cc7fb	1	masculino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1498.00	\N	f	nao	\N	nova_vaga	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-25 22:39:05.568	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-11 22:39:06.100179	2025-11-11 22:39:06.100179
c5816c70-7fdd-42af-b360-034914dca1f2	LOC006	\N	10db9e0b-5a24-4940-b3d4-c4c64c58bdac	adsadsadsadsads	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c8554c42-f92a-4645-bb61-887c6a596196	\N	\N	\N	ADMINISTRATIVO	Alvorada	pj	produtiva	2025-11-11 00:00:00	2026-11-26 00:00:00	aumento_quadro	\N	18	65	adsdsadsadsads	607dbda8-0553-4817-bcd1-0827084cc7fb	1	masculino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1800.00	\N	f	nao	\N	finalizada	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-26 00:50:56.234	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-12 00:50:56.783041	2025-11-12 00:53:03.074
c90328cd-ec9a-4c00-bf11-8bafb48e6257	\N	\N	78ae89e4-a63c-4f81-b97b-15c2b3734095	VAGA DE TESTE COM WORKFLOW - Assistente Administrativo	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	dc84a7f7-c48e-45fc-8daf-d7fdd4092556	\N	\N	\N	ADMINISTRATIVO	Altos	pj	improdutiva	2025-11-11 21:56:40.009821	2025-11-26 21:56:40.009821	aumento_quadro	\N	18	45	\N	607dbda8-0553-4817-bcd1-0827084cc7fb	1	masculino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	08:00 às 17:00	2500.00	\N	f	nao	\N	finalizada	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-25 21:56:40.009821	\N	\N	\N	\N	886acb6b-1ebb-4f51-89b3-d2f3673a2838	approved	1	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-11 21:59:33.663	f	2025-11-11 21:56:40.009821	2025-11-12 00:53:18.096
00b3d931-ff7c-4c09-92d7-f36dabd664f5	LOC005	\N	10db9e0b-5a24-4940-b3d4-c4c64c58bdac	sdfdsfdfs	\N	5e7417e0-9e91-4234-a182-c89f89920532	8bf6db68-67ca-4830-9262-debc18ce4d61	\N	\N	\N	FACILITIES	Alto Alegre	clt	produtiva	2025-11-11 00:00:00	2026-11-26 00:00:00	aumento_quadro	\N	18	65	fdsfdssdf	607dbda8-0553-4817-bcd1-0827084cc7fb	1	feminino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1500.00	\N	f	nao	\N	em_dp	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-26 00:43:13.073	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-12 00:43:13.40437	2025-11-12 00:53:24.389
490a41fd-95bb-4a59-9ef1-c9589ccdba2b	LOC007	\N	71232e5a-c913-4308-ae29-b5809cd24dff	faeafeaefaefaef	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	ca9118be-8cb9-4bff-86f6-6131ab37e164	\N	\N	\N	ADMINISTRATIVO	Aparecida de Goiânia	clt	produtiva	2025-11-11 00:00:00	2026-11-26 00:00:00	aumento_quadro	\N	18	65	efefaeffeaefa	607dbda8-0553-4817-bcd1-0827084cc7fb	1	feminino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1800.00	\N	f	nao	\N	nova_vaga	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-26 00:55:18.783	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-12 00:55:19.395949	2025-11-12 00:55:19.395949
c5aeed76-919a-4abc-bf3b-38142f27e12a	LOC008	\N	71232e5a-c913-4308-ae29-b5809cd24dff	faeafeaefaefaef	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	ca9118be-8cb9-4bff-86f6-6131ab37e164	\N	\N	\N	ADMINISTRATIVO	Aparecida de Goiânia	clt	produtiva	2025-11-11 00:00:00	2026-11-26 00:00:00	aumento_quadro	\N	18	65	efefaeffeaefa	607dbda8-0553-4817-bcd1-0827084cc7fb	1	feminino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	1800.00	\N	f	nao	\N	nova_vaga	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-26 00:55:40.032	\N	\N	\N	\N	\N	pending	\N	\N	\N	f	2025-11-12 00:55:40.607918	2025-11-12 00:55:40.607918
057358c7-b2e4-4824-b77e-cba574c9c846	LOC004	\N	71232e5a-c913-4308-ae29-b5809cd24dff	ddsds	\N	767c65ac-b94f-4187-b6c2-f310cc7cac4f	c8554c42-f92a-4645-bb61-887c6a596196	\N	\N	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	ADMINISTRATIVO	Abaetetuba	clt	produtiva	2025-11-11 00:00:00	2025-11-26 00:00:00	aumento_quadro	\N	18	65	dsdsds	607dbda8-0553-4817-bcd1-0827084cc7fb	1	masculino	e2a73107-a816-44fe-ba8a-0e3f3cc45b45	09:01 às 18:01 (Intervalos: teste)	2000.00	\N	f	nao	\N	concluida	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	\N	2025-11-25 22:52:24.452	\N	2025-11-12 00:29:27.467	2025-11-12 00:00:00	3446b91c-9f8b-4bdd-a90b-ad90f2941e0b	fdaec6c5-7573-4292-8053-eb847c092317	approved	1	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	2025-11-11 23:16:27.97	f	2025-11-11 22:52:24.983139	2025-11-12 00:29:27.467
\.


--
-- Data for Name: kanban_boards; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kanban_boards (id, name, description, is_default, created_at, updated_at) FROM stdin;
kanban-1762886368370	Processo padrão		t	2025-11-11 18:39:28.37	2025-11-12 00:22:40.955
\.


--
-- Data for Name: kanban_stages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kanban_stages (id, kanban_board_id, name, "order", color, created_at) FROM stdin;
71213ac6-0913-4c59-a92e-5d12966d1f96	kanban-1762886368370	Candidatos	1	bg-purple-500	2025-11-11 18:39:28.802
a6048327-5ec9-4148-beea-f297e773197d	kanban-1762886368370	Em entrevista	2	bg-green-500	2025-11-11 18:39:28.814
29861c03-6750-4e51-b592-de70f56dd11b	kanban-1762886368370	Admitido	4	bg-yellow-500	2025-11-11 18:39:28.808
9ab4b76b-65fa-418d-b79c-f2d42b316b55	kanban-1762886368370	Aprovados	3	bg-blue-500	2025-11-11 18:39:28.81
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organizations (id, name, slug, cnpj, contact_name, contact_email, contact_phone, address, logo, is_active, max_users, plan_type, monthly_price, created_at, updated_at) FROM stdin;
a6b0e84d-df56-45ab-810b-310f100cd760	Grupo OPUS	OPUS	23123123312312312	Ricardo					t	50	basic	0.00	2025-11-11 18:27:27.213307	2025-11-11 18:27:27.213307
b99e4a03-8e2c-4b27-a48a-5a423da8dec0	Telos Consultoria	Telos	2908098234034928	Bruno	brunO@gmail.com	4165546454			t	50	basic	0.00	2025-11-11 20:54:54.742692	2025-11-11 20:54:54.742692
\.


--
-- Data for Name: payment_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_history (id, invoice_id, amount, payment_date, payment_method, transaction_id, status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.plans (id, name, description, monthly_price, yearly_price, max_users, max_jobs, features, is_active, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: professions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.professions (id, name, description, category, "union", cbo_code, is_active, created_at, updated_at, senior_id, senior_establishment, imported_from_senior, last_synced_at) FROM stdin;
198f5e72-dd9e-47e4-bc41-51735aab1dbe	ESPECIALISTA DE PRODUTOS JR	\N	\N	\N	354120	t	2025-11-11 19:54:41.849908	2025-11-11 19:54:41.849908	10-737	10	t	2025-11-11 19:54:41.819
d9eb8423-5b5c-4e01-ae2d-ea7c90714650	INSPETOR DE FORNECEDORES III	\N	\N	\N	782220	t	2025-11-11 19:54:46.350037	2025-11-11 19:54:46.350037	1-112	1	t	2025-11-11 19:54:46.135
05f16d74-2c1a-47d4-bb70-9ce29af956dc	INSPETOR DE QUALIDADE	\N	\N	\N	391205	t	2025-11-11 19:54:46.409925	2025-11-11 19:54:46.409925	1-29	1	t	2025-11-11 19:54:46.377
8b521754-50e5-4bc3-8258-05e723d4151f	INSTRUTOR TECNICO DE TREINAMENTO PLENO	\N	\N	\N	233210	t	2025-11-11 19:54:49.618507	2025-11-11 19:54:49.618507	10-329	10	t	2025-11-11 19:54:49.4
b1c7d175-b7fa-4aad-afb4-38a353b7746c	JARDINEIRO	\N	\N	\N	622010	t	2025-11-11 19:54:49.679689	2025-11-11 19:54:49.679689	10-0057	10	t	2025-11-11 19:54:49.647
09b1909e-a192-4578-b054-8dc6a7b4d222	LIDER DE PLANEJAMENTO	\N	\N	\N	391130	t	2025-11-11 19:54:53.19942	2025-11-11 19:54:53.19942	10-689	10	t	2025-11-11 19:54:52.986
e8fed37e-d23b-4f9e-b63e-47db125d37fe	LIDER DE PRODUCAO	\N	\N	\N	391125	t	2025-11-11 19:54:53.260315	2025-11-11 19:54:53.260315	10-0058	10	t	2025-11-11 19:54:53.227
71232e5a-c913-4308-ae29-b5809cd24dff	ABASTECEDOR	\N	\N	\N	784205	t	2025-11-11 19:53:43.687737	2025-11-11 19:53:43.687737	10-520	10	t	2025-11-11 19:53:43.653
0d283998-3a1a-4210-99c3-33642558cf6a	ABASTECEDOR TÉCNICO	\N	\N	\N	513425	t	2025-11-11 19:53:43.756249	2025-11-11 19:53:43.756249	10-903	10	t	2025-11-11 19:53:43.723
10db9e0b-5a24-4940-b3d4-c4c64c58bdac	ADVOGADO JR	\N	\N	\N	241005	t	2025-11-11 19:53:43.814924	2025-11-11 19:53:43.814924	10-732	10	t	2025-11-11 19:53:43.782
78ae89e4-a63c-4f81-b97b-15c2b3734095	AGENTE DE APOIO DIURNO	\N	\N	\N	517420	t	2025-11-11 19:53:43.874065	2025-11-11 19:53:43.874065	10-142	10	t	2025-11-11 19:53:43.841
f450f912-6acc-4f64-9b61-d6fba2731887	AGENTE DE APOIO NOTUNRO	\N	\N	\N	517420	t	2025-11-11 19:53:43.932892	2025-11-11 19:53:43.932892	10-143	10	t	2025-11-11 19:53:43.9
45c0d950-444d-4c36-a3f6-f4a9959f19c1	AGENTE DE HIGIENIZAÇÃO	\N	\N	\N	514225	t	2025-11-11 19:53:43.994146	2025-11-11 19:53:43.994146	10-127	10	t	2025-11-11 19:53:43.96
0a78feba-c78a-4c64-bb15-ce6354d84dcb	AGENTE DE HIGIENIZAÇÃO II	\N	\N	\N	514225	t	2025-11-11 19:53:44.054411	2025-11-11 19:53:44.054411	10-880	10	t	2025-11-11 19:53:44.021
f92fc57a-3c54-4484-b8a2-240fc78467bd	AGENTE DE HIGIENIZACAO SP	\N	\N	\N	519935	t	2025-11-11 19:53:44.117043	2025-11-11 19:53:44.117043	10-363	10	t	2025-11-11 19:53:44.082
2dc8a5e6-d383-4451-a58d-3cbe0c1b5d68	AJUDANDE DE PRODUÇÃO - NELSON GLOBAL	\N	\N	\N	784205	t	2025-11-11 19:53:44.176972	2025-11-11 19:53:44.176972	10-0002	10	t	2025-11-11 19:53:44.143
50daeb4a-c195-482b-8f0b-7c7806c61697	MOLDADOR 	\N	\N	\N	862150	t	2025-11-11 19:54:57.523331	2025-11-11 19:54:57.523331	10-454	10	t	2025-11-11 19:54:57.302
fc79f004-31df-438a-9aa9-04a10fe3cf1e	AJUDANTE	\N	\N	\N	784205	t	2025-11-11 19:53:44.320266	2025-11-11 19:53:44.320266	10-687	10	t	2025-11-11 19:53:44.286
673bfaa5-221d-4d7b-8a9e-cbfa03f65a78	AJUDANTE DE ARMAZEM	\N	\N	\N	783210	t	2025-11-11 19:53:44.384777	2025-11-11 19:53:44.384777	10-626	10	t	2025-11-11 19:53:44.352
5fedaed1-15ec-4084-a477-de98a3cd2a7b	AJUDANTE DE JARDINEIRO	\N	\N	\N	622010	t	2025-11-11 19:53:44.444591	2025-11-11 19:53:44.444591	10-130	10	t	2025-11-11 19:53:44.412
baa4c5d1-b712-491e-9953-8ecb05c98090	AJUDANTE DE MANUTENÇAO	\N	\N	\N	914305	t	2025-11-11 19:53:44.505445	2025-11-11 19:53:44.505445	10-499	10	t	2025-11-11 19:53:44.472
3ba69ddf-0256-456b-ac2e-6e5f5559b722	AJUDANTE DE MOTORISTA	\N	\N	\N	783225	t	2025-11-11 19:53:44.564917	2025-11-11 19:53:44.564917	6-17	6	t	2025-11-11 19:53:44.532
daa39894-c6ee-464c-abaf-41ebe5681b86	AJUDANTE DE PEDREIRO	\N	\N	\N	717020	t	2025-11-11 19:53:44.624478	2025-11-11 19:53:44.624478	7-12	7	t	2025-11-11 19:53:44.592
69ddc3d7-890c-4f2b-8936-cb862fe0fd3a	MONITOR	\N	\N	\N	782305	t	2025-11-11 19:54:57.584087	2025-11-11 19:54:57.584087	10-539	10	t	2025-11-11 19:54:57.551
77646adf-e137-4f18-afb0-0dd12957a8af	AJUDANTE DE PINTURA	\N	\N	\N	716610	t	2025-11-11 19:53:44.744456	2025-11-11 19:53:44.744456	6-55	6	t	2025-11-11 19:53:44.712
60de2173-a89e-4af8-9cdd-b168a0b3a386	AJUDANTE DE PRODUÇÃO - PELZER BA	\N	\N	\N	784205	t	2025-11-11 19:53:44.805177	2025-11-11 19:53:44.805177	6-24	6	t	2025-11-11 19:53:44.773
467d61d7-b5cb-495d-8c14-4c3aef2c55de	AJUDANTE DE VARRICAO	\N	\N	\N	992225	t	2025-11-11 19:53:44.865543	2025-11-11 19:53:44.865543	10-575	10	t	2025-11-11 19:53:44.833
ea4a58a5-861c-4ea8-b4f6-1dd4e9aeb7c3	AJUDANTE DE VARRIÇÃO	\N	\N	\N	514320	t	2025-11-11 19:53:44.925973	2025-11-11 19:53:44.925973	10-548	10	t	2025-11-11 19:53:44.893
ff963f67-6f45-411e-b766-968f12d76c45	AJUDANTE GERAL	\N	\N	\N	784205	t	2025-11-11 19:53:44.985413	2025-11-11 19:53:44.985413	10-181	10	t	2025-11-11 19:53:44.953
7ab4eac8-ad4d-49c1-998f-7001b9d49290	AJUDANTE I	\N	\N	\N	784205	t	2025-11-11 19:53:45.045864	2025-11-11 19:53:45.045864	10-560	10	t	2025-11-11 19:53:45.013
1130ab02-125a-4219-92b0-0f89cb0150b7	AJUDANTE III	\N	\N	\N	784205	t	2025-11-11 19:53:45.106192	2025-11-11 19:53:45.106192	10-500	10	t	2025-11-11 19:53:45.073
01c35258-45a7-4980-9c03-326e43aeeff8	AJUDANTE OPERACIONAL	\N	\N	\N	784205	t	2025-11-11 19:53:45.166108	2025-11-11 19:53:45.166108	10-590	10	t	2025-11-11 19:53:45.133
9cce6b2a-12bc-4e6d-a957-081438a723e2	ALMOXARIFADO	\N	\N	\N	414105	t	2025-11-11 19:53:45.22671	2025-11-11 19:53:45.22671	10-906	10	t	2025-11-11 19:53:45.194
e0434d2f-3f41-4be6-9755-b4a6e9f83e8d	ALMOXARIFADO III	\N	\N	\N	414105	t	2025-11-11 19:53:45.286619	2025-11-11 19:53:45.286619	10-561	10	t	2025-11-11 19:53:45.254
220fe536-878c-4637-b211-e5f50298631d	ALMOXARIFE	\N	\N	\N	414105	t	2025-11-11 19:53:45.346602	2025-11-11 19:53:45.346602	10-202	10	t	2025-11-11 19:53:45.314
c773a144-c394-40f8-9585-1bd42d49874e	ALMOXARIFE JR	\N	\N	\N	414105	t	2025-11-11 19:53:45.406205	2025-11-11 19:53:45.406205	10-2022	10	t	2025-11-11 19:53:45.374
a6f68d66-a672-41f4-99c7-44237204ceb7	ALMOXARIFE TECNICO	\N	\N	\N	414105	t	2025-11-11 19:53:45.465673	2025-11-11 19:53:45.465673	10-613	10	t	2025-11-11 19:53:45.433
446fc033-4537-44aa-8f8e-19f785915558	ANAALISTA DE T&D	\N	\N	\N	233210	t	2025-11-11 19:53:45.525301	2025-11-11 19:53:45.525301	10-357	10	t	2025-11-11 19:53:45.493
8059289d-cfe7-496e-820c-eb56f440d0a6	ANAL CONTAS A PAGAR/RECEBER JR	\N	\N	\N	410105	t	2025-11-11 19:53:45.584602	2025-11-11 19:53:45.584602	10-739	10	t	2025-11-11 19:53:45.552
29526a23-1618-4039-b23f-2a33b44a0064	ANAL DE DESENV DE PRODUTO I	\N	\N	\N	395105	t	2025-11-11 19:53:45.643704	2025-11-11 19:53:45.643704	10-220	10	t	2025-11-11 19:53:45.611
900c89ce-b8f6-4955-b42f-51dc50ad2aea	ANAL DE DESENV DE PRODUTO II	\N	\N	\N	395105	t	2025-11-11 19:53:45.704027	2025-11-11 19:53:45.704027	10-221	10	t	2025-11-11 19:53:45.671
0bd25e55-7ded-4fba-b885-f87b7a8800db	ANAL DE DESENV DE PRODUTO III	\N	\N	\N	395105	t	2025-11-11 19:53:45.76349	2025-11-11 19:53:45.76349	10-222	10	t	2025-11-11 19:53:45.731
f0a7e1e2-2125-443b-b420-52b11b1de532	ANAL DE DESENV DE PRODUTO IV	\N	\N	\N	395105	t	2025-11-11 19:53:45.823131	2025-11-11 19:53:45.823131	10-223	10	t	2025-11-11 19:53:45.791
7a12a890-e563-4f66-8e47-e6840a0db8c7	ANAL DE DESENV DE PRODUTO JR	\N	\N	\N	395105	t	2025-11-11 19:53:45.881917	2025-11-11 19:53:45.881917	10-295	10	t	2025-11-11 19:53:45.85
cf5d3aca-c888-4772-9af7-60fbbbd86938	ANAL DE DESENV DE PRODUTO SR	\N	\N	\N	395105	t	2025-11-11 19:53:45.941219	2025-11-11 19:53:45.941219	10-298	10	t	2025-11-11 19:53:45.909
61434bd6-247f-4bc2-a2e7-59ed0c7edf1a	ANAL DE DESENV DE PRODUTO SR I	\N	\N	\N	395105	t	2025-11-11 19:53:46.002278	2025-11-11 19:53:46.002278	10-313	10	t	2025-11-11 19:53:45.97
3f2ac7a3-e2e8-440a-b560-d1bb73d6b95d	ANAL DE DESENV DE PRODUTO SR II	\N	\N	\N	395105	t	2025-11-11 19:53:46.061146	2025-11-11 19:53:46.061146	10-314	10	t	2025-11-11 19:53:46.029
3488b6e0-ca87-4d94-bd3c-9e38a80ac3bb	ANAL DE DESENV DE PRODUTO SR III	\N	\N	\N	395105	t	2025-11-11 19:53:46.120078	2025-11-11 19:53:46.120078	10-315	10	t	2025-11-11 19:53:46.088
c38da467-a08b-4d10-9dc3-ab334379b05d	ANAL DE DESENV DE PRODUTO V	\N	\N	\N	395105	t	2025-11-11 19:53:46.179518	2025-11-11 19:53:46.179518	10-224	10	t	2025-11-11 19:53:46.147
a2f9179b-286c-4d17-a006-8f0210540cd0	ANAL DE DESENV DE PRODUTO XII	\N	\N	\N	395105	t	2025-11-11 19:53:46.239499	2025-11-11 19:53:46.239499	10-259	10	t	2025-11-11 19:53:46.206
58896ab5-54ca-4ecc-be07-402ca0b4e1b4	ANAL DE DESENV PRODUTO JR II	\N	\N	\N	395105	t	2025-11-11 19:53:46.299629	2025-11-11 19:53:46.299629	10-308	10	t	2025-11-11 19:53:46.267
f02f5f2e-5636-4b28-a976-7ad4557f4e3d	ANAL DE DESENV PRODUTO JR III	\N	\N	\N	395105	t	2025-11-11 19:53:46.35869	2025-11-11 19:53:46.35869	10-309	10	t	2025-11-11 19:53:46.326
442b015f-698b-49a9-a43a-21e57b671d63	ANAL DE EXECUCAO COMERCIAL SR	\N	\N	\N	142335	t	2025-11-11 19:53:46.418983	2025-11-11 19:53:46.418983	10-851	10	t	2025-11-11 19:53:46.386
a33ef563-42a7-4543-920e-56685fdc5bad	ANALISTA ADM E FINANCAS JR	\N	\N	\N	251215	t	2025-11-11 19:53:46.482089	2025-11-11 19:53:46.482089	10-607	10	t	2025-11-11 19:53:46.449
5b93ceaa-a559-40cd-8e33-5f47ccbdb749	ANALISTA ADM PLENO	\N	\N	\N	252105	t	2025-11-11 19:53:46.541238	2025-11-11 19:53:46.541238	10-186	10	t	2025-11-11 19:53:46.509
e52635d8-a6ad-4406-8378-043517335b72	ANALISTA ADM SENIOR	\N	\N	\N	252105	t	2025-11-11 19:53:46.601011	2025-11-11 19:53:46.601011	10-372	10	t	2025-11-11 19:53:46.568
0dae5103-8e70-4c26-bb06-27e37c72857e	ANALISTA ADMINISTRATIVO	\N	\N	\N	252105	t	2025-11-11 19:53:46.660657	2025-11-11 19:53:46.660657	10-327	10	t	2025-11-11 19:53:46.628
7d595113-7a44-439e-8bda-d3c844fc3f38	ESPECIALISTA EM DEPTO.PESSOAL	\N	\N	\N	413105	t	2025-11-11 19:54:41.909875	2025-11-11 19:54:41.909875	10-471	10	t	2025-11-11 19:54:41.877
5ecfbe52-04f9-4b50-ad76-a7b70d5292cf	ESPECIALISTA FINANCEIRO	\N	\N	\N	252545	t	2025-11-11 19:54:41.969247	2025-11-11 19:54:41.969247	10-514	10	t	2025-11-11 19:54:41.937
61f998ba-643c-4c33-8c3a-44bf2ccceb4c	ESPECIALISTA JR	\N	\N	\N	262410	t	2025-11-11 19:54:42.030008	2025-11-11 19:54:42.030008	10-429	10	t	2025-11-11 19:54:41.996
e81ddd9d-4ae9-4ee9-a8e2-97e890690ee9	ANALISTA ADMINISTRATIVO FINANCEIRO	\N	\N	\N	410105	t	2025-11-11 19:53:46.910931	2025-11-11 19:53:46.910931	1-5	1	t	2025-11-11 19:53:46.873
5c65dccd-8509-4e8f-b5ae-e3b2170bdb3d	ESPECIALISTA MELHORIA CONT JR	\N	\N	\N	391210	t	2025-11-11 19:54:42.08936	2025-11-11 19:54:42.08936	10-637	10	t	2025-11-11 19:54:42.057
7d433365-6ff3-4c9f-9ffc-fbec83c00484	ESPECIALISTA PL	\N	\N	\N	262410	t	2025-11-11 19:54:42.148625	2025-11-11 19:54:42.148625	10-430	10	t	2025-11-11 19:54:42.116
f57de3d5-bf5d-442f-afd2-7272990f4c11	ANALISTA ADMINISTRATIVO JR - AKER	\N	\N	\N	252105	t	2025-11-11 19:53:47.092802	2025-11-11 19:53:47.092802	6-70	6	t	2025-11-11 19:53:47.059
c98a9b94-7320-4977-b8bf-b0d9431df4e1	ESPECIALISTA SR	\N	\N	\N	262410	t	2025-11-11 19:54:42.207358	2025-11-11 19:54:42.207358	10-431	10	t	2025-11-11 19:54:42.175
e4e104ef-29ac-4ccc-9912-2a925993cdc3	ANALISTA BP RH SUPPLY CHAIN JR	\N	\N	\N	252405	t	2025-11-11 19:53:47.221453	2025-11-11 19:53:47.221453	10-701	10	t	2025-11-11 19:53:47.187
c4273fa2-813a-49d8-82f5-bab6cb5f14a4	ANALISTA BP RH SUPPLY CHAIN SR	\N	\N	\N	252405	t	2025-11-11 19:53:47.282024	2025-11-11 19:53:47.282024	10-649	10	t	2025-11-11 19:53:47.249
d7007784-7958-4f44-aa75-08793948af39	ANALISTA CENTRO SERVICOS RH JR	\N	\N	\N	252405	t	2025-11-11 19:53:47.342373	2025-11-11 19:53:47.342373	10-593	10	t	2025-11-11 19:53:47.309
c827bf74-8aa9-4319-958b-2fbccbff1eec	ANALISTA CENTRO SERVICOS RH PL	\N	\N	\N	252405	t	2025-11-11 19:53:47.404196	2025-11-11 19:53:47.404196	10-600	10	t	2025-11-11 19:53:47.37
5a339219-a751-4849-af02-01344d08593c	ANALISTA COMERCIAL	\N	\N	\N	520110	t	2025-11-11 19:53:47.464499	2025-11-11 19:53:47.464499	10-0104	10	t	2025-11-11 19:53:47.431
d1a0e872-f4d0-4150-8494-8d6a97807c0a	ESTAGIARIO 	\N	\N	\N	411005	t	2025-11-11 19:54:42.267227	2025-11-11 19:54:42.267227	10-0041	10	t	2025-11-11 19:54:42.234
9f41947a-c725-40a8-b240-6e31f3fc4d10	ANALISTA COMERCIO EXTERIOR PL	\N	\N	\N	354305	t	2025-11-11 19:53:47.585296	2025-11-11 19:53:47.585296	10-482	10	t	2025-11-11 19:53:47.552
c48c0007-71e3-47cb-bd12-45d73a457bb2	ANALISTA CONTABIL PL	\N	\N	\N	252210	t	2025-11-11 19:53:47.64758	2025-11-11 19:53:47.64758	10-741	10	t	2025-11-11 19:53:47.615
059dd0d0-526b-49ab-961f-d81b97affa5b	ANALISTA CONTÁBIL PLENO	\N	\N	\N	252210	t	2025-11-11 19:53:47.708011	2025-11-11 19:53:47.708011	10-0008	10	t	2025-11-11 19:53:47.675
eef11859-b60d-44a6-bc3e-40d7c714cbb8	ESTAGIARIO	\N	\N	\N	411005	t	2025-11-11 19:54:42.327501	2025-11-11 19:54:42.327501	1-125	1	t	2025-11-11 19:54:42.294
512c9cf0-d515-4d48-9092-761bd7c9ac63	ANALISTA DA QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:53:48.014902	2025-11-11 19:53:48.014902	10-190	10	t	2025-11-11 19:53:47.797
5bc82b7a-2773-4010-806f-918a90f4913f	ESTAGIARIO - COMERCIAL	\N	\N	\N	411005	t	2025-11-11 19:54:42.386802	2025-11-11 19:54:42.386802	1-135	1	t	2025-11-11 19:54:42.355
27664cbb-d690-4705-872d-1be52d4b1408	ANALISTA DA QUALIDADE E PROCESSOS	\N	\N	\N	391210	t	2025-11-11 19:53:48.323486	2025-11-11 19:53:48.323486	1-90	1	t	2025-11-11 19:53:48.102
61bb6104-df85-4e4d-8029-7abb4867e168	ANALISTA DA QUALIDADE JR	\N	\N	\N	391210	t	2025-11-11 19:53:48.384534	2025-11-11 19:53:48.384534	10-625	10	t	2025-11-11 19:53:48.351
00060727-d9ef-4433-8da4-a96b604fc50b	ANALISTA DA QUALIDADE PLENO	\N	\N	\N	391210	t	2025-11-11 19:53:48.445442	2025-11-11 19:53:48.445442	1-36	1	t	2025-11-11 19:53:48.412
1472a8bb-3226-4870-b1a5-8f5720ee6359	ANALISTA DE BENCHMARKING I	\N	\N	\N	142335	t	2025-11-11 19:53:48.505753	2025-11-11 19:53:48.505753	10-234	10	t	2025-11-11 19:53:48.473
0d30fe85-f2f4-440f-8dd8-cb22835d6876	ANALISTA DE BENCHMARKING II	\N	\N	\N	142335	t	2025-11-11 19:53:48.566321	2025-11-11 19:53:48.566321	10-235	10	t	2025-11-11 19:53:48.533
6bf4bf0c-dd03-4a17-ac7f-8b37a4047386	ANALISTA DE BENCHMARKING III	\N	\N	\N	142335	t	2025-11-11 19:53:48.626488	2025-11-11 19:53:48.626488	10-169	10	t	2025-11-11 19:53:48.593
42ac7caf-73c6-46da-a61b-ffabbd79167f	Analista de Comércio Exterior Junior	\N	\N	\N	354305	t	2025-11-11 19:53:48.687456	2025-11-11 19:53:48.687456	6-90	6	t	2025-11-11 19:53:48.654
b98ddf29-b8b2-49bf-9807-a231c5e4e066	EXECUTIVO COMERCIAL TECNOLOGIA	\N	\N	\N	142330	t	2025-11-11 19:54:42.446235	2025-11-11 19:54:42.446235	10-406	10	t	2025-11-11 19:54:42.414
1f709a85-1cd5-4f5a-ba73-0ed278457872	ANALISTA DE COMPRA JR	\N	\N	\N	354205	t	2025-11-11 19:53:48.999521	2025-11-11 19:53:48.999521	10-192	10	t	2025-11-11 19:53:48.775
2c85553f-51f3-4f09-8c1a-1973f6fd009a	ANALISTA DE COMPRAS	\N	\N	\N	354205	t	2025-11-11 19:53:49.060585	2025-11-11 19:53:49.060585	1-89	1	t	2025-11-11 19:53:49.028
26015a02-10d3-4b11-99f8-d4f299b75086	EXECUTIVO DE NEGOCIOS	\N	\N	\N	142330	t	2025-11-11 19:54:42.506882	2025-11-11 19:54:42.506882	10-399	10	t	2025-11-11 19:54:42.474
1119bf4c-42b5-4335-8bde-0e67f5b2e1cb	ANALISTA DE COMPRAS BODY I	\N	\N	\N	354205	t	2025-11-11 19:53:49.373467	2025-11-11 19:53:49.373467	10-257	10	t	2025-11-11 19:53:49.15
230b8ea2-208f-48b0-9b38-892ef3a2dd8d	ANALISTA DE COMPRAS CHASSI	\N	\N	\N	354205	t	2025-11-11 19:53:49.434853	2025-11-11 19:53:49.434853	10-249	10	t	2025-11-11 19:53:49.401
6f87640c-1f12-4da1-bd19-d538161e0c9e	ANALISTA DE COMPRAS EMBAL SR	\N	\N	\N	354205	t	2025-11-11 19:53:49.496439	2025-11-11 19:53:49.496439	10-299	10	t	2025-11-11 19:53:49.463
670cbf2c-d988-424a-b815-d536c501d618	ANALISTA DE COMPRAS I	\N	\N	\N	354205	t	2025-11-11 19:53:49.558526	2025-11-11 19:53:49.558526	10-195	10	t	2025-11-11 19:53:49.525
36b54e59-1fdf-4511-8e68-aad4c8971df3	ANALISTA DE COMPRAS II	\N	\N	\N	354205	t	2025-11-11 19:53:49.619248	2025-11-11 19:53:49.619248	10-236	10	t	2025-11-11 19:53:49.586
c54a1728-bf53-4699-b6b5-b88b4b9a1104	ANALISTA DE COMPRAS JUNIOR I	\N	\N	\N	354205	t	2025-11-11 19:53:49.679562	2025-11-11 19:53:49.679562	10-330	10	t	2025-11-11 19:53:49.647
3d59e432-957b-46a2-8aba-c047670be3ec	ANALISTA DE COMPRAS PLENO	\N	\N	\N	354205	t	2025-11-11 19:53:49.740469	2025-11-11 19:53:49.740469	10-380	10	t	2025-11-11 19:53:49.707
43d47b31-ff5e-4bbe-9439-b465ef9e0be2	ANALISTA DE COMPRAS SENIOR	\N	\N	\N	354205	t	2025-11-11 19:53:49.800942	2025-11-11 19:53:49.800942	10-375	10	t	2025-11-11 19:53:49.768
7fd408fa-9002-485d-b3d4-7de7f2c17306	FATURISTA	\N	\N	\N	413115	t	2025-11-11 19:54:42.565561	2025-11-11 19:54:42.565561	1-123	1	t	2025-11-11 19:54:42.534
b8f02b23-7bc4-4b2b-a00d-e17d49f7df1f	ANALISTA DE CONTROLADORIA SR	\N	\N	\N	252210	t	2025-11-11 19:53:50.108705	2025-11-11 19:53:50.108705	10-403	10	t	2025-11-11 19:53:49.89
aa0afbc6-3473-48d5-a372-c818b5354f6d	ANALISTA DE CUSTO JR	\N	\N	\N	252210	t	2025-11-11 19:53:50.169629	2025-11-11 19:53:50.169629	10-416	10	t	2025-11-11 19:53:50.137
94deb5ee-1fc0-40a1-8e9f-08c775c2d8d5	ANALISTA DE CUSTO PL	\N	\N	\N	252210	t	2025-11-11 19:53:50.230274	2025-11-11 19:53:50.230274	10-418	10	t	2025-11-11 19:53:50.197
0c242cde-6e08-44a2-9645-434fc76a18b0	ANALISTA DE CUSTO SR	\N	\N	\N	252210	t	2025-11-11 19:53:50.290489	2025-11-11 19:53:50.290489	10-419	10	t	2025-11-11 19:53:50.258
6fdec8d9-bce9-49e9-8c9f-28d3f4033dc2	ANALISTA DE CUSTOS	\N	\N	\N	252210	t	2025-11-11 19:53:50.351259	2025-11-11 19:53:50.351259	10-378	10	t	2025-11-11 19:53:50.318
0daf3a2a-3308-457c-afb9-b2311625c52d	FATURISTA I	\N	\N	\N	413115	t	2025-11-11 19:54:42.624864	2025-11-11 19:54:42.624864	1-49	1	t	2025-11-11 19:54:42.593
f713bb19-ac57-4689-9465-a3b9e5e01b06	ANALISTA DE DESENV DE EMBALAGENS II	\N	\N	\N	780105	t	2025-11-11 19:53:50.655445	2025-11-11 19:53:50.655445	10-294	10	t	2025-11-11 19:53:50.441
fe5d4c9b-964d-4aa1-87f1-fc8c611f70fe	ANALISTA DE DESENVOLVIMENTO DE PRODUTO PACKING PLENO II	\N	\N	\N	318430	t	2025-11-11 19:53:50.715412	2025-11-11 19:53:50.715412	10-311	10	t	2025-11-11 19:53:50.683
7e2c3499-e96e-44fd-83aa-8d9e07baa0ae	ANALISTA DE DESENVOLVIMENTO DE SISTEMAS	\N	\N	\N	212405	t	2025-11-11 19:53:50.774206	2025-11-11 19:53:50.774206	10-0105	10	t	2025-11-11 19:53:50.742
dc37605c-866b-4bfa-8f9d-0bf68ab577e9	ANALISTA DE DESIGNER REALEASE	\N	\N	\N	262410	t	2025-11-11 19:53:50.834182	2025-11-11 19:53:50.834182	10-245	10	t	2025-11-11 19:53:50.801
9141148d-96e4-445d-907a-b858f23736d0	ANALISTA DE DESIGNER REALEASE I	\N	\N	\N	262410	t	2025-11-11 19:53:50.89316	2025-11-11 19:53:50.89316	10-237	10	t	2025-11-11 19:53:50.861
e8e053ca-ff24-450b-b7e7-74052ad8e8c8	ANALISTA DE DESIGNER REALEASE II	\N	\N	\N	262410	t	2025-11-11 19:53:50.952656	2025-11-11 19:53:50.952656	10-210	10	t	2025-11-11 19:53:50.92
8d04bded-387a-4493-a3ba-6acd0a920344	ANALISTA DE DESIGNER REALEASE III 	\N	\N	\N	262410	t	2025-11-11 19:53:51.012657	2025-11-11 19:53:51.012657	10-211	10	t	2025-11-11 19:53:50.98
759213fe-228b-46c2-af09-3836cd9578cd	ANALISTA DE DESIGNER SYSTEM	\N	\N	\N	262410	t	2025-11-11 19:53:51.072492	2025-11-11 19:53:51.072492	10-212	10	t	2025-11-11 19:53:51.04
ddd7e35b-49a1-4d22-af78-0d5d07e6172c	ANALISTA DE DHO - JR	\N	\N	\N	252405	t	2025-11-11 19:53:51.132388	2025-11-11 19:53:51.132388	10-405	10	t	2025-11-11 19:53:51.1
42072971-9ca6-43b8-831d-d7edf6238c6f	ANALISTA DE DHO - PL	\N	\N	\N	252405	t	2025-11-11 19:53:51.191811	2025-11-11 19:53:51.191811	10-540	10	t	2025-11-11 19:53:51.159
5d0bd03f-77a9-4b2c-820f-b5ecbbca17ce	ANALISTA DE DP JR	\N	\N	\N	252405	t	2025-11-11 19:53:51.251758	2025-11-11 19:53:51.251758	10-641	10	t	2025-11-11 19:53:51.219
7def7f81-b90f-429a-9713-2c9cb0a0418a	ANALISTA DE DP PL	\N	\N	\N	252405	t	2025-11-11 19:53:51.311567	2025-11-11 19:53:51.311567	10-642	10	t	2025-11-11 19:53:51.279
5492f0a0-8e3a-446b-9194-87fe699eaeb8	ANALISTA DE DP SR	\N	\N	\N	252405	t	2025-11-11 19:53:51.371303	2025-11-11 19:53:51.371303	10-643	10	t	2025-11-11 19:53:51.339
71ca303f-ff20-44d0-b07d-14bd6c091d87	ANALISTA DE E-COMMERCE	\N	\N	\N	354125	t	2025-11-11 19:53:51.431603	2025-11-11 19:53:51.431603	10-326	10	t	2025-11-11 19:53:51.399
8210621e-7a57-4e95-a5c5-5f81309ab39d	ANALISTA DE ENGENHARIA	\N	\N	\N	214330	t	2025-11-11 19:53:51.491476	2025-11-11 19:53:51.491476	10-250	10	t	2025-11-11 19:53:51.459
2027de4c-1a60-4407-897d-db870785c381	LIDER DE PRODUÇÃO COOP ATIB.	\N	\N	\N	720210	t	2025-11-11 19:54:53.558088	2025-11-11 19:54:53.558088	10-367	10	t	2025-11-11 19:54:53.346
e7ce2669-5f99-4cd9-9632-162bcf30c834	ANALISTA DE ENGENHARIA SR	\N	\N	\N	214435	t	2025-11-11 19:53:52.532187	2025-11-11 19:53:52.532187	6-16	6	t	2025-11-11 19:53:52.316
55651ba8-694a-4939-98ab-7d62f8b56e1c	ANALISTA DE FATURAMENTO	\N	\N	\N	413115	t	2025-11-11 19:53:52.591562	2025-11-11 19:53:52.591562	1-150	1	t	2025-11-11 19:53:52.559
0f59647b-6eae-4c9f-b0b9-0cf91ae1f2e2	LIDER DE PRODUÇÃO I 	\N	\N	\N	391125	t	2025-11-11 19:54:53.617577	2025-11-11 19:54:53.617577	10-580	10	t	2025-11-11 19:54:53.585
63ac3af8-cdaf-4360-b5c6-1f09da00b888	LIDER DE PRODUCAO II	\N	\N	\N	410105	t	2025-11-11 19:54:53.676551	2025-11-11 19:54:53.676551	10-364	10	t	2025-11-11 19:54:53.644
29b9b647-c022-4bf6-aaa6-e856af98be5b	ANALISTA DE GESTAO DE PESSOAS	\N	\N	\N	252405	t	2025-11-11 19:53:53.135613	2025-11-11 19:53:53.135613	1-85	1	t	2025-11-11 19:53:52.925
e438214d-f3a8-4f4e-9be2-4d70a52b4f47	ANALISTA DE IMPOSTO JR	\N	\N	\N	252210	t	2025-11-11 19:53:53.194846	2025-11-11 19:53:53.194846	10-743	10	t	2025-11-11 19:53:53.162
d35fddf2-0f06-46e6-8680-1bcb28e8520d	ANALISTA DE LOGISTICA	\N	\N	\N	252715	t	2025-11-11 19:53:53.253981	2025-11-11 19:53:53.253981	10-301	10	t	2025-11-11 19:53:53.221
71fd6a6b-8cc6-4a23-855e-b0e1c0901dcc	LIDER DE PRODUÇÃO II	\N	\N	\N	720210	t	2025-11-11 19:54:53.735253	2025-11-11 19:54:53.735253	10-365	10	t	2025-11-11 19:54:53.703
373dc348-28db-498d-92b1-eb15e0ca902d	ANALISTA DE LOGISTICA JR	\N	\N	\N	252715	t	2025-11-11 19:53:53.557219	2025-11-11 19:53:53.557219	10-617	10	t	2025-11-11 19:53:53.339
607ec272-8c86-4683-9abb-2fbdfd473835	ANALISTA DE LOGISTICA SR	\N	\N	\N	252715	t	2025-11-11 19:53:53.618582	2025-11-11 19:53:53.618582	10-785	10	t	2025-11-11 19:53:53.585
afeff637-87a2-4887-8b29-3a8e39c9a353	ANALISTA DE MARKETING	\N	\N	\N	142305	t	2025-11-11 19:53:53.679349	2025-11-11 19:53:53.679349	10-334	10	t	2025-11-11 19:53:53.646
ad066fc2-7993-412f-aa56-311542e427df	LIDER DE QUALIDADE	\N	\N	\N	391205	t	2025-11-11 19:54:53.794242	2025-11-11 19:54:53.794242	10-386	10	t	2025-11-11 19:54:53.762
e9790021-599d-4eba-be9b-fd9a291e769d	LIDER III	\N	\N	\N	391125	t	2025-11-11 19:54:53.853299	2025-11-11 19:54:53.853299	10-139	10	t	2025-11-11 19:54:53.821
0e0fbe84-0e68-4b0f-9423-4fcb293f3bde	ANALISTA DE MATERIAIS PL	\N	\N	\N	391135	t	2025-11-11 19:53:54.229819	2025-11-11 19:53:54.229819	10-684	10	t	2025-11-11 19:53:54.019
5c2ded7d-ec35-43a2-909f-76e471efcce5	ANALISTA DE PACKAGING	\N	\N	\N	318430	t	2025-11-11 19:53:54.289851	2025-11-11 19:53:54.289851	10-332	10	t	2025-11-11 19:53:54.257
1accb171-ef47-4d60-b677-fae6c6dc4742	ANALISTA DE PACKAGING PLENO	\N	\N	\N	318430	t	2025-11-11 19:53:54.348584	2025-11-11 19:53:54.348584	10-266	10	t	2025-11-11 19:53:54.316
6eb6c14b-4aed-46c8-aa13-61c6f3061715	ANALISTA DE PACKAGING SENIOR	\N	\N	\N	318430	t	2025-11-11 19:53:54.407637	2025-11-11 19:53:54.407637	10-267	10	t	2025-11-11 19:53:54.375
42c4d057-88f5-4b70-861d-015838499325	ANALISTA DE PCP	\N	\N	\N	252705	t	2025-11-11 19:53:54.466374	2025-11-11 19:53:54.466374	10-627	10	t	2025-11-11 19:53:54.434
5074b369-0e83-4cca-9ae8-e1d712c28cdb	ANALISTA DE PLANEJAMENTO	\N	\N	\N	391130	t	2025-11-11 19:53:54.524843	2025-11-11 19:53:54.524843	10-528	10	t	2025-11-11 19:53:54.492
b48b2852-f613-4db2-a950-81c96701ecd6	ANALISTA DE PLANEJAMENTO INDUSTRIAL	\N	\N	\N	391130	t	2025-11-11 19:53:54.584124	2025-11-11 19:53:54.584124	10-704	10	t	2025-11-11 19:53:54.551
02925aed-d438-4486-a7e3-ddf04cc54aa8	ANALISTA DE PLANEJAMENTO SENIOR	\N	\N	\N	391130	t	2025-11-11 19:53:54.674449	2025-11-11 19:53:54.674449	10-853	10	t	2025-11-11 19:53:54.642
ef5fcd81-61e4-450c-8cf5-b2db25e98ad3	ANALISTA DE PPM POWERTRAIN	\N	\N	\N	111510	t	2025-11-11 19:53:54.736102	2025-11-11 19:53:54.736102	10-300	10	t	2025-11-11 19:53:54.703
23a502c9-376e-4a2d-ae9a-b9b2781682b4	ANALISTA DE PROCESSOS	\N	\N	\N	391105	t	2025-11-11 19:53:54.794819	2025-11-11 19:53:54.794819	1-77	1	t	2025-11-11 19:53:54.763
09751a5a-f2ad-4a44-9ad6-9fb4ce203e10	ANALISTA DE PROCESSOS JR	\N	\N	\N	391105	t	2025-11-11 19:53:54.854883	2025-11-11 19:53:54.854883	10-422	10	t	2025-11-11 19:53:54.821
5731fb79-9091-479d-9f17-bb8d77e54c2a	ANALISTA DE PROCESSOS PL	\N	\N	\N	391105	t	2025-11-11 19:53:54.912054	2025-11-11 19:53:54.912054	10-420	10	t	2025-11-11 19:53:54.881
4bb9ae38-8335-4463-8b83-7e0e996f64ac	ANALISTA DE PROCESSOS PLENO	\N	\N	\N	391105	t	2025-11-11 19:53:54.97108	2025-11-11 19:53:54.97108	1-86	1	t	2025-11-11 19:53:54.939
7dcc1df1-efe2-41c2-89eb-ba213662da50	ANALISTA DE PROCESSOS SENIOR	\N	\N	\N	391105	t	2025-11-11 19:53:55.029503	2025-11-11 19:53:55.029503	1-84	1	t	2025-11-11 19:53:54.997
41a9de3a-0368-4c05-a865-4dcf16bacb54	ANALISTA DE PROCESSOS SR	\N	\N	\N	391105	t	2025-11-11 19:53:55.088081	2025-11-11 19:53:55.088081	10-421	10	t	2025-11-11 19:53:55.056
bcff4fbb-dc7d-4143-8007-23fb74f29ea6	ANALISTA DE PRODUTO	\N	\N	\N	351720	t	2025-11-11 19:53:55.14872	2025-11-11 19:53:55.14872	10-354	10	t	2025-11-11 19:53:55.114
092693d6-112e-470b-a0e4-0d31e54f57bc	ANALISTA DE PRODUTOS JR	\N	\N	\N	391210	t	2025-11-11 19:53:55.206954	2025-11-11 19:53:55.206954	1-98	1	t	2025-11-11 19:53:55.175
8a9029c6-917d-4d75-b232-e7bb619e0d90	ANALISTA DE PROJETOS	\N	\N	\N	142520	t	2025-11-11 19:53:55.271143	2025-11-11 19:53:55.271143	10-351	10	t	2025-11-11 19:53:55.236
51fefdc2-aa56-4d8f-9500-e6c24335788e	ANALISTA DE PROJETOS I	\N	\N	\N	142520	t	2025-11-11 19:53:55.330384	2025-11-11 19:53:55.330384	10-226	10	t	2025-11-11 19:53:55.298
3fd8bad2-bcc8-4037-9cc6-7562fd0fb415	ANALISTA DE PROJETOS II	\N	\N	\N	142520	t	2025-11-11 19:53:55.39249	2025-11-11 19:53:55.39249	10-227	10	t	2025-11-11 19:53:55.36
49c88055-2a0f-4e89-a5fa-625aa6bdfd33	ANALISTA DE PROJETOS III	\N	\N	\N	142520	t	2025-11-11 19:53:55.45079	2025-11-11 19:53:55.45079	10-228	10	t	2025-11-11 19:53:55.419
634fcbdd-9ccc-41d5-bab5-cad8af0abac0	ANALISTA DE PROJETOS IV	\N	\N	\N	142520	t	2025-11-11 19:53:55.509328	2025-11-11 19:53:55.509328	10-229	10	t	2025-11-11 19:53:55.477
7f1b2662-045b-4e1a-9873-ffcf50b0140d	ANALISTA DE PROJETOS V	\N	\N	\N	142520	t	2025-11-11 19:53:55.567677	2025-11-11 19:53:55.567677	10-243	10	t	2025-11-11 19:53:55.535
5b4ab43b-9ee3-4e47-b67c-3dd67fc93925	ANALISTA DE QUALIDADE JUNIOR	\N	\N	\N	391210	t	2025-11-11 19:53:55.62613	2025-11-11 19:53:55.62613	1-35	1	t	2025-11-11 19:53:55.594
c2678319-285b-4d97-a3df-68da4a2fd43c	ANALISTA DE R&S	\N	\N	\N	252405	t	2025-11-11 19:53:55.685096	2025-11-11 19:53:55.685096	10-633	10	t	2025-11-11 19:53:55.652
d4e4bfa0-637c-4f0c-a6d3-6124c1d73b53	ANALISTA DE R&S JR	\N	\N	\N	351315	t	2025-11-11 19:53:55.743715	2025-11-11 19:53:55.743715	10-639	10	t	2025-11-11 19:53:55.711
9506e750-e168-4994-a26f-a707785fcada	ANALISTA DE R&S JUNIOR	\N	\N	\N	252405	t	2025-11-11 19:53:55.804687	2025-11-11 19:53:55.804687	10-270	10	t	2025-11-11 19:53:55.77
5654ada0-4827-4973-86e7-44062d12e41f	FATURISTA II	\N	\N	\N	413115	t	2025-11-11 19:54:42.74692	2025-11-11 19:54:42.74692	10-0043	10	t	2025-11-11 19:54:42.714
63f1750a-063a-4360-9d67-cd82cf083ecf	ANALISTA DE R&S PLENO	\N	\N	\N	252405	t	2025-11-11 19:53:56.134042	2025-11-11 19:53:56.134042	10-271	10	t	2025-11-11 19:53:55.901
a4b95071-3b3b-4064-b3eb-7f733128a002	ANALISTA DE R&S SENIOR	\N	\N	\N	252405	t	2025-11-11 19:53:56.193638	2025-11-11 19:53:56.193638	10-272	10	t	2025-11-11 19:53:56.161
b8883a40-c4b8-4d09-aeb8-9ed589eb9ad0	ANALISTA DE RECRUTAMENTO E SELEÇÃO JR	\N	\N	\N	252405	t	2025-11-11 19:53:56.253516	2025-11-11 19:53:56.253516	6-82	6	t	2025-11-11 19:53:56.221
3bb95d3e-83fd-4f5d-88d1-bcce16160e69	ANALISTA DE RECURSOS HUMANOS	\N	\N	\N	252405	t	2025-11-11 19:53:56.31326	2025-11-11 19:53:56.31326	10-594	10	t	2025-11-11 19:53:56.281
fa3d9834-9b4b-45b8-bcc8-84d1a2296c69	ANALISTA DE RECURSOS HUMANOS JUNIOR	\N	\N	\N	252405	t	2025-11-11 19:53:56.372467	2025-11-11 19:53:56.372467	10-0009	10	t	2025-11-11 19:53:56.34
f69bef14-4153-4b64-9c85-2d5068ac68b3	ANALISTA DE RECURSOS HUMANOS PLENO	\N	\N	\N	252405	t	2025-11-11 19:53:56.922293	2025-11-11 19:53:56.922293	3-14	3	t	2025-11-11 19:53:56.708
56b6bbb0-35e9-4f0c-96ac-d7f59d2ae187	LIDER LOGISTICO	\N	\N	\N	141615	t	2025-11-11 19:54:53.912389	2025-11-11 19:54:53.912389	10-197	10	t	2025-11-11 19:54:53.88
79b4f968-fbbc-4a29-80d3-89d543a74df7	ANALISTA DE RH 	\N	\N	\N	252405	t	2025-11-11 19:53:57.462041	2025-11-11 19:53:57.462041	10-304	10	t	2025-11-11 19:53:57.251
23526840-510b-431e-8ad4-b1f9c488c254	ANALISTA DE RH SENIOR	\N	\N	\N	252405	t	2025-11-11 19:53:57.52333	2025-11-11 19:53:57.52333	10-145	10	t	2025-11-11 19:53:57.492
9ad77441-0e70-4a3e-9987-faade6f6bd08	ANALISTA DE RH SR	\N	\N	\N	252405	t	2025-11-11 19:53:57.58088	2025-11-11 19:53:57.58088	1-117	1	t	2025-11-11 19:53:57.55
1be2866c-4b4c-4253-8adb-43a8691b94a7	ANALISTA DE S&OP PLENO	\N	\N	\N	411010	t	2025-11-11 19:53:57.639214	2025-11-11 19:53:57.639214	10-736	10	t	2025-11-11 19:53:57.607
9a15d3d8-28b0-4b98-bba1-8fee660f1b57	ANALISTA DE SUPORTE 	\N	\N	\N	142530	t	2025-11-11 19:53:57.697708	2025-11-11 19:53:57.697708	10-209	10	t	2025-11-11 19:53:57.666
a8c4edd0-5ee6-4d48-9497-886599334d93	ANALISTA DE SUPORTE PLENO	\N	\N	\N	142530	t	2025-11-11 19:53:57.755928	2025-11-11 19:53:57.755928	10-207	10	t	2025-11-11 19:53:57.724
24a33f35-f35e-43df-b4ff-a88010f4a403	ANALISTA DE SUPORTE TEC PL II	\N	\N	\N	212420	t	2025-11-11 19:53:57.81503	2025-11-11 19:53:57.81503	10-213	10	t	2025-11-11 19:53:57.782
f8caa6f9-b967-4f42-8c75-a4d410211a32	ANALISTA DE SUPORTE TEC SR II	\N	\N	\N	212420	t	2025-11-11 19:53:57.874019	2025-11-11 19:53:57.874019	10-216	10	t	2025-11-11 19:53:57.842
a4aaeaf7-0f84-48f6-9bca-ff3841f287c0	ANALISTA DE SUPORTE TEC SR III	\N	\N	\N	212420	t	2025-11-11 19:53:57.933418	2025-11-11 19:53:57.933418	10-214	10	t	2025-11-11 19:53:57.9
ce54d89b-3ded-4eb5-aa75-ecce659cf4c7	ANALISTA DE SUPORTE TECNICO	\N	\N	\N	212420	t	2025-11-11 19:53:57.99218	2025-11-11 19:53:57.99218	10-244	10	t	2025-11-11 19:53:57.96
7575dc07-3038-4a57-a446-5018af19dcb5	ANALISTA DE SUPORTE TECNICO JR	\N	\N	\N	212405	t	2025-11-11 19:53:58.050521	2025-11-11 19:53:58.050521	10-670	10	t	2025-11-11 19:53:58.018
bc87c22a-4cdf-4ca5-b647-a61251fa4c3b	ANALISTA DE SUPORTE TECNICO PL	\N	\N	\N	212405	t	2025-11-11 19:53:58.11163	2025-11-11 19:53:58.11163	10-208	10	t	2025-11-11 19:53:58.077
79375e88-d41d-40a3-83ec-14d601def5af	ANALISTA DE SUPORTE TECNICO SR	\N	\N	\N	212405	t	2025-11-11 19:53:58.169875	2025-11-11 19:53:58.169875	10-206	10	t	2025-11-11 19:53:58.138
99d6ceb9-e374-48b2-8fe7-ea207da788f3	ANALISTA DE TESOURARIA JR	\N	\N	\N	410235	t	2025-11-11 19:53:58.22775	2025-11-11 19:53:58.22775	10-291	10	t	2025-11-11 19:53:58.196
1ef50ece-6346-414e-986e-46d4ceea1c1f	ANALISTA DE TI	\N	\N	\N	212410	t	2025-11-11 19:53:58.286884	2025-11-11 19:53:58.286884	10-146	10	t	2025-11-11 19:53:58.255
0b1a336d-9d3a-4162-9927-e7995144e8a8	ANALISTA DE TRANSPORTE PL	\N	\N	\N	252715	t	2025-11-11 19:53:58.343861	2025-11-11 19:53:58.343861	10-623	10	t	2025-11-11 19:53:58.313
f2f541f3-9f5a-440b-bb43-ff2415442cfb	ANALISTA DE TREINAMENTO	\N	\N	\N	233210	t	2025-11-11 19:53:58.402311	2025-11-11 19:53:58.402311	10-232	10	t	2025-11-11 19:53:58.37
c7d927b3-c028-4f7b-912e-fb2d2f1e8f88	ANALISTA DE TREINAMENTO II	\N	\N	\N	233210	t	2025-11-11 19:53:58.460902	2025-11-11 19:53:58.460902	10-238	10	t	2025-11-11 19:53:58.428
016d0131-50b9-4bc2-85d1-3c90637d3ebd	ANALISTA DOCUMENTACAO TEC PL	\N	\N	\N	261210	t	2025-11-11 19:53:58.518908	2025-11-11 19:53:58.518908	10-215	10	t	2025-11-11 19:53:58.487
d4cdc496-63bc-48e6-978b-aa4d8adf7fd7	ANALISTA FINANCEIRO	\N	\N	\N	410105	t	2025-11-11 19:53:58.576911	2025-11-11 19:53:58.576911	6-78	6	t	2025-11-11 19:53:58.545
7398f2cd-1d47-40e3-9e7e-feea504f3643	LIDER LOGISTICO II	\N	\N	\N	141615	t	2025-11-11 19:54:53.971669	2025-11-11 19:54:53.971669	10-264	10	t	2025-11-11 19:54:53.939
42089325-da29-443e-87f5-279c4ad7a772	ANALISTA FINANCEIRO JR	\N	\N	\N	410105	t	2025-11-11 19:53:58.883253	2025-11-11 19:53:58.883253	10-0003	10	t	2025-11-11 19:53:58.663
ced4fc03-71f2-4997-88c3-fd11202469eb	LIDER OPERACIONAL	\N	\N	\N	410105	t	2025-11-11 19:54:54.030923	2025-11-11 19:54:54.030923	10-703	10	t	2025-11-11 19:54:53.999
8e336bcf-1ff6-4ff4-8902-bc6b9e5dda02	ANALISTA FINANCEIRO PL	\N	\N	\N	410105	t	2025-11-11 19:53:59.192993	2025-11-11 19:53:59.192993	10-0006	10	t	2025-11-11 19:53:58.971
8c04b0ef-372f-444f-b359-416d1cf12dc2	LIDER OPERACIONAL - AAM	\N	\N	\N	141205	t	2025-11-11 19:54:54.090347	2025-11-11 19:54:54.090347	10-288	10	t	2025-11-11 19:54:54.058
9c7e2b66-5f2a-4cb2-9ed5-5d896923c2f0	ANALISTA FINANCEIRO PLENO	\N	\N	\N	410105	t	2025-11-11 19:53:59.5658	2025-11-11 19:53:59.5658	1-19	1	t	2025-11-11 19:53:59.278
8824f2d4-5c78-45a8-86fd-03a4e722e4f8	LIMPADOR DE VIDRO	\N	\N	\N	514305	t	2025-11-11 19:54:54.14926	2025-11-11 19:54:54.14926	10-159	10	t	2025-11-11 19:54:54.117
d65af26e-a7e9-4345-8649-7443ef620a73	ANALISTA FINANCEIRO SENIOR	\N	\N	\N	410105	t	2025-11-11 19:53:59.871362	2025-11-11 19:53:59.871362	3-9	3	t	2025-11-11 19:53:59.654
9d064551-56e2-4590-8e89-4b69f3da60a5	LIMPADOR TECNICO	\N	\N	\N	514225	t	2025-11-11 19:54:54.208991	2025-11-11 19:54:54.208991	10-117	10	t	2025-11-11 19:54:54.176
aa6ec2ff-c25a-4dc3-a41f-a3652f132662	ANALISTA FINANCEIRO SR	\N	\N	\N	410105	t	2025-11-11 19:54:00.180526	2025-11-11 19:54:00.180526	10-358	10	t	2025-11-11 19:53:59.959
e5703a09-570b-462f-8abf-ede7227b1a8e	ANALISTA FISCAL JR	\N	\N	\N	251205	t	2025-11-11 19:54:00.24299	2025-11-11 19:54:00.24299	10-497	10	t	2025-11-11 19:54:00.21
8cb4ef17-3d49-4d16-8c64-a65172fd235f	LIMPADOR TECNICO II	\N	\N	\N	514225	t	2025-11-11 19:54:54.26854	2025-11-11 19:54:54.26854	10-149	10	t	2025-11-11 19:54:54.236
2e48592c-57b5-4f11-ae76-f130f19a1f5c	ANALISTA GDC METAL	\N	\N	\N	142405	t	2025-11-11 19:54:00.544381	2025-11-11 19:54:00.544381	10-265	10	t	2025-11-11 19:54:00.332
33143fe6-5d69-4c15-b77e-b5992240b15b	ANALISTA GDC METAL JUNIOR	\N	\N	\N	142405	t	2025-11-11 19:54:00.604462	2025-11-11 19:54:00.604462	10-323	10	t	2025-11-11 19:54:00.572
6ad9da88-39e6-46b9-b95e-224b7274467f	ANALISTA GDC METAL SENIOR	\N	\N	\N	142405	t	2025-11-11 19:54:00.663426	2025-11-11 19:54:00.663426	10-324	10	t	2025-11-11 19:54:00.631
c6ec5e2f-6d75-4a6b-9aa2-73fcd93f7d25	ANALISTA PLANEJAMENTO INGREDIENTES JR	\N	\N	\N	252710	t	2025-11-11 19:54:00.721878	2025-11-11 19:54:00.721878	10-889	10	t	2025-11-11 19:54:00.691
69d64c39-89c4-4318-beeb-c20cf0b25e66	ANALISTA TECNICO SENIOR	\N	\N	\N	142530	t	2025-11-11 19:54:00.781309	2025-11-11 19:54:00.781309	10-205	10	t	2025-11-11 19:54:00.749
54512292-2624-43e6-9c90-ee03806b22d6	ANALISTA TRANSPORTES JR	\N	\N	\N	252715	t	2025-11-11 19:54:00.840337	2025-11-11 19:54:00.840337	10-614	10	t	2025-11-11 19:54:00.808
67bbc5ff-04e4-4448-aa91-b68083ce1d4f	APONTADOR TECNICO	\N	\N	\N	351605	t	2025-11-11 19:54:00.899754	2025-11-11 19:54:00.899754	10-783	10	t	2025-11-11 19:54:00.867
3e679079-cf8f-4619-92f4-b7312ba24083	APRENDIZ DE OPERACOES	\N	\N	\N	784205	t	2025-11-11 19:54:00.958899	2025-11-11 19:54:00.958899	1-129	1	t	2025-11-11 19:54:00.927
b1e47d1f-a9ce-4aca-9a3c-83764941d67d	APRENDIZ LEGAL	\N	\N	\N	411010	t	2025-11-11 19:54:01.01817	2025-11-11 19:54:01.01817	1-70	1	t	2025-11-11 19:54:00.986
37fbde40-babc-4e48-9afb-488a37853b25	Lubrificador industrial	\N	\N	\N	919105	t	2025-11-11 19:54:54.327502	2025-11-11 19:54:54.327502	10-278	10	t	2025-11-11 19:54:54.296
a5b7764d-5e9a-4d68-a17a-6a6337cd0045	ARTE FINALISTA	\N	\N	\N	318405	t	2025-11-11 19:54:01.323457	2025-11-11 19:54:01.323457	10-331	10	t	2025-11-11 19:54:01.106
203ead44-a9f6-431c-b9a5-30e15005f106	ARTIFICE	\N	\N	\N	514310	t	2025-11-11 19:54:01.38309	2025-11-11 19:54:01.38309	10-530	10	t	2025-11-11 19:54:01.35
923a336a-e67b-4b68-812d-3c84000cfce6	ARTIFICE CIVIL	\N	\N	\N	514310	t	2025-11-11 19:54:01.442881	2025-11-11 19:54:01.442881	10-280	10	t	2025-11-11 19:54:01.41
99ee1944-fb48-4658-91d9-b7f59358003f	FERENTE DE PRODUCAO	\N	\N	\N	141205	t	2025-11-11 19:54:43.050713	2025-11-11 19:54:43.050713	6-47	6	t	2025-11-11 19:54:42.834
89978fa1-d255-4dcd-891c-fb544f507348	ARTIFICE CIVIL I	\N	\N	\N	514325	t	2025-11-11 19:54:01.746587	2025-11-11 19:54:01.746587	10-609	10	t	2025-11-11 19:54:01.529
5f55b0f5-22fb-49bf-88d1-1958d4d9cc9f	FERRAMENTEIRO	\N	\N	\N	721105	t	2025-11-11 19:54:43.110779	2025-11-11 19:54:43.110779	1-74	1	t	2025-11-11 19:54:43.079
506f2fef-95fe-4a85-a727-65c0b2affdea	ARTIFICE CIVIL II	\N	\N	\N	514325	t	2025-11-11 19:54:02.058455	2025-11-11 19:54:02.058455	10-612	10	t	2025-11-11 19:54:01.835
05ea43df-3069-466e-afd5-ec7afd416eef	ASSIS. SUPORTE TECNNICO	\N	\N	\N	317110	t	2025-11-11 19:54:02.363307	2025-11-11 19:54:02.363307	10-362	10	t	2025-11-11 19:54:02.148
823a4fbb-2aa3-424a-a419-6a545850b275	ASSIST COMERCIAL	\N	\N	\N	354125	t	2025-11-11 19:54:02.422726	2025-11-11 19:54:02.422726	10-0016	10	t	2025-11-11 19:54:02.391
56dcd607-e2a3-4376-85f8-7d659aca6adb	INSPETOR DE QUALIDADE I	\N	\N	\N	391205	t	2025-11-11 19:54:47.199962	2025-11-11 19:54:47.199962	10-0047	10	t	2025-11-11 19:54:46.984
40305ca1-9c8f-4ec4-83cd-4605e05436fd	ASSIST.SERV.CORPORATIVOS RH	\N	\N	\N	411030	t	2025-11-11 19:54:02.728026	2025-11-11 19:54:02.728026	10-387	10	t	2025-11-11 19:54:02.509
f511ba51-f56e-44b3-907f-4d6f0a3b7344	ASSISTENTE	\N	\N	\N	411010	t	2025-11-11 19:54:02.787543	2025-11-11 19:54:02.787543	10-531	10	t	2025-11-11 19:54:02.756
0d776b68-419b-466a-a763-53a729e7695d	ASSISTENTE ADM - BOSCH	\N	\N	\N	411010	t	2025-11-11 19:54:02.848094	2025-11-11 19:54:02.848094	1-147	1	t	2025-11-11 19:54:02.815
5f50136f-f079-49d8-9c00-ce9f9193d33d	ASSISTENTE ADM FINANCEIRO JUNIOR	\N	\N	\N	411010	t	2025-11-11 19:54:02.908751	2025-11-11 19:54:02.908751	1-17	1	t	2025-11-11 19:54:02.876
521db3c8-ceae-423d-9414-35fea4bccdcb	ASSISTENTE ADM FINANCEIRO SENIOR	\N	\N	\N	411010	t	2025-11-11 19:54:02.969104	2025-11-11 19:54:02.969104	1-67	1	t	2025-11-11 19:54:02.936
8e837cd4-aa39-4e12-86f6-37328fb0ba36	ASSISTENTE ADM/RH	\N	\N	\N	411010	t	2025-11-11 19:54:03.029606	2025-11-11 19:54:03.029606	1-28	1	t	2025-11-11 19:54:02.997
8f3f4fff-b407-4b84-a2c7-80147a4d2836	ASSISTENTE ADMINISTRATIVO	\N	\N	\N	411005	t	2025-11-11 19:54:03.333615	2025-11-11 19:54:03.333615	3-27	3	t	2025-11-11 19:54:03.118
15e11242-ccf9-48e4-8b17-96113b797568	LAVADOR DE VEICULO	\N	\N	\N	519935	t	2025-11-11 19:54:50.476298	2025-11-11 19:54:50.476298	10-552	10	t	2025-11-11 19:54:50.259
d7d3ea98-6f2c-4148-a92c-0ded86bd4bea	LIDER	\N	\N	\N	514320	t	2025-11-11 19:54:50.536064	2025-11-11 19:54:50.536064	10-0116	10	t	2025-11-11 19:54:50.503
dc1d8bb9-5c2f-43df-acea-23e760084ace	MANUTENTOR PLENO	\N	\N	\N	391130	t	2025-11-11 19:54:54.387748	2025-11-11 19:54:54.387748	10-682	10	t	2025-11-11 19:54:54.354
44360763-854e-4e6c-86be-36f0beee3b47	MARCENEIRO	\N	\N	\N	771105	t	2025-11-11 19:54:54.447365	2025-11-11 19:54:54.447365	10-544	10	t	2025-11-11 19:54:54.415
f8329b2a-6274-4e55-a4b4-aa7207ebde2c	ASSISTENTE ADMINISTRATIVO - EMBALOG	\N	\N	\N	411010	t	2025-11-11 19:54:05.11342	2025-11-11 19:54:05.11342	6-64	6	t	2025-11-11 19:54:04.897
c345535d-9f7b-4548-91a4-7e69bd391025	ASSISTENTE ADMINISTRATIVO FINANCEIRO	\N	\N	\N	411010	t	2025-11-11 19:54:05.174049	2025-11-11 19:54:05.174049	1-126	1	t	2025-11-11 19:54:05.141
3b77ae03-13e5-4058-95bf-bc8e3f205b24	ASSISTENTE ADMINISTRATIVO SENIOR	\N	\N	\N	411010	t	2025-11-11 19:54:05.474479	2025-11-11 19:54:05.474479	3-18	3	t	2025-11-11 19:54:05.261
c20bc162-3ffd-41e8-96e9-a1f0199c53b4	MOTORISTA MANOBRISTA	\N	\N	\N	782510	t	2025-11-11 19:55:01.581829	2025-11-11 19:55:01.581829	10-688	10	t	2025-11-11 19:55:01.363
5f2fd924-4d3c-486c-a42d-cd0f665748fd	ASSISTENTE ADMINISTRATIVO/COMPRAS	\N	\N	\N	411010	t	2025-11-11 19:54:05.777792	2025-11-11 19:54:05.777792	1-104	1	t	2025-11-11 19:54:05.563
15d8e37d-9af7-4013-9dc1-ce1efbee71bb	MOVIMENTADOR DE MERCADORIAS I	\N	\N	\N	414110	t	2025-11-11 19:55:01.643676	2025-11-11 19:55:01.643676	10-193	10	t	2025-11-11 19:55:01.61
2739b109-4dd6-4100-808b-9bb35e06d634	ASSISTENTE ADMNISTRATIVO	\N	\N	\N	411010	t	2025-11-11 19:54:06.083955	2025-11-11 19:54:06.083955	6-77	6	t	2025-11-11 19:54:05.866
296e0783-82cf-40a4-9559-91d2be0eec25	ASSISTENTE ALMOXARIFADO II	\N	\N	\N	414105	t	2025-11-11 19:54:06.143238	2025-11-11 19:54:06.143238	6-85	6	t	2025-11-11 19:54:06.112
6c52d12c-1bea-4725-b89f-2873de99ffde	MOVIMENTADOR DE MERCADORIAS II	\N	\N	\N	414110	t	2025-11-11 19:55:01.704484	2025-11-11 19:55:01.704484	10-199	10	t	2025-11-11 19:55:01.672
5b169bfd-04e7-488e-8881-4537a7f57f47	ASSISTENTE BILINGUE	\N	\N	\N	252310	t	2025-11-11 19:54:06.444031	2025-11-11 19:54:06.444031	1-42	1	t	2025-11-11 19:54:06.231
45376b95-ff08-4db5-be32-a5117e694e4c	ASSISTENTE CENTRO SERVICOS RH	\N	\N	\N	252405	t	2025-11-11 19:54:06.50708	2025-11-11 19:54:06.50708	10-596	10	t	2025-11-11 19:54:06.475
e4beb3d2-9754-4890-8c6d-6bf934e79db2	ASSISTENTE CONTABIL	\N	\N	\N	413110	t	2025-11-11 19:54:06.56575	2025-11-11 19:54:06.56575	10-376	10	t	2025-11-11 19:54:06.533
1f17fa76-a4cc-4d2f-81be-303578599869	ASSISTENTE CUSTOMER SERVICE	\N	\N	\N	411005	t	2025-11-11 19:54:06.624585	2025-11-11 19:54:06.624585	10-904	10	t	2025-11-11 19:54:06.592
c46baa58-7d7f-4d00-bce9-0f6ab7f57c32	ASSISTENTE DA QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:54:06.684416	2025-11-11 19:54:06.684416	10-472	10	t	2025-11-11 19:54:06.652
47fb7dd0-bdbc-43a0-bf31-f1b002ddd0e4	MOVIMENTADOR(A)	\N	\N	\N	782305	t	2025-11-11 19:55:01.765275	2025-11-11 19:55:01.765275	1-51	1	t	2025-11-11 19:55:01.732
eb2ef832-facb-4cb3-8735-d262d0c3e6f1	ASSISTENTE DE ALMOXARIFADO	\N	\N	\N	414105	t	2025-11-11 19:54:06.987556	2025-11-11 19:54:06.987556	10-571	10	t	2025-11-11 19:54:06.77
74fdd0d4-6571-4dee-b7cd-49176b379ee4	ASSISTENTE DE ALMOXARIFADO I	\N	\N	\N	414105	t	2025-11-11 19:54:07.049729	2025-11-11 19:54:07.049729	10-693	10	t	2025-11-11 19:54:07.016
f0d993ba-9e90-424c-a5e9-f39dc4ca3eeb	ASSISTENTE DE ATENDIMENTO	\N	\N	\N	420135	t	2025-11-11 19:54:07.110554	2025-11-11 19:54:07.110554	10-297	10	t	2025-11-11 19:54:07.078
dc8cb693-1c63-4ab3-b8e2-a9902f63c0db	ASSISTENTE DE ATRACAO E SELECAO	\N	\N	\N	351315	t	2025-11-11 19:54:07.171589	2025-11-11 19:54:07.171589	10-622	10	t	2025-11-11 19:54:07.139
1a73bffd-3b72-41a6-be24-bf590ebb44a2	ASSISTENTE DE COMPRAS	\N	\N	\N	411010	t	2025-11-11 19:54:07.232735	2025-11-11 19:54:07.232735	10-346	10	t	2025-11-11 19:54:07.199
540a67be-3356-4d94-bf4b-508869ac61f8	OFIC MANUTENÇÃO - SP	\N	\N	\N	514325	t	2025-11-11 19:55:01.826081	2025-11-11 19:55:01.826081	10-289	10	t	2025-11-11 19:55:01.793
84a3c47f-f01b-45bb-aab9-0be0e579017c	ASSISTENTE DE DESIGNER	\N	\N	\N	262410	t	2025-11-11 19:54:07.542989	2025-11-11 19:54:07.542989	10-398	10	t	2025-11-11 19:54:07.323
e68ba6ea-2a0a-4014-abc0-820f09a30608	ASSISTENTE DE DISTRIBUICAO	\N	\N	\N	414140	t	2025-11-11 19:54:07.604302	2025-11-11 19:54:07.604302	10-648	10	t	2025-11-11 19:54:07.571
6d749488-124b-4bef-b255-43c310398130	ASSISTENTE DE FATURAMENTO	\N	\N	\N	413115	t	2025-11-11 19:54:07.665408	2025-11-11 19:54:07.665408	10-601	10	t	2025-11-11 19:54:07.632
c22e72ac-ddb9-4755-93f3-24b9f710aa29	OFICIAL DE MANUTENCAO	\N	\N	\N	514325	t	2025-11-11 19:55:01.887099	2025-11-11 19:55:01.887099	10-490	10	t	2025-11-11 19:55:01.854
65a5893a-d2a8-47d1-a434-faf17ccd7156	ASSISTENTE DE LOGISTICA	\N	\N	\N	414140	t	2025-11-11 19:54:07.968905	2025-11-11 19:54:07.968905	10-361	10	t	2025-11-11 19:54:07.755
d2ef79c4-cae8-4e9f-89c8-09d86090a3c3	ASSISTENTE DE LOGISTICA I	\N	\N	\N	414140	t	2025-11-11 19:54:08.028654	2025-11-11 19:54:08.028654	10-340	10	t	2025-11-11 19:54:07.996
1506789b-e370-4248-a086-ae0fe0c5032f	ASSISTENTE DE LOGISTICA II	\N	\N	\N	414140	t	2025-11-11 19:54:08.087944	2025-11-11 19:54:08.087944	10-339	10	t	2025-11-11 19:54:08.056
05021ac5-05c7-463e-83af-db2832113d05	ASSISTENTE DE MARKETING	\N	\N	\N	142335	t	2025-11-11 19:54:08.147332	2025-11-11 19:54:08.147332	10-401	10	t	2025-11-11 19:54:08.115
e4bedfc5-08b7-480a-a613-e0c9629ab05e	ASSISTENTE DE MARKETING JR	\N	\N	\N	142335	t	2025-11-11 19:54:08.206796	2025-11-11 19:54:08.206796	10-787	10	t	2025-11-11 19:54:08.175
cf4fc345-199b-4d70-a8a5-5f524f4f0094	ASSISTENTE DE PROCESSOS II	\N	\N	\N	414140	t	2025-11-11 19:54:08.266158	2025-11-11 19:54:08.266158	10-342	10	t	2025-11-11 19:54:08.234
3ec41a10-d653-41c5-b6dc-e00ec7435d96	ASSISTENTE DE PROCESSOS III	\N	\N	\N	414140	t	2025-11-11 19:54:08.326893	2025-11-11 19:54:08.326893	10-343	10	t	2025-11-11 19:54:08.294
84544ff3-ba8d-40a1-9b3f-09893a7b5d73	ASSISTENTE DE PRODUCAO	\N	\N	\N	784205	t	2025-11-11 19:54:08.386204	2025-11-11 19:54:08.386204	10-784	10	t	2025-11-11 19:54:08.354
8896c7d9-f1dc-4d74-9963-825ae719bff3	ASSISTENTE DE Q&SSMA	\N	\N	\N	391210	t	2025-11-11 19:54:08.445336	2025-11-11 19:54:08.445336	6-76	6	t	2025-11-11 19:54:08.413
84aba5a1-51a7-469f-b7ca-b47c0a49977b	ASSISTENTE DE R&S 	\N	\N	\N	351315	t	2025-11-11 19:54:08.505709	2025-11-11 19:54:08.505709	1-638	1	t	2025-11-11 19:54:08.473
d2b1b538-0996-408e-9147-dc1c7ab3000e	ASSISTENTE DE RECURSOS HUMANOS	\N	\N	\N	411030	t	2025-11-11 19:54:08.81042	2025-11-11 19:54:08.81042	1-16	1	t	2025-11-11 19:54:08.592
2e8f8d9c-2482-42b7-920c-7ec4d755ff92	INSPETOR DE QUALIDADE II	\N	\N	\N	391205	t	2025-11-11 19:54:47.498258	2025-11-11 19:54:47.498258	1-40	1	t	2025-11-11 19:54:47.285
a25e7bd2-cf79-4d24-8f14-e7e78082292f	ASSISTENTE DE RELACIONAMENTO	\N	\N	\N	411010	t	2025-11-11 19:54:09.377618	2025-11-11 19:54:09.377618	10-474	10	t	2025-11-11 19:54:09.161
160b097e-0bde-4966-8dd6-c5b6403f0560	ASSISTENTE DE RH	\N	\N	\N	411030	t	2025-11-11 19:54:09.438483	2025-11-11 19:54:09.438483	6-93	6	t	2025-11-11 19:54:09.406
6338dd64-dfb7-4258-95bb-b358683f79a3	ASSISTENTE DE S&OP	\N	\N	\N	411010	t	2025-11-11 19:54:09.498444	2025-11-11 19:54:09.498444	10-725	10	t	2025-11-11 19:54:09.466
63957355-3525-4152-a768-ea053fe3018a	ASSISTENTE DE SRD	\N	\N	\N	411010	t	2025-11-11 19:54:09.557492	2025-11-11 19:54:09.557492	10-414	10	t	2025-11-11 19:54:09.526
ecf45f53-f867-4157-afc9-7da6e400beb1	ASSISTENTE DE SUPORTE TECNICO	\N	\N	\N	317110	t	2025-11-11 19:54:09.618005	2025-11-11 19:54:09.618005	1-91	1	t	2025-11-11 19:54:09.585
31e530da-6cba-47be-bbab-702ea0acf94e	ASSISTENTE DE SUPRIMENTOS	\N	\N	\N	414105	t	2025-11-11 19:54:09.678587	2025-11-11 19:54:09.678587	10-148	10	t	2025-11-11 19:54:09.646
afb2e301-6a2f-4746-963a-5cb105f6a7f4	ASSISTENTE DE TRANSPORTE	\N	\N	\N	414140	t	2025-11-11 19:54:09.739332	2025-11-11 19:54:09.739332	10-905	10	t	2025-11-11 19:54:09.706
1f960e50-09d9-4914-81a0-331ef73ed3ff	ASSISTENTE DE VENDAS	\N	\N	\N	354125	t	2025-11-11 19:54:09.799936	2025-11-11 19:54:09.799936	10-0106	10	t	2025-11-11 19:54:09.767
04ad1fe5-196a-420f-b299-d15cd24dd0a0	ASSISTENTE DP	\N	\N	\N	252405	t	2025-11-11 19:54:09.860296	2025-11-11 19:54:09.860296	10-644	10	t	2025-11-11 19:54:09.827
ee9757b2-c80b-4512-aab5-41e5ab4dc405	ASSISTENTE FINANCEIRO	\N	\N	\N	411010	t	2025-11-11 19:54:09.920422	2025-11-11 19:54:09.920422	10-371	10	t	2025-11-11 19:54:09.888
524549c1-2593-49c1-bfe9-0f2cd58ca135	LIDER AUXILIAR SERVIÇOS GERAIS	\N	\N	\N	391125	t	2025-11-11 19:54:50.839679	2025-11-11 19:54:50.839679	10-557	10	t	2025-11-11 19:54:50.622
4b04d166-d8d8-4f0e-b262-ebbf1999c3be	ASSISTENTE FINANCEIRO JR II	\N	\N	\N	411010	t	2025-11-11 19:54:10.225872	2025-11-11 19:54:10.225872	10-710	10	t	2025-11-11 19:54:10.009
f80bb820-916b-4f37-96b1-26080befddc5	ASSISTENTE FISCAL	\N	\N	\N	252210	t	2025-11-11 19:54:10.286887	2025-11-11 19:54:10.286887	6-67	6	t	2025-11-11 19:54:10.254
5c27a18f-e1d6-43c7-b808-97faab2cd0fd	ASSISTENTE JURIDICO	\N	\N	\N	411010	t	2025-11-11 19:54:10.348901	2025-11-11 19:54:10.348901	10-415	10	t	2025-11-11 19:54:10.315
3a47b4a3-4e19-430c-ae77-d293d0a80c05	ASSISTENTE LOGISTICO I	\N	\N	\N	391115	t	2025-11-11 19:54:10.409347	2025-11-11 19:54:10.409347	1-72	1	t	2025-11-11 19:54:10.377
848a29c9-7a30-4dba-bb66-a78c281b0b8c	ASSISTENTE MANUFATURA	\N	\N	\N	784205	t	2025-11-11 19:54:10.470201	2025-11-11 19:54:10.470201	10-602	10	t	2025-11-11 19:54:10.437
e2cd0abe-b2b3-49d6-a576-3c66bc4eea5e	ASSISTENTE SOCIAL	\N	\N	\N	251605	t	2025-11-11 19:54:10.530727	2025-11-11 19:54:10.530727	10-137	10	t	2025-11-11 19:54:10.498
eec495c7-dc71-4c18-80d4-87ec719072a1	ASSISTENTE SUPORTE VENDAS	\N	\N	\N	354125	t	2025-11-11 19:54:10.591109	2025-11-11 19:54:10.591109	10-700	10	t	2025-11-11 19:54:10.558
7070b3a0-0c47-424a-a909-97580f30c94c	ASSISTENTE TECNICO	\N	\N	\N	391205	t	2025-11-11 19:54:10.651599	2025-11-11 19:54:10.651599	3-13	3	t	2025-11-11 19:54:10.619
ace86c32-d1c7-4565-998d-04c14b0bd283	ASSISTENTE TECNICO DE TI	\N	\N	\N	317210	t	2025-11-11 19:54:10.71713	2025-11-11 19:54:10.71713	10-106	10	t	2025-11-11 19:54:10.679
320a8325-cc16-4066-af11-7d397b29b466	ASSISTENTE TÉCNICO EXTERNO	\N	\N	\N	314410	t	2025-11-11 19:54:10.777902	2025-11-11 19:54:10.777902	10-0107	10	t	2025-11-11 19:54:10.745
b64f731a-72f9-4f59-a928-e196b295d72c	ASSISTENTE TECNICO I	\N	\N	\N	391205	t	2025-11-11 19:54:10.838255	2025-11-11 19:54:10.838255	10-0019	10	t	2025-11-11 19:54:10.806
ee60c683-ca5b-4902-aa24-152e725ae325	LIDER DE APOIO	\N	\N	\N	391125	t	2025-11-11 19:54:50.900328	2025-11-11 19:54:50.900328	10-536	10	t	2025-11-11 19:54:50.868
6d67b479-9bc8-4879-bda6-ac972a0b0156	LIDER DE EXPEDICAO	\N	\N	\N	414105	t	2025-11-11 19:54:50.961131	2025-11-11 19:54:50.961131	6-43	6	t	2025-11-11 19:54:50.928
c53e758c-7fea-47f9-aa87-b8a9607222af	ASSISTENTE TECNICO II	\N	\N	\N	391205	t	2025-11-11 19:54:11.40131	2025-11-11 19:54:11.40131	1-55	1	t	2025-11-11 19:54:11.162
8a3c1284-4133-4502-be0e-af9f64c536f5	ASSISTENTE TÉCNICO INTERNO	\N	\N	\N	314410	t	2025-11-11 19:54:11.462286	2025-11-11 19:54:11.462286	10-0108	10	t	2025-11-11 19:54:11.429
d6fa170f-30e4-4fd3-af7a-5af5cf8ec543	ATENDENTE	\N	\N	\N	411005	t	2025-11-11 19:54:11.521535	2025-11-11 19:54:11.521535	10-104	10	t	2025-11-11 19:54:11.49
6593f18c-a387-448b-b515-a78083c09ba7	LIDER DE EXPEDIÇÃO	\N	\N	\N	141615	t	2025-11-11 19:54:51.022183	2025-11-11 19:54:51.022183	1-545	1	t	2025-11-11 19:54:50.989
28a84668-6bc9-477a-bae8-ceff5096a736	MARINHEIRO	\N	\N	\N	782705	t	2025-11-11 19:54:54.743967	2025-11-11 19:54:54.743967	10-0061	10	t	2025-11-11 19:54:54.533
3e174027-4711-4342-99d2-4b90a9299ca6	ATENDENTE (LÍDER)	\N	\N	\N	513435	t	2025-11-11 19:54:12.331981	2025-11-11 19:54:12.331981	6-84	6	t	2025-11-11 19:54:12.096
52763ab7-6ac6-4344-8f66-19ac6d5c7389	ATENDENTE DE HOT LINE	\N	\N	\N	411005	t	2025-11-11 19:54:12.393119	2025-11-11 19:54:12.393119	10-114	10	t	2025-11-11 19:54:12.36
d894856a-701f-437d-b9cc-0135f66f8f91	ATENDENTE DE MONITORIA TECNICA	\N	\N	\N	951320	t	2025-11-11 19:54:12.453705	2025-11-11 19:54:12.453705	10-619	10	t	2025-11-11 19:54:12.421
237a95a7-4942-40b7-a555-e4eef7ebacb4	ATENDENTE DE SAC	\N	\N	\N	422310	t	2025-11-11 19:54:12.51407	2025-11-11 19:54:12.51407	10-856	10	t	2025-11-11 19:54:12.481
4c3d8a79-da28-4664-a174-7f1afda1367c	AUDITOR DA QUALIDADE	\N	\N	\N	391215	t	2025-11-11 19:54:12.574591	2025-11-11 19:54:12.574591	3-15	3	t	2025-11-11 19:54:12.542
cbd1c9ca-552a-48b3-b90e-5d9ff1299c5e	AUX ADMINISTRATIVO LOGISTICA 	\N	\N	\N	411005	t	2025-11-11 19:54:13.123677	2025-11-11 19:54:13.123677	10-466	10	t	2025-11-11 19:54:12.908
66792bda-f6b7-415e-a48c-e79e0adf7428	AUX ADMINISTRATIVO TECNICO	\N	\N	\N	411010	t	2025-11-11 19:54:13.18365	2025-11-11 19:54:13.18365	10-233	10	t	2025-11-11 19:54:13.151
3d510394-6e0b-4d5a-bbbe-330c91b9fc57	AUX CONTROLADORIA LONDRINA 	\N	\N	\N	784205	t	2025-11-11 19:54:13.24312	2025-11-11 19:54:13.24312	10-911	10	t	2025-11-11 19:54:13.211
36da7c65-fa09-4576-a1eb-82d526bda4f6	AUX CONTROLE DE QUALIDADE I	\N	\N	\N	391215	t	2025-11-11 19:54:13.312057	2025-11-11 19:54:13.312057	10-319	10	t	2025-11-11 19:54:13.279
143b3600-48e4-4cc4-aa2c-5f01452b5ae9	AUX DE CONTROLADORIA EMBU JAND	\N	\N	\N	784205	t	2025-11-11 19:54:13.37146	2025-11-11 19:54:13.37146	10-910	10	t	2025-11-11 19:54:13.339
26711342-7baf-4360-a8d5-d1fcfd36c4c0	AUX DE ENTREGAS - SAO VICENTE 	\N	\N	\N	783225	t	2025-11-11 19:54:13.430858	2025-11-11 19:54:13.430858	10-721	10	t	2025-11-11 19:54:13.399
973c28e0-b41f-4b65-bcae-e1161ceec3c9	AUX DE ENTRREGA APARECIDA	\N	\N	\N	783225	t	2025-11-11 19:54:13.490836	2025-11-11 19:54:13.490836	10-899	10	t	2025-11-11 19:54:13.458
149557e0-a0bd-472a-be6b-48a95f87d253	AUX DE MONITORAMENTO BRF SJP 	\N	\N	\N	784205	t	2025-11-11 19:54:13.550493	2025-11-11 19:54:13.550493	10-909	10	t	2025-11-11 19:54:13.518
113e0c47-26f4-42f4-954c-acfb92e7e665	AUX DE PRODUCAO HIGIENIZACAO	\N	\N	\N	784205	t	2025-11-11 19:54:13.610802	2025-11-11 19:54:13.610802	10-273	10	t	2025-11-11 19:54:13.578
c36018ff-e38d-4c45-8d46-cad16ebe8993	AUX DE PRODUCAO IMPORTACAO	\N	\N	\N	784205	t	2025-11-11 19:54:13.670766	2025-11-11 19:54:13.670766	10-274	10	t	2025-11-11 19:54:13.638
7a194752-ebe5-4eb6-9da5-ced1c74843a7	AUX DE PRODUCAO PLOTAGEM	\N	\N	\N	784205	t	2025-11-11 19:54:13.730462	2025-11-11 19:54:13.730462	10-275	10	t	2025-11-11 19:54:13.698
0d65b18e-bfa4-4304-ac95-8255ff6fd297	AUX DE SERV GERAIS - LECLAIR	\N	\N	\N	514320	t	2025-11-11 19:54:13.789333	2025-11-11 19:54:13.789333	6-56	6	t	2025-11-11 19:54:13.758
ac1741c8-41d2-41a7-8a0f-e2206f56b4e7	AUX DE SERVICOS GERAIS	\N	\N	\N	514120	t	2025-11-11 19:54:13.85034	2025-11-11 19:54:13.85034	3-25	3	t	2025-11-11 19:54:13.818
50ad6d73-c2d0-4e92-b653-b2041fafb4e1	FERRAMENTEIRO I	\N	\N	\N	721105	t	2025-11-11 19:54:43.652006	2025-11-11 19:54:43.652006	6-10	6	t	2025-11-11 19:54:43.437
5f15af6d-9eec-41bf-bf17-6274cd8c9b32	AUX DE SERVICOS GERAIS I	\N	\N	\N	784205	t	2025-11-11 19:54:14.653501	2025-11-11 19:54:14.653501	10-318	10	t	2025-11-11 19:54:14.436
83fd3c87-1df4-412f-8d7a-6c0bd893340a	AUX OPERACIONAL	\N	\N	\N	784205	t	2025-11-11 19:54:14.713339	2025-11-11 19:54:14.713339	10-240	10	t	2025-11-11 19:54:14.681
71900624-9e68-4a5a-8adb-f1ad880e4aff	LIDER DE JARDINAGEM	\N	\N	\N	622010	t	2025-11-11 19:54:51.327169	2025-11-11 19:54:51.327169	10-618	10	t	2025-11-11 19:54:51.11
3ec5a60d-f747-478b-bcd4-683f2974ed6b	AUX TECNICO REFRIGERAÇÃO RECON	\N	\N	\N	725705	t	2025-11-11 19:54:15.020157	2025-11-11 19:54:15.020157	10-290	10	t	2025-11-11 19:54:14.8
2e8f80b2-8c0a-43b4-9ef7-27573d2c4574	AUXILIAR ADM EM VENDAS	\N	\N	\N	411010	t	2025-11-11 19:54:15.080975	2025-11-11 19:54:15.080975	10-476	10	t	2025-11-11 19:54:15.048
208f4288-2008-456d-904d-b318cedd0895	AUXILIAR ADMINISTATIVO	\N	\N	\N	411010	t	2025-11-11 19:54:15.142705	2025-11-11 19:54:15.142705	10-338	10	t	2025-11-11 19:54:15.109
27056312-f718-428a-933a-9af8eed286a0	AUXILIAR ADMINISTRATIVO	\N	\N	\N	411005	t	2025-11-11 19:54:15.203678	2025-11-11 19:54:15.203678	10-0024	10	t	2025-11-11 19:54:15.171
7f3d6101-fae4-4ca9-b09f-5934e36905a7	LIDER DE LIMPEZA	\N	\N	\N	514320	t	2025-11-11 19:54:51.387462	2025-11-11 19:54:51.387462	10-698	10	t	2025-11-11 19:54:51.354
ffe4bb72-65bb-4284-91a5-dde18724db09	LIDER DE LOGISTICA I	\N	\N	\N	141615	t	2025-11-11 19:54:51.447415	2025-11-11 19:54:51.447415	1-12	1	t	2025-11-11 19:54:51.414
ebd34fb9-6a61-4954-aedc-c71b505d4b78	AUXILIAR ADMINISTRATIVO SENIOR	\N	\N	\N	411005	t	2025-11-11 19:54:16.053575	2025-11-11 19:54:16.053575	10-335	10	t	2025-11-11 19:54:15.834
40aea449-85a3-4aff-bce1-1d8abde16c52	AUXILIAR DA QUALIDADE	\N	\N	\N	391205	t	2025-11-11 19:54:16.112861	2025-11-11 19:54:16.112861	1-58	1	t	2025-11-11 19:54:16.08
6a52479d-956c-462e-a908-00d2b5712325	MEC DE MANUTENÇÃO PREDIAL	\N	\N	\N	911305	t	2025-11-11 19:54:55.043127	2025-11-11 19:54:55.043127	10-469	10	t	2025-11-11 19:54:54.829
32a392c7-664e-4e47-b285-68361c39b407	AUXILIAR DE ALMOXARIFADO	\N	\N	\N	414105	t	2025-11-11 19:54:16.414815	2025-11-11 19:54:16.414815	1-137	1	t	2025-11-11 19:54:16.2
9097f26a-035e-4e3f-a1c3-421e4219a25d	MECANICO 	\N	\N	\N	911305	t	2025-11-11 19:54:55.1007	2025-11-11 19:54:55.1007	10-287	10	t	2025-11-11 19:54:55.07
69100ee6-30eb-42a2-8712-92416da09fdf	AUXILIAR DE ALMOXARIFADO JR I	\N	\N	\N	414105	t	2025-11-11 19:54:16.718022	2025-11-11 19:54:16.718022	10-695	10	t	2025-11-11 19:54:16.501
2f53d7b6-e242-468a-8b24-4b034cc890e0	AUXILIAR DE BMS	\N	\N	\N	391205	t	2025-11-11 19:54:16.778569	2025-11-11 19:54:16.778569	10-551	10	t	2025-11-11 19:54:16.747
3df11ba6-fcd2-4518-85c7-cec241a718a0	AUXILIAR DE CARGA E DESCARGA	\N	\N	\N	414140	t	2025-11-11 19:54:16.843473	2025-11-11 19:54:16.843473	10-603	10	t	2025-11-11 19:54:16.811
6262e3c4-6b0f-43e2-965f-b747ece97105	AUXILIAR DE CONTROLADORIA	\N	\N	\N	414110	t	2025-11-11 19:54:16.904136	2025-11-11 19:54:16.904136	10-907	10	t	2025-11-11 19:54:16.871
b2810355-7cb7-479a-b5d8-dc57cd0f0ea7	AUXILIAR DE COSTURA	\N	\N	\N	763210	t	2025-11-11 19:54:16.964246	2025-11-11 19:54:16.964246	6-29	6	t	2025-11-11 19:54:16.932
fb069c2f-9a5d-41d8-8c12-f67053ff5f4e	AUXILIAR DE COZINHA	\N	\N	\N	513205	t	2025-11-11 19:54:17.024873	2025-11-11 19:54:17.024873	5-5	5	t	2025-11-11 19:54:16.992
c409f485-7300-4fe7-92d5-67330281ad91	MECANICO	\N	\N	\N	911305	t	2025-11-11 19:54:55.158764	2025-11-11 19:54:55.158764	1-99	1	t	2025-11-11 19:54:55.127
b02d41bb-940a-45d6-885a-f79d252e8d40	MECANICO DE REFRIGERACAO	\N	\N	\N	725705	t	2025-11-11 19:54:55.218651	2025-11-11 19:54:55.218651	10-467	10	t	2025-11-11 19:54:55.187
06cca970-de6e-46a1-8429-4001f0a5691d	AUXILIAR DE DEPOSITO	\N	\N	\N	414110	t	2025-11-11 19:54:17.572472	2025-11-11 19:54:17.572472	10-393	10	t	2025-11-11 19:54:17.361
f516ae84-7288-4b74-b6f8-f8b8b7a5d16b	AUXILIAR DE DISTRIBUICAO	\N	\N	\N	414140	t	2025-11-11 19:54:17.633377	2025-11-11 19:54:17.633377	10-678	10	t	2025-11-11 19:54:17.6
8722ce36-5805-486f-981b-068e0f2f3772	AUXILIAR DE ELETRICISTA	\N	\N	\N	715615	t	2025-11-11 19:54:17.692178	2025-11-11 19:54:17.692178	10-178	10	t	2025-11-11 19:54:17.66
fca1aed1-346c-4ca4-84e2-32bfd97ef497	AUXILIAR DE ENTREGA	\N	\N	\N	783225	t	2025-11-11 19:54:17.751185	2025-11-11 19:54:17.751185	10-640	10	t	2025-11-11 19:54:17.719
8d82d065-4408-4d47-b563-45ca6ced8279	AUXILIAR DE ESTOQUE	\N	\N	\N	414125	t	2025-11-11 19:54:18.059018	2025-11-11 19:54:18.059018	10-276	10	t	2025-11-11 19:54:17.838
6344411b-422a-454f-98f6-7c70bf39a89a	AUXILIAR DE EXPEDICAO	\N	\N	\N	414140	t	2025-11-11 19:54:18.119292	2025-11-11 19:54:18.119292	10-712	10	t	2025-11-11 19:54:18.086
ed94601e-293b-4eed-bd63-7faff98c01ff	AUXILIAR DE EXPEDICAO I	\N	\N	\N	414140	t	2025-11-11 19:54:18.178547	2025-11-11 19:54:18.178547	10-478	10	t	2025-11-11 19:54:18.146
a0a4ab45-1e47-4e0a-9804-91fbe6d8bbc5	AUXILIAR DE EXPEDICAO JR I	\N	\N	\N	414140	t	2025-11-11 19:54:18.238056	2025-11-11 19:54:18.238056	10-731	10	t	2025-11-11 19:54:18.205
bd5551a8-4c44-4fce-81d7-7db631e2efb7	AUXILIAR DE EXTRUSAO	\N	\N	\N	813115	t	2025-11-11 19:54:18.297235	2025-11-11 19:54:18.297235	10-344	10	t	2025-11-11 19:54:18.264
c59f7b72-9d3b-4330-bdb8-8158904a238d	AUXILIAR DE EXTRUSÃO - COLORFIX	\N	\N	\N	784205	t	2025-11-11 19:54:18.356897	2025-11-11 19:54:18.356897	6-35	6	t	2025-11-11 19:54:18.324
c515d550-2697-4786-99c0-d54e6565e7f1	AUXILIAR DE FABRICACAO	\N	\N	\N	784205	t	2025-11-11 19:54:18.416057	2025-11-11 19:54:18.416057	10-673	10	t	2025-11-11 19:54:18.383
813cb275-9fd6-4784-aa7b-ac5e053ea204	AUXILIAR DE FERRAMENTARIA II	\N	\N	\N	721105	t	2025-11-11 19:54:18.475221	2025-11-11 19:54:18.475221	10-394	10	t	2025-11-11 19:54:18.442
e636d727-af91-4db4-9b01-fcba86ede36a	AUXILIAR DE JARDINAGEM	\N	\N	\N	622010	t	2025-11-11 19:54:18.534286	2025-11-11 19:54:18.534286	10-132	10	t	2025-11-11 19:54:18.502
76517d0c-d129-4352-9a3c-347e24a5aa70	AUXILIAR DE LIMPEZA	\N	\N	\N	514320	t	2025-11-11 19:54:18.595181	2025-11-11 19:54:18.595181	10-128	10	t	2025-11-11 19:54:18.561
689b1e04-2b99-43fd-8501-d36ec2b81e13	AUXILIAR DE LIMPEZA BANHERISTA	\N	\N	\N	514320	t	2025-11-11 19:54:18.654247	2025-11-11 19:54:18.654247	10-697	10	t	2025-11-11 19:54:18.622
05962526-0605-438f-a704-337ba06aa7ed	AUXILIAR DE LIMPEZA CAPINA QUIMICA	\N	\N	\N	622020	t	2025-11-11 19:54:18.713312	2025-11-11 19:54:18.713312	10-577	10	t	2025-11-11 19:54:18.681
5b946562-e5a3-45d3-9665-61de8eb465a5	MONITOR DE OPERACOES I	\N	\N	\N	784205	t	2025-11-11 19:54:57.885983	2025-11-11 19:54:57.885983	10-718	10	t	2025-11-11 19:54:57.673
664efc9b-88a1-4436-8238-35333b55ec29	AUXILIAR DE LOGISTICA	\N	\N	\N	414140	t	2025-11-11 19:54:19.01444	2025-11-11 19:54:19.01444	10-369	10	t	2025-11-11 19:54:18.798
34cba647-5186-4a27-9598-9519ce5f0a8e	MONITOR DE PRODUCAO I	\N	\N	\N	784205	t	2025-11-11 19:54:57.945528	2025-11-11 19:54:57.945528	1-44	1	t	2025-11-11 19:54:57.914
6b2b28b5-d449-4733-8d8b-07a1b08820fa	AUXILIAR DE LOGISTICA I	\N	\N	\N	414140	t	2025-11-11 19:54:19.558722	2025-11-11 19:54:19.558722	10-292	10	t	2025-11-11 19:54:19.344
eeb3a6be-18b7-4242-b652-5c53397baca0	AUXILIAR DE LOGISTICA II	\N	\N	\N	414140	t	2025-11-11 19:54:19.618217	2025-11-11 19:54:19.618217	10-341	10	t	2025-11-11 19:54:19.586
9dda4575-52c7-488b-b639-2aee92cc4dac	MOTORISTA - EMBRART	\N	\N	\N	782510	t	2025-11-11 19:55:00.428747	2025-11-11 19:55:00.428747	6-68	6	t	2025-11-11 19:55:00.216
8bd86850-cae3-43be-88bb-7f229e9577c5	AUXILIAR DE MANUFATURA	\N	\N	\N	784205	t	2025-11-11 19:54:19.925864	2025-11-11 19:54:19.925864	10-847	10	t	2025-11-11 19:54:19.705
e5bbb91f-8d3a-4be6-8d98-51cb2455fef7	AUXILIAR DE MANUTENCAO	\N	\N	\N	514310	t	2025-11-11 19:54:19.987944	2025-11-11 19:54:19.987944	10-495	10	t	2025-11-11 19:54:19.955
b5fc1be8-db01-4725-a8ec-7ed190893133	AUXILIAR DE MANUTENCAO II	\N	\N	\N	514310	t	2025-11-11 19:54:20.049531	2025-11-11 19:54:20.049531	10-496	10	t	2025-11-11 19:54:20.016
a4a617ae-39ce-4668-9041-f65a5c7d1140	AUXILIAR DE MANUTENCAO III	\N	\N	\N	514310	t	2025-11-11 19:54:20.11033	2025-11-11 19:54:20.11033	10-733	10	t	2025-11-11 19:54:20.077
3e52b443-73bc-46ac-92f1-e61f0a833782	AUXILIAR DE MANUTENCAO PREDIAL	\N	\N	\N	514310	t	2025-11-11 19:54:20.171853	2025-11-11 19:54:20.171853	10-119	10	t	2025-11-11 19:54:20.139
7a2fd353-4ff0-4d86-a4d5-9c67176fdd22	AUXILIAR DE MECANICA	\N	\N	\N	911305	t	2025-11-11 19:54:20.232955	2025-11-11 19:54:20.232955	10-180	10	t	2025-11-11 19:54:20.2
93b841c0-4a45-4f7e-bd58-5a1b92a46f3d	AUXILIAR DE MECÂNICO	\N	\N	\N	911305	t	2025-11-11 19:54:20.294724	2025-11-11 19:54:20.294724	10-0026	10	t	2025-11-11 19:54:20.262
61555a8d-f5f0-4a5e-b2c0-1e2d2d47113d	FERRAMENTEIRO II	\N	\N	\N	721105	t	2025-11-11 19:54:43.773994	2025-11-11 19:54:43.773994	10-0045	10	t	2025-11-11 19:54:43.739
7101b50e-50ce-41a0-b613-476ab37d1aef	AUXILIAR DE MONITORAMENTO	\N	\N	\N	784205	t	2025-11-11 19:54:20.602373	2025-11-11 19:54:20.602373	10-854	10	t	2025-11-11 19:54:20.384
63f0c220-88ab-4522-b377-00dc7ed0fe6c	AUXILIAR DE OPERACOES	\N	\N	\N	414140	t	2025-11-11 19:54:20.662743	2025-11-11 19:54:20.662743	10-337	10	t	2025-11-11 19:54:20.63
7fee1ede-01c9-4e7a-b872-d15ee88064f6	AUXILIAR DE PEDREIRO	\N	\N	\N	717020	t	2025-11-11 19:54:20.723677	2025-11-11 19:54:20.723677	10-0027	10	t	2025-11-11 19:54:20.691
905b00a4-cf89-4900-9054-17315e092669	AUXILIAR DE PINTURA	\N	\N	\N	723330	t	2025-11-11 19:54:21.023568	2025-11-11 19:54:21.023568	10-150	10	t	2025-11-11 19:54:20.812
7f596252-6ab3-401a-ba97-0ceb703a7823	AUXILIAR DE PLANEJAMENTO	\N	\N	\N	391125	t	2025-11-11 19:54:21.082992	2025-11-11 19:54:21.082992	10-171	10	t	2025-11-11 19:54:21.051
db3349a8-48fd-4f6f-a89d-1fd23ca469c7	AUXILIAR DE PRODUCAO 	\N	\N	\N	784205	t	2025-11-11 19:54:21.142518	2025-11-11 19:54:21.142518	10-0021	10	t	2025-11-11 19:54:21.11
267d3139-9d09-4efb-b9b6-685bef6f0257	AUXILIAR DE PRODUCAO	\N	\N	\N	784205	t	2025-11-11 19:54:21.201399	2025-11-11 19:54:21.201399	10-0103	10	t	2025-11-11 19:54:21.169
6709121b-3249-4789-9ba7-b7b49720dfbc	INSPETOR DE QUALIDADE III	\N	\N	\N	391205	t	2025-11-11 19:54:48.043775	2025-11-11 19:54:48.043775	10-0049	10	t	2025-11-11 19:54:47.824
77623838-44a9-432d-a7c4-441c62ae205f	AUXILIAR DE PRODUÇÃO	\N	\N	\N	784205	t	2025-11-11 19:54:22.022103	2025-11-11 19:54:22.022103	10-0028	10	t	2025-11-11 19:54:21.775
2ad2ef31-0db7-4c1a-a93f-e96272ea868c	AUXILIAR DE PRODUÇÃO - BIMARA	\N	\N	\N	784205	t	2025-11-11 19:54:22.08224	2025-11-11 19:54:22.08224	6-51	6	t	2025-11-11 19:54:22.049
ec8e48fb-a8af-4123-a789-2de95ec688f9	MECANICO DE REFRIGERACAO I	\N	\N	\N	725705	t	2025-11-11 19:54:55.523573	2025-11-11 19:54:55.523573	10-134	10	t	2025-11-11 19:54:55.303
0e2aba6a-9135-4f1a-8f00-b62f0275df4a	AUXILIAR DE PRODUÇÃO - EMBRART	\N	\N	\N	784205	t	2025-11-11 19:54:22.379847	2025-11-11 19:54:22.379847	6-2	6	t	2025-11-11 19:54:22.17
2e9091ec-01af-420d-bbfc-46b682c478dd	AUXILIAR DE PRODUÇÃO - FIBRA	\N	\N	\N	784205	t	2025-11-11 19:54:22.438928	2025-11-11 19:54:22.438928	6-62	6	t	2025-11-11 19:54:22.406
cf077a81-035b-498b-a47f-6f5e00791736	AUXILIAR DE PRODUCAO - LECLAIR	\N	\N	\N	784205	t	2025-11-11 19:54:22.496966	2025-11-11 19:54:22.496966	6-41	6	t	2025-11-11 19:54:22.465
53e87455-b31a-422f-8c6a-36f09701775e	AUXILIAR DE PRODUÇÃO - MÃO COLORIDA	\N	\N	\N	784205	t	2025-11-11 19:54:22.554765	2025-11-11 19:54:22.554765	6-72	6	t	2025-11-11 19:54:22.523
97e9a082-f3a2-49ab-b9ba-80bfaa660bde	AUXILIAR DE PRODUÇÃO - TECNOPLAST	\N	\N	\N	784205	t	2025-11-11 19:54:22.613568	2025-11-11 19:54:22.613568	6-34	6	t	2025-11-11 19:54:22.581
05cb85bd-09fd-469d-ba37-28f14a0e3b32	AUXILIAR DE PRODUCAO I	\N	\N	\N	784205	t	2025-11-11 19:54:22.671989	2025-11-11 19:54:22.671989	10-664	10	t	2025-11-11 19:54:22.64
55344522-dc6e-44b1-88b4-31ccb3e703fb	AUXILIAR DE PRODUCAO II	\N	\N	\N	784205	t	2025-11-11 19:54:22.730158	2025-11-11 19:54:22.730158	3-11	3	t	2025-11-11 19:54:22.698
7222f9f3-89f5-42df-8fca-3adfac2374c3	MECANICO GERAL	\N	\N	\N	911305	t	2025-11-11 19:54:55.583894	2025-11-11 19:54:55.583894	1-33	1	t	2025-11-11 19:54:55.551
042aa383-1640-4de2-b5ae-4b443159e278	AUXILIAR DE PRODUCAO III	\N	\N	\N	784205	t	2025-11-11 19:54:23.027375	2025-11-11 19:54:23.027375	1-38	1	t	2025-11-11 19:54:22.815
fe8a55e4-b50f-4e4d-88da-1c42f51df175	MECANICO I	\N	\N	\N	911305	t	2025-11-11 19:54:55.643866	2025-11-11 19:54:55.643866	10-679	10	t	2025-11-11 19:54:55.611
1e05aae6-c130-42cf-aa97-f7a3a470e2ba	AUXILIAR DE QUALIDADE	\N	\N	\N	391215	t	2025-11-11 19:54:23.336086	2025-11-11 19:54:23.336086	6-26	6	t	2025-11-11 19:54:23.114
61b4a8cb-6b92-404f-aab7-8d99f4f1380c	AUXILIAR DE REFRIGERACAO	\N	\N	\N	911205	t	2025-11-11 19:54:23.396964	2025-11-11 19:54:23.396964	10-583	10	t	2025-11-11 19:54:23.364
0d0c0e20-0ead-4e90-88d1-f4893ce38111	MECANICO II	\N	\N	\N	911305	t	2025-11-11 19:54:55.70414	2025-11-11 19:54:55.70414	1-128	1	t	2025-11-11 19:54:55.671
ebcb067b-fd88-4a60-b710-6c007a8d9ff5	AUXILIAR DE RH	\N	\N	\N	411030	t	2025-11-11 19:54:23.69934	2025-11-11 19:54:23.69934	10-112	10	t	2025-11-11 19:54:23.486
38559ac1-806d-4cc1-95b1-a2d05448fc0c	AUXILIAR DE ROÇADA	\N	\N	\N	641010	t	2025-11-11 19:54:23.75883	2025-11-11 19:54:23.75883	10-576	10	t	2025-11-11 19:54:23.727
566d215d-4ab6-45d8-b22d-428885a835a0	AUXILIAR DE RODAGEM	\N	\N	\N	414140	t	2025-11-11 19:54:24.06088	2025-11-11 19:54:24.06088	1-82	1	t	2025-11-11 19:54:23.846
88171f8d-8b27-434e-92ee-f5e5015a9432	AUXILIAR DE RODAGEM II	\N	\N	\N	414140	t	2025-11-11 19:54:24.120505	2025-11-11 19:54:24.120505	1-96	1	t	2025-11-11 19:54:24.088
e7153170-a309-4d06-a10a-6e23d0ef2ce8	AUXILIAR DE SERVICOS GERAIS	\N	\N	\N	514320	t	2025-11-11 19:54:24.181058	2025-11-11 19:54:24.181058	10-25	10	t	2025-11-11 19:54:24.147
381ab89e-8779-478f-ae44-ac0591323dfa	MONITOR DE PRODUCAO II	\N	\N	\N	784205	t	2025-11-11 19:54:58.250558	2025-11-11 19:54:58.250558	10-0066	10	t	2025-11-11 19:54:58.032
76724300-c67a-48e3-b681-ea0170cd8bb7	AUXILIAR DE SERVICOS GERAIS - AURORA	\N	\N	\N	514320	t	2025-11-11 19:54:24.735484	2025-11-11 19:54:24.735484	6-52	6	t	2025-11-11 19:54:24.516
4952b9ef-f6a9-48a5-8788-309eec236bcd	AUXILIAR DE SERVIÇOS GERAIS - EMBRART	\N	\N	\N	514120	t	2025-11-11 19:54:24.795996	2025-11-11 19:54:24.795996	6-28	6	t	2025-11-11 19:54:24.763
9433b493-5adf-468e-b6c8-337e610d0543	AUXILIAR DE SERVICOS GERAIS E COPA	\N	\N	\N	514320	t	2025-11-11 19:54:24.856066	2025-11-11 19:54:24.856066	10-0117	10	t	2025-11-11 19:54:24.823
4f85044d-3862-40c5-854d-0869e3861b8c	AUXILIAR EM VENDAS	\N	\N	\N	411010	t	2025-11-11 19:54:24.91623	2025-11-11 19:54:24.91623	10-487	10	t	2025-11-11 19:54:24.884
a40a306e-9c12-4463-8a2c-bf940f1f5f41	AUXILIAR FINANCEIRO	\N	\N	\N	411005	t	2025-11-11 19:54:24.975618	2025-11-11 19:54:24.975618	1-110	1	t	2025-11-11 19:54:24.944
43c1f1e5-6d94-47d1-b7a7-2046f1c758ab	MOTORISTA CARRETEIRO - EMBRART	\N	\N	\N	782505	t	2025-11-11 19:55:00.488202	2025-11-11 19:55:00.488202	6-58	6	t	2025-11-11 19:55:00.456
36811596-3b8b-441c-a0a6-a86b7728c5c2	AUXILIAR OPERACIONAL	\N	\N	\N	784205	t	2025-11-11 19:54:25.27419	2025-11-11 19:54:25.27419	10-138	10	t	2025-11-11 19:54:25.064
470ed970-1b5d-4b4a-8dee-5ec67e392616	AUXILIAR RECURSOS HUMANOS	\N	\N	\N	411030	t	2025-11-11 19:54:25.333575	2025-11-11 19:54:25.333575	1-80	1	t	2025-11-11 19:54:25.301
3974a396-480f-4ff5-b065-ed35e6608fa0	AUXILIAR SEGURANÇA DO TRABALHO	\N	\N	\N	351605	t	2025-11-11 19:54:25.392764	2025-11-11 19:54:25.392764	10-632	10	t	2025-11-11 19:54:25.36
3f7cd7d4-0654-4cd8-ae11-26b5439b30d9	AUXILIAR SERVICOS ADMN	\N	\N	\N	411005	t	2025-11-11 19:54:25.450954	2025-11-11 19:54:25.450954	10-782	10	t	2025-11-11 19:54:25.419
72edafb9-cdd2-4ebe-922d-a360531e5963	AUXILIAR SERVIÇOS GERAIS	\N	\N	\N	514225	t	2025-11-11 19:54:25.509527	2025-11-11 19:54:25.509527	10-563	10	t	2025-11-11 19:54:25.477
1f3e09b3-48d8-49e6-962d-db5d997f1c89	MOTORISTA CROSS	\N	\N	\N	782510	t	2025-11-11 19:55:00.547564	2025-11-11 19:55:00.547564	10-723	10	t	2025-11-11 19:55:00.515
2b41957c-3b02-49c5-8ede-d69558e5a06d	AUXILIAR TECNICO DE CNC	\N	\N	\N	911305	t	2025-11-11 19:54:25.803534	2025-11-11 19:54:25.803534	10-533	10	t	2025-11-11 19:54:25.595
1a4ba919-c240-4204-a790-39735f55f7e8	AUXILIAR TECNICO DE MATRIZARIA	\N	\N	\N	911305	t	2025-11-11 19:54:25.861859	2025-11-11 19:54:25.861859	10-532	10	t	2025-11-11 19:54:25.83
66a22573-8ca0-43ef-9d1b-66d0502eac16	AUXILIAR TECNICO DE TI	\N	\N	\N	317210	t	2025-11-11 19:54:25.920265	2025-11-11 19:54:25.920265	10-470	10	t	2025-11-11 19:54:25.888
19ffa38b-4ccd-44fe-b87b-92b96d3e38fa	AUXLIAR DE PRODUCAO	\N	\N	\N	784205	t	2025-11-11 19:54:25.978647	2025-11-11 19:54:25.978647	3-1	3	t	2025-11-11 19:54:25.947
ddf894fb-f30e-4496-b555-82dab3e2bb33	BALNEARIO PINHAL	\N	\N	\N	521115	t	2025-11-11 19:54:26.03724	2025-11-11 19:54:26.03724	10-872	10	t	2025-11-11 19:54:26.005
33c64017-b6f8-412e-8e47-1377fac3dec5	BLOQUEIRO	\N	\N	\N	715210	t	2025-11-11 19:54:26.095281	2025-11-11 19:54:26.095281	10-705	10	t	2025-11-11 19:54:26.063
1ca6a7a4-ff98-4355-8d03-16848945b438	FISCAL DE ATENDIMENTO	\N	\N	\N	420135	t	2025-11-11 19:54:44.079647	2025-11-11 19:54:44.079647	10-370	10	t	2025-11-11 19:54:43.866
b041a622-37b2-4f7b-9ff8-ab3b655c2f8b	BOMBEIRO HIDRAULICO	\N	\N	\N	724110	t	2025-11-11 19:54:26.39233	2025-11-11 19:54:26.39233	10-611	10	t	2025-11-11 19:54:26.179
062a7ac3-66fa-42f9-8794-562453620315	FRENTISTA	\N	\N	\N	521135	t	2025-11-11 19:54:44.139074	2025-11-11 19:54:44.139074	10-251	10	t	2025-11-11 19:54:44.107
a5955f49-8422-4496-b7fd-2e0062039e70	BORRACHEIRO	\N	\N	\N	992115	t	2025-11-11 19:54:26.693425	2025-11-11 19:54:26.693425	1-100	1	t	2025-11-11 19:54:26.48
1530c350-60ef-4ef4-b069-9df51c9e087d	FRITADOR	\N	\N	\N	513205	t	2025-11-11 19:54:44.198331	2025-11-11 19:54:44.198331	5-6	5	t	2025-11-11 19:54:44.166
c8ca6cee-68a4-4fbb-96ec-81a62e5f8611	CALDEIREIRO	\N	\N	\N	724410	t	2025-11-11 19:54:26.993532	2025-11-11 19:54:26.993532	10-616	10	t	2025-11-11 19:54:26.78
8c2968cb-d7c0-40e8-a072-9400f5ba6903	CALDEIREIRO I	\N	\N	\N	724410	t	2025-11-11 19:54:27.05272	2025-11-11 19:54:27.05272	10-660	10	t	2025-11-11 19:54:27.021
65f9564b-9ea1-424e-abe4-f9946efc72d0	CAPINEIRO	\N	\N	\N	622020	t	2025-11-11 19:54:27.11201	2025-11-11 19:54:27.11201	10-562	10	t	2025-11-11 19:54:27.079
df02cc89-999d-4cdd-996a-8359a04df6f5	CHEPEIRO	\N	\N	\N	513435	t	2025-11-11 19:54:27.17117	2025-11-11 19:54:27.17117	6-83	6	t	2025-11-11 19:54:27.138
b73111a6-deb6-40e2-af55-8980455e7429	CIVIL	\N	\N	\N	514325	t	2025-11-11 19:54:27.23037	2025-11-11 19:54:27.23037	10-879	10	t	2025-11-11 19:54:27.198
537563b5-ebdc-4be9-afa4-a6001b41954e	CIVIL II	\N	\N	\N	514325	t	2025-11-11 19:54:27.288463	2025-11-11 19:54:27.288463	10-878	10	t	2025-11-11 19:54:27.257
bdb87cca-c469-4315-aac9-b6ae7db2ea79	CIVIL III	\N	\N	\N	514325	t	2025-11-11 19:54:27.347693	2025-11-11 19:54:27.347693	10-877	10	t	2025-11-11 19:54:27.315
58f9ef26-c84f-4fc2-aa0f-931b1c18cc3d	COMPRADOR	\N	\N	\N	354205	t	2025-11-11 19:54:27.407083	2025-11-11 19:54:27.407083	10-152	10	t	2025-11-11 19:54:27.374
0fd66af5-a265-4c0a-b51c-97760141b4e7	COMPRADOR I	\N	\N	\N	354205	t	2025-11-11 19:54:27.467089	2025-11-11 19:54:27.467089	10-501	10	t	2025-11-11 19:54:27.434
057b7af0-668d-42ea-8829-b31850566153	COMPRADOR JR	\N	\N	\N	354205	t	2025-11-11 19:54:27.526075	2025-11-11 19:54:27.526075	10-360	10	t	2025-11-11 19:54:27.493
a903810d-4b4e-4370-9fdd-47e25e50f302	COMPRADOR PLENO	\N	\N	\N	354205	t	2025-11-11 19:54:27.585555	2025-11-11 19:54:27.585555	10-512	10	t	2025-11-11 19:54:27.553
7301f425-528a-42ef-b9ad-d9ae12bee134	CONFERENTE	\N	\N	\N	414215	t	2025-11-11 19:54:27.645317	2025-11-11 19:54:27.645317	10-189	10	t	2025-11-11 19:54:27.612
bde4d41f-c6e1-48eb-8b98-83a2d03f8963	CONFERENTE DE MATERIAIS I	\N	\N	\N	414105	t	2025-11-11 19:54:27.943656	2025-11-11 19:54:27.943656	10-702	10	t	2025-11-11 19:54:27.73
a36ec5e2-c803-48f4-910c-9826578e2432	CONFERENTE II	\N	\N	\N	414215	t	2025-11-11 19:54:28.002606	2025-11-11 19:54:28.002606	10-715	10	t	2025-11-11 19:54:27.97
8ec11f61-8dac-454d-a193-60cbd3350826	CONFERENTE III	\N	\N	\N	414215	t	2025-11-11 19:54:28.061382	2025-11-11 19:54:28.061382	10-716	10	t	2025-11-11 19:54:28.029
908307bb-8d89-4478-8387-631099c55152	CONSULTOR	\N	\N	\N	 	t	2025-11-11 19:54:28.120786	2025-11-11 19:54:28.120786	1-155	1	t	2025-11-11 19:54:28.088
36ae7ca4-025c-4be6-b1de-43cd68c980e0	CONSULTOR COMERCIAL	\N	\N	\N	354120	t	2025-11-11 19:54:28.424059	2025-11-11 19:54:28.424059	10-655	10	t	2025-11-11 19:54:28.206
94aa613b-c8ff-4e4e-a5d6-656c27317dda	CONSULTOR FINANCEIRO	\N	\N	\N	410105	t	2025-11-11 19:54:28.484776	2025-11-11 19:54:28.484776	10-410	10	t	2025-11-11 19:54:28.452
fbe28c26-6b4e-4abe-9886-e3c6e9313251	CONSULTOR(A) COMERCIAL	\N	\N	\N	253225	t	2025-11-11 19:54:28.546274	2025-11-11 19:54:28.546274	10-374	10	t	2025-11-11 19:54:28.513
8d8b6c32-6321-4031-af1a-cd4aca5ce9c0	CONTROLADOR DE ACESSO	\N	\N	\N	391115	t	2025-11-11 19:54:28.606694	2025-11-11 19:54:28.606694	10-475	10	t	2025-11-11 19:54:28.574
4cf18ca1-3810-485b-beca-7b2e8206b3b1	CONTROLADOR DE TESTE	\N	\N	\N	202110	t	2025-11-11 19:54:28.666847	2025-11-11 19:54:28.666847	10-147	10	t	2025-11-11 19:54:28.634
91e189e3-8e9d-4bce-9954-4d9ec19ad8f6	COORD DE RELAC. E PERFORMANCE	\N	\N	\N	142330	t	2025-11-11 19:54:28.727374	2025-11-11 19:54:28.727374	10-379	10	t	2025-11-11 19:54:28.694
c42ca9c1-8f00-40ad-a186-9db10e9c1111	COORD. CENTRAL DE ATENDIMENTO	\N	\N	\N	420135	t	2025-11-11 19:54:28.786509	2025-11-11 19:54:28.786509	10-400	10	t	2025-11-11 19:54:28.755
245c8807-4208-4ab3-835a-916202ac3f7f	COORD. TECNICO DE ENGENHARIA	\N	\N	\N	312105	t	2025-11-11 19:54:28.847492	2025-11-11 19:54:28.847492	10-417	10	t	2025-11-11 19:54:28.815
981e2d14-040f-436b-ae4b-9cdc27028f4c	COORDENADOR	\N	\N	\N	141305	t	2025-11-11 19:54:28.907827	2025-11-11 19:54:28.907827	10-511	10	t	2025-11-11 19:54:28.875
c530f9ad-1de1-49f8-b813-fcf3a45efa22	LIDER DE LOGISTICA II	\N	\N	\N	141615	t	2025-11-11 19:54:51.989083	2025-11-11 19:54:51.989083	10-0060	10	t	2025-11-11 19:54:51.777
16806663-9a9f-489d-a65a-7d3b0d9c16c2	COORDENADOR DA QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:54:29.214764	2025-11-11 19:54:29.214764	1-76	1	t	2025-11-11 19:54:28.997
88e4bf79-2fdb-411b-98e5-9ecfa23432a9	COORDENADOR DE ASSISTENCIA TECNICA	\N	\N	\N	391210	t	2025-11-11 19:54:29.275534	2025-11-11 19:54:29.275534	1-37	1	t	2025-11-11 19:54:29.243
ad1aada3-b864-4095-8ae7-2c5c8ff9e785	COORDENADOR DE CONTRATO	\N	\N	\N	141305	t	2025-11-11 19:54:29.33536	2025-11-11 19:54:29.33536	10-115	10	t	2025-11-11 19:54:29.303
f0701adc-2e8f-42dd-89c2-38883153ef41	COORDENADOR DE DEPTO PESSOAL	\N	\N	\N	410105	t	2025-11-11 19:54:29.463247	2025-11-11 19:54:29.463247	10-277	10	t	2025-11-11 19:54:29.43
93d1fd0a-5511-4ec0-b843-237819062258	COORDENADOR DE OPERACOES 	\N	\N	\N	141205	t	2025-11-11 19:54:29.524776	2025-11-11 19:54:29.524776	10-200	10	t	2025-11-11 19:54:29.492
0e0a9d3a-6d76-48ee-91d5-ebe09502dccd	COORDENADOR DE OPERACOES	\N	\N	\N	141205	t	2025-11-11 19:54:29.588269	2025-11-11 19:54:29.588269	10-0030	10	t	2025-11-11 19:54:29.553
323c1324-df4c-495d-ba29-ff68934bd67e	MECANICO LIDER	\N	\N	\N	911305	t	2025-11-11 19:54:56.00834	2025-11-11 19:54:56.00834	10-0063	10	t	2025-11-11 19:54:55.793
facb1ecb-d5bf-4d1f-99f7-cc98f66c7bc3	MONITOR DE PRODUCAO III	\N	\N	\N	784205	t	2025-11-11 19:54:58.558244	2025-11-11 19:54:58.558244	1-81	1	t	2025-11-11 19:54:58.34
4eda3130-e443-4bc8-bb1a-5fd60a26278d	MOTORISTA DE TESTE	\N	\N	\N	782510	t	2025-11-11 19:55:00.606695	2025-11-11 19:55:00.606695	1-151	1	t	2025-11-11 19:55:00.574
23b8d2e7-560c-4486-a36d-611d320c205b	COORDENADOR DE PROJETOS	\N	\N	\N	142520	t	2025-11-11 19:54:30.804327	2025-11-11 19:54:30.804327	10-225	10	t	2025-11-11 19:54:30.771
f3d0a546-d3d7-46e8-891c-d8a093bb1b19	COORDENADOR DE RH	\N	\N	\N	142205	t	2025-11-11 19:54:30.865172	2025-11-11 19:54:30.865172	10-154	10	t	2025-11-11 19:54:30.832
94117738-2954-4009-bfe5-7ebb8e0c6ae6	COORDENADOR DE RODAGEM	\N	\N	\N	141605	t	2025-11-11 19:54:30.989396	2025-11-11 19:54:30.989396	1-53	1	t	2025-11-11 19:54:30.957
3697d8f0-867b-4f6e-80ff-7192ee07f2a4	COORDENADOR DE SESMT	\N	\N	\N	214915	t	2025-11-11 19:54:31.050094	2025-11-11 19:54:31.050094	10-652	10	t	2025-11-11 19:54:31.018
3eb9bf6b-4fdd-4425-ac94-b0db2d092d44	COORDENADOR DE SINALIZACAO	\N	\N	\N	214205	t	2025-11-11 19:54:31.109669	2025-11-11 19:54:31.109669	10-570	10	t	2025-11-11 19:54:31.077
0bdbd767-bd5e-495a-925d-29b203588a1b	COORDENADOR DE SINALIZACAO III	\N	\N	\N	214205	t	2025-11-11 19:54:31.168356	2025-11-11 19:54:31.168356	10-546	10	t	2025-11-11 19:54:31.136
3d84ad66-b097-4511-977f-3734de4ceb61	COORDENADOR DE TREINAMENTO	\N	\N	\N	410105	t	2025-11-11 19:54:31.226833	2025-11-11 19:54:31.226833	10-282	10	t	2025-11-11 19:54:31.194
03076d10-d8ce-428f-bcc4-3eb5260c4222	COORDENADOR TECNICO	\N	\N	\N	373220	t	2025-11-11 19:54:31.285932	2025-11-11 19:54:31.285932	10-217	10	t	2025-11-11 19:54:31.254
a5b966af-ded1-4282-abf2-db1d88e96cae	FUNILEIRO I	\N	\N	\N	991305	t	2025-11-11 19:54:44.50208	2025-11-11 19:54:44.50208	1-24	1	t	2025-11-11 19:54:44.284
e22b7118-2bfc-4da4-8b2b-ccd1358113f0	COORDENADORA DE MARKETING	\N	\N	\N	142315	t	2025-11-11 19:54:31.407984	2025-11-11 19:54:31.407984	1-87	1	t	2025-11-11 19:54:31.375
4cdd89c6-6cb4-4010-95c8-c40e1c460347	COPEIRA	\N	\N	\N	513425	t	2025-11-11 19:54:31.46775	2025-11-11 19:54:31.46775	10-283	10	t	2025-11-11 19:54:31.435
a0f65d98-5430-4513-b3a8-713f7d2d4ec6	CORTADOR DE CARNE	\N	\N	\N	848525	t	2025-11-11 19:54:31.527663	2025-11-11 19:54:31.527663	5-9	5	t	2025-11-11 19:54:31.495
3064e434-c323-4437-bc0e-c9613a623397	COSTUREIRA	\N	\N	\N	763210	t	2025-11-11 19:54:31.587514	2025-11-11 19:54:31.587514	6-27	6	t	2025-11-11 19:54:31.555
561b034b-5c97-4087-9a39-315cf1d0e884	COSTUREIRO	\N	\N	\N	763215	t	2025-11-11 19:54:31.70826	2025-11-11 19:54:31.70826	10-322	10	t	2025-11-11 19:54:31.677
37245cb7-d093-4791-8c83-1473b814d90c	COZINHEIRA	\N	\N	\N	513205	t	2025-11-11 19:54:31.767891	2025-11-11 19:54:31.767891	2-6	2	t	2025-11-11 19:54:31.736
3af4e0cd-1016-491c-9813-5804d029084a	DEGUSTADORA	\N	\N	\N	848420	t	2025-11-11 19:54:31.82722	2025-11-11 19:54:31.82722	10-161	10	t	2025-11-11 19:54:31.794
7b96a70a-e099-4924-9c65-014094989792	DEMONSTRADOR DE MERCADORIA	\N	\N	\N	521120	t	2025-11-11 19:54:31.885808	2025-11-11 19:54:31.885808	10-162	10	t	2025-11-11 19:54:31.854
62482e3c-a5f7-40cf-8b2a-5b409809902f	DESENVOLVEDOR FRONT-END	\N	\N	\N	317110	t	2025-11-11 19:54:31.94435	2025-11-11 19:54:31.94435	10-388	10	t	2025-11-11 19:54:31.912
7a5dc5d1-25ce-4678-89d2-0188eb33377a	DESENVOLVEDOR FULL STACK JR	\N	\N	\N	317110	t	2025-11-11 19:54:32.002719	2025-11-11 19:54:32.002719	10-389	10	t	2025-11-11 19:54:31.97
f8e3b263-a3a0-48f2-94ca-ff5122505ab6	DESIGNER JR	\N	\N	\N	262410	t	2025-11-11 19:54:32.060973	2025-11-11 19:54:32.060973	10-423	10	t	2025-11-11 19:54:32.029
65954373-94e8-4136-b5ea-403150c62bea	DESIGNER PL	\N	\N	\N	262410	t	2025-11-11 19:54:32.119864	2025-11-11 19:54:32.119864	10-424	10	t	2025-11-11 19:54:32.087
5d5fa4f8-2166-4805-916f-bc6be277e7e1	DESIGNER SR	\N	\N	\N	262410	t	2025-11-11 19:54:32.178731	2025-11-11 19:54:32.178731	10-425	10	t	2025-11-11 19:54:32.146
a7ca2b51-d486-40b8-a33c-3fc81ddd6c4d	ELETRECISTA	\N	\N	\N	953115	t	2025-11-11 19:54:32.237356	2025-11-11 19:54:32.237356	1-133	1	t	2025-11-11 19:54:32.205
1842fed9-1811-4aca-98ae-8a632e85cf96	ELETRICISTA	\N	\N	\N	715615	t	2025-11-11 19:54:32.295405	2025-11-11 19:54:32.295405	1-21	1	t	2025-11-11 19:54:32.263
82aad4c2-9550-4930-8b2a-af0a1532a58f	INSPETOR DE QUALIDADE IV	\N	\N	\N	391205	t	2025-11-11 19:54:48.594026	2025-11-11 19:54:48.594026	1-113	1	t	2025-11-11 19:54:48.382
84d23d89-7d7a-4c7b-9c5a-d5aad28241cd	ELETRICISTA AUXILIAR	\N	\N	\N	715615	t	2025-11-11 19:54:32.472206	2025-11-11 19:54:32.472206	10-567	10	t	2025-11-11 19:54:32.44
a1558ec5-f727-441a-b1e6-22be4e367ff8	ELETRICISTA DE MANUTENCAO	\N	\N	\N	715615	t	2025-11-11 19:54:32.533852	2025-11-11 19:54:32.533852	10-219	10	t	2025-11-11 19:54:32.502
42c621de-d9e5-4e13-a5e3-0c3b9baa88f6	ELETRICISTA DE VEICULOS	\N	\N	\N	953115	t	2025-11-11 19:54:32.591664	2025-11-11 19:54:32.591664	10-0031	10	t	2025-11-11 19:54:32.56
092d5fde-8229-4e5e-b436-6f6a3e837737	ELETRICISTA FORCA E CONTROLE	\N	\N	\N	951105	t	2025-11-11 19:54:32.886434	2025-11-11 19:54:32.886434	10-630	10	t	2025-11-11 19:54:32.677
54d23f0b-18cf-44e0-b81b-b6d07cd20e18	MECANICO MANUTENCAO 	\N	\N	\N	914405	t	2025-11-11 19:54:56.312086	2025-11-11 19:54:56.312086	10-191	10	t	2025-11-11 19:54:56.097
0dad4f1b-9793-4839-9282-1bc933a68b8c	ELETRICISTA I	\N	\N	\N	715615	t	2025-11-11 19:54:33.182421	2025-11-11 19:54:33.182421	10-525	10	t	2025-11-11 19:54:32.971
03250a65-50bb-4f33-9ca3-6dcb7e970e7c	MECANICO MANUTENCAO I	\N	\N	\N	911305	t	2025-11-11 19:54:56.370727	2025-11-11 19:54:56.370727	10-123	10	t	2025-11-11 19:54:56.338
b65bb87e-f422-4a80-9d66-db84d5f4db9e	ELETRICISTA II	\N	\N	\N	951105	t	2025-11-11 19:54:33.489564	2025-11-11 19:54:33.489564	10-587	10	t	2025-11-11 19:54:33.269
2a58e105-2e3c-4e1a-9cd2-1ffc13d7d3a8	MECANICO MANUTENCAO II	\N	\N	\N	914405	t	2025-11-11 19:54:56.428699	2025-11-11 19:54:56.428699	10-124	10	t	2025-11-11 19:54:56.397
b6fb3a8d-91db-437a-8e75-68a29122c80d	ELETRICISTA III	\N	\N	\N	715615	t	2025-11-11 19:54:33.790726	2025-11-11 19:54:33.790726	10-521	10	t	2025-11-11 19:54:33.579
93040add-c5f1-49ca-a728-8cc62d2b9543	ELETRICISTA JR	\N	\N	\N	715615	t	2025-11-11 19:54:33.850085	2025-11-11 19:54:33.850085	10-492	10	t	2025-11-11 19:54:33.818
35b2fbde-15f0-4128-9bc3-0964b9843095	ELETRICISTA LIDER	\N	\N	\N	950105	t	2025-11-11 19:54:33.909099	2025-11-11 19:54:33.909099	10-586	10	t	2025-11-11 19:54:33.877
6bfe9d6c-cfa0-474b-9b4d-ba2f6d463493	ELETRICISTA MANUTEN	\N	\N	\N	715615	t	2025-11-11 19:54:33.968473	2025-11-11 19:54:33.968473	10-116	10	t	2025-11-11 19:54:33.936
41337049-4c45-4635-8744-e66c444bd865	ELETRICISTA MANUTENCAO I	\N	\N	\N	715615	t	2025-11-11 19:54:34.02746	2025-11-11 19:54:34.02746	10-120	10	t	2025-11-11 19:54:33.995
e812c731-bb4b-4aff-8760-b7199e59c924	ELETRICISTA MANUTENCAO II	\N	\N	\N	715615	t	2025-11-11 19:54:34.085234	2025-11-11 19:54:34.085234	10-121	10	t	2025-11-11 19:54:34.054
2c75686d-54f1-43b9-95d1-2607e98312d0	ELETRICISTA MANUTENCAO III	\N	\N	\N	715615	t	2025-11-11 19:54:34.143849	2025-11-11 19:54:34.143849	10-122	10	t	2025-11-11 19:54:34.112
be4f9731-c02d-4fc7-96aa-468da809f6d6	ELETROMECANICO	\N	\N	\N	954125	t	2025-11-11 19:54:34.20276	2025-11-11 19:54:34.20276	1-95	1	t	2025-11-11 19:54:34.17
45fd0602-df88-479b-9ef9-f02f35a7406d	MECANICO MANUTENCAO III	\N	\N	\N	914405	t	2025-11-11 19:54:56.486577	2025-11-11 19:54:56.486577	10-125	10	t	2025-11-11 19:54:56.455
3d703b80-9135-483a-a948-1982582ed8f7	MEIO OF. ELETRICISTA	\N	\N	\N	715615	t	2025-11-11 19:54:56.544839	2025-11-11 19:54:56.544839	10-527	10	t	2025-11-11 19:54:56.513
f85224ba-5b85-4881-a32b-1dcb33adc17c	ENCANADOR INDUSTRIAL	\N	\N	\N	724115	t	2025-11-11 19:54:34.74205	2025-11-11 19:54:34.74205	10-0037	10	t	2025-11-11 19:54:34.533
ef04569b-5d72-45a6-9a6e-ac9b4cfda5c9	MEIO OFICIAL DE MANUTENÇÃO	\N	\N	\N	514325	t	2025-11-11 19:54:56.603319	2025-11-11 19:54:56.603319	10-0064	10	t	2025-11-11 19:54:56.571
7eb59408-1bb3-4581-b103-92b64678366f	ENCARREGADA(O) DE LIMPEZA	\N	\N	\N	410105	t	2025-11-11 19:54:35.045399	2025-11-11 19:54:35.045399	7-4	7	t	2025-11-11 19:54:34.827
15d2d88f-7277-43c4-a342-f1ad8a35c4c9	ENCARREGADO	\N	\N	\N	410105	t	2025-11-11 19:54:35.3449	2025-11-11 19:54:35.3449	10-184	10	t	2025-11-11 19:54:35.133
77d59390-7c6d-4dc2-8044-253f7ef003e4	MONTADOR AJUSTADOR MECANICO	\N	\N	\N	725010	t	2025-11-11 19:54:58.87543	2025-11-11 19:54:58.87543	10-485	10	t	2025-11-11 19:54:58.645
032a57c7-594c-4682-b670-e0bef339038a	ENCARREGADO ADMINISTRATIVO	\N	\N	\N	410105	t	2025-11-11 19:54:35.641408	2025-11-11 19:54:35.641408	10-126	10	t	2025-11-11 19:54:35.431
cd134da6-020c-488c-835f-fc7c34538420	ENCARREGADO DA QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:54:35.700065	2025-11-11 19:54:35.700065	10-0038	10	t	2025-11-11 19:54:35.668
2fdb59f2-c151-4e0e-bafd-84d64cfe514a	ENCARREGADO DE JARDINAGEM	\N	\N	\N	992205	t	2025-11-11 19:54:36.000329	2025-11-11 19:54:36.000329	10-348	10	t	2025-11-11 19:54:35.785
46e79f6c-d610-48c6-85be-9c433ea9be76	ENCARREGADO DE LIMPEZA	\N	\N	\N	992205	t	2025-11-11 19:54:36.061034	2025-11-11 19:54:36.061034	10-285	10	t	2025-11-11 19:54:36.027
16e68e33-6760-4bfd-bd3f-45c57805b911	MOTORISTA ENTREGADOR	\N	\N	\N	782310	t	2025-11-11 19:55:00.905458	2025-11-11 19:55:00.905458	10-636	10	t	2025-11-11 19:55:00.693
02f7719b-ecd2-4236-8a54-5c74ce4521db	ENCARREGADO DE LIMPEZA TECNICA	\N	\N	\N	514225	t	2025-11-11 19:54:36.36698	2025-11-11 19:54:36.36698	10-111	10	t	2025-11-11 19:54:36.15
81b3a9fa-4d50-432a-b068-42703cc145ea	ENCARREGADO DE LOGISTICA	\N	\N	\N	141615	t	2025-11-11 19:54:36.535891	2025-11-11 19:54:36.535891	10-198	10	t	2025-11-11 19:54:36.395
e991773b-22e5-4233-969d-bbc390ee14f4	ENCARREGADO DE MAN. PREDIAL	\N	\N	\N	514325	t	2025-11-11 19:54:36.717587	2025-11-11 19:54:36.717587	1-780	1	t	2025-11-11 19:54:36.685
1207ddcc-84e0-4b56-a5d1-8e420d26b7c3	ENCARREGADO DE MANUTENÇAO	\N	\N	\N	313115	t	2025-11-11 19:54:36.780248	2025-11-11 19:54:36.780248	10-510	10	t	2025-11-11 19:54:36.748
57c35512-2671-4fbc-809a-b3cda8d8d89f	ENCARREGADO DE MANUTENÇÃO PREDIAL	\N	\N	\N	514325	t	2025-11-11 19:54:36.870468	2025-11-11 19:54:36.870468	10-780	10	t	2025-11-11 19:54:36.838
f3287444-8fac-4487-87a0-d9b889c5c355	FUNILEIRO II	\N	\N	\N	991305	t	2025-11-11 19:54:44.803553	2025-11-11 19:54:44.803553	1-25	1	t	2025-11-11 19:54:44.59
c8d92c14-c438-4b7e-a414-b454cdb08403	ENCARREGADO DE OPERACOES	\N	\N	\N	141205	t	2025-11-11 19:54:37.034264	2025-11-11 19:54:37.034264	1-41	1	t	2025-11-11 19:54:37.001
64cf6cb0-5b2f-421b-b72c-963cb3f3e680	GARCOM	\N	\N	\N	513405	t	2025-11-11 19:54:44.862377	2025-11-11 19:54:44.862377	10-734	10	t	2025-11-11 19:54:44.83
ae0deca3-9c8c-4ad3-aac6-be92d15798a1	ENCARREGADO DE OPERACOES 	\N	\N	\N	992205	t	2025-11-11 19:54:37.154436	2025-11-11 19:54:37.154436	10-349	10	t	2025-11-11 19:54:37.121
3e164113-19cf-4a77-b8d3-9250ffe3c080	ENCARREGADO DE PERECIVEIS	\N	\N	\N	414105	t	2025-11-11 19:54:37.215958	2025-11-11 19:54:37.215958	10-305	10	t	2025-11-11 19:54:37.183
d41255d7-67ce-4799-ad44-6b80b070b57c	GENERALISTA DE RH PL	\N	\N	\N	252405	t	2025-11-11 19:54:44.920911	2025-11-11 19:54:44.920911	10-488	10	t	2025-11-11 19:54:44.888
aaa9015e-0e16-4732-bca7-a2ee1c3bb34b	ENCARREGADO DE PODUCAO	\N	\N	\N	414210	t	2025-11-11 19:54:37.33448	2025-11-11 19:54:37.33448	3-29	3	t	2025-11-11 19:54:37.302
c3a2eb61-3585-481b-bbe3-5eb1fdcfef2e	ENCARREGADO DE PORTARIA	\N	\N	\N	517330	t	2025-11-11 19:54:37.395211	2025-11-11 19:54:37.395211	7-3	7	t	2025-11-11 19:54:37.363
0ce190f3-c1fd-4e12-9164-28849fcbf445	GERENTE ADM FINANCEIRO	\N	\N	\N	142105	t	2025-11-11 19:54:44.97935	2025-11-11 19:54:44.97935	10-0109	10	t	2025-11-11 19:54:44.947
9e676aed-3851-4b6f-a3b4-ee795eac893a	GERENTE COMERCIAL	\N	\N	\N	142305	t	2025-11-11 19:54:45.037817	2025-11-11 19:54:45.037817	10-368	10	t	2025-11-11 19:54:45.005
6a2dbcfc-dae8-4029-a61c-39d7e23921c7	GERENTE DE CONTRATO	\N	\N	\N	142305	t	2025-11-11 19:54:45.096036	2025-11-11 19:54:45.096036	10-254	10	t	2025-11-11 19:54:45.064
501825a4-9494-4a7a-bdf8-176ae6fcde8f	GERENTE DE DESENVOLVIMENTO	\N	\N	\N	142510	t	2025-11-11 19:54:45.15485	2025-11-11 19:54:45.15485	10-0110	10	t	2025-11-11 19:54:45.122
10196dd6-ac67-4f70-be02-b5096279a4c1	GERENTE DE INTEGRACAO E TESTES I	\N	\N	\N	142605	t	2025-11-11 19:54:45.213332	2025-11-11 19:54:45.213332	10-151	10	t	2025-11-11 19:54:45.181
f68a6767-35eb-46e3-b669-fb2804a2be56	GERENTE DE INTEGRACAO E TESTES II	\N	\N	\N	142605	t	2025-11-11 19:54:45.271801	2025-11-11 19:54:45.271801	10-173	10	t	2025-11-11 19:54:45.239
20a404f1-3a27-487b-a10b-8af36bd09db4	GERENTE DE INTEGRACAO E TESTES III	\N	\N	\N	142605	t	2025-11-11 19:54:45.329145	2025-11-11 19:54:45.329145	10-160	10	t	2025-11-11 19:54:45.298
c90c9d5b-2d7b-4916-a283-31b20e9df790	GERENTE DE INTEGRACAO E TESTES IV	\N	\N	\N	142605	t	2025-11-11 19:54:45.387606	2025-11-11 19:54:45.387606	10-174	10	t	2025-11-11 19:54:45.355
5eda4c2b-2b61-4696-a667-53385779813f	GERENTE DE INTEGRACAO E TESTES V	\N	\N	\N	142605	t	2025-11-11 19:54:45.447068	2025-11-11 19:54:45.447068	10-172	10	t	2025-11-11 19:54:45.415
61648789-701a-49ec-aec1-a3e4c0e1969f	GERENTE DE OPERAÇÕES	\N	\N	\N	142105	t	2025-11-11 19:54:45.505877	2025-11-11 19:54:45.505877	10-620	10	t	2025-11-11 19:54:45.474
26369af7-27d9-4fb2-a815-a18601c14a8c	HIGIENIZADOR	\N	\N	\N	514120	t	2025-11-11 19:54:45.565124	2025-11-11 19:54:45.565124	10-556	10	t	2025-11-11 19:54:45.534
89b0962a-9011-4c3e-993c-af2b078c8289	INSPETOR DE QUALIDADE JUNIOR	\N	\N	\N	391205	t	2025-11-11 19:54:48.898923	2025-11-11 19:54:48.898923	10-384	10	t	2025-11-11 19:54:48.68
bfc3f7e1-7bc6-44d0-950c-c62c5883e570	INSPETOR DE QUALIDADE PL	\N	\N	\N	391205	t	2025-11-11 19:54:48.959883	2025-11-11 19:54:48.959883	10-350	10	t	2025-11-11 19:54:48.927
6f397ae2-d15c-4399-8dcf-0ad126cf06d3	MEIO OFICIAL SERRALHEIRO	\N	\N	\N	724440	t	2025-11-11 19:54:56.905658	2025-11-11 19:54:56.905658	10-729	10	t	2025-11-11 19:54:56.693
e90c6005-91de-4eac-b76a-5ab49074744a	METROLOGISTA	\N	\N	\N	352305	t	2025-11-11 19:54:56.965229	2025-11-11 19:54:56.965229	1-142	1	t	2025-11-11 19:54:56.933
090d7d36-0135-4d66-8715-55c593d2dd2f	MONTADOR AUXILIAR 	\N	\N	\N	725105	t	2025-11-11 19:54:59.182479	2025-11-11 19:54:59.182479	10-436	10	t	2025-11-11 19:54:58.961
33423822-4ada-4305-9347-1d6668ccf081	MONTADOR DE ANDAIMES	\N	\N	\N	715545	t	2025-11-11 19:54:59.243338	2025-11-11 19:54:59.243338	10-0067	10	t	2025-11-11 19:54:59.211
d95ab2e9-a9de-45b1-83c7-667e4f7f8a0a	MOTORISTA ENTREGADOR NOVA ALVORADA 	\N	\N	\N	782310	t	2025-11-11 19:55:01.209197	2025-11-11 19:55:01.209197	10-719	10	t	2025-11-11 19:55:00.992
dd38e3e2-7eea-41c7-b2f6-bfea31953145	MOTORISTA LIDER	\N	\N	\N	782510	t	2025-11-11 19:55:01.273793	2025-11-11 19:55:01.273793	10-0069	10	t	2025-11-11 19:55:01.241
f3c90776-163f-4863-b20d-0d5893580dbd	OFICIAL DE MANUTENCAO CIVIL	\N	\N	\N	514325	t	2025-11-11 19:55:01.94778	2025-11-11 19:55:01.94778	10-646	10	t	2025-11-11 19:55:01.915
7a02143a-6119-465e-8e20-d7b4d466e3a7	OFICIAL DE MANUTENCAO CIVIL I	\N	\N	\N	514325	t	2025-11-11 19:55:02.008592	2025-11-11 19:55:02.008592	10-529	10	t	2025-11-11 19:55:01.976
5c8fc0b8-8b52-428b-b0b4-7ad6976f7d3f	OFICIAL DE MANUTENCAO I	\N	\N	\N	514325	t	2025-11-11 19:55:02.069638	2025-11-11 19:55:02.069638	10-726	10	t	2025-11-11 19:55:02.037
685b95a6-0496-4818-9fa6-c082e3378b65	OFICIAL DE MANUTENCAO II	\N	\N	\N	514325	t	2025-11-11 19:55:02.130662	2025-11-11 19:55:02.130662	10-727	10	t	2025-11-11 19:55:02.098
67684767-b618-44fb-85be-9c8cc4de28f6	OFICIAL SERRALHEIRO	\N	\N	\N	724440	t	2025-11-11 19:55:02.191701	2025-11-11 19:55:02.191701	10-728	10	t	2025-11-11 19:55:02.159
10638fa5-36e1-4b26-8254-eb233b9285a0	OP DE ARMAZEM PLENO	\N	\N	\N	414110	t	2025-11-11 19:55:02.252683	2025-11-11 19:55:02.252683	6-92	6	t	2025-11-11 19:55:02.22
453c02f0-4f4d-4082-b58e-92d78b846c01	OP DE ARMAZEM SENIOR	\N	\N	\N	414110	t	2025-11-11 19:55:02.313775	2025-11-11 19:55:02.313775	6-94	6	t	2025-11-11 19:55:02.281
8ce02aa2-4540-40f9-b5d8-dbc1076c4ee1	OP DE EMPILHADEIRA 	\N	\N	\N	782220	t	2025-11-11 19:55:02.613025	2025-11-11 19:55:02.613025	10-722	10	t	2025-11-11 19:55:02.403
eaf21492-31f3-4f2e-9b5e-0e08a9b0180d	OP DE MANUTENÇÃO/REFRIGERACAO	\N	\N	\N	911205	t	2025-11-11 19:55:02.672075	2025-11-11 19:55:02.672075	10-153	10	t	2025-11-11 19:55:02.64
1642259f-f5f0-44c1-aab0-6315be5b55ea	OP DE MAQUINA DE FABRICAÇÃO DE COSMETICO	\N	\N	\N	811815	t	2025-11-11 19:55:02.731929	2025-11-11 19:55:02.731929	6-36	6	t	2025-11-11 19:55:02.699
16607178-c1d5-4295-97ae-f48b587da3fa	OP. DE ARMAZEM SENIOR	\N	\N	\N	414110	t	2025-11-11 19:55:02.790772	2025-11-11 19:55:02.790772	10-248	10	t	2025-11-11 19:55:02.758
4fb3f9db-a2e3-455b-848c-ddaf233575c8	OP. DE EMPILHADEIRA	\N	\N	\N	782220	t	2025-11-11 19:55:02.848089	2025-11-11 19:55:02.848089	2-256	2	t	2025-11-11 19:55:02.817
5a1aff4a-e559-4d42-941d-f38fbc180734	OP. DE EMPILHADEIRA - FLUIDOS	\N	\N	\N	782220	t	2025-11-11 19:55:02.906348	2025-11-11 19:55:02.906348	10-391	10	t	2025-11-11 19:55:02.874
9dca13be-6aa3-45c1-b915-9a5e7307ee1a	OP. DE PRODUÇÃO	\N	\N	\N	784205	t	2025-11-11 19:55:02.968957	2025-11-11 19:55:02.968957	10-0088	10	t	2025-11-11 19:55:02.936
fda890e7-d0cd-4859-9736-bef22df635ec	OP. DE PRODUCAO - ACABAMENTOS	\N	\N	\N	784205	t	2025-11-11 19:55:03.039326	2025-11-11 19:55:03.039326	10-325	10	t	2025-11-11 19:55:03.007
afe1ec7b-d3f2-4573-855c-82546d4b410c	OP. DE VEICULOS II - LIDER	\N	\N	\N	782305	t	2025-11-11 19:55:03.097527	2025-11-11 19:55:03.097527	10-538	10	t	2025-11-11 19:55:03.065
232f301d-f3cd-4c89-b5b7-55301401c01a	OPER DE EMPILHADEIRA	\N	\N	\N	782220	t	2025-11-11 19:55:03.155874	2025-11-11 19:55:03.155874	10-256	10	t	2025-11-11 19:55:03.124
a17560c2-e5d5-4a10-b5e0-2d63f6f47b67	OPER DE EMPILHADEIRA - EMBRART	\N	\N	\N	782220	t	2025-11-11 19:55:03.215572	2025-11-11 19:55:03.215572	10-0080	10	t	2025-11-11 19:55:03.182
1e9f891f-7b3b-49c0-9c83-a1e51d0859aa	ENCARREGADO DE PRODUÇÃO	\N	\N	\N	414210	t	2025-11-11 19:54:37.515004	2025-11-11 19:54:37.515004	10-0039	10	t	2025-11-11 19:54:37.482
54c76527-8320-4142-bca0-3be955ca395e	HIGIENIZADOR DE VEÍCULOS	\N	\N	\N	519935	t	2025-11-11 19:54:45.867108	2025-11-11 19:54:45.867108	10-0363	10	t	2025-11-11 19:54:45.65
95ad7ade-336c-44cd-aecf-7ad1dd6a6af6	Implantação	\N	\N	\N	 	t	2025-11-11 19:54:45.927534	2025-11-11 19:54:45.927534	1-999999999	1	t	2025-11-11 19:54:45.895
79309c5e-b997-4303-8355-c351cad98335	ENCARREGADO DE PRODUCAO I	\N	\N	\N	414210	t	2025-11-11 19:54:37.696979	2025-11-11 19:54:37.696979	1-27	1	t	2025-11-11 19:54:37.663
85ec4bdd-8eaf-45a6-96b9-3c4d02fc3f22	INSIDE SALES	\N	\N	\N	354120	t	2025-11-11 19:54:45.987531	2025-11-11 19:54:45.987531	10-606	10	t	2025-11-11 19:54:45.955
129d0bca-9244-410c-b4af-a3fb9b3741b7	ENCARREGADO DE PRODUCAO II	\N	\N	\N	414210	t	2025-11-11 19:54:37.815123	2025-11-11 19:54:37.815123	10-0035	10	t	2025-11-11 19:54:37.784
ea26f6de-9e5e-4f2c-8a21-4049883a2195	INSPETOR DE FORNECEDORES	\N	\N	\N	784205	t	2025-11-11 19:54:46.047489	2025-11-11 19:54:46.047489	1-103	1	t	2025-11-11 19:54:46.015
6f290744-d9c7-42b9-834a-648dc8761d04	ENCARREGADO DE PRODUCAO III	\N	\N	\N	414210	t	2025-11-11 19:54:38.363897	2025-11-11 19:54:38.363897	1-114	1	t	2025-11-11 19:54:38.15
b4ef7cb7-236c-4dd5-8181-41da80c85a6f	INSPETOR DE QUALIDADE PLENO	\N	\N	\N	391205	t	2025-11-11 19:54:49.256972	2025-11-11 19:54:49.256972	6-8	6	t	2025-11-11 19:54:49.046
361b2948-2e69-4702-9713-a416c6db6535	ENCARREGADO DE PRODUÇÃO III	\N	\N	\N	414210	t	2025-11-11 19:54:38.665698	2025-11-11 19:54:38.665698	10-498	10	t	2025-11-11 19:54:38.451
c1988db8-69e7-4dba-9f3d-f24bcbabe496	ENCARREGADO ELETRICO	\N	\N	\N	214305	t	2025-11-11 19:54:38.725818	2025-11-11 19:54:38.725818	10-634	10	t	2025-11-11 19:54:38.694
ace6a125-b345-4b85-a550-7847f955f34b	ENCARREGADO GERAL 	\N	\N	\N	992205	t	2025-11-11 19:54:38.785096	2025-11-11 19:54:38.785096	10-439	10	t	2025-11-11 19:54:38.753
0a9de975-20e8-4d69-aaf1-294383fd602e	ENCARREGADO II	\N	\N	\N	410105	t	2025-11-11 19:54:38.84396	2025-11-11 19:54:38.84396	10-502	10	t	2025-11-11 19:54:38.812
0e540a2e-1a4d-4234-ad39-1d1269f2efd8	ENCARREGADO III	\N	\N	\N	410105	t	2025-11-11 19:54:38.903369	2025-11-11 19:54:38.903369	10-503	10	t	2025-11-11 19:54:38.871
13e8f416-7edb-4786-90d2-c9d4f287db29	ENCARREGADO MECANICO	\N	\N	\N	910105	t	2025-11-11 19:54:38.962534	2025-11-11 19:54:38.962534	10-486	10	t	2025-11-11 19:54:38.93
11ae2bb7-1995-4f79-a879-0d25c8196c64	INSTRUMENTISTA TUBISTA	\N	\N	\N	313410	t	2025-11-11 19:54:49.315348	2025-11-11 19:54:49.315348	7-11	7	t	2025-11-11 19:54:49.283
1339fd16-5d28-4b4d-930e-23c554c214db	ENCARREGADO N1	\N	\N	\N	410105	t	2025-11-11 19:54:39.268674	2025-11-11 19:54:39.268674	10-662	10	t	2025-11-11 19:54:39.049
0a6a421e-aade-4e4e-8349-8a7e9e2ceebf	ENCARREGADO OPERACIONAL ADMINISTRATIVO	\N	\N	\N	413115	t	2025-11-11 19:54:39.328611	2025-11-11 19:54:39.328611	1-56	1	t	2025-11-11 19:54:39.297
6d188336-1aa3-446e-a335-bd312f1253ab	ENCARREGADO REFRIGERACAO	\N	\N	\N	725705	t	2025-11-11 19:54:39.636462	2025-11-11 19:54:39.636462	10-653	10	t	2025-11-11 19:54:39.417
ceec1e45-31cb-4349-b459-2fc848992199	ENG DE MECANICO	\N	\N	\N	214405	t	2025-11-11 19:54:39.697514	2025-11-11 19:54:39.697514	10-438	10	t	2025-11-11 19:54:39.664
7b7f0d03-b4c3-4a8f-be20-de6bb384ea3f	ENG DE PRODUTO PLENO	\N	\N	\N	214905	t	2025-11-11 19:54:39.757972	2025-11-11 19:54:39.757972	6-153	6	t	2025-11-11 19:54:39.725
17835276-c841-43d7-935d-0da9eb3a7324	LIDER DE MANUTENÇAO	\N	\N	\N	911305	t	2025-11-11 19:54:52.775362	2025-11-11 19:54:52.775362	10-281	10	t	2025-11-11 19:54:52.56
e31fdfa4-150a-49dd-b11a-ebef3a25f632	LIDER DE OPERACAO	\N	\N	\N	840105	t	2025-11-11 19:54:52.835963	2025-11-11 19:54:52.835963	10-668	10	t	2025-11-11 19:54:52.803
dc6e811f-ccf8-4e5a-86d0-049e12dfa3ae	ENG. DESENVOLVIMENTO PRODUTO	\N	\N	\N	214905	t	2025-11-11 19:54:40.300661	2025-11-11 19:54:40.300661	10-432	10	t	2025-11-11 19:54:40.085
00a09630-75f3-4253-8591-1ebb104d92df	ENGENHEIRO DE PRODUTO JUNIOR	\N	\N	\N	214905	t	2025-11-11 19:54:40.360818	2025-11-11 19:54:40.360818	1-130	1	t	2025-11-11 19:54:40.328
07dcdd65-cb67-4ab2-9b1c-331330957520	LIDER DE OPERACOES	\N	\N	\N	821405	t	2025-11-11 19:54:52.896635	2025-11-11 19:54:52.896635	1-108	1	t	2025-11-11 19:54:52.864
b776f846-99f6-4c97-8b0b-136a31fe5a02	ENGENHEIRO DE PRODUTO SENIOR	\N	\N	\N	214905	t	2025-11-11 19:54:40.657919	2025-11-11 19:54:40.657919	6-15	6	t	2025-11-11 19:54:40.449
ef5eadbf-6b82-40d0-8acf-4a7916037895	ENGENHEIRO DE PROJETOS JR	\N	\N	\N	214905	t	2025-11-11 19:54:40.775646	2025-11-11 19:54:40.775646	10-518	10	t	2025-11-11 19:54:40.743
35799933-0f0c-4e4c-ae67-d7337bb37e1c	ENGENHEIRO DE PROJETOS PL	\N	\N	\N	214905	t	2025-11-11 19:54:40.835876	2025-11-11 19:54:40.835876	10-517	10	t	2025-11-11 19:54:40.804
4a956b6a-4ef2-475a-9e94-f5d879a95136	ENGENHEIRO DE PROJETOS SR	\N	\N	\N	214905	t	2025-11-11 19:54:40.897775	2025-11-11 19:54:40.897775	10-516	10	t	2025-11-11 19:54:40.863
3a541741-69d7-4a90-9e38-7ac5ed6dfcaf	ENGENHEIRO DE QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:54:40.95684	2025-11-11 19:54:40.95684	10-645	10	t	2025-11-11 19:54:40.925
756bfa1c-4f08-4640-bbd0-e4ee6840744c	ENGENHEIRO DE SEGURANÇA	\N	\N	\N	214915	t	2025-11-11 19:54:41.015962	2025-11-11 19:54:41.015962	10-559	10	t	2025-11-11 19:54:40.984
0e9e6c2c-4578-4459-a30b-570fa3f3ea13	ENGENHEIRO DE SEGURANCA DO TRABALHO	\N	\N	\N	214915	t	2025-11-11 19:54:41.075435	2025-11-11 19:54:41.075435	10-599	10	t	2025-11-11 19:54:41.043
962a77c8-b716-4eb5-83b8-bcc3f29fd611	ENGENHEIRO ELETRICO    	\N	\N	\N	214305	t	2025-11-11 19:54:41.134423	2025-11-11 19:54:41.134423	10-615	10	t	2025-11-11 19:54:41.102
d83759e4-79c3-4a07-a32a-9184f13c6d51	ENGENHEIRO ELETRICO JR	\N	\N	\N	214305	t	2025-11-11 19:54:41.193575	2025-11-11 19:54:41.193575	10-656	10	t	2025-11-11 19:54:41.161
52fd81a4-9d07-4c8e-866f-a5b82c2de14a	ENGENHEIRO ELETRICO PL	\N	\N	\N	214305	t	2025-11-11 19:54:41.254019	2025-11-11 19:54:41.254019	10-657	10	t	2025-11-11 19:54:41.221
3b81236d-3aa3-4971-a3b0-abfd04a70480	ENGENHEIRO ELETRICO SENIOR	\N	\N	\N	214305	t	2025-11-11 19:54:41.313051	2025-11-11 19:54:41.313051	10-744	10	t	2025-11-11 19:54:41.281
de15d9e5-03f3-4551-b341-a80c39ce5f81	ENGENHEIRO I 	\N	\N	\N	214405	t	2025-11-11 19:54:41.372227	2025-11-11 19:54:41.372227	10-504	10	t	2025-11-11 19:54:41.34
99f12675-9ae2-4602-8a33-bb32733f7874	ENGENHEIRO II 	\N	\N	\N	214405	t	2025-11-11 19:54:41.431307	2025-11-11 19:54:41.431307	10-523	10	t	2025-11-11 19:54:41.399
c588a28b-fada-4e0e-a484-2f7c679c41a3	ENGENHEIRO III	\N	\N	\N	214405	t	2025-11-11 19:54:41.492007	2025-11-11 19:54:41.492007	10-526	10	t	2025-11-11 19:54:41.46
e956bf20-eacf-4190-95f2-fcd31e2b60e9	ENGENHEIRO JR	\N	\N	\N	214905	t	2025-11-11 19:54:41.550843	2025-11-11 19:54:41.550843	10-168	10	t	2025-11-11 19:54:41.519
73f2844f-cd61-4e25-bc09-7df04b0caca9	ENGENHEIRO MECANICO JUNIOR	\N	\N	\N	214405	t	2025-11-11 19:54:41.61026	2025-11-11 19:54:41.61026	10-568	10	t	2025-11-11 19:54:41.578
f9d9218a-fb6d-41e7-9e4e-4dd7ed6715ab	ENGENHEIRO MECANICO PLENO	\N	\N	\N	214405	t	2025-11-11 19:54:41.670096	2025-11-11 19:54:41.670096	10-566	10	t	2025-11-11 19:54:41.637
947731db-22cf-406d-8969-6162bc6c9dac	ENGENHEIRO MECANICO SENIOR	\N	\N	\N	214405	t	2025-11-11 19:54:41.729511	2025-11-11 19:54:41.729511	10-597	10	t	2025-11-11 19:54:41.697
000aa5ad-afc4-4f96-9228-d39237f816f7	ENGENHEIRO SR	\N	\N	\N	214905	t	2025-11-11 19:54:41.791738	2025-11-11 19:54:41.791738	10-170	10	t	2025-11-11 19:54:41.757
86e3e07a-019f-4064-8d4b-28075b3e91a1	MONTADOR I	\N	\N	\N	725010	t	2025-11-11 19:54:59.543049	2025-11-11 19:54:59.543049	10-524	10	t	2025-11-11 19:54:59.332
0174cdff-e5a5-4229-9939-6c4d04dcd145	MONTADOR II	\N	\N	\N	725010	t	2025-11-11 19:54:59.601469	2025-11-11 19:54:59.601469	10-505	10	t	2025-11-11 19:54:59.569
d98568d6-0955-49f8-853d-745fd79e0139	MONTADOR III	\N	\N	\N	725010	t	2025-11-11 19:54:59.659608	2025-11-11 19:54:59.659608	10-565	10	t	2025-11-11 19:54:59.628
cdcadd2f-6e57-4992-920d-8999ce2dc9c7	MONTADOR JUNIOR INSTRUMENTISTA	\N	\N	\N	731135	t	2025-11-11 19:54:59.717614	2025-11-11 19:54:59.717614	10-187	10	t	2025-11-11 19:54:59.686
c7fb0195-32f0-4d7f-8c89-9808a4c5bc00	MONTADOR MECANICO	\N	\N	\N	731135	t	2025-11-11 19:54:59.7761	2025-11-11 19:54:59.7761	10-440	10	t	2025-11-11 19:54:59.744
9fee78f3-cc78-400e-898e-0c2a5788f628	MONTADOR PLENO	\N	\N	\N	914205	t	2025-11-11 19:54:59.833886	2025-11-11 19:54:59.833886	6-7	6	t	2025-11-11 19:54:59.802
c5559972-54c6-4b8f-8589-ed10eb3fbf72	MOTORISTA	\N	\N	\N	782510	t	2025-11-11 19:54:59.891841	2025-11-11 19:54:59.891841	10-167	10	t	2025-11-11 19:54:59.86
02e1631d-4a2b-496a-8995-aab2dd5f3586	OPER DE EMPILHADEIRA JR	\N	\N	\N	782220	t	2025-11-11 19:55:03.534277	2025-11-11 19:55:03.534277	10-241	10	t	2025-11-11 19:55:03.306
aa6bbc02-4409-48ff-9e59-d3f4138300f7	OPER DE EMPILHADEIRA SENIOR	\N	\N	\N	782220	t	2025-11-11 19:55:03.594381	2025-11-11 19:55:03.594381	10-242	10	t	2025-11-11 19:55:03.562
a3abb03c-e97e-47d3-baff-cb351c7fcf2b	OPER EMPILHADEIRA MANOBRISTA	\N	\N	\N	782220	t	2025-11-11 19:55:03.654109	2025-11-11 19:55:03.654109	10-681	10	t	2025-11-11 19:55:03.621
250ea348-c6ca-43c0-923a-88d4ba9f94f1	OPER LOGISTICO JR	\N	\N	\N	342110	t	2025-11-11 19:55:03.714072	2025-11-11 19:55:03.714072	10-0081	10	t	2025-11-11 19:55:03.681
0901b838-e400-4e29-b59d-50a9c2177b4f	OPER. LOGISTICO III	\N	\N	\N	141615	t	2025-11-11 19:55:04.016016	2025-11-11 19:55:04.016016	10-231	10	t	2025-11-11 19:55:03.8
2f553fd5-fb04-4df7-a0bb-16a33417b5b4	OPER. MAQUINA ROCAL	\N	\N	\N	641015	t	2025-11-11 19:55:04.076817	2025-11-11 19:55:04.076817	10-411	10	t	2025-11-11 19:55:04.044
42486510-f88f-4684-9ad5-694afd6920f7	OPERADOR	\N	\N	\N	784205	t	2025-11-11 19:55:04.136028	2025-11-11 19:55:04.136028	1-46	1	t	2025-11-11 19:55:04.103
404a7d17-a071-40a1-abd9-488ae2f8ebf3	OPERADOR AUXILIAR	\N	\N	\N	784205	t	2025-11-11 19:55:04.195318	2025-11-11 19:55:04.195318	10-328	10	t	2025-11-11 19:55:04.163
82bf1048-c818-4097-b772-8d07b966c5b8	OPERADOR CORTE ÁGUA	\N	\N	\N	862305	t	2025-11-11 19:55:04.254307	2025-11-11 19:55:04.254307	10-166	10	t	2025-11-11 19:55:04.222
9ab6c984-f437-4534-a316-01e3e315b256	OPERADOR DA QUALIDADE	\N	\N	\N	391215	t	2025-11-11 19:55:04.315594	2025-11-11 19:55:04.315594	10-336	10	t	2025-11-11 19:55:04.281
a0bab41a-4dd5-4280-bfef-46132c8ec170	OPERADOR DA QUALIDADE I	\N	\N	\N	391215	t	2025-11-11 19:55:04.375582	2025-11-11 19:55:04.375582	10-353	10	t	2025-11-11 19:55:04.342
4919ad91-cd54-414b-8501-c666cdd9f7b9	OPERADOR DE ACABAMENTO	\N	\N	\N	784205	t	2025-11-11 19:55:04.434692	2025-11-11 19:55:04.434692	10-457	10	t	2025-11-11 19:55:04.402
4f278d09-40fd-47a5-bf5b-e9a3dadb53ac	OPERADOR DE ARMAZÉM JÚNIOR	\N	\N	\N	414110	t	2025-11-11 19:55:04.493812	2025-11-11 19:55:04.493812	10-0072	10	t	2025-11-11 19:55:04.461
90f2fd4c-8a50-4dc9-9775-18b2e2e6c6f6	OPERADOR DE ARMAZEM PL (EMPILHADEIRA)	\N	\N	\N	782220	t	2025-11-11 19:55:04.797505	2025-11-11 19:55:04.797505	6-86	6	t	2025-11-11 19:55:04.58
83f88354-61cf-4fd1-a111-5bb3d23a8117	OPERADOR DE ARMAZÉM PLENO	\N	\N	\N	414110	t	2025-11-11 19:55:05.108379	2025-11-11 19:55:05.108379	10-0073	10	t	2025-11-11 19:55:04.886
569c5dd2-2f2e-4fc3-952b-cc683e8a4bd4	OPERADOR DE BASE I	\N	\N	\N	521135	t	2025-11-11 19:55:05.411807	2025-11-11 19:55:05.411807	1-32	1	t	2025-11-11 19:55:05.198
fa26ea9b-b2ba-4cf3-88f5-5066b2af34b0	OPERADOR DE CAIXA	\N	\N	\N	421125	t	2025-11-11 19:55:05.471083	2025-11-11 19:55:05.471083	4-2	4	t	2025-11-11 19:55:05.439
07f4fb02-f0ce-4d39-9fdb-650a5c4a795b	OPERADOR DE CALDEIRA	\N	\N	\N	862120	t	2025-11-11 19:55:05.529533	2025-11-11 19:55:05.529533	10-690	10	t	2025-11-11 19:55:05.497
7bbee3a0-123e-4088-9321-923a0d9b80f5	OPERADOR DE CALDEIRA - EMBRART	\N	\N	\N	862120	t	2025-11-11 19:55:05.588406	2025-11-11 19:55:05.588406	6-57	6	t	2025-11-11 19:55:05.556
d6f8c4f1-9381-40a6-b733-cbddb33c24ad	OPERADOR DE CALDEIRA - LECLAIR	\N	\N	\N	862120	t	2025-11-11 19:55:05.646468	2025-11-11 19:55:05.646468	6-46	6	t	2025-11-11 19:55:05.614
205d3bca-a5ad-418d-8463-7a033bb08d59	OPERADOR DE EFLUENTES	\N	\N	\N	311520	t	2025-11-11 19:55:05.705112	2025-11-11 19:55:05.705112	10-730	10	t	2025-11-11 19:55:05.672
e792968b-90e7-4318-87b1-d4e05c1b762e	OPERADOR DE EMPILHADEIRA	\N	\N	\N	782220	t	2025-11-11 19:55:05.765019	2025-11-11 19:55:05.765019	10-671	10	t	2025-11-11 19:55:05.731
ad395d43-6c45-44bf-bbe4-264b373c6018	OPERADOR DE EMPILHADEIRA - AURORA	\N	\N	\N	782220	t	2025-11-11 19:55:06.807222	2025-11-11 19:55:06.807222	6-53	6	t	2025-11-11 19:55:06.593
9d15a8a3-5e3c-4662-8251-15eb96776449	OPERADOR DE EMPILHADEIRA I	\N	\N	\N	782220	t	2025-11-11 19:55:06.86589	2025-11-11 19:55:06.86589	1-64	1	t	2025-11-11 19:55:06.834
aeb1237c-34bb-4562-820d-6a5f8ad8e84e	OPERADOR DE EMPILHADEIRA II	\N	\N	\N	782220	t	2025-11-11 19:55:06.924331	2025-11-11 19:55:06.924331	1-65	1	t	2025-11-11 19:55:06.892
af9ad596-3491-41e7-8cef-cfa368cf4995	OPERADOR DE EMPILHADEIRA III	\N	\N	\N	782220	t	2025-11-11 19:55:07.475177	2025-11-11 19:55:07.475177	1-66	1	t	2025-11-11 19:55:07.259
8fafd06b-45a5-4860-9440-acf80ecce54f	OPERADOR DE EQUIPAMENTOS	\N	\N	\N	862150	t	2025-11-11 19:55:07.534961	2025-11-11 19:55:07.534961	10-317	10	t	2025-11-11 19:55:07.502
2c001d69-58ef-4018-89c9-7ca4364b3347	OPERADOR DE EQUIPAMENTOS I	\N	\N	\N	862150	t	2025-11-11 19:55:07.594451	2025-11-11 19:55:07.594451	10-133	10	t	2025-11-11 19:55:07.562
311af915-201e-4e97-a1b4-84dda896cabe	OPERADOR DE EXTRUSAO	\N	\N	\N	813115	t	2025-11-11 19:55:07.653949	2025-11-11 19:55:07.653949	10-345	10	t	2025-11-11 19:55:07.621
3bb6f3ed-0b34-4196-9f85-1db45ff138aa	OPERADOR DE FLUIDOS I	\N	\N	\N	784205	t	2025-11-11 19:55:07.71734	2025-11-11 19:55:07.71734	10-456	10	t	2025-11-11 19:55:07.685
3f1563ae-1801-4522-8ab6-75653442b282	OPERADOR DE FORNO	\N	\N	\N	725505	t	2025-11-11 19:55:07.776914	2025-11-11 19:55:07.776914	10-381	10	t	2025-11-11 19:55:07.744
4d5769e7-0fc8-4d95-a874-396acf02308e	OPERADOR DE INJETORA 	\N	\N	\N	811770	t	2025-11-11 19:55:07.836371	2025-11-11 19:55:07.836371	10-188	10	t	2025-11-11 19:55:07.804
1d7aeb2e-a56c-469c-bcee-d73bd2dc38d7	OPERADOR DE INSPEÇÃO	\N	\N	\N	 	t	2025-11-11 19:55:07.896275	2025-11-11 19:55:07.896275	10-261	10	t	2025-11-11 19:55:07.863
eef5f294-ad1a-4853-b66b-869aa1d789d8	OPERADOR DE LOGISTICA I	\N	\N	\N	141615	t	2025-11-11 19:55:08.19989	2025-11-11 19:55:08.19989	10-0071	10	t	2025-11-11 19:55:07.983
dd4a09af-f604-4816-8c74-24fd624bdf75	OPERADOR DE MAQUINA	\N	\N	\N	862150	t	2025-11-11 19:55:08.498199	2025-11-11 19:55:08.498199	10-0087	10	t	2025-11-11 19:55:08.288
62035023-dfdc-46e4-810a-c3e95c602d61	OPERADOR DE MAQUINA E EQUIP. DE ELEVACAO	\N	\N	\N	862150	t	2025-11-11 19:55:09.044706	2025-11-11 19:55:09.044706	1-143	1	t	2025-11-11 19:55:08.832
22ae78be-5c9d-4f41-a762-dbd6649ed096	OPERADOR DE MAQUINA II	\N	\N	\N	811815	t	2025-11-11 19:55:09.108454	2025-11-11 19:55:09.108454	6-45	6	t	2025-11-11 19:55:09.076
680c630a-2632-4e5d-bcff-c09cef3fde6f	OPERADOR DE MAQUINA III	\N	\N	\N	811815	t	2025-11-11 19:55:09.167653	2025-11-11 19:55:09.167653	6-39	6	t	2025-11-11 19:55:09.135
f88efc43-41cf-481f-bed1-0ce5bf6c0eb6	OPERADOR DE MAQUINA LASER I-A 	\N	\N	\N	862150	t	2025-11-11 19:55:09.468828	2025-11-11 19:55:09.468828	10-675	10	t	2025-11-11 19:55:09.253
3d34d3b0-4bae-4b1c-8da1-d1fbe183d212	OPERADOR DE MAQUINA SR	\N	\N	\N	862150	t	2025-11-11 19:55:09.528881	2025-11-11 19:55:09.528881	10-253	10	t	2025-11-11 19:55:09.496
71c6d655-0244-49ee-aea0-c81d1ded2f79	OPERADOR DE MAQUINA TRAINEE	\N	\N	\N	721210	t	2025-11-11 19:55:09.588676	2025-11-11 19:55:09.588676	10-218	10	t	2025-11-11 19:55:09.556
58194fb3-a646-4402-afbd-f90ac13da616	OPERADOR DE MAQUINA TRIPULADA	\N	\N	\N	862150	t	2025-11-11 19:55:09.651676	2025-11-11 19:55:09.651676	10-677	10	t	2025-11-11 19:55:09.618
6449cb7c-2495-4dfe-8161-2dac9349a254	OPERADOR DE MÁQUINAS I - MÃO COLORIDA	\N	\N	\N	721430	t	2025-11-11 19:55:09.711596	2025-11-11 19:55:09.711596	6-73	6	t	2025-11-11 19:55:09.679
dec0162f-834f-40b3-ae33-08d591653935	OPERADOR DE MODELAGEM	\N	\N	\N	723120	t	2025-11-11 19:55:10.01668	2025-11-11 19:55:10.01668	10-735	10	t	2025-11-11 19:55:09.799
4e43f20e-2b89-4b1e-9da4-d7e1b4b4e1c6	OPERADOR DE MOTOSSERRA	\N	\N	\N	632120	t	2025-11-11 19:55:10.076487	2025-11-11 19:55:10.076487	10-554	10	t	2025-11-11 19:55:10.044
6cd6439c-5277-438d-b3f4-6861c648fe2e	OPERADOR DE PÁ CARREGADEIRA I	\N	\N	\N	715135	t	2025-11-11 19:55:10.145506	2025-11-11 19:55:10.145506	10-395	10	t	2025-11-11 19:55:10.113
dbde4b76-7ce3-4312-a8e8-e5008a7dff98	OPERADOR DE PÁ CARREGADEIRA II	\N	\N	\N	715135	t	2025-11-11 19:55:10.205838	2025-11-11 19:55:10.205838	10-397	10	t	2025-11-11 19:55:10.173
f48968ee-e20c-4fee-8e49-b74afec2c34b	OPERADOR DE PLOTTER I	\N	\N	\N	766230	t	2025-11-11 19:55:10.265064	2025-11-11 19:55:10.265064	10-691	10	t	2025-11-11 19:55:10.232
b47b5f89-81da-4c6b-917e-27e20d695dd2	OPERADOR DE POLIMENTO	\N	\N	\N	784205	t	2025-11-11 19:55:10.324831	2025-11-11 19:55:10.324831	10-665	10	t	2025-11-11 19:55:10.292
8759653a-e711-4fe8-a130-2c8365a2e2e7	OPERADOR DE PRODUCAO	\N	\N	\N	784205	t	2025-11-11 19:55:10.384353	2025-11-11 19:55:10.384353	10-383	10	t	2025-11-11 19:55:10.352
d8e579a1-69b2-430e-9d2f-bdcd749c20aa	OPERADOR DE PRODUÇÃO - MAGNA	\N	\N	\N	784205	t	2025-11-11 19:55:10.44266	2025-11-11 19:55:10.44266	6-12	6	t	2025-11-11 19:55:10.411
69106766-d780-4d1a-ae54-3bbd7db92341	OPERADOR DE PRODUÇÃO COOP ATIB	\N	\N	\N	784205	t	2025-11-11 19:55:10.50234	2025-11-11 19:55:10.50234	10-366	10	t	2025-11-11 19:55:10.47
a80db0cc-f6ab-41bb-8d2f-71cefa9a4049	OPERADOR DE PRODUCAO CS1	\N	\N	\N	784205	t	2025-11-11 19:55:10.561716	2025-11-11 19:55:10.561716	10-458	10	t	2025-11-11 19:55:10.529
86b4905f-a23c-4b6f-ace0-6569052790e8	OPERADOR DE PRODUCAO CS2	\N	\N	\N	784205	t	2025-11-11 19:55:10.621007	2025-11-11 19:55:10.621007	10-460	10	t	2025-11-11 19:55:10.588
fc9ac194-e6ac-40ba-ae23-3adaeb8e59b8	OPERADOR DE PRODUCAO I	\N	\N	\N	784205	t	2025-11-11 19:55:10.68064	2025-11-11 19:55:10.68064	10-676	10	t	2025-11-11 19:55:10.648
fb343069-b90c-4e3b-83ea-1c91752762c8	OPERADOR DE QUALIDADE - FLUIDOS	\N	\N	\N	391215	t	2025-11-11 19:55:10.739807	2025-11-11 19:55:10.739807	10-392	10	t	2025-11-11 19:55:10.707
a9f3121b-3cf7-4d75-9197-189dadfb03c5	OPERADOR DE QUALIDADE I	\N	\N	\N	784205	t	2025-11-11 19:55:10.799284	2025-11-11 19:55:10.799284	10-459	10	t	2025-11-11 19:55:10.766
4d3f5c0b-9af1-4f84-8793-2f48fee047dd	OPERADOR DE QUALIDADE II	\N	\N	\N	784205	t	2025-11-11 19:55:10.859108	2025-11-11 19:55:10.859108	10-522	10	t	2025-11-11 19:55:10.826
f5a8803d-feec-48a0-877d-57072d7289a4	OPERADOR DE SOLDA	\N	\N	\N	724315	t	2025-11-11 19:55:10.917985	2025-11-11 19:55:10.917985	10-473	10	t	2025-11-11 19:55:10.885
725b3bdc-65b0-47ff-a736-62e0fea2a098	OPERADOR DE SOPRADOR	\N	\N	\N	784205	t	2025-11-11 19:55:11.218601	2025-11-11 19:55:11.218601	10-550	10	t	2025-11-11 19:55:11.008
8519e7cc-7d3b-472e-a8f4-66d36ef9875f	OPERADOR DE TRANSPALETEIRA	\N	\N	\N	782220	t	2025-11-11 19:55:11.514684	2025-11-11 19:55:11.514684	10-852	10	t	2025-11-11 19:55:11.303
9abca2ef-11c1-467d-85dd-74aea6d270e0	OPERADOR DE VARREDEIRA	\N	\N	\N	991115	t	2025-11-11 19:55:11.57328	2025-11-11 19:55:11.57328	10-574	10	t	2025-11-11 19:55:11.541
17dddfb0-52e0-4395-828d-2bcaec354ee5	OPERADOR DE VEICULO I	\N	\N	\N	782305	t	2025-11-11 19:55:12.121667	2025-11-11 19:55:12.121667	10-194	10	t	2025-11-11 19:55:11.903
54c31ca3-4666-4d16-add6-3b98345b675c	OPERADOR DE VEICULO LIDER	\N	\N	\N	782305	t	2025-11-11 19:55:12.179711	2025-11-11 19:55:12.179711	10-252	10	t	2025-11-11 19:55:12.148
5e8cf2ee-9b23-4c20-a7de-a29c5cc28793	OPERADOR DE VEICULOS	\N	\N	\N	782305	t	2025-11-11 19:55:12.237448	2025-11-11 19:55:12.237448	10-165	10	t	2025-11-11 19:55:12.206
44a34133-8bee-4d24-a07b-34bc894cf55a	OPERADOR DE VEICULOS II	\N	\N	\N	782305	t	2025-11-11 19:55:12.295378	2025-11-11 19:55:12.295378	10-483	10	t	2025-11-11 19:55:12.264
33779436-beed-4b33-ba27-8f494caf57d1	OPERADOR E MOTORISTA DE ENSAIO	\N	\N	\N	314305	t	2025-11-11 19:55:12.353617	2025-11-11 19:55:12.353617	10-455	10	t	2025-11-11 19:55:12.322
187f4c71-0ec7-4be1-9852-c00cfb47bd7e	OPERADOR ECO CARGO	\N	\N	\N	711210	t	2025-11-11 19:55:12.411414	2025-11-11 19:55:12.411414	10-680	10	t	2025-11-11 19:55:12.38
4ef486c6-c87f-41aa-8644-1077e1ede111	OPERADOR I	\N	\N	\N	521135	t	2025-11-11 19:55:12.469101	2025-11-11 19:55:12.469101	1-34	1	t	2025-11-11 19:55:12.437
faeaff53-cb1f-4377-935a-c9c1402a068a	OPERADOR INDUSTRIALIZADOS I	\N	\N	\N	784205	t	2025-11-11 19:55:12.527211	2025-11-11 19:55:12.527211	10-724	10	t	2025-11-11 19:55:12.495
bbda4719-faaa-4655-b212-3d7627f0a7b9	OPERADOR LOGISTICO	\N	\N	\N	782220	t	2025-11-11 19:55:12.585054	2025-11-11 19:55:12.585054	10-260	10	t	2025-11-11 19:55:12.553
add2e2f9-7437-46bc-a97e-2a3fc8497ec5	OPERADOR LOGISTICO I	\N	\N	\N	782220	t	2025-11-11 19:55:13.393043	2025-11-11 19:55:13.393043	10-0082	10	t	2025-11-11 19:55:13.176
06df92e4-02d3-4c2e-91d1-52a51c9369cc	OPERADOR LOGISTICO II	\N	\N	\N	141615	t	2025-11-11 19:55:14.424155	2025-11-11 19:55:14.424155	1-30	1	t	2025-11-11 19:55:14.213
09abdd91-efaf-4fe9-a593-9a261f7af10d	OPERADOR MULTIF III	\N	\N	\N	783225	t	2025-11-11 19:55:15.214562	2025-11-11 19:55:15.214562	1-78	1	t	2025-11-11 19:55:14.997
41019b2b-fc06-46e6-85e7-971c04149eb8	OPERADOR MULTIFUNCIONAL	\N	\N	\N	391215	t	2025-11-11 19:55:15.275073	2025-11-11 19:55:15.275073	10-435	10	t	2025-11-11 19:55:15.243
c0607cfe-8636-4aa9-a485-24b5b7cf670c	OPERADOR MULTIFUNCIONAL I	\N	\N	\N	784205	t	2025-11-11 19:55:15.575015	2025-11-11 19:55:15.575015	1-62	1	t	2025-11-11 19:55:15.363
96edeb8a-692c-4a1e-9fbd-eb49b76fc87e	OPERADOR MULTIFUNCIONAL II	\N	\N	\N	784205	t	2025-11-11 19:55:16.607858	2025-11-11 19:55:16.607858	10-0078	10	t	2025-11-11 19:55:16.396
1b2d413b-f2c7-4242-9097-9478a9d14f34	OPERADOR MULTIFUNCIONAL III	\N	\N	\N	784205	t	2025-11-11 19:55:17.155051	2025-11-11 19:55:17.155051	1-61	1	t	2025-11-11 19:55:16.938
c1849c12-d2d0-4545-8a83-c919409e6697	OPERADOR MULTIFUNCIONAL IV	\N	\N	\N	784205	t	2025-11-11 19:55:17.937485	2025-11-11 19:55:17.937485	1-102	1	t	2025-11-11 19:55:17.72
2a23a3dc-7f15-4723-b15c-830a9160e20e	OPERADOR VARREDEIRA/LAVADORAS	\N	\N	\N	516315	t	2025-11-11 19:55:17.997203	2025-11-11 19:55:17.997203	10-131	10	t	2025-11-11 19:55:17.965
0a58b169-b175-49cd-8054-dc9b9d518385	OPERADOR(A) DE CAIXA	\N	\N	\N	421125	t	2025-11-11 19:55:18.056899	2025-11-11 19:55:18.056899	2-3	2	t	2025-11-11 19:55:18.025
988b944c-6177-4bd0-869c-70479812235a	ORÇAMENTISTA II	\N	\N	\N	410230	t	2025-11-11 19:55:18.117956	2025-11-11 19:55:18.117956	10-534	10	t	2025-11-11 19:55:18.085
8365fc78-505d-470b-b83b-c94b3a6b1866	PC JR	\N	\N	\N	262410	t	2025-11-11 19:55:18.178187	2025-11-11 19:55:18.178187	10-426	10	t	2025-11-11 19:55:18.146
4bf6c2a6-e130-455e-919b-8655203e4ff7	PC PL	\N	\N	\N	262410	t	2025-11-11 19:55:18.238719	2025-11-11 19:55:18.238719	10-427	10	t	2025-11-11 19:55:18.206
ad9e197f-5d99-49e3-955f-e865ddbdbcd0	PC SR	\N	\N	\N	262410	t	2025-11-11 19:55:18.298344	2025-11-11 19:55:18.298344	10-428	10	t	2025-11-11 19:55:18.266
889ccabb-945f-4ec2-85a7-e1d0989e0fc4	PEDREIRO	\N	\N	\N	715210	t	2025-11-11 19:55:18.358192	2025-11-11 19:55:18.358192	6-48	6	t	2025-11-11 19:55:18.326
aaa5f803-a3af-48e3-b48b-1c1e6f7560c2	PINTOR	\N	\N	\N	723315	t	2025-11-11 19:55:18.927851	2025-11-11 19:55:18.927851	10-0091	10	t	2025-11-11 19:55:18.713
4b090c08-10bc-4597-ba6e-5d6969e929fa	PINTOR DE ESTRUTURAS	\N	\N	\N	723315	t	2025-11-11 19:55:19.230059	2025-11-11 19:55:19.230059	10-628	10	t	2025-11-11 19:55:19.014
06e6564e-264b-45d6-9c41-365fa0eebf28	PINTOR DE VEICULOS	\N	\N	\N	723320	t	2025-11-11 19:55:19.29127	2025-11-11 19:55:19.29127	1-148	1	t	2025-11-11 19:55:19.257
54097a58-6e99-4f8f-93f7-6b4de97a88a0	PINTOR II	\N	\N	\N	723315	t	2025-11-11 19:55:19.351055	2025-11-11 19:55:19.351055	10-605	10	t	2025-11-11 19:55:19.318
63d52177-8fd7-47e8-9c27-454161170db8	PINTOR INDUSTRIAL	\N	\N	\N	723315	t	2025-11-11 19:55:19.41052	2025-11-11 19:55:19.41052	10-672	10	t	2025-11-11 19:55:19.378
6171d994-aa4e-4151-be92-2d6f35f1cb4a	PLANEJADOR	\N	\N	\N	391125	t	2025-11-11 19:55:19.468783	2025-11-11 19:55:19.468783	10-585	10	t	2025-11-11 19:55:19.437
72734d3c-c435-4ed2-9d08-b9580bc92adb	PLANEJADOR DE ATENDIMENTO	\N	\N	\N	420135	t	2025-11-11 19:55:19.773775	2025-11-11 19:55:19.773775	10-481	10	t	2025-11-11 19:55:19.555
ee55098c-042c-49a5-bc9d-3b9748778310	PLANEJADOR DE LIMPEZA	\N	\N	\N	391125	t	2025-11-11 19:55:19.834761	2025-11-11 19:55:19.834761	10-717	10	t	2025-11-11 19:55:19.802
88588144-dc9a-40ed-9014-708ec88d76c7	PLANEJADOR DE MANUTENCAO	\N	\N	\N	391130	t	2025-11-11 19:55:19.895871	2025-11-11 19:55:19.895871	10-109	10	t	2025-11-11 19:55:19.863
b8fdd330-0d7a-44a6-b813-188ef7da6180	PLANEJADOR DE MATERIAIS JR	\N	\N	\N	252710	t	2025-11-11 19:55:19.956503	2025-11-11 19:55:19.956503	10-558	10	t	2025-11-11 19:55:19.924
82816b8f-88ec-42c4-9500-0273ec5e57cf	PLANEJADOR PL	\N	\N	\N	391125	t	2025-11-11 19:55:20.266008	2025-11-11 19:55:20.266008	10-650	10	t	2025-11-11 19:55:20.046
1e3e886b-7e16-4489-9bda-2b08a93abdf7	PLANEJADOR PROJ PL	\N	\N	\N	391120	t	2025-11-11 19:55:20.32628	2025-11-11 19:55:20.32628	6-6	6	t	2025-11-11 19:55:20.293
62d561c6-13ad-43fc-b33f-b2eafb7fc3be	POLIDOR	\N	\N	\N	519935	t	2025-11-11 19:55:20.386458	2025-11-11 19:55:20.386458	1-119	1	t	2025-11-11 19:55:20.353
07ddf123-ab64-4b50-aeb2-45a00eb11d7d	POLIDOR JUNIOR	\N	\N	\N	721325	t	2025-11-11 19:55:20.693904	2025-11-11 19:55:20.693904	10-157	10	t	2025-11-11 19:55:20.473
02d4efd0-1004-4b50-9a23-7958ecdd7666	POLIDOR PLENO	\N	\N	\N	721325	t	2025-11-11 19:55:20.754593	2025-11-11 19:55:20.754593	10-156	10	t	2025-11-11 19:55:20.722
a407f967-e6ca-4d00-aa35-d4b00016a359	POLIDOR SENIOR	\N	\N	\N	721325	t	2025-11-11 19:55:20.814936	2025-11-11 19:55:20.814936	10-158	10	t	2025-11-11 19:55:20.782
31032f5b-d48c-4556-9f12-4149dcb756d3	PORTEIRO	\N	\N	\N	517410	t	2025-11-11 19:55:20.875462	2025-11-11 19:55:20.875462	7-8	7	t	2025-11-11 19:55:20.843
a1b4a4fd-21a2-433c-8af3-c9da404f7256	PORTEIRO NOTURNO	\N	\N	\N	517410	t	2025-11-11 19:55:21.177624	2025-11-11 19:55:21.177624	10-591	10	t	2025-11-11 19:55:20.964
7dbf3b99-887a-4a29-83c8-97c6d7c002bb	PREPARADOR DE MAQUINAS II	\N	\N	\N	721225	t	2025-11-11 19:55:21.237206	2025-11-11 19:55:21.237206	10-385	10	t	2025-11-11 19:55:21.205
d251c532-6af2-4e83-813f-447d98f6525f	PREPARADOR DE MAQUINAS SENIOR	\N	\N	\N	721225	t	2025-11-11 19:55:21.297365	2025-11-11 19:55:21.297365	10-377	10	t	2025-11-11 19:55:21.264
44f3535a-9b0a-442e-860b-44b4ca5103f3	PREPARDOR DE MÁQIONAS E FERREMENTAS	\N	\N	\N	721225	t	2025-11-11 19:55:21.357856	2025-11-11 19:55:21.357856	10-0111	10	t	2025-11-11 19:55:21.326
8040e058-0fa0-495f-8441-470d08167237	PROGRAMADOR	\N	\N	\N	317110	t	2025-11-11 19:55:21.417408	2025-11-11 19:55:21.417408	10-409	10	t	2025-11-11 19:55:21.385
d09fbd2d-fd46-4607-a2cc-cdb4886fb598	PROGRAMADOR CNC I	\N	\N	\N	721215	t	2025-11-11 19:55:21.476886	2025-11-11 19:55:21.476886	6-11	6	t	2025-11-11 19:55:21.445
2cc0ff1a-2f8a-46fd-aa84-c43fd4de751f	PROGRAMADOR DE MANUTENCÃO JR	\N	\N	\N	391130	t	2025-11-11 19:55:21.536468	2025-11-11 19:55:21.536468	10-740	10	t	2025-11-11 19:55:21.504
c295d78a-dff4-49b5-b337-b7f052c451f9	PROJETISTA JUNIOR	\N	\N	\N	318610	t	2025-11-11 19:55:21.595621	2025-11-11 19:55:21.595621	10-696	10	t	2025-11-11 19:55:21.563
348cc5c8-f3e8-4cc9-8299-e3bc98c745dd	PROJETISTA MECANICO	\N	\N	\N	318610	t	2025-11-11 19:55:21.654938	2025-11-11 19:55:21.654938	10-230	10	t	2025-11-11 19:55:21.623
12312104-85fe-4cb2-8209-e6f38ba7745a	PROJETISTA MECANICO - JR	\N	\N	\N	318610	t	2025-11-11 19:55:21.713862	2025-11-11 19:55:21.713862	10-541	10	t	2025-11-11 19:55:21.682
9e86e7c1-b7b7-434f-84f4-ff7af80b82c5	PROJETISTA MECANICO - PL	\N	\N	\N	318610	t	2025-11-11 19:55:21.773414	2025-11-11 19:55:21.773414	10-542	10	t	2025-11-11 19:55:21.741
13e1ba3f-49f4-4ebc-bac8-f920efbe10e5	PROJETISTA MECANICO - SR	\N	\N	\N	318610	t	2025-11-11 19:55:21.832465	2025-11-11 19:55:21.832465	10-543	10	t	2025-11-11 19:55:21.8
40c103df-9f7c-4659-9478-8052d70d481e	PROJETISTA SENIOR	\N	\N	\N	318610	t	2025-11-11 19:55:21.892572	2025-11-11 19:55:21.892572	10-246	10	t	2025-11-11 19:55:21.86
4ed46956-0cbc-433e-ba8b-89dd12745c0d	PROJETISTA SÊNIOR	\N	\N	\N	318510	t	2025-11-11 19:55:21.951859	2025-11-11 19:55:21.951859	6-69	6	t	2025-11-11 19:55:21.92
38a2efe1-0ac4-45b6-9190-7c6a5157a0de	PROMOTOR	\N	\N	\N	521115	t	2025-11-11 19:55:22.011351	2025-11-11 19:55:22.011351	10-635	10	t	2025-11-11 19:55:21.979
e5928709-feda-4cb3-8ab2-90d08f157e87	PROMOTOR AMERICANA	\N	\N	\N	521115	t	2025-11-11 19:55:22.318188	2025-11-11 19:55:22.318188	10-902	10	t	2025-11-11 19:55:22.098
f8ca3950-d56a-42f9-b234-6f012926f91a	PROMOTOR ANDRADINA	\N	\N	\N	521115	t	2025-11-11 19:55:22.379764	2025-11-11 19:55:22.379764	10-884	10	t	2025-11-11 19:55:22.347
87302cdb-088b-4820-b438-c17bdaa000ce	PROMOTOR ARAQUARI	\N	\N	\N	521115	t	2025-11-11 19:55:22.442761	2025-11-11 19:55:22.442761	10-883	10	t	2025-11-11 19:55:22.408
7af2a7cd-ca14-4d8f-b0ec-fab2f3a49442	PROMOTOR ARARANGUA	\N	\N	\N	521115	t	2025-11-11 19:55:22.502858	2025-11-11 19:55:22.502858	10-881	10	t	2025-11-11 19:55:22.471
194f2162-d9cd-4202-b17c-7308e896691e	PROMOTOR ARARAS	\N	\N	\N	521115	t	2025-11-11 19:55:22.608736	2025-11-11 19:55:22.608736	10-864	10	t	2025-11-11 19:55:22.576
6c980fc4-b22e-4be2-a674-61878f9fafcd	PROMOTOR ASSIS	\N	\N	\N	521115	t	2025-11-11 19:55:22.669606	2025-11-11 19:55:22.669606	10-860	10	t	2025-11-11 19:55:22.637
5d5d3abf-4b57-49bf-9089-8e57b8db991b	PROMOTOR ATIBAIA	\N	\N	\N	521115	t	2025-11-11 19:55:22.97522	2025-11-11 19:55:22.97522	10-869	10	t	2025-11-11 19:55:22.758
7fb5518c-7d28-403e-8cc7-cf82e42632c2	PROMOTOR BALNEARIO CAMBORIU	\N	\N	\N	521115	t	2025-11-11 19:55:23.036832	2025-11-11 19:55:23.036832	10-837	10	t	2025-11-11 19:55:23.004
4f6b0b7a-5bc9-444d-9667-60b411dbac2a	PROMOTOR BARRA MANSA	\N	\N	\N	521115	t	2025-11-11 19:55:23.097447	2025-11-11 19:55:23.097447	10-833	10	t	2025-11-11 19:55:23.065
2a7245f1-33c6-45e5-90a3-569bb339e967	PROMOTOR BARRA VELHA	\N	\N	\N	521115	t	2025-11-11 19:55:23.157513	2025-11-11 19:55:23.157513	10-876	10	t	2025-11-11 19:55:23.125
643f9f15-d91d-42ec-acef-acf0a77ec2c8	PROMOTOR BARUERI	\N	\N	\N	521115	t	2025-11-11 19:55:23.218242	2025-11-11 19:55:23.218242	10-805	10	t	2025-11-11 19:55:23.185
1a46647f-21ef-48e7-8361-20118a739038	PROMOTOR BEBEDOURO	\N	\N	\N	521115	t	2025-11-11 19:55:23.279932	2025-11-11 19:55:23.279932	10-900	10	t	2025-11-11 19:55:23.246
bd41ff99-cf07-44ad-9e9b-43a9beddf4a4	PROMOTOR BELO HORIZONTE	\N	\N	\N	521115	t	2025-11-11 19:55:23.340086	2025-11-11 19:55:23.340086	10-830	10	t	2025-11-11 19:55:23.308
896b075b-f912-41cf-8900-9b9ccfd6a3d7	PROMOTOR BERTIOGA	\N	\N	\N	521115	t	2025-11-11 19:55:23.401266	2025-11-11 19:55:23.401266	10-836	10	t	2025-11-11 19:55:23.368
ae82ded5-1670-4803-a8ba-6e02d807e7c6	PROMOTOR BIRIGUI	\N	\N	\N	521115	t	2025-11-11 19:55:23.462552	2025-11-11 19:55:23.462552	10-894	10	t	2025-11-11 19:55:23.429
76b734eb-0dd8-4e78-9f6f-00eaeff103a6	PROMOTOR BOMBINHAS	\N	\N	\N	521115	t	2025-11-11 19:55:23.522813	2025-11-11 19:55:23.522813	10-793	10	t	2025-11-11 19:55:23.49
4bea55c0-7b9d-41df-86a1-829dca21270a	PROMOTOR BOTUCATU	\N	\N	\N	521115	t	2025-11-11 19:55:23.582973	2025-11-11 19:55:23.582973	10-862	10	t	2025-11-11 19:55:23.55
ead5eb71-b8e2-4963-a8b3-5ebe4648ec5c	PROMOTOR CAMPINAS	\N	\N	\N	521115	t	2025-11-11 19:55:23.643877	2025-11-11 19:55:23.643877	10-790	10	t	2025-11-11 19:55:23.611
f697b9ab-8e91-4612-959a-ec21ca34b5f3	PROMOTOR CAPAO DA CANOA	\N	\N	\N	521115	t	2025-11-11 19:55:23.704266	2025-11-11 19:55:23.704266	10-843	10	t	2025-11-11 19:55:23.671
55d63cb8-65bd-4662-881c-773aaeac39fc	PROMOTOR CARAGUATATUBA	\N	\N	\N	521115	t	2025-11-11 19:55:23.764511	2025-11-11 19:55:23.764511	10-799	10	t	2025-11-11 19:55:23.732
d51a95ce-4168-4550-a8c3-a40981ab4add	PROMOTOR CARAPICUIBA	\N	\N	\N	521115	t	2025-11-11 19:55:23.824888	2025-11-11 19:55:23.824888	10-838	10	t	2025-11-11 19:55:23.792
46e008c3-1d05-41e6-b51b-b11cb76f7b22	PROMOTOR CATANDUVA	\N	\N	\N	521115	t	2025-11-11 19:55:23.885033	2025-11-11 19:55:23.885033	10-891	10	t	2025-11-11 19:55:23.853
b0ac67ed-b2c7-4c56-8157-75bdb2acd024	PROMOTOR CAXIAS DO SUL	\N	\N	\N	521115	t	2025-11-11 19:55:23.945332	2025-11-11 19:55:23.945332	10-839	10	t	2025-11-11 19:55:23.913
3a5e9fe6-df85-4760-8aae-88962a599c75	PROMOTOR CENTRO	\N	\N	\N	521115	t	2025-11-11 19:55:24.005574	2025-11-11 19:55:24.005574	10-826	10	t	2025-11-11 19:55:23.973
9e56c847-ae52-4362-8557-7a550fa7d947	PROMOTOR CHUI	\N	\N	\N	521115	t	2025-11-11 19:55:24.065818	2025-11-11 19:55:24.065818	10-886	10	t	2025-11-11 19:55:24.033
e385508b-38cb-4522-83e0-dc8c10a7593b	PROMOTOR CIDREIRA	\N	\N	\N	521115	t	2025-11-11 19:55:24.126536	2025-11-11 19:55:24.126536	10-817	10	t	2025-11-11 19:55:24.094
031e2896-025a-412d-851b-059b2394deb3	PROMOTOR CONTAGEM	\N	\N	\N	521115	t	2025-11-11 19:55:24.186489	2025-11-11 19:55:24.186489	10-841	10	t	2025-11-11 19:55:24.154
02da8b50-1b25-4527-a4dd-7cc2dbf0b497	PROMOTOR DE MERCHANDISING	\N	\N	\N	521115	t	2025-11-11 19:55:24.247034	2025-11-11 19:55:24.247034	10-140	10	t	2025-11-11 19:55:24.214
b8008e2e-7f40-4107-84aa-ee62b7f620d1	PROMOTOR DE VENDAS	\N	\N	\N	521115	t	2025-11-11 19:55:24.30845	2025-11-11 19:55:24.30845	10-183	10	t	2025-11-11 19:55:24.276
585f8d04-ad04-4944-afa7-74bd1649dbef	PROMOTOR DIVINOPOLIS	\N	\N	\N	521115	t	2025-11-11 19:55:24.368469	2025-11-11 19:55:24.368469	10-896	10	t	2025-11-11 19:55:24.336
2dc57bfd-9e1e-4cff-8f5d-16cbd66e39d5	PROMOTOR DRACENA	\N	\N	\N	521115	t	2025-11-11 19:55:24.427486	2025-11-11 19:55:24.427486	10-813	10	t	2025-11-11 19:55:24.396
a2077648-bbd9-47cb-bc8d-ea613606d5d2	PROMOTOR DUARTINA	\N	\N	\N	521115	t	2025-11-11 19:55:24.488038	2025-11-11 19:55:24.488038	10-901	10	t	2025-11-11 19:55:24.455
109db137-92be-4c28-9fd3-d8d8a0db2589	PROMOTOR FARROUPILHA	\N	\N	\N	521115	t	2025-11-11 19:55:24.548458	2025-11-11 19:55:24.548458	10-849	10	t	2025-11-11 19:55:24.516
3e6aa04c-f0ec-40b8-8452-0dee5bdb4bc2	PROMOTOR FRANCISCO MORATO	\N	\N	\N	521115	t	2025-11-11 19:55:24.608734	2025-11-11 19:55:24.608734	10-868	10	t	2025-11-11 19:55:24.576
da130684-de77-4e61-93b1-c62916518977	PROMOTOR GOVERNADOR VALADARES	\N	\N	\N	521115	t	2025-11-11 19:55:24.669025	2025-11-11 19:55:24.669025	10-797	10	t	2025-11-11 19:55:24.636
5de6bece-5eb2-4438-87e7-8e8fcc3664ab	PROMOTOR IBIRITE	\N	\N	\N	521115	t	2025-11-11 19:55:24.72911	2025-11-11 19:55:24.72911	10-808	10	t	2025-11-11 19:55:24.697
b7b7b686-084c-4983-a342-29465be7e8fd	PROMOTOR IMBE	\N	\N	\N	521115	t	2025-11-11 19:55:24.790072	2025-11-11 19:55:24.790072	10-818	10	t	2025-11-11 19:55:24.757
3f63925d-f790-4825-a538-f0053d44809e	PROMOTOR IMBITUBA	\N	\N	\N	521115	t	2025-11-11 19:55:24.850347	2025-11-11 19:55:24.850347	10-887	10	t	2025-11-11 19:55:24.818
c0932273-a0ac-427f-85e3-ad223b81fe0e	PROMOTOR INDAIATUBA	\N	\N	\N	521115	t	2025-11-11 19:55:24.911192	2025-11-11 19:55:24.911192	10-871	10	t	2025-11-11 19:55:24.878
6998230c-96eb-4edd-b1fa-ce6bd2b93498	PROMOTOR IPATINGA	\N	\N	\N	521115	t	2025-11-11 19:55:24.971331	2025-11-11 19:55:24.971331	10-840	10	t	2025-11-11 19:55:24.939
475aed2b-e217-4ad7-ad9e-6d867b5bd4fc	PROMOTOR ITAJAI	\N	\N	\N	521115	t	2025-11-11 19:55:25.031464	2025-11-11 19:55:25.031464	10-874	10	t	2025-11-11 19:55:24.999
8bff9e2e-f8ef-4df5-bed0-12aa78e59dae	PROMOTOR ITANHAEM	\N	\N	\N	521115	t	2025-11-11 19:55:25.091697	2025-11-11 19:55:25.091697	10-802	10	t	2025-11-11 19:55:25.059
57fe103f-9305-46d4-aee8-d8994a61feeb	PROMOTOR ITAPEMA	\N	\N	\N	521115	t	2025-11-11 19:55:25.152299	2025-11-11 19:55:25.152299	10-875	10	t	2025-11-11 19:55:25.119
8488d93a-49b2-474a-96a1-8ffbce9a6728	PROMOTOR ITATIBA	\N	\N	\N	521115	t	2025-11-11 19:55:25.212591	2025-11-11 19:55:25.212591	10-892	10	t	2025-11-11 19:55:25.18
6778c151-bd89-4797-a75e-be2bbd0c6c9d	PROMOTOR JARAGUA DO SUL	\N	\N	\N	521115	t	2025-11-11 19:55:25.273496	2025-11-11 19:55:25.273496	10-859	10	t	2025-11-11 19:55:25.241
ea01ff2e-7ca8-4861-abab-70766773af2b	PROMOTOR JARDIM TAQUARAL	\N	\N	\N	521115	t	2025-11-11 19:55:25.334718	2025-11-11 19:55:25.334718	10-825	10	t	2025-11-11 19:55:25.301
9f4660f0-f3b6-496d-9096-9f5b56798b22	PROMOTOR JAU	\N	\N	\N	521115	t	2025-11-11 19:55:25.394814	2025-11-11 19:55:25.394814	10-863	10	t	2025-11-11 19:55:25.362
1c4207dd-c935-4a51-9ec2-d0306c44ee7a	PROMOTOR JD TAQUARAL	\N	\N	\N	521115	t	2025-11-11 19:55:25.455122	2025-11-11 19:55:25.455122	10-807	10	t	2025-11-11 19:55:25.422
894dc132-6313-47ef-be7a-a4ad3c5c2657	PROMOTOR JOINVILLE	\N	\N	\N	521115	t	2025-11-11 19:55:25.515441	2025-11-11 19:55:25.515441	10-858	10	t	2025-11-11 19:55:25.483
a52889a1-a976-47ac-bd07-9495d7ef246e	PROMOTOR JUNDIAI	\N	\N	\N	521115	t	2025-11-11 19:55:25.578706	2025-11-11 19:55:25.578706	10-791	10	t	2025-11-11 19:55:25.546
937ba37c-17a8-411f-a2ce-6496ed3a97ee	PROMOTOR LEME	\N	\N	\N	521115	t	2025-11-11 19:55:25.642594	2025-11-11 19:55:25.642594	10-867	10	t	2025-11-11 19:55:25.61
d46c5ec3-1c4b-46f0-93e6-d3b33346e1ed	PROMOTOR LIMEIRA	\N	\N	\N	521115	t	2025-11-11 19:55:25.703238	2025-11-11 19:55:25.703238	10-893	10	t	2025-11-11 19:55:25.67
59cb5d86-b488-4e07-87a2-34ff4b74de29	PROMOTOR LINS	\N	\N	\N	521115	t	2025-11-11 19:55:25.763961	2025-11-11 19:55:25.763961	10-861	10	t	2025-11-11 19:55:25.731
d87f1db0-286c-4b93-a67f-5b8810bbb1d0	PROMOTOR MARILIA	\N	\N	\N	521115	t	2025-11-11 19:55:25.824916	2025-11-11 19:55:25.824916	10-806	10	t	2025-11-11 19:55:25.792
fa47a8c3-93d8-4fac-9de1-5dea7ff42398	PROMOTOR MOGI BODEGA	\N	\N	\N	521115	t	2025-11-11 19:55:25.885429	2025-11-11 19:55:25.885429	10-798	10	t	2025-11-11 19:55:25.853
e379e9de-ecb8-4f80-999c-0c2a442f5cec	PROMOTOR MONTES CLAROS	\N	\N	\N	521115	t	2025-11-11 19:55:25.94548	2025-11-11 19:55:25.94548	10-812	10	t	2025-11-11 19:55:25.913
e5264f3c-b403-4dc8-abd0-fa89aa1f4235	PROMOTOR MOOCA	\N	\N	\N	521115	t	2025-11-11 19:55:26.005759	2025-11-11 19:55:26.005759	10-815	10	t	2025-11-11 19:55:25.973
a5535d9f-e34c-448e-a93b-1fa6dcd8ca60	PROMOTOR MORASSOL	\N	\N	\N	521115	t	2025-11-11 19:55:26.066237	2025-11-11 19:55:26.066237	10-788	10	t	2025-11-11 19:55:26.034
9c523e61-4cc0-445c-9e02-7541ea22aeb0	PROMOTOR NAVEGANTES	\N	\N	\N	521115	t	2025-11-11 19:55:26.126499	2025-11-11 19:55:26.126499	10-794	10	t	2025-11-11 19:55:26.094
04ff591d-cc8d-4592-9f01-4d8051a3258b	PROMOTOR OLIMPIA	\N	\N	\N	521115	t	2025-11-11 19:55:26.18657	2025-11-11 19:55:26.18657	10-789	10	t	2025-11-11 19:55:26.154
e7cb9030-0205-45ef-b865-2e21ea6a750b	PROMOTOR OUTO BRANCO	\N	\N	\N	521115	t	2025-11-11 19:55:26.24707	2025-11-11 19:55:26.24707	10-811	10	t	2025-11-11 19:55:26.214
5e5f8a04-b0e4-4c7a-8956-fc113efeded7	PROMOTOR PALHOCA	\N	\N	\N	521115	t	2025-11-11 19:55:26.306995	2025-11-11 19:55:26.306995	10-827	10	t	2025-11-11 19:55:26.274
0a11a406-360f-4e98-946f-a031a41cd73a	PROMOTOR PARATY	\N	\N	\N	521115	t	2025-11-11 19:55:26.367391	2025-11-11 19:55:26.367391	10-819	10	t	2025-11-11 19:55:26.335
28b14ee7-4710-411e-8e15-aaa6c605dc3b	PROMOTOR PAULINIA	\N	\N	\N	521115	t	2025-11-11 19:55:26.428196	2025-11-11 19:55:26.428196	10-792	10	t	2025-11-11 19:55:26.395
47baef30-328d-4128-96f1-828b51f9872f	PROMOTOR PEDREIRAS	\N	\N	\N	521115	t	2025-11-11 19:55:26.488487	2025-11-11 19:55:26.488487	10-870	10	t	2025-11-11 19:55:26.456
430372f8-ba78-4e34-b6cb-8cbba3066c19	PROMOTOR PEDRO LEOPOLDO	\N	\N	\N	521115	t	2025-11-11 19:55:26.54756	2025-11-11 19:55:26.54756	10-810	10	t	2025-11-11 19:55:26.516
355b1cdb-b1b2-4103-91f9-4c04491b2221	PROMOTOR PELOTAS	\N	\N	\N	521115	t	2025-11-11 19:55:26.60768	2025-11-11 19:55:26.60768	10-850	10	t	2025-11-11 19:55:26.575
f782026b-c748-4bbc-9fd1-5f3d459bf1e5	PROMOTOR PENAPOLIS	\N	\N	\N	521115	t	2025-11-11 19:55:26.668641	2025-11-11 19:55:26.668641	10-814	10	t	2025-11-11 19:55:26.636
d4edbae8-1f5d-4227-a405-765a8bd81ffd	PROMOTOR PENHA	\N	\N	\N	521115	t	2025-11-11 19:55:26.729303	2025-11-11 19:55:26.729303	10-873	10	t	2025-11-11 19:55:26.696
b7020691-2ac3-41d2-b799-ab20559494e9	PROMOTOR PIRACICABA	\N	\N	\N	521115	t	2025-11-11 19:55:26.78942	2025-11-11 19:55:26.78942	10-866	10	t	2025-11-11 19:55:26.757
7f52f5e1-daea-4c84-8172-befb5b0e53b3	PROMOTOR PORTO ALEGRE CANOAS	\N	\N	\N	521115	t	2025-11-11 19:55:26.849275	2025-11-11 19:55:26.849275	10-848	10	t	2025-11-11 19:55:26.817
a61d0c67-a4ca-48d0-b98e-4dad065ef81a	PROMOTOR PORTO BELO	\N	\N	\N	521115	t	2025-11-11 19:55:26.909394	2025-11-11 19:55:26.909394	10-895	10	t	2025-11-11 19:55:26.877
f5c5d44c-4b07-4ec7-8fe2-c7aa2cde0158	PROMOTOR PRAIA GRANDE	\N	\N	\N	521115	t	2025-11-11 19:55:26.97021	2025-11-11 19:55:26.97021	10-800	10	t	2025-11-11 19:55:26.937
1be325a3-e9bd-4ef1-af3b-b0a533257f7f	PROMOTOR PRETOPOLIS II	\N	\N	\N	521115	t	2025-11-11 19:55:27.030399	2025-11-11 19:55:27.030399	10-831	10	t	2025-11-11 19:55:26.998
23eb3bc2-bbd5-4845-aea5-1b3026cf6d8b	PROMOTOR REGENTE FEIJO	\N	\N	\N	521115	t	2025-11-11 19:55:27.091496	2025-11-11 19:55:27.091496	10-845	10	t	2025-11-11 19:55:27.058
36539d3c-ac4e-488f-b381-14aa7d91ec1f	PROMOTOR RESENDE	\N	\N	\N	521115	t	2025-11-11 19:55:27.151611	2025-11-11 19:55:27.151611	10-834	10	t	2025-11-11 19:55:27.119
cb566efc-89f8-47fb-a400-719b4b8143b8	PROMOTOR RIBEIRAO DAS NEVES	\N	\N	\N	521115	t	2025-11-11 19:55:27.211662	2025-11-11 19:55:27.211662	10-809	10	t	2025-11-11 19:55:27.179
3394edc9-72b4-4056-b474-1b614ce2232c	PROMOTOR RIO GRANDE	\N	\N	\N	521115	t	2025-11-11 19:55:27.272301	2025-11-11 19:55:27.272301	10-844	10	t	2025-11-11 19:55:27.239
5103e1fa-900f-43a7-b146-438b38305dc2	PROMOTOR SANTA LUZIA	\N	\N	\N	521115	t	2025-11-11 19:55:27.33289	2025-11-11 19:55:27.33289	10-820	10	t	2025-11-11 19:55:27.3
b60f0b61-e907-4429-b353-9428cd7ca8a4	PROMOTOR SANTA RITA DO SAPUCAI	\N	\N	\N	521115	t	2025-11-11 19:55:27.392887	2025-11-11 19:55:27.392887	10-855	10	t	2025-11-11 19:55:27.36
355bafd6-14ce-4b2a-b02d-bb5364d2c34d	PROMOTOR SAO FRANCISCO DO SUL	\N	\N	\N	521115	t	2025-11-11 19:55:27.453085	2025-11-11 19:55:27.453085	10-882	10	t	2025-11-11 19:55:27.421
0d3bfb2c-dedd-4ec4-b00f-37134a66dbb2	PROMOTOR SAO JOSE	\N	\N	\N	521115	t	2025-11-11 19:55:27.513879	2025-11-11 19:55:27.513879	10-796	10	t	2025-11-11 19:55:27.481
5bfe1adb-1afb-4830-9a73-ea4b5a36b7c1	PROMOTOR SAO LEOPOLDO	\N	\N	\N	521115	t	2025-11-11 19:55:27.574178	2025-11-11 19:55:27.574178	10-842	10	t	2025-11-11 19:55:27.542
5bcfae40-2b52-4b52-89a6-f793a85f3ce1	PROMOTOR SAO SEBASTIAO	\N	\N	\N	521115	t	2025-11-11 19:55:27.634277	2025-11-11 19:55:27.634277	10-829	10	t	2025-11-11 19:55:27.602
6a29c631-8d7a-48d3-b43e-9a0d145597da	PROMOTOR SAO VICENTE	\N	\N	\N	521115	t	2025-11-11 19:55:27.943315	2025-11-11 19:55:27.943315	10-801	10	t	2025-11-11 19:55:27.723
6a61bf4b-db94-40f0-bbf7-f4c2fa760828	PROMOTOR TATUAPE	\N	\N	\N	521115	t	2025-11-11 19:55:28.00408	2025-11-11 19:55:28.00408	10-816	10	t	2025-11-11 19:55:27.971
23984dd1-b952-47dc-b9ad-129fa9b80027	PROMOTOR TAUBATE	\N	\N	\N	521115	t	2025-11-11 19:55:28.064347	2025-11-11 19:55:28.064347	10-795	10	t	2025-11-11 19:55:28.032
bab64323-fa1f-4b12-91f8-17a5ad736b3f	PROMOTOR TIJUCAS	\N	\N	\N	521115	t	2025-11-11 19:55:28.363939	2025-11-11 19:55:28.363939	10-885	10	t	2025-11-11 19:55:28.152
255d3406-0451-4f7a-a6ff-213dc7697f7e	PROMOTOR TORRES	\N	\N	\N	521115	t	2025-11-11 19:55:28.422898	2025-11-11 19:55:28.422898	10-857	10	t	2025-11-11 19:55:28.391
ba9a8b69-d89b-4aac-9e75-0757eda8f85e	PROMOTOR TRAMANDAI	\N	\N	\N	521115	t	2025-11-11 19:55:28.48138	2025-11-11 19:55:28.48138	10-823	10	t	2025-11-11 19:55:28.449
1fa47595-4820-470d-9e2f-eea6f53dd888	PROMOTOR TUBARAO	\N	\N	\N	521115	t	2025-11-11 19:55:28.540224	2025-11-11 19:55:28.540224	10-888	10	t	2025-11-11 19:55:28.508
a2d12750-207b-495e-998e-89a019ee8fea	PROMOTOR VALINHOS	\N	\N	\N	521115	t	2025-11-11 19:55:28.598513	2025-11-11 19:55:28.598513	10-865	10	t	2025-11-11 19:55:28.566
ca1dfd51-b983-40e0-8c11-758532fe30fe	PROMOTOR VOTUPORANGA	\N	\N	\N	521115	t	2025-11-11 19:55:28.656919	2025-11-11 19:55:28.656919	10-821	10	t	2025-11-11 19:55:28.625
f8e7175c-1498-4e52-aad2-9ca654d1d83c	PROMOTOR XANGRILA	\N	\N	\N	521115	t	2025-11-11 19:55:28.715241	2025-11-11 19:55:28.715241	10-835	10	t	2025-11-11 19:55:28.683
110a03e2-36aa-465a-af5d-fc734f273126	PROMOTOR ZONA LESTE	\N	\N	\N	521115	t	2025-11-11 19:55:28.774288	2025-11-11 19:55:28.774288	10-824	10	t	2025-11-11 19:55:28.741
5872785a-37c8-480d-9163-cf6b0352b634	PROMOTOR ZONA LESTE TIQUATIRA	\N	\N	\N	521115	t	2025-11-11 19:55:28.833251	2025-11-11 19:55:28.833251	10-822	10	t	2025-11-11 19:55:28.801
e9b71362-5f6c-4eb1-84b9-9ddc6a000f45	PROMOTOR ZONA NORTE	\N	\N	\N	521115	t	2025-11-11 19:55:28.892131	2025-11-11 19:55:28.892131	10-832	10	t	2025-11-11 19:55:28.86
afc17605-4810-4064-8807-df6602cb03c4	RECEPCIONISTA	\N	\N	\N	422105	t	2025-11-11 19:55:28.950575	2025-11-11 19:55:28.950575	10-312	10	t	2025-11-11 19:55:28.918
c3d8787e-66c3-4b4d-a02f-dfdae04f89c3	Recepcionista	\N	\N	\N	422105	t	2025-11-11 19:55:29.00909	2025-11-11 19:55:29.00909	6-91	6	t	2025-11-11 19:55:28.977
392f7832-0911-4c2c-8fbf-ceaf5f09df32	RECIDENTE TECNICO	\N	\N	\N	391205	t	2025-11-11 19:55:29.069098	2025-11-11 19:55:29.069098	7-18	7	t	2025-11-11 19:55:29.036
b912871c-bd0d-4d4f-b3f0-5aa16379ad5c	REPRESENTANTE DE ENVIOS I	\N	\N	\N	414140	t	2025-11-11 19:55:29.363492	2025-11-11 19:55:29.363492	10-647	10	t	2025-11-11 19:55:29.154
876d9e31-3b92-4e87-8ca7-b4e08559b2e2	REPRESENTANTE TELEMARKETING II	\N	\N	\N	422310	t	2025-11-11 19:55:29.430189	2025-11-11 19:55:29.430189	10-537	10	t	2025-11-11 19:55:29.39
d1f55ea0-874f-4927-bb52-7f57421e8fbc	RESIDENTE	\N	\N	\N	391205	t	2025-11-11 19:55:29.488299	2025-11-11 19:55:29.488299	10-666	10	t	2025-11-11 19:55:29.456
8d3eb2ad-46b4-41fa-bc70-221fe735d715	RESIDENTE TECNICO	\N	\N	\N	391205	t	2025-11-11 19:55:29.546115	2025-11-11 19:55:29.546115	10-0094	10	t	2025-11-11 19:55:29.514
8a474ae7-41bb-4d22-84c6-7d28fd4f9755	SABOEIRO SENIOR	\N	\N	\N	784205	t	2025-11-11 19:55:29.841313	2025-11-11 19:55:29.841313	6-37	6	t	2025-11-11 19:55:29.631
8dd1b30b-b63b-4f37-9aa7-31b4c2c4b709	SECRETARIO(A) EXECUTIVO(A)	\N	\N	\N	252305	t	2025-11-11 19:55:29.900041	2025-11-11 19:55:29.900041	10-373	10	t	2025-11-11 19:55:29.868
efef9e78-6d83-43d2-a826-dfe5351abb13	SEPARADOR	\N	\N	\N	414110	t	2025-11-11 19:55:29.959983	2025-11-11 19:55:29.959983	10-519	10	t	2025-11-11 19:55:29.928
bd3efa73-ceb5-4ba0-b49c-2efd2b42a0ac	SERIGRAFO	\N	\N	\N	766205	t	2025-11-11 19:55:30.017713	2025-11-11 19:55:30.017713	6-89	6	t	2025-11-11 19:55:29.986
effd397d-c09e-4a11-ad8b-0bd622fd8695	SERRALHEIRO	\N	\N	\N	724440	t	2025-11-11 19:55:30.07578	2025-11-11 19:55:30.07578	10-182	10	t	2025-11-11 19:55:30.044
ea55bbbc-c429-4b93-887d-5f157ad9e51d	SERRALHEIRO I	\N	\N	\N	724440	t	2025-11-11 19:55:30.620992	2025-11-11 19:55:30.620992	10-663	10	t	2025-11-11 19:55:30.4
49601975-25fa-481d-b5d6-fe375a811b17	SERRALHEIRO II	\N	\N	\N	724440	t	2025-11-11 19:55:30.682155	2025-11-11 19:55:30.682155	10-685	10	t	2025-11-11 19:55:30.649
354d385d-b3a8-4290-bed1-cb27936ea3c6	SERRALHEIRO JR III	\N	\N	\N	724440	t	2025-11-11 19:55:30.742774	2025-11-11 19:55:30.742774	10-686	10	t	2025-11-11 19:55:30.71
7386ef43-b4d5-45d2-9e7e-47b1cf610039	SERVENTE	\N	\N	\N	717020	t	2025-11-11 19:55:30.80386	2025-11-11 19:55:30.80386	10-707	10	t	2025-11-11 19:55:30.771
0de045c9-1f74-4c97-94c8-ae15c60f3624	SERVENTE DE LIMPEZA	\N	\N	\N	514320	t	2025-11-11 19:55:30.864648	2025-11-11 19:55:30.864648	1-156	1	t	2025-11-11 19:55:30.832
df47e95d-06cd-4d00-acfb-b6e0a3dd0f68	SERVENTE DE PEDREIRO	\N	\N	\N	717020	t	2025-11-11 19:55:31.415966	2025-11-11 19:55:31.415966	10-0096	10	t	2025-11-11 19:55:31.203
78d81a06-1408-49ad-8d5c-8eb5f3ee11cb	SOCIO ADMINISTRADOR	\N	\N	\N	123105	t	2025-11-11 19:55:31.745493	2025-11-11 19:55:31.745493	10-0112	10	t	2025-11-11 19:55:31.505
8d70e35b-be1d-4c4c-bd7d-7639bba3e942	SOLDADOR	\N	\N	\N	724315	t	2025-11-11 19:55:31.814846	2025-11-11 19:55:31.814846	7-15	7	t	2025-11-11 19:55:31.773
c7e97e4e-3fed-4cd9-83e2-1f16ca288b1a	SOLDADOR - NELSON GLOBAL	\N	\N	\N	724315	t	2025-11-11 19:55:32.374185	2025-11-11 19:55:32.374185	6-59	6	t	2025-11-11 19:55:32.162
0009ab88-bb03-4ac2-bb6f-c4389cd7c22b	SOLDADOR I	\N	\N	\N	724315	t	2025-11-11 19:55:32.433177	2025-11-11 19:55:32.433177	10-0097	10	t	2025-11-11 19:55:32.401
3abd69c3-303e-46d8-94b8-3c54d56ca1f2	SOLDADOR I-A	\N	\N	\N	724315	t	2025-11-11 19:55:32.491354	2025-11-11 19:55:32.491354	10-674	10	t	2025-11-11 19:55:32.459
b5674bde-781c-456e-b123-1c079b4cf141	SOLDADOR II	\N	\N	\N	724315	t	2025-11-11 19:55:32.549436	2025-11-11 19:55:32.549436	10-506	10	t	2025-11-11 19:55:32.517
c763cf26-951f-4368-8c97-6bf0db53c197	SUPER DE MONTAGEM MECANICA	\N	\N	\N	910105	t	2025-11-11 19:55:32.607589	2025-11-11 19:55:32.607589	10-434	10	t	2025-11-11 19:55:32.576
aec2c209-1131-44e3-b46a-2aaf132883e7	SUPERVISOR 	\N	\N	\N	141205	t	2025-11-11 19:55:32.665923	2025-11-11 19:55:32.665923	10-286	10	t	2025-11-11 19:55:32.634
b2551772-9c28-4f8b-989e-57341f35c90e	SUPERVISOR	\N	\N	\N	410105	t	2025-11-11 19:55:32.724304	2025-11-11 19:55:32.724304	10-564	10	t	2025-11-11 19:55:32.692
437a25f2-2313-4fc0-91d1-72cd4ea14fcb	SUPERVISOR COMERCIAL	\N	\N	\N	520110	t	2025-11-11 19:55:32.78317	2025-11-11 19:55:32.78317	10-0113	10	t	2025-11-11 19:55:32.751
09974a0c-8b3e-4da5-a3f9-b2d1064ac7be	SUPERVISOR DE ALMOXARIFADO	\N	\N	\N	414105	t	2025-11-11 19:55:32.842926	2025-11-11 19:55:32.842926	10-669	10	t	2025-11-11 19:55:32.81
51a428b1-7c5c-419e-ab8d-6cfadbc80101	SUPERVISOR DE CONTRATO	\N	\N	\N	142305	t	2025-11-11 19:55:32.90087	2025-11-11 19:55:32.90087	10-258	10	t	2025-11-11 19:55:32.869
67563f4d-27ae-49f8-a1ed-cdbdc9326a78	SUPERVISOR DE ELETRICA	\N	\N	\N	950105	t	2025-11-11 19:55:32.959247	2025-11-11 19:55:32.959247	10-176	10	t	2025-11-11 19:55:32.927
083f0066-6b45-4ad5-b7e3-6f4016306ebc	SUPERVISOR DE LIMPEZA	\N	\N	\N	514225	t	2025-11-11 19:55:33.017671	2025-11-11 19:55:33.017671	10-108	10	t	2025-11-11 19:55:32.985
65e4c05e-119a-42a8-8b27-158c518a3ad0	SUPERVISOR DE LIMPEZA TECNICA	\N	\N	\N	514225	t	2025-11-11 19:55:33.316582	2025-11-11 19:55:33.316582	10-708	10	t	2025-11-11 19:55:33.103
8f0b9716-80c7-4850-a26f-eb43acb93757	SUPERVISOR DE MANUTENÇÃO	\N	\N	\N	910910	t	2025-11-11 19:55:33.375825	2025-11-11 19:55:33.375825	10-293	10	t	2025-11-11 19:55:33.344
b18c6821-e7f4-4dfd-bda1-576d7134ebd2	SUPERVISOR DE MANUTENCAO ELETRICA	\N	\N	\N	950105	t	2025-11-11 19:55:33.43305	2025-11-11 19:55:33.43305	10-107	10	t	2025-11-11 19:55:33.402
0a9c4e21-b66c-46c1-bd31-7df423976299	SUPERVISOR DE MANUTENÇÃO PREDIAL	\N	\N	\N	950105	t	2025-11-11 19:55:33.491445	2025-11-11 19:55:33.491445	10-781	10	t	2025-11-11 19:55:33.459
96c2b8fe-dafb-4d7e-9340-6fae510667ca	SUPERVISOR DE MONTAGEM MECANICA PL	\N	\N	\N	910105	t	2025-11-11 19:55:33.549638	2025-11-11 19:55:33.549638	10-738	10	t	2025-11-11 19:55:33.517
c3459729-39da-4bd0-b764-8ea965b9cbb2	SUPERVISOR DE OPERACOES	\N	\N	\N	141205	t	2025-11-11 19:55:33.607701	2025-11-11 19:55:33.607701	10-0102	10	t	2025-11-11 19:55:33.576
5990e133-a286-475f-949f-61e0516ddd2c	SUPERVISOR DE PLANEJAMENTO 	\N	\N	\N	391130	t	2025-11-11 19:55:34.630853	2025-11-11 19:55:34.630853	10-480	10	t	2025-11-11 19:55:34.414
f3ab1f61-bee9-4c3c-8a1c-58a73bb82fc9	SUPERVISOR DE PRODUCAO	\N	\N	\N	141205	t	2025-11-11 19:55:34.691228	2025-11-11 19:55:34.691228	10-352	10	t	2025-11-11 19:55:34.659
342155ec-889f-4756-8af4-13144b1325de	SUPERVISOR DE QUALIDADE	\N	\N	\N	410105	t	2025-11-11 19:55:35.054035	2025-11-11 19:55:35.054035	10-515	10	t	2025-11-11 19:55:34.78
adfd419f-b247-4775-a4a3-dd6564356633	SUPERVISOR ELETRICO	\N	\N	\N	214305	t	2025-11-11 19:55:35.114002	2025-11-11 19:55:35.114002	10-658	10	t	2025-11-11 19:55:35.082
43a462c9-a866-4a98-8914-3a83deb7dd1f	SUPERVISOR ELETRICO PL	\N	\N	\N	214305	t	2025-11-11 19:55:35.174295	2025-11-11 19:55:35.174295	10-908	10	t	2025-11-11 19:55:35.142
d1ba5ddb-9f6b-4c10-ac65-12e0d4ab14e4	SUPERVISOR FISCAL	\N	\N	\N	251205	t	2025-11-11 19:55:35.233475	2025-11-11 19:55:35.233475	10-709	10	t	2025-11-11 19:55:35.201
7f3594a2-89bb-4a39-9fda-a55347b00a9a	SUPERVISOR I	\N	\N	\N	141205	t	2025-11-11 19:55:35.291924	2025-11-11 19:55:35.291924	10-507	10	t	2025-11-11 19:55:35.261
a50a15dc-b043-4577-93cb-c18d725a3d44	SUPERVISOR II	\N	\N	\N	141205	t	2025-11-11 19:55:35.351266	2025-11-11 19:55:35.351266	10-508	10	t	2025-11-11 19:55:35.319
13a81cfa-d003-41ab-a265-dfc3278502f0	SUPERVISOR III	\N	\N	\N	141205	t	2025-11-11 19:55:35.410472	2025-11-11 19:55:35.410472	10-513	10	t	2025-11-11 19:55:35.379
9889abfe-5434-486d-9745-5d7afd4c0c53	SUPERVISOR MANUTENCAO MECANICA	\N	\N	\N	910105	t	2025-11-11 19:55:35.469418	2025-11-11 19:55:35.469418	10-113	10	t	2025-11-11 19:55:35.438
1f6c48ba-3829-4359-9615-b3c78202f53c	SUPERVISOR MANUTENCAO VOLANTE	\N	\N	\N	910210	t	2025-11-11 19:55:35.528507	2025-11-11 19:55:35.528507	10-302	10	t	2025-11-11 19:55:35.497
ac8db1b2-cd66-464e-b851-c29fc5510b22	SUPERVISOR TECNICO	\N	\N	\N	910110	t	2025-11-11 19:55:35.58746	2025-11-11 19:55:35.58746	10-581	10	t	2025-11-11 19:55:35.556
81b05ab2-6cd6-4aff-952b-0b4dc8f311e4	SUPERVISOR(A) DE R&S	\N	\N	\N	252405	t	2025-11-11 19:55:35.646232	2025-11-11 19:55:35.646232	10-479	10	t	2025-11-11 19:55:35.614
ed1ed0b7-ab89-427b-a43c-b399b4356c2d	TEC DA QUALIDADE I	\N	\N	\N	391210	t	2025-11-11 19:55:35.705118	2025-11-11 19:55:35.705118	10-0098	10	t	2025-11-11 19:55:35.673
cf373b21-dd48-427c-b111-0c331a10dbea	TEC DA QUALIDADE II	\N	\N	\N	391210	t	2025-11-11 19:55:36.010646	2025-11-11 19:55:36.010646	1-68	1	t	2025-11-11 19:55:35.791
043d604a-bfd6-4e9f-bd40-e3b8b1a9e6d3	TEC DE QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:55:36.315167	2025-11-11 19:55:36.315167	10-185	10	t	2025-11-11 19:55:36.099
264d0e7a-420f-4eb4-a293-29043901d530	TEC DE SEG DO TRABALHO SENIOR	\N	\N	\N	351605	t	2025-11-11 19:55:36.375107	2025-11-11 19:55:36.375107	10-296	10	t	2025-11-11 19:55:36.343
8a0bc1a1-1ce8-4419-a09c-f47ecb70a171	TEC MANUT IND ELETROMECANICA	\N	\N	\N	300305	t	2025-11-11 19:55:36.435239	2025-11-11 19:55:36.435239	10-144	10	t	2025-11-11 19:55:36.403
fdda4338-52c4-4ffe-bc82-653189f3dd49	TEC MANUTENCAO INDUSTRIAL	\N	\N	\N	300305	t	2025-11-11 19:55:36.494449	2025-11-11 19:55:36.494449	10-141	10	t	2025-11-11 19:55:36.462
3a3bbf46-73d8-49aa-adc8-2f71590cfa7e	TEC QUALIDADE PLENO	\N	\N	\N	391210	t	2025-11-11 19:55:36.553257	2025-11-11 19:55:36.553257	10-598	10	t	2025-11-11 19:55:36.521
7ef0a561-8c20-49fe-b806-392527739b3f	TEC SEG DO TRABALHO - QHSE-BYD	\N	\N	\N	351605	t	2025-11-11 19:55:36.612361	2025-11-11 19:55:36.612361	10-569	10	t	2025-11-11 19:55:36.58
fc0f8adf-2f58-4962-a032-3c0cfd349eb4	TEC SEG DO TRABALHO PLENO	\N	\N	\N	351605	t	2025-11-11 19:55:36.671442	2025-11-11 19:55:36.671442	10-263	10	t	2025-11-11 19:55:36.639
17d87b44-42d7-486f-ae4d-5f18092c7766	TEC. DE LABORATORIO JR	\N	\N	\N	301105	t	2025-11-11 19:55:36.730375	2025-11-11 19:55:36.730375	10-356	10	t	2025-11-11 19:55:36.698
b5eb5896-21f4-44f7-b9c0-3b6531cad68c	TEC. QUALIDADE	\N	\N	\N	391210	t	2025-11-11 19:55:36.789325	2025-11-11 19:55:36.789325	1-154	1	t	2025-11-11 19:55:36.757
af7f6f27-f8e7-4704-bed0-7a574081a664	TECNICO DA QUALIDADE	\N	\N	\N	391205	t	2025-11-11 19:55:36.847984	2025-11-11 19:55:36.847984	3-22	3	t	2025-11-11 19:55:36.816
5d92e100-007a-429c-93f6-edfebfb6e97c	TECNICO DA QUALIDADE JR 	\N	\N	\N	391210	t	2025-11-11 19:55:36.907154	2025-11-11 19:55:36.907154	10-595	10	t	2025-11-11 19:55:36.875
2adc1194-02da-423d-b4b3-5a4920e4dbe4	TECNICO DA QUALIDADE OBRAS	\N	\N	\N	391210	t	2025-11-11 19:55:36.966234	2025-11-11 19:55:36.966234	1-43	1	t	2025-11-11 19:55:36.934
be63659b-80c1-4a3e-8c48-984054c431c4	TECNICO DE ALMOXARIFADO 	\N	\N	\N	414105	t	2025-11-11 19:55:37.025752	2025-11-11 19:55:37.025752	10-461	10	t	2025-11-11 19:55:36.994
4c7e2419-e220-4940-893f-3f2d267c71b5	Técnico de Almoxarifado - LOGISTICA	\N	\N	\N	414105	t	2025-11-11 19:55:37.085019	2025-11-11 19:55:37.085019	10-396	10	t	2025-11-11 19:55:37.053
9ad89c0c-fc97-45be-b2bb-0a229b2bc02d	TECNICO DE CNC JR	\N	\N	\N	911305	t	2025-11-11 19:55:37.144574	2025-11-11 19:55:37.144574	10-714	10	t	2025-11-11 19:55:37.112
aa42017c-999a-42ce-b0cb-73bb9f83839b	TÉCNICO DE ENFERMAGEM	\N	\N	\N	322205	t	2025-11-11 19:55:37.20366	2025-11-11 19:55:37.20366	6-20	6	t	2025-11-11 19:55:37.172
52e7670c-5244-4c62-bf02-129364224c68	TECNICO DE MANUTENCAO II	\N	\N	\N	314410	t	2025-11-11 19:55:37.262874	2025-11-11 19:55:37.262874	10-692	10	t	2025-11-11 19:55:37.231
e0ecc6d3-c67c-4f42-b01e-fe098767846c	TECNICO DE PROTOTIPOS	\N	\N	\N	318505	t	2025-11-11 19:55:37.322171	2025-11-11 19:55:37.322171	10-621	10	t	2025-11-11 19:55:37.29
7f0cdecc-2002-43e6-bc11-bc2fb53e9748	TECNICO DE REFRIGERACAO	\N	\N	\N	725705	t	2025-11-11 19:55:37.381883	2025-11-11 19:55:37.381883	10-279	10	t	2025-11-11 19:55:37.35
2f6b2819-2928-46ee-894c-935c27fde6b3	TECNICO DE REFRIGERAÇÃO I	\N	\N	\N	725705	t	2025-11-11 19:55:37.43993	2025-11-11 19:55:37.43993	10-390	10	t	2025-11-11 19:55:37.409
13d8e1ed-07f0-4026-8ab3-6a54384712a5	TECNICO ELETROMECANICO	\N	\N	\N	954105	t	2025-11-11 19:55:37.499416	2025-11-11 19:55:37.499416	10-307	10	t	2025-11-11 19:55:37.467
256ace87-79f9-4409-ad28-6a217e8c896a	TECNICO EM AMBIENTE	\N	\N	\N	214010	t	2025-11-11 19:55:37.558783	2025-11-11 19:55:37.558783	3-20	3	t	2025-11-11 19:55:37.527
7e415fbd-26bd-430b-8dae-eee12259fbcf	TECNICO EM ELETRICA	\N	\N	\N	313130	t	2025-11-11 19:55:37.61811	2025-11-11 19:55:37.61811	10-177	10	t	2025-11-11 19:55:37.586
6f0a8cb2-deb9-4235-b805-21ccf548b276	TECNICO EM ELETRONICA	\N	\N	\N	313215	t	2025-11-11 19:55:37.677237	2025-11-11 19:55:37.677237	10-321	10	t	2025-11-11 19:55:37.645
5fe3f78a-0524-4c48-8730-f2d3ef26cb6d	TECNICO EM HIDRAULICA	\N	\N	\N	724110	t	2025-11-11 19:55:37.73605	2025-11-11 19:55:37.73605	10-465	10	t	2025-11-11 19:55:37.704
834642f0-ca41-466b-971c-a46615c851e5	TECNICO EM MANUTENÇÃO	\N	\N	\N	314410	t	2025-11-11 19:55:37.795236	2025-11-11 19:55:37.795236	10-489	10	t	2025-11-11 19:55:37.763
d5a65288-5bdb-4f0a-a3f7-cf2eb77b4ae8	TECNICO EM MECANICA	\N	\N	\N	314110	t	2025-11-11 19:55:37.854274	2025-11-11 19:55:37.854274	10-179	10	t	2025-11-11 19:55:37.822
2d74bba0-35fb-4261-a8ae-5d8f1f826830	TECNICO EM MEIO AMBIENTE	\N	\N	\N	214010	t	2025-11-11 19:55:37.913784	2025-11-11 19:55:37.913784	1-20	1	t	2025-11-11 19:55:37.882
e4a6f523-a62a-466a-a417-c161bf1d4c69	TECNICO EM SEGURANCA DO TRABALHO	\N	\N	\N	351605	t	2025-11-11 19:55:37.973578	2025-11-11 19:55:37.973578	10-310	10	t	2025-11-11 19:55:37.941
c640f0f4-11e7-4051-9eb0-edc10f4ac6e3	TÉCNICO EM SEGURANÇA DO TRABALHO	\N	\N	\N	351605	t	2025-11-11 19:55:38.032934	2025-11-11 19:55:38.032934	6-63	6	t	2025-11-11 19:55:38.001
3c4210c2-d03b-4613-b3c6-575b372ffdfe	TECNICO EXTERNO	\N	\N	\N	214930	t	2025-11-11 19:55:38.096847	2025-11-11 19:55:38.096847	10-0114	10	t	2025-11-11 19:55:38.06
cf4f14a6-083a-4997-987e-fc3dc6f0ec6a	TECNICO GARANTIA QUALIDADE JR	\N	\N	\N	391210	t	2025-11-11 19:55:38.156024	2025-11-11 19:55:38.156024	10-477	10	t	2025-11-11 19:55:38.124
a44a8944-4718-49a3-a797-78d68d4aed5d	TECNICO INTERNO	\N	\N	\N	214930	t	2025-11-11 19:55:38.215186	2025-11-11 19:55:38.215186	10-0115	10	t	2025-11-11 19:55:38.183
385ffcfa-1d28-4d12-bb39-9a2706bb1eae	TECNICO LAB. QUIMICO	\N	\N	\N	311105	t	2025-11-11 19:55:38.274528	2025-11-11 19:55:38.274528	10-433	10	t	2025-11-11 19:55:38.242
85599afd-3b68-4967-956a-682faa243724	TECNICO MANUFATURA	\N	\N	\N	784205	t	2025-11-11 19:55:38.333919	2025-11-11 19:55:38.333919	10-683	10	t	2025-11-11 19:55:38.302
2613358e-b235-40ab-bd08-49ac73bb2b3e	TECNICO MANUTENCAO ELETRICA PL	\N	\N	\N	715615	t	2025-11-11 19:55:38.393458	2025-11-11 19:55:38.393458	10-624	10	t	2025-11-11 19:55:38.361
62a30d70-3ae6-43a2-bc95-e19f1b10d342	TECNICO MANUTENCAO ELETRICA SR	\N	\N	\N	715615	t	2025-11-11 19:55:38.452041	2025-11-11 19:55:38.452041	10-631	10	t	2025-11-11 19:55:38.421
5b1b4f74-47c7-4810-81e1-586e329477c4	TÉCNICO MANUTENÇÃO INDUSTRIAL - LECLAIR	\N	\N	\N	313120	t	2025-11-11 19:55:38.51106	2025-11-11 19:55:38.51106	6-60	6	t	2025-11-11 19:55:38.479
e9b655fe-0716-4676-a109-6c008c987252	TECNICO MANUTENCAO MECANICA PL	\N	\N	\N	314410	t	2025-11-11 19:55:38.570183	2025-11-11 19:55:38.570183	10-667	10	t	2025-11-11 19:55:38.538
6e94db4c-340a-44d6-8879-807fbcbbfdf2	TECNICO MANUTENCAO PREDIAL I 	\N	\N	\N	514325	t	2025-11-11 19:55:38.629311	2025-11-11 19:55:38.629311	10-711	10	t	2025-11-11 19:55:38.597
0513c49a-5bdd-405c-94b1-92b44b5c79f8	TECNICO PROCESSOS CRITICOS	\N	\N	\N	911305	t	2025-11-11 19:55:38.688143	2025-11-11 19:55:38.688143	10-608	10	t	2025-11-11 19:55:38.656
bd7126ec-cccc-4373-aeaa-376e791aa532	TECNICO QUIMICO	\N	\N	\N	311105	t	2025-11-11 19:55:38.747162	2025-11-11 19:55:38.747162	10-196	10	t	2025-11-11 19:55:38.715
58bb7a14-9053-476f-9ca6-1223dfa3dc23	TECNICO SEGURANCA DO TRABALHO	\N	\N	\N	351605	t	2025-11-11 19:55:38.810504	2025-11-11 19:55:38.810504	10-0100	10	t	2025-11-11 19:55:38.774
34eab0a2-c3da-44e2-bbe3-6735763b166b	TECNICO SEGURANÇA I	\N	\N	\N	351605	t	2025-11-11 19:55:39.361383	2025-11-11 19:55:39.361383	10-509	10	t	2025-11-11 19:55:39.139
3ec352b2-490d-4dcf-a41f-470873b1cbef	TELHADISTA	\N	\N	\N	716215	t	2025-11-11 19:55:39.422296	2025-11-11 19:55:39.422296	10-464	10	t	2025-11-11 19:55:39.39
bcf6de22-7640-4194-b95a-8c270a2ae10d	TELHADISTA II	\N	\N	\N	716215	t	2025-11-11 19:55:39.482538	2025-11-11 19:55:39.482538	10-661	10	t	2025-11-11 19:55:39.45
2dab7661-02cf-461b-8a52-c2aca534f8c4	TORNEIRO MECANICO	\N	\N	\N	721215	t	2025-11-11 19:55:39.543141	2025-11-11 19:55:39.543141	10-463	10	t	2025-11-11 19:55:39.51
ec4e8e4a-31bf-4955-a176-e58bbd448cba	VENDEDOR	\N	\N	\N	521110	t	2025-11-11 19:55:39.603727	2025-11-11 19:55:39.603727	10-846	10	t	2025-11-11 19:55:39.571
adb63de6-f2e4-4247-8087-4525e01f0aef	VENDEDOR INTERNO	\N	\N	\N	521110	t	2025-11-11 19:55:39.904779	2025-11-11 19:55:39.904779	6-30	6	t	2025-11-11 19:55:39.692
63627a3e-1c24-4bac-9798-6374c62d8ae1	VENDEDOR JR I	\N	\N	\N	521110	t	2025-11-11 19:55:40.210146	2025-11-11 19:55:40.210146	10-694	10	t	2025-11-11 19:55:39.991
2ea88351-9ee2-49d0-89e0-f45735a17315	VENDEDOR JR I - CABREUVA	\N	\N	\N	521110	t	2025-11-11 19:55:40.271065	2025-11-11 19:55:40.271065	10-720	10	t	2025-11-11 19:55:40.238
0f69508f-89bb-4b41-8f98-7880a86f732a	VIGIA	\N	\N	\N	517420	t	2025-11-11 19:55:40.331731	2025-11-11 19:55:40.331731	10-0101	10	t	2025-11-11 19:55:40.299
367d45df-18c5-42dc-9858-4fb3b98b0bd3	ZELADOR	\N	\N	\N	514120	t	2025-11-11 19:55:41.115545	2025-11-11 19:55:41.115545	10-484	10	t	2025-11-11 19:55:40.9
\.


--
-- Data for Name: role_job_status_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_job_status_permissions (id, role, job_status_id, can_view, can_edit, created_at, updated_at) FROM stdin;
57d0b483-be2f-45cf-85c1-f426064a5bb6	hr_manager	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	t	f	2025-11-11 18:24:03.265675	2025-11-11 18:24:03.265675
0881cc3f-adca-4499-8ac0-a7a115f596a6	recruiter	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	t	f	2025-11-11 18:24:03.265675	2025-11-11 18:24:03.265675
43b3b0b3-6817-45e1-982e-4d60c4d95c75	interviewer	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	t	f	2025-11-11 18:24:03.265675	2025-11-11 18:24:03.265675
07309549-6fae-4d7d-ad28-d0cd0597acf1	viewer	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	t	f	2025-11-11 18:24:03.265675	2025-11-11 18:24:03.265675
045bd58f-baf5-42b0-bf6a-12002ddfd47a	approver	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	t	f	2025-11-11 18:24:03.265675	2025-11-11 18:24:03.265675
87e636a8-5668-457e-913f-a0c6b26a0c38	manager	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	t	f	2025-11-11 18:24:03.265675	2025-11-11 18:24:03.265675
e15bb6c9-46ac-47fb-a250-5d49c921a7d0	hr_manager	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	t	f	2025-11-11 18:24:32.392106	2025-11-11 18:24:32.392106
39863d52-a876-4b93-aaa4-f137cd0a8aca	recruiter	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	t	f	2025-11-11 18:24:32.392106	2025-11-11 18:24:32.392106
a9d3ca3f-929b-4ccb-8571-d70952088eaf	interviewer	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	t	f	2025-11-11 18:24:32.392106	2025-11-11 18:24:32.392106
094d350d-3c4f-44d1-8dc7-14180703d482	viewer	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	t	f	2025-11-11 18:24:32.392106	2025-11-11 18:24:32.392106
e4ae8e17-4350-4fa2-bd5f-ffd1d1eac30f	approver	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	t	f	2025-11-11 18:24:32.392106	2025-11-11 18:24:32.392106
e020b161-d27d-4cfd-91a0-9d27f79d0fd9	manager	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	t	f	2025-11-11 18:24:32.392106	2025-11-11 18:24:32.392106
df0992f3-c0b2-42e8-84f5-cbad2166e310	hr_manager	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	t	f	2025-11-11 18:24:52.547146	2025-11-11 18:24:52.547146
032e3884-8f95-4e22-bc67-00f9a78b2d9a	recruiter	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	t	f	2025-11-11 18:24:52.547146	2025-11-11 18:24:52.547146
2a25fd7e-b5c8-4620-9f4a-6b79b2d1b116	interviewer	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	t	f	2025-11-11 18:24:52.547146	2025-11-11 18:24:52.547146
71f6116a-b3dd-4a58-8cb8-705f248c104d	viewer	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	t	f	2025-11-11 18:24:52.547146	2025-11-11 18:24:52.547146
042b8244-b682-4b7a-958e-37a2670c6a29	approver	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	t	f	2025-11-11 18:24:52.547146	2025-11-11 18:24:52.547146
d3c38ece-2593-4c05-90e4-2903ce0a1a44	manager	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	t	f	2025-11-11 18:24:52.547146	2025-11-11 18:24:52.547146
631c5a1c-a5e6-4eac-a56b-4efeff7852cf	hr_manager	733daa89-b7d8-4403-b289-cb47947d4a95	t	f	2025-11-11 18:25:14.849988	2025-11-11 18:25:14.849988
41be6293-329b-4d7a-b50d-3ab9dbd86cd3	recruiter	733daa89-b7d8-4403-b289-cb47947d4a95	t	f	2025-11-11 18:25:14.849988	2025-11-11 18:25:14.849988
8512a458-d041-453a-b9ee-dbd242a2ebb1	interviewer	733daa89-b7d8-4403-b289-cb47947d4a95	t	f	2025-11-11 18:25:14.849988	2025-11-11 18:25:14.849988
e3d9fc4f-98d0-4668-94b0-57dfab0019db	viewer	733daa89-b7d8-4403-b289-cb47947d4a95	t	f	2025-11-11 18:25:14.849988	2025-11-11 18:25:14.849988
3694d993-e1a4-4d57-8e71-1173ca5ec681	approver	733daa89-b7d8-4403-b289-cb47947d4a95	t	f	2025-11-11 18:25:14.849988	2025-11-11 18:25:14.849988
ad45eb17-39e3-4431-a366-ca72541bb678	manager	733daa89-b7d8-4403-b289-cb47947d4a95	t	f	2025-11-11 18:25:14.849988	2025-11-11 18:25:14.849988
a7132819-0222-4b9f-b011-6df45531f77d	admin	368ed512-0b3e-4db5-ac5f-b478e0b5cc0e	f	f	2025-11-12 00:42:02.504736	2025-11-12 00:42:02.504736
9f955f96-873c-4e36-9f82-1ceddcbf218a	admin	2c0686a8-aa8c-4325-92dd-4cde34d4cc6d	f	f	2025-11-12 00:42:02.504736	2025-11-12 00:42:02.504736
a112b2d9-5cea-4494-af0a-d8da8d865dd3	admin	2fc1e0b1-9c67-4a80-9d25-58be6dcc6593	f	f	2025-11-12 00:42:02.504736	2025-11-12 00:42:02.504736
d5b6a867-57e0-4dac-aaa8-43bcf64ac4e4	admin	733daa89-b7d8-4403-b289-cb47947d4a95	f	f	2025-11-12 00:42:02.504736	2025-11-12 00:42:02.504736
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, role, permission, is_granted) FROM stdin;
33f668f3-3803-4909-98f9-a9fe620e239c	admin	edit_jobs	t
f0a5b500-ff7a-46d2-b81d-88ec7b069316	admin	delete_jobs	t
cbde617d-dc04-414f-ad43-9bb487923947	admin	view_jobs	t
3757e2ba-32eb-4ac1-a7f8-4077bd9245f3	admin	create_companies	t
27a65e7c-db12-4460-9d1f-2816430b0424	admin	edit_companies	t
d736c4dd-d875-4149-9e20-c4d93a97cb60	admin	delete_companies	t
4a265a16-a43c-4434-9442-84f6daef4b1f	admin	view_companies	t
fe60f5a0-903c-4654-b7a5-b728f5eb9190	admin	manage_cost_centers	t
9c9ae828-6d79-4759-a549-0f9595448087	admin	view_applications	t
4a4d67bd-8f8f-48a4-9110-0b9ae8dbee76	admin	manage_applications	t
1bfd7e47-72a5-46e0-8258-b64798748f28	admin	interview_candidates	t
c7167c32-e370-4409-ab9c-3c0d0b992224	admin	hire_candidates	t
c6a11292-bbb5-4321-9ee0-99499b5c0b4d	admin	view_reports	t
cf244b5f-00ee-420a-8c28-cd604411c1d5	admin	export_data	t
5c8b04b8-f99a-4709-919c-28f63ac3e087	admin	manage_users	t
1ea3d128-5769-4df9-836b-43539cf7bf89	admin	manage_permissions	t
a72cd9f7-6c59-4143-b0cc-58c20240a482	hr_manager	create_jobs	t
ab34987d-58f6-407d-9fe1-fd95e7e7b8f5	hr_manager	edit_jobs	t
a6409a6d-300b-40bb-b7aa-b2f1358f1d57	hr_manager	delete_jobs	t
4384ca27-c2c6-44eb-97aa-f4155657a9e4	hr_manager	view_jobs	t
69a5fcf6-5504-4962-95fe-53d3ba945c21	hr_manager	view_companies	t
0c0d5bd1-4804-42e8-ae8e-06efc4399314	hr_manager	manage_cost_centers	t
2696afa6-80b7-4502-9aa0-26ca1a053b16	hr_manager	view_applications	t
4c88a158-d4cd-48bd-ae60-bda5631cc662	hr_manager	manage_applications	t
d2f23b03-d66a-495b-8d2f-8adb9561c5bc	hr_manager	interview_candidates	t
2345b57d-dddb-4f69-8e99-748c03394eed	hr_manager	hire_candidates	t
2e7d35fb-561a-45d2-a159-56b1c3ca7365	hr_manager	view_reports	t
caf50d4d-536d-4835-a9e5-c772160b70d6	hr_manager	export_data	t
8d9c8e99-8c95-4294-b831-99f997b4cfc8	recruiter	create_jobs	t
c41ca9a1-7a77-41e2-8589-662e06e969c4	recruiter	edit_jobs	t
57c3837c-818e-43de-a1c9-217d6c5b0b42	recruiter	view_jobs	t
47650939-15a7-4058-9975-b979358be00a	recruiter	view_companies	t
351ea0f8-3f1c-4c30-8513-5baeb04ffb6b	recruiter	view_applications	t
20438815-e54d-4ba0-a8d6-4accdf42d6b5	recruiter	manage_applications	t
8f414edc-3932-42e0-8ecb-b6265dc1fe54	recruiter	interview_candidates	t
d0fcb085-ea4e-49c3-a3e9-36179b710304	recruiter	view_reports	t
1a8f6928-f2ee-4b67-a116-90d67b3ba509	interviewer	view_jobs	t
90cc2aa4-dc0a-4f53-919e-bef99822c8b7	interviewer	view_companies	t
957be113-5989-4d43-bd02-f565d1e7dfd6	interviewer	view_applications	t
478c2f78-d89f-4ddb-a73b-ece57a5b31d9	interviewer	interview_candidates	t
a195755d-af96-4b74-a461-c012767e68ca	viewer	view_jobs	t
b7943c0b-8b55-4090-b579-5c14cc17ae96	viewer	view_companies	t
70a473df-ed9c-450e-bee2-55ec6ea50374	viewer	view_applications	t
96a2c173-335e-4627-b8ee-3674d4bc0e21	viewer	view_reports	t
97a4abce-1553-4df7-bdfb-a5d2c1513316	admin	approve_jobs	t
aa33dbf0-4d69-474b-8d0b-95a1dc1ffd13	admin	assign_to_jobs	t
ac384d3f-d0bb-45dc-ae38-2cd6afd40a47	admin	create_jobs	t
\.


--
-- Data for Name: selection_stages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.selection_stages (id, job_id, name, description, "order", is_required, passing_score, created_at) FROM stdin;
\.


--
-- Data for Name: senior_integration_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.senior_integration_settings (id, organization_id, api_url, api_key, is_active, auto_sync, sync_interval, last_sync_at, last_sync_status, last_sync_error, created_by, created_at, updated_at) FROM stdin;
3d277f2c-f8f4-4891-914c-ed5506781d89	a6b0e84d-df56-45ab-810b-310f100cd760	https://senior-sql.acelera-it.io	OpusApiKey_2025!	t	f	60	\N	\N	\N	\N	2025-11-11 18:39:51.172161	2025-11-11 18:39:51.172161
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: status_notification_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.status_notification_settings (id, status_id, email_notification_enabled, whatsapp_notification_enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_settings (id, key, value, label, description, min_value, max_value, updated_at) FROM stdin;
\.


--
-- Data for Name: user_company_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_company_roles (id, user_id, company_id, role, cost_center_id, is_active, created_at, updated_at) FROM stdin;
de8dc61c-8fab-41d8-a16d-4852a34eec69	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	767c65ac-b94f-4187-b6c2-f310cc7cac4f	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
5ee51b05-5d75-4599-809f-e2e0d757d73b	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	125cc65a-b995-49a7-9d1e-f28a1013a0b8	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
e2e2e9c1-f8d8-4068-906b-6ad6dda81bf7	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	c9c914c1-7dd9-4878-93c8-5fa4fd3f05ed	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
0c17b0ba-02b9-408b-a96a-5cea04926fd4	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	d06878be-ae25-4860-ba2f-88639dd96bf8	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
e209ffff-44ba-4120-bd07-af7df803f83d	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	c0c66615-69ec-45bd-9bf1-bcc55aeb7737	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
0c22bd0d-bccb-461c-b24e-cbb57cd7b4c5	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	673a19aa-72e2-49ba-b7d4-ca194933547c	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
c4ce5a2a-ac16-453d-a652-30909741fedc	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	0aa6f154-1ad7-4e38-a6c6-fb6be1213b54	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
a645eea7-62d2-4346-8013-959b969bfc3d	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	96a2f2df-78f5-4b59-92f3-ac04396b09ab	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
b1c60418-f0e2-429d-a345-9e78eefe908d	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	619bf5b4-4e62-4ef6-8cb5-a8f73820a443	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
5644efd4-eec7-48b2-b3e1-357441943dc8	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	5e7417e0-9e91-4234-a182-c89f89920532	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
30465603-9d3e-45e6-8325-6fc185c1c9da	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	ec0baf49-3337-4fe6-b9c5-aff2111e1dd7	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
1bec35e2-5634-40ec-8a1f-3f0b44ed5b0b	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	920badc4-8144-4940-8c33-2196116941a9	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
dd420d83-e9bb-4a29-ba83-e4324ad7091b	2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	8380284d-034b-4bca-b059-05f5bf700f72	admin	\N	t	2025-11-11 23:26:04.559584	2025-11-11 23:26:04.559584
\.


--
-- Data for Name: user_menu_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_menu_permissions (id, user_id, menu_path, menu_name, can_access, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, organization_id, email, password_hash, first_name, last_name, profile_image_url, role, created_at, updated_at) FROM stdin;
2e8d4227-c3f6-4daa-af9e-1f6cbd04d8b4	a6b0e84d-df56-45ab-810b-310f100cd760	ricardo.stafim@grupoopus.com	$2b$10$SC/MDJCYAFZyd/XwHzSWv.4wWJQ0PBsKbOwYvzxU94bCsscpy52ZW	Ricardo	Stafim	\N	admin	2025-11-11 18:27:27.279474	2025-11-11 18:27:27.279474
37612170-8e14-40cd-ac66-3c6a6ffd093a	\N	fernando.lacerda@gmail.com	$2b$10$1aTBRys2QX.ir27eF.nxIeZRQM2cktMUdHYXLrOE3MmlMysSUPU.C	Fernando lacerda	Fernando lacerda	\N	manager	2025-11-11 20:13:51.729712	2025-11-11 20:13:51.729712
0d51d559-d0ea-4767-ac6e-3ca403168c20	\N	admin@sistema.com	$2b$10$7c014zoucXctyhdhgD4xbeeLZR6nedcDGfXTr1LTZQyLx242FTc3q	\N	\N	\N	super_admin	2025-11-11 20:33:01.811768	2025-11-11 20:33:01.811768
\.


--
-- Data for Name: work_positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.work_positions (id, code, name, short_name, is_active, created_at, updated_at, senior_establishment, imported_from_senior, last_synced_at) FROM stdin;
\.


--
-- Data for Name: work_scales; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.work_scales (id, name, description, start_time, end_time, break_intervals, is_active, created_at, updated_at) FROM stdin;
e2a73107-a816-44fe-ba8a-0e3f3cc45b45	Escala normal	teste	09:01	18:01	teste	t	2025-11-11 18:38:34.230952	2025-11-11 18:38:34.230952
\.


--
-- Data for Name: workflow_job_status_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.workflow_job_status_rules (id, workflow_id, job_status_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: application_stage_progress application_stage_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_stage_progress
    ADD CONSTRAINT application_stage_progress_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: approval_workflow_steps approval_workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approval_workflow_steps
    ADD CONSTRAINT approval_workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: approval_workflows approval_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approval_workflows
    ADD CONSTRAINT approval_workflows_pkey PRIMARY KEY (id);


--
-- Name: benefits benefits_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_name_unique UNIQUE (name);


--
-- Name: benefits benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_pkey PRIMARY KEY (id);


--
-- Name: blacklist_candidates blacklist_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blacklist_candidates
    ADD CONSTRAINT blacklist_candidates_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: client_dashboard_permissions client_dashboard_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_dashboard_permissions
    ADD CONSTRAINT client_dashboard_permissions_pkey PRIMARY KEY (id);


--
-- Name: client_employees client_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_employees
    ADD CONSTRAINT client_employees_pkey PRIMARY KEY (id);


--
-- Name: client_profession_limits client_profession_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_profession_limits
    ADD CONSTRAINT client_profession_limits_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_code_unique UNIQUE (code);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_code_unique UNIQUE (employee_code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: interview_criteria interview_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interview_criteria
    ADD CONSTRAINT interview_criteria_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_approval_history job_approval_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_approval_history
    ADD CONSTRAINT job_approval_history_pkey PRIMARY KEY (id);


--
-- Name: job_benefits job_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_benefits
    ADD CONSTRAINT job_benefits_pkey PRIMARY KEY (id);


--
-- Name: job_status_history job_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_status_history
    ADD CONSTRAINT job_status_history_pkey PRIMARY KEY (id);


--
-- Name: job_statuses job_statuses_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_statuses
    ADD CONSTRAINT job_statuses_key_unique UNIQUE (key);


--
-- Name: job_statuses job_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_statuses
    ADD CONSTRAINT job_statuses_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_job_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_code_unique UNIQUE (job_code);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: kanban_boards kanban_boards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kanban_boards
    ADD CONSTRAINT kanban_boards_pkey PRIMARY KEY (id);


--
-- Name: kanban_stages kanban_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kanban_stages
    ADD CONSTRAINT kanban_stages_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);


--
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: professions professions_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_name_unique UNIQUE (name);


--
-- Name: professions professions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_pkey PRIMARY KEY (id);


--
-- Name: role_job_status_permissions role_job_status_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_job_status_permissions
    ADD CONSTRAINT role_job_status_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: selection_stages selection_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.selection_stages
    ADD CONSTRAINT selection_stages_pkey PRIMARY KEY (id);


--
-- Name: senior_integration_settings senior_integration_settings_organization_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.senior_integration_settings
    ADD CONSTRAINT senior_integration_settings_organization_id_unique UNIQUE (organization_id);


--
-- Name: senior_integration_settings senior_integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.senior_integration_settings
    ADD CONSTRAINT senior_integration_settings_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: status_notification_settings status_notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.status_notification_settings
    ADD CONSTRAINT status_notification_settings_pkey PRIMARY KEY (id);


--
-- Name: status_notification_settings status_notification_settings_status_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.status_notification_settings
    ADD CONSTRAINT status_notification_settings_status_id_unique UNIQUE (status_id);


--
-- Name: system_settings system_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_unique UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: user_company_roles user_company_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT user_company_roles_pkey PRIMARY KEY (id);


--
-- Name: user_menu_permissions user_menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_menu_permissions
    ADD CONSTRAINT user_menu_permissions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_positions work_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_positions
    ADD CONSTRAINT work_positions_pkey PRIMARY KEY (id);


--
-- Name: work_scales work_scales_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_scales
    ADD CONSTRAINT work_scales_name_unique UNIQUE (name);


--
-- Name: work_scales work_scales_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_scales
    ADD CONSTRAINT work_scales_pkey PRIMARY KEY (id);


--
-- Name: workflow_job_status_rules workflow_job_status_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.workflow_job_status_rules
    ADD CONSTRAINT workflow_job_status_rules_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: application_stage_progress application_stage_progress_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_stage_progress
    ADD CONSTRAINT application_stage_progress_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id);


--
-- Name: application_stage_progress application_stage_progress_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_stage_progress
    ADD CONSTRAINT application_stage_progress_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: application_stage_progress application_stage_progress_stage_id_selection_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_stage_progress
    ADD CONSTRAINT application_stage_progress_stage_id_selection_stages_id_fk FOREIGN KEY (stage_id) REFERENCES public.selection_stages(id);


--
-- Name: applications applications_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: applications applications_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: applications applications_kanban_stage_id_kanban_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_kanban_stage_id_kanban_stages_id_fk FOREIGN KEY (kanban_stage_id) REFERENCES public.kanban_stages(id);


--
-- Name: approval_workflow_steps approval_workflow_steps_user_id2_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approval_workflow_steps
    ADD CONSTRAINT approval_workflow_steps_user_id2_users_id_fk FOREIGN KEY (user_id2) REFERENCES public.users(id);


--
-- Name: approval_workflow_steps approval_workflow_steps_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approval_workflow_steps
    ADD CONSTRAINT approval_workflow_steps_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: approval_workflow_steps approval_workflow_steps_workflow_id_approval_workflows_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approval_workflow_steps
    ADD CONSTRAINT approval_workflow_steps_workflow_id_approval_workflows_id_fk FOREIGN KEY (workflow_id) REFERENCES public.approval_workflows(id) ON DELETE CASCADE;


--
-- Name: approval_workflows approval_workflows_division_id_divisions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approval_workflows
    ADD CONSTRAINT approval_workflows_division_id_divisions_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(id);


--
-- Name: blacklist_candidates blacklist_candidates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blacklist_candidates
    ADD CONSTRAINT blacklist_candidates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: blacklist_candidates blacklist_candidates_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blacklist_candidates
    ADD CONSTRAINT blacklist_candidates_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: client_dashboard_permissions client_dashboard_permissions_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_dashboard_permissions
    ADD CONSTRAINT client_dashboard_permissions_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_employees client_employees_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_employees
    ADD CONSTRAINT client_employees_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_employees client_employees_cost_center_id_cost_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_employees
    ADD CONSTRAINT client_employees_cost_center_id_cost_centers_id_fk FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: client_profession_limits client_profession_limits_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_profession_limits
    ADD CONSTRAINT client_profession_limits_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients clients_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: companies companies_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: cost_centers cost_centers_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: cost_centers cost_centers_division_id_divisions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_division_id_divisions_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(id);


--
-- Name: employees employees_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: interview_criteria interview_criteria_interview_id_interviews_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interview_criteria
    ADD CONSTRAINT interview_criteria_interview_id_interviews_id_fk FOREIGN KEY (interview_id) REFERENCES public.interviews(id);


--
-- Name: interviews interviews_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id);


--
-- Name: interviews interviews_interviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interviewer_id_users_id_fk FOREIGN KEY (interviewer_id) REFERENCES public.users(id);


--
-- Name: interviews interviews_stage_id_selection_stages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_stage_id_selection_stages_id_fk FOREIGN KEY (stage_id) REFERENCES public.selection_stages(id);


--
-- Name: invoices invoices_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: job_approval_history job_approval_history_approved_by_2_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_approval_history
    ADD CONSTRAINT job_approval_history_approved_by_2_users_id_fk FOREIGN KEY (approved_by_2) REFERENCES public.users(id);


--
-- Name: job_approval_history job_approval_history_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_approval_history
    ADD CONSTRAINT job_approval_history_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: job_approval_history job_approval_history_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_approval_history
    ADD CONSTRAINT job_approval_history_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_approval_history job_approval_history_workflow_step_id_approval_workflow_steps_i; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_approval_history
    ADD CONSTRAINT job_approval_history_workflow_step_id_approval_workflow_steps_i FOREIGN KEY (workflow_step_id) REFERENCES public.approval_workflow_steps(id);


--
-- Name: job_benefits job_benefits_benefit_id_benefits_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_benefits
    ADD CONSTRAINT job_benefits_benefit_id_benefits_id_fk FOREIGN KEY (benefit_id) REFERENCES public.benefits(id) ON DELETE CASCADE;


--
-- Name: job_benefits job_benefits_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_benefits
    ADD CONSTRAINT job_benefits_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_status_history job_status_history_changed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_status_history
    ADD CONSTRAINT job_status_history_changed_by_users_id_fk FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: job_status_history job_status_history_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_status_history
    ADD CONSTRAINT job_status_history_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_approval_workflow_id_approval_workflows_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_approval_workflow_id_approval_workflows_id_fk FOREIGN KEY (approval_workflow_id) REFERENCES public.approval_workflows(id);


--
-- Name: jobs jobs_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: jobs jobs_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: jobs jobs_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: jobs jobs_cost_center_id_cost_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_cost_center_id_cost_centers_id_fk FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: jobs jobs_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: jobs jobs_hired_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_hired_candidate_id_candidates_id_fk FOREIGN KEY (hired_candidate_id) REFERENCES public.candidates(id);


--
-- Name: jobs jobs_kanban_board_id_kanban_boards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_kanban_board_id_kanban_boards_id_fk FOREIGN KEY (kanban_board_id) REFERENCES public.kanban_boards(id);


--
-- Name: jobs jobs_profession_id_professions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_profession_id_professions_id_fk FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: jobs jobs_recruiter_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_recruiter_id_users_id_fk FOREIGN KEY (recruiter_id) REFERENCES public.users(id);


--
-- Name: jobs jobs_work_scale_id_work_scales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_work_scale_id_work_scales_id_fk FOREIGN KEY (work_scale_id) REFERENCES public.work_scales(id);


--
-- Name: kanban_stages kanban_stages_kanban_board_id_kanban_boards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kanban_stages
    ADD CONSTRAINT kanban_stages_kanban_board_id_kanban_boards_id_fk FOREIGN KEY (kanban_board_id) REFERENCES public.kanban_boards(id) ON DELETE CASCADE;


--
-- Name: payment_history payment_history_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: role_job_status_permissions role_job_status_permissions_job_status_id_job_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_job_status_permissions
    ADD CONSTRAINT role_job_status_permissions_job_status_id_job_statuses_id_fk FOREIGN KEY (job_status_id) REFERENCES public.job_statuses(id) ON DELETE CASCADE;


--
-- Name: selection_stages selection_stages_job_id_jobs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.selection_stages
    ADD CONSTRAINT selection_stages_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: senior_integration_settings senior_integration_settings_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.senior_integration_settings
    ADD CONSTRAINT senior_integration_settings_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: senior_integration_settings senior_integration_settings_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.senior_integration_settings
    ADD CONSTRAINT senior_integration_settings_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: status_notification_settings status_notification_settings_status_id_job_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.status_notification_settings
    ADD CONSTRAINT status_notification_settings_status_id_job_statuses_id_fk FOREIGN KEY (status_id) REFERENCES public.job_statuses(id) ON DELETE CASCADE;


--
-- Name: user_company_roles user_company_roles_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT user_company_roles_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: user_company_roles user_company_roles_cost_center_id_cost_centers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT user_company_roles_cost_center_id_cost_centers_id_fk FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: user_company_roles user_company_roles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT user_company_roles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_menu_permissions user_menu_permissions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_menu_permissions
    ADD CONSTRAINT user_menu_permissions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: workflow_job_status_rules workflow_job_status_rules_job_status_id_job_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.workflow_job_status_rules
    ADD CONSTRAINT workflow_job_status_rules_job_status_id_job_statuses_id_fk FOREIGN KEY (job_status_id) REFERENCES public.job_statuses(id) ON DELETE CASCADE;


--
-- Name: workflow_job_status_rules workflow_job_status_rules_workflow_id_approval_workflows_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.workflow_job_status_rules
    ADD CONSTRAINT workflow_job_status_rules_workflow_id_approval_workflows_id_fk FOREIGN KEY (workflow_id) REFERENCES public.approval_workflows(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

