import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { Category } from '@/types/category';

export function PlaceholderContent({ category }: { category: Category }) {
  const [placeholder1, setPlaceholder1] = useState('');
  const [placeholder2, setPlaceholder2] = useState('');

  const hasSecondInput =
    category.placeholder2 &&
    category.placeholder2 !== '-' &&
    category.placeholder2 !== '.' &&
    category.placeholder2 !== '2';

  return (
    <div className="flex justify-between space-y-4 gap-4 w-full ">
      <div className="flex flex-col space-y-2 w-full">
        <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
          {category.placeholder1}
          {category.placeholder1 === 'User ID' && (
            <span className="tooltip" title="Enter your User ID">
              <Info size={16} className="text-gray-400" />
            </span>
          )}
        </label>
        <Input
          value={placeholder1}
          onChange={(e) => setPlaceholder1(e.target.value)}
          placeholder={`${category.placeholder1}`}
          className="w-full rounded-lg px-2 py-1 placeholder:text-gray-500 text-white border-2 border-blue-500 focus-visible:ring-0 focus-visible:border-blue-900 "
        />
      </div>

      {hasSecondInput && (
        <div className="flex flex-col space-y-2 w-full">
          <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
            {category.placeholder2}
            {category.placeholder2 === 'Server' && (
              <span className="tooltip" title="Enter your Server ID">
                <Info size={16} className="text-gray-400" />
              </span>
            )}
          </label>
          <Input
            value={placeholder2}
            onChange={(e) => setPlaceholder2(e.target.value)}
            placeholder={`${category.placeholder2}`}
            className="w-full rounded-lg px-2 py-1 placeholder:text-gray-500 text-white border-2 border-blue-500 focus-visible:ring-0 focus-visible:border-blue-900 "
          />
        </div>
      )}
    </div>
  );
}
