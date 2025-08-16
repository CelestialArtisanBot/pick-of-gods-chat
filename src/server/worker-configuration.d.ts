declare namespace Cloudflare {
  interface Env {
    // Existing Durable Object for chat
    Chat: DurableObjectNamespace<import("./index").Chat>;

    // New Durable Object for managing chat rooms
    ChatRooms: DurableObjectNamespace<import("./chatRooms").ChatRooms>;

    // New Durable Object for managing friends / social graph
    Friends: DurableObjectNamespace<import("./friends").Friends>;

    // Static file fetcher (public assets)
    ASSETS: Fetcher;
  }
}
