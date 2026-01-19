
import { FrictionDimensionKey, ProductDiagnosis, PersonaCandidate, PrismAnalysisV3, FrictionDimension, StrategicCoordinates } from '../../types';
import { PRODUCT_MIRROR_INSTRUCTION, buildProductMirrorPrompt, PRODUCT_GROUNDING_INSTRUCTION } from '../../prompts';
import { trySafeJsonParse, cleanJsonString } from '../../utils/normalization';
import { LLMGateway, retryWithBackoff } from '../infrastructure/LLMGateway';
import { openDataService } from '../OpenDataService';
import { PRISM_POLICY } from '../../data/prism_policy';
import { EconomicPhysics } from '../../data/physics/coefficients';

export interface MirrorResult {
    diagnosis: ProductDiagnosis;
    candidates: PersonaCandidate[];
}

export class PrismAgent {
  
  /**
   * PHASE 0: Grounding Agent
   * Analyzes the product to get real-world context (age, lifecycle, position)
   */
  private static async analyzeProductContext(name: string, priceFull: string, category?: string) {
      return retryWithBackoff(async () => {
          const ai = LLMGateway.getClient();
          const model = "gemini-3-flash-preview";
          
          const prompt = `
          Product: ${name}
          Price: ${priceFull}
          Category: ${category || 'Unknown'}
          
          Analyze this product for the Taiwan market. 
          Task 1: Identify market position, buyer age, and lifecycle.
          Task 2: Find the main competitor.
          Task 3: Search specifically for "Competitor Name + PTT/Dcard + 災情/缺點" to find the "Poison".
          
          Return JSON based on PRODUCT_GROUNDING_INSTRUCTION.
          `;

          const response = await ai.models.generateContent({
              model: model,
              contents: [{ role: 'user', parts: [{ text: PRODUCT_GROUNDING_INSTRUCTION }, { text: prompt }] }],
              config: { tools: [{ googleSearch: {} }] }
          });

          return trySafeJsonParse<any>(cleanJsonString(response.text || "{}"));
      }, 2, 3000, "Phase 0: Grounding");
  }

  public static async mirrorPersonaFromProduct(
    input: {
      name: string;
      priceAmount: string;
      priceUnit: string;
      priceCycle: string;
      category?: string;
      specs: string[];
      competitorName: string;
      competitorPrice?: string;
      focusDimension?: FrictionDimensionKey;
    }
  ): Promise<MirrorResult> {
    // Phase 0 & 1 wrapper
    return retryWithBackoff(async () => {
      const priceFull = `${input.priceUnit} ${input.priceAmount} (${input.priceCycle})`;
      
      // --- PHASE 0: GROUNDING (Context Discovery) ---
      let groundingContext = {};
      try {
          groundingContext = await this.analyzeProductContext(input.name, priceFull, input.category);
          console.log(">> Grounding Context:", groundingContext);
      } catch (e) {
          console.warn("Grounding failed, using defaults.", e);
      }

      const ai = LLMGateway.getClient();
      const model = "gemini-3-flash-preview";

      // 1. PRE-COMPUTATION (Prism 5.1 Dual Physics Layer)
      const priceVal = parseFloat(input.priceAmount) || 0;
      
      // Physics A: Amortized (Rationalized Pain)
      const monthlyBurden = openDataService.calculateProductBurden(priceVal, input.priceCycle, input.category);
      // Physics B: Upfront (Shock)
      const upfrontShock = input.priceCycle.includes('Monthly') ? priceVal : priceVal;

      // Logic: Veto Inference (Who holds the veto?)
      const decisionUnit = openDataService.inferDecisionUnit(monthlyBurden, input.category);
      const vetoInference = {
          veto_holder: decisionUnit,
          why_veto: upfrontShock > 15000 ? "High Upfront Shock" : "Category Norm"
      };

      // Physics C: Resistance Score (for the average user - e.g., Stable income)
      // This gives the LLM a baseline "Pain Level" to work with.
      const estimatedDisposable = 35000; // Approx stable disposable
      const resistanceScore = EconomicPhysics.calculatePurchaseResistance(monthlyBurden, estimatedDisposable);

      const competitor = {
          name: input.competitorName || "Market Leader",
          price: input.competitorPrice || "Unknown"
      };

      // 2. BUILD TRI-OPTIC PROMPT (PRISM 6.0 Market Envelope)
      const prompt = buildProductMirrorPrompt(
          input.name, 
          priceFull, 
          input.specs, 
          competitor, 
          input.focusDimension,
          { 
              upfrontShock, 
              rationalizedPain: monthlyBurden, 
              vetoInference 
          }, 
          groundingContext 
      );
      
      // Inject Physics Context into Prompt (Hack for now, or add to buildProductMirrorPrompt signature properly later)
      const enhancedPrompt = `${prompt}\n\n[PHYSICS ENGINE DATA]\n- Base Resistance Score (Stable Class): ${resistanceScore}/100\n- Instruction: If Resistance > 50, 'The Solid' persona MUST mention price pain. If > 80, 'The Stretcher' is highly unlikely to buy without strong leverage.`;

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          { role: 'user', parts: [{ text: PRODUCT_MIRROR_INSTRUCTION }, { text: enhancedPrompt }] }
        ],
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.9,
        }
      });

      const result = trySafeJsonParse<PrismAnalysisV3 | any>(cleanJsonString(response.text || "{}"));
      
      // --- ADAPTER LAYER (V6.0 -> V1 Contract) ---
      if (result.version === 'v9.0' || result.version === 'v6.0' || result.version === 'v5.1' || result.version === 'v3' || result.version === 'v2') {
          const v3Result = result as PrismAnalysisV3;
          
          // A. Find "Winner" Battleground for Diagnosis Radar
          const targetId = v3Result.best_strategy.target;
          const winner = v3Result.battlegrounds.find(b => b.id === targetId) || v3Result.battlegrounds[0];

          // B. Map Dimensions (Prism 8.0: Reality Anchored Logic)
          const transformDimensions = (dims: any, leverageEfficiency: number, incomeTierKey: string = 'Stable', ageRange: string = '30-34'): Record<FrictionDimensionKey, FrictionDimension> => {
              const transformed: any = {};
              
              const m_macro = openDataService.getMacroMultiplier(); 
              const m_micro = openDataService.calculateAffordability(monthlyBurden, incomeTierKey, ageRange); 

              for (const [key, val] of Object.entries(dims)) {
                  const k = key as FrictionDimensionKey;
                  
                  const painScore = (val as any).score; 
                  const basePotential = Math.max(0.1, (100 - painScore) / 100); 
                  
                  const m_strategy = Math.max(0.5, leverageEfficiency);

                  let rawProbability = basePotential * m_macro * m_micro * m_strategy;
                  
                  let opportunity = Math.min(100, Math.round(rawProbability * 80)); 

                  if (m_micro < 0.1) opportunity = Math.min(opportunity, 10);

                  if ((val as any).is_hard_wall) {
                      const type = (val as any).hard_wall_type;
                      if (type === 'Regulatory') opportunity = 0; 
                      else if (type === 'Insolvent') opportunity = 5; 
                      else if (type === 'Physical') opportunity = 15; 
                      else opportunity *= 0.5; 
                  }

                  transformed[k] = {
                      score: painScore, 
                      base_score: painScore, 
                      label: k, 
                      reason: (val as any).reason || (val as any).micro_tactic || "AI 未提供原因",
                      micro_tactic: (val as any).micro_tactic,
                      constraint_check: (val as any).constraint_check,
                      benchmark_check: (val as any).benchmark_check,
                      flippability_coefficient: leverageEfficiency,
                      opportunity_score: opportunity, 
                      red_line_alert: (val as any).is_hard_wall || m_micro < 0.2, 
                      is_hard_wall: (val as any).is_hard_wall,
                      cost_driver: (val as any).cost_driver,
                      recommended_leverage: (val as any).recommended_leverage
                  };
              }
              return transformed;
          };

          const diagnosis: ProductDiagnosis = {
              summary: v3Result.best_strategy.headline,
              dimensions: transformDimensions(winner.dimensions, winner.leverage.efficiency, 'Stable', (groundingContext as any)?.target_demographics)
          };

          // C. Generate Candidates
          const candidates: PersonaCandidate[] = v3Result.battlegrounds.map((bg, idx) => {
              
              let type: PersonaCandidate['type'] = 'Rational';
              let shadowPool = PRISM_POLICY.shadow_mapping[bg.id] || ['auto'];
              let shadowId = bg.selected_shadow || shadowPool[0];

              if (bg.id === 'The_Stretcher') type = 'Aspirational';
              else if (bg.id === 'The_Niche') type = 'Niche';
              else type = 'Rational';
              
              const resolvedAge = bg.age_range || (groundingContext as any)?.target_demographics || "25-35";
              const incomeTier = (bg as any).income_tier_key || 'Stable';
              const specHighlight = bg.leverage.method; 
              const winningReason = (bg as any).tipping_point || "因為 [競品缺點/情境急迫]，所以選擇 [本產品優勢]。";

              const candidateDimensions = transformDimensions(bg.dimensions, bg.leverage.efficiency, incomeTier, resolvedAge);

              const dimensionScores = Object.values(candidateDimensions).map(d => d.opportunity_score || 0);
              const avgScore = dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length;
              
              let finalEV = Math.round(avgScore * (bg.leverage.efficiency > 1.2 ? 1.1 : 1.0));
              finalEV = Math.min(99, finalEV);

              const sortedDims = Object.values(candidateDimensions).sort((a, b) => b.score - a.score);
              const topPainWithStrategy = sortedDims.find(d => d.micro_tactic && d.micro_tactic.length > 1);
              
              let specificHook = v3Result.best_strategy.headline;
              if (topPainWithStrategy && topPainWithStrategy.micro_tactic) {
                  specificHook = topPainWithStrategy.micro_tactic;
              } else if (bg.leverage.method) {
                  specificHook = bg.leverage.method;
              }

              let winningKey: FrictionDimensionKey = 'value_gap';
              let maxOpScore = -1;
              for (const [key, dim] of Object.entries(candidateDimensions)) {
                  if ((dim.opportunity_score || 0) > maxOpScore) {
                      maxOpScore = dim.opportunity_score || 0;
                      winningKey = key as FrictionDimensionKey;
                  }
              }

              // === PRISM 9.0: TRINITY CORE ===
              let strategicCoordinates: StrategicCoordinates;
              
              if (bg.strategic_coordinates) {
                  const sc = bg.strategic_coordinates;
                  strategicCoordinates = {
                      demand_tension: sc.demand_tension,
                      competitive_lockin: sc.competitive_lockin,
                      entry_feasibility: sc.entry_feasibility,
                      opportunity_volume: Math.round((sc.demand_tension.score * (100 - sc.competitive_lockin.score) * sc.entry_feasibility.score) / 10000)
                  };
              } else {
                  // FALLBACK
                  const tensionScore = Math.min(100, (candidateDimensions.value_gap.score + candidateDimensions.spec_gap.score) / 2 + 10);
                  const lockinScore = Math.min(100, (candidateDimensions.trust_gap.score + candidateDimensions.identity_gap.score + candidateDimensions.context_gap.score) / 3);
                  const feasibilityScore = Math.max(0, 100 - ((candidateDimensions.knowledge_gap.score + candidateDimensions.context_gap.score) / 2));

                  strategicCoordinates = {
                      demand_tension: { score: tensionScore, pain_context: "System Inferred from Gap Analysis" },
                      competitive_lockin: { score: lockinScore, crack_point: "System Inferred from Trust/Habit" },
                      entry_feasibility: { score: feasibilityScore, entry_path: "System Inferred from Complexity" },
                      opportunity_volume: Math.round((tensionScore * (100 - lockinScore) * feasibilityScore) / 10000)
                  };
              }

              return {
                  id: `bg_${Date.now()}_${idx}`,
                  role: bg.name, 
                  age_range: resolvedAge, 
                  income_level: bg.profile,
                  type: type,
                  shadow_id: shadowId,
                  match_reason: `Leverage: ${bg.leverage.method}`,
                  friction_key: winningKey, 
                  dimensions: candidateDimensions, 
                  strategic_coordinates: strategicCoordinates, 
                  decision_unit: bg.veto_check?.holder === 'Org' ? 'Corporate' : bg.veto_check?.holder === 'Household' ? 'Household' : 'Individual',
                  resonance_analysis: {
                      value_layer: bg.id === 'The_Solid' ? 'Functional' : 'Emotional',
                      pain_point: bg.profile,
                      marketing_hook: specificHook, 
                      product_solution: bg.leverage.method,
                      flippability_score: bg.leverage.efficiency,
                      plausibility_score: finalEV, 
                      is_over_interpretation: false,
                      market_audit: {
                          price_gap_description: winningReason, 
                          estimated_real_price: "N/A"
                      },
                      spec_highlight: specHighlight 
                  },
                  observable_signals: [], 
                  source_snapshot: {
                      product_name: input.name,
                      product_price: priceFull,
                      generated_at: Date.now()
                  }
              };
          });

          return {
              diagnosis,
              candidates
          };
      } 
      
      if (!result.diagnosis || !result.diagnosis.dimensions) {
          throw new Error("Diagnosis output missing or malformed");
      }

      const candidatesWithSnapshot = (result.candidates || []).map((c: any, index: number) => ({
          ...c,
          id: c.id || `candidate_auto_${Date.now()}_${index}`,
          shadow_id: c.shadow_id || 'auto',
          source_snapshot: {
              product_name: input.name,
              product_price: priceFull,
              generated_at: Date.now()
          }
      }));

      return {
          diagnosis: result.diagnosis,
          candidates: candidatesWithSnapshot
      };

    }, 2, 3000, "Product Mirror (Prism Engine 8.0)");
  }
}
