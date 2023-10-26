import { foxitApiHelper } from '../foxit-api-helper'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'

export default function Home() {

  /*
  * *
  * Handle the file upload form submission
  * *
  */
  async function uploadPDF(data: FormData) {
      'use server'

      // Get the file
      const file: File | null = data.get('pdfFileUpload') as unknown as File
      if (!file) {
        throw new Error('No file uploaded')
      }

      // Create a file buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Write the file buffer to the file system
      const path = resolve(`./public/pdf_uploads/${file.name}`)
      await writeFile(path, buffer)
      // Set cookies with the file URL and name
      let uploadedFileURL: string = `${process.env.BASE_URL}/pdf_uploads/${file.name}`
      let uploadedFileName: string = file.name
      cookies().set('uploadedFileURL', uploadedFileURL)
      cookies().set('uploadedFileName', uploadedFileName)

      // Log the file path and URL
      console.log(`Uploaded File Path: ${path}`)
      console.log(cookies().get('uploadedFileURL')?.value)

      return { success: true }
  }

  /*
  * *
  * Create and prepare a document from the uploaded file
  * *
  */
  async function createDocumentFromPDF (data: FormData) {
    "use server"

    // Get the file URL & name from the cookies
    let pdfURL: string = data.get('pdfURL')!;
    console.log(typeof pdfURL)
    let pdfFileName: string = cookies().get('uploadedFileName')?.value!;

    // Create a document using the uplaoded PDF template
    let result = await foxitApiHelper.createDocumentFromURL(pdfURL, pdfFileName)

    
    if (result){
      let signingSessionUrl: string = result.embeddedSigningSessions[0].embeddedSessionURL
      cookies().set('foxitEmbeddedSigningLink', signingSessionUrl)

      // Create a webhook channel
      await foxitApiHelper.createWebhookChannel()

      // Refresh the page
      const base_url: string = process.env.BASE_URL!;
      redirect(base_url)!;
    }
  }

  // Get the embedded signing session link from the cookies
  let EmbeddedSigningLink: string | null | undefined = null;
  EmbeddedSigningLink = EmbeddedSigningLink ?? cookies().get('foxitEmbeddedSigningLink')?.value;
  // Get the uploaded file URL from the cookies
  let templatePdfUrl : string | null | undefined = null;
  templatePdfUrl = templatePdfUrl ?? cookies().get('uploadedFileURL')?.value;

  /*
  * **
  * Render the page
  * **
  */
  return (
    <main className="bg-slate-600 flex min-h-screen flex-col items-center justify-between p-20">
    <div className="w-4/5 bg-slate-700 p-10">
      <h1 className="text-4xl border-b-2 font-bold py-5 mb-4">Prepare and Send a Document for eSigning</h1>
      <div className="flex p-4">
        <div className="w-1/4 p-4 content-center flex-col">
          <div className="flex-col">
            <form action={uploadPDF} className="flex flex-col gap-2">
            <input
              type="file"
              name="pdfFileUpload"
              className="w-full p-2 border rounded-l-md bg-slate-300 text-teal-900"
              placeholder="Upload PDF..."
              required
            />
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-r-md mb-8">
              Upload
           </button>
           </form>
          </div>
        </div>

        <div className="w-1/4 p-4"></div>

        <div className="w-2/4 p-4">
          <div className="flex-col">
            <form action={createDocumentFromPDF} className=" flex flex-col gap-2">
            <input
              type="text"
              name="pdfURL"
              className="w-full p-2 border rounded-l-md bg-slate-300 text-teal-900"
              placeholder="PDF URL..."
              defaultValue={templatePdfUrl}
              required
            />
            <input 
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-r-md mb-8"
              defaultValue="Create & Send a Document"
           />
           </form>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center p-10 m-t-5">
        <iframe 
          className="w-full"
          height="500"
          src={EmbeddedSigningLink}>
        </iframe>
      </div>
    </div>
    </main>
  );
}
