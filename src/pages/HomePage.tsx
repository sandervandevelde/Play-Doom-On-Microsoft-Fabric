import { useEffect, useRef, useState } from 'react';

const JS_DOS_SCRIPT = 'https://thedoggybrad.github.io/doom_on_js-dos/js-dos-api.js';
const DOOM_ZIP = 'https://thedoggybrad.github.io/doom_on_js-dos/DOOM-@evilution.zip';
const DOOM_EXE = './DOOM/DOOM.EXE';

function waitForDosbox(timeout = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const Dosbox = (window as any).Dosbox;
      if (typeof Dosbox === 'function') {
        resolve(Dosbox);
        return;
      }

      if (Date.now() - start >= timeout) {
        reject(new Error('Dosbox did not become available within timeout.'));
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function HomePage() {
  const doomRef = useRef<HTMLDivElement | null>(null);
  const dosboxRef = useRef<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initDoom() {
      try {
        await loadScript(JS_DOS_SCRIPT);
        const Dosbox = await waitForDosbox();

        if (cancelled || !doomRef.current) {
          return;
        }

        dosboxRef.current = new Dosbox({
          id: 'DOOM',
          onload(dosbox: any) {
            dosbox.run(DOOM_ZIP, DOOM_EXE);
          },
          onrun(_dosbox: any, app: string) {
            console.log(`App '${app}' is runned`);
          },
        });

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to initialize DOOM.';
        setErrorMessage(message);
        console.error('Unable to load Doom JS-DOS:', error);
      }
    }

    initDoom();

    return () => {
      cancelled = true;
      if (dosboxRef.current?.destroy) {
        try {
          dosboxRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <style>{`
        body { background-color: #121212; color: white; }
        #DOOM,
        #DOOM > .dosbox-container,
        #DOOM > .dosbox-container > .dosbox-canvas,
        #DOOM > .dosbox-container > canvas,
        #DOOM > .dosbox-container > .dosbox-overlay {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
        #DOOM > .dosbox-container > .dosbox-overlay {
          background: url('https://thedoggybrad.github.io/doom_on_js-dos/DOOM.png');
          background-size: cover;
          background-position: center;
        }
        .doom-link {
          color: white;
          text-decoration: underline;
        }
        .doom-button {
          border-radius: 0.75rem;
          background-color: rgba(90, 90, 90, 0.85);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
        }
        .doom-button:hover {
          background-color: rgba(255, 255, 255, 0.08);
        }
      `}</style>
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col items-center px-2 py-4 text-center sm:px-4 sm:py-6">

        <div className="mb-3 h-[calc(100vh-220px)] min-h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black p-0 shadow-2xl shadow-black/30">
          <div id="DOOM" className="dosbox-default h-full w-full" ref={doomRef} />
        </div>
        {errorMessage ? (
          <div className="mb-4 rounded-2xl bg-red-950/70 p-4 text-left text-sm text-red-200">
            <strong>Error loading DOOM:</strong>
            <p>{errorMessage}</p>
          </div>
        ) : (
          <p className="mb-3 text-sm text-slate-400"></p>
        )}

        <footer className="mt-5 text-xs text-slate-500">©TheDoggyBrad Software Lab. All Rights Reserved.</footer>
      </div>
    </main>
  );
}
