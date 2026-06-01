export const config = {
  runtime: 'edge', // 🔥 Force Edge runtime to bypass Node.js local environment dependencies
};

export default async function handler(request: Request) {
  // 1. Security Check: Ensure the call is coming from Vercel's cron runner
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 2. Fire the post request to wake up and trigger your Render backend
    const backendUrl = "[https://inflow-b15c.onrender.com/api/cron/trigger](https://inflow-b15c.onrender.com/api/cron/trigger)"; 
    
    console.log(`Pinging backend: ${backendUrl}`);
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await res.json();
    
    return new Response(
      JSON.stringify({ success: true, backendStatus: res.status, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to trigger backend" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
