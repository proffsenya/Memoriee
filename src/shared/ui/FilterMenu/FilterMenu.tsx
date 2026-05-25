import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import {
  fetchAllFilters,
  createFilter,
  updateFilter,
  deleteFilter,
} from '../../../features/filtersSlice/filtersSlice';
import {
  selectCustomFilters,
  selectPresetFilters,
} from '../../../features/filtersSlice/selectors';
import { Filter, FilterParams } from '../../../entities/filter/types';
import { Button } from '../Button/Button';
import { FilterEditor } from '../FilterEditor/FilterEditor';
import { FilterPreviewCamera } from '../FilterPreviewCamera/FilterPreviewCamera';
import { Eye } from 'lucide-react';

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterMenu({ isOpen, onClose }: FilterMenuProps) {
  const dispatch = useAppDispatch();
  const customFilters = useAppSelector(selectCustomFilters);
  const presetFilters = useAppSelector(selectPresetFilters);

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [previewCameraFilter, setPreviewCameraFilter] = useState<FilterParams | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    params: {
      filterType: 'warm' as const,
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      hue: 0,
      warmth: 0,
      tint: 0,
      fade: 0,
      vignette: 0,
    },
  });

  useEffect(() => {
    if (isOpen && customFilters.length === 0 && presetFilters.length === 0) {
      dispatch(fetchAllFilters());
    }
  }, [isOpen]);

  const handleCreateFilter = async () => {
    if (!formData.name) return;
    await dispatch(
      createFilter({
        name: formData.name,
        description: formData.description,
        params: formData.params,
      })
    );
    resetForm();
    setMode('list');
  };

  const handleUpdateFilter = async () => {
    if (!editingFilter || !formData.name) return;
    await dispatch(
      updateFilter({
        id: editingFilter.id,
        name: formData.name,
        description: formData.description,
        params: formData.params,
      })
    );
    resetForm();
    setMode('list');
  };

  const handleDeleteFilter = async (id: string) => {
    await dispatch(deleteFilter(id));
  };

  const handleEditFilter = (filter: Filter) => {
    setEditingFilter(filter);
    setFormData({
      name: filter.name,
      description: filter.description || '',
      params: filter.params as any,
    });
    setMode('edit');
  };

  const resetForm = () => {
    setEditingFilter(null);
    setFormData({
      name: '',
      description: '',
      params: {
        filterType: 'warm',
        brightness: 1.0,
        contrast: 1.0,
        saturation: 1.0,
        hue: 0,
        warmth: 0,
        tint: 0,
        fade: 0,
        vignette: 0,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'list' && 'Фильтры'}
            {mode === 'create' && 'Создать фильтр'}
            {mode === 'edit' && 'Редактировать фильтр'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {mode === 'list' && (
            <div className="space-y-6">
              <Button
                onClick={() => {
                  resetForm();
                  setMode('create');
                }}
                className="w-full"
              >
                + Создать новый фильтр
              </Button>

              <div>
                <h3 className="font-semibold mb-3 text-white">Стандартные фильтры</h3>
                <div className="space-y-3">
                  {presetFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="p-3 border border-slate-600 rounded-lg bg-slate-700 hover:bg-slate-600 transition overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-white">{filter.name}</div>
                          {filter.description && (
                            <div className="text-sm text-gray-300">
                              {filter.description}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setPreviewCameraFilter(filter.params)}
                          className="p-2 ml-2 text-gray-300 hover:text-white hover:bg-slate-600 rounded transition flex-shrink-0"
                          title="Просмотр в камере"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {customFilters.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-white">Мои фильтры</h3>
                  <div className="space-y-3">
                    {customFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="p-3 border border-slate-600 rounded-lg bg-slate-700 hover:bg-slate-600 transition overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-white">{filter.name}</div>
                            {filter.description && (
                              <div className="text-sm text-gray-300">
                                {filter.description}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-2 flex-shrink-0">
                            <button
                              onClick={() => setPreviewCameraFilter(filter.params)}
                              className="p-2 text-gray-300 hover:text-white hover:bg-slate-600 rounded transition"
                              title="Просмотр в камере"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditFilter(filter)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition whitespace-nowrap"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDeleteFilter(filter.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition whitespace-nowrap"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Название фильтра
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-gray-400"
                  placeholder="Например: Летний вечер"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Описание (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-gray-400"
                  placeholder="Например: Тёплый и уютный"
                />
              </div>

              <FilterEditor
                params={formData.params}
                onChange={(params) =>
                  setFormData({ ...formData, params: params as any })
                }
              />

              <button
                onClick={() => setPreviewCameraFilter(formData.params)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Просмотр в камере
              </button>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    resetForm();
                    setMode('list');
                  }}
                  className="px-4 py-2 border border-slate-600 rounded-md hover:bg-slate-700 text-gray-300 transition"
                >
                  Отмена
                </button>
                <button
                  onClick={
                    mode === 'create' ? handleCreateFilter : handleUpdateFilter
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  {mode === 'create' ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewCameraFilter && (
        <FilterPreviewCamera
          params={previewCameraFilter}
          onClose={() => setPreviewCameraFilter(null)}
        />
      )}
    </div>
  );
}
