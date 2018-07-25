import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor() {
    super('player');

    this.params = this.require('shared-params');
    this.config = this.require('shared-config');
    this.checkin = this.require('checkin');
    this.fileSystem = this.require('file-system', { enableCache: false });
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.osc = this.require('osc');
  }

  start() {
    this.osc.receive('/buttons/play', (...msg) => {
      const clientIndex = msg[0];
      const soundIndex = msg[1];
      const client = this.clients[clientIndex];

      if (client)
        this.send(client, 'play', soundIndex);
    });

    this.osc.receive('/buttons/text', (...msg) => {
      const clientIndex = msg[0];
      const target = msg[1];
      const text = msg[2];
      const client = this.clients[clientIndex];

      if (client)
        this.send(client, 'text', target, text);
    });
  }

  enter(client) {
    super.enter(client);

    this.receive(client, 'push', this.getOnPushForClient(client));
    this.params.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);
    this.params.update('numPlayers', this.clients.length);
  }

  getOnPushForClient(client) {
    return (id, state, x, y) => {
      this.osc.send('/buttons/push', [client.index, id, state, x, y]);
    };
  }
}