"use client";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  onColorChange: (color: string) => void;
}

const colors = [
  { name: 'Asphalt', value: '#34495e' },
  { name: 'Taupe', value: '#8e8d8a' },
  { name: 'Blue', value: '#3498db' },
  { name: 'Teal', value: '#1abc9c' },
  { name: 'Emerald', value: '#2ecc71' },
  { name: 'Marigold', value: '#f1c40f' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Dark', value: '#2c3e50' },
];

export default function FilterBar({ onFilterChange, onColorChange }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState({
    headshot: 'All',
    graphics: 'All',
    columns: 'All',
  });
  const [selectedColor, setSelectedColor] = useState(colors[2].value);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-6 mb-8 flex flex-wrap items-center justify-between gap-6">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filter by</span>
        
        {/* Headshot Filter */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
            Headshot: {activeFilters.headshot}
            <ChevronDown size={16} />
          </button>
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover:block overflow-hidden z-20">
            {['All', 'With photo', 'Without photo'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleFilterChange('headshot', opt)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Graphics Filter */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
            Graphics: {activeFilters.graphics}
            <ChevronDown size={16} />
          </button>
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover:block overflow-hidden z-20">
            {['All', 'With graphics', 'Without graphics'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleFilterChange('graphics', opt)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Columns Filter */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
            Columns: {activeFilters.columns}
            <ChevronDown size={16} />
          </button>
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover:block overflow-hidden z-20">
            {['All', '1 column', '2 columns'].map(opt => (
              <button 
                key={opt}
                onClick={() => handleFilterChange('columns', opt)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Colors</span>
        <div className="flex items-center gap-2">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => handleColorSelect(color.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
