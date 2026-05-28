import { getRdAudioSpectrogramPanelHtml } from "./audio/spectrogramPanelHtml.js";
import { getRdAudioSynthesisPanelHtml } from "./audio/synthesisPanelHtml.js";
import { getRdAudioSoundscapePanelHtml } from "./audio/soundscapePanelHtml.js";

export function getRdAudioPanelHtml() {
  let html = `
          <div id="rdDevAudioPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="audio" aria-hidden="true">
            <div class="row">
              <label>Audio View</label>
              <div class="inline-control">
                <button class="row-action-btn workspace-btn" type="button" data-workspace="audio" data-workspace-toggle="true" aria-pressed="false">Show Audio View</button>
              </div>
            </div>
            <div class="rd-tabs" role="tablist" aria-label="Audio sections" data-rd-tab-group="audio" data-rd-tab-fallback="spectrogram">
              <button id="rdAudioSpectrogramTab" class="rd-tab audio-mode-btn active" type="button" role="tab" data-rd-tab="spectrogram" data-audio-mode="spectrogram" aria-selected="true" aria-controls="rdAudioSpectrogramPanel" tabindex="0">Spectrogram</button>
              <button id="rdAudioSynthesisTab" class="rd-tab audio-mode-btn" type="button" role="tab" data-rd-tab="synthesis" data-audio-mode="synthesis" aria-selected="false" aria-controls="rdAudioSynthesisPanel" tabindex="-1">Synthesis</button>
              <button id="rdAudioSoundscapeTab" class="rd-tab audio-mode-btn" type="button" role="tab" data-rd-tab="soundscape" data-audio-mode="soundscape" aria-selected="false" aria-controls="rdAudioSoundscapePanel" tabindex="-1">Soundscape</button>
          </div>
`;
  html += getRdAudioSpectrogramPanelHtml();
  html += getRdAudioSynthesisPanelHtml();
  html += getRdAudioSoundscapePanelHtml();
  html += `          <p>Audio Status: <span id="audioStatusValue">Stopped</span></p>
          </div>`;
  return html;
}
