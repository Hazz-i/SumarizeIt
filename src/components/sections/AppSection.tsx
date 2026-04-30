'use client'

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { FileText, Hash, Upload, Sparkles, AlignLeft, CreditCard, Zap, X, ChevronDown, Loader2 } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Tab = 'paste' | 'topic' | 'pdf'
type GenerateType = 'Summary' | 'Key Points' | 'Flashcards'
type ExplainLevel = 'Beginner' | 'Intermediate' | 'Advanced'
type CardCount = 3 | 5 | 8 | 10

interface Flashcard { q: string; a: string }
interface ResultData {
    summary: string | null
    keypoints: string[] | null
    flashcards: Flashcard[] | null
    topic: string
}

export default function AppSection() {
    const [activeTab, setActiveTab] = useState<Tab>('paste')
    const [text, setText] = useState('')
    const [topic, setTopic] = useState('')
    const [generateTypes, setGenerateTypes] = useState<GenerateType[]>(['Summary'])
    const [explainLevel, setExplainLevel] = useState<ExplainLevel>('Beginner')
    const [cardCount, setCardCount] = useState<CardCount>(5)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ResultData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [frierenMsg, setFrierenMsg] = useState("Ready to study! Paste your material and I'll get to work.")

    // PDF state
    const [pdfBase64, setPdfBase64] = useState<string | null>(null)
    const [pdfFileName, setPdfFileName] = useState('')
    const [pdfFileSize, setPdfFileSize] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Flashcard open state
    const [openCards, setOpenCards] = useState<Set<number>>(new Set())

    const charCount = text.length
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

    // ScrollTrigger refs
    const sectionRef = useRef<HTMLElement>(null)
    const introTextRef = useRef<HTMLDivElement>(null)
    const introMascotRef = useRef<HTMLDivElement>(null)
    const tabBarRef = useRef<HTMLDivElement>(null)
    const mainPanelRef = useRef<HTMLDivElement>(null)
    const resultAreaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Intro text: fade up
            if (introTextRef.current) {
                gsap.fromTo(introTextRef.current,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
                      scrollTrigger: { trigger: introTextRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
                )
            }

            // Intro mascot: fade in from right
            if (introMascotRef.current) {
                gsap.fromTo(introMascotRef.current,
                    { opacity: 0, x: 40 },
                    { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
                      scrollTrigger: { trigger: introMascotRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
                )
            }

            // Tab bar: fade up
            if (tabBarRef.current) {
                gsap.fromTo(tabBarRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
                      scrollTrigger: { trigger: tabBarRef.current, start: 'top 90%', toggleActions: 'play none none reverse' } }
                )
            }

            // Main panel: staggered fade up for children
            if (mainPanelRef.current) {
                const children = mainPanelRef.current.children
                gsap.fromTo(children,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
                      scrollTrigger: { trigger: mainPanelRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
                )
            }

            // Result area: fade up
            if (resultAreaRef.current) {
                gsap.fromTo(resultAreaRef.current,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
                      scrollTrigger: { trigger: resultAreaRef.current, start: 'top 90%', toggleActions: 'play none none reverse' } }
                )
            }
        }, sectionRef)

        return () => ctx.revert()
    }, [result, isLoading])

    const toggleGenerate = (type: GenerateType) => {
        setGenerateTypes(prev =>
            prev.includes(type)
                ? prev.length > 1 ? prev.filter(t => t !== type) : prev
                : [...prev, type]
        )
    }

    const toggleCard = (i: number) => {
        setOpenCards(prev => {
            const next = new Set(prev)
            if (next.has(i)) next.delete(i)
            else next.add(i)
            return next
        })
    }

    // PDF Handling
    const loadPdf = (file: File) => {
        if (file.size > 32 * 1024 * 1024) {
            setFrierenMsg('This PDF is over 32 MB — try a smaller file!')
            return
        }
        setPdfFileName(file.name)
        setPdfFileSize(file.size)
        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            setPdfBase64(dataUrl.split(',')[1])
            setFrierenMsg(`Got it! "${file.name}" is ready. Hit the button and I'll read it!`)
        }
        reader.readAsDataURL(file)
    }

    const removePdf = () => {
        setPdfBase64(null)
        setPdfFileName('')
        setPdfFileSize(0)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setFrierenMsg("PDF removed. Drop a new one whenever you're ready!")
    }

    const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const onDragLeave = () => setIsDragging(false)
    const onDrop = (e: DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type === 'application/pdf') loadPdf(file)
        else setFrierenMsg("Hmm, that doesn't look like a PDF. Try again!")
    }
    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) loadPdf(file)
    }

    // Generate via API
    const handleSummarize = async () => {
        if (activeTab === 'pdf' && !pdfBase64) {
            setFrierenMsg('Please upload a PDF file first! 📄'); return
        }
        if (activeTab === 'paste' && !text.trim()) {
            setFrierenMsg('Oops! Please paste some text first. 📝'); return
        }
        if (activeTab === 'topic' && !topic.trim()) {
            setFrierenMsg('Oops! Please enter a topic first. 📝'); return
        }

        setIsLoading(true)
        setError(null)
        setResult(null)
        setOpenCards(new Set())
        setFrierenMsg(activeTab === 'pdf' ? 'Reading through your PDF... this might take a moment!' : 'Hmm, let me read this carefully...')

        try {
            const res = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTab, text, topic, pdfBase64, generateTypes, explainLevel, cardCount,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setResult(data)
            setFrierenMsg('All done! Here are your study materials. Good luck!')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong'
            setError(message)
            setFrierenMsg('Hmm, something went wrong. Could you try again?')
        }
        setIsLoading(false)
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'paste', label: 'Paste Text', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'topic', label: 'By Topic', icon: <Hash className="w-3.5 h-3.5" /> },
        { id: 'pdf', label: 'Upload PDF', icon: <Upload className="w-3.5 h-3.5" /> },
    ]
    const generateOptions: GenerateType[] = ['Summary', 'Key Points', 'Flashcards']
    const levelOptions: ExplainLevel[] = ['Beginner', 'Intermediate', 'Advanced']
    const countOptions: CardCount[] = [3, 5, 8, 10]

    return (
        <section ref={sectionRef} className="bg-[#faf6f1] py-10 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
            <div className="max-w-6xl mx-auto">
                {/* Top: intro text + mascot */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 mb-10 sm:mb-14">
                    <div ref={introTextRef} className="flex-1 lg:pt-10">
                        <div className="lg:hidden flex justify-end mb-6">
                            <div className="relative bg-white border border-stone-200 rounded-lg px-4 py-3 shadow-md max-w-[220px]">
                                <p className="text-stone-700 text-sm italic leading-snug">
                                    &quot;Hi! I&apos;m Frieren. Paste your notes and I&apos;ll help you study smarter, not harder! ✨&quot;
                                </p>
                            </div>
                        </div>
                        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-stone-500 mb-4">Your AI Study Companion</p>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-4 sm:mb-5">
                            Turn any text into{' '}<span className="text-emerald-600 italic">instant summaries</span>{' '}&amp; key insights.
                        </h2>
                        <p className="text-stone-500 text-sm sm:text-base leading-relaxed max-w-md">
                            Paste your study material, enter a topic, or{' '}
                            upload a PDF{' '}
                            and Frieren will transform it into structured summaries and study-ready flashcards.
                        </p>
                    </div>
                    <div ref={introMascotRef} className="relative flex flex-col items-center gap-3">
                        <div className="hidden lg:block relative bg-white border border-stone-200 rounded-lg px-5 py-3.5 shadow-md">
                            <p className="text-stone-700 text-sm italic leading-snug">
                                &quot;Hi! I&apos;m Frieren. Paste your notes<br />and I&apos;ll help you study smarter, not harder! ✨&quot;
                            </p>
                            <span className="absolute -bottom-2 right-5 w-3 h-3 bg-white border-r border-b border-stone-200 rotate-45" />
                        </div>
                        <div className="relative w-52 h-52 lg:w-64 lg:h-64">
                            <Image src="/images/mascot-main.jpeg" alt="Frieren — AI Study Companion" fill className="rounded-lg object-contain drop-shadow-xl" />
                        </div>
                        <p className="text-xs tracking-[0.15em] uppercase text-stone-400 font-medium">Frieren — Spirit Guide</p>
                    </div>
                </div>

                {/* Tab bar */}
                <div ref={tabBarRef} className="flex items-center gap-1 mb-5 sm:mb-6 bg-white border border-stone-200 rounded-lg p-1 w-full sm:w-fit shadow-sm overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'}`}>
                            {tab.icon}<span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ').pop()}</span>
                        </button>
                    ))}
                </div>

                {/* Main panel */}
                <div ref={mainPanelRef} className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-5">
                    {/* Left: Input area */}
                    <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
                            <span className="text-xs font-semibold tracking-[0.12em] uppercase text-stone-400">
                                {activeTab === 'paste' ? 'Study Material' : activeTab === 'topic' ? 'Your Topic' : 'Upload PDF'}
                            </span>
                            {activeTab === 'paste' && <span className="text-xs text-stone-400">{wordCount} words · {charCount} chars</span>}
                        </div>

                        {activeTab === 'paste' && (
                            <div className="flex flex-col flex-1">
                                <textarea value={text} onChange={e => setText(e.target.value)}
                                    placeholder="Paste your lecture notes, article, textbook paragraph, or any study material here..."
                                    className="w-full flex-1 px-5 py-4 text-sm text-stone-700 placeholder:text-stone-300 resize-none outline-none bg-transparent leading-relaxed" />
                                <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50/50 mt-auto">
                                    {wordCount > 0 && wordCount < 10 ? (
                                        <span className="text-xs text-red-500 font-medium">Minimum 10 words required ({wordCount}/10)</span>
                                    ) : (
                                        <span className="text-xs text-stone-400 italic">Tip: Works best with 100 - 3000 words</span>
                                    )}
                                    <button onClick={() => setText('')} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Clear</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'topic' && (
                            <div className="px-5 py-6">
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. Photosynthesis, World War II, Machine Learning..."
                                    className="w-full text-sm text-stone-700 placeholder:text-stone-300 outline-none leading-relaxed bg-transparent" />
                                <p className="mt-4 text-xs text-stone-400 italic">Enter a topic and Frieren will summarize and create flashcards about it.</p>
                            </div>
                        )}

                        {activeTab === 'pdf' && !pdfBase64 && (
                            <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                className={`flex flex-col items-center justify-center flex-1 gap-3 text-stone-400 transition-colors ${isDragging ? 'bg-emerald-50 border-emerald-300' : ''}`}>
                                <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium text-stone-500">Drop your PDF here</p>
                                <label className="text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer underline underline-offset-2 transition-colors">
                                    or browse files
                                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={onFileSelected} />
                                </label>
                                <p className="text-xs text-stone-300">Max 32MB · PDF only</p>
                            </div>
                        )}

                        {activeTab === 'pdf' && pdfBase64 && (
                            <div className="flex items-center gap-4 px-5 py-6">
                                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-stone-700 truncate">{pdfFileName}</p>
                                    <p className="text-xs text-stone-400">{(pdfFileSize / (1024 * 1024)).toFixed(2)} MB · PDF document</p>
                                </div>
                                <button onClick={removePdf} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Settings panel */}
                    <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5 flex flex-col gap-5">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-stone-400 mb-3">What to Generate</p>
                            <div className="flex flex-wrap gap-2">
                                {generateOptions.map(opt => (
                                    <button key={opt} onClick={() => toggleGenerate(opt)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${generateTypes.includes(opt) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
                                        {opt === 'Summary' && <AlignLeft className="w-3 h-3" />}
                                        {opt === 'Key Points' && <Sparkles className="w-3 h-3" />}
                                        {opt === 'Flashcards' && <CreditCard className="w-3 h-3" />}
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-stone-400 mb-3">Explanation Level</p>
                            <div className="flex flex-wrap gap-2">
                                {levelOptions.map(lvl => (
                                    <button key={lvl} onClick={() => setExplainLevel(lvl)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${explainLevel === lvl ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {generateTypes.includes('Flashcards') && (
                            <div>
                                <p className="text-xs font-semibold tracking-[0.12em] uppercase text-stone-400 mb-3">Flashcard Count</p>
                                <div className="flex gap-2">
                                    {countOptions.map(n => (
                                        <button key={n} onClick={() => setCardCount(n)}
                                            className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-all duration-200 ${cardCount === n ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-stone-50 rounded-lg px-4 py-1 mt-auto">
                            <div className="relative w-8 h-8 shrink-0 rounded-sm overflow-hidden">
                                <Image src="/images/mascot-sub-main.jpeg" alt="Frieren" fill className="object-contain" />
                            </div>
                            <p className="text-xs text-stone-500 leading-snug">{frierenMsg}</p>
                        </div>
                        <button onClick={handleSummarize}
                            disabled={isLoading || (activeTab === 'paste' && (wordCount < 10 || !text.trim())) || (activeTab === 'topic' && !topic.trim()) || (activeTab === 'pdf' && !pdfBase64)}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : ''}
                            {isLoading ? 'Frieren is thinking...' : 'Ask Frieren to Summarize'}
                        </button>
                    </div>
                </div>

                {/* Result area */}
                <div ref={resultAreaRef} className="mt-5">
                    {isLoading && (
                        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-12 flex flex-col items-center gap-4">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-lg animate-bounce [animation-delay:0ms]" />
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-lg animate-bounce [animation-delay:150ms]" />
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-lg animate-bounce [animation-delay:300ms]" />
                            </div>
                            <p className="text-sm text-stone-500">Frieren is reading your material...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-white border border-red-200 rounded-lg shadow-sm p-8 text-center">
                            <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                            <p className="text-xs text-stone-400 mt-1">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && result && (
                        <div className="space-y-5">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900">{result.topic}</h3>
                                    <p className="text-xs text-stone-400 mt-1">Generated at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{activeTab === 'pdf' ? ' · from PDF' : ''}</p>
                                </div>
                            </div>

                            <div className={`grid ${generateTypes.length > 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-5`}>
                                {/* Summary */}
                                {generateTypes.includes('Summary') && result.summary && (
                                    <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
                                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-100">
                                            <span className="w-8 h-8 rounded-lg bg-amber-100 overflow-hidden flex items-center justify-center text-base"><Image src={'/icons/book.jpg'} alt="Summary" width={32} height={32} className="w-full h-full object-cover" /></span>
                                            <h4 className="font-semibold text-stone-800 text-sm">Summary</h4>
                                        </div>
                                        <div className="px-5 py-4">
                                            <p className="text-sm text-stone-600 leading-relaxed">{result.summary}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Key Points */}
                                {generateTypes.includes('Key Points') && result.keypoints && result.keypoints.length > 0 && (
                                    <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
                                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-100">
                                            <span className="w-8 h-8 rounded-lg bg-amber-100 overflow-hidden flex items-center justify-center text-base"><Image src={'/icons/lamp.jpg'} alt="Summary" width={32} height={32} className="w-full h-full object-cover" /></span>
                                            <h4 className="font-semibold text-stone-800 text-sm">Key Points</h4>
                                        </div>
                                        <div className="px-5 py-4">
                                            <ul className="space-y-2.5">
                                                {result.keypoints.map((point, i) => (
                                                    <li key={i} className="flex gap-2.5 text-sm text-stone-600">
                                                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                                        <span className="leading-relaxed">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Flashcards */}
                            {generateTypes.includes('Flashcards') && result.flashcards && result.flashcards.length > 0 && (
                                <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-100">
                                        <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-base">🃏</span>
                                        <h4 className="font-semibold text-stone-800 text-sm">Flashcards</h4>
                                    </div>
                                    <div className="divide-y divide-stone-100">
                                        {result.flashcards.map((fc, i) => (
                                            <button key={i} onClick={() => toggleCard(i)} className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="text-sm font-medium text-stone-700">{fc.q}</p>
                                                    <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 mt-0.5 transition-transform ${openCards.has(i) ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openCards.has(i) && (
                                                    <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{fc.a}</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && !error && !result && (
                        <div className="bg-white border border-stone-200 rounded-lg shadow-sm min-h-32 flex flex-col items-center justify-center gap-3 p-8 text-center">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                                <AlignLeft className="w-4 h-4 text-stone-400" />
                            </div>
                            <p className="text-sm text-stone-400">Your summary, key points, and flashcards will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
