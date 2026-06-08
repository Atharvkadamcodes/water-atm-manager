import React, { createContext, useContext, useMemo, useState } from 'react';

const LANGUAGE_KEY = 'water_atm_language';

export const LANGUAGES = {
  en: { label: 'English', speech: 'en-IN' },
  mr: { label: 'मराठी', speech: 'mr-IN' },
};

const translations = {
  en: {},
  mr: {
    Dashboard: 'डॅशबोर्ड',
    Customers: 'ग्राहक',
    Settings: 'सेटिंग्ज',
    'Business Overview': 'व्यवसाय आढावा',
    'Real-time status of customer accounts and activity': 'ग्राहक खात्यांची आणि व्यवहारांची सध्याची माहिती',
    'Total Customers': 'एकूण ग्राहक',
    'Active Customers': 'सक्रिय ग्राहक',
    'Inactive Customers': 'निष्क्रिय ग्राहक',
    'Lost Currently': 'सध्या हरवलेले',
    'Lost Previously': 'पूर्वी हरवलेले',
    'Recharge Entries': 'रिचार्ज नोंदी',
    'Recharge Revenue': 'रिचार्ज उत्पन्न',
    'Quick Actions': 'जलद कृती',
    'Add Customer': 'ग्राहक जोडा',
    'Search Customer': 'ग्राहक शोधा',
    'Recent Activities': 'अलीकडील नोंदी',
    'View All': 'सर्व पहा',
    'No recent activities recorded.': 'अलीकडील नोंदी नाहीत.',
    'Customers Directory': 'ग्राहक यादी',
    'total customers': 'एकूण ग्राहक',
    Add: 'जोडा',
    All: 'सर्व',
    Active: 'सक्रिय',
    Inactive: 'निष्क्रिय',
    'No Customers Found': 'ग्राहक सापडले नाहीत',
    'Add First Customer': 'पहिला ग्राहक जोडा',
    Prev: 'मागे',
    Next: 'पुढे',
    Page: 'पान',
    of: 'पैकी',
    'Add New Customer': 'नवीन ग्राहक जोडा',
    'Create a customer account for recharge tracking': 'रिचार्ज नोंदीसाठी ग्राहक खाते तयार करा',
    'Customer Full Name': 'ग्राहकाचे पूर्ण नाव',
    'Mobile Number': 'मोबाइल नंबर',
    'Initial Recharge Amount (Optional)': 'सुरुवातीचा रिचार्ज (ऐच्छिक)',
    'Recharge Note (Optional)': 'रिचार्ज टीप (ऐच्छिक)',
    Cancel: 'रद्द',
    'Save Customer': 'ग्राहक सेव्ह करा',
    Saving: 'सेव्ह होत आहे',
    'Customer Details': 'ग्राहक माहिती',
    'Profile & transaction logs': 'प्रोफाइल आणि व्यवहार नोंदी',
    'Customer Name': 'ग्राहकाचे नाव',
    'Customer ID': 'ग्राहक आयडी',
    Status: 'स्थिती',
    'Registration Date': 'नोंदणी तारीख',
    'Total Recharge Revenue': 'एकूण रिचार्ज उत्पन्न',
    'Lost Card Record': 'हरवलेले कार्ड नोंद',
    'No open lost card record.': 'सध्या हरवलेल्या कार्डाची नोंद नाही.',
    Recharge: 'रिचार्ज',
    'Edit Customer': 'ग्राहक बदला',
    'Change Status': 'स्थिती बदला',
    'Mark Lost Card': 'कार्ड हरवले नोंदवा',
    'Recharge History': 'रिचार्ज इतिहास',
    'Lost Card History': 'हरवलेले कार्ड इतिहास',
    'Settings': 'सेटिंग्ज',
    'Language': 'भाषा',
    'Logged In As': 'लॉगिन केलेले',
    'Database': 'डेटाबेस',
    'Data Management': 'डेटा व्यवस्थापन',
    'Export All Data (CSV)': 'सर्व डेटा एक्सपोर्ट करा',
    'Sign Out': 'लॉग आउट',
  },
};

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (value) => value,
  speechLanguage: LANGUAGES.en.speech,
});

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(LANGUAGE_KEY) || 'en');

  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (text) => translations[language]?.[text] || text,
    speechLanguage: LANGUAGES[language]?.speech || LANGUAGES.en.speech,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
