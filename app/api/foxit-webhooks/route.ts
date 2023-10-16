import type { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {

  // Implemeting Basic Error Handling use Try/Catch
  try {
    // Get the webhook request object and log it to the Console
    const webhookData = await req.json();
    console.log(webhookData);

    // Check the request data and send a response accordingly
    if (webhookData) {
      return new Response("success", {
          status: 200,
          headers: {},
        })
    } else {
      return new Response("error: Invalid request or empty data", {
          status: 400,
          headers: {},
        })
    }
  } catch (error) {
    return new Response("Internal server error", {
        status: 500,
        headers: {},
      })
  }
}