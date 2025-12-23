import { useMemo, useState } from 'react';

function ModelSelector({ selectedModels, setSelectedModels, modelOptions, maxSelected = 4 }) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const selectedModelCount = useMemo(
    () => Object.values(selectedModels).filter(Boolean).length,
    [selectedModels]
  );

  const allTags = useMemo(() => {
    const set = new Set();
    modelOptions.forEach((m) => (m.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [modelOptions]);

  const canToggle = (isCurrentlySelected) =>
    isCurrentlySelected || selectedModelCount < maxSelected;

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">Active Models:</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(selectedModels)
              .filter(([_, selected]) => selected)
              .map(([key, _]) => {
                const model = modelOptions.find((m) => m.key === key);
                return (
                  <span
                    key={key}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                  >
                    {model?.label}
                  </span>
                );
              })}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <span className="text-sm font-medium text-indigo-700">{selectedModelCount}/{maxSelected}</span>
            <svg
              className={`w-4 h-4 text-indigo-700 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {showModelDropdown && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Search models..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="p-3 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {modelOptions
                  .filter((opt) => {
                    const matchText = opt.label.toLowerCase().includes(modelSearch.toLowerCase());
                    const matchTags =
                      selectedTags.length === 0 || (opt.tags && selectedTags.some((t) => opt.tags.includes(t)));
                    return matchText && matchTags;
                  })
                  .map((opt) => {
                    const isCurrentlySelected = selectedModels[opt.key];
                    const isMaxed = selectedModelCount >= maxSelected && !isCurrentlySelected;

                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                          isMaxed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (canToggle(isCurrentlySelected)) {
                            setSelectedModels((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }));
                          }
                        }}
                      >
                        <div className="pr-3">
                          <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(opt.tags || []).map((tag) => (
                              <span
                                key={`${opt.key}-${tag}`}
                                className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!selectedModels[opt.key]}
                          onChange={() => {}}
                          disabled={isMaxed}
                          className={`w-4 h-4 text-indigo-600 rounded ${
                            isMaxed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    );
                  })}
                {modelOptions.filter((opt) => {
                  const matchText = opt.label.toLowerCase().includes(modelSearch.toLowerCase());
                  const matchTags = selectedTags.length === 0 || (opt.tags && selectedTags.some((t) => opt.tags.includes(t)));
                  return matchText && matchTags;
                }).length === 0 && (
                  <div className="text-center py-6 text-sm text-gray-500">
                    No models match your search and tag filters
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModelSelector;
