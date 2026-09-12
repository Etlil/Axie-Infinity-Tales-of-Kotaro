import { useEffect, useRef, useState } from 'react';

export default function SettingsContent({ saveAvailable, fullscreen, showHelp, resetSave }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const cancel = useRef(null), reset = useRef(null);
  useEffect(() => { if (confirming) cancel.current?.focus(); }, [confirming]);
  const keepSave = () => {
    setConfirming(false);
    setError('');
    requestAnimationFrame(() => reset.current?.focus());
  };
  if (confirming) return <div className="reset-confirmation">
    <span className="settings-emblem" aria-hidden="true">!</span>
    <h3>Reset your adventure?</h3>
    <p>This deletes your story progress, companions, Adventure Rank, rewards, and rescued villagers saved in this browser.</p>
    <p>You’ll restart the intro as Kotaro. <strong>This can’t be undone.</strong></p>
    {error && <p className="reset-error" role="alert">{error}</p>}
    <div className="reset-actions">
      <button ref={cancel} className="small-button" onClick={keepSave}>Keep my save</button>
      <button className="small-button danger-button" onClick={() => {
        const result = resetSave();
        if (!result?.ok) setError(result?.error || 'The save could not be reset. Please try again.');
      }}>Delete save and restart</button>
    </div>
  </div>;
  return <div className="settings-content">
    <div className="settings-options">
      <button className="small-button" onClick={fullscreen}>Toggle fullscreen</button>
      <button className="small-button" onClick={showHelp}>How to play</button>
    </div>
    <div className="settings-save">
      <span className="eyebrow">YOUR ADVENTURE</span>
      <h3>A fresh beginning</h3>
      <p>{saveAvailable ? 'Your progress saves automatically in this browser.' : 'Browser storage is unavailable. You’re playing a session-only adventure.'} Reset to replay your arrival in Atia and meet Buba again.</p>
      <button ref={reset} className="small-button danger-button" onClick={() => setConfirming(true)}>Reset save data</button>
    </div>
  </div>;
}
