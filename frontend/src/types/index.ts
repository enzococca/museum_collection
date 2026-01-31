// User types
export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Artifact types
export interface Artifact {
  id: string;
  collection: string;
  sequence_number: string;
  accession_number: string | null;
  other_accession_number: string | null;
  on_display: boolean;
  acquisition_details: string | null;
  object_type: string | null;
  material: string | null;
  remarks: string | null;
  size_dimensions: string | null;
  weight: string | null;
  technique: string | null;
  description_catalogue: string | null;
  description_observation: string | null;
  inscription: string | null;
  findspot: string | null;
  production_place: string | null;
  chronology: string | null;
  bibliography: string | null;
  photo_number: string | null;
  british_museum_url: string | null;
  external_links: Record<string, string> | null;
  media_count: number;
  media?: Media[];
  primary_media?: Media | null;
  created_at: string;
  updated_at: string;
}

export interface ArtifactFormData {
  sequence_number: string;
  collection?: string;
  accession_number?: string;
  other_accession_number?: string;
  on_display?: boolean;
  acquisition_details?: string;
  object_type?: string;
  material?: string;
  remarks?: string;
  size_dimensions?: string;
  weight?: string;
  technique?: string;
  description_catalogue?: string;
  description_observation?: string;
  inscription?: string;
  findspot?: string;
  production_place?: string;
  chronology?: string;
  bibliography?: string;
  photo_number?: string;
  british_museum_url?: string;
  external_links?: Record<string, string>;
}

// Media types
export interface Media {
  id: string;
  artifact_id: string;
  filename: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  dropbox_path: string;
  thumbnail_path: string | null;
  is_primary: boolean;
  caption: string | null;
  folder: string | null;
  sort_order: number;
  annotation_count: number;
  annotations?: Annotation[];
  created_at: string;
}

export interface MediaUrl {
  url: string;
  thumbnail_url: string | null;
}

// Annotation types
export type AnnotationType = 'rectangle' | 'freehand';
export type StrokeStyle = 'solid' | 'dashed';

export interface RectangleGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FreehandGeometry {
  points: number[];
}

export interface Annotation {
  id: string;
  media_id: string;
  annotation_type: AnnotationType;
  geometry: RectangleGeometry | FreehandGeometry;
  stroke_color: string;
  stroke_width: number;
  stroke_style: StrokeStyle;
  fill_color: string | null;
  fill_opacity: number;
  label: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnotationFormData {
  media_id: string;
  annotation_type: AnnotationType;
  geometry: RectangleGeometry | FreehandGeometry;
  stroke_color?: string;
  stroke_width?: number;
  stroke_style?: StrokeStyle;
  fill_color?: string;
  fill_opacity?: number;
  label?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Submission types
export interface Submission {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  researcher_name: string;
  researcher_institution: string | null;
  researcher_address: string | null;
  researcher_email: string;
  storage_location: string | null;
  object_name: string | null;
  dimensions: string | null;
  description: string | null;
  notes: string | null;
  artifact_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  image_count: number;
  images?: SubmissionImage[];
  created_at: string;
}

export interface SubmissionImage {
  id: string;
  submission_id: string;
  filename: string;
  original_filename: string | null;
  dropbox_path: string;
  thumbnail_path: string | null;
  created_at: string;
}

export interface SubmissionFormData {
  researcher_name: string;
  researcher_institution?: string;
  researcher_address?: string;
  researcher_email: string;
  storage_location?: string;
  object_name?: string;
  dimensions?: string;
  description?: string;
  notes?: string;
}

// Statistics types
export interface DashboardStats {
  totals: {
    artifacts: number;
    on_display: number;
    not_on_display: number;
    media: number;
    annotations: number;
    users: number;
    pending_submissions: number;
  };
  object_types: { name: string; count: number }[];
  materials: { name: string; count: number }[];
}

// Filter types
export interface FilterOptions {
  object_types: string[];
  materials: string[];
  chronologies?: string[];
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
}
