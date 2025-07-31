import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/insights`, {
            method: 'GET',
            headers,
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to get insights' }));
            console.log('Error response:', errorData);
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        console.log('Success response:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
