"use client";
import TemplateCard from './TemplateCard';

interface TemplateGridProps {
  templates: any[];
  selectedColor: string;
}

export default function TemplateGrid({ templates, selectedColor }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-900">No templates found</h3>
        <p className="text-gray-500">Try adjusting your filters to find more designs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
      {templates.map(template => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          selectedColor={selectedColor} 
        />
      ))}
    </div>
  );
}
