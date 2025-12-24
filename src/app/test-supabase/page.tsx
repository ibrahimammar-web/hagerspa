import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function TestSupabasePage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order');

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold mb-4">Supabase Test</h1>

      <h2 className="font-semibold">Raw result</h2>
      <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>

      <h2 className="font-semibold mt-4">Rendered list</h2>
      {error && (
        <p className="text-red-600">
          Error: {error.message}
        </p>
      )}

      {!error && (!data || data.length === 0) && (
        <p className="text-gray-600">
          لا توجد خدمات راجعة من Supabase (data فاضية).
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="list-disc pr-6">
          {data.map((service: any) => (
            <li key={service.id}>
              {service.name_ar} - {service.price_sar} ر.س
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
