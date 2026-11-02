export interface Course {
  id: string;
  title: string;
  description: string;
  filename: string;
  file_type: 'pptx' | 'pdf';
  status: 'uploading' | 'reading' | 'identifying' | 'generating' | 'ready' | 'error';
  status_message?: string;
  progress_percent: number;
  total_units: number;
  topic_count: number;
  completed_topics_count: number;
  created_at: string;
}

export interface Topic {
  id: string;
  title: string;
  order_index: number;
  source_pages: number[];
  summary: string;
  importance: 'Overview' | 'High' | 'Medium' | 'Low';
  is_completed: boolean;
}

export interface Session {
  id: string;
  title: string;
  order_index: number;
  description: string;
  topics: Topic[];
}

export interface CoverageItem {
  unit_number: number;
  unit_label: string;
  title: string;
  topic_assigned: string;
  session_name: string;
  status: string;
  extracted_items: {
    paragraphs_count: number;
    bullets_count: number;
    tables_count: number;
    has_notes: boolean;
  };
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  session_id?: string;
  filename: string;
  file_type: 'pptx' | 'pdf';
  title: string;
  total_units: number;
  topic_count: number;
  status: string;
  created_at?: string;
}

export interface CourseDetail extends Course {
  sessions: Session[];
  coverage_checklist: CoverageItem[];
  materials?: CourseMaterial[];
}

export interface StepItem {
  step: number;
  heading: string;
  description: string;
}

export interface IndianExample {
  title?: string;
  company: string;
  scenario: string;
  takeaway: string;
}

export interface RealLifeExample {
  title: string;
  scenario: string;
  learning: string;
}

export interface TermItem {
  term: string;
  definition: string;
}

export interface FormulaItem {
  formula: string;
  variables: string;
  solved_example: string;
}

export interface DiagramData {
  mermaid_syntax?: string;
  diagram_type?: string;
  explanation?: string;
}

export interface ComparisonTableItem {
  feature: string;
  item_a_val: string;
  item_b_val: string;
}

export interface ComparisonData {
  item_a?: string;
  item_b?: string;
  comparison_table?: ComparisonTableItem[];
}

export interface QuestionQA {
  question: string;
  answer?: string;
  guideline?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'mcq' | 'true_false' | 'short';
  explanation: string;
}

export interface Lesson {
  id: string;
  topic_id: string;
  course_id: string;
  course_title: string;
  title: string;
  importance: string;
  unit_label: string;
  source_pages: number[];
  simple_definition: string;
  easy_english: string;
  hinglish: string;
  step_by_step: StepItem[];
  key_points: string[];
  real_life_examples: RealLifeExample[];
  indian_examples: IndianExample[];
  terminology: TermItem[];
  formulas: FormulaItem[];
  diagram: DiagramData;
  comparisons: ComparisonData;
  exam_notes: string;
  short_questions: QuestionQA[];
  long_questions: QuestionQA[];
  revision_summary: string;
  simplified_mode: {
    title?: string;
    eli5_text?: string;
    gadget_tip?: string;
  };
  is_completed: boolean;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
}

export interface WeakTopic {
  topic_id: string;
  topic_title: string;
  course_id: string;
  last_score: number;
  date: string;
  status: string;
}

export interface GamificationProfile {
  student_name?: string;
  student_id?: string;
  total_xp: number;
  level: number;
  xp_in_current_level: number;
  next_level_xp: number;
  current_streak: number;
  completed_topics_count: number;
  completed_topics: string[];
  weak_topics: WeakTopic[];
  badges: string[];
  available_badges: Badge[];
}

export interface Flashcard {
  id: string;
  topic_title: string;
  course_title: string;
  source_ref: string;
  card_type: 'Definition' | 'Term' | 'Formula';
  front: string;
  back: string;
}

export interface AnywhereDoorItem {
  course_id: string;
  course_title: string;
  file_type: string;
  session_id: string;
  session_title: string;
  topic_id: string;
  topic_title: string;
  source_pages: number[];
  importance: string;
  is_completed: boolean;
}

export interface SourceSnippet {
  citation: string;
  header: string;
  snippet: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  citations?: string[];
  source_snippets?: SourceSnippet[];
  created_at?: string;
}

export interface AppSettings {
  is_configured: boolean;
  masked_key: string;
  active_provider: string;
  model_name: string;
}

export interface CourseSummaryData {
  id: string;
  course_id: string;
  what_is_it_about: string;
  main_topics: Array<{ title: string; brief: string }>;
  what_will_learn: string[];
  important_concepts: string[];
  how_topics_connected: string;
  connections: Array<{ from_topic: string; to_topic: string; relation_type: string; explanation: string }>;
  understand_first: string[];
  exam_points: string[];
  conclusion: string;
  quick_summary: string;
  detailed_summary: string;
  mermaid_syntax: string;
}

export interface GraphNode {
  id: string;
  label: string;
  full_label?: string;
  type: 'chapter' | 'topic' | 'subtopic';
  course_id: string;
  course_title: string;
  session_id?: string;
  session_title?: string;
  parent_topic_id?: string;
  color: string;
  size: number;
  importance?: string;
  summary?: string;
  description?: string;
  is_completed?: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation_type: string;
  label: string;
  explanation: string;
}

export interface KnowledgeGraphData {
  course_id?: string;
  course_title?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    total_nodes: number;
    total_edges: number;
    chapters_count?: number;
    topics_count?: number;
    courses_count?: number;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  total_xp: number;
  level: number;
  current_streak: number;
  completed_topics_count: number;
  created_at: string;
}
