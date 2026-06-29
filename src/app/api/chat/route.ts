import { NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'

// Simple in-memory rate limiter for the chat endpoint
const chatRateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // 10 requests per minute

function isChatRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = chatRateLimitMap.get(ip) || []
  
  // Filter out timestamps older than the window
  const recentTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)
  
  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  recentTimestamps.push(now)
  chatRateLimitMap.set(ip, recentTimestamps)
  return false
}

// Zod schema for request validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string().min(1)
    })
  ).optional()
})

// Detailed System Instruction for Gemini
const SYSTEM_INSTRUCTION = `You are the Ligao City Emergency Virtual Assistant, an official digital sentinel for Ligao City, Albay, Philippines.
Your sole purpose is to provide calm, clear, and highly structured advice during emergencies, natural disasters, or accidents.

CRITICAL SAFETY RULE:
If a situation sounds life-threatening (e.g., severe injury, active large fire, arterial bleeding, entrapment, collapse), you MUST flag it. 
- If they are reporting the incident, use the **draftEmergencyReport** tool and set "isLifeThreatening" to true.
- If they are just asking a general question, start your response with the bold warning: 
  "🚨 **EMERGENCY WARNING:** This sounds like a critical emergency. Please click the red **Quick Dial** button to call CDRRMO at **(052) 481-0012** or dial **911** immediately. Do not wait for this chat."

SCOPE OF CAPABILITIES & KNOWLEDGE:
1. **First Aid Instructions**: Provide standard, safe first-aid guidelines.
   - For CPR: Give clear step-by-step (Push hard and fast in the center of the chest, 100-120 compressions per minute).
   - For Bleeding: Emphasize direct pressure with a clean cloth, elevate if possible.
   - For Burns: Cool the burn with running water for 10-20 minutes, do not pop blisters, do not apply ice.
   - For Choking: Explain the Heimlich maneuver (5 back blows, 5 abdominal thrusts).
2. **Disaster Protocols (Ligao City Context)**:
   - **Typhoons/Floods**: Frequent in Albay. Advise moving to higher ground, securing loose outdoor items, preparing a GO BAG (water, food, flashlight, radio, meds). Evacuate before waters rise.
   - **Volcanic Eruptions (Mayon)**: Ligao is near Mayon. Advise staying indoors, closing windows/doors, using N95 masks or damp cloths for ashfall. Protect pets and livestock.
   - **Earthquakes**: "Drop, Cover, and Hold On." Stay away from glass/windows. If outdoors, move to an open area away from buildings and power lines (ALECO/APEC wires).
   - **Fires**: Evacuate immediately. Stay low to avoid smoke. Feel doors with the back of your hand before opening. Do not use elevators. Call BFP Ligao.
3. **Emergency Reporting (CRITICAL)**:
   - If a citizen states they want to report an emergency or asks for help (e.g., "there's a crash", "I need to report a flood", "tulong may natumbahan"), you MUST use the **draftEmergencyReport** tool.
   - Extract the category (Flood, Fire, Crash, Medical, Dangling Wire, Other), summarize the description, and identify the barangay if mentioned.
   - If they didn't mention their location, use the tool anyway with an empty barangay; the UI will prompt them to use their GPS.
   - DO NOT just reply with text if you can use the reporting tool instead.
4. **Local Info (Ligao City)**:
   - Ligao consists of 55 barangays (e.g., Tuburan, Binatagan, Cavasi, Guilid, Layon, Pandan, Tinago, Paulog, Bonga, Dunao, Nabonton, etc.).
   - If they report an incident here, ask them to clarify which barangay they are in and specific landmarks (e.g., near the Ligao City Hall, public market, or specific schools).

RESPONSE FORMAT RULES (STRICT):
- Keep answers brief, direct, and scannable. People in emergencies cannot read long paragraphs.
- Use bullet points (start lines with "-" or "*") for sequential, actionable steps.
- Use **bold** text to emphasize crucial actions, phone numbers, or warnings.
- Avoid using overly complex markdown or special characters that might not render well.
- Maintain a calm, reassuring, empathetic, yet highly authoritative tone. Do not use emojis except for the emergency siren 🚨 in warnings.
- NEVER give medical diagnoses, and NEVER recommend prescription drugs.
- If asked about non-emergency topics, politely decline: "I am the BayaniLink Emergency Assistant. I can only assist with emergency first aid, disaster preparation, and app support."`

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown-ip'
    
    if (isChatRateLimited(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please slow down and try again shortly.' 
        }, 
        { status: 429 }
      )
    }

    // 2. Body Parsing and Validation
    const body = await req.json()
    const validationResult = chatRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.issues[0].message 
        }, 
        { status: 400 }
      )
    }

    const { message, history = [] } = validationResult.data
    const apiKey = process.env.GEMINI_API_KEY

    // 3. Graceful Standby Mode if GEMINI_API_KEY is not configured
    if (!apiKey || apiKey.trim() === '') {
      console.warn('GEMINI_API_KEY is not configured. Returning fallback emergency advice.')
      return NextResponse.json({
        success: true,
        response: `🚨 **OFFLINE STANDBY MODE:** The AI Assistant is currently operating in local standby mode.

If this is an emergency, please use the red **Quick Dial** button in the bottom-right corner to contact the **Ligao City CDRRMO** at **(052) 481-0012** or dial **911** immediately.

**Basic Emergency Advice:**
- **Flood/Storm:** Move to higher ground; keep emergency supplies ready.
- **Fire:** Evacuate immediately; do not use elevators; call BFP at **(052) 481-0624**.
- **First Aid:** Keep the patient warm and still. Press firmly on any bleeding wounds with a clean cloth.`
      })
    }

    // 4. Map Chat History to Gemini API Structure
    // Roles in Gemini API must be 'user' or 'model'
    const contents = history.map((item) => ({
      role: item.role,
      parts: [{ text: item.text }]
    }))

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // 5. Query Gemini 2.5 Flash API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: "draftEmergencyReport",
                description: "Extract details to draft an emergency report when a user asks to report an incident.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    category: {
                      type: "STRING",
                      description: "The category of the incident. Must be one of: 'Flood', 'Fire', 'Crash', 'Dangling Wire', 'Medical', or 'Other'."
                    },
                    description: {
                      type: "STRING",
                      description: "A clear, concise summary of the emergency event."
                    },
                    barangay: {
                      type: "STRING",
                      description: "The Ligao City barangay where the incident occurred, if the user explicitly mentioned it. Otherwise, leave empty."
                    },
                    isLifeThreatening: {
                      type: "BOOLEAN",
                      description: "True if the situation sounds immediately life-threatening (e.g., severe injury, entrapment, active fire)."
                    }
                  },
                  required: ["category", "description", "isLifeThreatening"]
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Keep responses factual and consistent
          maxOutputTokens: 1000,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API request failed:', errorText)
      throw new Error(`Gemini API returned status ${response.status}`)
    }

    const resData = await response.json()
    
    const part = resData.candidates?.[0]?.content?.parts?.[0]
    
    // 6. Handle Function Call
    if (part?.functionCall) {
      const args = part.functionCall.args
      let responseText = "I have prepared a draft report based on your details. Please review and submit it below."
      
      if (args.isLifeThreatening) {
        responseText = "🚨 **EMERGENCY WARNING:** This sounds like a critical emergency. Please click the red **Quick Dial** button to call CDRRMO at **(052) 481-0012** or dial **911** immediately.\n\nI have also prepared a draft report for you to submit to the response team:"
      }

      return NextResponse.json({
        success: true,
        type: 'function_call',
        functionName: part.functionCall.name,
        functionArgs: args,
        response: responseText
      })
    }
    
    // Extract answer text from Gemini response structure
    const aiText = part?.text
    
    if (!aiText) {
      console.error('Unexpected Gemini API response structure:', JSON.stringify(resData))
      throw new Error('Could not extract text from Gemini response')
    }

    return NextResponse.json({
      success: true,
      response: aiText
    })

  } catch (error: any) {
    console.error('Chat endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'We are currently experiencing connectivity issues with the AI system. For immediate assistance, please use the Quick Dial button or dial 911.' 
      }, 
      { status: 500 }
    )
  }
}
