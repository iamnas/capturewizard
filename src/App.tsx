import { useState } from 'react';

import Header from './component/Header';
import Footer from './component/Footer';
import Main from './component/Main';

function App() {


  const [darkMode, setDarkMode] = useState(true);


  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'}`}>
      {/* Header - Fixed at top */}
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />

      {/* Main Content - Flexible space */}
      <Main darkMode={darkMode} />

      {/* Footer - Fixed at bottom */}
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;