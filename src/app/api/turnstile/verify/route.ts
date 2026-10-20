import { NextResponse } from "next/server";

interface TurnstileVerifyResponse {
    success: boolean;
    "error-codes"?: string[];
    hostname?: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { token?: string };
        const token = body.token;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Missing Turnstile token." },
                { status: 400 }
            );
        }

        const secretKey = process.env.TURNSTILE_SECRET_KEY;

        // If secret key is not configured in .env yet, allow non-empty client tokens in dev
        if (!secretKey) {
            return NextResponse.json({
                success: true,
                mode: "client-only-dev",
            });
        }

        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", token);

        const cfRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            }
        );

        const data = (await cfRes.json()) as TurnstileVerifyResponse;

        if (!data.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cloudflare Turnstile verification rejected the token.",
                    errors: data["error-codes"] || [],
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            hostname: data.hostname,
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Turnstile verification server error." },
            { status: 500 }
        );
    }
}