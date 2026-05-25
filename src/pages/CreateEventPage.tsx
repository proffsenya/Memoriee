import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { createEvent } from '../features/eventSlice/eventSlice';
import { fetchAllFilters } from '../features/filtersSlice/filtersSlice';
import { selectAllFilters } from '../features/filtersSlice/selectors';
import { Card, Input, Button, FilterSelector, FilterMenu } from '../shared/ui';
import { ChevronLeft, X, Settings, Info } from 'lucide-react';
import { useToast } from '../shared/context/ToastContext';
import { Filter } from '../entities/filter/types';

const categories = [
  { name: 'Свадьба', emoji: '💍' },
  { name: 'День рождения', emoji: '🎂' },
  { name: 'Корпоратив', emoji: '💼' },
  { name: 'Путешествие', emoji: '✈️' },
  { name: 'Другое', emoji: '🎉' }
];

const PRICE_PER_PHOTO = 32;

// Тарифы и их параметры
const PLANS = {
  'Свадебный': { maxFilters: 1, maxPhotos: 200, maxEvents: 1, price: 6500 },
  'Праздничный': { maxFilters: 2, maxPhotos: 400, maxEvents: 2, price: 9990 },
  'Премиум': { maxFilters: 3, maxPhotos: 500, maxEvents: 1, price: 14990 }
};

export const CreateEventPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const allFilters = useAppSelector(selectAllFilters);

  const planName = searchParams.get('plan') || null;
  const plan = planName && PLANS[planName as keyof typeof PLANS] ? PLANS[planName as keyof typeof PLANS] : null;

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'Свадьба');
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Filter[]>([]);
  const [guestCount, setGuestCount] = useState(20);
  const [photosPerGuest, setPhotosPerGuest] = useState(30);
  const [extraPhotos, setExtraPhotos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    dispatch(fetchAllFilters());
  }, [dispatch]);

  // Set default filter (first preset)
  useEffect(() => {
    if (allFilters.length > 0 && !selectedFilter) {
      const defaultFilter = allFilters.find((f) => f.type === 'preset');
      if (defaultFilter) {
        setSelectedFilter(defaultFilter);
      }
    }
  }, [allFilters, selectedFilter]);

  // Запретить скролл когда открыт dropdown
  useEffect(() => {
    if (openDropdownIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openDropdownIndex]);

  const totalPhotos = plan ? plan.maxPhotos + extraPhotos : guestCount * photosPerGuest;
  const totalPrice = plan ? plan.price + (extraPhotos * PRICE_PER_PHOTO) : totalPhotos * PRICE_PER_PHOTO;

  const handleSelectFilter = (filter: Filter) => {
    if (plan) {
      // Для плана управляем массивом фильтров
      const maxFilters = plan.maxFilters;
      const filterIndex = selectedFilters.findIndex(f => f.id === filter.id);
      
      if (filterIndex >= 0) {
        // Убрать фильтр если он уже выбран
        setSelectedFilters(selectedFilters.filter(f => f.id !== filter.id));
      } else if (selectedFilters.length < maxFilters) {
        // Добавить фильтр если не достигли лимита
        setSelectedFilters([...selectedFilters, filter]);
      } else {
        showToast(`Максимум ${maxFilters} фильтров для этого тарифа`, 'info');
      }
    } else {
      // Для обычного события один фильтр
      setSelectedFilter(filter);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (plan) {
      if (selectedFilters.length !== plan.maxFilters) {
        showToast(`Выберите ${plan.maxFilters} фильтра для этого тарифа`, 'error');
        return;
      }
    } else {
      if (!selectedFilter) {
        showToast('Выберите фильтр', 'error');
        return;
      }
    }
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const finalGuestCount = plan ? 999 : guestCount; // Безлимит для тарифов
      
      const createEventPayload: any = {
        name, 
        date, 
        category, 
        photosPerGuest: plan ? plan.maxPhotos : photosPerGuest, 
        guestCount: finalGuestCount,
      };

      if (plan) {
        // Для плана передаем массив фильтров
        createEventPayload.filters = selectedFilters.map(f => ({
          id: f.id,
          name: f.name,
          params: f.params
        }));
        createEventPayload.plan = planName;
        createEventPayload.extraPhotos = extraPhotos;
      } else {
        // Для обычного события один фильтр
        createEventPayload.filterId = selectedFilter!.id;
        createEventPayload.filterParams = selectedFilter!.params;
      }

      const result = await dispatch(createEvent(createEventPayload)).unwrap();
      setShowPaymentDialog(false);
      showToast(`Событие создано! Оплачено ${totalPrice} ₽`, 'success');
      setTimeout(() => {
        navigate(`/event/${result.id}/dashboard`);
      }, 1500);
    } catch (error) {
      console.error('Event creation error:', error);
      showToast('Ошибка создания события', 'error');
      setShowPaymentDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-indigo-500 rounded-full w-80 h-80 opacity-5 blur-3xl top-20 -left-40"></div>
      </div>

      <div className="relative z-10 max-w-2xl px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 py-6 mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 transition rounded-lg hover:bg-slate-700"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Новое событие</h1>
            <p className="text-sm text-gray-400">Шаг {step} из 5</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${s <= step ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Occasion */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <span>🎯</span> Какой тип события?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => { setCategory(cat.name); setStep(2); }}
                      className={`p-4 rounded-xl border-2 transition text-center ${
                        category === cat.name
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="mb-2 text-3xl">{cat.emoji}</div>
                      <div className="font-medium text-white">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Event name */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <span>📝</span> Название события
                </h2>
                <p className="text-sm text-gray-400">Это увидят гости при сканировании QR</p>
                <Input
                  placeholder="Например: Свадьба Иван & Мария"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button onClick={() => setStep(1)} variant="secondary" className="flex-1">Назад</Button>
                  <Button onClick={() => name && setStep(3)} className="flex-1">Далее</Button>
                </div>
              </div>
            )}

            {/* Step 3: Date and filter */}
            {step === 3 && (
              <div className="space-y-4 pb-32">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <span>📅</span> Когда событие?
                </h2>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <span>🎨</span> Выберите фильтр
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowFilterMenu(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Settings size={16} />
                      Все фильтры
                    </button>
                  </div>

                  {allFilters.length > 0 ? (
                    <>
                      {plan && (
                        <div className="flex gap-3 p-3 mb-4 border border-blue-700 rounded-lg bg-blue-900/30">
                          <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-300">
                            <p className="font-semibold">Тариф: {planName}</p>
                            <p>Выберите {plan.maxFilters} фильтра | Макс. фото: {plan.maxPhotos}</p>
                          </div>
                        </div>
                      )}

                      {plan ? (
                        // Для плана показываем несколько селекторов
                        <div className="space-y-3 mb-4">
                          {Array.from({ length: plan.maxFilters }).map((_, index) => (
                            <div key={index}>
                              <p className="text-sm text-gray-400 mb-2">Фильтр {index + 1}</p>
                              <div ref={(el) => { if (el) dropdownRefs.current[index] = el; }}>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const button = (e.target as HTMLElement).closest('button');
                                    if (button) {
                                      const rect = button.getBoundingClientRect();
                                      setDropdownPosition({
                                        top: rect.bottom + 4,
                                        left: rect.left,
                                        width: rect.width
                                      });
                                    }
                                    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                                  }}
                                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-sm font-medium text-white hover:bg-slate-600 transition"
                                >
                                  {selectedFilters[index]?.name || 'Выбрать фильтр'}
                                </button>
                              </div>
                              {/* Dropdown меню - показывается только если открыт */}
                              {openDropdownIndex === index && dropdownPosition && (
                                <div 
                                  className="fixed bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                                  style={{
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    width: `${dropdownPosition.width}px`
                                  }}
                                >
                                  {allFilters.map((filter) => (
                                    <button
                                      key={filter.id}
                                      onClick={() => {
                                        const newFilters = [...selectedFilters];
                                        newFilters[index] = filter;
                                        setSelectedFilters(newFilters);
                                        setOpenDropdownIndex(null); // Закрываем dropdown после выбора
                                        setDropdownPosition(null);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-sm transition ${
                                        selectedFilters[index]?.id === filter.id
                                          ? 'bg-blue-600 text-white'
                                          : 'text-gray-200 hover:bg-slate-600'
                                      }`}
                                    >
                                      <div className="font-medium">{filter.name}</div>
                                      {filter.description && (
                                        <div className="text-xs opacity-75">{filter.description}</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Для обычного события один селектор
                        <>
                          <div className="p-3 mb-3 border rounded-lg bg-slate-700/50 border-slate-600">
                            <p className="mb-2 text-xs tracking-wider text-gray-400 uppercase">Выбранный фильтр</p>
                            <p className="text-lg font-semibold text-white">{selectedFilter?.name || 'Не выбран'}</p>
                          </div>
                          <FilterSelector
                            onSelectFilter={handleSelectFilter}
                            currentFilterId={selectedFilter?.id}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <p className="py-4 text-center text-gray-400">Загрузка фильтров...</p>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => setStep(2)} variant="secondary" className="flex-1">Назад</Button>
                  <Button 
                    onClick={() => {
                      const isValid = plan 
                        ? date && selectedFilters.length === plan.maxFilters
                        : date && selectedFilter;
                      if (isValid) setStep(plan ? 5 : 4);
                    }}
                    disabled={!date || (plan ? selectedFilters.length !== plan.maxFilters : !selectedFilter)}
                    className="flex-1"
                  >
                    Далее
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Guests and photos */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <span>👥</span> Сколько гостей?
                </h2>
                <div className="p-6 border bg-slate-700/50 border-slate-600 rounded-xl">
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="text-4xl font-bold text-white">{guestCount}</div>
                      <div className="text-sm text-gray-400">гостей</div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="250"
                      value={guestCount}
                      onChange={e => setGuestCount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <h3 className="flex items-center gap-2 mt-6 text-lg font-semibold text-white">
                  <span>📸</span> Фото на одного гостя?
                </h3>
                <div className="p-6 border bg-slate-700/50 border-slate-600 rounded-xl">
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="text-4xl font-bold text-white">{photosPerGuest}</div>
                      <div className="text-sm text-gray-400">фото/гостя</div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={photosPerGuest}
                      onChange={e => setPhotosPerGuest(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Price preview */}
                <div className="p-4 border bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border-indigo-500/50 rounded-xl">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-400">Всего фото</p>
                      <p className="text-2xl font-bold text-indigo-400">{totalPhotos}</p>
                    </div>
                    <div className="border-l border-r border-slate-600">
                      <p className="text-sm text-gray-400">Цена/фото</p>
                      <p className="text-2xl font-bold text-blue-400">{PRICE_PER_PHOTO} ₽</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">К оплате</p>
                      <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text">{totalPrice} ₽</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setStep(3)} variant="secondary" className="flex-1">Назад</Button>
                  <Button onClick={() => setStep(5)} className="flex-1">Далее</Button>
                </div>
              </div>
            )}

            {/* Step 5: Review and pay */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <span>✨</span> Готово к созданию!
                </h2>

                {plan && (
                  <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-300 font-semibold">Тариф: {planName}</p>
                    <p className="text-sm text-green-400 mt-1">Включено фото: {plan.maxPhotos}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-green-400 font-semibold">Выбранные фильтры:</p>
                      {selectedFilters.map((filter, idx) => (
                        <p key={idx} className="text-sm text-green-300 ml-2">• {filter.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-3 border bg-slate-700/50 border-slate-600 rounded-xl">
                  <div className="flex justify-between text-gray-300">
                    <span>Событие:</span>
                    <span className="font-semibold text-white">{name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Дата:</span>
                    <span className="font-semibold text-white">{date}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Тип:</span>
                    <span className="font-semibold text-white">{category}</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 text-lg border-t border-slate-600">
                    <span className="font-semibold text-white">Всего фото:</span>
                    <span className="font-bold text-indigo-400">{totalPhotos}</span>
                  </div>
                  {plan && extraPhotos > 0 && (
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Дополнительно фото:</span>
                      <span className="text-white">{extraPhotos} × {PRICE_PER_PHOTO} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-white">К оплате:</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text">{totalPrice} ₽</span>
                  </div>
                </div>

                {plan && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Докупить дополнительные фото</h3>
                    <div className="p-4 border bg-slate-700/50 border-slate-600 rounded-xl">
                      <div className="mb-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <div className="text-4xl font-bold text-white">{extraPhotos}</div>
                          <div className="text-sm text-gray-400">доп. фото</div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={extraPhotos}
                          onChange={e => setExtraPhotos(Number(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-400 mt-2">{PRICE_PER_PHOTO} ₽ за фото</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setStep(plan ? 3 : 4)} variant="secondary" className="flex-1">Назад</Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Обработка...' : `Оплатить ${totalPrice} ₽`}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>

      {/* Диалог оплаты при создании события */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="relative max-w-sm p-6 mx-4">
            <button
              type="button"
              onClick={() => setShowPaymentDialog(false)}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-200"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-2xl font-bold text-white">Оплата за событие</h2>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Событие:</span>
                <span className="font-semibold text-white">{name}</span>
              </div>
              {plan ? (
                <>
                  <div className="flex justify-between text-gray-300">
                    <span>Тариф:</span>
                    <span className="font-semibold text-white">{planName}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Включено фото:</span>
                    <span className="font-semibold text-white">{plan.maxPhotos}</span>
                  </div>
                  <div className="text-gray-300">
                    <p className="text-sm mb-2">Фильтры:</p>
                    <div className="space-y-1 ml-2">
                      {selectedFilters.map((filter, idx) => (
                        <p key={idx} className="text-sm text-gray-200">• {filter.name}</p>
                      ))}
                    </div>
                  </div>
                  {extraPhotos > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Доп. фото:</span>
                      <span className="font-semibold text-white">{extraPhotos} × {PRICE_PER_PHOTO} ₽</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-gray-300">
                    <span>Гостей:</span>
                    <span className="font-semibold text-white">{guestCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Фото на гостя:</span>
                    <span className="font-semibold text-white">{photosPerGuest}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Цена за фото:</span>
                    <span className="font-semibold text-white">{PRICE_PER_PHOTO} ₽</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-gray-300">
                <span>Всего фото:</span>
                <span className="font-semibold text-indigo-400">{totalPhotos}</span>
              </div>
              <div className="pt-3 border-t border-slate-600">
                <div className="flex justify-between text-lg font-bold text-emerald-400">
                  <span>К оплате:</span>
                  <span>{totalPrice} ₽</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Обработка...' : `Оплатить ${totalPrice} ₽`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Menu Modal */}
      <FilterMenu 
        isOpen={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
      />
    </div>
  );
};