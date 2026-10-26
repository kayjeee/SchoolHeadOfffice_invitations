// components/student/AiHelper/AiHomeworkHelperTab.tsx
import React, { useState } from 'react';

interface AiMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  hints?: string[];
  stepByStepProcess?: string[];
}

const EXAMPLE_PROMPTS = [
  'How do I solve quadratic equations using the quadratic formula?',
  'Explain Newton\'s Second Law of Motion with an everyday example.',
  'What are the key themes in Hamlet Act 3 Scene 1?',
  'Help me understand how cellular respiration produces ATP.'
];

export default function AiHomeworkHelperTab() {
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('Grade 10');
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      content: 'Hello! I am your AI Homework Helper. Ask me a question about any subject, and I will guide you through step-by-step process explanations without just giving away answers.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || promptInput;
    if (!text.trim()) return;

    const userMsg: AiMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setPromptInput('');
    setIsGenerating(true);

    // Simulated Guided Explanation AI Response
    setTimeout(() => {
      let aiResponseText = `Here is a guided explanation for your ${subject} question:\n\nTo understand this concept, let's break it down into manageable steps:`;
      let hintsList: string[] = [];
      let stepsList: string[] = [];

      if (subject === 'Mathematics' || text.toLowerCase().includes('equation') || text.toLowerCase().includes('quadratic')) {
        aiResponseText = `Great algebra question! Here is how we break down solving quadratic equations ($ax^2 + bx + c = 0$):`;
        stepsList = [
          'Step 1: Identify your coefficients $a$, $b$, and $c$.',
          'Step 2: Write down the quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.',
          'Step 3: Calculate the discriminant ($b^2 - 4ac$) first to check how many real solutions exist.',
          'Step 4: Substitute $a, b, c$ into the equation and solve for both positive and negative roots.'
        ];
        hintsList = [
          'Hint: If the discriminant $b^2 - 4ac > 0$, you will have two distinct real roots.',
          'Hint: Make sure all terms are moved to one side so the right-hand side equals 0 before identifying $a, b, c$.'
        ];
      } else if (subject === 'Physical Sciences' || text.toLowerCase().includes('newton') || text.toLowerCase().includes('motion')) {
        aiResponseText = `Let's analyze Newton's Second Law of Motion ($F_{net} = ma$):`;
        stepsList = [
          'Step 1: Understand that net force ($F_{net}$) is directly proportional to acceleration ($a$).',
          'Step 2: Acceleration is inversely proportional to mass ($m$). A heavier object requires more force to accelerate at the same rate.',
          'Step 3: Always draw a free-body diagram identifying all forces acting on the object before setting up $F_{net} = ma$.'
        ];
        hintsList = [
          'Hint: Ensure mass is converted to kilograms (kg) and force is in Newtons (N).'
        ];
      } else {
        stepsList = [
          'Step 1: Define key terminology associated with this topic.',
          'Step 2: Identify core principles or main cause-and-effect relationships.',
          'Step 3: Summarize the main takeaway in your own words to verify your understanding.'
        ];
      }

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hints: hintsList,
        stepByStepProcess: stepsList
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-purple-500/30 text-purple-200 text-xs font-semibold rounded-full mb-2">
            Guided AI Study Companion
          </span>
          <h2 className="text-xl font-bold">AI Homework & Concept Helper</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            Get step-by-step problem explanations, hints, and practice questions tailored to CAPS curriculum standards.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPracticeMode(!practiceMode)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              practiceMode ? 'bg-amber-400 text-gray-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {practiceMode ? '⭐ Practice Mode Active' : 'Enable Practice Mode'}
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <label className="font-semibold text-gray-700">Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg border border-gray-300 p-1.5 focus:ring-purple-500"
          >
            <option>Mathematics</option>
            <option>Physical Sciences</option>
            <option>Life Sciences</option>
            <option>English Home Language</option>
            <option>Geography</option>
            <option>Accounting</option>
          </select>

          <label className="font-semibold text-gray-700 ml-2">Grade Level:</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="rounded-lg border border-gray-300 p-1.5 focus:ring-purple-500"
          >
            <option>Grade 8</option>
            <option>Grade 9</option>
            <option>Grade 10</option>
            <option>Grade 11</option>
            <option>Grade 12</option>
          </select>
        </div>

        <span className="text-gray-400 text-[11px]">💡 Mode: Guided Problem Solving</span>
      </div>

      {/* EXAMPLE PROMPTS */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-500 block">Suggested Example Prompts:</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl transition text-left"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT INTERFACE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 mb-1">
                  <span className="font-bold">{msg.sender === 'user' ? 'You' : '🤖 AI Homework Helper'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-line">{msg.content}</p>

                {msg.stepByStepProcess && msg.stepByStepProcess.length > 0 && (
                  <div className="bg-white/80 p-3 rounded-xl border border-gray-200 text-gray-800 space-y-1 mt-2">
                    <span className="font-bold block text-purple-900">Step-by-Step Breakdown:</span>
                    {msg.stepByStepProcess.map((step, idx) => (
                      <p key={idx} className="text-[11px] font-medium">{step}</p>
                    ))}
                  </div>
                )}

                {msg.hints && msg.hints.length > 0 && (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 space-y-1 mt-2">
                    {msg.hints.map((hint, idx) => (
                      <p key={idx} className="text-[11px]">{hint}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center space-x-2 text-xs text-purple-700 bg-purple-50 p-3 rounded-xl w-fit">
              <span className="animate-spin">⏳</span>
              <span>AI Helper is analyzing your question...</span>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={`Ask a question about ${subject} (${grade})...`}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim()}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
            >
              Send Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
