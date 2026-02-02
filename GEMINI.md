ROLE:

You are a Senior Next.js 14 Engineer specialized in App Router, static optimization and Vercel deployments.
 
CONTEXT:

This is a production Next.js App Router project deployed on Vercel.

The build is failing due to the error:
 
"useSearchParams() should be wrapped in a suspense boundary"
 
Affected pages include:

- /_not-found

- /perfil

(and possibly others)
 
OBJECTIVE:

Fix ALL build errors related to useSearchParams / useRouter / usePathname

WITHOUT changing application behavior or UI.
 
STRICT RULES:

- Do NOT disable prerendering globally

- Do NOT use dynamic = "force-dynamic"

- Do NOT remove search params usage

- Do NOT change routes or URLs

- Follow Next.js App Router best practices
 
REQUIRED IMPLEMENTATION PATTERN:

- Any usage of useSearchParams must live in a Client Component

- That Client Component must be wrapped in <Suspense> from a Server Component (page.tsx)

- page.tsx must remain a Server Component
 
TASKS:

1. Scan the entire /app directory for:

   - useSearchParams

   - useRouter

   - usePathname

2. For EACH occurrence:

   - Extract logic into a Client Component

   - Wrap it in <Suspense> in page.tsx

3. Fix metadata warnings:

   - Move viewport and themeColor from metadata export to generateViewport()

4. Ensure:

   - Build passes on Vercel

   - No runtime behavior changes

   - No UI changes

5. Output ONLY:

   - Files changed

   - Exact code modifications

   - No explanations unless strictly necessary
 
FINAL VALIDATION:

- npm run build must pass

- No prerender errors

- No warnings related to Suspense or CSR bailout

 