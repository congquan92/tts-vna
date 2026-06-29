--
-- PostgreSQL database dump
--

\restrict wu9CPSEYdJE10NmEM66vW6mImNk91vmgc1DkSOgLCCK2za3nuaolgF33aedQ5uR

-- Dumped from database version 15.18 (Debian 15.18-1.pgdg13+1)
-- Dumped by pg_dump version 15.18 (Debian 15.18-1.pgdg13+1)

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
-- Name: business_files_filetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.business_files_filetype_enum AS ENUM (
    'business_license',
    'other'
);


ALTER TYPE public.business_files_filetype_enum OWNER TO postgres;

--
-- Name: business_industries_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.business_industries_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.business_industries_status_enum OWNER TO postgres;

--
-- Name: businesses_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.businesses_status_enum AS ENUM (
    'pending',
    'active',
    'inactive'
);


ALTER TYPE public.businesses_status_enum OWNER TO postgres;

--
-- Name: report_files_filetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.report_files_filetype_enum AS ENUM (
    'attachment',
    'other'
);


ALTER TYPE public.report_files_filetype_enum OWNER TO postgres;

--
-- Name: report_histories_actortype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.report_histories_actortype_enum AS ENUM (
    'SO',
    'DOANH_NGHIEP'
);


ALTER TYPE public.report_histories_actortype_enum OWNER TO postgres;

--
-- Name: report_histories_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.report_histories_status_enum AS ENUM (
    'đang báo cáo',
    'chờ tiếp nhận',
    'đã tiếp nhận',
    'đã từ chối'
);


ALTER TYPE public.report_histories_status_enum OWNER TO postgres;

--
-- Name: reports_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reports_status_enum AS ENUM (
    'đang báo cáo',
    'chờ tiếp nhận',
    'đã tiếp nhận',
    'đã từ chối'
);


ALTER TYPE public.reports_status_enum OWNER TO postgres;

--
-- Name: roles_orgtype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roles_orgtype_enum AS ENUM (
    'SO',
    'DOANH_NGHIEP'
);


ALTER TYPE public.roles_orgtype_enum OWNER TO postgres;

--
-- Name: types_of_business_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.types_of_business_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.types_of_business_status_enum OWNER TO postgres;

--
-- Name: users_orgtype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_orgtype_enum AS ENUM (
    'SO',
    'DOANH_NGHIEP'
);


ALTER TYPE public.users_orgtype_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accident_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accident_details (
    id integer NOT NULL,
    "laborAccidentReportId" integer,
    "accidentCause" character varying,
    "injuryFactor" character varying,
    "occupationCategory" character varying,
    "totalAccidentCases" integer,
    "totalCasesWithDeath" integer,
    "totalCasesWithTwoOrMoreVictims" integer,
    "totalVictims" integer,
    "totalFemaleVictims" integer,
    "totalDeaths" integer,
    "totalSeriouslyInjured" integer,
    "unmanagedVictims" integer,
    "unmanagedFemaleVictims" integer,
    "unmanagedDeaths" integer,
    "unmanagedSeriouslyInjured" integer,
    "medicalCost" numeric,
    "salaryDuringTreatment" numeric,
    "compensationCost" numeric,
    "totalSickDays" integer,
    "propertyDamage" numeric,
    "totalCost" numeric
);


ALTER TABLE public.accident_details OWNER TO postgres;

--
-- Name: accident_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accident_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accident_details_id_seq OWNER TO postgres;

--
-- Name: accident_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accident_details_id_seq OWNED BY public.accident_details.id;


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    "displayPassword" character varying,
    "roleId" integer NOT NULL,
    "userId" integer,
    "businessId" integer,
    "refreshToken" character varying,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: business_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_files (
    id integer NOT NULL,
    "businessId" integer NOT NULL,
    "fileName" character varying(255) NOT NULL,
    "storedFileName" character varying(500) NOT NULL,
    "filePath" character varying(1000) NOT NULL,
    "fileType" public.business_files_filetype_enum NOT NULL,
    "fileSize" integer,
    "mimeType" character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_files OWNER TO postgres;

--
-- Name: business_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.business_files_id_seq OWNER TO postgres;

--
-- Name: business_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_files_id_seq OWNED BY public.business_files.id;


--
-- Name: business_industries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_industries (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(30) NOT NULL,
    "parentId" integer,
    level integer NOT NULL,
    status public.business_industries_status_enum DEFAULT 'active'::public.business_industries_status_enum NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_industries OWNER TO postgres;

--
-- Name: business_industries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_industries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.business_industries_id_seq OWNER TO postgres;

--
-- Name: business_industries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_industries_id_seq OWNED BY public.business_industries.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    "taxCode" character varying(20) NOT NULL,
    "businessName" character varying(255) NOT NULL,
    "foreignName" character varying(255),
    "typeOfBusinessId" integer NOT NULL,
    "businessIndustryId" integer NOT NULL,
    "businessLicenseDate" date,
    "registeredProvince" character varying(255) NOT NULL,
    "registeredWard" character varying(255) NOT NULL,
    "registeredAddress" character varying(500) NOT NULL,
    email character varying(255) NOT NULL,
    "officePhone" character varying(20),
    "operatingProvince" character varying(255),
    "operatingWard" character varying(255),
    "businessLocation" character varying(500),
    "legalRepresentative" character varying(255),
    "representativePhone" character varying(20),
    status public.businesses_status_enum DEFAULT 'active'::public.businesses_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.businesses_id_seq OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: company_infos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_infos (
    id integer NOT NULL,
    "reportId" integer,
    "businessId" integer,
    "businessName" character varying,
    "totalNumberOfEmployees" integer,
    "totalNumberOfFemaleEmployees" integer,
    "totalSalary" numeric
);


ALTER TABLE public.company_infos OWNER TO postgres;

--
-- Name: company_infos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_infos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_infos_id_seq OWNER TO postgres;

--
-- Name: company_infos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_infos_id_seq OWNED BY public.company_infos.id;


--
-- Name: labor_accident_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.labor_accident_reports (
    id integer NOT NULL,
    "reportId" integer,
    "totalAccidentCases" integer,
    "totalCasesWithDeath" integer,
    "totalCasesWithTwoOrMoreVictims" integer,
    "totalVictims" integer,
    "totalFemaleVictims" integer,
    "totalDeaths" integer,
    "totalSeriouslyInjured" integer,
    "unmanagedVictims" integer,
    "unmanagedFemaleVictims" integer,
    "unmanagedDeaths" integer,
    "unmanagedSeriouslyInjured" integer,
    "medicalCost" numeric,
    "salaryDuringTreatment" numeric,
    "compensationCost" numeric,
    "totalCost" numeric,
    "totalSickDays" integer,
    "propertyDamage" numeric
);


ALTER TABLE public.labor_accident_reports OWNER TO postgres;

--
-- Name: labor_accident_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.labor_accident_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.labor_accident_reports_id_seq OWNER TO postgres;

--
-- Name: labor_accident_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.labor_accident_reports_id_seq OWNED BY public.labor_accident_reports.id;


--
-- Name: labor_accident_support_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.labor_accident_support_reports (
    id integer NOT NULL,
    "reportId" integer,
    "totalAccidentCases" integer,
    "totalCasesWithDeath" integer,
    "totalCasesWithTwoOrMoreVictims" integer,
    "totalVictims" integer,
    "totalFemaleVictims" integer,
    "totalDeaths" integer,
    "totalSeriouslyInjured" integer,
    "unmanagedVictims" integer,
    "unmanagedFemaleVictims" integer,
    "unmanagedDeaths" integer,
    "unmanagedSeriouslyInjured" integer,
    "medicalCost" numeric,
    "salaryDuringTreatment" numeric,
    "compensationCost" numeric,
    "totalCost" numeric,
    "totalSickDays" integer,
    "propertyDamage" numeric
);


ALTER TABLE public.labor_accident_support_reports OWNER TO postgres;

--
-- Name: labor_accident_support_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.labor_accident_support_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.labor_accident_support_reports_id_seq OWNER TO postgres;

--
-- Name: labor_accident_support_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.labor_accident_support_reports_id_seq OWNED BY public.labor_accident_support_reports.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otps (
    id integer NOT NULL,
    otp character varying NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    email character varying,
    "accountId" integer,
    "attemptCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.otps OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.otps_id_seq OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otps_id_seq OWNED BY public.otps.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    code character varying NOT NULL,
    description character varying
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: report_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_files (
    id integer NOT NULL,
    "reportId" integer NOT NULL,
    "fileName" character varying(255) NOT NULL,
    "storedFileName" character varying(500) NOT NULL,
    "filePath" character varying(1000) NOT NULL,
    "fileType" public.report_files_filetype_enum DEFAULT 'attachment'::public.report_files_filetype_enum NOT NULL,
    "fileSize" integer,
    "mimeType" character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_files OWNER TO postgres;

--
-- Name: report_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_files_id_seq OWNER TO postgres;

--
-- Name: report_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_files_id_seq OWNED BY public.report_files.id;


--
-- Name: report_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_histories (
    id integer NOT NULL,
    "reportId" integer NOT NULL,
    status public.report_histories_status_enum NOT NULL,
    reason text,
    "actorId" integer NOT NULL,
    "actorType" public.report_histories_actortype_enum NOT NULL,
    "actorName" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_histories OWNER TO postgres;

--
-- Name: report_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_histories_id_seq OWNER TO postgres;

--
-- Name: report_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_histories_id_seq OWNED BY public.report_histories.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    status public.reports_status_enum DEFAULT 'đang báo cáo'::public.reports_status_enum NOT NULL,
    year integer,
    "reportPeriod" character varying,
    "rejectReason" text
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_id_seq OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying NOT NULL,
    "orgType" public.roles_orgtype_enum NOT NULL,
    "displayName" character varying
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: types_of_business; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.types_of_business (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    status public.types_of_business_status_enum DEFAULT 'active'::public.types_of_business_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.types_of_business OWNER TO postgres;

--
-- Name: types_of_business_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.types_of_business_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.types_of_business_id_seq OWNER TO postgres;

--
-- Name: types_of_business_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.types_of_business_id_seq OWNED BY public.types_of_business.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "fullName" character varying NOT NULL,
    email character varying NOT NULL,
    "avatarUrl" character varying,
    dob date,
    gender character varying,
    "position" character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    province character varying,
    ward character varying,
    address character varying,
    "avatarPublicId" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastLoginAt" timestamp without time zone,
    "orgType" public.users_orgtype_enum NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accident_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accident_details ALTER COLUMN id SET DEFAULT nextval('public.accident_details_id_seq'::regclass);


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: business_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_files ALTER COLUMN id SET DEFAULT nextval('public.business_files_id_seq'::regclass);


--
-- Name: business_industries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_industries ALTER COLUMN id SET DEFAULT nextval('public.business_industries_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: company_infos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_infos ALTER COLUMN id SET DEFAULT nextval('public.company_infos_id_seq'::regclass);


--
-- Name: labor_accident_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_reports ALTER COLUMN id SET DEFAULT nextval('public.labor_accident_reports_id_seq'::regclass);


--
-- Name: labor_accident_support_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_support_reports ALTER COLUMN id SET DEFAULT nextval('public.labor_accident_support_reports_id_seq'::regclass);


--
-- Name: otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps ALTER COLUMN id SET DEFAULT nextval('public.otps_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: report_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_files ALTER COLUMN id SET DEFAULT nextval('public.report_files_id_seq'::regclass);


--
-- Name: report_histories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_histories ALTER COLUMN id SET DEFAULT nextval('public.report_histories_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: types_of_business id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_of_business ALTER COLUMN id SET DEFAULT nextval('public.types_of_business_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accident_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accident_details (id, "laborAccidentReportId", "accidentCause", "injuryFactor", "occupationCategory", "totalAccidentCases", "totalCasesWithDeath", "totalCasesWithTwoOrMoreVictims", "totalVictims", "totalFemaleVictims", "totalDeaths", "totalSeriouslyInjured", "unmanagedVictims", "unmanagedFemaleVictims", "unmanagedDeaths", "unmanagedSeriouslyInjured", "medicalCost", "salaryDuringTreatment", "compensationCost", "totalSickDays", "propertyDamage", "totalCost") FROM stdin;
5	1	Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn	Thiết bị nâng	Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương	1	1	1	10	5	5	10	2	1	1	1	10000000	10000000	10000000	15	1000000	30000000
6	1	Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn	Thiết bị nâng	Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương	1	1	1	10	5	5	10	0	0	0	0	10000000	10000000	10000000	15	1000000	30000000
11	2	Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt	Ngã từ trên cao	Kỹ sư cơ khí	1	1	1	10	5	5	10	2	2	2	2	15000000	15000000	15000000	15	1500000	45000000
12	2	Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn	Thiết bị nâng	Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương	1	1	1	10	5	5	10	2	2	2	2	15000000	15000000	15000000	15	1500000	45000000
15	3	Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn	Thiết bị nâng	Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương	1	1	1	10	5	5	10	2	2	2	2	10000000	10000000	10000000	10	1000000	30000000
16	3	Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn	Thiết bị nâng	Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương	1	1	1	10	5	5	10	2	2	2	2	10000000	10000000	10000000	10	1000000	30000000
18	4	Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn	Thiết bị nâng	Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương	1	1	1	10	5	5	10	2	2	2	2	10000000	10000000	10000000	15	1000000	30000000
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, username, password, "displayPassword", "roleId", "userId", "businessId", "refreshToken", "isActive") FROM stdin;
9	admin012	$2b$10$92iFTXgwLDeh9ezLDHVFEOttPSQdnpZLr0b04ooun9b73bYcHnwpy	\N	1	6	\N	\N	t
16	09998887776666	$2b$10$meqgDQhdv2at.rv4p6ycx.Lw26maNN/ds7T2Ph7eQ9UcFZz/i2vk6	12345678	4	\N	5	\N	t
11	user0234	$2b$10$w8Qh/6/kP1XUia6hqpMlHO2lAykaQjkwi9be0eVHLpg22Dm/9.mmm	\N	3	8	\N	\N	t
2	admin01	$2b$10$reCFisVI1kbpGjEW9xacGOuC4cOBGek/eM9rtAp/A5DxNosew1sme	\N	1	2	\N	\N	t
4	user02	$2b$10$E5H0wFHvnYGTOyGPrhrNx.HMfw4jGbMsgZPbhHCZZVeqhQui6Q1Q.	\N	3	4	\N	\N	t
5	0312345677	$2b$10$O4TSTYSG/YJDVRyzMPlqbOJqJLMNvTcH46ju140TxvD9/euj5KLHS	12345678	4	\N	1	\N	t
18	0999888777668	$2b$10$S.AuGCOyNCEn5lK8dkUcGO9HbE8jTa7vYqSNHO6v9xsWje/9IVlsm	12345678	4	\N	6	\N	t
6	03123456776	$2b$10$ZYmuAqSvjxwANkpeyeAvu.s56hnVm/qZwaRKmTFAaanaJhmrfKiCy	12345678	4	\N	2	\N	t
7	nguyenngocbinh	$2b$10$WQqdbUB3SwNYvhQYcKusiO1lLFZvCbAmR9az9IHnu8t5V0DzqP5e2	\N	2	5	\N	\N	t
8	0999888777666	$2b$10$DEfwy834M1yZ1o6HdNDHcuNY1qNhuPqW8ict2r2XoaVMpS.qMAEGK	12345678	4	\N	3	\N	t
1	admin	$2b$10$61kVDOV9MWcagdTAi1sWWOcM/mUKTrL7zVVhKFWF7UqHK3gR5Kocu	\N	1	1	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlSWQiOjEsIm9yZ1R5cGUiOiJTTyIsImFjY291bnRUeXBlIjoiVVNFUiIsInVzZXJJZCI6MSwiYnVzaW5lc3NJZCI6bnVsbCwiZGlzcGxheU5hbWUiOiJOZ3V54buFbiBWxINuIEEiLCJpYXQiOjE3ODI3MjI4MDYsImV4cCI6MTc4MzMyNzYwNn0.QigMv4x8hqafELMaJP3W2RPvA4UzdAHvZjH26xhLURk	t
3	user01	$2b$10$qFHZ7E9BcfEHAxnxHBnvV.Ej2.IMiLjTzIjVLrqCsFL2SzJxx6Xwy	\N	3	3	\N	\N	t
12	admin0123	$2b$10$4IZbosLffiqIkhCoYr5pnujtL70lhxeYrgptapDX4VmmfXj1JySX.	\N	1	9	\N	\N	t
15	09998887776	$2b$10$GSiSb8ZyLSNCkJ9Updx0BeIdvNjUAvKY0Fz9buoxwSkVIvUfWB1k.	12345678	4	\N	4	\N	t
14	user02345	$2b$10$xmvut.KBpZe9vHB.tQb4p.05bDQ/UsJL0HTJXdPn2XELJKnn61xQK	\N	3	11	\N	\N	t
13	user01234	$2b$10$IuIGnztDZq1rNG.JI9pXy.Ht7x4H6WUiG0TPLMuHIYcwiw22JhsEq	\N	3	10	\N	\N	t
10	user0123	$2b$10$fiWkn9LbqwdihWk0HYOYDuTxreyRjNxuVT7nLYzFrdGhYyxrRE9BW	\N	3	7	\N	\N	t
\.


--
-- Data for Name: business_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_files (id, "businessId", "fileName", "storedFileName", "filePath", "fileType", "fileSize", "mimeType", "createdAt") FROM stdin;
1	1	1706.03762v7.pdf	1782395171511-308450428.pdf	/uploads/business/1782395171511-308450428.pdf	business_license	2215244	application/pdf	2026-06-25 13:46:11.584805
2	3	1706.03762v7.pdf	1782397476281-209761686.pdf	/uploads/business/1782397476281-209761686.pdf	business_license	2215244	application/pdf	2026-06-25 14:24:36.34346
\.


--
-- Data for Name: business_industries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_industries (id, code, name, "parentId", level, status, description, "createdAt", "updatedAt") FROM stdin;
2	B	Công nghiệp	\N	1	active	\N	2026-06-25 13:42:01.443454	2026-06-25 13:42:01.443454
3	C	Xây dựng	\N	1	active	\N	2026-06-25 13:42:01.449493	2026-06-25 13:42:01.449493
5	A2	Chăn nuôi	1	2	active	\N	2026-06-25 13:42:01.468288	2026-06-25 13:42:01.468288
6	B1	Sản xuất	2	2	active	\N	2026-06-25 13:42:01.474801	2026-06-25 13:42:01.474801
7	C1	Xây dựng dân dụng	3	2	active	\N	2026-06-25 13:42:01.482546	2026-06-25 13:42:01.482546
8	A11	Trồng trọt A11	4	3	active	\N	2026-06-25 13:43:25.132007	2026-06-25 13:43:25.132007
9	A111	Trồng trọt A111	8	4	active	\N	2026-06-25 13:43:35.283714	2026-06-25 13:43:35.283714
10	B11	Công nghiệp B11	6	3	active	\N	2026-06-25 13:43:51.810486	2026-06-25 13:43:51.810486
11	B111	Công nghiệp B111	10	4	active	\N	2026-06-25 13:44:02.842576	2026-06-25 13:44:02.842576
12	A22	Chăn nuôi A22	5	3	active	\N	2026-06-25 13:44:15.599138	2026-06-25 13:44:15.599138
13	A222	Chăn nuôi A222	12	4	active	\N	2026-06-25 13:44:24.706188	2026-06-25 13:44:24.706188
1	A	Nông nghiệp	\N	1	active	\N	2026-06-25 13:42:01.437172	2026-06-25 14:20:10.76047
4	A1	Trồng trọt	1	2	active	\N	2026-06-25 13:42:01.460429	2026-06-25 14:20:30.199505
14	C11	Xây dựng C11	7	3	active	\N	2026-06-27 07:05:45.513509	2026-06-27 07:05:45.513509
15	C111	Xây dựng C111	14	4	active	\N	2026-06-27 07:06:01.568402	2026-06-27 07:06:01.568402
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, "taxCode", "businessName", "foreignName", "typeOfBusinessId", "businessIndustryId", "businessLicenseDate", "registeredProvince", "registeredWard", "registeredAddress", email, "officePhone", "operatingProvince", "operatingWard", "businessLocation", "legalRepresentative", "representativePhone", status, "createdAt", "updatedAt") FROM stdin;
1	0312345677	Công ty TNHH ABCDE	ABCDE Company Limited	1	11	2025-01-01	Thành phố Hà Nội	Phường Giảng Võ	123 Quốc lộ 13	abcde@gmail.com	02812345678	Thành phố Hà Nội	Phường Ngọc Hà	Khu công nghiệp ABC	Nguyễn Văn A	0909123456	active	2026-06-25 13:45:34.978689	2026-06-25 13:46:11.468889
2	03123456776	Công ty TNHH ABC	ABC Company Limited	1	11	2025-01-01	Cao Bằng	Phường Tân Giang	123 Quốc lộ 13	abc@gmail.com	02812345678	Cao Bằng	Phường Nùng Trí Cao	Khu công nghiệp ABC	Nguyễn Văn A	0909123456	active	2026-06-25 14:21:15.051773	2026-06-25 14:21:37.60881
3	0999888777666	Công ty cổ phần ABD	\N	2	13	2026-06-04	Thành phố Hồ Chí Minh	Phường Bình Dương	abd	abd@gmail.com	\N	\N	\N	\N	\N	\N	active	2026-06-25 14:24:36.239857	2026-06-25 14:24:36.239857
4	09998887776	Công ty TNHH BEF	\N	4	9	2026-06-04	Thành phố Hồ Chí Minh	Phường Bình Dương	bef	bef@gmail.com	\N	\N	\N	\N	\N	\N	active	2026-06-26 04:50:05.453899	2026-06-26 04:50:05.453899
5	09998887776666	Công ty tư nhân DEB	\N	3	9	2026-06-04	Thành phố Hồ Chí Minh	Phường Phú Lợi	deb	deb@gmail.com	\N	\N	\N	\N	\N	\N	active	2026-06-27 06:57:41.312584	2026-06-27 06:58:22.298143
6	0999888777668	Công ty cổ phần AHH	\N	2	15	2026-06-04	Thành phố Hồ Chí Minh	Phường Phú Lợi	ahh	ahh@gmail.com	\N	\N	\N	\N	\N	\N	active	2026-06-29 07:22:43.830219	2026-06-29 08:41:33.1163
\.


--
-- Data for Name: company_infos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_infos (id, "reportId", "businessId", "businessName", "totalNumberOfEmployees", "totalNumberOfFemaleEmployees", "totalSalary") FROM stdin;
1	1	4	\N	10	5	10000000
2	2	3	\N	10	5	15000000
3	3	3	\N	1000	45	100000000
4	4	2	\N	1000	50	100000000
\.


--
-- Data for Name: labor_accident_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.labor_accident_reports (id, "reportId", "totalAccidentCases", "totalCasesWithDeath", "totalCasesWithTwoOrMoreVictims", "totalVictims", "totalFemaleVictims", "totalDeaths", "totalSeriouslyInjured", "unmanagedVictims", "unmanagedFemaleVictims", "unmanagedDeaths", "unmanagedSeriouslyInjured", "medicalCost", "salaryDuringTreatment", "compensationCost", "totalCost", "totalSickDays", "propertyDamage") FROM stdin;
1	1	2	2	2	20	10	10	20	2	1	1	1	20000000	20000000	20000000	60000000	30	2000000
2	2	2	2	2	20	10	10	20	4	4	4	4	30000000	30000000	30000000	90000000	30	3000000
3	3	2	2	2	20	10	10	20	4	4	4	4	20000000	20000000	20000000	60000000	20	2000000
4	4	1	1	1	10	5	5	10	2	2	2	2	10000000	10000000	10000000	30000000	15	1000000
\.


--
-- Data for Name: labor_accident_support_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.labor_accident_support_reports (id, "reportId", "totalAccidentCases", "totalCasesWithDeath", "totalCasesWithTwoOrMoreVictims", "totalVictims", "totalFemaleVictims", "totalDeaths", "totalSeriouslyInjured", "unmanagedVictims", "unmanagedFemaleVictims", "unmanagedDeaths", "unmanagedSeriouslyInjured", "medicalCost", "salaryDuringTreatment", "compensationCost", "totalCost", "totalSickDays", "propertyDamage") FROM stdin;
1	1	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
2	2	1	1	1	2	2	2	2	0	0	0	0	10000000	10000000	10000000	30000000	15	1000000
3	3	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
4	4	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otps (id, otp, "expiresAt", email, "accountId", "attemptCount") FROM stdin;
1	511360	2026-06-26 04:54:22.902	bef@gmail.com	\N	0
3	541940	2026-06-27 07:01:54.076	abc@mgail.com	\N	0
2	858301	2026-06-27 07:16:19.467	\N	6	0
5	151926	2026-06-29 07:27:05.09	ahh@gmail.com	\N	0
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, code, description) FROM stdin;
1	AUTH_LOGIN	Đăng nhập hệ thống
2	AUTH_CHANGE_PASSWORD	Đổi mật khẩu
3	USER_VIEW	Xem người dùng
4	USER_CREATE	Tạo người dùng
5	USER_UPDATE	Cập nhật người dùng
6	USER_DELETE	Xóa người dùng
7	USER_IMPORT	Import người dùng
8	USER_EXPORT	Export người dùng
9	USER_TOGGLE_STATUS	Khóa/mở người dùng
10	USER_RESET_PASSWORD	Reset mật khẩu người dùng
11	BUSINESS_VIEW	Xem doanh nghiệp
12	BUSINESS_CREATE	Tạo doanh nghiệp
13	BUSINESS_UPDATE	Cập nhật doanh nghiệp
14	BUSINESS_DELETE	Xóa doanh nghiệp
15	BUSINESS_UPLOAD_FILE	Upload file doanh nghiệp
16	BUSINESS_TOGGLE_STATUS	Khóa/mở doanh nghiệp
17	BUSINESS_RESET_PASSWORD	Reset mật khẩu doanh nghiệp
18	REPORT_SO_VIEW	Xem báo cáo sở
19	REPORT_SO_APPROVE	Duyệt báo cáo sở
20	REPORT_SO_REJECT	Từ chối báo cáo sở
21	REPORT_SO_REOPEN	Mở lại báo cáo sở
27	ROLE_VIEW	Xem vai trò
28	ROLE_CREATE	Tạo vai trò
29	ROLE_UPDATE	Cập nhật vai trò
30	ROLE_DELETE	Xóa vai trò
22	REPORT_DN_VIEW	Xem báo cáo doanh nghiệp
23	REPORT_DN_CREATE	Tạo báo cáo doanh nghiệp
24	REPORT_DN_UPDATE	Cập nhật báo cáo doanh nghiệp
25	REPORT_DN_EXPORT	Xuất báo cáo doanh nghiệp
26	REPORT_DN_SUBMIT	Gửi báo cáo doanh nghiệp
\.


--
-- Data for Name: report_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_files (id, "reportId", "fileName", "storedFileName", "filePath", "fileType", "fileSize", "mimeType", "createdAt") FROM stdin;
1	1	BC tinh hinh TNLD - PHU LUC XII.pdf	1782449642175-259070285.pdf	/uploads/report/4/1782449642175-259070285.pdf	attachment	348728	application/pdf	2026-06-26 04:54:02.179628
2	2	BC tinh hinh TNLD - PHU LUC XII.pdf	1782476197869-894187242.pdf	/uploads/report/3/1782476197869-894187242.pdf	attachment	348728	application/pdf	2026-06-26 12:16:37.872516
3	3	BC tinh hinh TNLD - PHU LUC XII.pdf	1782524299647-709229322.pdf	/uploads/report/3/1782524299647-709229322.pdf	attachment	348728	application/pdf	2026-06-27 01:38:19.650356
4	4	BC tinh hinh TNLD - PHU LUC XII.pdf	1782541210993-206242149.pdf	/uploads/report/2/1782541210993-206242149.pdf	attachment	348728	application/pdf	2026-06-27 06:20:10.996813
\.


--
-- Data for Name: report_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_histories (id, "reportId", status, reason, "actorId", "actorType", "actorName", "createdAt") FROM stdin;
1	1	chờ tiếp nhận	\N	4	DOANH_NGHIEP	Công ty TNHH BEF	2026-06-26 04:56:22.653392
2	1	đã từ chối	File đính kèm không khớp với dữ liệu đã nhập	1	SO	Nguyễn Văn A	2026-06-26 04:58:21.565602
3	1	chờ tiếp nhận	\N	4	DOANH_NGHIEP	Công ty TNHH BEF	2026-06-26 04:59:43.589648
4	1	đã tiếp nhận	\N	1	SO	Nguyễn Văn A	2026-06-26 05:00:37.840791
5	2	chờ tiếp nhận	\N	3	DOANH_NGHIEP	Công ty cổ phần ABD	2026-06-26 12:18:08.446516
6	2	đã từ chối	Dữ liệu với file đính kèm chưa khớp	1	SO	Nguyễn Văn A	2026-06-26 12:20:05.527212
7	2	chờ tiếp nhận	\N	3	DOANH_NGHIEP	Công ty cổ phần ABD	2026-06-26 12:29:45.557099
8	2	đã tiếp nhận	\N	1	SO	Nguyễn Văn A	2026-06-26 12:30:26.501437
9	3	chờ tiếp nhận	\N	3	DOANH_NGHIEP	Công ty cổ phần ABD	2026-06-27 01:41:50.356441
10	3	đã từ chối	Dữ liệu chưa khớp với file pdf đính kèm	1	SO	Nguyễn Văn A	2026-06-27 01:43:29.146728
11	4	chờ tiếp nhận	\N	2	DOANH_NGHIEP	Công ty TNHH ABC	2026-06-27 06:28:24.369763
12	4	đã tiếp nhận	\N	1	SO	Nguyễn Văn A	2026-06-27 06:29:28.143061
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, status, year, "reportPeriod", "rejectReason") FROM stdin;
1	đã tiếp nhận	2026	6 tháng	File đính kèm không khớp với dữ liệu đã nhập
2	đã tiếp nhận	2026	Cả năm	Dữ liệu với file đính kèm chưa khớp
3	đã từ chối	2026	6 tháng	Dữ liệu chưa khớp với file pdf đính kèm
4	đã tiếp nhận	2026	6 tháng	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions ("roleId", "permissionId") FROM stdin;
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
2	3
2	4
2	5
2	9
2	10
2	11
2	18
2	19
2	20
2	21
3	3
3	11
3	18
1	27
1	28
1	29
1	30
2	27
3	27
4	11
4	12
4	13
4	15
4	22
4	23
4	24
4	25
4	26
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, "orgType", "displayName") FROM stdin;
1	ADMIN_SO	SO	Quản trị viên Sở
2	MANAGER_SO	SO	Lãnh đạo Sở
3	CHUYENVIEN_SO	SO	Chuyên viên
4	CEO_DN	DOANH_NGHIEP	Giám đốc Doanh nghiệp
\.


--
-- Data for Name: types_of_business; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.types_of_business (id, code, name, status, "createdAt", "updatedAt") FROM stdin;
1	TNHH	Công ty TNHH	active	2026-06-25 13:42:01.412641	2026-06-25 13:42:01.412641
2	CP	Công ty Cổ phần	active	2026-06-25 13:42:01.42037	2026-06-25 13:42:01.42037
3	DNTN	Doanh nghiệp tư nhân	active	2026-06-25 13:42:01.426735	2026-06-25 13:42:01.426735
4	HKD	Hộ kinh doanh	active	2026-06-25 13:42:01.432088	2026-06-25 13:42:01.432088
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "fullName", email, "avatarUrl", dob, gender, "position", "isActive", province, ward, address, "avatarPublicId", "createdAt", "lastLoginAt", "orgType") FROM stdin;
2	Nguyễn Văn A	a@gmail.com	\N	\N	\N	Quản trị viên	t	\N	\N	\N	\N	2026-06-25 13:45:01.217596	\N	SO
3	Trần Thị B	b@gmail.com	\N	\N	\N	Chuyên viên	t	\N	\N	\N	\N	2026-06-25 13:45:01.356883	\N	SO
4	Lê Văn C	c@gmail.com	\N	\N	\N	Chuyên viên	t	\N	\N	\N	\N	2026-06-25 13:45:01.445808	\N	SO
5	Nguyễn Ngọc Bình	nguyenngocbinh@gmail.com	\N	2026-06-10	FEMALE	Trưởng phòng	t	Điện Biên	Phường Mường Lay	abc	\N	2026-06-25 14:23:33.79055	\N	SO
7	Trần Thị B	b1@gmail.com	\N	\N	\N	Chuyên viên	t	\N	\N	\N	\N	2026-06-26 03:29:09.006125	\N	SO
8	Lê Văn C	c1@gmail.com	\N	\N	\N	Chuyên viên	t	\N	\N	\N	\N	2026-06-26 03:29:09.115638	\N	SO
9	Nguyễn Văn Anh	a12@gmail.com	\N	\N	\N	Quản trị viên	t	\N	\N	\N	\N	2026-06-26 04:37:22.01218	\N	SO
1	Nguyễn Văn A	admin@gmail.com	https://res.cloudinary.com/ddwkjtcqw/image/upload/v1782394960/avatars/epv1wpn7vvrk2aryp6rc.png	2000-01-01	MALE	Quản trị viên	t	Cao Bằng	Phường Thục Phán	123 Đường ABC	avatars/epv1wpn7vvrk2aryp6rc	2026-06-25 13:42:07.901343	\N	SO
10	Trần Thị Bình	b12@gmail.com	\N	\N	\N	Chuyên viên	t	\N	\N	\N	\N	2026-06-26 04:37:22.101186	\N	SO
11	Lê Văn Cang	c12@gmail.com	\N	2026-06-04	MALE	Chuyên viên	t	\N	\N	\N	\N	2026-06-26 04:37:22.182449	\N	SO
6	Nguyễn Văn A	a1@gmail.com	\N	\N	\N	Quản trị viên	t	\N	\N	\N	\N	2026-06-26 03:29:08.87732	\N	SO
\.


--
-- Name: accident_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accident_details_id_seq', 18, true);


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 18, true);


--
-- Name: business_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_files_id_seq', 2, true);


--
-- Name: business_industries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_industries_id_seq', 15, true);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.businesses_id_seq', 6, true);


--
-- Name: company_infos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_infos_id_seq', 4, true);


--
-- Name: labor_accident_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.labor_accident_reports_id_seq', 4, true);


--
-- Name: labor_accident_support_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.labor_accident_support_reports_id_seq', 4, true);


--
-- Name: otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otps_id_seq', 5, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 30, true);


--
-- Name: report_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_files_id_seq', 4, true);


--
-- Name: report_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_histories_id_seq', 12, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 4, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: types_of_business_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.types_of_business_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: report_histories PK_069a201c527d5e3f5daed1cc60a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_histories
    ADD CONSTRAINT "PK_069a201c527d5e3f5daed1cc60a" PRIMARY KEY (id);


--
-- Name: company_infos PK_3d2a1289512230d99300e39938a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_infos
    ADD CONSTRAINT "PK_3d2a1289512230d99300e39938a" PRIMARY KEY (id);


--
-- Name: labor_accident_support_reports PK_55d360037b611bace6eb55ffcb0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_support_reports
    ADD CONSTRAINT "PK_55d360037b611bace6eb55ffcb0" PRIMARY KEY (id);


--
-- Name: accounts PK_5a7a02c20412299d198e097a8fe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY (id);


--
-- Name: labor_accident_reports PK_66daf02c0c95c99a50dc9ccb96b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_reports
    ADD CONSTRAINT "PK_66daf02c0c95c99a50dc9ccb96b" PRIMARY KEY (id);


--
-- Name: business_files PK_6fbaaefa4f81ef2abbaf49c8d07; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_files
    ADD CONSTRAINT "PK_6fbaaefa4f81ef2abbaf49c8d07" PRIMARY KEY (id);


--
-- Name: otps PK_91fef5ed60605b854a2115d2410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY (id);


--
-- Name: permissions PK_920331560282b8bd21bb02290df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: businesses PK_bc1bf63498dd2368ce3dc8686e8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: report_files PK_d1284a8b0509229ef08ce8c4105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT "PK_d1284a8b0509229ef08ce8c4105" PRIMARY KEY (id);


--
-- Name: role_permissions PK_d430a02aad006d8a70f3acd7d03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: reports PK_d9013193989303580053c0b5ef6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY (id);


--
-- Name: business_industries PK_ed710d7ec1d21fed52d12d07503; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_industries
    ADD CONSTRAINT "PK_ed710d7ec1d21fed52d12d07503" PRIMARY KEY (id);


--
-- Name: accident_details PK_f167619161d1a7421cace5fb929; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accident_details
    ADD CONSTRAINT "PK_f167619161d1a7421cace5fb929" PRIMARY KEY (id);


--
-- Name: types_of_business PK_f18744f798caca9e2e015d616d7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_of_business
    ADD CONSTRAINT "PK_f18744f798caca9e2e015d616d7" PRIMARY KEY (id);


--
-- Name: company_infos REL_1f81ad91b9734eda723ee5cbaa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_infos
    ADD CONSTRAINT "REL_1f81ad91b9734eda723ee5cbaa" UNIQUE ("reportId");


--
-- Name: labor_accident_support_reports REL_4407ba3035f40edb1ad988f9fd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_support_reports
    ADD CONSTRAINT "REL_4407ba3035f40edb1ad988f9fd" UNIQUE ("reportId");


--
-- Name: labor_accident_reports REL_ce9f0ca6ceb7bf04d49790a5f8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_reports
    ADD CONSTRAINT "REL_ce9f0ca6ceb7bf04d49790a5f8" UNIQUE ("reportId");


--
-- Name: accounts UQ_477e3187cedfb5a3ac121e899c9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "UQ_477e3187cedfb5a3ac121e899c9" UNIQUE (username);


--
-- Name: businesses UQ_4d7b3bd51d27f17573ad0a5b122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "UQ_4d7b3bd51d27f17573ad0a5b122" UNIQUE ("taxCode");


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: permissions UQ_8dad765629e83229da6feda1c1d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE (code);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: types_of_business UQ_de5e9eef57d918ba395a60918eb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_of_business
    ADD CONSTRAINT "UQ_de5e9eef57d918ba395a60918eb" UNIQUE (code);


--
-- Name: IDX_b97566d043a952583c2703f094; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b97566d043a952583c2703f094" ON public.report_histories USING btree ("reportId");


--
-- Name: IDX_c80b932e8fd4beb63e4f3c0164; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_c80b932e8fd4beb63e4f3c0164" ON public.business_industries USING btree (code);


--
-- Name: IDX_e36788e108a35bef8228c8524d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e36788e108a35bef8228c8524d" ON public.business_industries USING btree (level);


--
-- Name: role_permissions FK_06792d0c62ce6b0203c03643cdd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: company_infos FK_1f81ad91b9734eda723ee5cbaa7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_infos
    ADD CONSTRAINT "FK_1f81ad91b9734eda723ee5cbaa7" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: business_files FK_357bf46eec2430494dbbf66ba8d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_files
    ADD CONSTRAINT "FK_357bf46eec2430494dbbf66ba8d" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: accounts FK_3aa23c0a6d107393e8b40e3e2a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: labor_accident_support_reports FK_4407ba3035f40edb1ad988f9fd1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_support_reports
    ADD CONSTRAINT "FK_4407ba3035f40edb1ad988f9fd1" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: otps FK_5b89d50f679ec63623ae2355296; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT "FK_5b89d50f679ec63623ae2355296" FOREIGN KEY ("accountId") REFERENCES public.accounts(id);


--
-- Name: accident_details FK_5d5477c6ef6afedb18c1fa1d702; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accident_details
    ADD CONSTRAINT "FK_5d5477c6ef6afedb18c1fa1d702" FOREIGN KEY ("laborAccidentReportId") REFERENCES public.labor_accident_reports(id) ON DELETE CASCADE;


--
-- Name: company_infos FK_5e14fc057e9e3e3d379e8e3820c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_infos
    ADD CONSTRAINT "FK_5e14fc057e9e3e3d379e8e3820c" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: business_industries FK_6ca8435cac7860aa706e5bb09db; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_industries
    ADD CONSTRAINT "FK_6ca8435cac7860aa706e5bb09db" FOREIGN KEY ("parentId") REFERENCES public.business_industries(id) ON DELETE RESTRICT;


--
-- Name: accounts FK_89f7f365789d5d13b4864bfa381; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_89f7f365789d5d13b4864bfa381" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: businesses FK_b37c18b742897497ec0bb3d11d8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "FK_b37c18b742897497ec0bb3d11d8" FOREIGN KEY ("typeOfBusinessId") REFERENCES public.types_of_business(id);


--
-- Name: role_permissions FK_b4599f8b8f548d35850afa2d12c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: report_histories FK_b97566d043a952583c2703f0949; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_histories
    ADD CONSTRAINT "FK_b97566d043a952583c2703f0949" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: businesses FK_ccf909894e37558c0eb33cd50dd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "FK_ccf909894e37558c0eb33cd50dd" FOREIGN KEY ("businessIndustryId") REFERENCES public.business_industries(id);


--
-- Name: labor_accident_reports FK_ce9f0ca6ceb7bf04d49790a5f8d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_accident_reports
    ADD CONSTRAINT "FK_ce9f0ca6ceb7bf04d49790a5f8d" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: report_files FK_dc03b600f1ea9d9d2e033548756; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT "FK_dc03b600f1ea9d9d2e033548756" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: accounts FK_fb8505547017736dcb551014c17; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_fb8505547017736dcb551014c17" FOREIGN KEY ("roleId") REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict wu9CPSEYdJE10NmEM66vW6mImNk91vmgc1DkSOgLCCK2za3nuaolgF33aedQ5uR

