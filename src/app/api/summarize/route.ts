import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 59000)
    try {
        const body = await req.json()
        const { activeTab, text, topic, pdfBase64, generateTypes, explainLevel, cardCount } = body

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        // Build the generation instruction parts
        const genParts: string[] = []
        if (generateTypes.includes('Summary')) genParts.push('a concise summary (2-3 paragraphs)')
        if (generateTypes.includes('Key Points')) genParts.push('5-7 bullet-point key takeaways')
        if (generateTypes.includes('Flashcards')) genParts.push(`${cardCount} flashcard Q&A pairs`)

        const levelDesc =
            explainLevel === 'Beginner'
                ? 'simple language for beginners, avoid jargon'
                : explainLevel === 'Intermediate'
                    ? 'moderate detail suitable for high school / college students'
                    : 'detailed and technical, suitable for advanced learners'

        // Build dynamic JSON schema based on selected types
        const schemaFields: string[] = ['"topic": "short title describing this material"']
        if (generateTypes.includes('Summary')) schemaFields.unshift('"summary": "concise summary text here"')
        else schemaFields.unshift('"summary": null')
        if (generateTypes.includes('Key Points')) schemaFields.splice(-1, 0, '"keypoints": ["point 1", "point 2", ...]')
        else schemaFields.splice(-1, 0, '"keypoints": null')
        if (generateTypes.includes('Flashcards')) schemaFields.splice(-1, 0, `"flashcards": [{"q": "question", "a": "answer"}]`)
        else schemaFields.splice(-1, 0, '"flashcards": null')

        const jsonInstruction = `You are Frieren, a helpful and friendly AI study companion.
                                Respond ONLY with a valid JSON object. No markdown, no code fences, no preamble — just raw JSON.
                                Use ${levelDesc}.
                                Generate ONLY the following: ${genParts.join(', ')}. Set all other fields to null.
                                JSON format (follow exactly):
                                {
                                    ${schemaFields.join(',\n    ')}
                                }`

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: jsonInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
            }
        })

        // Build messages for Gemini
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contentParts: any[] = []

        if (activeTab === 'pdf' && pdfBase64) {
            contentParts.push({
                inlineData: {
                    data: pdfBase64,
                    mimeType: 'application/pdf'
                }
            })
            contentParts.push({ text: 'Please analyze the content of this PDF document.' })
        } else {
            const inputText = activeTab === 'topic' ? topic : text
            const isTopicMode = activeTab === 'topic'
            const inputInstruction = isTopicMode
                ? `Generate study material on the topic: "${inputText}"`
                : `Analyze and process the following study material:\n\n${inputText}`

            contentParts.push({ text: inputInstruction })
        }

        // Call Gemini
        const result = await model.generateContent(
            { contents: [{ role: 'user', parts: contentParts }] },
            { signal: controller.signal }
        )

        clearTimeout(timeoutId)

        const rawText = result.response.text()

        // Clean up any markdown code fences (even though we asked for raw JSON, Gemini sometimes adds them)
        const clean = rawText.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        return NextResponse.json(parsed)
    } catch (err: unknown) {
        clearTimeout(timeoutId)
        console.error('Summarize API error:', err)
        
        const message = err instanceof Error ? err.message : 'Something went wrong'
        
        if ((err instanceof Error && err.name === 'AbortError') || message.toLowerCase().includes('aborted')) {
            return NextResponse.json({ error: 'The request timed out. Please try a smaller file or shorter text.' }, { status: 504 })
        }

        return NextResponse.json({ error: message }, { status: 500 })
    }
}
