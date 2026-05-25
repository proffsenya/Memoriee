import { useState } from 'react';
import { useAppDispatch } from '../../app/store/hooks';
import { createFilter, updateFilter, deleteFilter } from '../../features/filtersSlice/filtersSlice';
import { Button } from '../../shared/ui/Button/Button';
import { Card } from '../../shared/ui/Card/Card';
import { Input } from '../../shared/ui/Input/Input';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

interface Filter {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  params: any;
}

interface FilterManagerProps {
  filters: Filter[];
  onClose: () => void;
  onSelectFilter?: (filterId: string) => void;
}

export const FilterManager = ({ filters, onClose, onSelectFilter }: FilterManagerProps) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [newFilterName, setNewFilterName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateFilter = async () => {
    if (!newFilterName.trim()) {
      showToast('Введите название фильтра', 'error');
      return;
    }
    setLoading(true);
    try {
      await dispatch(createFilter({
        name: newFilterName,
        params: {
          filterType: 'warm',
          brightness: 1.0,
          contrast: 1.0,
          saturation: 1.0,
          hue: 0,
          warmth: 0,
          tint: 0,
          fade: 0,
          vignette: 0
        }
      })).unwrap();
      setNewFilterName('');
      showToast('✓ Фильтр создан', 'success');
    } catch (error: any) {
      showToast('Ошибка при создании фильтра', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFilter = async (filterId: string) => {
    if (!editingName.trim()) {
      showToast('Введите название фильтра', 'error');
      return;
    }
    setLoading(true);
    try {
      await dispatch(updateFilter({
        id: filterId,
        name: editingName
      })).unwrap();
      setEditingId(null);
      showToast('✓ Фильтр обновлён', 'success');
    } catch (error: any) {
      showToast('Ошибка при обновлении фильтра', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    setLoading(true);
    try {
      await dispatch(deleteFilter(filterId)).unwrap();
      showToast('✓ Фильтр удалён', 'success');
    } catch (error: any) {
      showToast('Ошибка при удалении фильтра', 'error');
    } finally {
      setLoading(false);
    }
  };

  const customFilters = filters.filter((f) => f.type === 'custom');
  const presetFilters = filters.filter((f) => f.type === 'preset');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="relative w-full max-w-2xl max-h-[90vh] mx-4 overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute text-gray-400 top-4 right-4 hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-white">Управление фильтрами</h2>

        {/* Создание нового фильтра */}
        <div className="mb-6 p-4 border border-slate-600 rounded-xl bg-slate-700/30">
          <h3 className="mb-3 font-semibold text-white">Создать новый фильтр</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Название фильтра"
              value={newFilterName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFilterName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleCreateFilter}
              disabled={loading}
              className="whitespace-nowrap"
            >
              <Plus size={18} className="mr-1" /> Создать
            </Button>
          </div>
        </div>

        {/* Стандартные фильтры */}
        {presetFilters.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-gray-300">📌 Стандартные фильтры</h3>
            <div className="space-y-2">
              {presetFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600 rounded-lg"
                >
                  <span className="text-white">{filter.name}</span>
                  {onSelectFilter && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onSelectFilter(filter.id);
                        onClose();
                      }}
                      className="text-sm"
                    >
                      Выбрать
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Пользовательские фильтры */}
        {customFilters.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-300">✏️ Мои фильтры</h3>
            <div className="space-y-2">
              {customFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600 rounded-lg"
                >
                  {editingId === filter.id ? (
                    <Input
                      value={editingName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                      className="flex-1 mr-2"
                    />
                  ) : (
                    <span className="text-white flex-1">{filter.name}</span>
                  )}
                  <div className="flex gap-2">
                    {editingId === filter.id ? (
                      <>
                        <Button
                          onClick={() => handleUpdateFilter(filter.id)}
                          disabled={loading}
                          className="text-sm"
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                          className="text-sm"
                        >
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingId(filter.id);
                            setEditingName(filter.name);
                          }}
                          className="text-sm"
                        >
                          Редактировать
                        </Button>
                        {onSelectFilter && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              onSelectFilter(filter.id);
                              onClose();
                            }}
                            className="text-sm"
                          >
                            Выбрать
                          </Button>
                        )}
                        <button
                          onClick={() => handleDeleteFilter(filter.id)}
                          disabled={loading}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customFilters.length === 0 && presetFilters.length === 0 && (
          <p className="text-gray-400 text-center py-8">Фильтры не найдены</p>
        )}
      </Card>
    </div>
  );
};
