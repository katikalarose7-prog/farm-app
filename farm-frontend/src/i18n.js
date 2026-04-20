// src/i18n.js
// Simple translation system — add more keys as needed


export const translations = {
  en: {
    // Navbar
    home:         'Home',
    livestock:    'Livestock',
    production:   'Production',
    workers:      'Workers',
    expenses:     'Expenses',
    dashboard: "Dashboard",

    // Dashboard
    totalAnimals: 'Total Animals',
    milkToday:    'Milk Today',
    eggsToday:    'Eggs Today',
    monthlyExp:   'Monthly Expenses',
    netProfit:    'Net Profit',
    netLoss:      'Net Loss',

    // Livestock
    addAnimal:    'Add Animal',
    animalName:   'Animal Name',
    type:         'Type',
    count:        'Count',
    breed:        'Breed',
    notes:        'Notes',
    edit:         'Edit',
    delete:       'Delete',

    // Production
    addEntry:     'Add Entry',
    milkLiters:   'Milk (Liters)',
    eggsCount:    'Eggs (Count)',
    date:         'Date',

    // Workers
    addWorker:    'Add Worker',
    salary:       'Monthly Salary',
    present:      'Present',
    absent:       'Absent',
    daysPresent:  'Days Present',
    earnedSoFar:  'Earned So Far',

    // Expenses
    addExpense:   'Add Expense',
    title:        'Title',
    amount:       'Amount',
    category:     'Category',
  },

  hi: {
     dashboard: "डैशबोर्ड",
    home:         'होम',
    livestock:    'पशुधन',
    production:   'उत्पादन',
    workers:      'मजदूर',
    expenses:     'खर्च',
    totalAnimals: 'कुल जानवर',
    milkToday:    'आज का दूध',
    eggsToday:    'आज के अंडे',
    monthlyExp:   'मासिक खर्च',
    netProfit:    'शुद्ध लाभ',
    netLoss:      'शुद्ध हानि',
    addAnimal:    'जानवर जोड़ें',
    animalName:   'जानवर का नाम',
    type:         'प्रकार',
    count:        'संख्या',
    breed:        'नस्ल',
    notes:        'टिप्पणी',
    edit:         'बदलें',
    delete:       'हटाएं',
    addEntry:     'एंट्री जोड़ें',
    milkLiters:   'दूध (लीटर)',
    eggsCount:    'अंडे (संख्या)',
    date:         'तारीख',
    addWorker:    'मजदूर जोड़ें',
    salary:       'मासिक वेतन',
    present:      'उपस्थित',
    absent:       'अनुपस्थित',
    daysPresent:  'उपस्थित दिन',
    earnedSoFar:  'अब तक की कमाई',
    addExpense:   'खर्च जोड़ें',
    title:        'शीर्षक',
    amount:       'राशि',
    category:     'श्रेणी',
  },

  te: {
    dashboard: 'డ్యాష్‌బోర్డ్',
    home:         'హోమ్',
    livestock:    'పశువులు',
    production:   'ఉత్పత్తి',
    workers:      'కార్మికులు',
    expenses:     'ఖర్చులు',
    totalAnimals: 'మొత్తం జంతువులు',
    milkToday:    'ఈరోజు పాలు',
    eggsToday:    'ఈరోజు గుడ్లు',
    monthlyExp:   'నెల ఖర్చు',
    netProfit:    'నికర లాభం',
    netLoss:      'నికర నష్టం',
    addAnimal:    'జంతువు జోడించు',
    animalName:   'జంతువు పేరు',
    type:         'రకం',
    count:        'సంఖ్య',
    breed:        'జాతి',
    notes:        'గమనికలు',
    edit:         'మార్చు',
    delete:       'తొలగించు',
    addEntry:     'ఎంట్రీ జోడించు',
    milkLiters:   'పాలు (లీటర్లు)',
    eggsCount:    'గుడ్లు (సంఖ్య)',
    date:         'తేదీ',
    addWorker:    'కార్మికుడిని జోడించు',
    salary:       'నెల జీతం',
    present:      'హాజరు',
    absent:       'గైర్హాజరు',
    daysPresent:  'హాజరైన రోజులు',
    earnedSoFar:  'ఇప్పటివరకు సంపాదన',
    addExpense:   'ఖర్చు జోడించు',
    title:        'శీర్షిక',
    amount:       'మొత్తం',
    category:     'వర్గం',
  }
};

// Custom hook — use this in any component
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [lang, setLang] = useState(
    localStorage.getItem('farmLang') || 'en'
  );

  useEffect(() => {
    localStorage.setItem('farmLang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || translations['en'][key] || key;

  return { t, lang, setLang };
}