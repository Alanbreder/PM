const fs = require('fs');

const frontendKeys = [
  'product_canvas',
  'product_vision_board',
  'product_strategy',
  'opportunity_solution_tree',
  'personas',
  'empathy_map',
  'user_journey_map',
  'jtbd',
  'problem_statement',
  'value_proposition_canvas',
  'rice_prioritization',
  'impact_effort_matrix',
  'assumption_map',
  'experiment_canvas',
  'decision_canvas',
  'story_map',
  'prd_canvas',
  'lean_canvas'
];

const backendOnlyKeys = [
  'swot_analysis',
  'customer_journey_map',
  'story_mapping'
];

const allKeys = [...new Set([...frontendKeys, ...backendOnlyKeys])];
const typeDef = `export type ToolKey =\n  | ` + allKeys.map(k => `'${k}'`).join('\n  | ') + `;`;

const file = 'server/types/index.ts';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/export type ToolKey =[\s\S]+?;/, typeDef);
fs.writeFileSync(file, content);

const file2 = 'src/types/tools.ts';
let content2 = fs.readFileSync(file2, 'utf-8');
content2 = content2.replace(/export type ToolKey =[\s\S]+?;/, typeDef);
fs.writeFileSync(file2, content2);
