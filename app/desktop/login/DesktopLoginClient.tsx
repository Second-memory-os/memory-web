'use client';

import { useEffect, useState } from 'react';

type Props = {
  email: string;
  deepLink: string;
};

export default function DesktopLoginClient({ email, deepLink }: Props) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = deepLink;
      setOpened(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [deepLink]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Connected</h1>
        <p className="mt-2 text-white/70 text-sm">
          Signed in as <span className="text-white">{email}</span>. Returning to MemoryOS
          Desktop…
        </p>
        <a
          href={deepLink}
          onClick={() => setOpened(true)}
          className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
        >
          {opened ? 'Open MemoryOS again' : 'Open MemoryOS Desktop'}
        </a>
        <p className="mt-4 text-xs text-white/45">
          If nothing happens, click the button above or paste the deep link into the app.
        </p>
      </div>
    </div>
  );
}
