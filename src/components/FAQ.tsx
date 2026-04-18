import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { FileJson, Lightbulb, Info, Zap, Shield, Download } from 'lucide-react';

export function FAQ() {
  const faqs = [
    {
      icon: Shield,
      question: 'How does TinyLottie protect my files and privacy?',
      answer: (
        <div className="space-y-3">
          <p>
            TinyLottie processes everything locally in your browser - your files never leave your device:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Zero server uploads:</strong> All optimization happens client-side using JavaScript</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>No data collection:</strong> We don't track, store, or analyze your animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Works offline:</strong> Once loaded, you can optimize without internet connection</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Your animations stay on your machine, giving you complete control and peace of mind.
          </p>
        </div>
      ),
    },
    {
      icon: FileJson,
      question: 'How does TinyLottie optimize JSON and dotLottie files without losing quality?',
      answer: (
        <div className="space-y-3">
          <p>
            TinyLottie uses intelligent compression techniques specifically designed for Lottie animations:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Decimal precision rounding:</strong> Reduces floating-point numbers to 3 decimal places (invisible to the eye)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Metadata stripping:</strong> Removes unnecessary names, comments, and hidden layer data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>JSON minification:</strong> Eliminates whitespace and formatting while preserving structure</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            The optimization analyzes each component to ensure visual quality remains identical while reducing file size by up to 98%.
          </p>
        </div>
      ),
    },
    {
      icon: Lightbulb,
      question: 'Why should I use TinyLottie instead of other optimization tools?',
      answer: (
        <div className="space-y-3">
          <p>
            TinyLottie stands out as the premier choice for several reasons:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Privacy-First:</strong> Unlike cloud-based tools, your files never touch our servers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Instant Processing:</strong> No upload/download time - optimize in seconds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Universal Format Support:</strong> Seamlessly handles both JSON and dotLottie formats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>No Installation Required:</strong> Works directly in your browser, no downloads needed</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Performance-focused design means optimized animations load faster and use fewer resources in production.
          </p>
        </div>
      ),
    },
    {
      icon: Info,
      question: 'Are there any limitations to the TinyLottie service?',
      answer: (
        <div className="space-y-3">
          <p>
            While TinyLottie is powerful and free, there are some considerations:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Free tier limit:</strong> Files up to 5MB can be optimized for free</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Browser processing:</strong> Very large files (100MB+) may take longer on slower devices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Format requirements:</strong> Input files must be valid Lottie JSON or dotLottie format</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            For files larger than 5MB or enterprise needs, consider upgrading to our Pro plan for unlimited processing and priority support.
          </p>
        </div>
      ),
    },
    {
      icon: Zap,
      question: 'What file formats does TinyLottie support?',
      answer: (
        <div className="space-y-3">
          <p>
            TinyLottie supports the two primary Lottie animation formats:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Lottie JSON (.json):</strong> The standard JSON format exported from After Effects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>dotLottie (.lottie):</strong> The compressed archive format for bundled animations</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            You can also choose your preferred output format - convert between JSON and dotLottie seamlessly during optimization.
          </p>
        </div>
      ),
    },
    {
      icon: Download,
      question: 'How much file size reduction can I expect?',
      answer: (
        <div className="space-y-3">
          <p>
            File size reduction varies depending on your original animation's complexity:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Typical savings:</strong> 40-70% reduction for most animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>High metadata files:</strong> Up to 98% reduction for animations with excessive layer names/comments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00DDB3] mt-1">•</span>
              <span><strong>Already optimized files:</strong> 10-30% for files previously compressed elsewhere</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            The real-time preview shows exact savings before download, so you always know the impact.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="py-8 sm:py-10 lg:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">
            <span className="text-gray-900 dark:text-white">How does </span>
            <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
              TinyLottie
            </span>
            <span className="text-gray-900 dark:text-white"> work</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Everything you need to know about optimizing your Lottie animations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 sm:px-6 py-2 hover:border-[#00DDB3]/50 transition-colors [&:not([data-state])]:border [&[data-state]]:border"
                >
                  <AccordionTrigger className="hover:no-underline py-4 sm:py-5">
                    <div className="flex items-center gap-2 sm:gap-3 text-left">
                      <div className="flex-shrink-0 p-1.5 sm:p-2 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/20 rounded-lg">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00DDB3]" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pb-4 sm:pb-5 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>

        {/* CTA at the bottom of FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 sm:mt-8 text-center p-6 sm:p-8 bg-gradient-to-r from-[#00DDB3]/10 to-[#00C9A7]/10 dark:from-[#00DDB3]/5 dark:to-[#00C9A7]/5 rounded-2xl border border-[#00DDB3]/20"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
            Have a specific question or need help? We're here to assist you.
          </p>
          <a
            href="mailto:emir.kalayci@gmail.com"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#00DDB3] hover:bg-[#00C9A7] text-white text-sm sm:text-base rounded-lg font-medium transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}