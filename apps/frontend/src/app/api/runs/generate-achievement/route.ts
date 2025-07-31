import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
        const cookieHeader = request.headers.get('cookie');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        } else if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/generate-achievement`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to generate achievement' }));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
