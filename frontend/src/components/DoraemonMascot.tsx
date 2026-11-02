import React, { useState } from 'react';
import { DoraemonReferenceMascot, MascotState as RefMascotState } from './DoraemonReferenceMascot';
import { ThreeDoraemon, ThreeMascotState } from './ThreeDoraemon';

export type MascotState =
  | 'idle'
  | 'welcome'
  | 'thinking'
  | 'searching'
  | 'presenting'
  | 'teaching'
  | 'celebrating'
  | 'encouraging'
  | 'explaining'
  // Backward compatibility aliases:
  | 'wave'
  | 'float'
  | 'celebrate'
  | 'study'
  | 'encourage'
  | 'uploading'
  | 'processing';

interface DoraemonMascotProps {
  state?: MascotState;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  onMascotClick?: () => void;
  interactiveLook?: boolean;
  mode?: 'reference' | '3d';
  studentName?: string;
}

export const DoraemonMascot: React.FC<DoraemonMascotProps> = ({
  state = 'idle',
  message,
  size = 'md',
  showSpeechBubble = true,
  onMascotClick,
  interactiveLook = true,
  mode = '3d',
  studentName,
}) => {
  // If in 3D mode (Default for 3D LMS):
  if (mode === '3d') {
    let canonical3D: ThreeMascotState = 'idle';
    if (state === 'welcome' || state === 'wave') canonical3D = 'welcome';
    else if (state === 'celebrating' || state === 'celebrate') canonical3D = 'celebrating';
    else if (state === 'encouraging' || state === 'encourage') canonical3D = 'encouraging';
    else if (state === 'teaching' || state === 'study') canonical3D = 'teaching';
    else if (state === 'float') canonical3D = 'idle';
    else if (
      state === 'idle' ||
      state === 'thinking' ||
      state === 'searching' ||
      state === 'presenting' ||
      state === 'uploading' ||
      state === 'processing'
    ) {
      canonical3D = state;
    }

    return (
      <ThreeDoraemon
        state={canonical3D}
        size={size}
        message={message}
        showSpeechBubble={showSpeechBubble}
        onMascotClick={onMascotClick}
        interactiveLook={interactiveLook}
      />
    );
  }

  // Primary: Reference Photograph Mascot
  return (
    <DoraemonReferenceMascot
      state={state as RefMascotState}
      size={size}
      message={message}
      showSpeechBubble={showSpeechBubble}
      onMascotClick={onMascotClick}
      interactiveLook={interactiveLook}
      studentName={studentName}
    />
  );
};
