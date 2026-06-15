import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/AuthContext';

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
  const { signOut } = useAuth();
  const doomRef = useRef<HTMLDivElement | null>(null);
  const dosboxRef = useRef<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let autoStartTimer: number | undefined;

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

        autoStartTimer = window.setTimeout(() => {
          const startButton = document.querySelector<HTMLDivElement>('#DOOM .dosbox-start');
          if (startButton) {
            startButton.click();
          }
        }, 500);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to initialize DOOM.';
        setErrorMessage(message);
        console.error('Unable to load Doom JS-DOS:', error);
      }
    }

    initDoom();

    return () => {
      cancelled = true;
      if (autoStartTimer) {
        window.clearTimeout(autoStartTimer);
      }
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
        #DOOM > .dosbox-container { width: 640px; height: 400px; }
        #DOOM > .dosbox-container > .dosbox-overlay {
          background: url('https://thedoggybrad.github.io/doom_on_js-dos/DOOM.png');
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
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Play DOOM via JS-DOS</h1>
        <p className="mb-6 text-sm text-slate-300">
          <a
            className="doom-link"
            href="https://github.com/thedoggybrad/doom_on_js-dos/blob/main/MANUAL.MD"
            target="_blank"
            rel="noreferrer"
          >
            User Manual
          </a>
        </p>
        <div className="mb-4 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-4 shadow-2xl shadow-black/30">
          <div id="DOOM" className="dosbox-default mx-auto" ref={doomRef} />
        </div>
        {errorMessage ? (
          <div className="mb-4 rounded-2xl bg-red-950/70 p-4 text-left text-sm text-red-200">
            <strong>Error loading DOOM:</strong>
            <p>{errorMessage}</p>
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-400">If the game does not start automatically, click the overlay inside the game box.</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button type="button" className="doom-button" onClick={() => dosboxRef.current?.requestFullScreen?.()}>
            FULLSCREEN
          </button>
          <button type="button" className="doom-button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
        <footer className="mt-8 text-xs text-slate-500">©TheDoggyBrad Software Lab. All Rights Reserved.</footer>
      </div>
    </main>
  );
}
