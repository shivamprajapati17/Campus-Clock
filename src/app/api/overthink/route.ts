import { NextResponse, type NextRequest } from 'next/server';

export interface ThoughtBranch {
  id: string;
  type: 'logical' | 'whatif' | 'catastrophe' | 'delusion';
  title: string;
  description: string;
  level: number;
  probability: string;
  anxietyScore: number; // 0 - 100
  children?: ThoughtBranch[];
}

// Built-in intelligent psychological thought generator
function generateThoughtSpiral(scenario: string, intensity: number = 3) {
  const cleanScenario = scenario.trim();

  // 1. Logical Reality (Turquoise #42D1C3)
  const logicalBranch: ThoughtBranch = {
    id: 'branch-logical',
    type: 'logical',
    title: 'Logical Reality',
    description: `They are simply occupied with an everyday task, driving, phone on silent, or stepped away for dinner.`,
    level: 1,
    probability: '94%',
    anxietyScore: 8,
    children: [
      {
        id: 'branch-logical-sub-1',
        type: 'logical',
        title: 'Battery or Focus Mode',
        description: 'Phone is on Do Not Disturb or charging in another room.',
        level: 2,
        probability: '82%',
        anxietyScore: 5,
      },
      {
        id: 'branch-logical-sub-2',
        type: 'logical',
        title: 'Routine Delay',
        description: 'People communicate at their own pace. A 20-minute gap has zero correlation with relationship health.',
        level: 2,
        probability: '91%',
        anxietyScore: 10,
      },
    ],
  };

  // 2. The 'What If?' Loop (Lavender #A78BFA)
  const whatIfBranch: ThoughtBranch = {
    id: 'branch-whatif',
    type: 'whatif',
    title: "The 'What If?' Loop",
    description: `What if they read it, frowned at the tone, and are currently discussing how awkward you sounded?`,
    level: 1,
    probability: '45%',
    anxietyScore: 55,
    children: [
      {
        id: 'branch-whatif-sub-1',
        type: 'whatif',
        title: 'Micro-Analysis of Punctuation',
        description: 'Did using a period make it seem passive-aggressive? Did omitting the emoji convey cold detachment?',
        level: 2,
        probability: '38%',
        anxietyScore: 62,
        children: intensity > 2 ? [
          {
            id: 'branch-whatif-sub-1-1',
            type: 'whatif',
            title: 'Drafting The Clarification',
            description: 'Typing out "Haha sorry if that came across weird" and deleting it 6 times.',
            level: 3,
            probability: '52%',
            anxietyScore: 70,
          }
        ] : [],
      },
      {
        id: 'branch-whatif-sub-2',
        type: 'whatif',
        title: 'Subtle Social Drift',
        description: 'Remember that conversation from 4 months ago? This is the delayed ripple effect.',
        level: 2,
        probability: '29%',
        anxietyScore: 58,
      },
    ],
  };

  // 3. Worst-Case Catastrophe (Coral #FF6B70)
  const catastropheBranch: ThoughtBranch = {
    id: 'branch-catastrophe',
    type: 'catastrophe',
    title: 'Worst-Case Catastrophe',
    description: `They have permanently formed a negative consensus about you and are actively phasing you out of their circle.`,
    level: 1,
    probability: '11%',
    anxietyScore: 92,
    children: [
      {
        id: 'branch-catastrophe-sub-1',
        type: 'catastrophe',
        title: 'The Screenshot & Group Chat Trial',
        description: 'Your message has been screenshot and forwarded to a secret group chat titled "Can you believe this".',
        level: 2,
        probability: '7%',
        anxietyScore: 96,
        children: intensity > 1 ? [
          {
            id: 'branch-catastrophe-sub-1-1',
            type: 'catastrophe',
            title: 'Irrevocable Reputational Collapse',
            description: 'Mutual acquaintances will now maintain polite distance at future events.',
            level: 3,
            probability: '3%',
            anxietyScore: 99,
          }
        ] : [],
      },
      {
        id: 'branch-catastrophe-sub-2',
        type: 'catastrophe',
        title: 'Sudden Catastrophic Incident',
        description: 'Or worse: they were in an emergency accident the exact second you pressed send.',
        level: 2,
        probability: '2%',
        anxietyScore: 94,
      },
    ],
  };

  // 4. The 3:00 AM Delusion (Slightly Translucent / Surreal)
  const delusionBranch: ThoughtBranch = {
    id: 'branch-delusion',
    type: 'delusion',
    title: 'The 3:00 AM Delusion',
    description: `Time to fake your own disappearance, move to an isolated lighthouse in the Baltic Sea, and adopt 3 goats.`,
    level: 1,
    probability: '1.2%',
    anxietyScore: 78,
    children: [
      {
        id: 'branch-delusion-sub-1',
        type: 'delusion',
        title: 'Complete Identity Reboot',
        description: 'Delete LinkedIn, throw phone into a canal, change legal name to Bartholomew Sterling.',
        level: 2,
        probability: '0.8%',
        anxietyScore: 74,
      },
      {
        id: 'branch-delusion-sub-2',
        type: 'delusion',
        title: 'Cosmic Simulation Hypothesis',
        description: 'The universe was coded specifically to test how long you can stare at three pulsating gray typing dots.',
        level: 2,
        probability: '0.1%',
        anxietyScore: 85,
      },
    ],
  };

  return {
    scenario: cleanScenario,
    timestamp: new Date().toISOString(),
    intensity,
    branches: [logicalBranch, whatIfBranch, catastropheBranch, delusionBranch],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, intensity } = body;

    if (!scenario || typeof scenario !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Scenario prompt is required' },
        { status: 400 }
      );
    }

    const result = generateThoughtSpiral(scenario, intensity || 3);

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Engine calculation failed',
      },
      { status: 500 }
    );
  }
}

