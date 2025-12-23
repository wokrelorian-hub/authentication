import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { deleteUserFromOracle } from '@/lib/oracle';

// 1. Update Interface to match BOTH Stytch formats
interface StytchEvent {
  // Format A: Standard API Events
  type?: string; 
  data?: {
    user_id: string;
    [key: string]: unknown;
  };

  // Format B: Dashboard Events (The one you are receiving)
  action?: string;
  object_type?: string;
  id?: string; // This is the user_id in dashboard events
  source?: string;

  [key: string]: unknown;
}

const webhookSecret = process.env.STYTCH_WEBHOOK_SECRET || "";

// This tells Cloudflare to use the Edge Runtime
export const runtime = 'edge';

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = await headers();
  
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  let evt: StytchEvent;

  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as StytchEvent; 
  } catch (err) {
    console.error('Webhook verification failed', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  console.log("Stytch Webhook Payload:", JSON.stringify(evt, null, 2));

  let stytchUserId = "";
  let isDeleteEvent = false;

  // ---------------------------------------------------------
  // SCENARIO 1: Standard API Event (user.deleted)
  // ---------------------------------------------------------
  if (evt.type === 'user.deleted' || (evt.type && evt.type.includes('user.delete'))) {
    isDeleteEvent = true;
    stytchUserId = evt.data?.user_id || "";
  }

  // ---------------------------------------------------------
  // SCENARIO 2: Dashboard Event (Action: DELETE, Object: user)
  // ---------------------------------------------------------
  else if (evt.object_type === 'user' && evt.action === 'DELETE') {
    isDeleteEvent = true;
    stytchUserId = evt.id || ""; // In dashboard events, 'id' is the user_id
  }

  // ---------------------------------------------------------
  // EXECUTE DELETE
  // ---------------------------------------------------------
  if (isDeleteEvent && stytchUserId) {
    console.log(`Processing DELETE for User ID: ${stytchUserId}`);

    try {
      await deleteUserFromOracle(stytchUserId);
      return new Response('User deleted from Oracle', { status: 200 });
    } catch (dbError) {
      console.error('Database deletion failed', dbError);
      return new Response('Database error', { status: 500 });
    }
  }

  // Log if it wasn't a delete event we care about
  if (!isDeleteEvent) {
    console.log("Ignored event (not a user deletion).");
  }

  return new Response('Event received', { status: 200 });
}