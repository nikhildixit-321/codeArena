import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { Search, ExternalLink, BookOpen, Code, Brain, ChevronRight, GraduationCap } from 'lucide-react';

const TOPICS = [
    {
        id: 'arrays',
        title: 'Arrays & Hashing',
        description: 'The foundation of data structures. Learn about searching, sorting, and mapping.',
        icon: <Code className="text-blue-500" />,
        gfg: 'https://www.geeksforgeeks.org/array-data-structure/',
        w3s: 'https://www.w3schools.com/js/js_arrays.asp',
        color: 'from-blue-500/10 to-blue-500/5'
    },
    {
        id: 'strings',
        title: 'String Manipulation',
        description: 'Techniques for processing text, pattern matching, and transformations.',
        icon: <Brain className="text-purple-500" />,
        gfg: 'https://www.geeksforgeeks.org/string-data-structure/',
        w3s: 'https://www.w3schools.com/js/js_strings.asp',
        color: 'from-purple-500/10 to-purple-500/5'
    },
    {
        id: 'sorting',
        title: 'Sorting Algorithms',
        description: 'Bubble sort, Quick sort, Merge sort - learn their time & space complexities.',
        icon: <GraduationCap className="text-orange-500" />,
        gfg: 'https://www.geeksforgeeks.org/sorting-algorithms/',
        w3s: 'https://www.w3schools.com/dsa/dsa_algo_sorting.php',
        color: 'from-orange-500/10 to-orange-500/5'
    },
    {
        id: 'dynamic-programming',
        title: 'Dynamic Programming',
        description: 'Master the art of breaking down complex problems into overlapping subproblems.',
        icon: <Search className="text-emerald-500" />,
        gfg: 'https://www.geeksforgeeks.org/dynamic-programming/',
        w3s: 'https://www.w3schools.com/dsa/dsa_theory_dp.php',
        color: 'from-emerald-500/10 to-emerald-500/5'
    },
    {
        id: 'graphs',
        title: 'Graphs & Trees',
        description: 'BFS, DFS, and tree traversals. Essential for complex relationship modeling.',
        icon: <BookOpen className="text-red-500" />,
        gfg: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
        w3s: 'https://www.w3schools.com/dsa/dsa_theory_graphs.php',
        color: 'from-red-500/10 to-red-500/5'
    },
    {
        id: 'recursion',
        title: 'Recursion',
        description: 'Understand self-referential functions and the call stack.',
        icon: <Code className="text-sky-500" />,
        gfg: 'https://www.geeksforgeeks.org/recursion/',
        w3s: 'https://www.w3schools.com/js/js_recursion.asp',
        color: 'from-sky-500/10 to-sky-500/5'
    }
];

export default function Learning() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTopics = TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGlobalSearch = (platform) => {
        if (!searchQuery) return;
        let url = '';
        if (platform === 'gfg') {
            url = `https://www.geeksforgeeks.org/search-results/?q=${encodeURIComponent(searchQuery)}`;
        } else if (platform === 'w3s') {
            url = `https://www.w3schools.com/where_is_it.asp?q=${encodeURIComponent(searchQuery)}`;
        }
        window.open(url, '_blank');
    };

    return (
        <MainLayout>
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                            <GraduationCap className="text-blue-500" size={32} />
                            Learning Hub
                        </h1>
                        <p className="text-gray-400 text-sm max-w-2xl">
                            Master Data Structures and Algorithms with curated resources from GeeksforGeeks and W3Schools.
                        </p>

                        {/* Search Bar */}
                        <div className="mt-8 relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search topics (e.g. Binary Search, Arrays)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>

                        {/* Platform Quick Search */}
                        {searchQuery && (
                            <div className="flex gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => handleGlobalSearch('gfg')}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#2f8d46]/20 text-[#2f8d46] hover:bg-[#2f8d46]/30 rounded-full text-xs font-bold transition-all border border-[#2f8d46]/30"
                                >
                                    Search on GeeksforGeeks
                                    <ExternalLink size={14} />
                                </button>
                                <button
                                    onClick={() => handleGlobalSearch('w3s')}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#04aa6d]/20 text-[#04aa6d] hover:bg-[#04aa6d]/30 rounded-full text-xs font-bold transition-all border border-[#04aa6d]/30"
                                >
                                    Search on W3Schools
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Featured Topics Grid */}
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                <ChevronRight size={14} className="text-blue-500" />
                                Featured DSA Topics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-[#0d0d0d]"
                                    >
                                        {/* Glowing background */}
                                        <div className={`absolute inset-0 bg-linear-to-br ${topic.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10`} />

                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                            {topic.icon}
                                        </div>

                                        <h3 className="text-lg font-bold mb-3">{topic.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                            {topic.description}
                                        </p>

                                        <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                                            <a
                                                href={topic.gfg}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/link"
                                            >
                                                <span className="text-xs font-bold text-gray-300 group-hover/link:text-[#2f8d46]">GeeksforGeeks Guide</span>
                                                <ExternalLink size={14} className="text-gray-500 group-hover/link:text-[#2f8d46]" />
                                            </a>
                                            <a
                                                href={topic.w3s}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/link text-xs font-bold"
                                            >
                                                <span className="text-xs font-bold text-gray-300 group-hover/link:text-[#04aa6d]">W3Schools Reference</span>
                                                <ExternalLink size={14} className="text-gray-500 group-hover/link:text-[#04aa6d]" />
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {filteredTopics.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500">
                                        <p>No topics matches your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links / Resources */}
                        <div className="p-8 rounded-[3rem] bg-linear-to-r from-blue-600/10 to-transparent border border-blue-500/10 relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-lg">
                                    <h2 className="text-2xl font-black italic mb-4">Want more?</h2>
                                    <p className="text-gray-400 text-sm italic">
                                        Check out the official documentation and community tutorials for deep dives into specific languages and technologies.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <a href="https://leetcode.com/explore/" target="_blank" className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                                        LeetCode Explore
                                    </a>
                                    <a href="https://codeforces.com/edu/courses" target="_blank" className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xs uppercase hover:bg-white/10 transition-all">
                                        Codeforces EDU
                                    </a>
                                </div>
                            </div>

                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all duration-500" />
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
