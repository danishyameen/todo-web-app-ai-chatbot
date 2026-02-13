import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200/60 dark:border-gray-700/60 mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <motion.div
            className="flex justify-center md:justify-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-shrink-0 flex items-center">
              <motion.img
                src="/img/logo.png"
                alt="Taskly Logo"
                className="h-16 w-auto object-contain"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-logo')) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'fallback-logo flex items-center';
                    fallbackDiv.innerHTML = `
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <span class="text-white font-bold text-lg">T</span>
                      </div>
                      <span class="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Taskly</span>
                    `;
                    parent.appendChild(fallbackDiv);
                  }
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className="mt-8 md:mt-0 md:order-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-center md:text-left text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Taskly - AI-Powered Task Management. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Developed with ❤️ by Danish Yameen
            </p>

            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-6 mt-4">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social, index) => (
                <motion.a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <span className="sr-only">{social}</span>
                  <div className="h-6 w-6 flex items-center justify-center">
                    <span className="text-sm font-medium">{social.charAt(0)}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </div>
    </motion.footer>
  );
}