export type ToolCategory =
  | 'strategy_vision'
  | 'discovery_user'
  | 'prioritization_decision'
  | 'execution_delivery'
  | 'discovery'
  | 'strategy'
  | 'prioritization'
  | 'execution';

export type ToolKey =
  | 'product_canvas'
  | 'product_vision_board'
  | 'product_strategy'
  | 'opportunity_solution_tree'
  | 'personas'
  | 'empathy_map'
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
  | 'prd_canvas'
  | 'lean_canvas';

export interface ToolDefinition {
  id: ToolKey;
  name: string;
  category: ToolCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  iconName: string;
  suggestedEntityConversion?: 'problem' | 'hypothesis' | 'experiment' | 'decision' | 'persona' | 'opportunity' | 'roadmap_item';
  popular?: boolean;
}

export interface CanvasInstance {
  id: string;
  workspace_id: string;
  tool_key: ToolKey;
  title: string;
  entity_type?: string;
  entity_id?: string;
  canvas_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AICoachEvaluation {
  has_sufficient_data: boolean;
  summary: string;
  facts: string[];
  observations: string[];
  possible_interpretations: string[];
  uncertainties: string[];
  recommendations: string[];
  data_gaps?: string[];
}

export interface ToolTemplate {
  id: string;
  name: string;
  description: string;
  data: Record<string, any>;
}
