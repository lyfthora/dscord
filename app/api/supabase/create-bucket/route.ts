import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const bucketName = 'servers';

  try {
    // First, check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
      return NextResponse.json({ message: 'Bucket already exists' });
    }

    // If the bucket does not exist, try to create it
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Bucket created successfully' });
  } catch (e) {
    console.error('Unexpected error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
