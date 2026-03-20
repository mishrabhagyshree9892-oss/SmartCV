"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import TemplateGrid from '@/components/TemplateGrid';

interface Template {
  id: string;
  name: string;
  category: string;
  hasPhoto: boolean;
  hasGraphics: boolean;
  columns: number;
  recommended: boolean;
  previewImage: string;
  description: string;
}

export default function TemplatesPage() {
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedColor, setSelectedColor] = useState('#3498db');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/templates`);
        const data = await res.json();
        setAllTemplates(data);
        setFilteredTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleFilterChange = (filters: any) => {
    let result = [...allTemplates];

    if (filters.headshot !== 'All') {
      const needsPhoto = filters.headshot === 'With photo';
      result = result.filter(t => t.hasPhoto === needsPhoto);
    }

    if (filters.graphics !== 'All') {
      const needsGraphics = filters.graphics === 'With graphics';
      result = result.filter(t => t.hasGraphics === needsGraphics);
    }

    if (filters.columns !== 'All') {
      const numColumns = filters.columns === '1 column' ? 1 : 2;
      result = result.filter(t => t.columns === numColumns);
    }

    setFilteredTemplates(result);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-400" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="text-xl font-bold tracking-tight">Templates</span>
          </div>
        </div>
        <div className="hidden sm:block">
           <p className="text-sm font-semibold text-gray-400">Choose a template to start building</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 pt-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Select Your Design</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Choose from our collection of ATS-optimized, professional-grade resume templates. 
            Customize colors and layout to match your style.
          </p>
        </div>

        <FilterBar 
          onFilterChange={handleFilterChange} 
          onColorChange={handleColorChange} 
        />

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <TemplateGrid 
            templates={filteredTemplates} 
            selectedColor={selectedColor} 
          />
        )}
      </main>
    </div>
  );
}
