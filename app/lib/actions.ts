'use server'
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


// create a schema of your form
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

// omit both id and date
const CreateInvoice = FormSchema.omit({id: true, date: true})

export async function createInvoice(formData: FormData) {

    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    const amountInCents = amount * 100; 
    const date = new Date().toISOString().split('T')[0];

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    /*
    Alright! Imagine you have a magical book with a lot of pages, and on each page, there's a story that people love to read. But sometimes, the story needs to be updated with new and exciting details.
    Now, instead of rewriting the whole book every time something changes, you have a special tool called revalidatePath in Next.js. This tool lets you refresh just the pages that need updates. So, if a story on page 5 has new information, revalidatePath makes sure only that page gets refreshed with the new details. This way, your magical book always has the latest stories without you needing to rewrite the whole thing!
    It’s like telling the book, “Hey, update this page when it needs it, but don’t bother with the other pages unless they change.”
    */
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}