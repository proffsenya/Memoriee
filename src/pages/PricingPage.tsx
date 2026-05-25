import { useNavigate } from 'react-router-dom';

import { Check, ChevronLeft } from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Свадебный',
    price: 6500,
    description: 'Базовый пакет для вашего главного дня',
    features: [
      'Одно мероприятие',
      'Безлимитное количество гостей',
      '200 фотографий максимум',
      '1 фильтр на выбор',
      'Скачивание фото',
      'Техническая поддержка'
    ]
  },
  {
    name: 'Праздничный',
    price: 9990,
    description: 'Идеален для свадьбы с дополнительным мероприятием',
    features: [
      'Два мероприятия',
      'Безлимитное количество гостей',
      'До 400 фотографий (по 200 на событие)',
      '2 фильтра на выбор',
      'Скачивание фото',
      'Приоритетная поддержка'
    ],
    highlighted: true
  },
  {
    name: 'Премиум',
    price: 14990,
    description: 'Максимум возможностей для профессионального результата',
    features: [
      'Одно мероприятие',
      'Безлимитное количество гостей',
      '500 фотографий максимум',
      'Видео запись (поддержка)',
      '3 фильтра на выбор',
      'Приоритетная поддержка',
      'Архивирование данных'
    ]
  }
];

export const PricingPage = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    navigate(`/create-event?plan=${planName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white ml-4">Тарифы</h1>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <p className="text-center text-gray-300 text-lg mb-12">
          Выберите подходящий вам пакет
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg overflow-hidden transition-all ${
                plan.highlighted
                  ? 'ring-2 ring-indigo-500 md:scale-105 shadow-2xl'
                  : 'hover:shadow-xl'
              } ${plan.highlighted ? 'bg-slate-800' : 'bg-slate-800 hover:bg-slate-750'}`}
            >
              {plan.highlighted && (
                <div className="bg-indigo-600 text-white text-center py-2 text-sm font-semibold">
                  ПОПУЛЯРНЫЙ ВЫБОР
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">
                    {plan.price.toLocaleString('ru-RU')}
                  </span>
                  <span className="text-gray-400 ml-2">₽</span>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-3 rounded-lg font-semibold transition mb-8 ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
                  }`}
                >
                  Выбрать тариф
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Информация</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              Стоимость: <span className="font-semibold text-white">32 ₽ за одну фотографию</span> (при дополнительных заказах)
            </p>
            <p>
              Все тарифы включают редактирование с применением выбранных фильтров и скачивание в полном качестве.
            </p>
            <p>
              Поддержка: Техническая помощь, консультация по использованию сервиса.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
