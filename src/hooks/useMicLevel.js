// src/hooks/useMicLevel.js
import { useEffect, useRef, useState } from 'react';

export function useMicLevel({ enabled }) {
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setLevel(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let audioContext;
    let analyser;
    let dataArray;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // good enough
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        const tick = () => {
          analyser.getByteTimeDomainData(dataArray);

          // RMS
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128;
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);

          // normalize a bit; tune this curve if needed
          const normalized = Math.min(1, rms * 8);
          setLevel(normalized);

          rafRef.current = requestAnimationFrame(tick);
        };

        tick();
      } catch (err) {
        console.error('useMicLevel getUserMedia error', err);
      }
    }

    start();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioContext) audioContext.close();
    };
  }, [enabled]);

  return level;
}
