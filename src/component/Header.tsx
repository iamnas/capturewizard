import { Github, Moon, Sun, Video } from "lucide-react";


export default function Header({ darkMode, toggleTheme }:{darkMode: boolean, toggleTheme: () => void}) {
    return (
        <header className={`sticky top-0 z-50 w-full ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Video className={`h-6 w-6 sm:h-8 sm:w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">CaptureWizard</h1>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Professional Screen Recording Studio</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} transition-colors duration-200`}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="flex gap-2">
                            <a
                                href="https://github.com/iamnas/capturewizard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} transition-colors duration-200`}
                            >
                                <Github size={20} />
                            </a>

                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
