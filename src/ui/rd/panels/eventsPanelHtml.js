export function getRdEventsPanelHtml() {
  return `
          <div id="rdDevEventsPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="events" aria-hidden="true">
            <div class="rd-tabs" role="tablist" aria-label="Event Debug sections" data-rd-tab-group="events" data-rd-tab-fallback="event-debug">
              <button id="eventDebugTab" class="rd-tab active" type="button" role="tab" data-rd-tab="event-debug" aria-selected="true" aria-controls="eventDebugPanel" tabindex="0">Debug</button>
            </div>
            <div id="eventDebugPanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="event-debug" aria-labelledby="eventDebugTab" aria-hidden="false">
              <p class="panel-note">Debug-only event controls. Use these to trigger authored event definitions and inspect event/journal runtime state.</p>
              <div class="row">
                <label>Trigger</label>
                <div class="inline-control">
                  <button id="eventDebugTriggerDialogBtn" class="row-action-btn" type="button" title="Sample Dialog" aria-label="Sample Dialog">SD</button>
                  <button id="eventDebugTriggerNoticeBtn" class="row-action-btn" type="button" title="Sample Notice" aria-label="Sample Notice">SN</button>
                  <button id="eventDebugTriggerGameplayStartedBtn" class="row-action-btn" type="button" title="Gameplay Started" aria-label="Gameplay Started">GS</button>
                  <button id="eventDebugTriggerHydrationLowBtn" class="row-action-btn" type="button" title="Hydration 50" aria-label="Hydration 50">H5</button>
                  <button id="eventDebugTriggerFatigueHighBtn" class="row-action-btn" type="button" title="Fatigue 50" aria-label="Fatigue 50">F5</button>
                </div>
              </div>
              <div class="row">
                <label>State</label>
                <div class="inline-control">
                  <button id="eventDebugResetBtn" class="row-action-btn" type="button" title="Reset Tutorials" aria-label="Reset Tutorials">RT</button>
                  <button id="eventDebugRefreshBtn" class="row-action-btn" type="button" title="Refresh" aria-label="Refresh">RF</button>
                </div>
              </div>
              <div class="event-debug-grid">
                <div class="event-debug-card">
                  <h3>Last Trigger</h3>
                  <pre id="eventDebugLastTriggerValue">none</pre>
                </div>
                <div class="event-debug-card">
                  <h3>Active</h3>
                  <pre id="eventDebugActiveValue">none</pre>
                </div>
                <div class="event-debug-card">
                  <h3>Queue</h3>
                  <pre id="eventDebugQueueValue">none</pre>
                </div>
                <div class="event-debug-card">
                  <h3>Definitions</h3>
                  <pre id="eventDebugDefinitionsValue">none</pre>
                </div>
                <div class="event-debug-card">
                  <h3>Seen</h3>
                  <pre id="eventDebugSeenValue">none</pre>
                </div>
                <div class="event-debug-card">
                  <h3>Flags</h3>
                  <pre id="eventDebugFlagsValue">none</pre>
                </div>
                <div class="event-debug-card">
                  <h3>Journal</h3>
                  <pre id="eventDebugJournalValue">none</pre>
                </div>
              </div>
            </div>
          </div>
  `;
}
