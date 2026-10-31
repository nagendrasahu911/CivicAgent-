export type UserRole = 'citizen' | 'officer' | 'moderator' | 'admin';
export type PrivacyMode = 'public' | 'private' | 'confidential';
export type ComplaintStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'more_info_required' 
  | 'accepted' 
  | 'rejected' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolved_pending_feedback' 
  | 'closed' 
  | 'reopened';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department_id?: string | null;
  department_name?: string | null;
  phone?: string | null;
  locality?: string | null;
  preferred_language: string;
  created_at: string;
}

export interface TimelineItem {
  id: string;
  complaint_id: string;
  action: string;
  old_status?: string | null;
  new_status?: string | null;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  public_remarks?: string | null;
  internal_remarks?: string | null;
  evidence_url?: string | null;
  created_at: string;
}

export interface SeverityFactors {
  score: number;
  label: string;
  recommended_action: string;
  breakdown: {
    safety_risk: { score: number; max: number; notes: string };
    public_impact: { score: number; max: number; notes: string };
    time_unresolved: { score: number; max: number; notes: string };
    evidence_quality: { score: number; max: number; notes: string };
    cluster_density: { score: number; max: number; notes: string };
  };
}

export interface DuplicateMatch {
  complaint_id: string;
  ticket_number: string;
  title: string;
  category: string;
  locality: string;
  similarity_score: number;
  distance_meters?: number | null;
  matching_reasons: string[];
  cluster_id?: string | null;
  cluster_support_count?: number;
}

export interface AIAnalysisResult {
  suggested_category: string;
  suggested_department: string;
  suggested_department_id: string;
  confidence: number;
  severity_score: number;
  severity_label: string;
  severity_factors: SeverityFactors;
  ai_summary: string;
  ai_explanation: string;
  missing_info_warnings: string[];
  detected_language: string;
  possible_duplicates: DuplicateMatch[];
}

export interface Complaint {
  id: string;
  ticket_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  title: string;
  description: string;
  category: string;
  original_language?: string;
  privacy_mode: PrivacyMode;
  status: ComplaintStatus;
  locality: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  selected_address?: string | null;
  location_selection_method?: 'gps' | 'manual_search' | 'map_pin' | string;
  suggested_category?: string;
  suggested_department_id?: string;
  assigned_department_id?: string | null;
  department_name?: string | null;
  department_code?: string | null;
  assigned_officer_id?: string | null;
  officer_name?: string | null;
  severity_score: number;
  severity_label: string;
  severity_factors_json?: any;
  ai_summary?: string;
  ai_explanation?: string;
  missing_info_json?: string[];
  confidence_score?: number;
  image_url?: string | null;
  audio_url?: string | null;
  audio_transcript?: string | null;
  cluster_id?: string | null;
  cluster_title?: string | null;
  cluster_support_count?: number;
  resolution_notes?: string | null;
  resolution_evidence_url?: string | null;
  resolved_at?: string | null;
  citizen_rating?: number | null;
  citizen_feedback_status?: string | null;
  citizen_feedback_notes?: string | null;
  reopen_reason?: string | null;
  rejection_reason?: string | null;
  internal_officer_notes?: string | null;
  created_at: string;
  updated_at: string;
  timeline?: TimelineItem[];
}

export interface IssueCluster {
  id: string;
  title: string;
  category: string;
  locality: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  support_count: number;
  complaint_count: number;
  assigned_department_id?: string | null;
  department_name?: string | null;
  department_code?: string | null;
  confirmed_by_officer: number;
  created_at: string;
  updated_at: string;
  sample_evidence?: Array<{ image_url: string; title: string; ticket_number: string }>;
  complaints?: Complaint[];
  user_has_supported?: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  contact_email: string;
  sla_hours: number;
  total_complaints?: number;
  active_work_count?: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  is_read: number;
  created_at: string;
}

export interface RiskRadarData {
  summary: {
    total_complaints: number;
    urgent_unresolved: number;
    awaiting_citizen_feedback: number;
    average_citizen_satisfaction: number;
    data_mode: string;
    notice: string;
  };
  category_distribution: Array<{ category: string; count: number; avg_severity: number }>;
  status_distribution: Array<{ status: string; count: number }>;
  severity_distribution: Array<{ severity_label: string; count: number }>;
  department_workload: Array<{
    id: string;
    name: string;
    code: string;
    sla_hours: number;
    total_assigned: number;
    active_backlog: number;
    resolved_count: number;
    avg_rating?: number | null;
  }>;
  hotspots: Array<{
    id: string;
    title: string;
    category: string;
    locality: string;
    latitude: number;
    longitude: number;
    severity_score: number;
    severity_label: string;
    status: string;
    ticket_number: string;
    selected_address?: string | null;
  }>;
  top_clusters: IssueCluster[];
}

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  title: string;
  category?: string;
  status?: string;
  severity_label?: string;
  ticket_number?: string;
  support_count?: number;
  is_cluster?: boolean;
  address?: string;
}

