import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { Category } from '@/types/category';

interface PlaceholderContentType {
  userId?: string;
  serverId?: string;
  onChangeUserId?: (value: string) => void;
  onChangeServerId?: (value: string) => void;
  category: Category;
}

export function PlaceholderContent({
  category,
  onChangeServerId,
  onChangeUserId,
  serverId = '',
  userId = '',
}: PlaceholderContentType) {
  const [placeholder1, setPlaceholder1] = useState(userId);
  const [placeholder2, setPlaceholder2] = useState(serverId);

  // Update local state when props change
  useEffect(() => {
    setPlaceholder1(userId);
  }, [userId]);

  useEffect(() => {
    setPlaceholder2(serverId);
  }, [serverId]);

  const hasSecondInput =
    category.placeholder2 &&
    category.placeholder2 !== '-' &&
    category.placeholder2 !== '.' &&
    category.placeholder2 !== '2';

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlaceholder1(value);
    if (onChangeUserId) {
      onChangeUserId(value);
    }
  };

  const handleServerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlaceholder2(value);
    if (onChangeServerId) {
      onChangeServerId(value);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 gap-4 w-full">
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
          onChange={handleUserIdChange}
          placeholder={`${category.placeholder1}`}
          className="w-full rounded-lg px-2 py-1 placeholder:text-gray-500 text-white border-2 border-blue-500 focus-visible:ring-0 focus-visible:border-blue-900"
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
            onChange={handleServerIdChange}
            placeholder={`${category.placeholder2}`}
            className="w-full rounded-lg px-2 py-1 placeholder:text-gray-500 text-white border-2 border-blue-500 focus-visible:ring-0 focus-visible:border-blue-900"
          />
        </div>
      )}
    </div>
  );
}
