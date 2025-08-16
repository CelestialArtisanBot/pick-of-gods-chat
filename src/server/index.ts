import {
  type Connection,
  Server,
  type WSMessage,
  routePartykitRequest,
} from "partyserver";

import type { ChatMessage, Message } from "../shared";

export class Chat extends Server<Env> {
  static options = { hibernate: true };
  messages: ChatMessage[] = [];

  broadcastMessage(message: Message, exclude?: string[]) {
    this.broadcast(JSON.stringify(message), exclude);
  }

  onStart() {
    this.ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user TEXT,
        role TEXT,
        content TEXT,
        timestamp INTEGER
      )`,
    );
    this.messages = this.ctx.storage.sql.exec(`SELECT * FROM messages`).toArray() as ChatMessage[];
  }

  onConnect(connection: Connection) {
    connection.send(
      JSON.stringify({
        type: "all",
        messages: this.messages,
      } satisfies Message),
    );
  }

  saveMessage(message: ChatMessage) {
    const existingMessage = this.messages.find((m) => m.id === message.id);

    if (existingMessage) {
      this.messages = this.messages.map((m) => (m.id === message.id ? message : m));
    } else {
      this.messages.push(message);
    }

    this.ctx.storage.sql.exec(
      `INSERT INTO messages (id, user, role, content, timestamp)
       VALUES ('${message.id}', '${message.user}', '${message.role}', ${JSON.stringify(message.content)}, ${message.timestamp})
       ON CONFLICT (id) DO UPDATE SET content = ${JSON.stringify(message.content)}, timestamp = ${message.timestamp}`
    );
  }

  deleteMessage(id: string, user: string) {
    const msg = this.messages.find((m) => m.id === id);
    if (msg && msg.user === user) {
      this.messages = this.messages.filter((m) => m.id !== id);
      this.ctx.storage.sql.exec(`DELETE FROM messages WHERE id='${id}'`);
      this.broadcastMessage({ type: "delete", id });
    }
  }

  onMessage(connection: Connection, message: WSMessage) {
    const parsed = JSON.parse(message as string) as Message;

    if (parsed.type === "add" || parsed.type === "update") {
      this.saveMessage(parsed as ChatMessage);
      this.broadcast(message);
    }

    if (parsed.type === "delete") {
      this.deleteMessage(parsed.id, parsed.user);
    }
  }
}

export default {
  async fetch(request, env) {
    return (
      (await routePartykitRequest(request, { ...env })) ||
      env.ASSETS.fetch(request)
    );
  },
} satisfies ExportedHandler<Env>;        type: "all",
        messages: this.messages,
      } satisfies Message),
    );
  }

  saveMessage(message: ChatMessage) {
    // check if the message already exists
    const existingMessage = this.messages.find((m) => m.id === message.id);
    if (existingMessage) {
      this.messages = this.messages.map((m) => {
        if (m.id === message.id) {
          return message;
        }
        return m;
      });
    } else {
      this.messages.push(message);
    }

    this.ctx.storage.sql.exec(
      `INSERT INTO messages (id, user, role, content) VALUES ('${
        message.id
      }', '${message.user}', '${message.role}', ${JSON.stringify(
        message.content,
      )}) ON CONFLICT (id) DO UPDATE SET content = ${JSON.stringify(
        message.content,
      )}`,
    );
  }

  onMessage(connection: Connection, message: WSMessage) {
    // let's broadcast the raw message to everyone else
    this.broadcast(message);

    // let's update our local messages store
    const parsed = JSON.parse(message as string) as Message;
    if (parsed.type === "add" || parsed.type === "update") {
      this.saveMessage(parsed);
    }
  }
}

export default {
  async fetch(request, env) {
    return (
      (await routePartykitRequest(request, { ...env })) ||
      env.ASSETS.fetch(request)
    );
  },
} satisfies ExportedHandler<Env>;
