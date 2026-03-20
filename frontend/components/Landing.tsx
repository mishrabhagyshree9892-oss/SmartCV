"use client";
import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl">R</div>
          <span className="text-2xl font-bold tracking-tight">Re-Resume_Me</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="font-semibold text-gray-600 hover:text-primary transition-colors">Log in</Link>
          <Link href="/signup" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-10 pt-10 pb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm uppercase tracking-wider">
            AI-Powered Career Growth
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.2]">
            Build a Resume that <span className="text-primary">Lands Jobs.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Automate your job search with AI-optimized resumes, real-time JD analysis, and blockchain-verified certifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/signup" className="px-8 py-4 bg-primary text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">
              Start Building Free
            </Link>
            <button className="px-8 py-4 bg-white border-2 border-gray-100 font-bold text-base rounded-xl hover:bg-gray-50 transition-all">
              View Templates
            </button>
          </div>
          <div className="flex items-center gap-4 justify-center lg:justify-start pt-8">
             <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200" />)}
             </div>
             <p className="text-sm text-gray-500"><b>10,000+</b> resumes built this month</p>
          </div>
        </div>

        <div className="flex-1 relative">
           <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
           <div className="relative bg-white border border-gray-100 rounded-[3rem] shadow-2xl overflow-hidden transform rotate-2">
              <div className="p-8 space-y-6">
                 <div className="h-4 w-1/3 bg-gray-100 rounded-full" />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-primary/5 rounded-2xl border border-primary/10" />
                    <div className="h-24 bg-gray-50 rounded-2xl" />
                 </div>
                 <div className="space-y-3">
                    <div className="h-3 w-full bg-gray-100 rounded-full" />
                    <div className="h-3 w-5/6 bg-gray-100 rounded-full" />
                    <div className="h-3 w-4/6 bg-gray-100 rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24 px-10">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need to <span className="text-primary">stand out.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: 'AI Optimizer', desc: 'Real-time suggestions to improve your resume impact.', icon: '⚡' },
                 { title: 'JD Matching', desc: 'Sync your skills with specific job descriptions automatically.', icon: '🎯' },
                 { title: 'Interview Coach', desc: 'Practice with our AI and get instant feedback.', icon: '👤' }
               ].map(f => (
                 <div key={f.title} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
                    <div className="text-4xl mb-6">{f.icon}</div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
