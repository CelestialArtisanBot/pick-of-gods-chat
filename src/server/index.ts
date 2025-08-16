// src/index.ts
import { ChatDurableObject } from "./server/chat";
import { ChatRoomsDurableObject } from "./server/chatRooms";
import { FriendsDurableObject } from "./server/friends";

// Worker entrypoint
export default {
async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
const url = new URL(request.url);

// --- API ROUTES ---  
if (url.pathname.startsWith("/api/chat/")) {  
  const id = url.pathname.split("/").pop()!;  
  const stub = env.CHAT.get(env.CHAT.idFromName(id));  
  return stub.fetch(request);  
}  

if (url.pathname.startsWith("/api/rooms/")) {  
  const id = url.pathname.split("/").pop()!;  
  const stub = env.CHAT_ROOMS.get(env.CHAT_ROOMS.idFromName(id));  
  return stub.fetch(request);  
}  

if (url.pathname.startsWith("/api/friends/")) {  
  const id = url.pathname.split("/").pop()!;  
  const stub = env.FRIENDS.get(env.FRIENDS.idFromName(id));  
  return stub.fetch(request);  
}  

// --- STATIC UI (frontend build output) ---  
return env.ASSETS.fetch(request);

},
};

// Bindings
export interface Env {
CHAT: DurableObjectNamespace<ChatDurableObject>;
CHAT_ROOMS: DurableObjectNamespace<ChatRoomsDurableObject>;
FRIENDS: DurableObjectNamespace<FriendsDurableObject>;
ASSETS: Fetcher; // Wrangler automatically maps --site build dir here
}

