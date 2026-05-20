"use client";

/**
 * Web Audio API 音效合成模块
 * 使用浏览器实时合成音效，无需加载外部音频文件
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // 如果被浏览器挂起（autoplay policy），尝试恢复
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 播放噪声
 * @param attack - 起始时间（秒）
 * @param duration - 持续时间（秒）
 * @param frequency - 低通滤波器截止频率
 * @param startOffset - 延迟开始时间（秒）
 */
function playNoise(
  attack: number,
  duration: number,
  frequency: number,
  startOffset: number
) {
  const ctx = getAudioContext();
  const now = ctx.currentTime + startOffset;

  // 创建白噪声 buffer
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // 低通滤波器
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;

  // 音量包络
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + attack);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration);
}

/**
 * 播放正弦音
 * @param frequency - 频率（Hz）
 * @param duration - 持续时间（秒）
 * @param type - 波形类型
 * @param startOffset - 延迟开始时间（秒）
 * @param attack - 起始时间（秒）
 */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  startOffset: number,
  attack: number
) {
  const ctx = getAudioContext();
  const now = ctx.currentTime + startOffset;

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.4, now + attack);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * 音效预设
 * correct: 短噪声 + 1200Hz 正弦音
 * wrong: 低通噪声
 */
export const SOUND_PRESETS = {
  correct: () => {
    playNoise(0.02, 0.1, 4000, 0);
    playTone(1200, 0.08, "sine", 0.05, 0.02);
  },
  wrong: () => {
    playNoise(0.08, 0.22, 800, 0);
  },
};
