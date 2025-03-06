// import { NextResponse } from 'next/server';
// import { Digiflazz } from '@/lib/digiflazz';

// export async function POST(request: Request) {
//   try {
//     // Parse the request body
//     const body = await request.json();
//     const { url, data } = body;

//     // Create a new instance of Digiflazz class
//     const digiflazz = new Digiflazz();

//     // Call the API method
//     const result = await digiflazz.api(url, data);

//     // Return the result
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('API route error:', error);
//     return NextResponse.json(
//       { error: 'Failed to process request' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: Request) {
//   // For GET requests, you might want to read query parameters
//   const url = new URL(request.url);
//   const apiPath = url.searchParams.get('path') || '';

//   try {
//     const digiflazz = new Digiflazz();
//     // Note: Most APIs don't support sending data in GET requests
//     // You might want to adjust this according to your needs
//     const result = await digiflazz.api(apiPath, {});

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('API route error:', error);
//     return NextResponse.json(
//       { error: 'Failed to process request' },
//       { status: 500 }
//     );
//   }
// }
