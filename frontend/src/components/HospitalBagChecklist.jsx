import { useState } from 'react';
import { Check, Package, ChevronDown, ChevronUp, Baby, Heart, Phone, Book, Camera, Coffee } from 'lucide-react';

const HospitalBagChecklist = () => {
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedSections, setExpandedSections] = useState(['documents', 'mom', 'baby']);

  const sections = [
    {
      id: 'documents',
      title: 'Documents & Essentials',
      icon: Package,
      items: [
        'ID/Passport',
        'Health insurance card',
        'Birth plan',
        'Hospital registration forms',
        'Contact list (family, doctor)',
        'Phone charger',
        'Cash/Card for expenses'
      ]
    },
    {
      id: 'mom',
      title: 'Mom\'s Bag',
      icon: Heart,
      items: [
        'Comfortable robe',
        'Slippers & socks',
        'Loose fitting nightgown (2-3)',
        'Nursing bras (2-3)',
        'Nursing pads',
        'Comfortable underwear',
        'Maternity pads',
        'Toiletries (toothbrush, toothpaste, hairbrush)',
        'Lip balm',
        'Hair ties/clips',
        'Phone & charger',
        'Snacks & water bottle',
        'Pillow from home',
        'Eye mask & earplugs',
        'Going-home outfit'
      ]
    },
    {
      id: 'baby',
      title: 'Baby\'s Bag',
      icon: Baby,
      items: [
        'Newborn onesies (3-4)',
        'Baby sleep sack',
        'Hat & socks',
        'Swaddle blanket',
        'Burp cloths',
        'Diaper bag',
        'Diapers (newborn size)',
        'Wipes',
        'Baby blanket',
        'Car seat (installed)',
        'Going-home outfit',
        'Photo outfit'
      ]
    },
    {
      id: 'partner',
      title: 'Partner\'s Bag',
      icon: Phone,
      items: [
        'Change of clothes',
        'Snacks & drinks',
        'Phone & charger',
        'Pillow & blanket',
        'Toiletries',
        'Book/magazine',
        'Camera'
      ]
    },
    {
      id: 'extras',
      title: 'Nice to Have',
      icon: Camera,
      items: [
        'Camera/video camera',
        'Bluetooth speaker',
        'Journal & pen',
        'Birth announcements template',
        'Lactation cookies',
        'Massage oil',
        'LED candles (battery)',
        'Phone with birth photography apps'
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleItem = (sectionId, item) => {
    const key = `${sectionId}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getTotalChecked = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };

  const getTotalItems = () => {
    return sections.reduce((total, section) => total + section.items.length, 0);
  };

  const progress = Math.round((getTotalChecked() / getTotalItems()) * 100);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Hospital Bag Checklist</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Pack for the big day
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {getTotalChecked()}/{getTotalItems()}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
      <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{progress}% packed</span>
          <span>{getTotalItems() - getTotalChecked()} items remaining</span>
        </div>
      </div>

      {/* Checklist sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const sectionChecked = section.items.filter(item => checkedItems[`${section.id}-${item}`]).length;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div 
              key={section.id} 
              className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <SectionIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {section.title}
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {sectionChecked}/{section.items.length} packed
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {section.items.map((item) => {
                    const isChecked = checkedItems[`${section.id}-${item}`];
                    return (
                      <button
                        key={item}
                        onClick={() => toggleItem(section.id, item)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isChecked 
                            ? 'bg-success-50 dark:bg-success-900/20' 
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isChecked 
                            ? 'bg-success-500 text-white' 
                            : 'border-2 border-neutral-300 dark:border-neutral-600'
                        }`}>
                          {isChecked && <Check className="w-4 h-4" />}
                        </div>
                        <span className={`text-sm ${
                          isChecked 
                            ? 'text-neutral-500 dark:text-neutral-400 line-through' 
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick tips */}
      <div className="mt-6 p-4 bg-info-50 dark:bg-info-900/20 rounded-xl">
        <h4 className="font-semibold text-info-800 dark:text-info-300 mb-2">💡 Pro Tips:</h4>
        <ul className="text-sm text-info-700 dark:text-info-400 space-y-1">
          <li>• Pack your bag by 36 weeks (earlier if multiples!)</li>
          <li>• Keep car seat easily accessible</li>
          <li>• Label your bag with your name & phone</li>
          <li>• Don't forget the camera!</li>
        </ul>
      </div>
    </div>
  );
};

export default HospitalBagChecklist;

