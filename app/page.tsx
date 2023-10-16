import { foxitApiHelper } from '../foxit-api-helper.ts'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'

export default function Home() {

  /*
  * **
  * Handle the File Upload Form Submission
  * **
  */
  async function uploadPDF(data: FormData) {
      'use server'

      // get the file
      const file: File | null = data.get('pdfFileUpload') as unknown as File
      if (!file) {
        throw new Error('No file uploaded')
      }

      // Create a file buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Write the file buffer to the filesystem
      const path = resolve(`./public/pdf_uploads/${file.name}`)
      await writeFile(path, buffer)
      // Set a Cookie with the File URL
      cookies().set('uploadedFileURL', `${process.env.BASE_URL}/pdf_uploads/${file.name}`)
      cookies().set('uploadedFileName', file.name)

      // Log the file path & URL
      console.log(`Uploaded File Path: ${path}`)
      console.log(cookies().get('uploadedFileURL')?.value)

      return { success: true }
  }

  /*
  * **
  * Create & Prepare a Docuemnt from the Uploaded File
  * **
  */
  async function createDocumentFromPDF (data:formSubmission) {
    "use server"


    // Get the File URL & Name from the Cookies
    const pdfURL = data.get('pdfURL')
    const pdfFileName = cookies().get('uploadedFileName')?.value

    // Create a Document Using the Uplaoded PDF Template
    const result = await foxitApiHelper.createDocumentFromURL(pdfURL, pdfFileName)
    
    let signingSessionUrl = result.embeddedSigningSessions[0].embeddedSessionURL
    cookies().set('foxitEmbeddedSigningLink', signingSessionUrl)

    // Create a Webhook Channel
    await foxitApiHelper.createWebhookChannel()

    // Refresh Page
    redirect(process.env.BASE_URL, 'replace')
  }


  // Get the Embedded Signing Session Link from the Cookies
  let EmbeddedSigningLink = cookies().get('foxitEmbeddedSigningLink')?.value
  // Get the uploaded File URL from the Cookies
  let templatePdfUrl = cookies().get('uploadedFileURL')?.value

  /*
  * **
  * Render the Page
  * **
  */
  return (
    <main className="bg-slate-600 flex min-h-screen flex-col items-center justify-between p-20">
    <div className="w-4/5 bg-slate-700 p-10">
      <h1 className="text-4xl border-b-2 font-bold py-5 mb-4">Prepare and Send a document for eSigning</h1>
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
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-r-md mb-8">
              Create & Send a Document
           </button>
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
