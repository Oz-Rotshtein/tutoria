"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLanguage(lang: "en" | "he") {
    const cookieStore = await cookies();
  // Set the cookie for 1 year
  cookieStore.set("NEXT_LOCALE", lang, { maxAge: 31536000, path: "/" });
  
  // Instantly refresh the entire application to apply the new language and layout
  revalidatePath("/", "layout");
}