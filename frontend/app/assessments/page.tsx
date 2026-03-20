"use client";
import { useState } from 'react';

export default function Assessments() {
  const tests = [
    { id: 1, name: 'Data Structures & Algorithms', duration: '45 mins', questions: 20, level: 'Advanced' },
    { id: 2, name: 'Frontend Excellence (React)', duration: '60 mins', questions: 30, level: 'Intermediate' },
    { id: 3, name: 'System Design Patterns', duration: '90 mins', questions: 15, level: 'Expert' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-gray-500">Take proctored tests and get blockchain-verified certifications for your skills.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tests.map(test => (
          <div key={test.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                📝
             </div>
             <h3 className="text-xl font-bold mb-2">{test.name}</h3>
             <div className="flex gap-4 text-sm text-gray-500 mb-6">
                <span>⏱️ {test.duration}</span>
                <span>❓ {test.questions} Qs</span>
             </div>
             <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold uppercase">{test.level}</span>
                <button className="text-primary font-bold hover:underline">Start Test →</button>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="space-y-4">
            <h2 className="text-3xl font-bold">Blockchain Verified Certificates</h2>
            <p className="text-gray-400 max-w-md">Your test scores are minted on the blockchain to ensure tamper-proof credibility for employers.</p>
         </div>
         <button className="px-10 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            Learn More
         </button>
      </div>
    </div>
  );
}
