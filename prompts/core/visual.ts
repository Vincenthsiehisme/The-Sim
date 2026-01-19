
export const AVATAR_GENERATION_PROMPT_TEMPLATE = (
  age: string, 
  gender: string, 
  role: string, 
  fashion: string, 
  accessories: string,
  expression: string,
  lighting: string,
  bg_color: string,
  palette: string,
  visual_guide?: string // NEW
) => {
  // If a specific visual guide exists (from Conflict Resolution), use it as the primary subject
  if (visual_guide) {
     return `
Generate a high-quality, realistic 3D avatar style portrait.
Subject Description: ${visual_guide}
Contextual Tags: ${age} year old, ${gender}.
Style: 3D render, Pixar-esque but realistic textures, high detail, soft shadows, octane render.
Head and shoulders shot, facing forward.
Lighting: ${lighting}.
Background: Solid ${bg_color} background.
Color Palette: ${palette}.
     `;
  }

  // Fallback to standard prompt construction
  return `
Generate a high-quality, realistic 3D avatar style portrait.
Subject: A ${age} year old ${gender} ${role}.
Appearance: ${fashion}, wearing ${accessories}.
Expression: ${expression}.
Lighting: ${lighting}.
Background: Solid ${bg_color} background.
Color Palette: ${palette}.
Style: 3D render, Pixar-esque but realistic textures, high detail, soft shadows, octane render.
Head and shoulders shot, facing forward.
  `;
};
