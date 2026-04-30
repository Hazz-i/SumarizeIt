import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function POST(req: NextRequest) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutes timeout

    try {
        const body = await req.json()
        const { activeTab, text, topic, pdfBase64, generateTypes, explainLevel, cardCount } = body

        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
        }

        // Build the generation instruction parts
        const parts: string[] = []
        if (generateTypes.includes('Summary')) parts.push('a concise summary (2-3 paragraphs)')
        if (generateTypes.includes('Key Points')) parts.push('5-7 bullet-point key takeaways')
        if (generateTypes.includes('Flashcards')) parts.push(`${cardCount} flashcard Q&A pairs`)

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

        const jsonInstruction = `
        You are Frieren, a helpful and friendly AI study companion.
        Respond ONLY with a valid JSON object. No markdown, no code fences, no preamble — just raw JSON.
        Use ${levelDesc}.
        Generate ONLY the following: ${parts.join(', ')}. Set all other fields to null.
        JSON format (follow exactly):
        {
            ${schemaFields.join(',\n            ')}
        }`
        // Build messages for OpenRouter (OpenAI-compatible format)
        let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>

        if (activeTab === 'pdf' && pdfBase64) {
            userContent = [
                {
                    type: 'image_url',
                    image_url: {
                        url: `data:application/pdf;base64,${pdfBase64}`,
                    },
                },
                {
                    type: 'text',
                    text: `Please analyze the content of this PDF document.\n${jsonInstruction}`,
                },
            ]
        } else {
            const inputText = activeTab === 'topic' ? topic : text
            const isTopicMode = activeTab === 'topic'
            const inputInstruction = isTopicMode
                ? `Generate study material on the topic: "${inputText}"`
                : `Analyze and process the following study material:\n\n${inputText}`

            userContent = `${inputInstruction}\n\n${jsonInstruction}`
        }

        const openRouterBody = {
            model: 'google/gemini-2.0-flash-001',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: userContent,
                },
            ],
        }

        const res = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://summarize-it.app',
                'X-Title': 'sumarizeit',
            },
            body: JSON.stringify(openRouterBody),
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const data = await res.json()

        if (data.error) {
            throw new Error(data.error.message || 'OpenRouter API error')
        }

        // Extract the text from OpenRouter response (OpenAI-compatible format)
        const rawText = data.choices?.[0]?.message?.content || ''

        // Clean up any markdown code fences
        const clean = rawText.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        return NextResponse.json(parsed)
    } catch (err: unknown) {
        clearTimeout(timeoutId)
        console.error('Summarize API error:', err)
        
        if (err instanceof Error && err.name === 'AbortError') {
            return NextResponse.json({ error: 'The request timed out. Please try a smaller file or shorter text.' }, { status: 504 })
        }

        const message = err instanceof Error ? err.message : 'Something went wrong'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
