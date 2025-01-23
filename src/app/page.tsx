'use client'

import React, {useState} from 'react';
import {Menu, Send, Settings} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import ChatSideBar from "@/components/chat/chat-side-bar";

const ConsultingModes = [
    {
        id: 'functional',
        name: 'Functional Medicine',
        description: 'Holistic approach',
        systemPrompt: 'You are a functional medicine practitioner focusing on root causes of health issues. Analyze patient data comprehensively.'
    },
    {
        id: 'orthopedic',
        name: 'Orthopedic Specialist',
        description: 'Musculoskeletal expert',
        systemPrompt: 'You are an orthopedic specialist. Focus on musculoskeletal conditions, joint issues, and physical symptoms.'
    },
    {
        id: 'rootcause',
        name: 'Root Cause Analysis',
        description: 'Comprehensive analysis',
        systemPrompt: 'You are a medical expert specializing in root cause analysis. Identify underlying factors and connections between symptoms.'
    },
];

export default function Page() {
    const [currentConversation, setCurrentConversation] = useState(1);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [settings, setSettings] = useState({model: 'gpt4', apiKey: ''});
    const [selectedMode, setSelectedMode] = useState(ConsultingModes[0].id);
    const [systemPrompt, setSystemPrompt] = useState(ConsultingModes[0].systemPrompt);
    const [sources, setSources] = useState([]);
    const [isSourceManagerOpen, setIsSourceManagerOpen] = useState(false);
    const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const Message = ({message}) => (
        <div className={`flex gap-2 ${message.role === 'assistant' ? 'bg-gray-50' : ''} p-2 rounded`}>
            {message.role === 'assistant' && (
                <div className="shrink-0 mt-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="#0066FF"/>
                        <path d="M7 12H17M17 12L13 8M17 12L13 16" stroke="white" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </div>
            )}
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    );


    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        setMessages([
            ...messages,
            {role: 'user', content: inputText},
            {role: 'assistant', content: `Analyzing as ${ConsultingModes.find(m => m.id === selectedMode).name}...`}
        ]);
        setInputText('');
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-white border-b h-14 flex items-center px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}>
                        <Menu className="w-4 h-4"/>
                    </Button>
                    <h1 className="text-lg font-semibold">OpenHealth</h1>
                </div>
                <div className="flex-1"/>
                <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}>
                    <Settings className="w-4 h-4"/>
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <ChatSideBar/>

                <div className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {messages.map((message, index) => (
                            <Message key={index} message={message}/>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button onClick={handleSendMessage}>
                                <Send className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={`border-l bg-gray-50 flex flex-col transition-all duration-300 ease-in-out
          ${isRightSidebarOpen ? 'w-80' : 'w-0'} relative`}>
                    <div className={`absolute inset-0 ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300 overflow-y-auto`}>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">System Prompt</label>
                                <Textarea
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    rows={6}
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Consulting Mode</h4>
                                <div className="space-y-2">
                                    {ConsultingModes.map((mode) => (
                                        <button
                                            key={mode.id}
                                            className={`w-full p-3 rounded-lg text-left border transition-colors
                        ${selectedMode === mode.id ? 'bg-white border-gray-300' :
                                                'border-transparent hover:bg-gray-100'}`}
                                            onClick={() => {
                                                setSelectedMode(mode.id);
                                                setSystemPrompt(mode.systemPrompt);
                                            }}
                                        >
                                            <div className="text-sm font-medium">{mode.name}</div>
                                            <div className="text-xs text-gray-500">{mode.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Model Settings</h4>
                                <div className="space-y-2">
                                    <Select value={settings.model}
                                            onValueChange={(value) => setSettings({...settings, model: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select model"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gpt4">GPT-4</SelectItem>
                                            <SelectItem value="claude3">Claude 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="password"
                                        placeholder="Enter API key"
                                        value={settings.apiKey}
                                        onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isSourceManagerOpen} onOpenChange={setIsSourceManagerOpen}>
                <DialogContent className="max-w-4xl h-screen">
                    <DialogHeader><DialogTitle>Source Manager</DialogTitle></DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4">Source Manager Content</div>
                </DialogContent>
            </Dialog>

            <Dialog open={isJsonViewerOpen} onOpenChange={setIsJsonViewerOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader><DialogTitle>Source Data</DialogTitle></DialogHeader>
                    <div className="overflow-y-auto">
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(sources, null, 2)}
            </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

