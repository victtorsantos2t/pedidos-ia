import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    const { data: catData, error: catError } = await supabase.from('categories').select('*');
    const { data: prodData, error: prodError } = await supabase.from('products').select('*');

    const report = {
        categories: catData,
        products: prodData,
        errors: { catError, prodError }
    };

    fs.writeFileSync('debug-db-report.json', JSON.stringify(report, null, 2));
    console.log("Report saved to debug-db-report.json");
}

checkProducts();
