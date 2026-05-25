import { FilterParams } from '../../../entities/filter/types';

interface FilterEditorProps {
  params: FilterParams;
  onChange: (params: FilterParams) => void;
}

export function FilterEditor({ params, onChange }: FilterEditorProps) {
  const handleChange = (key: keyof FilterParams, value: any) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-700 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Тип фильтра
        </label>
        <select
          value={params.filterType}
          onChange={(e) => handleChange('filterType', e.target.value)}
          className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-600 text-white"
        >
          <option value="warm">Тёплый</option>
          <option value="bw">Чёрное и белое</option>
          <option value="vintage">Ретро</option>
          <option value="cool">Холодный</option>
          <option value="sepia">Сепия</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Яркость: {params.brightness.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={params.brightness}
            onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Контраст: {params.contrast.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={params.contrast}
            onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Насыщенность: {params.saturation.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={params.saturation}
            onChange={(e) => handleChange('saturation', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Оттенок: {params.hue.toFixed(0)}
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={params.hue}
            onChange={(e) => handleChange('hue', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Теплота: {params.warmth.toFixed(0)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={params.warmth}
            onChange={(e) => handleChange('warmth', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Тонирование: {params.tint.toFixed(0)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={params.tint}
            onChange={(e) => handleChange('tint', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Выцветание: {params.fade.toFixed(0)}
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={params.fade}
            onChange={(e) => handleChange('fade', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Виньетка: {params.vignette.toFixed(0)}
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.02"
            value={params.vignette}
            onChange={(e) => handleChange('vignette', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
