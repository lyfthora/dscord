import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Check if the policy already exists before creating it
    const { data: policies, error: fetchError } = await supabase.from('pg_policies').select('policyname').eq('policyname', 'Allow authenticated uploads').eq('tablename', 'objects').eq('schemaname', 'storage');

    if (fetchError) {
      console.error('Error fetching policies:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (policies && policies.length > 0) {
      return NextResponse.json({ message: 'Storage policy already exists' });
    }

    // Create the policy
    const { error: createPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'servers',
      policy_name: 'Allow authenticated uploads',
      action: 'INSERT',
      definition: 'bucket_id = \'servers\' AND auth.uid() IS NOT NULL',
    });

    if (createPolicyError) {
      console.error('Error setting up storage policy:', createPolicyError);
      return NextResponse.json({ error: createPolicyError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Storage policy setup successfully' });
  } catch (e) {
    console.error('Unexpected error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
