import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./supabaseConfig";

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll: () =>
                    cookieStore.getAll().map((c: { name: string; value: string }) => ({
                        name: c.name,
                        value: c.value,
                    })),
                setAll: (newCookies: Array<{ name: string; value: string; options?: any }>) => {
                    for (const c of newCookies) {
                        const { name, value, options } = c;
                        if (value) {
                            cookieStore.set(name, value, options ?? {});
                        } else {
                            // cookies.delete accepts either a name string or a single options object;
                            // pass a single object with the name merged into options when options exist.
                            if (options) {
                                // omit value and expires if present in options to satisfy type requirements
                                const { value: _v, expires: _e, ...deleteOptions } = options;
                                cookieStore.delete({ name, ...deleteOptions });
                            } else {
                                cookieStore.delete(name);
                            }
                        }
                    }
                },
            },
        }
    );
}
