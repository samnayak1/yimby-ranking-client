

export default function Footer() {
  return (
    <footer className="mt-10 sm:mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
                    This website is an independent project and is not affiliated with
          YIMBY Alliance or YIMBY Action.
            </h3>

            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Regardless, if you believe in abundant housing, walkable communities, and
              evidence-based housing policy, consider supporting organizations
              advocating for these goals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
            <a
              href="https://yimbyaction.org/?form=donate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-yimby-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-yimby-700"
            >
              Donate to YIMBY Action
            </a>
          </div>
        </div>

       
      </div>
    </footer>
  );
}