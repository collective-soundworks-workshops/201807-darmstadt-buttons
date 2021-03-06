import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const template = `
  <div id="upper" class="field"></div>
  <div id="middle" class="field"></div>
  <div id="lower" class="field"></div>
`;

export default class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', {});
    this.checkin = this.require('checkin', { dialog: false });
    this.params = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      directories: { path: `${assetsDomain}sounds`, recursive: false },
    });

    this.onPlay = this.onPlay.bind(this);
    this.onText = this.onText.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.View(template, {}, {}, {});
    this.show();

    this.receive('play', this.onPlay);
    this.receive('text', this.onText);

    this.surface = new soundworks.TouchSurface(this.view.$el, { normalizeCoordinates: false });
    this.surface.addListener('touchstart', this.onTouchStart);
    this.surface.addListener('touchend', this.onTouchEnd);
  }

  playSound(buffer, speed = 1) {
    let source = audioContext.createBufferSource();
    source.connect(audioContext.destination);
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.start(audioContext.currentTime);
  }

  onPlay(bufferIndex, speed = 1) {
    const buffers = this.audioBufferManager.data;

    if (bufferIndex < buffers.length) {
      const buffer = buffers[bufferIndex];
      this.playSound(buffer, speed);
    }
  }

  onText(id, text) {
    const element = document.getElementById(id);

    if (element)
      element.innerHTML = text;
  }

  onTouchStart(id, x, y, touch, touchEvent) {
    const target = document.elementFromPoint(x, y);
    let targetId = 'none';

    if (target)
      targetId = target.id;

    this.send('push', targetId, 1, x, y);
  }

  onTouchEnd(id, x, y, touch, touchEvent) {
    const target = document.elementFromPoint(x, y);
    let targetId = 'none';

    if (target)
      targetId = target.id;

    this.send('push', targetId, 0, x, y);
  }
}