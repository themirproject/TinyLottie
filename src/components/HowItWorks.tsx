import { UploadCloud, Cpu, DownloadCloud } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <UploadCloud className="w-6 h-6 text-[#00DDB3]" />,
      title: "Drop your file",
      description: "Drag and drop your Lottie JSON or dotLottie animation. Processing begins instantly without queueing.",
    },
    {
      num: "02",
      icon: <Cpu className="w-6 h-6 text-[#00DDB3]" />,
      title: "Optimize in your browser",
      description: "Our offline engine strips metadata, rounds decimal precision, and converts raster assets locally in memory.",
    },
    {
      num: "03",
      icon: <DownloadCloud className="w-6 h-6 text-[#00DDB3]" />,
      title: "Download the lighter file",
      description: "Get your compressed .json or .lottie file in one click. Up to 98% smaller, zero visual loss.",
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-2">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            No software installation. No accounts required to start. 100% private in-browser optimization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-all hover:border-[#00DDB3]/40 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00DDB3]/10 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-2xl font-black text-gray-200 dark:text-gray-800">
                  {step.num}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
