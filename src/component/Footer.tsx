

export default function Footer({darkMode}:{darkMode: boolean}) {
    return (
        <footer className={`mt-auto w-full ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <div className="text-center sm:text-left">
                        <p className="font-medium">Made with ❤️ by <a href="https://x.com/0xnas_eth" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-200`}>0xnas</a> 🚀</p>
                    </div>
                </div>
                <div className="mt-4 flex justify-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse"></div>
                    <div className="h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <div className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                    <div className="h-1 w-1 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                </div>
            </div>
        </footer>
    )
}
