import React from 'react';
import EyeLocalizationWorkbench from './EyeLocalizationWorkbench';

export default function DemoWorkbenchModal({
  isOpen,
  onClose,
  onOpenConsole,
  externalStormId,
  externalLiveData,
  onSelectStormId,
}) {
  if (!isOpen) return null;

  return (
    <EyeLocalizationWorkbench
      isOpen={isOpen}
      onClose={onClose}
      onOpenConsole={onOpenConsole}
      externalStormId={externalStormId}
      externalLiveData={externalLiveData}
      onSelectStormId={onSelectStormId}
    />
  );
}
