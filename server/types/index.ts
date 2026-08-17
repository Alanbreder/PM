import { Request } from 'express';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface AppRequest extends Request {
  user?: User;
  workspaceId?: string;
}

export interface User {
  uid: string;
  email: string;
  name?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface Research {
  id: string;
  workspace_id: string;
  title: string;
  objective?: string;
  target_audience?: string;
  raw_notes?: string;
  key_findings?: string[];
  suggested_problems?: Array<{
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    evidence: string;
  }>;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'error';
  status: 'draft' | 'analyzed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateResearchInput {
  title: string;
  objective?: string;
  target_audience?: string;
  raw_notes?: string;
}

export interface Evidence {
  id: string;
  workspace_id: string;
  research_id: string;
  content: string;
  source?: string;
  impact_score: number;
  tags?: string[];
  created_at: string;
}

export interface CreateEvidenceInput {
  research_id: string;
  content: string;
  source?: string;
  impact_score?: number;
  tags?: string[];
}

export interface Problem {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  status: 'identified' | 'validating' | 'validated' | 'rejected' | 'solved';
  score?: number;
  created_at: string;
  updated_at: string;
  evidence_count?: number;
}

export interface CreateProblemInput {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  evidence_ids?: string[];
}

export interface UpdateProblemInput {
  title?: string;
  description?: string;
  impact?: 'low' | 'medium' | 'high' | 'critical';
  frequency?: 'rare' | 'occasional' | 'frequent' | 'constant';
  status?: 'identified' | 'validating' | 'validated' | 'rejected' | 'solved';
}

export interface Opportunity {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high' | 'very_high';
  value: 'low' | 'medium' | 'high' | 'transformative';
  status: 'backlog' | 'in_discovery' | 'prioritized' | 'deferred' | 'dropped';
  score?: number;
  created_at: string;
  updated_at: string;
  problem_count?: number;
}

export interface CreateOpportunityInput {
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high' | 'very_high';
  value: 'low' | 'medium' | 'high' | 'transformative';
  problem_ids?: string[];
}

export interface UpdateOpportunityInput {
  title?: string;
  description?: string;
  effort?: 'low' | 'medium' | 'high' | 'very_high';
  value?: 'low' | 'medium' | 'high' | 'transformative';
  status?: 'backlog' | 'in_discovery' | 'prioritized' | 'deferred' | 'dropped';
}

export interface Hypothesis {
  id: string;
  workspace_id: string;
  opportunity_id: string;
  title: string;
  statement: string;
  metrics_to_validate?: string;
  confidence_score?: number;
  status: 'draft' | 'in_testing' | 'validated' | 'invalidated';
  created_at: string;
  updated_at: string;
}

export interface CreateHypothesisInput {
  opportunity_id: string;
  title: string;
  statement: string;
  metrics_to_validate?: string;
  confidence_score?: number;
}

export interface Experiment {
  id: string;
  workspace_id: string;
  hypothesis_id: string;
  title: string;
  description?: string;
  methodology?: string;
  sample_size?: number;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  results?: string;
  learnings?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExperimentInput {
  hypothesis_id: string;
  title: string;
  description?: string;
  methodology?: string;
  sample_size?: number;
}

export interface UpdateExperimentInput {
  title?: string;
  description?: string;
  methodology?: string;
  sample_size?: number;
  status?: 'draft' | 'running' | 'completed' | 'cancelled';
  results?: string;
  learnings?: string;
}

export type DecisionStatus = 'pending' | 'accepted' | 'rejected' | 'deferred';

export interface Decision {
  id: string;
  workspace_id: string;
  experiment_id: string;
  title: string;
  description?: string;
  decision: string;
  rationale?: string;
  status: DecisionStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateDecisionInput {
  experiment_id: string;
  title: string;
  description?: string;
  decision: string;
  rationale?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'pivoted';
}

// ETAPA 7: INTELIGÊNCIA DO PRODUTO
export type InsightSeverity = 'critical' | 'warning' | 'opportunity' | 'info';
export type InsightType =
  | 'recurring_pattern'
  | 'unvalidated_hypothesis'
  | 'inconclusive_experiment'
  | 'weak_evidence_decision'
  | 'contradiction'
  | 'gap';

export type InsightStatus = 'suggested' | 'accepted' | 'rejected' | 'dismissed';

export interface EntityReference {
  entity_type: 'research' | 'evidence' | 'problem' | 'opportunity' | 'hypothesis' | 'experiment' | 'decision';
  entity_id: string;
  title: string;
}

export interface ProductInsight {
  id: string;
  workspace_id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  summary: string;
  facts: string[];
  interpretation: string;
  uncertainties: string[];
  sources: EntityReference[];
  status: InsightStatus;
  feedback_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryHealthMetrics {
  workspace_id: string;
  health_score: number;
  totals: {
    researches: number;
    evidences: number;
    problems: number;
    opportunities: number;
    hypotheses: number;
    experiments: number;
    decisions: number;
  };
  funnel_conversion: {
    researches_to_evidences_ratio: number;
    problems_validated_ratio: number;
    hypotheses_tested_ratio: number;
    experiments_decided_ratio: number;
  };
  risk_indicators: {
    decisions_without_evidence_count: number;
    unvalidated_hypotheses_count: number;
    inconclusive_experiments_count: number;
    orphaned_problems_count: number;
  };
  last_evaluated_at: string;
}

// ETAPA 8: ROADMAP & STRATEGIC INITIATIVES
export type RoadmapTimeframe = 'now' | 'next' | 'later';
export type RoadmapStatus = 'planned' | 'in_progress' | 'delivered' | 'blocked' | 'deferred';
export type RoadmapPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RoadmapItem {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  timeframe: RoadmapTimeframe;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  target_quarter?: string;
  decision_id?: string;
  opportunity_id?: string;
  metrics_target?: string;
  progress: number;
  owner_name?: string;
  created_at: string;
  updated_at: string;
  // Computed / joined helpers
  decision_title?: string;
  opportunity_title?: string;
}

export interface CreateRoadmapItemInput {
  title: string;
  description?: string;
  timeframe?: RoadmapTimeframe;
  status?: RoadmapStatus;
  priority?: RoadmapPriority;
  target_quarter?: string;
  decision_id?: string;
  opportunity_id?: string;
  metrics_target?: string;
  progress?: number;
  owner_name?: string;
}

export interface UpdateRoadmapItemInput {
  title?: string;
  description?: string;
  timeframe?: RoadmapTimeframe;
  status?: RoadmapStatus;
  priority?: RoadmapPriority;
  target_quarter?: string;
  decision_id?: string | null;
  opportunity_id?: string | null;
  metrics_target?: string;
  progress?: number;
  owner_name?: string;
}

export interface RoadmapLineage {
  roadmap_item: RoadmapItem;
  decision?: Decision;
  experiment?: Experiment;
  hypothesis?: Hypothesis;
  opportunity?: Opportunity;
  problems: Problem[];
  evidences: Evidence[];
  researches: Research[];
}

// ETAPA A: Strategic Objectives & KRs
export interface Objective {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  timeframe: string;
  status: 'active' | 'completed' | 'cancelled' | 'draft';
  progress: number;
  owner_name?: string;
  created_at: string;
  updated_at: string;
  key_results?: KeyResult[];
  linked_opportunities_count?: number;
  linked_roadmaps_count?: number;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  timeframe?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'draft';
  progress?: number;
  owner_name?: string;
}

export interface UpdateObjectiveInput {
  title?: string;
  description?: string;
  timeframe?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'draft';
  progress?: number;
  owner_name?: string;
}

export interface KeyResult {
  id: string;
  workspace_id: string;
  objective_id: string;
  title: string;
  metric_name: string;
  initial_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  created_at: string;
  updated_at: string;
}

export interface CreateKeyResultInput {
  objective_id: string;
  title: string;
  metric_name: string;
  initial_value?: number;
  target_value: number;
  current_value?: number;
  unit?: string;
  status?: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}

export interface UpdateKeyResultInput {
  title?: string;
  metric_name?: string;
  initial_value?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  status?: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}

// ETAPA B: Prioritization Evaluations
export type PrioritizationFramework = 'rice' | 'ice' | 'wsjf' | 'value_effort' | 'impact_effort' | 'moscow' | 'kano';

export interface Prioritization {
  id: string;
  workspace_id: string;
  opportunity_id: string;
  framework: PrioritizationFramework;
  reach?: number;
  impact?: number;
  confidence?: number;
  effort?: number;
  ice_impact?: number;
  ice_confidence?: number;
  ice_ease?: number;
  user_business_value?: number;
  time_criticality?: number;
  risk_reduction?: number;
  job_size?: number;
  score: number;
  notes?: string;
  evaluator_name?: string;
  created_at: string;
  updated_at: string;
  opportunity_title?: string;
}

export interface CreatePrioritizationInput {
  opportunity_id: string;
  framework: PrioritizationFramework;
  reach?: number;
  impact?: number;
  confidence?: number;
  effort?: number;
  ice_impact?: number;
  ice_confidence?: number;
  ice_ease?: number;
  user_business_value?: number;
  time_criticality?: number;
  risk_reduction?: number;
  job_size?: number;
  notes?: string;
  evaluator_name?: string;
}

// ETAPA C: Personas & Customer Segments
export interface Persona {
  id: string;
  workspace_id: string;
  name: string;
  role_title: string;
  segment?: string;
  description?: string;
  jobs_to_be_done?: string[];
  pains?: string[];
  goals?: string[];
  behaviors?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePersonaInput {
  name: string;
  role_title: string;
  segment?: string;
  description?: string;
  jobs_to_be_done?: string[];
  pains?: string[];
  goals?: string[];
  behaviors?: string[];
}

export interface CustomerSegment {
  id: string;
  workspace_id: string;
  name: string;
  type: 'b2b' | 'b2c' | 'enterprise' | 'smb';
  description?: string;
  criteria?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerSegmentInput {
  name: string;
  type: 'b2b' | 'b2c' | 'enterprise' | 'smb';
  description?: string;
  criteria?: string[];
}

export interface EntityPersonaLink {
  id: string;
  workspace_id: string;
  persona_id: string;
  entity_type: 'research' | 'evidence' | 'problem' | 'opportunity' | 'hypothesis' | 'decision';
  entity_id: string;
  created_at: string;
}

// ETAPA D: PRDs & User Stories
export interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  status: 'backlog' | 'in_progress' | 'done';
}

export interface PRD {
  id: string;
  workspace_id: string;
  roadmap_item_id?: string;
  title: string;
  summary?: string;
  problem_statement?: string;
  goals?: string[];
  non_goals?: string[];
  user_stories?: UserStory[];
  technical_notes?: string;
  dependencies?: string[];
  definition_of_done?: string[];
  status: 'draft' | 'in_review' | 'approved' | 'in_delivery' | 'delivered';
  version: number;
  created_at: string;
  updated_at: string;
  roadmap_title?: string;
}

export interface CreatePRDInput {
  roadmap_item_id?: string;
  title: string;
  summary?: string;
  problem_statement?: string;
  goals?: string[];
  non_goals?: string[];
  user_stories?: UserStory[];
  technical_notes?: string;
  dependencies?: string[];
  definition_of_done?: string[];
  status?: 'draft' | 'in_review' | 'approved' | 'in_delivery' | 'delivered';
}

export interface UpdatePRDInput {
  title?: string;
  summary?: string;
  problem_statement?: string;
  goals?: string[];
  non_goals?: string[];
  user_stories?: UserStory[];
  technical_notes?: string;
  dependencies?: string[];
  definition_of_done?: string[];
  status?: 'draft' | 'in_review' | 'approved' | 'in_delivery' | 'delivered';
  version?: number;
}

// ETAPA E: Outcome Tracking & Reviews
export interface OutcomeReview {
  id: string;
  workspace_id: string;
  roadmap_item_id?: string;
  prd_id?: string;
  title: string;
  metric_name: string;
  baseline_value: string;
  target_value: string;
  actual_value: string;
  timeframe_days: number;
  status: 'on_target' | 'below_target' | 'exceeded' | 'inconclusive';
  what_we_expected?: string;
  what_happened?: string;
  what_we_learned?: string;
  next_actions?: string;
  refeed_to_discovery?: boolean;
  new_problem_id?: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  roadmap_title?: string;
}

export interface CreateOutcomeReviewInput {
  roadmap_item_id?: string;
  prd_id?: string;
  title: string;
  metric_name: string;
  baseline_value: string;
  target_value: string;
  actual_value: string;
  timeframe_days?: number;
  status?: 'on_target' | 'below_target' | 'exceeded' | 'inconclusive';
  what_we_expected?: string;
  what_happened?: string;
  what_we_learned?: string;
  next_actions?: string;
  refeed_to_discovery?: boolean;
}

// ETAPA F: Collaboration & Activity
export interface Comment {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string;
  author_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentInput {
  entity_type: string;
  entity_id: string;
  content: string;
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  details?: Record<string, any>;
  created_at: string;
}

// ETAPA G: Toolkit Canvases & Product Tools
export type ToolKey =
  | 'product_canvas'
  | 'product_vision_board'
  | 'opportunity_solution_tree'
  | 'personas'
  | 'user_journey_map'
  | 'jtbd'
  | 'problem_statement'
  | 'value_proposition_canvas'
  | 'rice_prioritization'
  | 'impact_effort_matrix'
  | 'assumption_map'
  | 'experiment_canvas'
  | 'decision_canvas'
  | 'story_map'
  | 'lean_canvas'
  | 'empathy_map'
  | 'swot_analysis'
  | 'customer_journey_map'
  | 'story_mapping';

export interface ToolkitCanvas {
  id: string;
  workspace_id: string;
  tool_key: string;
  title: string;
  entity_type?: string;
  entity_id?: string;
  canvas_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateToolkitCanvasInput {
  id?: string;
  tool_key: string;
  title: string;
  entity_type?: string;
  entity_id?: string;
  canvas_data: Record<string, any>;
}

export interface UpdateToolkitCanvasInput {
  title?: string;
  entity_type?: string;
  entity_id?: string;
  canvas_data?: Record<string, any>;
}

export interface AICoachEvaluation {
  has_sufficient_data: boolean;
  facts: string[];
  observations: string[];
  possible_interpretations: string[];
  uncertainties: string[];
  recommendations: string[];
  data_gaps?: string[];
  summary: string;
}

export interface ConvertCanvasToEntityInput {
  tool_key: ToolKey;
  canvas_id?: string;
  canvas_data: Record<string, any>;
  target_entity_type: 'problem' | 'hypothesis' | 'experiment' | 'decision' | 'persona' | 'opportunity';
}



